import { useState, useEffect } from "react";
import appSupabase from "./appSupabaseClient";

const NAVY = "#1B4F8A";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";

const card = { background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", padding: 24, marginBottom: 16 };
const label = { display: "block", fontSize: 13, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, marginTop: 16 };
const input = { width: "100%", padding: "10px 12px", border: "1px solid " + BORDER, borderRadius: 8, fontSize: 15, fontFamily: "inherit", boxSizing: "border-box" };
const btnPrimary = { background: NAVY, color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 15, fontWeight: 600, cursor: "pointer" };
const btnGhost = { background: "transparent", color: MUTED, border: "1px solid " + BORDER, borderRadius: 8, padding: "9px 16px", fontSize: 14, cursor: "pointer" };

function comingSunday() {
  const d = new Date();
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}
function fmtWeek(s) {
  if (!s) return "";
  return new Date(s + "T12:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export default function CongregationalPrayersEditor() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [weekOf, setWeekOf] = useState(comingSunday());
  const [intro, setIntro] = useState("");
  const [items, setItems] = useState([""]);
  const [closing, setClosing] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await appSupabase.from("congregational_prayers").select("*").order("week_of", { ascending: false });
    setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function resetForm() {
    setEditingId(null); setWeekOf(comingSunday()); setIntro(""); setItems([""]); setClosing(""); setActive(true);
  }
  function startNew() { resetForm(); setShowForm(true); }
  function startEdit(r) {
    setEditingId(r.id);
    setWeekOf(r.week_of || comingSunday());
    setIntro(r.intro || "");
    setItems(r.body ? r.body.split("\n") : [""]);
    setClosing(r.closing || "");
    setActive(!!r.active);
    setShowForm(true);
  }
  function cancel() { resetForm(); setShowForm(false); }

  function setItem(i, v) { setItems(items.map((it, idx) => (idx === i ? v : it))); }
  function addItem() { setItems(items.concat("")); }
  function removeItem(i) { const next = items.filter((_, idx) => idx !== i); setItems(next.length ? next : [""]); }

  async function save() {
    const body = items.map(s => s.trim()).filter(s => s.length > 0).join("\n");
    if (!weekOf) { alert("Please choose the Sunday this prayer list is for."); return; }
    if (!body) { alert("Please add at least one prayer item."); return; }
    setSaving(true);
    const payload = { week_of: weekOf, intro: intro.trim(), body: body, closing: closing.trim(), active: active, updated_at: new Date().toISOString() };
    let savedId = editingId;
    if (editingId) {
      await appSupabase.from("congregational_prayers").update(payload).eq("id", editingId);
    } else {
      const { data } = await appSupabase.from("congregational_prayers").insert(payload).select("id").single();
      savedId = data ? data.id : null;
    }
    if (active && savedId != null) {
      await appSupabase.from("congregational_prayers").update({ active: false }).neq("id", savedId);
    }
    setSaving(false); cancel(); load();
  }

  async function remove(r) {
    if (!window.confirm("Delete the prayer list for " + fmtWeek(r.week_of) + "? This cannot be undone.")) return;
    await appSupabase.from("congregational_prayers").delete().eq("id", r.id);
    load();
  }

  return (
    <div>
      {!showForm && <button style={btnPrimary} onClick={startNew}>+ New Prayer List</button>}

      {showForm && (
        <div style={card}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: NAVY }}>
            {editingId ? "Edit Prayer List" : "New Prayer List"}
          </div>

          <label style={label}>Week of (Sunday)</label>
          <input style={input} type="date" value={weekOf} onChange={e => setWeekOf(e.target.value)} />

          <label style={label}>Opening — call to prayer</label>
          <textarea style={{ ...input, minHeight: 70 }} value={intro} onChange={e => setIntro(e.target.value)}
            placeholder="Brothers and Sisters, this week we come together as one body in prayer, lifting up these needs before our Father." />

          <label style={label}>Prayer items</label>
          {items.map((it, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input style={{ ...input, flex: 1 }} value={it} onChange={e => setItem(i, e.target.value)} placeholder="Pray for..." />
              <button style={btnGhost} onClick={() => removeItem(i)}>Remove</button>
            </div>
          ))}
          <button style={{ ...btnGhost, marginTop: 4 }} onClick={addItem}>+ Add prayer</button>

          <label style={label}>Closing prayer</label>
          <textarea style={{ ...input, minHeight: 90 }} value={closing} onChange={e => setClosing(e.target.value)}
            placeholder="Father, we thank You for hearing our humble cry, and we consider these prayers answered in Jesus' mighty Name. Amen." />

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18, fontSize: 14, color: "#334155", cursor: "pointer" }}>
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
            Show this list in the app now (becomes the current week; prior weeks are retired)
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button style={btnPrimary} onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            <button style={btnGhost} onClick={cancel}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        {loading ? (
          <p style={{ color: MUTED }}>Loading...</p>
        ) : rows.length === 0 ? (
          <p style={{ color: MUTED }}>No prayer lists yet.</p>
        ) : rows.map(r => (
          <div key={r.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: NAVY }}>Week of {fmtWeek(r.week_of)}</div>
                {r.active && <span style={{ display: "inline-block", marginTop: 6, background: "#dcfce7", color: "#166534", fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 999 }}>Showing in app</span>}
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button style={btnGhost} onClick={() => startEdit(r)}>Edit</button>
                <button style={{ ...btnGhost, color: "#dc2626", borderColor: "#fecaca" }} onClick={() => remove(r)}>Delete</button>
              </div>
            </div>
            {r.intro && <p style={{ color: "#334155", marginTop: 10, fontStyle: "italic" }}>{r.intro}</p>}
            {r.body && (
              <ul style={{ margin: "10px 0 0", paddingLeft: 20, color: "#334155" }}>
                {r.body.split("\n").filter(l => l.trim()).map((line, i) => <li key={i} style={{ marginBottom: 4 }}>{line}</li>)}
              </ul>
            )}
            {r.closing && <p style={{ color: "#475569", marginTop: 10, fontSize: 14 }}>{r.closing}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

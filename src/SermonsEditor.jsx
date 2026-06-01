import { useState, useEffect } from "react";
import appSupabase from "./appSupabaseClient";

const NAVY = "#1B4F8A";
const MUTED = "#64748b";

const blankForm = () => ({
  title: "",
  speaker: "",
  series: "",
  sermon_date: new Date().toISOString().slice(0, 10),
  video_url: "",
  duration_minutes: "",
  description: "",
  published: true,
});

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid #d8e0ea",
  fontSize: 14,
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: MUTED,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  marginBottom: 5,
};

function fmtDate(d) {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function SermonsEditor() {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankForm());
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    const { data, error } = await appSupabase
      .from("sermons")
      .select("*")
      .order("sermon_date", { ascending: false });
    if (error) setErr(error.message);
    else setSermons(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function openNew() {
    setForm(blankForm());
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(s) {
    setForm({
      title: s.title || "",
      speaker: s.speaker || "",
      series: s.series || "",
      sermon_date: s.sermon_date || new Date().toISOString().slice(0, 10),
      video_url: s.video_url || "",
      duration_minutes: s.duration_minutes == null ? "" : String(s.duration_minutes),
      description: s.description || "",
      published: s.published !== false,
    });
    setEditingId(s.id);
    setShowForm(true);
  }

  async function save() {
    if (!form.title.trim() || !form.speaker.trim() || !form.sermon_date) {
      setErr("Title, speaker, and date are required.");
      return;
    }
    setSaving(true);
    setErr("");
    const payload = {
      title: form.title.trim(),
      speaker: form.speaker.trim(),
      series: form.series.trim() || null,
      sermon_date: form.sermon_date,
      video_url: form.video_url.trim() || null,
      duration_minutes: form.duration_minutes === "" ? null : Number(form.duration_minutes),
      description: form.description.trim() || null,
      published: !!form.published,
    };
    let resp;
    if (editingId) {
      resp = await appSupabase.from("sermons").update(payload).eq("id", editingId);
    } else {
      resp = await appSupabase.from("sermons").insert(payload);
    }
    setSaving(false);
    if (resp.error) { setErr(resp.error.message); return; }
    setShowForm(false);
    setEditingId(null);
    load();
  }

  async function remove(s) {
    const ok = window.confirm('Delete "' + s.title + '" permanently? This removes it from the app and cannot be undone.');
    if (!ok) return;
    const { error } = await appSupabase.from("sermons").delete().eq("id", s.id);
    if (error) { setErr(error.message); return; }
    load();
  }

  return (
    <div>
      {err ? (
        <div style={{ background: "#fdecec", color: "#b42318", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{err}</div>
      ) : null}

      {!showForm ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: MUTED }}>{sermons.length} sermon{sermons.length === 1 ? "" : "s"} in the app</div>
          <button onClick={openNew} style={{ background: NAVY, color: "#fff", border: "none", padding: "10px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>+ New Sermon</button>
        </div>
      ) : null}

      {showForm ? (
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: NAVY, marginBottom: 18 }}>{editingId ? "Edit Sermon" : "New Sermon"}</div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Title</label>
            <input style={inputStyle} value={form.title} onChange={e => set("title", e.target.value)} placeholder="LWCIC Sermon May 24th" />
          </div>

          <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Speaker</label>
              <input style={inputStyle} value={form.speaker} onChange={e => set("speaker", e.target.value)} placeholder="Pastor Lisa Baldwin" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Series (optional)</label>
              <input style={inputStyle} value={form.series} onChange={e => set("series", e.target.value)} placeholder="Walking in Faith" />
            </div>
          </div>

          <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date</label>
              <input type="date" style={inputStyle} value={form.sermon_date} onChange={e => set("sermon_date", e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Length (minutes, optional)</label>
              <input type="number" style={inputStyle} value={form.duration_minutes} onChange={e => set("duration_minutes", e.target.value)} placeholder="45" />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Video Link (Facebook / YouTube)</label>
            <input style={inputStyle} value={form.video_url} onChange={e => set("video_url", e.target.value)} placeholder="https://www.facebook.com/share/v/..." />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Description (optional)</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 14, color: "#1e293b", cursor: "pointer" }}>
            <input type="checkbox" checked={form.published} onChange={e => set("published", e.target.checked)} />
            Visible in the app now
          </label>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={save} disabled={saving} style={{ background: NAVY, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}>{saving ? "Saving..." : "Save"}</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setErr(""); }} style={{ background: "transparent", color: MUTED, border: "1px solid #d8e0ea", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div style={{ color: MUTED, fontSize: 14, padding: 20 }}>Loading sermons...</div>
      ) : sermons.length === 0 && !showForm ? (
        <div style={{ background: "#fff", borderRadius: 12, padding: 40, textAlign: "center", color: "#94a3b8", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>No sermons yet. Add the first one above.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sermons.map(s => (
            <div key={s.id} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: "#1e293b" }}>{s.title}</div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{s.speaker}{s.sermon_date ? " · " + fmtDate(s.sermon_date) : ""}{s.series ? " · " + s.series : ""}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12, background: s.published !== false ? "#e7f6ec" : "#eef1f5", color: s.published !== false ? "#1c7c43" : "#64748b" }}>{s.published !== false ? "Published" : "Hidden"}</span>
              <button onClick={() => openEdit(s)} style={{ background: "transparent", color: NAVY, border: "1px solid " + NAVY, padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Edit</button>
              <button onClick={() => remove(s)} style={{ background: "transparent", color: "#b42318", border: "1px solid #f0c5bf", padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import appSupabase from "./appSupabaseClient";

const NAVY = "#1B4F8A";
const MUTED = "#64748b";
const AUTHORS = ["Pastor Lisa Baldwin", "Minister C.W. Baldwin"];

const blankForm = () => ({
  title: "",
  body: "",
  author: "Pastor Lisa Baldwin",
  urgent: false,
  published: true,
  publish_date: new Date().toISOString().slice(0, 10),
  expires_date: "",
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

export default function AnnouncementsEditor() {
  const [items, setItems] = useState([]);
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
      .from("announcements")
      .select("*")
      .order("publish_date", { ascending: false });
    if (error) setErr(error.message);
    else setItems(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function openNew() {
    setForm(blankForm());
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(a) {
    setForm({
      title: a.title || "",
      body: a.body || "",
      author: a.author || "Pastor Lisa Baldwin",
      urgent: !!a.urgent,
      published: a.published !== false,
      publish_date: a.publish_date || new Date().toISOString().slice(0, 10),
      expires_date: a.expires_date || "",
    });
    setEditingId(a.id);
    setShowForm(true);
  }

  async function save() {
    if (!form.title.trim() || !form.body.trim()) {
      setErr("Title and body are required.");
      return;
    }
    setSaving(true);
    setErr("");
    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      author: form.author || "Pastor Lisa Baldwin",
      urgent: !!form.urgent,
      published: !!form.published,
      publish_date: form.publish_date,
      expires_date: form.expires_date || null,
    };
    let resp;
    if (editingId) {
      resp = await appSupabase.from("announcements").update(payload).eq("id", editingId);
    } else {
      resp = await appSupabase.from("announcements").insert(payload);
    }
    setSaving(false);
    if (resp.error) { setErr(resp.error.message); return; }
    setShowForm(false);
    setEditingId(null);
    load();
  }

  async function remove(a) {
    const ok = window.confirm('Delete "' + a.title + '" permanently? This removes it from the app and cannot be undone.');
    if (!ok) return;
    const { error } = await appSupabase.from("announcements").delete().eq("id", a.id);
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
          <div style={{ fontSize: 14, color: MUTED }}>{items.length} announcement{items.length === 1 ? "" : "s"} in the app</div>
          <button onClick={openNew} style={{ background: NAVY, color: "#fff", border: "none", padding: "10px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>+ New Announcement</button>
        </div>
      ) : null}

      {showForm ? (
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: NAVY, marginBottom: 18 }}>{editingId ? "Edit Announcement" : "New Announcement"}</div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Title</label>
            <input style={inputStyle} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Fellowship Dinner This Friday" />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Body</label>
            <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={form.body} onChange={e => set("body", e.target.value)} placeholder="Share the details here..." />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Author</label>
            <select style={inputStyle} value={form.author} onChange={e => set("author", e.target.value)}>
              {AUTHORS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Publish date</label>
              <input type="date" style={inputStyle} value={form.publish_date} onChange={e => set("publish_date", e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Expires (optional)</label>
              <input type="date" style={inputStyle} value={form.expires_date} onChange={e => set("expires_date", e.target.value)} />
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 14, color: "#1e293b", cursor: "pointer" }}>
            <input type="checkbox" checked={form.urgent} onChange={e => set("urgent", e.target.checked)} />
            Mark as urgent
          </label>

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
        <div style={{ color: MUTED, fontSize: 14, padding: 20 }}>Loading announcements...</div>
      ) : items.length === 0 && !showForm ? (
        <div style={{ background: "#fff", borderRadius: 12, padding: 40, textAlign: "center", color: "#94a3b8", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>No announcements yet. Add the first one above.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map(a => {
            const meta = [a.author, fmtDate(a.publish_date), a.expires_date ? "expires " + fmtDate(a.expires_date) : ""].filter(Boolean).join(" · ");
            return (
              <div key={a.id} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#1e293b" }}>{a.title}</div>
                  <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{meta}</div>
                </div>
                {a.urgent ? (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12, background: "#fdecec", color: "#b42318" }}>Urgent</span>
                ) : null}
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12, background: a.published !== false ? "#e7f6ec" : "#eef1f5", color: a.published !== false ? "#1c7c43" : "#64748b" }}>{a.published !== false ? "Published" : "Hidden"}</span>
                <button onClick={() => openEdit(a)} style={{ background: "transparent", color: NAVY, border: "1px solid " + NAVY, padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Edit</button>
                <button onClick={() => remove(a)} style={{ background: "transparent", color: "#b42318", border: "1px solid #f0c5bf", padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Delete</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

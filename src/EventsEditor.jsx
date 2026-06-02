import { useState, useEffect } from "react";
import appSupabase from "./appSupabaseClient";

const NAVY = "#1B4F8A";
const MUTED = "#64748b";

const blankForm = () => ({
  title: "",
  event_date: new Date().toISOString().slice(0, 10),
  start_time: "",
  end_time: "",
  location: "",
  type: "Church-Wide",
  recurring: false,
  description: "",
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

function fmtTime(t) {
  if (!t) return "";
  const parts = t.split(":");
  let h = parseInt(parts[0], 10);
  const m = parts[1] || "00";
  if (isNaN(h)) return t;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return h + ":" + m + " " + ampm;
}

function timeRange(s, e) {
  const a = fmtTime(s);
  const b = fmtTime(e);
  if (a && b) return a + " - " + b;
  return a || b || "";
}

export default function EventsEditor() {
  const [events, setEvents] = useState([]);
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
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });
    if (error) setErr(error.message);
    else setEvents(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function openNew() {
    setForm(blankForm());
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(ev) {
    setForm({
      title: ev.title || "",
      event_date: ev.event_date || new Date().toISOString().slice(0, 10),
      start_time: ev.start_time ? ev.start_time.slice(0, 5) : "",
      end_time: ev.end_time ? ev.end_time.slice(0, 5) : "",
      location: ev.location || "",
      type: ev.type || "Church-Wide",
      recurring: !!ev.recurring,
      description: ev.description || "",
    });
    setEditingId(ev.id);
    setShowForm(true);
  }

  async function save() {
    if (!form.title.trim() || !form.event_date) {
      setErr("Title and date are required.");
      return;
    }
    setSaving(true);
    setErr("");
    const payload = {
      title: form.title.trim(),
      event_date: form.event_date,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      location: form.location.trim() || null,
      type: form.type.trim() || "Church-Wide",
      recurring: !!form.recurring,
      description: form.description.trim() || null,
    };
    let resp;
    if (editingId) {
      resp = await appSupabase.from("events").update(payload).eq("id", editingId);
    } else {
      resp = await appSupabase.from("events").insert(payload);
    }
    setSaving(false);
    if (resp.error) { setErr(resp.error.message); return; }
    setShowForm(false);
    setEditingId(null);
    load();
  }

  async function remove(ev) {
    const ok = window.confirm('Delete "' + ev.title + '" permanently? This removes it from the app and cannot be undone.');
    if (!ok) return;
    const { error } = await appSupabase.from("events").delete().eq("id", ev.id);
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
          <div style={{ fontSize: 14, color: MUTED }}>{events.length} event{events.length === 1 ? "" : "s"} in the app</div>
          <button onClick={openNew} style={{ background: NAVY, color: "#fff", border: "none", padding: "10px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>+ New Event</button>
        </div>
      ) : null}

      {showForm ? (
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: NAVY, marginBottom: 18 }}>{editingId ? "Edit Event" : "New Event"}</div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Title</label>
            <input style={inputStyle} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Sunday Worship Service" />
          </div>

          <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date</label>
              <input type="date" style={inputStyle} value={form.event_date} onChange={e => set("event_date", e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Type</label>
              <input style={inputStyle} value={form.type} onChange={e => set("type", e.target.value)} placeholder="Church-Wide" />
            </div>
          </div>

          <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Start time (optional)</label>
              <input type="time" style={inputStyle} value={form.start_time} onChange={e => set("start_time", e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>End time (optional)</label>
              <input type="time" style={inputStyle} value={form.end_time} onChange={e => set("end_time", e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Location (optional)</label>
            <input style={inputStyle} value={form.location} onChange={e => set("location", e.target.value)} placeholder="Main Sanctuary" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Description (optional)</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 14, color: "#1e293b", cursor: "pointer" }}>
            <input type="checkbox" checked={form.recurring} onChange={e => set("recurring", e.target.checked)} />
            Recurring event
          </label>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={save} disabled={saving} style={{ background: NAVY, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}>{saving ? "Saving..." : "Save"}</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setErr(""); }} style={{ background: "transparent", color: MUTED, border: "1px solid #d8e0ea", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div style={{ color: MUTED, fontSize: 14, padding: 20 }}>Loading events...</div>
      ) : events.length === 0 && !showForm ? (
        <div style={{ background: "#fff", borderRadius: 12, padding: 40, textAlign: "center", color: "#94a3b8", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>No events yet. Add the first one above.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {events.map(ev => {
            const sub = [fmtDate(ev.event_date), timeRange(ev.start_time, ev.end_time), ev.location, ev.type].filter(Boolean).join(" · ");
            return (
              <div key={ev.id} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#1e293b" }}>{ev.title}</div>
                  <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>{sub}</div>
                </div>
                {ev.recurring ? (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12, background: "#eef4fb", color: NAVY }}>Recurring</span>
                ) : null}
                <button onClick={() => openEdit(ev)} style={{ background: "transparent", color: NAVY, border: "1px solid " + NAVY, padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Edit</button>
                <button onClick={() => remove(ev)} style={{ background: "transparent", color: "#b42318", border: "1px solid #f0c5bf", padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Delete</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

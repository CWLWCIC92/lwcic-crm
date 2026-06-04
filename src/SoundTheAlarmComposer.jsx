import { useState, useEffect } from "react";
import appSupabase from "./appSupabaseClient";

const NAVY = "#1B4F8A";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";
const RED = "#dc2626";

const card = { background:"#fff", borderRadius:12, boxShadow:"0 1px 3px rgba(0,0,0,0.08)", padding:24, marginBottom:16 };
const label = { display:"block", fontSize:13, fontWeight:600, color:MUTED, textTransform:"uppercase", letterSpacing:1, marginBottom:6, marginTop:16 };
const input = { width:"100%", padding:"10px 12px", border:"1px solid "+BORDER, borderRadius:8, fontSize:15, fontFamily:"inherit", boxSizing:"border-box" };
const btnPrimary = { background:NAVY, color:"#fff", border:"none", borderRadius:8, padding:"10px 22px", fontSize:15, fontWeight:600, cursor:"pointer" };
const btnGhost = { background:"transparent", color:MUTED, border:"1px solid "+BORDER, borderRadius:8, padding:"9px 16px", fontSize:14, cursor:"pointer" };
const labelRow = { display:"flex", alignItems:"center", gap:8, marginTop:18, fontSize:14, color:"#334155", cursor:"pointer" };

// Boilerplate seeded from Pastor Lisa's own alarm -- editable starting points.
const DEF_BANNER = "SOUND THE ALARM PRAYER \u2764\uFE0F\uD83D\uDE4F";
const DEF_CALL = "On behalf of our dear [name], who [situation], we are asking the people of God to stand in the gap and call her name before the Throne of Grace. \uD83D\uDE4F";
const DEF_RALLY = "WARRIORS ON THE FRONT LINE \u2014 it is time to RISE 2 SHINE !! and bombard Heaven on behalf of our sister! \uD83D\uDE4C";
const DEF_CLOSING = "We as ONE BODY! together in faith, love, and prayer believing God to sustain her through it all.\nIn the mighty and powerful Name of Jesus,\nAMEN. \u2764\uFE0F\uD83D\uDE4F";
const DEF_PUSH = "\uD83D\uDEA8 SOUND THE ALARM \u2014 Pastor Lisa is asking the body to pray. Tap to join. \uD83D\uDE4F";

function assembleBody(banner, call, prayer, rally, closing) {
  return [banner, call, prayer, rally, closing].map(s => (s || "").trim()).filter(s => s.length > 0).join("\n");
}

export default function SoundTheAlarmComposer() {
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [forPerson, setForPerson] = useState("");
  const [titleLabel, setTitleLabel] = useState("");
  const [pushPreview, setPushPreview] = useState(DEF_PUSH);
  const [sentBy, setSentBy] = useState("Pastor Lisa");
  const [active, setActive] = useState(true);

  const [banner, setBanner] = useState(DEF_BANNER);
  const [call, setCall] = useState(DEF_CALL);
  const [prayer, setPrayer] = useState("");
  const [rally, setRally] = useState(DEF_RALLY);
  const [closing, setClosing] = useState(DEF_CLOSING);

  const [fullBody, setFullBody] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await appSupabase.from("prayer_alerts").select("*").order("created_at", { ascending: false });
    setRows(data || []);
    const { data: resp } = await appSupabase.from("prayer_alert_responses").select("alert_id");
    const map = {};
    (resp || []).forEach(r => { map[r.alert_id] = (map[r.alert_id] || 0) + 1; });
    setCounts(map);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function resetForm() {
    setEditingId(null);
    setForPerson(""); setTitleLabel(""); setPushPreview(DEF_PUSH); setSentBy("Pastor Lisa"); setActive(true);
    setBanner(DEF_BANNER); setCall(DEF_CALL); setPrayer(""); setRally(DEF_RALLY); setClosing(DEF_CLOSING);
    setFullBody("");
  }
  function startNew() { resetForm(); setShowForm(true); }
  function startEdit(r) {
    setEditingId(r.id);
    setForPerson(r.for_person || "");
    setTitleLabel(r.title || "");
    setPushPreview(r.push_preview || DEF_PUSH);
    setSentBy(r.sent_by || "Pastor Lisa");
    setActive(!!r.active);
    setFullBody(r.body || "");
    setShowForm(true);
  }
  function cancel() { resetForm(); setShowForm(false); }

  const previewBody = editingId ? fullBody : assembleBody(banner, call, prayer, rally, closing);

  async function save() {
    const body = editingId ? fullBody.trim() : assembleBody(banner, call, prayer, rally, closing);
    if (!body) { alert("The alert message is empty."); return; }
    const title = titleLabel.trim() || ("Sound the Alarm Prayer" + (forPerson.trim() ? " for " + forPerson.trim() : ""));
    setSaving(true);
    const payload = {
      title: title,
      body: body,
      push_preview: pushPreview.trim(),
      for_person: forPerson.trim(),
      sent_by: sentBy.trim() || "Pastor Lisa",
      active: active,
    };
    let savedId = editingId;
    if (editingId) {
      await appSupabase.from("prayer_alerts").update(payload).eq("id", editingId);
    } else {
      const { data } = await appSupabase.from("prayer_alerts").insert(payload).select("id").single();
      savedId = data ? data.id : null;
    }
    if (active && savedId != null) {
      await appSupabase.from("prayer_alerts").update({ active: false }).neq("id", savedId);
    }
    setSaving(false); cancel(); load();
  }

  async function remove(r) {
    if (!window.confirm("Delete this alert (" + (r.title || "untitled") + ")? This cannot be undone.")) return;
    await appSupabase.from("prayer_alerts").delete().eq("id", r.id);
    load();
  }

  return (
    <div>
      {!showForm && <button style={btnPrimary} onClick={startNew}>+ New Sound the Alarm</button>}

      {showForm && (
        <div style={card}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:NAVY }}>
            {editingId ? "Edit Alert" : "New Sound the Alarm"}
          </div>
          <p style={{ color:MUTED, fontSize:13, marginTop:6, lineHeight:1.5 }}>
            Publishing raises this alert inside the app right now. The push notification to every phone arrives with Phase D.
          </p>

          <label style={label}>Who are we praying for?</label>
          <input style={input} value={forPerson} onChange={e=>setForPerson(e.target.value)} placeholder="Sister Linda" />

          <label style={label}>Card title (optional)</label>
          <input style={input} value={titleLabel} onChange={e=>setTitleLabel(e.target.value)}
            placeholder={"Sound the Alarm Prayer" + (forPerson.trim() ? " for " + forPerson.trim() : "")} />

          <label style={label}>Lock-screen push text</label>
          <textarea style={{ ...input, minHeight:54 }} value={pushPreview} onChange={e=>setPushPreview(e.target.value)} />
          <div style={{ fontSize:12, color:MUTED, marginTop:4 }}>Short text shown on the phone. The full prayer opens in the app when tapped.</div>

          {!editingId && (
            <div>
              <label style={label}>Banner</label>
              <input style={input} value={banner} onChange={e=>setBanner(e.target.value)} />
              <label style={label}>The Call</label>
              <textarea style={{ ...input, minHeight:70 }} value={call} onChange={e=>setCall(e.target.value)} />
              <label style={label}>The Prayer (the heart of it)</label>
              <textarea style={{ ...input, minHeight:170 }} value={prayer} onChange={e=>setPrayer(e.target.value)}
                placeholder="Father God, in the Name of Jesus, we ask that You..." />
              <label style={label}>The Rally</label>
              <textarea style={{ ...input, minHeight:70 }} value={rally} onChange={e=>setRally(e.target.value)} />
              <label style={label}>The Closing</label>
              <textarea style={{ ...input, minHeight:90 }} value={closing} onChange={e=>setClosing(e.target.value)} />
            </div>
          )}

          {editingId && (
            <div>
              <label style={label}>Full message</label>
              <textarea style={{ ...input, minHeight:300 }} value={fullBody} onChange={e=>setFullBody(e.target.value)} />
            </div>
          )}

          <label style={labelRow}>
            <input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)} />
            Show this alert in the app now (replaces any current alert)
          </label>

          <div style={{ marginTop:18 }}>
            <div style={{ fontSize:12, fontWeight:600, color:MUTED, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Preview</div>
            <div style={{ border:"1px solid "+BORDER, borderLeft:"4px solid "+RED, borderRadius:8, padding:16, background:"#fff7f7", whiteSpace:"pre-wrap", color:"#334155", fontSize:14, lineHeight:1.55 }}>
              {previewBody || "(empty)"}
            </div>
          </div>

          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button style={btnPrimary} onClick={save} disabled={saving}>{saving ? "Saving..." : (editingId ? "Save Changes" : "Publish Alert")}</button>
            <button style={btnGhost} onClick={cancel}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ marginTop:20 }}>
        {loading ? (
          <p style={{ color:MUTED }}>Loading...</p>
        ) : rows.length === 0 ? (
          <p style={{ color:MUTED }}>No alerts yet.</p>
        ) : rows.map(r => (
          <div key={r.id} style={card}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
              <div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:NAVY }}>{r.title || "Sound the Alarm"}</div>
                <div style={{ fontSize:13, color:MUTED, marginTop:4 }}>{(r.sent_by || "Pastor Lisa")}{r.for_person ? " \u00b7 for " + r.for_person : ""}</div>
                <div style={{ display:"flex", gap:10, marginTop:8, alignItems:"center" }}>
                  {r.active && <span style={{ background:"#fee2e2", color:RED, fontSize:12, fontWeight:600, padding:"2px 10px", borderRadius:999 }}>Showing in app</span>}
                  <span style={{ fontSize:13, color:MUTED }}>{"\uD83D\uDE4F "}{counts[r.id] || 0} praying</span>
                </div>
              </div>
              <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                <button style={btnGhost} onClick={()=>startEdit(r)}>Edit</button>
                <button style={{ ...btnGhost, color:RED, borderColor:"#fecaca" }} onClick={()=>remove(r)}>Delete</button>
              </div>
            </div>
            {r.body && <div style={{ whiteSpace:"pre-wrap", color:"#475569", marginTop:10, fontSize:13, lineHeight:1.5 }}>{r.body}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

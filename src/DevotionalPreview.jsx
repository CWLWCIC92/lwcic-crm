import { useState, useEffect } from "react";
import appSupabase from "./appSupabaseClient";

const NAVY = "#1B4F8A";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";
const SERIF = "'Playfair Display', Georgia, serif";

// Mirror of the app's dayOfYearRotation(), for an arbitrary date.
function rotationIndexFor(date, poolSize) {
  if (!poolSize) return 0;
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date - start) / 86400000);
  return ((dayOfYear % poolSize) + poolSize) % poolSize;
}

function Chip({ text, on }) {
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
      background: on ? "#dcfce7" : "#f1f5f9", color: on ? "#166534" : MUTED,
      border: "1px solid " + (on ? "#bbf7d0" : BORDER),
    }}>{text}</span>
  );
}

export default function DevotionalPreview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verseRef, setVerseRef] = useState("");
  const [tomorrowLabel, setTomorrowLabel] = useState("");
  const [devo, setDevo] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true); setError(null); setDevo(null);
    try {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      setTomorrowLabel(t.toLocaleDateString(undefined, {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      }));

      const { count, error: cErr } = await appSupabase
        .from("votd_devotionals")
        .select("*", { count: "exact", head: true })
        .eq("active", true);
      if (cErr) throw cErr;
      if (!count) { setError("No active devotionals in the rotation."); setLoading(false); return; }

      const idx = rotationIndexFor(t, count);

      const { data: devoRows, error: dErr } = await appSupabase
        .from("votd_devotionals")
        .select("title, body, reflection_questions, closing_prayer, scripture_ref, scripture_text, active, pastor_edited, ai_generated")
        .eq("rotation_key", idx)
        .eq("active", true)
        .limit(1);
      if (dErr) throw dErr;
      const d = devoRows && devoRows[0];
      if (!d) { setError("No active devotional maps to tomorrow's rotation slot (key " + idx + " of " + count + ")."); setLoading(false); return; }
      setVerseRef(d.scripture_ref);
      setDevo(d);
    } catch (e) {
      setError((e && e.message) || String(e));
    }
    setLoading(false);
  }

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <h2 style={{ margin: 0, fontFamily: SERIF, fontSize: 28, color: NAVY }}>Tomorrow's Devotional</h2>
        <button onClick={load} style={{ border: "1px solid " + BORDER, background: "#fff", color: MUTED, borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>Refresh</button>
      </div>
      <div style={{ color: MUTED, fontSize: 14, marginBottom: 2 }}>
        A preview of what the congregation will open in the app tomorrow{tomorrowLabel ? " (" + tomorrowLabel + ")" : ""}.
      </div>
      {verseRef ? <div style={{ color: NAVY, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Verse: {verseRef}</div> : null}
      <div style={{ color: MUTED, fontSize: 13, fontStyle: "italic", marginBottom: 18 }}>
        Read-only. To make changes, edit this devotional in Claude Code.
      </div>

      {loading ? <div style={{ background: "#fff", border: "1px solid " + BORDER, borderRadius: 12, padding: 40, textAlign: "center", color: MUTED }}>Loading...</div> : null}
      {!loading && error ? <div style={{ background: "#fff", border: "1px solid " + BORDER, borderRadius: 12, padding: 30, color: MUTED, lineHeight: 1.5 }}>{error}</div> : null}

      {!loading && devo ? (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <Chip text={devo.active ? "Active - will show in app" : "Not active"} on={devo.active} />
            <Chip text={devo.ai_generated ? "AI draft" : "Authored"} />
            <Chip text={devo.pastor_edited ? "Pastor edited" : "Not yet pastor-edited"} on={devo.pastor_edited} />
          </div>
          <div style={{ border: "5px solid " + NAVY, background: "#fff", maxWidth: 620, margin: "0 auto" }}>
            <div style={{ padding: "18px 22px 0", fontFamily: SERIF, fontWeight: 700, textAlign: "center", fontSize: 13, color: "#444", lineHeight: 1.5 }}>
              This daily devotional is written to help the Living Water family begin each day grounded in Scripture, prayer, and trust in Jesus Christ.
            </div>
            <div style={{ background: NAVY, marginTop: 16, padding: 14, textAlign: "center" }}>
              <div style={{ color: "#fff", fontFamily: SERIF, fontSize: 20 }}>Daily Devotional</div>
              <div style={{ color: "#cdd8e6", fontFamily: SERIF, fontStyle: "italic", fontSize: 13 }}>Living Water Church In Christ</div>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 24, textAlign: "center", textTransform: "uppercase", color: "#1a1a1a", padding: "20px 20px 8px" }}>{devo.title}</div>
            <div style={{ background: "#dcdcdc", border: "3px solid " + NAVY, margin: "8px 20px", padding: 14 }}>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", textAlign: "center", fontSize: 15, color: "#1a1a1a", lineHeight: 1.6 }}>{devo.scripture_text}</div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, textAlign: "center", color: NAVY, marginTop: 8 }}>{devo.scripture_ref}</div>
            </div>
            <div style={{ padding: "6px 22px", fontFamily: SERIF, fontSize: 15, lineHeight: 1.7, color: "#1a1a1a" }}>
              {(devo.body || "").split("\n\n").map((p, i) => (<p key={i} style={{ margin: "10px 0" }}>{p}</p>))}
            </div>
            {devo.reflection_questions ? (
              <div style={{ background: "#f1f0ea", margin: "8px 20px", padding: 14 }}>
                <div style={{ fontFamily: SERIF, fontWeight: 700, textTransform: "uppercase", color: NAVY, marginBottom: 8, fontSize: 14 }}>Bread for Thought</div>
                {devo.reflection_questions.split("\n").filter(function (q) { return q.trim(); }).map((q, i) => (<div key={i} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: "#1a1a1a", margin: "6px 0", lineHeight: 1.5 }}>{q}</div>))}
              </div>
            ) : null}
            {devo.closing_prayer ? (
              <div style={{ background: NAVY, marginTop: 8, padding: "16px 20px" }}>
                <div style={{ color: "#fff", fontFamily: SERIF, fontWeight: 700, textTransform: "uppercase", textAlign: "center", marginBottom: 8, fontSize: 14 }}>A Prayer</div>
                <div style={{ color: "#fff", fontFamily: SERIF, fontStyle: "italic", textAlign: "center", fontSize: 14, lineHeight: 1.6 }}>{devo.closing_prayer}</div>
              </div>
            ) : null}
            <div style={{ textAlign: "center", fontFamily: SERIF, fontSize: 11, color: "#7a7a7a", padding: 10 }}>Living Water Church In Christ, McKees Rocks</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LWCIC sms-inbound-webhook Edge Function
//
// Receives POST from Twilio whenever someone texts (833) 847-1579.
// Detects STOP/UNSUBSCRIBE/CANCEL/END/QUIT/OPTOUT keywords and flips
// sms_opted_out=true on the matching member record. Logs every inbound
// message to sms_opt_out_log for TCPA audit trail.
//
// Twilio sends form-urlencoded data (NOT JSON). Key fields received:
//   From          - sender phone number (E.164)
//   To            - our toll-free number
//   Body          - the message text
//   MessageSid    - Twilio's unique message ID
//
// Response: returns TwiML (XML). Empty <Response/> means "no auto-reply."
// Twilio's carrier-mandated STOP/HELP responses fire automatically at the
// platform layer; we don't duplicate them here.
//
// LovesFlock standard: every white-label church gets this function.
// ═══════════════════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// ─── Keywords carriers honor as opt-out (per CTIA guidelines) ───
const OPT_OUT_KEYWORDS = ["STOP", "UNSUBSCRIBE", "CANCEL", "END", "QUIT", "OPTOUT", "OPT OUT", "STOPALL"];
const HELP_KEYWORDS = ["HELP", "INFO"];

// Help response text (sent back to user when they text HELP)
const HELP_RESPONSE = "Living Water Church In Christ texts. Reply STOP to unsubscribe. For pastoral care, call (412) 932-4646. Msg & data rates may apply.";

// ─── Phone normalizer (matches send-announcement's helper) ───
function toE164(phone: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return "+1" + digits;
  if (digits.length === 11 && digits.startsWith("1")) return "+" + digits;
  if (phone.startsWith("+") && digits.length >= 10) return "+" + digits;
  return null;
}

// ─── Detect keyword in message body (case-insensitive, trimmed) ───
function detectKeyword(body: string, keywords: string[]): string | null {
  const normalized = body.trim().toUpperCase();
  for (const kw of keywords) {
    // Match whole-word (e.g. "STOP" matches "STOP" or "stop please" but not "STOPLIGHT")
    if (normalized === kw || normalized.startsWith(kw + " ") || normalized.startsWith(kw + ".") || normalized.startsWith(kw + "!")) {
      return kw;
    }
  }
  return null;
}

// ─── TwiML response builders ───
function emptyTwiML(): string {
  return '<?xml version="1.0" encoding="UTF-8"?><Response/>';
}

function helpTwiML(): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${HELP_RESPONSE}</Message></Response>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Main handler
// ═══════════════════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  // Only accept POST (Twilio uses POST)
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Twilio sends application/x-www-form-urlencoded
    const formData = await req.formData();
    const fromPhone = formData.get("From")?.toString() || "";
    const toPhone = formData.get("To")?.toString() || "";
    const messageBody = formData.get("Body")?.toString() || "";
    const messageSid = formData.get("MessageSid")?.toString() || "";

    console.log(`[INBOUND] From=${fromPhone} To=${toPhone} Sid=${messageSid} Body="${messageBody}"`);

    // Connect to Supabase using service role (bypasses RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Normalize the inbound phone for member lookup
    const normalizedPhone = toE164(fromPhone);

    // Detect what kind of message this is
    const optOutKeyword = detectKeyword(messageBody, OPT_OUT_KEYWORDS);
    const helpKeyword = detectKeyword(messageBody, HELP_KEYWORDS);

    // ─── Branch: HELP keyword ───
    if (helpKeyword) {
      await supabase.from("sms_opt_out_log").insert({
        member_id: null,
        phone: normalizedPhone || fromPhone,
        keyword_received: helpKeyword,
        message_body: messageBody,
        twilio_message_sid: messageSid,
        action_taken: "help_sent"
      });
      return new Response(helpTwiML(), { headers: { "Content-Type": "application/xml" } });
    }

    // ─── Branch: STOP / opt-out keyword ───
    if (optOutKeyword) {
      // Try to find the member by phone
      let memberId: number | null = null;
      let actionTaken = "no_match";

      if (normalizedPhone) {
        // Members table stores phones as "412-932-4646" (with dashes)
        // We need to compare normalized E.164 against normalized members
        const { data: members, error: lookupError } = await supabase
          .from("members")
          .select("id, phone, sms_opted_out");

        if (lookupError) {
          console.error("Member lookup error:", lookupError);
        } else if (members) {
          // Find member whose normalized phone matches
          const match = members.find((m: any) => toE164(m.phone) === normalizedPhone);
          if (match) {
            memberId = match.id;
            if (match.sms_opted_out === true) {
              actionTaken = "already_opted_out";
            } else {
              // Flip the opt-out flag
              const { error: updateError } = await supabase
                .from("members")
                .update({ sms_opted_out: true })
                .eq("id", match.id);
              if (updateError) {
                console.error("Update error:", updateError);
              } else {
                actionTaken = "opted_out";
                console.log(`[OPT_OUT] Flipped sms_opted_out=true for member_id=${match.id}`);
              }
            }
          }
        }
      }

      // Log the event regardless of match outcome
      await supabase.from("sms_opt_out_log").insert({
        member_id: memberId,
        phone: normalizedPhone || fromPhone,
        keyword_received: optOutKeyword,
        message_body: messageBody,
        twilio_message_sid: messageSid,
        action_taken: actionTaken
      });

      // Return empty TwiML — Twilio's carrier-level STOP confirmation already fires
      return new Response(emptyTwiML(), { headers: { "Content-Type": "application/xml" } });
    }

    // ─── Branch: other inbound (not STOP, not HELP) ───
    // Log for audit but take no action
    await supabase.from("sms_opt_out_log").insert({
      member_id: null,
      phone: normalizedPhone || fromPhone,
      keyword_received: null,
      message_body: messageBody,
      twilio_message_sid: messageSid,
      action_taken: "inbound_other"
    });

    return new Response(emptyTwiML(), { headers: { "Content-Type": "application/xml" } });

  } catch (err) {
    console.error("[ERROR] Webhook handler crashed:", err);
    // Return empty TwiML even on error — we don't want to send weird responses to users
    return new Response(emptyTwiML(), { headers: { "Content-Type": "application/xml" } });
  }
});

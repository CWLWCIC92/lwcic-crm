// LWCIC / LovesFlock send-announcement Edge Function
// Sends a mass SMS announcement via Twilio Messaging Service
// to all opted-in members. TCPA-compliant: filters at DB level.
//
// Called by CRM with: { announcement_id: "uuid" }
// Returns: { success, total_sent, total_failed, total_skipped, summary }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─── SERVER-SIDE TEST MODE ─────────────────────────────────
// When TEST_MODE is true, audience is filtered to TEST_RECIPIENT_MEMBER_ID only.
// Set to false ONLY after live-fire test passes and you're ready for production.
// This is the second layer of protection (frontend has the same flag).
const TEST_MODE = false;

// TCPA disclosure footer — appended to every outgoing SMS
// Carriers require periodic opt-out reminder; this satisfies it on every send
const DISCLOSURE_FOOTER = "\n\nReply STOP to unsubscribe, HELP for help.";
const TEST_RECIPIENT_MEMBER_ID = 67;
// ───────────────────────────────────────────────────────────

// Normalize a US phone string into E.164 format (+1XXXXXXXXXX)
// Returns null if the phone can't be normalized to a valid US number.
function toE164(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { announcement_id } = await req.json();
    if (!announcement_id) {
      return new Response(
        JSON.stringify({ error: "Missing announcement_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Init Supabase admin client (service role for trusted writes)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Twilio credentials
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;
    const twilioMessagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID")!;

    // Step 1: Load the announcement row
    const { data: announcement, error: annErr } = await supabase
      .from("sms_announcements")
      .select("*")
      .eq("id", announcement_id)
      .single();

    if (annErr || !announcement) {
      return new Response(
        JSON.stringify({ error: "Announcement not found", details: annErr?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Guard: don't re-send an already-sent announcement
    if (announcement.sent_at) {
      return new Response(
        JSON.stringify({ error: "Announcement already sent", sent_at: announcement.sent_at }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Query opted-in recipients
    // TCPA filter at the database level: must have given consent AND not opted out AND have a phone
    let recipientsQuery = supabase
      .from("members")
      .select("id, first_name, last_name, phone")
      .eq("sms_consent_given", true)
      .eq("sms_opted_out", false)
      .not("phone", "is", null);
    if (TEST_MODE) {
      recipientsQuery = recipientsQuery.eq("id", TEST_RECIPIENT_MEMBER_ID);
      console.log(`[TEST_MODE] Filtering audience to member_id=${TEST_RECIPIENT_MEMBER_ID} only`);
    }
    const { data: recipients, error: recErr } = await recipientsQuery;

    if (recErr) {
      return new Response(
        JSON.stringify({ error: "Failed to load recipients", details: recErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recipientList = recipients || [];

    // Step 3: Mark the announcement as in-flight
    await supabase
      .from("sms_announcements")
      .update({
        sent_at: new Date().toISOString(),
        audience_snapshot_count: recipientList.length,
        twilio_messaging_service_sid: twilioMessagingServiceSid,
      })
      .eq("id", announcement_id);

    // Step 4: For each recipient, insert a recipient row + send via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const twilioAuth = "Basic " + btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    let totalSent = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    for (const member of recipientList) {
      const memberName = `${member.first_name || ""} ${member.last_name || ""}`.trim();
      const e164 = toE164(member.phone);

      // Skip if phone can't be normalized
      if (!e164) {
        await supabase.from("sms_announcement_recipients").insert({
          announcement_id,
          member_id: member.id,
          phone: member.phone || "(missing)",
          member_name: memberName,
          delivery_status: "skipped",
          error_message: "Phone could not be normalized to E.164",
        });
        totalSkipped++;
        continue;
      }

      // Insert recipient row in 'queued' state
      const { data: recipientRow } = await supabase
        .from("sms_announcement_recipients")
        .insert({
          announcement_id,
          member_id: member.id,
          phone: e164,
          member_name: memberName,
          delivery_status: "queued",
        })
        .select()
        .single();

      // Call Twilio API
      const formBody = new URLSearchParams({
        MessagingServiceSid: twilioMessagingServiceSid,
        To: e164,
        Body: announcement.message_body + DISCLOSURE_FOOTER,
      });

      try {
        const twilioRes = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": twilioAuth,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formBody.toString(),
        });

        const twilioData = await twilioRes.json();

        if (twilioRes.ok && twilioData.sid) {
          await supabase
            .from("sms_announcement_recipients")
            .update({
              twilio_message_sid: twilioData.sid,
              delivery_status: "sent",
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", recipientRow!.id);
          totalSent++;
        } else {
          await supabase
            .from("sms_announcement_recipients")
            .update({
              delivery_status: "failed",
              error_code: String(twilioData.code || twilioRes.status),
              error_message: twilioData.message || "Twilio API error",
              updated_at: new Date().toISOString(),
            })
            .eq("id", recipientRow!.id);
          totalFailed++;
        }
      } catch (sendErr) {
        await supabase
          .from("sms_announcement_recipients")
          .update({
            delivery_status: "failed",
            error_message: sendErr instanceof Error ? sendErr.message : "Network error",
            updated_at: new Date().toISOString(),
          })
          .eq("id", recipientRow!.id);
        totalFailed++;
      }
    }

    // Step 5: Update parent announcement with totals
    await supabase
      .from("sms_announcements")
      .update({
        total_sent: totalSent,
        total_failed: totalFailed,
        completed_at: new Date().toISOString(),
      })
      .eq("id", announcement_id);

    return new Response(
      JSON.stringify({
        success: true,
        announcement_id,
        total_recipients: recipientList.length,
        total_sent: totalSent,
        total_failed: totalFailed,
        total_skipped: totalSkipped,
        summary: `Sent ${totalSent} of ${recipientList.length} (${totalFailed} failed, ${totalSkipped} skipped).`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-announcement error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal error",
        details: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

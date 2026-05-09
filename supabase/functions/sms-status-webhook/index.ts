// supabase/functions/sms-status-webhook/index.ts
//
// Twilio Delivery Status Callback handler.
// Twilio POSTs to this endpoint as messages move through their lifecycle:
//   queued -> sent -> delivered  (happy path)
//   queued -> sent -> undelivered  (carrier rejected)
//   queued -> failed  (Twilio rejected before sending)
//
// We match on MessageSid and update sms_announcement_recipients accordingly.
// Phase 3 of LWCIC SMS infrastructure. Part of LovesFlock white-label playbook.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =============================================================================
// TEST_MODE
// Flip to true to log every incoming Twilio payload to console for debugging.
// MUST be false in production after smoke testing — Twilio payloads contain
// phone numbers and we don't want them in long-lived logs.
// =============================================================================
const TEST_MODE = false;

// Twilio's terminal statuses — once we see one of these we record it.
// Non-terminal statuses (queued, sending) are recorded too so the CRM can
// show real-time progress, but only terminal statuses set delivered_at.
const TERMINAL_STATUSES = new Set([
  "delivered",
  "undelivered",
  "failed",
]);

// Statuses we accept but don't treat as final.
const KNOWN_STATUSES = new Set([
  "queued",
  "sending",
  "sent",
  "delivered",
  "undelivered",
  "failed",
]);

serve(async (req) => {
  // Twilio always POSTs status callbacks. Reject anything else.
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Twilio sends application/x-www-form-urlencoded
    const formData = await req.formData();
    const messageSid = formData.get("MessageSid")?.toString() ?? "";
    const messageStatus = formData.get("MessageStatus")?.toString() ?? "";
    const errorCode = formData.get("ErrorCode")?.toString() ?? "";
    const errorMessage = formData.get("ErrorMessage")?.toString() ?? "";
    const to = formData.get("To")?.toString() ?? "";

    if (TEST_MODE) {
      console.log("[sms-status-webhook] Incoming payload:", {
        messageSid,
        messageStatus,
        errorCode,
        errorMessage,
        to,
      });
    }

    // Sanity checks. If Twilio sends us garbage, don't touch the DB.
    if (!messageSid || !messageStatus) {
      console.warn("[sms-status-webhook] Missing MessageSid or MessageStatus");
      return new Response("Bad request", { status: 400 });
    }

    if (!KNOWN_STATUSES.has(messageStatus)) {
      // Unknown status — Twilio added something new. Log and shrug.
      console.warn(
        `[sms-status-webhook] Unknown MessageStatus: ${messageStatus} for ${messageSid}`,
      );
      // Still return 200 so Twilio doesn't retry forever.
      return new Response("OK", { status: 200 });
    }

    // Connect to Supabase with the service role key (bypasses RLS).
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[sms-status-webhook] Missing Supabase env vars");
      return new Response("Server misconfigured", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build the update payload.
    const updatePayload: Record<string, unknown> = {
      delivery_status: messageStatus,
      updated_at: new Date().toISOString(),
    };

    if (TERMINAL_STATUSES.has(messageStatus)) {
      // Record the moment of finality.
      if (messageStatus === "delivered") {
        updatePayload.delivered_at = new Date().toISOString();
      }
    }

    if (errorCode) {
      updatePayload.error_code = errorCode;
    }
    if (errorMessage) {
      updatePayload.error_message = errorMessage;
    }

    // Match on twilio_message_sid — this is what was captured at send time.
    const { data, error } = await supabase
      .from("sms_announcement_recipients")
      .update(updatePayload)
      .eq("twilio_message_sid", messageSid)
      .select();

    if (error) {
      console.error("[sms-status-webhook] DB update error:", error);
      // 500 -> Twilio will retry the callback later, which is what we want.
      return new Response("DB error", { status: 500 });
    }

    if (!data || data.length === 0) {
      // No matching row. Could be a stale SID from before the SID column was
      // populated, or a manual Twilio Console send. Don't 500 (Twilio would
      // retry forever) — just log and acknowledge.
      console.warn(
        `[sms-status-webhook] No recipient row found for SID ${messageSid} (status=${messageStatus})`,
      );
      return new Response("OK (no match)", { status: 200 });
    }

    if (TEST_MODE) {
      console.log(
        `[sms-status-webhook] Updated SID ${messageSid} -> ${messageStatus} (${data.length} row)`,
      );
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("[sms-status-webhook] Unhandled error:", err);
    return new Response("Internal error", { status: 500 });
  }
});

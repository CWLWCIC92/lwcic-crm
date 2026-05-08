// LWCIC submit-consent Edge Function
// Receives Connect Card form submissions, captures IP, writes to contact_signups
// AND appends an immutable record to sms_consent_log

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const CONSENT_VERSION = "v1-2026-05-03";
const CONSENT_LANGUAGE_TEXT = "I agree to receive text messages from Living Water Church In Christ at the phone number provided. Messages may include service reminders, prayer chains, event announcements, and pastoral check-ins. Message frequency varies. Msg & data rates may apply. Reply STOP at any time to unsubscribe. Reply HELP for help. Consent is not required to attend services or be a member of LWCIC.";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
    // Extract IP from headers (Supabase passes through Cloudflare's CF-Connecting-IP)
    const ipAddress =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const userAgent = req.headers.get("user-agent") || "unknown";
    const sourceUrl = req.headers.get("referer") || req.headers.get("origin") || "unknown";

    const formData = await req.json();

    // Validate required fields
    if (!formData.first_name || !formData.last_name || !formData.phone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Phone digit validation
    const phoneDigits = String(formData.phone).replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Init Supabase admin client (uses service role for trusted writes)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date().toISOString();

    // Insert into contact_signups
    const { data: signup, error: signupError } = await supabase
      .from("contact_signups")
      .insert([{
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || null,
        address: formData.address?.trim() || null,
        city: formData.city?.trim() || null,
        state: formData.state?.trim() || null,
        zip: formData.zip?.trim() || null,
        birthday: formData.birthday?.trim() || null,
        found_us_via: formData.found_us_via || null,
        status: formData.status || null,
        prayer_request: formData.prayer_request?.trim() || null,
        sms_opt_in: !!formData.sms_opt_in,
        sms_opt_in_date: formData.sms_opt_in ? now : null,
        sms_opt_in_ip: formData.sms_opt_in ? ipAddress : null,
        sms_opt_in_user_agent: formData.sms_opt_in ? userAgent : null,
      }])
      .select()
      .single();

    if (signupError) {
      console.error("contact_signups insert error", signupError);
      return new Response(
        JSON.stringify({ error: "Could not save submission" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Append immutable consent log entry
    const { error: logError } = await supabase
      .from("sms_consent_log")
      .insert([{
        event_type: "opt_in_via_web_form",
        contact_signup_id: signup.id,
        first_name: signup.first_name,
        last_name: signup.last_name,
        phone: signup.phone,
        email: signup.email,
        consent_given: !!formData.sms_opt_in,
        consent_language_version: CONSENT_VERSION,
        consent_language_text: CONSENT_LANGUAGE_TEXT,
        ip_address: ipAddress,
        user_agent: userAgent,
        source_url: sourceUrl,
        notes: formData.sms_opt_in
          ? "Connect Card submitted with SMS consent box checked"
          : "Connect Card submitted without SMS consent",
      }]);

    if (logError) {
      // Log but don't fail — the main signup succeeded
      console.warn("sms_consent_log insert warning", logError);
    }

    return new Response(
      JSON.stringify({ success: true, signup_id: signup.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Edge function error", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { createClient } from "@supabase/supabase-js";

// ============================================================
// App Supabase Client — for content shared with the mobile app
//
// Project: ldjynhvueuyjjjlkkyff
// Used for: congregational_prayers, sermons, events, announcements,
// verse_of_the_day_pool, prayer_alerts, prayer_alert_responses, etc.
//
// IMPORTANT: This is a SEPARATE Supabase project from the CRM's own
// database (src/supabaseClient.js → moyhcebdltdnfxdbbxvs).
//
// The two members tables are intentionally distinct:
//   - CRM members: full pastoral records (giving history, spiritual journey,
//     attendance, family relationships, etc.) — managed by Pastor Lisa
//   - App members: minimal identity for the app (name, phone, email)
//     captured on first sign-in
//
// They are NOT synced. They serve different purposes.
// ============================================================

const appSupabase = createClient(
  "https://ldjynhvueuyjjjlkkyff.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkanluaHZ1ZXV5ampqbGtreWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MzM5OTEsImV4cCI6MjA4ODUwOTk5MX0.YK_eC9915lyytC7xYSyAkO-2V5GStEpbb3fRMHd6OpI"
);

export default appSupabase;

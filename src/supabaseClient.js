import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://moyhcebdltdnfxdbbxvs.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1veWhjZWJkbHRkbmZ4ZGJieHZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMTY2MTcsImV4cCI6MjA4ODU5MjYxN30.55h8i9oryvC8QeGz8pK12pYrVZhncIC6qPSYbWrt8Pc"
);

export default supabase;

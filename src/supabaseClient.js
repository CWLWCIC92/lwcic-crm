import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://moyhcebdltdnfxdbbxvs.supabase.co",
  "sb_publishable_0q60uasG4FBzQbxNnqO8Yw_PTRYJNZO"
);

export default supabase;

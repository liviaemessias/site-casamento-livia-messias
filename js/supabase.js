const SUPABASE_URL = "https://pzgrshdabbvlhdzxtteq.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_d5kny18lr9mMaCakx5lHOA_PGT_9ezh";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);

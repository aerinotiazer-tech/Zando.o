const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder');

async function run() {
  const { data, error } = await supabase.from('sellers_profiles').select('*, users(email, full_name)').limit(1);
  console.log("data:", JSON.stringify(data, null, 2));
  console.log("error:", error);
}
run();

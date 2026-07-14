const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder');

async function run() {
  const { data, error } = await supabase.from('orders').select('*, order_items(*, products(title, product_images(storage_path)))').limit(1);
  console.log("data:", JSON.stringify(data, null, 2));
  console.log("error:", error);
}
run();

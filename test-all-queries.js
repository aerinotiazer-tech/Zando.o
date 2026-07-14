const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder');

async function run() {
  console.log("Testing getUsers...");
  let res = await supabase.from('users').select('*').limit(1);
  if (res.error) console.error("users error:", res.error);

  console.log("Testing getProducts...");
  res = await supabase.from('products').select('*, product_images(storage_path), users!products_seller_id_fkey(sellers_profiles(store_name))').limit(1);
  if (res.error) console.error("products error:", res.error);

  console.log("Testing getSellers...");
  res = await supabase.from('sellers_profiles').select('*, users(email, full_name)').limit(1);
  if (res.error) console.error("sellers error:", res.error);

  console.log("Testing getOrders...");
  res = await supabase.from('orders').select('*, order_items(*, products(title, product_images(storage_path)))').limit(1);
  if (res.error) console.error("orders error:", res.error);

  console.log("Testing getFavorites...");
  res = await supabase.from('favorites').select('product_id').limit(1);
  if (res.error) console.error("favorites error:", res.error);

  console.log("Testing getNotifications...");
  res = await supabase.from('notifications').select('*').limit(1);
  if (res.error) console.error("notifications error:", res.error);

  console.log("Testing categories...");
  res = await supabase.from('categories').select('*').limit(1);
  if (res.error) console.error("categories error:", res.error);

  console.log("All done.");
}
run();

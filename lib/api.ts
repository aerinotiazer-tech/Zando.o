import { supabase } from './supabase';
import { Product, SellerProfile, Order, KYCSubmission, Notification, NewsletterCampaign, User, CartItem, Review } from './types';
import { SEED_PRODUCTS, SEED_SELLERS, SEED_ORDERS, SEED_NOTIFICATIONS, SEED_KYC, SEED_CAMPAIGNS, getStoredState } from './store';

const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

// Basic query cache for SPA performance
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

function getCached<T>(key: string): T | null {
  const cached = queryCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  return null;
}

function setCached(key: string, data: any) {
  queryCache.set(key, { data, timestamp: Date.now() });
}

export const api = {
  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured) {
      const users = getStoredState('users', []);
      return users[0] || null; // Return first mock user for preview
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) return null;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, role, avatar_url, city, phone, created_at')
        .eq('id', session.user.id)
        .single();
        
      if (userError) throw userError;
      
      return {
        id: userData.id,
        email: userData.email,
        name: userData.full_name,
        role: userData.role,
        avatar: userData.avatar_url,
        city: userData.city,
        phone: userData.phone,
        joinedAt: userData.created_at
      } as User;
    } catch (e) {
      console.error('Error fetching user', e);
      return null;
    }
  },

  async getProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured) return getStoredState('products', SEED_PRODUCTS);
    const cached = getCached<Product[]>('products');
    if (cached) return cached;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, seller_id, title, description, price, stock, created_at, product_images(storage_path), categories(name), users!products_seller_id_fkey(sellers_profiles(store_name))')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(40);
        
      if (error) throw error;
      const mappedData = data.map((p: any) => ({
        id: p.id,
        sellerId: p.seller_id,
        name: p.title,
        description: p.description,
        price: p.price,
        category: p.categories?.name || 'Général',
        images: (p.product_images && p.product_images.length > 0) ? p.product_images.map((img: any) => img.storage_path) : ['https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80'],
        stock: p.stock,
        rating: 5.0,
        reviews: [],
        sellerName: p.users?.sellers_profiles?.store_name || (Array.isArray(p.users?.sellers_profiles) ? p.users.sellers_profiles[0]?.store_name : null) || 'Vendeur',
        sellerVerified: true,
        createdAt: p.created_at
      }));
      setCached('products', mappedData);
      return mappedData;
    } catch (e) {
      console.error('Error fetching products', e);
      return getStoredState('products', SEED_PRODUCTS);
    }
  },

  async getSellers(): Promise<SellerProfile[]> {
    if (!isSupabaseConfigured) return getStoredState('sellers', SEED_SELLERS);
    const cached = getCached<SellerProfile[]>('sellers');
    if (cached) return cached;
    try {
      const { data, error } = await supabase
        .from('sellers_profiles')
        .select('id, store_name, description, kyc_status, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      const mappedData = data.map((s: any) => ({
        id: s.id,
        name: s.store_name,
        description: s.description,
        logo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        banner: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80',
        rating: 5.0,
        reviewCount: 0,
        city: 'Niamey',
        address: '',
        phone: '',
        isVerified: s.kyc_status === 'approved',
        createdAt: s.created_at
      }));
      setCached('sellers', mappedData);
      return mappedData;
    } catch (e) {
      console.error('Error fetching sellers', e);
      return getStoredState('sellers', SEED_SELLERS);
    }
  },

  async getUsers(): Promise<User[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      
      const { data: userData } = await supabase.from('users').select('role').eq('id', session.user.id).single();
      if (userData?.role !== 'admin') return [];

      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, avatar_url, city, phone, created_at')
        .order('created_at', { ascending: false })
        .limit(40);
        
      if (error) throw error;
      return data.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.full_name,
        role: u.role,
        avatar: u.avatar_url,
        city: u.city || 'Niamey',
        phone: u.phone || '',
        joinedAt: u.created_at
      }));
    } catch (e) {
      console.error('Error fetching users', e);
      return [];
    }
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  },
  async getOrders(): Promise<Order[]> {
    if (!isSupabaseConfigured) return getStoredState('orders', SEED_ORDERS);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data: userData } = await supabase.from('users').select('role').eq('id', session.user.id).single();
      const role = userData?.role || 'buyer';

      let query = supabase.from('orders').select('id, buyer_id, total_amount, status, created_at, shipping_address, order_items!inner(product_id, quantity, unit_price_at_purchase, seller_id, item_status, products(title, product_images(storage_path)))');

      if (role === 'buyer') {
        query = query.eq('buyer_id', session.user.id);
      } else if (role === 'seller') {
        query = query.eq('order_items.seller_id', session.user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(20);
      if (error) throw error;

      return data.map((o: any) => ({
        id: o.id,
        buyerId: o.buyer_id,
        buyerName: o.shipping_address?.name || 'Acheteur',
        buyerEmail: o.shipping_address?.email || 'email@example.com',
        buyerPhone: o.shipping_address?.phone || '',
        buyerAddress: o.shipping_address?.address || '',
        buyerCity: o.shipping_address?.city || '',
        items: o.order_items.map((i: any) => ({
          productId: i.product_id,
          productName: i.products?.title || 'Produit',
          price: i.unit_price_at_purchase,
          image: (i.products?.product_images && i.products.product_images.length > 0) ? i.products.product_images[0].storage_path : 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80',
          quantity: i.quantity,
          sellerId: i.seller_id
        })),
        totalAmount: o.total_amount,
        status: o.status,
        createdAt: o.created_at
      }));
    } catch (e) {
      console.error('Error fetching orders', e);
      return [];
    }
  },

  async toggleFavorite(buyerId: string, productId: string, isFavorite: boolean): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      if (isFavorite) {
        await supabase.from('favorites').insert({ buyer_id: buyerId, product_id: productId });
      } else {
        await supabase.from('favorites').delete().eq('buyer_id', buyerId).eq('product_id', productId);
      }
    } catch (e) {
      console.error('Error toggling favorite', e);
    }
  },

  async createOrder(order: any, items: any[]): Promise<any> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('orders').insert({
        buyer_id: order.buyerId,
        total_amount: order.totalAmount,
        shipping_address: { address: order.buyerAddress, city: order.buyerCity, phone: order.buyerPhone },
        payment_method: 'mobile_money',
        status: 'pending'
      }).select().single();
      
      if (error) throw error;
      
      const orderItems = items.map(item => ({
        order_id: data.id,
        product_id: item.productId,
        seller_id: item.sellerId,
        quantity: item.quantity,
        unit_price_at_purchase: item.price,
        item_status: 'processing'
      }));
      
      await supabase.from('order_items').insert(orderItems);
      
      return data;
    } catch (e) {
      console.error('Error creating order', e);
      return null;
    }
  },

  async getFavorites(buyerId: string): Promise<string[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('favorites').select('product_id').eq('buyer_id', buyerId);
      if (error) throw error;
      return data.map((f: any) => f.product_id);
    } catch (e) {
      console.error('Error fetching favorites', e);
      return [];
    }
  },

  async getNotifications(): Promise<Notification[]> {
    if (!isSupabaseConfigured) return getStoredState('notifications', SEED_NOTIFICATIONS);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('id, user_id, title, body, type, is_read, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;

      return data.map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        title: n.title,
        content: n.body,
        type: n.type,
        isRead: n.is_read,
        createdAt: n.created_at
      }));
    } catch (e) {
      console.error('Error fetching notifications', e);
      return [];
    }
  }
};

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. ENUMS & TYPES
-- ==============================================================================
CREATE TYPE public.user_role AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE public.kyc_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.product_status AS ENUM ('draft', 'active', 'suspended');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'delivered', 'cancelled');
CREATE TYPE public.order_item_status AS ENUM ('processing', 'shipped', 'delivered');
CREATE TYPE public.payment_method AS ENUM ('mobile_money', 'cash');

-- ==============================================================================
-- 2. TABLES
-- ==============================================================================

-- USERS (Synchronized with auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role public.user_role DEFAULT 'buyer'::public.user_role NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  city TEXT DEFAULT 'Niamey',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- SELLER PROFILES
CREATE TABLE public.sellers_profiles (
  id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  store_name TEXT NOT NULL,
  description TEXT,
  kyc_status public.kyc_status DEFAULT 'pending'::public.kyc_status NOT NULL,
  rating_avg NUMERIC(3, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- CATEGORIES
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- PRODUCTS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  status public.product_status DEFAULT 'draft'::public.product_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- PRODUCT IMAGES
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ORDERS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES public.users(id) ON DELETE RESTRICT NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  shipping_address JSONB NOT NULL,
  payment_method public.payment_method NOT NULL,
  status public.order_status DEFAULT 'pending'::public.order_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ORDER ITEMS
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  seller_id UUID REFERENCES public.users(id) ON DELETE RESTRICT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_at_purchase NUMERIC(10, 2) NOT NULL CHECK (unit_price_at_purchase >= 0),
  item_status public.order_item_status DEFAULT 'processing'::public.order_item_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- FAVORITES
CREATE TABLE public.favorites (
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (buyer_id, product_id)
);

-- REVIEWS
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE NOT NULL UNIQUE,
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- CONVERSATIONS
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (buyer_id, seller_id, product_id)
);

-- MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- NEWSLETTERS
CREATE TABLE public.newsletters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'subscribed' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ==============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_seller_id ON public.order_items(seller_id);
CREATE INDEX idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_conversations_buyer_seller ON public.conversations(buyer_id, seller_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- ==============================================================================
-- 4. TRIGGERS (UPDATED_AT & AUTH SYNC)
-- ==============================================================================

-- Generic function to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_sellers_profiles_updated_at BEFORE UPDATE ON public.sellers_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_order_items_updated_at BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Sync auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
DECLARE
  requested_role public.user_role;
BEGIN
  requested_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'buyer'::public.user_role);
  
  -- Security: Prevent users from signing up as admin
  IF requested_role = 'admin'::public.user_role THEN
    requested_role := 'buyer'::public.user_role;
  END IF;

  INSERT INTO public.users (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    requested_role
  );
  
  -- If seller, we should also create a pending seller profile
  IF requested_role = 'seller'::public.user_role THEN
    INSERT INTO public.sellers_profiles (id, store_name, kyc_status)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'store_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      'pending'
    );
  END IF;

  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = user_id AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;


-- Helper function to check if seller has order item (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION public.seller_has_order_item(order_id UUID)
RETURNS BOOLEAN AS $
  SELECT EXISTS (
    SELECT 1 FROM public.order_items WHERE order_id = $1 AND seller_id = auth.uid()
  );
$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if buyer owns order (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION public.buyer_owns_order(order_id UUID)
RETURNS BOOLEAN AS $
  SELECT EXISTS (
    SELECT 1 FROM public.orders WHERE id = $1 AND buyer_id = auth.uid()
  );
$ LANGUAGE sql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Users
CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile or admins" ON public.users FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid()));

-- Sellers Profiles
CREATE POLICY "Seller profiles are viewable by everyone" ON public.sellers_profiles FOR SELECT USING (true);
CREATE POLICY "Sellers can update own profile or admins" ON public.sellers_profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid()));


-- Seller KYC Table (Private)
CREATE TABLE public.seller_kyc (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  document_type TEXT NOT NULL,
  document_number TEXT NOT NULL,
  documents JSONB DEFAULT '{}'::jsonb NOT NULL,
  status public.kyc_status DEFAULT 'pending'::public.kyc_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.seller_kyc ENABLE ROW LEVEL SECURITY;

-- KYC Policies
CREATE POLICY "Sellers can view own KYC" ON public.seller_kyc FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can insert own KYC" ON public.seller_kyc FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own KYC" ON public.seller_kyc FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Admins can view all KYC" ON public.seller_kyc FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all KYC" ON public.seller_kyc FOR UPDATE USING (public.is_admin(auth.uid()));


-- Categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Only admins can modify categories" ON public.categories FOR ALL USING (public.is_admin(auth.uid()));

-- Products
CREATE POLICY "Active products are viewable by everyone" ON public.products FOR SELECT USING (status = 'active' OR auth.uid() = seller_id OR public.is_admin(auth.uid()));
CREATE POLICY "Sellers can create products" ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own products or admins" ON public.products FOR UPDATE USING (auth.uid() = seller_id OR public.is_admin(auth.uid()));
CREATE POLICY "Sellers can delete own products or admins" ON public.products FOR DELETE USING (auth.uid() = seller_id OR public.is_admin(auth.uid()));

-- Product Images
CREATE POLICY "Product images are viewable by everyone" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Sellers can manage images for own products" ON public.product_images FOR ALL USING (
  EXISTS (SELECT 1 FROM public.products WHERE id = product_images.product_id AND seller_id = auth.uid())
);

-- Orders
CREATE POLICY "Users can view own orders or as seller" ON public.orders FOR SELECT USING (
  auth.uid() = buyer_id OR 
  public.is_admin(auth.uid()) OR
  public.seller_has_order_item(id)
);
CREATE POLICY "Buyers can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Buyers and admins can update orders" ON public.orders FOR UPDATE USING (auth.uid() = buyer_id OR public.is_admin(auth.uid()));

-- Order Items
CREATE POLICY "Users can view relevant order items" ON public.order_items FOR SELECT USING (
  public.buyer_owns_order(order_id) OR
  auth.uid() = seller_id OR
  public.is_admin(auth.uid())
);
CREATE POLICY "Buyers can create order items" ON public.order_items FOR INSERT WITH CHECK (
  public.buyer_owns_order(order_id)
);
CREATE POLICY "Sellers and admins can update item status" ON public.order_items FOR UPDATE USING (auth.uid() = seller_id OR public.is_admin(auth.uid()));

-- Favorites
CREATE POLICY "Buyers can manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = buyer_id);

-- Reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Buyers can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Buyers can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = buyer_id);
CREATE POLICY "Buyers can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = buyer_id);

-- Conversations
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Messages
CREATE POLICY "Users can view messages of own conversations" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversations WHERE id = messages.conversation_id AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Newsletters
CREATE POLICY "Anyone can subscribe" ON public.newsletters FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view subscribers" ON public.newsletters FOR SELECT USING (public.is_admin(auth.uid()));


-- ==============================================================================
-- 6. STORAGE BUCKETS & PERMISSIONS
-- ==============================================================================

-- Insert buckets (assuming storage schema exists)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('product_images', 'product_images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc_documents', 'kyc_documents', false) ON CONFLICT DO NOTHING;

-- Avatars Policies
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar." ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatar." ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Product Images Policies
CREATE POLICY "Product images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'product_images');
CREATE POLICY "Authenticated users can upload product images." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product_images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update product images." ON storage.objects FOR UPDATE USING (bucket_id = 'product_images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete product images." ON storage.objects FOR DELETE USING (bucket_id = 'product_images' AND auth.role() = 'authenticated');

-- KYC Documents Policies (Private)
CREATE POLICY "Users can upload their own KYC docs." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'kyc_documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can read their own KYC docs." ON storage.objects FOR SELECT USING (bucket_id = 'kyc_documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can read all KYC docs." ON storage.objects FOR SELECT USING (bucket_id = 'kyc_documents' AND public.is_admin(auth.uid()));

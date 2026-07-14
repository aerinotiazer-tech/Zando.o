export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  avatar?: string;
  phone?: string;
  city?: string;
  address?: string;
  joinedAt: string;
  isVerified?: boolean;
}

export interface SellerProfile {
  id: string;
  name: string;
  description: string;
  logo: string;
  banner: string;
  rating: number;
  reviewCount: number;
  city: string;
  address: string;
  phone: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerVerified: boolean;
  stock: number;
  rating: number;
  reviews: Review[];
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity?: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image: string;
    sellerId: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface KYCSubmission {
  id: string;
  sellerId: string;
  sellerName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Notification {
  id: string;
  userId: string; // 'all' or specific
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  content: string;
  recipientsCount: number;
  sentAt: string;
}

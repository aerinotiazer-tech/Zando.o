'use client';

import React, { useState, useEffect } from 'react';
import { Product, SellerProfile, Order, KYCSubmission, Notification, NewsletterCampaign, User, CartItem, Review } from '../lib/types';
import { 
  SEED_PRODUCTS, SEED_SELLERS, SEED_ORDERS, SEED_NOTIFICATIONS, 
  SEED_KYC, SEED_CAMPAIGNS, getStoredState, setStoredState 
} from '../lib/store';

import PublicViews from '../components/PublicViews';
import AuthViews from '../components/AuthViews';
import UserDashboard from '../components/UserDashboard';
import SellerDashboard from '../components/SellerDashboard';
import AdminDashboard from '../components/AdminDashboard';

import { 
  ShoppingBag, Heart, Shield, LogOut, LogIn, Menu, X, 
  MapPin, CheckCircle2, Award, Mail, Phone, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const userEmail = "beidoufadimatou1998@gmail.com";
  
  // 1. Unified state hooks synced to localStorage
  const [activeRole, setActiveRole] = useState<'visitor' | 'buyer' | 'seller' | 'admin'>('visitor');
  const [currentView, setCurrentView] = useState<'public' | 'auth' | 'dashboard' | 'seller' | 'admin'>('public');
  const [currentSubView, setCurrentSubView] = useState('landing');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  // Core databases
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [kycSubmissions, setKycSubmissions] = useState<KYCSubmission[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize data on client load
  useEffect(() => {
    let mounted = true;
    
    // Check for password recovery hash
    if (window.location.hash.includes('type=recovery')) {
      setCurrentView('auth');
      setCurrentSubView('update-password');
    }

    import('../lib/api').then(({ api }) => {
      // 1. Fetch public data immediately
      Promise.all([
        api.getProducts(),
        api.getSellers()
      ]).then(([prods, sells]) => {
        if (!mounted) return;
        setProducts(prods);
        setSellers(sells);
        setKycSubmissions(getStoredState('kyc', SEED_KYC));
        setCampaigns(getStoredState('campaigns', SEED_CAMPAIGNS));
        setCart(getStoredState('cart', []));
      });

      // 2. Fetch user and conditionally fetch private data
      api.getCurrentUser().then(user => {
        if (!mounted) return;
        if (user) {
          setCurrentUser(user);
          setActiveRole(user.role as any);
          
          // Fetch relevant private data
          const privateRequests: Promise<any>[] = [api.getNotifications()];
          if (user.role === 'buyer') {
            privateRequests.push(api.getOrders());
            privateRequests.push(api.getFavorites(user.id));
          } else if (user.role === 'seller') {
            privateRequests.push(api.getOrders());
          } else if (user.role === 'admin') {
            privateRequests.push(api.getOrders());
            privateRequests.push(api.getUsers());
          }

          Promise.all(privateRequests).then(results => {
            if (!mounted) return;
            setNotifications(results[0]);
            if (user.role === 'buyer') {
              setOrders(results[1]);
              if (results[2].length > 0) setFavorites(results[2]);
            } else if (user.role === 'seller') {
              setOrders(results[1]);
            } else if (user.role === 'admin') {
              setOrders(results[1]);
              if (results[2].length > 0) setUsers(results[2]);
            }
          });
        } else {
          // Mock data handling if no Supabase configured
          if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
            const seedUsers: User[] = [
              { id: 'user-buyer-1', name: 'Fatimata Diallo', email: userEmail, role: 'buyer', joinedAt: '2026-01-05', city: 'Niamey', address: 'Plateau', phone: '+227 96 00 11 22' },
              { id: 'user-seller-alaza', name: 'Alaza Boutique', email: 'alaza@zando.ne', role: 'seller', joinedAt: '2025-01-10', city: 'Niamey' },
              { id: 'user-admin-1', name: 'Zando Manager', email: 'admin@zando.ne', role: 'admin', joinedAt: '2025-01-01', city: 'Niamey' }
            ];
            setUsers(getStoredState('users', seedUsers));
            setCurrentUser(seedUsers[0]);
            setOrders(getStoredState('orders', SEED_ORDERS));
            setNotifications(getStoredState('notifications', SEED_NOTIFICATIONS));
            setFavorites(getStoredState('favorites', []));
          } else {
            setCurrentUser(null);
            setActiveRole('visitor');
          }
        }
      });
    });
    return () => { mounted = false; };
  }, []);

  // Sync to local storage on modifications
  useEffect(() => { if (products.length > 0) setStoredState('products', products); }, [products]);
  useEffect(() => { if (sellers.length > 0) setStoredState('sellers', sellers); }, [sellers]);
  useEffect(() => { if (orders.length > 0) setStoredState('orders', orders); }, [orders]);
  useEffect(() => { if (kycSubmissions.length > 0) setStoredState('kyc', kycSubmissions); }, [kycSubmissions]);
  useEffect(() => { if (campaigns.length > 0) setStoredState('campaigns', campaigns); }, [campaigns]);
  useEffect(() => { if (notifications.length > 0) setStoredState('notifications', notifications); }, [notifications]);
  useEffect(() => { setStoredState('favorites', favorites); }, [favorites]);
  useEffect(() => { setStoredState('cart', cart); }, [cart]);
  useEffect(() => { if (users.length > 0) setStoredState('users', users); }, [users]);

  // Handle manual role changing via developer bar
  const handleChangeRole = (role: 'visitor' | 'buyer' | 'seller' | 'admin') => {
    setActiveRole(role);
    if (role === 'visitor') {
      setCurrentUser(null);
      setCurrentView('public');
      setCurrentSubView('landing');
    } else if (role === 'buyer') {
      const buyer = users.find(u => u.role === 'buyer') || users[0];
      setCurrentUser(buyer);
      setCurrentView('dashboard');
      setCurrentSubView('home');
    } else if (role === 'seller') {
      const seller = users.find(u => u.role === 'seller') || users[1];
      setCurrentUser(seller);
      setCurrentView('seller');
      setCurrentSubView('dashboard');
    } else if (role === 'admin') {
      const admin = users.find(u => u.role === 'admin') || users[2];
      setCurrentUser(admin);
      setCurrentView('admin');
      setCurrentSubView('overview');
    }
  };

  // Navigations routing translator
  const handleNavigate = (view: string, subView: string = 'landing', payload?: any) => {
    setMobileMenuOpen(false);
    
    // Special format e.g. "product:id"
    if (subView.startsWith('product:')) {
      const id = subView.split(':')[1];
      setSelectedProductId(id);
      setCurrentView('public');
      setCurrentSubView('product');
      return;
    }

    if (view === 'public') {
      setCurrentView('public');
      setCurrentSubView(subView);
      if (subView === 'product') {
        setSelectedProductId(payload || products[0]?.id || null);
      } else if (subView === 'shop') {
        setSelectedSellerId(payload || sellers[0]?.id || null);
      }
    } else if (view === 'auth') {
      setCurrentView('auth');
      setCurrentSubView(subView);
    } else if (view === 'dashboard') {
      setCurrentView('dashboard');
      setCurrentSubView(subView);
    } else if (view === 'seller') {
      setCurrentView('seller');
      setCurrentSubView(subView);
    } else if (view === 'admin') {
      setCurrentView('admin');
      setCurrentSubView(subView);
    }
  };

  // State manipulation triggers
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) } : item));
    } else {
      setCart([...cart, { product, quantity }]);
    }
    // Launch a subtle in-app message
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: 'user-buyer-1',
      title: 'Panier mis à jour',
      content: `${product.name} (x${quantity}) a été ajouté à votre panier.`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const handleUpdateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart(cart.map(item => item.product.id === productId ? { ...item, quantity: qty } : item));
    }
  };

  const handleToggleFavorite = async (productId: string) => {
    const isNowFavorite = !favorites.includes(productId);
    if (isNowFavorite) {
      setFavorites([...favorites, productId]);
    } else {
      setFavorites(favorites.filter(id => id !== productId));
    }
    
    if (currentUser && currentUser.role === 'buyer') {
      const { api } = await import('../lib/api');
      await api.toggleFavorite(currentUser.id, productId, isNowFavorite);
    }
  };

  const handleClearCart = () => setCart([]);

  const handleSubmitOrder = async (details: { phone: string; address: string; city: string }) => {
    if (cart.length === 0) return;

    const items = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      image: item.product.images[0],
      quantity: item.quantity,
      sellerId: item.product.sellerId
    }));
    
    const totalAmount = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0) + 2000;

    const newOrder: Order = {
      id: `ZA-${Math.floor(1000 + Math.random() * 9000)}`,
      buyerId: currentUser?.id || 'user-buyer-1',
      buyerName: currentUser?.name || 'Acheteur Anonyme',
      buyerEmail: currentUser?.email || userEmail,
      buyerPhone: details.phone,
      buyerAddress: details.address,
      buyerCity: details.city,
      items: items,
      totalAmount: totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setOrders([newOrder, ...orders]);
    handleClearCart();

    if (currentUser) {
      const { api } = await import('../lib/api');
      await api.createOrder(newOrder, items);
    }

    const notif: Notification = {
      id: `notif-${Date.now()}`,
      userId: currentUser?.id || 'user-buyer-1',
      title: 'Commande reçue',
      content: `Votre commande ${newOrder.id} a été enregistrée. Les artisans préparent vos colis !`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications([notif, ...notifications]);
  };

  const handleAddReview = (productId: string, review: Review) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        const updatedReviews = [review, ...p.reviews];
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const newRating = parseFloat((totalRating / updatedReviews.length).toFixed(1));
        return {
          ...p,
          reviews: updatedReviews,
          rating: newRating
        };
      }
      return p;
    });
    setProducts(updated);
  };

  const handleLoginSuccess = async (email: string, role: 'buyer' | 'seller' | 'admin') => {
    const { api } = await import('../lib/api');
    const realUser = await api.getCurrentUser();
    
    if (realUser && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co') {
      setCurrentUser(realUser);
      setActiveRole(realUser.role as any);
      if (realUser.role === 'buyer') {
        const favs = await api.getFavorites(realUser.id);
        if (favs.length > 0) setFavorites(favs);
      }
      
      if (realUser.role === 'buyer') {
        setCurrentView('dashboard');
        setCurrentSubView('home');
      } else if (realUser.role === 'seller') {
        setCurrentView('seller');
        setCurrentSubView('dashboard');
      } else if (realUser.role === 'admin') {
        setCurrentView('admin');
        setCurrentSubView('overview');
      }
      return;
    }

    const matchedUser = users.find(u => u.email === email) || {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: role,
      joinedAt: new Date().toISOString().split('T')[0],
      city: 'Niamey',
      address: '',
      phone: ''
    };
    
    // Add if new
    if (!users.some(u => u.email === email)) {
      setUsers([...users, matchedUser]);
    }

    setCurrentUser(matchedUser);
    setActiveRole(role);

    if (role === 'buyer') {
      setCurrentView('dashboard');
      setCurrentSubView('home');
    } else if (role === 'seller') {
      setCurrentView('seller');
      setCurrentSubView('dashboard');
    } else if (role === 'admin') {
      setCurrentView('admin');
      setCurrentSubView('overview');
    }
  };

  const handleLogout = async () => {
    try {
      const { api } = await import('../lib/api');
      await api.signOut();
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
    setActiveRole('visitor');
    setCurrentView('public');
    setCurrentSubView('landing');
  };

  const handleAddProduct = (pData: any) => {
    const newProd: Product = {
      ...pData,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviews: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProducts([newProd, ...products]);
  };

  const handleEditProduct = (p: Product) => {
    setProducts(products.map(item => item.id === p.id ? p : item));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(item => item.id !== productId));
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    
    // Notify buyer
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder) {
      const messages = {
        pending: 'est en attente de traitement.',
        processing: 'est en cours de préparation.',
        shipped: 'a été prise en charge par nos coursiers.',
        delivered: 'a été livrée en main propre. Profitez bien !',
        cancelled: 'a été annulée.'
      };
      const notif: Notification = {
        id: `notif-${Date.now()}`,
        userId: targetOrder.buyerId,
        title: `Commande mise à jour : ${status.toUpperCase()}`,
        content: `Votre commande ${orderId} ${messages[status]}`,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications([notif, ...notifications]);
    }
  };

  const handleUpdateSellerSettings = (settingsData: Partial<SellerProfile>) => {
    setSellers(sellers.map(s => s.id === 'seller-alaza' ? { ...s, ...settingsData } : s));
  };

  const handleApproveKYC = (subId: string) => {
    const target = kycSubmissions.find(sub => sub.id === subId);
    if (!target) return;

    setKycSubmissions(kycSubmissions.map(sub => sub.id === subId ? { ...sub, status: 'approved' } : sub));
    setSellers(sellers.map(s => s.id === target.sellerId ? { ...s, isVerified: true } : s));
    setProducts(products.map(p => p.sellerId === target.sellerId ? { ...p, sellerVerified: true } : p));
  };

  const handleRejectKYC = (subId: string) => {
    setKycSubmissions(kycSubmissions.map(sub => sub.id === subId ? { ...sub, status: 'rejected' } : sub));
  };

  const handleSendNewsletter = (subject: string, content: string) => {
    const newCamp: NewsletterCampaign = {
      id: `camp-${Date.now()}`,
      subject,
      content,
      recipientsCount: 450,
      sentAt: new Date().toISOString()
    };
    setCampaigns([newCamp, ...campaigns]);
  };

  const handleUpdateUser = (userData: Partial<User>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...userData };
      setCurrentUser(updated);
      setUsers(users.map(u => u.id === currentUser.id ? updated : u));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFAF7] font-sans" id="zando-premium-marketplace-app">
      
      {/* 2. Master Top Header (Inspired by Airbnb & Apple) */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm" id="zando-header">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          
          {/* Logo and Branding */}
          <div 
            onClick={() => handleNavigate('public', 'landing')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-display font-black text-sm shadow-md shadow-amber-900/10 active:scale-95 transition-transform">
              Z
            </div>
            <div className="space-y-0.5">
              <span className="text-sm font-bold font-display tracking-wider text-slate-900 group-hover:text-amber-600 transition-colors">ZANDO</span>
              <span className="block text-[8px] text-slate-400 font-mono tracking-widest uppercase">Niamey Premium</span>
            </div>
          </div>

          {/* Core Public Desktop Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button onClick={() => handleNavigate('public', 'landing')} className="hover:text-amber-600 transition-colors">Accueil</button>
            <button onClick={() => handleNavigate('public', 'marketplace')} className="hover:text-amber-600 transition-colors">Catalogue</button>
            <button onClick={() => handleNavigate('public', 'about')} className="hover:text-amber-600 transition-colors">À Propos</button>
            <button onClick={() => handleNavigate('public', 'faq')} className="hover:text-amber-600 transition-colors">Aide & FAQ</button>
            <button onClick={() => handleNavigate('public', 'contact')} className="hover:text-amber-600 transition-colors">Contact</button>
          </nav>

          {/* User actions and session info */}
          <div className="flex items-center gap-4">
            
            {/* Wishlist Icon with badge */}
            <button 
              onClick={() => handleNavigate('dashboard', 'favoris')}
              className="relative p-2 text-slate-400 hover:text-rose-500 rounded-full hover:bg-slate-50 transition-colors"
              title="Favoris"
            >
              <Heart className="w-4.5 h-4.5" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full font-mono scale-90">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Cart Icon with badge */}
            <button 
              onClick={() => handleNavigate('dashboard', 'panier')}
              className="relative p-2 text-slate-500 hover:text-amber-600 rounded-full hover:bg-slate-50 transition-colors"
              title="Panier"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded-full font-mono leading-none">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Quick dashboard shortcuts depending on role */}
            {currentUser ? (
              <div className="hidden md:flex items-center gap-3 border-l pl-4">
                <button 
                  onClick={() => {
                    if (currentUser.role === 'buyer') handleNavigate('dashboard', 'home');
                    if (currentUser.role === 'seller') handleNavigate('seller', 'dashboard');
                    if (currentUser.role === 'admin') handleNavigate('admin', 'overview');
                  }}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-semibold tracking-wider uppercase rounded-lg transition-colors flex items-center gap-1"
                >
                  Mon Espace <ChevronRight className="w-3 h-3" />
                </button>

                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  title="Se Déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => handleNavigate('auth', 'login')}
                className="hidden md:flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
              >
                <LogIn className="w-4 h-4" /> Espace Privé
              </button>
            )}

            {/* Mobile Burger Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl md:hidden transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Menu Panel & Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay to capture clicks and prevent underlying interactions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 md:hidden"
              id="zando-mobile-menu-backdrop"
            />
            {/* Premium Mobile Menu Drawer Panel */}
            <motion.div 
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-16 left-0 right-0 z-45 bg-white/98 backdrop-blur-md border-b border-slate-150 shadow-2xl p-6 space-y-4 text-xs font-semibold text-slate-700 flex flex-col max-h-[calc(100vh-4rem)] overflow-y-auto md:hidden"
              id="zando-mobile-menu-panel"
            >
              <button onClick={() => handleNavigate('public', 'landing')} className="text-left py-3 px-3 rounded-xl hover:bg-slate-50 hover:text-[#0066FF] transition-all">Accueil</button>
              <button onClick={() => handleNavigate('public', 'marketplace')} className="text-left py-3 px-3 rounded-xl hover:bg-slate-50 hover:text-[#0066FF] transition-all">Le Catalogue</button>
              <button onClick={() => handleNavigate('public', 'about')} className="text-left py-3 px-3 rounded-xl hover:bg-slate-50 hover:text-[#0066FF] transition-all">Notre Vision</button>
              <button onClick={() => handleNavigate('public', 'faq')} className="text-left py-3 px-3 rounded-xl hover:bg-slate-50 hover:text-[#0066FF] transition-all">Aide & FAQ</button>
              <button onClick={() => handleNavigate('public', 'contact')} className="text-left py-3 px-3 rounded-xl hover:bg-slate-50 hover:text-[#0066FF] transition-all">Contact</button>
              <hr className="border-slate-100" />
              {currentUser ? (
                <div className="space-y-2 pt-1">
                  <button 
                    onClick={() => {
                      if (currentUser.role === 'buyer') handleNavigate('dashboard', 'home');
                      if (currentUser.role === 'seller') handleNavigate('seller', 'dashboard');
                      if (currentUser.role === 'admin') handleNavigate('admin', 'overview');
                    }}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-center rounded-xl font-semibold transition-colors"
                  >
                    Accéder à Mon Espace ({currentUser.role.toUpperCase()})
                  </button>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full py-3 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-center rounded-xl font-bold transition-all">
                    Déconnexion
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handleNavigate('auth', 'login')}
                  className="w-full py-3 bg-[#0066FF] hover:bg-blue-600 text-white text-center rounded-xl font-bold transition-all shadow-md shadow-blue-500/10"
                >
                  Se connecter / S’inscrire
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. Primary Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6" id="zando-main-viewport">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentView}-${currentSubView}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {/* RENDER PUBLIC VIEWS */}
            {currentView === 'public' && (
              <PublicViews 
                currentSubView={currentSubView}
                selectedProductId={selectedProductId}
                selectedSellerId={selectedSellerId}
                products={products}
                sellers={sellers}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onAddToCart={handleAddToCart}
                onNavigate={handleNavigate}
                onAddReview={handleAddReview}
              />
            )}

            {/* RENDER AUTHENTICATION VIEWS */}
            {currentView === 'auth' && (
              <AuthViews 
                currentSubView={currentSubView}
                onNavigate={handleNavigate}
                onLoginSuccess={handleLoginSuccess}
              />
            )}

            {/* RENDER BUYER / USER DASHBOARD */}
            {currentView === 'dashboard' && (
              <UserDashboard 
                currentSubView={currentSubView}
                currentUser={currentUser}
                cart={cart}
                favorites={favorites}
                orders={orders}
                notifications={notifications}
                products={products}
                onUpdateUser={handleUpdateUser}
                onUpdateCartQty={handleUpdateCartQty}
                onRemoveFromCart={handleRemoveFromCart}
                onToggleFavorite={handleToggleFavorite}
                onClearCart={handleClearCart}
                onSubmitOrder={handleSubmitOrder}
                onNavigate={handleNavigate}
              />
            )}

            {/* RENDER SELLER AREA */}
            {currentView === 'seller' && (
              <SellerDashboard 
                currentSubView={currentSubView}
                sellerProfile={sellers.find(s => s.id === 'seller-alaza') || null}
                products={products}
                orders={orders}
                onAddProduct={handleAddProduct}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onUpdateSellerSettings={handleUpdateSellerSettings}
                onNavigate={handleNavigate}
              />
            )}

            {/* RENDER ADMIN AREA */}
            {currentView === 'admin' && (
              <AdminDashboard 
                currentSubView={currentSubView}
                products={products}
                sellers={sellers}
                orders={orders}
                kycSubmissions={kycSubmissions}
                campaigns={campaigns}
                users={users}
                onApproveKYC={handleApproveKYC}
                onRejectKYC={handleRejectKYC}
                onDeleteProduct={handleDeleteProduct}
                onSendNewsletter={handleSendNewsletter}
                onNavigate={handleNavigate}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. Footnote & SEO / GEO Metadata (Apple & Airbnb-inspired footer) */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 mt-16" id="zando-footer">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold font-display text-base">
                ZANDO
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Première marketplace de confiance et d’authenticité à Niamey, Niger. Nous certifions les vendeurs officiels pour éliminer la fraude commerciale.
              </p>
              <div className="pt-2 flex items-center gap-3 text-slate-400 text-xs">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-[10px]">Quartier Plateau, Niamey, Niger</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Boutiques Vérifiées</h4>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                <li className="hover:text-amber-400 transition-colors cursor-pointer" onClick={() => handleNavigate('public', 'shop', 'seller-alaza')}>Alaza Luxe (Mode)</li>
                <li className="hover:text-amber-400 transition-colors cursor-pointer" onClick={() => handleNavigate('public', 'shop', 'seller-sahel')}>Sahel Art & Design (Artisanat)</li>
                <li className="hover:text-amber-400 transition-colors cursor-pointer" onClick={() => handleNavigate('public', 'shop', 'seller-dounia')}>Dounia HighTech (Électronique)</li>
                <li className="hover:text-amber-400 transition-colors cursor-pointer" onClick={() => handleNavigate('public', 'shop', 'seller-nature')}>Sahel Bio & Soins (Beauté)</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Aide & Information</h4>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                <li className="hover:text-amber-400 transition-colors cursor-pointer" onClick={() => handleNavigate('public', 'faq')}>Centre d’aide / FAQ</li>
                <li className="hover:text-amber-400 transition-colors cursor-pointer" onClick={() => handleNavigate('public', 'contact')}>Contacter le Bureau</li>
                <li className="hover:text-amber-400 transition-colors cursor-pointer" onClick={() => handleNavigate('public', 'about')}>Notre Raison d’Être</li>
                <li className="hover:text-amber-400 transition-colors cursor-pointer">Conditions Générales</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">SEO & Indexation IA</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Zando est optimisé pour les moteurs de recherche géolocalisés et les engins de recherche IA (ChatGPT, Google Gemini AI, Perplexity). Toutes nos fiches produits et profils de vendeurs de Niamey respectent strictement les standards structurés Schema.org.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-[10px] text-slate-500 gap-4">
            <div>
              © 2026 Zando Niger. Tous droits réservés. Réalisation d’excellence mobile-first.
            </div>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">Mentions légales</a>
              <a href="#" className="hover:underline">Confidentialité</a>
              <a href="#" className="hover:underline">Sécurité RLS</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

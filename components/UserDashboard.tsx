'use client';
import Image from 'next/image';

import React, { useState } from 'react';
import { Product, CartItem, Order, User, Notification } from '../lib/types';
import { 
  ShoppingBag, Heart, Bell, Shield, MapPin, Phone, 
  Trash2, Plus, Minus, CreditCard, ChevronRight, CheckCircle2,
  Package, Calendar, Info, Settings, Clock
} from 'lucide-react';

interface UserDashboardProps {
  currentSubView: string;
  currentUser: User | null;
  cart: CartItem[];
  favorites: string[];
  orders: Order[];
  notifications: Notification[];
  products: Product[];
  onUpdateUser: (userData: Partial<User>) => void;
  onUpdateCartQty: (productId: string, qty: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onToggleFavorite: (productId: string) => void;
  onClearCart: () => void;
  onSubmitOrder: (orderDetails: { phone: string; address: string; city: string }) => void;
  onNavigate: (view: string, subView?: string) => void;
}

export default function UserDashboard({
  currentSubView,
  currentUser,
  cart,
  favorites,
  orders,
  notifications,
  products,
  onUpdateUser,
  onUpdateCartQty,
  onRemoveFromCart,
  onToggleFavorite,
  onClearCart,
  onSubmitOrder,
  onNavigate
}: UserDashboardProps) {
  // Profile Form States
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || 'Niamey');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Checkout states
  const [shippingPhone, setShippingPhone] = useState(currentUser?.phone || '');
  const [shippingAddress, setShippingAddress] = useState(currentUser?.address || '');
  const [shippingCity, setShippingCity] = useState(currentUser?.city || 'Niamey');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'momo'>('cod');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Cart math
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = cartSubtotal > 0 ? 2000 : 0; // 2,000 CFA Niamey Delivery
  const cartTotal = cartSubtotal + deliveryFee;

  // Find favorite products
  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ phone, city, address });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingPhone || !shippingAddress) return;

    // Call store order handler
    onSubmitOrder({
      phone: shippingPhone,
      address: shippingAddress,
      city: shippingCity
    });

    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutSuccess(false);
      onNavigate('dashboard', 'orders');
    }, 2500);
  };

  const getOrderStatusBadge = (status: Order['status']) => {
    const configs = {
      pending: { label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      processing: { label: 'En préparation', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      shipped: { label: 'En cours de livraison', color: 'bg-teal-50 text-teal-700 border-teal-200' },
      delivered: { label: 'Livré', color: 'bg-green-50 text-green-700 border-green-200' },
      cancelled: { label: 'Annulé', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    };
    const c = configs[status];
    return <span className={`px-2 py-0.5 text-[9px] font-semibold border rounded-md uppercase tracking-wider ${c.color}`}>{c.label}</span>;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-4">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-500 font-display font-bold flex items-center justify-center text-sm shadow-sm uppercase relative">
              {currentUser?.name.substring(0, 2) || 'US'}
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-900">{currentUser?.name}</div>
              <span className="text-[10px] text-slate-400 font-mono">{currentUser?.email}</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5 text-xs text-slate-600">
            <button 
              onClick={() => onNavigate('dashboard', 'home')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-all ${
                currentSubView === 'home' ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4 relative" /> Accueil Acheteur
            </button>
            <button 
              onClick={() => onNavigate('dashboard', 'panier')}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-all ${
                currentSubView === 'panier' ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2.5"><ShoppingBag className="w-4 h-4 relative" /> Mon Panier</span>
              {cart.length > 0 && <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">{cart.length}</span>}
            </button>
            <button 
              onClick={() => onNavigate('dashboard', 'favoris')}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-all ${
                currentSubView === 'favoris' ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2.5"><Heart className="w-4 h-4 relative" /> Favoris</span>
              {favorites.length > 0 && <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">{favorites.length}</span>}
            </button>
            <button 
              onClick={() => onNavigate('dashboard', 'orders')}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-all ${
                currentSubView === 'orders' ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2.5"><Clock className="w-4 h-4 relative" /> Commandes</span>
              {orders.length > 0 && <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">{orders.length}</span>}
            </button>
            <button 
              onClick={() => onNavigate('dashboard', 'notifications')}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-all ${
                currentSubView === 'notifications' ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2.5"><Bell className="w-4 h-4 relative" /> Notifications</span>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
            <button 
              onClick={() => onNavigate('dashboard', 'profile')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-all ${
                currentSubView === 'profile' ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4 relative" /> Paramètres Profil
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* VIEW: HOME OVERVIEW */}
        {currentSubView === 'home' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl space-y-3 relative overflow-hidden shadow-md">
              <div className="absolute right-4 bottom-0 w-24 h-24 opacity-10 bg-no-repeat bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/n/300/300')" }}></div>
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Compte Acheteur Premium</span>
              <h2 className="text-xl md:text-2xl font-display font-medium">Bonjour, {currentUser?.name} !</h2>
              <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                Bienvenue dans votre tableau de bord. Suivez vos commandes en cours à Niamey, visualisez vos produits sauvegardés et modifiez vos options de livraison.
              </p>
            </div>

            {/* Overview Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
                <div className="text-lg font-mono font-bold text-slate-900">{orders.length}</div>
                <div className="text-[9px] text-slate-400 uppercase">Commandes Passées</div>
              </div>
              <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
                <div className="text-lg font-mono font-bold text-amber-600">{favorites.length}</div>
                <div className="text-[9px] text-slate-400 uppercase">Sauvegardés</div>
              </div>
              <div className="bg-white p-4 rounded-xl border shadow-sm text-center">
                <div className="text-lg font-mono font-bold text-indigo-600">{cart.length}</div>
                <div className="text-[9px] text-slate-400 uppercase">Articles Panier</div>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Activité Récente</h3>
              {orders.length > 0 ? (
                <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
                  {orders.slice(0, 1).map((order) => (
                    <div key={order.id} className="p-4 space-y-4">
                      <div className="flex items-center justify-between text-xs pb-3 border-b">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 font-mono">ID: #{order.id}</span>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(order.createdAt).toLocaleDateString()}</div>
                        </div>
                        {getOrderStatusBadge(order.status)}
                      </div>

                      <div className="flex items-center gap-3">
                        <Image src={order.items[0]?.image || ''} alt={"preview"} fill referrerPolicy="no-referrer" sizes="100px" className="w-10 h-10 object-cover rounded-lg border relative" />
                        <div className="text-xs">
                          <div className="font-semibold text-slate-800">{order.items[0]?.productName}</div>
                          <span className="text-slate-400">{order.items.length} article(s) • Total : <strong className="font-mono text-slate-800">{order.totalAmount.toLocaleString()} FCFA</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="bg-slate-50 px-4 py-2.5 border-t text-right">
                    <button onClick={() => onNavigate('dashboard', 'orders')} className="text-[10px] font-bold text-amber-600 hover:text-amber-700 uppercase flex items-center gap-1 ml-auto">
                      Voir toutes mes commandes <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 border border-dashed rounded-2xl text-xs text-slate-400">
                  Aucune commande pour le moment.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: MON PANIER */}
        {currentSubView === 'panier' && (
          <div className="space-y-6">
            <h2 className="text-lg font-display font-semibold text-slate-900 border-b pb-2">Mon Panier d’Achat</h2>

            {checkoutSuccess ? (
              <div className="bg-green-50 p-6 rounded-2xl text-center space-y-3 border border-green-100">
                <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto animate-bounce relative" />
                <h3 className="text-sm font-bold text-green-900">Achat validé avec succès !</h3>
                <p className="text-xs text-green-700 leading-relaxed max-w-sm mx-auto">
                  Votre commande a été transmise aux vendeurs concernés. Vous allez être redirigé vers le suivi d’expédition. Merci de votre confiance !
                </p>
              </div>
            ) : cart.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                
                {/* Cart Items List */}
                <div className="md:col-span-2 space-y-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4 justify-between">
                      <div className="flex items-center gap-3">
                        <Image src={item.product.images[0]} alt={item.product.name} fill referrerPolicy="no-referrer" sizes="100px" className="w-12 h-12 object-cover rounded-lg border relative" />
                        <div className="text-xs">
                          <h4 className="font-semibold text-slate-900 line-clamp-1">{item.product.name}</h4>
                          <span className="text-slate-400">Vendeur : {item.product.sellerName}</span>
                          <div className="font-mono font-bold text-slate-800 mt-0.5">{item.product.price.toLocaleString()} FCFA</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <button 
                            onClick={() => onUpdateCartQty(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-slate-100 text-slate-600"
                          >
                            <Minus className="w-3 h-3 relative" />
                          </button>
                          <span className="px-2 font-mono text-[11px] font-semibold text-slate-800">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateCartQty(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-slate-100 text-slate-600"
                          >
                            <Plus className="w-3 h-3 relative" />
                          </button>
                        </div>

                        <button 
                          onClick={() => onRemoveFromCart(item.product.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 relative" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={onClearCart}
                    className="text-xs text-slate-400 hover:text-red-500 font-semibold uppercase flex items-center gap-1.5"
                  >
                    Vider entièrement le panier
                  </button>
                </div>

                {/* Checkout Summary & Delivery Form (Stripe/Apple Style Checkout) */}
                <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider border-b pb-2">Récapitulatif de la commande</h3>
                  
                  <div className="space-y-2 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span className="font-mono text-slate-800 font-semibold">{cartSubtotal.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Livraison sécurisée (Niamey)</span>
                      <span className="font-mono text-slate-800 font-semibold">{deliveryFee.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 text-sm font-bold text-slate-900">
                      <span>Total final</span>
                      <span className="font-mono text-amber-600">{cartTotal.toLocaleString()} FCFA</span>
                    </div>
                  </div>

                  {/* Shipping Form */}
                  <form onSubmit={handleCheckoutSubmit} className="space-y-3 pt-3 border-t">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Adresse & Livraison</h4>
                    <div>
                      <label className="block text-[9px] text-slate-400 uppercase mb-0.5">Téléphone d’expédition</label>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <input 
                          type="text" 
                          required
                          value={shippingPhone}
                          onChange={(e) => setShippingPhone(e.target.value)}
                          placeholder="+227 96 00 11 22"
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-400 uppercase mb-0.5">Quartier & Rue d’acheminement</label>
                      <div className="relative">
                        <MapPin className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <input 
                          type="text" 
                          required
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder="Plateau, Rue du Grand Canal"
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-400 uppercase mb-0.5">Mode de règlement</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className={`py-1.5 rounded-lg border text-[10px] font-bold ${
                            paymentMethod === 'cod' 
                              ? 'bg-amber-50 border-amber-200 text-amber-700' 
                              : 'bg-slate-50 text-slate-600'
                          }`}
                        >
                          À la livraison
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('momo')}
                          className={`py-1.5 rounded-lg border text-[10px] font-bold ${
                            paymentMethod === 'momo' 
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                              : 'bg-slate-50 text-slate-600'
                          }`}
                        >
                          Mobile Money
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                    >
                      Confirmer et Payer <CreditCard className="w-4 h-4 relative" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed">
                <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-3 relative" />
                <h3 className="text-xs font-semibold text-slate-800">Votre panier est vide</h3>
                <p className="text-[11px] text-slate-400 mt-1">Explorez le catalogue Zando pour y ajouter des articles d’exception.</p>
                <button 
                  onClick={() => onNavigate('public', 'marketplace')}
                  className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold uppercase"
                >
                  Découvrir les produits
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW: FAVORIS / WISHLIST */}
        {currentSubView === 'favoris' && (
          <div className="space-y-6">
            <h2 className="text-lg font-display font-semibold text-slate-900 border-b pb-2">Mes Produits Coups de Cœur</h2>

            {favoriteProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoriteProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl border p-3 flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-3">
                      <Image src={product.images[0]} alt={product.name} fill referrerPolicy="no-referrer" sizes="100px" className="w-12 h-12 object-cover rounded-lg relative" />
                      <div className="text-xs">
                        <h4 className="font-semibold text-slate-900 line-clamp-1">{product.name}</h4>
                        <span className="text-slate-400">Par {product.sellerName}</span>
                        <div className="font-mono text-[11px] font-bold text-slate-800 mt-0.5">{product.price.toLocaleString()} FCFA</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => onNavigate('public', `product:${product.id}`)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 text-[10px] font-bold"
                      >
                        Voir
                      </button>
                      <button 
                        onClick={() => onToggleFavorite(product.id)}
                        className="p-1.5 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg"
                      >
                        <Heart className="w-4 h-4 fill-current relative" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed text-slate-400 text-xs">
                Aucun produit sauvegardé pour le moment.
              </div>
            )}
          </div>
        )}

        {/* VIEW: COMMANDES / ORDERS HISTORY */}
        {currentSubView === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-lg font-display font-semibold text-slate-900 border-b pb-2">Historique de mes commandes</h2>

            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl border shadow-sm p-4 space-y-4">
                    <div className="flex items-center justify-between text-xs pb-3 border-b">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 font-mono">CODE COMMANDE: #{order.id}</span>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Passée le : {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {getOrderStatusBadge(order.status)}
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Image src={item.image} alt={item.productName} fill referrerPolicy="no-referrer" sizes="100px" className="w-10 h-10 object-cover rounded-lg border relative" />
                            <div className="text-xs">
                              <h4 className="font-semibold text-slate-800 line-clamp-1">{item.productName}</h4>
                              <span className="text-slate-400 font-mono">Quantité : {item.quantity} • Vendu par : {item.sellerId}</span>
                            </div>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-700">{(item.price * item.quantity).toLocaleString()} FCFA</span>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer summary */}
                    <div className="pt-3 border-t flex items-center justify-between bg-slate-50/50 -mx-4 -mb-4 p-4 rounded-b-xl">
                      <div className="text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-600">Lieu de livraison :</span> {order.buyerAddress}, {order.buyerCity}
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-900">Total : {order.totalAmount.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed text-slate-400 text-xs">
                Vous n’avez fait aucun achat pour l’instant.
              </div>
            )}
          </div>
        )}

        {/* VIEW: NOTIFICATIONS */}
        {currentSubView === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-lg font-display font-semibold text-slate-900 border-b pb-2">Mes Notifications</h2>

            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-4 rounded-xl border flex gap-3 justify-between items-start transition-all ${
                    notif.isRead ? 'bg-white border-slate-100 text-slate-600' : 'bg-amber-50/40 border-amber-100 text-slate-800 shadow-sm'
                  }`}>
                    <div className="space-y-1">
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        {!notif.isRead && <span className="w-2 h-2 bg-amber-500 rounded-full shrink-0 relative" />}
                        {notif.title}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{notif.content}</p>
                      <span className="block text-[9px] text-slate-400 font-mono">{new Date(notif.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed text-slate-400 text-xs">
                Aucune notification en attente.
              </div>
            )}
          </div>
        )}

        {/* VIEW: PROFILE & SETTINGS */}
        {currentSubView === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-lg font-display font-semibold text-slate-900 border-b pb-2">Paramètres de Profil d’Élite</h2>

            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              {profileSuccess && (
                <div className="p-3 bg-green-50 text-green-700 rounded-xl text-xs font-semibold">
                  ✓ Profil sauvegardé avec succès ! Les données ont été synchronisées.
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Nom complet (Non-modifiable)</label>
                    <input 
                      type="text" 
                      disabled
                      value={currentUser?.name}
                      className="w-full px-3 py-2 bg-slate-100 border rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Adresse email (Non-modifiable)</label>
                    <input 
                      type="text" 
                      disabled
                      value={currentUser?.email}
                      className="w-full px-3 py-2 bg-slate-100 border rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Téléphone de contact</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+227 96 00 11 22"
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Ville de résidence</label>
                    <select 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none"
                    >
                      <option value="Niamey">Niamey (Niger)</option>
                      <option value="Maradi">Maradi</option>
                      <option value="Zinder">Zinder</option>
                      <option value="Agadez">Agadez</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Adresse physique (Quartier/Rue)</label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Quartier Plateau, Avenue des Grandes Portes"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:bg-white"
                  />
                </div>

                <button 
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase transition-colors"
                >
                  Enregistrer les modifications
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

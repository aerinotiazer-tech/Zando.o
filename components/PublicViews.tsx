'use client';
import Image from 'next/image';

import React, { useState } from 'react';
import { Product, SellerProfile, Review } from '../lib/types';
import { 
  Search, SlidersHorizontal, CheckCircle2, Star, ShoppingBag, 
  ArrowRight, Heart, Share2, ShieldCheck, Mail, MapPin, 
  Phone, Globe, MessageSquare, Plus, Minus, ArrowLeft, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PublicViewsProps {
  currentSubView: string;
  selectedProductId: string | null;
  selectedSellerId: string | null;
  products: Product[];
  sellers: SellerProfile[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onNavigate: (view: string, subView?: string, payload?: any) => void;
  onAddReview: (productId: string, review: Review) => void;
}

export default function PublicViews({
  currentSubView,
  selectedProductId,
  selectedSellerId,
  products,
  sellers,
  favorites,
  onToggleFavorite,
  onAddToCart,
  onNavigate,
  onAddReview
}: PublicViewsProps) {
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');
  
  // Product Detail Tab and Quantity State
  const [productQty, setProductQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  
  // Contact State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  // Filter products based on search and selected tags
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || product.category === selectedCategory;
    const matchesVerified = !onlyVerified || product.sellerVerified;
    return matchesSearch && matchesCategory && matchesVerified;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // default (creation or initial)
  });

  const categories = ['Tous', 'Mode & Luxe', 'Électronique & High-Tech', "Artisanat d'Art du Niger", 'Beauté, Cosmétiques & Soins'];

  // Product detailed data
  const currentProduct = products.find(p => p.id === selectedProductId);
  const currentSeller = sellers.find(s => s.id === selectedSellerId || s.id === currentProduct?.sellerId);

  // Submit product review
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName || !newReviewComment || !currentProduct) return;
    
    // We will generate a review ID using a safe timestamp, which is pure when done inside the event handler
    const timestamp = Date.now();
    const newRev: Review = {
      id: `rev-${timestamp}`,
      userName: newReviewName,
      rating: newReviewRating,
      comment: newReviewComment,
      date: new Date().toISOString().split('T')[0]
    };

    onAddReview(currentProduct.id, newRev);

    setReviewSuccess(true);
    setNewReviewName('');
    setNewReviewComment('');
    setNewReviewRating(5);
    setTimeout(() => setReviewSuccess(false), 4000);
  };

  // Submit contact message
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;
    setContactSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactMsg('');
    setTimeout(() => setContactSuccess(false), 5000);
  };

  return (
    <div className="py-6 space-y-12">
      {/* LANDING PAGE / HERO VIEW */}
      {currentSubView === 'landing' && (
        <div className="space-y-16">
          {/* Elegant Hero Banner inspired by the Launch Video */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white min-h-[520px] flex items-center p-8 md:p-16 shadow-xl border border-slate-900">
            {/* Ambient Background & Overlay with picsum or rich textures */}
            <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: "url('https://picsum.photos/seed/nigerianart/1920/1080')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent z-0"></div>
            
            {/* Visual Launch Video Elements: Royal Blue Curve & Accent line */}
            <svg className="absolute right-0 bottom-0 top-0 h-full w-full pointer-events-none z-0 hidden md:block" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M450 0C600 150 550 350 800 500" stroke="#0066FF" strokeWidth="8" strokeLinecap="round" className="opacity-80" />
              <path d="M500 -50C620 100 590 280 850 420" stroke="#0066FF" strokeWidth="2.5" strokeDasharray="6 6" className="opacity-60" />
              <circle cx="650" cy="220" r="10" fill="#0066FF" className="animate-pulse" />
              <circle cx="580" cy="120" r="4" fill="#F59E0B" />
            </svg>

            {/* Subtle decorative Barcode matching the video in the top-right corner */}
            <div className="absolute top-6 right-8 hidden md:flex flex-col items-end opacity-40 select-none">
              <div className="flex gap-0.5">
                <span className="w-1.5 h-10 bg-white rounded-sm"></span>
                <span className="w-0.5 h-10 bg-white rounded-sm"></span>
                <span className="w-2 h-10 bg-white rounded-sm"></span>
                <span className="w-0.5 h-10 bg-white rounded-sm"></span>
                <span className="w-1.5 h-10 bg-white rounded-sm"></span>
                <span className="w-1 h-10 bg-white rounded-sm"></span>
                <span className="w-3 h-10 bg-white rounded-sm"></span>
                <span className="w-0.5 h-10 bg-white rounded-sm"></span>
                <span className="w-2 h-10 bg-white rounded-sm"></span>
              </div>
              <span className="text-[7px] tracking-[0.25em] text-white/70 font-mono mt-1 font-semibold">ZANDO CERTIFIED</span>
            </div>

            <div className="relative z-10 max-w-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#0066FF]/20 text-[#0066FF] border border-[#0066FF]/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> Vendeurs Vérifiés
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Mode • Tech • Beauté
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium leading-tight tracking-tight text-white">
                L’alliance de l’authenticité locale et de la technologie.
              </h1>
              
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-md font-medium">
                Zando connecte les acheteurs exigeants aux meilleurs créateurs, artisans d’art et boutiques d’élite à Niamey. Conçu avec rigueur, élégance et une sécurité certifiée.
              </p>

              {/* Video Slogans Block */}
              <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 max-w-md space-y-1">
                <p className="text-[10px] uppercase font-black tracking-widest text-[#0066FF]">Notre Engagement d’Excellence :</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-200 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#0066FF] rounded-full"></span> Des vendeurs vérifiés
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Des prix transparents
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#0066FF] rounded-full"></span> Achète en confiance
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Livraison rapide sous 24h
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <button 
                  onClick={() => onNavigate('public', 'marketplace')}
                  className="px-6 py-3.5 bg-[#0066FF] hover:bg-blue-600 active:scale-[0.98] transition-all rounded-xl font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-[#0066FF]/30"
                >
                  Découvrir le catalogue <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onNavigate('public', 'faq')}
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/10 active:scale-[0.98] transition-all rounded-xl font-bold text-xs tracking-wider uppercase"
                >
                  En savoir plus
                </button>
              </div>
            </div>
          </div>

          {/* Core Guarantees: Apple / Stripe / Video Slogans Inspiration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:border-[#0066FF]/30 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#0066FF]/5 text-[#0066FF] flex items-center justify-center border border-[#0066FF]/10">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Boutiques Vérifiées (KYC)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Chaque vendeur de Niamey fait l’objet d’un audit physique et d’identité stricte. Pas d’imitation, pas d’arnaque.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:border-[#0066FF]/30 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Des Prix Transparents</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Les prix sont affichés clairement sans frais cachés. Réglez à la livraison ou par virement Mobile Money en toute sécurité.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:border-[#0066FF]/30 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Commande Facile & Livraison Rapide</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Commandez en un clic et faites-vous livrer chez vous ou au bureau par nos coursiers agréés sous 24h à Niamey.
              </p>
            </div>
          </div>

          {/* Curated Sellers Showcase */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <h2 className="text-xl font-display font-medium text-slate-900">Boutiques à la Une</h2>
                <p className="text-xs text-slate-500">Les adresses de confiance de Niamey recommandées par Zando.</p>
              </div>
              <button 
                onClick={() => onNavigate('public', 'marketplace')}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
              >
                Tout explorer <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sellers.slice(0, 4).map((seller) => (
                <div 
                  key={seller.id}
                  onClick={() => onNavigate('public', 'shop', seller.id)}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-200 transition-all cursor-pointer"
                >
                  <div className="h-28 bg-slate-100 relative overflow-hidden">
                    <Image src={seller.banner} alt={seller.name} fill referrerPolicy="no-referrer" sizes="(max-width: 768px) 100vw, 33vw" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">{seller.name}</h4>
                        {seller.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 fill-amber-50" />}
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed min-h-[32px]">
                        {seller.description}
                      </p>
                      
                      <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {seller.city}</span>
                        <span className="font-semibold text-amber-600 flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {seller.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Handpicked Products / Bestsellers */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <h2 className="text-xl font-display font-medium text-slate-900">Produits Vedettes</h2>
                <p className="text-xs text-slate-500">Une sélection rigoureuse d’articles premium disponibles immédiatement.</p>
              </div>
              <button 
                onClick={() => onNavigate('public', 'marketplace')}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
              >
                Voir le catalogue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(0, 3).map((product) => (
                <div 
                  key={product.id}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-200 transition-all flex flex-col"
                >
                  <div className="relative aspect-square bg-slate-50 overflow-hidden cursor-pointer" onClick={() => onNavigate('public', 'product', product.id)}>
                    <Image src={product.images[0]} alt={product.name} fill referrerPolicy="no-referrer" sizes="(max-width: 768px) 100vw, 33vw" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id); }}
                        className={`p-2 rounded-full border shadow-sm backdrop-blur-sm transition-all active:scale-90 ${
                          favorites.includes(product.id) 
                            ? 'bg-rose-50 border-rose-100 text-rose-500' 
                            : 'bg-white/90 hover:bg-white border-slate-100 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                    {product.stock <= 3 && (
                      <span className="absolute bottom-3 left-3 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Reste {product.stock} pièces
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-3 flex flex-col flex-1 justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{product.category}</span>
                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {product.rating}</span>
                      </div>
                      <h4 
                        onClick={() => onNavigate('public', 'product', product.id)}
                        className="text-xs font-semibold text-slate-950 hover:text-amber-600 transition-colors line-clamp-1 cursor-pointer"
                      >
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed min-h-[30px]">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{product.price.toLocaleString()} FCFA</span>
                      <button 
                        onClick={() => onAddToCart(product)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-medium tracking-wide uppercase rounded-lg active:scale-[0.97] transition-all flex items-center gap-1"
                      >
                        Prendre <ShoppingBag className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MARKETPLACE / CATALOGUE VIEW */}
      {currentSubView === 'marketplace' && (
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-display font-semibold text-slate-900">Le Catalogue Zando</h1>
            <p className="text-xs text-slate-500">Explorez les produits d’exception de nos artisans et revendeurs certifiés.</p>
          </div>

          {/* Search, Filter & Sort Box */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Que recherchez-vous ? (ex: Bazin, Collier, iPhone...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select 
                  value={sortBy} 
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="default">Tri par défaut</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="rating">Mieux notés</option>
                </select>

                <button 
                  onClick={() => setOnlyVerified(!onlyVerified)}
                  className={`px-3 py-2 rounded-xl text-xs border transition-all flex items-center gap-1.5 ${
                    onlyVerified 
                      ? 'bg-amber-50 border-amber-200 text-amber-700' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Vendeurs Vérifiés
                </button>
              </div>
            </div>

            {/* Category Tags */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-medium tracking-wide whitespace-nowrap transition-all ${
                    selectedCategory === cat 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <div 
                  key={product.id}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-200 transition-all flex flex-col"
                >
                  <div className="relative aspect-square bg-slate-50 overflow-hidden cursor-pointer" onClick={() => onNavigate('public', 'product', product.id)}>
                    <Image src={product.images[0]} alt={product.name} fill referrerPolicy="no-referrer" sizes="(max-width: 768px) 100vw, 33vw" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                    <div className="absolute top-3 right-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id); }}
                        className={`p-2 rounded-full border shadow-sm backdrop-blur-sm transition-all active:scale-90 ${
                          favorites.includes(product.id) 
                            ? 'bg-rose-50 border-rose-100 text-rose-500' 
                            : 'bg-white/90 hover:bg-white border-slate-100 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                    {product.stock <= 3 && (
                      <span className="absolute bottom-3 left-3 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Stock limité ({product.stock})
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-3 flex flex-col flex-1 justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{product.category}</span>
                        <span className="flex items-center gap-0.5"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {product.rating}</span>
                      </div>
                      <h4 
                        onClick={() => onNavigate('public', 'product', product.id)}
                        className="text-xs font-semibold text-slate-950 hover:text-amber-600 transition-colors line-clamp-1 cursor-pointer"
                      >
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed min-h-[30px]">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{product.price.toLocaleString()} FCFA</span>
                      <button 
                        onClick={() => onAddToCart(product)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-medium tracking-wide uppercase rounded-lg active:scale-[0.97] transition-all flex items-center gap-1"
                      >
                        Prendre <ShoppingBag className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">Aucun produit trouvé</h3>
              <p className="text-xs text-slate-400 mt-1">Essayez de modifier vos termes de recherche ou vos filtres.</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('Tous'); setOnlyVerified(false); }}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-semibold text-slate-700"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      )}

      {/* PRODUCT DETAILS VIEW (PDP) */}
      {currentSubView === 'product' && currentProduct && (
        <div className="space-y-8">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org/',
                '@type': 'Product',
                name: currentProduct.name,
                image: currentProduct.images,
                description: currentProduct.description,
                brand: {
                  '@type': 'Brand',
                  name: currentProduct.sellerName
                },
                offers: {
                  '@type': 'Offer',
                  url: 'https://zando.ne/?view=product&id=' + currentProduct.id,
                  priceCurrency: 'XOF',
                  price: currentProduct.price,
                  itemCondition: 'https://schema.org/NewCondition',
                  availability: currentProduct.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
                }
              })
            }}
          />
          <button 
            onClick={() => onNavigate('public', 'marketplace')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Retour au catalogue
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            {/* Gallery Section */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                <Image src={currentProduct.images[0]} alt={currentProduct.name} fill referrerPolicy="no-referrer" sizes="(max-width: 768px) 100vw, 50vw" className="w-full h-full object-cover" />
              </div>
              {currentProduct.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {currentProduct.images.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-200 cursor-pointer hover:opacity-80">
                      <Image src={img} alt={`Preview ${idx}`} fill referrerPolicy="no-referrer" sizes="25vw" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-semibold tracking-wide uppercase">{currentProduct.category}</span>
                  <span className="text-slate-400 font-mono">ID: {currentProduct.id}</span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-xl md:text-2xl font-display font-semibold text-slate-950 leading-tight">{currentProduct.name}</h1>
                  
                  {/* Seller Reassurance block */}
                  {currentSeller && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border">
                        <Image src={currentSeller.logo} alt={currentSeller.name} fill referrerPolicy="no-referrer" sizes="100px" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-xs">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-slate-800 hover:underline cursor-pointer" onClick={() => onNavigate('public', 'shop', currentSeller.id)}>
                            {currentSeller.name}
                          </span>
                          {currentSeller.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 fill-amber-50" />}
                        </div>
                        <span className="text-[10px] text-slate-400">Vendeur Premium Niamey • ⭐ {currentSeller.rating} ({currentSeller.reviewCount} avis)</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(currentProduct.rating) ? 'fill-current' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-slate-800">{currentProduct.rating}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs text-slate-500">{currentProduct.reviews.length} évaluations d’acheteurs</span>
                </div>

                <div className="py-3 border-y border-slate-100">
                  <span className="text-2xl font-mono font-bold text-slate-900">{currentProduct.price.toLocaleString()} FCFA</span>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                    <span className={`w-2 h-2 rounded-full ${currentProduct.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-slate-500">{currentProduct.stock > 0 ? `En stock (uniquement ${currentProduct.stock} exemplaires restants)` : 'Rupture temporaire'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentProduct.description}
                </p>
              </div>

              {/* Purchase CTA */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button 
                      onClick={() => setProductQty(Math.max(1, productQty - 1))}
                      className="p-2.5 hover:bg-slate-100 active:bg-slate-200 text-slate-600 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 font-mono text-xs font-semibold text-slate-800">{productQty}</span>
                    <button 
                      onClick={() => setProductQty(Math.min(currentProduct.stock, productQty + 1))}
                      className="p-2.5 hover:bg-slate-100 active:bg-slate-200 text-slate-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button 
                    onClick={() => { onAddToCart(currentProduct, productQty); setProductQty(1); }}
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    Ajouter au Panier <ShoppingBag className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => onToggleFavorite(currentProduct.id)}
                    className={`p-3 rounded-xl border transition-colors ${
                      favorites.includes(currentProduct.id) 
                        ? 'bg-rose-50 border-rose-100 text-rose-500' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3 text-[10px] text-slate-500">
                  <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-700">Sceau de Confiance Zando :</span> Paiement sécurisé, conformité produit vérifiée sous 48h, service de livraison officiel.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details / Reviews Tabs */}
          <div className="space-y-4">
            <div className="flex border-b border-slate-200 gap-6">
              <button 
                onClick={() => setActiveTab('details')}
                className={`py-3 text-xs font-bold relative transition-colors ${
                  activeTab === 'details' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Spécifications & Origine
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`py-3 text-xs font-bold relative transition-colors ${
                  activeTab === 'reviews' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Avis Vérifiés ({currentProduct.reviews.length})
              </button>
            </div>

            {activeTab === 'details' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-xs text-slate-600 leading-relaxed">
                <p>
                  Ce produit est issu du circuit sélectif de <span className="font-semibold text-slate-800">{currentProduct.sellerName}</span> à Niamey. Chaque lot fait l’objet d’une certification de provenance pour éviter les imitations et soutenir l’authenticité locale.
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-md pt-2">
                  <div className="border-l-2 border-slate-100 pl-3">
                    <div className="text-[10px] text-slate-400 uppercase">Provenance</div>
                    <div className="font-semibold text-slate-800">Niamey, Niger</div>
                  </div>
                  <div className="border-l-2 border-slate-100 pl-3">
                    <div className="text-[10px] text-slate-400 uppercase">Garantie Authenticité</div>
                    <div className="font-semibold text-slate-800">100% Certifié Zando</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Submit review */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-4">
                  <h4 className="text-xs font-bold text-slate-900">Publier une évaluation</h4>
                  {reviewSuccess ? (
                    <div className="p-3 bg-green-50 text-green-700 rounded-xl text-xs space-y-1">
                      <div className="font-semibold">Avis enregistré !</div>
                      <p className="text-[10px]">Votre note a été ajoutée et la note globale a été mise à jour.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Votre Nom complet</label>
                        <input 
                          type="text" 
                          required
                          value={newReviewName}
                          onChange={(e) => setNewReviewName(e.target.value)}
                          placeholder="Fatimata Cissé"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Note (1-5)</label>
                        <select 
                          value={newReviewRating}
                          onChange={(e) => setNewReviewRating(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-mono"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (Excellent)</option>
                          <option value={4}>⭐⭐⭐⭐ (Très bon)</option>
                          <option value={3}>⭐⭐⭐ (Moyen)</option>
                          <option value={2}>⭐⭐ (Insuffisant)</option>
                          <option value={1}>⭐ (Mauvais)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase mb-1">Commentaire</label>
                        <textarea 
                          rows={3}
                          required
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          placeholder="Partagez votre expérience avec ce produit..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none resize-none"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold uppercase flex items-center justify-center gap-1.5"
                      >
                        Enregistrer l’avis <Send className="w-3 h-3" />
                      </button>
                    </form>
                  )}
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-4">
                  {currentProduct.reviews.length > 0 ? (
                    currentProduct.reviews.map((rev) => (
                      <div key={rev.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-xs text-slate-800">{rev.userName}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{rev.date}</span>
                        </div>
                        <div className="flex items-center text-amber-500 gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 italic">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-white rounded-2xl border border-dashed text-slate-400 text-xs">
                      <MessageSquare className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                      Aucune évaluation pour le moment. Soyez le premier à donner votre avis !
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SELLER PROFILE / BOUTIQUE VIEW */}
      {currentSubView === 'shop' && currentSeller && (
        <div className="space-y-8">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'LocalBusiness',
                name: currentSeller.name,
                image: currentSeller.logo,
                description: currentSeller.description,
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: currentSeller.city,
                  addressCountry: 'NE'
                },
                url: 'https://zando.ne/?view=shop&id=' + currentSeller.id
              })
            }}
          />
          <button 
            onClick={() => onNavigate('public', 'landing')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à l’accueil
          </button>

          {/* Seller Banner Header */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white min-h-[220px] flex items-end p-6 md:p-8">
            <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url('${currentSeller.banner}')` }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-end w-full justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl border-4 border-white bg-white overflow-hidden shadow-md shrink-0">
                  <Image src={currentSeller.logo} alt={currentSeller.name} fill referrerPolicy="no-referrer" sizes="100px" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-xl font-display font-semibold text-white">{currentSeller.name}</h1>
                    {currentSeller.isVerified && <CheckCircle2 className="w-4.5 h-4.5 text-amber-500 fill-amber-50" />}
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 max-w-xl">{currentSeller.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs font-mono bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <div className="text-center">
                  <div className="text-amber-400 font-bold">⭐ {currentSeller.rating}</div>
                  <div className="text-[9px] text-slate-300">Note Globale</div>
                </div>
                <div className="w-[1px] bg-white/15 h-8"></div>
                <div className="text-center">
                  <div className="text-white font-bold">{currentSeller.reviewCount}</div>
                  <div className="text-[9px] text-slate-300">Avis Clients</div>
                </div>
                <div className="w-[1px] bg-white/15 h-8"></div>
                <div className="text-center">
                  <div className="text-emerald-400 font-bold">Active</div>
                  <div className="text-[9px] text-slate-300">Boutique</div>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Metadata Detail */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-1 text-xs">
              <div className="text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Siège Local</div>
              <div className="font-semibold text-slate-800">{currentSeller.address}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-1 text-xs">
              <div className="text-slate-400 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Téléphone Officiel</div>
              <div className="font-semibold text-slate-800">{currentSeller.phone}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-1 text-xs">
              <div className="text-slate-400 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Statut Certification</div>
              <div className="font-semibold text-slate-800 flex items-center gap-1">
                {currentSeller.isVerified ? (
                  <span className="text-green-600 font-semibold flex items-center gap-0.5">Sceau Vérifié Actif <CheckCircle2 className="w-3.5 h-3.5" /></span>
                ) : (
                  <span className="text-amber-600 font-semibold">En cours de modération administrative</span>
                )}
              </div>
            </div>
          </div>

          {/* Curated Products for this Seller */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 tracking-wider uppercase border-b pb-2">Catalogue Exclusif de la Boutique</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.filter(p => p.sellerId === currentSeller.id).map((product) => (
                <div 
                  key={product.id}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-200 transition-all flex flex-col"
                >
                  <div className="relative aspect-square bg-slate-50 overflow-hidden cursor-pointer" onClick={() => onNavigate('public', 'product', product.id)}>
                    <Image src={product.images[0]} alt={product.name} fill referrerPolicy="no-referrer" sizes="(max-width: 768px) 100vw, 33vw" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                  </div>
                  <div className="p-4 space-y-3 flex flex-col flex-1 justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{product.category}</span>
                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {product.rating}</span>
                      </div>
                      <h4 
                        onClick={() => onNavigate('public', 'product', product.id)}
                        className="text-xs font-semibold text-slate-950 hover:text-amber-600 transition-colors line-clamp-1 cursor-pointer"
                      >
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{product.price.toLocaleString()} FCFA</span>
                      <button 
                        onClick={() => onAddToCart(product)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-semibold uppercase rounded-lg transition-all"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAQ VIEW */}
      {currentSubView === 'faq' && (
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-semibold text-slate-950">Questions Fréquentes FAQ</h1>
            <p className="text-xs text-slate-500">Tout savoir sur le fonctionnement, les garanties et la livraison de Zando au Niger.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Qu’est-ce que Zando et comment cela fonctionne-t-il ?",
                a: "Zando est la marketplace digitale premium du Niger, spécialisée dans les produits de qualité à Niamey. Elle permet de commander des produits de mode traditionnelle, d'artisanat d'art, d'électronique et de cosmétique auprès de créateurs locaux ou d'importateurs vérifiés."
              },
              {
                q: "Qu’est-ce que le label 'Vendeur Vérifié' ?",
                a: "Le label 'Vendeur Vérifié' garantit que l'identité, le numéro d'enregistrement commercial (le cas échéant) et l'adresse physique du vendeur ont été physiquement audités et validés par l'équipe d'administration de Zando. Cela élimine tout risque de commerce factice."
              },
              {
                q: "Comment s’effectuent la livraison et le paiement à Niamey ?",
                a: "Les livraisons sont assurées sous 24h à 48h par notre service de coursiers officiels sur toute l'étendue de Niamey (Plateau, Goudel, Banifandou, Harobanda, etc.). Par défaut, vous pouvez commander en ligne et régler soit à la livraison, soit par virement Mobile Money."
              },
              {
                q: "Que faire si le produit reçu n’est pas conforme ?",
                a: "Zando s'inspire de l'esprit de conciliation client. En cas de défaut majeur ou de non-conformité, contactez notre service client sous 48h pour initier une enquête administrative débouchant sur l'échange de l'article ou le remboursement."
              }
            ].map((faq, idx) => (
              <details key={idx} className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-4 cursor-pointer transition-all hover:border-slate-200">
                <summary className="text-xs font-semibold text-slate-900 flex items-center justify-between list-none">
                  {faq.q}
                  <Plus className="w-4 h-4 text-slate-400 group-open:hidden" />
                  <Minus className="w-4 h-4 text-slate-400 hidden group-open:block" />
                </summary>
                <p className="text-xs text-slate-500 leading-relaxed mt-3 pt-3 border-t border-slate-50 cursor-text">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* CONTACT VIEW */}
      {currentSubView === 'contact' && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Info Side */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-display font-semibold text-slate-950">Prendre Contact</h1>
              <p className="text-xs text-slate-500">Une question ? Un partenariat vendeur ? Notre bureau de Niamey vous écoute.</p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-start bg-white p-4 rounded-xl border">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-slate-800">Bureau Niamey</div>
                  <p className="text-slate-500 mt-0.5">Quartier Plateau, Immeuble Horizon, face Direction Générale de la Douane, Niamey, Niger</p>
                </div>
              </div>
              <div className="flex gap-4 items-start bg-white p-4 rounded-xl border">
                <Phone className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-slate-800">Téléphone d’Élite</div>
                  <p className="text-slate-500 mt-0.5">Fixe : +227 20 73 99 99<br />WhatsApp Pro : +227 96 00 11 22</p>
                </div>
              </div>
              <div className="flex gap-4 items-start bg-white p-4 rounded-xl border">
                <Mail className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-slate-800">Email Officiel</div>
                  <p className="text-slate-500 mt-0.5">contact@zando.ne • support@zando.ne</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Envoyer un message sécurisé</h3>
            
            {contactSuccess ? (
              <div className="p-4 bg-green-50 text-green-700 rounded-2xl text-xs space-y-2">
                <div className="font-semibold flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Message envoyé avec succès !</div>
                <p className="text-[11px] leading-relaxed">Merci d’avoir contacté Zando. Notre équipe commerciale à Niamey étudiera votre demande et vous répondra sous 24h.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Votre Nom</label>
                    <input 
                      type="text" 
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Ibrahim" 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Votre Email</label>
                    <input 
                      type="email" 
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="ibrahim@gmail.com" 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Sujet du message</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none">
                    <option>Devenir Vendeur Premium</option>
                    <option>Soutien / Question sur ma commande</option>
                    <option>Signaler un produit ou litige</option>
                    <option>Partenariat d’excellence</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Votre Message</label>
                  <textarea 
                    rows={4}
                    required
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Dites-nous comment nous pouvons vous aider..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  Envoyer ma demande
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ABOUT VIEW */}
      {currentSubView === 'about' && (
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="space-y-4">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">Notre Raison d’Être</span>
            <h1 className="text-3xl font-display font-semibold text-slate-950 leading-tight">Zando: L’alliance de l’authenticité locale et de la technologie premium.</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Fondée en 2026, Zando est née d’un constat simple : le commerce digital au Niger regorge de talents créatifs exceptionnels, mais souffre d’un déficit de confiance, de canaux de paiement sécurisés et de modération stricte. Nous avons bâti Zando pour combler ce fossé.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase">La Qualité d’Abord</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Inspirés par la rigueur esthétique d’Apple et de Stripe, nous pensons que chaque pixel doit inspirer la clarté. Pas d’annonces surchargées, pas de vendeurs de rue anonymes. Uniquement le meilleur de Niamey.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase">La Confiance Locale</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                En s’appuyant sur des protocoles d’authentification stricts et des contrôles d’identité KYC manuels, Zando prévient la fraude en amont. Acheteurs et vendeurs opèrent l’esprit serein.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-display font-semibold text-amber-400">Une Vision pour l’Afrique Subsaharienne</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Zando commence son aventure à Niamey, au Niger. Mais notre architecture technologique, nos mécanismes de sécurité robustes et notre dévouement à l’excellence client ont été élaborés pour devenir l’infrastructure de confiance universelle de la région sahélienne.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

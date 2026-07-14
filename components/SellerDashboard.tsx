'use client';
import Image from 'next/image';

import React, { useState } from 'react';
import { Product, Order, SellerProfile } from '../lib/types';
import { 
  Plus, Edit3, Trash2, ShoppingBag, ArrowRight, CheckCircle2,
  Package, DollarSign, Star, TrendingUp, Settings, FileText, X
} from 'lucide-react';

interface SellerDashboardProps {
  currentSubView: string;
  sellerProfile: SellerProfile | null;
  products: Product[];
  orders: Order[];
  onAddProduct: (productData: Omit<Product, 'id' | 'rating' | 'reviews' | 'createdAt'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onUpdateSellerSettings: (settingsData: Partial<SellerProfile>) => void;
  onNavigate: (view: string, subView?: string) => void;
}

export default function SellerDashboard({
  currentSubView,
  sellerProfile,
  products,
  orders,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onUpdateSellerSettings,
  onNavigate
}: SellerDashboardProps) {
  // Add/Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState('Mode & Luxe');
  const [stock, setStock] = useState(5);
  const [imageUrl, setImageUrl] = useState('');

  // Seller Settings State
  const [shopDesc, setShopDesc] = useState(sellerProfile?.description || '');
  const [shopPhone, setShopPhone] = useState(sellerProfile?.phone || '');
  const [shopAddress, setShopAddress] = useState(sellerProfile?.address || '');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Math for stats
  const sellerProducts = products.filter(p => p.sellerId === sellerProfile?.id);
  const sellerOrders = orders.filter(order => order.items.some(item => item.sellerId === sellerProfile?.id));
  const totalRevenue = sellerOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, order) => {
      const sellerItems = order.items.filter(item => item.sellerId === sellerProfile?.id);
      const sellerAmount = sellerItems.reduce((s, i) => s + (i.price * i.quantity), 0);
      return sum + sellerAmount;
    }, 0);

  // Monthly breakdown for Chart (mock local sales pattern)
  const chartData = [
    { month: 'Jan', sales: 450000 },
    { month: 'Fév', sales: 620000 },
    { month: 'Mar', sales: 310000 },
    { month: 'Avr', sales: 850000 },
    { month: 'Mai', sales: 920000 },
    { month: 'Juin', sales: totalRevenue > 0 ? Math.min(totalRevenue, 1200000) : 580000 },
  ];
  const maxSales = Math.max(...chartData.map(d => d.sales));

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice(10000);
    setCategory('Mode & Luxe');
    setStock(10);
    setImageUrl('https://picsum.photos/seed/newprod/600/600');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setCategory(product.category);
    setStock(product.stock);
    setImageUrl(product.images[0]);
    setIsModalOpen(true);
  };

  const handleSubmitProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || price <= 0 || stock < 0) return;

    if (editingProduct) {
      onEditProduct({
        ...editingProduct,
        name,
        description,
        price,
        category,
        stock,
        images: [imageUrl || 'https://picsum.photos/seed/default/600/600']
      });
    } else {
      onAddProduct({
        name,
        description,
        price,
        category,
        stock,
        images: [imageUrl || 'https://picsum.photos/seed/default/600/600'],
        sellerId: sellerProfile?.id || 'seller-alaza',
        sellerName: sellerProfile?.name || 'Alaza Luxe',
        sellerVerified: sellerProfile?.isVerified || false
      });
    }

    setIsModalOpen(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSellerSettings({
      description: shopDesc,
      phone: shopPhone,
      address: shopAddress
    });
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  const getOrderStatusColor = (status: Order['status']) => {
    if (status === 'delivered') return 'bg-green-100 text-green-800';
    if (status === 'processing') return 'bg-indigo-100 text-indigo-800';
    if (status === 'shipped') return 'bg-teal-100 text-teal-800';
    if (status === 'cancelled') return 'bg-slate-100 text-slate-700';
    return 'bg-amber-100 text-amber-800';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-4">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="w-10 h-10 rounded-xl overflow-hidden border relative">
              <Image src={sellerProfile?.logo || ''} alt={"logo"} fill referrerPolicy="no-referrer" sizes="100px" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-900 flex items-center gap-1">
                {sellerProfile?.name}
                {sellerProfile?.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 fill-amber-50" />}
              </div>
              <span className="text-[10px] text-slate-400">Espace Vendeur</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5 text-xs text-slate-600">
            <button 
              onClick={() => onNavigate('seller', 'dashboard')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-all ${
                currentSubView === 'dashboard' ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 relative" /> Vue d’ensemble
            </button>
            <button 
              onClick={() => onNavigate('seller', 'products')}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-all ${
                currentSubView === 'products' ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2.5"><Package className="w-4 h-4 relative" /> Gérer l’inventaire</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">{sellerProducts.length}</span>
            </button>
            <button 
              onClick={() => onNavigate('seller', 'orders')}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-all ${
                currentSubView === 'orders' ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2.5"><ShoppingBag className="w-4 h-4 relative" /> Commandes Reçues</span>
              {sellerOrders.filter(o => o.status === 'pending' || o.status === 'processing').length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  {sellerOrders.filter(o => o.status === 'pending' || o.status === 'processing').length}
                </span>
              )}
            </button>
            <button 
              onClick={() => onNavigate('seller', 'settings')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-all ${
                currentSubView === 'settings' ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4 relative" /> Paramètres Boutique
            </button>
          </nav>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* VIEW: OVERVIEW STATS & INTERACTIVE CHART */}
        {currentSubView === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-6 rounded-3xl space-y-2 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md text-white">Espace Professionnel</span>
              <h2 className="text-xl md:text-2xl font-display font-medium">Vos Ventes à Niamey</h2>
              <p className="text-xs text-amber-50/80 leading-relaxed max-w-md">
                Gérez vos articles, analysez vos encaissements et expédiez vos colis pour maintenir un niveau de service d’élite et garder votre badge Zando Vérifié.
              </p>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Chiffre d’Affaires</div>
                  <div className="text-lg font-mono font-bold text-slate-900 mt-1">{totalRevenue.toLocaleString()} FCFA</div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center relative">
                  <DollarSign className="w-5 h-5 relative" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Commandes Reçues</div>
                  <div className="text-lg font-mono font-bold text-slate-900 mt-1">{sellerOrders.length}</div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center relative">
                  <ShoppingBag className="w-5 h-5 relative" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Note Qualité</div>
                  <div className="text-lg font-mono font-bold text-slate-900 mt-1">⭐ {sellerProfile?.rating || '4.9'}</div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center relative">
                  <Star className="w-5 h-5 fill-current relative" />
                </div>
              </div>
            </div>

            {/* Custom SVG Line-Bar Analytics Chart (100% React 19 Compatible, Stripe Style) */}
            <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Performance Trimestrielle (CFA)</h3>
                <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">📈 +12% ce mois-ci</span>
              </div>

              <div className="h-56 w-full flex items-end justify-between pt-6 px-4">
                {chartData.map((data, idx) => {
                  const percentage = (data.sales / maxSales) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-3 w-1/6 group cursor-pointer">
                      <div className="relative w-full flex flex-col justify-end items-center h-40">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-7 bg-slate-900 text-white text-[9px] font-mono font-semibold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-10">
                          {data.sales.toLocaleString()} CFA
                        </div>
                        {/* Bar */}
                        <div 
                          style={{ height: `${percentage}%` }}
                          className="w-8 rounded-t-md bg-gradient-to-t from-amber-600 to-amber-500 group-hover:from-amber-500 group-hover:to-amber-400 transition-all duration-300"
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">{data.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: MANAGE PRODUCTS (CRUD) */}
        {currentSubView === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-display font-semibold text-slate-900">Gestion du Catalogue Produits</h2>
              <button 
                onClick={handleOpenAdd}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold uppercase flex items-center gap-1.5 transition-colors"
              >
                Ajouter un article <Plus className="w-4 h-4 relative" />
              </button>
            </div>

            {/* Products Table/List */}
            {sellerProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sellerProducts.map((product) => (
                  <div key={product.id} className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4 justify-between">
                    <div className="flex items-center gap-3">
                      <Image src={product.images[0]} alt={"prod"} fill referrerPolicy="no-referrer" sizes="100px" className="w-12 h-12 object-cover rounded-lg border relative" />
                      <div className="text-xs">
                        <h4 className="font-semibold text-slate-950 line-clamp-1">{product.name}</h4>
                        <span className="text-[10px] text-slate-400">Stock restant : <strong className="text-slate-800">{product.stock}</strong></span>
                        <div className="font-mono font-bold text-slate-800 mt-0.5">{product.price.toLocaleString()} FCFA</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenEdit(product)}
                        className="p-2 text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-lg border transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => onDeleteProduct(product.id)}
                        className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed text-slate-400 text-xs">
                Votre boutique ne contient aucun produit. Cliquez sur "Ajouter un article" pour lister vos créations.
              </div>
            )}
          </div>
        )}

        {/* VIEW: ORDER PROCESSING (vendeur -> acheteur order status modifier) */}
        {currentSubView === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-lg font-display font-semibold text-slate-900 border-b pb-2">Traitement des commandes clients</h2>

            {sellerOrders.length > 0 ? (
              <div className="space-y-4">
                {sellerOrders.map((order) => {
                  const sellerItems = order.items.filter(i => i.sellerId === sellerProfile?.id);
                  const sellerSubtotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                  return (
                    <div key={order.id} className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b pb-3 text-xs">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-950 font-mono">CODE: #{order.id}</span>
                          <p className="text-[10px] text-slate-400">Acheteur : <strong className="text-slate-700">{order.buyerName}</strong> • {order.buyerPhone}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${getOrderStatusColor(order.status)}`}>
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Items specific to this seller */}
                      <div className="space-y-2">
                        {sellerItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <Image src={item.image} alt={"item"} fill referrerPolicy="no-referrer" sizes="100px" className="w-8 h-8 object-cover rounded-md relative" />
                              <div>
                                <h4 className="font-semibold text-slate-800">{item.productName}</h4>
                                <span className="text-[10px] text-slate-400">Quantité demandée : {item.quantity}</span>
                              </div>
                            </div>
                            <span className="font-mono text-slate-800 font-semibold">{(item.price * item.quantity).toLocaleString()} FCFA</span>
                          </div>
                        ))}
                      </div>

                      {/* Interactive shipment Status workflow modifier */}
                      <div className="pt-3 border-t flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-50 p-3 rounded-xl -mx-5 -mb-5">
                        <div className="text-[10px] text-slate-500">
                          <span className="font-semibold text-slate-700">Adresse de livraison à Niamey :</span> {order.buyerAddress}
                        </div>

                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-slate-400">Changer statut :</span>
                            <select 
                              value={order.status}
                              onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                              className="bg-white border rounded-lg px-2.5 py-1 text-[10px] font-bold focus:outline-none focus:border-amber-500"
                            >
                              <option value="pending">En attente</option>
                              <option value="processing">Préparation</option>
                              <option value="shipped">Expédié</option>
                              <option value="delivered">Livré</option>
                              <option value="cancelled">Annulé</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed text-slate-400 text-xs">
                Aucune commande en attente de traitement.
              </div>
            )}
          </div>
        )}

        {/* VIEW: BOUTIQUE SETTINGS */}
        {currentSubView === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-lg font-display font-semibold text-slate-900 border-b pb-2">Paramètres de la vitrine d’artisan</h2>

            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              {settingsSuccess && (
                <div className="p-3 bg-green-50 text-green-700 rounded-xl text-xs font-semibold">
                  ✓ Vitrine mise à jour avec succès ! Ces modifications sont visibles par le public.
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Description publique de la Boutique</label>
                  <textarea 
                    rows={4}
                    value={shopDesc}
                    onChange={(e) => setShopDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:bg-white resize-none"
                    placeholder="Présentez votre histoire, votre savoir-faire et vos matières premières de prédilection aux acheteurs..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Téléphone de la boutique</label>
                    <input 
                      type="text" 
                      value={shopPhone}
                      onChange={(e) => setShopPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:bg-white"
                      placeholder="+227 96 00 11 22"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Adresse de la boutique à Niamey</label>
                    <input 
                      type="text" 
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:bg-white"
                      placeholder="Quartier Plateau, Avenue des Douanes, Niamey"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase"
                >
                  Sauvegarder les modifications
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* CREATE & EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border max-w-md w-full overflow-hidden shadow-2xl relative">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider">{editingProduct ? 'Modifier le Produit' : 'Ajouter un nouveau Produit'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5 relative" />
              </button>
            </div>

            <form onSubmit={handleSubmitProductForm} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Désignation du produit</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Robe Kabyle moderne brodée"
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Description détaillée (Matériaux, artisanat...)</label>
                <textarea 
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez précisément votre produit pour séduire les acheteurs de Zando..."
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Prix de vente (FCFA)</label>
                  <input 
                    type="number" 
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Stock disponible</label>
                  <input 
                    type="number" 
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Catégorie du produit</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none"
                  >
                    <option value="Mode & Luxe">Mode & Luxe</option>
                    <option value="Électronique & High-Tech">Électronique & High-Tech</option>
                    <option value="Artisanat d'Art du Niger">Artisanat d'Art du Niger</option>
                    <option value="Beauté, Cosmétiques & Soins">Beauté, Cosmétiques & Soins</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">URL Image du produit</label>
                  <input 
                    type="text" 
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://picsum.photos/..."
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none text-[10px]"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                {editingProduct ? 'Mettre à jour l’article' : 'Enregistrer le produit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

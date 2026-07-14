'use client';
import Image from 'next/image';

import React, { useState } from 'react';
import { Product, SellerProfile, Order, KYCSubmission, NewsletterCampaign, User } from '../lib/types';
import { 
  ShieldCheck, Users, ShoppingBag, FileText, Send, 
  Trash2, CheckCircle2, XCircle, TrendingUp, BarChart3,
  Mail, Calendar, Settings, Lock
} from 'lucide-react';

interface AdminDashboardProps {
  currentSubView: string;
  products: Product[];
  sellers: SellerProfile[];
  orders: Order[];
  kycSubmissions: KYCSubmission[];
  campaigns: NewsletterCampaign[];
  users: User[];
  onApproveKYC: (submissionId: string) => void;
  onRejectKYC: (submissionId: string) => void;
  onDeleteProduct: (productId: string) => void;
  onSendNewsletter: (subject: string, content: string) => void;
  onNavigate: (view: string, subView?: string) => void;
}

export default function AdminDashboard({
  currentSubView,
  products,
  sellers,
  orders,
  kycSubmissions,
  campaigns,
  users,
  onApproveKYC,
  onRejectKYC,
  onDeleteProduct,
  onSendNewsletter,
  onNavigate
}: AdminDashboardProps) {
  // Campaign creator states
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [campaignSuccess, setCampaignSuccess] = useState(false);

  // Math metrics for overview
  const totalGMV = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const pendingKYC = kycSubmissions.filter(sub => sub.status === 'pending');

  // Pageviews data for custom SVG visual chart
  const trafficData = [
    { day: 'Lun', views: 2400 },
    { day: 'Mar', views: 3200 },
    { day: 'Mer', views: 2800 },
    { day: 'Jeu', views: 4100 },
    { day: 'Ven', views: 4900 },
    { day: 'Sam', views: 5600 },
    { day: 'Dim', views: 6300 },
  ];
  const maxViews = Math.max(...trafficData.map(d => d.views));

  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content) return;

    onSendNewsletter(subject, content);
    setCampaignSuccess(true);
    setSubject('');
    setContent('');
    setTimeout(() => setCampaignSuccess(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-4">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="w-10 h-10 rounded-full bg-slate-950 text-rose-500 font-display font-bold flex items-center justify-center text-sm shadow-sm relative">
              AD
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-900 flex items-center gap-1">
                Admin Zando
                <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <span className="text-[10px] text-slate-400">Pôle d’Administration</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5 text-xs text-slate-600">
            <button 
              onClick={() => onNavigate('admin', 'overview')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-all ${
                currentSubView === 'overview' ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 relative" /> Analyse Globale
            </button>
            <button 
              onClick={() => onNavigate('admin', 'kyc')}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-all ${
                currentSubView === 'kyc' ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2.5"><ShieldCheck className="w-4 h-4 relative" /> Modération KYC</span>
              {pendingKYC.length > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">{pendingKYC.length}</span>}
            </button>
            <button 
              onClick={() => onNavigate('admin', 'products')}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-all ${
                currentSubView === 'products' ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2.5"><ShoppingBag className="w-4 h-4 relative" /> Modération Catalogue</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">{products.length}</span>
            </button>
            <button 
              onClick={() => onNavigate('admin', 'newsletter')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition-all ${
                currentSubView === 'newsletter' ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'
              }`}
            >
              <Mail className="w-4 h-4 relative" /> Campagnes Newsletter
            </button>
            <button 
              onClick={() => onNavigate('admin', 'users')}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-all ${
                currentSubView === 'users' ? 'bg-slate-950 text-white' : 'hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2.5"><Users className="w-4 h-4 relative" /> Équipe & Vendeurs</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">{sellers.length}</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* VIEW: ANALYTICS OVERVIEW */}
        {currentSubView === 'overview' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-rose-950 to-rose-900 text-white p-6 rounded-3xl space-y-2 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded">Rôle Administrateur</span>
              <h2 className="text-xl md:text-2xl font-display font-medium text-rose-100">Supervision de l’écosystème Zando</h2>
              <p className="text-xs text-rose-200 leading-relaxed max-w-md">
                Garantissez l’esprit de confiance du Niger. Auditez les dossiers vendeurs, supprimez les anomalies produits et analysez les indicateurs de performance.
              </p>
            </div>

            {/* Core Global KPI metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Volume d’Affaires (GMV)</div>
                  <div className="text-base font-mono font-bold text-slate-900 mt-1">{totalGMV.toLocaleString()} FCFA</div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center relative">
                  <TrendingUp className="w-5 h-5 relative" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Vendeurs Soumis</div>
                  <div className="text-base font-mono font-bold text-slate-900 mt-1">{sellers.length}</div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center relative">
                  <Users className="w-5 h-5 relative" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Attente Modération</div>
                  <div className="text-base font-mono font-bold text-rose-600 mt-1">{pendingKYC.length} dossiers</div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center relative">
                  <ShieldCheck className="w-5 h-5 relative" />
                </div>
              </div>
            </div>

            {/* Interactive Daily Traffic SVG Chart */}
            <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Affluence Quotidienne (Niamey / Visites)</h3>
                <span className="text-[10px] font-mono text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">⭐ Serveurs Cloud Stables</span>
              </div>

              <div className="h-44 w-full flex items-end justify-between pt-6 px-4">
                {trafficData.map((data, idx) => {
                  const percentage = (data.views / maxViews) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 w-1/8 group cursor-pointer">
                      <div className="relative w-full flex flex-col justify-end items-center h-32">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-7 bg-slate-950 text-white text-[9px] font-mono font-semibold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-10">
                          {data.views.toLocaleString()} visites
                        </div>
                        {/* Bar */}
                        <div 
                          style={{ height: `${percentage}%` }}
                          className="w-7 rounded-t-md bg-gradient-to-t from-rose-950 to-rose-700 group-hover:from-rose-700 transition-all duration-300"
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">{data.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: KYC SELLER MODERATION */}
        {currentSubView === 'kyc' && (
          <div className="space-y-6">
            <h2 className="text-lg font-display font-semibold text-slate-900 border-b pb-2">Vérification d’identité Vendeur (KYC)</h2>

            {kycSubmissions.length > 0 ? (
              <div className="space-y-4">
                {kycSubmissions.map((sub) => (
                  <div key={sub.id} className="bg-white p-5 rounded-xl border shadow-sm space-y-3">
                    <div className="flex justify-between items-start border-b pb-3 text-xs">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-900">{sub.sellerName}</h4>
                        <span className="text-slate-400 font-mono">Email de contact : {sub.email}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        sub.status === 'approved' ? 'bg-green-100 text-green-800' : sub.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-lg border text-slate-600">
                      <div><strong className="text-slate-800">Type de document :</strong> {sub.documentType}</div>
                      <div><strong className="text-slate-800">Numéro de registre officiel :</strong> <span className="font-mono text-slate-700">{sub.documentNumber}</span></div>
                      <div><strong className="text-slate-800">Soumission le :</strong> {new Date(sub.submittedAt).toLocaleDateString()}</div>
                    </div>

                    {sub.status === 'pending' && (
                      <div className="flex gap-2 justify-end pt-2">
                        <button 
                          onClick={() => onRejectKYC(sub.id)}
                          className="px-3.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-700 rounded-lg text-[10px] font-bold uppercase transition-colors"
                        >
                          Rejeter le dossier
                        </button>
                        <button 
                          onClick={() => onApproveKYC(sub.id)}
                          className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold uppercase transition-colors"
                        >
                          Approuver et Certifier
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed text-slate-400 text-xs">
                Aucun dossier d’enregistrement vendeur en attente.
              </div>
            )}
          </div>
        )}

        {/* VIEW: CATALOGUE MODERATION */}
        {currentSubView === 'products' && (
          <div className="space-y-6">
            <h2 className="text-lg font-display font-semibold text-slate-900 border-b pb-2">Modération Globale du Catalogue</h2>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden divide-y divide-slate-100">
              {products.map((product) => (
                <div key={product.id} className="p-4 flex items-center gap-4 justify-between text-xs hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Image src={product.images[0]} alt={"p"} fill referrerPolicy="no-referrer" sizes="100px" className="w-10 h-10 object-cover rounded-lg border relative" />
                    <div>
                      <h4 className="font-bold text-slate-900">{product.name}</h4>
                      <p className="text-[10px] text-slate-400">Vendeur : <strong className="text-slate-600">{product.sellerName}</strong> • {product.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-slate-800">{product.price.toLocaleString()} FCFA</span>
                    <button 
                      onClick={() => onDeleteProduct(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Bannir du catalogue"
                    >
                      <Trash2 className="w-4 h-4 relative" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: NEWSLETTERS MARKETING CAMPAIGNS */}
        {currentSubView === 'newsletter' && (
          <div className="space-y-6">
            <h2 className="text-lg font-display font-semibold text-slate-900 border-b pb-2">Campagnes de Newsletters</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Creator Box */}
              <div className="md:col-span-2 bg-white p-5 rounded-2xl border shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Créer et envoyer une campagne</h3>
                
                {campaignSuccess && (
                  <div className="p-3 bg-green-50 text-green-700 rounded-xl text-xs font-semibold">
                    ✓ La newsletter d’élite a été "diffusée" avec succès aux 450 abonnés de Niamey.
                  </div>
                )}

                <form onSubmit={handleCreateCampaignSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Sujet de l’email marketing</label>
                    <input 
                      type="text" 
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="ex: Artisanat d’exception du Niger : Notre sélection de Juillet"
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Contenu éditorial (HTML / Texte brut)</label>
                    <textarea 
                      rows={5}
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Rédigez le texte de votre campagne. Mettez en valeur les créations, les nouvelles fonctionnalités..."
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:outline-none resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    Diffuser la campagne <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* History List */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider">Historique de diffusion</h3>
                {campaigns.map((camp) => (
                  <div key={camp.id} className="bg-white p-4 rounded-xl border shadow-sm text-xs space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 relative" /> {new Date(camp.sentAt).toLocaleDateString()}</span>
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">{camp.recipientsCount} abonnés</span>
                    </div>
                    <h4 className="font-semibold text-slate-900">{camp.subject}</h4>
                    <p className="text-[10px] text-slate-500 line-clamp-2 italic">"{camp.content}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: USERS MANAGEMENT DATABASE */}
        {currentSubView === 'users' && (
          <div className="space-y-6">
            <h2 className="text-lg font-display font-semibold text-slate-900 border-b pb-2">Liste des utilisateurs enregistrés</h2>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="p-4">Utilisateur / Rôle</th>
                      <th className="p-4">Email de contact</th>
                      <th className="p-4">Ville</th>
                      <th className="p-4 whitespace-nowrap">Rejoint le</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50">
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{user.name}</div>
                          <span className={`text-[9px] font-bold uppercase ${
                            user.role === 'admin' ? 'text-rose-600' : user.role === 'seller' ? 'text-amber-600' : 'text-indigo-600'
                          }`}>{user.role}</span>
                        </td>
                        <td className="p-4 font-mono text-slate-500">{user.email}</td>
                        <td className="p-4 text-slate-600 whitespace-nowrap">{user.city || 'Niamey'}</td>
                        <td className="p-4 text-slate-400 whitespace-nowrap">{user.joinedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

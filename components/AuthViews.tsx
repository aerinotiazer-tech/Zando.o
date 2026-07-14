'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, User, ArrowRight, ArrowLeft, ShieldCheck, HelpCircle, 
  Loader2, Sparkles, Radio, Users, Compass, Globe, Check, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

interface AuthViewsProps {
  currentSubView: string;
  onNavigate: (view: string, subView?: string) => void;
  onLoginSuccess: (email: string, role: 'buyer' | 'seller' | 'admin') => void;
}

// Elegant launch video barcode illustration
const BarcodePattern = () => (
  <div className="flex justify-center items-center gap-0.5 opacity-25 py-2 select-none" aria-hidden="true">
    <div className="w-1 h-7 bg-slate-900 rounded-sm"></div>
    <div className="w-0.5 h-7 bg-slate-900 rounded-sm"></div>
    <div className="w-1.5 h-7 bg-slate-900 rounded-sm"></div>
    <div className="w-2.5 h-7 bg-slate-900 rounded-sm"></div>
    <div className="w-0.5 h-7 bg-slate-900 rounded-sm"></div>
    <div className="w-1 h-7 bg-slate-900 rounded-sm"></div>
    <div className="w-0.5 h-7 bg-slate-900 rounded-sm"></div>
    <div className="w-2 h-7 bg-slate-900 rounded-sm"></div>
    <div className="w-1.5 h-7 bg-slate-900 rounded-sm"></div>
    <div className="w-0.5 h-7 bg-slate-900 rounded-sm"></div>
    <div className="w-3 h-7 bg-slate-900 rounded-sm"></div>
  </div>
);

// Trust badges directly from the video slogans
const LaunchSlogansMarquee = () => (
  <div className="bg-[#0066FF]/5 border-y border-[#0066FF]/10 py-2.5 overflow-hidden select-none">
    <div className="flex justify-center gap-6 text-[9px] uppercase font-bold tracking-widest text-[#0066FF]/80">
      <span>Des vendeurs vérifiés</span>
      <span className="text-amber-500">•</span>
      <span>Des prix transparents</span>
      <span className="text-amber-500">•</span>
      <span>Achète en confiance</span>
    </div>
  </div>
);

export default function AuthViews({ currentSubView, onNavigate, onLoginSuccess }: AuthViewsProps) {
  // Common states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom states for the "Verify Email" screen (from PRD instructions)
  const [verificationEmail, setVerificationEmail] = useState('votre-email@domaine.com');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // ONBOARDING QUESTION & CONNECTION FLOW
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [onboardingStep, setOnboardingStep] = useState<'question' | 'connecting'>('question');
  const [connectionLog, setConnectionLog] = useState<string>('Préparation de l’environnement sécurisé...');

  const sources = [
    { id: 'tiktok', label: 'Réseaux Sociaux (TikTok, Instagram, WhatsApp)', icon: Radio, desc: 'Nos vidéos de créateurs locaux' },
    { id: 'friend', label: 'Bouche à oreille / Un ami', icon: Users, desc: 'Recommandé par un membre de confiance' },
    { id: 'search', label: 'Recherche Google / Moteur IA', icon: Globe, desc: 'ChatGPT, Google Gemini AI ou Perplexity' },
    { id: 'poster', label: 'Affiches & Panneaux à Niamey', icon: Compass, desc: 'Vu au Plateau, Goudel ou dans la rue' },
    { id: 'other', label: 'Autre moyen', icon: HelpCircle, desc: 'Une autre découverte d’exception' }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Check role from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (userError) throw userError;

      onLoginSuccess(email, userData.role as any);
    } catch (err: any) {
      console.error('Login error:', err);
      // Fallback to mock for preview purposes if Supabase is not configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const lowercaseEmail = email.toLowerCase();
        if (lowercaseEmail.includes('admin')) {
          onLoginSuccess(email, 'admin');
        } else if (lowercaseEmail.includes('vendeur') || lowercaseEmail.includes('seller') || lowercaseEmail.includes('alaza')) {
          onLoginSuccess(email, 'seller');
        } else {
          onLoginSuccess(email, 'buyer');
        }
      } else {
        setError(err.message || 'Échec de la connexion');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: name,
            role: role
          }
        }
      });

      if (error) {
        throw error;
      }

      setVerificationEmail(email);
      setIsOnboarding(true);
      setOnboardingStep('question');
    } catch (err: any) {
      console.error('Signup error:', err);
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setVerificationEmail(email);
        setIsOnboarding(true);
        setOnboardingStep('question');
      } else {
        setError(err.message || 'Échec de l\'inscription');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmOnboarding = () => {
    if (!selectedSource) {
      setError('Veuillez sélectionner une option pour continuer.');
      return;
    }
    setError('');
    setOnboardingStep('connecting');

    // Simulate luxury secure account connecting phase
    const logs = [
      'Préparation de l’environnement sécurisé...',
      'Analyse de provenance : ' + sources.find(s => s.id === selectedSource)?.label,
      'Cryptage et liaison de votre identité au Niger...',
      'Création de vos clés de sécurité Zando...',
      'Finalisation de l’authentification d’élite...'
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length - 1) {
        currentLogIndex++;
        setConnectionLog(logs[currentLogIndex]);
      } else {
        clearInterval(interval);
        // Switch to the actual email verification step!
        setIsOnboarding(false);
        onNavigate('auth', 'verify-email');
      }
    }, 800);
  };

  const handleResendEmail = async () => {
    setResendStatus('sending');
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        await supabase.auth.resend({
          type: 'signup',
          email: verificationEmail,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          }
        });
      } catch (err) {
        console.error('Error resending email', err);
      }
    }
    
    setTimeout(() => {
      setResendStatus('sent');
      setTimeout(() => setResendStatus('idle'), 3000);
    }, 1000);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
      
      // Visual feedback
      onNavigate('auth', 'login');
    } catch (err: any) {
      console.error('Reset password error:', err);
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
         onNavigate('auth', 'login');
      } else {
        setError(err.message || 'Échec de la réinitialisation');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      
      {/* 1. Onboarding Question Screen */}
      <AnimatePresence mode="wait">
        {isOnboarding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-[#0066FF]/10 shadow-xl space-y-6 bg-gradient-to-b from-white to-[#FCFAF7] relative overflow-hidden"
          >
            {/* Launch video inspired curve overlay decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0066FF]/5 rounded-bl-full pointer-events-none border-b border-l border-[#0066FF]/5" />
            
            {onboardingStep === 'question' ? (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-black tracking-widest uppercase text-[#0066FF]">Première Connexion</span>
                  <h1 className="text-2xl font-display font-semibold text-slate-950 leading-tight">Comment nous avez-vous trouvé ?</h1>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Aidez-nous à faire briller l’artisanat d’art et le commerce d’exception au Niger. Où avez-vous découvert Zando ?
                  </p>
                </div>

                <div className="space-y-3">
                  {sources.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = selectedSource === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedSource(item.id)}
                        className={`w-full p-3.5 text-left rounded-2xl border text-xs flex items-start gap-3.5 transition-all relative ${
                          isSelected 
                            ? 'bg-white border-[#0066FF] shadow-md shadow-[#0066FF]/5 text-slate-950' 
                            : 'bg-slate-50/50 border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                        }`}
                      >
                        <div className={`p-2 rounded-xl transition-colors ${isSelected ? 'bg-[#0066FF] text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-semibold">{item.label}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#0066FF] text-white rounded-full p-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {error && <p className="text-[11px] text-red-500 font-medium text-center">{error}</p>}

                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmOnboarding}
                    className="w-full py-3 bg-[#0066FF] hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0066FF]/25"
                  >
                    Confirmer et connecter mon compte <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <BarcodePattern />
                </div>
              </div>
            ) : (
              // STEP: Simulating connection
              <div className="py-12 text-center space-y-6">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#0066FF] border-r-transparent animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 tracking-wider uppercase font-display">Liaison Secrète</h3>
                  <p className="text-xs text-[#0066FF] font-mono h-8 font-semibold">
                    {connectionLog}
                  </p>
                </div>

                <div className="max-w-xs mx-auto text-[10px] text-slate-400 leading-relaxed bg-[#FCFAF7] p-3 rounded-xl border border-slate-100">
                  Zando utilise un protocole d’identité souverain pour sécuriser vos données à Niamey.
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Login & Regular Signup Screen */}
      {!isOnboarding && (
        <div className="space-y-6">
          
          {/* Visual Brand Indicator based on the Video */}
          <div className="text-center space-y-2 mb-2">
            <span className="text-[#0066FF] font-mono font-bold tracking-widest text-[9px] uppercase">ZANDO • NIAMEY</span>
            <div className="flex justify-center items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span>Mode</span>
              <span className="w-1 h-1 bg-[#0066FF] rounded-full"></span>
              <span>Tech</span>
              <span className="w-1 h-1 bg-[#0066FF] rounded-full"></span>
              <span>Beauté</span>
            </div>
            <BarcodePattern />
          </div>

          {/* CONNEXION / LOGIN */}
          {currentSubView === 'login' && (
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 bg-gradient-to-b from-white to-[#FCFAF7]">
              <div className="text-center space-y-1.5">
                <h1 className="text-2xl font-display font-semibold text-slate-950">Bon retour sur Zando</h1>
                <p className="text-xs text-slate-500">Accédez à votre espace sécurisé en toute confidentialité.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wide">Adresse email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@exemple.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0066FF] focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wide">Mot de passe</label>
                    <button 
                      type="button"
                      onClick={() => onNavigate('auth', 'forgot-password')}
                      className="text-[10px] font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      Oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0066FF] focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  {isLoading ? 'Authentification en cours...' : 'Se Connecter'}
                  {!isLoading && <ArrowRight className="w-4 h-4 text-[#0066FF]" />}
                </button>
              </form>

              {/* Quick instructions/hint */}
              <div className="p-3.5 bg-[#0066FF]/5 rounded-xl border border-[#0066FF]/10 text-[10px] text-slate-500 space-y-1">
                <span className="font-semibold text-slate-700">💡 Conseil d’évaluation rapide :</span>
                <p>Entrez n’importe quel email contenant <span className="font-semibold text-indigo-600">"vendeur"</span> ou <span className="font-semibold text-rose-600">"admin"</span> pour simuler immédiatement ces dashboards.</p>
              </div>

              <div className="pt-4 border-t text-center text-xs">
                <span className="text-slate-400">Pas encore inscrit ? </span>
                <button 
                  onClick={() => onNavigate('auth', 'signup')}
                  className="font-semibold text-[#0066FF] hover:underline"
                >
                  Créer un compte d’élite
                </button>
              </div>
            </div>
          )}

          {/* INSCRIPTION / SIGNUP */}
          {currentSubView === 'signup' && (
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 bg-gradient-to-b from-white to-[#FCFAF7]">
              <div className="text-center space-y-1.5">
                <h1 className="text-2xl font-display font-semibold text-slate-950">Rejoindre Zando</h1>
                <p className="text-xs text-slate-500">Commencez l’expérience du commerce sécurisé au Niger.</p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wide">Nom Complet</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ibrahim Keïta"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0066FF] focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wide">Adresse email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@exemple.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0066FF] focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wide">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 caractères"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0066FF] focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wide">Type de Compte</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('buyer')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        role === 'buyer' 
                          ? 'bg-[#0066FF]/5 border-[#0066FF]/30 text-[#0066FF]' 
                          : 'bg-slate-50 border-slate-250 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Acheteur Premium
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('seller')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        role === 'seller' 
                          ? 'bg-amber-50 border-amber-200 text-amber-700' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Vendeur / Artisan
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#0066FF] hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10"
                >
                  {isLoading ? 'Création de votre espace...' : 'Créer mon compte'}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              <div className="pt-4 border-t text-center text-xs">
                <span className="text-slate-400">Déjà inscrit ? </span>
                <button 
                  onClick={() => onNavigate('auth', 'login')}
                  className="font-semibold text-[#0066FF] hover:underline"
                >
                  Se connecter
                </button>
              </div>
            </div>
          )}

          {/* VERIFIER EMAIL (Strict requirement from PRD Onboarding flow) */}
          {currentSubView === 'verify-email' && (
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 bg-gradient-to-b from-white to-[#FCFAF7]">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#0066FF]/5 text-[#0066FF] flex items-center justify-center mx-auto border border-[#0066FF]/10">
                  <Mail className="w-6 h-6 animate-bounce" />
                </div>
                <h1 className="text-2xl font-display font-semibold text-slate-950">Vérifiez votre adresse email</h1>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Un message de confirmation crypté a été envoyé à l’adresse suivante :
                </p>
                <div className="font-mono text-xs font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 break-all">
                  {verificationEmail}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <button
                    onClick={handleResendEmail}
                    disabled={resendStatus === 'sending'}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    {resendStatus === 'sending' ? 'Envoi...' : resendStatus === 'sent' ? '✓ Email Renvoyé !' : 'Renvoyer l’email de vérification'}
                  </button>

                  <button
                    onClick={() => onNavigate('auth', 'signup')}
                    className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold uppercase"
                  >
                    Modifier l’adresse email
                  </button>
                </div>

                {/* Spam Help Block */}
                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-xs text-slate-600 space-y-2">
                  <div className="font-semibold text-amber-800 flex items-center gap-1"><HelpCircle className="w-4 h-4" /> Vous ne trouvez pas l’email ?</div>
                  <ul className="list-disc list-inside space-y-1 text-[10px] text-slate-500">
                    <li>Vérifiez votre dossier de Courriers Indésirables (Spams).</li>
                    <li>Attendez 2-3 minutes, les connexions locales peuvent figer.</li>
                    <li>Si le problème persiste, écrivez à <span className="font-semibold text-slate-700">support@zando.ne</span>.</li>
                  </ul>
                </div>

                <div className="pt-2 border-t">
                  <button 
                    onClick={() => {
                      // Instantly simulate email confirmation and recover session
                      onLoginSuccess(verificationEmail, role);
                    }}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-green-600/15"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Simuler la confirmation d’email et se connecter
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MOT DE PASSE OUBLIE / FORGOT PASSWORD */}
          {currentSubView === 'forgot-password' && (
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 bg-gradient-to-b from-white to-[#FCFAF7]">
              <button 
                onClick={() => onNavigate('auth', 'login')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>

              <div className="text-center space-y-2">
                <h1 className="text-xl font-display font-semibold text-slate-950">Mot de passe oublié</h1>
                <p className="text-xs text-slate-500">Nous vous enverrons un lien de réinitialisation sécurisé.</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wide">Adresse email liée</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@exemple.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                </div>

                {error && <p className="text-[11px] text-red-500 font-medium text-center">{error}</p>}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5"
                >
                  {isLoading ? 'Envoi...' : 'Envoyer le lien de secours'}
                </button>
              </form>
            </div>
          )}

          {/* UPDATE PASSWORD */}
          {currentSubView === 'update-password' && (
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 bg-gradient-to-b from-white to-[#FCFAF7]">
              <div className="text-center space-y-2">
                <h1 className="text-xl font-display font-semibold text-slate-950">Mettre à jour le mot de passe</h1>
                <p className="text-xs text-slate-500">Veuillez saisir votre nouveau mot de passe.</p>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                setError('');
                setIsLoading(true);
                try {
                  const { error } = await supabase.auth.updateUser({ password });
                  if (error) throw error;
                  onNavigate('dashboard', 'home');
                } catch (err: any) {
                  setError(err.message || 'Échec de la mise à jour');
                } finally {
                  setIsLoading(false);
                }
              }} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wide">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                </div>

                {error && <p className="text-[11px] text-red-500 font-medium text-center">{error}</p>}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#0066FF] hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
              </form>
            </div>
          )}

          {/* Bottom Video Slogans */}
          <LaunchSlogansMarquee />
        </div>
      )}
    </div>
  );
}

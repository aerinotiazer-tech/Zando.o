# ZANDO - GUIDE DE DÉPLOIEMENT VERCEL & PRODUCTION

Ce document détaille l'architecture et les étapes nécessaires pour le déploiement en production de Zando sur **Vercel** avec un backend **Supabase**.

## 1. COMPATIBILITÉ VERCEL (FRONTEND NEXT.JS)

L'application est nativement optimisée pour Vercel.

**Contrôles effectués :**
- **Configuration Next.js (`next.config.ts`)** : Standard et compatible Vercel (gestion des images distantes configurée).
- **Commandes de Build** : `next build` par défaut. Vercel le détectera automatiquement (aucune modification requise).
- **Variables d'environnement** : Prêtes à être injectées dans le dashboard Vercel.
- **Rendu** : Vercel gère nativement le Server-Side Rendering (SSR), le Static Site Generation (SSG) et les API Routes de Next.js App Router.

---

## 2. CONFIGURATION DNS & DOMAINE PERSONNALISÉ

Une fois que vous aurez votre nom de domaine (ex: `zando.ne`), voici comment le lier à Vercel.

### Étape 2.1 : Ajouter le domaine sur Vercel
1. Allez dans le Dashboard Vercel > Projet "Zando" > **Settings** > **Domains**.
2. Ajoutez votre domaine `zando.ne` et `www.zando.ne`.

### Étape 2.2 : Configuration DNS (chez votre Registrar ou Cloudflare)
Vercel vous donnera des valeurs exactes à configurer. Vous devrez généralement ajouter :

- **Pour `zando.ne` (Domaine Apex)** : 
  - Type: `A`
  - Name: `@` (ou vide)
  - Value: `76.76.21.21` (IP de Vercel)
  
- **Pour `www.zando.ne` (Sous-domaine)** :
  - Type: `CNAME`
  - Name: `www`
  - Value: `cname.vercel-dns.com`

*Note : Si vous utilisez Cloudflare comme gestionnaire DNS, assurez-vous de désactiver le proxy Cloudflare (petit nuage gris/DNS Only) sur ces enregistrements pour éviter les conflits de certificats SSL avec Vercel, car Vercel gère automatiquement et gratuitement les certificats HTTPS/SSL via Let's Encrypt.*

---

## 3. CONFIGURATION SUPABASE (PRODUCTION)

La séparation entre l'environnement de développement (`localhost`) et la production est critique pour la sécurité et l'expérience utilisateur.

### Étape 3.1 : Variables d'environnement (Dashboard Vercel)
Dans les paramètres de votre projet Vercel (**Settings** > **Environment Variables**), ajoutez :
```env
NEXT_PUBLIC_SUPABASE_URL=https://[VOTRE_PROJET_PROD].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[VOTRE_CLÉ_ANON_PROD]
APP_URL=https://zando.ne
```

### Étape 3.2 : Supabase Auth - Redirect URLs
Pour que les flux d'authentification (Confirmation d'email, Reset Password) redirigent correctement vers l'application :

1. Dans Supabase : **Authentication** > **URL Configuration**.
2. **Site URL** : Remplacez `http://localhost:3000` par votre domaine de production `https://zando.ne`.
3. **Redirect URLs** (URI de redirection autorisées) :
   - `https://zando.ne/*`
   - `https://www.zando.ne/*`
   - *(Gardez `http://localhost:3000/*` uniquement sur votre projet Supabase de développement/staging, pas sur le projet de production).*

*(Le frontend Zando a été configuré pour utiliser `window.location.origin` de manière dynamique lors des appels à `supabase.auth`, ce qui le rend agnostique et fonctionnel à la fois en local et sur Vercel).*

---

## 4. CHECKLIST AVANT LANCEMENT (PRE-FLIGHT)

Avant d'annoncer Zando publiquement, vérifiez ces points sur l'URL Vercel de production :

### 🔒 Sécurité & Variables
- [ ] Le projet Supabase utilisé est bien un nouveau projet dédié à la production (avec des mots de passe forts pour la base de données).
- [ ] Les clés API secrètes (comme le Service Role Key de Supabase) ne sont **PAS** dans les variables d'environnement commençant par `NEXT_PUBLIC_` sur Vercel.
- [ ] Les politiques RLS (Row Level Security) de Supabase sont toutes actives sur les tables.

### 📧 Emails & Authentification
- [ ] L'intégration SMTP externe (Resend/Brevo) est configurée dans Supabase Auth (voir `docs/EMAIL_SETUP.md`) pour éviter les limites d'envoi.
- [ ] Test de création de compte : L'email de confirmation arrive bien.
- [ ] Clic sur le lien de confirmation : Il redirige correctement vers `https://zando.ne` et connecte l'utilisateur.
- [ ] Test de "Mot de passe oublié" fonctionnel de bout en bout.

### 🚀 Déploiement & DNS
- [ ] Le domaine principal charge sans erreur en HTTPS.
- [ ] La redirection `www` vers non-www (ou inversement) fonctionne correctement (Vercel le gère automatiquement selon le domaine défini par défaut).
- [ ] Les images des produits (stockées sur Supabase Storage) s'affichent correctement et les règles de sécurité (RLS) du bucket permettent la lecture publique.

### 🌐 SEO & Performance
- [ ] Les balises Meta, Titres, et descriptions sont correctes pour la page d'accueil et les produits.
- [ ] Le `robots.txt` et le `sitemap.xml` sont accessibles.
- [ ] Soumettre le sitemap généré à Google Search Console une fois le domaine lié.

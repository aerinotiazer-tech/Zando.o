# ZANDO - GUIDE DE DÉPLOIEMENT PRODUCTION

Ce document détaille les étapes et configurations nécessaires pour le déploiement en production de Zando sur l'infrastructure cible (Cloudflare + Supabase).

## ARCHITECTURE CIBLE

- **Frontend & Edge Functions** : Cloudflare Pages (Support Next.js full-stack)
- **DNS & CDN & Sécurité** : Cloudflare
- **Backend & Base de données** : Supabase (PostgreSQL, Auth, Storage)

---

## 1. CONFIGURATION SUPABASE (PROD)

### Base de données & Sécurité
- [ ] Créer un nouveau projet Supabase pour la production (différent du staging).
- [ ] Mettre en place un mot de passe fort pour le rôle `postgres`.
- [ ] Exécuter les migrations SQL (`supabase/migrations/00000000000000_initial_schema.sql`).
- [ ] Vérifier que le mode "Point-in-Time Recovery" (PITR) est activé si le budget le permet.
- [ ] Activer les sauvegardes quotidiennes automatiques.
- [ ] Vérifier que toutes les politiques RLS (Row Level Security) sont activées et strictes. (Aucun accès non autorisé).

### Authentification (Supabase Auth)
- [ ] Configurer le fournisseur d'emails (Resend/Brevo) dans Supabase Auth (Custom SMTP) au lieu de l'email intégré par défaut (limité en production).
- [ ] **Site URL** : Configurer l'URL principale de production (ex: `https://zando.ne`).
- [ ] **Redirect URLs** : Ajouter toutes les URLs de redirection autorisées :
  - `https://zando.ne/*`
  - `https://www.zando.ne/*`
- [ ] Personnaliser les templates d'emails (Confirmation, Reset Password) avec le design Zando et l'URL de production.

### Storage
- [ ] Créer les buckets nécessaires (`public-images`, `secure-documents`).
- [ ] Appliquer les politiques RLS sur les buckets (ex: `public-images` en lecture publique, `secure-documents` accessible uniquement par les admins).
- [ ] Configurer les limites de taille et les types MIME autorisés (images uniquement pour les produits).

---

## 2. CONFIGURATION CLOUDFLARE (DNS & SÉCURITÉ)

### DNS & Domaine
- [ ] Ajouter le domaine `zando.ne` dans Cloudflare.
- [ ] Configurer les serveurs de noms (Nameservers) chez le registrar du domaine pour pointer vers Cloudflare.
- [ ] Configurer les enregistrements DNS nécessaires (MX pour les emails, TXT pour SPF/DKIM/DMARC liés à Brevo/Resend).

### HTTPS & SSL
- [ ] Mode de chiffrement SSL/TLS : Définir sur **Strict (Complet)**.
- [ ] Activer **Toujours utiliser HTTPS** (Always Use HTTPS).
- [ ] Activer **HSTS** (HTTP Strict Transport Security) pour forcer le HTTPS au niveau du navigateur.

### Sécurité & WAF (Web Application Firewall)
- [ ] Activer Cloudflare Bot Management ou le mode "Super Bot Fight Mode".
- [ ] Configurer des règles WAF pour bloquer le trafic malveillant (SQLi, XSS).
- [ ] Activer la protection DDoS standard.
- [ ] (Optionnel) Restreindre l'accès à certaines routes d'administration par IP si nécessaire.

### Performance
- [ ] Activer **Auto Minify** (JS, CSS, HTML).
- [ ] Activer **Brotli compression**.
- [ ] Configurer le cache Cloudflare (règles de page) pour mettre en cache les assets statiques et les images publiques de manière agressive.

---

## 3. CLOUDFLARE PAGES (FRONTEND)

### Configuration du Projet
- [ ] Connecter le dépôt GitHub (branche `main`) à Cloudflare Pages.
- [ ] Framework preset : Sélectionner **Next.js**.
- [ ] Commande de build : `npm run pages:build` (Nécessite `@cloudflare/next-on-pages` si on utilise les features serveur, ou un export statique si on est 100% client-side avec Supabase direct). *Note: Zando utilise Next.js en mode standard, Cloudflare Pages le supporte via l'adaptateur Vercel/Cloudflare.*
- [ ] Dossier de sortie (Output directory) : `.vercel/output/static` (Cloudflare le détecte généralement automatiquement).

### Variables d'Environnement (Cloudflare Pages Settings)
Définir les variables suivantes dans les paramètres de Cloudflare Pages (Environnement de Production) :

```env
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[VOTRE_CLÉ_ANON_DE_PRODUCTION]"
APP_URL="https://zando.ne"
# (Ajouter toute autre clé d'API requise, ex: Stripe, Resend)
```

---

## 4. CHECKLIST AVANT LANCEMENT (PRE-FLIGHT)

### Fonctionnel
- [ ] Flux d'inscription et de connexion testés (avec emails de confirmation réels).
- [ ] Processus complet d'achat (panier, checkout, confirmation) testé.
- [ ] Processus de publication de produit par un vendeur testé.
- [ ] Tableau de bord administrateur fonctionnel et sécurisé.
- [ ] Vérification du rendu sur mobile (iOS Safari, Android Chrome).
- [ ] Liens sociaux et contact footer valides.

### Sécurité & Données
- [ ] Aucune variable d'environnement sensible (ex: `SUPABASE_SERVICE_ROLE_KEY`) n'est exposée côté client (pas de préfixe `NEXT_PUBLIC_`).
- [ ] Les règles RLS Supabase sont testées en tant qu'utilisateur anonyme, acheteur, et vendeur pour s'assurer qu'il n'y a pas de fuite de données (cross-tenant data leak).
- [ ] Les erreurs API renvoient des messages génériques en production, sans exposer de stack trace SQL.

### SEO & Performance
- [ ] Générer un rapport Lighthouse (Performance > 90, Accessibilité > 90, SEO > 90).
- [ ] Vérifier que le fichier `robots.txt` est accessible et configuré pour l'indexation.
- [ ] Vérifier que `sitemap.xml` est généré et accessible.
- [ ] Tester les balises OpenGraph et Twitter Cards avec un validateur (ex: Facebook Sharing Debugger).
- [ ] S'assurer que les images sont optimisées (format WebP, chargement lazy, dimensions spécifiées).
- [ ] Les données structurées (JSON-LD) sont présentes et valides sur la page d'accueil, les produits et les catégories.

### Lancement
- [ ] Vider le cache de Cloudflare après le déploiement final.
- [ ] Soumettre le `sitemap.xml` à Google Search Console.
- [ ] Surveillance : Configurer une alerte de disponibilité (ex: UptimeRobot) sur la page d'accueil.

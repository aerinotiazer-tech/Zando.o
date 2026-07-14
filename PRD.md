# ZANDO - PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1. Vision Produit
Devenir l'infrastructure de commerce digital de référence et de confiance au Niger, en commençant par Niamey. Zando n'est pas qu'une simple plateforme de vente, c'est un écosystème premium garantissant des transactions fluides, sécurisées et valorisantes pour tous les acteurs.

## 2. Problème Résolu
- **Pour les acheteurs** : Manque de confiance (fraudes, produits non conformes), expériences utilisateur fragmentées et peu adaptées au contexte local mobile-first.
- **Pour les vendeurs** : Difficulté à se démarquer, manque d'outils professionnels simples pour gérer l'inventaire, les commandes et bâtir une réputation en ligne.

## 3. Proposition de Valeur
- **Qualité Apple** : Une interface d'une simplicité absolue, intuitive et esthétique.
- **Qualité Airbnb** : Un système basé sur la confiance visuelle, la réassurance et des profils vérifiés.
- **Qualité Stripe** : Des flux transactionnels et des dashboards d'une clarté et d'une efficacité redoutables.
- **Optimisé Local** : Mobile-first, rapide, léger, avec des méthodes de suivi adaptées au Niger.

---

## 4. Utilisateurs Cibles et Parcours Complets

### A. L'Acheteur
**Profil** : Citadin connecté, exigeant sur la qualité, cherchant la sécurité avant tout.
**Parcours :**
1. **Découverte** via SEO, AI Search ou réseaux sociaux.
2. **Inscription/Connexion** fluide (Magic Link ou Email/Password avec vérification claire).
3. **Exploration** : Recherche intelligente, filtrage par catégories, prix, et vendeurs vérifiés.
4. **Décision** : Consultation de la fiche produit (images HD, détails structurés, réassurance).
5. **Achat** : Ajout au panier, tunnel de commande (Checkout) sans friction.
6. **Post-achat** : Suivi de commande, réception, et dépôt d'un avis vérifié.

### B. Le Vendeur
**Profil** : Commerçant local, créateur ou marque souhaitant professionnaliser sa vente en ligne.
**Parcours :**
1. **Onboarding** : Création de compte et soumission du dossier KYC (pièce d'identité).
2. **Configuration** : Après validation par l'Admin, création de la vitrine (logo, bannière, description).
3. **Opérationnel** : Ajout de produits (images, prix, variantes, stock).
4. **Vente** : Notification de commande, mise à jour des statuts (en préparation, expédié).
5. **Gestion** : Suivi des revenus et statistiques via le dashboard vendeur.

### C. L'Administrateur
**Profil** : Équipe interne Zando.
**Parcours :**
1. **Contrôle** : Vue globale sur l'activité (GMV, nouveaux inscrits).
2. **Modération** : Examen et validation/rejet des dossiers vendeurs (KYC).
3. **Qualité** : Modération du catalogue produits (lutte contre les contrefaçons).
4. **Support** : Gestion des litiges et utilisateurs.

---

## 5. Fonctionnalités (MVP vs Futures)

### MVP (Produit Minimum Viable)
- Authentification sécurisée (Supabase Auth).
- Profils acheteurs et boutiques vendeurs.
- Catalogue de produits avec recherche et filtres de base.
- Fiches produits détaillées.
- Panier d'achat et Checkout optimisé.
- Système de confiance basique (Badge "Vendeur Vérifié").
- Dashboard Vendeur (CRUD produits, gestion simple des commandes).
- Dashboard Admin (Modération et KPIs basiques).
- Emails transactionnels (SMTP Resend/Brevo).

### Fonctionnalités Futures (Post-MVP)
- **AI Search Optimization** : Recherche sémantique propulsée par l'IA.
- **Paiements Locaux** : Intégration native Mobile Money (Airtel, Moov).
- **Messagerie temps réel** : Chat direct acheteur/vendeur.
- **Programme de fidélité** et parrainage.
- **Application Mobile Native**.
- **Logistique** : Intégration avec des livreurs partenaires.

---

## 6. Règles UX & Design System
- **Mobile-First** : Conception prioritaire pour les écrans mobiles (cibles principales).
- **Minimalisme & Premium** : Espaces blancs généreux, typographie soignée (Inter), aucune fioriture visuelle inutile.
- **Zéro Friction** : Minimiser le nombre d'étapes (règle des 3 clics).
- **Architecture de l'information** : Données structurées, hiérarchie visuelle évidente.
- **Feedback Immédiat** : Toasts, états de chargement (skeletons), validations visuelles claires.

---

## 7. Architecture Fonctionnelle (Pages & Dashboards)

**Front-Office (Acheteurs & Public)**
- `/` : Landing Page / Accueil.
- `/search` : Résultats de recherche et filtres.
- `/product/[id]` : Fiche Produit (PDP).
- `/shop/[id]` : Vitrine d'un Vendeur.
- `/cart` & `/checkout` : Panier et Tunnel de commande.
- `/account/*` : Profil utilisateur, historique des commandes, favoris.

**Back-Office (Vendeurs) - `/seller/*`**
- `/seller/dashboard` : Vue d'ensemble, KPIs des ventes.
- `/seller/products` : Inventaire (Ajout, modification, suppression).
- `/seller/orders` : Suivi et traitement des commandes clients.
- `/seller/settings` : Paramètres de la boutique et profil public.

**Back-Office (Admins) - `/admin/*`**
- `/admin/overview` : Tableau de bord analytique global.
- `/admin/users` & `/admin/sellers` : Gestion et modération KYC.
- `/admin/products` : Modération du catalogue.
- `/admin/newsletters` : Outil d'envoi de communications.

---

## 8. Système de Confiance & Sécurité
- **Identité (KYC)** : Vérification obligatoire des vendeurs avant publication.
- **Avis Vérifiés** : Seuls les acheteurs avec une commande "Livrée" peuvent évaluer.
- **Modération Proactive** : Signalement utilisateur et validation Admin.
- **Sécurité Data (Supabase)** : Row Level Security (RLS) strict. Un vendeur ne peut accéder qu'à ses propres commandes et données. Aucune exposition des données admin.

---

## 9. Notifications & Newsletters
- **Emails Transactionnels** : Vérification d'email, confirmation de commande, mise à jour d'expédition (vendeur -> acheteur).
- **Notifications In-App** : Pastilles sur le dashboard pour les nouvelles commandes.
- **Newsletters (Marketing)** : Curations, "Vendeurs de la semaine", annonces de fonctionnalités. Orienté sur l'expertise et la confiance.

---

## 10. Analytics & Métriques de Succès
- **Acquisition** : Trafic organique, Coût d'Acquisition Client (CAC).
- **Activation** : Taux de conversion Visiteur -> Acheteur (Checkout completion rate).
- **Rétention** : Customer Lifetime Value (CLV), taux de réachat.
- **Marketplace Liquidity** : % de vendeurs ayant vendu dans les 30 derniers jours.
- **Performance Opérationnelle** : Temps moyen de traitement d'une commande par le vendeur.

---

## 11. SEO, GEO & AI Search Optimization
- **SEO Classique** : SSR (Next.js), URLs sémantiques, sitemap.xml, balises meta dynamiques.
- **GEO (Generative Engine Optimization)** : Implémentation stricte du Schema.org (Product, AggregateRating, Organization).
- **Contenu structuré** : Descriptions claires, spécifications lisibles par les LLMs (Google AI Overview, ChatGPT Search) pour se positionner comme l'expert commerce au Niger.

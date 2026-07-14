# Zando : Architecture Backend (Supabase)

Ce document définit l'architecture backend professionnelle pour Zando, conçue pour Supabase (PostgreSQL, Auth, Storage, Realtime).

## 1. Gestion des Rôles (Auth & Custom Claims)

L'authentification est gérée par **Supabase Auth**. Les rôles sont définis via les métadonnées de l'utilisateur (ou une table `users` synchronisée).

*   **Acheteur (Buyer)** : Rôle par défaut à l'inscription. Peut naviguer, ajouter aux favoris, commander et laisser des avis.
*   **Vendeur (Seller)** : Nécessite une validation KYC par un Admin. Peut gérer son catalogue, ses stocks, ses commandes reçues et communiquer avec les acheteurs.
*   **Admin** : Rôle restreint (attribué manuellement). Accès total au back-office, modération (KYC, produits signalés), gestion des newsletters et analytics.

---

## 2. Modèle de Données (PostgreSQL)

### Profils & Boutiques
*   `users` : Synchronisée avec `auth.users` via Trigger.
    *   *Colonnes* : `id` (PK, UUID), `email`, `full_name`, `role` (enum), `avatar_url`, `phone`, `city`, `created_at`.
*   `sellers_profiles` : Informations spécifiques aux vendeurs.
    *   *Colonnes* : `id` (PK, FK `users.id`), `store_name`, `description`, `kyc_status` (pending, approved, rejected), `kyc_documents` (JSON), `rating_avg`, `created_at`.

### Catalogue
*   `categories` : Arborescence des catégories (Mode, Tech, Beauté).
    *   *Colonnes* : `id` (PK), `slug`, `name`, `parent_id` (FK `categories.id`), `is_active`.
*   `products` : Annonces des vendeurs.
    *   *Colonnes* : `id` (PK), `seller_id` (FK `users.id`), `category_id` (FK), `title`, `description`, `price` (Numeric), `stock` (Int), `status` (draft, active, suspended), `created_at`.
*   `product_images` : Stockage des URLs d'images.
    *   *Colonnes* : `id` (PK), `product_id` (FK), `storage_path`, `display_order`.

### Commandes & Transactions
*   `orders` : Panier validé par un acheteur.
    *   *Colonnes* : `id` (PK), `buyer_id` (FK), `total_amount`, `shipping_address` (JSON), `payment_method` (mobile_money, cash), `status` (pending, confirmed, delivered, cancelled), `created_at`.
*   `order_items` : Lignes de la commande, divisées par vendeur.
    *   *Colonnes* : `id` (PK), `order_id` (FK), `product_id` (FK), `seller_id` (FK), `quantity`, `unit_price_at_purchase`, `item_status` (processing, shipped, delivered).

### Interactions & Social
*   `favorites` : Favoris des utilisateurs.
    *   *Colonnes* : `buyer_id` (PK, FK), `product_id` (PK, FK), `created_at`.
*   `reviews` : Avis après achat vérifié.
    *   *Colonnes* : `id` (PK), `order_item_id` (FK, unique pour éviter les doubles avis), `buyer_id` (FK), `product_id` (FK), `rating` (1-5), `comment`, `created_at`.

### Messagerie & Notifications
*   `conversations` : Fil de discussion entre acheteur et vendeur.
    *   *Colonnes* : `id` (PK), `buyer_id` (FK), `seller_id` (FK), `product_id` (FK, optionnel), `updated_at`.
*   `messages` : Contenu du chat.
    *   *Colonnes* : `id` (PK), `conversation_id` (FK), `sender_id` (FK), `content`, `is_read` (Boolean), `created_at`.
*   `notifications` : Centre de notification in-app.
    *   *Colonnes* : `id` (PK), `user_id` (FK), `type` (order_update, new_message, kyc_alert), `title`, `body`, `is_read`, `created_at`.

### Marketing & Data
*   `newsletters` : Inscriptions email.
    *   *Colonnes* : `id`, `email` (Unique), `status` (subscribed, unsubscribed), `created_at`.
*   `analytics_events` : Tracking RGPD-compliant.
    *   *Colonnes* : `id`, `event_type` (page_view, add_to_cart, purchase), `user_id` (FK, nullable), `properties` (JSONB), `created_at`.

---

## 3. Sécurité & RLS (Row Level Security)

Toutes les tables PostgreSQL doivent avoir la RLS activée (`ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`).

*   **`users`** :
    *   *Select* : Tout le monde (pour afficher les noms/avatars).
    *   *Update* : `auth.uid() = id` (L'utilisateur lui-même).
*   **`sellers_profiles`** :
    *   *Select* : Tout le monde (profil public).
    *   *Update* : `auth.uid() = id`.
*   **`products`** :
    *   *Select* : Tout le monde si `status = 'active'`.
    *   *Insert/Update/Delete* : `auth.uid() = seller_id` ET profil vendeur approuvé.
*   **`orders` & `order_items`** :
    *   *Select* : `auth.uid() = buyer_id` OU `auth.uid() = seller_id` (un vendeur ne voit que ses `order_items`).
    *   *Insert* : `auth.uid() = buyer_id`.
*   **`messages`** :
    *   *Select/Insert* : `auth.uid() = sender_id` OU `auth.uid() = receiver_id` (via la conversation).

> **Admin Bypass** : Une politique globale permet aux rôles `admin` de contourner ces restrictions pour lire/modifier toute donnée (modération, support client).

---

## 4. Supabase Storage (Buckets)

*   **`avatars`** (Public) : Photos de profil. RLS : Tout le monde peut lire. Seul le propriétaire peut uploader/supprimer.
*   **`product_images`** (Public) : Images du catalogue. RLS : Tout le monde peut lire. Seuls les vendeurs vérifiés peuvent uploader/supprimer.
*   **`kyc_documents`** (Privé) : Pièces d'identité, RCCM. RLS : Seul le propriétaire (envoi) et les Admins (lecture/validation) y ont accès. **Protection stricte des données personnelles**.

---

## 5. Workflows Métier & Supabase Edge Functions

1.  **Onboarding Vendeur (KYC)** :
    *   L'utilisateur soumet ses documents (`kyc_documents`).
    *   Création d'une ligne `sellers_profiles` avec `kyc_status = 'pending'`.
    *   Notification déclenchée pour l'Admin.
    *   Si validé par l'Admin -> `kyc_status = 'approved'`, rôle utilisateur mis à jour vers `seller`.
2.  **Achat Sécurisé** :
    *   L'acheteur valide son panier.
    *   Une **RPC (Remote Procedure Call)** ou **Edge Function** est recommandée pour insérer la commande, vérifier les stocks, et décrémenter atomiquement `products.stock` pour éviter les conflits concurrents (race conditions).
3.  **Envoi d'Email marketing (Newsletters)** :
    *   L'Admin déclenche une campagne.
    *   Une **Edge Function** récupère les abonnés dans `newsletters` et interagit avec l'API SMTP (Resend/Brevo) pour l'envoi en masse, sans surcharger la base de données.

---

## 6. Realtime (WebSockets)

Supabase Realtime est utilisé pour rendre l'expérience "vivante" sans rafraîchissement :

*   **Chat Acheteur/Vendeur** : Souscription aux `INSERT` sur la table `messages` où `conversation_id` est actif.
*   **Notifications Vendeur** : Souscription aux `INSERT` sur `notifications` (ex: "Nouvelle commande reçue").
*   **Dashboard Admin** : (Optionnel) Souscription aux nouvelles requêtes KYC (`sellers_profiles`) ou achats en direct.

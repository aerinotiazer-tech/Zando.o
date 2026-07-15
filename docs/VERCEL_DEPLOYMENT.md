# ZANDO - GUIDE DE DÉPLOIEMENT VERCEL (PRODUCTION)

Ce document détaille les étapes et configurations nécessaires pour déployer Zando sur Vercel, avec une configuration de domaine personnalisé (DNS) et la liaison avec Supabase.

## 1. COMPATIBILITÉ VERCEL (VÉRIFICATION)

Le projet est nativement compatible avec Vercel :
- **Framework** : Next.js 15+ (App Router).
- **Build Command** : `npm run build` (`next build`).
- **Output Directory** : `.next` (Vercel gère cela automatiquement, pas besoin de `output: "export"` sauf si 100% statique, ici nous avons des routes API et du SSR possible).
- **Images** : L'optimisation des images Vercel fonctionnera nativement grâce au composant `<Image />` de Next.js.
- **API Routes / Server Actions** : Déployées automatiquement comme Serverless Functions.

## 2. DÉPLOIEMENT VERCEL INITIAL

1. Connectez-vous à votre compte [Vercel](https://vercel.com/).
2. Cliquez sur **Add New...** > **Project**.
3. Importez le dépôt GitHub (ou GitLab/Bitbucket) contenant le projet Zando.
4. **Configuration du projet** :
   - **Framework Preset** : Next.js (Vercel le détectera automatiquement).
   - **Root Directory** : `./` (laissez par défaut).
   - **Build Command** : Laissez par défaut (`npm run build`).
   - **Output Directory** : Laissez par défaut (`.next`).
5. **Variables d'Environnement** : Ajoutez les variables suivantes dans la section Environment Variables (onglet Production, Preview et Development si nécessaire) :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[VOTRE_PROJECT_ID].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[VOTRE_CLÉ_ANON]
   APP_URL=https://zando.ne
   # Ajouter GEMINI_API_KEY si vous utilisez l'IA en production
   ```
6. Cliquez sur **Deploy**.

## 3. CONFIGURATION DNS & DOMAINE PERSONNALISÉ (zando.ne)

Pour relier votre domaine (ex: `zando.ne`) à Vercel :

### Dans Vercel :
1. Allez dans les paramètres de votre projet Vercel > **Settings** > **Domains**.
2. Ajoutez votre domaine `zando.ne` et `www.zando.ne`.
3. Vercel vous fournira les enregistrements DNS à configurer.

### Chez votre fournisseur de domaine (ex: Cloudflare, Namecheap, GoDaddy) :
Vous devez ajouter ces enregistrements DNS (généralement ceux de Vercel) :

| Type | Nom/Host | Valeur/Cible |
| :--- | :--- | :--- |
| A | `@` (ou zando.ne) | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

*Note : Si vous utilisez Cloudflare comme DNS, assurez-vous de désactiver le proxy (nuage gris / "DNS Only") pour ces enregistrements, car Vercel gère son propre certificat SSL (Let's Encrypt) et CDN.*

**HTTPS** : Vercel génère et gère automatiquement le certificat SSL pour votre domaine dès que les DNS sont propagés. Le HTTPS est forcé par défaut.

## 4. CONFIGURATION SUPABASE (PRODUCTION)

Une fois que vous connaissez votre domaine final (`https://zando.ne` ou l'URL fournie par Vercel temporairement comme `https://zando-xxx.vercel.app`) :

### Authentication > URL Configuration
1. **Site URL** : Modifiez l'URL de base pour correspondre à la production : `https://zando.ne` (ou l'URL Vercel).
2. **Redirect URLs** : Ajoutez l'URL de production avec un wildcard. C'est critique pour le flux SMTP / Reset password :
   - `https://zando.ne/*`
   - `https://www.zando.ne/*`
   - *(Gardez `http://localhost:3000/*` pour continuer le développement)*

### Emails & SMTP
- Assurez-vous que Supabase est bien configuré avec votre SMTP externe (Resend) comme expliqué dans le fichier `EMAIL_SETUP.md`. Les templates d'emails doivent pointer vers l'URL de production via `{{ .ConfirmationURL }}`.

## 5. CHECKLIST AVANT LANCEMENT

- [ ] **Déploiement Vercel réussi** (Statut "Ready", aucune erreur de build).
- [ ] **Domaine connecté** (Le statut du domaine sur Vercel est "Valid Configuration" avec le badge SSL).
- [ ] **Variables d'environnement vérifiées** (Les clés Supabase Prod sont bien dans Vercel, aucune clé secrète exposée en `NEXT_PUBLIC_`).
- [ ] **Site URL Supabase à jour** (`https://zando.ne` au lieu de `localhost`).
- [ ] **Redirect URLs Supabase à jour**.
- [ ] **Test d'inscription complet** : Créer un compte, recevoir l'email, cliquer sur le lien, et atterrir avec succès sur la production en étant connecté.
- [ ] **Test de réinitialisation de mot de passe** depuis la production.
- [ ] **Mise à jour SEO** : Vérifier que Google peut indexer le site (vérifiez que le sitemap et le robots.txt utilisent la bonne `APP_URL`).

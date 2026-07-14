# ZANDO - CONFIGURATION EMAIL PREMIUM (SUPABASE + RESEND)

Ce document explique comment configurer les emails transactionnels (Confirmation, Réinitialisation de mot de passe) sans exposer aucune clé dans le frontend. 
**L'application Zando communique uniquement avec Supabase Auth. C'est Supabase qui s'occupe de l'envoi d'emails via le SMTP de Resend.**

## 1. CONFIGURATION DE RESEND (Fournisseur SMTP)

1. Créez un compte sur [Resend](https://resend.com/).
2. Ajoutez et vérifiez votre domaine professionnel (ex: `zando.ne`).
   - Ajoutez les enregistrements DNS demandés (MX, TXT, CNAME) dans Cloudflare.
3. Générez une clé API (API Key) avec les permissions d'envoi.
4. Récupérez vos accès SMTP Resend :
   - **Host** : `smtp.resend.com`
   - **Port** : `465`
   - **User** : `resend`
   - **Password** : `re_votrecrète_apikey`

---

## 2. CONFIGURATION SUPABASE SMTP

Rendez-vous dans le tableau de bord Supabase : **Authentication > Providers > Email**.

1. Activez **Enable Email Provider**.
2. **Confirm email** : Activé (ON).
3. Activez **Enable Custom SMTP**.
4. Remplissez les champs avec les données de Resend :
   - Sender Name : `Zando`
   - Sender Email : `bonjour@zando.ne` (doit être un email de votre domaine vérifié)
   - Host : `smtp.resend.com`
   - Port : `465`
   - User : `resend`
   - Password : `re_votrecrète_apikey`
   - Sender signature : Laissez vide ou mettez la signature Zando.

---

## 3. REDIRECT URLS (SUPABASE AUTH)

Rendez-vous dans **Authentication > URL Configuration**.

- **Site URL** : `https://zando.ne`
- **Redirect URLs** :
  Ajoutez l'URL exacte pour la récupération et la confirmation de compte.
  - `https://zando.ne/*`
  - `http://localhost:3000/*` (pour le développement local)

*Note : Le frontend a été mis à jour pour transmettre `emailRedirectTo: window.location.origin + '/'` lors de l'inscription et la récupération de mot de passe.*

---

## 4. TEMPLATES D'EMAIL PREMIUM (Dans Supabase)

Rendez-vous dans **Authentication > Email Templates**.
Remplacez les templates par défaut par le code HTML Zando.

### 4.1. Template de Confirmation d'Inscription (Confirm Signup)

**Sujet** : `Bienvenue sur Zando — Confirmez votre compte`

**Corps (Source HTML)** :
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px 20px;">
  <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); text-align: center;">
    <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 8px;">ZANDO</h1>
    <p style="color: #64748b; font-size: 14px; margin-bottom: 32px; text-transform: uppercase; letter-spacing: 1px;">Marketplace Premium au Niger</p>
    
    <h2 style="color: #0f172a; font-size: 20px; font-weight: 600; margin-bottom: 16px;">Vérifiez votre adresse email</h2>
    <p style="color: #475569; font-size: 16px; line-height: 1.5; margin-bottom: 32px;">
      Merci d'avoir rejoint Zando. Veuillez cliquer sur le bouton ci-dessous pour vérifier votre compte et accéder à votre espace sécurisé.
    </p>
    
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #0066FF; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Confirmer mon compte
    </a>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0 24px;" />
    
    <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
      Si vous n'avez pas créé de compte sur Zando, vous pouvez ignorer cet email en toute sécurité.<br />
      © 2026 Zando Niger. Tous droits réservés.
    </p>
  </div>
</div>
```

### 4.2. Template de Réinitialisation (Reset Password)

**Sujet** : `Zando — Réinitialisation de votre mot de passe`

**Corps (Source HTML)** :
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px 20px;">
  <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); text-align: center;">
    <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 8px;">ZANDO</h1>
    <p style="color: #64748b; font-size: 14px; margin-bottom: 32px; text-transform: uppercase; letter-spacing: 1px;">Marketplace Premium au Niger</p>
    
    <h2 style="color: #0f172a; font-size: 20px; font-weight: 600; margin-bottom: 16px;">Réinitialisation du mot de passe</h2>
    <p style="color: #475569; font-size: 16px; line-height: 1.5; margin-bottom: 32px;">
      Vous avez demandé à réinitialiser le mot de passe de votre compte Zando. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe sécurisé.
    </p>
    
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Mettre à jour mon mot de passe
    </a>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0 24px;" />
    
    <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
      Si vous n'avez pas demandé de réinitialisation, veuillez ignorer cet email ou contacter notre support.<br />
      © 2026 Zando Niger. Tous droits réservés.
    </p>
  </div>
</div>
```

---

## 5. VÉRIFICATION DU PARCOURS COMPLET

1. **Inscription** : Un utilisateur s'inscrit sur Zando.
2. **Transmission URL** : Le client frontend demande à Supabase Auth de créer le compte avec `emailRedirectTo`.
3. **Envoi via SMTP** : Supabase s'authentifie sur Resend via SMTP et envoie l'email. *(Aucun appel n'est fait par Next.js).*
4. **Réception & Clic** : L'utilisateur reçoit l'email (design premium Zando), et clique sur le lien.
5. **Confirmation** : L'utilisateur arrive sur une route interne de Supabase qui valide le token.
6. **Redirection** : Supabase redirige l'utilisateur vers Zando (`https://zando.ne/#access_token=...`).
7. **Session Active** : Le frontend intercepte le hash, charge la session locale et affiche l'Espace Utilisateur.

# ✅ CHECKLIST COMPLÈTE - Actions Détaillées

## 📋 Vue d'ensemble
Vous avez reçu tous les fichiers et configurations pour déployer votre projet sur **Vercel + Supabase**. 
Suivez cette checklist étape par étape.

---

## 🔧 PHASE 1 : Configuration Supabase (10 min)

### 1.1 Créer un compte Supabase
- [ ] Allez sur https://supabase.com
- [ ] Cliquez "Sign Up" ou "Log In"
- [ ] Vérifiez votre email

### 1.2 Créer un nouveau projet
- [ ] Cliquez "New Project"
- [ ] **Project name** : `trains-catalog`
- [ ] **Password** : Générez quelque chose de fort (utilisez un gestionnaire de mots de passe)
- [ ] **Region** : Sélectionnez `Europe (Frankfurt)` ou la plus proche
- [ ] Attendez le déploiement (≈ 2 minutes)

### 1.3 Récupérer les clés API
- [ ] Allez dans **Settings** → **API**
- [ ] Copiez **Project URL** → Gardez-la
  ```
  https://xxxxxxxxxxxxxx.supabase.co
  ```
- [ ] Copiez **anon public** (la clé, pas service_role)
  ```
  eyJhbGc...xxxxxxxx
  ```
- [ ] Sauvegardez dans un fichier sécurisé (ex: fichier texte chiffré)

### 1.4 Créer les tables
- [ ] Allez dans **SQL Editor** (menu de gauche)
- [ ] Cliquez "New query"
- [ ] Ouvrez le fichier `supabase_migration.sql` de votre projet
- [ ] Copiez **TOUT** le contenu
- [ ] Collez dans l'éditeur Supabase
- [ ] Cliquez "Run" (triangle ▶️ en haut à droite)
- [ ] ✅ Attendez "Success" en vert

---

## 📝 PHASE 2 : Configuration Locale (15 min)

### 2.1 Installer Node.js
- [ ] Téléchargez depuis https://nodejs.org (LTS)
- [ ] Installez (acceptez tous les défauts)
- [ ] Vérifiez dans PowerShell : 
  ```powershell
  node --version
  npm --version
  ```

### 2.2 Configurer les variables d'environnement
- [ ] Ouvrez le fichier `.env.local` dans le dossier `trains/`
- [ ] Remplacez les valeurs :
  ```
  VITE_SUPABASE_URL=https://xxxxxxxxxxxxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGc...xxxxx
  ```
- [ ] **IMPORTANT** : Ne committez JAMAIS `.env.local` sur GitHub!

### 2.3 Installer les dépendances
- [ ] Ouvrez PowerShell dans le dossier `trains/`
- [ ] Exécutez :
  ```powershell
  npm install
  ```
- [ ] ✅ Attendez la fin (peut prendre 1-2 min)

### 2.4 Tester en local
- [ ] Toujours dans le dossier `trains/`
- [ ] Exécutez :
  ```powershell
  npm run dev
  ```
- [ ] Ouvrez http://localhost:3000/public/index.html
- [ ] ✅ Vous devriez voir le formulaire d'ajout de train

---

## 📊 PHASE 3 : Migration des Données (variable selon taille)

### 3.1 Migrer les données MySQL → Supabase

**Option A : Exporter en CSV** (Plus simple)
1. [ ] Ouvrez phpMyAdmin (http://localhost/phpmyadmin)
2. [ ] Sélectionnez `trains_db`
3. [ ] Pour chaque table :
   - [ ] Cliquez sur la table (ex: `trains`)
   - [ ] Cliquez "Export"
   - [ ] Format : "CSV"
   - [ ] Cliquez "Go"
4. [ ] Dans Supabase Studio :
   - [ ] Allez dans l'onglet de la table (ex: **trains**)
   - [ ] Cliquez "Insert" → "Import data"
   - [ ] Sélectionnez votre fichier CSV
   - [ ] Cliquez "Import"
5. [ ] Répétez pour : `trains`, `medias`, `trains_medias`

**Option B : Script Node.js** (Automatisé)
1. [ ] Créez un fichier `migrate.js` dans le dossier `trains/`
2. [ ] Installez le driver MySQL :
   ```powershell
   npm install mysql2
   ```
3. [ ] Copiez ce code dans `migrate.js` :
   ```javascript
   // ... (voir DEPLOY_GUIDE.md)
   ```
4. [ ] Exécutez :
   ```powershell
   node migrate.js
   ```

### 3.2 Vérifier la migration
- [ ] Dans Supabase Studio
- [ ] Cliquez "Table Editor"
- [ ] Sélectionnez `trains`
- [ ] ✅ Vous devriez voir vos données

---

## 🚀 PHASE 4 : Déploiement Vercel (20 min)

### 4.1 Initialiser Git
- [ ] PowerShell dans le dossier `trains/`
- [ ] Exécutez :
  ```powershell
  git init
  git config user.name "Votre Nom"
  git config user.email "votre@email.com"
  git add .
  git commit -m "Initial commit: Vercel and Supabase ready"
  ```

### 4.2 Pousser sur GitHub
- [ ] Allez sur https://github.com
- [ ] Cliquez "New repository"
- [ ] **Repository name** : `trains`
- [ ] ❌ Ne sélectionnez PAS "Initialize with README"
- [ ] Cliquez "Create repository"
- [ ] Retournez à PowerShell :
  ```powershell
  git remote add origin https://github.com/VOTRE_USERNAME/trains.git
  git branch -M main
  git push -u origin main
  ```

### 4.3 Connecter Vercel
- [ ] Allez sur https://vercel.com
- [ ] Cliquez "Sign Up" (ou connectez-vous)
- [ ] Cliquez "Import Project"
- [ ] Sélectionnez "GitHub" → Autorisez Vercel
- [ ] Sélectionnez votre dépôt `trains`
- [ ] Cliquez "Import"

### 4.4 Configurer les variables Vercel
- [ ] Dans la page du projet Vercel, cliquez "Settings"
- [ ] Allez dans **Environment Variables**
- [ ] Ajoutez 2 variables :

**Variable 1 :**
- Name: `VITE_SUPABASE_URL`
- Value: `https://xxxxxxxxxxxxxx.supabase.co`

**Variable 2 :**
- Name: `VITE_SUPABASE_ANON_KEY`  
- Value: `eyJhbGc...xxxxx`

- [ ] Cliquez "Save"

### 4.5 Déployer
- [ ] Cliquez "Deployments" (en haut)
- [ ] Sélectionnez le déploiement en cours
- [ ] ✅ Attendez "Ready" (vert)
- [ ] Cliquez le lien pour voir votre site

---

## 🎯 PHASE 5 : Tests Finaux (5 min)

### 5.1 Tester sur Vercel
- [ ] Ouvrez votre URL Vercel (ex: `https://trains-xxxxx.vercel.app`)
- [ ] Allez sur `/public/index.html`
- [ ] ✅ Vérifiez le formulaire charge les données
- [ ] Allez sur `/public/galerie.html`
- [ ] ✅ Vérifiez la galerie affiche les trains

### 5.2 Tester les formulaires
- [ ] Essayez d'ajouter un train via `/public/index.html`
- [ ] ✅ Le train doit apparaître dans Supabase
- [ ] Vérifiez dans Supabase Studio → **trains**

---

## 📋 Fichiers Créés/Modifiés

### ✅ Créés
- `supabase_migration.sql` - Schéma PostgreSQL
- `package.json` - Dépendances
- `.env.local` - Config locale
- `.env.example` - Template
- `.gitignore` - Fichiers à ignorer
- `vercel.json` - Config Vercel
- `DEPLOY_GUIDE.md` - Guide détaillé
- `js/app.js` - Gestion formulaires + Supabase
- `js/galerie.js` - Affichage galerie
- `public/index.html` - Converti de PHP
- `public/galerie.html` - Nouveau
- `ACTIONS_CHECKLIST.md` - Ce fichier

### ⚠️ À SUPPRIMER (optionnel mais recommandé)
```
- api/                    (dossier entier)
- config/                 (dossier entier)
- public/index.php        (ancienne version)
- public/galerie.php      (ancienne version)
- js/media-train.js       (si inutilisé)
```

---

## 🆘 Problèmes Courants

### "Cannot find module '@supabase/supabase-js'"
```
→ Solution: npm install @supabase/supabase-js
```

### "Clés Supabase non configurées"
```
→ Vérifiez .env.local (format correct)
→ Vérifiez les variables Vercel Settings
→ Redéployez après changements
```

### "Erreur 404 galerie.html"
```
→ URL correcte: /public/galerie.html (pas /galerie.html)
```

### "Les images ne s'affichent pas"
```
→ Vérifiez que les chemins d'images sont corrects
→ Utilisez des URLs absolues ou upload sur un CDN
```

### "Données non migrées"
```
→ Vérifiez supabase_migration.sql a bien exécuté
→ Vérifiez la migration CSV/Node.js
→ Consultez Supabase Studio Table Editor
```

---

## 📞 Support

### Ressources Officielles
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)

### Vérification de la Configuration
```javascript
// Pour tester Supabase dans la console (F12):
console.log(window.trains)
window.trains.init()
```

---

## 🎉 Félicitations!

Vous avez maintenant:
- ✅ Un site statique deployable sur Vercel
- ✅ Une base de données Supabase
- ✅ API serverless (pas de serveur PHP)
- ✅ Scalabilité garantie
- ✅ Coût = presque gratuit (Supabase free tier)

**Prochaines améliorations possibles :**
1. Ajouter l'authentification (Supabase Auth)
2. Upload de fichiers (Supabase Storage)
3. PWA (Progressive Web App)
4. Notifications en temps réel (Supabase Realtime)

Bonne chance! 🚂✨

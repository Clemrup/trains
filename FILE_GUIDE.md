# 📁 Structure Complète du Projet - Guide des Fichiers

## Vue d'ensemble de la nouvelle structure

```
trains/
├── 📄 Configuration & Documentation
│   ├── package.json                  ← NPM dépendances
│   ├── .env.local                    ← Clés Supabase (LOCAL ONLY)
│   ├── .env.example                  ← Template pour Vercel
│   ├── .gitignore                    ← Fichiers ignorés Git
│   ├── vercel.json                   ← Config Vercel
│   ├── README.md                     ← Documentation principale (MIS À JOUR)
│   ├── DEPLOY_GUIDE.md               ← Guide détaillé complet ⭐
│   ├── ACTIONS_CHECKLIST.md          ← Checklist étape par étape ⭐
│   ├── QUICKSTART.md                 ← 30 minutes pour déployer ⭐
│   ├── MODIFICATIONS_SUMMARY.md      ← Résumé des changements
│   ├── supabase_migration.sql        ← Schéma PostgreSQL (à exécuter)
│   └── trains_db.sql                 ← Ancien (garde pour référence)
│
├── 📁 Public (Frontend statique)
│   ├── index.html                    ← Formulaire ajouter train (CONVERTI)
│   ├── galerie.html                  ← Galerie trains (NOUVEAU)
│   ├── style.css                     ← Styles (inchangé)
│   ├── style-optim.css               ← Styles optim (inchangé)
│   └── images/                       ← Photos trains (inchangé)
│       ├── AGC/
│       ├── ATER/
│       ├── BB/
│       ├── Corail/
│       ├── ESV/
│       ├── Régiolis/
│       ├── TGV_D/
│       ├── TGV_R/
│       └── TGV_RD/
│
├── 📁 JavaScript/Supabase
│   ├── js/app.js                     ← Formulaires + Supabase (MODIFIÉ)
│   ├── js/galerie.js                 ← Affichage galerie (NOUVEAU)
│   └── js/media-train.js             ← (Peut être supprimé)
│
├── 📁 Backend (À SUPPRIMER)
│   ├── api/
│   │   ├── trains.php                ❌ Remplacé par js/app.js
│   │   └── medias.php                ❌ Remplacé par js/app.js
│   │
│   └── config/
│       └── database.php              ❌ Remplacé par Supabase SDK
│
└── 📁 Git
    └── .git/                         ← Repository Git (créé lors du push)
```

---

## 📝 Fichiers Importants à Connaître

### 🌟 PRIORITÉ 1 : Lire en premier

#### 1. `QUICKSTART.md` (30 minutes)
- **Contenu** : Les 6 étapes essentielles pour déployer
- **À faire** : Lire et suivre si vous êtes pressé
- **Résultat** : Site déployé en 30 minutes

#### 2. `ACTIONS_CHECKLIST.md` (Étape par étape)
- **Contenu** : Checklist détaillée avec ✅ cases à cocher
- **À faire** : Suivre étape par étape
- **Résultat** : Rien oublié

#### 3. `DEPLOY_GUIDE.md` (Référence complète)
- **Contenu** : Guide très détaillé (5 phases)
- **À faire** : Consulter au besoin
- **Résultat** : Réponses à toutes les questions

---

### 🔧 Configuration

#### `package.json`
```json
{
  "name": "trains-catalog",
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  },
  "scripts": {
    "dev": "python -m http.server 3000",
    "build": "echo 'Static site - no build needed'"
  }
}
```
**À faire** : `npm install` (une seule fois)

#### `.env.local`
```
VITE_SUPABASE_URL=https://xxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...xxxxx
```
**À faire** : Remplir avec vos clés Supabase
**⚠️ IMPORTANT** : Ne JAMAIS committer ce fichier!

#### `.env.example`
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
**Contenu** : Template vide pour la documentation

#### `.gitignore`
**Contenu** : Fichiers à ignorer par Git
- `.env.local`
- `node_modules/`
- `.vscode/`
- etc.

#### `vercel.json`
**Contenu** : Configuration pour Vercel
**À faire** : Ne rien modifier (prêt à l'emploi)

---

### 📊 Base de Données

#### `supabase_migration.sql`
**Contenu** : Schéma complet PostgreSQL
```sql
CREATE TABLE trains (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL UNIQUE,
  ...
);
```
**À faire** :
1. Créer projet Supabase
2. Aller dans SQL Editor
3. Coller ce fichier
4. Exécuter

#### `trains_db.sql` (ancien MySQL)
**Contenu** : Ancienne structure MySQL
**À faire** : Keep pour référence ou migration de données

---

### 🌐 Frontend HTML

#### `public/index.html`
**Contenu** : Formulaire pour ajouter des trains
**Fichiers liés** :
- `js/app.js` - Gestion du formulaire
- `style.css` - Styles

**Éléments clés** :
```html
<form id="form-train">
  <select name="famille_type_id"> <!-- Peuplé par app.js -->
  <input name="numero_principal">
  <button type="submit">Ajouter</button>
</form>
```

#### `public/galerie.html`
**Contenu** : Affichage galerie de trains
**Fichiers liés** :
- `js/galerie.js` - Chargement données
- `style.css` - Styles

**Éléments clés** :
```html
<main id="galerie">
  <!-- Rempli dynamiquement par galerie.js -->
</main>
```

#### `public/style.css` & `style-optim.css`
**Contenu** : Styles CSS (inchangés)
**À faire** : Modifier au besoin

---

### 🚀 JavaScript Supabase

#### `js/app.js` (Modifié - CRITIQUE)
**Contenu** : Intégration Supabase + Formulaires
**Fonctions principales** :
```javascript
import { createClient } from '@supabase/supabase-js'

// Initialiser Supabase
const supabase = createClient(URL, KEY)

// Récupérer données
async function getFamilles() { }
async function getLivrees() { }

// Ajouter train
async function addTrain(data) { }

// Afficher/cacher media
function setupMediaToggle() { }
```

**À faire** : 
- ✅ Lire pour comprendre
- Ne pas modifier (sauf si vous savez ce que vous faites)

#### `js/galerie.js` (Nouveau)
**Contenu** : Affichage galerie complète
**Fonctions principales** :
```javascript
async function loadGallery() {
    const { data: trains } = await supabase
        .from('trains')
        .select('...')
    // Générer HTML
    let html = '...'
    galerieDiv.innerHTML = html
}
```

**À faire** :
- ✅ Exécuté automatiquement au chargement de galerie.html

#### `js/media-train.js` (ancien)
**Contenu** : Ancien code (peut être supprimé)
**À faire** : Supprimer si inutilisé

---

### 📚 Documentation

#### `README.md` (MIS À JOUR)
**Contenu** : Vue d'ensemble du projet
**À faire** : Lire pour comprendre le projet

#### `DEPLOY_GUIDE.md` (NOUVEAU - COMPLET)
**Contenu** : Guide détaillé en 5 phases
**Phases** :
1. Supabase Setup
2. Code Modifications
3. Local Config
4. Vercel Deploy
5. Data Migration

**À faire** : Lire + Suivre étape par étape

#### `ACTIONS_CHECKLIST.md` (NOUVEAU - CHECKLIST)
**Contenu** : Checklist avec ✅ cases
**À faire** : Cocher au fur et à mesure

#### `QUICKSTART.md` (NOUVEAU - EXPRESS)
**Contenu** : 6 étapes en 30 minutes
**À faire** : Lire si pressé

#### `MODIFICATIONS_SUMMARY.md` (NOUVEAU - RÉSUMÉ)
**Contenu** : Résumé comparatif Avant/Après
**À faire** : Lire pour comprendre les changements

---

## 🔄 Flux de Travail

### Pour déployer

```
1. Lire QUICKSTART.md (ou ACTIONS_CHECKLIST.md)
   ↓
2. Créer compte Supabase
   ↓
3. Exécuter supabase_migration.sql
   ↓
4. Remplir .env.local avec clés Supabase
   ↓
5. npm install
   ↓
6. npm run dev (tester local)
   ↓
7. git push sur GitHub
   ↓
8. Déployer sur Vercel
   ↓
✅ Site en ligne!
```

### Pour modifier après déploiement

```
1. Modifier le code local
   ↓
2. npm run dev (tester)
   ↓
3. git commit + git push
   ↓
4. Vercel déploie automatiquement
   ↓
✅ Changes en ligne!
```

---

## 🎯 Checklist des fichiers à vérifier

### Avant de déployer

- [ ] `.env.local` rempli avec clés Supabase
- [ ] `supabase_migration.sql` exécuté dans Supabase
- [ ] `npm install` exécuté
- [ ] `npm run dev` fonctionne → http://localhost:3000/public/index.html
- [ ] Formulaires répondent
- [ ] Galerie affiche les données

### Avant Vercel

- [ ] Repository GitHub créé
- [ ] `git push origin main` exécuté
- [ ] `.env.local` n'est PAS dans Git (vérifier `.gitignore`)
- [ ] `package.json` est committé

### Sur Vercel

- [ ] Projet importé depuis GitHub
- [ ] Variables d'environnement ajoutées (Supabase URL + KEY)
- [ ] Build réussi (pas d'erreurs)
- [ ] Site accessible

---

## 🆘 Si vous êtes perdu

1. **Je ne sais pas par où commencer** 
   → Lire `QUICKSTART.md`

2. **Je veux faire étape par étape**
   → Lire `ACTIONS_CHECKLIST.md`

3. **J'ai une question spécifique**
   → Lire `DEPLOY_GUIDE.md` (section pertinente)

4. **Je veux comprendre ce qui a changé**
   → Lire `MODIFICATIONS_SUMMARY.md`

5. **J'ai une erreur**
   → Vérifier `DEPLOY_GUIDE.md` section "Troubleshooting"

---

Bonne chance! 🚂✨

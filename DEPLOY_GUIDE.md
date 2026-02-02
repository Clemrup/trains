# 🚀 Guide Complet : Déployer sur Vercel + Supabase

## 📋 Table des matières
1. [Préparation Supabase](#préparation-supabase)
2. [Modifications du Code](#modifications-du-code)
3. [Configuration Locale](#configuration-locale)
4. [Déploiement sur Vercel](#déploiement-sur-vercel)
5. [Migration des Données](#migration-des-données)

---

## 🔧 Préparation Supabase

### 1️⃣ Créer un projet Supabase
- Allez sur [supabase.com](https://supabase.com)
- Cliquez "New Project"
- Remplissez :
  - **Project name** : `trains-catalog`
  - **Password** : Générez un mot de passe fort
  - **Region** : Choisissez la plus proche (Europe)
- Cliquez "Create new project"

### 2️⃣ Récupérer les clés
Une fois le projet créé :
- Allez dans **Settings** → **API**
- Copiez :
  - **Project URL** (ex: `https://xxxxxx.supabase.co`)
  - **anon public key** (commence par `eyJhb...`)
- Gardez-les précieusement ! ✅

### 3️⃣ Créer les tables
- Allez dans **SQL Editor**
- Créez une nouvelle requête
- Copiez le contenu de **`supabase_migration.sql`**
- Exécutez (le fichier comprend toutes les tables et données de base)

---

## 📝 Modifications du Code

### ✅ Fichiers déjà créés/modifiés
1. **`supabase_migration.sql`** - Schéma PostgreSQL pour Supabase
2. **`package.json`** - Dépendances Node
3. **`.env.local`** - Variables d'environnement locales
4. **`.env.example`** - Template pour Vercel
5. **`js/app.js`** - Code converti vers Supabase

### ⚠️ Fichiers à supprimer
Vous n'en aurez plus besoin :
```
- api/trains.php
- api/medias.php
- config/database.php
```

### 🔄 Fichiers à converter (index.html et galerie.html)

#### **`public/index.php` → `public/index.html`**

Remplacez complètement le contenu par :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trains - Ajouter</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="style-optim.css">
</head>
<body>
    <header>
        <h1>Catalogue des trains</h1>
        <nav style="text-align:center; margin-top: 20px;">
            <a href="galerie.html" class="nav-link">Retour à la galerie ➡</a>
        </nav>
    </header>
        
    <!-- FORMULAIRE D'AJOUT DE TRAIN -->
    <section class="ajout-train">
        <h2>Ajouter un nouveau train</h2>
        <form id="form-train" method="POST">
            <label for="famille_type_id">Type de train :</label>
            <select name="famille_type_id" id="famille_type_id" required>
                <option value="">-- Sélectionner une famille de type --</option>
            </select>

            <select name="type_id" id="type_id" required>
                <option value="">-- Sélectionner un type --</option>
            </select>
                
            <label for="numero_principal">Numéro principal :</label>
            <input type="text" id="numero_principal" name="numero_principal" required>
                
            <label for="numero_secondaire">Numéro secondaire :</label>
            <input type="text" id="numero_secondaire" name="numero_secondaire">
                
            <label for="livree">Livrée :</label>
            <select name="livree_id" id="livree" required>
                <option value="">-- Sélectionner une livrée --</option>
            </select>
                
            <hr>
            <button type="submit">➕ Ajouter ce train</button>
        </form>
    </section>

    <!-- Scripts Supabase -->
    <script type="module" src="../js/app.js"></script>
</body>
</html>
```

#### **`public/galerie.php` → `public/galerie.html`**

C'est plus complexe. Créez un nouveau fichier `galerie.html` :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Galerie - Trains</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="style-optim.css">
</head>
<body>
    <header>
        <h1>Catalogue des trains</h1>
        <nav style="text-align:center; margin-top: 20px;">
            <a href="index.html" class="nav-link">Ajouter un train ➡</a>
        </nav>
    </header>

    <main id="galerie">
        <p style="text-align: center; font-size: 18px;">⏳ Chargement de la galerie...</p>
    </main>

    <script type="module" src="../js/galerie.js"></script>
</body>
</html>
```

### 📄 Créer `js/galerie.js`

Nouveau fichier pour afficher la galerie :

```javascript
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function loadGallery() {
    const galerieDiv = document.getElementById('galerie')

    try {
        // Récupérer tous les trains avec leurs relations
        const { data: trains, error } = await supabase
            .from('trains')
            .select(`
                id,
                nom,
                numero_principal,
                numero_secondaire,
                types(id, nom, famille_type(nom)),
                livrees(nom, main_color, text_color),
                trains_medias(
                    medias(
                        id,
                        type_media,
                        media_url,
                        date_ajout,
                        lieux_1:lieux!medias_id_lieu1_fkey(nom),
                        lieux_2:lieux!medias_id_lieu2_fkey(nom)
                    )
                )
            `)
            .order('nom', { ascending: true })

        if (error) throw error

        // Grouper par famille > type
        const grouped = {}
        trains.forEach(train => {
            const famille = train.types.famille_type.nom
            const type = train.types.nom

            if (!grouped[famille]) grouped[famille] = {}
            if (!grouped[famille][type]) grouped[famille][type] = []
            grouped[famille][type].push(train)
        })

        // Générer le HTML
        let html = ''
        for (const [famille, types] of Object.entries(grouped)) {
            html += `<h2>${famille}</h2>`
            for (const [type, typeTrains] of Object.entries(types)) {
                html += `<h3>${type}</h3>`
                typeTrains.forEach(train => {
                    const livree = train.livrees
                    const style = livree?.main_color ? `background: ${livree.main_color}; color: ${livree.text_color};` : ''
                    
                    html += `
                        <div class="train-card" style="${style}">
                            <h4>${train.nom}</h4>
                            <p><strong>N°:</strong> ${train.numero_principal}${train.numero_secondaire ? ' / ' + train.numero_secondaire : ''}</p>
                            ${livree ? `<p><strong>Livrée:</strong> ${livree.nom}</p>` : ''}
                            
                            <div class="medias">
                    `

                    // Afficher les médias
                    train.trains_medias?.forEach(tm => {
                        const media = tm.medias
                        if (media.type_media === 'image') {
                            html += `<img src="${media.media_url}" alt="${train.nom}" loading="lazy">`
                        } else if (media.type_media === 'video') {
                            const videoId = media.media_url.split('/').pop()
                            html += `<iframe width="300" height="169" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
                        }
                    })

                    html += `</div></div>`
                })
            }
        }

        galerieDiv.innerHTML = html || '<p>Aucun train dans la galerie.</p>'
    } catch (error) {
        console.error('Erreur :', error)
        galerieDiv.innerHTML = `<p>❌ Erreur: ${error.message}</p>`
    }
}

document.addEventListener('DOMContentLoaded', loadGallery)
```

---

## ⚙️ Configuration Locale

### 1️⃣ Installer les dépendances
```bash
cd trains
npm install
```

### 2️⃣ Configurer les variables d'environnement
Éditez `.env.local` :
```
VITE_SUPABASE_URL=https://xxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3️⃣ Tester en local
```bash
npm run dev
```
Accédez à `http://localhost:3000/public/index.html`

---

## 🚀 Déploiement sur Vercel

### 1️⃣ Initialiser un dépôt Git
```bash
cd trains
git init
git add .
git commit -m "Initial commit: Vercel & Supabase ready"
git remote add origin https://github.com/yourusername/trains.git
git push -u origin main
```

### 2️⃣ Connecter à Vercel
- Allez sur [vercel.com](https://vercel.com)
- Cliquez "New Project"
- Sélectionnez votre dépôt GitHub `trains`
- Cliquez "Import"

### 3️⃣ Ajouter les variables d'environnement
Dans la page du projet Vercel :
- Allez dans **Settings** → **Environment Variables**
- Ajoutez :
  - `VITE_SUPABASE_URL` = votre URL Supabase
  - `VITE_SUPABASE_ANON_KEY` = votre clé anon

### 4️⃣ Déployer
- Cliquez "Deploy"
- Vercel devrait déployer automatiquement
- Votre site sera disponible à : `https://trains-xxxxx.vercel.app`

---

## 📊 Migration des Données

### Option 1 : Importer directement depuis MySQL (recommandé)

**Via Supabase Studio** :
1. Allez dans **SQL Editor**
2. Créez une requête pour importer les données

**Via Script Node.js** :

Créez `migrate.js` :
```javascript
import mysql from 'mysql2/promise'
import { createClient } from '@supabase/supabase-js'

const mysqlConn = await mysql.createConnection({
  host: 'localhost',
  user: 'clement',
  password: '',
  database: 'trains_db'
})

const supabase = createClient(
  'https://xxxxx.supabase.co',
  'your-key'
)

// Migrer les trains
const [trains] = await mysqlConn.query('SELECT * FROM trains')
for (const train of trains) {
  await supabase.from('trains').insert([train])
}

// Migrer les médias
const [medias] = await mysqlConn.query('SELECT * FROM medias')
for (const media of medias) {
  await supabase.from('medias').insert([media])
}

console.log('✅ Migration complète!')
```

Exécutez :
```bash
node migrate.js
```

### Option 2 : Export CSV et import Supabase
1. Exportez de MySQL en CSV
2. Dans Supabase Studio, utilisez "Import data" → CSV
3. Mappez les colonnes

---

## 📦 Structure Finale

```
trains/
├── public/
│   ├── index.html          ✅ Converti (PHP → HTML)
│   ├── galerie.html        ✅ Nouveau (PHP → HTML)
│   ├── style.css
│   ├── style-optim.css
│   └── images/
├── js/
│   ├── app.js              ✅ Modifié (Supabase)
│   ├── galerie.js          ✅ Nouveau
│   └── media-train.js      (peut être supprimé si inutilisé)
├── package.json            ✅ Nouveau
├── .env.local              ✅ Nouveau
├── .env.example            ✅ Nouveau
├── supabase_migration.sql  ✅ Nouveau
├── README.md               (ce fichier)
└── (dossiers api/ et config/ peuvent être supprimés)
```

---

## ✅ Checklist Finale

- [ ] Projet Supabase créé
- [ ] URL et clés Supabase copiées
- [ ] Tables créées dans Supabase
- [ ] `package.json` créé
- [ ] `.env.local` configuré
- [ ] `js/app.js` modifié
- [ ] `public/index.html` converti
- [ ] `public/galerie.html` créé + `js/galerie.js`
- [ ] Testé en local (`npm run dev`)
- [ ] Données migrées vers Supabase
- [ ] Dépôt Git initialisé
- [ ] Projet Vercel connecté
- [ ] Variables d'environnement Vercel ajoutées
- [ ] Déployé avec succès ! 🎉

---

## 🆘 Troubleshooting

### "Clés Supabase non configurées"
→ Vérifiez `.env.local` et le format des clés

### "Erreur de connexion à Supabase"
→ Vérifiez l'URL du projet et la clé anon (pas la clé service)

### "Tables non trouvées"
→ Exécutez `supabase_migration.sql` dans le SQL Editor

### "Images ne s'affichent pas"
→ Utilisez Supabase Storage ou uploadez sur un CDN externe

---

Vous avez des questions ? 🤔

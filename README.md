# Catalogue des Trains 🚂

Un projet web pour gérer et afficher un catalogue de trains avec galerie de photos et vidéos.

## 📋 Table des matières

- [Installation](#installation)
- [Architecture du projet](#architecture-du-projet)
- [Configuration](#configuration)
- [Fonctionnalités](#fonctionnalités)
- [Structure des fichiers](#structure-des-fichiers)
- [Technologies utilisées](#technologies-utilisées)
- [Utilisation](#utilisation)

## 🚀 Installation

### Prérequis

- PHP 7.4 ou supérieur
- MySQL/MariaDB
- Apache (avec mod_rewrite activé)
- Accès XAMPP ou serveur Apache local

### Étapes d'installation

1. **Cloner ou télécharger le projet**
   ```bash
   cd /opt/lampp/htdocs/projet_perso/
   git clone ssh://git@git.uha4point0.fr:22222/clement.rupert/projet-perso-train.git
   cd projet-perso-train
   ```

2. **Importer la base de données**
   ```bash
   mysql -u root -p trains_db < trains_db.sql
   ```
   Ou via phpMyAdmin :
   - Créer une base de données `trains_db`
   - Importer le fichier `trains_db.sql`

3. **Configurer les accès**
   - Éditer `config/database.php` si nécessaire (user/password)
   - Vérifier que les chemins d'accès sont corrects

4. **Définir les permissions**
   ```bash
   chmod 755 public/
   chmod 755 api/
   chmod 755 config/
   chmod 755 js/
   ```

5. **Accéder au projet**
   - Galerie : `http://localhost/projet_perso/projet-perso-train/public/galerie.php`
   - Admin : `http://localhost/projet_perso/projet-perso-train/public/index.php`

## 🏗️ Architecture du projet

```
projet-perso-train/
├── api/                           # API REST
│   ├── trains.php                # Gestion des trains (CRUD)
│   └── medias.php                # Gestion des médias (images/vidéos)
│
├── config/                        # Configuration
│   └── database.php              # Connexion base de données
│
├── public/                        # Frontend (HTML/CSS)
│   ├── index.php                 # Formulaires d'administration
│   ├── galerie.php               # Galerie publique
│   ├── style.css                 # Styles CSS
│   └── images/                   # Dossier des images
│       ├── TGV_R/
│       ├── TGV_D/
│       ├── TGV_RD/
│       ├── TGV_POS/
│       ├── Corail/
│       ├── BB/
│       └── ...
│
├── js/                            # JavaScript (Client-side)
│   └── app.js                    # Gestion formulaires + AJAX
│
├── trains_db.sql                 # Schéma base de données
├── README.md                      # Ce fichier
└── .gitignore                    # Fichiers ignorés par Git
```

## ⚙️ Configuration

### Base de données

**Fichier** : `config/database.php`

```php
$db = new PDO(
    'mysql:host=localhost;dbname=trains_db;charset=utf8',
    'clement',  // Utilisateur
    ''          // Mot de passe
);
```

Modifiez les identifiants selon votre configuration locale.

### Tables principales

- **types_train** : Types de trains (TGV, BB, etc.)
- **trains** : Liste des trains
- **medias** : Images et vidéos
- **train_medias** : Liaison trains ↔ médias
- **lieux** : Lieux où les photos ont été prises
- **livrees** : Livrées (couleurs des trains)

## ✨ Fonctionnalités

### 👤 Administrateur

1. **Ajouter un nouveau train**
   - Sélectionner le type de train
   - Entrer le numéro principal/secondaire
   - Choisir la livrée
   - Ajouter optionnellement une image ou vidéo
   - Sélectionner le lieu et la date

2. **Ajouter un média à un train existant**
   - Sélectionner un ou plusieurs trains
   - Charger une image ou une vidéo YouTube
   - Associer un lieu (gare ou entre deux gares)
   - Enregistrer la date du média

### 👁️ Visiteur

1. **Consulter la galerie**
   - Voir tous les trains groupés par type
   - Visualiser les images et vidéos
   - Consulter les détails (lieu, date, livrée)

## 📁 Structure des fichiers

### API REST

#### `api/trains.php`

**Requête GET** :
```
GET /api/trains.php?action=list
GET /api/trains.php?action=types
```

**Requête POST** :
```json
{
  "type_id": 1,
  "numero_principal": "123",
  "numero_secondaire": "456",
  "livree_id": 1
}
```

#### `api/medias.php`

**Requête GET** :
```
GET /api/medias.php?action=lieux
GET /api/medias.php?action=livrees
```

**Requête POST** :
```json
{
  "trains_id": [1, 2],
  "type_media": "image",
  "media_path": "245",
  "type_lieu": "1",
  "date_ajout": "2025-12-08",
  "lieu1": 1
}
```

### Frontend

#### `public/index.php`
- Formulaires d'administration
- Charge les données via AJAX depuis les APIs
- Utilise `js/app.js` pour la gestion des événements

#### `public/galerie.php`
- Page publique d'affichage
- Récupère directement les données de la base de données
- Affiche les trains, images et vidéos
- Lazy loading des images

#### `public/style.css`
- Styles de la galerie et des formulaires
- Design responsive
- Support des couleurs de livrée

### JavaScript

#### `js/app.js`
- Gestion des événements des formulaires
- Affichage/masquage des sections média
- Gestion de la sélection multiple de trains
- Gestion du type de lieu (simple/double)
- Requêtes AJAX vers les APIs

## 🛠️ Technologies utilisées

- **Backend** : PHP 7.4+
- **Base de données** : MySQL/MariaDB
- **Frontend** : HTML5, CSS3, Vanilla JavaScript (ES6+)
- **API** : REST JSON
- **Serveur** : Apache (XAMPP)

## 📖 Utilisation

### Ajouter un train

1. Aller sur `http://localhost/projet_perso/projet-perso-train/public/index.php`
2. Remplir le formulaire "Ajouter un nouveau train"
3. Optionnel : Ajouter une image ou une vidéo
4. Cliquer sur "Ajouter le train"

### Ajouter un média à un train existant

1. Aller sur `http://localhost/projet_perso/projet-perso-train/public/index.php`
2. Remplir le formulaire "Ajouter un média à un train existant"
3. Sélectionner un ou plusieurs trains
4. Choisir le type de média (image ou vidéo)
5. Ajouter l'image ou le lien YouTube
6. Cliquer sur "Ajouter le média"

### Afficher la galerie

1. Aller sur `http://localhost/projet_perso/projet-perso-train/public/galerie.php`
2. Parcourir les trains et leurs médias

## 🐛 Dépannage

### Erreur de connexion à la base de données
- Vérifier que MySQL est démarré
- Vérifier les identifiants dans `config/database.php`
- Vérifier que la base `trains_db` existe

### Les images ne s'affichent pas
- Vérifier que le dossier `public/images/` existe
- Vérifier que les sous-dossiers (TGV_R, TGV_D, etc.) existent
- Vérifier les chemins d'accès dans la base de données

### Les requêtes AJAX échouent
- Vérifier que les fichiers API existent dans `api/`
- Vérifier les chemins relatifs `../api/`
- Ouvrir la console du navigateur (F12) pour voir les erreurs

## 📝 Notes de développement

- **Chemins relatifs** : Les images sont stockées dans `public/images/`
- **Noms de fichiers** : Les espaces sont remplacés par des underscores
- **Sécurité** : Utilise les requêtes préparées (protection contre les injections SQL)
- **Validation** : Valide les données côté client ET côté serveur

## 👨‍💻 Auteur

Clément  
Décembre 2025

## 📄 Licence

Libre d'utilisation à titre personnel.

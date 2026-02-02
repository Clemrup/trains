-- Supabase Migration pour le projet Trains
-- Convertir de MySQL à PostgreSQL

-- Supprimer les tables existantes (dans l'ordre inverse des dépendances)
DROP TABLE IF EXISTS trains_medias;
DROP TABLE IF EXISTS trains;
DROP TABLE IF EXISTS medias;
DROP TABLE IF EXISTS types;
DROP TABLE IF EXISTS livrees;
DROP TABLE IF EXISTS lieux;
DROP TABLE IF EXISTS constructeur;
DROP TABLE IF EXISTS famille_type;

-- Tables de base
CREATE TABLE famille_type (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE constructeur (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE lieux (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE livrees (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL UNIQUE,
  main_color VARCHAR(255),
  text_color VARCHAR(255)
);

CREATE TABLE types (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  id_famille INT NOT NULL REFERENCES famille_type(id) ON DELETE CASCADE,
  description TEXT,
  constructeur_id INT REFERENCES constructeur(id) ON DELETE SET NULL,
  UNIQUE(nom, id_famille)
);

CREATE TABLE trains (
  id SERIAL PRIMARY KEY,
  type_id INT NOT NULL REFERENCES types(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  numero_principal VARCHAR(50) NOT NULL,
  numero_secondaire VARCHAR(50),
  livree_id INT REFERENCES livrees(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medias (
  id SERIAL PRIMARY KEY,
  type_media VARCHAR(20) NOT NULL CHECK (type_media IN ('image', 'video')),
  media_url VARCHAR(500) NOT NULL,
  id_lieu1 INT NOT NULL REFERENCES lieux(id) ON DELETE CASCADE,
  id_lieu2 INT REFERENCES lieux(id) ON DELETE SET NULL,
  date_ajout DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trains_medias (
  train_id INT NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
  media_id INT NOT NULL REFERENCES medias(id) ON DELETE CASCADE,
  PRIMARY KEY (train_id, media_id)
);

-- Index pour les performances
CREATE INDEX idx_trains_type_id ON trains(type_id);
CREATE INDEX idx_trains_livree_id ON trains(livree_id);
CREATE INDEX idx_types_famille_id ON types(id_famille);
CREATE INDEX idx_medias_lieu1 ON medias(id_lieu1);
CREATE INDEX idx_medias_lieu2 ON medias(id_lieu2);
CREATE INDEX idx_trains_medias_train_id ON trains_medias(train_id);
CREATE INDEX idx_trains_medias_media_id ON trains_medias(media_id);

-- NOTE: Les données de trains et medias doivent être migrées depuis MySQL
-- Utilisez l'outil d'export/import de Supabase ou créez un script Node.js

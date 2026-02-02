-- Supabase Migration pour le projet Trains
-- Convertir de MySQL à PostgreSQL

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
  nom VARCHAR(255) NOT NULL UNIQUE,
  type_id INT NOT NULL REFERENCES types(id) ON DELETE CASCADE,
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

-- Insertion des données (copié de votre MySQL)
INSERT INTO famille_type (id, nom) VALUES
(1, 'AGC'),
(2, 'ATER'),
(3, 'Autorail'),
(4, 'BB'),
(5, 'Corail'),
(6, 'Locotracteur'),
(7, 'Régiolis'),
(8, 'TGV'),
(9, 'TRAXX');

INSERT INTO constructeur (id, nom) VALUES
(1, 'Alstom'),
(2, 'CAF France'),
(3, 'Bombardier'),
(4, 'Usine ferroviaire de Reichshoffen'),
(5, 'GEC Alsthom'),
(6, 'Adtranz'),
(7, 'Socofer'),
(8, 'Gaston Moyse'),
(9, 'Établissements Fauvet Girel'),
(10, 'MTE');

INSERT INTO lieux (id, nom) VALUES
(1, 'Mulhouse Ville'),
(2, 'Thann'),
(3, 'Besançon Franche-Comté TGV'),
(4, 'Colmar'),
(5, 'Besançon Viotte'),
(6, 'Dijon Ville'),
(7, 'Bollwiller'),
(8, 'Mulhouse – Dornach'),
(9, 'Thann Centre'),
(10, 'Mulhouse – Nord'),
(11, 'École-Valentin'),
(12, 'Paris Gare de Lyon'),
(13, 'Altkirch'),
(14, 'Dannemarie'),
(15, 'Strasbourg'),
(16, 'Aéroport Charles de Gaulle 2 TGV'),
(17, 'Basel SBB'),
(18, 'Flaxlanden');

INSERT INTO livrees (id, nom, main_color, text_color) VALUES
(1, 'Lorraine', '#ffff0055', '#666600'),
(2, 'Alsace', '#ff333355', '#cc0000'),
(3, 'InOui', '#bbbbbb55', '#c8102e'),
(4, 'Franche-Comté', '#00aa6655', '#007a4d'),
(5, 'FRET', '#2fba85dd', '#1a4d3c'),
(6, 'Carmillon', '#66666655', '#4d4d4d'),
(7, 'Lyria', '#ff0000bb', '#dddddd'),
(8, 'Transfrontalière', '#0022aa66', '#001a80'),
(9, 'Grand Est', '#007bff55', '#005bbf'),
(10, 'Mobigo', '#66ff0055', '#339900'),
(11, 'Neutre', '#3366ff55', '#0044cc'),
(12, 'Bourgogne', '#ffdd0055', '#665500'),
(13, 'Europorte', '#ccccee55', '#8888bb'),
(14, 'Fluo', '#d7ff00aa', '#0033cc'),
(15, 'Champagne-Ardenne', '#f7b50088', '#664400'),
(16, 'Haute-Normandie', '#00a6d655', '#007299'),
(17, 'Ligne des Hirondelles', '#fffb0088', '#666600'),
(18, 'InOui Disneyland', '#00aa6699', '#c8102e'),
(19, 'Akiem', '#7a7c8099', '#5a5c60'),
(20, 'Infra Jaune', '#ffee00aa', '#666600'),
(21, 'Neutre Gris', '#11111125', '#333333'),
(22, 'InOui LGBT', 'linear-gradient(to bottom,#e4030388 0%,#e4030388 16.66%,#ff8c0088 16.66%,#ff8c0088 33.33%,#ffed0088 33.33%,#ffed0088 50%,#00802688 50%,#00802688 66.66%,#004dff88 66.66%,#004dff88 83.33%,#75078788 83.33%,#75078788 100%);', '#101010'),
(23, 'DB', '#ff111188', '#bb0000'),
(24, 'Vigirail', '#ff6a0088', '#cc3300'),
(25, 'Infra orange', '#f05a28aa', '#663300'),
(26, 'Béton', '#b0aea899', '#ff6600'),
(27, 'VSOE', '#0b1c2ddd', '#c9a44c'),
(28, 'OuiGo', '#33aaff', '#ff3366'),
(29, 'HexaFret', '#2fae8f', '#1a4d3c'),
(30, 'InOui Record du monde', '#9a9a9a66', '#9f0f28');

-- NOTE: Les données de trains et medias doivent être migrées depuis MySQL
-- Utilisez l'outil d'export/import de Supabase ou créez un script Node.js

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trains</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="style-optim.css">
</head>
<body>
    <header>
        <h1>Catalogue des trains</h1>
        <nav style="text-align:center; margin-top: 20px;">
            <a href="galerie.php" class="nav-link">Retour à la galerie ➡</a>
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
                
            <h3>Média associé (facultatif)</h3>
            <label for="type_media">Type de média :</label>
            <select name="type_media" id="type_media">
                <option value="">Aucun</option>
                <option value="image">Image</option>
                <option value="video">Vidéo</option>
            </select>
                
            <div id="bloc_image" class="hidden">
                <label for="image_folder_add">Dossier :</label>
                <select name="image_folder" id="image_folder_add">
                    <option value="images/AGC/">AGC</option>
                    <option value="images/ATER/">ATER</option>
                    <option value="images/BB/">BB</option>
                    <option value="images/Corail/">Corail</option>
                    <option value="images/ESV/">ESV</option>
                    <option value="images/Régiolis/">Régiolis</option>
                    <option value="images/TGV_D/">TGV_D</option>
                    <option value="images/TGV_R/">TGV_R</option>
                    <option value="images/TGV_RD/">TGV_RD</option>
                </select>
                <label for="media_path">Nom du fichier image :</label>
                <input type="text" name="media_path" placeholder="Ex: 245">
            </div>
            <div id="bloc_video" class="hidden">
                <label for="media_url">Lien YouTube :</label>
                <input type="url" name="media_url">
            </div>
            
            <label for="type_lieu_add">Type de lieu :</label>
            <select name="type_lieu" id="type_lieu_add" class="type_lieu">
                <option value="">-- Sélectionner un type de lieu --</option>
                <option value="1">Dans une gare</option>
                <option value="2">Entre deux gares</option>
            </select>
            
            <div class="lieux_simple hidden">
                <label for="lieu1">Lieu :</label>
                <select name="lieu1" id="lieu1">
                    <option value="">-- Sélectionner un lieu --</option>
                </select>
            </div>
            
            <div class="lieux_double hidden">
                <label>Lieu 1 :</label>
                <select name="lieu1_double" id="lieu1_double">
                    <option value="">-- Sélectionner le premier lieu --</option>
                </select>
                <label>Lieu 2 :</label>
                <select name="lieu2_double" id="lieu2_double">
                    <option value="">-- Sélectionner le deuxième lieu --</option>
                </select>
            </div>
            
            <label for="date_ajout">Date :</label>
            <input type="date" name="date_ajout" id="date_ajout">               
            
            <button type="submit">Ajouter le train</button>
        </form>
    </section>
                
    <!-- FORMULAIRE POUR AJOUTER UN MÉDIA À UN TRAIN EXISTANT -->
    <section class="ajout-train">
        <h2>Ajouter un média à un train existant</h2>
        <form id="form-media" method="POST">
            <div id="familles-tabs-container" style="margin-bottom: 1em; display: flex; flex-wrap: wrap; gap: 8px;"></div>
            <div id="types-select-container" class="hide-when-empty" style="margin-bottom: 1em;"></div>
            <div id="trains-checkboxes-container" class="hide-when-empty" style="margin-bottom: 1em;"></div>
            <div id="selected-trains-list" class="hide-when-empty" style="margin: 1em 0; font-size: 1.1em; color: #333;"></div>
                
            <label for="type_media_exist">Type de média :</label>
            <select name="type_media" id="type_media_exist">
                <option value="">Aucun</option>
                <option value="image">Image</option>
                <option value="video">Vidéo</option>
            </select>
                
            <div id="bloc_image_exist" class="hidden">
                <label for="image_folder">Dossier :</label>
                <select name="image_folder" id="image_folder">
                    <option value="images/AGC/">AGC</option>
                    <option value="images/ATER/">ATER</option>
                    <option value="images/BB/">BB</option>
                    <option value="images/Corail/">Corail</option>
                    <option value="images/ESV/">ESV</option>
                    <option value="images/Régiolis/">Régiolis</option>
                    <option value="images/TGV_D/">TGV_D</option>
                    <option value="images/TGV_R/">TGV_R</option>
                    <option value="images/TGV_RD/">TGV_RD</option>
                </select>
                <label for="media_path_exist">Nom du fichier image :</label>
                <input type="text" name="media_path" placeholder="Ex: 245">
            </div>
                
            <div id="bloc_video_exist" class="hidden">
                <label for="media_url_exist">Lien YouTube :</label>
                <input type="url" name="media_url">
            </div>
            
            <label for="type_lieu_exist">Type de lieu :</label>
            <select name="type_lieu" id="type_lieu_exist" class="type_lieu">
                <option value="">-- Sélectionner un type de lieu --</option>
                <option value="1">Dans une gare</option>
                <option value="2">Entre deux gares</option>
            </select>                
            
            <div class="lieux_simple hidden">
                <label for="lieu1_exist">Lieu :</label>
                <select name="lieu1" id="lieu1_exist">
                    <option value="">-- Sélectionner un lieu --</option>
                </select>
            </div>
            
            <div class="lieux_double hidden">
                <label>Lieu 1 :</label>
                <select name="lieu1_double" id="lieu1_double">
                    <option value="">-- Sélectionner le premier lieu --</option>
                </select>
                <label>Lieu 2 :</label>
                <select name="lieu2_double" id="lieu2_double">
                    <option value="">-- Sélectionner le deuxième lieu --</option>
                </select>
            </div>
            
            <label for="date_ajout_exist">Date :</label>
            <input type="date" name="date_ajout" id="date_ajout_exist">
            
            <button type="submit">Ajouter le média</button>
        </form>
    </section>

    <script src="../js/app.js"></script>
    <script src="../js/media-train.js"></script>

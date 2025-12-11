<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trains</title>
    <link rel="stylesheet" href="style.css">
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
            <label for="type_id">Type de train :</label>
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
                <label for="media_path">Importer une image :</label>
                <input type="text" name="media_path" placeholder="Ex: TGV-D/245">
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
                </select>
                <label>Lieu 2 :</label>
                <select name="lieu2_double" id="lieu2_double">
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
            <label for="train_id">Sélectionner le train :</label>
            <select name="train_id[]" id="train_id" required>
                <option value="">-- Choisir un train --</option>
            </select>
                
            <label for="type_media_exist">Type de média :</label>
            <select name="type_media" id="type_media_exist">
                <option value="">Aucun</option>
                <option value="image">Image</option>
                <option value="video">Vidéo</option>
            </select>
                
            <div id="bloc_image_exist" class="hidden">
                <label for="media_path_exist">Importer une image :</label>
                <input type="text" name="media_path" placeholder="Ex: TGV/tgv1">
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
                <select name="lieu1_double" id="lieu1_double_exist">
                </select>
                <label>Lieu 2 :</label>
                <select name="lieu2_double" id="lieu2_double_exist">
                </select>
            </div>
            
            <label for="date_ajout_exist">Date :</label>
            <input type="date" name="date_ajout" id="date_ajout_exist">
            
            <button type="submit">Ajouter le média</button>
        </form>
    </section>

    <script src="../js/app.js"></script>
    
    <script>
        // Charger les types de trains
        fetch('../api/trains.php?action=types')
            .then(r => r.json())
            .then(data => {
                const select = document.getElementById('type_id');
                data.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.id;
                    option.textContent = type.nom;
                    select.appendChild(option);
                });
            });
        
        // Charger les livrées
        fetch('../api/medias.php?action=livrees')
            .then(r => r.json())
            .then(data => {
                const select = document.getElementById('livree');
                data.forEach(livree => {
                    const option = document.createElement('option');
                    option.value = livree.id;
                    option.textContent = livree.nom;
                    select.appendChild(option);
                });
            });
        
        // Charger les lieux
        fetch('../api/medias.php?action=lieux')
            .then(r => r.json())
            .then(data => {
                const selects = ['lieu1', 'lieu1_double', 'lieu2_double', 'lieu1_exist', 'lieu1_double_exist', 'lieu2_double_exist'];
                selects.forEach(id => {
                    const select = document.getElementById(id);
                    if (select) {
                        data.forEach(lieu => {
                            const option = document.createElement('option');
                            option.value = lieu.id;
                            option.textContent = lieu.nom;
                            select.appendChild(option);
                        });
                    }
                });
            });
        
        // Charger les trains existants
        fetch('../api/trains.php?action=list')
            .then(r => r.json())
            .then(data => {
                const select = document.getElementById('train_id');
                data.forEach(train => {
                    const option = document.createElement('option');
                    option.value = train.id;
                    option.textContent = train.nom;
                    select.appendChild(option);
                });
            });
    </script>
</body>
</html>

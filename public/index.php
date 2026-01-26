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
                <div id="selected-trains-list" style="margin: 1em 0; font-size: 1.1em; color: #333;"></div>
                <div id="types-btns-container" style="margin-bottom: 1em; display: flex; flex-wrap: wrap; gap: 8px;"></div>
                <div id="trains-checkboxes-container" style="margin-bottom: 1em;"></div>
                
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
    
    <script>
            // Sélection multi-types : mémoriser les sélections par type
            let typesData = [];
            let selectedTrains = {}; // {typeId: Set(trainId)}
            let trainsCache = {}; // {typeId: [trains]}

            fetch('../api/trains.php?action=types')
                .then(r => r.json())
                .then(data => {
                    typesData = data;
                    const btnsContainer = document.getElementById('types-btns-container');
                    data.forEach(type => {
                        const btn = document.createElement('button');
                        btn.type = 'button';
                        btn.textContent = type.nom;
                        btn.className = 'type-btn';
                        btn.dataset.typeId = type.id;
                        btnsContainer.appendChild(btn);
                    });
                });

            document.addEventListener('click', function(e) {
                if (e.target.classList.contains('type-btn')) {
                    const typeId = e.target.dataset.typeId;
                    const btn = e.target;
                    const isActive = btn.classList.contains('active');
                    // Toggle : si déjà actif, on masque la liste
                    if (isActive) {
                        btn.classList.remove('active');
                        document.getElementById('trains-checkboxes-container').innerHTML = '';
                        updateSelectedTrainsList();
                        return;
                    }
                    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    // Si déjà en cache, utiliser le cache
                    if (trainsCache[typeId]) {
                        renderTrainsCheckboxes(typeId, trainsCache[typeId]);
                    } else {
                        fetch(`../api/trains.php?action=list_by_type&type_id=${typeId}`)
                            .then(r => r.json())
                            .then(trains => {
                                trainsCache[typeId] = trains;
                                renderTrainsCheckboxes(typeId, trains);
                            });
                    }
                }
            });

            //liste déroulante des types de trains
            fetch('../api/trains.php?action=types')
                .then(r => r.json())
                .then(data => {
                    const select = document.getElementById('type_id');
                    if (!select) return;
                        data.forEach(type => {
                        const option = document.createElement('option');
                        option.value = type.id;
                        option.textContent = type.nom;
                        select.appendChild(option);
                    });
                });




            function renderTrainsCheckboxes(typeId, trains) {
                const container = document.getElementById('trains-checkboxes-container');
                container.innerHTML = '';
                if (trains.length === 0) {
                    container.innerHTML = '<em>Aucun train pour ce type.</em>';
                    updateSelectedTrainsList();
                    return;
                }
                const selected = selectedTrains[typeId] || new Set();
                trains.forEach(train => {
                    const label = document.createElement('label');
                    label.style.display = 'block';
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = train.id;
                    // Rétablir la sélection si déjà sélectionné
                    if (selected.has(String(train.id)) || selected.has(Number(train.id))) {
                        checkbox.checked = true;
                    }
                    checkbox.addEventListener('change', function() {
                        if (!selectedTrains[typeId]) selectedTrains[typeId] = new Set();
                        if (this.checked) {
                            selectedTrains[typeId].add(String(train.id));
                        } else {
                            selectedTrains[typeId].delete(String(train.id));
                        }
                        updateSelectedTrainsList();
                    });
                    label.appendChild(checkbox);
                    label.appendChild(document.createTextNode(' ' + train.nom));
                    container.appendChild(label);
                });
                updateSelectedTrainsList();
            }

            // Afficher la liste de tous les trains sélectionnés (tous types)
            function updateSelectedTrainsList() {
                const listDiv = document.getElementById('selected-trains-list');
                let allSelected = [];
                Object.entries(selectedTrains).forEach(([typeId, set]) => {
                    if (!trainsCache[typeId]) return;
                    trainsCache[typeId].forEach(train => {
                        if (set.has(String(train.id)) || set.has(Number(train.id))) {
                            allSelected.push(train.nom);
                        }
                    });
                });
                if (allSelected.length > 0) {
                    listDiv.innerHTML = '<b>Trains sélectionnés :</b> ' + allSelected.map(n => `<span style="background:#eee;padding:2px 6px;border-radius:4px;margin-right:4px;">${n}</span>`).join(' ');
                }
                else {
                    listDiv.innerHTML = '';
                }
            }

            // À la soumission, injecter tous les trains sélectionnés dans le form
            document.getElementById('form-media')?.addEventListener('submit', function(e) {
                // Nettoyer les anciens inputs cachés
                this.querySelectorAll('input[name="trains_id[]"][type="hidden"]').forEach(el => el.remove());
                // Ajouter tous les trains sélectionnés (tous types)
                let allSelected = [];
                Object.values(selectedTrains).forEach(set => set.forEach(id => allSelected.push(id)));
                allSelected.forEach(id => {
                    const hidden = document.createElement('input');
                    hidden.type = 'hidden';
                    hidden.name = 'trains_id[]';
                    hidden.value = id;
                    this.appendChild(hidden);
                });
            }, true);

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
        </script>

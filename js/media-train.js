// JS pour l'interface familles/types/trains (onglets, boutons, checkboxes, injection des trains sélectionnés, chargement dynamique)
let famillesData = [];
let selectedFamilleId = null;
let selectedTypeId = null;
let selectedTrains = {}; // {typeId: Set(trainId)}
let trainsCache = {}; // {typeId: [trains]}

// Charger familles/types (avec types ayant au moins un train)
fetch('../api/trains.php?action=familles_types_trains')
    .then(r => r.json())
    .then(data => {
        famillesData = data;
        const tabsContainer = document.getElementById('familles-tabs-container');
        tabsContainer.innerHTML = '';
        data.forEach(famille => {
            const tab = document.createElement('button');
            tab.type = 'button';
            tab.textContent = famille.nom;
            tab.className = 'famille-tab';
            tab.dataset.familleId = famille.id;
            tab.addEventListener('click', function() {
                // Si on reclique sur le même bouton famille, on désactive et on cache les types
                if (selectedFamilleId === famille.id) {
                    selectedFamilleId = null;
                    tab.classList.remove('active');
                    document.getElementById('types-select-container').innerHTML = '';
                    document.getElementById('trains-checkboxes-container').innerHTML = '';
                    return;
                }
                document.querySelectorAll('.famille-tab').forEach(b => b.classList.remove('active'));
                tab.classList.add('active');
                selectedFamilleId = famille.id;
                renderTypesSelect(famille.types);
                document.getElementById('trains-checkboxes-container').innerHTML = '';
            });
            tabsContainer.appendChild(tab);
        });
    });

function renderTypesSelect(types) {
    const typesContainer = document.getElementById('types-select-container');
    typesContainer.innerHTML = '';
    if (!types || types.length === 0) return;
    typesContainer.innerHTML = '';
    types.forEach(type => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = type.nom;
        btn.className = 'type-btn';
        btn.style.margin = '2px';
        btn.style.padding = '4px 10px';
        btn.style.fontSize = '0.95em';
        btn.style.borderRadius = '6px';
        btn.style.background = '#e0eaff';
        btn.style.color = '#1a237e';
        btn.style.border = '1px solid #90caf9';
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', function() {
            // Si on reclique sur le même bouton, on referme la liste
            if (selectedTypeId === type.id) {
                selectedTypeId = null;
                btn.classList.remove('active');
                document.getElementById('trains-checkboxes-container').innerHTML = '';
                return;
            }
            // Sinon, on affiche la nouvelle liste
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTypeId = type.id;
            if (!selectedTypeId) {
                document.getElementById('trains-checkboxes-container').innerHTML = '';
                return;
            }
            if (trainsCache[selectedTypeId]) {
                renderTrainsCheckboxes(selectedTypeId, trainsCache[selectedTypeId]);
            } else {
                fetch(`../api/trains.php?action=list_by_type&type_id=${selectedTypeId}`)
                    .then(r => r.json())
                    .then(trains => {
                        trainsCache[selectedTypeId] = trains;
                        renderTrainsCheckboxes(selectedTypeId, trains);
                    });
            }
        });
        typesContainer.appendChild(btn);
    });
}

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

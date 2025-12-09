/**
 * Gestion des formulaires d'ajout de trains et médias
 */

// Afficher/cacher les blocs de média
const selectSets = [
    {type: 'type_media', blocImage: 'bloc_image', blocVideo: 'bloc_video'},
    {type: 'type_media_exist', blocImage: 'bloc_image_exist', blocVideo: 'bloc_video_exist'}
];

selectSets.forEach(set => {
    const select = document.getElementById(set.type);
    if (!select) return;
    
    const img = document.getElementById(set.blocImage);
    const vid = document.getElementById(set.blocVideo);
    
    select.addEventListener('change', () => {
        img.classList.add('hidden');
        vid.classList.add('hidden');
        if (select.value === 'image') img.classList.remove('hidden');
        if (select.value === 'video') vid.classList.remove('hidden');
    });
});

// Activer/désactiver la sélection multiple de trains
const train_id = document.getElementById("train_id");
if (train_id) {
    train_id.addEventListener("change", function() { 
        if (train_id.value === "") {
            train_id.multiple = false;
            train_id.size = false;
        } else { 
            train_id.multiple = true; 
            train_id.size = "6";
        } 
    });
}

// Gérer l'affichage des sélecteurs de lieu
document.querySelectorAll('select[name="type_lieu"]').forEach(function(sel) {
    sel.addEventListener("change", function() {
        const form = sel.closest('form');
        const simple = form.querySelector('.lieux_simple');
        const dbl = form.querySelector('.lieux_double');

        if (this.value === "2") {
            simple.classList.add("hidden");
            dbl.classList.remove("hidden");
        } else if (this.value === "1") {
            dbl.classList.add("hidden");
            simple.classList.remove("hidden");
        } else {
            simple.classList.add("hidden");
            dbl.classList.add("hidden");
        }
    });
});

// Soumettre le formulaire d'ajout de train via AJAX
document.getElementById('form-train')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch('../api/trains.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('✅ ' + result.message);
            e.target.reset();
            location.reload();
        } else {
            alert('❌ Erreur: ' + result.error);
        }
    } catch (error) {
        alert('❌ Erreur réseau: ' + error.message);
    }
});

// Soumettre le formulaire d'ajout de média via AJAX
document.getElementById('form-media')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const trains_id = formData.getAll('train_id[]');
    
    const data = {
        trains_id: trains_id,
        type_media: formData.get('type_media'),
        type_lieu: formData.get('type_lieu'),
        date_ajout: formData.get('date_ajout'),
        media_path: formData.get('media_path'),
        media_url: formData.get('media_url'),
        lieu1: formData.get('lieu1'),
        lieu2: formData.get('lieu2'),
        lieu1_double: formData.get('lieu1_double'),
        lieu2_double: formData.get('lieu2_double')
    };
    
    try {
        const response = await fetch('../api/medias.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('✅ ' + result.message);
            e.target.reset();
            location.reload();
        } else {
            alert('❌ Erreur: ' + result.error);
        }
    } catch (error) {
        alert('❌ Erreur réseau: ' + error.message);
    }
});

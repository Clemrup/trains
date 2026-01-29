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


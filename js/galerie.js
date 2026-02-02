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
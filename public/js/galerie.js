import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Utiliser la configuration globale injectée par config.js
const SUPABASE_URL = window.CONFIG?.SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = window.CONFIG?.SUPABASE_ANON_KEY || 'your-anon-key'

console.log('🔗 Connexion Supabase:', SUPABASE_URL)

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Créer la lightbox au chargement de la page
function initLightbox() {
    if (document.getElementById('lightbox')) return // Éviter les doublons
    
    const lightbox = document.createElement('div')
    lightbox.id = 'lightbox'
    lightbox.className = 'hidden'
    lightbox.innerHTML = `
        <div id="lightbox-content">
            <span id="lightbox-close">&times;</span>
            <div id="lightbox-media"></div>
        </div>
    `
    document.body.appendChild(lightbox)
    
    // Fermer au clic en dehors
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox()
    })
    
    // Fermer avec ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox()
    })
    
    // Fermer avec le X
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox)
}

function openLightbox(src, type) {
    const lightbox = document.getElementById('lightbox')
    const mediaDiv = document.getElementById('lightbox-media')
    
    if (type === 'image') {
        mediaDiv.innerHTML = `<img src="${src}" style="max-width: 90%; max-height: 90vh; border-radius: 8px;">`
    } else if (type === 'video') {
        const videoId = src.split('/').pop()
        mediaDiv.innerHTML = `<iframe width="90%" height="90%" style="max-width: 90%; max-height: 90vh; border-radius: 8px;" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
    }
    
    lightbox.classList.remove('hidden')
}

function closeLightbox() {
    document.getElementById('lightbox').classList.add('hidden')
}

async function loadGallery() {
    const galerieDiv = document.getElementById('galerie')

    try {
        // D'abord, vérifier qu'on peut se connecter et récupérer les trains simples
        console.log('📍 Chargement des trains...')
        const { data: trains, error: trainsError } = await supabase
            .from('trains')
            .select('*')
            .limit(5)

        console.log('✅ Trains reçus:', trains)
        console.log('❌ Erreur trains:', trainsError)

        if (trainsError) throw trainsError
        if (!trains || trains.length === 0) {
            galerieDiv.innerHTML = '<p>⚠️ Aucun train trouvé dans la base de données.</p>'
            return
        }

        // Récupérer tous les trains avec leurs relations
        const { data: allTrains, error } = await supabase
            .from('trains')
            .select(`
                id,
                nom,
                numero_principal,
                numero_secondaire,
                type_id,
                livree_id,
                types(id, nom, description, id_famille, famille_type(nom)),
                livrees(nom, main_color, text_color),
                trains_medias(
                    medias(
                        id,
                        type_media,
                        media_url,
                        date_ajout,
                        id_lieu1,
                        id_lieu2
                    )
                )
            `)
            .order('nom', { ascending: true })

        console.log('📊 Tous les trains:', allTrains)
        console.log('❌ Erreur complète:', error)

        if (error) throw error

        // Grouper par famille > type
        const grouped = {}
        allTrains.forEach(train => {
            const famille = train.types?.famille_type?.nom || 'Inconnu'
            const type = train.types?.nom || 'Inconnu'

            if (!grouped[famille]) grouped[famille] = {}
            if (!grouped[famille][type]) grouped[famille][type] = []
            grouped[famille][type].push(train)
        })

        // Générer le HTML
        let html = ''
        let trainCardId = 0
        
        for (const [famille, types] of Object.entries(grouped)) {
            html += `<div class="famille-section"><h2 class="famille-title">${famille}</h2>`
            
            for (const [type, typeTrains] of Object.entries(types)) {
                // Chercher la description du type
                const firstTrain = typeTrains[0]
                const typeDescription = firstTrain.types?.description || ''
                
                html += `
                    <div class="type-section">
                        <div class="type-header">
                            <h3 class="type-title">${type}</h3>
                            ${typeDescription ? `<p class="type-description">${typeDescription}</p>` : ''}
                        </div>
                        <div class="trains-grid" style="display:none;">
                `
                
                typeTrains.forEach(train => {
                    const livree = train.livrees
                    const style_background = livree?.main_color ? `background: ${livree.main_color};` : ''
                    const style_color = livree?.text_color ? `color: ${livree.text_color};` : ''
                    const cardId = `train-card-${trainCardId++}`
                    
                    html += `
                        <div class="train-card" id="${cardId}" style="${style_background}${style_color}">
                            <div class="train-header" style="cursor: pointer; user-select: none;">
                                <h4>${famille}</h4>`
                                if(train.nom.includes('BB')) { 
                                    html += `
                                        <h4>N° ${train.numero_principal}${train.numero_secondaire ? `</h4>
                                            <h4 style="font-size: 0.85rem">(${train.numero_secondaire})`: ''}</h4>`
                                }
                                else {
                                    html += `
                                        <h4>N° ${train.numero_principal}${train.numero_secondaire ? '/' + train.numero_secondaire : ''}</h4>`
                                }

                                html += `${livree ? `<p class="train-livree"><strong>Livrée:</strong> ${livree.nom}</p>` : ''}
                                <span class="expand-icon">▼</span>
                            </div>
                            <div class="medias-container" style="display: none; margin-top: 10px; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 10px;" data-train-id="${train.id}">
                                <div class="medias" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
                                    <!-- Les médias seront chargés au clic -->
                                </div>
                            </div>
                        </div>
                    `
                })
                
                html += `</div></div>`
            }
            
            html += `</div>`
        }

        galerieDiv.innerHTML = html || '<p>Aucun train dans la galerie.</p>'
        
        // Initialiser la lightbox
        initLightbox()
        
        // Ajouter les event listeners pour l'expansion des types
        setupTypeExpansion()
        
        // Ajouter les event listeners pour l'expansion
        setupCardExpansion()
    } catch (error) {
        console.error('❌ Erreur complète:', error)
        galerieDiv.innerHTML = `<p>❌ Erreur: ${error.message}</p>`
    }
}

document.addEventListener('DOMContentLoaded', loadGallery)

// ==================== GESTION DE L'EXPANSION DES TYPES ====================

function setupTypeExpansion() {
    document.querySelectorAll('.type-header').forEach(header => {
        header.style.cursor = 'pointer'
        
        header.addEventListener('click', () => {
            const typeSection = header.closest('.type-section')
            const trainsGrid = typeSection.querySelector('.trains-grid')
            const isOpen = trainsGrid.style.display !== 'none'
            
            if (isOpen) {
                trainsGrid.style.display = 'none'
            } else {
                trainsGrid.style.display = 'grid'
            }
        })
    })
}

// ==================== GESTION DE L'EXPANSION DES CARTES ====================

function setupCardExpansion() {
    document.querySelectorAll('.train-card').forEach(card => {
        const header = card.querySelector('.train-header')
        const container = card.querySelector('.medias-container')
        const icon = card.querySelector('.expand-icon')
        
        header.addEventListener('click', async () => {
            const isOpen = container.style.display !== 'none'
            
            if (isOpen) {
                // Fermer la carte
                container.style.display = 'none'
                icon.style.transform = 'rotate(0deg)'
                icon.style.transition = 'transform 0.3s'
            } else {
                // Ouvrir la carte
                container.style.display = 'block'
                icon.style.transform = 'rotate(180deg)'
                icon.style.transition = 'transform 0.3s'
                
                // Charger les médias seulement à l'ouverture
                await loadMediasForCard(card)
            }
        })
    })
}

async function loadMediasForCard(card) {
    const container = card.querySelector('.medias')
    const trainId = card.querySelector('.medias-container').dataset.trainId
    
    // Si les médias sont déjà chargés, ne rien faire
    if (container.dataset.loaded === 'true') return
    
    // Marquer comme en cours de chargement
    container.innerHTML = '<p style="text-align: center;">⏳ Chargement des médias...</p>'
    
    try {
        const { data: mediasData, error } = await supabase
            .from('trains_medias')
            .select(`
                medias(
                    id,
                    type_media,
                    media_url,
                    date_ajout,
                    id_lieu1,
                    id_lieu2,
                    lieux1:id_lieu1(nom),
                    lieux2:id_lieu2(nom)
                )
            `)
            .eq('train_id', parseInt(trainId))
        
        if (error) throw error
        
        if (!mediasData || mediasData.length === 0) {
            container.innerHTML = '<p style="text-align: center;">Aucun média pour ce train</p>'
            container.dataset.loaded = 'true'
            return
        }
        
        // Générer le HTML des médias
        let html = ''
        mediasData.forEach(tm => {
            const media = tm.medias
            if (media.type_media === 'image') {
                html += `<img src="${media.media_url}" alt="Train" style="max-width: 100%; height: auto; max-height: 250px; object-fit: contain; cursor: pointer; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);" class="media-clickable" data-src="${media.media_url}" data-type="image">`
            } else if (media.type_media === 'video') {
                const videoId = media.media_url.split('/').pop()
                html += `<iframe width="100%" height="250" style="max-width: 400px; cursor: pointer; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);" class="media-clickable" data-src="${media.media_url}" data-type="video" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
            }
            if (media.lieux2?.nom){
                html += `<p style="font-size: 0.75rem; margin-bottom: 1.5rem;">Vu entre ${media.lieux1?.nom} et ${media.lieux2?.nom} le ${media.date_ajout}</p>`
            }
            else if (media.lieux1?.nom){
                html += `<p style="font-size: 0.75rem; margin-bottom: 1.5rem;">Vu à ${media.lieux1?.nom} le ${media.date_ajout}</p>`
            }
            
        })
        
        container.innerHTML = html
        container.dataset.loaded = 'true'
        
        // Ajouter les event listeners pour la lightbox
        container.querySelectorAll('.media-clickable').forEach(el => {
            el.addEventListener('click', () => {
                openLightbox(el.dataset.src, el.dataset.type)
            })
        })
    } catch (error) {
        console.error('Erreur chargement médias:', error)
        container.innerHTML = `<p style="color: red;">❌ Erreur: ${error.message}</p>`
    }
}
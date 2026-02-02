import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Configuration Supabase - utiliser la config globale injectée par config.js
const SUPABASE_URL = window.CONFIG?.SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = window.CONFIG?.SUPABASE_ANON_KEY || 'your-anon-key'

let supabase = null

// Initialiser Supabase
function initSupabase() {
  const url = window.SUPABASE_URL || SUPABASE_URL
  const key = window.SUPABASE_KEY || SUPABASE_ANON_KEY

  if (!url.includes('supabase') || key === 'your-anon-key') {
    console.warn('⚠️ Clés Supabase non configurées. Vérifiez config.js')
    return null
  }

  supabase = createClient(url, key)
  return supabase
}

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
        types(id, nom, description, id_famille),
        livrees(id, nom),
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

    if (!trains || trains.length === 0) {
      galerieDiv.innerHTML = '<p style="text-align: center;">Aucun train dans la galerie.</p>'
      return
    }

    // Récupérer les familles pour grouper
    const { data: familles } = await supabase
      .from('famille_type')
      .select('id, nom')

    // Grouper par famille > type
    const grouped = {}
    trains.forEach(train => {
      const familleId = train.types.id_famille
      const famille = familles?.find(f => f.id === familleId)?.nom || 'Inconnu'
      const type = train.types.nom || 'Inconnu'

      if (!grouped[famille]) grouped[famille] = {}
      if (!grouped[famille][type]) grouped[famille][type] = []
      grouped[famille][type].push(train)
    })

    // Générer le HTML
    let html = ''
    for (const [famille, types] of Object.entries(grouped)) {
      html += `<h2 style="margin-top: 2rem; color: #0077b6;">${famille}</h2>`
      for (const [type, typeTrains] of Object.entries(types)) {
        html += `<h3 style="color: #1a237e; margin-top: 1rem;">${type}</h3>`
        html += `<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; margin-bottom: 2rem;">`
        
        typeTrains.forEach(train => {
          const livrée = train.livrees?.nom || 'Non spécifiée'
          const medias = train.trains_medias || []
          
          html += `
            <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="padding: 1rem;">
                <h4 style="margin: 0 0 0.5rem 0; color: #1a237e;">${train.nom}</h4>
                <p style="margin: 0.3rem 0; font-size: 0.9em; color: #666;">
                  <strong>N°:</strong> ${train.numero_principal}${train.numero_secondaire ? ' / ' + train.numero_secondaire : ''}
                </p>
                <p style="margin: 0.3rem 0; font-size: 0.9em; color: #666;">
                  <strong>Livrée:</strong> ${livrée}
                </p>
          `

          if (medias.length > 0) {
            html += `<div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">`
            medias.forEach(tm => {
              const media = tm.medias
              if (media.type_media === 'image') {
                html += `<img src="${media.media_url}" alt="${train.nom}" style="width: 100%; height: auto; border-radius: 4px; cursor: pointer;" onclick="openLightbox('${media.media_url}')">`
              } else if (media.type_media === 'video') {
                const videoId = media.media_url.split('/').pop()
                html += `<iframe width="100%" height="120" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="border-radius: 4px;"></iframe>`
              }
            })
            html += `</div>`
          } else {
            html += `<p style="margin-top: 1rem; color: #999; font-size: 0.9em;">Aucun média</p>`
          }

          html += `</div></div>`
        })
        
        html += `</div>`
      }
    }

    galerieDiv.innerHTML = html
  } catch (error) {
    console.error('❌ Erreur:', error)
    galerieDiv.innerHTML = `<p style="color: red;">❌ Erreur: ${error.message}</p>`
  }
}

// Lightbox simple
function openLightbox(src) {
  const lightbox = document.createElement('div')
  lightbox.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    cursor: pointer;
  `
  
  const img = document.createElement('img')
  img.src = src
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
  `
  
  lightbox.appendChild(img)
  lightbox.addEventListener('click', () => lightbox.remove())
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') lightbox.remove()
  })
  
  document.body.appendChild(lightbox)
}

document.addEventListener('DOMContentLoaded', async () => {
  initSupabase()
  await loadGallery()
})

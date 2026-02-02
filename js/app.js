/**
 * Application Trains - Supabase Edition
 * Gestion des données trains avec Supabase
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Configuration Supabase - utiliser la config globale injectée par config.js
const SUPABASE_URL = window.CONFIG?.SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = window.CONFIG?.SUPABASE_ANON_KEY || 'your-anon-key'

let supabase = null

// Initialiser Supabase
function initSupabase() {
  // Lire depuis les variables globales si disponibles (pour Vercel)
  const url = window.SUPABASE_URL || SUPABASE_URL
  const key = window.SUPABASE_KEY || SUPABASE_ANON_KEY

  if (!url.includes('supabase') || key === 'your-anon-key') {
    console.warn('⚠️ Clés Supabase non configurées. Vérifiez .env.local')
    return null
  }

  supabase = createClient(url, key)
  return supabase
}

// ==================== DONNÉES CACHE ====================
let cache = {
  familles: null,
  types: null,
  livrees: null,
  lieux: null,
  trains: null,
  medias: null
}

// ==================== RÉCUPÉRATION DES DONNÉES ====================

/**
 * Récupérer toutes les familles de trains
 */
async function getFamilles() {
  if (cache.familles) return cache.familles

  const { data, error } = await supabase
    .from('famille_type')
    .select('*')
    .order('nom', { ascending: true })

  if (error) {
    console.error('Erreur récupération familles:', error)
    return []
  }

  cache.familles = data
  return data
}

/**
 * Récupérer les types d'une famille
 */
async function getTypesByFamille(familleId) {
  const { data, error } = await supabase
    .from('types')
    .select('*')
    .eq('id_famille', familleId)
    .order('nom', { ascending: true })

  if (error) {
    console.error('Erreur récupération types:', error)
    return []
  }

  return data
}

/**
 * Récupérer tous les types
 */
async function getAllTypes() {
  if (cache.types) return cache.types

  const { data, error } = await supabase
    .from('types')
    .select('*')
    .order('nom', { ascending: true })

  if (error) {
    console.error('Erreur récupération types:', error)
    return []
  }

  cache.types = data
  return data
}

/**
 * Récupérer les trains d'un type
 */
async function getTrainsByType(typeId) {
  const { data, error } = await supabase
    .from('trains')
    .select('*')
    .eq('type_id', typeId)
    .order('nom', { ascending: true })

  if (error) {
    console.error('Erreur récupération trains:', error)
    return []
  }

  return data
}

/**
 * Récupérer les livrées
 */
async function getLivrees() {
  if (cache.livrees) return cache.livrees

  const { data, error } = await supabase
    .from('livrees')
    .select('*')
    .order('nom', { ascending: true })

  if (error) {
    console.error('Erreur récupération livrées:', error)
    return []
  }

  cache.livrees = data
  return data
}

/**
 * Récupérer les lieux
 */
async function getLieux() {
  if (cache.lieux) return cache.lieux

  const { data, error } = await supabase
    .from('lieux')
    .select('*')
    .order('nom', { ascending: true })

  if (error) {
    console.error('Erreur récupération lieux:', error)
    return []
  }

  cache.lieux = data
  return data
}

/**
 * Récupérer tous les trains avec leurs relations
 */
async function getAllTrainsWithRelations() {
  const { data, error } = await supabase
    .from('trains')
    .select(`
      *,
      types(*),
      livrees(*),
      trains_medias(
        medias(
          *,
          lieux_1:lieux!medias_id_lieu1_fkey(*),
          lieux_2:lieux!medias_id_lieu2_fkey(*)
        )
      )
    `)
    .order('nom', { ascending: true })

  if (error) {
    console.error('Erreur récupération trains complets:', error)
    return []
  }

  return data
}

/**
 * Récupérer la galerie complète groupée par famille > type
 */
async function getGalleryData() {
  const trains = await getAllTrainsWithRelations()

  // Grouper par famille > type
  const grouped = {}

  for (const train of trains) {
    const famille = train.types.famille_nom || 'Inconnu'
    const type = train.types.nom || 'Inconnu'

    if (!grouped[famille]) grouped[famille] = {}
    if (!grouped[famille][type]) grouped[famille][type] = []

    grouped[famille][type].push(train)
  }

  return grouped
}

// ==================== AJOUTER UN TRAIN ====================

/**
 * Ajouter un nouveau train
 */
async function addTrain(trainData) {
  const { data, error } = await supabase
    .from('trains')
    .insert([
      {
        nom: trainData.nom,
        type_id: trainData.type_id,
        numero_principal: trainData.numero_principal,
        numero_secondaire: trainData.numero_secondaire,
        livree_id: trainData.livree_id
      }
    ])
    .select()

  if (error) {
    throw new Error(`Erreur ajout train: ${error.message}`)
  }

  cache.trains = null // Invalidate cache
  return data[0]
}

// ==================== AJOUTER UN MÉDIA ====================

/**
 * Ajouter un média lié à un ou plusieurs trains
 */
async function addMedia(mediaData) {
  // 1. Insérer le média
  const { data: mediaInserted, error: mediaError } = await supabase
    .from('medias')
    .insert([
      {
        type_media: mediaData.type_media,
        media_url: mediaData.media_url,
        id_lieu1: mediaData.id_lieu1,
        id_lieu2: mediaData.id_lieu2,
        date_ajout: mediaData.date_ajout || new Date().toISOString().split('T')[0]
      }
    ])
    .select()

  if (mediaError) {
    throw new Error(`Erreur ajout média: ${mediaError.message}`)
  }

  const mediaId = mediaInserted[0].id

  // 2. Lier aux trains
  const trainsMedias = mediaData.train_ids.map(trainId => ({
    train_id: trainId,
    media_id: mediaId
  }))

  const { error: linkError } = await supabase
    .from('trains_medias')
    .insert(trainsMedias)

  if (linkError) {
    throw new Error(`Erreur liaison train-média: ${linkError.message}`)
  }

  return mediaInserted[0]
}

// ==================== UTILITAIRES UI ====================

/**
 * Afficher/cacher les blocs media
 */
function setupMediaToggle() {
  const selectSets = [
    { type: 'type_media', blocImage: 'bloc_image', blocVideo: 'bloc_video' },
    { type: 'type_media_exist', blocImage: 'bloc_image_exist', blocVideo: 'bloc_video_exist' }
  ]

  selectSets.forEach(set => {
    const select = document.getElementById(set.type)
    if (!select) return

    const img = document.getElementById(set.blocImage)
    const vid = document.getElementById(set.blocVideo)

    select.addEventListener('change', () => {
      img?.classList.add('hidden')
      vid?.classList.add('hidden')
      if (select.value === 'image') img?.classList.remove('hidden')
      if (select.value === 'video') vid?.classList.remove('hidden')
    })
  })
}

/**
 * Gérer l'affichage des sélecteurs de lieu
 */
function setupLocationToggle() {
  document.querySelectorAll('select[name="type_lieu"]').forEach(sel => {
    sel.addEventListener('change', function () {
      const form = sel.closest('form')
      const simple = form?.querySelector('.lieux_simple')
      const dbl = form?.querySelector('.lieux_double')

      if (this.value === '2') {
        simple?.classList.add('hidden')
        dbl?.classList.remove('hidden')
      } else if (this.value === '1') {
        dbl?.classList.add('hidden')
        simple?.classList.remove('hidden')
      } else {
        simple?.classList.add('hidden')
        dbl?.classList.add('hidden')
      }
    })
  })
}

// ==================== FORMULAIRES ====================

/**
 * Initialiser le formulaire d'ajout de train
 */
async function setupTrainForm() {
  const form = document.getElementById('form-train')
  if (!form) return

  // Charger les données
  const [familles, livrees] = await Promise.all([
    getFamilles(),
    getLivrees()
  ])

  // Remplir famille > type
  const familleSelect = document.getElementById('famille_type_id')
  const typeSelect = document.getElementById('type_id')

  if (familleSelect && typeSelect) {
    // Remplir les familles
    familleSelect.innerHTML = '<option value="">-- Sélectionner une famille --</option>'
    familles.forEach(f => {
      const opt = document.createElement('option')
      opt.value = f.id
      opt.textContent = f.nom
      familleSelect.appendChild(opt)
    })

    // Charger types au changement de famille
    familleSelect.addEventListener('change', async () => {
      const types = await getTypesByFamille(parseInt(familleSelect.value))
      typeSelect.innerHTML = '<option value="">-- Sélectionner un type --</option>'
      types.forEach(t => {
        const opt = document.createElement('option')
        opt.value = t.id
        opt.textContent = t.nom
        typeSelect.appendChild(opt)
      })
    })
  }

  // Remplir livrées
  const livreeSelect = document.getElementById('livree')
  if (livreeSelect) {
    livreeSelect.innerHTML = '<option value="">-- Sélectionner une livrée --</option>'
    livrees.forEach(l => {
      const opt = document.createElement('option')
      opt.value = l.id
      opt.textContent = l.nom
      livreeSelect.appendChild(opt)
    })
  }

  // Soumettre le formulaire
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)

    try {
      await addTrain({
        nom: `${data.type_id} ${data.numero_principal}`,
        type_id: parseInt(data.type_id),
        numero_principal: data.numero_principal,
        numero_secondaire: data.numero_secondaire || null,
        livree_id: data.livree_id ? parseInt(data.livree_id) : null
      })

      alert('✅ Train ajouté avec succès')
      form.reset()
      // Recharger la galerie si elle existe
      if (typeof reloadGallery === 'function') reloadGallery()
    } catch (error) {
      alert(`❌ Erreur: ${error.message}`)
    }
  })
}

// ==================== INITIALISATION ====================

/**
 * Initialiser l'application
 */
async function init() {
  const db = initSupabase()

  if (!db) {
    console.error('Supabase non initialisé. Vérifiez vos clés.')
    document.body.innerHTML = '<h1>❌ Erreur de configuration. Vérifiez les variables d\'environnement.</h1>'
    return
  }

  // Charger les données de base
  await Promise.all([
    getFamilles(),
    getLivrees(),
    getLieux()
  ])

  // Initialiser les UI
  setupMediaToggle()
  setupLocationToggle()
  setupTrainForm()

  console.log('✅ Application initialisée')
}

// Exporter les fonctions pour utilisation globale
window.trains = {
  init,
  getFamilles,
  getAllTypes,
  getTrainsByType,
  getLivrees,
  getLieux,
  getAllTrainsWithRelations,
  getGalleryData,
  addTrain,
  addMedia
}

// ==================== FORMULAIRE D'AJOUT DE MÉDIAS ====================

async function setupMediaForm() {
  const formMedia = document.getElementById('form-media')
  if (!formMedia) return // Le formulaire n'existe pas sur cette page
  
  // Charger les trains avec checkboxes
  await loadTrainsCheckboxes()
  
  // Charger les lieux
  await loadLieuxSelects()
  
  // Soumettre le formulaire
  formMedia.addEventListener('submit', async (e) => {
    e.preventDefault()
    await handleAddMedia()
  })
}

async function loadTrainsCheckboxes() {
  const trainsSelect = document.getElementById('trains_select')
  if (!trainsSelect) return
  
  const { data: trains, error } = await supabase
    .from('trains')
    .select('id, nom, numero_principal, numero_secondaire, types(nom)')
    .order('nom', { ascending: true })
  
  if (error) {
    console.error('Erreur chargement trains:', error)
    trainsSelect.innerHTML = '<p>Erreur lors du chargement des trains</p>'
    return
  }
  
  let html = ''
  trains.forEach(train => {
    const numero = train.numero_secondaire ? `${train.numero_principal}/${train.numero_secondaire}` : train.numero_principal
    const label = `${train.nom} (N° ${numero})`
    html += `
      <div style="margin-bottom: 0.5rem;">
        <label style="display: flex; align-items: center; cursor: pointer; font-weight: normal; margin: 0;">
          <input type="checkbox" name="train_ids" value="${train.id}" style="margin-right: 0.5rem; cursor: pointer;">
          ${label}
        </label>
      </div>
    `
  })
  
  trainsSelect.innerHTML = html
}

async function loadLieuxSelects() {
  const lieu1Select = document.getElementById('lieu1')
  const lieu2Select = document.getElementById('lieu2')
  if (!lieu1Select || !lieu2Select) return
  
  const lieux = await getLieux()
  
  let html = ''
  lieux.forEach(lieu => {
    html += `<option value="${lieu.id}">${lieu.nom}</option>`
  })
  
  lieu1Select.innerHTML = '<option value="">-- Sélectionner un lieu --</option>' + html
  lieu2Select.innerHTML = '<option value="">-- Aucun --</option>' + html
}

async function handleAddMedia() {
  const formMedia = document.getElementById('form-media')
  
  // Récupérer les trains sélectionnés
  const trainCheckboxes = document.querySelectorAll('input[name="train_ids"]:checked')
  const trainIds = Array.from(trainCheckboxes).map(cb => parseInt(cb.value))
  
  if (trainIds.length === 0) {
    alert('⚠️ Sélectionnez au moins un train')
    return
  }
  
  const lieu1 = parseInt(document.getElementById('lieu1').value)
  const lieu2 = document.getElementById('lieu2').value ? parseInt(document.getElementById('lieu2').value) : null
  const dateMedia = document.getElementById('date_media').value
  const typeMedia = document.getElementById('type_media').value
  const mediaUrl = document.getElementById('media_url').value
  
  if (!lieu1 || !dateMedia || !typeMedia || !mediaUrl) {
    alert('⚠️ Remplissez tous les champs obligatoires')
    return
  }
  
  try {
    // Insérer le média
    const { data: newMedia, error: mediaError } = await supabase
      .from('medias')
      .insert([
        {
          type_media: typeMedia,
          media_url: mediaUrl,
          date_ajout: dateMedia,
          id_lieu1: lieu1,
          id_lieu2: lieu2
        }
      ])
      .select()
    
    if (mediaError) throw mediaError
    
    const mediaId = newMedia[0].id
    
    // Lier le média à chaque train sélectionné
    const trainMediaLinks = trainIds.map(trainId => ({
      train_id: trainId,
      media_id: mediaId
    }))
    
    const { error: linkError } = await supabase
      .from('trains_medias')
      .insert(trainMediaLinks)
    
    if (linkError) throw linkError
    
    alert(`✅ Média ajouté à ${trainIds.length} train(s)!`)
    formMedia.reset()
    
    // Réinitialiser les checkboxes
    document.querySelectorAll('input[name="train_ids"]').forEach(cb => cb.checked = false)
  } catch (error) {
    console.error('❌ Erreur:', error)
    alert(`❌ Erreur: ${error.message}`)
  }
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', async () => {
  await init()
  await setupMediaForm()
})


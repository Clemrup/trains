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

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', init)


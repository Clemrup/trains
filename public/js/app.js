/**
 * Application Trains - Supabase Edition
 * Gestion des données trains avec Supabase
 */

// App.js - Fichier auto-contenu dans une IIFE pour éviter les conflits de scope
(function() {
  'use strict'
  
  // Configuration Supabase - utiliser la config globale injectée par config.js
  const SUPABASE_URL = window.CONFIG?.SUPABASE_URL || 'https://your-project.supabase.co'
  const SUPABASE_ANON_KEY = window.CONFIG?.SUPABASE_ANON_KEY || 'your-anon-key'

  // Créer le client Supabase à partir du CDN global - DÉLAYÉ
  let supabase = null

  function initSupabaseClient() {
    if (supabase) return supabase // Déjà initialisé
    if (!window.supabase) {
      console.error('❌ Supabase CDN non chargé')
      return null
    }
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    console.log('✅ Client Supabase initialisé (app.js)')
    return supabase
  }

// ==================== AUTHENTIFICATION ADMIN ====================

/**
 * Vérifier si l'utilisateur est connecté
 */
async function checkAuthStatus() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Connexion admin
 */
async function loginAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  })
  
  if (error) {
    console.error('❌ Erreur connexion:', error.message)
    throw error
  }
  
  console.log('✅ Connecté:', data.user.email)
  return data
}

/**
 * Déconnexion
 */
async function logoutAdmin() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('❌ Erreur déconnexion:', error.message)
    throw error
  }
  console.log('✅ Déconnecté')
}

/**
 * Mettre à jour l'interface selon l'état de connexion
 */
function updateAuthUI(session) {
  const loginFormContainer = document.getElementById('login-form-container')
  const loggedInContainer = document.getElementById('logged-in-container')
  const formsContainer = document.getElementById('forms-container')
  const userEmailSpan = document.getElementById('user-email')
  
  if (!loginFormContainer || !formsContainer) return // Pas sur la page formulaire
  
  if (session) {
    // Connecté : afficher les formulaires
    loginFormContainer.style.display = 'none'
    loggedInContainer.style.display = 'block'
    formsContainer.style.display = 'block'
    userEmailSpan.textContent = session.user.email
  } else {
    // Non connecté : cacher les formulaires
    loginFormContainer.style.display = 'block'
    loggedInContainer.style.display = 'none'
    formsContainer.style.display = 'none'
  }
}

/**
 * Initialiser les événements d'authentification
 */
function setupAuthEvents() {
  const loginForm = document.getElementById('login-form')
  const logoutBtn = document.getElementById('logout-btn')
  const loginError = document.getElementById('login-error')
  
  if (!loginForm) return // Pas sur la page formulaire
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    loginError.style.display = 'none'
    
    const email = document.getElementById('login-email').value
    const password = document.getElementById('login-password').value
    
    try {
      const { session } = await loginAdmin(email, password)
      updateAuthUI(session)
    } catch (error) {
      loginError.textContent = '❌ ' + error.message
      loginError.style.display = 'block'
    }
  })
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await logoutAdmin()
      updateAuthUI(null)
    })
  }
  
  // Écouter les changements d'état d'authentification
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Auth state changed:', event)
    updateAuthUI(session)
  })
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
    .select(`*, types(id, nom, description)`)
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
 * Récupérer uniquement les types d'une famille qui ont des trains enregistrés
 */
async function getTypesWithTrainsByFamille(familleId) {
  const { data, error } = await supabase
    .from('types')
    .select(`
      *,
      trains(id)
    `)
    .eq('id_famille', familleId)
    .order('nom', { ascending: true })

  if (error) {
    console.error('Erreur récupération types avec trains:', error)
    return []
  }

  // Filtrer uniquement les types qui ont au moins un train
  return data.filter(type => type.trains && type.trains.length > 0)
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

// ==================== UTILITAIRES UI ====================

/**
 * Afficher/cacher les blocs media (gestion initiale)
 */
function setupMediaToggle() {
  const select = document.getElementById('type_media')
  if (select) {
    toggleMediaBlocks()
  }
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

  // Créer les boutons de familles
  const famillesButtonsContainer = document.getElementById('train-familles-buttons')
  const typesButtonsContainer = document.getElementById('train-types-buttons')
  const selectedFamilleInput = document.getElementById('train-selected-famille')
  const selectedTypeInput = document.getElementById('train-selected-type')
  
  famillesButtonsContainer.innerHTML = ''
  
  familles.forEach(famille => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.textContent = famille.nom
    btn.className = 'train-famille-btn'
    btn.dataset.familleId = famille.id
    btn.style.cssText = `
      padding: 0.6rem 1.2rem;
      border: 2px solid #0077b6;
      background-color: white;
      color: #0077b6;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    `
    
    btn.addEventListener('click', async (e) => {
      e.preventDefault()
      
      // Toggle
      if (selectedFamilleInput.value === famille.id.toString()) {
        selectedFamilleInput.value = ''
        selectedTypeInput.value = ''
        btn.style.backgroundColor = 'white'
        btn.style.color = '#0077b6'
        typesButtonsContainer.style.display = 'none'
        document.getElementById('types-container1').style.display = 'none'
        typesButtonsContainer.innerHTML = ''
        return
      }
      
      // Sélectionner cette famille
      document.querySelectorAll('.train-famille-btn').forEach(b => {
        b.style.backgroundColor = 'white'
        b.style.color = '#0077b6'
      })
      btn.style.backgroundColor = '#0077b6'
      btn.style.color = 'white'
      selectedFamilleInput.value = famille.id
      selectedTypeInput.value = ''
      
      // Charger et afficher les types du 1er formulaire
      const types = await getTypesByFamille(famille.id)
      renderTypeButtons(types, 'types-container1', 'train-types-buttons', 'train-selected-type')
    })
    
    famillesButtonsContainer.appendChild(btn)
  })

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
  
  // Gérer la soumission du formulaire
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const familleId = selectedFamilleInput.value
    const familleNom = famillesButtonsContainer.querySelector(`button[data-famille-id="${familleId}"]`)?.textContent || ''
    const typeId = selectedTypeInput.value
    const typeName = typesButtonsContainer.querySelector(`button[data-type-id="${typeId}"]`)?.textContent || ''
    const numeroPrincipal = document.getElementById('numero_principal').value
    const numeroSecondaire = document.getElementById('numero_secondaire').value
    const livreeId = document.getElementById('livree').value
    
    if (!familleId || !typeId || !numeroPrincipal || !livreeId) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }
    if (!familleNom || !typeName) {
      alert('⚠️ Erreur : impossible de récupérer le nom de la famille ou du type')
      return
    }
    let nom
    if (numeroSecondaire) {
      if (familleNom === 'BB') {
        nom = `${familleNom} ${numeroPrincipal}(${numeroSecondaire})`
      }
      else if (typeName === 'Y 8000'){
        nom = `${typeName} ${numeroPrincipal}(${numeroSecondaire})`
      }
      else {
        nom = `${familleNom} ${numeroPrincipal}/${numeroSecondaire}`
      }
    } 
    else if (familleNom === 'TGV'){
        if(typeName === 'Rames 100'){
          nom = `TGV-SE ${numeroPrincipal}`
        }
        else if (typeName === 'Rames 300'){
          nom = `TGV-A ${numeroPrincipal}`
        }
        else if (typeName === 'Rames 500' || typeName === 'Rames 4500'){
          nom = `TGV-R ${numeroPrincipal}`
        }
        else if (typeName === 'Rames 600'){
          nom = `TGV-RD ${numeroPrincipal}`
        }
        else if (typeName === 'Rames 900'){
          nom = `TGV-POSTAL ${numeroPrincipal}`
        }
        else if (typeName === 'Rames 3000' || typeName === 'Rames 3100' || typeName === 'Rames 3200'){
          nom = `TGV-TMST ${numeroPrincipal}`  
        }
        else if (typeName === 'Rames 4300'){
          nom = `TGV-PBKA ${numeroPrincipal}`
        }
        else if (typeName === 'Rames 4400'){
          nom = `TGV-POS ${numeroPrincipal}`
        }
        else {
          nom = `TGV-D ${numeroPrincipal}`
        }
    }
    else {
      nom = `${familleNom} ${numeroPrincipal}`
    }
    
    // Puis appeler addTrain avec l'objet correct
    await addTrain({
      nom: nom,
      type_id: typeId,
      numero_principal: numeroPrincipal,
      numero_secondaire: numeroSecondaire || null,
      livree_id: livreeId
    })
    
    // Réinitialiser le formulaire
    form.reset()
    selectedFamilleInput.value = ''
    selectedTypeInput.value = ''
    typesButtonsContainer.innerHTML = ''
    typesButtonsContainer.style.display = 'none'
    document.querySelectorAll('.train-famille-btn').forEach(b => {
      b.style.backgroundColor = 'white'
      b.style.color = '#0077b6'
    })
  })
}

/**
 * Afficher les boutons des types (fonction générique pour les deux formulaires)
 * @param {array} types - Liste des types à afficher
 * @param {string} containerSelector - ID du div wrapper (types-container1 ou types-container2)
 * @param {string} buttonContainerSelector - ID du div des boutons (train-types-buttons ou types-buttons-container)
 * @param {string} selectedTypeInputSelector - ID du champ hidden pour le type sélectionné
 */
function renderTypeButtons(types, containerSelector, buttonContainerSelector, selectedTypeInputSelector) {
  const container = document.getElementById(containerSelector)
  const buttonContainer = document.getElementById(buttonContainerSelector)
  const selectedTypeInput = document.getElementById(selectedTypeInputSelector)
  
  if (!container || !buttonContainer || !selectedTypeInput) {
    console.error(`❌ Éléments manquants: ${containerSelector}, ${buttonContainerSelector}, ${selectedTypeInputSelector}`)
    return
  }
  
  // Vider les boutons
  buttonContainer.innerHTML = ''
  
  // Si pas de types, cacher le conteneur
  if (!types || types.length === 0) {
    container.style.display = 'none'
    return
  }
  
  // Afficher le conteneur et les boutons
  container.style.display = 'block'
  buttonContainer.style.display = 'flex'
  
  types.forEach(type => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.textContent = type.nom
    btn.className = 'type-btn'
    btn.dataset.typeId = type.id
    btn.style.cssText = `
      padding: 0.5rem 1rem;
      background-color: #e0eaff;
      color: #1a237e;
      border: 1px solid #90caf9;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.95em;
      transition: all 0.2s;
    `
    
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      
      // Toggle: si on reclique sur le même, on déselectionne
      if (selectedTypeInput.value === type.id.toString()) {
        selectedTypeInput.value = ''
        btn.style.backgroundColor = '#e0eaff'
        btn.style.color = '#1a237e'
        // Cacher les trains si c'est le formulaire media
        const trainsContainer = document.getElementById('trains-container')
        if (trainsContainer) trainsContainer.style.display = 'none'
        updateSelectedTrainsList()
        return
      }
      
      // Déselectionner les autres boutons de type
      document.querySelectorAll('.type-btn').forEach(b => {
        b.style.backgroundColor = '#e0eaff'
        b.style.color = '#1a237e'
      })
      
      // Sélectionner ce bouton
      btn.style.backgroundColor = '#1a237e'
      btn.style.color = 'white'
      selectedTypeInput.value = type.id
      
      // Si c'est le formulaire media, charger et afficher les trains
      if (buttonContainerSelector === 'types-buttons-container') {
        loadAndRenderTrains(type.id)
      }
    })
    
    buttonContainer.appendChild(btn)
  })
}

/**
 * Charger et afficher les trains pour le formulaire media
 */
async function loadAndRenderTrains(typeId) {
  let trains = trainsCache[typeId]
  
  // Si pas en cache, charger les trains
  if (!trains) {
    trains = await getTrainsByType(typeId)
    trainsCache[typeId] = trains
  }
  
  renderTrainsCheckboxes(typeId, trains)
}


// ==================== INITIALISATION ====================

/**
 * Initialiser l'application
 */
async function init() {
  // Initialiser le client Supabase d'abord
  initSupabaseClient()
  
  // Vérifier que Supabase est bien initialisé
  if (!supabase) {
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
  setupTrainForm()

  console.log('✅ Application initialisée')
}

// Exporter les fonctions pour utilisation globale
window.trains = {
  init,
  getFamilles,
  getTrainsByType,
  getLivrees,
  getLieux,
  getAllTrainsWithRelations,
  getGalleryData,
  addTrain
}

// ==================== FORMULAIRE D'AJOUT DE MÉDIAS ====================

let selectedFamilleId = null
let selectedTypeId = null
let selectedTrains = {} // {typeId: Set(trainId)}
let trainsCache = {} // {typeId: [trains]}

async function setupMediaForm() {
  console.log('🎬 setupMediaForm() appelée')
  const formMedia = document.getElementById('form-media')
  console.log('📋 Formulaire trouvé:', !!formMedia)
  if (!formMedia) return
  
  console.log('📚 Chargement des familles...')
  // Charger les familles en onglets
  await loadFamillesTabs()
  
  // Charger les lieux
  console.log('🏠 Chargement des lieux...')
  await loadLieuxSelects()
  
  // Event listeners pour affichage/masquage
  document.getElementById('type_media').addEventListener('change', toggleMediaBlocks)
  document.getElementById('type_lieu').addEventListener('change', toggleLieuBlocks)
  
  // Soumettre le formulaire
  formMedia.addEventListener('submit', handleAddMedia)
  console.log('✅ setupMediaForm() initialisée!')
}

async function loadFamillesTabs() {
  const tabsContainer = document.getElementById('familles-tabs')
  console.log('📍 Container familles-tabs:', !!tabsContainer)
  
  const familles = await getFamilles()
  console.log('📊 Familles récupérées:', familles)
  
  tabsContainer.innerHTML = ''
  
  familles.forEach(famille => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.textContent = famille.nom
    btn.className = 'famille-tab'
    btn.dataset.familleId = famille.id
    btn.style.cssText = `
      padding: 0.6rem 1.2rem;
      border: 2px solid #0077b6;
      background-color: white;
      color: #0077b6;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    `
    
    btn.addEventListener('click', async (e) => {
      e.preventDefault()
      
      // Toggle: si on reclique sur le même, on ferme
      if (selectedFamilleId === famille.id) {
        selectedFamilleId = null
        selectedTypeId = null
        btn.classList.remove('active')
        btn.style.backgroundColor = 'white'
        btn.style.color = '#0077b6'
        document.getElementById('types-container2').style.display = 'none'
        document.getElementById('trains-container').style.display = 'none'
        return
      }
      
      // Sinon, sélectionner cette famille
      document.querySelectorAll('.famille-tab').forEach(b => {
        b.classList.remove('active')
        b.style.backgroundColor = 'white'
        b.style.color = '#0077b6'
      })
      btn.classList.add('active')
      btn.style.backgroundColor = '#0077b6'
      btn.style.color = 'white'
      selectedFamilleId = famille.id
      selectedTypeId = null
      
      // Charger et afficher uniquement les types qui ont des trains
      const typesWithTrains = await getTypesWithTrainsByFamille(famille.id)
      renderTypeButtons(typesWithTrains, 'types-container2', 'types-buttons-container', 'media-selected-type')
    })
    
    tabsContainer.appendChild(btn)
  })
}

async function renderTrainsCheckboxes(typeId, trains) {
  const container = document.getElementById('trains_select')
  container.innerHTML = ''
  
  if (trains.length === 0) {
    container.innerHTML = '<em>Aucun train pour ce type.</em>'
    updateSelectedTrainsList()
    return
  }
  
  const selected = selectedTrains[typeId] || new Set()
  
  trains.forEach(train => {
    const label = document.createElement('label')
    label.style.cssText = 'display: flex; align-items: center; cursor: pointer; font-weight: normal; margin: 0.5rem 0;'
    
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.className = 'train-checkbox'
    checkbox.value = train.id
    checkbox.dataset.name = `${train.nom}`
    checkbox.style.marginRight = '0.5rem'
    checkbox.style.cursor = 'pointer'
    
    // Rétablir la sélection si déjà sélectionné
    if (selected.has(String(train.id)) || selected.has(Number(train.id))) {
      checkbox.checked = true
    }
    
    checkbox.addEventListener('change', () => {
      if (!selectedTrains[typeId]) selectedTrains[typeId] = new Set()
      if (checkbox.checked) {
        selectedTrains[typeId].add(String(train.id))
      } else {
        selectedTrains[typeId].delete(String(train.id))
      }
      updateSelectedTrainsList()
    })
    
    const texto = document.createTextNode(checkbox.dataset.name)
    label.appendChild(checkbox)
    label.appendChild(texto)
    container.appendChild(label)
  })
  
  document.getElementById('trains-container').style.display = 'block'
  updateSelectedTrainsList()
}

function updateSelectedTrainsList() {
  const listDiv = document.getElementById('selected-trains-list')
  const displayDiv = document.getElementById('selected-trains-display')
  let allSelected = []
  
  Object.entries(selectedTrains).forEach(([typeId, set]) => {
    if (!trainsCache[typeId]) return
    trainsCache[typeId].forEach(train => {
      if (set.has(String(train.id)) || set.has(Number(train.id))) {
        allSelected.push(`${train.nom}`)
      }
    })
  })
  
  if (allSelected.length > 0) {
    listDiv.innerHTML = allSelected
      .map(n => `<span style="background: #e3f2fd; padding: 0.4rem 0.8rem; border-radius: 4px; margin-right: 0.5rem; display: inline-block; margin-bottom: 0.3rem; color: #0077b6;">${n}</span>`)
      .join('')
    displayDiv.style.display = 'block'
  } else {
    displayDiv.style.display = 'none'
    listDiv.innerHTML = ''
  }
}

async function loadLieuxSelects() {
  const lieux = await getLieux()
  
  let html = ''
  lieux.forEach(lieu => {
    html += `<option value="${lieu.id}">${lieu.nom}</option>`
  })
  
  document.getElementById('lieu1').innerHTML = '<option value="">-- Sélectionner un lieu --</option>' + html
  document.getElementById('lieu1_double').innerHTML = '<option value="">-- Sélectionner le premier lieu --</option>' + html
  document.getElementById('lieu2_double').innerHTML = '<option value="">-- Sélectionner le deuxième lieu --</option>' + html
}

function toggleMediaBlocks() {
  const typeMedia = document.getElementById('type_media').value
  document.getElementById('bloc_image').style.display = typeMedia === 'image' ? 'block' : 'none'
  document.getElementById('bloc_video').style.display = typeMedia === 'video' ? 'block' : 'none'
}

function toggleLieuBlocks() {
  const typeLieu = document.getElementById('type_lieu').value
  const lieu1 = document.getElementById('lieu1')
  const lieu1Double = document.getElementById('lieu1_double')
  const lieu2Double = document.getElementById('lieu2_double')
  
  document.getElementById('lieux_simple_container').style.display = typeLieu === 'simple' ? 'block' : 'none'
  document.getElementById('lieux_double_container').style.display = typeLieu === 'double' ? 'block' : 'none'
  
  // Gérer les required selon le type de lieu
  if (typeLieu === 'simple') {
    // Dans une gare : required sur lieu1
    lieu1.required = true
    lieu1Double.required = false
    lieu2Double.required = false
  } else if (typeLieu === 'double') {
    // Entre deux gares : required sur lieu1_double et lieu2_double
    lieu1.required = false
    lieu1Double.required = true
    lieu2Double.required = true
  }
}

async function handleAddMedia(e) {
  e.preventDefault()
  const formMedia = document.getElementById('form-media')
  const submitBtn = formMedia.querySelector('button[type="submit"]')
  
  // Bloquer les soumissions doubles
  if (submitBtn.disabled) {
    console.warn('⚠️ Soumission bloquée : le bouton est déjà désactivé')
    return
  }
  submitBtn.disabled = true
  submitBtn.style.opacity = '0.5'
  const originalText = submitBtn.textContent
  submitBtn.textContent = '⏳ Traitement...'
  
  try {
    // Récupérer tous les trains sélectionnés
    let trainIds = []
    Object.values(selectedTrains).forEach(set => {
      set.forEach(id => trainIds.push(Number(id)))
    })
    
    console.log('📍 Trains sélectionnés:', trainIds)
    
    if (trainIds.length === 0) {
      alert('⚠️ Sélectionnez au moins un train')
      submitBtn.disabled = false
      submitBtn.style.opacity = '1'
      submitBtn.textContent = originalText
      return
    }
    
    const typeMedia = document.getElementById('type_media').value
    const typeLieu = document.getElementById('type_lieu').value
    const dateMedia = document.getElementById('date_media').value
    
    if (!typeMedia || !typeLieu || !dateMedia) {
      alert('⚠️ Remplissez tous les champs obligatoires')
      submitBtn.disabled = false
      submitBtn.style.opacity = '1'
      submitBtn.textContent = originalText
      return
    }
    
    let mediaUrl = ''
    let lieu1 = null
    let lieu2 = null
    
    // Récupérer l'URL du média
    if (typeMedia === 'image') {
      const folder = document.getElementById('image_folder').value
      const filename = document.getElementById('image_filename').value
      
      if (folder && filename) {
        mediaUrl = folder + filename + '.jpg'
      } else {
        alert('⚠️ Sélectionner un dossier et entrer le nom du fichier')
        submitBtn.disabled = false
        submitBtn.style.opacity = '1'
        submitBtn.textContent = originalText
        return
      }
    } else if (typeMedia === 'video') {
      mediaUrl = document.getElementById('video_url').value
      if (!mediaUrl) {
        alert('⚠️ Fournir l\'URL YouTube')
        submitBtn.disabled = false
        submitBtn.style.opacity = '1'
        submitBtn.textContent = originalText
        return
      }
    }
    
    // Récupérer les lieux
    if (typeLieu === 'simple') {
      lieu1 = parseInt(document.getElementById('lieu1').value)
      if (!lieu1) {
        alert('⚠️ Sélectionner un lieu')
        submitBtn.disabled = false
        submitBtn.style.opacity = '1'
        submitBtn.textContent = originalText
        return
      }
    } else if (typeLieu === 'double') {
      lieu1 = parseInt(document.getElementById('lieu1_double').value)
      lieu2 = parseInt(document.getElementById('lieu2_double').value)
      if (!lieu1 || !lieu2) {
        alert('⚠️ Sélectionner les deux lieux')
        submitBtn.disabled = false
        submitBtn.style.opacity = '1'
        submitBtn.textContent = originalText
        return
      }
    }
    
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
    
    if (mediaError) {
      console.error('❌ Erreur insertion média:', mediaError)
      console.error('   Details:', JSON.stringify(mediaError, null, 2))
      throw mediaError
    }
    
    console.log('✅ Média créé:', newMedia[0].id)
    const mediaId = newMedia[0].id
    
    // Lier le média à chaque train sélectionné
    const trainMediaLinks = trainIds.map(trainId => ({
      train_id: trainId,
      media_id: mediaId
    }))
    
    console.log('📎 Liens à créer:', trainMediaLinks)
    
    const { error: linkError } = await supabase
      .from('trains_medias')
      .insert(trainMediaLinks)
    
    if (linkError) {
      console.error('❌ Erreur création liens:', linkError)
      console.error('   Details:', JSON.stringify(linkError, null, 2))
      throw linkError
    }
    
    console.log(`✅ Liens créés pour ${trainIds.length} train(s)`)
    
    alert(`✅ Média ajouté à ${trainIds.length} train(s)!`)
    formMedia.reset()
    selectedTrains = {}
    selectedTypeId = null
    selectedFamilleId = null
    updateSelectedTrainsList()
    document.getElementById('trains-container').style.display = 'none'
    document.getElementById('types-container2').style.display = 'none'
    
    submitBtn.disabled = false
    submitBtn.style.opacity = '1'
    submitBtn.textContent = originalText
  } catch (error) {
    console.error('❌ Erreur complète:', error)
    console.error('   Message:', error.message)
    console.error('   Details:', JSON.stringify(error, null, 2))
    alert(`❌ Erreur: ${error.message}`)
    submitBtn.disabled = false
    submitBtn.style.opacity = '1'
    submitBtn.textContent = originalText
  }
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', async () => {
  await init()
  
  // Initialiser l'authentification (uniquement sur la page formulaire)
  setupAuthEvents()
  const session = await checkAuthStatus()
  updateAuthUI(session)
  
  await setupMediaForm()
})

})() // Fin de la IIFE


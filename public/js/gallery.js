/**
 * gallery.js — Logique de la galerie ferroviaire
 * Dépend de : config.js, supabase CDN
 */
(function () {
  'use strict'

  // ─── Constantes ──────────────────────────────────────────────────────────────

  const GEO_BOUNDS = {
    west: -4.795555555555556,
    east: 8.230555555555556,
    north: 51.0891667,
    south: 42.3327778,
  }

  const SVG_BOUNDS = {
    left: 45.5,
    right: 870.4,
    top: 43.6,
    bottom: 836.8,
  }

  const MAP_VIEW = { width: 1000, height: 960, maxZoom: 30 }
  let mapZoom = 1
  let mapViewX = 0
  let mapViewY = 0

  function gpsToSvg(latitude, longitude) {
    const lat = Number(latitude)
    const lon = Number(longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null

    return {
      x: SVG_BOUNDS.left + ((lon - GEO_BOUNDS.west) / (GEO_BOUNDS.east - GEO_BOUNDS.west)) * (SVG_BOUNDS.right - SVG_BOUNDS.left),
      y: SVG_BOUNDS.top + ((GEO_BOUNDS.north - lat) / (GEO_BOUNDS.north - GEO_BOUNDS.south)) * (SVG_BOUNDS.bottom - SVG_BOUNDS.top),
    }
  }

  function lieuToSvg(lieu) {
    return gpsToSvg(lieu.latitude, lieu.longitude)
  }

  function clampMapView() {
    const visibleWidth = MAP_VIEW.width / mapZoom
    const visibleHeight = MAP_VIEW.height / mapZoom
    mapViewX = Math.max(0, Math.min(MAP_VIEW.width - visibleWidth, mapViewX))
    mapViewY = Math.max(0, Math.min(MAP_VIEW.height - visibleHeight, mapViewY))
  }

  function updateMapView() {
    const svg = document.getElementById('france-map')
    if (!svg) return
    clampMapView()
    svg.setAttribute('viewBox', `${mapViewX} ${mapViewY} ${MAP_VIEW.width / mapZoom} ${MAP_VIEW.height / mapZoom}`)
    svg.querySelectorAll('.map-pin').forEach(pin => {
      const x = Number(pin.dataset.mapX)
      const y = Number(pin.dataset.mapY)
      if (Number.isFinite(x) && Number.isFinite(y)) {
        pin.setAttribute('transform', `translate(${x} ${y}) scale(${1 / mapZoom}) translate(${-x} ${-y})`)
      }
    })
    svg.dataset.zoom = String(mapZoom)
  }

  function setMapZoom(nextZoom) {
    const oldZoom = mapZoom
    mapZoom = Math.max(1, Math.min(MAP_VIEW.maxZoom, nextZoom))
    if (mapZoom === oldZoom) return

    const oldWidth = MAP_VIEW.width / oldZoom
    const oldHeight = MAP_VIEW.height / oldZoom
    const centerX = mapViewX + oldWidth / 2
    const centerY = mapViewY + oldHeight / 2
    mapViewX = centerX - MAP_VIEW.width / mapZoom / 2
    mapViewY = centerY - MAP_VIEW.height / mapZoom / 2
    updateMapView()
  }

  function setupMapControls() {
    const svg = document.getElementById('france-map')
    if (!svg || svg.dataset.controlsReady === 'true') return

    document.getElementById('map-zoom-in')?.addEventListener('click', () => setMapZoom(mapZoom + 1))
    document.getElementById('map-zoom-out')?.addEventListener('click', () => setMapZoom(mapZoom - 1))
    document.getElementById('map-zoom-reset')?.addEventListener('click', () => {
      mapZoom = 1
      mapViewX = 0
      mapViewY = 0
      updateMapView()
    })

    svg.addEventListener('click', event => {
      const pin = event.target.closest('.map-pin')
      if (!pin) return
      const nom = pin.dataset.lieuNom
      if (!nom) return
      state.selectedLieuNom = state.selectedLieuNom === nom ? null : nom
      renderCarte()
      renderCartePanel()
    })

    let pointerId = null
    let lastX = 0
    let lastY = 0
    svg.addEventListener('pointerdown', event => {
      if (event.button !== 0 && event.pointerType !== 'touch') return
      if (event.target.closest('.map-pin')) return
      pointerId = event.pointerId
      lastX = event.clientX
      lastY = event.clientY
      svg.setPointerCapture(pointerId)
      svg.classList.add('is-panning')
    })
    svg.addEventListener('pointermove', event => {
      if (event.pointerId !== pointerId) return
      const rect = svg.getBoundingClientRect()
      const visibleWidth = MAP_VIEW.width / mapZoom
      const visibleHeight = MAP_VIEW.height / mapZoom
      mapViewX -= (event.clientX - lastX) * visibleWidth / rect.width
      mapViewY -= (event.clientY - lastY) * visibleHeight / rect.height
      lastX = event.clientX
      lastY = event.clientY
      updateMapView()
    })
    const stopPanning = event => {
      if (event.pointerId !== pointerId) return
      pointerId = null
      svg.classList.remove('is-panning')
    }
    svg.addEventListener('pointerup', stopPanning)
    svg.addEventListener('pointercancel', stopPanning)
    svg.dataset.controlsReady = 'true'
    updateMapView()
  }

  const FAMILLE_COLORS = {
    'TGV':       '#c4372a',
    'AGC':       '#3a6ea8',
    'Régiolis':  '#2d8a4e',
    'Z 2':       '#8b5e3c',
    'Corail':    '#6b5a8e',
    'BB':        '#c47a1e',
    'Autorail':  '#4a7a6e',
    'NAT':       '#2a6ea8',
    'Regio 2N':  '#5a4e8e',
    'TER 2N NG': '#3a7a5e',
  }

  const MONTH_NAMES = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

  // ─── État global ─────────────────────────────────────────────────────────────

  let db = null
  let allMedias = []      // Médias enrichis (processMedias)
  let familles = []
  let types = []
  let livrees = []
  let lieux = []
  let lignes = []

  let state = {
    view: 'galerie',
    filters: emptyFilters(),
    selectedLieuNom: null,
    selectedYear: null,
    selectedMonth: null,
    lightbox: null,
    openFamilies: new Set(),
    openTypes: new Set(),
    openTrains: new Set(),
    expandedLieu: null,
  }

  function emptyFilters() {
    return { familleId: '', typeId: '', trainId: '', lieuId: '', livreeId: '', kind: '', dateFrom: '', dateTo: '', query: '' }
  }

  async function loadFranceMap() {
    const svg = document.getElementById('france-map')
    if (!svg || svg.dataset.loaded === 'true') return

    const response = await fetch('fr.svg')
    if (!response.ok) throw new Error(`Impossible de charger fr.svg (${response.status})`)

    const xml = new DOMParser().parseFromString(await response.text(), 'image/svg+xml')
    const sourceSvg = xml.documentElement
    if (xml.querySelector('parsererror') || sourceSvg.nodeName.toLowerCase() !== 'svg') {
      throw new Error('fr.svg est invalide')
    }

    svg.setAttribute('viewBox', sourceSvg.getAttribute('viewBox') || '0 0 1000 960')
    ;['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'].forEach(attribute => {
      const value = sourceSvg.getAttribute(attribute)
      if (value !== null) svg.setAttribute(attribute, value)
    })
    svg.replaceChildren(...[...sourceSvg.childNodes].map(node => document.importNode(node, true)))
    svg.dataset.loaded = 'true'
  }

  // ─── Init ─────────────────────────────────────────────────────────────────────

  async function init() {
    db = window.supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON_KEY)
    try {
      await loadFranceMap()
      await loadData()
    } catch (err) {
      console.error('Erreur chargement données:', err)
      document.getElementById('loader').innerHTML =
        '<p style="color:#f44336;font-family:monospace">Erreur de connexion à la base de données.<br>Vérifiez config.js</p>'
      return
    }
    setupNav()
    setupMapControls()
    setupLightbox()
    state.selectedYear = getAvailableYears()[0] || new Date().getFullYear().toString()
    state.openFamilies = new Set(familles.slice(0, 1).map(f => f.id))
    renderView()
    document.getElementById('loader').classList.add('hidden')
  }

  // ─── Chargement Supabase ──────────────────────────────────────────────────────

  async function fetchAllMedias() {
    const pageSize = 500
    const data = []
    let offset = 0
    let total = null

    while (true) {
      const response = await db.from('medias').select(`
        *,
        lieux_1:lieux!medias_id_lieu1_fkey(*),
        lieux_2:lieux!medias_id_lieu2_fkey(*),
        trains_medias(
          trains(
            *,
            livrees(*),
            types(*, famille_type(*), constructeur(*))
          )
        )
      `, { count: 'exact' }).order('date_ajout', { ascending: false }).order('id', { ascending: true }).range(offset, offset + pageSize - 1)

      if (response.error) throw response.error

      data.push(...(response.data || []))
      total = response.count ?? total

      if (!response.data || response.data.length < pageSize || data.length >= total) break
      offset += pageSize
    }

    return { data, count: total ?? data.length }
  }

  async function loadData() {
    const [mRes, tRes, fRes, lRes, lvRes, lignesRes, lignesLieuxRes] = await Promise.all([
      fetchAllMedias(),
      db.from('trains').select('*', { count: 'exact', head: true }),
      db.from('famille_type').select('*').order('nom'),
      db.from('lieux').select('*').order('nom'),
      db.from('livrees').select('*').order('nom'),
      db.from('lignes').select('*').order('nom'),
      db.from('lignes_lieux').select('*').order('id_ligne').order('ordre'),
    ])

    if (mRes.error) throw mRes.error
    if (tRes.error) throw tRes.error
    if (fRes.error) throw fRes.error
    if (lignesRes.error) throw lignesRes.error
    if (lignesLieuxRes.error) throw lignesLieuxRes.error

    familles = fRes.data || []
    lieux = lRes.data || []
    livrees = lvRes.data || []
    const liensParLigne = new Map()
    ;(lignesLieuxRes.data || []).forEach(link => {
      const lineId = String(link.id_ligne)
      if (!liensParLigne.has(lineId)) liensParLigne.set(lineId, [])
      liensParLigne.get(lineId).push(link)
    })
    lignes = (lignesRes.data || []).map(ligne => ({
      ...ligne,
      lignes_lieux: liensParLigne.get(String(ligne.id)) || [],
    }))
    allMedias = processMedias(mRes.data || [])

    // Mettre à jour les compteurs du header
    setInner('stat-trains', tRes.count ?? 0)
    setInner('stat-medias', mRes.count ?? 0)
    setInner('stat-lieux', lieux.length)

    // Bande de livrées
    buildLiveryStrip()
    // Pré-remplir les selects de filtre
    buildFilterSelects()
    // Pré-remplir les selects de recherche (même appel)
  }

  function getYouTubeId(url) {
    if (!url) return null
    const m = url.match(/(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return m ? m[1] : null
  }

  function processMedias(raw) {
    const result = []
    raw.forEach(m => {
      const trains = (m.trains_medias || []).map(tm => tm.trains).filter(Boolean)
      if (trains.length === 0) return
      trains.forEach(train => {
        result.push({
          key: `${m.id}_${train.id}`,
          media: m,
          trains,
          lieu1: m.lieux_1,
          lieu2: m.lieux_2,
          train,
          type: train.types,
          famille: train.types?.famille_type,
          livree: train.livrees,
        })
      })
    })
    return result
  }

  // ─── Navigation ──────────────────────────────────────────────────────────────

  function setupNav() {
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = btn.dataset.view
        state.view = v
        document.querySelectorAll('.nav-tab').forEach(b => b.classList.toggle('active', b.dataset.view === v))
        document.getElementById('hero').style.display = v === 'galerie' ? 'block' : 'none'
        document.getElementById('livery-strip').style.display = v === 'galerie' ? 'flex' : 'none'
        renderView()
      })
    })
  }

  function renderView() {
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'))
    const el = document.getElementById('view-' + state.view)
    if (el) el.classList.add('active')

    switch (state.view) {
      case 'galerie':      renderGalerie(); break
      case 'recherche':    renderRecherche(); break
      case 'carte':        renderCarte(); break
      case 'lieux':        renderLieux(); break
      case 'dates':        renderDates(); break
      case 'arborescence': renderArborescence(); break
    }
  }

  // ─── Filtrage ─────────────────────────────────────────────────────────────────

  function applyFilters(medias, f) {
    const seenMediaIds = new Set()
    const result = []

    medias.forEach(em => {
      const mediaId = em.media.id
      if (seenMediaIds.has(mediaId)) return
      seenMediaIds.add(mediaId)

      if (f.lieuId) {
        const lid = parseInt(f.lieuId)
        if (em.media.id_lieu1 !== lid && em.media.id_lieu2 !== lid) return
      }
      if (f.kind && em.media.type_media !== f.kind) return
      if (f.dateFrom && em.media.date_ajout < f.dateFrom) return
      if (f.dateTo && em.media.date_ajout > f.dateTo) return

      const trainMatches = em.trains.filter(train => {
        if (f.familleId && train.types?.famille_type?.id != f.familleId) return false
        if (f.typeId && train.type_id != f.typeId) return false
        if (f.trainId && train.id != f.trainId) return false
        if (f.livreeId && train.livree_id != f.livreeId) return false
        return true
      })
      if (trainMatches.length === 0) return

      let matchingTrain = trainMatches[0]
      if (f.query) {
        const q = f.query.toLowerCase()
        const matchingTrainByQuery = trainMatches.find(train => [
          train.numero_principal || '',
          train.numero_secondaire || '',
          train.livrees?.nom || '',
          train.types?.nom || '',
          train.types?.famille_type?.nom || '',
        ].join(' ').toLowerCase().includes(q))
        const mediaText = [
          em.media.description || '',
          em.media.titre || '',
          em.type?.nom || '',
          em.famille?.nom || '',
          em.lieu1?.nom || '',
          em.lieu2?.nom || '',
        ].join(' ').toLowerCase()
        if (!matchingTrainByQuery && !mediaText.includes(q)) return
        matchingTrain = matchingTrainByQuery || trainMatches[0]
      }

      result.push({
        ...em,
        key: `${mediaId}_${matchingTrain.id}`,
        train: matchingTrain,
        type: matchingTrain.types,
        famille: matchingTrain.types?.famille_type,
        livree: matchingTrain.livrees,
      })
    })

    return result
  }

  // ─── Card HTML ────────────────────────────────────────────────────────────────

  function cardHTML(em) {
    const { key, media, train, type, famille, livree, lieu1, lieu2 } = em
    if (!train) return ''
    const mc = livree?.main_color || '#1c1c22'
    const tc = livree?.text_color || '#e6e0d4'
    const fc = FAMILLE_COLORS[famille?.nom] || '#888'
    const rgb = hexToRgb(mc)
    const locStr = lieu1?.nom + (lieu2 ? ' · ' + lieu2.nom : '')
    const isVideo = media.type_media === 'video'
    const ytId = isVideo ? getYouTubeId(media.media_url) : null
    const thumbSrc = ytId
      ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      : media.media_url

    return `
      <div class="media-card" data-key="${key}">
        <div class="card-img-wrap">
          <img src="${thumbSrc}" alt="${famille?.nom || ''} ${train.numero_principal}" loading="lazy">
          <div class="card-overlay" style="background:linear-gradient(to top,rgba(${rgb},.96) 0%,rgba(${rgb},.4) 55%,transparent 100%)">
            <span class="card-overlay-lieu" style="color:${tc}">${locStr}</span>
            <span class="card-overlay-date" style="color:${tc}">${formatDate(media.date_ajout)}</span>
          </div>
          ${isVideo ? '<div class="card-vid-badge"><span>▶</span> VID</div>' : ''}
        </div>
        <div class="card-livree-band" style="background:${mc}">
          <span class="card-num" style="color:${tc}">
            N°&nbsp;${train.numero_principal}
            ${train.numero_secondaire ? `<span class="card-num-secondary">${train.numero_secondaire}</span>` : ''}
          </span>
          <span class="card-livree-nom" style="color:${tc}">${livree?.nom || '—'}</span>
        </div>
        <div class="card-meta">
          <span class="famille-badge" style="color:${fc};background:${fc}22;border-color:${fc}44">${famille?.nom || '—'}</span>
          <span class="card-type-nom">${type?.nom || '—'}</span>
        </div>
      </div>`
  }

  function renderGrid(medias, container, compact) {
    const grid = document.createElement('div')
    grid.className = 'media-grid' + (compact ? ' compact' : '')
    grid.innerHTML = medias.map(cardHTML).join('')
    grid.querySelectorAll('.media-card').forEach(card => {
      card.addEventListener('click', () => {
        openLightbox(allMedias.find(em => em.key === card.dataset.key))
      })
    })
    container.innerHTML = ''
    container.appendChild(grid)
  }

  // ─── Vue Galerie ──────────────────────────────────────────────────────────────

  function renderGalerie() {
    const el = document.getElementById('view-galerie')
    el.querySelector('.view-count').textContent = new Set(allMedias.map(em => em.media.id)).size + ' médias'
    const container = el.querySelector('.gallery-container')
    renderGrid(allMedias, container, false)
  }

  // ─── Vue Recherche ────────────────────────────────────────────────────────────

  function buildFilterSelects() {
    fillSelect('f-famille', familles, f => ({ val: f.id, label: f.nom }), 'Toutes les familles')
    fillSelect('f-livree', livrees, l => ({ val: l.id, label: l.nom }), 'Toutes les livrées')
    fillSelect('f-lieu', lieux, l => ({ val: l.id, label: l.nom }), 'Tous les lieux')
  }

  function renderRecherche() {
    const el = document.getElementById('view-recherche')
    const f = state.filters

    // Sync selects
    syncSelect('f-famille', f.familleId)
    syncSelect('f-type', f.typeId)
    syncSelect('f-train', f.trainId)
    syncSelect('f-livree', f.livreeId)
    syncSelect('f-lieu', f.lieuId)
    syncSelect('f-kind', f.kind)
    setVal('f-datefrom', f.dateFrom)
    setVal('f-dateto', f.dateTo)
    setVal('f-query', f.query)

    const filtered = applyFilters(allMedias, f)
    el.querySelector('.view-count').textContent = filtered.length + ' résultat' + (filtered.length > 1 ? 's' : '')

    const container = el.querySelector('.results-container')
    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state">Aucun résultat pour ces filtres</div>'
    } else {
      renderGrid(filtered, container, true)
    }
  }

  function setupRechercheEvents() {
    const watch = (id, key) => {
      const el = document.getElementById(id)
      if (!el) return
      el.addEventListener('change', () => {
        state.filters[key] = el.value
        if (key === 'familleId') { state.filters.typeId = ''; state.filters.trainId = ''; rebuildTypeSelect(); rebuildTrainSelect() }
        if (key === 'typeId')    { state.filters.trainId = ''; rebuildTrainSelect() }
        if (state.view === 'recherche') renderRecherche()
      })
    }
    const watchInput = (id, key) => {
      const el = document.getElementById(id)
      if (!el) return
      el.addEventListener('input', () => { state.filters[key] = el.value; if (state.view === 'recherche') renderRecherche() })
    }

    watch('f-famille', 'familleId')
    watch('f-type', 'typeId')
    watch('f-train', 'trainId')
    watch('f-livree', 'livreeId')
    watch('f-lieu', 'lieuId')
    watch('f-kind', 'kind')
    watchInput('f-datefrom', 'dateFrom')
    watchInput('f-dateto', 'dateTo')
    watchInput('f-query', 'query')

    document.querySelectorAll('.kind-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.filters.kind = btn.dataset.kind
        document.querySelectorAll('.kind-btn').forEach(b => b.classList.toggle('active', b.dataset.kind === btn.dataset.kind))
        if (state.view === 'recherche') renderRecherche()
      })
    })

    const resetBtn = document.getElementById('filter-reset')
    if (resetBtn) resetBtn.addEventListener('click', () => {
      state.filters = emptyFilters()
      document.querySelectorAll('.kind-btn').forEach(b => b.classList.toggle('active', b.dataset.kind === ''))
      renderRecherche()
    })
  }

  function rebuildTypeSelect() {
    const fid = state.filters.familleId ? parseInt(state.filters.familleId) : null
    const filtered = fid ? allMedias.filter(em => em.famille?.id === fid).flatMap(em => em.trains.map(t => t.types)).filter(Boolean) : []
    const unique = [...new Map(filtered.map(t => [t.id, t])).values()].sort((a,b) => a.nom.localeCompare(b.nom))
    fillSelect('f-type', unique, t => ({ val: t.id, label: t.nom }), 'Tous les types')
    fillSelect('f-train', [], () => {}, 'Tous les trains')
  }

  function rebuildTrainSelect() {
    const tid = state.filters.typeId ? parseInt(state.filters.typeId) : null
    const filtered = tid ? allMedias.flatMap(em => em.trains.filter(t => t.type_id === tid)) : []
    const unique = [...new Map(filtered.map(t => [t.id, t])).values()].sort((a,b) => (a.numero_principal||'').localeCompare(b.numero_principal||''))
    fillSelect('f-train', unique, t => ({ val: t.id, label: 'N° ' + t.numero_principal }), 'Tous les trains')
  }

  // ─── Vue Carte ────────────────────────────────────────────────────────────────

  function renderCarte() {
    // Count medias per lieu
    const counts = {}
    allMedias.forEach(em => {
      if (em.lieu1) counts[em.lieu1.nom] = (counts[em.lieu1.nom] || 0) + 1
      if (em.lieu2) counts[em.lieu2.nom] = (counts[em.lieu2.nom] || 0) + 1
    })
    const max = Math.max(...Object.values(counts), 1)

    const svg = document.getElementById('france-map')
    // Remove old pins
    svg.querySelectorAll('.map-pin').forEach(p => p.remove())
    svg.querySelector('.map-line-layer')?.remove()

    const lineLayer = svgEl('g', { class: 'map-line-layer', 'aria-label': 'Lignes ferroviaires', 'pointer-events': 'none' })
    lignes.forEach(ligne => {
      const points = (ligne.lignes_lieux || [])
        .map(link => {
          const linkLieu = link.lieux
          const linkLieuId = link.id_lieu ?? link['id-lieu']
          const lieu = linkLieu || lieux.find(item => String(item.id) === String(linkLieuId))
          const coords = lieu ? lieuToSvg(lieu) : null
          return coords ? { ...coords, ordre: Number(link.ordre) } : null
        })
        .filter(point => point && Number.isFinite(point.ordre))
        .sort((a, b) => a.ordre - b.ordre)

      if (points.length < 2) return

      const isLgv = ligne.LGV === true || ligne.lgv === true || ligne.LGV === 'true' || ligne.lgv === 'true'
      lineLayer.appendChild(svgEl('polyline', {
        class: isLgv ? 'map-line map-line-lgv' : 'map-line map-line-standard',
        points: points.map(point => `${point.x},${point.y}`).join(' '),
        'data-ligne-nom': ligne.nom || '',
      }))
    })
    svg.appendChild(lineLayer)

    lieux.forEach(lieu => {
      const nom = lieu.nom
      const coords = lieuToSvg(lieu)
      if (!coords) return
      const { x, y } = coords
      const count = counts[nom] || 0
      if (count === 0) return
      const r = 4 + (count / max) * 10
      const isSel = state.selectedLieuNom === nom

      const g = svgEl('g', { class: 'map-pin', 'data-map-x': x, 'data-map-y': y, 'data-lieu-nom': nom })
      g.appendChild(svgEl('circle', { cx: x, cy: y, r: r + 5, fill: isSel ? '#e8a02018' : 'transparent' }))
      const mainCircle = svgEl('circle', { cx: x, cy: y, r, fill: isSel ? '#e8a020' : '#e8a02077', stroke: isSel ? '#e8a020bb' : '#e8a02044', 'stroke-width': 1.5 })
      g.appendChild(mainCircle)
      g.appendChild(svgEl('circle', { cx: x, cy: y, r: 2, fill: isSel ? '#0c0c0f' : '#e8a020aa' }))
      const txt = svgEl('text', { x, y: y - r - 4, 'text-anchor': 'middle', 'font-size': 9, fill: isSel ? '#e8a020' : '#e8a02088', 'font-family': 'JetBrains Mono' })
      txt.textContent = count
      g.appendChild(txt)

      svg.appendChild(g)
    })

    updateMapView()
    renderCartePanel()
  }

  function renderCartePanel() {
    const panel = document.getElementById('carte-panel')
    const nom = state.selectedLieuNom

    if (!nom) {
      panel.innerHTML = `
        <div class="map-panel-empty">
          <div class="map-panel-icon">⊕</div>
          <p class="font-mono" style="font-size:.7rem;color:var(--muted)">Cliquez sur un point<br>pour voir les médias du lieu</p>
        </div>`
      return
    }

    const items = allMedias.filter(em => em.lieu1?.nom === nom || em.lieu2?.nom === nom)
    panel.innerHTML = `
      <div class="map-panel-header">
        <div>
          <p class="map-panel-tag">LIEU SÉLECTIONNÉ</p>
          <h3 class="map-panel-title">${nom}</h3>
          <p class="map-panel-count">${items.length} média${items.length > 1 ? 's' : ''}</p>
        </div>
        <button class="map-close-btn" id="carte-close">×</button>
      </div>
      <div class="map-media-list">
        ${items.map(em => {
          const mc = em.livree?.main_color || '#1c1c22'
          const tc = em.livree?.text_color || '#e6e0d4'
          const emYtId = em.media.type_media === 'video' ? getYouTubeId(em.media.media_url) : null
          const emThumb = emYtId ? `https://img.youtube.com/vi/${emYtId}/hqdefault.jpg` : em.media.media_url
          return `
            <div class="map-media-item" data-key="${em.key}" role="button" tabindex="0">
              <div class="map-media-thumb-wrap">
                <img class="map-media-thumb" src="${emThumb}" alt="">
                ${emYtId ? '<span class="map-media-play">▶</span>' : ''}
              </div>
              <div class="map-media-info" style="background:${mc}">
                <p class="map-media-train" style="color:${tc}">${em.famille?.nom || ''} · N°&nbsp;${em.train?.numero_principal || ''}</p>
                <p class="map-media-livree" style="color:${tc}">${em.livree?.nom || '—'}</p>
                <p class="map-media-date" style="color:${tc}">${em.media.date_ajout}</p>
              </div>
            </div>`
        }).join('')}
      </div>
      <button class="map-filter-btn" id="carte-filter-btn">Filtrer la galerie par ce lieu →</button>`

    panel.querySelectorAll('.map-media-item').forEach(item => {
      const open = () => openLightbox(allMedias.find(em => em.key === item.dataset.key))
      item.addEventListener('click', open)
      item.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          open()
        }
      })
    })

    document.getElementById('carte-close')?.addEventListener('click', () => {
      state.selectedLieuNom = null; renderCarte()
    })
    document.getElementById('carte-filter-btn')?.addEventListener('click', () => {
      const lieu = lieux.find(l => l.nom === nom)
      if (lieu) { state.filters.lieuId = String(lieu.id); state.view = 'recherche' }
      document.querySelectorAll('.nav-tab').forEach(b => b.classList.toggle('active', b.dataset.view === 'recherche'))
      document.getElementById('hero').style.display = 'none'
      document.getElementById('livery-strip').style.display = 'none'
      renderView()
    })
  }

  // ─── Vue Lieux ────────────────────────────────────────────────────────────────

  function renderLieux() {
    const stats = lieux.map(lieu => {
      const items = allMedias.filter(em => em.lieu1?.id === lieu.id || em.lieu2?.id === lieu.id)
      const trainSet = new Set(items.flatMap(em => em.trains.map(t => t.id)))
      const dates = items.map(em => em.media.date_ajout).sort()
      return { lieu, items, trainCount: trainSet.size, firstDate: dates[0], lastDate: dates[dates.length - 1] }
    }).filter(s => s.items.length > 0).sort((a, b) => b.items.length - a.items.length)

    document.getElementById('view-lieux').querySelector('.view-count').textContent = stats.length + ' lieux photographiés'

    const list = document.getElementById('lieux-list')
    list.innerHTML = stats.map(s => `
      <div class="lieu-row${state.expandedLieu === s.lieu.id ? ' open' : ''}" data-lieu-id="${s.lieu.id}">
        <button class="lieu-row-header">
          <span class="lieu-count">${s.items.length}</span>
          <span class="lieu-name">${s.lieu.nom}</span>
          <span class="lieu-meta">${s.trainCount} train${s.trainCount > 1 ? 's' : ''}</span>
          <span class="lieu-dates">${s.firstDate ? formatDate(s.firstDate) + ' — ' + formatDate(s.lastDate) : ''}</span>
          <span class="lieu-chevron">›</span>
        </button>
        <div class="lieu-row-body">
          <div class="lieu-preview">
            ${s.items.slice(0, 6).map(em => {
              const mc = em.livree?.main_color || '#1c1c22'
              const tc = em.livree?.text_color || '#e6e0d4'
              return `<div class="lieu-preview-card">
                <img src="${em.media.media_url}" alt="">
                <div class="lieu-preview-info" style="background:${mc}">
                  <span class="lieu-preview-train" style="color:${tc}">${em.famille?.nom || ''} ${em.train?.numero_principal || ''}</span>
                  <span class="lieu-preview-livree" style="color:${tc}">${em.livree?.nom || '—'}</span>
                </div>
              </div>`
            }).join('')}
          </div>
          <button class="lieu-filter-btn" data-lieu-id="${s.lieu.id}">Voir tous les médias de ce lieu →</button>
        </div>
      </div>`).join('')

    list.querySelectorAll('.lieu-row-header').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.closest('.lieu-row').dataset.lieuId)
        state.expandedLieu = state.expandedLieu === id ? null : id
        renderLieux()
      })
    })
    list.querySelectorAll('.lieu-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.filters.lieuId = btn.dataset.lieuId
        state.view = 'recherche'
        document.querySelectorAll('.nav-tab').forEach(b => b.classList.toggle('active', b.dataset.view === 'recherche'))
        document.getElementById('hero').style.display = 'none'
        document.getElementById('livery-strip').style.display = 'none'
        renderView()
      })
    })
  }

  // ─── Vue Dates ────────────────────────────────────────────────────────────────

  function getAvailableYears() {
    return [...new Set(allMedias.map(em => em.media.date_ajout.slice(0, 4)))].sort().reverse()
  }

  function renderDates() {
    const years = getAvailableYears()
    if (!state.selectedYear || !years.includes(state.selectedYear)) state.selectedYear = years[0]

    // Year tabs
    const yearTabsEl = document.getElementById('year-tabs')
    yearTabsEl.innerHTML = years.map(y => `
      <button class="year-tab${state.selectedYear === y ? ' active' : ''}" data-year="${y}">${y}</button>`).join('')
    yearTabsEl.querySelectorAll('.year-tab').forEach(btn => {
      btn.addEventListener('click', () => { state.selectedYear = btn.dataset.year; state.selectedMonth = null; renderDates() })
    })

    // Month bars
    const byMonth = {}
    for (let i = 1; i <= 12; i++) byMonth[i] = []
    allMedias.filter(em => em.media.date_ajout.startsWith(state.selectedYear)).forEach(em => {
      const mo = parseInt(em.media.date_ajout.slice(5, 7))
      byMonth[mo].push(em)
    })
    const max = Math.max(...Object.values(byMonth).map(a => a.length), 1)

    document.getElementById('month-chart-label').textContent = 'MÉDIAS PAR MOIS — ' + state.selectedYear
    const barsEl = document.getElementById('month-bars')
    barsEl.innerHTML = MONTH_NAMES.map((name, i) => {
      const mo = i + 1
      const count = byMonth[mo].length
      const h = count === 0 ? 4 : Math.max(8, (count / max) * 72)
      const isSel = state.selectedMonth === mo
      return `
        <div class="month-col${isSel ? ' active' : ''}" data-mo="${mo}" style="cursor:${count > 0 ? 'pointer' : 'default'}">
          <div class="month-bar" style="height:${h}px;background:${isSel ? '#e8a020' : count > 0 ? '#e8a02055' : '#1c1c22'}"></div>
          <span class="month-col-name">${name}</span>
          ${count > 0 ? `<span class="month-col-count">${count}</span>` : ''}
        </div>`
    }).join('')
    barsEl.querySelectorAll('.month-col').forEach(col => {
      col.addEventListener('click', () => {
        const mo = parseInt(col.dataset.mo)
        if (byMonth[mo].length === 0) return
        state.selectedMonth = state.selectedMonth === mo ? null : mo
        renderDates()
      })
    })

    // Active chip
    const chipEl = document.getElementById('active-month-chip')
    if (state.selectedMonth) {
      chipEl.style.display = 'inline-flex'
      chipEl.textContent = '× ' + MONTH_NAMES[state.selectedMonth - 1] + ' ' + state.selectedYear
      chipEl.onclick = () => { state.selectedMonth = null; renderDates() }
    } else {
      chipEl.style.display = 'none'
    }

    // Results
    const displayed = state.selectedMonth ? byMonth[state.selectedMonth] : Object.values(byMonth).flat()
    document.getElementById('dates-result-count').textContent = displayed.length + ' média' + (displayed.length !== 1 ? 's' : '')
    renderGrid(displayed, document.getElementById('dates-grid'), false)
  }

  // ─── Vue Arborescence ─────────────────────────────────────────────────────────

  function renderArborescence() {
    // Collect all types and trains from loaded medias
    const typeMap = new Map()
    const trainMap = new Map()
    allMedias.forEach(em => {
      em.trains.forEach(t => {
        if (t.types) typeMap.set(t.type_id, t.types)
        trainMap.set(t.id, t)
      })
    })
    const allTypes = [...typeMap.values()].sort((a,b) => a.nom.localeCompare(b.nom))
    const allTrains = [...trainMap.values()].sort((a,b) => (a.numero_principal||'').localeCompare(b.numero_principal||''))

    const tree = document.getElementById('arbo-tree')
    tree.innerHTML = familles.map(famille => {
      const familleTypes = allTypes.filter(t => t.id_famille === famille.id)
      if (familleTypes.length === 0) return ''
      const familleTrains = allTrains.filter(t => familleTypes.some(ft => ft.id === t.type_id))
      const familleMediaCount = new Set(allMedias.filter(em => em.famille?.id === famille.id).map(em => em.media.id)).size
      const fc = FAMILLE_COLORS[famille.nom] || '#888'
      const isOpen = state.openFamilies.has(famille.id)

      return `
        <div class="tree-famille${isOpen ? ' open' : ''}" data-famille-id="${famille.id}">
          <button class="tree-famille-header">
            <span class="tree-caret" style="color:${fc}">▶</span>
            <div class="tree-famille-bar" style="background:${fc}"></div>
            <span class="tree-famille-name">${famille.nom}</span>
            <span class="tree-famille-stat">${familleTypes.length} types</span>
            <span class="tree-famille-stat">${familleTrains.length} trains</span>
            <span class="tree-famille-count" style="color:${fc}">${familleMediaCount} médias</span>
          </button>
          <div class="tree-types">
            ${familleTypes.map(type => {
              const typeTrains = allTrains.filter(t => t.type_id === type.id)
              const typeMediaCount = new Set(allMedias.filter(em => em.type?.id === type.id).map(em => em.media.id)).size
              const isTypeOpen = state.openTypes.has(type.id)
              const constructeur = type.constructeur?.nom || ''
              return `
                <div class="tree-type-row${isTypeOpen ? ' open' : ''}" data-type-id="${type.id}">
                  <button class="tree-type-header">
                    <span class="tree-caret" style="color:var(--muted)">▶</span>
                    <div class="flex-1 min-w-0">
                      <span class="tree-type-name">${type.nom}</span>
                      <span class="tree-type-sub">${constructeur}${constructeur && type.description ? ' · ' : ''}${(type.description||'').slice(0,70)}${type.description && type.description.length > 70 ? '…' : ''}</span>
                    </div>
                    <span class="tree-type-stat">${typeTrains.length} trains</span>
                    <span class="tree-type-stat">${typeMediaCount} médias</span>
                  </button>
                  <div class="tree-trains">
                    ${typeTrains.map(train => {
                      const livree = train.livrees
                      const mc = livree?.main_color || '#1c1c22'
                      const tc = livree?.text_color || '#e6e0d4'
                      const trainMedias = allMedias.filter(em => em.train?.id === train.id)
                      const isTrainOpen = state.openTrains.has(train.id)
                      return `
                        <div class="tree-train-row${isTrainOpen ? ' open' : ''}" data-train-id="${train.id}">
                          <button class="tree-train-header">
                            <span class="tree-caret" style="color:var(--border)">▶</span>
                            <div class="tree-swatch" style="background:${mc}">
                              <div class="tree-swatch-dot" style="background:${tc}99"></div>
                            </div>
                            <span class="tree-train-num">N°&nbsp;${train.numero_principal}</span>
                            ${train.numero_secondaire ? `<span class="tree-train-num2">${train.numero_secondaire}</span>` : ''}
                            <span class="tree-train-livree">${livree?.nom || '—'}</span>
                            <span class="tree-train-count">${trainMedias.length} médias</span>
                          </button>
                          <div class="tree-media-strip">
                            ${trainMedias.map(em => {
                              const emYtId = em.media.type_media === 'video' ? getYouTubeId(em.media.media_url) : null
                              const emThumb = emYtId ? `https://img.youtube.com/vi/${emYtId}/hqdefault.jpg` : em.media.media_url
                              return `
                              <div class="tree-media-thumb" data-key="${em.key}">
                                <div class="tree-thumb-wrap">
                                  <img src="${emThumb}" alt="" style="width:100%;height:72px;object-fit:cover">
                                  ${em.media.type_media === 'video' ? `<div class="tree-play-overlay"><div class="tree-play-btn">▶</div></div>` : ''}
                                </div>
                                <div class="tree-media-info" style="background:${mc};padding:5px 8px">
                                  <span class="tree-media-loc" style="color:${tc}">${em.lieu1?.nom || ''}</span>
                                  <span class="tree-media-date" style="color:${tc}">${em.media.date_ajout}</span>
                                </div>
                              </div>`
                            }).join('')}
                          </div>
                        </div>`
                    }).join('')}
                  </div>
                </div>`
            }).join('')}
          </div>
        </div>`
    }).join('')

    // Events
    tree.querySelectorAll('.tree-famille-header').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.closest('.tree-famille').dataset.familleId)
        state.openFamilies.has(id) ? state.openFamilies.delete(id) : state.openFamilies.add(id)
        renderArborescence()
      })
    })
    tree.querySelectorAll('.tree-type-header').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.closest('.tree-type-row').dataset.typeId)
        state.openTypes.has(id) ? state.openTypes.delete(id) : state.openTypes.add(id)
        renderArborescence()
      })
    })
    tree.querySelectorAll('.tree-train-header').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.closest('.tree-train-row').dataset.trainId)
        state.openTrains.has(id) ? state.openTrains.delete(id) : state.openTrains.add(id)
        renderArborescence()
      })
    })
    tree.querySelectorAll('.tree-media-thumb').forEach(el => {
      el.addEventListener('click', () => {
        openLightbox(allMedias.find(em => em.key === el.dataset.key))
      })
    })
  }

  // ─── Lightbox ─────────────────────────────────────────────────────────────────

  function setupLightbox() {
    document.getElementById('lightbox').addEventListener('click', e => {
      if (e.target === e.currentTarget) closeLightbox()
    })
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox)
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox() })
  }

  function openLightbox(em) {
    if (!em) return
    const { media, train, type, famille, livree, lieu1, lieu2 } = em
    const mc = livree?.main_color || '#1c1c22'
    const tc = livree?.text_color || '#e6e0d4'
    const locStr = lieu1?.nom + (lieu2 ? ' · ' + lieu2.nom : '')

    const isVideo = media.type_media === 'video'
    const ytId = isVideo ? getYouTubeId(media.media_url) : null
    const imgEl = document.getElementById('lb-img')
    const iframeEl = document.getElementById('lb-iframe')
    if (isVideo && ytId) {
      imgEl.style.display = 'none'
      iframeEl.style.display = 'block'
      iframeEl.src = `https://www.youtube.com/embed/${ytId}?autoplay=1`
    } else {
      iframeEl.style.display = 'none'
      iframeEl.src = ''
      imgEl.style.display = 'block'
      imgEl.src = media.media_url
    }

    document.getElementById('lb-livree-band').style.background = mc
    document.getElementById('lb-tag').style.color = tc
    document.getElementById('lb-tag').textContent = (famille?.nom || '') + ' · ' + (type?.nom || '')
    document.getElementById('lb-title').style.color = tc
    document.getElementById('lb-title').textContent = 'N° ' + (train?.numero_principal || '')
    if (train?.numero_secondaire) document.getElementById('lb-title').textContent += '  ' + train.numero_secondaire
    document.getElementById('lb-sub').style.color = tc
    document.getElementById('lb-sub').textContent = livree?.nom || '—'
    document.getElementById('lb-loc').textContent = locStr
    document.getElementById('lb-loc').style.color = tc
    document.getElementById('lb-date').textContent = formatDate(media.date_ajout)
    document.getElementById('lb-date').style.color = tc
    document.getElementById('lb-desc').textContent = type?.description || ''
    document.getElementById('lb-constructeur').textContent = type?.constructeur?.nom || '—'

    // Multi-trains
    if (em.trains.length > 1) {
      document.getElementById('lb-trains-section').style.display = 'block'
      document.getElementById('lb-trains').textContent = em.trains.map(t => 'N° ' + t.numero_principal).join(', ')
    } else {
      document.getElementById('lb-trains-section').style.display = 'none'
    }

    document.getElementById('lightbox').classList.add('open')
  }

  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open')
    const iframeEl = document.getElementById('lb-iframe')
    if (iframeEl) iframeEl.src = ''
  }

  // ─── Livrée strip ─────────────────────────────────────────────────────────────

  function buildLiveryStrip() {
    const strip = document.getElementById('livery-strip')
    strip.innerHTML = livrees.map(l => `<div class="livery-swatch" style="background:${l.main_color}" title="${l.nom}"></div>`).join('')
  }

  // ─── Utilitaires ──────────────────────────────────────────────────────────────

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
    return `${r},${g},${b}`
  }
  function formatDate(d) {
    if (!d) return ''
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  function setInner(id, val) { const el = document.getElementById(id); if (el) el.textContent = val }
  function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val }
  function syncSelect(id, val) { const el = document.getElementById(id); if (el) el.value = val }
  function fillSelect(id, items, fn, placeholder) {
    const el = document.getElementById(id)
    if (!el) return
    el.innerHTML = `<option value="">${placeholder}</option>` + items.map(item => {
      const { val, label } = fn(item)
      return `<option value="${val}">${label}</option>`
    }).join('')
  }
  function svgEl(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag)
    Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v))
    return el
  }

  // ─── Bootstrap ────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', async () => {
    await init()
    setupRechercheEvents()
  })

})()

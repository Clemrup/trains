/**
 * gallery.js — Logique de la galerie ferroviaire
 * Dépend de : config.js, supabase CDN
 */
(function () {
  'use strict'

  // ─── Constantes ──────────────────────────────────────────────────────────────

  const LIEU_COORDS = {
    'Paris-Gare-de-Lyon':      [229, 143],
    'Paris-Nord':              [229, 138],
    'Paris-Austerlitz':        [232, 149],
    'Paris-Montparnasse':      [226, 150],
    'Paris-Est':               [233, 141],
    'Paris-Saint-Lazare':      [224, 140],
    'Lyon-Part-Dieu':          [297, 293],
    'Lyon-Perrache':           [294, 297],
    'Marseille-Saint-Charles': [312, 412],
    'Bordeaux-Saint-Jean':     [150, 337],
    'Lille-Europe':            [249, 57],
    'Lille-Flandres':          [246, 60],
    'Strasbourg':              [377, 156],
    'Nantes':                  [123, 222],
    'Rennes':                  [119, 181],
    'Montpellier-Saint-Roch':  [272, 397],
    'Nice-Ville':              [364, 392],
    'Toulouse-Matabiau':       [205, 397],
    'Dijon-Ville':             [303, 217],
    'Grenoble':                [322, 320],
    'Caen':                    [149, 127],
    'Rouen-Rive-Droite':       [195, 115],
    'Valence-TGV':             [299, 329],
    'Metz-Ville':              [338, 120],
    'Nancy':                   [332, 133],
    'Reims':                   [265, 100],
    'Tours':                   [210, 210],
    'Angers':                  [160, 210],
    'Le Mans':                 [190, 180],
    'Clermont-Ferrand':        [268, 275],
    'Avignon-TGV':             [305, 375],
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

  // ─── Init ─────────────────────────────────────────────────────────────────────

  async function init() {
    db = window.supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON_KEY)
    try {
      await loadData()
    } catch (err) {
      console.error('Erreur chargement données:', err)
      document.getElementById('loader').innerHTML =
        '<p style="color:#f44336;font-family:monospace">Erreur de connexion à la base de données.<br>Vérifiez config.js</p>'
      return
    }
    setupNav()
    setupLightbox()
    state.selectedYear = getAvailableYears()[0] || new Date().getFullYear().toString()
    state.openFamilies = new Set(familles.slice(0, 1).map(f => f.id))
    renderView()
    document.getElementById('loader').classList.add('hidden')
  }

  // ─── Chargement Supabase ──────────────────────────────────────────────────────

  async function loadData() {
    const [mRes, tRes, fRes, lRes, lvRes] = await Promise.all([
      db.from('medias').select(`
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
      `, { count: 'exact' }).order('date_ajout', { ascending: false }),
      db.from('trains').select('*', { count: 'exact', head: true }),
      db.from('famille_type').select('*').order('nom'),
      db.from('lieux').select('*').order('nom'),
      db.from('livrees').select('*').order('nom'),
    ])

    if (mRes.error) throw mRes.error
    if (tRes.error) throw tRes.error
    if (fRes.error) throw fRes.error

    familles = fRes.data || []
    lieux = lRes.data || []
    livrees = lvRes.data || []
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

  function processMedias(raw) {
    return raw.map(m => {
      const trains = (m.trains_medias || []).map(tm => tm.trains).filter(Boolean)
      const first = trains[0]
      return {
        media: m,
        trains,
        lieu1: m.lieux_1,
        lieu2: m.lieux_2,
        train: first,
        type: first?.types,
        famille: first?.types?.famille_type,
        livree: first?.livrees,
      }
    })
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
    return medias.filter(em => {
      if (f.familleId && !em.trains.some(t => t.types?.famille_type?.id == f.familleId)) return false
      if (f.typeId   && !em.trains.some(t => t.type_id == f.typeId)) return false
      if (f.trainId  && !em.trains.some(t => t.id == f.trainId)) return false
      if (f.livreeId && !em.trains.some(t => t.livree_id == f.livreeId)) return false
      if (f.lieuId) {
        const lid = parseInt(f.lieuId)
        if (em.media.id_lieu1 !== lid && em.media.id_lieu2 !== lid) return false
      }
      if (f.kind && em.media.type_media !== f.kind) return false
      if (f.dateFrom && em.media.date_ajout < f.dateFrom) return false
      if (f.dateTo   && em.media.date_ajout > f.dateTo)   return false
      if (f.query) {
        const q = f.query.toLowerCase()
        const hay = [
          ...em.trains.map(t => t.numero_principal || ''),
          ...em.trains.map(t => t.numero_secondaire || ''),
          ...em.trains.map(t => t.livrees?.nom || ''),
          em.type?.nom || '', em.famille?.nom || '',
          em.lieu1?.nom || '', em.lieu2?.nom || '',
        ].join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }

  // ─── Card HTML ────────────────────────────────────────────────────────────────

  function cardHTML(em) {
    const { media, train, type, famille, livree, lieu1, lieu2 } = em
    if (!train) return ''
    const mc = livree?.main_color || '#1c1c22'
    const tc = livree?.text_color || '#e6e0d4'
    const fc = FAMILLE_COLORS[famille?.nom] || '#888'
    const rgb = hexToRgb(mc)
    const locStr = lieu1?.nom + (lieu2 ? ' · ' + lieu2.nom : '')

    return `
      <div class="media-card" data-id="${media.id}">
        <div class="card-img-wrap">
          <img src="${media.media_url}" alt="${famille?.nom || ''} ${train.numero_principal}" loading="lazy">
          <div class="card-overlay" style="background:linear-gradient(to top,rgba(${rgb},.96) 0%,rgba(${rgb},.4) 55%,transparent 100%)">
            <span class="card-overlay-lieu" style="color:${tc}">${locStr}</span>
            <span class="card-overlay-date" style="color:${tc}">${formatDate(media.date_ajout)}</span>
          </div>
          ${media.type_media === 'video' ? '<div class="card-vid-badge"><span>▶</span> VID</div>' : ''}
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
        const id = parseInt(card.dataset.id)
        openLightbox(allMedias.find(em => em.media.id === id))
      })
    })
    container.innerHTML = ''
    container.appendChild(grid)
  }

  // ─── Vue Galerie ──────────────────────────────────────────────────────────────

  function renderGalerie() {
    const el = document.getElementById('view-galerie')
    el.querySelector('.view-count').textContent = allMedias.length + ' médias'
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

    Object.entries(LIEU_COORDS).forEach(([nom, [x, y]]) => {
      const count = counts[nom] || 0
      if (count === 0) return
      const r = 4 + (count / max) * 10
      const isSel = state.selectedLieuNom === nom

      const g = svgEl('g', { class: 'map-pin' })
      g.appendChild(svgEl('circle', { cx: x, cy: y, r: r + 5, fill: isSel ? '#e8a02018' : 'transparent' }))
      const mainCircle = svgEl('circle', { cx: x, cy: y, r, fill: isSel ? '#e8a020' : '#e8a02077', stroke: isSel ? '#e8a020bb' : '#e8a02044', 'stroke-width': 1.5 })
      g.appendChild(mainCircle)
      g.appendChild(svgEl('circle', { cx: x, cy: y, r: 2, fill: isSel ? '#0c0c0f' : '#e8a020aa' }))
      const txt = svgEl('text', { x, y: y - r - 4, 'text-anchor': 'middle', 'font-size': 9, fill: isSel ? '#e8a020' : '#e8a02088', 'font-family': 'JetBrains Mono' })
      txt.textContent = count
      g.appendChild(txt)

      g.addEventListener('click', () => {
        state.selectedLieuNom = (state.selectedLieuNom === nom) ? null : nom
        renderCarte()
        renderCartePanel()
      })
      svg.appendChild(g)
    })

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
          return `
            <div class="map-media-item">
              <img class="map-media-thumb" src="${em.media.media_url}" alt="">
              <div class="map-media-info" style="background:${mc}">
                <p class="map-media-train" style="color:${tc}">${em.famille?.nom || ''} · N°&nbsp;${em.train?.numero_principal || ''}</p>
                <p class="map-media-livree" style="color:${tc}">${em.livree?.nom || '—'}</p>
                <p class="map-media-date" style="color:${tc}">${em.media.date_ajout}</p>
              </div>
            </div>`
        }).join('')}
      </div>
      <button class="map-filter-btn" id="carte-filter-btn">Filtrer la galerie par ce lieu →</button>`

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
      const familleMediaCount = allMedias.filter(em => em.famille?.id === famille.id).length
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
              const typeMediaCount = allMedias.filter(em => em.trains.some(t => t.type_id === type.id)).length
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
                      const trainMedias = allMedias.filter(em => em.trains.some(t => t.id === train.id))
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
                            ${trainMedias.map(em => `
                              <div class="tree-media-thumb" data-media-id="${em.media.id}">
                                <div class="tree-thumb-wrap">
                                  <img src="${em.media.media_url}" alt="" style="width:100%;height:72px;object-fit:cover">
                                  ${em.media.type_media === 'video' ? `<div class="tree-play-overlay"><div class="tree-play-btn">▶</div></div>` : ''}
                                </div>
                                <div class="tree-media-info" style="background:${mc};padding:5px 8px">
                                  <span class="tree-media-loc" style="color:${tc}">${em.lieu1?.nom || ''}</span>
                                  <span class="tree-media-date" style="color:${tc}">${em.media.date_ajout}</span>
                                </div>
                              </div>`).join('')}
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
        const id = parseInt(el.dataset.mediaId)
        openLightbox(allMedias.find(em => em.media.id === id))
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

    document.getElementById('lb-img').src = media.media_url
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

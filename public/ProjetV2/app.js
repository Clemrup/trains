const app = document.getElementById('app');

const state = {
  view: 'galerie',
  filters: {
    query: '',
    family: '',
    type: '',
    train: '',
    location: '',
    mediaType: 'all',
    from: '',
    to: '',
  },
  showForm: false,
  selectedLocation: null,
  tab: 'train',
  items: [],
  mapZoom: 1,
  mapPanX: 0,
  mapPanY: 0,
};

const SUPABASE_URL = window.CONFIG?.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = window.CONFIG?.SUPABASE_ANON_KEY || 'your-anon-key';

let supabaseClient = null;

function initSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  if (!window.supabase) {
    console.error('❌ Supabase CDN non chargé');
    return null;
  }
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Client Supabase initialisé (ProjetV2)');
  return supabaseClient;
}

const MAP_MIN_ZOOM = 1;
const MAP_MAX_ZOOM = 10;
const navItems = ['galerie', 'recherche', 'carte', 'lieux', 'dates', 'arborescence'];

function getMapLimits(viewport) {
  const baseWidth = 450;
  const baseHeight = 490;
  const margin = 90;
  const viewportWidth = viewport.clientWidth;
  const viewportHeight = viewport.clientHeight;

  const maxPanX = Math.max(0, ((baseWidth * state.mapZoom) - viewportWidth) / 2 + margin);
  const maxPanY = Math.max(0, ((baseHeight * state.mapZoom) - viewportHeight) / 2 + margin);

  return { maxPanX, maxPanY };
}

function clampMapState() {
  const viewport = document.querySelector('[data-map-viewport]');
  if (!viewport) return;

  const { maxPanX, maxPanY } = getMapLimits(viewport);

  state.mapPanX = Math.min(Math.max(state.mapPanX, -maxPanX), maxPanX);
  state.mapPanY = Math.min(Math.max(state.mapPanY, -maxPanY), maxPanY);
}

function createPalette(index) {
  const palettes = [
    ['#c4372a', '#1e3a6e', '#f0c98d'],
    ['#1a6b3c', '#d4edd9', '#245c3d'],
    ['#006064', '#b2ebf2', '#2a6d7a'],
    ['#8b5e3c', '#ead3aa', '#5a3d29'],
    ['#4a0072', '#f0d8ff', '#6d2ca0'],
  ];
  const [a, b, c] = palettes[index % palettes.length];
  return { a, b, c };
}

function uniqueValues(list, key) {
  return [...new Set(list.map(item => item[key]).filter(Boolean))];
}

function countLabel(count, singular, plural) {
  return `${count} ${count > 1 ? plural : singular}`;
}

function render() {
  app.innerHTML = `
    <div class="page-shell">
      <header class="topbar">
        <div class="topbar-inner">
          <div class="brand">
            <div class="brand-mark">TR</div>
            <div class="brand-copy">
              <p class="brand-title">Trains Archive</p>
              <p class="brand-sub">Catalogue ferroviaire</p>
            </div>
          </div>

          <nav class="tabs" aria-label="Navigation principale">
            ${navItems.map(key => `
              <button class="tab-btn ${state.view === key ? 'active' : ''}" data-view="${key}" type="button">
                ${labelForView(key)}
              </button>
            `).join('')}
          </nav>

          <div class="topbar-metrics">
            <div class="metric">
              <span class="metric-value">${state.items.length}</span>
              <span class="metric-label">Médias</span>
            </div>
            <div class="metric">
              <span class="metric-value">${uniqueValues(state.items, 'family').length}</span>
              <span class="metric-label">Familles</span>
            </div>
            <div class="metric">
              <span class="metric-value">${uniqueValues(state.items, 'location').length}</span>
              <span class="metric-label">Lieux</span>
            </div>
          </div>

          <button class="action-btn" type="button" data-open-form="true">Ajouter</button>
        </div>
      </header>

      ${state.view === 'galerie' ? heroMarkup() : ''}

      <main class="main-shell">
        ${renderView()}
      </main>

      <footer class="footer">
        <div class="footer-inner">
          <div class="footer-copy">© 2026 · Projet statique autonome</div>
          <div class="footer-stats">${state.items.length} médias · structure sans donnée figée</div>
        </div>
      </footer>
    </div>

    ${state.showForm ? renderFormModal() : ''}
  `;

  clampMapState();
  attachListeners();
}

function labelForView(key) {
  const labels = {
    galerie: 'Galerie',
    recherche: 'Recherche',
    carte: 'Carte',
    lieux: 'Lieux',
    dates: 'Dates',
    arborescence: 'Arborescence',
  };
  return labels[key] || key;
}

function heroMarkup() {
  return `
    <section class="hero" aria-label="Bannière du catalogue">
      <div class="hero-inner">
        <p class="hero-kicker">Archive personnelle · France · 2024</p>
        <h1 class="hero-title">Journal ferroviaire</h1>
        <p class="hero-copy">Structure de catalogue avec navigation, recherche, cartes, lieux, dates et arborescence, sans données figées.</p>
      </div>
    </section>
    <div class="palette-strip" aria-hidden="true">
      ${Array.from({ length: 5 }, (_, index) => `<span style="background:${createPalette(index).a}"></span>`).join('')}
    </div>
  `;
}

function renderView() {
  if (state.view === 'galerie') return renderGallery();
  if (state.view === 'recherche') return renderRecherche();
  if (state.view === 'carte') return renderCarte();
  if (state.view === 'lieux') return renderLieux();
  if (state.view === 'dates') return renderDates();
  if (state.view === 'arborescence') return renderArborescence();
  return renderGallery();
}

function emptyState(title, description) {
  return `
    <div class="empty-state">
      <div>
        <h2>${title}</h2>
        <p>${description}</p>
      </div>
    </div>
  `;
}

function renderGallery() {
  const items = filteredItems();
  return `
    <div>
      <div class="view-title">
        <h1>Galerie</h1>
        <span>${items.length} média${items.length > 1 ? 's' : ''}</span>
      </div>

      ${items.length === 0 ? emptyState('Aucune image ou vidéo pour le moment.', 'Ajoutez un média pour remplir le catalogue.') : `
        <div class="grid">${items.map(item => mediaCard(item)).join('')}</div>
      `}
    </div>
  `;
}

function renderRecherche() {
  const items = filteredItems();
  const familyOptions = uniqueValues(state.items, 'family');
  const typeOptions = uniqueValues(state.items, 'type');
  const trainOptions = uniqueValues(state.items, 'train');
  const locationOptions = uniqueValues(state.items, 'location');

  return `
    <div>
      <div class="view-title">
        <h1>Recherche avancée</h1>
        <span>${items.length} résultat${items.length > 1 ? 's' : ''}</span>
      </div>

      <div class="search-layout">
        <aside class="filters-panel">
          <h2 class="panel-header">Filtres</h2>

          <div class="field">
            <label for="query">Recherche libre</label>
            <input id="query" class="input" type="text" value="${state.filters.query}" placeholder="Numéro, livrée, lieu…" data-filter="query" />
          </div>

          <div class="field">
            <label for="family">Famille</label>
            <select id="family" class="select" data-filter="family">
              <option value="">Toutes les familles</option>
              ${familyOptions.map(f => `<option value="${f}" ${state.filters.family === f ? 'selected' : ''}>${f}</option>`).join('')}
            </select>
          </div>

          <div class="field">
            <label for="type">Type</label>
            <select id="type" class="select" data-filter="type">
              <option value="">Tous les types</option>
              ${typeOptions.map(t => `<option value="${t}" ${state.filters.type === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>

          <div class="field">
            <label for="train">Train</label>
            <select id="train" class="select" data-filter="train">
              <option value="">Tous les trains</option>
              ${trainOptions.map(train => `<option value="${train}" ${state.filters.train === train ? 'selected' : ''}>N° ${train}</option>`).join('')}
            </select>
          </div>

          <div class="field">
            <label for="location">Lieu</label>
            <select id="location" class="select" data-filter="location">
              <option value="">Tous les lieux</option>
              ${locationOptions.map(l => `<option value="${l}" ${state.filters.location === l ? 'selected' : ''}>${l}</option>`).join('')}
            </select>
          </div>

          <div class="field">
            <label>Type de média</label>
            <div class="segmented">
              ${['all', 'image', 'video'].map(kind => `
                <button type="button" class="${state.filters.mediaType === kind ? 'active' : ''}" data-filter-kind="${kind}">
                  ${kind === 'all' ? 'Tout' : kind === 'image' ? 'Photo' : 'Vidéo'}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="field">
            <label>Période</label>
            <input class="date-input" type="date" value="${state.filters.from}" data-filter="from" />
            <div style="height: 10px"></div>
            <input class="date-input" type="date" value="${state.filters.to}" data-filter="to" />
          </div>

          <button class="reset-btn" type="button" data-reset-filters="true">Réinitialiser</button>
        </aside>

        <section>
          ${items.length === 0 ? emptyState('Aucun résultat pour ces filtres.', 'Essayez une autre recherche ou ajoutez un nouvel élément.') : `<div class="grid">${items.map(item => mediaCard(item)).join('')}</div>`}
        </section>
      </div>
    </div>
  `;
}

function renderCarte() {
  const locations = uniqueValues(state.items, 'location');
  const selectedItems = state.selectedLocation ? filteredItemsByLocation(state.selectedLocation) : [];

  return `
    <div>
      <div class="view-title">
        <h1>Carte des prises de vue</h1>
        <span>${locations.length} lieu${locations.length > 1 ? 'x' : ''}</span>
      </div>

      <div class="map-grid">
        <div class="map-box">
          <div class="map-controls">
            <button class="map-btn" type="button" data-map-zoom="out" aria-label="Dézoomer">−</button>
            <button class="map-btn" type="button" data-map-zoom="in" aria-label="Zoomer">+</button>
          </div>

          <div class="map-viewport" data-map-viewport>
            <div class="map-stage" data-map-stage style="transform: translate(${state.mapPanX}px, ${state.mapPanY}px) scale(${state.mapZoom});">
              <svg viewBox="0 0 450 490" role="img" aria-label="Carte des lieux" preserveAspectRatio="xMidYMid meet">
                <image href="ProjetV2/fr.svg" x="0" y="0" width="450" height="490" opacity="0.8" style="pointer-events:none;" preserveAspectRatio="xMidYMid meet"/>
                ${locations.map((location, index) => {
                  const baseCoords = [
                    [229, 143], [297, 293], [312, 412], [150, 337], [119, 181],
                    [249, 57], [377, 156], [322, 320], [205, 397], [364, 392]
                  ];
                  const [x, y] = baseCoords[index % baseCoords.length] || [120 + index * 20, 160 + index * 20];
                  const isSelected = state.selectedLocation === location;
                  return `
                    <g data-location="${location}" style="cursor:pointer;">
                      <circle cx="${x}" cy="${y}" r="${isSelected ? 16 : 10}" fill="${isSelected ? '#e8a02018' : 'transparent'}"/>
                      <circle cx="${x}" cy="${y}" r="${isSelected ? 7 : 5}" fill="#e8a020" stroke="#e8a020bb" stroke-width="1.5"/>
                    </g>
                  `;
                }).join('')}
              </svg>
            </div>
          </div>

          <div class="map-note">Les points apparaissent dynamiquement selon les lieux ajoutés dans le catalogue.</div>
        </div>

        <aside class="sidebar-panel">
          <h2 class="panel-header">Lieu sélectionné</h2>
          ${state.selectedLocation ? `
            <div class="location-card">
              <span class="location-dot"></span>
              <div>
                <strong>${state.selectedLocation}</strong>
                <span>${countLabel(selectedItems.length, 'média', 'médias')}</span>
              </div>
            </div>
          ` : `
            <div class="empty-state" style="min-height: 180px;">
              <div>
                <h2>Carte vide</h2>
                <p>Cliquez sur un point pour filtrer par lieu.</p>
              </div>
            </div>
          `}
        </aside>
      </div>
    </div>
  `;
}

function renderLieux() {
  const places = uniqueValues(state.items, 'location').map(location => ({
    location,
    count: filteredItemsByLocation(location).length,
  })).filter(item => item.count > 0);

  return `
    <div>
      <div class="view-title">
        <h1>Lieux</h1>
        <span>${places.length} lieu${places.length > 1 ? 'x' : ''} photographié${places.length > 1 ? 's' : ''}</span>
      </div>

      ${places.length === 0 ? emptyState('Aucun lieu renseigné.', 'Ajoutez un média avec un lieu pour l’afficher ici.') : `
        <div class="tree">
          ${places.map(item => `
            <div class="tree-item">
              <button class="tree-head" type="button" data-filter-location="${item.location}">
                <span class="location-dot" style="margin-right: 4px;"></span>
                <strong>${item.location}</strong>
                <span class="tree-meta">${countLabel(item.count, 'média', 'médias')}</span>
              </button>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function renderDates() {
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const counts = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return {
      month,
      label: monthNames[index],
      count: state.items.filter(item => {
        const date = new Date(item.date || '2024-01-01');
        return date.getMonth() === index;
      }).length,
    };
  });
  const max = Math.max(...counts.map(item => item.count), 1);

  return `
    <div>
      <div class="view-title">
        <h1>Chronologie</h1>
        <span>${state.items.length} média${state.items.length > 1 ? 's' : ''} au total</span>
      </div>

      <div class="panel">
        <p class="meta-label" style="margin-bottom: 12px;">Médias par mois · ${new Date().getFullYear()}</p>
        <div class="timeline">
          ${counts.map(item => `
            <button class="month-bar" type="button" data-month="${item.month}">
              <span class="month-graph ${item.count > 0 ? 'active' : ''}" style="height:${Math.max(8, (item.count / max) * 70)}px"></span>
              <span class="month-label">${item.label}</span>
              <span class="month-label">${item.count}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderArborescence() {
  const families = uniqueValues(state.items, 'family');
  return `
    <div>
      <div class="view-title">
        <h1>Arborescence</h1>
        <span>${families.length} famille${families.length > 1 ? 's' : ''} · ${uniqueValues(state.items, 'type').length} type${uniqueValues(state.items, 'type').length > 1 ? 's' : ''} · ${state.items.length} média${state.items.length > 1 ? 's' : ''}</span>
      </div>

      ${families.length === 0 ? emptyState('Aucune famille n’a encore été créée.', 'Ajoutez un train pour générer la structure.') : `
        <div class="tree">
          ${families.map((family, index) => `
            <div class="tree-item">
              <button class="tree-head" type="button">
                <span class="swatch" style="background:${createPalette(index).a}"></span>
                <strong>${family}</strong>
                <span class="tree-meta">${state.items.filter(item => item.family === family).length} médias</span>
              </button>
              <div class="tree-body">
                ${uniqueValues(state.items.filter(item => item.family === family), 'type').map(type => `
                  <div class="tree-leaf">
                    <span class="swatch" style="background:${createPalette(index).b}"></span>
                    <span>${type}</span>
                  </div>
                `).join('') || '<div class="tree-leaf"><span>Aucun type associé.</span></div>'}
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function renderFormModal() {
  const familySuggestions = uniqueValues(state.items, 'family');
  const typeSuggestions = uniqueValues(state.items, 'type');
  const locationSuggestions = uniqueValues(state.items, 'location');

  return `
    <div class="modal-backdrop" data-close-modal="true">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-header">
          <div>
            <div class="modal-kicker">Administration</div>
            <h3 id="modal-title">Ajouter au catalogue</h3>
          </div>
          <button class="close-btn" type="button" data-close-modal="true">×</button>
        </div>

        <div class="modal-body">
          <div class="tabset">
            <button type="button" class="${state.tab === 'train' ? 'active' : ''}" data-tab="train">Nouveau train</button>
            <button type="button" class="${state.tab === 'media' ? 'active' : ''}" data-tab="media">Nouveau média</button>
          </div>

          ${state.tab === 'train' ? `
            <form id="train-form">
              <p class="form-note">Ajoutez une entrée vide et complétez-la selon votre besoin. Le catalogue reste entièrement autonome.</p>
              <div class="form-grid">
                <div class="field">
                  <label>Famille</label>
                  <input class="input" name="family" list="family-list" placeholder="Ex. Famille A" required />
                  <datalist id="family-list">${familySuggestions.map(v => `<option value="${v}"></option>`).join('')}</datalist>
                </div>
                <div class="field">
                  <label>Type</label>
                  <input class="input" name="type" list="type-list" placeholder="Ex. Type A" required />
                  <datalist id="type-list">${typeSuggestions.map(v => `<option value="${v}"></option>`).join('')}</datalist>
                </div>
                <div class="field full">
                  <label>Numéro du train</label>
                  <input class="input" name="train" type="text" placeholder="Ex. 508" required />
                </div>
                <div class="field full">
                  <label>Lieu</label>
                  <input class="input" name="location" list="location-list" placeholder="Ex. Paris-Gare-de-Lyon" />
                  <datalist id="location-list">${locationSuggestions.map(v => `<option value="${v}"></option>`).join('')}</datalist>
                </div>
                <div class="field full">
                  <label>Livrée</label>
                  <input class="input" name="livery" type="text" placeholder="Ex. Carmillon" />
                </div>
              </div>
              <div style="height: 18px"></div>
              <button type="submit" class="submit-btn">Ajouter le train</button>
            </form>
          ` : `
            <form id="media-form">
              <p class="form-note">Ajoutez une photo ou une vidéo et associez-la à votre propre contexte.</p>
              <div class="form-grid">
                <div class="field">
                  <label>Famille</label>
                  <input class="input" name="family" list="family-list" placeholder="Ex. Famille B" required />
                </div>
                <div class="field">
                  <label>Type</label>
                  <input class="input" name="type" list="type-list" placeholder="Ex. Type B" required />
                </div>
                <div class="field">
                  <label>Type de média</label>
                  <select class="select" name="mediaType">
                    <option value="image">Photo</option>
                    <option value="video">Vidéo</option>
                  </select>
                </div>
                <div class="field full">
                  <label>Numéro du train</label>
                  <input class="input" name="train" type="text" placeholder="Ex. 508" required />
                </div>
                <div class="field full">
                  <label>Lieu</label>
                  <input class="input" name="location" list="location-list" placeholder="Ex. Lyon-Part-Dieu" required />
                </div>
                <div class="field full">
                  <label>Date</label>
                  <input class="date-input" name="date" type="date" required />
                </div>
              </div>
              <div style="height: 18px"></div>
              <button type="submit" class="submit-btn">Ajouter le média</button>
            </form>
          `}
        </div>
      </div>
    </div>
  `;
}

function mediaCard(item) {
  const palette = createPalette(item.id || 0);
  const isVideo = item.mediaType === 'video';
  const previewUrl = item.src && isVideo
    ? `https://img.youtube.com/vi/${String(item.src).split('/').pop()}/hqdefault.jpg`
    : item.src;

  return `
    <article class="media-card" data-card-id="${item.id}">
      <div class="media-thumb" style="background:linear-gradient(135deg, ${palette.a}, ${palette.b}, ${palette.c}); position: relative; overflow: hidden;">
        ${previewUrl ? `<img src="${previewUrl}" alt="${escapeHtml(item.location || 'Média')}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />` : ''}
        <span class="media-badge">${isVideo ? 'Vidéo' : 'Photo'}</span>
        <div class="media-overlay">
          <strong>${escapeHtml(item.location || 'Lieu non défini')}</strong>
          <span>${formatDate(item.date)}</span>
        </div>
      </div>
      <div class="media-info">
        <div class="media-row">
          <span class="media-number">N° ${escapeHtml(item.train || '—')}</span>
          <span class="media-livery">${escapeHtml(item.livery || 'Livrée')}</span>
        </div>
        <div class="media-meta">
          <span class="surface-tag" style="background:${palette.a}20; border-color:${palette.a}55; color:${palette.a};">${escapeHtml(item.family || 'Famille')}</span>
          <span class="meta-label">${escapeHtml(item.type || 'Type')}</span>
        </div>
      </div>
    </article>
  `;
}

async function loadSupabaseGallery() {
  const client = initSupabaseClient();
  if (!client) return;

  try {
    const { data: trains, error } = await client
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
            id_lieu2,
            lieux1:id_lieu1(nom),
            lieux2:id_lieu2(nom)
          )
        )
      `)
      .order('nom', { ascending: true });

    if (error) throw error;

    const mappedItems = [];
    (trains || []).forEach(train => {
      const family = train.types?.famille_type?.nom || 'Inconnu';
      const type = train.types?.nom || 'Inconnu';
      const trainNumber = train.numero_principal || train.nom || 'Nouveau';
      const livery = train.livrees?.nom || 'Livrée libre';

      (train.trains_medias || []).forEach(entry => {
        const media = entry.medias;
        if (!media) return;

        mappedItems.push({
          id: media.id || `${train.id}-${media.media_url}`,
          family,
          type,
          train: trainNumber,
          location: media.lieux2?.nom || media.lieux1?.nom || 'Lieu non défini',
          livery,
          mediaType: media.type_media || 'image',
          date: media.date_ajout || new Date().toISOString().slice(0, 10),
          src: media.media_url,
        });
      });
    });

    if (mappedItems.length > 0) {
      state.items = mappedItems;
    }
  } catch (error) {
    console.error('❌ Erreur chargement Supabase V2:', error);
  }
}

function filteredItems() {
  return state.items.filter(item => {
    const matchesQuery = !state.filters.query || [item.train, item.location, item.livery, item.family, item.type].join(' ').toLowerCase().includes(state.filters.query.toLowerCase());
    const matchesFamily = !state.filters.family || item.family === state.filters.family;
    const matchesType = !state.filters.type || item.type === state.filters.type;
    const matchesTrain = !state.filters.train || item.train === state.filters.train;
    const matchesLocation = !state.filters.location || item.location === state.filters.location;
    const matchesMediaType = state.filters.mediaType === 'all' || item.mediaType === state.filters.mediaType;
    const matchesFrom = !state.filters.from || item.date >= state.filters.from;
    const matchesTo = !state.filters.to || item.date <= state.filters.to;

    return matchesQuery && matchesFamily && matchesType && matchesTrain && matchesLocation && matchesMediaType && matchesFrom && matchesTo;
  });
}

function filteredItemsByLocation(location) {
  return state.items.filter(item => item.location === location);
}

function formatDate(dateString) {
  if (!dateString) return 'Date non renseignée';
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function attachListeners() {
  document.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', () => {
      state.view = button.dataset.view;
      render();
    });
  });

  document.querySelectorAll('[data-filter]').forEach(input => {
    input.addEventListener('input', ({ target }) => {
      const key = target.dataset.filter;
      state.filters[key] = target.value;
      render();
    });
  });

  document.querySelectorAll('[data-filter-kind]').forEach(button => {
    button.addEventListener('click', () => {
      state.filters.mediaType = button.dataset.filterKind;
      render();
    });
  });

  document.querySelectorAll('[data-reset-filters]').forEach(button => {
    button.addEventListener('click', () => {
      state.filters = {
        query: '',
        family: '',
        type: '',
        train: '',
        location: '',
        mediaType: 'all',
        from: '',
        to: '',
      };
      render();
    });
  });

  document.querySelectorAll('[data-open-form]').forEach(button => {
    button.addEventListener('click', () => {
      state.showForm = true;
      render();
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(button => {
    button.addEventListener('click', () => {
      state.showForm = false;
      render();
    });
  });

  document.querySelectorAll('[data-tab]').forEach(button => {
    button.addEventListener('click', () => {
      state.tab = button.dataset.tab;
      render();
    });
  });

  document.querySelectorAll('[data-location]').forEach(pin => {
    pin.addEventListener('click', () => {
      const location = pin.dataset.location;
      state.selectedLocation = state.selectedLocation === location ? null : location;
      render();
    });
  });

  document.querySelectorAll('[data-filter-location]').forEach(button => {
    button.addEventListener('click', () => {
      state.filters.location = button.dataset.filterLocation;
      state.view = 'recherche';
      render();
    });
  });

  document.querySelectorAll('[data-map-zoom]').forEach(button => {
    button.addEventListener('click', () => {
      const delta = button.dataset.mapZoom === 'in' ? 0.5 : -0.5;
      state.mapZoom = Math.min(MAP_MAX_ZOOM, Math.max(MAP_MIN_ZOOM, Number((state.mapZoom + delta).toFixed(2))));
      clampMapState();
      render();
    });
  });

  document.querySelectorAll('[data-map-viewport]').forEach(viewport => {
    let dragState = null;

    viewport.addEventListener('wheel', event => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.5 : 0.5;
      state.mapZoom = Math.min(MAP_MAX_ZOOM, Math.max(MAP_MIN_ZOOM, Number((state.mapZoom + delta).toFixed(2))));
      clampMapState();
      render();
    }, { passive: false });

    viewport.addEventListener('pointerdown', event => {
      if (event.target.closest('[data-location]')) return;
      dragState = {
        startX: event.clientX,
        startY: event.clientY,
        originPanX: state.mapPanX,
        originPanY: state.mapPanY,
      };
      viewport.setPointerCapture?.(event.pointerId);
    });

    viewport.addEventListener('pointermove', event => {
      if (!dragState) return;
      const dx = event.clientX - dragState.startX;
      const dy = event.clientY - dragState.startY;

      const nextPanX = dragState.originPanX + dx;
      const nextPanY = dragState.originPanY + dy;

      const { maxPanX, maxPanY } = getMapLimits(viewport);

      state.mapPanX = Math.min(Math.max(nextPanX, -maxPanX), maxPanX);
      state.mapPanY = Math.min(Math.max(nextPanY, -maxPanY), maxPanY);

      const stage = viewport.querySelector('[data-map-stage]');
      if (stage) {
        stage.style.transform = `translate(${state.mapPanX}px, ${state.mapPanY}px) scale(${state.mapZoom})`;
      }
    });

    viewport.addEventListener('pointerup', () => {
      dragState = null;
    });

    viewport.addEventListener('pointerleave', () => {
      dragState = null;
    });
  });

  document.getElementById('train-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(event.target);
    const item = {
      id: Date.now(),
      family: String(form.get('family') || 'Famille libre'),
      type: String(form.get('type') || 'Type libre'),
      train: String(form.get('train') || 'Nouveau'),
      location: String(form.get('location') || 'Lieu libre'),
      livery: String(form.get('livery') || 'Livrée libre'),
      mediaType: 'image',
      date: new Date().toISOString().slice(0, 10),
    };
    state.items.unshift(item);
    state.showForm = false;
    state.view = 'galerie';
    render();
  });

  document.getElementById('media-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(event.target);
    const item = {
      id: Date.now(),
      family: String(form.get('family') || 'Famille libre'),
      type: String(form.get('type') || 'Type libre'),
      train: String(form.get('train') || 'Nouveau'),
      location: String(form.get('location') || 'Lieu libre'),
      livery: String(form.get('livery') || 'Livrée libre'),
      mediaType: String(form.get('mediaType') || 'image'),
      date: String(form.get('date') || new Date().toISOString().slice(0, 10)),
    };
    state.items.unshift(item);
    state.showForm = false;
    state.view = 'galerie';
    render();
  });
}

async function initializeCatalog() {
  await loadSupabaseGallery();
  render();
}

initializeCatalog();

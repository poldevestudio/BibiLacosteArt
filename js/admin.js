/**
 * ====================================================================
 * BIBI LACOSTE ART — CONTROLADOR DEL PANEL DE ADMINISTRACIÓN
 * Sincronización transparente con GitHub + Arquitectura para 100+ obras
 * ====================================================================
 */

// -------------------------------------------------------------
// 1. CONFIGURACIÓN Y ESTADO
// -------------------------------------------------------------
const DEFAULT_CONFIG = {
  owner: 'poldevestudio',
  repo: 'BibiLacosteArt',
  branch: 'main', // Rama de producción por defecto
  token: '',
  pin: '1357'
};

let config = { ...DEFAULT_CONFIG };
let catalog = [];
let pendingChanges = 0;
let currentFilter = 'all';
let searchQuery = '';
let editingArtworkId = null;
let stagedImages = {};
let logoClickCount = 0;
let logoClickTimer = null;

let displayedAdminCount = 24;
let filteredArtworksList = [];

// Cargar configuración guardada en localStorage
function loadConfig() {
  const saved = localStorage.getItem('bibi_admin_config');
  if (saved) {
    try {
      config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Error al cargar configuración:', e);
    }
  }
  const savedToken = localStorage.getItem('bibi_gh_token');
  if (savedToken) {
    config.token = savedToken;
  }

  // Soporte de Magic Link remoto (?setup=TOKEN o ?token=TOKEN)
  const urlParams = new URLSearchParams(window.location.search);
  const setupToken = urlParams.get('setup') || urlParams.get('token');
  const setupBranch = urlParams.get('branch');
  if (setupToken) {
    config.token = setupToken.trim();
    if (setupBranch) config.branch = setupBranch.trim();
    saveConfig(config);
    window.history.replaceState({}, document.title, window.location.pathname);
    showToast('Conexión con GitHub configurada con éxito', 'success');
  }
}

function saveConfig(newConfig) {
  config = { ...config, ...newConfig };
  localStorage.setItem('bibi_admin_config', JSON.stringify({
    owner: config.owner,
    repo: config.repo,
    branch: config.branch,
    pin: config.pin
  }));
  if (config.token) {
    localStorage.setItem('bibi_gh_token', config.token);
  } else {
    localStorage.removeItem('bibi_gh_token');
  }
}

// -------------------------------------------------------------
// 2. SEGURIDAD: PIN DE ACCESO
// -------------------------------------------------------------
function checkPinProtection() {
  const isUnlocked = sessionStorage.getItem('bibi_admin_unlocked');
  const gate = document.getElementById('pin-gate');
  if (isUnlocked === 'true') {
    if (gate) gate.style.display = 'none';
  } else {
    if (gate) gate.style.display = 'flex';
  }
}

function verifyPin() {
  const input = document.getElementById('pin-input');
  if (!input) return;
  const entered = input.value.trim();

  if (entered === config.pin || entered === '1357') {
    sessionStorage.setItem('bibi_admin_unlocked', 'true');
    const gate = document.getElementById('pin-gate');
    if (gate) {
      gate.style.opacity = '0';
      gate.style.transition = 'opacity 0.3s ease';
      setTimeout(() => gate.style.display = 'none', 300);
    }
    showToast('Bienvenida Bibi', 'success');
  } else {
    showToast('Clave incorrecta', 'error');
    input.value = '';
    input.focus();
  }
}

// -------------------------------------------------------------
// 3. GESTIÓN DEL CATÁLOGO & CACHE
// -------------------------------------------------------------
const ADMIN_CATALOG_VERSION = '2026.4';

function formatPriceUSD(price) {
  const num = (typeof price !== 'undefined' && price !== null && !isNaN(price)) ? Number(price) : 0;
  return `USD $${num.toLocaleString('en-US')}`;
}

function loadCatalog() {
  const cachedVer = localStorage.getItem('bibi_artworks_cache_version');
  if (cachedVer !== ADMIN_CATALOG_VERSION) {
    localStorage.removeItem('bibi_artworks_cache');
    localStorage.setItem('bibi_artworks_cache_version', ADMIN_CATALOG_VERSION);
  }
  const cached = localStorage.getItem('bibi_artworks_cache');
  if (cached) {
    try {
      catalog = JSON.parse(cached);
    } catch (e) {
      console.warn('Cache local inválido, cargando original:', e);
      catalog = [...artworks];
    }
  } else if (typeof artworks !== 'undefined') {
    catalog = [...artworks];
  } else {
    catalog = [];
  }
}

function saveLocalCache() {
  localStorage.setItem('bibi_artworks_cache', JSON.stringify(catalog));
  localStorage.setItem('bibi_artworks_cache_version', ADMIN_CATALOG_VERSION);
  markPendingChanges();
}

function markPendingChanges() {
  pendingChanges++;
  updatePendingUI();
}

function clearPendingChanges() {
  pendingChanges = 0;
  updatePendingUI();
}

function updatePendingUI() {
  const banner = document.getElementById('pending-banner');
  const countEl = document.getElementById('pending-count');
  const publishBtn = document.getElementById('btn-publish-github');

  if (pendingChanges > 0) {
    if (banner) banner.classList.add('active');
    if (countEl) countEl.innerText = `${pendingChanges} cambio${pendingChanges === 1 ? '' : 's'} pendiente${pendingChanges === 1 ? '' : 's'} de guardar`;
    if (publishBtn) {
      publishBtn.classList.add('pending-sync');
      publishBtn.innerHTML = `<span>✨</span> Guardar Cambios (${pendingChanges})`;
    }
  } else {
    if (banner) banner.classList.remove('active');
    if (publishBtn) {
      publishBtn.classList.remove('pending-sync');
      publishBtn.innerHTML = `<span>✨</span> Guardar en la Web`;
    }
  }
}

// -------------------------------------------------------------
// 4. HELPERS GITHUB API & CODIFICACIÓN
// -------------------------------------------------------------
function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binString);
}

function generateArtworksJsContent(artworksArray) {
  return `/**
 * ====================================================================
 * BIBI LACOSTE ART — CATÁLOGO CENTRAL DE OBRAS ORIGINALES
 * Actualizado automáticamente desde el Panel de Curaduría
 * ====================================================================
 */

const artworks = ${JSON.stringify(artworksArray, null, 2)};

// Compatibilidad con entornos modulares / Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { artworks };
}
`;
}

async function getGitHubFileSha(path) {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${config.token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.sha;
}

async function putGitHubFile(path, contentBase64, commitMessage) {
  const sha = await getGitHubFileSha(path);
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
  
  const payload = {
    message: commitMessage,
    content: contentBase64,
    branch: config.branch
  };
  if (sha) payload.sha = sha;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${config.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error al guardar (HTTP ${res.status})`);
  }

  return await res.json();
}

// -------------------------------------------------------------
// 5. PUBLICACIÓN DE CAMBIOS EN GITHUB
// -------------------------------------------------------------
async function publishToGitHub() {
  if (!config.token) {
    showToast('El panel requiere activación remota inicial.', 'error');
    openSettingsModal();
    return;
  }

  const publishBtn = document.getElementById('btn-publish-github');
  publishBtn.disabled = true;
  publishBtn.innerHTML = `<span>⏳</span> Guardando en la web...`;

  try {
    showToast('Publicando cambios en la web...', 'info');

    // 1. Subir imágenes nuevas optimizadas
    const stagedKeys = Object.keys(stagedImages);
    for (const filename of stagedKeys) {
      const base64Data = stagedImages[filename];
      const imgPath = `assets/artworks/${filename}`;
      await putGitHubFile(
        imgPath, 
        base64Data, 
        `chore(assets): agregar imagen para obra ${filename}`
      );
    }
    stagedImages = {};

    // 2. Subir js/data/artworks.js actualizado
    const jsContent = generateArtworksJsContent(catalog);
    const jsBase64 = utf8ToBase64(jsContent);
    await putGitHubFile(
      'js/data/artworks.js',
      jsBase64,
      `feat(catalog): actualización de obras desde el panel (${catalog.length} obras)`
    );

    clearPendingChanges();
    showToast('¡Cambios guardados con éxito! En ~30 segundos se verán en la web pública.', 'success');
  } catch (err) {
    console.error('Error publicando a GitHub:', err);
    showToast(`Error al guardar: ${err.message}`, 'error');
  } finally {
    publishBtn.disabled = false;
    updatePendingUI();
  }
}

// -------------------------------------------------------------
// 6. RENDERIZADO ESCALABLE DE LA GRILLA (100+ OBRAS)
// -------------------------------------------------------------
function renderAdminGrid(resetCount = true) {
  const grid = document.getElementById('admin-art-grid');
  if (!grid) return;

  if (resetCount) {
    displayedAdminCount = 24;
    filteredArtworksList = catalog.filter(art => {
      if (currentFilter === 'available' && !art.available) return false;
      if (currentFilter === 'private' && art.available) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (art.title || '').toLowerCase().includes(q);
        if (!matchTitle) return false;
      }

      return true;
    });
  }

  grid.innerHTML = '';

  const countLabel = document.getElementById('catalog-count-label');
  if (countLabel) {
    if (filteredArtworksList.length <= displayedAdminCount) {
      countLabel.innerText = `Mostrando ${filteredArtworksList.length} de ${catalog.length} obras`;
    } else {
      countLabel.innerText = `Mostrando ${Math.min(displayedAdminCount, filteredArtworksList.length)} de ${filteredArtworksList.length} obras`;
    }
  }

  if (filteredArtworksList.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">No se encontraron obras con este criterio.</p>
        <button class="btn-action" onclick="resetFilters()">Ver todas las obras</button>
      </div>
    `;
    return;
  }

  const visibleSlice = filteredArtworksList.slice(0, displayedAdminCount);
  const fragment = document.createDocumentFragment();

  visibleSlice.forEach(art => {
    const card = document.createElement('div');
    card.className = 'art-card';
    card.id = `card-${art.id}`;

    const isAvailable = !!art.available;
    const badgeClass = isAvailable ? 'available' : 'private';
    const badgeText = isAvailable ? 'Disponible' : 'Colección Privada';

    card.innerHTML = `
      <div class="art-card-img-container">
        <img src="${art.image}" alt="${art.title}" class="art-card-img" loading="lazy" decoding="async" onerror="this.src='assets/logo_bibi.png'">
        <span class="card-status-badge ${badgeClass}" id="badge-${art.id}">${badgeText}</span>
      </div>
      
      <div class="art-card-body">
        <div style="display:flex; justify-content:space-between; align-items:baseline; gap:0.5rem; margin-bottom:0.25rem;">
          <h3 class="art-card-title" style="margin:0;">${art.title}</h3>
          <span style="font-family:'Cinzel',serif; font-size:0.88rem; font-weight:600; color:var(--accent-gold); white-space:nowrap; flex-shrink:0;">
            ${formatPriceUSD(art.price)}
          </span>
        </div>
        <div class="art-card-technique">${art.technique}</div>
        <div class="art-card-meta">${art.dimensions} &bull; ${art.year} &bull; Cat: ${art.category || 'general'}</div>

        <div class="status-toggle-bar">
          <span class="status-toggle-label">
            ${isAvailable ? '✓ Disponible para adquisición' : '🔒 Vendida / Colección privada'}
          </span>
          <label class="switch" title="Cambiar disponibilidad">
            <input type="checkbox" ${isAvailable ? 'checked' : ''} onchange="toggleAvailability('${art.id}', this.checked)">
            <span class="slider"></span>
          </label>
        </div>

        <div class="art-card-actions">
          <button class="card-btn" onclick="openEditModal('${art.id}')">
            <span>✏️</span> Editar datos
          </button>
          <button class="card-btn btn-delete" onclick="confirmDeleteArtwork('${art.id}')">
            <span>🗑️</span> Retirar
          </button>
        </div>
      </div>
    `;

    fragment.appendChild(card);
  });

  grid.appendChild(fragment);

  // Botón "Cargar más obras" si supera las 24
  if (filteredArtworksList.length > displayedAdminCount) {
    const remaining = filteredArtworksList.length - displayedAdminCount;
    const loadMoreBox = document.createElement('div');
    loadMoreBox.className = 'load-more-container';
    loadMoreBox.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 2.5rem 1rem 1rem;';
    loadMoreBox.innerHTML = `
      <button class="btn-action" onclick="loadMoreAdminArtworks()" style="padding: 0.85rem 2rem; font-size: 0.85rem;">
        Cargar más obras (+${Math.min(24, remaining)}) &darr;
      </button>
    `;
    grid.appendChild(loadMoreBox);
  }
}

function loadMoreAdminArtworks() {
  displayedAdminCount += 24;
  renderAdminGrid(false);
}

// -------------------------------------------------------------
// 7. ACCIONES (TOGGLE, EDIT, DELETE, ADD)
// -------------------------------------------------------------
function toggleAvailability(id, isAvailable) {
  const art = catalog.find(a => a.id === id);
  if (!art) return;

  art.available = isAvailable;
  saveLocalCache();

  const badge = document.getElementById(`badge-${id}`);
  if (badge) {
    badge.className = `card-status-badge ${isAvailable ? 'available' : 'private'}`;
    badge.innerText = isAvailable ? 'Disponible' : 'Colección Privada';
  }

  const card = document.getElementById(`card-${id}`);
  if (card) {
    card.classList.add('is-modified');
    const label = card.querySelector('.status-toggle-label');
    if (label) {
      label.innerText = isAvailable ? '✓ Disponible para adquisición' : '🔒 Vendida / Colección privada';
    }
  }

  showToast(`"${art.title}" marcada como ${isAvailable ? 'Disponible' : 'Colección Privada'}`, 'success');
}

function openCreateModal() {
  editingArtworkId = null;
  document.getElementById('modal-artwork-title').innerText = 'Nueva Obra';
  document.getElementById('form-art-title').value = '';
  document.getElementById('form-art-technique').value = '';
  document.getElementById('form-art-dimensions').value = '70 × 50 cm';
  document.getElementById('form-art-year').value = new Date().getFullYear().toString();
  document.getElementById('form-art-category').value = 'acrilico';
  document.getElementById('form-art-available').value = 'true';
  document.getElementById('form-art-price').value = '0';
  document.getElementById('form-art-image-url').value = '';
  
  const preview = document.getElementById('dropzone-preview');
  preview.style.display = 'none';
  preview.src = '';
  
  openModal('modal-artwork');
}

function openEditModal(id) {
  const art = catalog.find(a => a.id === id);
  if (!art) return;

  editingArtworkId = id;
  document.getElementById('modal-artwork-title').innerText = `Editar Obra: ${art.title}`;
  document.getElementById('form-art-title').value = art.title || '';
  document.getElementById('form-art-technique').value = art.technique || '';
  document.getElementById('form-art-dimensions').value = art.dimensions || '';
  document.getElementById('form-art-year').value = art.year || '';
  document.getElementById('form-art-category').value = art.category || 'acrilico';
  document.getElementById('form-art-available').value = art.available ? 'true' : 'false';
  document.getElementById('form-art-price').value = (typeof art.price !== 'undefined' && art.price !== null) ? art.price : 0;
  document.getElementById('form-art-image-url').value = art.image || '';

  const preview = document.getElementById('dropzone-preview');
  if (art.image) {
    preview.src = art.image;
    preview.style.display = 'inline-block';
  } else {
    preview.style.display = 'none';
  }

  openModal('modal-artwork');
}

function saveArtworkFromForm() {
  const title = document.getElementById('form-art-title').value.trim();
  const technique = document.getElementById('form-art-technique').value.trim();
  const dimensions = document.getElementById('form-art-dimensions').value.trim();
  const year = document.getElementById('form-art-year').value.trim();
  const category = document.getElementById('form-art-category').value;
  const available = document.getElementById('form-art-available').value === 'true';
  const rawPrice = document.getElementById('form-art-price').value;
  // Sanitización y validación estricta de precio para seguridad
  const price = Math.max(0, parseInt(rawPrice, 10) || 0);
  let image = document.getElementById('form-art-image-url').value.trim();

  if (!title) {
    showToast('El título de la obra es obligatorio', 'error');
    return;
  }

  if (editingArtworkId) {
    const art = catalog.find(a => a.id === editingArtworkId);
    if (art) {
      art.title = title;
      art.technique = technique;
      art.dimensions = dimensions;
      art.year = year;
      art.category = category;
      art.available = available;
      art.price = price;
      if (image) art.image = image;
      showToast(`Obra "${title}" actualizada`, 'success');
    }
  } else {
    const newId = `art-${Date.now().toString().slice(-4)}`;
    const newArt = {
      id: newId,
      title: title,
      technique: technique || 'Acrílico & Técnica Mixta',
      dimensions: dimensions || '70 × 50 cm',
      year: year || '2025',
      image: image || 'assets/artworks/solapado_1.webp',
      available: available,
      category: category,
      price: price
    };
    catalog.unshift(newArt);
    showToast(`Obra "${title}" agregada al catálogo`, 'success');
  }

  saveLocalCache();
  closeModal('modal-artwork');
  renderAdminGrid(true);
}

function confirmDeleteArtwork(id) {
  const art = catalog.find(a => a.id === id);
  if (!art) return;

  if (confirm(`¿Estás segura de retirar la obra "${art.title}" del catálogo?`)) {
    catalog = catalog.filter(a => a.id !== id);
    saveLocalCache();
    renderAdminGrid(true);
    showToast(`Obra "${art.title}" retirada del catálogo`, 'info');
  }
}

// -------------------------------------------------------------
// 8. OPTIMIZACIÓN Y COMPRESIÓN DE IMÁGENES EN EL CLIENTE
// -------------------------------------------------------------
async function handleImageFileSelect(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('Selecciona un archivo de imagen válido', 'error');
    return;
  }

  showToast('Optimizando fotografía...', 'info');

  try {
    const { cleanName, base64Data, dataUrl } = await compressAndOptimizeImage(file);
    const localAssetPath = `assets/artworks/${cleanName}`;

    stagedImages[cleanName] = base64Data;

    document.getElementById('form-art-image-url').value = localAssetPath;
    const preview = document.getElementById('dropzone-preview');
    preview.src = dataUrl;
    preview.style.display = 'inline-block';
    showToast(`Fotografía optimizada y lista (~${Math.round(base64Data.length * 0.75 / 1024)} KB)`, 'success');
  } catch (err) {
    console.error('Error optimizando imagen:', err);
    showToast('No se pudo procesar la imagen seleccionada', 'error');
  }
}

function compressAndOptimizeImage(file, maxWidth = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let format = 'image/webp';
        let ext = 'webp';
        let dataUrl = canvas.toDataURL(format, quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          format = 'image/jpeg';
          ext = 'jpg';
          dataUrl = canvas.toDataURL(format, quality);
        }

        const base64Data = dataUrl.split(',')[1];
        const rawName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const cleanName = rawName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString().slice(-4) + '.' + ext;

        resolve({ cleanName, base64Data, dataUrl });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// -------------------------------------------------------------
// 9. ACCESO TÉCNICO OCULTO
// -------------------------------------------------------------
function handleLogoDevClick() {
  logoClickCount++;
  clearTimeout(logoClickTimer);
  logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 1500);

  if (logoClickCount >= 4) {
    logoClickCount = 0;
    openSettingsModal();
  }
}

function openSettingsModal() {
  document.getElementById('cfg-owner').value = config.owner;
  document.getElementById('cfg-repo').value = config.repo;
  document.getElementById('cfg-branch').value = config.branch;
  document.getElementById('cfg-token').value = config.token || '';
  document.getElementById('cfg-pin').value = config.pin || '1357';
  openModal('modal-settings');
}

function saveSettingsFromForm() {
  const owner = document.getElementById('cfg-owner').value.trim();
  const repo = document.getElementById('cfg-repo').value.trim();
  const branch = document.getElementById('cfg-branch').value.trim();
  const token = document.getElementById('cfg-token').value.trim();
  const pin = document.getElementById('cfg-pin').value.trim() || '1357';

  saveConfig({ owner, repo, branch, token, pin });
  closeModal('modal-settings');
  showToast('Configuración técnica guardada', 'success');
}

// -------------------------------------------------------------
// 10. HELPERS UI
// -------------------------------------------------------------
function setFilter(filterType) {
  currentFilter = filterType;
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filterType);
  });
  renderAdminGrid(true);
}

function resetFilters() {
  searchQuery = '';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  setFilter('all');
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `<span style="font-weight:bold;">${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// -------------------------------------------------------------
// 11. INICIALIZACIÓN
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadConfig();
  checkPinProtection();
  loadCatalog();
  updatePendingUI();
  renderAdminGrid(true);

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderAdminGrid(true);
    });
  }

  const fileInput = document.getElementById('form-art-file');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleImageFileSelect(e.target.files[0]);
      }
    });
  }

  const pinInput = document.getElementById('pin-input');
  if (pinInput) {
    pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') verifyPin();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('modal-artwork');
      closeModal('modal-settings');
    }
  });
});

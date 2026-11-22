/**
 * ====================================================================
 * BIBI LACOSTE ART — CONTROLADOR DE CATÁLOGO & MODAL LIGHTBOX
 * Lógica de renderizado dinámico, filtros por técnica y consulta de obras
 * Arquitectura escalable para 100+ obras con renderizado por lotes y lazy loading
 * ====================================================================
 */

    let displayedCatalogCount = 24;
    let currentRenderList = [];
    const CATALOG_VERSION = '2026.2';

    // Obtener catálogo activo (con soporte de vista previa si se editó desde admin)
    function getActiveArtworks() {
      const cachedVer = localStorage.getItem('bibi_artworks_cache_version');
      if (cachedVer !== CATALOG_VERSION) {
        localStorage.removeItem('bibi_artworks_cache');
        localStorage.setItem('bibi_artworks_cache_version', CATALOG_VERSION);
      }
      const cached = localStorage.getItem('bibi_artworks_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.warn('Cache local inválido:', e);
        }
      }
      return typeof artworks !== 'undefined' ? artworks : [];
    }

    function renderArtGrid(list, resetCount = true) {
      const grid = document.getElementById('art-grid');
      if (!grid) return;
      
      const t = window.t || ((k, f) => f);

      if (resetCount) {
        displayedCatalogCount = 24;
        currentRenderList = list;
      }
      grid.innerHTML = '';

      const countLabel = document.getElementById('art-count-label');
      if (countLabel) {
        const showing = t('catalogPage.showing', 'Mostrando');
        const of = t('catalogPage.of', 'de');
        const artworksLbl = t('catalogPage.artworksLabel', 'obras');
        if (list.length <= displayedCatalogCount) {
          countLabel.innerText = `${showing} ${list.length} ${artworksLbl}`;
        } else {
          countLabel.innerText = `${showing} ${Math.min(displayedCatalogCount, list.length)} ${of} ${list.length} ${artworksLbl}`;
        }
      }

      const visibleSlice = list.slice(0, displayedCatalogCount);
      const fragment = document.createDocumentFragment();

      visibleSlice.forEach(art => {
        const card = document.createElement('div');
        card.className = 'art-card';
        card.onclick = () => openModal(art.id);

        const statusTag = art.available 
          ? `<span class="art-tag tag-available">${t('catalogPage.tagAvailableShort', 'Disponible')}</span>` 
          : `<span class="art-tag tag-private">${t('catalogPage.tagPrivateShort', 'Colección Privada')}</span>`;

        card.innerHTML = `
          <div class="art-img-wrapper">
            <img src="${art.image}" alt="${art.title}" class="art-card-img" loading="lazy" decoding="async">
            ${statusTag}
          </div>
          <div class="art-card-info">
            <h3 class="art-card-title">${art.title}</h3>
            <div class="art-card-technique">${art.technique}</div>
            <div class="art-card-dimensions">${art.dimensions} • ${art.year}</div>
            <div class="art-card-footer">
              <span class="art-card-cta">${t('catalogPage.examineBtn', 'Examinar obra →')}</span>
            </div>
          </div>
        `;
        fragment.appendChild(card);
      });

      grid.appendChild(fragment);

      // Si hay más obras de las visibles, agregar botón de carga progresiva
      if (list.length > displayedCatalogCount) {
        const remaining = list.length - displayedCatalogCount;
        const loadMoreBox = document.createElement('div');
        loadMoreBox.className = 'load-more-container';
        loadMoreBox.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 2.5rem 1rem 1rem;';
        loadMoreBox.innerHTML = `
          <button class="btn-load-more" onclick="loadMoreCatalogArtworks()" style="background:#1B1714; border:1px solid rgba(214,164,106,0.3); color:#FAF4ED; padding:0.85rem 2rem; border-radius:8px; font-family:'Cinzel',serif; font-size:0.82rem; letter-spacing:0.15em; text-transform:uppercase; cursor:pointer; transition:all 0.3s ease;">
            ${t('catalogPage.loadMoreBtn', 'Ver más obras')} (+${Math.min(24, remaining)}) &darr;
          </button>
        `;
        grid.appendChild(loadMoreBox);
      }
    }

    function loadMoreCatalogArtworks() {
      displayedCatalogCount += 24;
      renderArtGrid(currentRenderList, false);
    }

    function filterWorks(category) {
      document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
      const activeBtn = Array.from(document.querySelectorAll('.filter-tab')).find(b => {
        return b.getAttribute('onclick') && b.getAttribute('onclick').includes(category);
      });
      if (activeBtn) activeBtn.classList.add('active');

      const currentList = getActiveArtworks();
      let filtered = currentList;
      if (category === 'available') {
        filtered = currentList.filter(a => a.available);
      } else if (category === 'sold' || category === 'private') {
        filtered = currentList.filter(a => !a.available);
      } else if (category === 'mixta') {
        filtered = currentList.filter(a => a.category === 'mixta');
      } else if (category === 'acrilico') {
        filtered = currentList.filter(a => a.category === 'acrilico');
      }

      renderArtGrid(filtered, true);
    }

    function openModal(id) {
      const currentList = getActiveArtworks();
      const art = currentList.find(a => a.id === id);
      if (!art) return;

      const t = window.t || ((k, f) => f);

      document.getElementById('modal-img').src = art.image;
      document.getElementById('modal-title').innerText = art.title;
      document.getElementById('modal-technique').innerText = art.technique;
      document.getElementById('modal-dimensions').innerText = art.dimensions;
      document.getElementById('modal-year').innerText = art.year;

      const tagContainer = document.getElementById('modal-status-container');
      tagContainer.innerHTML = art.available 
        ? `<span class="art-tag tag-available">${t('catalogPage.tagAvailable', 'Disponible para Adquisición')}</span>` 
        : `<span class="art-tag tag-private">${t('catalogPage.tagPrivate', 'Colección Privada')}</span>`;

      const waMsg = encodeURIComponent(`Hola Bibi, me interesa consultar por la obra "${art.title}" (${art.dimensions}, ${art.year}).`);
      document.getElementById('modal-wa-btn').href = `https://wa.me/5491100000000?text=${waMsg}`;

      const modal = document.getElementById('art-modal');
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      const modal = document.getElementById('art-modal');
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    const modalBackdrop = document.getElementById('art-modal');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target.id === 'art-modal') closeModal();
      });
    }

    function updateFilterTabLabels() {
      const allArtworks = getActiveArtworks();
      const total = allArtworks.length;
      const avail = allArtworks.filter(a => a.available).length;
      const sold = allArtworks.filter(a => !a.available).length;
      const mixta = allArtworks.filter(a => a.category === 'mixta').length;
      const acrilico = allArtworks.filter(a => a.category === 'acrilico').length;
      const t = window.t || ((k, f) => f);

      const btnAll = document.querySelector('.filter-tab[data-filter="all"]');
      if (btnAll) btnAll.innerText = `${t('catalogPage.filterAll', 'Todas')} (${total})`;

      const btnAvail = document.querySelector('.filter-tab[data-filter="available"]');
      if (btnAvail) btnAvail.innerText = `${t('catalogPage.filterAvailable', 'Disponibles')} (${avail})`;

      const btnSold = document.querySelector('.filter-tab[data-filter="sold"]');
      if (btnSold) btnSold.innerText = `${t('catalogPage.filterSold', 'Vendidas')} (${sold})`;

      const btnMixta = document.querySelector('.filter-tab[data-filter="mixta"]');
      if (btnMixta) btnMixta.innerText = `${t('catalogPage.filterMixta', 'Técnica Mixta')} (${mixta})`;

      const btnAcrilico = document.querySelector('.filter-tab[data-filter="acrilico"]');
      if (btnAcrilico) btnAcrilico.innerText = `${t('catalogPage.filterAcrilico', 'Acrílicos')} (${acrilico})`;

      const statTotal = document.getElementById('stat-total-count');
      if (statTotal) statTotal.innerText = total;
      const statAvail = document.getElementById('stat-avail-count');
      if (statAvail) statAvail.innerText = avail;
    }

    function refreshCatalogI18n() {
      updateFilterTabLabels();
      renderArtGrid(currentRenderList && currentRenderList.length > 0 ? currentRenderList : getActiveArtworks(), false);
    }
    window.refreshCatalogI18n = refreshCatalogI18n;
    window.addEventListener('languagechange', refreshCatalogI18n);

    // Initial load
    updateFilterTabLabels();
    renderArtGrid(getActiveArtworks(), true);

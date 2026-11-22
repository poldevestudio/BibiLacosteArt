/**
 * ====================================================================
 * BIBI LACOSTE ART — CONTROLADOR DE CATÁLOGO & MODAL LIGHTBOX
 * Lógica de renderizado dinámico, filtros por técnica y consulta de obras
 * ====================================================================
 */

    // Obtener catálogo activo (con soporte de vista previa si se editó desde admin)
    function getActiveArtworks() {
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

    function renderArtGrid(list) {
      const grid = document.getElementById('art-grid');
      if (!grid) return;
      grid.innerHTML = '';

      const countLabel = document.getElementById('art-count-label');
      if (countLabel) {
        countLabel.innerText = `Mostrando ${list.length} obra${list.length === 1 ? '' : 's'}`;
      }

      list.forEach(art => {
        const card = document.createElement('div');
        card.className = 'art-card';
        card.onclick = () => openModal(art.id);

        const statusTag = art.available 
          ? '<span class="art-tag tag-available">Disponible</span>' 
          : '<span class="art-tag tag-private">Colección Privada</span>';

        card.innerHTML = `
          <div class="art-img-wrapper">
            <img src="${art.image}" alt="${art.title}" class="art-card-img" loading="lazy">
            ${statusTag}
          </div>
          <div class="art-card-info">
            <h3 class="art-card-title">${art.title}</h3>
            <div class="art-card-technique">${art.technique}</div>
            <div class="art-card-dimensions">${art.dimensions} • ${art.year}</div>
            <div class="art-card-footer">
              <span class="art-card-cta">Examinar obra &rarr;</span>
            </div>
          </div>
        `;
        grid.appendChild(card);
      });
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
      } else if (category === 'mixta') {
        filtered = currentList.filter(a => a.category === 'mixta');
      } else if (category === 'acrilico') {
        filtered = currentList.filter(a => a.category === 'acrilico');
      }

      renderArtGrid(filtered);
    }

    function openModal(id) {
      const currentList = getActiveArtworks();
      const art = currentList.find(a => a.id === id);
      if (!art) return;

      document.getElementById('modal-img').src = art.image;
      document.getElementById('modal-title').innerText = art.title;
      document.getElementById('modal-technique').innerText = art.technique;
      document.getElementById('modal-dimensions').innerText = art.dimensions;
      document.getElementById('modal-year').innerText = art.year;

      const tagContainer = document.getElementById('modal-status-container');
      tagContainer.innerHTML = art.available 
        ? '<span class="art-tag tag-available">Disponible para Adquisición</span>' 
        : '<span class="art-tag tag-private">Colección Privada</span>';

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

    // Render immediately
    renderArtGrid(getActiveArtworks());

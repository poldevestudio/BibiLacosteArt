/**
 * ====================================================================
 * BIBI LACOSTE ART — CONTROLADOR DE NAVEGACIÓN & SCROLL INTEGRADO
 * Gestión de transiciones entre la experiencia 3D y las secciones editoriales
 * ====================================================================
 */

    // Touch gesture tracking
    
    function isCatalogInteraction(e) {
      if (!e) return false;
      const target = e.target;
      if (target && target.closest && target.closest('#brand-container, .intro-nav-links, .intro-nav-link, #catalog-nav, #catalog-section, .ui-layer a, .ui-layer button, .sound-toggle, #assemble-btn-container, #artwork-reveal-card, a, button')) {
        return true;
      }
      if (document.body.classList.contains('catalog-unlocked')) {
        if (window.scrollY > 10) return true;
        if (target && target.closest && target.closest('#catalog-section')) return true;
      }
      return false;
    }

    
    /* ========================================================
       CLEAN BIOGRAPHY & NAVIGATION LOGIC (NO ARTWORKS ON INDEX)
       ======================================================== */
    function openIntegratedCatalog(targetId) {
      document.documentElement.classList.add('catalog-unlocked');
      document.body.classList.add('catalog-unlocked');
      document.documentElement.classList.remove('h-full');
      document.body.classList.remove('h-full');
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.overflowX = 'hidden';
      document.body.style.overflow = 'visible';
      
      let tid = targetId || 'biografia';
      if (tid === 'origen' || tid === 'inicio') tid = 'biografia';
      else if (tid === 'contacto') tid = 'contacto-adquisicion';

      const doScroll = () => {
        const target = document.getElementById(tid) || document.getElementById('catalog-section');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };

      doScroll();
      requestAnimationFrame(() => {
        doScroll();
        setTimeout(doScroll, 80);
      });
    }

    function returnTo3DExperience() {
      // Temporarily unlock overflow so smooth scroll executes smoothly
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';

      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' });

      // Reset full 3D experience
      resetExperienceToPhase1();

      // Clear any hash so refresh stays at 3D top
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }

      // After arriving at top, lock overflow back to the 3D experience
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        document.documentElement.classList.remove('catalog-unlocked');
        document.body.classList.remove('catalog-unlocked');
      }, 550);
    }



    // Direct entry check: if hash or query requests biografia/origen/statement/contacto/inicio, jump immediately without repeating 3D
    const initHash = (window.location.hash || '').toLowerCase();
    const initSearch = (window.location.search || '').toLowerCase();
    const isDirectToContent = initHash.includes('bio') || 
                             initHash.includes('origen') || 
                             initHash.includes('statement') || 
                             initHash.includes('catalog') || 
                             initHash.includes('contacto') || 
                             initHash.includes('inicio') ||
                             initSearch.includes('inicio');

    if (isDirectToContent) {
      document.documentElement.classList.add('catalog-unlocked');
      document.body.classList.add('catalog-unlocked');
      document.documentElement.classList.remove('h-full');
      document.body.classList.remove('h-full');
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.overflowX = 'hidden';
      document.body.style.overflow = 'visible';

      let targetId = 'catalog-section';
      if (initHash.includes('contacto')) {
        targetId = 'contacto-adquisicion';
      } else if (initHash.includes('statement')) {
        targetId = 'statement';
      } else {
        targetId = 'catalog-section';
      }

      const executeJump = () => {
        const el = document.getElementById(targetId) || document.getElementById('catalog-section');
        if (el) {
          el.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      };

      executeJump();
      requestAnimationFrame(executeJump);
      setTimeout(executeJump, 60);
      setTimeout(executeJump, 250);
    } else {
      // Prevent browser from restoring scrolled position on normal 3D entry
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    // Hashchange listener for smooth in-page transitions
    window.addEventListener('hashchange', () => {
      const h = (window.location.hash || '').toLowerCase();
      if (h.includes('bio') || h.includes('origen') || h.includes('statement') || h.includes('catalog') || h.includes('contacto') || h.includes('inicio')) {
        let tid = 'catalog-section';
        if (h.includes('contacto')) tid = 'contacto-adquisicion';
        else if (h.includes('statement')) tid = 'statement';
        else tid = 'catalog-section';
        openIntegratedCatalog(tid);
      }
    });


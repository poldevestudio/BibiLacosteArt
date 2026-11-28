/**
 * ====================================================================
 * BIBI LACOSTE ART — MOTOR DE INTERNACIONALIZACIÓN (i18n)
 * Gestión reactiva de idiomas, persistencia local y sincronización UI
 * ====================================================================
 */

(function () {
  const LANGUAGES = {
    es: { code: 'es', label: 'Español', short: 'ES', flag: '🇪🇸' },
    en: { code: 'en', label: 'English', short: 'EN', flag: '🇬🇧' },
    de: { code: 'de', label: 'Deutsch', short: 'DE', flag: '🇩🇪' },
    it: { code: 'it', label: 'Italiano', short: 'IT', flag: '🇮🇹' },
    fr: { code: 'fr', label: 'Français', short: 'FR', flag: '🇫🇷' },
    pt: { code: 'pt', label: 'Português', short: 'PT', flag: '🇧🇷' }
  };

  let currentLang = 'es';

  // Helper para resolver claves anidadas tipo "statement.p1"
  function resolveKey(obj, path) {
    if (!obj || !path) return null;
    return path.split('.').reduce((prev, curr) => (prev ? prev[curr] : null), obj);
  }

  function t(key, fallback = '') {
    if (typeof translations === 'undefined') return fallback || key;
    
    // Buscar en el idioma actual
    let val = resolveKey(translations[currentLang], key);
    if (val !== null && val !== undefined) return val;

    // Fallback a español
    val = resolveKey(translations['es'], key);
    if (val !== null && val !== undefined) return val;

    return fallback || key;
  }

  function setLanguage(lang) {
    if (!LANGUAGES[lang]) {
      console.warn(`Idioma "${lang}" no soportado. Usando español.`);
      lang = 'es';
    }

    currentLang = lang;
    document.documentElement.lang = lang;

    // 1. Traducir elementos de texto plano [data-i18n]
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = t(key);
      if (text) {
        el.innerText = text;
      }
    });

    // 2. Traducir elementos con HTML enriquecido [data-i18n-html]
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const htmlContent = t(key);
      if (htmlContent) {
        el.innerHTML = htmlContent;
      }
    });

    // 3. Traducir placeholders de inputs [data-i18n-placeholder]
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const ph = t(key);
      if (ph) {
        el.placeholder = ph;
      }
    });

    // 4. Actualizar etiquetas de todos los selectores en la página
    document.querySelectorAll('.lang-selector-btn').forEach(btn => {
      const shortLabel = btn.querySelector('.lang-short-code');
      if (shortLabel) {
        shortLabel.innerText = LANGUAGES[lang].short;
      } else {
        btn.innerHTML = `<span class="lang-globe-icon">🌐</span> <span class="lang-short-code">${LANGUAGES[lang].short}</span> <span class="lang-arrow-icon">▾</span>`;
      }
    });

    // 5. Actualizar clase activa en todos los menús desplegables
    document.querySelectorAll('.lang-dropdown-item').forEach(item => {
      const itemLang = item.getAttribute('data-lang');
      const isActive = itemLang === lang;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // 6. Persistir preferencia del usuario
    localStorage.setItem('bibi_lang', lang);

    // 7. Notificar a otros módulos (Three.js, catálogo, etc.)
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));

    // Si estamos en obras.html, refrescar textos dinámicos del catálogo
    if (typeof refreshCatalogI18n === 'function') {
      refreshCatalogI18n();
    }
  }

  // Generador de HTML para el componente desplegable de idioma
  function createLanguageDropdownMarkup() {
    const currentShort = LANGUAGES[currentLang] ? LANGUAGES[currentLang].short : 'ES';
    
    let optionsHtml = '';
    Object.keys(LANGUAGES).forEach(code => {
      const lang = LANGUAGES[code];
      const isActive = code === currentLang;
      optionsHtml += `
        <button type="button" class="lang-dropdown-item ${isActive ? 'is-active' : ''}" data-lang="${code}" role="option" aria-selected="${isActive}">
          <span class="lang-item-content">
            <span class="lang-item-flag">${lang.flag}</span>
            <span class="lang-item-name">${lang.label}</span>
          </span>
          <span class="lang-item-active-dot">•</span>
        </button>
      `;
    });

    return `
      <div class="lang-dropdown-wrapper" role="region" aria-label="Selector de idioma">
        <button type="button" class="lang-selector-btn" aria-haspopup="listbox" aria-expanded="false" title="Cambiar idioma / Change language">
          <span class="lang-globe-icon">🌐</span>
          <span class="lang-short-code">${currentShort}</span>
          <span class="lang-arrow-icon">▾</span>
        </button>
        <div class="lang-dropdown-menu" role="listbox">
          ${optionsHtml}
        </div>
      </div>
    `;
  }

  // Inicialización de eventos en los desplegables
  function setupDropdownListeners() {
    // Toggle abrir/cerrar al hacer clic en el botón
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('.lang-selector-btn');
      if (trigger) {
        e.preventDefault();
        e.stopPropagation();
        const wrapper = trigger.closest('.lang-dropdown-wrapper');
        const isOpen = wrapper.classList.contains('is-open');

        // Cerrar cualquier otro selector abierto
        document.querySelectorAll('.lang-dropdown-wrapper.is-open').forEach(w => {
          if (w !== wrapper) {
            w.classList.remove('is-open');
            const btn = w.querySelector('.lang-selector-btn');
            if (btn) btn.setAttribute('aria-expanded', 'false');
          }
        });

        // Alternar el actual
        wrapper.classList.toggle('is-open', !isOpen);
        trigger.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
        return;
      }

      // Clic en una opción del menú
      const item = e.target.closest('.lang-dropdown-item');
      if (item) {
        e.preventDefault();
        e.stopPropagation();
        const selectedLang = item.getAttribute('data-lang');
        setLanguage(selectedLang);

        // Cerrar menú
        const wrapper = item.closest('.lang-dropdown-wrapper');
        if (wrapper) {
          wrapper.classList.remove('is-open');
          const btn = wrapper.querySelector('.lang-selector-btn');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
        return;
      }

      // Clic afuera: cerrar todos
      document.querySelectorAll('.lang-dropdown-wrapper.is-open').forEach(w => {
        w.classList.remove('is-open');
        const btn = w.querySelector('.lang-selector-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    });

    // Cerrar con Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.lang-dropdown-wrapper.is-open').forEach(w => {
          w.classList.remove('is-open');
          const btn = w.querySelector('.lang-selector-btn');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  // Detectar idioma inicial
  function detectInitialLanguage() {
    // 1. Preferencia guardada
    const saved = localStorage.getItem('bibi_lang');
    if (saved && LANGUAGES[saved]) return saved;

    // 2. Parámetro de URL ?lang=en
    const urlParams = new URLSearchParams(window.location.search);
    const paramLang = urlParams.get('lang');
    if (paramLang && LANGUAGES[paramLang]) return paramLang;

    // 3. Idioma del navegador si coincide con uno soportado
    const browserLang = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
    if (LANGUAGES[browserLang]) return browserLang;

    // 4. Default: Español
    return 'es';
  }

  function initI18n() {
    // 1. Inyectar el componente en todos los placeholders definidos
    document.querySelectorAll('.lang-dropdown-placeholder').forEach(container => {
      container.innerHTML = createLanguageDropdownMarkup();
    });

    // 2. Configurar listeners de clic y accesibilidad
    setupDropdownListeners();

    // 3. Detectar y aplicar idioma inicial
    const initial = detectInitialLanguage();
    setLanguage(initial);
  }

  // Exponer API global
  window.i18n = {
    setLanguage,
    t,
    getCurrentLanguage: () => currentLang,
    getSupportedLanguages: () => ({ ...LANGUAGES }),
    createDropdownMarkup: createLanguageDropdownMarkup,
    init: initI18n
  };
  window.t = t;
  window.setLanguage = setLanguage;

  if (document.readyState === 'loading' && !document.body) {
    document.addEventListener('DOMContentLoaded', initI18n);
  } else {
    initI18n();
  }
})();

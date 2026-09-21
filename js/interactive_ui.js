/**
 * ==========================================================================
 * SAPIENSIA CLAN — MÓDULO JS: MICROINTERACCIONES & UI INTERACTIVA
 * Archivo: js/interactive_ui.js
 * Descripción: Spotlight reactivo al cursor, 3D Tilt y gestor de portapapeles.
 * Autor: Nexo (Ingeniero Principal)
 * ==========================================================================
 */

/**
 * 1. SPOTLIGHT REACTIVO (SEGUIMIENTO DE CURSOR EN TARJETAS GLASS)
 * Actualiza las variables CSS --mouse-x y --mouse-y para iluminar el borde y fondo.
 */
function initSpotlightCards() {
  const cards = document.querySelectorAll('.spotlight-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }, { passive: true });
  });
}

/**
 * 2. 3D TILT SUAVE (MICROINTERACCIÓN CINEMÁTICA EN TARJETAS DEL CLAN)
 * Calcula la rotación en los ejes X e Y según la posición relativa del cursor.
 */
function initTiltCards() {
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    let bounds = null;

    card.addEventListener('mouseenter', () => {
      bounds = card.getBoundingClientRect();
      card.style.transition = 'transform 0.1s ease-out, box-shadow 0.25s ease-out';
    }, { passive: true });

    card.addEventListener('mousemove', (e) => {
      if (!bounds) bounds = card.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      const px = (x / bounds.width) * 2 - 1;
      const py = (y / bounds.height) * 2 - 1;

      const rotX = -py * 7;
      const rotY = px * 7;

      card.style.transform = `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px)`;
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    }, { passive: true });
  });
}

/**
 * 3. COPIAR BINANCE ID AL PORTAPAPELES
 * Proporciona confirmación visual y sonora al usuario al copiar el código de mecenazgo.
 */
function initCopyBinance() {
  const btn = document.getElementById('btn-copiar-id');
  const copyText = document.getElementById('copy-text');
  const copyIcon = document.getElementById('copy-icon');

  if (!btn) return;

  btn.addEventListener('click', async () => {
    const id = '35863102';
    try {
      await navigator.clipboard.writeText(id);
      // Feedback sonoro (Acorde ámbar de Hertz)
      if (window.clanAudio) window.clanAudio.playAmberSuccess();
      
      // Feedback visual
      copyIcon.innerHTML = '<img src="assets/emojis/emoji_simbolo_check.png" class="pixel-icon-inline" alt="Check">';
      copyText.textContent = '¡Binance ID Copiado!';
      btn.style.borderColor = '#10b981';
      btn.style.color = '#10b981';

      // Restaurar estado tras 2.5 segundos
      setTimeout(() => {
        copyIcon.innerHTML = '<img src="assets/emojis/emoji_pergamino.png" class="pixel-icon-inline" alt="Copiar">';
        copyText.textContent = `Copiar Binance ID (${id})`;
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 2500);
    } catch (err) {
      // Fallback para navegadores que bloqueen clipboard API
      prompt('Copia manualmente el Binance ID:', id);
    }
  });
}

/**
 * 4. MENÚ HAMBURGUESA MÓVIL
 * Abre y cierra el menú de navegación en pantallas pequeñas con animación fluida.
 */
function initMobileMenu() {
  const btnMenu = document.getElementById('btn-mobile-menu');
  const navLinks = document.getElementById('nav-links');

  if (!btnMenu || !navLinks) return;

  const toggleMenu = (open) => {
    const isOpen = open !== undefined ? open : !navLinks.classList.contains('is-open');
    btnMenu.classList.toggle('is-active', isOpen);
    btnMenu.setAttribute('aria-expanded', isOpen.toString());
    navLinks.classList.toggle('is-open', isOpen);
  };

  btnMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Cerrar al hacer clic en cualquier enlace
  navLinks.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Cerrar al hacer clic fuera del menú
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('is-open') && !navLinks.contains(e.target) && !btnMenu.contains(e.target)) {
      toggleMenu(false);
    }
  });
}

/**
 * 5. CONMUTADOR DE MODO ANTROPO / ARCADE
 * Cambia el tema global entre 'antropo' (editorial/Unicode) y 'arcade' (retro pixel/sprites Pix).
 */
function initThemeToggle() {
  const btn = document.getElementById('btn-theme-toggle');
  const label = document.getElementById('theme-toggle-label');

  const applyTheme = (theme, playAudio = false) => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('sapiensia_view_mode', theme);

    if (label) {
      label.textContent = theme === 'arcade' ? 'ARCADE' : 'ANTROPO';
    }
    if (btn) {
      btn.setAttribute('title', theme === 'arcade' ? 'Modo Arcade Activo (Clic para volver a Modo Antropo)' : 'Modo Antropo Activo (Clic para cambiar a Modo Arcade Pixel)');
      btn.classList.toggle('is-arcade', theme === 'arcade');
    }

    // Conmutar portadas de obras dinámicas
    document.querySelectorAll('.dynamic-cover').forEach(img => {
      const targetSrc = theme === 'arcade' ? img.dataset.coverArcade : img.dataset.coverAntropo;
      if (targetSrc && img.getAttribute('src') !== targetSrc) {
        img.setAttribute('src', targetSrc);
      }
    });

    // Feedback sonoro procedural de Hertz
    if (playAudio && window.clanAudio) {
      if (theme === 'arcade') {
        window.clanAudio.playThemeArcade();
      } else {
        window.clanAudio.playThemeAntropo();
      }
    }
  };

  // Inicializar estado guardado en LocalStorage o por defecto 'antropo'
  const savedTheme = localStorage.getItem('sapiensia_view_mode') || 'antropo';
  applyTheme(savedTheme, false);

  if (btn) {
    btn.addEventListener('click', () => {
      const active = document.documentElement.dataset.theme || 'antropo';
      const nextTheme = active === 'arcade' ? 'antropo' : 'arcade';
      applyTheme(nextTheme, true);
    });
  }
}
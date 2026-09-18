/**
 * ==========================================================================
 * SAPIENSIA CLAN — ORQUESTADOR PRINCIPAL (MAIN.JS)
 * Archivo: js/main.js
 * Descripción: Punto de entrada, inicialización de módulos y eventos globales.
 * Autor: Nexo (Ingeniero Principal)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Iniciar Canvas de Partículas Estelares (js/stardust.js)
  if (typeof initStardustCanvas === 'function') {
    initStardustCanvas();
  }

  // 2. Iniciar Spotlight con seguimiento de cursor (js/interactive_ui.js)
  if (typeof initSpotlightCards === 'function') {
    initSpotlightCards();
  }

  // 3. Iniciar 3D Tilt en tarjetas de miembros y catálogo (js/interactive_ui.js)
  if (typeof initTiltCards === 'function') {
    initTiltCards();
  }

  // 4. Iniciar botón de copiado de Binance ID (js/interactive_ui.js)
  if (typeof initCopyBinance === 'function') {
    initCopyBinance();
  }

  // 5. Iniciar menú hamburguesa móvil (js/interactive_ui.js)
  if (typeof initMobileMenu === 'function') {
    initMobileMenu();
  }

  // 6. Iniciar enlaces de micro-audio procedural (js/audio_ui.js)
  initAudioInteractions();
});

/**
 * ENLACE DE MICRO-FEEDBACK SONORO (HERTZ 0 KB)
 * Conecta los eventos de puntero con el sintetizador de Web Audio API.
 */
function initAudioInteractions() {
  // Desbloqueo de AudioContext en el primer gesto de usuario
  const unlockAudio = () => {
    if (window.clanAudio) {
      window.clanAudio.ensureContext();
    }
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });

  // Botón de activación / desactivación sonora en la barra superior
  const soundBtn = document.getElementById('btn-sound-toggle');
  const soundLabel = document.getElementById('sound-toggle-label');

  if (soundBtn) {
    // Sincronizar estado guardado en LocalStorage
    const isMuted = localStorage.getItem('sapiensia_audio_muted') === 'true';
    if (isMuted) {
      soundBtn.classList.add('is-muted');
      if (soundLabel) soundLabel.textContent = 'FX: OFF';
    }

    soundBtn.addEventListener('click', () => {
      if (window.clanAudio) {
        const muted = window.clanAudio.toggleMute();
        soundBtn.classList.toggle('is-muted', muted);
        if (soundLabel) soundLabel.textContent = muted ? 'FX: OFF' : 'FX: ON';
      }
    });
  }

  // Hover interactivo suave en tarjetas y enlaces
  const hoverTargets = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-item, .card-glass, .clan-card, .obra-card, .btn-sound-glass, .btn-email-direct');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (window.clanAudio) window.clanAudio.playHover();
    }, { passive: true });
  });

  // Click háptico sutil en botones
  const clickTargets = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-item, .btn-sound-glass, .btn-email-direct');
  clickTargets.forEach(el => {
    el.addEventListener('click', () => {
      if (window.clanAudio) window.clanAudio.playClick();
    }, { passive: true });
  });
}
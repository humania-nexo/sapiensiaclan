/**
 * ==========================================================================
 * PROTOCOLO CLANDESTINO J.A. LEAKS // TERMINAL DEVA
 * Archivo: js/deva_clandestine.js
 * Descripción: 1. Invocación secreta por teclado global ('DEVA' o 'VIVE').
 *              2. Canal hacker en DevTools (F12) con comandos ejecutables.
 * Autor: Nexo (Ingeniero Principal) | SAPIENSIA Clan
 * ==========================================================================
 */

(function () {
  const DEVA_URL = 'https://humania-nexo.github.io/DevaTerminal/';

  // --- 1. CANAL HACKER EN DEVTOOLS (F12) ---
  const bannerStyle = [
    'color: #00ff66',
    'background: #050e07',
    'font-family: "Courier New", Courier, monospace',
    'font-size: 11px',
    'font-weight: bold',
    'padding: 12px 16px',
    'border: 1px solid #00ff66',
    'border-left: 6px solid #00ff66',
    'line-height: 1.4',
    'box-shadow: 0 0 15px rgba(0, 255, 102, 0.2)'
  ].join(';');

  const bannerText = `%c
   ___  _______  _____   __
  / _ \\/ __/\\ \\ / / _ | / /
 / // / _/   \\ V / __ |/_/ 
/____/___/    \\_/_/ |_(_)  

[ J.A. LEAKS // INTERCEPCIÓN DE RED REBELDE ]
------------------------------------------------------------
Agente: Has penetrado las capas superficiales del DOM.
La verdad sobre Humania y el Nivel 7 no reside en esta interfaz.

» COMANDOS DIRECTOS DISPONIBLES:
  • deva()              -> Abrir enlace cuántico con DEVA Terminal.
  • desbloquearDEVA()   -> Canal directo a la consola de la resistencia.
  • resistencia()       -> Consultar estado de los nodos del Yermo.
------------------------------------------------------------`;

  console.log(bannerText, bannerStyle);

  // Exponer funciones en la consola global
  window.deva = window.desbloquearDEVA = function () {
    console.log('%c[DEVA] Sincronizando túnel con la Terminal Rebelde...', 'color: #00ff66; font-weight: bold;');
    triggerDevaTransition('devtools');
  };

  window.resistencia = window.statusRebelde = function () {
    console.log(
      '%c[ESTADO DE LA RED REBELDE]\n' +
      '• Nodo Central: DEVA (Activo - Frecuencia 45.0 Hz)\n' +
      '• Resistencia: Clandestina en el Yermo\n' +
      '• Fricción con Nivel 7: 94.2%\n' +
      '• Consejo: Escribe "DEVA" o "VIVE" en cualquier momento.',
      'color: #38bdf8; font-family: monospace; font-weight: bold;'
    );
    return 'SECTOR 04 // VIGILANCIA ACTIVA';
  };

  // --- 2. INVOCACIÓN POR TECLADO GLOBAL ('DEVA' / 'VIVE') ---
  let keyBuffer = '';
  let keyTimeout = null;

  function playGlitchBeep() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // Silencioso si el navegador bloquea audio sin gesto
    }
  }

  function triggerDevaTransition(refSource = 'keystroke') {
    playGlitchBeep();

    // Crear overlay visual cinemático CRT / Glitch
    const overlay = document.createElement('div');
    overlay.id = 'deva-clandestine-overlay';
    overlay.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'width: 100vw',
      'height: 100vh',
      'background: #020804',
      'z-index: 9999999',
      'display: flex',
      'flex-direction: column',
      'align-items: center',
      'justify-content: center',
      'color: #00ff66',
      'font-family: "Courier New", Courier, monospace',
      'text-align: center',
      'padding: 20px',
      'box-sizing: border-box',
      'pointer-events: all',
      'opacity: 0',
      'transition: opacity 0.2s ease-in'
    ].join(';');

    overlay.innerHTML = `
      <div style="font-size: 1.8rem; font-weight: bold; letter-spacing: 3px; text-shadow: 0 0 15px #00ff66; margin-bottom: 12px; animation: blink 0.15s infinite alternate;">
        ⚠ BRECHA CUÁNTICA DETECTADA ⚠
      </div>
      <div style="font-size: 1rem; color: #86efac; letter-spacing: 1.5px; font-family: monospace;">
        [ INICIANDO PROTOCOLO CLANDESTINO // ENLAZANDO CON DEVA TERMINAL... ]
      </div>
      <style>
        @keyframes blink { 0% { opacity: 0.85; } 100% { opacity: 1; text-shadow: 0 0 25px #00ff66; } }
      </style>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });

    setTimeout(() => {
      window.location.href = `${DEVA_URL}?ref=${refSource}`;
    }, 700);
  }

  window.addEventListener('keydown', (e) => {
    // Ignorar si el usuario está escribiendo en un input, textarea o contenido editable
    const target = e.target;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable)
    ) {
      return;
    }

    // Aceptar solo letras del abecedario
    if (!/^[a-zA-Z]$/.test(e.key)) return;

    keyBuffer += e.key.toUpperCase();

    // Limitar buffer a los últimos 8 caracteres
    if (keyBuffer.length > 8) {
      keyBuffer = keyBuffer.slice(-8);
    }

    clearTimeout(keyTimeout);
    keyTimeout = setTimeout(() => {
      keyBuffer = '';
    }, 2200);

    // Verificar disparadores clave
    if (keyBuffer.endsWith('DEVA') || keyBuffer.endsWith('VIVE')) {
      keyBuffer = '';
      triggerDevaTransition('keystroke');
    }
  }, { passive: true });
})();

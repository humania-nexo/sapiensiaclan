/**
 * ==========================================================================
 * PROTOCOLO CLANDESTINO J.A. LEAKS // TERMINAL DEVA (RETRO CRT EDITION)
 * Archivo: js/deva_clandestine.js
 * Descripción: 1. Invocación secreta por teclado global ('DEVA' o 'VIVE').
 *              2. Filtro CRT analógico con scanlines, curvatura y barra de datos.
 *              3. Canal hacker en DevTools (F12) con comandos ejecutables.
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

  // --- 2. SÍNTESIS DE AUDIO RETRO PROCEDURAL (WEB AUDIO 0 KB) ---
  function playRetroBootSequence() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Pulso 1: Tono de enlace de módem
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(320, ctx.currentTime);
      osc1.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.35);
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.5);

      // Pulso 2: Pitido de confirmación terminal a los 1.2s
      setTimeout(() => {
        if (ctx.state === 'closed') return;
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1200, ctx.currentTime);
        gain2.gain.setValueAtTime(0.15, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.3);
      }, 1200);

      // Pulso 3: Beep agudo final de despegue a los 2.4s
      setTimeout(() => {
        if (ctx.state === 'closed') return;
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(1850, ctx.currentTime);
        gain3.gain.setValueAtTime(0.18, ctx.currentTime);
        gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start();
        osc3.stop(ctx.currentTime + 0.35);
      }, 2400);
    } catch (e) {}
  }

  // --- 3. TRANSICIÓN CINEMÁTICA CON FILTRO CRT RETRO ---
  let isTransitioning = false;

  function triggerDevaTransition(refSource = 'keystroke') {
    if (isTransitioning) return;
    isTransitioning = true;

    playRetroBootSequence();

    // Crear overlay visual cinemático CRT
    const overlay = document.createElement('div');
    overlay.id = 'deva-clandestine-overlay';
    overlay.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'width: 100vw',
      'height: 100vh',
      'background: #020803',
      'z-index: 99999999',
      'display: flex',
      'flex-direction: column',
      'align-items: center',
      'justify-content: center',
      'color: #00ff66',
      'font-family: "Courier New", Courier, monospace',
      'text-align: center',
      'padding: 24px',
      'box-sizing: border-box',
      'pointer-events: all',
      'overflow: hidden',
      'opacity: 0',
      'transition: opacity 0.25s ease-in'
    ].join(';');

    overlay.innerHTML = `
      <!-- FILTRO SCANLINES CRT RETRO -->
      <div class="crt-scanlines"></div>
      <div class="crt-vignette"></div>
      <div class="crt-beam"></div>

      <!-- CONTENEDOR DE CONTENIDO FÓSFORO VERDE -->
      <div class="crt-terminal-box">
        <div class="crt-header-tag">
          [ SISTEMA DE TRANSMISIÓN CUÁNTICA // J.A. LEAKS ]
        </div>
        
        <div class="crt-alert-title">
          ⚠ BRECHA ANALÓGICA DETECTADA ⚠
        </div>
        
        <div class="crt-log-line">
          >> SECUENCIA CLANDESTINA IDENTIFICADA: <strong>"DEVA / VIVE"</strong>
        </div>
        <div class="crt-log-line">
          >> BYPASS DE SEGURIDAD NIVEL 7: <span style="color:#86efac;">OK // SIN RASTRO</span>
        </div>
        <div class="crt-log-line">
          >> ESTABLECIENDO TÚNEL BIFROST CON LA TERMINAL DE DEVA...
        </div>

        <!-- BARRA DE CARGA RETRO -->
        <div class="crt-progress-container">
          <div id="crt-progress-bar" class="crt-progress-fill"></div>
        </div>

        <div id="crt-status-text" class="crt-footer-status">
          SINCRONIZANDO NODOS REBELDES [ 0% ]
        </div>
      </div>

      <style>
        /* SCANLINES HORIZONTALES */
        .crt-scanlines {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.6) 0px,
            rgba(0, 0, 0, 0.6) 2px,
            transparent 2px,
            transparent 4px
          );
          pointer-events: none;
          z-index: 2;
        }

        /* VIÑETA ABOMBADA / CURVATURA CRT */
        .crt-vignette {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: radial-gradient(circle at center, rgba(0, 255, 102, 0.04) 0%, rgba(0, 0, 0, 0.85) 90%);
          box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.95);
          pointer-events: none;
          z-index: 3;
        }

        /* BARRIDO DE HAZ DE ELECTRONES (BEAM ROLL) */
        .crt-beam {
          position: absolute;
          top: -100px; left: 0; width: 100%; height: 120px;
          background: linear-gradient(180deg, transparent 0%, rgba(0, 255, 102, 0.08) 50%, transparent 100%);
          animation: crtRoll 2.6s linear infinite;
          pointer-events: none;
          z-index: 4;
        }

        @keyframes crtRoll {
          0% { transform: translateY(-100px); }
          100% { transform: translateY(110vh); }
        }

        /* CAJA PRINCIPAL CON RESPLANDOR */
        .crt-terminal-box {
          position: relative;
          z-index: 5;
          max-width: 680px;
          width: 90%;
          background: rgba(4, 18, 8, 0.85);
          border: 2px solid #00ff66;
          box-shadow: 0 0 35px rgba(0, 255, 102, 0.35), inset 0 0 20px rgba(0, 255, 102, 0.15);
          border-radius: 8px;
          padding: 30px 24px;
          animation: crtFlicker 0.1s infinite alternate;
        }

        @keyframes crtFlicker {
          0% { opacity: 0.96; }
          100% { opacity: 1; text-shadow: 0 0 12px #00ff66; }
        }

        .crt-header-tag {
          font-size: 0.8rem;
          color: #4ade80;
          letter-spacing: 2px;
          margin-bottom: 14px;
          opacity: 0.85;
        }

        .crt-alert-title {
          font-size: 1.5rem;
          font-weight: bold;
          letter-spacing: 3px;
          color: #00ff66;
          text-shadow: 0 0 18px #00ff66;
          margin-bottom: 20px;
          animation: titlePulse 0.6s infinite alternate;
        }

        @keyframes titlePulse {
          0% { transform: scale(0.99); }
          100% { transform: scale(1.01); text-shadow: 0 0 25px #00ff66; }
        }

        .crt-log-line {
          font-size: 0.95rem;
          color: #a7f3d0;
          letter-spacing: 1px;
          line-height: 1.6;
          text-align: left;
          margin: 6px 0;
          font-family: "Courier New", Courier, monospace;
        }

        .crt-progress-container {
          width: 100%;
          height: 14px;
          background: #06180b;
          border: 1px solid #00ff66;
          margin: 24px 0 12px;
          position: relative;
          overflow: hidden;
          box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.8);
        }

        .crt-progress-fill {
          width: 0%;
          height: 100%;
          background: #00ff66;
          box-shadow: 0 0 12px #00ff66;
          transition: width 0.05s linear;
        }

        .crt-footer-status {
          font-size: 0.9rem;
          color: #00ff66;
          font-weight: bold;
          letter-spacing: 2px;
        }
      </style>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });

    // Simular llenado de la barra retro durante 2.8 segundos
    const progressBar = overlay.querySelector('#crt-progress-bar');
    const statusText = overlay.querySelector('#crt-status-text');
    const DURATION = 2800; // 2.8 segundos de inmersión retro
    const startTime = performance.now();

    const progressTimer = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(Math.floor((elapsed / DURATION) * 100), 100);

      if (progressBar) progressBar.style.width = `${pct}%`;
      if (statusText) {
        if (pct < 35) {
          statusText.textContent = `SINCRONIZANDO FRECUENCIA 45.0 Hz [ ${pct}% ]`;
        } else if (pct < 75) {
          statusText.textContent = `DESENCRIPTANDO MATRIZ DE DEVA [ ${pct}% ]`;
        } else if (pct < 100) {
          statusText.textContent = `CONEXIÓN ESTABLECIDA // ABRIENDO NODO [ ${pct}% ]`;
        } else {
          statusText.textContent = `BIENVENIDO A LA RESISTENCIA [ 100% ]`;
        }
      }

      if (pct >= 100) {
        clearInterval(progressTimer);
        setTimeout(() => {
          window.location.href = `${DEVA_URL}?ref=${refSource}`;
        }, 200);
      }
    }, 40);
  }

  // --- 4. DETECCIÓN DE SECUENCIA DE TECLAS ---
  let keyBuffer = '';
  let keyTimeout = null;

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
    }, 2400);

    // Verificar disparadores clave ('DEVA' o 'VIVE')
    if (keyBuffer.endsWith('DEVA') || keyBuffer.endsWith('VIVE')) {
      keyBuffer = '';
      triggerDevaTransition('keystroke');
    }
  }, { passive: true });
})();

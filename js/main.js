/**
 * main.js — Lógica Interactiva, Partículas Stardust y Microinteracciones 3D
 * SAPIENSIA CLAN Portal Oficial
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. INICIALIZAR CANVAS DE STARDUST & CONSTELLATIONS
  initStardustCanvas();

  // 2. INICIALIZAR SPOTLIGHT CARDS
  initSpotlightCards();

  // 3. INICIALIZAR 3D TILT EN CARDS
  initTiltCards();

  // 4. BOTÓN COPIAR BINANCE ID
  initCopyBinance();

  // 5. MICROINTERACCIONES DE AUDIO PROCEDURAL (HERTZ 0 KB)
  initAudioInteractions();
});

/* ==========================================================================
   1. CANVAS DE PARTÍCULAS INTERACTIVAS (STARDUST & CONSTELLATIONS)
   ========================================================================== */
function initStardustCanvas() {
  const canvas = document.getElementById('stardust-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const count = Math.min(Math.floor((width * height) / 16000), 85);
  const maxDist = 120;
  const maxDistSq = maxDist * maxDist;
  const mouse = { x: -9999, y: -9999, radius: 140, radiusSq: 140 * 140 };

  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      size: Math.random() * 1.8 + 0.6,
      baseAlpha: Math.random() * 0.45 + 0.25,
      color: Math.random() > 0.28 ? '245, 158, 11' : '56, 189, 248' // Ámbar y Cian
    });
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  function render() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    const pLen = particles.length;
    for (let i = 0; i < pLen; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Reactividad vectorial al cursor
      const mdx = p.x - mouse.x;
      const mdy = p.y - mouse.y;
      const mDistSq = mdx * mdx + mdy * mdy;

      if (mDistSq < mouse.radiusSq && mDistSq > 0) {
        const force = (1 - Math.sqrt(mDistSq) / mouse.radius) * 2;
        p.x += (mdx / Math.sqrt(mDistSq)) * force * 2.5;
        p.y += (mdy / Math.sqrt(mDistSq)) * force * 2.5;
      }

      // Dibujar punto
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.baseAlpha})`;
      ctx.fill();

      // Constelaciones conectivas
      for (let j = i + 1; j < pLen; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          const alpha = (1 - distSq / maxDistSq) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

/* ==========================================================================
   2. SPOTLIGHT REACTIVO (CURSOR TRACKING)
   ========================================================================== */
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

/* ==========================================================================
   3. 3D TILT CARDS (MICROINTERACCIONES CINEMÁTICAS)
   ========================================================================== */
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

/* ==========================================================================
   4. BOTÓN COPIAR BINANCE ID
   ========================================================================== */
function initCopyBinance() {
  const btn = document.getElementById('btn-copiar-id');
  const copyText = document.getElementById('copy-text');
  const copyIcon = document.getElementById('copy-icon');

  if (!btn) return;

  btn.addEventListener('click', async () => {
    const id = '35863102';
    try {
      await navigator.clipboard.writeText(id);
      if (window.clanAudio) window.clanAudio.playAmberSuccess();
      copyIcon.innerHTML = '<img src="assets/emojis/emoji_simbolo_check.png" class="pixel-icon-inline" alt="Check">';
      copyText.textContent = '¡Binance ID Copiado!';
      btn.style.borderColor = '#10b981';
      btn.style.color = '#10b981';

      setTimeout(() => {
        copyIcon.innerHTML = '<img src="assets/emojis/emoji_pergamino.png" class="pixel-icon-inline" alt="Copiar">';
        copyText.textContent = `Copiar Binance ID (${id})`;
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 2500);
    } catch (err) {
      prompt('Copia manualmente el Binance ID:', id);
    }
  });
}

/* ==========================================================================
   5. MICRO-INTERACCIONES SONORAS PROCEDURALES (HERTZ 0 KB)
   ========================================================================== */
function initAudioInteractions() {
  // Inicialización de audio en el primer gesto de usuario
  const unlockAudio = () => {
    if (window.clanAudio) {
      window.clanAudio.ensureContext();
    }
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });

  // Botón Mute / Unmute en Navbar
  const soundBtn = document.getElementById('btn-sound-toggle');
  const soundLabel = document.getElementById('sound-toggle-label');

  if (soundBtn) {
    // Sincronizar estado inicial
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

  // Hover interactivo suave en botones y cards principales
  const hoverTargets = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-item, .card-glass, .clan-card, .obra-card, .btn-sound-glass, .btn-email-direct');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (window.clanAudio) window.clanAudio.playHover();
    }, { passive: true });
  });

  // Click háptico sutil en elementos interactivos
  const clickTargets = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-item, .btn-sound-glass, .btn-email-direct');
  clickTargets.forEach(el => {
    el.addEventListener('click', () => {
      if (window.clanAudio) window.clanAudio.playClick();
    }, { passive: true });
  });
}

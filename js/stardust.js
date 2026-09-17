/**
 * ==========================================================================
 * SAPIENSIA CLAN — MÓDULO JS: STARDUST & CONSTELLATIONS (CANVAS 2D)
 * Archivo: js/stardust.js
 * Descripción: Sistema de partículas interactivas ligeras a 60 FPS sin dependencias.
 * Autor: Nexo (Ingeniero Principal)
 * ==========================================================================
 */

function initStardustCanvas() {
  const canvas = document.getElementById('stardust-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Calibración para pantallas Retina / High-DPI
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  // Densidad de partículas adaptativa según resolución
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
      color: Math.random() > 0.28 ? '245, 158, 11' : '56, 189, 248' // Ámbar Sapiensia y Cian Proiectio
    });
  }

  // Redimensionamiento inteligente de ventana
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize, { passive: true });
  
  // Seguimiento de posición del cursor
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Bucle de renderizado a 60 FPS
  function render() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    const pLen = particles.length;
    for (let i = 0; i < pLen; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      // Envoltura de bordes (Toroidal wrap)
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Física de repulsión suave al acercar el cursor
      const mdx = p.x - mouse.x;
      const mdy = p.y - mouse.y;
      const mDistSq = mdx * mdx + mdy * mdy;

      if (mDistSq < mouse.radiusSq && mDistSq > 0) {
        const force = (1 - Math.sqrt(mDistSq) / mouse.radius) * 2;
        p.x += (mdx / Math.sqrt(mDistSq)) * force * 2.5;
        p.y += (mdy / Math.sqrt(mDistSq)) * force * 2.5;
      }

      // Dibujar partícula estelar
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.baseAlpha})`;
      ctx.fill();

      // Conexiones de constelación entre partículas cercanas
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
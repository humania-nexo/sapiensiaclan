/**
 * ==========================================================================
 * SAPIENSIA CLAN — MOTOR DE ASCUAS DE FORJA & VIENTO REACTIVO (SAPIENS + IA)
 * Archivo: js/forja_embers.js
 * Descripción: Sistema de ascuas doradas flotantes y corriente de viento reactiva
 *              al cursor. Cero líneas, cero saturación, 100% fluido.
 * Performance: 60-120 FPS fijos • O(N) ultra ligero • 0 KB dependencias
 * Autor: Nexo (Ingeniero Principal) | SAPIENSIA Clan
 * ==========================================================================
 */

function initForjaEmbers() {
  const canvas = document.getElementById('stardust-canvas');
  if (!canvas || canvas._forjaInitialized) return;
  canvas._forjaInitialized = true;

  const ctx = canvas.getContext('2d', { alpha: true });
  let width = 0;
  let height = 0;
  let dpr = 1;
  let animId = null;
  let isTabVisible = true;

  // Estado del Cursor / Viento
  const mouse = {
    x: -9999,
    y: -9999,
    vx: 0,
    vy: 0,
    prevX: -9999,
    prevY: -9999,
    radius: 140,
    radiusSq: 140 * 140,
    active: false
  };

  const embers = [];
  const MAX_EMBERS = 50;

  class ForgeEmber {
    constructor(initial = false) {
      this.reset(initial);
    }

    reset(initial = false) {
      this.x = Math.random() * (width || window.innerWidth);
      this.y = initial ? Math.random() * (height || window.innerHeight) : (height || window.innerHeight) + Math.random() * 20;
      
      // Velocidad de flotación vertical suave
      this.baseVy = -(Math.random() * 0.65 + 0.35); // Flota suavemente hacia arriba
      this.baseVx = (Math.random() - 0.5) * 0.25;    // Balanceo lateral
      this.vx = this.baseVx;
      this.vy = this.baseVy;

      // Dimensiones y pulso de brillo
      this.size = Math.random() * 2.2 + 0.9;
      this.baseAlpha = Math.random() * 0.45 + 0.25;
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.02 + Math.random() * 0.025;
      this.swayAngle = Math.random() * Math.PI * 2;
      this.swaySpeed = 0.015 + Math.random() * 0.015;

      // Paleta Cálida Sapiensia: Ámbar Forja (70%), Oro Puro (20%), Destello Cian (10%)
      const rand = Math.random();
      if (rand < 0.70) {
        this.hue = 40 + Math.random() * 6; // Ámbar cálido (38 - 46)
        this.sat = 95;
        this.lum = 60;
      } else if (rand < 0.90) {
        this.hue = 48 + Math.random() * 6; // Oro claro (48 - 54)
        this.sat = 100;
        this.lum = 72;
      } else {
        this.hue = 195; // Cian IA sutil
        this.sat = 90;
        this.lum = 70;
      }
    }

    update() {
      this.pulse += this.pulseSpeed;
      this.swayAngle += this.swaySpeed;

      // Movimiento natural ondulante (convección)
      const swayForce = Math.sin(this.swayAngle) * 0.15;

      // Interacción con el cursor (Corriente de viento física suave)
      if (mouse.active && mouse.x > 0 && mouse.y > 0) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < mouse.radiusSq && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / mouse.radius) * 1.8;
          const normX = dx / dist;
          const normY = dy / dist;

          // Empuje radial de viento + arrastre por la velocidad del mouse
          this.vx += normX * force * 0.6 + mouse.vx * force * 0.15;
          this.vy += normY * force * 0.6 + mouse.vy * force * 0.15;
        }
      }

      // Fricción y retorno suave a la velocidad natural de flotación
      this.vx = this.vx * 0.95 + (this.baseVx + swayForce) * 0.05;
      this.vy = this.vy * 0.95 + this.baseVy * 0.05;

      this.x += this.vx;
      this.y += this.vy;

      // Reaparecer al salir por arriba o por los laterales
      if (this.y < -20) {
        this.reset(false);
      }
      if (this.x < -20) this.x = width + 10;
      if (this.x > width + 20) this.x = -10;
    }

    draw() {
      // Brillo dinámico con respiración senoidal
      let dynamicAlpha = this.baseAlpha + Math.sin(this.pulse) * 0.12;

      // Si está cerca del mouse, se ilumina suavemente
      if (mouse.active && mouse.x > 0) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < mouse.radiusSq) {
          const boost = (1 - Math.sqrt(distSq) / mouse.radius) * 0.35;
          dynamicAlpha = Math.min(dynamicAlpha + boost, 0.95);
        }
      }

      // Halo difuso suave
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 2.8, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.lum}%, ${dynamicAlpha * 0.25})`;
      ctx.fill();

      // Núcleo brillante
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${Math.min(this.lum + 18, 98)}%, ${dynamicAlpha})`;
      ctx.fill();
    }
  }

  function initEmbers() {
    embers.length = 0;
    const count = Math.min(Math.floor((width * height) / 22000), MAX_EMBERS) || 35;
    for (let i = 0; i < count; i++) {
      embers.push(new ForgeEmber(true));
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    if (embers.length === 0) {
      initEmbers();
    }
  }

  function loop() {
    if (!isTabVisible) return;

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    // Calcular velocidad del cursor para la física del viento
    if (mouse.active && mouse.prevX > 0) {
      mouse.vx = (mouse.x - mouse.prevX) * 0.4;
      mouse.vy = (mouse.y - mouse.prevY) * 0.4;
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
    } else {
      mouse.vx = 0;
      mouse.vy = 0;
    }

    // Halo muy sutil en la posición del cursor (Aura de presencia cálida)
    if (mouse.active && mouse.x > 0 && mouse.y > 0) {
      const aura = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius * 0.9);
      aura.addColorStop(0, 'rgba(245, 158, 11, 0.06)');
      aura.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.radius * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // Actualizar y dibujar ascuas en una sola pasada O(N) ultra ligera
    const len = embers.length;
    for (let i = 0; i < len; i++) {
      embers[i].update();
      embers[i].draw();
    }

    ctx.globalCompositeOperation = 'source-over';
    animId = requestAnimationFrame(loop);
  }

  // --- EVENTOS INTERACTIVOS ---
  function updatePointer(x, y) {
    if (mouse.prevX < 0) {
      mouse.prevX = x;
      mouse.prevY = y;
    }
    mouse.x = x;
    mouse.y = y;
    mouse.active = true;
  }

  window.addEventListener('mousemove', (e) => {
    updatePointer(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
    mouse.prevX = -9999;
    mouse.prevY = -9999;
  });

  window.addEventListener('touchend', () => {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
    mouse.prevX = -9999;
    mouse.prevY = -9999;
  });

  // Pausa inteligente al cambiar de pestaña (0% CPU)
  document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden;
    if (isTabVisible) {
      if (!animId) loop();
    } else {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }
  });

  window.addEventListener('resize', resize, { passive: true });

  resize();
  loop();
}

// Exportaciones globales y auto-inicialización
window.initForjaEmbers = initForjaEmbers;
window.initStardustCanvas = initForjaEmbers;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initForjaEmbers);
} else {
  initForjaEmbers();
}

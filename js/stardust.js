/**
 * ==========================================================================
 * SAPIENSIA CLAN — MOTOR DE POLVO ALQUÍMICO & MALLA GRAVITATORIA (SAPIENS + IA)
 * Archivo: js/stardust.js
 * Descripción: Sistema de partículas de alta reactividad, órbitas gravitacionales,
 *              filamentos de constelación directa al cursor y ondas de pulso.
 * Performance: 60-120 FPS • 0 KB dependencias • Vanilla Canvas 2D • GPU Friendly
 * Autor: Nexo (Ingeniero Principal) | SAPIENSIA Clan
 * ==========================================================================
 */

function initStardustCanvas() {
  const canvas = document.getElementById('stardust-canvas');
  if (!canvas || canvas._initialized) return;
  canvas._initialized = true;

  const ctx = canvas.getContext('2d', { alpha: true });
  let width = 0;
  let height = 0;
  let dpr = 1;
  let animId = null;
  let isTabVisible = true;

  // Estado reactivo del Cursor / Puntero
  const mouse = {
    x: -9999,
    y: -9999,
    targetX: -9999,
    targetY: -9999,
    prevX: -9999,
    prevY: -9999,
    speed: 0,
    radius: 190,
    active: false,
    lastSpark: 0
  };

  // Colecciones de elementos
  const particles = [];
  const embers = [];
  const shockwaves = [];

  const MAX_CONNECTIONS_DIST = 125;
  const MAX_CONNECTIONS_DIST_SQ = MAX_CONNECTIONS_DIST * MAX_CONNECTIONS_DIST;

  // Clase para las partículas estelares principales
  class StardustParticle {
    constructor(initial = true) {
      this.reset(initial);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * width : (Math.random() > 0.5 ? 0 : width);
      this.y = Math.random() * height;
      this.baseVx = (Math.random() - 0.5) * 0.45;
      this.baseVy = (Math.random() - 0.5) * 0.45;
      this.vx = this.baseVx;
      this.vy = this.baseVy;
      this.radius = Math.random() * 2.2 + 0.8;
      this.baseAlpha = Math.random() * 0.45 + 0.3;
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.02 + Math.random() * 0.025;
      
      // Paleta Sapiensia: Ámbar Forja (75%), Oro Real (15%), Cian IA (10%)
      const rand = Math.random();
      if (rand < 0.65) {
        this.hue = 42; // Ámbar Forja (#f59e0b)
        this.sat = 95;
        this.lum = 60;
      } else if (rand < 0.85) {
        this.hue = 36; // Oro Cálido (#fbbf24)
        this.sat = 100;
        this.lum = 70;
      } else {
        this.hue = 195; // Cian IA / Sapiens (#38bdf8)
        this.sat = 95;
        this.lum = 65;
      }
    }

    update() {
      this.pulse += this.pulseSpeed;

      // 1. Interacción con el cursor (Vórtice Orbital Cuántico & Gravitación Suave)
      if (mouse.active && mouse.x > 0 && mouse.y > 0) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distSq = dx * dx + dy * dy;
        const radiusSq = mouse.radius * mouse.radius;

        if (distSq < radiusSq && distSq > 4) {
          const dist = Math.sqrt(distSq);
          const normX = dx / dist;
          const normY = dy / dist;
          const proximity = 1 - dist / mouse.radius;

          // Fuerza de atracción magnética suave
          const attractForce = proximity * 0.85;
          this.vx += normX * attractForce * 0.55;
          this.vy += normY * attractForce * 0.55;

          // Fuerza orbital tangencial (Remolino cuántico alrededor del cursor)
          const tangentX = -normY;
          const tangentY = normX;
          const spinForce = proximity * 0.65;
          this.vx += tangentX * spinForce;
          this.vy += tangentY * spinForce;
        }
      }

      // 2. Interacción con ondas de pulso por click (Shockwaves)
      for (let s = 0; s < shockwaves.length; s++) {
        const sw = shockwaves[s];
        const sdx = this.x - sw.x;
        const sdy = this.y - sw.y;
        const sDist = Math.sqrt(sdx * sdx + sdy * sdy);
        const waveDist = Math.abs(sDist - sw.currentRadius);

        if (waveDist < sw.thickness) {
          const push = (1 - waveDist / sw.thickness) * sw.force * (sw.life / sw.maxLife);
          if (sDist > 0) {
            this.vx += (sdx / sDist) * push * 3.5;
            this.vy += (sdy / sDist) * push * 3.5;
          }
        }
      }

      // Amortiguación hacia la velocidad base (Fricción inercial suave)
      this.vx = this.vx * 0.94 + this.baseVx * 0.06;
      this.vy = this.vy * 0.94 + this.baseVy * 0.06;

      this.x += this.vx;
      this.y += this.vy;

      // Envoltura toroidal suave de bordes
      if (this.x < -10) this.x = width + 10;
      if (this.x > width + 10) this.x = -10;
      if (this.y < -10) this.y = height + 10;
      if (this.y > height + 10) this.y = -10;
    }

    draw() {
      const dynamicAlpha = Math.min(this.baseAlpha + Math.sin(this.pulse) * 0.15, 1);
      
      // Halo brillante
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 2.6, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.lum}%, ${dynamicAlpha * 0.28})`;
      ctx.fill();

      // Núcleo definido
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${Math.min(this.lum + 20, 95)}%, ${dynamicAlpha})`;
      ctx.fill();
    }
  }

  // Clase para chispas incandescentes de oro al mover el cursor
  class EmberSpark {
    constructor(x, y, speedFactor) {
      this.x = x + (Math.random() - 0.5) * 12;
      this.y = y + (Math.random() - 0.5) * 12;
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 2.2 + 0.6) * Math.min(speedFactor * 0.15 + 0.8, 2.5);
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - (Math.random() * 0.6 + 0.2); // Flotación ascendente
      this.life = 1.0;
      this.decay = 0.022 + Math.random() * 0.02;
      this.size = Math.random() * 2.4 + 0.8;
      this.hue = Math.random() > 0.2 ? 40 : 195; // 80% Oro forja, 20% Cian
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.96;
      this.vy *= 0.96;
      this.life -= this.decay;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${this.life * 0.85})`;
      ctx.fill();
    }
  }

  // Clase para ondas concéntricas de pulso cuántico al hacer click
  class Shockwave {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.currentRadius = 0;
      this.maxRadius = Math.min(width, height) * 0.45;
      this.speed = 9.5;
      this.thickness = 35;
      this.force = 1.8;
      this.life = 1.0;
      this.maxLife = 1.0;
      this.decay = 0.025;
    }

    update() {
      this.currentRadius += this.speed;
      this.life -= this.decay;
    }

    draw() {
      if (this.life <= 0) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(245, 158, 11, ${this.life * 0.35})`;
      ctx.lineWidth = 2.5 * this.life;
      ctx.stroke();

      // Halo interno cian
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(this.currentRadius - 10, 0), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${this.life * 0.2})`;
      ctx.lineWidth = 1.2 * this.life;
      ctx.stroke();
    }
  }

  // Inicialización de partículas
  function initParticles() {
    particles.length = 0;
    const count = Math.min(Math.floor((width * height) / 14000), 95);
    for (let i = 0; i < count; i++) {
      particles.push(new StardustParticle(true));
    }
  }

  // Redimensionamiento de canvas
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    if (particles.length === 0) {
      initParticles();
    }
  }

  // Trazado de filamentos y constelaciones
  function drawFilaments() {
    const pLen = particles.length;

    // 1. Conexiones entre partículas cercanas
    for (let i = 0; i < pLen; i++) {
      const p1 = particles[i];
      for (let j = i + 1; j < pLen; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < MAX_CONNECTIONS_DIST_SQ) {
          const alpha = (1 - distSq / MAX_CONNECTIONS_DIST_SQ) * 0.26;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }

      // 2. Conexión de luz directa al Cursor (Pluma Alquímica / Constelación Activa)
      if (mouse.active && mouse.x > 0 && mouse.y > 0) {
        const mdx = mouse.x - p1.x;
        const mdy = mouse.y - p1.y;
        const mDistSq = mdx * mdx + mdy * mdy;
        const mRadiusSq = mouse.radius * mouse.radius;

        if (mDistSq < mRadiusSq) {
          const mDist = Math.sqrt(mDistSq);
          const alpha = (1 - mDist / mouse.radius) * 0.6;
          
          const grad = ctx.createLinearGradient(mouse.x, mouse.y, p1.x, p1.y);
          grad.addColorStop(0, `rgba(251, 191, 36, ${alpha * 1.2})`);
          grad.addColorStop(1, `rgba(56, 189, 248, ${alpha * 0.4})`);

          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.3;
          ctx.stroke();
        }
      }
    }
  }

  // Bucle de renderizado a 60-120 FPS
  function loop() {
    if (!isTabVisible) return;

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    // Suavizado cinético del cursor (Lerp)
    if (mouse.active && mouse.targetX > 0) {
      const dx = mouse.targetX - mouse.x;
      const dy = mouse.targetY - mouse.y;
      mouse.speed = Math.sqrt(dx * dx + dy * dy);
      mouse.x += dx * 0.25;
      mouse.y += dy * 0.25;
    }

    // 1. Resplandor radial de presencia del cursor
    if (mouse.active && mouse.x > 0 && mouse.y > 0) {
      const radGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
      radGrad.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
      radGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.04)');
      radGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Dibujar filamentos y conexiones
    drawFilaments();

    // 3. Actualizar y dibujar partículas principales
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    // 4. Actualizar y dibujar chispas de oro (Embers)
    for (let i = embers.length - 1; i >= 0; i--) {
      const ember = embers[i];
      ember.update();
      ember.draw();
      if (ember.life <= 0) {
        embers.splice(i, 1);
      }
    }

    // 5. Actualizar y dibujar ondas de choque (Shockwaves)
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.update();
      sw.draw();
      if (sw.life <= 0) {
        shockwaves.splice(i, 1);
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    animId = requestAnimationFrame(loop);
  }

  // --- CONTROLADORES DE EVENTOS ---
  function onPointerMove(clientX, clientY) {
    if (mouse.x < 0) {
      mouse.x = clientX;
      mouse.y = clientY;
    }
    mouse.targetX = clientX;
    mouse.targetY = clientY;
    mouse.active = true;

    // Emisión orgánica de chispas según velocidad de movimiento
    const now = performance.now();
    if (now - mouse.lastSpark > 28 && embers.length < 40) {
      embers.push(new EmberSpark(clientX, clientY, mouse.speed));
      mouse.lastSpark = now;
    }
  }

  window.addEventListener('mousemove', (e) => {
    onPointerMove(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      // Disparar onda suave al tocar
      if (shockwaves.length < 3) {
        shockwaves.push(new Shockwave(e.touches[0].clientX, e.touches[0].clientY));
      }
    }
  }, { passive: true });

  window.addEventListener('click', (e) => {
    if (shockwaves.length < 3) {
      shockwaves.push(new Shockwave(e.clientX, e.clientY));
      // Estallido de chispas en click
      for (let i = 0; i < 8; i++) {
        embers.push(new EmberSpark(e.clientX, e.clientY, 3.5));
      }
    }
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.targetX = -9999;
    mouse.targetY = -9999;
  });

  window.addEventListener('touchend', () => {
    mouse.active = false;
    mouse.targetX = -9999;
    mouse.targetY = -9999;
  });

  // Pausa automática cuando la pestaña está oculta
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

  // Iniciar
  resize();
  loop();
}

// Exportación global y auto-inicialización segura
window.initStardustCanvas = initStardustCanvas;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStardustCanvas);
} else {
  initStardustCanvas();
}
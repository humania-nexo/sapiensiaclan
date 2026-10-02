/**
 * audio_ui.js — Motor de Micro-Feedback Sonoro Procedural (0 KB / Web Audio API)
 * SAPIENSIA CLAN Portal Oficial
 * Diseño y Síntesis: Hertz (Sonidista del Yermo)
 */

class ClanAudioFeedback {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.45, this.ctx.currentTime); // Master Headroom calibrado y claro
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;

      // Recuperar preferencia de muteo
      const savedMute = localStorage.getItem('sapiensia_audio_muted');
      if (savedMute === 'true') {
        this.isMuted = true;
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    } catch (e) {
      console.warn('Web Audio no disponible:', e);
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    localStorage.setItem('sapiensia_audio_muted', this.isMuted ? 'true' : 'false');
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);
    }
    if (!this.isMuted) {
      this.playChime(660, 0.05, 'sine');
    }
    return this.isMuted;
  }

  // 1. Hover Táctil: Micro-pulso de cristal amortiguado
  playHover() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.025);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.04);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  // 2. Click Resonante: Pulso cálido de madera/vidrio orgánico
  playClick() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.045);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.06);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  // 3. Acorde Ámbar de Victoria / Éxito (Triada C-E-G dorada para Copiado / Donación)
  playAmberSuccess() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const t = this.ctx.currentTime;

    notes.forEach((freq, index) => {
      const startTime = t + (index * 0.038);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.32);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  }

  // 4. Chime genérico
  playChime(freq = 587.33, duration = 0.12, type = 'sine') {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  // 5. Metamorfosis a Modo Arcade (Ignición 8-bit, De-gauss CRT & Chiptune Fanfare)
  playThemeArcade() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Fase A: Ruido Blanco CRT Degauss / Estática (0ms - 60ms)
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.06);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(2400, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(360, t + 0.06);
      noiseFilter.Q.setValueAtTime(2.5, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(t);
      noise.stop(t + 0.065);
    } catch (e) {
      // Fallback si createBuffer falla
    }

    // Fase B: Laser Warp / Pitch Drop (15ms - 90ms)
    const warpOsc = this.ctx.createOscillator();
    const warpGain = this.ctx.createGain();
    warpOsc.type = 'sawtooth';
    warpOsc.frequency.setValueAtTime(980, t + 0.015);
    warpOsc.frequency.exponentialRampToValueAtTime(120, t + 0.09);
    warpGain.gain.setValueAtTime(0.28, t + 0.015);
    warpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.095);
    warpOsc.connect(warpGain);
    warpGain.connect(this.masterGain);
    warpOsc.start(t + 0.015);
    warpOsc.stop(t + 0.1);

    // Fase C: Arpegio Neón 8-bit Ascendente (80ms - 320ms)
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      const startTime = t + 0.075 + (idx * 0.038);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.26, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.095);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.1);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  }

  // 6. Metamorfosis a Modo Antropo (Restauración Orgánica, Swell Senoidal & Campanas Armónicas)
  playThemeAntropo() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Fase A: Swell Senoidal Armónico Ascendente (0ms - 130ms)
    const swellOsc = this.ctx.createOscillator();
    const swellGain = this.ctx.createGain();
    swellOsc.type = 'sine';
    swellOsc.frequency.setValueAtTime(240, t);
    swellOsc.frequency.exponentialRampToValueAtTime(920, t + 0.13);
    swellGain.gain.setValueAtTime(0.06, t);
    swellGain.gain.linearRampToValueAtTime(0.32, t + 0.08);
    swellGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    swellOsc.connect(swellGain);
    swellGain.connect(this.masterGain);
    swellOsc.start(t);
    swellOsc.stop(t + 0.25);

    // Fase B: Campana Armónica Cristalina de Mármol (60ms - 440ms)
    const bellNotes = [587.33, 880.00, 1479.98]; // D5, A5, F#6 (Acorde luminoso Re Mayor)
    bellNotes.forEach((freq, idx) => {
      const bellStartTime = t + 0.06 + (idx * 0.025);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, bellStartTime);

      gain.gain.setValueAtTime(0.30, bellStartTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, bellStartTime + 0.38);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(bellStartTime);
      osc.stop(bellStartTime + 0.4);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  }
}

// Instancia global
window.clanAudio = new ClanAudioFeedback();

/**
 * ==========================================================================
 * SAPIENSIA CLAN — CONTROLADOR DEL REPRODUCTOR WEB DE AUDIOLIBROS (V2.0)
 * Archivo: js/audio_player.js
 * Descripción: Audio HTML5, streaming, scrubber, capítulos y persistencia.
 * ==========================================================================
 */

(function () {
  'use strict';

  // 1. Obtener parámetro de URL (?obra=poeta, ?obra=vela o ?obra=euthanasys)
  const urlParams = new URLSearchParams(window.location.search);
  let obraKey = urlParams.get('obra') || 'poeta';
  if (!['poeta', 'vela', 'euthanasys'].includes(obraKey)) {
    obraKey = 'poeta';
  }

  // 2. Referencias al DOM
  const dom = {
    tabPoeta: document.getElementById('tab-poeta'),
    tabVela: document.getElementById('tab-vela'),
    tabEuthanasys: document.getElementById('tab-euthanasys'),
    btnSwitchReader: document.getElementById('btn-switch-reader'),
    
    // Metadatos
    coverImg: document.getElementById('audio-cover-img'),
    bookTitle: document.getElementById('audio-book-title'),
    bookSubtitle: document.getElementById('audio-book-subtitle'),
    bookAuthor: document.getElementById('audio-book-author'),
    metaDuration: document.getElementById('meta-duration'),
    metaSize: document.getElementById('meta-size'),
    activeChapterName: document.getElementById('audio-active-chapter-name'),
    btnDownload: document.getElementById('btn-download-mp3'),
    
    // Controles de audio
    btnPlay: document.getElementById('btn-audio-play'),
    playIcon: document.getElementById('play-icon'),
    playText: document.getElementById('play-text'),
    btnRewind: document.getElementById('btn-audio-rewind'),
    btnForward: document.getElementById('btn-audio-forward'),
    scrubberTrack: document.getElementById('audio-scrubber-track'),
    scrubberFill: document.getElementById('audio-scrubber-fill'),
    timeCurrent: document.getElementById('audio-time-current'),
    timeDuration: document.getElementById('audio-time-duration'),
    speedButtons: document.querySelectorAll('.btn-speed'),
    volumeSlider: document.getElementById('volume-slider'),
    btnVolume: document.getElementById('btn-volume-toggle'),
    
    // Tracklist
    tracklistGrid: document.getElementById('tracklist-grid'),
    tracklistCount: document.getElementById('tracklist-count')
  };

  // 3. Instancia de Audio HTML5
  const audio = new Audio();
  audio.preload = 'metadata';

  let currentObra = null;
  let tracks = [];
  let isSeeking = false;
  let saveInterval = null;

  // Formatear segundos a HH:MM:SS
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00:00';
    const s = Math.floor(seconds);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }

  // Inicializar Reproductor con los datos de la obra
  function initPlayer() {
    if (!window.SAPIENSIA_OBRAS || !window.SAPIENSIA_OBRAS[obraKey]) {
      console.error('Obra no encontrada en catálogo:', obraKey);
      return;
    }

    currentObra = window.SAPIENSIA_OBRAS[obraKey];

    // Resaltar pestaña activa en navbar
    const allTabs = [
      { key: 'poeta', el: dom.tabPoeta },
      { key: 'vela', el: dom.tabVela },
      { key: 'euthanasys', el: dom.tabEuthanasys }
    ];
    allTabs.forEach(t => {
      if (t.el) {
        if (t.key === obraKey) {
          t.el.classList.add('active');
        } else {
          t.el.classList.remove('active');
        }
      }
    });

    // Botón para saltar al lector de texto
    if (dom.btnSwitchReader) {
      dom.btnSwitchReader.href = `reader.html?obra=${currentObra.id}`;
    }

    // Cargar metadatos
    const isArcade = document.documentElement.dataset.theme === 'arcade';
    if (dom.coverImg) {
      dom.coverImg.src = isArcade && currentObra.coverArcade ? currentObra.coverArcade : currentObra.cover;
      dom.coverImg.dataset.coverAntropo = currentObra.cover;
      dom.coverImg.dataset.coverArcade = currentObra.coverArcade || currentObra.cover;
    }
    if (dom.bookTitle) dom.bookTitle.textContent = currentObra.title;
    if (dom.bookSubtitle) dom.bookSubtitle.textContent = currentObra.subtitle || '';
    
    if (dom.bookAuthor) {
      dom.bookAuthor.innerHTML = `Voz & Narración: <span class="author-gold">${(currentObra.audio && currentObra.audio.narrator) || 'Anigami Agadni'}</span> • Coautoría con <img src="assets/clan/avatar_claudia_anim.gif" class="pixel-icon-inline" alt="Claudia"> Claudia`;
    }

    if (dom.metaDuration) dom.metaDuration.textContent = (currentObra.audio && currentObra.audio.duration) || '01:44:00';
    if (dom.metaSize) dom.metaSize.textContent = (currentObra.audio && currentObra.audio.size) || '35 MB';

    // Configurar botón de descarga directa
    if (dom.btnDownload && currentObra.audio && currentObra.audio.src) {
      dom.btnDownload.href = currentObra.audio.src;
      dom.btnDownload.setAttribute('download', currentObra.audio.downloadName || `${currentObra.title}_Audiolibro.mp3`);
    }

    // Configurar fuente de audio
    if (currentObra.audio && currentObra.audio.src) {
      audio.src = currentObra.audio.src;
    }

    // Configurar pistas / capítulos
    tracks = (currentObra.audio && currentObra.audio.tracks) || [];
    renderTracklist();

    // Restaurar posición de escucha guardada si existe
    restoreSavedPosition();

    // Intervalo de auto-guardado en LocalStorage
    if (saveInterval) clearInterval(saveInterval);
    saveInterval = setInterval(saveCurrentPosition, 3000);
  }

  // Renderizar la lista de capítulos
  function renderTracklist() {
    if (!dom.tracklistGrid) return;
    dom.tracklistGrid.innerHTML = '';

    if (dom.tracklistCount) {
      dom.tracklistCount.textContent = `${tracks.length} CAPÍTULOS`;
    }

    tracks.forEach((track, index) => {
      const card = document.createElement('div');
      card.className = `track-item-card ${index === 0 ? 'is-active' : ''}`;
      card.dataset.time = track.time;
      card.dataset.index = index;

      card.innerHTML = `
        <div class="track-card-left">
          <span class="track-index-num">${(index + 1).toString().padStart(2, '0')}</span>
          <span class="track-title-text">${track.title}</span>
        </div>
        <span class="track-time-stamp">${track.timeFormatted}</span>
      `;

      card.addEventListener('click', () => {
        jumpToTrack(track.time, track.title, index);
      });

      dom.tracklistGrid.appendChild(card);
    });

    if (tracks.length > 0 && dom.activeChapterName) {
      dom.activeChapterName.textContent = `1. ${tracks[0].title}`;
    }
  }

  // Saltar a un capítulo específico
  function jumpToTrack(timeInSeconds, trackTitle, index) {
    audio.currentTime = timeInSeconds;
    if (trackTitle && dom.activeChapterName) {
      dom.activeChapterName.textContent = `${(index + 1)}. ${trackTitle}`;
    }
    highlightTrackItem(index);
    audio.play().catch(e => console.log('Interacción requerida por el navegador:', e));
  }

  // Resaltar elemento visual de capítulo activo
  function highlightTrackItem(index) {
    if (!dom.tracklistGrid) return;
    const cards = dom.tracklistGrid.querySelectorAll('.track-item-card');
    cards.forEach((card, i) => {
      if (i === index) {
        card.classList.add('is-active');
      } else {
        card.classList.remove('is-active');
      }
    });
  }

  // Actualizar capítulo activo según el segundo de reproducción
  function updateActiveChapterByTime(curTime) {
    if (!tracks || tracks.length === 0) return;

    let activeIdx = 0;
    for (let i = 0; i < tracks.length; i++) {
      if (curTime >= tracks[i].time) {
        activeIdx = i;
      } else {
        break;
      }
    }

    highlightTrackItem(activeIdx);
    if (tracks[activeIdx] && dom.activeChapterName) {
      const expectedText = `${activeIdx + 1}. ${tracks[activeIdx].title}`;
      if (dom.activeChapterName.textContent !== expectedText) {
        dom.activeChapterName.textContent = expectedText;
      }
    }
  }

  // Alternar Reproducir / Pausar
  function togglePlay() {
    if (audio.paused) {
      audio.play().then(() => {
        updatePlayButtonUI(true);
      }).catch(err => {
        console.error('Error al reproducir:', err);
      });
    } else {
      audio.pause();
      updatePlayButtonUI(false);
    }
  }

  function updatePlayButtonUI(isPlaying) {
    if (!dom.playIcon || !dom.playText) return;
    if (isPlaying) {
      dom.playIcon.textContent = '⏸';
      dom.playText.textContent = 'PAUSAR';
      dom.btnPlay.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
    } else {
      dom.playIcon.textContent = '▶';
      dom.playText.textContent = 'REPRODUCIR';
      dom.btnPlay.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    }
  }

  // Eventos de Audio HTML5
  audio.addEventListener('play', () => updatePlayButtonUI(true));
  audio.addEventListener('pause', () => updatePlayButtonUI(false));

  audio.addEventListener('loadedmetadata', () => {
    if (dom.timeDuration) {
      dom.timeDuration.textContent = formatTime(audio.duration);
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (isSeeking) return;
    const cur = audio.currentTime;
    const dur = audio.duration || 1;
    const pct = (cur / dur) * 100;

    if (dom.scrubberFill) dom.scrubberFill.style.width = `${pct}%`;
    if (dom.timeCurrent) dom.timeCurrent.textContent = formatTime(cur);
    if (dom.timeDuration && !isNaN(audio.duration)) {
      dom.timeDuration.textContent = formatTime(audio.duration);
    }

    updateActiveChapterByTime(cur);
  });

  audio.addEventListener('ended', () => {
    updatePlayButtonUI(false);
    if (dom.scrubberFill) dom.scrubberFill.style.width = '0%';
    localStorage.removeItem(`sapiensia_audiopos_${obraKey}`);
  });

  // Conectar botón Play/Pausa
  if (dom.btnPlay) dom.btnPlay.addEventListener('click', togglePlay);

  // Botones de salto -15s y +15s
  if (dom.btnRewind) {
    dom.btnRewind.addEventListener('click', () => {
      audio.currentTime = Math.max(0, audio.currentTime - 15);
    });
  }

  if (dom.btnForward) {
    dom.btnForward.addEventListener('click', () => {
      audio.currentTime = Math.min(audio.duration || 999999, audio.currentTime + 15);
    });
  }

  // Scrubber interactivo
  function seekToPosition(e) {
    const rect = dom.scrubberTrack.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (audio.duration) {
      audio.currentTime = pos * audio.duration;
      if (dom.scrubberFill) dom.scrubberFill.style.width = `${pos * 100}%`;
      if (dom.timeCurrent) dom.timeCurrent.textContent = formatTime(audio.currentTime);
    }
  }

  if (dom.scrubberTrack) {
    dom.scrubberTrack.addEventListener('click', seekToPosition);

    dom.scrubberTrack.addEventListener('mousedown', (e) => {
      isSeeking = true;
      seekToPosition(e);

      const onMouseMove = (moveEvt) => {
        if (isSeeking) seekToPosition(moveEvt);
      };

      const onMouseUp = () => {
        isSeeking = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  // Selectores de Velocidad
  dom.speedButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.speedButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const speed = parseFloat(btn.dataset.speed);
      audio.playbackRate = speed;
    });
  });

  // Control de Volumen
  if (dom.volumeSlider) {
    dom.volumeSlider.addEventListener('input', (e) => {
      audio.volume = parseFloat(e.target.value);
      updateVolumeIcon();
    });
  }

  if (dom.btnVolume) {
    dom.btnVolume.addEventListener('click', () => {
      if (audio.volume > 0) {
        audio.dataset.prevVol = audio.volume;
        audio.volume = 0;
        dom.volumeSlider.value = 0;
      } else {
        const prev = parseFloat(audio.dataset.prevVol) || 1;
        audio.volume = prev;
        dom.volumeSlider.value = prev;
      }
      updateVolumeIcon();
    });
  }

  function updateVolumeIcon() {
    if (!dom.btnVolume) return;
    if (audio.volume === 0) {
      dom.btnVolume.textContent = '🔇';
    } else if (audio.volume < 0.5) {
      dom.btnVolume.textContent = '🔉';
    } else {
      dom.btnVolume.textContent = '🔊';
    }
  }

  // Guardar y restaurar posición en LocalStorage
  function saveCurrentPosition() {
    if (audio.currentTime > 5 && !audio.paused) {
      localStorage.setItem(`sapiensia_audiopos_${obraKey}`, audio.currentTime.toString());
    }
  }

  function restoreSavedPosition() {
    const saved = localStorage.getItem(`sapiensia_audiopos_${obraKey}`);
    if (saved) {
      const pos = parseFloat(saved);
      if (!isNaN(pos) && pos > 0) {
        audio.currentTime = pos;
        showResumeToast(pos);
      }
    }
  }

  function showResumeToast(seconds) {
    const toast = document.createElement('div');
    toast.className = 'resume-toast-popup';
    toast.innerHTML = `🎧 Reanudando audiolibro en <strong>${formatTime(seconds)}</strong>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  // Atajos de teclado
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      audio.currentTime = Math.max(0, audio.currentTime - 15);
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      audio.currentTime = Math.min(audio.duration || 999999, audio.currentTime + 15);
    } else if (e.code === 'KeyM') {
      e.preventDefault();
      if (dom.btnVolume) dom.btnVolume.click();
    }
  });

  // Guardar posición al cerrar la pestaña
  window.addEventListener('beforeunload', saveCurrentPosition);

  // Inicializar cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', initPlayer);
})();

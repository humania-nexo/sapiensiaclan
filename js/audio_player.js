/**
 * ==========================================================================
 * SAPIENSIA CLAN — REPRODUCTOR WEB DE AUDIOLIBROS INMERSIVO
 * Archivo: js/audio_player.js
 * Descripción: Control de audio HTML5, streaming, scrubber, capítulos y persistencia.
 * ==========================================================================
 */

(function () {
  'use strict';

  // Obtener parámetro de URL (?obra=poeta o ?obra=vela)
  const urlParams = new URLSearchParams(window.location.search);
  const currentObraId = urlParams.get('obra') || 'poeta';

  // Referencias al DOM
  const dom = {
    headerTitle: document.getElementById('audio-header-title'),
    btnSwitchReader: document.getElementById('btn-switch-reader'),
    containerReady: document.getElementById('audio-ready-container'),
    containerRecording: document.getElementById('audio-recording-container'),
    
    // Elementos del libro
    coverImg: document.getElementById('audio-cover-img'),
    bookTitle: document.getElementById('audio-book-title'),
    bookSubtitle: document.getElementById('audio-book-subtitle'),
    bookAuthor: document.getElementById('audio-book-author'),
    activeChapterName: document.getElementById('audio-active-chapter-name'),
    
    // Controles de audio
    btnPlay: document.getElementById('btn-audio-play'),
    btnRewind: document.getElementById('btn-audio-rewind'),
    btnForward: document.getElementById('btn-audio-forward'),
    scrubberTrack: document.getElementById('audio-scrubber-track'),
    scrubberFill: document.getElementById('audio-scrubber-fill'),
    timeCurrent: document.getElementById('audio-time-current'),
    timeDuration: document.getElementById('audio-time-duration'),
    speedButtons: document.querySelectorAll('.btn-speed'),
    volumeSlider: document.getElementById('volume-slider'),
    btnVolume: document.getElementById('btn-volume-toggle'),
    btnDownload: document.getElementById('btn-download-mp3'),
    
    // Tracklist
    tracklistGrid: document.getElementById('tracklist-grid'),
    tracklistCount: document.getElementById('tracklist-count'),
    
    // Pantalla de grabación (VELA)
    recordingCover: document.getElementById('recording-cover-img'),
    recordingTitle: document.getElementById('recording-title'),
    recordingQuote: document.getElementById('recording-quote'),
    recordingMsg: document.getElementById('recording-msg'),
    btnReadVela: document.getElementById('btn-read-vela')
  };

  // Instancia de audio
  const audio = new Audio();
  audio.preload = 'metadata';

  let currentObra = null;
  let tracks = [];
  let isSeeking = false;
  let saveInterval = null;

  // Formatear segundos a HH:MM:SS o MM:SS
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const s = Math.floor(seconds);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    
    const pad = (n) => (n < 10 ? '0' + n : n);
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  }

  // Inicialización de la obra
  function initObra() {
    if (!window.SAPIENSIA_OBRAS || !window.SAPIENSIA_OBRAS[currentObraId]) {
      console.error('Obra no encontrada:', currentObraId);
      return;
    }

    currentObra = window.SAPIENSIA_OBRAS[currentObraId];
    dom.headerTitle.innerHTML = `${currentObra.title} <span>AUDIOLIBRO OFICIAL</span>`;
    dom.btnSwitchReader.href = `reader.html?obra=${currentObra.id}`;

    // Si está en estado de grabación (como VELA)
    if (!currentObra.audio || currentObra.audio.status === 'recording') {
      showRecordingState();
      return;
    }

    // Si el audiolibro está listo (como Los Textos del Poeta)
    showReadyPlayer();
  }

  // Mostrar estado en grabación
  function showRecordingState() {
    dom.containerReady.style.display = 'none';
    dom.containerRecording.style.display = 'flex';

    if (dom.recordingCover && currentObra.cover) {
      dom.recordingCover.src = currentObra.cover;
    }
    if (dom.recordingTitle) dom.recordingTitle.textContent = currentObra.title;
    if (dom.recordingQuote && currentObra.audio && currentObra.audio.quote) {
      dom.recordingQuote.textContent = currentObra.audio.quote;
    }
    if (dom.recordingMsg && currentObra.audio && currentObra.audio.message) {
      dom.recordingMsg.textContent = currentObra.audio.message;
    }
    if (dom.btnReadVela) {
      dom.btnReadVela.href = `reader.html?obra=${currentObra.id}`;
    }
  }

  // Mostrar y configurar reproductor listo
  function showReadyPlayer() {
    dom.containerRecording.style.display = 'none';
    dom.containerReady.style.display = 'flex';

    dom.coverImg.src = currentObra.cover;
    dom.bookTitle.textContent = currentObra.title;
    dom.bookSubtitle.textContent = currentObra.subtitle || '';
    dom.bookAuthor.innerHTML = `Voz & Narración: <span class="audio-author-highlight">${currentObra.audio.narrator || 'Anigami Agadni'}</span> • Coautoría con <img src="assets/clan/avatar_claudia_anim.gif" class="pixel-icon-inline" alt="Claudia" style="vertical-align: -3px; width: 18px; height: 18px; border-radius: 3px;"> Claudia`;
    
    // Descarga directa
    if (dom.btnDownload && currentObra.audio.src) {
      dom.btnDownload.href = currentObra.audio.src;
      dom.btnDownload.setAttribute('download', currentObra.audio.downloadName || 'Audiolibro.mp3');
    }

    // Configurar audio source
    audio.src = currentObra.audio.src;

    // Configurar pistas de capítulos
    tracks = currentObra.audio.tracks || [];
    renderTracklist();

    // Restaurar posición guardada si existe
    restoreSavedPosition();

    // Iniciar intervalo de auto-guardado
    if (saveInterval) clearInterval(saveInterval);
    saveInterval = setInterval(saveCurrentPosition, 3000);
  }

  // Renderizar índice de capítulos
  function renderTracklist() {
    if (!dom.tracklistGrid) return;
    dom.tracklistGrid.innerHTML = '';
    
    if (dom.tracklistCount) {
      dom.tracklistCount.textContent = `${tracks.length} CAPÍTULOS`;
    }

    tracks.forEach((track, index) => {
      const item = document.createElement('div');
      item.className = `track-item ${index === 0 ? 'playing' : ''}`;
      item.dataset.time = track.time;
      item.dataset.index = index;

      item.innerHTML = `
        <div class="track-left">
          <span class="track-num">${(index + 1).toString().padStart(2, '0')}</span>
          <span class="track-name">${track.title}</span>
        </div>
        <span class="track-time">${track.timeFormatted}</span>
      `;

      item.addEventListener('click', () => {
        jumpToTrack(track.time, track.title, index);
      });

      dom.tracklistGrid.appendChild(item);
    });

    if (tracks.length > 0) {
      dom.activeChapterName.textContent = tracks[0].title;
    }
  }

  // Saltar a un capítulo específico
  function jumpToTrack(time, title, index) {
    audio.currentTime = time;
    if (title) dom.activeChapterName.textContent = title;
    highlightTrackItem(index);
    audio.play().catch(e => console.log('Interacción requerida para reproducir:', e));
  }

  // Resaltar elemento de track activo
  function highlightTrackItem(index) {
    const items = dom.tracklistGrid.querySelectorAll('.track-item');
    items.forEach((item, i) => {
      if (i === index) {
        item.classList.add('playing');
      } else {
        item.classList.remove('playing');
      }
    });
  }

  // Actualizar capítulo activo según tiempo de reproducción
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
    if (tracks[activeIdx] && dom.activeChapterName.textContent !== tracks[activeIdx].title) {
      dom.activeChapterName.textContent = tracks[activeIdx].title;
    }
  }

  // Toggle Play / Pause
  function togglePlay() {
    if (audio.paused) {
      audio.play().then(() => {
        dom.btnPlay.innerHTML = '⏸';
      }).catch(err => {
        console.error('Error al reproducir audio:', err);
      });
    } else {
      audio.pause();
      dom.btnPlay.innerHTML = '▶';
    }
  }

  // Eventos de reproducción
  audio.addEventListener('play', () => {
    dom.btnPlay.innerHTML = '⏸';
  });

  audio.addEventListener('pause', () => {
    dom.btnPlay.innerHTML = '▶';
  });

  audio.addEventListener('loadedmetadata', () => {
    dom.timeDuration.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    if (isSeeking) return;
    const cur = audio.currentTime;
    const dur = audio.duration || 1;
    const percent = (cur / dur) * 100;
    
    dom.scrubberFill.style.width = `${percent}%`;
    dom.timeCurrent.textContent = formatTime(cur);
    if (!isNaN(audio.duration)) {
      dom.timeDuration.textContent = formatTime(audio.duration);
    }

    updateActiveChapterByTime(cur);
  });

  audio.addEventListener('ended', () => {
    dom.btnPlay.innerHTML = '▶';
    dom.scrubberFill.style.width = '0%';
    localStorage.removeItem(`sapiensia_audiopos_${currentObraId}`);
  });

  // Controles de avance / retroceso 15s
  if (dom.btnPlay) dom.btnPlay.addEventListener('click', togglePlay);
  
  if (dom.btnRewind) {
    dom.btnRewind.addEventListener('click', () => {
      audio.currentTime = Math.max(0, audio.currentTime - 15);
    });
  }

  if (dom.btnForward) {
    dom.btnForward.addEventListener('click', () => {
      audio.currentTime = Math.min(audio.duration || 99999, audio.currentTime + 15);
    });
  }

  // Scrubber interactivo (click y arrastre)
  function seekToPosition(e) {
    const rect = dom.scrubberTrack.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (audio.duration) {
      audio.currentTime = pos * audio.duration;
      dom.scrubberFill.style.width = `${pos * 100}%`;
      dom.timeCurrent.textContent = formatTime(audio.currentTime);
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

  // Selectores de velocidad
  dom.speedButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.speedButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const speed = parseFloat(btn.dataset.speed);
      audio.playbackRate = speed;
    });
  });

  // Control de volumen
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
      localStorage.setItem(`sapiensia_audiopos_${currentObraId}`, audio.currentTime.toString());
    }
  }

  function restoreSavedPosition() {
    const saved = localStorage.getItem(`sapiensia_audiopos_${currentObraId}`);
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
    toast.className = 'resume-toast';
    toast.innerHTML = `🎧 Reanudando audio en <strong>${formatTime(seconds)}</strong>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // Atajos de teclado
  window.addEventListener('keydown', (e) => {
    // Si no está en un input
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      audio.currentTime = Math.max(0, audio.currentTime - 15);
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      audio.currentTime = Math.min(audio.duration || 99999, audio.currentTime + 15);
    } else if (e.code === 'KeyM') {
      e.preventDefault();
      if (dom.btnVolume) dom.btnVolume.click();
    }
  });

  // Guardar posición al salir de la página
  window.addEventListener('beforeunload', saveCurrentPosition);

  // Inicializar al cargar el DOM
  document.addEventListener('DOMContentLoaded', initObra);
})();

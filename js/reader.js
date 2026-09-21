/**
 * ==========================================================================
 * SAPIENSIA CLAN — MÓDULO LECTOR WEB (JS/READER.JS)
 * Archivo: js/reader.js
 * Descripción: Renderizado de texto, índice interactivo, guardado de progreso y temas.
 * Autor: Nexo (Ingeniero Principal)
 * ==========================================================================
 */

let currentObra = null;
let currentChapterIndex = 0;
let currentFontSize = 1.15;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Obtener la obra solicitada por URL (?obra=poeta o ?obra=vela)
  const urlParams = new URLSearchParams(window.location.search);
  const obraKey = urlParams.get('obra') || 'poeta';

  if (!window.SAPIENSIA_OBRAS || !window.SAPIENSIA_OBRAS[obraKey]) {
    alert('Obra no encontrada.');
    window.location.href = 'index.html#catalogo';
    return;
  }

  currentObra = window.SAPIENSIA_OBRAS[obraKey];

  // 2. Cargar preferencias guardadas (Tema y Tamaño de Fuente)
  initPreferences();

  // 3. Renderizar metadatos iniciales
  document.title = `${currentObra.title} — SAPIENSIA Clan Lectura`;
  document.getElementById('reader-title').textContent = currentObra.title;
  document.getElementById('reader-author').textContent = currentObra.author;

  // 4. Configurar enlaces de descarga directa
  setupDownloadLinks();

  // 5. Construir el Índice de Capítulos en el cajón lateral
  buildChapterDrawer();

  // 6. Recuperar último capítulo leído o iniciar en el primero
  const savedChapter = localStorage.getItem(`sapiensia_reading_chap_${obraKey}`);
  const initialIndex = savedChapter ? parseInt(savedChapter, 10) : 0;
  loadChapter(initialIndex >= 0 && initialIndex < currentObra.chapters.length ? initialIndex : 0);

  // 7. Eventos de la barra de herramientas
  initToolbarEvents();

  // 8. Seguimiento de scroll para la barra de progreso
  window.addEventListener('scroll', updateReadingProgress, { passive: true });
});

/**
 * PARSER DE MARKDOWN LIGERO Y SEGURO A HTML
 */
function renderMarkdown(md) {
  let html = md;
  
  // Limpiar separadores
  html = html.replace(/\\pagebreak/g, '');
  
  // Títulos
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  
  // Citas y separadores
  html = html.replace(/^---$/gim, '<hr>');
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
  
  // Formato inline
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  
  // Párrafos
  const lines = html.split(/\n\n+/);
  html = lines.map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('<h') || block.startsWith('<blockquote') || block.startsWith('<hr')) {
      return block;
    }
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  return html;
}

/**
 * CARGAR CAPÍTULO ESPECÍFICO
 */
function loadChapter(index) {
  currentChapterIndex = index;
  const chapter = currentObra.chapters[index];
  if (!chapter) return;

  // Renderizar contenido
  const contentEl = document.getElementById('reader-content');
  contentEl.innerHTML = renderMarkdown(chapter.content);

  // Scroll arriba
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Guardar posición
  localStorage.setItem(`sapiensia_reading_chap_${currentObra.id}`, index);

  // Actualizar estado de botones anterior / siguiente
  const btnPrev = document.getElementById('btn-prev-chap');
  const btnNext = document.getElementById('btn-next-chap');
  
  if (btnPrev) btnPrev.disabled = index === 0;
  if (btnNext) btnNext.disabled = index === currentObra.chapters.length - 1;

  // Actualizar clase activa en el índice
  document.querySelectorAll('.chapter-item-link').forEach((link, idx) => {
    link.classList.toggle('is-active', idx === index);
  });
}

/**
 * CONSTRUIR EL ÍNDICE DE CAPÍTULOS
 */
function buildChapterDrawer() {
  const listEl = document.getElementById('chapter-list');
  if (!listEl) return;

  listEl.innerHTML = '';
  currentObra.chapters.forEach((chap, idx) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.className = 'chapter-item-link';
    a.textContent = chap.title || `Capítulo ${idx + 1}`;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      loadChapter(idx);
      toggleDrawer(false);
    });
    li.appendChild(a);
    listEl.appendChild(li);
  });
}

/**
 * CONFIGURAR ENLACES DE DESCARGA
 */
function setupDownloadLinks() {
  const epubLink = document.getElementById('link-download-epub');
  const pdfLink = document.getElementById('link-download-pdf');
  const audioLink = document.getElementById('link-download-audio');
  const switchAudioBtn = document.getElementById('btn-switch-audio');

  if (epubLink && currentObra.epub) {
    epubLink.href = currentObra.epub;
    epubLink.download = `${currentObra.title}.epub`;
  }
  if (pdfLink && currentObra.pdf) {
    pdfLink.href = currentObra.pdf;
    pdfLink.download = `${currentObra.title}.pdf`;
  }
  if (switchAudioBtn) {
    switchAudioBtn.href = `audio.html?obra=${currentObra.id}`;
  }
  if (audioLink) {
    if (currentObra.audio && currentObra.audio.src) {
      audioLink.href = currentObra.audio.src;
      audioLink.download = currentObra.audio.downloadName || `${currentObra.title}_Audiolibro.mp3`;
      audioLink.style.display = 'block';
    } else {
      audioLink.style.display = 'none';
    }
  }
}

/**
 * BARRA DE PROGRESO DE LECTURA
 */
function updateReadingProgress() {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = window.scrollY;
  const progress = docHeight > 0 ? (scrolled / docHeight) * 100 : 0;
  
  const bar = document.getElementById('reading-progress-bar');
  if (bar) {
    bar.style.width = `${Math.min(progress, 100)}%`;
  }
}

/**
 * GESTIÓN DE PREFERENCIAS (TEMAS & FUENTES)
 */
function initPreferences() {
  // Tema
  const savedTheme = localStorage.getItem('sapiensia_reader_theme') || 'dark';
  applyTheme(savedTheme);

  // Tamaño de fuente
  const savedSize = localStorage.getItem('sapiensia_reader_fontsize');
  if (savedSize) {
    currentFontSize = parseFloat(savedSize);
    applyFontSize(currentFontSize);
  }
}

function applyTheme(theme) {
  document.body.classList.remove('theme-sepia', 'theme-oled');
  if (theme === 'sepia') document.body.classList.add('theme-sepia');
  if (theme === 'oled') document.body.classList.add('theme-oled');
  localStorage.setItem('sapiensia_reader_theme', theme);
}

function applyFontSize(size) {
  document.documentElement.style.setProperty('--reader-font-size', `${size}rem`);
  localStorage.setItem('sapiensia_reader_fontsize', size);
}

/**
 * EVENTOS DE BOTONES
 */
function initToolbarEvents() {
  // Selector de Tema cíclico
  const btnTheme = document.getElementById('btn-toggle-theme');
  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      const themes = ['dark', 'sepia', 'oled'];
      const current = localStorage.getItem('sapiensia_reader_theme') || 'dark';
      const next = themes[(themes.indexOf(current) + 1) % themes.length];
      applyTheme(next);
      btnTheme.textContent = next === 'sepia' ? '🎨 Sepia' : next === 'oled' ? '🌑 OLED' : '🌙 Dark';
    });
  }

  // Aumentar fuente
  const btnFontPlus = document.getElementById('btn-font-plus');
  if (btnFontPlus) {
    btnFontPlus.addEventListener('click', () => {
      if (currentFontSize < 1.6) {
        currentFontSize += 0.1;
        applyFontSize(currentFontSize);
      }
    });
  }

  // Reducir fuente
  const btnFontMinus = document.getElementById('btn-font-minus');
  if (btnFontMinus) {
    btnFontMinus.addEventListener('click', () => {
      if (currentFontSize > 0.9) {
        currentFontSize -= 0.1;
        applyFontSize(currentFontSize);
      }
    });
  }

  // Abrir / Cerrar Drawer del Índice
  const btnToc = document.getElementById('btn-toggle-toc');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  if (btnToc) btnToc.addEventListener('click', () => toggleDrawer(true));
  if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', () => toggleDrawer(false));

  // Navegación de capítulos previa / siguiente
  const btnPrev = document.getElementById('btn-prev-chap');
  const btnNext = document.getElementById('btn-next-chap');
  if (btnPrev) btnPrev.addEventListener('click', () => loadChapter(currentChapterIndex - 1));
  if (btnNext) btnNext.addEventListener('click', () => loadChapter(currentChapterIndex + 1));
}

function toggleDrawer(open) {
  const drawer = document.getElementById('chapter-drawer');
  if (drawer) {
    drawer.classList.toggle('is-open', open);
  }
}
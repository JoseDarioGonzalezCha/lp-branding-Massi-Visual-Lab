/* =========================================================
   Massi Visual Lab · Landing page
   ========================================================= */
(function () {
  'use strict';

  /* -------------------------------------------------------
     PORTAFOLIO  [información por confirmar]
     Mientras ambas listas estén vacías, la sección «Trabajo»
     solo muestra el enlace al perfil.

     Opción A (recomendada, más rápida): imágenes propias,
     con permiso de la marca, guardadas en la carpeta /img.
       { src: 'img/pieza-01.jpg', alt: 'Qué se ve en la imagen',
         ancho: 1080, alto: 1350,
         enlace: 'https://www.instagram.com/p/CODIGO/',  // opcional
         pie: 'Texto breve bajo la imagen' }              // opcional

     Opción B: publicaciones incrustadas con el código oficial
     de Instagram (carga más pesada; se activa solo al llegar
     a la sección).
       'https://www.instagram.com/p/CODIGO/'
       'https://www.instagram.com/reel/CODIGO/'
     ------------------------------------------------------- */
  var PORTAFOLIO = {
    imagenes: [],
    publicaciones: []
  };

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- Año del pie ---------- */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Medición opcional de clics en los CTA ----------
     Si el sitio usa Google Tag Manager, cada clic envía
     { event: 'cta_instagram', ubicacion: '...' } a dataLayer. */
  $all('[data-cta]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: 'cta_instagram', ubicacion: el.getAttribute('data-cta') });
      }
    });
  });

  /* ---------- Portafolio ---------- */
  var PERMALINK = /^https:\/\/www\.instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/?(\?.*)?$/;

  function renderImagenes(grid, items) {
    items.forEach(function (item) {
      if (!item || !item.src || !item.alt) return;
      var fig = document.createElement('figure');
      fig.className = 'work-item';

      var img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt;
      img.loading = 'lazy';
      img.decoding = 'async';
      if (item.ancho) img.width = item.ancho;
      if (item.alto) img.height = item.alto;

      if (item.enlace) {
        var a = document.createElement('a');
        a.href = item.enlace;
        a.target = '_blank';
        a.rel = 'noopener';
        a.appendChild(img);
        fig.appendChild(a);
      } else {
        fig.appendChild(img);
      }

      if (item.pie) {
        var cap = document.createElement('figcaption');
        cap.textContent = item.pie;
        fig.appendChild(cap);
      }
      grid.appendChild(fig);
    });
  }

  function renderPublicaciones(grid, urls) {
    var validas = urls.filter(function (u) { return PERMALINK.test(u); });
    if (!validas.length) return 0;

    grid.classList.add('is-embeds');
    validas.forEach(function (url) {
      var bq = document.createElement('blockquote');
      bq.className = 'instagram-media';
      bq.setAttribute('data-instgrm-permalink', url);
      bq.setAttribute('data-instgrm-version', '14');

      var fallback = document.createElement('p');
      fallback.className = 'embed-fallback';
      var a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Ver esta publicación en Instagram';
      fallback.appendChild(a);
      bq.appendChild(fallback);
      grid.appendChild(bq);
    });

    // El script de Instagram solo se descarga cuando la sección está cerca.
    var cargado = false;
    function cargarEmbeds() {
      if (cargado) return;
      cargado = true;
      if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
        return;
      }
      var s = document.createElement('script');
      s.src = 'https://www.instagram.com/embed.js';
      s.async = true;
      document.body.appendChild(s);
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) {
          cargarEmbeds();
          io.disconnect();
        }
      }, { rootMargin: '600px 0px' });
      io.observe(grid);
    } else {
      cargarEmbeds();
    }
    return validas.length;
  }

  (function initPortafolio() {
    var grid = $('#work-grid');
    var intro = $('#trabajo-intro');
    if (!grid) return;

    if (PORTAFOLIO.imagenes.length) {
      renderImagenes(grid, PORTAFOLIO.imagenes);
    } else if (PORTAFOLIO.publicaciones.length) {
      renderPublicaciones(grid, PORTAFOLIO.publicaciones);
    }

    if (grid.children.length) {
      grid.hidden = false;
      var subtitulo = $('#work-subtitle');
      if (subtitulo) subtitulo.hidden = false;
      if (intro) intro.textContent = 'Un proyecto destacado y una selección de piezas publicadas en @massivisuallab.';
    }
  })();

  /* ---------- Mensaje sugerido ---------- */
  var sector = $('#f-sector');
  var pais = $('#f-pais');
  var interes = $('#f-interes');
  var preview = $('#msg-preview');
  var status = $('#copy-status');
  var copyOpen = $('#copy-open');
  var copyOnly = $('#copy-only');

  var FRASES_INTERES = {
    branding: ' Me interesa el branding visual.',
    redes: ' Me interesa la gestión de redes y contenido.',
    video: ' Me interesa cotizar un video.',
    todo: ' Me interesan el branding visual, la gestión de redes y el video.'
  };

  function construirMensaje() {
    var s = sector ? sector.value.trim() : '';
    var p = pais ? pais.value.trim() : '';
    var i = interes ? interes.value : '';
    var m = 'Hola, Massi. ';
    m += s
      ? 'Tengo una marca de ' + s + ' y me gustaría hablar sobre su imagen.'
      : 'Me gustaría hablar sobre la imagen de mi marca.';
    if (FRASES_INTERES[i]) m += FRASES_INTERES[i];
    if (p) m += ' Escribo desde ' + p + '.';
    return m;
  }

  function actualizarVista() {
    if (preview) preview.textContent = construirMensaje();
    if (status) status.textContent = '';
  }

  [sector, pais, interes].forEach(function (el) {
    if (!el) return;
    el.addEventListener('input', actualizarVista);
    el.addEventListener('change', actualizarVista);
  });

  function copiarRespaldo(texto) {
    var ta = document.createElement('textarea');
    ta.value = texto;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function copiar(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texto)
        .then(function () { return true; })
        .catch(function () { return copiarRespaldo(texto); });
    }
    return Promise.resolve(copiarRespaldo(texto));
  }

  function avisar(ok, abriendo) {
    if (!status) return;
    status.textContent = ok
      ? (abriendo
          ? 'Mensaje copiado. En Instagram, toca «Enviar mensaje» y pégalo.'
          : 'Mensaje copiado. Ahora abre Instagram y pégalo en un direct.')
      : 'No se pudo copiar automáticamente. Selecciona el texto de la vista previa y cópialo.';
  }

  if (copyOpen) {
    // No se bloquea la navegación: el enlace abre Instagram mientras se copia el texto.
    copyOpen.addEventListener('click', function () {
      copiar(construirMensaje()).then(function (ok) { avisar(ok, true); });
    });
  }

  if (copyOnly) {
    copyOnly.addEventListener('click', function () {
      copiar(construirMensaje()).then(function (ok) { avisar(ok, false); });
    });
  }

  /* ---------- Barra fija en móvil ----------
     Aparece cuando no se ve ni el botón de la portada
     ni la sección de cierre. */
  var sticky = $('#sticky-cta');
  var vigilados = [$('#hero-cta'), $('#contacto')].filter(Boolean);

  if (sticky && vigilados.length && 'IntersectionObserver' in window) {
    var visibles = new Set();
    var listo = false;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visibles.add(e.target);
        else visibles.delete(e.target);
      });
      listo = true;
      sticky.classList.toggle('is-visible', listo && visibles.size === 0);
    });
    vigilados.forEach(function (el) { obs.observe(el); });
  }
})();

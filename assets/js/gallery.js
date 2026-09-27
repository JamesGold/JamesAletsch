// Photo gallery: reads gallery.json (built by scripts/build_gallery.py) and
// renders it into a page-supplied container, with a keyboard/swipe lightbox.
// Pages style .gallery, .g-item and .lb (lightbox) however they like.

var SITE_ROOT = typeof SITE_ROOT === 'string' ? SITE_ROOT : ''; // set by pages outside the site root

function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
}

function loadGallery(el, opts) {
  opts = opts || {};
  return fetch(SITE_ROOT + 'gallery.json', { cache: 'no-cache' })
    .then(function (res) { return res.ok ? res.json() : []; })
    .catch(function () { return []; })
    .then(function (photos) {
      if (opts.limit) photos = photos.slice(0, opts.limit);
      if (!photos.length) { el.closest('section').hidden = true; return photos; }
      el.innerHTML = photos.map(function (p, i) {
        return '<button class="g-item" data-i="' + i + '" style="--ratio:' + p.width + '/' + p.height + ';--c:' + p.colour + '">' +
          '<img loading="lazy" src="' + SITE_ROOT + p.thumb + '" width="' + p.width + '" height="' + p.height + '" alt="' + esc(p.alt) + '">' +
          (opts.captions && p.caption ? '<span class="g-cap">' + esc(p.caption) + '</span>' : '') + '</button>';
      }).join('');
      el.addEventListener('click', function (e) {
        var b = e.target.closest('.g-item'); if (b) openLightbox(photos, +b.dataset.i, b);
      });
      return photos;
    });
}

function openLightbox(photos, start, returnFocus) {
  var i = start;
  var lb = document.createElement('div');
  lb.className = 'lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Photo viewer');
  lb.innerHTML =
    '<figure class="lb-fig"><img class="lb-img" alt=""><figcaption class="lb-cap"></figcaption></figure>' +
    '<button class="lb-btn lb-prev" aria-label="Previous photo">←</button>' +
    '<button class="lb-btn lb-next" aria-label="Next photo">→</button>' +
    '<button class="lb-btn lb-close" aria-label="Close">×</button>' +
    '<span class="lb-count"></span>';
  var img = lb.querySelector('.lb-img'), cap = lb.querySelector('.lb-cap'), count = lb.querySelector('.lb-count');

  function show(n) {
    i = (n + photos.length) % photos.length;
    var p = photos[i];
    lb.style.setProperty('--c', p.colour);
    img.classList.add('loading');
    img.onload = function () { img.classList.remove('loading'); };
    img.src = SITE_ROOT + p.full;
    img.alt = p.alt;
    cap.textContent = p.caption || '';
    cap.hidden = !p.caption;
    count.textContent = (i + 1) + ' / ' + photos.length;
    new Image().src = SITE_ROOT + photos[(i + 1) % photos.length].full; // preload next
  }
  function close() {
    document.removeEventListener('keydown', onKey, true);
    document.documentElement.style.overflow = '';
    lb.remove();
    if (returnFocus) returnFocus.focus();
  }
  // Capture phase so page-level arrow-key handlers (e.g. the Cover concept) don't also fire.
  function onKey(e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') { e.stopPropagation(); show(i + 1); }
    else if (e.key === 'ArrowLeft') { e.stopPropagation(); show(i - 1); }
  }

  lb.querySelector('.lb-prev').onclick = function () { show(i - 1); };
  lb.querySelector('.lb-next').onclick = function () { show(i + 1); };
  lb.querySelector('.lb-close').onclick = close;
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-fig')) close(); });

  var x0 = null; // swipe
  lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1);
  });

  document.addEventListener('keydown', onKey, true);
  document.documentElement.style.overflow = 'hidden';
  document.body.appendChild(lb);
  show(i);
  lb.querySelector('.lb-close').focus();
}

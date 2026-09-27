// Interactive bits for pages built by Jekyll. All content is already in the HTML;
// this only adds Bandcamp players, opens releases in the list and plays tracks.
(function () {
  var dark = matchMedia('(prefers-color-scheme: dark)').matches;

  // data-bc holds "track=<id>" or "album=<id>"; track n > 1 starts an album on that track.
  function embedSrc(bc, track) {
    var parts = [bc, 'size=small', 'bgcol=' + (dark ? '111110' : 'fafaf8'), 'linkcol=' + (dark ? 'e8e8e4' : '1a1a1a'),
      'tracklist=false', 'artwork=none', 'transparent=true'];
    if (track > 1) parts.push('t=' + track);
    if (track) parts.push('autoplay=true'); // a track was picked, so play it straight away
    return 'https://bandcamp.com/EmbeddedPlayer/' + parts.join('/') + '/';
  }

  function loadPlayer(release, track) {
    var slot = release.querySelector('[data-player]');
    var frame = slot.querySelector('iframe');
    if (!frame) {
      frame = document.createElement('iframe');
      frame.title = release.dataset.title + ' on Bandcamp';
      slot.appendChild(frame);
    } else if (!track) {
      return;
    }
    frame.src = embedSrc(release.dataset.bc, track);
  }

  [].forEach.call(document.querySelectorAll('[data-release][data-autoload]'), function (r) { loadPlayer(r); });

  document.addEventListener('click', function (e) {
    // A track in a tracklist: play it
    var t = e.target.closest('.tracks button');
    if (t) {
      loadPlayer(t.closest('[data-release]'), +t.dataset.t);
      [].forEach.call(t.closest('.tracks').querySelectorAll('button'), function (b) { b.removeAttribute('aria-current'); });
      t.setAttribute('aria-current', 'true');
      return;
    }
    // A release row in the Outputs list: open or close it
    var row = e.target.closest('.list > li > button');
    if (row) {
      var li = row.parentNode, open = li.classList.toggle('open');
      row.setAttribute('aria-expanded', open);
      if (open) loadPlayer(li.querySelector('[data-release]'));
      return;
    }
    // A cover thumbnail: jump to that release and open it
    var thumb = e.target.closest('[data-open]');
    if (thumb) {
      var btn = document.querySelector(thumb.getAttribute('href') + ' > button');
      if (btn && btn.getAttribute('aria-expanded') !== 'true') btn.click();
    }
  });

  // Sections were renamed; keep old links (e.g. releases.html → #releases) working.
  var renamed = { '#releases': '#outputs', '#inspiration': '#inputs', '#about': '#data' }[location.hash];
  if (renamed && document.querySelector(renamed)) {
    history.replaceState(null, '', renamed);
    document.querySelector(renamed).scrollIntoView();
  }
})();

// Single source of truth for the discography.
// Add a new release at the top of the list; every page picks it up.
// bandcamp.type/id feed the embedded player (bandcamp.com/EmbeddedPlayer/<type>=<id>).

var ARTIST = {
  name: 'James Aletsch',
  tagline: 'Music for the dance floor in your head.',
  about: 'Electronic music maker and sound shaper. Occasionally challenging, often beautiful. All music, sounds, artwork and photography by James Aletsch.',
  spotify: 'https://open.spotify.com/artist/4aAgOYEZjSrFzIsHcQfAZx',
  apple: 'https://music.apple.com/gb/artist/james-aletsch/1495253560',
  bandcamp: 'https://jamesaletsch.bandcamp.com',
  elsewhere: [
    { label: 'Bandcamp', url: 'https://jamesaletsch.bandcamp.com' },
    { label: 'Apple Music', url: 'https://music.apple.com/gb/artist/james-aletsch/1495253560' },
    { label: 'Spotify', url: 'https://open.spotify.com/artist/4aAgOYEZjSrFzIsHcQfAZx' },
    { label: 'Deezer', url: 'https://www.deezer.com/en/artist/83409122' },
    { label: 'Amazon Music', url: 'https://music.amazon.co.uk/artists/B083ZDS95K/james-aletsch' },
    { label: 'SoundCloud', url: 'https://soundcloud.com/user-363998037' },
    { label: 'YouTube', url: 'https://www.youtube.com/channel/UC3zdemA0dFnrOscTuxaa2MA' },
    { label: 'Instagram', url: 'https://www.instagram.com/jamesaletsch/' },
    { label: 'Discogs', url: 'https://www.discogs.com/artist/8007127-James-Aletsch' }
  ]
};

var RELEASES = [
  {
    slug: 'petrichor', title: 'Petrichor', format: 'Single', date: '2026-06-06',
    cover: 'PETRICHOR.jpg', colour: '#6f7468',
    bandcamp: { type: 'track', id: '2854606221', url: 'https://jamesaletsch.bandcamp.com/track/petrichor' },
    spotify: 'https://open.spotify.com/track/7CFNld5SIyTaAClXPYEOOr',
    apple: 'https://music.apple.com/gb/album/petrichor-single/6777796171'
  },
  {
    slug: 'dark-matter', title: 'Dark Matter', format: 'Single', date: '2024-09-09',
    cover: 'DARKMATTER.jpg', colour: '#10131c',
    bandcamp: { type: 'track', id: '78072134', url: 'https://jamesaletsch.bandcamp.com/track/dark-matter' },
    spotify: 'https://open.spotify.com/artist/4aAgOYEZjSrFzIsHcQfAZx', // TODO: direct release link
    apple: 'https://music.apple.com/gb/album/dark-matter-single/1767169200'
  },
  {
    slug: 'decision-overload-alone', title: 'Decision Overload / Alone', format: 'Single', date: '2024-02-02',
    cover: 'DecisionOverloadAlone.jpg', colour: '#8a8f94',
    bandcamp: { type: 'album', id: '2930053474', url: 'https://jamesaletsch.bandcamp.com/album/decision-overload-alone' },
    spotify: 'https://open.spotify.com/album/0f8XFliW8v7dZvXoR2CVaB',
    apple: 'https://music.apple.com/gb/album/decision-overload-alone-single/1729228279',
    tracks: [
      { title: 'Decision Overload', duration: 340 },
      { title: 'Alone', duration: 386 }
    ]
  },
  {
    slug: 'dusk', title: 'Dusk', format: 'EP', date: '2023-03-16',
    cover: 'DUSK.jpg', colour: '#3a2f52',
    bandcamp: { type: 'album', id: '1950361817', url: 'https://jamesaletsch.bandcamp.com/album/dusk-ep' },
    spotify: 'https://open.spotify.com/album/12M3yamh16rV7S0Nb8rTqp',
    apple: 'https://music.apple.com/gb/album/dusk-single/1677419442',
    tracks: [
      { title: 'Habitual', duration: 320 },
      { title: 'Tadao', duration: 305 },
      { title: 'Dusk', duration: 406 }
    ]
  },
  {
    slug: 'time-is-not-a-linear-measure', title: 'Time Is Not a Linear Measure', format: 'Single', date: '2022-12-09',
    cover: 'TIMEISNOT.jpg', colour: '#5b5a60',
    bandcamp: { type: 'album', id: '27170167', url: 'https://jamesaletsch.bandcamp.com/album/time-is-not-a-linear-measure' },
    spotify: 'https://open.spotify.com/artist/4aAgOYEZjSrFzIsHcQfAZx', // TODO: direct release link
    apple: 'https://music.apple.com/gb/album/time-is-not-a-linear-measure-single/1658330716',
    tracks: [
      { title: 'Looking Back to Our Future', duration: 240 },
      { title: 'Looking Forward to Our Past', duration: 223 }
    ]
  },
  {
    slug: 'butter', title: 'Butter', format: 'Single', date: '2021-10-08',
    cover: 'BUTTER.jpg', colour: '#1d1f24',
    bandcamp: { type: 'track', id: '1271206658', url: 'https://jamesaletsch.bandcamp.com/track/butter' },
    spotify: 'https://open.spotify.com/track/6A7XFDwXv5FqTpF7ynj4Em',
    apple: 'https://music.apple.com/gb/album/butter-single/1589470660'
  },
  {
    slug: 'lost-dance-floor', title: 'Lost Dance Floor', format: 'Single', date: '2021-02-21',
    cover: 'LOSTDANCEFLOOR.jpg', colour: '#2b2b2b',
    bandcamp: { type: 'track', id: '2598885360', url: 'https://jamesaletsch.bandcamp.com/track/lost-dance-floor' },
    spotify: 'https://open.spotify.com/album/55s6MhfqCJIdLvwNcdonVv',
    apple: 'https://music.apple.com/gb/album/lost-dance-floor-feedback-mix-single/1552897243'
  },
  {
    slug: 'are-we-still', title: 'Are We Still', format: 'Album', date: '2020-08-07',
    cover: 'AREWESTILL.jpg', colour: '#4a5058',
    bandcamp: { type: 'album', id: '2849769701', url: 'https://jamesaletsch.bandcamp.com/album/are-we-still' },
    spotify: 'https://open.spotify.com/album/28ayzU5PQptASEiqRcnk0U',
    apple: 'https://music.apple.com/gb/album/are-we-still/1523120228',
    tracks: [
      { title: 'Kommen', duration: 272 },
      { title: 'Further', duration: 329 },
      { title: 'Meditations', duration: 77 },
      { title: 'Sunrise Walk', duration: 299 },
      { title: 'Aero', duration: 377 },
      { title: 'Are We Still?', duration: 386 },
      { title: 'Cult Berlin', duration: 350 },
      { title: 'Melodica', duration: 293 },
      { title: 'After', duration: 363 },
      { title: 'Far From Home', duration: 170 }
    ]
  },
  {
    slug: 'kommen', title: 'Kommen', format: 'Single', date: '2020-04-10',
    cover: 'KOMMEN.jpg', colour: '#3c3c3c',
    bandcamp: { type: 'track', id: '1298628273', url: 'https://jamesaletsch.bandcamp.com/track/kommen' },
    spotify: 'https://open.spotify.com/album/1F3aGrM2bREuylPN6hWk1n',
    apple: 'https://music.apple.com/gb/album/kommen-single/1506677314'
  },
  {
    slug: 'melodica', title: 'Melodica', format: 'Single', date: '2020-02-19',
    cover: 'MELODICA.jpg', colour: '#3c3c3c',
    bandcamp: { type: 'track', id: '3576485624', url: 'https://jamesaletsch.bandcamp.com/track/melodica' },
    spotify: 'https://open.spotify.com/album/0CFY2iLc2U9OkbyTqMZ8by',
    apple: 'https://music.apple.com/gb/album/melodica-single/1499684328'
  },
  {
    slug: 'aero', title: 'Aero', format: 'Single', date: '2020-01-29',
    cover: 'AERO.jpg', colour: '#3c3c3c',
    bandcamp: { type: 'track', id: '565486864', url: 'https://jamesaletsch.bandcamp.com/track/aero' },
    spotify: 'https://open.spotify.com/album/3XvuadveIPEbg8RL5b5ZYH',
    apple: 'https://music.apple.com/gb/album/aero-single/1497015002'
  },
  {
    slug: 'cult-berlin', title: 'Cult Berlin', format: 'Single', date: '2020-01-16',
    cover: 'CULTBERLIN.jpg', colour: '#26204a',
    bandcamp: { type: 'track', id: '2169035549', url: 'https://jamesaletsch.bandcamp.com/track/cult-berlin' },
    spotify: 'https://open.spotify.com/track/1i70qar4AnEFq8eGnHZ4ey',
    apple: null // not on Apple Music
  },
  {
    slug: 'further', title: 'Further', format: 'EP', date: '2020-01-16',
    cover: 'FURTHER.jpg', colour: '#3c3c3c',
    bandcamp: { type: 'track', id: '497613215', url: 'https://jamesaletsch.bandcamp.com/track/further' },
    spotify: 'https://open.spotify.com/album/20vJmDzva7VcHrnhFaOFzT',
    apple: 'https://music.apple.com/gb/album/further-single/1495253769'
  }
];

// Pages outside the site root set SITE_ROOT (e.g. '../') before loading this file.
var SITE_ROOT = typeof SITE_ROOT === 'string' ? SITE_ROOT : '';

// Helpers shared by the pages
function coverSrc(r) { return SITE_ROOT + 'assets/img/800/' + r.cover; }
function year(r) { return r.date.slice(0, 4); }
function niceDate(r) {
  return new Date(r.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
function bandcampEmbed(r, opts) {
  opts = opts || {};
  var bg = opts.bg || 'ffffff', link = opts.link || '333333';
  var size = opts.size || 'large';
  var parts = [
    r.bandcamp.type + '=' + r.bandcamp.id, 'size=' + size,
    'bgcol=' + bg, 'linkcol=' + link,
    'tracklist=' + (opts.tracklist ? 'true' : 'false'),
    'artwork=' + (opts.artwork || 'none'), 'transparent=true'
  ];
  if (opts.track > 1) parts.push('t=' + opts.track); // start on track n of an album
  if (opts.track) parts.push('autoplay=true'); // a track was picked, so play it straight away
  return 'https://bandcamp.com/EmbeddedPlayer/' + parts.join('/') + '/';
}
function listenLinks(r) {
  var l = [{ label: 'Bandcamp', url: r.bandcamp.url }];
  if (r.apple) l.push({ label: 'Apple Music', url: r.apple });
  if (r.spotify) l.push({ label: 'Spotify', url: r.spotify });
  return l;
}
function findRelease(slug) {
  return RELEASES.find(function (r) { return r.slug === slug; });
}
function mins(sec) { return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }

// Tracklist for releases with more than one song. Pages style `.tracks`;
// wire it up with handleTrackClick so picking a track reloads the player on it.
function tracklist(r) {
  if (!r.tracks || r.tracks.length < 2) return '';
  return '<ol class="tracks" data-slug="' + r.slug + '">' + r.tracks.map(function (t, i) {
    return '<li><button type="button" data-t="' + (i + 1) + '"' + (i === 0 ? ' aria-current="true"' : '') + '>' +
      '<span class="tn">' + (i + 1) + '</span><span class="tt">' + esc(t.title) + '</span><span class="td">' + mins(t.duration) + '</span></button></li>';
  }).join('') + '</ol>';
}
// The player iframe for the release must share a container with its tracklist.
function handleTrackClick(e, containerSelector, embedOpts) {
  var btn = e.target.closest('.tracks button'); if (!btn) return false;
  var list = btn.closest('.tracks'), r = findRelease(list.dataset.slug);
  var frame = list.closest(containerSelector).querySelector('iframe');
  var opts = Object.assign({}, embedOpts, { track: +btn.dataset.t });
  if (frame) frame.src = bandcampEmbed(r, opts);
  [].forEach.call(list.querySelectorAll('button'), function (b) { b.removeAttribute('aria-current'); });
  btn.setAttribute('aria-current', 'true');
  return true;
}
function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
}

#!/usr/bin/env python3
"""Build the photo gallery from the originals in photos/.

For every image in photos/ this writes two web copies to assets/gallery/
(a thumbnail and a large version), stripped of all metadata (so no GPS
location or camera serials are published), and a gallery.json manifest
that the site reads.

Output filenames include a hash of the original, so re-running is cheap:
unchanged photos are skipped and removed photos are cleaned up.

Optional captions, either way:
  - a text file next to the photo with the same name (photos/berlin-night.txt),
    which is what the iPhone Shortcut uploads when you type a caption; or
  - photos/captions.json for caption and alt text together:
    { "berlin-night.jpg": { "caption": "Berlin, 3am", "alt": "Empty tram stop under a street light" } }

Usage:  python3 scripts/build_gallery.py        (needs: pip install Pillow pillow-heif)
"""
import hashlib
import json
import re
import sys
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError

try:  # iPhone photos are HEIC; pillow-heif teaches Pillow to read them
    from pillow_heif import register_heif_opener
    register_heif_opener()
    HEIC = True
except ImportError:
    HEIC = False

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'photos'
OUT = ROOT / 'assets' / 'gallery'
MANIFEST = ROOT / 'gallery.json'
CAPTIONS = SRC / 'captions.json'

SIZES = {'thumb': 800, 'full': 2000}  # longest edge in px
QUALITY = {'thumb': 78, 'full': 85}
EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic', '.heif'}
DATE_TAG = 36867  # EXIF DateTimeOriginal
EXIF_IFD = 0x8769


def slugify(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-') or 'photo'


def taken_date(img, path):
    """EXIF capture date, else a YYYY-MM-DD at the start of the filename, else None."""
    try:
        raw = img.getexif().get_ifd(EXIF_IFD).get(DATE_TAG)
        if raw:
            return datetime.strptime(raw.strip('\x00')[:19], '%Y:%m:%d %H:%M:%S').date().isoformat()
    except (ValueError, KeyError, AttributeError):
        pass
    m = re.match(r'(\d{4}-\d{2}-\d{2})', path.stem)
    return m.group(1) if m else None


def average_colour(img):
    r, g, b = img.convert('RGB').resize((1, 1), Image.LANCZOS).getpixel((0, 0))
    return '#{:02x}{:02x}{:02x}'.format(r, g, b)


def save_web_copy(img, dest, edge, quality):
    copy = img.copy()
    copy.thumbnail((edge, edge), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    # Saving without exif=/icc_profile= drops all metadata; convert to sRGB-ish RGB for the web.
    copy.convert('RGB').save(dest, 'JPEG', quality=quality, optimize=True, progressive=True)
    return copy.size


def main():
    if not SRC.is_dir():
        sys.exit('No photos/ folder found at ' + str(SRC))

    captions = json.loads(CAPTIONS.read_text()) if CAPTIONS.exists() else {}
    readable = EXTENSIONS if HEIC else EXTENSIONS - {'.heic', '.heif'}
    originals = sorted(p for p in SRC.iterdir() if p.suffix.lower() in readable)
    skipped = [p.name for p in SRC.iterdir() if p.suffix.lower() in EXTENSIONS - readable]

    entries, keep, broken = [], set(), []
    for path in originals:
        # One bad upload (e.g. an empty file from a misconfigured shortcut) mustn't block the rest.
        try:
            with Image.open(path) as probe:
                probe.verify()
        except (UnidentifiedImageError, OSError, SyntaxError):
            broken.append(path.name)
            continue
        digest = hashlib.sha1(path.read_bytes()).hexdigest()[:8]
        name = '{}-{}.jpg'.format(slugify(path.stem), digest)
        with Image.open(path) as img:
            img = ImageOps.exif_transpose(img)  # bake in camera rotation before metadata is dropped
            date = taken_date(img, path)
            dims = {}
            for size, edge in SIZES.items():
                dest = OUT / size / name
                keep.add(dest)
                if dest.exists():
                    with Image.open(dest) as done:
                        dims[size] = done.size
                else:
                    dims[size] = save_web_copy(img, dest, edge, QUALITY[size])
            colour = average_colour(img)

        meta = dict(captions.get(path.name, {}))
        sidecar = path.with_suffix('.txt')
        if sidecar.exists() and not meta.get('caption'):
            meta['caption'] = sidecar.read_text(encoding='utf-8').strip()
        w, h = dims['full']
        entries.append({
            'id': slugify(path.stem),
            'thumb': 'assets/gallery/thumb/' + name,
            'full': 'assets/gallery/full/' + name,
            'width': w,
            'height': h,
            'date': date,
            'caption': meta.get('caption', ''),
            'alt': meta.get('alt') or meta.get('caption') or 'Photograph by James Aletsch',
            'colour': colour,
        })

    # Remove web copies whose original was deleted or changed.
    removed = 0
    for size in SIZES:
        for f in (OUT / size).glob('*.jpg') if (OUT / size).is_dir() else []:
            if f not in keep:
                f.unlink()
                removed += 1

    # Newest first; undated photos go last, in filename order.
    entries.sort(key=lambda e: (e['date'] is not None, e['date'] or ''), reverse=True)
    MANIFEST.write_text(json.dumps(entries, indent=2) + '\n')

    print('gallery.json: {} photos, {} stale files removed'.format(len(entries), removed))
    if broken:
        print('WARNING: skipped unreadable files (empty or not an image): ' + ', '.join(broken))
    if skipped:
        print('Skipped (install pillow-heif to read HEIC): ' + ', '.join(skipped))


if __name__ == '__main__':
    main()

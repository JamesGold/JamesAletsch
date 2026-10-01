#!/usr/bin/env python3
"""Remove photos that are no longer in the iPhone "Website" album.

When the "Post to Website" shortcut runs from the album (the daily automation or
a manual run, not the share sheet), it uploads sync/album-<time>.txt: the file
name of every photo in the album, one per line. This script takes the newest
such list, deletes photos in photos/ that aren't on it (and their .txt
captions), and removes the list. build_gallery.py then drops their web copies.

Safety: nothing is removed if the list is empty (the album couldn't be read),
or if it would remove more than half of the photos (e.g. the phone is in another
time zone, so every name shifted by hours). Removals stay in git history.

ALBUM_SYNC_DRY_RUN=true only reports what would be removed.
Writes sync/report.txt and prints a one-line summary (used as the commit
message) whenever it processes a list. Exit codes: 0 fine (or no list to
process), 2 refused by a safety check.
"""
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SYNC = ROOT / 'sync'
PHOTOS = ROOT / 'photos'
REPORT = SYNC / 'report.txt'
EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic', '.heif'}
MAX_FRACTION = 0.5  # never remove more than this share of the photos in one go


def main():
    lists = sorted(SYNC.glob('album-*.txt')) if SYNC.is_dir() else []
    if not lists:
        return 0
    newest = lists[-1]  # names are album-yyyy-MM-dd-HHmmss-SSS.txt, so they sort by time
    album = {line.strip() for line in newest.read_text(encoding='utf-8', errors='replace').splitlines() if line.strip()}
    for f in lists:  # older lists are superseded by the newest
        f.unlink()

    photos = sorted(p for p in PHOTOS.iterdir() if p.suffix.lower() in EXTENSIONS)
    gone = [p for p in photos if p.name not in album]
    dry_run = os.environ.get('ALBUM_SYNC_DRY_RUN', '').lower() in ('1', 'true', 'yes')

    if not album:
        refused = 'the album list was empty (Photos may not have been readable)'
    elif len(gone) > len(photos) * MAX_FRACTION:
        refused = '{} of {} photos would be removed, more than half (time zone change?)'.format(len(gone), len(photos))
    else:
        refused = ''

    stamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    report = ['Album sync {}'.format(stamp),
              'Album list: {} ({} photos)'.format(newest.name, len(album)),
              'On the site: {} photos'.format(len(photos))]
    if refused:
        report.append('REFUSED, nothing removed: ' + refused)
    elif dry_run:
        report.append('DRY RUN, nothing removed. Would remove {}:'.format(len(gone)))
    else:
        report.append('Removed {}:'.format(len(gone)))
    report += ['  ' + p.name for p in gone]
    REPORT.write_text('\n'.join(report) + '\n')

    if refused:
        print('::error::Album sync refused: ' + refused + '. See sync/report.txt.', file=sys.stderr)
        print('Album sync refused, nothing removed (see sync/report.txt)')
        return 2
    if dry_run:
        print('Album sync dry run: would remove {} (see sync/report.txt)'.format(len(gone)))
        return 0
    if not gone:
        print('Album sync: nothing to remove')
        return 0
    for p in gone:
        p.unlink()
        caption = p.with_suffix('.txt')
        if caption.exists():
            caption.unlink()
    print('Remove {} photo{} no longer in the Website album'.format(len(gone), '' if len(gone) == 1 else 's'))
    return 0


if __name__ == '__main__':
    sys.exit(main())

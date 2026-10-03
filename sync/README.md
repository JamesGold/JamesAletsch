# Album sync

The "Post to Website" shortcut uploads `album-<time>.txt` here on every run: the file name of every photo in the iPhone **Website** album. The gallery Action (`scripts/apply_album_sync.py`) uses the newest list to remove photos that are no longer in the album, deletes the list, and writes `report.txt` describing what happened.

This folder isn't published on the website (see `_config.yml`). Keep this README: it makes sure the folder exists, which the Action relies on.

# JamesAletsch

Source for [jamesaletsch.com](https://jamesaletsch.com), built by GitHub Pages (Jekyll) from the `master` branch.

## Adding a release

1. Put the cover art in `assets/img/` and an 800px copy in `assets/img/800/`.
2. Copy any file in `_outputs/` (e.g. `_outputs/petrichor.md`) to a new one. The file name becomes the page address: `_outputs/new-single.md` → `jamesaletsch.com/outputs/new-single/`.
3. Edit the details: title, format (`Single`, `EP` or `Album`), release date, cover, Bandcamp type/id/url (the id is in Bandcamp's *Share / Embed* code), Apple Music and Spotify links, and tracks with their length in seconds.
4. Optionally, write a few lines about the release below the second `---`. They appear on its page.
5. Commit and push. The homepage list, the release's own page, the sitemap and the structured data all update automatically, newest release first.

## Layout

- `index.html`: homepage; `_layouts/output.html`: each release's page; `inputs.html`: all photos at /inputs/
- `_includes/`: shared pieces (page head, structured data, links, tracklist, nav)
- `_config.yml`: site title/description, artist profile links
- `assets/css/site.css`, `assets/js/site.js`: styles and players
- Photo gallery (Inputs): see `GALLERY.md`
- `concepts/`: earlier design concepts, kept for reference and not published

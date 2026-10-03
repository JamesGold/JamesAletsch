# Photo gallery

Photos go from an iPhone album straight onto the site. Nothing runs on a server.

```
iPhone "Website" album
  → "Post to Website" shortcut (resize, strip metadata, upload via GitHub API)
    → photos/2026-09-25-143012-123.jpg  (named by date taken; optional .txt caption)
      → GitHub Action "Build photo gallery" (scripts/build_gallery.py)
        → assets/gallery/{thumb,full}/…jpg  + gallery.json (+ _data/gallery.json for Jekyll)
          → GitHub Pages rebuilds: newest photo is the homepage hero, all appear under Inputs
```

- **Adding a photo:** upload to `photos/` (shortcut, `git push`, or GitHub's *Add file → Upload files*).
- **Captions:** a `.txt` with the same name as the photo, or an entry in `photos/captions.json` (which can also set alt text).
- **Removing a photo:** remove it from the **Website** album. The next run of the shortcut uploads the album's list of names, and the Action removes any photo that's no longer in the album, with its web copies and caption. Deleting a photo from `photos/` on GitHub also works, but if it's still in the album the next run puts it back.
- **The Website album is the source of truth, and the only way in.** To post photos, select them in Photos → **Share** → **Add to Album** → **Website** (the Photos app's own option, which doesn't duplicate anything), then run the shortcut. iOS Shortcuts has no action that adds an existing photo to an album (*Save to Photos* saves a new copy), so the shortcut is no longer in the share sheet: anything it posted from there wouldn't be in the album, and the next sync would remove it. Photos uploaded any other way (test script, GitHub's Upload files) are removed at the next sync unless they're also in the album.
- **Order:** newest first, by the date the photo was taken (EXIF), falling back to the date at the start of the filename.
- `photos/` and `scripts/` are excluded from the published site in `_config.yml`. Only the metadata-stripped copies are public on jamesaletsch.com. The originals are still visible in the GitHub repo itself if it's public, which is why the shortcut strips metadata before uploading.

## 1. GitHub token

Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token.

- Repository access: **Only select repositories** → `JamesGold/JamesAletsch`
- Permissions: **Contents: Read and write**. Nothing else.
- Expiry: a year. Put a reminder in your calendar to renew it.

Keep the token out of chats, notes and screenshots. It goes only into the shortcut.

Before building the shortcut, check the token from the Mac:

```bash
scripts/test_upload.sh ~/Desktop/some-photo.jpg "Test caption"
```

This makes the same API call as the shortcut. It asks for the token without echoing it, uploads to the `master` branch (the live site), and explains any error (401 wrong token, 404 wrong repo/branch, 422 already exists). Then check the **Actions** tab for the gallery run and `gallery.json` for the new entry. Delete the test photo from `photos/` afterwards.

## 2. The album

In Photos on the iPhone, create an album called **Website**.

## 3. The "Post to Website" shortcut

This is the version that works on iOS 27 (as built in September 2026). Action names can shift between iOS versions: "Date Created" was "Creation Date" in older ones.

In **Settings → Apps → Shortcuts**, set new shortcuts to open in the **editor** rather than "Describe a Shortcut". Then Shortcuts → **+** → name it *Post to Website*. Leave **Show in Share Sheet** off (the first action reads "Receive … from **Nowhere**"). If your copy still has the old share-sheet branch at the top (*If Shortcut Input has any value … Otherwise … End If*), it never runs and can stay.

```
Find Photos where Album is Website                       (no limit)
Set variable Photos → Photos
Get contents of  https://api.github.com/repos/JamesGold/JamesAletsch/contents/photos?ref=master
                                          GET, 3 headers (below). Typed straight into the field.
Combine  Contents of URL  with New Lines
Set variable Posted → Combined Text       (every file name already on the site)
Repeat with each item in  Photos
    Format  🔁 Repeat Item › Date Created        Custom: yyyy-MM-dd-HHmmss-SSS
    Text  [Formatted Date].jpg
    Add  Text  to variable InAlbum                (every photo, posted or not)
    URL  https://api.github.com/repos/JamesGold/JamesAletsch/contents/photos/[Formatted Date].jpg
    If  Posted  does not contain  [Formatted Date].jpg
        Resize  Repeat Item  to 2000 × Auto Height
        Convert  Resized Image  to JPEG           (quality ~85%, Preserve Metadata: OFF)
        Encode  Converted Image  with base64      (Line Breaks: None)
        Get contents of  URL (the one just above) PUT, 3 headers, JSON body (below)
    Otherwise                                      (already posted: skip)
    End If
End Repeat
Combine  InAlbum  with New Lines                 (the album's list of names, for the sync)
Encode  Combined Text  with base64               (Line Breaks: None)
Format  Current Date                             Custom: yyyy-MM-dd-HHmmss-SSS
Get contents of  https://api.github.com/repos/JamesGold/JamesAletsch/contents/sync/album-[Formatted Date].txt
                                          PUT, 3 headers, JSON body: message = Album sync,
                                          content = Base64 Encoded, branch = master
Show notification  Posted to Website
```

**Headers** (both Get contents of URL actions): `Authorization` = `Bearer <token>` · `Accept` = `application/vnd.github+json` · `X-GitHub-Api-Version` = `2022-11-28`

**Upload body** (JSON): `message` = `Add photo ` + *Formatted Date* · `content` = *Base64 Encoded* · `branch` = `master`

Why it's built this way:
- **Named by date taken**, so the same photo always gets the same file name, and the gallery sorts by when photos were taken.
- **One list request per run** (a few KB of names), not one check per photo. Checking each photo individually downloaded the photo itself and timed out on big albums.
- **Preserve Metadata: off** is what strips the GPS location before anything leaves the phone.
- GitHub rejects uploading to a name that already exists ("sha wasn't supplied", 422), so a mistake can't overwrite or duplicate a photo.
- **Removals happen on GitHub, not the phone** (`scripts/apply_album_sync.py`, run by the Action). Every run uploads the album's list of names. Safety checks: nothing is removed if the list is empty, or if it would remove more than half the photos. A refused sync turns the Action run red and explains why in `sync/report.txt`. Every removal can be undone from git history.
- **Time zones:** file names use the phone's time zone. Abroad, names shift by hours, so album runs would re-upload everything under new names (and the sync would refuse to remove the old ones). Don't run the shortcut while your phone is in another time zone.
- `sync/report.txt` always shows the last sync: how many photos were in the album, on the site, and what was removed. Removals are live (`ALBUM_SYNC_DRY_RUN: "false"` in `.github/workflows/gallery.yml`); set it to `"true"` to go back to only reporting what *would* be removed.

### Troubleshooting (things that went wrong while building it)

| Symptom | Cause | Fix |
|---|---|---|
| "Posted to Website" but nothing uploads | File name is empty (".jpg"), so everything looks already posted | Format must show 🔁 **Date Created** (repeat icon, not 📅), Custom format set |
| "Choose an Item" pop-up | *Get Value for name* on a list | Combine the whole *Contents of URL* instead |
| "No commit found for the ref master…https…" | URL doubled in the list request | Type the address into the field once; no URL bubble |
| "No URL Specified", or a red variable | Action points at one that was deleted | Tap the red item → Select Variable → pick the current action |
| 422 "sha wasn't supplied" | Photo already on the site | Harmless. If it happens for every photo, *Posted* is empty: check Combine's input |
| "The request timed out" | Slow connection | Use Wi-Fi and re-run. It continues where it stopped |
| "There was a problem running the shortcut" partway through | A video, or an iCloud-only photo that didn't download | Re-run. If it always stops at the same place, remove that item from the album |
| Uploaded file is empty or blank white | Convert/Resize wired to the wrong input | Resize ← Repeat Item, Convert ← Resized Image, Encode ← Converted Image |

To debug, a temporary **Show Alert** showing a variable (e.g. *Posted*, or `Checking [Formatted Date].jpg`) is the quickest way to see what the shortcut is doing. Remove it afterwards.

## 4. Running it

**Run it by hand** after adding photos to (or removing them from) the Website album: from the Shortcuts app, a Home Screen icon (press and hold the shortcut → Share → Add to Home Screen), a Shortcuts widget, or "Hey Siri, Post to Website". The first time, iOS asks to let it send photos to api.github.com: choose **Always Allow**.

A daily *Time of Day* automation is possible but not recommended:

- Abroad, file names shift with the time zone, so an unattended run would re-upload every photo under new names (and the sync would then remove the old ones).
- While the phone is locked, the Photos **Require Face ID** setting or iCloud downloads can make it fail with nobody watching.
- Anything added to the album goes live without a final look.
- Every run commits an album list and a report, even when nothing changed.

Anything in the Website album gets published; anything removed from it is taken down at the next run.

## Running the build locally

```bash
python3 -m pip install Pillow pillow-heif
python3 scripts/build_gallery.py      # writes gallery.json and _data/gallery.json
```

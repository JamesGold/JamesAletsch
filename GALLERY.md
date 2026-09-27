# Photo gallery

Photos go from an iPhone album straight onto the site. Nothing runs on a server.

```
iPhone "Website" album
  → "Post to Website" shortcut (resize, strip metadata, upload via GitHub API)
    → photos/2026-09-25-143012.jpg  (+ optional .txt caption)
      → GitHub Action "Build photo gallery" (scripts/build_gallery.py)
        → assets/gallery/{thumb,full}/…jpg  + gallery.json
          → GitHub Pages rebuilds; the page renders gallery.json
```

- **Adding a photo:** upload to `photos/` (shortcut, `git push`, or GitHub's *Add file → Upload files*).
- **Captions:** a `.txt` with the same name as the photo, or an entry in `photos/captions.json` (which can also set alt text).
- **Removing a photo:** delete it from `photos/` on GitHub. The Action removes its web copies. Removing it from the iPhone album does *not* take it down.
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

Shortcuts → **+** → name it *Post to Website*.

**Choose the photos**

1. **If** *Shortcut Input* has any value → **Set Variable** `Photos` to *Shortcut Input*.
   **Otherwise** → **Find Photos** where *Album is Website* and *Date Added is in the last 2 days*, sorted by *Date Added, Oldest First* → **Set Variable** `Photos` to the result. **End If**.
   (The two-day window overlaps on purpose. Re-uploads are rejected harmlessly because filenames are timestamps.)

**Inside Repeat with Each item in `Photos`**

2. **Resize Image**: *Repeat Item*, width **2000**, height auto.
3. **Convert Image**: to **JPEG**, quality 0.85, **Preserve Metadata: off**. This removes the GPS location.
4. **Format Date**: *Repeat Item → Creation Date*, Custom format `yyyy-MM-dd-HHmmss-SSS`.
5. **Base64 Encode**: *Converted Image*, **Line Breaks: None**. Uploads fail if this is left on.
6. **Get Contents of URL**
   - URL: `https://api.github.com/repos/JamesGold/JamesAletsch/contents/photos/` + *Formatted Date* + `.jpg`
   - Method **PUT**
   - Headers: `Authorization` = `Bearer <token>` · `Accept` = `application/vnd.github+json` · `X-GitHub-Api-Version` = `2022-11-28`
   - Request Body **JSON**: `message` = `Add photo ` + *Formatted Date* · `content` = *Base64 Encoded* · `branch` = `master`
7. **Get Dictionary Value** `content` from *Contents of URL* → **If** it has any value → **Add to Variable** `Posted` → **End If**.

**Optional caption (share-sheet runs only)**

8. Before the loop: **If** *Shortcut Input* has any value → **Ask for Input** "Caption (optional)" → **Set Variable** `Caption`.
   Inside the loop, after step 6: **If** `Caption` has any value → **Base64 Encode** `Caption` (Line Breaks: None) → **Get Contents of URL** as in step 6, but ending in `.txt` with that base64 as `content`.

**After the loop**

9. **Count** `Posted` → **Show Notification** "Posted *Count* photo(s) to the website".

In the shortcut's settings, turn on **Show in Share Sheet** and accept **Images**.

## 4. Automation

Shortcuts → Automation → **+** → **Time of Day** → Daily → **Run Immediately** → *Post to Website*. Add more times of day if you want it to run more often. For instant posting, select photos in Photos → Share → *Post to Website*.

Share-sheet posting lets you choose what goes live. The daily automation publishes anything added to the album.

## Running the build locally

```bash
python3 -m pip install Pillow pillow-heif
python3 scripts/build_gallery.py
```

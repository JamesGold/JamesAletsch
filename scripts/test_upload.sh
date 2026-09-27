#!/usr/bin/env bash
# Upload one photo to photos/ with the same GitHub API call the iPhone
# "Post to Website" shortcut makes. Use it to check the token, repo and branch.
#
#   scripts/test_upload.sh path/to/photo.jpg ["optional caption"]
#
# The token is read from $GITHUB_TOKEN, or asked for without echoing it.
# Env overrides: REPO (default JamesGold/JamesAletsch), BRANCH (default redesign).
set -euo pipefail

REPO="${REPO:-JamesGold/JamesAletsch}"
BRANCH="${BRANCH:-redesign}"
PHOTO="${1:?usage: scripts/test_upload.sh photo.jpg [caption]}"
CAPTION="${2:-}"

if [ -z "${GITHUB_TOKEN:-}" ]; then
  read -r -s -p "GitHub token (input hidden): " GITHUB_TOKEN; echo
fi

NAME="$(date +%Y-%m-%d-%H%M%S)-test"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

put() { # put <repo path> <file to send> <commit message>
  printf '{"message":"%s","branch":"%s","content":"' "$3" "$BRANCH" > "$TMP/body.json"
  base64 < "$2" | tr -d '\n' >> "$TMP/body.json"  # no line breaks, same as the shortcut's setting
  printf '"}' >> "$TMP/body.json"
  status=$(curl -sS -o "$TMP/resp.json" -w '%{http_code}' -X PUT \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    --data @"$TMP/body.json" \
    "https://api.github.com/repos/$REPO/contents/$1")
  case "$status" in
    201) echo "✓ uploaded $1" ;;
    401) echo "✗ 401: token is wrong or expired"; exit 1 ;;
    403) echo "✗ 403: token lacks Contents: write on $REPO"; exit 1 ;;
    404) echo "✗ 404: repo/branch not found, or token doesn't cover $REPO"; exit 1 ;;
    422) echo "• 422: $1 already exists (expected on reruns)" ;;
    *)   echo "✗ HTTP $status"; cat "$TMP/resp.json"; exit 1 ;;
  esac
}

# The shortcut re-encodes to JPEG, so do the same here (sips ships with macOS).
sips -s format jpeg -Z 2000 "$PHOTO" --out "$TMP/photo.jpg" >/dev/null
put "photos/$NAME.jpg" "$TMP/photo.jpg" "Add photo $NAME"

if [ -n "$CAPTION" ]; then
  printf '%s' "$CAPTION" > "$TMP/caption.txt"
  put "photos/$NAME.txt" "$TMP/caption.txt" "Add caption $NAME"
fi

echo "Now watch https://github.com/$REPO/actions for the 'Build photo gallery' run."

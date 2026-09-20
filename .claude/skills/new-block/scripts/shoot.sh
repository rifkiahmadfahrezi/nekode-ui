#!/usr/bin/env bash
# Screenshot a URL at mobile / tablet / desktop widths with headless Chrome.
# Usage: shoot.sh <url> <out-dir> [height]
# Output: <out-dir>/{mobile-375,tablet-768,desktop-1280}.png — read each one and look.
set -euo pipefail
url="${1:?url}"; out="${2:?out dir}"; height="${3:-1600}"
mkdir -p "$out"
for spec in mobile-375:375 tablet-768:768 desktop-1280:1280; do
  name="${spec%%:*}"; width="${spec##*:}"
  google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars \
    --window-size="$width,$height" --virtual-time-budget=10000 \
    --screenshot="$out/$name.png" "$url" >/dev/null 2>&1
  echo "$out/$name.png"
done

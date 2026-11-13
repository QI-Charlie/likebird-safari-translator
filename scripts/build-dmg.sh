#!/usr/bin/env bash
# Assemble a Finder drag-to-install disk image from the built macOS app.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(node -p "require(process.argv[1]).version" "$ROOT/package.json")"
APP="$ROOT/dist/LikeBird.app"
OUTPUT="$ROOT/dist/LikeBird-$VERSION.dmg"
TEMP_DIR="$(mktemp -d /private/tmp/likebird-dmg.XXXXXX)"
MOUNT="$TEMP_DIR/mount"
WRITABLE="$TEMP_DIR/installer.dmg"
mounted=false
cleanup() {
  if "$mounted"; then hdiutil detach "$MOUNT" -quiet || return; fi
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

if [[ ! -d "$APP" ]]; then
  printf 'Build LikeBird.app with npm run app first.\n' >&2
  exit 1
fi
if ! python3 -c 'import ds_store, mac_alias' 2>/dev/null; then
  printf 'Install the Finder layout dependency: python3 -m pip install ds_store\n' >&2
  exit 1
fi
mkdir -p "$MOUNT"
hdiutil create -size 32m -fs HFS+ -volname '安装 LikeBird' "$WRITABLE"
hdiutil attach "$WRITABLE" -readwrite -noverify -noautoopen -mountpoint "$MOUNT" -quiet
mounted=true

ditto --norsrc --noextattr "$APP" "$MOUNT/LikeBird.app"
ln -s /Applications "$MOUNT/应用程序"
swift "$ROOT/scripts/installer-background.swift" "$MOUNT/.background.png"
python3 "$ROOT/scripts/installer-layout.py" "$MOUNT"
if [[ "$(uname -m)" == arm64 ]]; then
  bless --folder "$MOUNT"
else
  bless --folder "$MOUNT" --openfolder "$MOUNT"
fi
codesign --verify --deep --strict "$MOUNT/LikeBird.app"

hdiutil detach "$MOUNT" -quiet
mounted=false
hdiutil convert "$WRITABLE" -format UDZO -imagekey zlib-level=9 -o "$TEMP_DIR/LikeBird.dmg" -quiet
hdiutil verify "$TEMP_DIR/LikeBird.dmg" -quiet
mv -f "$TEMP_DIR/LikeBird.dmg" "$OUTPUT"
printf 'Built %s\n' "$OUTPUT"

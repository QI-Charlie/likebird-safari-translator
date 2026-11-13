#!/usr/bin/env bash
# Build a self-contained macOS host app containing the Safari Web Extension.
# Requires only the Xcode Command Line Tools for local use. For distribution,
# sign with a Developer ID / Apple Development identity.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(node -p "require(process.argv[1]).version" "$ROOT/package.json")"
IDENTITY="${CODESIGN_IDENTITY:--}"
ARCHS="${MACOS_ARCHS:-arm64 x86_64}"
arch_flags=()
for arch in $ARCHS; do arch_flags+=(-arch "$arch"); done

# Signing inside ~/Documents can fail because macOS' file provider constantly
# re-attaches FinderInfo xattrs. Assemble and sign in a plain temp directory,
# then copy the already-signed bundle into dist/.
BUILD_DIR="${TMPDIR:-/tmp}/likebird-build-$$"
APP="$BUILD_DIR/LikeBird.app"
APPEX="$APP/Contents/PlugIns/LikeBird Extension.appex"
DIST_APP="$ROOT/dist/LikeBird.app"
ZIP="$ROOT/dist/LikeBird-$VERSION.zip"
trap 'rm -rf "$BUILD_DIR"' EXIT

if ! command -v clang >/dev/null 2>&1; then
  echo "error: clang not found. Install Xcode Command Line Tools: xcode-select --install" >&2
  exit 1
fi

if [ ! -d "$ROOT/node_modules" ]; then
  echo "error: dependencies missing. Run: npm install" >&2
  exit 1
fi

echo "==> Building web extension"
node "$ROOT/scripts/build.mjs"

echo "==> Assembling Safari host app"
rm -rf "$BUILD_DIR" "$DIST_APP"
rm -f "$ZIP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources" "$APP/Contents/PlugIns"
mkdir -p "$APPEX/Contents/MacOS" "$APPEX/Contents/Resources" "$ROOT/dist"

cp "$ROOT/native/Info-App.plist" "$APP/Contents/Info.plist"
cp "$ROOT/native/Info-Appex.plist" "$APPEX/Contents/Info.plist"
cp "$ROOT/assets/AppIcon.icns" "$ROOT/assets/LikeBirdWordmark.png" "$APP/Contents/Resources/"
printf 'APPL????' > "$APP/Contents/PkgInfo"
printf 'XPC!????' > "$APPEX/Contents/PkgInfo"

# Web extension resources live at the root of the appex Resources directory.
ditto "$ROOT/extension" "$APPEX/Contents/Resources"

plutil -lint "$APP/Contents/Info.plist" >/dev/null
plutil -lint "$APPEX/Contents/Info.plist" >/dev/null
if [ ! -f "$APPEX/Contents/Resources/manifest.json" ]; then
  echo "error: manifest.json missing from appex resources" >&2
  exit 1
fi

echo "==> Compiling native host"
clang "${arch_flags[@]}" -fobjc-arc -mmacosx-version-min=12.0 \
  -framework Cocoa -framework SafariServices \
  -o "$APP/Contents/MacOS/LikeBird" "$ROOT/native/AppMain.m"

echo "==> Compiling Safari extension bridge"
clang "${arch_flags[@]}" -fobjc-arc -mmacosx-version-min=12.0 \
  -framework Foundation -framework SafariServices \
  -Wl,-e,_NSExtensionMain \
  -o "$APPEX/Contents/MacOS/LikeBirdExtension" "$ROOT/native/SafariWebExtensionHandler.m"

clear_metadata() {
  xattr -cr "$1" 2>/dev/null || true
  xattr -dr com.apple.FinderInfo "$1" 2>/dev/null || true
  xattr -dr 'com.apple.fileprovider.fpfs#P' "$1" 2>/dev/null || true
  dot_clean -m "$1" 2>/dev/null || true
}

# Code signing must be inside-out. Ad-hoc signing keeps this usable without a
# paid developer account; Safari still needs "Allow Unsigned Extensions".
echo "==> Signing (identity: $IDENTITY)"
clear_metadata "$APP"
if [ "$IDENTITY" = "-" ]; then
  codesign --force --sign - --entitlements "$ROOT/native/YiLiu.entitlements" "$APPEX"
  clear_metadata "$APPEX"
  codesign --force --sign - "$APP"
else
  codesign --force --sign "$IDENTITY" --options runtime --entitlements "$ROOT/native/YiLiu.entitlements" "$APPEX"
  clear_metadata "$APPEX"
  codesign --force --sign "$IDENTITY" --options runtime "$APP"
fi

echo "==> Verifying bundle"
codesign --verify --deep --strict --verbose=2 "$APP"

echo "==> Copying into dist"
ditto --norsrc --noextattr "$APP" "$DIST_APP"
for attempt in 1 2 3 4 5 6 7 8; do
  xattr -dr com.apple.FinderInfo "$DIST_APP" 2>/dev/null || true
  xattr -dr 'com.apple.fileprovider.fpfs#P' "$DIST_APP" 2>/dev/null || true
  if codesign --verify --deep --strict --verbose=2 "$DIST_APP"; then break; fi
  if [ "$attempt" = "8" ]; then
    echo "error: copied app failed signature verification" >&2
    exit 1
  fi
  sleep 0.25
done

echo "==> Packaging zip"
clear_metadata "$APP"
ditto -c -k --norsrc --noextattr --keepParent "$APP" "$ZIP"

cat <<EOF

Built:
  $DIST_APP
  $ZIP

Next:
  1. Drag LikeBird.app into /Applications and open it.
  2. Safari > Settings > Extensions, enable LikeBird.
  3. If it is not listed, enable Safari's Develop menu, then
     Develop > Allow Unsigned Extensions (repeat after every Safari restart).
  4. Open the extension settings and choose a service and connect with your API key.

For distribution, re-run with a signing identity:
  CODESIGN_IDENTITY="Apple Development: Your Name (TEAMID)" npm run app
EOF

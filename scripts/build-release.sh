#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
for name in michal-bartok martin-cirbus filip-kandrac jaroslav-kostial peter-lakota milan-rajter roman-sutka miroslav-turenic; do
  test -f "preview-assets/candidates/${name}-original.jpg" || {
    printf 'Missing release portrait: %s\n' "$name" >&2
    exit 1
  }
done

SITE_BUILD_MODE=release VITE_PRIVATE_PORTRAIT_PREVIEW=1 VITE_SITE_BUILD_MODE=release npm run build:placeholder
mkdir -p dist/images/candidates dist/images/council
cp preview-assets/candidates/*.jpg dist/images/candidates/
cp preview-assets/council/*.jpg dist/images/council/

#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
for name in michal-bartok martin-cirbus filip-kandrac jaroslav-kostial peter-lakota milan-rajter roman-sutka miroslav-turenic; do
  test -f "preview-assets/candidates/${name}-original.jpg" || {
    printf 'Missing photo-review asset: %s\n' "$name" >&2
    exit 1
  }
done

VITE_PRIVATE_PORTRAIT_PREVIEW=1 npm run build:placeholder
mkdir -p dist/images/candidates
cp preview-assets/candidates/*.jpg dist/images/candidates/

#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
for name in michal-bartok martin-cirbus filip-kandrac jaroslav-kostial peter-lakota milan-rajter roman-sutka miroslav-turenic; do
  test -f ".private/portrait-preview-images/${name}-original.jpg" || {
    printf 'Missing private portrait: %s\n' "$name" >&2
    exit 1
  }
done
VITE_PRIVATE_PORTRAIT_PREVIEW=1 npm run build:placeholder
mkdir -p dist/images/candidates
cp .private/portrait-preview-images/*.jpg dist/images/candidates/
exec npm run preview -- --host 127.0.0.1 --port 4173

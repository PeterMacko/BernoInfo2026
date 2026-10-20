#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
for name in michal-bartok martin-cirbus filip-kandrac jaroslav-kostial peter-lakota milan-rajter roman-sutka miroslav-turenic; do
  test -f "preview-assets/candidates/${name}-original.jpg" || {
    printf 'Missing release portrait: %s\n' "$name" >&2
    exit 1
  }
done

# Workers Builds sets WORKERS_CI_BRANCH. Non-main branches are review previews,
# never indexable releases, even though they share the same npm build command.
site_mode=release
if [[ -n "${WORKERS_CI_BRANCH:-}" && "${WORKERS_CI_BRANCH}" != main ]]; then
  site_mode=preview
fi
SITE_BUILD_MODE="$site_mode" VITE_PRIVATE_PORTRAIT_PREVIEW=1 VITE_SITE_BUILD_MODE="$site_mode" npm run build:placeholder
mkdir -p dist/images/candidates dist/images/council
cp preview-assets/candidates/*.jpg dist/images/candidates/
cp preview-assets/council/*.jpg dist/images/council/

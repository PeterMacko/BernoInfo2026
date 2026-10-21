#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
for name in michal-bartok martin-cirbus filip-kandrac jaroslav-kostial peter-lakota milan-rajter roman-sutka miroslav-turenic; do
  test -f "preview-assets/candidates/${name}-original.jpg" || {
    printf 'Missing release portrait: %s\n' "$name" >&2
    exit 1
  }
done

# Both CI platforms share this build command. Pages is preview-only, including
# its main branch; only the existing Workers main path is an indexable release.
site_mode=release
if [[ -n "${CF_PAGES:-}" || -n "${CF_PAGES_BRANCH:-}" || -n "${CF_PAGES_URL:-}" ]]; then
  if [[ "${CF_PAGES:-}" != 1 || -z "${CF_PAGES_BRANCH:-}" || -z "${CF_PAGES_URL:-}" || -n "${WORKERS_CI_BRANCH:-}" ]]; then
    printf 'Incomplete or conflicting Cloudflare Pages build context.\n' >&2
    exit 1
  fi
  if [[ -n "${SITE_ORIGIN:-}" && "${SITE_ORIGIN}" != "${CF_PAGES_URL}" ]]; then
    printf 'SITE_ORIGIN must match CF_PAGES_URL in a Pages build.\n' >&2
    exit 1
  fi
  site_mode=preview
  export SITE_ORIGIN="$CF_PAGES_URL"
elif [[ -n "${WORKERS_CI_BRANCH:-}" && "${WORKERS_CI_BRANCH}" != main ]]; then
  site_mode=preview
fi
SITE_BUILD_MODE="$site_mode" VITE_PRIVATE_PORTRAIT_PREVIEW=1 VITE_SITE_BUILD_MODE="$site_mode" npm run build:placeholder
mkdir -p dist/images/candidates dist/images/council
cp preview-assets/candidates/*.jpg dist/images/candidates/
cp preview-assets/council/*.jpg dist/images/council/

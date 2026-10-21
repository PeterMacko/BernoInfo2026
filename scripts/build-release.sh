#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
for name in michal-bartok martin-cirbus filip-kandrac jaroslav-kostial peter-lakota milan-rajter roman-sutka miroslav-turenic; do
  test -f "preview-assets/candidates/${name}-original.jpg" || {
    printf 'Missing release portrait: %s\n' "$name" >&2
    exit 1
  }
done

# Both CI platforms share this build command. Only main builds are indexable;
# Pages main uses the stable project URL rather than an immutable deployment URL.
site_mode=release
if [[ -n "${CF_PAGES:-}" || -n "${CF_PAGES_BRANCH:-}" || -n "${CF_PAGES_URL:-}" ]]; then
  if [[ "${CF_PAGES:-}" != 1 || -z "${CF_PAGES_BRANCH:-}" || -z "${CF_PAGES_URL:-}" || -n "${WORKERS_CI_BRANCH:-}" ]]; then
    printf 'Incomplete or conflicting Cloudflare Pages build context.\n' >&2
    exit 1
  fi
  if [[ ! "${CF_PAGES_URL}" =~ ^https://([a-z0-9-]+\.)?bernolakovo2026\.pages\.dev$ ]]; then
    printf 'CF_PAGES_URL must belong to the Bernolákovo Pages project.\n' >&2
    exit 1
  fi
  pages_origin="$CF_PAGES_URL"
  if [[ "$CF_PAGES_BRANCH" == main ]]; then
    pages_origin=https://bernolakovo2026.pages.dev
  else
    site_mode=preview
    if [[ "$CF_PAGES_URL" == https://bernolakovo2026.pages.dev ]]; then
      printf 'A Pages branch preview cannot use the public project URL.\n' >&2
      exit 1
    fi
  fi
  if [[ -n "${SITE_ORIGIN:-}" && "${SITE_ORIGIN}" != "$pages_origin" ]]; then
    printf 'SITE_ORIGIN conflicts with the expected Pages origin.\n' >&2
    exit 1
  fi
  export SITE_ORIGIN="$pages_origin"
elif [[ -n "${WORKERS_CI_BRANCH:-}" && "${WORKERS_CI_BRANCH}" != main ]]; then
  site_mode=preview
fi
SITE_BUILD_MODE="$site_mode" VITE_PRIVATE_PORTRAIT_PREVIEW=1 VITE_SITE_BUILD_MODE="$site_mode" npm run build:placeholder
mkdir -p dist/images/candidates dist/images/council
cp preview-assets/candidates/*.jpg dist/images/candidates/
cp preview-assets/council/*.jpg dist/images/council/

#!/usr/bin/env python3
"""Regenerate the issue 24 review-only PDF photo crops from the reviewed map.

Requires pdftoppm and Pillow. Outputs preview-assets/council/*.jpg; these files
are copied only by build:photo-review, never by build:placeholder.
"""
from pathlib import Path
from urllib.request import urlretrieve
import json
import subprocess
from PIL import Image

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'src/issue24-pdf-crops.json').read_text())
cache = root / '.private/issue24-pdf'
cache.mkdir(parents=True, exist_ok=True)
out = root / 'preview-assets/council'
out.mkdir(exist_ok=True)
for person_id, record in manifest.items():
    source, page = record['source'], record['viewerPage']
    pdf = cache / f'{source}.pdf'
    if not pdf.exists():
        urlretrieve(record['sourceUrl'].split('#')[0], pdf)
    frame = cache / f'{source}-{page}.png'
    if not frame.exists():
        subprocess.run(['pdftoppm', '-f', str(page), '-l', str(page), '-scale-to', '1200',
                        '-singlefile', '-png', str(pdf), str(frame.with_suffix(''))], check=True)
    with Image.open(frame) as original:
        crop = original.convert('RGB').crop(tuple(record['crop']))
        crop.save(out / f'{person_id}.jpg', quality=90, optimize=True)
print(f'Regenerated {len(manifest)} PDF photo crops for the review preview.')

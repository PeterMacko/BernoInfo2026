// Destination-type labels for the 21 alternate leads classified in
// docs/research/ISSUE27_LINK_CLASSIFICATION.md. These do not assert account ownership.
const alternateLabels = {
  'D1/1': 'Možný facebookový profil kandidátky — nepotvrdené',
  'D1/5': 'Možný facebookový profil kandidátky — nepotvrdené',
  'D1/8': 'Možný facebookový profil kandidáta — nepotvrdené',
  'D1/10': 'Možný facebookový profil kandidáta — nepotvrdené',
  'D1/11': 'Možný facebookový profil kandidátky — nepotvrdené',
  'D1/13': 'Možný facebookový profil kandidáta — nepotvrdené',
  'D1/14': 'Možný facebookový profil kandidáta — prevádzkovateľ neoverený',
  'D2/1': 'Možný facebookový profil alebo stránka — nepotvrdené',
  'D2/3': 'Možný facebookový profil kandidátky — nepotvrdené',
  'D2/6': 'Možný facebookový profil alebo stránka — nepotvrdené',
  'D2/8': 'Možný facebookový profil kandidáta — nepotvrdené',
  'D2/10': 'Kandidátsky označený facebookový profil — prevádzkovateľ neoverený',
  'D2/12': 'Možná facebooková stránka/profil kandidáta — nepotvrdené',
  'D2/13': 'Možný facebookový profil kandidáta — nejednoznačné',
  'D2/17': 'Možný facebookový profil kandidáta — nepotvrdené',
  'D2/18': 'Profil použitý v kampani — prevádzkovateľ neoverený',
  'D2/19': 'Možný facebookový profil kandidáta — nepotvrdené',
  'D3/1': 'Kandidátsky označená facebooková stránka',
  'D3/2': 'Možný facebookový profil — identita nejednoznačná',
  'D3/3': 'Profil použitý v kampani — prevádzkovateľ neoverený',
  'D3/5': 'Možný facebookový profil kandidáta — nepotvrdené',
}

export function alternateLinkLabel(key) {
  const label = alternateLabels[key]
  if (!label) throw new Error(`Missing alternate-link classification: ${key}`)
  return label
}

export const alternateLinkKeys = Object.keys(alternateLabels)
export const alternateLinkNote = 'Alternatívny odkaz z pracovnej kompilácie, skontrolovaný 20. októbra 2026. Zhoda osoby a vlastníctvo účtu nie sú nezávisle overené.'

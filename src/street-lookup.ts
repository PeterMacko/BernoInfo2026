import streetRows from './street-precincts.json'

export const districtSource = 'https://www.bernolakovo.sk/data/news_files/bernolakovo.sk/135341/uznesenia.pdf'
export const precinctSource = 'https://data.moderneobce.sk/data/uploads/bernolakovo.sk/VO%C4%BDBY_2026/Zaradenie_volebn%C3%BDch_okrskov_do_volebn%C3%BDch_obvodov_utvoren%C3%BDch_pre_vo%C4%BEby_poslancov_obecn%C3%A9ho_zastupite%C4%BEstva.pdf'
export const streetData = streetRows as { street: string; district: number; precinct: number }[]
export const checkedDate = '20. októbra 2026'
export const venues: Record<number, string> = {
  1: 'Základná škola, Školská 1, Bernolákovo',
  2: 'Základná škola, Školská 1, Bernolákovo',
  3: 'Základná škola, Školská 1, Bernolákovo',
  4: 'Základná škola, Školská 1, Bernolákovo',
  5: 'Základná škola, Školská 1, Bernolákovo',
  6: 'Kultúrny dom, Hlavná 107, Bernolákovo',
  7: 'Kultúrny dom, Hlavná 107, Bernolákovo',
  8: 'Kultúrny dom, Hlavná 107, Bernolákovo',
}

export function normalizeStreet(value: string): string {
  return value.trim().replace(/^(?:ulica|ul\.)\s+/iu, '').replace(/\s+(?:ulica|ul\.)$/iu, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('sk')
    .replace(/\s+/g, ' ').trim()
}

export function suggestStreets(value: string) {
  const key = normalizeStreet(value)
  return streetData.filter(row => normalizeStreet(row.street).includes(key))
}

export function findStreet(value: string) {
  const key = normalizeStreet(value)
  if (!key) return null
  const matches = streetData.filter(row => normalizeStreet(row.street) === key)
  return matches.length === 1 ? matches[0] : null
}

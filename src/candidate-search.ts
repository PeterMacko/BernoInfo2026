import { candidates } from './candidates'
import councilData from './council-candidates.json'

export const dualRoutes: Record<string, string> = {
  'c-f6b4af6c': 'bartok',
  'c-a4b1db7c': 'cirbus',
  'c-307ca828': 'kostial',
  'c-bb232e32': 'turenic',
}

export type SearchPerson = { id: string; name: string; route: string; context: string; aliases: string[] }

const mayorPeople: SearchPerson[] = candidates.map(candidate => ({
  id: candidate.id,
  name: candidate.registeredName,
  route: `/kandidati/${candidate.id}/`,
  context: 'Kandidát na starostu obce',
  aliases: [candidate.registeredName],
}))

export const searchPeople: SearchPerson[] = [...mayorPeople]
for (const district of councilData.districts) {
  for (const candidate of district.candidates) {
    const mayorId = dualRoutes[candidate.id]
    if (mayorId) {
      const person = searchPeople.find(row => row.id === mayorId)
      if (!person) throw new Error(`Missing mayoral route for ${candidate.id}`)
      person.context = `Kandidát na starostu aj poslanca · obvod ${district.number}`
      person.aliases.push(candidate.name)
    } else {
      searchPeople.push({
        id: candidate.id,
        name: candidate.name,
        route: `/kandidati-na-poslancov/${candidate.id}/`,
        context: `Kandidát na poslanca · obvod ${district.number}`,
        aliases: [candidate.name],
      })
    }
  }
}

// Academic titles are metadata in the council roster, not part of a name query.
const titleWords = new Set(['bc', 'mgr', 'ing', 'judr', 'phdr', 'mudr', 'rndr', 'paeddr', 'doc', 'prof', 'mba', 'llm', 'phd'])
export function normalizeCandidateName(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('sk')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(/\s+/).filter(word => word && !titleWords.has(word)).join(' ')
}

export function suggestCandidates(value: string): SearchPerson[] {
  const key = normalizeCandidateName(value)
  if (!key) return []
  return searchPeople.filter(person => person.aliases.some(alias => normalizeCandidateName(alias).includes(key)))
}

export function resolveCandidate(value: string): { kind: 'empty' | 'not-found' | 'ambiguous' | 'unique' | 'partial'; person?: SearchPerson; matches: SearchPerson[] } {
  const key = normalizeCandidateName(value)
  if (!key) return { kind: 'empty', matches: [] }
  const exact = searchPeople.filter(person => person.aliases.some(alias => normalizeCandidateName(alias) === key))
  if (exact.length === 1) return { kind: 'unique', person: exact[0], matches: exact }
  if (exact.length > 1) return { kind: 'ambiguous', matches: exact }
  const matches = suggestCandidates(value)
  return { kind: matches.length === 0 ? 'not-found' : matches.length > 1 ? 'ambiguous' : 'partial', matches }
}

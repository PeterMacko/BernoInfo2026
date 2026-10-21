import evidence from './issue24-evidence.json'
import councilData from './council-candidates.json'
import { dualRoutes } from './candidate-search'

// Only source-qualified relationships. Official nominations alone are never a connection.
export const reportedTurenicIds = ['c-a7eb4e22', 'c-6d9a5867', 'c-be773c61', 'c-a8a3f42b', 'c-73b7e5fe'] as const
const campaignIntroduction = 'Turenič – predstavenie v kampani'
const council = councilData.districts.flatMap(district => district.candidates)
const officialIds = new Set(council.map(person => person.id))
for (const id of reportedTurenicIds) if (!officialIds.has(id)) throw new Error(`Reported Turenič relationship references missing council candidate: ${id}`)
const connectionOf = (id: string) => (evidence as Record<string, {connection: string}>)[id]?.connection
const bartokIds = council.filter(person => connectionOf(person.id) === 'Tím Bartók').map(person => person.id)
const zaBerIds = council.filter(person => connectionOf(person.id) === 'ZA BERnolákovo').map(person => person.id)
const introductionIds = council.filter(person => connectionOf(person.id) === campaignIntroduction).map(person => person.id)

export type Connection = { id: string; controlLabel: string; title: string; qualification: string; members: string[]; previewOnly: boolean }
export const connections: Connection[] = [
  { id: 'bartok', controlLabel: 'Tím', title: 'Tím Bartók', qualification: 'Kampaňou predstavený tím podľa kandidátskeho webu; nejde o oficiálnu volebnú listinu.', members: ['c-f6b4af6c', ...bartokIds], previewOnly: false },
  { id: 'zaber', controlLabel: 'ZA BER', title: 'ZA BERnolákovo', qualification: 'Spoločné označenie v piatich individuálnych reklamách v obecnom časopise; nejde o oficiálnu volebnú listinu.', members: zaBerIds, previewOnly: false },
  { id: 'turenic-introductions', controlLabel: 'Tur súpis · neoverené', title: 'Možné predstavenia pri Tureničovi', qualification: 'Neoverený pracovný súpis zo 20. októbra pripisuje štyri predstavenia kampani; pomenované príspevky a dátumy chýbajú. Nejde o potvrdený tím ani oficiálnu volebnú listinu.', members: ['c-bb232e32', ...introductionIds], previewOnly: true },
  { id: 'turenic-reported', controlLabel: 'KDH SaS', title: 'KDH SaS – prepojenie podľa Petra', qualification: 'Peter 21. októbra 2026 potvrdil prepojenie piatich kandidátov s Miroslavom Tureničom. Piati majú oficiálnu nomináciu Demokrati, KDH, SaS; Turenič kandiduje ako nezávislý. Prepojenie je redakčný údaj od Petra, nie oficiálna spoločná volebná listina ani nezávislé overenie verejným zdrojom.', members: ['c-bb232e32', ...reportedTurenicIds], previewOnly: false },
]
export const canonicalPerson = (id: string) => dualRoutes[id] ? `mayor:${dualRoutes[id]}` : `council:${id}`
export const connectionsFor = (id: string, review: boolean) => connections.filter(group => (!group.previewOnly || review) && group.members.includes(id))

import evidence from './issue24-evidence.json'
import councilData from './council-candidates.json'
import turenicTeam from './turenic-team.json'
import { dualRoutes } from './candidate-search'

// Only source-qualified relationships. Official nominations alone are never a connection.
export const kdhSasIds = ['c-a7eb4e22', 'c-6d9a5867', 'c-be773c61', 'c-a8a3f42b', 'c-73b7e5fe'] as const
const council = councilData.districts.flatMap(district => district.candidates)
const officialIds = new Set(council.map(person => person.id))
for (const id of [...kdhSasIds, turenicTeam.mayor, ...turenicTeam.council]) if (!officialIds.has(id)) throw new Error(`Relationship references missing council candidate: ${id}`)
const connectionOf = (id: string) => (evidence as Record<string, {connection: string}>)[id]?.connection
const bartokIds = council.filter(person => connectionOf(person.id) === 'Tím Bartók').map(person => person.id)
const zaBerIds = council.filter(person => connectionOf(person.id) === 'ZA BERnolákovo').map(person => person.id)

export type Connection = { id: string; controlLabel: string; title: string; qualification: string; members: string[]; previewOnly: boolean }
export const connections: Connection[] = [
  { id: 'bartok', controlLabel: 'Tím', title: 'Tím Bartók', qualification: 'Kampaňou predstavený tím podľa kandidátskeho webu; nejde o oficiálnu volebnú listinu.', members: ['c-f6b4af6c', ...bartokIds], previewOnly: false },
  { id: 'zaber', controlLabel: 'ZA BER', title: 'ZA BERnolákovo', qualification: 'Spoločné označenie v piatich individuálnych reklamách v obecnom časopise; nejde o oficiálnu volebnú listinu.', members: zaBerIds, previewOnly: false },
  { id: 'kdh-sas', controlLabel: 'KDH SaS', title: 'KDH SaS – spoločná nominácia', qualification: 'Týchto päť kandidátov má v opravených úradných zoznamoch spoločnú nomináciu Demokrati, KDH, SaS. Samotná nominácia nedokazuje spoločnú kampaň. Miroslav Turenič do tejto skupiny nepatrí.', members: [...kdhSasIds], previewOnly: false },
  { id: 'turenic-team', controlLabel: 'Tím Turenič', title: 'Tím Turenič', qualification: 'Sedem kandidátov predstavených na kandidátskom webe Miroslava Tureniča v sekcii Môj tím, pozorované 23. októbra 2026. Nejde o spoločnú oficiálnu volebnú listinu; mená a čísla v obvodoch sa zhodujú s opravenými úradnými zoznamami.', members: [turenicTeam.mayor, ...turenicTeam.council], previewOnly: false },
]
export const canonicalPerson = (id: string) => dualRoutes[id] ? `mayor:${dualRoutes[id]}` : `council:${id}`
export const connectionsFor = (id: string, review: boolean) => connections.filter(group => (!group.previewOnly || review) && group.members.includes(id))

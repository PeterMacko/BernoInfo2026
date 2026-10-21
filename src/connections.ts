import evidence from './issue24-evidence.json'
import councilData from './council-candidates.json'
import { dualRoutes } from './candidate-search'

// Only source-qualified relationships. Official nominations alone are never a connection.
export const reportedTurenicIds = ['c-a7eb4e22', 'c-6d9a5867', 'c-be773c61', 'c-a8a3f42b', 'c-73b7e5fe'] as const
const campaignIntroduction = 'Turenič – predstavenie v kampani'
const council = councilData.districts.flatMap(district => district.candidates)
const connectionOf = (id: string) => (evidence as Record<string, {connection: string}>)[id]?.connection
const bartokIds = council.filter(person => connectionOf(person.id) === 'Tím Bartók').map(person => person.id)
const zaBerIds = council.filter(person => connectionOf(person.id) === 'ZA BERnolákovo').map(person => person.id)
const introductionIds = council.filter(person => connectionOf(person.id) === campaignIntroduction).map(person => person.id)

export type Connection = { id: string; title: string; qualification: string; members: string[]; previewOnly: boolean }
export const connections: Connection[] = [
  { id: 'bartok', title: 'Tím Bartók', qualification: 'Kampaňou predstavený tím podľa kandidátskeho webu; nejde o oficiálnu volebnú listinu.', members: ['c-f6b4af6c', ...bartokIds], previewOnly: false },
  { id: 'zaber', title: 'ZA BERnolákovo', qualification: 'Spoločné označenie v piatich individuálnych reklamách v obecnom časopise; nejde o oficiálnu volebnú listinu.', members: zaBerIds, previewOnly: false },
  { id: 'turenic', title: 'Možné prepojenia pri Tureničovi', qualification: 'Neoverené: štyri predstavenia podľa pracovného súpisu a samostatný päťčlenný podnet od Petra z 21. októbra. Nejde o potvrdený tím ani oficiálnu volebnú listinu.', members: ['c-bb232e32', ...introductionIds, ...reportedTurenicIds], previewOnly: true },
]
export const canonicalPerson = (id: string) => dualRoutes[id] ? `mayor:${dualRoutes[id]}` : `council:${id}`
export const connectionFor = (id: string, review: boolean) => connections.find(group => (!group.previewOnly || review) && group.members.includes(id))

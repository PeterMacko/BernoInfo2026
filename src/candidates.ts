/**
 * Transcribed in the municipality's corrected registered-candidate list order.
 * These are list numbers, not independently verified ballot-paper numbers.
 * Source: https://www.bernolakovo.sk/data/advertisement/bernolakovo.sk/532238/204396_zoznam-zaregistrovanych-kandidatov-pre-volby-starostu-obce.pdf
 * Checked: 2026-10-17.
 */
export const candidates = [
  { id: 'bartok', listNumber: 1, registeredName: 'Michal BARTÓK' },
  { id: 'cirbus', listNumber: 2, registeredName: 'Martin CIRBUS' },
  { id: 'kandrac', listNumber: 3, registeredName: 'Filip KANDRÁČ' },
  { id: 'kostial', listNumber: 4, registeredName: 'Jaroslav KOŠTIAL' },
  { id: 'lakota', listNumber: 5, registeredName: 'Peter LAKOTA' },
  { id: 'rajter', listNumber: 6, registeredName: 'Milan RAJTER' },
  { id: 'sutka', listNumber: 7, registeredName: 'Roman ŠUTKA' },
  { id: 'turenic', listNumber: 8, registeredName: 'Miroslav TURENIČ' },
] as const

export type CandidateId = (typeof candidates)[number]['id']

// Switch only after all eight local portraits have passed rights, identity,
// crop/quality, credit, and editorial review. Keep this null otherwise so the
// public view never mixes approved portraits with unresolved placeholders.
export const approvedPortraits: Record<CandidateId, string> | null = null
export const placeholderImage = '/images/portrait-placeholder.svg'

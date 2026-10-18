import reviewPortraits from './portrait-review.json'

/**
 * Transcribed in the municipality's corrected registered-candidate list order.
 * These are list numbers, not independently verified ballot-paper numbers.
 * Source: https://www.bernolakovo.sk/data/advertisement/bernolakovo.sk/532238/204396_zoznam-zaregistrovanych-kandidatov-pre-volby-starostu-obce.pdf
 * Checked: 2026-10-18.
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

export type ApprovedPortrait = {
  // Keep reviewed images on this site's own origin; never use signed CDN URLs.
  src: `/images/candidates/${string}`
  sourceUrl?: string
  credit: string
}

// Populate and switch only after all eight local portraits have passed rights,
// identity, crop/quality, credit, and editorial review. Keep null otherwise so
// the page never mixes approved portraits with unresolved placeholders.
// When enabling, update the no-JS fallback copy in index.html as well.
export const approvedPortraits: Record<CandidateId, ApprovedPortrait> | null = null
// Development photo-review mode only. The developer-branch build explicitly
// enables this with unapproved review copies; the final release must not use it.
// It does not confer identity, credit, crop, or publication approval.
export const privatePreviewPortraits: Record<CandidateId, ApprovedPortrait> | null =
  import.meta.env.VITE_PRIVATE_PORTRAIT_PREVIEW === '1'
    ? reviewPortraits as Record<CandidateId, ApprovedPortrait>
    : null
export const placeholderImage = '/images/portrait-placeholder.svg'

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
  import.meta.env.VITE_PRIVATE_PORTRAIT_PREVIEW === '1' ? {
    bartok: { src: '/images/candidates/michal-bartok-original.jpg', sourceUrl: 'https://www.facebook.com/photo/?fbid=122101064715406989&set=a.122101064019406989', credit: 'Autor fotografie neuvedený' },
    cirbus: { src: '/images/candidates/martin-cirbus-original.jpg', sourceUrl: 'https://www.facebook.com/photo/?fbid=1184825287086661&set=a.108861341349733', credit: 'Fotografia dodaná prevádzkovateľom projektu; autor neuvedený' },
    kandrac: { src: '/images/candidates/filip-kandrac-original.jpg', sourceUrl: 'https://www.facebook.com/photo/?fbid=122105035221374324&set=a.122099129853374324', credit: 'Autor fotografie neuvedený' },
    kostial: { src: '/images/candidates/jaroslav-kostial-original.jpg', sourceUrl: 'https://www.facebook.com/photo/?fbid=2717977855365231&set=a.1665486813947679', credit: 'Autor fotografie neuvedený' },
    lakota: { src: '/images/candidates/peter-lakota-original.jpg', sourceUrl: 'https://www.facebook.com/photo/?fbid=122104136715339077&set=a.122103409755339077', credit: 'Autor fotografie neuvedený' },
    rajter: { src: '/images/candidates/milan-rajter-original.jpg', sourceUrl: 'https://www.facebook.com/photo/?fbid=122102269641340128&set=a.122101506195340128', credit: 'Autor fotografie neuvedený' },
    sutka: { src: '/images/candidates/roman-sutka-original.jpg', sourceUrl: 'https://www.facebook.com/photo/?fbid=122093696823395107&set=a.122093695749395107', credit: 'Autor fotografie neuvedený' },
    turenic: { src: '/images/candidates/miroslav-turenic-original.jpg', sourceUrl: 'https://www.facebook.com/photo/?fbid=1645206470950417&set=a.235317941939284', credit: 'Autor fotografie neuvedený' },
  } : null
export const placeholderImage = '/images/portrait-placeholder.svg'

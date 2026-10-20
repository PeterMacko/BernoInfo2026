# Issue #24: PDF face/crop and campaign-connection handoff

**Observed 20 October 2026.** Review-preview evidence, not release-copy approval. Peter authorized the supplied photos for the review preview. This file identifies source depictions; photographer/credit and original capture date are not established by a PDF caption. No Facebook account action or new Facebook post review was performed. This is a bounded direct-PDF and public-web-page follow-up to [source reconciliation](ISSUE24_SOURCE_RECONCILIATION.md).

## Reproducible extraction frame

Sources (publisher: Obec Bernolákovo, magazine *Bernolák*; individual ad/medallion may be candidate-supplied):

- `26`: https://www.bernolakovo.sk/data/page/bernolakovo.sk/23117/bernolak_2_2026_web.pdf (25 viewer pages; relevant 18–24; printed 34–47).
- `22`: https://www.bernolakovo.sk/data/page/bernolakovo.sk/23117/casopis-bernolak-03-2022.pdf (21 viewer pages; relevant 16–18; printed 30–35).
- `18`: https://www.bernolakovo.sk/data/page/bernolakovo.sk/23117/casopis-bernolak-3-2018.pdf (17 viewer pages; relevant viewer 17; printed page not visible on this PDF page).

Render a target page with `pdftoppm -f N -l N -scale-to 1200 -png source.pdf page`. The boxes below are **pixel `left,top,right,bottom` in that rendered page**, origin top-left; crop with Pillow `im.crop((l,t,r,b))`. The 2026 render is 1200×854, 2022 is 1200×849, 2018 is 849×1200. Boxes conservatively surround the depicted person, but ad composites may require an alpha mask or manual refinement; retain the page as provenance. A face-to-name match below means the nearby *same medallion* explicitly prints that name, not independent biometric authentication. `photo` means a photographic depiction; `drawing` is not a usable photo. Candidate list numbers visible in ads are **not validated ballot numbers**. For direct asset variants prefer original campaign JPGs documented in the reconciliation, not a PDF cutout.

### 2026: mayoral medallions (viewer 18–19)

| Candidate | Viewer / printed | Photo crop (1200 frame) | Identification / ambiguity |
| --- | --- | --- | --- |
| Michal Bartók | 18 / 34 | `363,74,562,430` | Named yellow mayoral medallion; candidate also has direct campaign JPG. |
| Martin Cirbus | 18 / 34 | `42,476,221,772` | Named lower-left mayoral medallion. |
| Jaroslav Koštial | 18 / 35 | `633,85,806,359` | Named upper-right mayoral medallion. |
| Peter Lakota | 18 / 35 | `965,417,1157,645` | Named lower-right mayoral advert; composite/shoulder edge may need manual mask. |
| Milan Rajter | 19 / 36 | `392,266,483,373` | Small named photograph inside left-page advert; low resolution. |
| Roman Šutka | 19 / 36 | `43,474,269,726` | Named left-page advert; background and body included. |
| Miroslav Turenič | 19 / 37 | `984,203,1151,405` | Named right-page mayoral advert. |

No Filip Kandráč photographic medallion was found on these two rendered viewer pages; this is a page-scoped absence, not a broader photo-search conclusion.

### 2026: council medallions (viewer 20–24)

| Candidate (official district/sequence) | Viewer / printed | Photo crop (1200 frame) | Identification / ambiguity |
| --- | --- | --- | --- |
| Adéla Álló Ferancová D1/1 | 20 / 38 | `395,54,561,228` | Named yellow ad; also direct campaign JPG. |
| Peter Boros D1/2 | 20 / 38 | `405,251,561,425` | Named yellow ad; campaign site spells Boroš; official name Boros. |
| Jaroslav Cabúk D1/4 | 20 / 39 | `637,265,773,413` | Named blue medallion. |
| Lenka Dorčáková D1/5 | 20 / 38 | `399,630,561,804` | Named yellow ad; also direct JPG. |
| Damiána Džuganová D1/6 | 20 / 39 | `905,255,1043,391` | Named blue medallion. |
| Lenka Géč D1/7 | 20 / 39 | `636,420,795,599` | Named yellow ad; also direct JPG. |
| Radovan Hanic D1/8 | 20 / 39 | `636,609,812,803` | Named white medallion. |
| Ľuboslav Chudoba D1/10 | 21 / 40 | `391,240,562,413` | Named yellow ad; also direct JPG. |
| Trifon Popgeorgiev D1/12 | 21 / 41 | `761,237,883,395` | Named green ZA BER ad. |
| Peter Teplan D1/13 | 21 / 40 | `52,610,216,803` | Named white medallion. |
| Ján Valter D1/15 | 21 / 41 | `1011,238,1150,395` | Named green ZA BER ad. |
| Martin Berčík D2/2 | 22 / 42 | `43,44,209,261` | Named white medallion. |
| Veronika Donáthová D2/3 | 22 / 42 | `160,650,295,813` | Named green ZA BER ad. |
| Peter Dornai D2/4 | 22 / 42 | `48,271,218,452` | Named yellow ad; also direct JPG. |
| Roman Fiala D2/5 | 22 / 43 | `638,47,747,190` | Small named upper-right medallion; low resolution. |
| Valentína Heda Horňák D2/7 | 22 / 43 | `638,228,809,442` | Named white medallion. |
| Katarína Koporcová D2/9 | 22 / 42 | `322,661,432,800` | Named blue medallion. |
| Imrich Matúš D2/13 | 22 / 43 | `640,637,795,813` | Named yellow ad; also direct JPG. |
| Milan Maruškanič D2/11 | 23 / 44 | `190,253,326,397` | Named green ZA BER ad. |
| Miroslav Matula D2/12 | 23 / 44 | `323,249,431,388` | Named blue medallion; no Turenič team claim on this ad. |
| Erik Valček D2/17 | 23 / 45 | `651,88,746,205` | Named dark blue medallion; dark/low-resolution original. |
| Linda Voláriková D2/18 | 23 / 45 | `984,240,1156,422` | Named yellow ad; also direct JPG. |
| Peter Zámocký D2/19 | 23 / 45 | `638,639,747,776` | Named blue medallion; no Turenič team claim on this ad. |
| Michal Bartók D3/1 | 24 / 46 | `388,59,562,239` | Named yellow council ad; same person as mayor, not second identity. |
| Ondrej Ďuraj D3/4 | 24 / 46 | `43,251,222,443` | Named white medallion. |
| Dušan Chalani D3/5 | 24 / 46 | `48,643,219,795` | Named blue medallion; no Turenič team claim on this ad. |
| Miroslav Michelík D3/6 | 24 / 47 | `635,52,814,260` | Named white medallion. |
| Michal Plaštiak D3/7 | 24 / 47 | `638,272,813,451` | Named yellow ad; also direct JPG. |
| Erik Svorad D3/9 | 24 / 46 | `441,663,565,801` | Named green ZA BER ad. |
| Emil Špalda D3/10 | 24 / 47 | `641,647,753,787` | Named blue medallion; no Turenič team claim on this ad. |

The 2026 spread instead gives **drawings, not photographs** for Martina Brunel D1/3 (`20/38`), Linda Horná D1/9 and Iva Pipíšková D1/11 (`21/40`), Marek Jakubovič D2/8 (`22/43`), Michal Peleš D2/15 and Rastislav Požár D2/16 (`23/44`). Their drawn faces must not be extracted as portraits. D1/14 Turenič and D2/10 Koštial appear in the mayoral spread above; they are dual-office records. No reliable face for Achberger, Jaroslav Géc, Molnár, Butko or Slivka on these target pages. Other supplied direct JPGs are inventoried in the reconciliation, outside this PDF crop map.

### Archival photographic medallions

| Candidate | Source / viewer / printed | Photo crop (`-scale-to 1200`) | Identification / use limitation |
| --- | --- | --- | --- |
| Iva Pipíšková D1/11 | `22` / 16 / 30 | `44,180,181,340` | Named 2022 mayoral medallion; **2022 archival**. |
| Rastislav Požár D2/16 | `22` / 16 / 30 | `45,548,180,710` | Named 2022 mayoral medallion; **2022 archival**. |
| Martina Brunel D1/3 | `22` / 17 / 33 | `635,486,770,659` | Named 2022 council medallion; **2022 archival**. |
| Marek Jakubovič D2/8 | `22` / 18 / 35 | `634,25,771,227` | Named 2022 council medallion; **2022 archival**, monochrome. |
| Michal Peleš D2/15 | `18` / 17 / printed number not visible | `440,160,603,364` | Named 2018 council medallion; **2018 archival**. The paragraph mentions a 2018 Kisková team, not 2026 membership. |

The 2022 and 2018 photographs establish how those historic candidate entries were illustrated then; they do **not** establish that the present candidate still looks the same or that the photograph was captured in that publication year. The 2018 Peleš image is on the right half of a single portrait PDF page; no printed folio was visible in the rendering. Do not infer an archival team association in 2026.

## Connection assertions tightened to primary material

| Group / relation | Person set and source-backed assertion | Status and limit |
| --- | --- | --- |
| Tím Bartók — `explicit_team_membership` | [Bartók campaign candidate page](https://michalbartok.sk/kandidati), directly read 20 Oct: Bartók, Álló Ferancová, Boros (site Boroš), Dorčáková, Géč, Chudoba, Dornai, Matúš, Voláriková, Plaštiak. Page explicitly labels the nine council candidates by district and repeatedly states TÍM BARTÓK. Their individual 2026 magazine ads on viewer 20–24 corroborate the same label. | **Confirmed as campaign-presented team**, not official alliance or account ownership. Site publication dates not shown. Use official spelling for Boros. Bartók is separately registered for both offices. |
| ZA BERnolákovo — `explicit_team_membership`/campaign presentation | Five **individually named** green advertisements in municipal 2026 PDF: Popgeorgiev and Valter (`21/41`), Donáthová (`22/42`), Maruškanič (`23/44`), Svorad (`24/46`). Each carries the ZA BER logo/wordmark; Valter text says he runs with friends in ZA BERnolákovo. | **Confirmed campaign presentation of these five**, not an exhaustive roster and not personal-page ownership. The [shared page](https://www.facebook.com/zabernolakovo/) remains a campaign-page lead; no stable Facebook post/date was independently captured in this follow-up. |
| Turenič-related — `presented_by`, not team | The working attachment/reconciliation attributes Matula D2/12, Zámocký D2/19, Chalani D3/5 and Špalda D3/10 to introductions on [Turenič's campaign page root](https://www.facebook.com/100063832401156/). Their four named 2026 PDF medallions were inspected, but none names a Turenič team in visible ad copy. | **Unverified as group membership here.** Preserve `presented_by` only as an attachment-derived lead until a reachable, stable named post and date is retained. Do not turn their `nezávislý kandidát` labels into an endorsement. Turenič's own mayor/council registration is separate. |
| Shared official nominator | `Demokrati, KDH, SaS` for Horná, Pipíšková, Peleš, Ďuraj, Michelík; other list labels per official corrected lists in [reconciliation](ISSUE24_SOURCE_RECONCILIATION.md). | `official_nominator` only. Neither a photographic ad nor the 2018 Peleš/Kisková sentence establishes a 2026 mayoral team. |

All PDF assertions above: publication label 2026/2022/2018, exact issue date of an individual ad and photographer **unknown**, observed 20 October 2026. The source-supplied campaign page's original publication date is unknown, observed 20 October. Remaining ambiguity: crop edges/manual masking and credit; independent face confirmation beyond adjacent printed names; absent stable named Turenič posts; no exhaustive ZA BER Facebook chronology. The image and connection map is therefore suitable for **review-preview assembly and human visual check**, not automatic public identity or rights claims.

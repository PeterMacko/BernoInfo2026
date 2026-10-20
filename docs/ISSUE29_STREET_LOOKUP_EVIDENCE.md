# Issue #29 — street lookup evidence and implementation

Checked **20 October 2026**. Publisher of both PDFs: Obec Bernolákovo. The working copy of Peter's `obvody-2026-ulice.md` attachment was not present in this isolated developer worktree; the lead's [issue evidence comment](https://github.com/PeterMacko/BernoInfo2026/issues/29#issuecomment-6292096912) reports that its 123 rows match the July notice with no omissions or district conflicts. This implementation transcribes the municipality's PDF directly; it does **not** claim an independent comparison with the unavailable attachment.

| Fact | Primary source | Document date | SHA-256 of checked PDF |
| --- | --- | --- | --- |
| District streets and seats | [Resolution 18/24/2026, pp. 18–19 of resolution PDF](https://www.bernolakovo.sk/data/news_files/bernolakovo.sk/135341/uznesenia.pdf) | Adopted 23 June; signed text dated 30 June 2026 | `f46db91fb4032815136735db91377b32b34401d7bc949c0eb950d622da268c56` |
| Street → precinct, precinct → venue and precinct → district | [Precinct assignment notice, pp. 1–2](https://data.moderneobce.sk/data/uploads/bernolakovo.sk/VO%C4%BDBY_2026/Zaradenie_volebn%C3%BDch_okrskov_do_volebn%C3%BDch_obvodov_utvoren%C3%BDch_pre_vo%C4%BEby_poslancov_obecn%C3%A9ho_zastupite%C4%BEstva.pdf) | 29 July 2026 | `c2deb36f6d4145e7b80a35d10fc85e21d14bd2c65630c3a6bb095a813d7ab849` |
| Candidate roster per district | Existing [official corrected rosters and checked date](../src/council-candidates.json), already used by the council section | 2 September 2026; checked 20 October | See linked PDF per district in data |

The row-level evidence ledger is [`src/street-precincts.json`](../src/street-precincts.json): each row preserves the **July notice's exact street label**, district and precinct. All 123 entries were compared against the three street lists in resolution 18/24/2026. After accounting for the one documented label difference below, the sets of *(street, district)* pairs are identical, with no missing entries, duplicate streets or district conflicts. The precinct notice itself explicitly groups precincts under districts, so the UI does not derive district from venue. The exact venue is attached to each precinct in [`src/street-lookup.ts`](../src/street-lookup.ts).

| District | Resolution streets | July rows | Precincts (row counts) | Seats in resolution |
| --- | ---: | ---: | --- | ---: |
| 1 | 41 | 41 | 1 (7), 2 (13), 3 (21) | 5 |
| 2 | 47 | 47 | 4 (21), 5 (8), 6 (18) | 5 |
| 3 | 35 | 35 | 7 (18), 8 (17) | 3 |

**Source-label difference:** The June resolution prints **“Záhradkárska oblasť”** in district 3. The July notice prints **“Záhradkárska oblasť (pri Trnavskej)”** in precinct 8, also district 3. It is the sole set difference before this explicit equivalence is applied. The lookup uses the longer July label; a bare shortened query deliberately does not yield a precinct result. The fallback directory explains both labels. This avoids silently using a June-only label to assign a July precinct.

The July notice assigns precincts 1–5 to **Základná škola, Školská 1, Bernolákovo** and precincts 6–8 to **Kultúrny dom, Hlavná 107, Bernolákovo**. Thus district 2 contains both venues; a district alone cannot select one, but a uniquely matched July street can. No house number is collected. Unknown or ambiguous input receives no inferred assignment. Input remains in local React state, with no storage or request; clicking official links is a separate user action. The text-only directory and homepage `noscript` link preserve access without JavaScript.

This is a source comparison **as of 20 October**, not a claim that later notices do not exist. Recheck for updates before release and complete independent QA / Peter review; do not deploy from this branch.

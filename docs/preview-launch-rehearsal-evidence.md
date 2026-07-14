# Preview-launch rehearsal evidence

This record covers the non-production smoke rehearsal for GitHub issue #18.
It contains no tokens, cookies, signed preview parameters, or credential values.

## Rehearsal context

| Concern | Recorded value |
| --- | --- |
| Date | 2026-07-14 |
| Dataset | `preview-rehearsal` |
| Deployment | `dpl_8rzdUNTvqvZWiAcoXjnnASFi2EGo` |
| Exact origin | `https://nibbles-with-nifa-ke7g8z4wk-benson98.vercel.app` |
| Hosted Studio | `https://nibbles-with-nifa-preview-rehearsal.sanity.studio/` |
| Browser/device evidence | Unauthenticated HTTP checks only; authenticated Presentation and visual viewport evidence remain pending |

## Content used

- Recipe: `Spanish Tortilla` at `/recipes/spanish-tortilla`
- Travel essay: `Japan Trip` at `/articles/japan-trip`
- Products: 0
- Kitchen items: 0

The release owner explicitly chose fabricated smoke-test copy instead of a
genuinely authored recipe and travel essay. The records therefore exercise the
publishing mechanics but do **not** pass issue #18's genuine-content criterion
and must not be represented as Nifa's real recipe or travel account.

## Evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Draft records stayed private before publication | Pass | Fresh no-cookie requests returned `404` for both guessed detail routes; the titles were absent from home, archives, detail HTML, and metadata. |
| Published dataset contains one recipe and one travel essay | Pass | Published-perspective queries returned one Ready, Featured recipe and one Featured Travel Essay; raw queries returned no remaining draft counterparts. |
| Production dataset isolation | Pass | A raw production query returned no records for either rehearsal document ID, including their draft counterparts. |
| Commerce collections stay empty | Pass | Published-perspective queries returned 0 products and 0 kitchen items. |
| Public editorial routes revalidate after publication | Pass | Home, both archives, both details, shop, and kitchen returned `200`; the first stale detail requests returned `404`, then returned `200` after background revalidation. |
| Sparse home and archive navigation | Pass | Home links to both details; recipe and article archives each report one entry and link to the correct route. Empty commerce and kitchen modules are omitted from the editorial pages. |
| Detail content and accessible hero metadata | Pass | Both detail pages render the recorded title and body fields. Recipe hero alt and credit and article hero alt are present in public HTML. |
| Sharing metadata | Pass | Both details emit title, description, Open Graph image/title/description, and `summary_large_image` Twitter metadata from their public fields. |
| Misleading public controls | Pass | Target HTML contains no search, newsletter, basket, checkout, buy, add-to-cart, or placeholder social controls. |
| Anonymous session after publication | Pass | Fresh no-cookie requests render both published details and contain no preview banner. |
| Automated public empty/provider and Presentation seams | Pass | The 51-test suite and `npm run typecheck` passed during the rehearsal. |
| Hosted Presentation routes and Visual Editing overlays | Not verified | Release-owner screenshots and focus confirmation were not supplied in this run. |
| Recipe private-action and incomplete-Ready validation UI | Not verified | The final document is Ready and published, but no screenshot or copied validation result was supplied. |
| Exit-preview behavior in the authenticated authoring session | Not verified | Anonymous HTML has no preview banner; the authenticated browser's exit action was not independently observed. |
| Desktop and narrow-mobile visual layout | Not verified | Browser screenshot/runtime evidence was unavailable; HTTP and automated route checks cannot prove overflow or malformed visual regions. |
| Genuine-content acceptance criterion | Fail by explicit scope change | The release owner requested fabricated smoke-test content rather than providing real recipe and trip facts. |

## Screenshots still required for full issue acceptance

1. Hosted Presentation for each unpublished entry, showing the preview banner and
   field focus without exposing signed parameters or cookies.
2. Anonymous draft rejection before publication.
3. Published sparse home page and both detail pages.
4. Home, both archives, and both detail pages at desktop and narrow-mobile
   widths.

Until the genuine-content and manual browser evidence rows pass, issue #18
remains incomplete even though the deployment smoke test passes.

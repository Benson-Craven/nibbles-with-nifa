# Nibbles with Nifa

A calm, image-forward recipe and home-goods site built from the design direction in `DESIGN.md`. It uses original placeholder copy and Pexels photography; it is not affiliated with, or a copy of, the reference brand named in the design brief.

## Run it locally

```bash
npm install
npm run dev
```

Then visit [http://localhost:3000](http://localhost:3000).

## Build for production

```bash
npm run build
npm run start
```

## Content

Published Sanity documents are the site's authoritative content source. The embedded Studio lives at `/studio`.

The Studio's **Presentation** tool opens recipes and travel essays in their real site layouts, including unpublished drafts. Preview access is protected by Sanity's signed preview handshake, is clearly labelled, bypasses shared caching, and emits generic `noindex` metadata instead of draft titles or descriptions. Create a Viewer token in Sanity Manage and set it as the server-only `SANITY_API_READ_TOKEN`; never prefix this value with `NEXT_PUBLIC_`. Set `NEXT_PUBLIC_SITE_URL` to the deployed Next.js origin. When deploying the separately hosted Studio, set `SANITY_STUDIO_PREVIEW_URL` to the same frontend origin (both default to `http://localhost:3000` locally).

The Studio's **Creator profile** entry is a single reusable profile for Nifa. Once published, its public name and any optional biography, portrait, or social links appear consistently on every published recipe and article without being copied into individual entries.

Articles can be marked as **Travel essays** and record a specific place, visit date, last fact-check date, public acknowledgements, and sources. New essays use the deliberately limited Editorial body editor for paragraphs, headings, links, and pull quotes. Existing articles using Legacy sections remain supported; internal permission notes are never sent to public pages.

Recipes and articles share a deliberately small tag vocabulary in Studio. Choose a few specific tags per entry and extend the curated options only when Nifa's published work repeatedly needs a new term. Published entries marked **Featured on home** populate the existing recipe and editorial modules; drafts and non-featured entries remain in their archives only.

Both recipes and articles can explicitly link readers onward to published articles, recipes, shop products, and kitchen items. These recommendations follow the references selected in Studio rather than shared tags; unavailable destinations are omitted, and pages with no valid recommendations show no related-content section.

Travel essays can also carry an author-ordered sequence of images and short videos. Images require meaningful alternative text; captions and credits stay attached to each media item. Videos use keyboard-accessible native controls, never autoplay, and require a transcript when meaningful speech is present. Upload only short, compressed, web-ready 1080p MP4 copies to Sanity and retain original masters in personal backup storage.

The hosted Studio is available at [https://nibbles-with-nifa.sanity.studio](https://nibbles-with-nifa.sanity.studio). Invite editors in Sanity Manage, then they can sign in there to add recipes, articles, shop products, kitchen items, and ingredient images from any laptop.

Provider failures and empty Sanity collections are intentionally not replaced with unrelated sample entries. This keeps production publishing problems visible and prevents unpublished or unknown entries from appearing under placeholder slugs.

For local design work, the placeholder recipes, articles, shop items, and kitchen picks in [`app/data.ts`](./app/data.ts) remain available through explicit demo mode:

```bash
CONTENT_SOURCE=demo npm run dev
```

Leave `CONTENT_SOURCE` unset or set it to `sanity` for normal development and production. Demo mode is rejected when `NODE_ENV=production`.

### Sanity setup

1. Create a Sanity project at [sanity.io](https://www.sanity.io/).
2. Copy `.env.example` to `.env.local`.
3. Fill in `NEXT_PUBLIC_SANITY_PROJECT_ID`, set `CONTENT_SOURCE=sanity`, and keep `NEXT_PUBLIC_SANITY_DATASET=production` unless you created a different dataset. Add a Viewer token as `SANITY_API_READ_TOKEN` to enable authenticated draft previews, then restart the development server so Next.js loads it.
4. Start the app with `npm run dev`.
5. Visit [http://localhost:3000/studio](http://localhost:3000/studio) and sign in.
6. Create documents for recipes, products, kitchen items, and articles.
7. Add `http://localhost:3000` and the deployed frontend origin to Sanity CORS with **Allow credentials** enabled. CORS origins are exact: if you open the app as `http://127.0.0.1:3000`, add that origin separately. Set `SANITY_STUDIO_PREVIEW_URL` to the deployed frontend origin before deploying the hosted Studio.

Sanity schemas live in [`sanity/schemaTypes`](./sanity/schemaTypes). The Next app reads content through [`lib/content.ts`](./lib/content.ts), while [`lib/content-store.ts`](./lib/content-store.ts) keeps the production and demo sources explicit and independently testable.

## Checks

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

### Deploy Sanity Studio

To publish schema or Studio changes:

```bash
npm run sanity:deploy
```

The deploy uses [`sanity.cli.ts`](./sanity.cli.ts) and publishes to `nibbles-with-nifa.sanity.studio`.

### Import placeholder content into Sanity

To copy the current placeholder recipes, articles, products, and kitchen picks from `app/data.ts` into Sanity:

1. In Sanity Manage, create an API token with write permissions.
2. Add it to `.env.local` as `SANITY_WRITE_TOKEN`.
3. Run a dry run:

```bash
npm run sanity:seed:dry
```

4. Import the documents and upload the referenced images:

```bash
npm run sanity:seed
```

The import uses stable document IDs, so rerunning it updates the same recipe/product/article documents instead of creating duplicates.

### Import clearly labelled starter stories and recipes

For a layout demonstration without replacing any existing Sanity documents, the starter importer adds three visibly labelled, untested sample recipes and two visibly labelled sample stories with original generated images:

```bash
npm run sanity:seed:starter:dry
npm run sanity:seed:starter
```

The importer uses its own stable document IDs and skips any ID that already exists as either a published document or a draft, so later Studio edits and unpublishing decisions are not overwritten. The sample recipes are deliberately marked as untested in their public titles, summaries, headnotes, and notes; replace them with cooked, creator-authored recipes before launch.

### Migrate legacy ingredient rows

Older recipe documents may have ingredient items saved as plain strings. The Studio can still read those rows, but image upload is available on the newer Ingredient object rows. To convert existing rows:

```bash
npm run sanity:migrate-ingredients:dry
npm run sanity:migrate-ingredients
```

The migration keeps the ingredient text and turns each legacy row into an editable Ingredient object with image and alt text fields.

Routes included:

- `/` — home
- `/recipes` and `/recipes/[slug]` — recipe archive and details
- `/articles` and `/articles/[slug]` — editorial notes and linked assets
- `/shop` and `/shop/[slug]` — display-only shop
- `/kitchen` — curated kitchen list

The shop intentionally has no checkout or data collection.

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

The Studio's **Creator profile** entry is a single reusable profile for Nifa. Once published, its public name and any optional biography, portrait, or social links appear consistently on every published recipe and article without being copied into individual entries.

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
3. Fill in `NEXT_PUBLIC_SANITY_PROJECT_ID`, set `CONTENT_SOURCE=sanity`, and keep `NEXT_PUBLIC_SANITY_DATASET=production` unless you created a different dataset.
4. Start the app with `npm run dev`.
5. Visit [http://localhost:3000/studio](http://localhost:3000/studio) and sign in.
6. Create documents for recipes, products, kitchen items, and articles.
7. Add the deployed site domain to Sanity CORS when deploying, including `/studio`.

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

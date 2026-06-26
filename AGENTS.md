# agent.md — Build a Cabagges-style site

> Instructions for an AI coding agent. The goal is to recreate the **structure, layout, and feel** of cabagges.world — a personal food + lifestyle brand (recipes + a curated shop) by Anna Archibald + Kevin Serai.
>
> Pair this file with **DESIGN.md** (the visual source of truth). When the two disagree, DESIGN.md wins for _look_, this file wins for _how to build_.

---

## 0. Ground rules (read first)

1. **This is a structural/design clone, not a content heist.** Do **not** scrape, download, or reproduce the original site's photography, recipe text, or shop copy. Build the scaffold and fill it with **placeholder content** (lorem + royalty-free/AI-generated or self-shot images). The owners' words and photos are theirs.
2. **Brand names are placeholders here.** If this is a learning/portfolio clone, use a different project name and your own branding before publishing. Don't pass it off as the real Cabagges or "b.Eautiful."
3. **Keep intentional quirks only if intentionally cloning the style:** the lowercase/misspelled "Cabagges" and stylized "b.Eautiful" are deliberate. If you keep that style, keep it consistent.
4. Ask before adding paid services, analytics, or anything that collects user data.

---

## 1. Mission

Recreate a calm, image-forward editorial site with:

- A home page (rotating hero + featured recipes + shop teaser + "Our Kitchen").
- Recipe detail pages and a browsable Recipe Index.
- A simple Shop (home goods, gifts, a wine product).
- An "Our Kitchen" curated gear list (affiliate-style links + disclosure).

Tone: warm, intimate, unhurried, sensory. See DESIGN.md §3 for voice.

---

## 2. Tech stack _(recommended — confirm before scaffolding)_

This is a content-heavy, mostly-static, image-first site. Default recommendation:

| Concern   | Choice                                             | Why                                                  |
| --------- | -------------------------------------------------- | ---------------------------------------------------- |
| Framework | **Astro**                                          | Ships zero JS by default, great for content + images |
| Content   | **Markdown/MDX via Astro Content Collections**     | Recipes & products as files, type-safe               |
| Styling   | **Tailwind CSS** + CSS variables from DESIGN.md §6 | Fast, tokens map cleanly                             |
| Images    | Astro `<Image>` / `astro:assets`                   | Responsive, optimized                                |
| Fonts     | self-hosted (`@fontsource`) per DESIGN.md §5       | Performance + privacy                                |
| Deploy    | static host (Netlify / Vercel / Cloudflare Pages)  | It's a static site                                   |

**Alternative if a CMS or richer interactivity is required:** Next.js (App Router) + MDX. Don't introduce a database unless the shop needs real checkout — start static.

> If the user prefers a specific stack, follow that instead and adapt the structure below.

---

## 3. Setup & commands

Scaffold, then keep these working at every milestone:

```bash
# scaffold (Astro example)
npm create astro@latest cabagges-clone -- --template minimal --typescript strict
cd cabagges-clone
npx astro add tailwind mdx sitemap

# dev / build / preview
npm run dev        # local dev server
npm run build      # production build to ./dist
npm run preview    # serve the build locally
```

Document the actual chosen commands in a top-level `README.md` as you go.

---

## 4. Project structure (target)

```
src/
├── components/
│   ├── Nav.astro
│   ├── Footer.astro
│   ├── RecipeCard.astro
│   ├── ProductCard.astro
│   ├── SectionHeader.astro
│   └── Hero.astro
├── layouts/
│   └── BaseLayout.astro        # head, fonts, global tokens
├── content/
│   ├── config.ts               # collection schemas (zod)
│   ├── recipes/                # one .md/.mdx per recipe
│   ├── products/               # shop items
│   └── kitchen/                # "Our Kitchen" curated items
├── pages/
│   ├── index.astro             # home
│   ├── recipes/
│   │   ├── index.astro         # Recipe Index
│   │   └── [slug].astro        # recipe detail
│   ├── shop/
│   │   ├── index.astro
│   │   └── [slug].astro
│   └── kitchen.astro           # Our Kitchen
├── styles/
│   └── tokens.css              # CSS vars from DESIGN.md §5–§6
└── assets/                     # placeholder imagery
```

---

## 5. Content model

Define these collections (Astro `content/config.ts`, zod-typed):

**recipe**

```ts
{
  title: string,            // e.g. "Miso Mushroom Pasta"
  note?: string,            // optional one-line card subtitle
  heroImage: image,
  date: date,
  featured: boolean,        // shows on home "Featured Recipes"
  servings?: number,
  time?: { prep?: number, cook?: number },  // minutes
  ingredients: { group?: string, items: string[] }[],
  steps: string[],
  tags?: string[],
}
```

**product** (shop)

```ts
{
  title: string,
  blurb: string,            // one evocative sentence, e.g. the wine line
  image: image,
  price?: string,
  externalUrl?: string,     // e.g. items that live on the sister "goods" site
  category: "home" | "gift" | "host" | "wine" | "goods",
}
```

**kitchenItem** ("Our Kitchen")

```ts
{
  title: string,
  blurb: string,
  image: image,
  affiliateUrl?: string,    // render disclosure when present
}
```

Seed **3 featured recipes**, ~6 products (incl. one wine), and ~6 kitchen items of placeholder data so every layout has real-feeling content.

---

## 6. Pages & behavior

- **Home (`/`)** — Hero (rotating featured items/announcements) → Featured Recipes (3-up grid) → Shop teaser → "Our Kitchen" intro + items → entry link to Recipe Index. Mirror DESIGN.md §4 layout.
- **Recipe Index (`/recipes`)** — responsive card grid of all recipes; optional tag filter.
- **Recipe detail (`/recipes/[slug]`)** — hero image, title, meta (time, servings), ingredients, steps. Clean editorial type per DESIGN.md §5.
- **Shop (`/shop`, `/shop/[slug]`)** — product grid; external products link out.
- **Our Kitchen (`/kitchen`)** — curated list; show affiliate disclosure ("May contain affiliate links!") near the list, quietly.
- **Footer** (all pages) — creators' names, social, sister-brand link.

---

## 7. Styling rules

- Pull all colors, type scale, and spacing from **DESIGN.md §5–§6**; put them in `tokens.css` as CSS variables and reference via Tailwind theme extension.
- Image-forward: minimal chrome, generous whitespace, soft elevation, no heavy shadows.
- Links use the green accent with hover underline; don't rely on color alone.
- Mobile-first; single column under ~640px; 3-up grids collapse to stacked.

---

## 8. Build order (milestones)

Work in small, verifiable steps. Build must stay green after each.

1. **Scaffold** stack + Tailwind + tokens; `BaseLayout` with fonts/colors.
2. **Components**: Nav, Footer, SectionHeader, RecipeCard, ProductCard, Hero.
3. **Content collections** + schemas + seed placeholder data.
4. **Home page** assembled from components + seed data.
5. **Recipe Index + detail** pages.
6. **Shop + Our Kitchen** pages.
7. **Responsive pass** (mobile → desktop) + **a11y pass** (DESIGN.md §9).
8. **Polish**: image optimization, meta tags, sitemap, favicon, 404.

Commit after each milestone with a clear message.

---

## 9. Definition of done

- [ ] `npm run build` passes with no errors; `npm run preview` renders all routes.
- [ ] Home, Recipe Index, ≥1 recipe detail, Shop, Our Kitchen all work.
- [ ] Fully responsive 320px → 1440px; no horizontal scroll.
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95 on home + a recipe page.
- [ ] All interactive elements keyboard-reachable with visible focus.
- [ ] All images have descriptive alt text; no layout shift.
- [ ] Only placeholder/owned content — no scraped Cabagges assets.
- [ ] `README.md` documents setup, commands, and where to edit content.

---

## 10. Conventions

- TypeScript strict; no `any` without a comment.
- Components small and presentational; data fetching at the page level.
- Semantic HTML (`<article>`, `<nav>`, `<main>`, headings in order).
- Format with Prettier; lint clean before each commit.
- Don't add dependencies casually — prefer the platform; justify any new package.

---

## 11. Open questions to confirm with the user before/while building

1. Tech stack — Astro (default) or something specific?
2. Is the Shop display-only, or does it need real checkout?
3. Real CMS for non-dev editing, or markdown files are fine?
4. Project name/branding (since the real brand names shouldn't be reused as-is)?
5. Do you have actual visual specs (CSS/screenshots) to upgrade DESIGN.md's proposed sections to exact values? (See DESIGN.md §10.)

---

_Companion to DESIGN.md. Build the structure and feel; bring your own content._

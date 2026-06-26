# DESIGN.md — Cabagges (cabagges.world)

> A personal food + lifestyle brand by **Anna Archibald + Kevin Serai**: recipes, a curated shop, and a small home/kitchen world built around the idea that the things you keep should be _purposeful and meaningful_.

---

## 0. How to read this document

This file is split into two confidence levels:

- **Observed** — derived directly from the live content of cabagges.world. The brand, information architecture, content sections, and voice are transcribed from the site itself.
- **Proposed** — a recommended visual design language. The exact colors, typography, and spacing on the live site could not be inspected through the available tooling, so these sections are a coherent design _direction_ that fits the brand rather than a transcription of the production CSS. They are marked **(Proposed)**. Replace them with measured values once you can pull the real stylesheet (see §10).

---

## 1. Brand essence _(Observed)_

| Attribute        | Description                                                                  |
| ---------------- | ---------------------------------------------------------------------------- |
| **Name**         | Cabagges                                                                     |
| **Domain**       | cabagges.world                                                               |
| **Creators**     | Anna Archibald + Kevin Serai                                                 |
| **Category**     | Food blog + lifestyle/home shop                                              |
| **Sister brand** | "b.Eautiful" (Cabagges goods live here)                                      |
| **Promise**      | Recipes and objects that are purposeful, meaningful, and worth keeping close |

**Personality:** warm, intimate, editorial, considered. This is a _home_, not a storefront — the copy speaks in the first person plural ("our home," "our kitchen," "the ones we keep close"). The tone is unhurried and a little sensory.

**Tagline-level lines pulled from the site:**

- "Space in our home is limited, so the things we hold on to need to be purposeful and meaningful."
- On the wine: "A chilled red best enjoyed cold and sipped slowly among friends."

---

## 2. Information architecture _(Observed)_

```
Home
├── Featured Recipes
│   ├── Japanese Sweet Potato Milk Bread Pudding
│   ├── Miso Mushroom Pasta
│   └── Sticky Rice Stuffed Chicken
├── Shop  ("Beautiful things for the home, accessories for the
│           host or food lover, sweet tokens of affection…")
│   ├── Wine  (new chilled red)
│   └── Cabagges goods → links out to b.Eautiful
├── Our Kitchen  (curated, frequently-reached-for items; affiliate links)
└── Recipe Index  (full archive)
```

### Page types

1. **Home / landing** — rotating hero, featured recipes, shop teaser, "Our Kitchen," index entry point.
2. **Recipe detail** — individual recipe pages (linked from Featured + Index).
3. **Recipe Index** — browsable archive of all recipes.
4. **Shop / product** — home goods, host/food-lover accessories, gifts, wine.
5. **Our Kitchen** — editorial gear list with affiliate links.

---

## 3. Content & editorial voice _(Observed)_

- **Point of view:** first-person plural; reads like a couple inviting you in.
- **Register:** sensory and slow ("sipped slowly among friends"), never salesy.
- **Disclosure:** transparent and casual ("May contain affiliate links!").
- **Naming:** playful and personal — the misspelled, lowercase "Cabagges" and the stylized "b.Eautiful" are intentional brand quirks, not typos. **Preserve them exactly.**

**Writing rules to keep the voice consistent**

- Speak as "we"; address the reader as a guest, not a customer.
- Favor concrete, sensory detail over adjectives like "amazing."
- Keep product copy to one evocative sentence where possible.
- Disclose affiliate relationships plainly and without apology.

---

## 4. Layout system _(Proposed)_

A food/lifestyle site of this kind reads best as a calm editorial grid.

- **Container:** max content width ~1200px, generous side gutters.
- **Grid:** 12-column on desktop, single column on mobile.
- **Featured recipes:** 3-up card row (desktop) → stacked (mobile).
- **Whitespace:** intentionally airy; let imagery breathe — generous vertical rhythm between sections (≈96–120px desktop, ≈56px mobile).
- **Imagery-forward:** food photography is the primary visual element; UI chrome stays minimal so photos carry the page.
- **Hero:** rotating featured items / announcements (wine, new goods, recipes).

### Recipe card anatomy _(Proposed)_

```
┌──────────────────────────┐
│        [food photo]       │  4:3 or 3:2, rounded corners
├──────────────────────────┤
│  Recipe Title             │  serif display, link
│  (optional 1-line note)   │  small muted text
└──────────────────────────┘
```

---

## 5. Typography _(Proposed)_

A warm editorial pairing fits the brand: an expressive serif for display, a clean humanist sans for body.

| Role               | Suggested family                                           | Weight     | Use                              |
| ------------------ | ---------------------------------------------------------- | ---------- | -------------------------------- |
| Display / headings | Editorial serif (e.g. _Fraunces_, _Canela_, _GT Sectra_)   | 400–600    | Recipe titles, section headers   |
| Body               | Humanist sans (e.g. _Inter_, _Söhne_, _Neue Haas Grotesk_) | 400        | Paragraphs, captions             |
| Accent             | Same serif, italic                                         | 400 italic | Pull-quotes, the personal asides |

**Scale (suggested, 1.25 ratio):** `12 / 14 / 16 (base) / 20 / 25 / 31 / 39 / 49px`

- Line-height: 1.6 for body, 1.15–1.25 for display.
- Measure: 60–75 characters for body copy.

---

## 6. Color _(Proposed)_

A natural, kitchen-garden palette — warm neutrals with a vegetal accent that nods to the name.

| Token           | Hex       | Use                                       |
| --------------- | --------- | ----------------------------------------- |
| `--bg`          | `#FBF8F2` | Page background (warm off-white / paper)  |
| `--ink`         | `#2A2724` | Primary text                              |
| `--ink-muted`   | `#6F6A62` | Secondary text, captions                  |
| `--accent`      | `#5C7A4A` | Cabbage/sage green — links, accents       |
| `--accent-deep` | `#3E5733` | Hover / emphasis                          |
| `--wine`        | `#7A3B45` | Product accent (echoes the "chilled red") |
| `--line`        | `#E7E0D4` | Hairlines, dividers, card borders         |

> ⚠️ These are a recommended palette, **not** sampled from the live site. Sample the real values before shipping (§10).

---

## 7. Components _(Proposed)_

- **Nav:** lightweight top bar — wordmark left, links right (Recipes, Shop, Our Kitchen, Index). Collapses to a menu on mobile.
- **Recipe card:** photo + serif title + optional note; whole card is the link.
- **Product teaser:** photo + one-line evocative description + price/CTA.
- **Section header:** small label + serif heading + optional intro paragraph.
- **Affiliate disclosure:** quiet inline note near curated lists.
- **Footer:** creators' names (Anna Archibald + Kevin Serai), social, b.Eautiful link.

**Buttons / links**

- Links: `--accent`, underline on hover.
- Primary button: solid `--ink` or `--accent`, generous padding, subtle radius.
- Avoid heavy shadows; keep elevation soft and natural.

---

## 8. Imagery _(Proposed / from content cues)_

- **Style:** natural light, warm tones, real food and real homes — editorial but unfussy. Consistent with the "things we keep close" ethos.
- **Treatment:** minimal filtering; let the food look like food.
- **Aspect ratios:** 3:2 / 4:3 for cards; full-bleed or wide hero for features.
- **Alt text:** descriptive and appetizing; name the dish.

---

## 9. Accessibility & responsiveness _(Proposed)_

- Maintain WCAG AA contrast (verify `--accent` on `--bg` for small text; darken to `--accent-deep` where needed).
- Mobile-first; single column under ~640px.
- Tap targets ≥44px; visible focus states on all interactive elements.
- Don't rely on color alone for links — keep underlines or clear affordances.

---

## 10. To finalize the real visual spec

The visual sections above are a proposed direction. To replace them with the site's actual design system, capture any of:

1. The site's CSS (or the `<style>` / linked stylesheet URLs).
2. A full-page screenshot of the homepage + a recipe page.
3. The values from browser dev tools: computed `font-family`, key `color` / `background-color`, container `max-width`, and section spacing.

With any of those I can swap §4–§8 from **Proposed** to **Observed** and give you exact tokens.

---

_Generated from the live content of cabagges.world. Visual-design sections are a recommended direction pending inspection of the production stylesheet._

# Nibbles visual foundation

This note records the shared visual rules implemented in the token, base and
component CSS layers. Page-specific homepage, recipe and Travel compositions
remain outside this foundation.

## Brand and type

- Near-white paper and surfaces keep food photography bright. Pale mint carries
  the main green mood, while a deeper leaf green is reserved for readable text
  and brand details. Icy sky, seafoam, petal pink, lilac and butter echo the
  airy favicon and share one bloom gradient so the header, menu, creator panel
  and footer feel floral, beachy and related without weakening text contrast.
  Slate blue connects that favicon mood to readable labels, links and CTA
  outlines, with pale mint and sky reserved for their lighter fills.
- Self-hosted Montserrat from Google Fonts is the only site typeface. Use weight
  400 for body copy, headings, cards, labels, controls and navigation; the large
  homepage masthead is the only 600-weight exception. The compact shared type
  scale keeps photography dominant, while the homepage masthead retains its
  original scale.
- Use charcoal for primary text, muted grey for supporting labels and summaries,
  and white only when text sits on a dark surface. Keep playful palette colour
  in surfaces, rules, borders and underlines rather than introducing more text
  colours. Sanity-authored headings retain their pale-mint underline and authored
  introductions retain their light sky-to-seafoam wash.
- Keep the top-left home link as the simple lowercase text “nibbles with nifa”.
  It should stay quiet and readable rather than becoming a decorative logo.

## Photography and crops

- Prioritise owned photography that is close, colourful and casual, and match
  every image to the food, place or person named by the surrounding content.
- Preserve accurate colour with no colour filters. Use `object-fit: cover` and
  the shared card, landscape, story and square crop tokens instead of inventing
  one-off ratios for reusable components.
- Publish images only with authored alt text. Missing media keeps the deliberate
  layout-preserving fallback; it is never replaced with an unrelated picture or
  guessed description.

## Geometry, surfaces and interaction

- Controls, cards, reusable media and feature surfaces use progressively larger
  radii. Circles and pills remain reserved for genuinely circular portraits,
  arrow controls and short annotations.
- Shared section surfaces use warm paper, light surface, the standard border and
  the controlled radius scale rather than sticker silhouettes on every item.
- Buttons keep a visible border and sand-coloured offset shadow, arrow
  treatments keep their own shape, and annotations keep a green rule so their
  meaning is not carried by colour alone. Reusable media alternates seafoam,
  lilac and sky shadow accents within the same controlled geometry.
- Card movement is restrained and pointer-only. Every title, image, action and
  annotation remains complete in the static state, and reduced-motion mode
  removes decorative transforms.

# Nibbles visual foundation

This note records the shared visual rules implemented in the token, base and
component CSS layers. Page-specific homepage, recipe and Travel compositions
remain outside this foundation.

## Brand and type

- Warm paper and light surfaces keep food photography bright. Brand green is
  the primary control and link colour; tomato is the stronger food accent.
- Larsseit leads headings, cards, labels, controls and navigation. Newsreader is
  reserved for long-form Travel reading and a small number of storytelling
  moments such as article standfirsts and recipe introductions.
- The code-native Nibbles wordmark is the stable implementation seam. Its
  accessible name remains “Nibbles with Nifa” even when its decorative pieces
  are visually rearranged.

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
- Buttons keep a visible border and offset shadow, arrow treatments keep their
  own shape, and annotations keep a tomato rule so their meaning is not carried
  by colour alone.
- Card movement is restrained and pointer-only. Every title, image, action and
  annotation remains complete in the static state, and reduced-motion mode
  removes decorative transforms.

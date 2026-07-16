import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appFile = (path: string) => new URL(`../app/${path}`, import.meta.url);
const publicFile = (path: string) =>
  new URL(`../public/${path}`, import.meta.url);
const projectFile = (path: string) => new URL(`../${path}`, import.meta.url);

function relativeLuminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((value) => Number.parseInt(value, 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4),
    );

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string) {
  const lighter = Math.max(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  const darker = Math.min(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );

  return (lighter + 0.05) / (darker + 0.05);
}

test("Kitchen Passport CSS loads one ordered design-system foundation", async () => {
  const globals = await readFile(appFile("globals.css"), "utf8");

  assert.match(
    globals,
    /@import "tailwindcss";\s*@import "\.\/styles\/tokens\.css";\s*@import "\.\/styles\/base\.css";\s*@import "\.\/styles\/shared-components\.css";\s*@import "\.\/styles\/page-compositions\.css";/,
  );
  assert.doesNotMatch(globals, /Youthful lifestyle pass|Button sizing pass/);
});

test("Nibbles tokens expose the playful food-brand palette, type, spacing, crop, and geometry", async () => {
  const tokens = await readFile(appFile("styles/tokens.css"), "utf8");
  const license = await readFile(
    publicFile("fonts/montserrat/OFL.txt"),
    "utf8",
  );
  const normalFont = await readFile(
    publicFile("fonts/montserrat/Montserrat-Latin.woff2"),
  );
  const italicFont = await readFile(
    publicFile("fonts/montserrat/Montserrat-Italic-Latin.woff2"),
  );

  assert.match(license, /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.ok(normalFont.byteLength > 10_000);
  assert.ok(normalFont.byteLength < 100_000);
  assert.ok(italicFont.byteLength > 10_000);
  assert.ok(italicFont.byteLength < 100_000);
  for (const font of [normalFont, italicFont]) {
    assert.equal(font.toString("ascii", 0, 4), "wOF2");
  }
  assert.match(
    tokens,
    /font-family: "Montserrat";[\s\S]*?font-style: normal;[\s\S]*?font-weight: 400 600;[\s\S]*?Montserrat-Latin\.woff2/,
  );
  assert.match(
    tokens,
    /font-family: "Montserrat";[\s\S]*?font-style: italic;[\s\S]*?font-weight: 400;[\s\S]*?Montserrat-Italic-Latin\.woff2/,
  );
  assert.match(tokens, /--font-utility: "Montserrat"/);
  assert.doesNotMatch(tokens, /Larsseit|Newsreader|--font-editorial/);
  assert.match(tokens, /--color-text-primary: var\(--color-charcoal\)/);
  assert.match(tokens, /--color-text-secondary: var\(--color-muted\)/);
  assert.match(tokens, /--color-text-inverse: var\(--color-surface\)/);

  for (const value of [
    "#fffaf2",
    "#ffffff",
    "#292824",
    "#68645d",
    "#b9dfc8",
    "#315f43",
    "#3c617e",
    "#8e6129",
    "#e4f3ea",
    "#f8e6e9",
    "#eee7f6",
    "#dff1fb",
    "#f7e8b8",
    "#5d6d8b",
    "#e8e1d7",
  ]) {
    assert.match(tokens.toLowerCase(), new RegExp(value));
  }
  assert.doesNotMatch(
    tokens.toLowerCase(),
    /#176b45|#356b49|#4b633e|#a7462f|#c2412d/,
  );
  assert.doesNotMatch(tokens, /--color-tomato|--color-annotation/);
  assert.match(
    tokens,
    /--gradient-bloom: linear-gradient\([\s\S]*?var\(--color-sky\)[\s\S]*?var\(--color-seafoam\)[\s\S]*?var\(--color-floral\)[\s\S]*?var\(--color-petal\)/,
  );
  assert.match(
    tokens,
    /--gradient-bloom-soft: linear-gradient\([\s\S]*?var\(--color-surface\)[\s\S]*?var\(--color-sky\)[\s\S]*?var\(--color-seafoam\)[\s\S]*?var\(--color-petal\)/,
  );

  for (const value of [4, 8, 12, 16, 24, 32, 48, 64, 96, 128]) {
    assert.match(tokens, new RegExp(`--space-${value}: ${value}px`));
  }

  for (const token of [
    "--text-meta",
    "--text-annotation",
    "--text-summary",
    "--text-body",
    "--text-instruction",
    "--text-card-title",
    "--text-section-title",
    "--text-page-title",
    "--text-masthead",
  ]) {
    assert.match(tokens, new RegExp(`${token}: clamp\\(`));
  }

  for (const [token, value] of [
    ["--text-meta", "clamp(11px, 0.25vw + 10px, 13px)"],
    ["--text-annotation", "clamp(12px, 0.25vw + 11px, 14px)"],
    ["--text-summary", "clamp(14px, 0.2vw + 13px, 15px)"],
    ["--text-body", "clamp(15px, 0.2vw + 14px, 16px)"],
    ["--text-instruction", "clamp(15px, 0.2vw + 14px, 16px)"],
    ["--text-card-title", "clamp(17px, 0.4vw + 16px, 20px)"],
    ["--text-section-title", "clamp(24px, 1.4vw + 19px, 36px)"],
    ["--text-page-title", "clamp(32px, 2.8vw + 22px, 54px)"],
    ["--text-masthead", "clamp(64px, 11vw + 30px, 160px)"],
  ]) {
    assert.ok(tokens.includes(`${token}: ${value}`));
  }

  assert.match(tokens, /--border-standard: 1px solid var\(--color-line\)/);
  assert.match(tokens, /--radius-control: 12px/);
  assert.match(tokens, /--radius-card: 20px/);
  assert.match(tokens, /--radius-media: 24px/);
  assert.match(tokens, /--radius-feature: 32px/);
  assert.match(tokens, /--radius-pill: 999px/);
  assert.match(tokens, /--shadow-control: 3px 3px 0 var\(--color-sand\)/);
  assert.match(tokens, /--crop-card: 4 \/ 5/);
  assert.match(tokens, /--crop-landscape: 4 \/ 3/);
  assert.match(tokens, /--crop-story: 3 \/ 2/);
  assert.match(tokens, /--crop-square: 1/);
  assert.match(
    tokens,
    /--section-space: clamp\(var\(--space-48\), 7vw, var\(--space-96\)\)/,
  );
  assert.match(tokens, /--breakpoint-small: 640px/);
  assert.match(tokens, /--breakpoint-medium: 900px/);
  assert.match(tokens, /--breakpoint-large: 1200px/);
});

test("Montserrat is the only site typeface and 400 is the default weight", async () => {
  const tokens = await readFile(appFile("styles/tokens.css"), "utf8");
  const base = await readFile(appFile("styles/base.css"), "utf8");
  const shared = await readFile(
    appFile("styles/shared-components.css"),
    "utf8",
  );
  const pages = await readFile(appFile("styles/page-compositions.css"), "utf8");
  const button = await readFile(
    projectFile("components/ui/button.tsx"),
    "utf8",
  );
  const trail = await readFile(
    projectFile("components/ui/image-trail-demo.tsx"),
    "utf8",
  );
  const css = `${tokens}\n${base}\n${shared}\n${pages}`;

  assert.doesNotMatch(css, /Larsseit|Newsreader|--font-editorial/);
  for (const family of css.matchAll(/font-family:\s*([^;]+);/g)) {
    assert.ok(
      ['"Montserrat"', "var(--font-utility)"].some((value) =>
        family[1].startsWith(value),
      ),
      `unexpected font family: ${family[1]}`,
    );
  }
  assert.match(base, /body \{[\s\S]*?font-weight: 400/);
  assert.match(base, /h1,\s*h2,\s*h3,\s*h4 \{[\s\S]*?font-weight: 400/);
  assert.match(base, /b,\s*strong \{[\s\S]*?font-weight: 400/);
  assert.doesNotMatch(
    `${base}\n${shared}\n${pages}`,
    /font-weight:\s*(?!400\b)\d+/,
  );
  assert.match(button, /\bfont-normal\b/);
  assert.doesNotMatch(button, /\bfont-(?:medium|semibold|bold)\b/);
  assert.match(trail, /<p className="[^"]*\bfont-normal\b/);
  assert.match(trail, /<h1 className="[^"]*\bfont-semibold\b/);
  assert.match(trail, /text-\[clamp\(2\.25rem,12vw,var\(--text-masthead\)\)\]/);
  assert.match(trail, /<span className="block whitespace-nowrap">nibbles with/);
});

test("site text uses one primary, one secondary, and one inverse colour", async () => {
  const base = await readFile(appFile("styles/base.css"), "utf8");
  const shared = await readFile(
    appFile("styles/shared-components.css"),
    "utf8",
  );
  const pages = await readFile(appFile("styles/page-compositions.css"), "utf8");
  const trail = await readFile(
    projectFile("components/ui/image-trail-demo.tsx"),
    "utf8",
  );

  const allowedColors = new Set([
    "inherit",
    "var(--color-text-primary)",
    "var(--color-text-secondary)",
    "var(--color-text-inverse)",
  ]);
  for (const match of `${base}\n${shared}\n${pages}`.matchAll(
    /^\s*color:\s*([^;!]+)(?:\s*!important)?;/gm,
  )) {
    assert.ok(
      allowedColors.has(match[1].trim()),
      `unexpected text colour: ${match[1].trim()}`,
    );
  }
  assert.match(
    trail,
    /<p className="[^"]*text-\[var\(--color-text-secondary\)\]/,
  );
  assert.match(
    trail,
    /<h1 className="[^"]*text-\[var\(--color-text-primary\)\]/,
  );
});

test("the header brand stays a simple text home link", async () => {
  const breadcrumb = await readFile(
    appFile("components/NavBreadcrumb.tsx"),
    "utf8",
  );
  const shared = await readFile(
    appFile("styles/shared-components.css"),
    "utf8",
  );

  assert.match(
    breadcrumb,
    /<PageLink className="mini-brand" href="\/">\s*nibbles with nifa\s*<\/PageLink>/,
  );
  assert.doesNotMatch(breadcrumb, /NibblesWordmark|wordmark__/);
  assert.doesNotMatch(shared, /\.nibbles-wordmark|\.wordmark__/);
});

test("Kitchen Passport base styles remove smooth scrolling and respect reduced motion", async () => {
  const base = await readFile(appFile("styles/base.css"), "utf8");
  const shared = await readFile(
    appFile("styles/shared-components.css"),
    "utf8",
  );
  const pages = await readFile(appFile("styles/page-compositions.css"), "utf8");
  const css = `${base}\n${shared}\n${pages}`;

  assert.doesNotMatch(css, /scroll-behavior:\s*smooth/);
  const reducedMotionStyles = base.slice(
    base.indexOf("@media (prefers-reduced-motion: reduce)"),
  );
  assert.match(reducedMotionStyles, /animation-duration: 0\.01ms !important/);
  assert.match(reducedMotionStyles, /transition-duration: 0\.01ms !important/);
  assert.match(reducedMotionStyles, /scroll-behavior: auto !important/);
  assert.match(
    shared.slice(shared.indexOf("@media (prefers-reduced-motion: reduce)")),
    /transform: none/,
  );
  assert.match(
    pages.slice(pages.indexOf("@media (prefers-reduced-motion: reduce)")),
    /transform: none/,
  );
  assert.doesNotMatch(css, /#fff9ef|#5faf34|#ff7d66|#9fd7ff|#ffd85f/i);
  assert.doesNotMatch(css, /--color-tomato|--color-annotation/);
  assert.match(
    shared,
    /\.eyebrow,[\s\S]*?border-left: 3px solid var\(--color-sky-ink\)/,
  );
  assert.match(
    shared,
    /\.button \{[\s\S]*?border: 2px solid var\(--color-sky-ink\)[\s\S]*?box-shadow: var\(--shadow-control\)/,
  );
  assert.match(
    shared,
    /\.button \{[\s\S]*?background: var\(--color-brand\);[\s\S]*?color: var\(--color-text-primary\)/,
  );
  assert.match(shared, /\.button > span:last-child \{/);
  assert.match(
    shared,
    /@media \(hover: hover\) and \(pointer: fine\)[\s\S]*?transform: translateY\(-4px\)/,
  );
  assert.match(
    base,
    /:focus-visible[\s\S]*outline: 3px solid var\(--color-surface\)[\s\S]*box-shadow|:focus-visible[\s\S]*box-shadow[\s\S]*outline: 3px solid var\(--color-surface\)/,
  );
  assert.match(
    base,
    /::selection[\s\S]*background: var\(--color-brand\)[\s\S]*color: var\(--color-text-primary\)/,
  );

  for (const breakpoint of [640, 900, 1200]) {
    assert.match(css, new RegExp(`@media \\(min-width: ${breakpoint}px\\)`));
  }
  assert.doesNotMatch(
    css,
    /@media[^\{]*(?:420|560|561|700|760|920|980|1020)px/,
  );
});

test("green, floral, and beach tones participate in the shared interface", async () => {
  const shared = await readFile(
    appFile("styles/shared-components.css"),
    "utf8",
  );
  const pages = await readFile(appFile("styles/page-compositions.css"), "utf8");
  const css = `${shared}\n${pages}`;

  for (const token of [
    "brand",
    "brand-ink",
    "citrus",
    "seafoam",
    "petal",
    "floral",
    "sky",
    "sky-ink",
    "sand",
  ]) {
    assert.match(css, new RegExp(`var\\(--color-${token}\\)`));
  }

  assert.match(
    shared,
    /\.site-header \{[\s\S]*?background: var\(--gradient-bloom-soft\)/,
  );
  assert.match(
    shared,
    /\.site-footer \{[\s\S]*?background: var\(--gradient-bloom\)[\s\S]*?color: var\(--color-text-primary\)/,
  );
  assert.doesNotMatch(
    shared,
    /\.site-footer \{[^}]*background: var\(--color-brand\)/,
  );
  assert.match(
    shared,
    /\.footer-premise \.eyebrow \{[\s\S]*?border-left-color: var\(--color-sky-ink\)/,
  );
  assert.doesNotMatch(shared, /\n\s*color: var\(--color-brand\)/);
  assert.match(
    shared,
    /\.recipe-carousel__image,[\s\S]*?box-shadow: 6px 6px 0 var\(--color-seafoam\)/,
  );
  assert.match(shared, /box-shadow: 6px 6px 0 var\(--color-floral\)/);
  assert.match(shared, /box-shadow: 6px 6px 0 var\(--color-sky\)/);
});

test("shared photography rules favour truthful authored images and controlled crops", async () => {
  const tokens = await readFile(appFile("styles/tokens.css"), "utf8");
  const shared = await readFile(
    appFile("styles/shared-components.css"),
    "utf8",
  );
  const pages = await readFile(appFile("styles/page-compositions.css"), "utf8");
  const media = await readFile(appFile("components/ContentImage.tsx"), "utf8");
  const guidance = await readFile(
    projectFile("docs/nibbles-visual-foundation.md"),
    "utf8",
  );

  assert.match(tokens, /--crop-card: 4 \/ 5/);
  assert.match(
    shared,
    /\.content-image > img \{[\s\S]*?object-position: center/,
  );
  assert.match(
    pages,
    /\.recipe-hero__image \{[\s\S]*?object-fit: cover;[\s\S]*?object-position: center;/,
  );
  assert.match(
    pages,
    /\.recipe-hero__credit \{[\s\S]*?background: color-mix\([\s\S]*?var\(--color-charcoal\) 82%[\s\S]*?transparent[\s\S]*?color: var\(--color-text-inverse\)/,
  );
  assert.doesNotMatch(pages, /\.recipe-hero__credit \{[^}]*opacity:/);
  assert.doesNotMatch(shared, /filter:/);
  assert.match(
    media,
    /data-media-state=\{hasAuthoredImage \? "authored" : "missing"\}/,
  );
  assert.match(guidance, /owned photography/i);
  assert.match(guidance, /authored alt text/i);
  assert.match(guidance, /missing media/i);
  assert.match(guidance, /no colour filters/i);
});

test("Sanity-authored headings and introductions share the playful type treatment", async () => {
  const shared = await readFile(
    appFile("styles/shared-components.css"),
    "utf8",
  );
  const pages = await readFile(appFile("styles/page-compositions.css"), "utf8");
  const recipe = await readFile(appFile("recipes/[slug]/page.tsx"), "utf8");
  const article = await readFile(appFile("articles/[slug]/page.tsx"), "utf8");

  assert.match(
    shared,
    /\.authored-heading \{[\s\S]*?font-family: var\(--font-utility\)[\s\S]*?text-decoration-color: var\(--color-brand\)[\s\S]*?text-wrap: balance/,
  );
  assert.match(
    pages,
    /\.recipe-hero h1\.authored-heading,[\s\S]*?\.article-hero h1\.authored-heading \{[\s\S]*?text-decoration: none/,
  );
  assert.match(
    pages,
    /\.recipe-intro,[\s\S]*?\.article-standfirst \{[\s\S]*?background: linear-gradient\([\s\S]*?var\(--color-sky\)[\s\S]*?var\(--color-seafoam\)[\s\S]*?font-family: var\(--font-utility\)/,
  );
  assert.match(recipe, /<h1 className="authored-heading">\{title\}<\/h1>/);
  assert.match(
    article,
    /h2: \(\{ children \}\) => [\s\S]*?<h2 className="authored-heading">/,
  );
  assert.doesNotMatch(
    pages,
    /\.article-(?:hero h1|body h[23]) \{[^}]*font-family: var\(--font-editorial\)/,
  );
});

test("responsive component hints use fluid hero sizing and the approved breakpoint system", async () => {
  const trail = await readFile(
    projectFile("components/ui/image-trail-demo.tsx"),
    "utf8",
  );
  const responsiveSources = await Promise.all(
    [
      "app/home-page.tsx",
      "app/components/ui/sparks-carousel.tsx",
      "app/components/CreatorProfile.tsx",
      "app/components/RelatedContent.tsx",
      "app/recipes/page.tsx",
      "app/articles/page.tsx",
      "app/articles/[slug]/page.tsx",
      "app/shop/page.tsx",
      "app/shop/[slug]/page.tsx",
      "app/kitchen/page.tsx",
    ].map((path) => readFile(projectFile(path), "utf8")),
  );

  assert.match(trail, /min-h-\[clamp\(30rem,calc\(100svh-68px\),56rem\)\]/);
  assert.match(trail, /px-\[var\(--gutter\)\]/);
  assert.match(trail, /py-\[clamp\(4rem,12svh,6rem\)\]/);
  assert.match(trail, /\bmb-4\b/);
  assert.match(trail, /max-w-\[30ch\]/);
  assert.match(trail, /\bsm:mb-6\b/);
  assert.match(trail, /\bsm:max-w-\[34ch\]/);
  assert.match(trail, /\btext-4xl\b/);
  assert.match(trail, /\bsm:text-7xl\b/);
  assert.match(trail, /text-\[var\(--color-text-secondary\)\]/);
  assert.doesNotMatch(trail, /text-\[var\(--color-brand\)\]/);
  assert.doesNotMatch(trail, /\b(?:md|lg|xl|2xl):/);

  const breakpoints = responsiveSources
    .join("\n")
    .matchAll(/max-width:\s*(\d+)px/g);
  for (const [, breakpoint] of breakpoints) {
    assert.ok(
      ["640", "900", "1200"].includes(breakpoint),
      `${breakpoint}px must be an approved responsive breakpoint`,
    );
  }
});

test("homepage articles and recipe provenance have responsive visual hierarchy", async () => {
  const shared = await readFile(
    appFile("styles/shared-components.css"),
    "utf8",
  );
  const pages = await readFile(appFile("styles/page-compositions.css"), "utf8");
  const recipe = await readFile(appFile("recipes/[slug]/page.tsx"), "utf8");

  assert.match(
    pages,
    /\.goods-row__item > \.content-image,[\s\S]*?border-radius: 50%/,
  );
  assert.match(
    pages,
    /\.feature-story__image \{[\s\S]*?aspect-ratio: 27 \/ 20/,
  );
  assert.match(
    pages,
    /\.journal-grid \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\)[\s\S]*?\.journal-card > \.content-image \{[\s\S]*?align-items: flex-end;[\s\S]*?aspect-ratio: var\(--crop-landscape\)/,
  );
  assert.match(
    pages,
    /@media \(min-width: 640px\)[\s\S]*?\.journal-grid \{[\s\S]*?grid-template-columns: repeat\(2,[\s\S]*?\.journal-card > \.content-image \{[\s\S]*?aspect-ratio: var\(--crop-card\)/,
  );
  assert.match(
    pages,
    /@media \(min-width: 900px\)[\s\S]*?\.journal-grid \{[\s\S]*?grid-template-columns: repeat\(3,[\s\S]*?\.journal-card > \.content-image \{[\s\S]*?aspect-ratio: 18 \/ 25/,
  );
  assert.match(
    pages,
    /\.article-card \{[\s\S]*?grid-template-columns:[\s\S]*?\.article-card__image \{[\s\S]*?aspect-ratio: 1/,
  );
  assert.match(
    pages,
    /@media \(min-width: 640px\)[\s\S]*?\.article-feature__image \{[\s\S]*?aspect-ratio: 59 \/ 50[\s\S]*?\.article-card__image \{[\s\S]*?aspect-ratio: 39 \/ 50/,
  );
  assert.match(
    pages,
    /\.recipe-context \{[\s\S]*?background: linear-gradient\([\s\S]*?var\(--color-surface\)[\s\S]*?var\(--color-seafoam\)[\s\S]*?border: var\(--border-standard\)[\s\S]*?border-radius: var\(--radius-card\)/,
  );
  assert.match(
    pages,
    /\.recipe-context h2 \{[\s\S]*?font-size: var\(--text-section-title\)[\s\S]*?\.recipe-context__details > div \{[\s\S]*?border-top: var\(--border-standard\)[\s\S]*?\.recipe-context dt \{[\s\S]*?text-transform: uppercase/,
  );
  assert.match(recipe, /<dl className="recipe-context__details">/);
  assert.match(recipe, /<dt>Inspired by:<\/dt>/);
  assert.match(shared, /\.recipe-context a,/);
  assert.match(
    shared,
    /\.related-card__image \{[\s\S]*?aspect-ratio: var\(--crop-square\)/,
  );
});

test("approved text and control color pairings meet WCAG AA contrast", () => {
  const paper = "#fffaf2";
  const surface = "#ffffff";
  const charcoal = "#292824";
  const brand = "#b9dfc8";
  const brandInk = "#315f43";
  const skyInk = "#3c617e";

  for (const [foreground, background] of [
    [charcoal, paper],
    ["#68645d", paper],
    [brandInk, paper],
    ["#8e6129", paper],
    ["#5d6d8b", paper],
    [brandInk, surface],
    [charcoal, brand],
    [brandInk, brand],
    [surface, charcoal],
    [charcoal, "#f7e8b8"],
    [brandInk, "#e4f3ea"],
    [brandInk, "#eee7f6"],
    [brandInk, "#f8e6e9"],
    [brandInk, "#dff1fb"],
    [skyInk, paper],
    [skyInk, surface],
    [skyInk, brand],
    [skyInk, "#e4f3ea"],
    [skyInk, "#eee7f6"],
    [skyInk, "#f8e6e9"],
    [skyInk, "#dff1fb"],
  ]) {
    assert.ok(
      contrastRatio(foreground, background) >= 4.5,
      `${foreground} on ${background} must meet WCAG AA`,
    );
  }
});

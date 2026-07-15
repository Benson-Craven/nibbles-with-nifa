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
    "#f7f1e6",
    "#fffdf8",
    "#27251f",
    "#625d52",
    "#176b45",
    "#c2412d",
    "#3f506e",
    "#f3c94f",
    "#d9cfbf",
  ]) {
    assert.match(tokens.toLowerCase(), new RegExp(value));
  }
  assert.doesNotMatch(tokens.toLowerCase(), /#4b633e|#a7462f/);

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
  assert.match(trail, /text-\[length:var\(--text-masthead\)\]/);
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

test("the original Nibbles wordmark has one accessible, reusable implementation seam", async () => {
  const wordmark = await readFile(
    appFile("components/NibblesWordmark.tsx"),
    "utf8",
  );
  const breadcrumb = await readFile(
    appFile("components/NavBreadcrumb.tsx"),
    "utf8",
  );
  const shared = await readFile(
    appFile("styles/shared-components.css"),
    "utf8",
  );

  assert.match(wordmark, /aria-label="Nibbles with Nifa"/);
  assert.match(wordmark, /wordmark__nibbles/);
  assert.match(wordmark, /wordmark__with/);
  assert.match(wordmark, /wordmark__nifa/);
  assert.match(breadcrumb, /import \{ NibblesWordmark \}/);
  assert.match(breadcrumb, /<NibblesWordmark \/>/);
  assert.match(
    shared,
    /\.nibbles-wordmark \{[\s\S]*?font-family: var\(--font-utility\)/,
  );
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
  assert.doesNotMatch(css, /(?:^|\s)color:\s*var\(--color-annotation\)/m);
  assert.match(
    shared,
    /\.eyebrow,[\s\S]*?border-left: 3px solid var\(--color-tomato\)/,
  );
  assert.match(
    shared,
    /\.button \{[\s\S]*?box-shadow: var\(--shadow-control\)/,
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
    /::selection[\s\S]*background: var\(--color-travel\)[\s\S]*color: var\(--color-text-inverse\)/,
  );
  assert.equal(
    css.match(/background:\s*var\(--color-annotation\)/g)?.length,
    1,
  );

  for (const breakpoint of [640, 900, 1200]) {
    assert.match(css, new RegExp(`@media \\(min-width: ${breakpoint}px\\)`));
  }
  assert.doesNotMatch(
    css,
    /@media[^\{]*(?:420|560|561|700|760|920|980|1020)px/,
  );
});

test("shared photography rules favour truthful authored images and controlled crops", async () => {
  const tokens = await readFile(appFile("styles/tokens.css"), "utf8");
  const shared = await readFile(
    appFile("styles/shared-components.css"),
    "utf8",
  );
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

test("responsive component hints use the approved spacing and breakpoint system", async () => {
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

  assert.match(trail, /\bpy-24\b/);
  assert.match(trail, /\bmb-6\b/);
  assert.match(trail, /max-w-\[34ch\]/);
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

test("the foundation preserves page compositions reserved for later tickets", async () => {
  const shared = await readFile(
    appFile("styles/shared-components.css"),
    "utf8",
  );
  const pages = await readFile(appFile("styles/page-compositions.css"), "utf8");

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
    /\.journal-grid \{[\s\S]*?grid-template-columns: repeat\(3,[\s\S]*?\.journal-card > \.content-image \{[\s\S]*?aspect-ratio: 18 \/ 25/,
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
    shared,
    /\.related-card__image \{[\s\S]*?aspect-ratio: var\(--crop-square\)/,
  );
});

test("approved text and control color pairings meet WCAG AA contrast", () => {
  const paper = "#f7f1e6";
  const surface = "#fffdf8";
  const charcoal = "#27251f";

  for (const [foreground, background] of [
    [charcoal, paper],
    ["#625d52", paper],
    ["#176b45", paper],
    ["#c2412d", paper],
    ["#3f506e", paper],
    ["#176b45", surface],
    [surface, "#176b45"],
    [surface, "#c2412d"],
    [surface, charcoal],
    [charcoal, "#f3c94f"],
  ]) {
    assert.ok(
      contrastRatio(foreground, background) >= 4.5,
      `${foreground} on ${background} must meet WCAG AA`,
    );
  }
});

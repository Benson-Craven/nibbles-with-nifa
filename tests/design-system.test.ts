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

test("Kitchen Passport tokens expose the approved fonts, palette, type, spacing, and geometry", async () => {
  const tokens = await readFile(appFile("styles/tokens.css"), "utf8");
  const license = await readFile(
    publicFile("fonts/newsreader/OFL.txt"),
    "utf8",
  );
  const normalFont = await readFile(
    publicFile("fonts/newsreader/Newsreader-Variable.ttf"),
  );
  const italicFont = await readFile(
    publicFile("fonts/newsreader/Newsreader-Italic-Variable.ttf"),
  );

  assert.match(license, /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.ok(normalFont.byteLength > 10_000);
  assert.ok(italicFont.byteLength > 10_000);
  assert.match(
    tokens,
    /font-family: "Newsreader";[\s\S]*?font-style: normal;[\s\S]*?font-weight: 400 600;[\s\S]*?Newsreader-Variable\.ttf/,
  );
  assert.match(
    tokens,
    /font-family: "Newsreader";[\s\S]*?font-style: italic;[\s\S]*?font-weight: 400 600;[\s\S]*?Newsreader-Italic-Variable\.ttf/,
  );
  assert.match(tokens, /--font-editorial: "Newsreader"/);
  assert.match(tokens, /--font-utility: "Larsseit"/);

  for (const value of [
    "#f7f1e6",
    "#fffdf8",
    "#27251f",
    "#625d52",
    "#4b633e",
    "#a7462f",
    "#3f506e",
    "#f3c94f",
    "#d9cfbf",
  ]) {
    assert.match(tokens.toLowerCase(), new RegExp(value));
  }

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

  assert.match(tokens, /--border-standard: 1px solid var\(--color-line\)/);
  assert.match(tokens, /--radius-card: 8px/);
  assert.match(tokens, /--radius-pill: 999px/);
  assert.match(tokens, /--breakpoint-small: 640px/);
  assert.match(tokens, /--breakpoint-medium: 900px/);
  assert.match(tokens, /--breakpoint-large: 1200px/);
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
  assert.doesNotMatch(css, /color:\s*var\(--color-annotation\)/);
  assert.match(
    base,
    /:focus-visible[\s\S]*outline: 3px solid var\(--color-surface\)[\s\S]*box-shadow|:focus-visible[\s\S]*box-shadow[\s\S]*outline: 3px solid var\(--color-surface\)/,
  );
  assert.match(
    base,
    /::selection[\s\S]*background: var\(--color-travel\)[\s\S]*color: var\(--color-surface\)/,
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
  assert.match(trail, /\bsm:text-7xl\b/);
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
  assert.match(shared, /\.related-card__image \{[\s\S]*?aspect-ratio: 1/);
});

test("approved text and control color pairings meet WCAG AA contrast", () => {
  const paper = "#f7f1e6";
  const surface = "#fffdf8";
  const charcoal = "#27251f";

  for (const [foreground, background] of [
    [charcoal, paper],
    ["#625d52", paper],
    ["#4b633e", paper],
    ["#a7462f", paper],
    ["#3f506e", paper],
    ["#4b633e", surface],
    [surface, "#4b633e"],
    [surface, charcoal],
    [charcoal, "#f3c94f"],
  ]) {
    assert.ok(
      contrastRatio(foreground, background) >= 4.5,
      `${foreground} on ${background} must meet WCAG AA`,
    );
  }
});

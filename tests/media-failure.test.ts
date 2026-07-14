import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import PublicError from "../app/error";
import { createArticlePage } from "../app/articles/[slug]/page";
import { IngredientList } from "../app/components/IngredientList";
import { RecipeIndexContent } from "../app/recipes/page";
import type { Article, Recipe } from "../app/data";
import { createContentStore, type ContentFetcher } from "../lib/content-store";
import { normalizeMediaSource } from "../lib/media";

function render(node: ReactNode) {
  return renderToStaticMarkup(createElement("div", null, node));
}

const recipe: Recipe = {
  slug: "fixture-noodles",
  title: "Fixture noodles",
  note: "A recipe fixture.",
  image: "/images/recipes/fixture-noodles.jpg",
  imageAlt: "Noodles in a blue serving bowl",
  featured: true,
  date: "2026-07-14",
  servings: 2,
  prep: 10,
  cook: 15,
  tags: ["Dinner"],
  intro: "A fixture introduction.",
  ingredients: [{ items: ["200g noodles"] }],
  steps: ["Cook the noodles."],
};

const article: Article = {
  slug: "fixture-essay",
  title: "Fixture essay",
  dek: "A fixture article.",
  image: "/images/articles/fixture-essay.jpg",
  imageAlt: "Market stalls opening beneath striped awnings",
  date: "2026-07-14",
  category: "travel",
  format: "travelEssay",
  readTime: 4,
  featured: true,
  tags: ["Travel"],
  intro: "A fixture introduction.",
  body: [],
};

const emptyRelatedLoaders = {
  getArticles: async () => [],
  getKitchenItems: async () => [],
  getProducts: async () => [],
  getRecipes: async () => [],
};

test("media sources reject empty, malformed, and unsafe values", () => {
  assert.equal(normalizeMediaSource(undefined), null);
  assert.equal(normalizeMediaSource(""), null);
  assert.equal(normalizeMediaSource("javascript:alert(1)"), null);
  assert.equal(normalizeMediaSource("not a URL"), null);
  assert.equal(normalizeMediaSource("//example.com/image.jpg"), null);
  assert.equal(
    normalizeMediaSource(" https://cdn.sanity.io/images/demo/photo.jpg "),
    "https://cdn.sanity.io/images/demo/photo.jpg",
  );
  assert.equal(
    normalizeMediaSource("/images/recipes/noodles.jpg"),
    "/images/recipes/noodles.jpg",
  );
});

test("ingredient images render only when explicitly authored", () => {
  const html = render(
    createElement(IngredientList, {
      groups: [
        {
          items: [
            "200g noodles",
            {
              text: "1 sliced lime",
              image: "/images/ingredients/lime.jpg",
              alt: "A sliced lime on a small plate",
            },
            {
              text: "1 bunch coriander",
              image: "not a URL",
              alt: "Coriander leaves",
            },
            {
              text: "2 spring onions",
              image: "/images/ingredients/onions.jpg",
            },
          ],
        },
      ],
    }),
  );

  assert.match(html, /200g noodles/);
  assert.match(html, /1 sliced lime/);
  assert.match(html, /1 bunch coriander/);
  assert.match(html, /2 spring onions/);
  assert.equal((html.match(/<img\b/g) ?? []).length, 1);
  assert.match(html, /alt="A sliced lime on a small plate"/);
  assert.doesNotMatch(html, /pexels|unsplash|ingredient"/i);
});

test("article heroes use authored semantic images and reserve missing media", async () => {
  const ArticlePage = createArticlePage({
    ...emptyRelatedLoaders,
    getArticleBySlug: async (slug) => (slug === article.slug ? article : null),
  });
  const MissingHeroPage = createArticlePage({
    ...emptyRelatedLoaders,
    getArticleBySlug: async (slug) =>
      slug === article.slug
        ? { ...article, image: undefined, imageAlt: undefined }
        : null,
  });

  const authoredHtml = render(
    await ArticlePage({ params: Promise.resolve({ slug: article.slug }) }),
  );
  const missingHtml = render(
    await MissingHeroPage({ params: Promise.resolve({ slug: article.slug }) }),
  );

  assert.match(authoredHtml, /<img[^>]+alt="Market stalls opening/);
  assert.doesNotMatch(authoredHtml, /background-image/);
  assert.doesNotMatch(authoredHtml, /alt="Fixture essay"/);
  assert.match(missingHtml, /data-media-state="missing"/);
  assert.doesNotMatch(missingHtml, /<img|src=""|url\(undefined\)/);
});

test("cards reserve missing media without inventing alternative text", () => {
  const html = render(
    createElement(RecipeIndexContent, {
      recipes: [
        recipe,
        {
          ...recipe,
          slug: "missing-media",
          title: "Missing media recipe",
          image: undefined,
          imageAlt: undefined,
        },
        {
          ...recipe,
          slug: "invalid-media",
          title: "Invalid media recipe",
          image: "not a URL",
          imageAlt: "An image that should not be requested",
        },
      ],
    }),
  );

  assert.equal((html.match(/data-media-state="missing"/g) ?? []).length, 2);
  assert.match(html, /alt="Noodles in a blue serving bowl"/);
  assert.doesNotMatch(html, /alt="Missing media recipe"|src=""|not a URL/);
});

test("the public error boundary is generic, recoverable, and non-disclosing", () => {
  const html = render(
    createElement(PublicError, {
      error: new Error(
        "Sanity request failed with token secret-token and draft title",
      ),
      reset: () => undefined,
    }),
  );

  assert.match(html, /We couldn(?:&#x27;|’)t bring this page to the table/);
  assert.match(html, /<button[^>]*>Try again<\/button>/);
  assert.match(html, /href="\/"/);
  assert.doesNotMatch(html, /Sanity|secret-token|draft title|request failed/);
});

test("provider failures stay distinct from genuinely empty collections", async () => {
  const providerError = new Error("Sanity unavailable");
  const failingFetcher: ContentFetcher = async () => {
    throw providerError;
  };
  const failingContent = createContentStore({
    source: "sanity",
    fetcher: failingFetcher,
  });
  const emptyContent = createContentStore({
    source: "sanity",
    fetcher: async <T>() => [] as T,
  });

  await assert.rejects(failingContent.getRecipes(), providerError);
  assert.deepEqual(await emptyContent.getRecipes(), []);
});

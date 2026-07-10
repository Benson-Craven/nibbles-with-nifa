import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { createArticlePage } from "../app/articles/[slug]/page";
import { createArticlesPage } from "../app/articles/page";
import type { CreatorProfile } from "../app/data";
import { createRecipePage } from "../app/recipes/[slug]/page";
import { createRecipesPage } from "../app/recipes/page";
import {
  createContentStore,
  resolveContentSource,
  type ContentFetcher,
} from "../lib/content-store";

const publishedRecipe = {
  slug: "fixture-noodles",
  title: "Fixture noodles",
  note: "A published fixture recipe.",
  image: "https://cdn.sanity.io/images/example/production/noodles.jpg",
  featured: true,
  date: "2026-07-10",
  servings: 2,
  prep: 10,
  cook: 15,
  tags: ["Dinner"],
  intro: "A small recipe used to prove the public content flow.",
  ingredients: [
    {
      items: [
        {
          text: "200g noodles",
          image: "/images/kitchen/tools-flatlay.png",
          alt: "A bundle of dried noodles",
        },
      ],
    },
  ],
  steps: ["Cook the noodles."],
};

const unpublishedRecipe = {
  ...publishedRecipe,
  slug: "private-noodles",
  title: "Private noodles",
};

const publishedCreator = {
  name: "Nifa Akintola",
  biography:
    "Nifa writes about the recipes and places that shape how she cooks at home.",
  portrait: {
    image: "/images/kitchen/apron-and-sheet-pan.png",
    alt: "Nifa smiling in her kitchen",
  },
  socialLinks: [
    { platform: "instagram", url: "https://instagram.com/nifa" },
    { platform: "youtube", url: "https://youtube.com/@nifa" },
  ],
} satisfies CreatorProfile;

const publishedArticle = {
  slug: "fixture-market-note",
  title: "Fixture market note",
  dek: "A published fixture article.",
  image: "https://cdn.sanity.io/images/example/production/market.jpg",
  date: "2026-07-10",
  category: "city notes" as const,
  readTime: 3,
  featured: true,
  intro: "A small article used to prove the public content flow.",
  sections: [{ heading: "At the market", body: ["A visitor-visible paragraph."] }],
  related: {},
};

function fixtureFetcher(
  creator: CreatorProfile = publishedCreator,
): ContentFetcher {
  return async <T>(query: string, params: Record<string, string> = {}) => {
    const excludesDrafts = query.includes('!(_id in path("drafts.**"))');
    const projectedCreator =
      query.includes('_type == "creatorProfile"') &&
      query.includes('_id == "creatorProfile"')
        ? creator
        : undefined;

    if (query.includes('_type == "recipe"')) {
      const sourceRecipes = excludesDrafts
        ? [publishedRecipe]
        : [publishedRecipe, unpublishedRecipe];
      const recipes = sourceRecipes.map((recipe) => ({
        ...recipe,
        creator: projectedCreator,
      }));
      const result = query.includes("slug.current == $slug")
        ? recipes.find((recipe) => recipe.slug === params.slug) ?? null
        : recipes;
      return result as T;
    }

    if (query.includes('_type == "article"')) {
      const articles = excludesDrafts
        ? [{ ...publishedArticle, creator: projectedCreator }]
        : [];
      const result = query.includes("slug.current == $slug")
        ? articles.find((article) => article.slug === params.slug) ?? null
        : articles;
      return result as T;
    }

    return [] as T;
  };
}

function createFixtureContent() {
  return createContentStore({
    source: "sanity",
    fetcher: fixtureFetcher(),
  });
}

function renderRoute(element: React.ReactNode) {
  return renderToStaticMarkup(createElement("div", null, element));
}

function isNotFoundError(error: unknown) {
  return (
    error instanceof Error &&
    "digest" in error &&
    error.digest === "NEXT_HTTP_ERROR_FALLBACK;404"
  );
}

test("published Sanity-shaped fixtures flow through list and detail reads", async () => {
  const content = createFixtureContent();
  const RecipesPage = createRecipesPage(content.getRecipes);
  const RecipePage = createRecipePage(content.getRecipeBySlug);
  const ArticlesPage = createArticlesPage(content.getArticles);
  const ArticlePage = createArticlePage({
    getArticleBySlug: content.getArticleBySlug,
    getKitchenItems: content.getKitchenItems,
    getProducts: content.getProducts,
    getRecipes: content.getRecipes,
  });

  const recipeListHtml = renderRoute(await RecipesPage());
  const recipeDetailHtml = renderRoute(
    await RecipePage({ params: Promise.resolve({ slug: publishedRecipe.slug }) }),
  );
  const articleListHtml = renderRoute(await ArticlesPage());
  const articleDetailHtml = renderRoute(
    await ArticlePage({ params: Promise.resolve({ slug: publishedArticle.slug }) }),
  );

  assert.match(recipeListHtml, /Fixture noodles/);
  assert.match(recipeListHtml, /href="\/recipes\/fixture-noodles"/);
  assert.match(
    recipeDetailHtml,
    /A small recipe used to prove the public content flow/,
  );
  assert.match(recipeDetailHtml, /200g noodles/);
  assert.match(recipeDetailHtml, /alt="A bundle of dried noodles"/);
  assert.match(articleListHtml, /Fixture market note/);
  assert.match(articleListHtml, /href="\/articles\/fixture-market-note"/);
  assert.match(articleDetailHtml, /A visitor-visible paragraph/);
});

test("one creator profile flows through recipe and article routes", async () => {
  const content = createFixtureContent();
  const RecipePage = createRecipePage(content.getRecipeBySlug);
  const ArticlePage = createArticlePage({
    getArticleBySlug: content.getArticleBySlug,
    getKitchenItems: content.getKitchenItems,
    getProducts: content.getProducts,
    getRecipes: content.getRecipes,
  });

  const recipeHtml = renderRoute(
    await RecipePage({
      params: Promise.resolve({ slug: publishedRecipe.slug }),
    }),
  );
  const articleHtml = renderRoute(
    await ArticlePage({
      params: Promise.resolve({ slug: publishedArticle.slug }),
    }),
  );

  for (const html of [recipeHtml, articleHtml]) {
    assert.match(html, /Created by/);
    assert.match(html, /Nifa Akintola/);
    assert.match(
      html,
      /Nifa writes about the recipes and places that shape how she cooks at home/,
    );
    assert.match(html, /alt="Nifa smiling in her kitchen"/);
    assert.match(
      html,
      /aria-label="Follow Nifa Akintola on Instagram \(opens in a new tab\)"/,
    );
    assert.match(html, /target="_blank"/);
    assert.match(html, /rel="noreferrer"/);
  }
});

test("missing optional creator details leave a clean name-only byline", async () => {
  const content = createContentStore({
    source: "sanity",
    fetcher: fixtureFetcher({
      name: "Nifa Akintola",
      biography: "   ",
      portrait: { image: "/images/kitchen/apron-and-sheet-pan.png" },
      socialLinks: [{ platform: "instagram" }, { url: "https://example.com" }],
    }),
  });
  const RecipePage = createRecipePage(content.getRecipeBySlug);
  const ArticlePage = createArticlePage({
    getArticleBySlug: content.getArticleBySlug,
    getKitchenItems: content.getKitchenItems,
    getProducts: content.getProducts,
    getRecipes: content.getRecipes,
  });

  const routeHtml = [
    renderRoute(
      await RecipePage({
        params: Promise.resolve({ slug: publishedRecipe.slug }),
      }),
    ),
    renderRoute(
      await ArticlePage({
        params: Promise.resolve({ slug: publishedArticle.slug }),
      }),
    ),
  ];

  for (const html of routeHtml) {
    assert.match(html, /Created by/);
    assert.match(html, /Nifa Akintola/);
    assert.doesNotMatch(html, /creator-profile__portrait/);
    assert.doesNotMatch(html, /creator-profile__biography/);
    assert.doesNotMatch(html, /creator-profile__socials/);
  }
});

test("unpublished and unknown slugs are absent from public detail reads", async () => {
  const content = createFixtureContent();
  const RecipePage = createRecipePage(content.getRecipeBySlug);
  const ArticlePage = createArticlePage({
    getArticleBySlug: content.getArticleBySlug,
    getKitchenItems: content.getKitchenItems,
    getProducts: content.getProducts,
    getRecipes: content.getRecipes,
  });

  await assert.rejects(
    RecipePage({ params: Promise.resolve({ slug: unpublishedRecipe.slug }) }),
    isNotFoundError,
  );
  await assert.rejects(
    RecipePage({ params: Promise.resolve({ slug: "unknown-recipe" }) }),
    isNotFoundError,
  );
  await assert.rejects(
    ArticlePage({ params: Promise.resolve({ slug: "unknown-article" }) }),
    isNotFoundError,
  );
});

test("an empty production collection stays empty", async () => {
  const fetcher: ContentFetcher = async <T>() => [] as T;
  const content = createContentStore({ source: "sanity", fetcher });
  const RecipesPage = createRecipesPage(content.getRecipes);
  const ArticlesPage = createArticlesPage(content.getArticles);

  assert.deepEqual(await content.getRecipes(), []);
  assert.deepEqual(await content.getArticles(), []);
  assert.match(renderRoute(await RecipesPage()), /0 recipes/);
  assert.match(renderRoute(await ArticlesPage()), /0 notes/);
});

test("a production provider failure remains visible", async () => {
  const providerError = new Error("Sanity unavailable");
  const fetcher: ContentFetcher = async () => {
    throw providerError;
  };
  const content = createContentStore({ source: "sanity", fetcher });
  const RecipesPage = createRecipesPage(content.getRecipes);
  const RecipePage = createRecipePage(content.getRecipeBySlug);

  await assert.rejects(RecipesPage(), providerError);
  await assert.rejects(
    RecipePage({ params: Promise.resolve({ slug: "fixture-noodles" }) }),
    providerError,
  );
});

test("placeholder content is available only in explicit demo mode", async () => {
  let fetchCount = 0;
  const fetcher: ContentFetcher = async <T>() => {
    fetchCount += 1;
    return [] as T;
  };
  const content = createContentStore({ source: "demo", fetcher });

  const recipes = await content.getRecipes();

  assert.ok(recipes.length > 0);
  assert.ok(await content.getRecipeBySlug(recipes[0].slug));
  assert.equal(fetchCount, 0);
  assert.throws(
    () => resolveContentSource("demo", "production"),
    /Demo content is unavailable in production/,
  );
});

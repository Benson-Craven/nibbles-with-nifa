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
import {
  validateRecipeForPublication,
  type RecipeValidationDocument,
} from "../sanity/schemaTypes/recipeValidation";

const publishedRecipe = {
  slug: "fixture-noodles",
  title: "Fixture noodles",
  note: "A published fixture recipe.",
  image: "/images/kitchen/tools-flatlay.png",
  imageAlt: "Glossy noodles in a shallow ceramic bowl",
  imageCredit: "Photograph by Nifa Akintola",
  editorialStage: "ready" as const,
  featured: true,
  date: "2026-07-10",
  servings: 2,
  prep: 10,
  cook: 15,
  tags: ["Dinner"],
  intro: "A small recipe used to prove the public content flow.",
  ingredients: [
    {
      group: "For the noodles",
      items: [
        {
          amount: "200",
          unit: "g" as const,
          ingredient: "noodles",
          image: "/images/kitchen/tools-flatlay.png",
          alt: "A bundle of dried noodles",
        },
      ],
    },
  ],
  steps: ["Cook the noodles until tender with a slight bite."],
  provenance: {
    sourceType: "person",
    sourceName: "Auntie Fola",
    specificContribution: "Showed Nifa how to bloom the spices in oil.",
    placeOrCulturalLane: "A family weeknight dish from Lagos",
    adaptationStatement: "This version uses noodles available near home.",
    credit: "With thanks to Auntie Fola for the starting technique.",
  },
  cookTest: {
    completedCook: true,
    quantitiesCorrected: true,
    timingsCorrected: true,
    yieldCorrected: true,
  },
  publicNotes: ["The sauce should look glossy rather than dry before serving."],
  testedSubstitutions: ["Rice noodles also worked in the completed cook."],
  verificationNotes: {
    untestedSubstitutions: ["Try wheat-free soy sauce next time."],
    storageGuidance: "Confirm safe cooling and reheating guidance.",
    allergenClaims: "Check every packaged ingredient before making a claim.",
    foodSafetyGuidance: "Verify against an authoritative source.",
  },
};

const unpublishedRecipe = {
  slug: "private-noodles",
  title: "Private noodles",
  editorialStage: "idea" as const,
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
  format: "travelEssay" as const,
  place: "Naha, Okinawa",
  visitDate: "2025-11-08",
  factCheckDate: "2026-07-09",
  readTime: 3,
  featured: true,
  intro: "A small article used to prove the public content flow.",
  body: [
    {
      _key: "heading-market",
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [
        { _key: "heading-text", _type: "span", marks: [], text: "At the market" },
      ],
    },
    {
      _key: "opening-scene",
      _type: "block",
      style: "normal",
      markDefs: [
        {
          _key: "market-link",
          _type: "link",
          href: "https://example.com/market-hours",
        },
      ],
      children: [
        {
          _key: "opening-text",
          _type: "span",
          marks: [],
          text: "The shutters lifted before breakfast. ",
        },
        {
          _key: "linked-text",
          _type: "span",
          marks: ["market-link"],
          text: "Check current market hours",
        },
        {
          _key: "opening-end",
          _type: "span",
          marks: [],
          text: " before setting out.",
        },
      ],
    },
    {
      _key: "pull-quote",
      _type: "block",
      style: "blockquote",
      markDefs: [],
      children: [
        {
          _key: "quote-text",
          _type: "span",
          marks: [],
          text: "Travel starts to feel close when breakfast has a familiar rhythm.",
        },
      ],
    },
  ],
  sections: [
    {
      heading: "Legacy section",
      body: ["Legacy copy should not duplicate a supplied rich-text body."],
    },
  ],
  acknowledgements: ["With thanks to Emi for showing me her morning route."],
  sources: [
    {
      title: "Official market visitor information",
      url: "https://example.com/market-guide",
    },
  ],
  permissionNotes: "Do not name the stallholder in public copy.",
  related: {},
};

function readyRecipeDocument(
  overrides: Partial<RecipeValidationDocument> = {},
): RecipeValidationDocument {
  return {
    editorialStage: "ready",
    title: publishedRecipe.title,
    slug: { current: publishedRecipe.slug },
    image: {
      asset: { _ref: "image-fixture" },
      alt: publishedRecipe.imageAlt,
      credit: publishedRecipe.imageCredit,
    },
    date: publishedRecipe.date,
    servings: publishedRecipe.servings,
    prep: publishedRecipe.prep,
    cook: publishedRecipe.cook,
    tags: publishedRecipe.tags,
    intro: publishedRecipe.intro,
    ingredients: publishedRecipe.ingredients,
    steps: publishedRecipe.steps,
    cookTest: publishedRecipe.cookTest,
    ...overrides,
  };
}

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
      const onlyReady = query.includes('editorialStage == "ready"');
      const sourceRecipes =
        excludesDrafts && onlyReady
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
  assert.match(
    recipeDetailHtml,
    /alt="Glossy noodles in a shallow ceramic bowl"/,
  );
  assert.match(recipeDetailHtml, /Photograph by Nifa Akintola/);
  assert.match(recipeDetailHtml, /A family weeknight dish from Lagos/);
  assert.match(recipeDetailHtml, /Showed Nifa how to bloom the spices in oil/);
  assert.match(
    recipeDetailHtml,
    /This version uses noodles available near home/,
  );
  assert.match(recipeDetailHtml, /With thanks to Auntie Fola/);
  assert.match(recipeDetailHtml, /Tested once/);
  assert.match(recipeDetailHtml, /For the noodles/);
  assert.match(recipeDetailHtml, /200 g noodles/);
  assert.match(recipeDetailHtml, /alt="A bundle of dried noodles"/);
  assert.match(
    recipeDetailHtml,
    /The sauce should look glossy rather than dry before serving/,
  );
  assert.match(recipeDetailHtml, /Rice noodles also worked/);
  assert.doesNotMatch(recipeDetailHtml, /Try wheat-free soy sauce/);
  assert.doesNotMatch(recipeDetailHtml, /Confirm safe cooling/);
  assert.doesNotMatch(recipeDetailHtml, /Check every packaged ingredient/);
  assert.doesNotMatch(recipeDetailHtml, /Verify against an authoritative/);
  assert.match(articleListHtml, /Fixture market note/);
  assert.match(articleListHtml, /href="\/articles\/fixture-market-note"/);
  assert.match(articleDetailHtml, /Naha, Okinawa/);
  assert.match(articleDetailHtml, /Visited/);
  assert.match(articleDetailHtml, /November 8, 2025/);
  assert.match(articleDetailHtml, /Facts checked/);
  assert.match(articleDetailHtml, /July 9, 2026/);
  assert.match(articleDetailHtml, /<h2>At the market<\/h2>/);
  assert.match(articleDetailHtml, /The shutters lifted before breakfast/);
  assert.match(
    articleDetailHtml,
    /href="https:\/\/example.com\/market-hours"/,
  );
  assert.match(articleDetailHtml, /<blockquote>/);
  assert.match(
    articleDetailHtml,
    /Travel starts to feel close when breakfast has a familiar rhythm/,
  );
  assert.match(articleDetailHtml, /With thanks to Emi/);
  assert.match(articleDetailHtml, /Sources/);
  assert.match(articleDetailHtml, /Official market visitor information/);
  assert.ok(
    articleDetailHtml.indexOf("At the market") <
      articleDetailHtml.indexOf("The shutters lifted before breakfast"),
  );
  assert.ok(
    articleDetailHtml.indexOf("The shutters lifted before breakfast") <
      articleDetailHtml.indexOf("Travel starts to feel close"),
  );
  assert.doesNotMatch(articleDetailHtml, /Legacy copy should not duplicate/);
  assert.doesNotMatch(articleDetailHtml, /Do not name the stallholder/);
});

test("legacy article sections continue to render without a rich-text body", async () => {
  const ArticlePage = createArticlePage({
    getArticleBySlug: async () => ({
      ...publishedArticle,
      format: "standard",
      body: undefined,
      place: undefined,
      visitDate: undefined,
      factCheckDate: undefined,
      acknowledgements: undefined,
      sources: undefined,
      permissionNotes: undefined,
      sections: [
        {
          heading: "A legacy heading",
          body: ["A legacy paragraph remains visitor-visible."],
        },
      ],
    }),
    getKitchenItems: async () => [],
    getProducts: async () => [],
    getRecipes: async () => [],
  });

  const html = renderRoute(
    await ArticlePage({
      params: Promise.resolve({ slug: publishedArticle.slug }),
    }),
  );

  assert.match(html, /<h2>A legacy heading<\/h2>/);
  assert.match(html, /A legacy paragraph remains visitor-visible/);
});

test("public article reads project acknowledgements but omit permission notes", async () => {
  const queries: string[] = [];
  const content = createContentStore({
    source: "sanity",
    fetcher: async <T>(query: string) => {
      queries.push(query);
      return null as T;
    },
  });

  await content.getArticleBySlug("fixture-market-note");

  assert.equal(queries.length, 1);
  assert.match(queries[0], /acknowledgements/);
  assert.match(queries[0], /sources/);
  assert.doesNotMatch(queries[0], /permissionNotes/);
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

test("public recipe reads require ready stage and omit internal editorial notes", async () => {
  const queries: string[] = [];
  const content = createContentStore({
    source: "sanity",
    fetcher: async <T>(query: string) => {
      queries.push(query);
      return null as T;
    },
  });

  await content.getRecipeBySlug("fixture-noodles");

  assert.equal(queries.length, 1);
  assert.match(queries[0], /editorialStage == "ready"/);
  assert.doesNotMatch(queries[0], /privateIdeaNotes/);
  assert.doesNotMatch(queries[0], /permissionNotes/);
  assert.doesNotMatch(queries[0], /verificationNotes/);
  assert.doesNotMatch(queries[0], /untestedSubstitutions/);
  assert.doesNotMatch(queries[0], /storageGuidance/);
  assert.doesNotMatch(queries[0], /allergenClaims/);
  assert.doesNotMatch(queries[0], /foodSafetyGuidance/);
});

test("recipe publication validation allows sparse ideas and checks ready recipes", () => {
  assert.equal(
    validateRecipeForPublication({
      editorialStage: "idea",
      title: "A noodle idea from the train home",
    }),
    true,
  );
  assert.equal(
    validateRecipeForPublication({
      editorialStage: "cookedDraft",
      title: "First cooked noodle draft",
      cookTest: { completedCook: true },
    }),
    true,
  );
  assert.match(
    String(
      validateRecipeForPublication({
        editorialStage: "cookedDraft",
        title: "Not cooked yet",
      }),
    ),
    /completed cook/,
  );

  const incompleteResult = validateRecipeForPublication({
    editorialStage: "ready",
    title: "Not actually ready",
  });

  assert.equal(typeof incompleteResult, "string");
  assert.match(String(incompleteResult), /slug/);
  assert.match(String(incompleteResult), /hero image/);
  assert.match(String(incompleteResult), /alternative text/);
  assert.match(String(incompleteResult), /credit/);
  assert.match(String(incompleteResult), /personal headnote/);
  assert.match(String(incompleteResult), /yield/);
  assert.match(String(incompleteResult), /prep time/);
  assert.match(String(incompleteResult), /cook time/);
  assert.match(String(incompleteResult), /grouped ingredients/);
  assert.match(String(incompleteResult), /ordered method/);
  assert.match(String(incompleteResult), /tag/);
  assert.match(String(incompleteResult), /completed cook/);
  assert.match(String(incompleteResult), /corrected quantities/);
  assert.match(String(incompleteResult), /corrected timings/);
  assert.match(String(incompleteResult), /corrected yield/);

  assert.equal(
    validateRecipeForPublication(readyRecipeDocument()),
    true,
  );
});

test("ready recipes require named groups and metric ingredient lines", () => {
  const result = validateRecipeForPublication(
    readyRecipeDocument({
      ingredients: [{ items: [{ text: "a handful of noodles" }] }],
    }),
  );

  assert.equal(typeof result, "string");
  assert.match(String(result), /group heading/);
  assert.match(String(result), /metric quantity/);

  assert.equal(
    validateRecipeForPublication(
      readyRecipeDocument({
        ingredients: [
          {
            group: "To finish",
            items: [
              { amount: "2", unit: "count", ingredient: "spring onions" },
            ],
          },
        ],
      }),
    ),
    true,
  );

  const structuredMisuse = validateRecipeForPublication(
    readyRecipeDocument({
      ingredients: [
        {
          group: "For the sauce",
          items: [
            { amount: "1 inch", unit: "count", ingredient: "ginger" },
          ],
        },
      ],
    }),
  );
  assert.match(String(structuredMisuse), /metric quantity/);

  for (const imperialLine of [
    "1 quart milk",
    "2 sticks butter",
    "3 gallons water",
    "1 inch ginger",
  ]) {
    const imperialResult = validateRecipeForPublication(
      readyRecipeDocument({
        ingredients: [
          {
            group: "For the sauce",
            items: [{ text: imperialLine }],
          },
        ],
      }),
    );

    assert.match(String(imperialResult), /metric quantity/);
  }
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

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  createArticleMetadata,
  createArticlePage,
} from "../app/articles/[slug]/page";
import { createArticlesPage } from "../app/articles/page";
import { createDraftModeVisualEditing } from "../app/components/DraftModeVisualEditing";
import { createHomePage } from "../app/home-page";
import type { CreatorProfile, PreviewRecipe } from "../app/data";
import {
  createRecipeMetadata,
  createRecipePage,
} from "../app/recipes/[slug]/page";
import {
  createEnableDraftModeHandler,
  GET as enableDraftMode,
} from "../app/api/draft-mode/enable/route";
import { createDisableDraftModeHandler } from "../app/api/draft-mode/disable/route";
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
import {
  normalizeEditorialTags,
  type EditorialTag,
  validateEditorialTags,
} from "../lib/editorial-tags";
import { previewSanityFetchOptions } from "../lib/preview-content";
import { client } from "../sanity/client";
import {
  presentationLocations,
} from "../sanity/presentation-locations";

const publishedRecipe = {
  documentId: "recipe-fixture-noodles",
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
  tags: ["Dinner"] as EditorialTag[],
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
    sourceType: "person" as const,
    sourceName: "Auntie Fola",
    specificContribution: "Showed Nifa how to bloom the spices in oil.",
    placeOrCulturalLane: "A family weeknight dish from Lagos",
    adaptationStatement: "This version uses noodles available near home.",
    credit: "With thanks to Auntie Fola for the starting technique.",
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
  ...publishedRecipe,
  documentId: "recipe-private-noodles",
  slug: "private-noodles",
  title: "Private noodles",
  note: "Draft recipe copy for an authenticated preview.",
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
  documentId: "article-fixture-market-note",
  slug: "fixture-market-note",
  title: "Fixture market note",
  dek: "A published fixture article.",
  image: "/images/articles/fixture-market.jpg",
  imageAlt: "Market stalls opening beneath striped awnings",
  date: "2026-07-10",
  category: "city notes" as const,
  format: "travelEssay" as const,
  place: "Naha, Okinawa",
  visitDate: "2025-11-08",
  factCheckDate: "2026-07-09",
  readTime: 3,
  featured: true,
  tags: ["Travel", "Markets"] as EditorialTag[],
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
  travelMedia: [
    {
      _key: "market-stall",
      _type: "travelImage" as const,
      image: "/images/kitchen/tools-flatlay.png",
      alt: "Baskets of green citrus lined up beneath a striped market awning",
      caption: "The first stalls were already busy before breakfast.",
      credit: "Photograph by Nifa Akintola",
    },
    {
      _key: "market-sounds",
      _type: "travelVideo" as const,
      video: "https://cdn.sanity.io/files/example/production/market-walk.mp4",
      aspectRatio: "portrait" as const,
      caption: "Walking through the covered market as the shutters lift.",
      credit: "Video by Nifa Akintola",
      transcript:
        "Nifa describes the smell of citrus while stallholders greet one another.",
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
  related: [],
};

const unpublishedArticle = {
  ...publishedArticle,
  documentId: "article-private-market-note",
  slug: "private-market-note",
  title: "Private market note",
  dek: "Draft copy that must not reach page metadata.",
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
        : query.includes("_id == $documentId")
          ? recipes.find(
              (recipe) => recipe.documentId === params.documentId,
            ) ?? null
          : recipes;
      return result as T;
    }

    if (query.includes('_type == "article"')) {
      const sourceArticles = excludesDrafts
        ? [publishedArticle]
        : [publishedArticle, unpublishedArticle];
      const articles = sourceArticles.map((article) => ({
        ...article,
        creator: projectedCreator,
      }));
      const result = query.includes("slug.current == $slug")
        ? articles.find((article) => article.slug === params.slug) ?? null
        : query.includes("_id == $documentId")
          ? articles.find(
              (article) => article.documentId === params.documentId,
            ) ?? null
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

function recipePageDependencies(
  getRecipeBySlug: (slug: string) => Promise<PreviewRecipe | null>,
) {
  return {
    getArticles: async () => [],
    getKitchenItems: async () => [],
    getProducts: async () => [],
    getRecipeBySlug,
    getRecipes: async () => [],
  };
}

function renderRoute(element: React.ReactNode) {
  return renderToStaticMarkup(createElement("div", null, element));
}

function expectedMetadata(title: string, description: string, image: string) {
  return {
    title,
    description,
    openGraph: { title, description, images: [image] },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
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
  const RecipePage = createRecipePage({
    getArticles: content.getArticles,
    getKitchenItems: content.getKitchenItems,
    getProducts: content.getProducts,
    getRecipeBySlug: content.getRecipeBySlug,
    getRecipes: content.getRecipes,
  });
  const ArticlesPage = createArticlesPage(content.getArticles);
  const ArticlePage = createArticlePage({
    getArticleBySlug: content.getArticleBySlug,
    getArticles: content.getArticles,
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
  assert.doesNotMatch(recipeDetailHtml, /<dt>Testing<\/dt>|Tested once/);
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
  assert.match(
    articleDetailHtml,
    /alt="Baskets of green citrus lined up beneath a striped market awning"/,
  );
  assert.match(articleDetailHtml, /The first stalls were already busy/);
  assert.match(articleDetailHtml, /Photograph by Nifa Akintola/);
  assert.match(articleDetailHtml, /<video[^>]*controls=""/);
  assert.match(articleDetailHtml, /aspect-ratio:9 \/ 16/);
  assert.match(articleDetailHtml, /market-walk\.mp4/);
  assert.match(articleDetailHtml, /Walking through the covered market/);
  assert.match(articleDetailHtml, /Video by Nifa Akintola/);
  assert.match(articleDetailHtml, /Transcript/);
  assert.match(articleDetailHtml, /Nifa describes the smell of citrus/);
  assert.doesNotMatch(articleDetailHtml, /autoplay/);
  assert.ok(
    articleDetailHtml.indexOf("At the market") <
      articleDetailHtml.indexOf("The shutters lifted before breakfast"),
  );
  assert.ok(
    articleDetailHtml.indexOf("The shutters lifted before breakfast") <
      articleDetailHtml.indexOf("Travel starts to feel close"),
  );
  assert.ok(
    articleDetailHtml.indexOf("The first stalls were already busy") <
      articleDetailHtml.indexOf("Walking through the covered market"),
  );
  assert.doesNotMatch(articleDetailHtml, /Legacy copy should not duplicate/);
  assert.doesNotMatch(articleDetailHtml, /Do not name the stallholder/);
});

test("recipe and essay pages render only explicitly related published entries", async () => {
  const relatedRecipe = {
    ...publishedRecipe,
    slug: "fixture-toast",
    title: "Fixture toast",
    note: "A crisp related recipe.",
    related: [],
  };
  const relatedArticle = {
    ...publishedArticle,
    slug: "fixture-breakfast-note",
    title: "Fixture breakfast note",
    dek: "A related morning essay.",
    image: "/images/kitchen/apron-and-sheet-pan.png",
    imageAlt: "Toast and coffee beside a folded linen napkin",
    related: [],
  };
  const relatedProduct = {
    slug: "fixture-serving-bowl",
    title: "Fixture serving bowl",
    blurb: "A low bowl for noodles and toast.",
    image: "/images/shop/linen-and-bowl.png",
    imageAlt: "A shallow cream serving bowl on striped linen",
    price: "£24",
    category: "home" as const,
  };
  const relatedKitchenItem = {
    slug: "fixture-spatula",
    title: "Fixture spatula",
    blurb: "The turner Nifa reaches for every morning.",
    image: "/images/kitchen/tools-flatlay.png",
    imageAlt: "A wooden spatula beside a folded tea towel",
    affiliateUrl: "https://example.com/spatula",
  };
  const unpublishedProduct = {
    ...relatedProduct,
    slug: "private-product",
    title: "Private product",
  };
  const unpublishedKitchenItem = {
    ...relatedKitchenItem,
    slug: "private-kitchen-item",
    title: "Private kitchen item",
  };
  const related = [
    { type: "recipe" as const, slug: relatedRecipe.slug },
    { type: "recipe" as const, slug: unpublishedRecipe.slug },
    { type: "article" as const, slug: relatedArticle.slug },
    { type: "product" as const, slug: "missing-product" },
    { type: "kitchenItem" as const, slug: relatedKitchenItem.slug },
    { type: "article" as const, slug: unpublishedArticle.slug },
    { type: "product" as const, slug: relatedProduct.slug },
    { type: "kitchenItem" as const, slug: unpublishedKitchenItem.slug },
    { type: "recipe" as const, slug: "missing-recipe" },
    { type: "article" as const, slug: "missing-article" },
  ];
  const projectedRelated = [
    null,
    { type: "article", slug: "" },
    ...related,
  ];
  const queries: string[] = [];
  const content = createContentStore({
    source: "sanity",
    fetcher: async <T>(
      query: string,
      params: Record<string, string> = {},
    ) => {
      queries.push(query);
      const excludesDrafts = query.includes('!(_id in path("drafts.**"))');

      if (query.includes('_type == "recipe"')) {
        const onlyReady = query.includes('editorialStage == "ready"');
        const sourceRecipes = [
          { ...publishedRecipe, related: projectedRelated },
          relatedRecipe,
          unpublishedRecipe,
        ];
        const recipes =
          excludesDrafts && onlyReady
            ? sourceRecipes.slice(0, 2)
            : sourceRecipes;
        return (query.includes("slug.current == $slug")
          ? recipes.find((recipe) => recipe.slug === params.slug) ?? null
          : recipes) as T;
      }

      if (query.includes('_type == "article"')) {
        const sourceArticles = [
          { ...publishedArticle, related: projectedRelated },
          relatedArticle,
          unpublishedArticle,
        ];
        const articles = excludesDrafts
          ? sourceArticles.slice(0, 2)
          : sourceArticles;
        return (query.includes("slug.current == $slug")
          ? articles.find((article) => article.slug === params.slug) ?? null
          : articles) as T;
      }

      if (query.includes('_type == "product"')) {
        return (excludesDrafts
          ? [relatedProduct]
          : [relatedProduct, unpublishedProduct]) as T;
      }

      if (query.includes('_type == "kitchenItem"')) {
        return (excludesDrafts
          ? [relatedKitchenItem]
          : [relatedKitchenItem, unpublishedKitchenItem]) as T;
      }

      return [] as T;
    },
  });
  const dependencies = {
    getArticles: content.getArticles,
    getKitchenItems: content.getKitchenItems,
    getProducts: content.getProducts,
    getRecipes: content.getRecipes,
  };
  const RecipePage = createRecipePage({
    ...dependencies,
    getRecipeBySlug: content.getRecipeBySlug,
  });
  const ArticlePage = createArticlePage({
    ...dependencies,
    getArticleBySlug: content.getArticleBySlug,
  });

  const recipeHtml = renderRoute(
    await RecipePage({ params: Promise.resolve({ slug: publishedRecipe.slug }) }),
  );
  const articleHtml = renderRoute(
    await ArticlePage({ params: Promise.resolve({ slug: publishedArticle.slug }) }),
  );

  for (const html of [recipeHtml, articleHtml]) {
    assert.match(html, /Continue exploring/);
    assert.match(html, /href="\/articles\/fixture-breakfast-note"/);
    assert.match(html, /Fixture breakfast note/);
    assert.match(html, /A related morning essay/);
    assert.match(html, /href="\/recipes\/fixture-toast"/);
    assert.match(html, /Fixture toast/);
    assert.match(html, /A crisp related recipe/);
    assert.match(html, /href="\/shop\/fixture-serving-bowl"/);
    assert.match(html, /Fixture serving bowl/);
    assert.match(html, /A low bowl for noodles and toast/);
    assert.match(html, /href="https:\/\/example.com\/spatula"/);
    assert.match(html, /Fixture spatula/);
    assert.match(html, /The turner Nifa reaches for every morning/);
    assert.match(html, /alt="Glossy noodles in a shallow ceramic bowl"/);
    assert.match(html, /alt="Toast and coffee beside a folded linen napkin"/);
    assert.match(html, /alt="A shallow cream serving bowl on striped linen"/);
    assert.match(html, /alt="A wooden spatula beside a folded tea towel"/);
    assert.match(html, /target="_blank"/);
    assert.doesNotMatch(html, /private-|missing-/);
    assert.ok(html.indexOf("Fixture toast") < html.indexOf("Fixture breakfast note"));
    assert.ok(html.indexOf("Fixture breakfast note") < html.indexOf("Fixture spatula"));
    assert.ok(html.indexOf("Fixture spatula") < html.indexOf("Fixture serving bowl"));
  }
  assert.doesNotMatch(recipeHtml, /Fixture market note/);
  assert.doesNotMatch(articleHtml, /Fixture noodles/);

  const EmptyRecipePage = createRecipePage({
    ...dependencies,
    getRecipeBySlug: async () => ({ ...publishedRecipe, related: [] }),
  });
  const emptyHtml = renderRoute(
    await EmptyRecipePage({
      params: Promise.resolve({ slug: publishedRecipe.slug }),
    }),
  );

  assert.doesNotMatch(emptyHtml, /Continue exploring/);
  assert.doesNotMatch(emptyHtml, /related-content/);
  assert.ok(
    queries.some(
      (query) =>
        query.includes('"related": array::compact(coalesce(relatedContent[]->{') &&
        query.includes('coalesce(relatedArticles[]->{"type": "article"') &&
        query.includes('coalesce(relatedRecipes[]->{"type": "recipe"'),
    ),
  );
  assert.ok(
    queries
      .filter((query) =>
        /_type == "(?:recipe|article|product|kitchenItem)"/.test(query),
      )
      .every((query) => query.includes('!(_id in path("drafts.**"))')),
  );
  assert.ok(
    queries
      .filter((query) => query.includes('_type == "recipe"'))
      .every((query) => query.includes('editorialStage == "ready"')),
  );
});

test("editorial tags normalize and only featured published entries reach home", async () => {
  const queries: string[] = [];
  const unfeaturedRecipe = {
    ...publishedRecipe,
    slug: "weeknight-toast",
    title: "Weeknight toast",
    featured: false,
    tags: [" quick ", "QUICK", "Lunch", "Summer"],
  };
  const unfeaturedArticle = {
    ...publishedArticle,
    slug: "quiet-kitchen-note",
    title: "Quiet kitchen note",
    featured: false,
    tags: [" home ", "HOME"],
  };
  const draftRecipe = {
    ...publishedRecipe,
    slug: "draft-featured-recipe",
    title: "Draft featured recipe",
    featured: true,
  };
  const draftArticle = {
    ...publishedArticle,
    slug: "draft-featured-article",
    title: "Draft featured article",
    featured: true,
  };
  const content = createContentStore({
    source: "sanity",
    fetcher: async <T>(query: string) => {
      queries.push(query);

      if (query.includes('_type == "recipe"')) {
        const sourceRecipes = [
          {
            ...publishedRecipe,
            tags: [" dinner ", "DINNER", "weeknight"],
          },
          unfeaturedRecipe,
          draftRecipe,
        ];
        return (query.includes('!(_id in path("drafts.**"))')
          ? sourceRecipes.slice(0, 2)
          : sourceRecipes) as T;
      }

      if (query.includes('_type == "article"')) {
        const sourceArticles = [
          {
            ...publishedArticle,
            tags: [" travel ", "TRAVEL", "markets"],
          },
          unfeaturedArticle,
          draftArticle,
        ];
        return (query.includes('!(_id in path("drafts.**"))')
          ? sourceArticles.slice(0, 2)
          : sourceArticles) as T;
      }

      return [] as T;
    },
  });
  const HomePage = createHomePage(content.getHomeContent);
  const RecipesPage = createRecipesPage(content.getRecipes);
  const ArticlesPage = createArticlesPage(content.getArticles);

  assert.deepEqual(normalizeEditorialTags([" dinner ", "DINNER", "weeknight"]), [
    "Dinner",
    "Weeknight",
  ]);
  assert.deepEqual(normalizeEditorialTags(["Uncurated topic"]), []);
  assert.equal(validateEditorialTags(["Dinner", "Weeknight"]), true);
  assert.match(
    String(validateEditorialTags(["Dinner", "dinner"])),
    /duplicate tags/,
  );
  assert.match(
    String(validateEditorialTags(["dinner"])),
    /curated vocabulary/,
  );
  assert.deepEqual((await content.getArticles())[0].tags, ["Travel", "Markets"]);

  const homeHtml = renderRoute(await HomePage());
  const recipeArchiveHtml = renderRoute(await RecipesPage());
  const articleArchiveHtml = renderRoute(await ArticlesPage());
  const legacyArticleArchiveHtml = renderRoute(
    await createArticlesPage(async () => [{ ...publishedArticle, tags: [] }])(),
  );

  assert.match(homeHtml, /Fixture noodles/);
  assert.match(homeHtml, /Fixture market note/);
  assert.doesNotMatch(homeHtml, /Weeknight toast/);
  assert.doesNotMatch(homeHtml, /Quiet kitchen note/);
  assert.doesNotMatch(homeHtml, /Draft featured recipe/);
  assert.doesNotMatch(homeHtml, /Draft featured article/);
  assert.match(recipeArchiveHtml, /Dinner · Weeknight/);
  assert.match(recipeArchiveHtml, /Quick · Lunch · Summer/);
  assert.match(recipeArchiveHtml, /Weeknight toast/);
  assert.match(articleArchiveHtml, /Travel · Markets/);
  assert.match(articleArchiveHtml, /Quiet kitchen note/);
  assert.match(legacyArticleArchiveHtml, /city notes · Jul 10, 2026/);
  assert.doesNotMatch(legacyArticleArchiveHtml, /card-tags">\s*·/);
  assert.ok(
    queries
      .filter((query) => /_type == "(?:recipe|article)"/.test(query))
      .every((query) => query.includes('!(_id in path("drafts.**"))')),
  );
});

test("one published recipe and travel essay lead the home page without empty commerce", async () => {
  const queries: string[] = [];
  const fetchFixture = fixtureFetcher();
  const content = createContentStore({
    source: "sanity",
    fetcher: async <T>(query: string, params = {}) => {
      queries.push(query);
      return fetchFixture<T>(query, params);
    },
  });
  const HomePage = createHomePage(content.getHomeContent);
  const RecipesPage = createRecipesPage(content.getRecipes);
  const ArticlesPage = createArticlesPage(content.getArticles);

  const homeHtml = renderRoute(await HomePage());
  const recipeArchiveHtml = renderRoute(await RecipesPage());
  const articleArchiveHtml = renderRoute(await ArticlesPage());

  assert.match(homeHtml, /href="\/recipes\/fixture-noodles"/);
  assert.match(homeHtml, /href="\/articles\/fixture-market-note"/);
  assert.match(homeHtml, /href="\/recipes"[^>]*>See all recipes/);
  assert.match(homeHtml, /href="\/articles"[^>]*>Explore Travel/);
  assert.ok(
    homeHtml.indexOf("Fixture noodles") <
      homeHtml.indexOf("Fixture market note"),
  );
  assert.match(homeHtml, /class="feature-story shell"/);
  assert.match(
    homeHtml,
    /<img[^>]+alt="Market stalls opening beneath striped awnings"/,
  );
  assert.doesNotMatch(homeHtml, /background-image/);
  assert.doesNotMatch(homeHtml, /Featured recipe carousel controls/);
  assert.doesNotMatch(homeHtml, /class="goods-row shell"|Browse the edit/);
  assert.doesNotMatch(
    homeHtml,
    /class="kitchen-shelf shell"|Open the kit list/,
  );
  assert.doesNotMatch(homeHtml, /Private noodles|Private market note/);

  assert.match(recipeArchiveHtml, /1 recipe/);
  assert.match(recipeArchiveHtml, /href="\/recipes\/fixture-noodles"/);
  assert.doesNotMatch(recipeArchiveHtml, /archive-empty/);
  assert.match(articleArchiveHtml, /1 travel essay/);
  assert.match(articleArchiveHtml, /href="\/articles\/fixture-market-note"/);
  assert.doesNotMatch(articleArchiveHtml, /class="article-grid"|archive-empty/);
  assert.ok(
    queries.every((query) => query.includes('!(_id in path("drafts.**"))')),
  );
  assert.ok(
    queries
      .filter((query) => query.includes('_type == "recipe"'))
      .every((query) => query.includes('editorialStage == "ready"')),
  );
});

test("empty editorial archives explain the pause and offer an onward route", async () => {
  const RecipesPage = createRecipesPage(async () => []);
  const ArticlesPage = createArticlesPage(async () => []);

  const recipeArchiveHtml = renderRoute(await RecipesPage());
  const articleArchiveHtml = renderRoute(await ArticlesPage());

  assert.match(recipeArchiveHtml, /New recipes are still being prepared/);
  assert.match(
    recipeArchiveHtml,
    /href="\/articles"[^>]*>Explore Travel/,
  );
  assert.doesNotMatch(recipeArchiveHtml, /class="recipe-grid"/);
  assert.match(articleArchiveHtml, /New travel essays are still taking shape/);
  assert.match(
    articleArchiveHtml,
    /href="\/recipes"[^>]*>Browse the recipe index/,
  );
  assert.doesNotMatch(
    articleArchiveHtml,
    /class="article-feature"|class="article-grid"/,
  );
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
    getArticles: async () => [],
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
  assert.match(queries[0], /travelMedia/);
  assert.match(queries[0], /seo\s*\{/);
  assert.match(queries[0], /"image": image\.asset->url/);
  assert.match(queries[0], /asset-&gt;url|asset->url/);
  assert.doesNotMatch(queries[0], /permissionNotes/);
});

test("one creator profile flows through recipe and article routes", async () => {
  const content = createFixtureContent();
  const RecipePage = createRecipePage(
    recipePageDependencies(content.getRecipeBySlug),
  );
  const ArticlePage = createArticlePage({
    getArticleBySlug: content.getArticleBySlug,
    getArticles: content.getArticles,
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
    assert.match(html, /creator-profile--compact/);
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
  const RecipePage = createRecipePage(
    recipePageDependencies(content.getRecipeBySlug),
  );
  const ArticlePage = createArticlePage({
    getArticleBySlug: content.getArticleBySlug,
    getArticles: content.getArticles,
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
  const RecipePage = createRecipePage(
    recipePageDependencies(content.getRecipeBySlug),
  );
  const ArticlePage = createArticlePage({
    getArticleBySlug: content.getArticleBySlug,
    getArticles: content.getArticles,
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

test("authenticated preview renders unpublished recipes and essays in their public layouts", async () => {
  const publicContent = createFixtureContent();
  const previewQueries: string[] = [];
  const previewContent = createContentStore({
    source: "sanity",
    visibility: "preview",
    fetcher: async <T>(
      query: string,
      params: Record<string, string> = {},
    ) => {
      previewQueries.push(query);
      return fixtureFetcher()<T>(query, params);
    },
  });
  const RecipePage = createRecipePage(
    recipePageDependencies(publicContent.getRecipeBySlug),
    {
      isEnabled: async () => true,
      dependencies: recipePageDependencies(previewContent.getRecipeBySlug),
    },
  );
  const articleDependencies = {
    getArticles: previewContent.getArticles,
    getArticleBySlug: previewContent.getArticleBySlug,
    getKitchenItems: previewContent.getKitchenItems,
    getProducts: previewContent.getProducts,
    getRecipes: previewContent.getRecipes,
  };
  const ArticlePage = createArticlePage(
    {
      ...articleDependencies,
      getArticleBySlug: publicContent.getArticleBySlug,
    },
    {
      isEnabled: async () => true,
      dependencies: articleDependencies,
    },
  );

  const recipeHtml = renderRoute(
    await RecipePage({
      params: Promise.resolve({ slug: unpublishedRecipe.slug }),
    }),
  );
  const articleHtml = renderRoute(
    await ArticlePage({
      params: Promise.resolve({ slug: unpublishedArticle.slug }),
    }),
  );

  assert.match(recipeHtml, /<h1>Private noodles<\/h1>/);
  assert.match(recipeHtml, /Draft recipe copy for an authenticated preview/);
  assert.match(articleHtml, /<h1>Private market note<\/h1>/);
  assert.match(articleHtml, /Draft copy that must not reach page metadata/);
  for (const html of [recipeHtml, articleHtml]) {
    assert.match(html, /role="status"/);
    assert.match(html, /Unpublished preview/);
    assert.match(html, /Only authorized Studio users can see this draft/);
  }
  assert.match(
    recipeHtml,
    /href="\/api\/draft-mode\/disable\?returnTo=%2Frecipes"/,
  );
  assert.match(
    articleHtml,
    /href="\/api\/draft-mode\/disable\?returnTo=%2Farticles"/,
  );
  assert.deepEqual(await publicContent.getRecipeSlugs(), [
    { slug: publishedRecipe.slug },
  ]);
  assert.deepEqual(await publicContent.getArticleSlugs(), [
    { slug: publishedArticle.slug },
  ]);
  assert.deepEqual(previewSanityFetchOptions, {
    perspective: "drafts",
    cache: "no-store",
    stega: true,
  });
  assert.ok(
    previewQueries.every(
      (query) =>
        !query.includes('!(_id in path("drafts.**"))') &&
        !query.includes('editorialStage == "ready"'),
    ),
  );
});

test("authenticated preview safely renders sparse recipe and travel-essay drafts", async () => {
  const sparseRecipe = {
    documentId: "recipe-sparse-draft",
    slug: "sparse-draft-recipe",
    title: "Sparse draft recipe",
  };
  const sparseArticle = {
    documentId: "article-sparse-draft",
    slug: "sparse-draft-essay",
    format: "travelEssay" as const,
    permissionNotes: "Private note: do not identify the host.",
  };
  const previewQueries: string[] = [];
  const sparsePreviewContent = createContentStore({
    source: "sanity",
    visibility: "preview",
    fetcher: async <T>(query: string, params: Record<string, string> = {}) => {
      previewQueries.push(query);

      if (query.includes('_type == "recipe"')) {
        return (params.slug === sparseRecipe.slug ? sparseRecipe : null) as T;
      }

      if (query.includes('_type == "article"')) {
        return (params.slug === sparseArticle.slug ? sparseArticle : null) as T;
      }

      return [] as T;
    },
  });
  const emptyPublicContent = createContentStore({
    source: "sanity",
    fetcher: async <T>() => null as T,
  });
  const RecipePage = createRecipePage(
    recipePageDependencies(emptyPublicContent.getRecipeBySlug),
    {
      isEnabled: async () => true,
      dependencies: recipePageDependencies(
        sparsePreviewContent.getRecipeBySlug,
      ),
    },
  );
  const ArticlePage = createArticlePage(
    {
      getArticleBySlug: emptyPublicContent.getArticleBySlug,
      getArticles: async () => [],
      getKitchenItems: async () => [],
      getProducts: async () => [],
      getRecipes: async () => [],
    },
    {
      isEnabled: async () => true,
      dependencies: {
        getArticleBySlug: sparsePreviewContent.getArticleBySlug,
        getArticles: async () => [],
        getKitchenItems: async () => [],
        getProducts: async () => [],
        getRecipes: async () => [],
      },
    },
  );

  const recipeHtml = renderRoute(
    await RecipePage({
      params: Promise.resolve({ slug: sparseRecipe.slug }),
    }),
  );
  const articleHtml = renderRoute(
    await ArticlePage({
      params: Promise.resolve({ slug: sparseArticle.slug }),
    }),
  );
  const RecipeWithImagePage = createRecipePage(
    recipePageDependencies(emptyPublicContent.getRecipeBySlug),
    {
      isEnabled: async () => true,
      dependencies: recipePageDependencies(async (slug) =>
        slug === "image-only-draft"
          ? {
              documentId: "recipe-image-only-draft",
              image: "/images/kitchen/tools-flatlay.png",
              slug,
            }
          : null,
      ),
    },
  );
  const recipeWithImageHtml = renderRoute(
    await RecipeWithImagePage({
      params: Promise.resolve({ slug: "image-only-draft" }),
    }),
  );

  assert.match(recipeHtml, /<h1>Sparse draft recipe<\/h1>/);
  assert.match(recipeHtml, /Add a hero image/);
  assert.match(recipeHtml, /Add a recipe summary/);
  assert.match(recipeHtml, /Add prep, cook, and serving details/);
  assert.match(recipeHtml, /Add ingredients/);
  assert.match(recipeHtml, /Add method steps/);
  assert.match(articleHtml, /<h1[^>]*>Add a title<\/h1>/);
  assert.match(articleHtml, /Add a hero image/);
  assert.match(articleHtml, /Add travel details/);
  assert.match(articleHtml, /Add the essay body/);
  assert.match(recipeWithImageHtml, /background-image:url\(/);
  assert.doesNotMatch(recipeWithImageHtml, /<img[^>]+alt=""/);
  assert.match(recipeWithImageHtml, /Add hero image alternative text/);
  assert.doesNotMatch(recipeWithImageHtml, />Add a hero image</);
  assert.match(recipeWithImageHtml, /<h1[^>]*>Add a title<\/h1>/);

  for (const html of [recipeHtml, articleHtml]) {
    assert.match(html, /Unpublished preview/);
    assert.doesNotMatch(html, /undefined|url\(\)|url\(undefined\)|src=""/);
  }
  assert.doesNotMatch(articleHtml, /Private note|permissionNotes/);
  assert.ok(
    previewQueries.every((query) => !query.includes("permissionNotes")),
  );

  const AnonymousRecipePage = createRecipePage(
    recipePageDependencies(emptyPublicContent.getRecipeBySlug),
  );
  const AnonymousArticlePage = createArticlePage({
    getArticleBySlug: emptyPublicContent.getArticleBySlug,
    getArticles: async () => [],
    getKitchenItems: async () => [],
    getProducts: async () => [],
    getRecipes: async () => [],
  });

  await assert.rejects(
    AnonymousRecipePage({
      params: Promise.resolve({ slug: sparseRecipe.slug }),
    }),
    isNotFoundError,
  );
  await assert.rejects(
    AnonymousArticlePage({
      params: Promise.resolve({ slug: sparseArticle.slug }),
    }),
    isNotFoundError,
  );
});

test("configured Presentation locations explain missing slugs and resolve routeable drafts", () => {
  const recipeLocations = presentationLocations.recipe;
  const articleLocations = presentationLocations.article;
  assert.ok("resolve" in recipeLocations);
  assert.ok("resolve" in articleLocations);

  assert.deepEqual(
    recipeLocations.resolve({
      title: "Unrouted recipe",
      slug: undefined,
    }),
    {
      message: "Add or generate a slug to preview this recipe.",
      tone: "caution",
    },
  );
  assert.deepEqual(
    articleLocations.resolve({
      format: "travelEssay",
      title: "Unrouted essay",
      slug: undefined,
    }),
    {
      message: "Add or generate a slug to preview this travel essay.",
      tone: "caution",
    },
  );

  assert.deepEqual(
    recipeLocations.resolve({
      title: "Routeable recipe",
      slug: "routeable-recipe",
    }),
    {
      locations: [
        { title: "Routeable recipe", href: "/recipes/routeable-recipe" },
        { title: "Recipe index", href: "/recipes" },
      ],
    },
  );
  assert.deepEqual(
    articleLocations.resolve({
      format: "travelEssay",
      title: "Routeable essay",
      slug: "routeable-essay",
    }),
    {
      locations: [
        { title: "Routeable essay", href: "/articles/routeable-essay" },
        { title: "Article index", href: "/articles" },
      ],
    },
  );
});

test("Visual Editing mounts only in Draft Mode with the embedded Studio target", async () => {
  const VisualEditingFixture = () =>
    createElement("span", { "data-visual-editing": "connected" });
  const PublicVisualEditing = createDraftModeVisualEditing({
    isDraftModeEnabled: async () => false,
    VisualEditingComponent: VisualEditingFixture,
  });
  const PreviewVisualEditing = createDraftModeVisualEditing({
    isDraftModeEnabled: async () => true,
    VisualEditingComponent: VisualEditingFixture,
  });

  const publicHtml = renderToStaticMarkup(await PublicVisualEditing());
  const previewHtml = renderToStaticMarkup(await PreviewVisualEditing());
  const rootLayoutSource = await readFile(
    new URL("../app/layout.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(publicHtml, /data-visual-editing/);
  assert.match(previewHtml, /data-visual-editing="connected"/);
  assert.match(rootLayoutSource, /<DraftModeVisualEditing\s*\/>/);
  assert.deepEqual(client.config().stega, {
    enabled: false,
    studioUrl: "/studio",
  });
});

test("preview exit follows a published document across a draft slug change", async () => {
  const editedDraft = {
    ...publishedRecipe,
    slug: "renamed-fixture-noodles",
    title: "Renamed fixture noodles",
  };
  const publicDependencies = {
    ...recipePageDependencies(async (slug) =>
      slug === publishedRecipe.slug ? publishedRecipe : null,
    ),
    getRecipeByDocumentId: async (documentId: string) =>
      documentId === publishedRecipe.documentId ? publishedRecipe : null,
  };
  const previewDependencies = {
    ...recipePageDependencies(async (slug) =>
      slug === editedDraft.slug ? editedDraft : null,
    ),
  };
  const RecipePage = createRecipePage(publicDependencies, {
    isEnabled: async () => true,
    dependencies: previewDependencies,
  });

  const html = renderRoute(
    await RecipePage({
      params: Promise.resolve({ slug: editedDraft.slug }),
    }),
  );

  assert.match(html, /<h1>Renamed fixture noodles<\/h1>/);
  assert.match(
    html,
    /href="\/api\/draft-mode\/disable\?returnTo=%2Frecipes%2Ffixture-noodles"/,
  );
});

test("draft preview metadata is generic and blocks indexing", async () => {
  const draftFields = [
    unpublishedRecipe.title,
    unpublishedRecipe.note,
    unpublishedArticle.title,
    unpublishedArticle.dek,
  ];
  const failIfLoaded = async () => {
    throw new Error("Preview metadata must not load draft entry fields");
  };
  const recipeMetadata = createRecipeMetadata(failIfLoaded, async () => true);
  const articleMetadata = createArticleMetadata(failIfLoaded, async () => true);

  for (const metadata of [
    await recipeMetadata({
      params: Promise.resolve({ slug: unpublishedRecipe.slug }),
    }),
    await articleMetadata({
      params: Promise.resolve({ slug: unpublishedArticle.slug }),
    }),
  ]) {
    const serialized = JSON.stringify(metadata);
    assert.equal(metadata.title, "Unpublished preview | Nibbles with Nifa");
    assert.deepEqual(metadata.robots, {
      index: false,
      follow: false,
      nocache: true,
    });
    assert.equal(metadata.openGraph, undefined);
    assert.equal(metadata.twitter, undefined);
    for (const draftField of draftFields) {
      assert.doesNotMatch(serialized, new RegExp(draftField));
    }
  }
});

test("draft mode entry and exit routes fail closed and return safely", async () => {
  const unauthorized = await enableDraftMode(
    new Request("http://localhost:3000/api/draft-mode/enable"),
  );
  assert.equal(unauthorized.status, 401);
  const unauthorizedBody = await unauthorized.text();
  assert.equal(unauthorizedBody, "Invalid secret");
  assert.doesNotMatch(unauthorizedBody, /Private/);

  let previewEnabled = false;
  const authorizedEntry = createEnableDraftModeHandler({
    validate: async (request) => {
      const url = new URL(request.url);
      return {
        isValid:
          url.searchParams.get("sanity-preview-secret") ===
          "valid-studio-secret",
        redirectTo: url.searchParams.get("sanity-preview-pathname") || "/",
      };
    },
    enable: async () => {
      previewEnabled = true;
    },
  });
  const previewContent = createContentStore({
    source: "sanity",
    visibility: "preview",
    fetcher: fixtureFetcher(),
  });
  const publicContent = createFixtureContent();
  const RecipePage = createRecipePage(
    recipePageDependencies(publicContent.getRecipeBySlug),
    {
      isEnabled: async () => previewEnabled,
      dependencies: recipePageDependencies(previewContent.getRecipeBySlug),
    },
  );
  const ArticlePage = createArticlePage(
    {
      getArticleBySlug: publicContent.getArticleBySlug,
      getArticles: publicContent.getArticles,
      getKitchenItems: publicContent.getKitchenItems,
      getProducts: publicContent.getProducts,
      getRecipes: publicContent.getRecipes,
    },
    {
      isEnabled: async () => previewEnabled,
      dependencies: {
        getArticleBySlug: previewContent.getArticleBySlug,
        getArticles: previewContent.getArticles,
        getKitchenItems: previewContent.getKitchenItems,
        getProducts: previewContent.getProducts,
        getRecipes: previewContent.getRecipes,
      },
    },
  );

  await assert.rejects(
    RecipePage({
      params: Promise.resolve({ slug: unpublishedRecipe.slug }),
    }),
    isNotFoundError,
  );
  const authorized = await authorizedEntry(
    new Request(
      "http://localhost:3000/api/draft-mode/enable?sanity-preview-secret=valid-studio-secret&sanity-preview-pathname=%2Frecipes%2Fprivate-noodles",
    ),
  );
  assert.equal(authorized.status, 307);
  assert.equal(
    authorized.headers.get("location"),
    "http://localhost:3000/recipes/private-noodles",
  );
  assert.match(
    renderRoute(
      await RecipePage({
        params: Promise.resolve({ slug: unpublishedRecipe.slug }),
      }),
    ),
    /Private noodles/,
  );
  assert.match(
    renderRoute(
      await ArticlePage({
        params: Promise.resolve({ slug: unpublishedArticle.slug }),
      }),
    ),
    /Private market note/,
  );

  const disableDraftMode = createDisableDraftModeHandler(async () => {
    previewEnabled = false;
  });
  const safeExit = await disableDraftMode(
    new Request(
      "http://localhost:3000/api/draft-mode/disable?returnTo=%2Frecipes%2Ffixture-noodles",
    ),
  );
  assert.equal(previewEnabled, false);
  assert.equal(safeExit.status, 307);
  assert.equal(
    safeExit.headers.get("location"),
    "http://localhost:3000/recipes/fixture-noodles",
  );
  await assert.rejects(
    ArticlePage({
      params: Promise.resolve({ slug: unpublishedArticle.slug }),
    }),
    isNotFoundError,
  );

  const unsafeExit = await disableDraftMode(
    new Request(
      "http://localhost:3000/api/draft-mode/disable?returnTo=https%3A%2F%2Fevil.example",
    ),
  );
  assert.equal(unsafeExit.headers.get("location"), "http://localhost:3000/");
});

test("recipe and essay metadata use custom values without changing visible copy", async () => {
  const recipeWithSeo = {
    ...publishedRecipe,
    seo: {
      title: "Custom noodle search title",
      description: "Custom noodle search description.",
      image: "https://cdn.sanity.io/images/example/production/noodle-share.jpg",
    },
  };
  const articleWithSeo = {
    ...publishedArticle,
    seo: {
      title: "Custom market search title",
      description: "Custom market search description.",
      image: "https://cdn.sanity.io/images/example/production/market-share.jpg",
    },
  };
  const recipeMetadata = createRecipeMetadata(async () => recipeWithSeo);
  const articleMetadata = createArticleMetadata(async () => articleWithSeo);
  const RecipePage = createRecipePage(
    recipePageDependencies(async () => recipeWithSeo),
  );
  const ArticlePage = createArticlePage({
    getArticleBySlug: async () => articleWithSeo,
    getArticles: async () => [],
    getKitchenItems: async () => [],
    getProducts: async () => [],
    getRecipes: async () => [],
  });

  assert.deepEqual(
    await recipeMetadata({
      params: Promise.resolve({ slug: publishedRecipe.slug }),
    }),
    expectedMetadata(
      "Custom noodle search title",
      "Custom noodle search description.",
      "https://cdn.sanity.io/images/example/production/noodle-share.jpg",
    ),
  );
  assert.deepEqual(
    await articleMetadata({
      params: Promise.resolve({ slug: publishedArticle.slug }),
    }),
    expectedMetadata(
      "Custom market search title",
      "Custom market search description.",
      "https://cdn.sanity.io/images/example/production/market-share.jpg",
    ),
  );

  const recipeHtml = renderRoute(
    await RecipePage({ params: Promise.resolve({ slug: publishedRecipe.slug }) }),
  );
  const articleHtml = renderRoute(
    await ArticlePage({
      params: Promise.resolve({ slug: publishedArticle.slug }),
    }),
  );
  assert.match(recipeHtml, /<h1>Fixture noodles<\/h1>/);
  assert.match(recipeHtml, /A published fixture recipe/);
  assert.doesNotMatch(recipeHtml, /Custom noodle search/);
  assert.match(articleHtml, /<h1>Fixture market note<\/h1>/);
  assert.match(articleHtml, /A published fixture article/);
  assert.doesNotMatch(articleHtml, /Custom market search/);
});

test("recipe and essay metadata fall back to visible entry fields", async () => {
  const recipeMetadata = createRecipeMetadata(async () => ({
    ...publishedRecipe,
    seo: { title: " ", description: "", image: "   " },
  }));
  const articleMetadata = createArticleMetadata(async () => publishedArticle);

  const resolvedRecipe = await recipeMetadata({
    params: Promise.resolve({ slug: publishedRecipe.slug }),
  });
  const resolvedArticle = await articleMetadata({
    params: Promise.resolve({ slug: publishedArticle.slug }),
  });

  assert.equal(resolvedRecipe.title, publishedRecipe.title);
  assert.equal(resolvedRecipe.description, publishedRecipe.note);
  assert.deepEqual(resolvedRecipe.openGraph?.images, [publishedRecipe.image]);
  assert.equal(resolvedArticle.title, publishedArticle.title);
  assert.equal(resolvedArticle.description, publishedArticle.dek);
  assert.deepEqual(resolvedArticle.openGraph?.images, [publishedArticle.image]);
});

test("unknown and unpublished entries cannot reveal metadata", async () => {
  const content = createFixtureContent();
  const recipeMetadata = createRecipeMetadata(content.getRecipeBySlug);
  const articleMetadata = createArticleMetadata(content.getArticleBySlug);

  await assert.rejects(
    recipeMetadata({
      params: Promise.resolve({ slug: unpublishedRecipe.slug }),
    }),
    isNotFoundError,
  );
  await assert.rejects(
    recipeMetadata({ params: Promise.resolve({ slug: "unknown-recipe" }) }),
    isNotFoundError,
  );
  await assert.rejects(
    articleMetadata({ params: Promise.resolve({ slug: "unknown-article" }) }),
    isNotFoundError,
  );
  await assert.rejects(
    articleMetadata({
      params: Promise.resolve({ slug: unpublishedArticle.slug }),
    }),
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
  assert.match(queries[0], /seo\s*\{/);
  assert.doesNotMatch(queries[0], /privateIdeaNotes/);
  assert.doesNotMatch(queries[0], /permissionNotes/);
  assert.doesNotMatch(queries[0], /verificationNotes/);
  assert.doesNotMatch(queries[0], /untestedSubstitutions/);
  assert.doesNotMatch(queries[0], /storageGuidance/);
  assert.doesNotMatch(queries[0], /allergenClaims/);
  assert.doesNotMatch(queries[0], /foodSafetyGuidance/);
  assert.doesNotMatch(queries[0], /cookTest/);
});

test("recipe publication validation does not require testing toggles", () => {
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
    }),
    true,
  );

  const incompleteResult = validateRecipeForPublication({
    editorialStage: "ready",
    title: "Not actually ready",
  });

  assert.equal(typeof incompleteResult, "string");
  assert.match(String(incompleteResult), /slug/i);
  assert.match(String(incompleteResult), /hero image/i);
  assert.match(String(incompleteResult), /alternative text/i);
  assert.match(String(incompleteResult), /credit/i);
  assert.match(String(incompleteResult), /personal headnote/i);
  assert.match(String(incompleteResult), /yield/i);
  assert.match(String(incompleteResult), /prep minutes/i);
  assert.match(String(incompleteResult), /cook minutes/i);
  assert.match(String(incompleteResult), /grouped ingredients/i);
  assert.match(String(incompleteResult), /ordered method/i);
  assert.match(String(incompleteResult), /tag/i);
  assert.doesNotMatch(String(incompleteResult), /completed cook/);
  assert.doesNotMatch(String(incompleteResult), /corrected quantities/);
  assert.doesNotMatch(String(incompleteResult), /corrected timings/);
  assert.doesNotMatch(String(incompleteResult), /corrected yield/);

  assert.equal(validateRecipeForPublication(readyRecipeDocument()), true);
});

test("ready recipes require named groups and metric ingredient lines", () => {
  const result = validateRecipeForPublication(
    readyRecipeDocument({
      ingredients: [{ items: [{ text: "a handful of noodles" }] }],
    }),
  );

  assert.equal(typeof result, "string");
  assert.match(String(result), /group heading/i);
  assert.match(String(result), /metric quantity/i);

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
  assert.match(renderRoute(await ArticlesPage()), /0 travel essays/);
});

test("a production provider failure remains visible", async () => {
  const providerError = new Error("Sanity unavailable");
  const fetcher: ContentFetcher = async () => {
    throw providerError;
  };
  const content = createContentStore({ source: "sanity", fetcher });
  const RecipesPage = createRecipesPage(content.getRecipes);
  const RecipePage = createRecipePage(
    recipePageDependencies(content.getRecipeBySlug),
  );

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

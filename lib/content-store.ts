import {
  articles as demoArticles,
  demoCreatorProfile,
  kitchenItems as demoKitchenItems,
  products as demoProducts,
  recipes as demoRecipes,
  type Article,
  type CreatorProfile,
  type KitchenItem,
  type Product,
  type Recipe,
} from "@/app/data";
import { normalizeEditorialTags } from "@/lib/editorial-tags";
import { normalizeRelatedReferences } from "@/lib/related-content";

export type ContentSource = "sanity" | "demo";
export type ContentFetcher = <T>(
  query: string,
  params?: Record<string, string>,
) => Promise<T>;

export type ProductWithExternalUrl = Product & { externalUrl?: string };

type CreateContentStoreOptions = {
  source: ContentSource;
  fetcher: ContentFetcher;
  visibility?: "preview" | "published";
};

const publishedDocumentFilter = '!(_id in path("drafts.**"))';
const readyRecipeFilter = 'editorialStage == "ready"';

const creatorProfileFields = `
  name,
  biography,
  portrait{
    "image": asset->url,
    alt
  },
  socialLinks[]{platform, url}
`;

const creatorField = `
  "creator": *[
    _type == "creatorProfile" &&
    _id == "creatorProfile"
  ][0]{${creatorProfileFields}}
`;

const relatedField = `
  "related": array::compact(coalesce(relatedContent[]->{
    "type": _type,
    "slug": slug.current
  }, []) +
  coalesce(relatedArticles[]->{"type": "article", "slug": slug.current}, []) +
  coalesce(relatedRecipes[]->{"type": "recipe", "slug": slug.current}, []) +
  coalesce(relatedProducts[]->{"type": "product", "slug": slug.current}, []) +
  coalesce(relatedKitchenItems[]->{"type": "kitchenItem", "slug": slug.current}, []))
`;

const recipeFields = `
  "documentId": _id,
  title,
  "slug": slug.current,
  note,
  "image": image.asset->url,
  "imageAlt": image.alt,
  "imageCredit": image.credit,
  seo{
    title,
    description,
    "image": image.asset->url
  },
  featured,
  date,
  servings,
  prep,
  cook,
  tags,
  intro,
  ingredients[]{
    group,
    "items": items[]{
      _type == "ingredientItem" => {
        amount,
        unit,
        ingredient,
        preparation,
        text,
        "image": image.asset->url,
        alt
      },
      !defined(_type) => @
    }
  },
  steps,
  provenance{
    sourceType,
    sourceName,
    sourceUrl,
    specificContribution,
    placeOrCulturalLane,
    adaptationStatement,
    credit
  },
  publicNotes,
  testedSubstitutions,
  ${relatedField},
  ${creatorField}
`;

const productFields = `
  title,
  "slug": slug.current,
  blurb,
  "image": image.asset->url,
  "imageAlt": image.alt,
  price,
  externalUrl,
  category
`;

const kitchenItemFields = `
  title,
  "slug": slug.current,
  blurb,
  "image": image.asset->url,
  "imageAlt": image.alt,
  affiliateUrl
`;

const articleFields = `
  "documentId": _id,
  title,
  "slug": slug.current,
  dek,
  "image": image.asset->url,
  "imageAlt": image.alt,
  seo{
    title,
    description,
    "image": image.asset->url
  },
  date,
  category,
  "format": coalesce(format, "standard"),
  place,
  visitDate,
  factCheckDate,
  readTime,
  featured,
  tags,
  intro,
  body,
  travelMedia[]{
    _key,
    _type,
    _type == "travelImage" => {
      "image": image.asset->url,
      "width": image.asset->metadata.dimensions.width,
      "height": image.asset->metadata.dimensions.height,
      alt,
      caption,
      credit
    },
    _type == "travelVideo" => {
      "video": video.asset->url,
      aspectRatio,
      caption,
      credit,
      transcript
    }
  },
  sections[]{heading, body},
  acknowledgements,
  sources[]{title, url},
  ${relatedField},
  ${creatorField}
`;

function withDemoCreator<T extends Article | Recipe>(content: T) {
  return {
    ...normalizeEntryTags(content),
    creator: demoCreatorProfile,
  };
}

function normalizeEntryTags<T extends Article | Recipe>(content: T): T {
  return {
    ...content,
    related: normalizeRelatedReferences(content.related),
    tags: normalizeEditorialTags(content.tags),
  };
}

export function resolveContentSource(
  value?: string,
  nodeEnv = process.env.NODE_ENV,
): ContentSource {
  if (value === undefined || value === "" || value === "sanity") {
    return "sanity";
  }

  if (value === "demo") {
    if (nodeEnv === "production") {
      throw new Error(
        "Demo content is unavailable in production. Use Sanity as the production content source.",
      );
    }

    return "demo";
  }

  throw new Error(
    `Unsupported CONTENT_SOURCE "${value}". Use "sanity" or "demo".`,
  );
}

export function createContentStore({
  source,
  fetcher,
  visibility = "published",
}: CreateContentStoreOptions) {
  const isDemo = source === "demo";
  const documentVisibilityFilter =
    visibility === "published" ? ` && ${publishedDocumentFilter}` : "";
  const recipeVisibilityFilter =
    visibility === "published" ? ` && ${readyRecipeFilter}` : "";

  async function getCreatorProfile(): Promise<CreatorProfile | null> {
    if (isDemo) return demoCreatorProfile;

    const creator = await fetcher<CreatorProfile | null>(
      `*[_type == "creatorProfile"${documentVisibilityFilter} && _id == "creatorProfile"][0]{${creatorProfileFields}}`,
    );

    return creator && !Array.isArray(creator) ? creator : null;
  }

  async function getRecipes(): Promise<Recipe[]> {
    if (isDemo) return demoRecipes.map(withDemoCreator);

    const recipes = await fetcher<Recipe[]>(
      `*[_type == "recipe"${documentVisibilityFilter}${recipeVisibilityFilter} && defined(slug.current)]|order(date desc){${recipeFields}}`,
    );
    return recipes.map(normalizeEntryTags);
  }

  async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
    if (isDemo) {
      const recipe = demoRecipes.find((item) => item.slug === slug);
      return recipe ? withDemoCreator(recipe) : null;
    }

    const recipe = await fetcher<Recipe | null>(
      `*[_type == "recipe"${documentVisibilityFilter}${recipeVisibilityFilter} && slug.current == $slug][0]{${recipeFields}}`,
      { slug },
    );
    return recipe ? normalizeEntryTags(recipe) : null;
  }

  async function getRecipeByDocumentId(
    documentId: string,
  ): Promise<Recipe | null> {
    if (isDemo) return null;

    const recipe = await fetcher<Recipe | null>(
      `*[_type == "recipe"${documentVisibilityFilter}${recipeVisibilityFilter} && _id == $documentId][0]{${recipeFields}}`,
      { documentId },
    );
    return recipe ? normalizeEntryTags(recipe) : null;
  }

  async function getRecipeSlugs() {
    const recipes = await getRecipes();
    return recipes.map(({ slug }) => ({ slug }));
  }

  async function getProducts(): Promise<ProductWithExternalUrl[]> {
    if (isDemo) return demoProducts;

    return fetcher<ProductWithExternalUrl[]>(
      `*[_type == "product"${documentVisibilityFilter} && defined(slug.current)]|order(title asc){${productFields}}`,
    );
  }

  async function getProductBySlug(
    slug: string,
  ): Promise<ProductWithExternalUrl | null> {
    if (isDemo) {
      return demoProducts.find((item) => item.slug === slug) ?? null;
    }

    return fetcher<ProductWithExternalUrl | null>(
      `*[_type == "product"${documentVisibilityFilter} && slug.current == $slug][0]{${productFields}}`,
      { slug },
    );
  }

  async function getProductSlugs() {
    const products = await getProducts();
    return products.map(({ slug }) => ({ slug }));
  }

  async function getKitchenItems(): Promise<KitchenItem[]> {
    if (isDemo) return demoKitchenItems;

    return fetcher<KitchenItem[]>(
      `*[_type == "kitchenItem"${documentVisibilityFilter} && defined(slug.current)]|order(title asc){${kitchenItemFields}}`,
    );
  }

  async function getArticles(): Promise<Article[]> {
    if (isDemo) return demoArticles.map(withDemoCreator);

    const articles = await fetcher<Article[]>(
      `*[_type == "article"${documentVisibilityFilter} && defined(slug.current)]|order(date desc){${articleFields}}`,
    );
    return articles.map(normalizeEntryTags);
  }

  async function getArticleBySlug(slug: string): Promise<Article | null> {
    if (isDemo) {
      const article = demoArticles.find((item) => item.slug === slug);
      return article ? withDemoCreator(article) : null;
    }

    const article = await fetcher<Article | null>(
      `*[_type == "article"${documentVisibilityFilter} && slug.current == $slug][0]{${articleFields}}`,
      { slug },
    );
    return article ? normalizeEntryTags(article) : null;
  }

  async function getArticleByDocumentId(
    documentId: string,
  ): Promise<Article | null> {
    if (isDemo) return null;

    const article = await fetcher<Article | null>(
      `*[_type == "article"${documentVisibilityFilter} && _id == $documentId][0]{${articleFields}}`,
      { documentId },
    );
    return article ? normalizeEntryTags(article) : null;
  }

  async function getArticleSlugs() {
    const articles = await getArticles();
    return articles.map(({ slug }) => ({ slug }));
  }

  async function getHomeContent() {
    const [creator, recipes, products, kitchenItems, articles] = await Promise.all([
      getCreatorProfile(),
      getRecipes(),
      getProducts(),
      getKitchenItems(),
      getArticles(),
    ]);

    return { creator, recipes, products, kitchenItems, articles };
  }

  return {
    getArticleByDocumentId,
    getArticleBySlug,
    getArticleSlugs,
    getArticles,
    getCreatorProfile,
    getHomeContent,
    getKitchenItems,
    getProductBySlug,
    getProductSlugs,
    getProducts,
    getRecipeByDocumentId,
    getRecipeBySlug,
    getRecipeSlugs,
    getRecipes,
  };
}

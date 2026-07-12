import {
  articles as demoArticles,
  demoCreatorProfile,
  kitchenItems as demoKitchenItems,
  products as demoProducts,
  recipes as demoRecipes,
  type Article,
  type KitchenItem,
  type Product,
  type Recipe,
} from "@/app/data";
import { normalizeEditorialTags } from "@/lib/editorial-tags";

export type ContentSource = "sanity" | "demo";
export type ContentFetcher = <T>(
  query: string,
  params?: Record<string, string>,
) => Promise<T>;

export type ProductWithExternalUrl = Product & { externalUrl?: string };

type CreateContentStoreOptions = {
  source: ContentSource;
  fetcher: ContentFetcher;
};

const publishedDocumentFilter = '!(_id in path("drafts.**"))';
const readyRecipeFilter = 'editorialStage == "ready"';

const creatorField = `
  "creator": *[
    _type == "creatorProfile" &&
    _id == "creatorProfile"
  ][0]{
    name,
    biography,
    portrait{
      "image": asset->url,
      alt
    },
    socialLinks[]{platform, url}
  }
`;

const recipeFields = `
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
  cookTest{completedCook},
  publicNotes,
  testedSubstitutions,
  ${creatorField}
`;

const productFields = `
  title,
  "slug": slug.current,
  blurb,
  "image": image.asset->url,
  price,
  externalUrl,
  category
`;

const kitchenItemFields = `
  title,
  "slug": slug.current,
  blurb,
  "image": image.asset->url,
  affiliateUrl
`;

const articleFields = `
  title,
  "slug": slug.current,
  dek,
  "image": image.asset->url,
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
  "related": {
    "recipes": coalesce(relatedRecipes[]->slug.current, []),
    "products": coalesce(relatedProducts[]->slug.current, []),
    "kitchenItems": coalesce(relatedKitchenItems[]->slug.current, [])
  },
  ${creatorField}
`;

function withDemoCreator<T extends Article | Recipe>(content: T) {
  return {
    ...normalizeEntryTags(content),
    creator: demoCreatorProfile,
  };
}

function normalizeEntryTags<T extends Article | Recipe>(content: T): T {
  return { ...content, tags: normalizeEditorialTags(content.tags) };
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
}: CreateContentStoreOptions) {
  const isDemo = source === "demo";

  async function getRecipes(): Promise<Recipe[]> {
    if (isDemo) return demoRecipes.map(withDemoCreator);

    const recipes = await fetcher<Recipe[]>(
      `*[_type == "recipe" && ${publishedDocumentFilter} && ${readyRecipeFilter} && defined(slug.current)]|order(date desc){${recipeFields}}`,
    );
    return recipes.map(normalizeEntryTags);
  }

  async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
    if (isDemo) {
      const recipe = demoRecipes.find((item) => item.slug === slug);
      return recipe ? withDemoCreator(recipe) : null;
    }

    const recipe = await fetcher<Recipe | null>(
      `*[_type == "recipe" && ${publishedDocumentFilter} && ${readyRecipeFilter} && slug.current == $slug][0]{${recipeFields}}`,
      { slug },
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
      `*[_type == "product" && ${publishedDocumentFilter} && defined(slug.current)]|order(title asc){${productFields}}`,
    );
  }

  async function getProductBySlug(
    slug: string,
  ): Promise<ProductWithExternalUrl | null> {
    if (isDemo) {
      return demoProducts.find((item) => item.slug === slug) ?? null;
    }

    return fetcher<ProductWithExternalUrl | null>(
      `*[_type == "product" && ${publishedDocumentFilter} && slug.current == $slug][0]{${productFields}}`,
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
      `*[_type == "kitchenItem" && ${publishedDocumentFilter} && defined(slug.current)]|order(title asc){${kitchenItemFields}}`,
    );
  }

  async function getArticles(): Promise<Article[]> {
    if (isDemo) return demoArticles.map(withDemoCreator);

    const articles = await fetcher<Article[]>(
      `*[_type == "article" && ${publishedDocumentFilter} && defined(slug.current)]|order(date desc){${articleFields}}`,
    );
    return articles.map(normalizeEntryTags);
  }

  async function getArticleBySlug(slug: string): Promise<Article | null> {
    if (isDemo) {
      const article = demoArticles.find((item) => item.slug === slug);
      return article ? withDemoCreator(article) : null;
    }

    const article = await fetcher<Article | null>(
      `*[_type == "article" && ${publishedDocumentFilter} && slug.current == $slug][0]{${articleFields}}`,
      { slug },
    );
    return article ? normalizeEntryTags(article) : null;
  }

  async function getArticleSlugs() {
    const articles = await getArticles();
    return articles.map(({ slug }) => ({ slug }));
  }

  async function getHomeContent() {
    const [recipes, products, kitchenItems, articles] = await Promise.all([
      getRecipes(),
      getProducts(),
      getKitchenItems(),
      getArticles(),
    ]);

    return { recipes, products, kitchenItems, articles };
  }

  return {
    getArticleBySlug,
    getArticleSlugs,
    getArticles,
    getHomeContent,
    getKitchenItems,
    getProductBySlug,
    getProductSlugs,
    getProducts,
    getRecipeBySlug,
    getRecipeSlugs,
    getRecipes,
  };
}

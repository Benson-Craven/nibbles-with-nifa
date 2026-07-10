import {
  articles as demoArticles,
  kitchenItems as demoKitchenItems,
  products as demoProducts,
  recipes as demoRecipes,
  type Article,
  type KitchenItem,
  type Product,
  type Recipe,
} from "@/app/data";

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

const recipeFields = `
  title,
  "slug": slug.current,
  note,
  "image": image.asset->url,
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
        text,
        "image": image.asset->url,
        alt
      },
      !defined(_type) => @
    }
  },
  steps
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
  date,
  category,
  readTime,
  featured,
  intro,
  sections[]{heading, body},
  "related": {
    "recipes": coalesce(relatedRecipes[]->slug.current, []),
    "products": coalesce(relatedProducts[]->slug.current, []),
    "kitchenItems": coalesce(relatedKitchenItems[]->slug.current, [])
  }
`;

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
    if (isDemo) return demoRecipes;

    return fetcher<Recipe[]>(
      `*[_type == "recipe" && ${publishedDocumentFilter} && defined(slug.current)]|order(date desc){${recipeFields}}`,
    );
  }

  async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
    if (isDemo) {
      return demoRecipes.find((item) => item.slug === slug) ?? null;
    }

    return fetcher<Recipe | null>(
      `*[_type == "recipe" && ${publishedDocumentFilter} && slug.current == $slug][0]{${recipeFields}}`,
      { slug },
    );
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
    if (isDemo) return demoArticles;

    return fetcher<Article[]>(
      `*[_type == "article" && ${publishedDocumentFilter} && defined(slug.current)]|order(date desc){${articleFields}}`,
    );
  }

  async function getArticleBySlug(slug: string): Promise<Article | null> {
    if (isDemo) {
      return demoArticles.find((item) => item.slug === slug) ?? null;
    }

    return fetcher<Article | null>(
      `*[_type == "article" && ${publishedDocumentFilter} && slug.current == $slug][0]{${articleFields}}`,
      { slug },
    );
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

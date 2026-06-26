import { client } from "@/sanity/client";
import { hasSanityEnv } from "@/sanity/env";
import {
  articles as fallbackArticles,
  kitchenItems as fallbackKitchenItems,
  products as fallbackProducts,
  recipes as fallbackRecipes,
  type Article,
  type KitchenItem,
  type Product,
  type Recipe,
} from "@/app/data";

type ProductWithExternalUrl = Product & { externalUrl?: string };

const REVALIDATE_SECONDS = 60;

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

async function fetchFromSanity<T>(
  query: string,
  params: Record<string, string> = {},
): Promise<T | null> {
  if (!hasSanityEnv) {
    return null;
  }

  try {
    return await client.fetch<T>(query, params, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch {
    return null;
  }
}

function withArrayFallback<T>(items: T[] | null, fallback: T[]) {
  return Array.isArray(items) && items.length > 0 ? items : fallback;
}

export async function getRecipes(): Promise<Recipe[]> {
  const recipes = await fetchFromSanity<Recipe[]>(
    `*[_type == "recipe" && defined(slug.current)]|order(date desc){${recipeFields}}`,
  );

  return withArrayFallback(recipes, fallbackRecipes);
}

export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  const recipe = await fetchFromSanity<Recipe>(
    `*[_type == "recipe" && slug.current == $slug][0]{${recipeFields}}`,
    { slug },
  );

  return recipe ?? fallbackRecipes.find((item) => item.slug === slug) ?? null;
}

export async function getRecipeSlugs() {
  const recipes = await getRecipes();
  return recipes.map(({ slug }) => ({ slug }));
}

export async function getProducts(): Promise<ProductWithExternalUrl[]> {
  const products = await fetchFromSanity<ProductWithExternalUrl[]>(
    `*[_type == "product" && defined(slug.current)]|order(title asc){${productFields}}`,
  );

  return withArrayFallback(products, fallbackProducts);
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithExternalUrl | null> {
  const product = await fetchFromSanity<ProductWithExternalUrl>(
    `*[_type == "product" && slug.current == $slug][0]{${productFields}}`,
    { slug },
  );

  return product ?? fallbackProducts.find((item) => item.slug === slug) ?? null;
}

export async function getProductSlugs() {
  const products = await getProducts();
  return products.map(({ slug }) => ({ slug }));
}

export async function getKitchenItems(): Promise<KitchenItem[]> {
  const kitchenItems = await fetchFromSanity<KitchenItem[]>(
    `*[_type == "kitchenItem" && defined(slug.current)]|order(title asc){${kitchenItemFields}}`,
  );

  return withArrayFallback(kitchenItems, fallbackKitchenItems);
}

export async function getArticles(): Promise<Article[]> {
  const articles = await fetchFromSanity<Article[]>(
    `*[_type == "article" && defined(slug.current)]|order(date desc){${articleFields}}`,
  );

  return withArrayFallback(articles, fallbackArticles);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const article = await fetchFromSanity<Article>(
    `*[_type == "article" && slug.current == $slug][0]{${articleFields}}`,
    { slug },
  );

  return article ?? fallbackArticles.find((item) => item.slug === slug) ?? null;
}

export async function getArticleSlugs() {
  const articles = await getArticles();
  return articles.map(({ slug }) => ({ slug }));
}

export async function getHomeContent() {
  const [recipes, products, kitchenItems, articles] = await Promise.all([
    getRecipes(),
    getProducts(),
    getKitchenItems(),
    getArticles(),
  ]);

  return { recipes, products, kitchenItems, articles };
}

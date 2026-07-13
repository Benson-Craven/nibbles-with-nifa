import { client } from "@/sanity/client";
import {
  createContentStore,
  resolveContentSource,
  type ContentFetcher,
} from "@/lib/content-store";

const REVALIDATE_SECONDS = 60;

const fetchFromSanity: ContentFetcher = (query, params = {}) =>
  client.fetch(query, params, {
    perspective: "published",
    next: { revalidate: REVALIDATE_SECONDS },
  });

const content = createContentStore({
  source: resolveContentSource(process.env.CONTENT_SOURCE),
  fetcher: fetchFromSanity,
});

export const {
  getArticleByDocumentId,
  getArticleBySlug,
  getArticleSlugs,
  getArticles,
  getHomeContent,
  getKitchenItems,
  getProductBySlug,
  getProductSlugs,
  getProducts,
  getRecipeByDocumentId,
  getRecipeBySlug,
  getRecipeSlugs,
  getRecipes,
} = content;

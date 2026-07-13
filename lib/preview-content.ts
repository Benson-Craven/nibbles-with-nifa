import { createContentStore, type ContentFetcher } from "@/lib/content-store";
import { client } from "@/sanity/client";

export const previewSanityFetchOptions = {
  perspective: "drafts",
  cache: "no-store",
  stega: true,
} as const;

const fetchPreviewFromSanity: ContentFetcher = (query, params = {}) => {
  const token = process.env.SANITY_API_READ_TOKEN;

  if (!token) {
    throw new Error(
      "SANITY_API_READ_TOKEN is required to load authenticated draft previews.",
    );
  }

  return client
    .withConfig({ token, useCdn: false })
    .fetch(query, params, previewSanityFetchOptions);
};

export const previewContent = createContentStore({
  source: "sanity",
  visibility: "preview",
  fetcher: fetchPreviewFromSanity,
});

export const {
  getArticleBySlug: getPreviewArticleBySlug,
  getArticles: getPreviewArticles,
  getKitchenItems: getPreviewKitchenItems,
  getProducts: getPreviewProducts,
  getRecipeBySlug: getPreviewRecipeBySlug,
  getRecipes: getPreviewRecipes,
} = previewContent;

export async function getPreviewTravelEssayBySlug(slug: string) {
  const article = await previewContent.getArticleBySlug(slug);
  return article?.format === "travelEssay" ? article : null;
}

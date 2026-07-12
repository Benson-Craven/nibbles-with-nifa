import type {
  Article,
  KitchenItem,
  Product,
  Recipe,
  RelatedReference,
} from "@/app/data";

export type RelatedCollections = {
  articles: Article[];
  kitchenItems: KitchenItem[];
  products: Product[];
  recipes: Recipe[];
};

export type RelatedContentLoaders = {
  getArticles: () => Promise<Article[]>;
  getKitchenItems: () => Promise<KitchenItem[]>;
  getProducts: () => Promise<Product[]>;
  getRecipes: () => Promise<Recipe[]>;
};

const relatedTypes = new Set<RelatedReference["type"]>([
  "article",
  "kitchenItem",
  "product",
  "recipe",
]);

export function normalizeRelatedReferences(
  related: unknown,
): RelatedReference[] {
  if (!Array.isArray(related)) return [];

  const seen = new Set<string>();

  return related.flatMap((value) => {
    if (!value || typeof value !== "object") return [];

    const { slug, type } = value as { slug?: unknown; type?: unknown };
    if (
      typeof slug !== "string" ||
      !slug.trim() ||
      typeof type !== "string" ||
      !relatedTypes.has(type as RelatedReference["type"])
    ) {
      return [];
    }

    const reference = {
      slug: slug.trim(),
      type: type as RelatedReference["type"],
    };
    const key = `${reference.type}-${reference.slug}`;
    if (seen.has(key)) return [];

    seen.add(key);
    return [reference];
  });
}

export async function loadRelatedCollections(
  related: RelatedReference[] | undefined,
  loaders: RelatedContentLoaders,
): Promise<RelatedCollections> {
  const [articles, kitchenItems, products, recipes] = await Promise.all([
    hasType(related, "article") ? loaders.getArticles() : [],
    hasType(related, "kitchenItem") ? loaders.getKitchenItems() : [],
    hasType(related, "product") ? loaders.getProducts() : [],
    hasType(related, "recipe") ? loaders.getRecipes() : [],
  ]);

  return { articles, kitchenItems, products, recipes };
}

function hasType(
  related: RelatedReference[] | undefined,
  type: RelatedReference["type"],
) {
  return related?.some((reference) => reference.type === type) ?? false;
}

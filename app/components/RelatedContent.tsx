import type { RelatedReference } from "../data";
import { PageLink } from "./PageLink";
import { ContentImage } from "./ContentImage";
import type { RelatedCollections } from "@/lib/related-content";

type RelatedCard = {
  copy: string;
  external?: boolean;
  href: string;
  image?: string;
  imageAlt?: string;
  key: string;
  label: string;
  title: string;
};

type RelatedContentProps = RelatedCollections & {
  related?: RelatedReference[];
};

function resolveCards(
  related: RelatedReference[] | undefined,
  { articles, kitchenItems, products, recipes }: RelatedCollections,
) {
  const articlesBySlug = new Map(articles.map((item) => [item.slug, item]));
  const kitchenItemsBySlug = new Map(
    kitchenItems.map((item) => [item.slug, item]),
  );
  const productsBySlug = new Map(products.map((item) => [item.slug, item]));
  const recipesBySlug = new Map(recipes.map((item) => [item.slug, item]));
  const seen = new Set<string>();

  return (related ?? []).flatMap((reference): RelatedCard[] => {
    const key = `${reference.type}-${reference.slug}`;
    if (seen.has(key)) return [];
    seen.add(key);

    if (reference.type === "article") {
      const article = articlesBySlug.get(reference.slug);
      return article
        ? [
            {
              copy: article.dek,
              href: `/articles/${article.slug}`,
              image: article.image,
              imageAlt: article.imageAlt,
              key,
              label: "Article",
              title: article.title,
            },
          ]
        : [];
    }

    if (reference.type === "recipe") {
      const recipe = recipesBySlug.get(reference.slug);
      return recipe
        ? [
            {
              copy: recipe.note,
              href: `/recipes/${recipe.slug}`,
              image: recipe.image,
              imageAlt: recipe.imageAlt,
              key,
              label: "Recipe",
              title: recipe.title,
            },
          ]
        : [];
    }

    if (reference.type === "product") {
      const product = productsBySlug.get(reference.slug);
      return product
        ? [
            {
              copy: product.blurb,
              href: `/shop/${product.slug}`,
              image: product.image,
              imageAlt: product.imageAlt,
              key,
              label: "Editorial pick",
              title: product.title,
            },
          ]
        : [];
    }

    if (reference.type === "kitchenItem") {
      const item = kitchenItemsBySlug.get(reference.slug);
      return item
        ? [
            {
              copy: item.blurb,
              external: Boolean(item.affiliateUrl),
              href: item.affiliateUrl || `/kitchen#${item.slug}`,
              image: item.image,
              imageAlt: item.imageAlt,
              key,
              label: "Kit list",
              title: item.title,
            },
          ]
        : [];
    }

    return [];
  });
}

function RelatedCardLink({ card }: { card: RelatedCard }) {
  const content = (
    <>
      <ContentImage
        alt={card.imageAlt}
        className="related-card__image"
        sizes="(max-width: 560px) 100vw, (max-width: 920px) 50vw, 25vw"
        src={card.image}
      />
      <p className="card-tags">{card.label}</p>
      <h3>{card.title}</h3>
      <p>{card.copy}</p>
    </>
  );

  return card.external ? (
    <a
      className="related-card"
      href={card.href}
      rel="noreferrer"
      target="_blank"
    >
      {content}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ) : (
    <PageLink className="related-card" href={card.href}>
      {content}
    </PageLink>
  );
}

export function RelatedContent({
  articles,
  kitchenItems,
  products,
  recipes,
  related,
}: RelatedContentProps) {
  const cards = resolveCards(related, {
    articles,
    kitchenItems,
    products,
    recipes,
  });

  if (cards.length === 0) return null;

  return (
    <aside className="related-content shell" aria-label="Related content">
      <div className="filter-line">
        <h2>Continue exploring</h2>
        <span>Travel essays · recipes · the edit · kit list</span>
      </div>
      <div className="related-content__grid">
        {cards.map((card) => (
          <RelatedCardLink card={card} key={card.key} />
        ))}
      </div>
    </aside>
  );
}

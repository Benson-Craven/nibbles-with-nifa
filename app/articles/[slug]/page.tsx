import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "next-sanity";

import { CreatorProfile } from "../../components/CreatorProfile";
import { Footer, Nav } from "../../components/SiteChrome";
import { PageLink } from "../../components/PageLink";
import type { Article, KitchenItem, Product, Recipe } from "../../data";
import {
  getArticleBySlug as getPublishedArticleBySlug,
  getArticleSlugs,
  getKitchenItems as getPublishedKitchenItems,
  getProducts as getPublishedProducts,
  getRecipes as getPublishedRecipes,
} from "@/lib/content";

export async function generateStaticParams() {
  return getArticleSlugs();
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  marks: {
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : undefined;
      return href ? <a href={href}>{children}</a> : <>{children}</>;
    },
  },
};

function TravelDetails({ article }: { article: Article }) {
  if (article.format !== "travelEssay") return null;

  return (
    <dl className="travel-details" aria-label="Travel essay details">
      {article.place && (
        <div>
          <dt>Place</dt>
          <dd>{article.place}</dd>
        </div>
      )}
      {article.visitDate && (
        <div>
          <dt>Visited</dt>
          <dd>
            <time dateTime={article.visitDate}>
              {formatDate(article.visitDate)}
            </time>
          </dd>
        </div>
      )}
      {article.factCheckDate && (
        <div>
          <dt>Facts checked</dt>
          <dd>
            <time dateTime={article.factCheckDate}>
              {formatDate(article.factCheckDate)}
            </time>
          </dd>
        </div>
      )}
    </dl>
  );
}

function ArticleContext({ article }: { article: Article }) {
  const acknowledgements = article.acknowledgements?.filter((item) =>
    item.trim(),
  );
  const sources = article.sources?.filter((source) => source.title.trim());

  if (!acknowledgements?.length && !sources?.length) return null;

  return (
    <footer className="article-context">
      {acknowledgements?.length ? (
        <section aria-labelledby="article-acknowledgements">
          <h2 id="article-acknowledgements">Acknowledgements</h2>
          {acknowledgements.map((acknowledgement) => (
            <p key={acknowledgement}>{acknowledgement}</p>
          ))}
        </section>
      ) : null}
      {sources?.length ? (
        <section aria-labelledby="article-sources">
          <h2 id="article-sources">Sources</h2>
          <ul>
            {sources.map((source) => (
              <li key={`${source.title}-${source.url ?? "unlinked"}`}>
                {source.url ? (
                  <a href={source.url}>{source.title}</a>
                ) : (
                  source.title
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </footer>
  );
}

function RelatedCard({
  copy,
  href,
  image,
  label,
  title,
}: {
  copy: string;
  href: string;
  image: string;
  label: string;
  title: string;
}) {
  return (
    <PageLink className="article-related-card" href={href}>
      <div style={{ backgroundImage: `url(${image})` }} />
      <p className="card-tags">{label}</p>
      <h3>{title}</h3>
      <p>{copy}</p>
    </PageLink>
  );
}

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

type ArticlePageDependencies = {
  getArticleBySlug: (slug: string) => Promise<Article | null>;
  getKitchenItems: () => Promise<KitchenItem[]>;
  getProducts: () => Promise<Product[]>;
  getRecipes: () => Promise<Recipe[]>;
};

const defaultDependencies: ArticlePageDependencies = {
  getArticleBySlug: getPublishedArticleBySlug,
  getKitchenItems: getPublishedKitchenItems,
  getProducts: getPublishedProducts,
  getRecipes: getPublishedRecipes,
};

export function createArticlePage(
  dependencies: ArticlePageDependencies = defaultDependencies,
) {
  return async function ArticlePage({ params }: ArticlePageProps) {
    const { slug } = await params;
    const article = await dependencies.getArticleBySlug(slug);
    if (!article) notFound();

    const [recipes, products, kitchenItems] = await Promise.all([
      dependencies.getRecipes(),
      dependencies.getProducts(),
      dependencies.getKitchenItems(),
    ]);

    const relatedRecipes = recipes.filter((recipe) =>
      article.related.recipes?.includes(recipe.slug),
    );
    const relatedProducts = products.filter((product) =>
      article.related.products?.includes(product.slug),
    );
    const relatedKitchenItems = kitchenItems.filter((item) =>
      article.related.kitchenItems?.includes(item.slug),
    );

    return (
      <>
        <Nav />
        <main>
          <section className="article-hero shell">
            <div>
              <p className="eyebrow">
                {article.category} · {formatDate(article.date)} ·{" "}
                {article.readTime} min read
              </p>
              <h1>{article.title}</h1>
              <p>{article.dek}</p>
              <TravelDetails article={article} />
            </div>
            <div
              className="article-hero__image"
              style={{ backgroundImage: `url(${article.image})` }}
            />
          </section>

          <div className="shell">
            <CreatorProfile creator={article.creator} />
          </div>

          <article className="article-body shell">
            <p className="article-standfirst">{article.intro}</p>
            <div className="article-body__content">
              {article.body?.length ? (
                <PortableText
                  components={portableTextComponents}
                  value={article.body}
                />
              ) : (
                article.sections?.map((section) => (
                  <section key={section.heading}>
                    <h2>{section.heading}</h2>
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </section>
                ))
              )}
              <ArticleContext article={article} />
            </div>
          </article>

          <aside className="article-related shell" aria-label="Related links">
            <div className="filter-line">
              <span>Linked from this note</span>
              <span>Recipes · shop · kit list</span>
            </div>
            <div className="article-related__grid">
              {relatedRecipes.map((recipe) => (
                <RelatedCard
                  copy={recipe.note}
                  href={`/recipes/${recipe.slug}`}
                  image={recipe.image}
                  key={recipe.slug}
                  label="Recipe"
                  title={recipe.title}
                />
              ))}
              {relatedProducts.map((product) => (
                <RelatedCard
                  copy={product.blurb}
                  href={`/shop/${product.slug}`}
                  image={product.image}
                  key={product.slug}
                  label="Shop"
                  title={product.title}
                />
              ))}
              {relatedKitchenItems.map((item) => (
                <RelatedCard
                  copy={item.blurb}
                  href="/kitchen"
                  image={item.image}
                  key={item.slug}
                  label="Kit list"
                  title={item.title}
                />
              ))}
            </div>
            <PageLink className="text-link article-back-link" href="/articles">
              ← Back to articles
            </PageLink>
          </aside>
        </main>
        <Footer />
      </>
    );
  };
}

export default createArticlePage();

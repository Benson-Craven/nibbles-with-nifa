import { notFound } from "next/navigation";

import { Footer, Nav } from "../../components/SiteChrome";
import { PageLink } from "../../components/PageLink";
import {
  getArticleBySlug,
  getArticleSlugs,
  getKitchenItems,
  getProducts,
  getRecipes,
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

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [recipes, products, kitchenItems] = await Promise.all([
    getRecipes(),
    getProducts(),
    getKitchenItems(),
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
          </div>
          <div
            className="article-hero__image"
            style={{ backgroundImage: `url(${article.image})` }}
          />
        </section>

        <article className="article-body shell">
          <p className="article-standfirst">{article.intro}</p>
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </article>

        <aside className="article-related shell" aria-label="Related links">
          <div className="filter-line">
            <span>Linked from this note</span>
            <span>Recipes · shop · kit list</span>
          </div>
          <div className="article-related__grid">
            {relatedRecipes.map((recipe) => (
              <PageLink
                className="article-related-card"
                href={`/recipes/${recipe.slug}`}
                key={recipe.slug}
              >
                <div style={{ backgroundImage: `url(${recipe.image})` }} />
                <p className="card-tags">Recipe</p>
                <h3>{recipe.title}</h3>
                <p>{recipe.note}</p>
              </PageLink>
            ))}
            {relatedProducts.map((product) => (
              <PageLink
                className="article-related-card"
                href={`/shop/${product.slug}`}
                key={product.slug}
              >
                <div style={{ backgroundImage: `url(${product.image})` }} />
                <p className="card-tags">Shop</p>
                <h3>{product.title}</h3>
                <p>{product.blurb}</p>
              </PageLink>
            ))}
            {relatedKitchenItems.map((item) => (
              <PageLink
                className="article-related-card"
                href="/kitchen"
                key={item.slug}
              >
                <div style={{ backgroundImage: `url(${item.image})` }} />
                <p className="card-tags">Kit list</p>
                <h3>{item.title}</h3>
                <p>{item.blurb}</p>
              </PageLink>
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
}

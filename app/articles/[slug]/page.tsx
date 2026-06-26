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
}

import { getHomeContent } from "@/lib/content";
import type { Article, KitchenItem, Product, Recipe } from "./data";
import { DispatchPopover } from "./components/DispatchPopover";
import { PageLink } from "./components/PageLink";
import { Footer, Nav } from "./components/SiteChrome";
import { ImageTrailDemo } from "@/components/ui/image-trail-demo";
import { SparksCarousel } from "./components/ui/sparks-carousel";

type HomeContent = {
  articles: Article[];
  kitchenItems: KitchenItem[];
  products: Product[];
  recipes: Recipe[];
};

function PillLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <PageLink
      className={["lime-pill", className].filter(Boolean).join(" ")}
      href={href}
    >
      {children}
    </PageLink>
  );
}

export function createHomePage(
  loadHomeContent: () => Promise<HomeContent> = getHomeContent,
) {
  return async function Home() {
    const { articles, kitchenItems, products, recipes } =
      await loadHomeContent();
    const featuredRecipes = recipes.filter((recipe) => recipe.featured);
    const featuredArticles = articles.filter((article) => article.featured);
    const journalArticles = featuredArticles.slice(0, 3);
    const leadArticle = featuredArticles[3];
    const guideArticles = featuredArticles.slice(4, 6);

    return (
      <>
        <Nav />
        <main className="landing">
          <ImageTrailDemo />

          <div className="landing-section shell latest-recipes">
            <SparksCarousel
              title="Fresh from the feed"
              subtitle="Low-lift recipes, snacky projects, and weekend ideas that feel casual enough to make tonight."
              items={featuredRecipes.map((recipe) => ({
                id: recipe.slug,
                imageSrc: recipe.image,
                title: recipe.title,
                note: recipe.note,
                meta: recipe.tags.slice(0, 2).join(" · "),
                href: `/recipes/${recipe.slug}`,
              }))}
            />
            <div className="featured-recipes__link">
              <PillLink href="/recipes">
                See all recipes <span>→</span>
              </PillLink>
            </div>
          </div>

          <section className="goods-row shell" aria-label="Shop goods">
            {products.slice(1, 5).map((product) => (
              <PageLink
                aria-label={`View ${product.title}`}
                href={`/shop/${product.slug}`}
                className="goods-row__item"
                key={product.slug}
              >
                <div
                  aria-hidden="true"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
              </PageLink>
            ))}
            <PillLink className="shop-cta" href="/shop">
              Browse the shop
            </PillLink>
          </section>

          {leadArticle && (
            <section className="feature-story shell">
              <div
                className="feature-story__image"
                style={{ backgroundImage: `url(${leadArticle.image})` }}
              >
                <PillLink href={`/articles/${leadArticle.slug}`}>
                  {leadArticle.title}
                </PillLink>
              </div>
            </section>
          )}

          {guideArticles.length > 0 && (
            <section className="guides shell">
              {guideArticles.map((article) => (
                <article className="guide-card" key={article.slug}>
                  <div
                    aria-label={article.title}
                    className="guide-card__image"
                    role="img"
                    style={{ backgroundImage: `url(${article.image})` }}
                  />
                  <PillLink href={`/articles/${article.slug}`}>
                    {article.title}
                  </PillLink>
                  <p>{article.dek}</p>
                </article>
              ))}
            </section>
          )}

          <section
            className="kitchen-shelf shell"
            aria-label="Kit list favourites"
          >
            {kitchenItems.slice(0, 4).map((item) => (
              <PageLink
                aria-label={`View ${item.title} in the kit list`}
                href="/kitchen"
                className="kitchen-shelf__item"
                key={item.slug}
              >
                <div
                  aria-hidden="true"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
              </PageLink>
            ))}
            <PillLink href="/kitchen">Open the kit list</PillLink>
          </section>

          {journalArticles.length > 0 && (
            <section
              className="journal-grid shell"
              aria-label="From our journal"
            >
              {journalArticles.map((article) => (
                <PageLink
                  href={`/articles/${article.slug}`}
                  className="journal-card"
                  key={article.slug}
                >
                  <div
                    aria-label={article.title}
                    role="img"
                    style={{ backgroundImage: `url(${article.image})` }}
                  >
                    <span>{article.title}</span>
                  </div>
                </PageLink>
              ))}
            </section>
          )}
        </main>
        <Footer />
        <DispatchPopover />
      </>
    );
  };
}

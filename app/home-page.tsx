import { getHomeContent } from "@/lib/content";
import type { Article, KitchenItem, Product, Recipe } from "./data";
import { PageLink } from "./components/PageLink";
import { ContentImage } from "./components/ContentImage";
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
      className={["button", "button--light", className]
        .filter(Boolean)
        .join(" ")}
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
    const [leadArticle, ...journalArticles] = featuredArticles;

    return (
      <>
        <Nav />
        <main className="landing">
          <ImageTrailDemo />

          {featuredRecipes.length > 0 && (
            <div className="landing-section shell latest-recipes">
              <SparksCarousel
                title="Fresh from the feed"
                subtitle="Low-lift recipes, snacky projects, and weekend ideas that feel casual enough to make tonight."
                items={featuredRecipes.map((recipe) => ({
                  id: recipe.slug,
                  imageSrc: recipe.image,
                  imageAlt: recipe.imageAlt,
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
          )}

          {products.length > 0 && (
            <section className="goods-row shell" aria-label="The edit">
              {products.slice(0, 4).map((product) => (
                <PageLink
                  aria-label={`View ${product.title}`}
                  href={`/shop/${product.slug}`}
                  className="goods-row__item"
                  key={product.slug}
                >
                  <ContentImage
                    alt={product.imageAlt}
                    sizes="(max-width: 900px) 50vw, 25vw"
                    src={product.image}
                  />
                </PageLink>
              ))}
              <PillLink className="shop-cta" href="/shop">
                Browse the edit
              </PillLink>
            </section>
          )}

          {kitchenItems.length > 0 && (
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
                  <ContentImage
                    alt={item.imageAlt}
                    sizes="(max-width: 900px) 50vw, 25vw"
                    src={item.image}
                  />
                </PageLink>
              ))}
              <PillLink href="/kitchen">Open the kit list</PillLink>
            </section>
          )}

          {leadArticle && (
            <section className="feature-story shell" aria-label="Travel essay">
              <div className="feature-story__media">
                <ContentImage
                  alt={leadArticle.imageAlt}
                  className="feature-story__image"
                  sizes="86vw"
                  src={leadArticle.image}
                />
                <PageLink
                  className="button button--light feature-story__entry"
                  href={`/articles/${leadArticle.slug}`}
                >
                  {leadArticle.title}
                </PageLink>
              </div>
              <div className="featured-recipes__link featured-articles__link">
                <PillLink href="/articles">
                  See all travel essays <span>→</span>
                </PillLink>
              </div>
            </section>
          )}

          {journalArticles.length > 0 && (
            <section
              className="journal-grid shell"
              aria-label="More from our journal"
            >
              {journalArticles.map((article) => (
                <PageLink
                  aria-label={`Read ${article.title}`}
                  href={`/articles/${article.slug}`}
                  className="journal-card"
                  key={article.slug}
                >
                  <ContentImage
                    alt={article.imageAlt}
                    sizes="33vw"
                    src={article.image}
                  >
                    <span className="journal-card__title">{article.title}</span>
                  </ContentImage>
                </PageLink>
              ))}
            </section>
          )}
        </main>
        <Footer />
      </>
    );
  };
}

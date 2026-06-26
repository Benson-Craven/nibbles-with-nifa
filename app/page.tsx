import { ImageTrailDemo } from "@/components/ui/image-trail-demo";
import { DispatchPopover } from "./components/DispatchPopover";
import { Footer, Nav } from "./components/SiteChrome";
import { PageLink } from "./components/PageLink";
import { SparksCarousel } from "./components/ui/sparks-carousel";
import { getHomeContent } from "@/lib/content";

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

export default async function Home() {
  const { articles, kitchenItems, products, recipes } = await getHomeContent();
  const featuredRecipes = recipes.filter((recipe) => recipe.featured);

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
              href={`/shop/${product.slug}`}
              className="goods-row__item"
              key={product.slug}
            >
              <div style={{ backgroundImage: `url(${product.image})` }} />
            </PageLink>
          ))}
          <PillLink className="shop-cta" href="/shop">
            Browse the shop
          </PillLink>
        </section>

        <section className="feature-story shell">
          <div
            className="feature-story__image"
            style={{
              backgroundImage:
                "url(https://images.pexels.com/photos/1319750/pexels-photo-1319750.jpeg?auto=compress&cs=tinysrgb&w=1800)",
            }}
          >
            <PillLink href="/articles/corner-shop-haul-turned-dinner">
              What we are making this week
            </PillLink>
          </div>
        </section>

        <section className="guides shell">
          <article className="guide-card">
            <div
              className="guide-card__image"
              style={{
                backgroundImage:
                  "url(https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=1000)",
              }}
            />
            <PillLink href="/articles/weekend-snack-plan">
              Weekend snack plan
            </PillLink>
            <p>
              Quick wins, share plates, and tiny cooking projects for a fridge
              full of half-plans.
            </p>
          </article>
          <article className="guide-card">
            <div
              className="guide-card__image"
              style={{
                backgroundImage:
                  "url(https://images.pexels.com/photos/34650/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1000)",
              }}
            />
            <PillLink href="/articles/out-and-about-list">
              Out-and-about list
            </PillLink>
            <p>
              The casual places, market stops, and picnic bits we keep sending
              to friends.
            </p>
          </article>
        </section>

        <section
          className="kitchen-shelf shell"
          aria-label="Kit list favourites"
        >
          {kitchenItems.slice(0, 4).map((item) => (
            <PageLink
              href="/kitchen"
              className="kitchen-shelf__item"
              key={item.slug}
            >
              <div style={{ backgroundImage: `url(${item.image})` }} />
            </PageLink>
          ))}
          <PillLink href="/kitchen">Open the kit list</PillLink>
        </section>

        <section className="journal-grid shell" aria-label="From our journal">
          {articles.slice(0, 3).map((article) => (
            <PageLink
              href={`/articles/${article.slug}`}
              className="journal-card"
              key={article.slug}
            >
              <div style={{ backgroundImage: `url(${article.image})` }}>
                <span>{article.title}</span>
              </div>
            </PageLink>
          ))}
        </section>
      </main>
      <Footer />
      <DispatchPopover />
    </>
  );
}

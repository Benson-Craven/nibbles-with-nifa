import { Footer, Nav, PageIntro } from "../components/SiteChrome";
import { PageLink } from "../components/PageLink";
import { ContentImage } from "../components/ContentImage";
import { getProducts } from "@/lib/content";
import type { Product } from "../data";

export function createShopPage(
  loadProducts: () => Promise<Product[]> = getProducts,
) {
  return async function ShopPage() {
    const products = await loadProducts();

    return (
      <>
        <Nav />
        <main>
          <PageIntro
            eyebrow="The edit"
            title="Objects and finds worth a closer look."
            copy="A rotating editorial collection of table pieces, host gifts, picnic helpers, and useful things. Source links appear only when one is available."
          />
          <section className="shell section product-grid">
            {products.map((product) => (
              <PageLink
                className="product-card"
                href={`/shop/${product.slug}`}
                key={product.slug}
              >
                <ContentImage
                  alt={product.imageAlt}
                  sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
                  src={product.image}
                />
                <p className="card-tags">{product.category}</p>
                <h2>{product.title}</h2>
                <p>{product.blurb}</p>
                <span>
                  View details <b>→</b>
                </span>
              </PageLink>
            ))}
          </section>
        </main>
        <Footer />
      </>
    );
  };
}

export default createShopPage();

import { Footer, Nav, PageIntro } from "../components/SiteChrome";
import { PageLink } from "../components/PageLink";
import { ContentImage } from "../components/ContentImage";
import { getCreatorProfile, getProducts } from "@/lib/content";
import type { CreatorProfile, Product } from "../data";

export function createShopPage(
  loadProducts: () => Promise<Product[]> = getProducts,
  loadCreator: () => Promise<CreatorProfile | null> = async () => null,
) {
  return async function ShopPage() {
    const [creator, products] = await Promise.all([
      loadCreator(),
      loadProducts(),
    ]);

    return (
      <>
        <Nav />
        <main>
          <PageIntro
            eyebrow="Food & home"
            title="My food and home favourites"
            copy="Table bits, gifts and useful things I'd happily have in my own kitchen. If I know where they're from, I'll link it."
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
                <h2 className="authored-heading">{product.title}</h2>
                <p>{product.blurb}</p>
                <span>
                  Have a closer look <b>→</b>
                </span>
              </PageLink>
            ))}
          </section>
        </main>
        <Footer creator={creator} />
      </>
    );
  };
}

export default createShopPage(getProducts, getCreatorProfile);

import { Footer, Nav, PageIntro } from "../components/SiteChrome";
import { PageLink } from "../components/PageLink";
import { getProducts } from "@/lib/content";

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <>
      <Nav />
      <main>
        <PageIntro
          eyebrow="The edit"
          title="Small goods for big main-character errands."
          copy="A rotating mix of table bits, host gifts, picnic helpers, and things that make a weeknight feel more fun."
        />
        <section className="shell section product-grid">
          {products.map((product) => (
            <PageLink
              className="product-card"
              href={`/shop/${product.slug}`}
              key={product.slug}
            >
              <div style={{ backgroundImage: `url(${product.image})` }} />
              <p className="card-tags">{product.category}</p>
              <h2>{product.title}</h2>
              <p>{product.blurb}</p>
              <span>
                {product.price} <b>→</b>
              </span>
            </PageLink>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}

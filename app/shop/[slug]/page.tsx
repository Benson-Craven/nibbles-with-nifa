import { notFound } from "next/navigation";
import { Footer, Nav } from "../../components/SiteChrome";
import { PageLink } from "../../components/PageLink";
import { getProductBySlug, getProductSlugs } from "@/lib/content";

export async function generateStaticParams() {
  return getProductSlugs();
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  return (
    <>
      <Nav />
      <main className="product-detail">
        <div
          className="product-detail__image"
          style={{ backgroundImage: `url(${product.image})` }}
        />
        <article>
          <p className="eyebrow">The little shop · {product.category}</p>
          <h1>{product.title}</h1>
          <p>{product.blurb}</p>
          <p className="product-detail__price">{product.price}</p>
          {product.externalUrl ? (
            <a
              className="button"
              href={product.externalUrl}
              target="_blank"
              rel="noreferrer"
            >
              View item
            </a>
          ) : (
            <button className="button">Add to basket</button>
          )}
          <p className="product-detail__note">
            A placeholder shop item, made for imagining the good things.
            Checkout is not enabled.
          </p>
          <PageLink className="text-link" href="/shop">
            ← Back to the shop
          </PageLink>
        </article>
      </main>
      <Footer />
    </>
  );
}

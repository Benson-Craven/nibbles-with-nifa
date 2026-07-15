import { notFound } from "next/navigation";
import { Footer, Nav } from "../../components/SiteChrome";
import { PageLink } from "../../components/PageLink";
import { ContentImage } from "../../components/ContentImage";
import { getProductBySlug, getProductSlugs } from "@/lib/content";
import type { Product } from "../../data";
import { normalizeExternalWebUrl } from "@/lib/external-url";

export async function generateStaticParams() {
  return getProductSlugs();
}

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function ProductDetailContent({ product }: { product: Product }) {
  const externalUrl = normalizeExternalWebUrl(product.externalUrl);

  return (
    <main className="product-detail">
      <ContentImage
        alt={product.imageAlt}
        className="product-detail__image"
        priority
        sizes="(max-width: 900px) 100vw, 50vw"
        src={product.image}
      />
      <article>
        <p className="eyebrow">The edit · {product.category}</p>
        <h1>{product.title}</h1>
        <p>{product.blurb}</p>
        {externalUrl ? (
          <>
            <a
              className="button"
              href={externalUrl}
              target="_blank"
              rel="noreferrer"
            >
              Visit source
            </a>
            <p className="product-detail__note">
              An editorial pick with a link to its external source.
            </p>
          </>
        ) : (
          <p className="product-detail__note">
            A display-only editorial pick. No source link is currently
            available.
          </p>
        )}
        <PageLink className="text-link" href="/shop">
          ← Back to the edit
        </PageLink>
      </article>
    </main>
  );
}

export function createProductPage(
  loadProduct: (slug: string) => Promise<Product | null> = getProductBySlug,
) {
  return async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const product = await loadProduct(slug);
    if (!product) notFound();

    return (
      <>
        <Nav />
        <ProductDetailContent product={product} />
        <Footer />
      </>
    );
  };
}

export default createProductPage();

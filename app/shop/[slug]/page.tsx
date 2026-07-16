import { notFound } from "next/navigation";
import { Footer, Nav } from "../../components/SiteChrome";
import { PageLink } from "../../components/PageLink";
import { ContentImage } from "../../components/ContentImage";
import {
  getCreatorProfile,
  getProductBySlug,
  getProductSlugs,
} from "@/lib/content";
import type { CreatorProfile, Product } from "../../data";
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
        <p className="eyebrow">Food &amp; home · {product.category}</p>
        <h1 className="authored-heading">{product.title}</h1>
        <p>{product.blurb}</p>
        {externalUrl ? (
          <>
            <a
              className="button"
              href={externalUrl}
              target="_blank"
              rel="noreferrer"
            >
              See where it&apos;s from
            </a>
            <p className="product-detail__note">
              A favourite of mine, linked to the maker or shop.
            </p>
          </>
        ) : (
          <p className="product-detail__note">
            One of my food and home favourites. I don&apos;t have a source link
            for it just yet.
          </p>
        )}
        <PageLink className="text-link" href="/shop">
          ← Back to food &amp; home
        </PageLink>
      </article>
    </main>
  );
}

export function createProductPage(
  loadProduct: (slug: string) => Promise<Product | null> = getProductBySlug,
  loadCreator: () => Promise<CreatorProfile | null> = async () => null,
) {
  return async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const [creator, product] = await Promise.all([
      loadCreator(),
      loadProduct(slug),
    ]);
    if (!product) notFound();

    return (
      <>
        <Nav />
        <ProductDetailContent product={product} />
        <Footer creator={creator} />
      </>
    );
  };
}

export default createProductPage(getProductBySlug, getCreatorProfile);

import { notFound } from "next/navigation";
import Image from "next/image";
import { PortableText, type PortableTextComponents } from "next-sanity";

import { CreatorProfile } from "../../components/CreatorProfile";
import { Footer, Nav } from "../../components/SiteChrome";
import { PageLink } from "../../components/PageLink";
import { RelatedContent } from "../../components/RelatedContent";
import type { Article } from "../../data";
import { createEntryMetadata } from "@/lib/entry-metadata";
import {
  loadRelatedCollections,
  type RelatedContentLoaders,
} from "@/lib/related-content";
import {
  getArticleBySlug as getPublishedArticleBySlug,
  getArticles as getPublishedArticles,
  getArticleSlugs,
  getKitchenItems as getPublishedKitchenItems,
  getProducts as getPublishedProducts,
  getRecipes as getPublishedRecipes,
} from "@/lib/content";

export async function generateStaticParams() {
  return getArticleSlugs();
}

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function createArticleMetadata(
  loadArticle: (slug: string) => Promise<Article | null> =
    getPublishedArticleBySlug,
) {
  return createEntryMetadata(loadArticle, (article) => ({
    title: article.title,
    description: article.dek,
    image: article.image,
    seo: article.seo,
  }));
}

export const generateMetadata = createArticleMetadata();

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  marks: {
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : undefined;
      return href ? <a href={href}>{children}</a> : <>{children}</>;
    },
  },
};

const videoAspectRatios = {
  landscape: "16 / 9",
  portrait: "9 / 16",
  square: "1 / 1",
} as const;

function TravelDetails({ article }: { article: Article }) {
  if (article.format !== "travelEssay") return null;

  return (
    <dl className="travel-details" aria-label="Travel essay details">
      {article.place && (
        <div>
          <dt>Place</dt>
          <dd>{article.place}</dd>
        </div>
      )}
      {article.visitDate && (
        <div>
          <dt>Visited</dt>
          <dd>
            <time dateTime={article.visitDate}>
              {formatDate(article.visitDate)}
            </time>
          </dd>
        </div>
      )}
      {article.factCheckDate && (
        <div>
          <dt>Facts checked</dt>
          <dd>
            <time dateTime={article.factCheckDate}>
              {formatDate(article.factCheckDate)}
            </time>
          </dd>
        </div>
      )}
    </dl>
  );
}

function ArticleContext({ article }: { article: Article }) {
  const acknowledgements = article.acknowledgements?.filter((item) =>
    item.trim(),
  );
  const sources = article.sources?.filter((source) => source.title.trim());

  if (!acknowledgements?.length && !sources?.length) return null;

  return (
    <footer className="article-context">
      {acknowledgements?.length ? (
        <section aria-labelledby="article-acknowledgements">
          <h2 id="article-acknowledgements">Acknowledgements</h2>
          {acknowledgements.map((acknowledgement) => (
            <p key={acknowledgement}>{acknowledgement}</p>
          ))}
        </section>
      ) : null}
      {sources?.length ? (
        <section aria-labelledby="article-sources">
          <h2 id="article-sources">Sources</h2>
          <ul>
            {sources.map((source) => (
              <li key={`${source.title}-${source.url ?? "unlinked"}`}>
                {source.url ? (
                  <a href={source.url}>{source.title}</a>
                ) : (
                  source.title
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </footer>
  );
}

function TravelMedia({ article }: { article: Article }) {
  if (article.format !== "travelEssay" || !article.travelMedia?.length) {
    return null;
  }

  return (
    <section className="travel-media" aria-label="Travel essay media">
      {article.travelMedia.map((item) => (
        <figure className="travel-media__item" key={item._key}>
          {item._type === "travelImage" ? (
            <Image
              alt={item.alt}
              className="travel-media__asset"
              height={item.height ?? 1200}
              sizes="(max-width: 920px) calc(100vw - 40px), 690px"
              src={item.image}
              width={item.width ?? 1600}
            />
          ) : (
            <video
              aria-label={item.caption || "Travel essay video"}
              className="travel-media__asset"
              controls
              playsInline
              preload="metadata"
              src={item.video}
              style={{
                aspectRatio:
                  videoAspectRatios[item.aspectRatio ?? "landscape"],
              }}
            />
          )}
          {(item.caption || item.credit) && (
            <figcaption>
              {item.caption && <span>{item.caption}</span>}
              {item.credit && (
                <span className="travel-media__credit">{item.credit}</span>
              )}
            </figcaption>
          )}
          {item._type === "travelVideo" && item.transcript && (
            <details className="travel-media__transcript">
              <summary>Transcript</summary>
              <p>{item.transcript}</p>
            </details>
          )}
        </figure>
      ))}
    </section>
  );
}

type ArticlePageDependencies = RelatedContentLoaders & {
  getArticleBySlug: (slug: string) => Promise<Article | null>;
};

const defaultDependencies: ArticlePageDependencies = {
  getArticleBySlug: getPublishedArticleBySlug,
  getArticles: getPublishedArticles,
  getKitchenItems: getPublishedKitchenItems,
  getProducts: getPublishedProducts,
  getRecipes: getPublishedRecipes,
};

export function createArticlePage(
  dependencies: ArticlePageDependencies = defaultDependencies,
) {
  return async function ArticlePage({ params }: ArticlePageProps) {
    const { slug } = await params;
    const article = await dependencies.getArticleBySlug(slug);
    if (!article) notFound();

    const relatedCollections = await loadRelatedCollections(
      article.related,
      dependencies,
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
              <TravelDetails article={article} />
            </div>
            <div
              className="article-hero__image"
              style={{ backgroundImage: `url(${article.image})` }}
            />
          </section>

          <div className="shell">
            <CreatorProfile creator={article.creator} />
          </div>

          <article className="article-body shell">
            <p className="article-standfirst">{article.intro}</p>
            <div className="article-body__content">
              {article.body?.length ? (
                <PortableText
                  components={portableTextComponents}
                  value={article.body}
                />
              ) : (
                article.sections?.map((section) => (
                  <section key={section.heading}>
                    <h2>{section.heading}</h2>
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </section>
                ))
              )}
              <TravelMedia article={article} />
              <ArticleContext article={article} />
            </div>
          </article>

          <RelatedContent
            {...relatedCollections}
            related={article.related}
          />
          <div className="article-back shell">
            <PageLink className="text-link article-back-link" href="/articles">
              ← Back to articles
            </PageLink>
          </div>
        </main>
        <Footer />
      </>
    );
  };
}

export default createArticlePage();

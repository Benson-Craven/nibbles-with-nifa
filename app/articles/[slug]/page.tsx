import { notFound } from "next/navigation";
import Image from "next/image";
import { PortableText, type PortableTextComponents } from "next-sanity";

import { CreatorProfile } from "../../components/CreatorProfile";
import { ContentImage } from "../../components/ContentImage";
import { DraftPreviewBanner } from "../../components/DraftPreviewBanner";
import { Footer, Nav } from "../../components/SiteChrome";
import { PageLink } from "../../components/PageLink";
import { PreviewFieldPrompt } from "../../components/PreviewFieldPrompt";
import { RelatedContent } from "../../components/RelatedContent";
import type { Article, PreviewArticle, TravelMediaItem } from "../../data";
import { createEntryMetadata } from "@/lib/entry-metadata";
import {
  isDraftPreviewEnabled,
  resolveDraftPreviewEntry,
  type DraftPreviewRuntime,
} from "@/lib/draft-preview";
import {
  loadRelatedCollections,
  type RelatedContentLoaders,
} from "@/lib/related-content";
import {
  getArticleBySlug as getPublishedArticleBySlug,
  getArticleByDocumentId as getPublishedArticleByDocumentId,
  getArticles as getPublishedArticles,
  getArticleSlugs,
  getKitchenItems as getPublishedKitchenItems,
  getProducts as getPublishedProducts,
  getRecipes as getPublishedRecipes,
} from "@/lib/content";
import {
  getPreviewTravelEssayBySlug,
  previewContent,
} from "@/lib/preview-content";
import { normalizeMediaSource } from "@/lib/media";

export async function generateStaticParams() {
  return getArticleSlugs();
}

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function createArticleMetadata(
  loadArticle: (
    slug: string,
  ) => Promise<Article | null> = getPublishedArticleBySlug,
  isPreview: () => Promise<boolean> = async () => false,
) {
  return createEntryMetadata(
    loadArticle,
    (article) => ({
      title: article.title,
      description: article.dek,
      image: article.image,
      seo: article.seo,
    }),
    isPreview,
  );
}

export const generateMetadata = createArticleMetadata(
  getPublishedArticleBySlug,
  isDraftPreviewEnabled,
);

function formatDate(date?: string) {
  if (!date?.trim()) return null;

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.valueOf())) return null;

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
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

function TravelDetails({
  article,
  isPreview,
}: {
  article: PreviewArticle;
  isPreview: boolean;
}) {
  if (article.format !== "travelEssay") return null;

  const visitDate = formatDate(article.visitDate);
  const factCheckDate = formatDate(article.factCheckDate);
  const detailCount = [article.place?.trim(), visitDate, factCheckDate].filter(
    Boolean,
  ).length;

  if (detailCount === 0) {
    return isPreview ? (
      <PreviewFieldPrompt>Add travel details</PreviewFieldPrompt>
    ) : null;
  }

  return (
    <>
      <dl className="travel-details" aria-label="Travel essay details">
        {article.place?.trim() && (
          <div>
            <dt>Place</dt>
            <dd>{article.place}</dd>
          </div>
        )}
        {visitDate && article.visitDate && (
          <div>
            <dt>Visited</dt>
            <dd>
              <time dateTime={article.visitDate}>{visitDate}</time>
            </dd>
          </div>
        )}
        {factCheckDate && article.factCheckDate && (
          <div>
            <dt>Facts checked</dt>
            <dd>
              <time dateTime={article.factCheckDate}>{factCheckDate}</time>
            </dd>
          </div>
        )}
      </dl>
      {isPreview && detailCount < 3 && (
        <PreviewFieldPrompt>Add missing travel details</PreviewFieldPrompt>
      )}
    </>
  );
}

function ArticleContext({ article }: { article: PreviewArticle }) {
  const acknowledgements = article.acknowledgements?.filter(
    (item) => typeof item === "string" && item.trim(),
  );
  const sources = article.sources?.filter(
    (source) => typeof source?.title === "string" && source.title.trim(),
  );

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

function TravelMedia({ article }: { article: PreviewArticle }) {
  if (article.format !== "travelEssay" || !article.travelMedia?.length) {
    return null;
  }

  const media: TravelMediaItem[] = [];
  for (const item of article.travelMedia) {
    if (item._type === "travelImage") {
      const image = normalizeMediaSource(item.image);
      const alt = item.alt?.trim();
      if (image && alt) media.push({ ...item, image, alt });
      continue;
    }

    const video = normalizeMediaSource(item.video);
    if (video) media.push({ ...item, video });
  }

  if (media.length === 0) return null;

  return (
    <section className="travel-media" aria-label="Travel essay media">
      {media.map((item) => (
        <figure className="travel-media__item" key={item._key}>
          {item._type === "travelImage" ? (
            <Image
              alt={item.alt}
              className="travel-media__asset"
              height={item.height ?? 1200}
              sizes="(max-width: 900px) calc(100vw - 40px), 690px"
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
                aspectRatio: videoAspectRatios[item.aspectRatio ?? "landscape"],
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
  getArticleByDocumentId?: (
    documentId: string,
  ) => Promise<PreviewArticle | null>;
  getArticleBySlug: (slug: string) => Promise<PreviewArticle | null>;
};

const defaultDependencies: ArticlePageDependencies = {
  getArticleByDocumentId: getPublishedArticleByDocumentId,
  getArticleBySlug: getPublishedArticleBySlug,
  getArticles: getPublishedArticles,
  getKitchenItems: getPublishedKitchenItems,
  getProducts: getPublishedProducts,
  getRecipes: getPublishedRecipes,
};

const previewDependencies: ArticlePageDependencies = {
  ...previewContent,
  getArticleBySlug: getPreviewTravelEssayBySlug,
};

export function createArticlePage(
  dependencies: ArticlePageDependencies = defaultDependencies,
  previewRuntime?: DraftPreviewRuntime<ArticlePageDependencies>,
) {
  return async function ArticlePage({ params }: ArticlePageProps) {
    const { slug } = await params;
    const {
      activeDependencies,
      entry: article,
      isPreview,
      publishedEntry,
    } = await resolveDraftPreviewEntry({
      slug,
      publicDependencies: dependencies,
      previewRuntime,
      loadEntry: (loaders, entrySlug) => loaders.getArticleBySlug(entrySlug),
      loadPublishedEntry: (loaders, previewArticle, entrySlug) =>
        previewArticle.documentId && loaders.getArticleByDocumentId
          ? loaders.getArticleByDocumentId(previewArticle.documentId)
          : loaders.getArticleBySlug(entrySlug),
    });
    if (!article) notFound();

    const title = article.title?.trim();
    const dek = article.dek?.trim();
    const image = normalizeMediaSource(article.image);
    const imageAlt = article.imageAlt?.trim();
    const intro = article.intro?.trim();
    const publishedDate = formatDate(article.date);
    const articleMeta = [
      article.category?.trim(),
      publishedDate,
      typeof article.readTime === "number" && Number.isFinite(article.readTime)
        ? `${article.readTime} min read`
        : null,
    ].filter((item): item is string => Boolean(item));
    const sections = (article.sections ?? []).filter(
      (section) =>
        typeof section?.heading === "string" &&
        section.heading.trim() &&
        Array.isArray(section.body),
    );
    const relatedCollections = await loadRelatedCollections(
      article.related,
      activeDependencies,
    );

    return (
      <>
        <Nav />
        {isPreview && (
          <DraftPreviewBanner
            exitPath={
              publishedEntry ? `/articles/${publishedEntry.slug}` : "/articles"
            }
          />
        )}
        <main>
          <section className="article-hero shell">
            <div>
              {articleMeta.length > 0 ? (
                <p className="eyebrow">{articleMeta.join(" · ")}</p>
              ) : (
                isPreview && (
                  <PreviewFieldPrompt>Add publish details</PreviewFieldPrompt>
                )
              )}
              {title ? (
                <h1>{title}</h1>
              ) : isPreview ? (
                <PreviewFieldPrompt as="h1">Add a title</PreviewFieldPrompt>
              ) : null}
              {dek ? (
                <p>{dek}</p>
              ) : isPreview ? (
                <PreviewFieldPrompt>Add an article summary</PreviewFieldPrompt>
              ) : null}
              <TravelDetails article={article} isPreview={isPreview} />
            </div>
            <ContentImage
              alt={imageAlt}
              className="article-hero__image"
              priority
              sizes="(max-width: 900px) calc(100vw - 40px), 54vw"
              src={image ?? undefined}
            >
              {!image && isPreview && (
                <PreviewFieldPrompt>Add a hero image</PreviewFieldPrompt>
              )}
              {image && !imageAlt && isPreview && (
                <PreviewFieldPrompt>
                  Add hero image alternative text
                </PreviewFieldPrompt>
              )}
            </ContentImage>
          </section>

          <div className="shell">
            <CreatorProfile creator={article.creator} variant="compact" />
          </div>

          <article className="article-body shell">
            {intro ? (
              <p className="article-standfirst">{intro}</p>
            ) : (
              isPreview && (
                <PreviewFieldPrompt>Add an introduction</PreviewFieldPrompt>
              )
            )}
            <div className="article-body__content">
              {article.body?.length ? (
                <PortableText
                  components={portableTextComponents}
                  value={article.body}
                />
              ) : sections.length > 0 ? (
                sections.map((section) => (
                  <section key={section.heading}>
                    <h2>{section.heading}</h2>
                    {section.body.filter(Boolean).map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </section>
                ))
              ) : (
                isPreview && (
                  <PreviewFieldPrompt>Add the essay body</PreviewFieldPrompt>
                )
              )}
              <TravelMedia article={article} />
              <ArticleContext article={article} />
            </div>
          </article>

          <RelatedContent {...relatedCollections} related={article.related} />
          <div className="article-back shell">
            <PageLink className="text-link article-back-link" href="/articles">
              ← Back to Travel
            </PageLink>
          </div>
        </main>
        <Footer creator={article.creator} />
      </>
    );
  };
}

export default createArticlePage(defaultDependencies, {
  isEnabled: isDraftPreviewEnabled,
  dependencies: previewDependencies,
});

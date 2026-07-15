import { Footer, Nav, PageIntro } from "../components/SiteChrome";
import { PageLink } from "../components/PageLink";
import { ContentImage } from "../components/ContentImage";
import type { Article, CreatorProfile } from "../data";
import {
  getArticles as getPublishedArticles,
  getCreatorProfile as getPublishedCreatorProfile,
} from "@/lib/content";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function articleTags(article: Article) {
  return article.tags.length > 0 ? article.tags.join(" · ") : article.category;
}

export function createArticlesPage(
  loadArticles: () => Promise<Article[]> = getPublishedArticles,
  loadCreator: () => Promise<CreatorProfile | null> = async () => null,
) {
  return async function ArticlesPage() {
    const [articles, creator] = await Promise.all([
      loadArticles(),
      loadCreator(),
    ]);
    const [leadArticle, ...restArticles] = articles;
    const articleCountLabel = `${articles.length} ${
      articles.length === 1 ? "travel essay" : "travel essays"
    }`;

    return (
      <>
        <Nav />
        <main>
          <PageIntro
            eyebrow="Travel"
            title="Places, meals, and the stories that travel home."
            copy="Travel essays from markets, tables, and journeys that shape how Nifa cooks at home."
          />
          <section className="shell section article-index">
            <div className="filter-line">
              <span>All travel</span>
              <span>{articleCountLabel}</span>
            </div>

            {articles.length === 0 && (
              <div className="archive-empty">
                <h2>New travel essays are still taking shape.</h2>
                <p>
                  There are no published travel essays to read yet. Start with
                  the recipes while Nifa prepares the next story.
                </p>
                <PageLink className="button button--light" href="/recipes">
                  Browse the recipe index <span>→</span>
                </PageLink>
              </div>
            )}

            {leadArticle && (
              <PageLink
                className="article-feature"
                href={`/articles/${leadArticle.slug}`}
              >
                <ContentImage
                  alt={leadArticle.imageAlt}
                  className="article-feature__image"
                  sizes="(max-width: 900px) 100vw, 52vw"
                  src={leadArticle.image}
                />
                <div className="article-feature__copy">
                  <p className="card-tags">
                    {articleTags(leadArticle)} · {formatDate(leadArticle.date)}
                  </p>
                  <h2>{leadArticle.title}</h2>
                  <p>{leadArticle.dek}</p>
                  <span>
                    Read travel essay <b>→</b>
                  </span>
                </div>
              </PageLink>
            )}

            {restArticles.length > 0 && (
              <div className="article-grid">
                {restArticles.map((article) => (
                  <PageLink
                    className="article-card"
                    href={`/articles/${article.slug}`}
                    key={article.slug}
                  >
                    <ContentImage
                      alt={article.imageAlt}
                      className="article-card__image"
                      sizes="(max-width: 640px) 43vw, (max-width: 1200px) 50vw, 25vw"
                      src={article.image}
                    />
                    <div className="article-card__copy">
                      <p className="card-tags">
                        {articleTags(article)} · {article.readTime} min read
                      </p>
                      <h2>{article.title}</h2>
                      <p>{article.dek}</p>
                    </div>
                  </PageLink>
                ))}
              </div>
            )}
          </section>
        </main>
        <Footer creator={creator} />
      </>
    );
  };
}

export default createArticlesPage(
  getPublishedArticles,
  getPublishedCreatorProfile,
);

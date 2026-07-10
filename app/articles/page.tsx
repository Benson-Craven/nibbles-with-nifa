import { Footer, Nav, PageIntro } from "../components/SiteChrome";
import { PageLink } from "../components/PageLink";
import type { Article } from "../data";
import { getArticles as getPublishedArticles } from "@/lib/content";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function createArticlesPage(
  loadArticles: () => Promise<Article[]> = getPublishedArticles,
) {
  return async function ArticlesPage() {
    const articles = await loadArticles();
    const [leadArticle, ...restArticles] = articles;

    return (
      <>
        <Nav />
        <main>
          <PageIntro
            eyebrow="Articles"
            title="Notes for eating in, going out, and making the kitchen feel alive."
            copy="Small essays, city notes, hosting ideas, and pantry plans that sit beside the recipes."
          />
          <section className="shell section article-index">
            {leadArticle && (
              <PageLink
                className="article-feature"
                href={`/articles/${leadArticle.slug}`}
              >
                <div
                  className="article-feature__image"
                  style={{ backgroundImage: `url(${leadArticle.image})` }}
                />
                <div className="article-feature__copy">
                  <p className="card-tags">
                    {leadArticle.category} · {formatDate(leadArticle.date)}
                  </p>
                  <h2>{leadArticle.title}</h2>
                  <p>{leadArticle.dek}</p>
                  <span>
                    Read article <b>→</b>
                  </span>
                </div>
              </PageLink>
            )}

            <div className="filter-line">
              <span>All articles</span>
              <span>{articles.length} notes</span>
            </div>
            <div className="article-grid">
              {restArticles.map((article) => (
                <PageLink
                  className="article-card"
                  href={`/articles/${article.slug}`}
                  key={article.slug}
                >
                  <div
                    className="article-card__image"
                    style={{ backgroundImage: `url(${article.image})` }}
                  />
                  <div className="article-card__copy">
                    <p className="card-tags">
                      {article.category} · {article.readTime} min read
                    </p>
                    <h2>{article.title}</h2>
                    <p>{article.dek}</p>
                  </div>
                </PageLink>
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  };
}

export default createArticlesPage();

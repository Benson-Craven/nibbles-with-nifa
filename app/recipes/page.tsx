import { Footer, Nav, PageIntro } from "../components/SiteChrome";
import { PageLink } from "../components/PageLink";
import { ContentImage } from "../components/ContentImage";
import type { CreatorProfile, Recipe } from "../data";
import {
  getCreatorProfile as getPublishedCreatorProfile,
  getRecipes as getPublishedRecipes,
} from "@/lib/content";

export function RecipeIndexContent({ recipes }: { recipes: Recipe[] }) {
  const recipeCountLabel = `${recipes.length} ${
    recipes.length === 1 ? "recipe" : "recipes"
  }`;

  return (
    <section className="shell section recipe-index">
      <div className="filter-line">
        <span>All recipes</span>
        <span>{recipeCountLabel}</span>
      </div>
      {recipes.length === 0 ? (
        <div className="archive-empty">
          <h2>Nothing here yet — I&apos;m still testing.</h2>
          <p>
            There aren&apos;t any published recipes yet. In the meantime, have a
            read of my travel stories and the food I found along the way.
          </p>
          <PageLink className="button button--light" href="/articles">
            Read my travel stories <span>→</span>
          </PageLink>
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <PageLink
              className="recipe-card"
              href={`/recipes/${recipe.slug}`}
              key={recipe.slug}
            >
              <ContentImage
                alt={recipe.imageAlt}
                className="card-image"
                sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
                src={recipe.image}
              />
              <div className="card-copy">
                <p className="card-tags">{recipe.tags.join(" · ")}</p>
                <h2 className="authored-heading">{recipe.title}</h2>
                <p>{recipe.note}</p>
                <span>
                  Read recipe <b>→</b>
                </span>
              </div>
            </PageLink>
          ))}
        </div>
      )}
    </section>
  );
}

export function createRecipesPage(
  loadRecipes: () => Promise<Recipe[]> = getPublishedRecipes,
  loadCreator: () => Promise<CreatorProfile | null> = async () => null,
) {
  return async function RecipesPage() {
    const [creator, recipes] = await Promise.all([
      loadCreator(),
      loadRecipes(),
    ]);

    return (
      <>
        <Nav />
        <main>
          <PageIntro
            eyebrow="Recipes"
            title="What shall we eat?"
            copy="Midweek dinners, baking projects, and bits for sharing when people come round."
          />
          <RecipeIndexContent recipes={recipes} />
        </main>
        <Footer creator={creator} />
      </>
    );
  };
}

export default createRecipesPage(
  getPublishedRecipes,
  getPublishedCreatorProfile,
);

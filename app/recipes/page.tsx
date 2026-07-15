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
          <h2>New recipes are still being prepared.</h2>
          <p>
            There is nothing ready for the table just yet. In the meantime,
            follow Nifa&apos;s stories from the road and the food around them.
          </p>
          <PageLink className="button button--light" href="/articles">
            Explore Travel <span>→</span>
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
                <h2>{recipe.title}</h2>
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
            eyebrow="Recipe index"
            title="Food for plans, cravings, and last-minute texts."
            copy="Low-lift dinners, sweet things, fridge raids, and shareable snacks for whatever the day turns into."
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

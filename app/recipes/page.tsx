import { Footer, Nav, PageIntro } from "../components/SiteChrome";
import { PageLink } from "../components/PageLink";
import type { Recipe } from "../data";
import { getRecipes as getPublishedRecipes } from "@/lib/content";

export function RecipeIndexContent({ recipes }: { recipes: Recipe[] }) {
  return (
    <section className="shell section recipe-index">
      <div className="filter-line">
        <span>All recipes</span>
        <span>{recipes.length} recipes</span>
      </div>
      <div className="recipe-grid">
        {recipes.map((recipe) => (
          <PageLink
            className="recipe-card"
            href={`/recipes/${recipe.slug}`}
            key={recipe.slug}
          >
            <div
              className="card-image"
              style={{ backgroundImage: `url(${recipe.image})` }}
            />
            <div className="card-copy">
              <p className="card-tags">
                {recipe.tags.slice(0, 2).join(" · ")}
              </p>
              <h2>{recipe.title}</h2>
              <p>{recipe.note}</p>
              <span>
                Read recipe <b>→</b>
              </span>
            </div>
          </PageLink>
        ))}
      </div>
    </section>
  );
}

export function createRecipesPage(
  loadRecipes: () => Promise<Recipe[]> = getPublishedRecipes,
) {
  return async function RecipesPage() {
    const recipes = await loadRecipes();

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
        <Footer />
      </>
    );
  };
}

export default createRecipesPage();

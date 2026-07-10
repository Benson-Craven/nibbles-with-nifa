import Image from "next/image";
import { notFound } from "next/navigation";
import { CreatorProfile } from "../../components/CreatorProfile";
import { IngredientList } from "../../components/IngredientList";
import { Footer, Nav } from "../../components/SiteChrome";
import type { Recipe } from "../../data";
import {
  getRecipeBySlug as getPublishedRecipeBySlug,
  getRecipeSlugs,
} from "@/lib/content";

export async function generateStaticParams() {
  return getRecipeSlugs();
}

export function RecipeDetailContent({ recipe }: { recipe: Recipe }) {
  const provenance = recipe.provenance;
  const hasProvenance = Object.values(provenance ?? {}).some(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
  const publicNotes = (recipe.publicNotes ?? []).filter((note) => note.trim());
  const testedSubstitutions = (recipe.testedSubstitutions ?? []).filter(
    (note) => note.trim(),
  );

  return (
    <main>
      <section className="recipe-hero">
        <Image
          alt={recipe.imageAlt}
          className="recipe-hero__image"
          fill
          priority
          sizes="100vw"
          src={recipe.image}
        />
        <div aria-hidden="true" className="recipe-hero__scrim" />
        <div className="recipe-hero__content">
          <p className="eyebrow">Recipe · {recipe.tags.join(" / ")}</p>
          <h1>{recipe.title}</h1>
          <p>{recipe.note}</p>
        </div>
        {recipe.imageCredit?.trim() && (
          <p className="recipe-hero__credit">{recipe.imageCredit}</p>
        )}
      </section>
      <article className="recipe-detail shell">
        <header>
          <p className="recipe-intro">{recipe.intro}</p>
          <dl className="recipe-meta">
            <div>
              <dt>Prep</dt>
              <dd>{recipe.prep} mins</dd>
            </div>
            <div>
              <dt>Cook</dt>
              <dd>{recipe.cook} mins</dd>
            </div>
            <div>
              <dt>Serves</dt>
              <dd>{recipe.servings}</dd>
            </div>
            {recipe.cookTest?.completedCook && (
              <div>
                <dt>Testing</dt>
                <dd>Tested once</dd>
              </div>
            )}
          </dl>
        </header>
        <CreatorProfile creator={recipe.creator} />
        {hasProvenance && provenance && (
          <section className="recipe-context" aria-labelledby="recipe-context">
            <p className="eyebrow">Inspiration &amp; attribution</p>
            <h2 id="recipe-context">The story behind this recipe</h2>
            {provenance.placeOrCulturalLane?.trim() && (
              <p>
                <strong>Place or cultural lane:</strong>{" "}
                {provenance.placeOrCulturalLane}
              </p>
            )}
            {(provenance.sourceName?.trim() ||
              provenance.specificContribution?.trim()) && (
              <p>
                <strong>Inspiration:</strong>{" "}
                {provenance.sourceUrl?.trim() &&
                provenance.sourceName?.trim() ? (
                  <a
                    href={provenance.sourceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {provenance.sourceName}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  provenance.sourceName
                )}
                {provenance.sourceName?.trim() &&
                  provenance.specificContribution?.trim() && <span> — </span>}
                {provenance.specificContribution}
              </p>
            )}
            {provenance.adaptationStatement?.trim() && (
              <p>
                <strong>Nifa&apos;s adaptation:</strong>{" "}
                {provenance.adaptationStatement}
              </p>
            )}
            {provenance.credit?.trim() && (
              <p className="recipe-context__credit">{provenance.credit}</p>
            )}
          </section>
        )}
        <div className="recipe-content">
          <aside>
            <h2>Ingredients</h2>
            <IngredientList groups={recipe.ingredients} />
          </aside>
          <section>
            <h2>Method</h2>
            <ol>
              {recipe.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {(publicNotes.length > 0 || testedSubstitutions.length > 0) && (
              <div className="recipe-notes">
                {publicNotes.length > 0 && (
                  <section>
                    <h3>Nifa&apos;s notes</h3>
                    <ul>
                      {publicNotes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </section>
                )}
                {testedSubstitutions.length > 0 && (
                  <section>
                    <h3>Tested substitutions</h3>
                    <ul>
                      {testedSubstitutions.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </section>
        </div>
      </article>
    </main>
  );
}

type RecipePageProps = {
  params: Promise<{ slug: string }>;
};

export function createRecipePage(
  loadRecipe: (slug: string) => Promise<Recipe | null> =
    getPublishedRecipeBySlug,
) {
  return async function RecipePage({ params }: RecipePageProps) {
    const { slug } = await params;
    const recipe = await loadRecipe(slug);
    if (!recipe) notFound();

    return (
      <>
        <Nav />
        <RecipeDetailContent recipe={recipe} />
        <Footer />
      </>
    );
  };
}

export default createRecipePage();

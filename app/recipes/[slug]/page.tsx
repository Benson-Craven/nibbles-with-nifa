import { notFound } from "next/navigation";
import { IngredientList } from "../../components/IngredientList";
import { Footer, Nav } from "../../components/SiteChrome";
import { getRecipeBySlug, getRecipeSlugs } from "@/lib/content";

export async function generateStaticParams() {
  return getRecipeSlugs();
}

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) notFound();

  return (
    <>
      <Nav />
      <main>
        <section
          className="recipe-hero"
          style={{
            backgroundImage: `linear-gradient(0deg, rgba(42,39,36,.48), rgba(42,39,36,.04)), url(${recipe.image})`,
          }}
        >
          <div>
            <p className="eyebrow">Recipe · {recipe.tags.join(" / ")}</p>
            <h1>{recipe.title}</h1>
            <p>{recipe.note}</p>
          </div>
        </section>
        <article className="recipe-detail shell">
          <header>
            <p className="recipe-intro">{recipe.intro}</p>
            <dl className="recipe-meta">
              <div><dt>Prep</dt><dd>{recipe.prep} mins</dd></div>
              <div><dt>Cook</dt><dd>{recipe.cook} mins</dd></div>
              <div><dt>Serves</dt><dd>{recipe.servings}</dd></div>
            </dl>
          </header>
          <div className="recipe-content">
            <aside>
              <h2>Ingredients</h2>
              <IngredientList groups={recipe.ingredients} />
            </aside>
            <section>
              <h2>Method</h2>
              <ol>{recipe.steps.map((step) => <li key={step}>{step}</li>)}</ol>
              <p className="recipe-closing">Serve it warm, pass it around, and save the last little bit for tomorrow.</p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

import Image from "next/image";
import { notFound } from "next/navigation";
import { CreatorProfile } from "../../components/CreatorProfile";
import { ContentImageFallback } from "../../components/ContentImage";
import { DraftPreviewBanner } from "../../components/DraftPreviewBanner";
import { IngredientList } from "../../components/IngredientList";
import { PreviewFieldPrompt } from "../../components/PreviewFieldPrompt";
import { Footer, Nav } from "../../components/SiteChrome";
import { RelatedContent } from "../../components/RelatedContent";
import type { PreviewRecipe, Recipe } from "../../data";
import { createEntryMetadata } from "@/lib/entry-metadata";
import { normalizeMediaSource } from "@/lib/media";
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
  getArticles as getPublishedArticles,
  getKitchenItems as getPublishedKitchenItems,
  getProducts as getPublishedProducts,
  getRecipeByDocumentId as getPublishedRecipeByDocumentId,
  getRecipeBySlug as getPublishedRecipeBySlug,
  getRecipes as getPublishedRecipes,
  getRecipeSlugs,
} from "@/lib/content";
import { previewContent } from "@/lib/preview-content";

export async function generateStaticParams() {
  return getRecipeSlugs();
}

type RecipePageProps = {
  params: Promise<{ slug: string }>;
};

export function createRecipeMetadata(
  loadRecipe: (
    slug: string,
  ) => Promise<Recipe | null> = getPublishedRecipeBySlug,
  isPreview: () => Promise<boolean> = async () => false,
) {
  return createEntryMetadata(
    loadRecipe,
    (recipe) => ({
      title: recipe.title,
      description: recipe.note,
      image: recipe.image,
      seo: recipe.seo,
    }),
    isPreview,
  );
}

export const generateMetadata = createRecipeMetadata(
  getPublishedRecipeBySlug,
  isDraftPreviewEnabled,
);

export function RecipeDetailContent({
  isPreview = false,
  recipe,
  relatedContent,
}: {
  isPreview?: boolean;
  recipe: PreviewRecipe;
  relatedContent?: React.ReactNode;
}) {
  const title = recipe.title?.trim();
  const note = recipe.note?.trim();
  const image = normalizeMediaSource(recipe.image);
  const imageAlt = recipe.imageAlt?.trim();
  const hasHeroImage = Boolean(image && imageAlt);
  const hasPreviewHeroImage = Boolean(isPreview && image && !imageAlt);
  const tags = recipe.tags ?? [];
  const intro = recipe.intro?.trim();
  const ingredientGroups = (recipe.ingredients ?? []).filter(
    (group) => Array.isArray(group.items) && group.items.length > 0,
  );
  const steps = (recipe.steps ?? []).filter(
    (step) => typeof step === "string" && step.trim(),
  );
  const recipeMeta = [
    typeof recipe.prep === "number" && Number.isFinite(recipe.prep)
      ? { label: "Prep", value: `${recipe.prep} mins` }
      : null,
    typeof recipe.cook === "number" && Number.isFinite(recipe.cook)
      ? { label: "Cook", value: `${recipe.cook} mins` }
      : null,
    typeof recipe.servings === "number" && Number.isFinite(recipe.servings)
      ? { label: "Serves", value: String(recipe.servings) }
      : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));
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
      <section
        className={`recipe-hero${hasHeroImage || hasPreviewHeroImage ? "" : " recipe-hero--empty"}`}
        data-media-state={hasHeroImage ? "authored" : "missing"}
      >
        {image && imageAlt ? (
          <>
            <Image
              alt={imageAlt}
              className="recipe-hero__image"
              fill
              priority
              sizes="100vw"
              src={image}
            />
            <div aria-hidden="true" className="recipe-hero__scrim" />
          </>
        ) : null}
        {hasPreviewHeroImage && image && (
          <>
            <div
              aria-hidden="true"
              className="recipe-hero__image recipe-hero__image--preview"
              style={{ backgroundImage: `url(${image})` }}
            />
            <div aria-hidden="true" className="recipe-hero__scrim" />
          </>
        )}
        {!hasHeroImage && !hasPreviewHeroImage && <ContentImageFallback />}
        {isPreview && !image && (
          <PreviewFieldPrompt>Add a hero image</PreviewFieldPrompt>
        )}
        {isPreview && image && !imageAlt && (
          <PreviewFieldPrompt>
            Add hero image alternative text
          </PreviewFieldPrompt>
        )}
        <div className="recipe-hero__content">
          <p className="eyebrow">
            Recipe{tags.length > 0 ? ` · ${tags.join(" / ")}` : ""}
          </p>
          {title ? (
            <h1 className="authored-heading">{title}</h1>
          ) : isPreview ? (
            <PreviewFieldPrompt as="h1">Add a title</PreviewFieldPrompt>
          ) : null}
          {note ? (
            <p>{note}</p>
          ) : isPreview ? (
            <PreviewFieldPrompt>Add a recipe summary</PreviewFieldPrompt>
          ) : null}
        </div>
        {hasHeroImage && recipe.imageCredit?.trim() && (
          <p className="recipe-hero__credit">{recipe.imageCredit}</p>
        )}
      </section>
      <article className="recipe-detail shell">
        {(intro || recipeMeta.length > 0 || isPreview) && (
          <header>
            {intro ? (
              <p className="recipe-intro">{intro}</p>
            ) : (
              isPreview && (
                <PreviewFieldPrompt>Add an introduction</PreviewFieldPrompt>
              )
            )}
            <div>
              {recipeMeta.length > 0 && (
                <dl className="recipe-meta">
                  {recipeMeta.map(({ label, value }) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {isPreview && recipeMeta.length < 3 && (
                <PreviewFieldPrompt>
                  Add prep, cook, and serving details
                </PreviewFieldPrompt>
              )}
            </div>
          </header>
        )}
        <CreatorProfile creator={recipe.creator} variant="compact" />
        {hasProvenance && provenance && (
          <section className="recipe-context" aria-labelledby="recipe-context">
            <p className="eyebrow">Where it came from</p>
            <h2 id="recipe-context">The story behind this recipe</h2>
            {provenance.placeOrCulturalLane?.trim() && (
              <p>
                <strong>Place or tradition:</strong>{" "}
                {provenance.placeOrCulturalLane}
              </p>
            )}
            {(provenance.sourceName?.trim() ||
              provenance.specificContribution?.trim()) && (
              <p>
                <strong>Inspired by:</strong>{" "}
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
                <strong>What I changed:</strong>{" "}
                {provenance.adaptationStatement}
              </p>
            )}
            {provenance.credit?.trim() && (
              <p className="recipe-context__credit">{provenance.credit}</p>
            )}
          </section>
        )}
        {(ingredientGroups.length > 0 || steps.length > 0 || isPreview) && (
          <div className="recipe-content">
            <aside>
              <h2>Ingredients</h2>
              {ingredientGroups.length > 0 ? (
                <IngredientList groups={ingredientGroups} />
              ) : (
                isPreview && (
                  <PreviewFieldPrompt>Add ingredients</PreviewFieldPrompt>
                )
              )}
            </aside>
            <section>
              <h2>Method</h2>
              {steps.length > 0 ? (
                <ol>
                  {steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              ) : (
                isPreview && (
                  <PreviewFieldPrompt>Add method steps</PreviewFieldPrompt>
                )
              )}
              {(publicNotes.length > 0 || testedSubstitutions.length > 0) && (
                <div className="recipe-notes">
                  {publicNotes.length > 0 && (
                    <section>
                      <h3>My notes</h3>
                      <ul>
                        {publicNotes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {testedSubstitutions.length > 0 && (
                    <section>
                      <h3>Swaps I&apos;ve tested</h3>
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
        )}
      </article>
      {relatedContent}
    </main>
  );
}

type RecipePageDependencies = RelatedContentLoaders & {
  getRecipeByDocumentId?: (documentId: string) => Promise<PreviewRecipe | null>;
  getRecipeBySlug: (slug: string) => Promise<PreviewRecipe | null>;
};

const defaultDependencies: RecipePageDependencies = {
  getArticles: getPublishedArticles,
  getKitchenItems: getPublishedKitchenItems,
  getProducts: getPublishedProducts,
  getRecipeByDocumentId: getPublishedRecipeByDocumentId,
  getRecipeBySlug: getPublishedRecipeBySlug,
  getRecipes: getPublishedRecipes,
};

export function createRecipePage(
  dependencies: RecipePageDependencies = defaultDependencies,
  previewRuntime?: DraftPreviewRuntime<RecipePageDependencies>,
) {
  return async function RecipePage({ params }: RecipePageProps) {
    const { slug } = await params;
    const {
      activeDependencies,
      entry: recipe,
      isPreview,
      publishedEntry,
    } = await resolveDraftPreviewEntry({
      slug,
      publicDependencies: dependencies,
      previewRuntime,
      loadEntry: (loaders, entrySlug) => loaders.getRecipeBySlug(entrySlug),
      loadPublishedEntry: (loaders, previewRecipe, entrySlug) =>
        previewRecipe.documentId && loaders.getRecipeByDocumentId
          ? loaders.getRecipeByDocumentId(previewRecipe.documentId)
          : loaders.getRecipeBySlug(entrySlug),
    });
    if (!recipe) notFound();

    const relatedCollections = await loadRelatedCollections(
      recipe.related,
      activeDependencies,
    );

    return (
      <>
        <Nav />
        {isPreview && (
          <DraftPreviewBanner
            exitPath={
              publishedEntry ? `/recipes/${publishedEntry.slug}` : "/recipes"
            }
          />
        )}
        <RecipeDetailContent
          isPreview={isPreview}
          recipe={recipe}
          relatedContent={
            <RelatedContent {...relatedCollections} related={recipe.related} />
          }
        />
        <Footer creator={recipe.creator} />
      </>
    );
  };
}

export default createRecipePage(defaultDependencies, {
  isEnabled: isDraftPreviewEnabled,
  dependencies: previewContent,
});

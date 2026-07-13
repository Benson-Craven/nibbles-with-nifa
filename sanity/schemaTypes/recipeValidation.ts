import {
  recipeIngredientUnits,
  type RecipeEditorialStage,
  type RecipeIngredientUnit,
} from "@/lib/recipe-types";

export type RecipeValidationDocument = {
  editorialStage?: RecipeEditorialStage;
  title?: unknown;
  slug?: { current?: unknown };
  image?: {
    asset?: { _ref?: unknown; _id?: unknown };
    alt?: unknown;
    credit?: unknown;
  };
  date?: unknown;
  servings?: unknown;
  prep?: unknown;
  cook?: unknown;
  tags?: unknown;
  intro?: unknown;
  ingredients?: unknown;
  steps?: unknown;
};

type IngredientGroup = {
  group?: unknown;
  items?: unknown;
};

type IngredientItem = {
  amount?: unknown;
  unit?: unknown;
  ingredient?: unknown;
};

const quantityPart =
  "(?:\\d+\\s+\\d+\\s*\\/\\s*\\d+|\\d+\\s*\\/\\s*\\d+|\\d+(?:[.,]\\d+)?[½¼¾⅓⅔⅛⅜⅝⅞]?|[½¼¾⅓⅔⅛⅜⅝⅞])";
const quantityPattern = new RegExp(
  `^\\s*${quantityPart}(?:\\s*[-–]\\s*${quantityPart})?\\s*$`,
);
const ingredientUnits = new Set<string>(recipeIngredientUnits);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNumberAtLeast(value: unknown, minimum: number) {
  return (
    typeof value === "number" && Number.isFinite(value) && value >= minimum
  );
}

function isIngredientUnit(value: unknown): value is RecipeIngredientUnit {
  return typeof value === "string" && ingredientUnits.has(value);
}

function ingredientIssues(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) {
    return ["Grouped ingredients"];
  }

  const issues: string[] = [];

  for (const valueGroup of value) {
    const group = valueGroup as IngredientGroup;
    if (!isNonEmptyString(group?.group)) {
      issues.push("Grouped ingredients — add a Group heading to every group");
    }

    if (!Array.isArray(group?.items) || group.items.length === 0) {
      issues.push("Grouped ingredients — add at least one item to every group");
      continue;
    }

    for (const item of group.items) {
      const ingredient = item as IngredientItem;
      if (
        !isNonEmptyString(ingredient?.amount) ||
        !quantityPattern.test(ingredient.amount) ||
        !isIngredientUnit(ingredient?.unit) ||
        !isNonEmptyString(ingredient?.ingredient)
      ) {
        issues.push(
          "Grouped ingredients — give every ingredient a metric quantity or counted amount",
        );
        break;
      }
    }
  }

  return issues;
}

export function publicationIssues(document: RecipeValidationDocument) {
  if (document.editorialStage !== "ready") return [];

  const issues: string[] = [];
  const imageAsset = document.image?.asset;

  if (!isNonEmptyString(document.title)) issues.push("Working title");
  if (!isNonEmptyString(document.slug?.current)) issues.push("Slug");
  if (!imageAsset?._ref && !imageAsset?._id) issues.push("Hero image");
  if (!isNonEmptyString(document.image?.alt)) {
    issues.push("Hero image — Alternative text");
  }
  if (!isNonEmptyString(document.image?.credit)) {
    issues.push("Hero image — Image credit");
  }
  if (!isNonEmptyString(document.date)) issues.push("Publish date");
  if (!isNumberAtLeast(document.servings, 1)) {
    issues.push("Yield in servings");
  }
  if (!isNumberAtLeast(document.prep, 0)) issues.push("Prep minutes");
  if (!isNumberAtLeast(document.cook, 0)) issues.push("Cook minutes");

  if (
    !Array.isArray(document.tags) ||
    document.tags.length === 0 ||
    document.tags.some((tag) => !isNonEmptyString(tag))
  ) {
    issues.push("Tags");
  }

  if (!isNonEmptyString(document.intro)) issues.push("Personal headnote");

  issues.push(...ingredientIssues(document.ingredients));

  if (
    !Array.isArray(document.steps) ||
    document.steps.length === 0 ||
    document.steps.some((step) => !isNonEmptyString(step))
  ) {
    issues.push("Ordered method steps");
  }

  return [...new Set(issues)];
}

export function validateRecipeForPublication(
  document: RecipeValidationDocument,
): true | string {
  const issues = publicationIssues(document);

  if (issues.length === 0) return true;

  return `Ready to publish is missing: ${issues.join(", ")}. Add every item, then publish the recipe.`;
}

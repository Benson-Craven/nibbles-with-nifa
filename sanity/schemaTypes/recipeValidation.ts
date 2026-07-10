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
  cookTest?: {
    completedCook?: unknown;
    quantitiesCorrected?: unknown;
    timingsCorrected?: unknown;
    yieldCorrected?: unknown;
  };
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
    return ["grouped ingredients"];
  }

  const issues: string[] = [];

  for (const valueGroup of value) {
    const group = valueGroup as IngredientGroup;
    if (!isNonEmptyString(group?.group)) {
      issues.push("an ingredient group heading");
    }

    if (!Array.isArray(group?.items) || group.items.length === 0) {
      issues.push("at least one ingredient in every group");
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
          "a structured metric quantity or counted amount for every ingredient",
        );
        break;
      }
    }
  }

  return issues;
}

export function publicationIssues(document: RecipeValidationDocument) {
  if (document.editorialStage === "cookedDraft") {
    return document.cookTest?.completedCook === true
      ? []
      : ["confirmation of one completed cook"];
  }

  if (document.editorialStage !== "ready") return [];

  const issues: string[] = [];
  const imageAsset = document.image?.asset;

  if (!isNonEmptyString(document.title)) issues.push("title");
  if (!isNonEmptyString(document.slug?.current)) issues.push("slug");
  if (!imageAsset?._ref && !imageAsset?._id) issues.push("hero image");
  if (!isNonEmptyString(document.image?.alt)) {
    issues.push("hero alternative text");
  }
  if (!isNonEmptyString(document.image?.credit)) issues.push("hero credit");
  if (!isNonEmptyString(document.date)) issues.push("publish date");
  if (!isNonEmptyString(document.intro)) issues.push("personal headnote");
  if (!isNumberAtLeast(document.servings, 1)) issues.push("yield");
  if (!isNumberAtLeast(document.prep, 0)) issues.push("prep time");
  if (!isNumberAtLeast(document.cook, 0)) issues.push("cook time");

  issues.push(...ingredientIssues(document.ingredients));

  if (
    !Array.isArray(document.steps) ||
    document.steps.length === 0 ||
    document.steps.some((step) => !isNonEmptyString(step))
  ) {
    issues.push("ordered method steps");
  }

  if (
    !Array.isArray(document.tags) ||
    document.tags.length === 0 ||
    document.tags.some((tag) => !isNonEmptyString(tag))
  ) {
    issues.push("at least one tag");
  }

  if (document.cookTest?.completedCook !== true) {
    issues.push("confirmation of one completed cook");
  }
  if (document.cookTest?.quantitiesCorrected !== true) {
    issues.push("confirmation of corrected quantities");
  }
  if (document.cookTest?.timingsCorrected !== true) {
    issues.push("confirmation of corrected timings");
  }
  if (document.cookTest?.yieldCorrected !== true) {
    issues.push("confirmation of corrected yield");
  }

  return [...new Set(issues)];
}

export function validateRecipeForPublication(
  document: RecipeValidationDocument,
): true | string {
  const issues = publicationIssues(document);

  if (issues.length === 0) return true;

  const stageLabel =
    document.editorialStage === "cookedDraft" ? "cooked draft" : "ready";

  return `Before marking this recipe ${stageLabel}, add: ${issues.join(", ")}.`;
}

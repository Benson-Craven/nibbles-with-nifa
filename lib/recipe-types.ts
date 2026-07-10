export type RecipeEditorialStage = "idea" | "cookedDraft" | "ready";

export const recipeIngredientUnits = [
  "g",
  "kg",
  "ml",
  "l",
  "tsp",
  "tbsp",
  "count",
] as const;

export type RecipeIngredientUnit = (typeof recipeIngredientUnits)[number];

export type RecipeIngredientFields = {
  amount?: string;
  unit?: RecipeIngredientUnit;
  ingredient?: string;
  preparation?: string;
};

export function formatRecipeIngredient({
  amount,
  unit,
  ingredient,
  preparation,
}: RecipeIngredientFields) {
  const normalizedAmount = amount?.trim();
  const normalizedIngredient = ingredient?.trim();
  const normalizedPreparation = preparation?.trim();

  if (!normalizedAmount || !unit || !normalizedIngredient) return undefined;

  return `${normalizedAmount}${
    unit === "count" ? "" : ` ${unit}`
  } ${normalizedIngredient}${
    normalizedPreparation ? `, ${normalizedPreparation}` : ""
  }`;
}

export type RecipeInspirationSource =
  | "person"
  | "restaurant"
  | "publication"
  | "social"
  | "travel"
  | "research"
  | "other";

import Image from "next/image";
import { formatRecipeIngredient } from "@/lib/recipe-types";
import { normalizeMediaSource } from "@/lib/media";
import type { IngredientItem } from "../data";

type IngredientListProps = {
  groups: { group?: string; items: Array<IngredientItem | null | undefined> }[];
};

type IngredientDisplay = {
  text: string;
  alt?: string;
  image?: string;
};

function ingredientDisplay(
  item: IngredientItem | null | undefined,
): IngredientDisplay | null {
  if (!item) {
    return null;
  }

  if (typeof item === "string") {
    return { text: item };
  }

  const structuredText = formatRecipeIngredient(item);
  const text = structuredText ?? item.text?.trim();

  if (!text) {
    return null;
  }

  return {
    text,
    alt: item.alt?.trim(),
    image: normalizeMediaSource(item.image) ?? undefined,
  };
}

export function IngredientList({ groups }: IngredientListProps) {
  return (
    <div className="ingredient-list">
      {groups.map((group, index) => (
        <div key={`${group.group ?? "ingredients"}-${index}`}>
          {group.group && <h3 className="authored-heading">{group.group}</h3>}
          <ul>
            {group.items.map((item) => {
              const ingredient = ingredientDisplay(item);

              if (!ingredient) {
                return null;
              }

              return (
                <li className="ingredient-list__item" key={ingredient.text}>
                  {ingredient.image && ingredient.alt && (
                    <Image
                      alt={ingredient.alt}
                      className="ingredient-list__image"
                      height={64}
                      sizes="64px"
                      src={ingredient.image}
                      width={64}
                    />
                  )}
                  <span>{ingredient.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

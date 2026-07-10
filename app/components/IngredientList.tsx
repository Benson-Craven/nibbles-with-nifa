import Image from "next/image";
import { formatRecipeIngredient } from "@/lib/recipe-types";
import type { IngredientItem } from "../data";

type IngredientListProps = {
  groups: { group?: string; items: Array<IngredientItem | null | undefined> }[];
};

type IngredientDisplay = {
  text: string;
  alt: string;
  image: string;
};

const pexelsImage = (id: string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=160&w=160`;

const ingredientImageSources = {
  allium: pexelsImage("7615539"),
  bottle: pexelsImage("1123260"),
  bowl: pexelsImage("1640777"),
  bread: pexelsImage("1332271"),
  chicken: pexelsImage("262945"),
  citrus: pexelsImage("4197821"),
  corn: pexelsImage("139746"),
  dairy: pexelsImage("5605628"),
  egg: pexelsImage("5605628"),
  grain: pexelsImage("1640777"),
  jar: pexelsImage("4197821"),
  leaf: pexelsImage("1640777"),
  mushroom: pexelsImage("6669413"),
  pasta: pexelsImage("4518806"),
  pear: pexelsImage("102104"),
  potato: pexelsImage("3026808"),
  seeds: pexelsImage("230325"),
  tomato: pexelsImage("11229104"),
  wedge: pexelsImage("5605628"),
} as const;

const ingredientPatterns = [
  { pattern: /pasta|noodle|spaghetti|linguine/i, kind: "pasta" },
  { pattern: /mushroom|shiitake/i, kind: "mushroom" },
  { pattern: /miso|soy|stock/i, kind: "jar" },
  { pattern: /cream|milk|yogurt|ricotta|fraiche|butter/i, kind: "dairy" },
  { pattern: /lemon|lime/i, kind: "citrus" },
  { pattern: /parmesan|cheese|chocolate/i, kind: "wedge" },
  { pattern: /sweet potato|potato/i, kind: "potato" },
  { pattern: /bread|sourdough|pastry|flour/i, kind: "bread" },
  { pattern: /egg/i, kind: "egg" },
  { pattern: /sugar|honey|vanilla|balsamic|oil/i, kind: "bottle" },
  { pattern: /chicken/i, kind: "chicken" },
  { pattern: /rice|beans|cannellini/i, kind: "grain" },
  { pattern: /corn|sweetcorn/i, kind: "corn" },
  { pattern: /onion|scallion|leek|garlic/i, kind: "allium" },
  { pattern: /herb|basil|greens/i, kind: "leaf" },
  { pattern: /pear/i, kind: "pear" },
  { pattern: /tomato/i, kind: "tomato" },
  { pattern: /hazelnut|sesame|seeds/i, kind: "seeds" },
] as const;

function fallbackImageForIngredient(label: string) {
  const kind =
    ingredientPatterns.find(({ pattern }) => pattern.test(label))?.kind ??
    "bowl";

  return ingredientImageSources[kind];
}

function ingredientDisplay(
  item: IngredientItem | null | undefined,
): IngredientDisplay | null {
  if (!item) {
    return null;
  }

  if (typeof item === "string") {
    return {
      text: item,
      alt: `${item} ingredient`,
      image: fallbackImageForIngredient(item),
    };
  }

  const structuredText = formatRecipeIngredient(item);
  const text = structuredText ?? item.text?.trim();

  if (!text) {
    return null;
  }

  return {
    text,
    alt: item.alt ?? `${text} ingredient`,
    image: item.image ?? fallbackImageForIngredient(text),
  };
}

export function IngredientList({ groups }: IngredientListProps) {
  return (
    <div className="ingredient-list">
      {groups.map((group, index) => (
        <div key={`${group.group ?? "ingredients"}-${index}`}>
          {group.group && <h3>{group.group}</h3>}
          <ul>
            {group.items.map((item) => {
              const ingredient = ingredientDisplay(item);

              if (!ingredient) {
                return null;
              }

              return (
                <li className="ingredient-list__item" key={ingredient.text}>
                  <Image
                    alt={ingredient.alt}
                    className="ingredient-list__image"
                    height={64}
                    sizes="64px"
                    src={ingredient.image}
                    width={64}
                  />
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

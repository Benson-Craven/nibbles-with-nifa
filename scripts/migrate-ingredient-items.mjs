import { createClient } from "@sanity/client";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dryRun = process.argv.includes("--dry-run");

async function loadEnvFile(filePath) {
  try {
    const contents = await fs.readFile(filePath, "utf8");

    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const equalsIndex = trimmed.indexOf("=");
      if (equalsIndex === -1) continue;

      const key = trimmed.slice(0, equalsIndex).trim();
      const value = trimmed
        .slice(equalsIndex + 1)
        .trim()
        .replace(/^["']|["']$/g, "");

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // Missing env files are fine; CI may provide vars directly.
  }
}

await loadEnvFile(path.join(root, ".env.local"));
await loadEnvFile(path.join(root, ".env"));

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-06-26";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local.");
}

if (!dryRun && !token) {
  throw new Error(
    "Missing SANITY_WRITE_TOKEN in .env.local. Add a write token or run with --dry-run.",
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

function stableKey(prefix, value) {
  return `${prefix}-${String(value).replace(/[^a-zA-Z0-9_-]/g, "-")}`.slice(
    0,
    80,
  );
}

function migrateIngredient(item, recipeId, groupIndex, itemIndex) {
  if (typeof item === "string") {
    return {
      _key: stableKey("ingredient", `${recipeId}-${groupIndex}-${itemIndex}`),
      _type: "ingredientItem",
      text: item,
    };
  }

  return item;
}

function migrateGroup(group, recipeId, groupIndex) {
  if (!group || !Array.isArray(group.items)) {
    return group;
  }

  return {
    ...group,
    items: group.items.map((item, itemIndex) =>
      migrateIngredient(item, recipeId, groupIndex, itemIndex),
    ),
  };
}

function hasLegacyIngredientStrings(recipe) {
  return recipe.ingredients?.some((group) =>
    group.items?.some((item) => typeof item === "string"),
  );
}

try {
  const recipes = await client.fetch(
    `*[_type == "recipe" && defined(ingredients)]{_id, title, ingredients}`,
  );

  const recipesToMigrate = recipes.filter(hasLegacyIngredientStrings);

  if (recipesToMigrate.length === 0) {
    console.log("No legacy string ingredient items found.");
    process.exit(0);
  }

  for (const recipe of recipesToMigrate) {
    const ingredients = recipe.ingredients.map((group, groupIndex) =>
      migrateGroup(group, recipe._id, groupIndex),
    );

    if (dryRun) {
      console.log(`Would migrate ${recipe.title || recipe._id}`);
      continue;
    }

    await client.patch(recipe._id).set({ ingredients }).commit();
    console.log(`Migrated ${recipe.title || recipe._id}`);
  }

  console.log(
    `${dryRun ? "Checked" : "Migrated"} ${recipesToMigrate.length} recipe document(s).`,
  );
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Could not reach Sanity: ${message}`);
  process.exit(1);
}

import { createClient } from "@sanity/client";
import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const dryRun = process.argv.includes("--dry-run");
const fallbackImagePath = "/images/kitchen/tools-flatlay.png";

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
    "Missing SANITY_WRITE_TOKEN in .env.local. Create a Sanity token with write permissions and rerun.",
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

async function loadLocalContent() {
  const source = await fs.readFile(path.join(root, "app/data.ts"), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const encoded = Buffer.from(output).toString("base64");

  return import(`data:text/javascript;base64,${encoded}`);
}

const { articles, kitchenItems, products, recipes } = await loadLocalContent();

function docId(type, slug) {
  return `${type}-${slug}`;
}

function slugField(current) {
  return { _type: "slug", current };
}

function stableKey(prefix, value) {
  return `${prefix}-${String(value).replace(/[^a-zA-Z0-9_-]/g, "-")}`.slice(
    0,
    80,
  );
}

function reference(type, slug, prefix = type) {
  return {
    _key: stableKey(prefix, slug),
    _type: "reference",
    _ref: docId(type, slug),
  };
}

function mimeTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";

  return "application/octet-stream";
}

function filenameForImage(imagePath) {
  if (imagePath.startsWith("http")) {
    return path.basename(new URL(imagePath).pathname);
  }

  return path.basename(imagePath);
}

async function imageBody(imagePath) {
  if (imagePath.startsWith("http")) {
    const response = await fetch(imagePath);

    if (response.ok) {
      return {
        body: Buffer.from(await response.arrayBuffer()),
        contentType: response.headers.get("content-type") || "image/jpeg",
      };
    }

    console.warn(
      `Could not download ${imagePath}: ${response.status}. Using ${fallbackImagePath} instead.`,
    );
    return imageBody(fallbackImagePath);
  }

  const normalized = imagePath.startsWith("/")
    ? imagePath.slice(1)
    : imagePath;
  const localPath = path.join(root, "public", normalized.replace(/^public\//, ""));

  return {
    body: await fs.readFile(localPath),
    contentType: mimeTypeFor(localPath),
  };
}

const assetCache = new Map();

async function imageField(imagePath, label) {
  if (dryRun) {
    return {
      _type: "image",
      asset: { _type: "reference", _ref: `dry-run-${label}` },
    };
  }

  if (!assetCache.has(imagePath)) {
    const filename = filenameForImage(imagePath);
    const { body, contentType } = await imageBody(imagePath);
    const asset = await client.assets.upload("image", body, {
      filename,
      contentType,
    });

    assetCache.set(imagePath, asset._id);
  }

  return {
    _type: "image",
    asset: { _type: "reference", _ref: assetCache.get(imagePath) },
  };
}

async function ingredientField(item, recipeSlug, groupIndex, itemIndex) {
  const text = typeof item === "string" ? item : item.text;
  const image = typeof item === "string" ? undefined : item.image;

  return {
    _key: stableKey(
      "ingredient",
      `${recipeSlug}-${groupIndex}-${itemIndex}-${text}`,
    ),
    _type: "ingredientItem",
    text,
    alt: typeof item === "string" ? undefined : item.alt,
    image: image ? await imageField(image, `${recipeSlug}-ingredient-${itemIndex}`) : undefined,
  };
}

async function recipeDoc(recipe) {
  return {
    _id: docId("recipe", recipe.slug),
    _type: "recipe",
    title: recipe.title,
    slug: slugField(recipe.slug),
    note: recipe.note,
    image: await imageField(recipe.image, recipe.slug),
    featured: recipe.featured,
    date: recipe.date,
    servings: recipe.servings,
    prep: recipe.prep,
    cook: recipe.cook,
    tags: recipe.tags,
    intro: recipe.intro,
    ingredients: recipe.ingredients.map((group, index) => ({
      _key: stableKey("ingredients", `${recipe.slug}-${index}`),
      _type: "object",
      group: group.group,
      items: await Promise.all(
        group.items.map((item, itemIndex) =>
          ingredientField(item, recipe.slug, index, itemIndex),
        ),
      ),
    })),
    steps: recipe.steps,
  };
}

async function productDoc(product) {
  return {
    _id: docId("product", product.slug),
    _type: "product",
    title: product.title,
    slug: slugField(product.slug),
    blurb: product.blurb,
    image: await imageField(product.image, product.slug),
    price: product.price,
    category: product.category,
  };
}

async function kitchenItemDoc(item) {
  return {
    _id: docId("kitchenItem", item.slug),
    _type: "kitchenItem",
    title: item.title,
    slug: slugField(item.slug),
    blurb: item.blurb,
    image: await imageField(item.image, item.slug),
    affiliateUrl: item.affiliateUrl,
  };
}

async function articleDoc(article) {
  return {
    _id: docId("article", article.slug),
    _type: "article",
    title: article.title,
    slug: slugField(article.slug),
    dek: article.dek,
    image: await imageField(article.image, article.slug),
    date: article.date,
    category: article.category,
    readTime: article.readTime,
    featured: article.featured,
    intro: article.intro,
    sections: article.sections.map((section, index) => ({
      _key: stableKey("section", `${article.slug}-${index}`),
      _type: "object",
      heading: section.heading,
      body: section.body,
    })),
    relatedRecipes: (article.related.recipes || []).map((slug) =>
      reference("recipe", slug, "related-recipe"),
    ),
    relatedProducts: (article.related.products || []).map((slug) =>
      reference("product", slug, "related-product"),
    ),
    relatedKitchenItems: (article.related.kitchenItems || []).map((slug) =>
      reference("kitchenItem", slug, "related-kitchen"),
    ),
  };
}

async function buildDocuments() {
  const docs = [];

  for (const recipe of recipes) docs.push(await recipeDoc(recipe));
  for (const product of products) docs.push(await productDoc(product));
  for (const item of kitchenItems) docs.push(await kitchenItemDoc(item));
  for (const article of articles) docs.push(await articleDoc(article));

  return docs;
}

const docs = await buildDocuments();

console.log(
  `${dryRun ? "Prepared" : "Importing"} ${recipes.length} recipes, ${products.length} products, ${kitchenItems.length} kitchen items, and ${articles.length} articles into ${projectId}/${dataset}.`,
);

if (dryRun) {
  console.log("Dry run complete. No Sanity writes were made.");
  process.exit(0);
}

const transaction = client.transaction();

for (const doc of docs) {
  transaction.createOrReplace(doc);
}

await transaction.commit();

console.log(
  `Imported ${docs.length} documents. Uploaded ${assetCache.size} images.`,
);

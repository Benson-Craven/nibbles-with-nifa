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

      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // Missing env files are fine; CI may provide values directly.
  }
}

await loadEnvFile(path.join(root, ".env.local"));
await loadEnvFile(path.join(root, ".env"));

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-06-26";
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

function stableKey(prefix, value) {
  return `${prefix}-${String(value).replace(/[^a-zA-Z0-9_-]/g, "-")}`.slice(
    0,
    80,
  );
}

function slugField(current) {
  return { _type: "slug", current };
}

function ingredientGroup(recipeSlug, group, items) {
  return {
    _key: stableKey("group", `${recipeSlug}-${group}`),
    _type: "object",
    group,
    items: items.map((item, index) => ({
      _key: stableKey(
        "ingredient",
        `${recipeSlug}-${group}-${index}-${item.ingredient}`,
      ),
      _type: "ingredientItem",
      ...item,
    })),
  };
}

function relatedReference(documentId, index) {
  return {
    _key: stableKey("related", `${index}-${documentId}`),
    _type: "reference",
    _ref: documentId,
  };
}

function portableTextBlock(key, style, text) {
  return {
    _key: stableKey("block", key),
    _type: "block",
    style,
    markDefs: [],
    children: [
      {
        _key: stableKey("span", key),
        _type: "span",
        marks: [],
        text,
      },
    ],
  };
}

function portableTextBody(articleId, sections) {
  return sections.flatMap((section, sectionIndex) => [
    portableTextBlock(
      `${articleId}-${sectionIndex}-heading`,
      "h2",
      section.heading,
    ),
    ...section.body.map((paragraph, paragraphIndex) =>
      portableTextBlock(
        `${articleId}-${sectionIndex}-paragraph-${paragraphIndex}`,
        "normal",
        paragraph,
      ),
    ),
  ]);
}

const starterRecipes = [
  {
    _id: "starter-recipe-sesame-lime-aubergine-rice-bowls",
    _type: "recipe",
    title: "Sample recipe: sesame-lime aubergine rice bowls",
    slug: slugField("sesame-lime-aubergine-rice-bowls"),
    editorialStage: "ready",
    privateIdeaNotes:
      "Starter content created to demonstrate the published recipe layout. Replace or revise before launch.",
    note: "Untested demonstration copy with glossy aubergine, sharp lime and rice.",
    imagePath: "assets/starter-content/sesame-lime-aubergine-rice-bowls.webp",
    imageAlt:
      "Two bowls of rice topped with glossy aubergine, spring onions, sesame seeds, lime and chilli crisp",
    featured: true,
    date: "2026-07-12",
    servings: 4,
    prep: 15,
    cook: 30,
    tags: ["Dinner", "Vegetarian", "Midweek"],
    intro:
      "This untested sample recipe demonstrates the finished recipe layout with sticky-edged aubergine, hot rice and enough lime to wake everything up.",
    ingredients: [
      ingredientGroup("sesame-lime-aubergine-rice-bowls", "For the aubergine", [
        {
          amount: "2",
          unit: "count",
          ingredient: "aubergines",
          preparation: "cut into thick batons",
        },
        { amount: "2", unit: "tbsp", ingredient: "neutral oil" },
        { amount: "2", unit: "tbsp", ingredient: "soy sauce" },
        { amount: "1", unit: "tbsp", ingredient: "toasted sesame oil" },
        { amount: "1", unit: "tbsp", ingredient: "maple syrup" },
        {
          amount: "1",
          unit: "count",
          ingredient: "lime",
          preparation: "zested and juiced",
        },
      ]),
      ingredientGroup("sesame-lime-aubergine-rice-bowls", "To serve", [
        {
          amount: "300",
          unit: "g",
          ingredient: "jasmine rice",
          preparation: "rinsed",
        },
        {
          amount: "3",
          unit: "count",
          ingredient: "spring onions",
          preparation: "thinly sliced",
        },
        {
          amount: "2",
          unit: "tbsp",
          ingredient: "sesame seeds",
          preparation: "toasted",
        },
        { amount: "4", unit: "tsp", ingredient: "chilli crisp" },
      ]),
    ],
    steps: [
      "Cook the rice according to the packet instructions, then leave it covered off the heat for 10 minutes so the grains finish steaming.",
      "Heat the oven to 220°C. Toss the aubergine with a little neutral oil and spread it across a large tray without crowding. Roast for 20 minutes, turning once, until browned at the edges and soft through the middle.",
      "Stir the soy sauce, sesame oil, maple syrup, lime zest and half the lime juice together. Pour over the hot aubergine and return the tray to the oven for 5 minutes, until the glaze is bubbling and sticky.",
      "Divide the rice between bowls, add the aubergine and spoon over any glaze left on the tray. Finish with spring onions, sesame seeds, chilli crisp and the remaining lime juice.",
    ],
    publicNotes: [
      "This is untested demonstration copy for the site layout. Replace it with a cooked, creator-authored recipe before launch.",
      "Give the aubergine enough room on the tray or it will steam instead of taking on those caramelised edges.",
    ],
    provenance: {
      _type: "object",
      sourceType: "other",
      sourceName: "Nibbles with Nifa starter content",
      specificContribution:
        "Original sample recipe written to demonstrate the editorial recipe format.",
      adaptationStatement:
        "This deliberately labelled placeholder must be replaced with tested creator-authored content before launch.",
    },
    relatedIds: [
      "starter-article-market-lunch-notes",
      "starter-recipe-smoky-tomato-butter-beans",
    ],
  },
  {
    _id: "starter-recipe-smoky-tomato-butter-beans",
    _type: "recipe",
    title: "Sample recipe: smoky tomato butter beans with toast",
    slug: slugField("smoky-tomato-butter-beans"),
    editorialStage: "ready",
    privateIdeaNotes:
      "Starter content created to demonstrate the published recipe layout. Replace or revise before launch.",
    note: "Untested demonstration copy for a bright red pan of beans and crisp toast.",
    imagePath: "assets/starter-content/smoky-tomato-butter-beans.webp",
    imageAlt:
      "A shallow bowl of butter beans in smoky tomato sauce with parsley, lemon zest and grilled sourdough",
    featured: true,
    date: "2026-07-10",
    servings: 4,
    prep: 10,
    cook: 25,
    tags: ["Dinner", "Vegetarian", "One pan"],
    intro:
      "This untested sample recipe demonstrates a generous one-pan dinner: butter beans simmered until the tomatoes turn glossy, with crisp toast for dragging through the sauce.",
    ingredients: [
      ingredientGroup("smoky-tomato-butter-beans", "For the beans", [
        { amount: "2", unit: "tbsp", ingredient: "olive oil" },
        { amount: "0.5", unit: "tsp", ingredient: "fine sea salt" },
        {
          amount: "1",
          unit: "count",
          ingredient: "brown onion",
          preparation: "finely chopped",
        },
        {
          amount: "3",
          unit: "count",
          ingredient: "garlic cloves",
          preparation: "thinly sliced",
        },
        { amount: "2", unit: "tsp", ingredient: "smoked paprika" },
        {
          amount: "800",
          unit: "g",
          ingredient: "tinned butter beans",
          preparation: "drained and rinsed",
        },
        { amount: "400", unit: "g", ingredient: "chopped tomatoes" },
        { amount: "150", unit: "ml", ingredient: "vegetable stock" },
        {
          amount: "1",
          unit: "count",
          ingredient: "lemon",
          preparation: "zested and juiced",
        },
        { amount: "0.5", unit: "tsp", ingredient: "black pepper" },
      ]),
      ingredientGroup("smoky-tomato-butter-beans", "To serve", [
        { amount: "4", unit: "count", ingredient: "sourdough slices" },
        {
          amount: "15",
          unit: "g",
          ingredient: "flat-leaf parsley",
          preparation: "roughly chopped",
        },
      ]),
    ],
    steps: [
      "Warm the olive oil in a wide frying pan over a medium heat. Add the onion with a pinch of salt and cook for 7 minutes, until soft and beginning to colour.",
      "Add the garlic and smoked paprika. Stir for 1 minute, just until the garlic smells sweet and the oil turns red.",
      "Tip in the butter beans, tomatoes and stock. Simmer uncovered for 12–15 minutes, stirring occasionally, until the sauce is thick enough to leave a trail behind the spoon.",
      "Grill the sourdough until crisp at the edges. Stir the lemon juice through the beans, then finish with parsley, lemon zest and black pepper before serving with the toast.",
    ],
    publicNotes: [
      "This is untested demonstration copy for the site layout. Replace it with a cooked, creator-authored recipe before launch.",
    ],
    provenance: {
      _type: "object",
      sourceType: "other",
      sourceName: "Nibbles with Nifa starter content",
      specificContribution:
        "Original sample recipe written to demonstrate the editorial recipe format.",
      adaptationStatement:
        "This deliberately labelled placeholder must be replaced with tested creator-authored content before launch.",
    },
    relatedIds: [
      "starter-article-easy-dinner-with-friends",
      "starter-recipe-orange-olive-oil-cake",
    ],
  },
  {
    _id: "starter-recipe-orange-olive-oil-cake",
    _type: "recipe",
    title: "Sample recipe: orange olive oil cake",
    slug: slugField("orange-olive-oil-cake"),
    editorialStage: "ready",
    privateIdeaNotes:
      "Starter content created to demonstrate the published recipe layout. Replace or revise before launch.",
    note: "Untested demonstration copy for a golden, citrusy olive oil cake.",
    imagePath: "assets/starter-content/orange-olive-oil-cake.webp",
    imageAlt:
      "A golden orange olive oil cake with one slice cut, orange zest on top and yoghurt alongside",
    featured: true,
    date: "2026-07-08",
    servings: 8,
    prep: 20,
    cook: 45,
    tags: ["Baking", "Dessert", "Weekend"],
    intro:
      "This untested sample recipe demonstrates the baking layout with a low, golden cake, plenty of orange and cold yoghurt spooned over each slice.",
    ingredients: [
      ingredientGroup("orange-olive-oil-cake", "For the cake", [
        {
          amount: "2",
          unit: "count",
          ingredient: "oranges",
          preparation:
            "finely zested, reserving 1 tsp zest, then juiced to give 120 ml juice",
        },
        { amount: "180", unit: "g", ingredient: "caster sugar" },
        { amount: "3", unit: "count", ingredient: "large eggs" },
        { amount: "120", unit: "ml", ingredient: "olive oil" },
        { amount: "200", unit: "g", ingredient: "plain flour" },
        { amount: "2", unit: "tsp", ingredient: "baking powder" },
        { amount: "0.5", unit: "tsp", ingredient: "fine sea salt" },
      ]),
      ingredientGroup("orange-olive-oil-cake", "To serve", [
        { amount: "200", unit: "g", ingredient: "thick Greek yoghurt" },
      ]),
    ],
    steps: [
      "Heat the oven to 175°C. Grease a 20 cm round cake tin and line the base with baking paper.",
      "Rub all but 1 teaspoon of the orange zest into the sugar with your fingertips until the sugar smells strongly of citrus. Whisk in the eggs for 2 minutes, until slightly thickened and pale.",
      "Whisk in the olive oil and 120 ml orange juice. Fold in the flour, baking powder and salt just until no dry pockets remain.",
      "Pour into the tin and bake for 40–45 minutes, until the cake is deep gold and a skewer pushed into the centre comes out clean. Cool in the tin for 15 minutes, then move to a rack.",
      "Let the cake settle for at least 1 hour before slicing. Serve with cold yoghurt and the reserved orange zest.",
    ],
    publicNotes: [
      "This is untested demonstration copy for the site layout. Replace it with a cooked, creator-authored recipe before launch.",
      "A peppery everyday olive oil gives the cake flavour without making it heavy; save the very expensive finishing oil for the table.",
    ],
    provenance: {
      _type: "object",
      sourceType: "other",
      sourceName: "Nibbles with Nifa starter content",
      specificContribution:
        "Original sample recipe written to demonstrate the editorial recipe format.",
      adaptationStatement:
        "This deliberately labelled placeholder must be replaced with tested creator-authored content before launch.",
    },
    relatedIds: [
      "starter-article-easy-dinner-with-friends",
      "starter-recipe-sesame-lime-aubergine-rice-bowls",
    ],
  },
];

const starterArticles = [
  {
    _id: "starter-article-market-lunch-notes",
    _type: "article",
    title: "Sample story: a market lunch",
    slug: slugField("how-i-build-a-market-lunch"),
    dek: "Demonstration copy for a loose list, one very good loaf and a lunch that takes shape along the way.",
    imagePath: "assets/starter-content/market-lunch-notes.webp",
    imageAlt:
      "A canvas market bag spilling tomatoes, basil, peaches, bread and spring onions beside a blank notebook",
    date: "2026-07-11",
    category: "city notes",
    format: "standard",
    readTime: 4,
    featured: true,
    tags: ["Markets", "Lunch", "City notes"],
    intro:
      "This sample story demonstrates the editorial layout with a simple market brief: one bag, one lunch and enough room for the thing that looks too good to leave behind.",
    sections: [
      {
        heading: "Give the day one anchor",
        body: [
          "Start with the stall, bakery or deli you would be genuinely annoyed to miss. That is the only fixed point. Everything else can happen in the order that smells best.",
          "A short list of useful gaps — something green, something for breakfast, a lemon — leaves enough room for lunch to interrupt it.",
        ],
      },
      {
        heading: "Let lunch decide the route",
        body: [
          "A ripe tomato might mean bread and a soft cheese. A pile of herbs might send the whole thing towards noodles. The trick is buying ingredients that already want to sit beside each other.",
          "By the time the bag reaches the kitchen, lunch should feel mostly assembled. Put the nicest things on a plate, dress whatever needs dressing and eat before the shopping becomes admin.",
        ],
      },
    ],
    acknowledgements: [
      "This is sample editorial copy with an AI-generated hero image, created to demonstrate the site layout.",
    ],
    permissionNotes:
      "Starter content only. Replace with a creator-authored story and owned media before launch.",
    relatedIds: [
      "starter-recipe-smoky-tomato-butter-beans",
      "starter-recipe-sesame-lime-aubergine-rice-bowls",
    ],
  },
  {
    _id: "starter-article-easy-dinner-with-friends",
    _type: "article",
    title: "Sample story: dinner before the table is ready",
    slug: slugField("dinner-before-the-table-is-ready"),
    dek: "Demonstration copy about putting the food down, tearing the bread and sharing the last five minutes.",
    imagePath: "assets/starter-content/easy-dinner-with-friends.webp",
    imageAlt:
      "Friends' hands reaching across a wooden table for shared tomato beans, salad, olives and torn bread",
    date: "2026-07-06",
    category: "hosting",
    format: "standard",
    readTime: 3,
    featured: true,
    tags: ["Hosting", "Sharing", "Dinner"],
    intro:
      "This sample story demonstrates the editorial layout with a dinner that begins before everything is finished: someone tears the bread, someone finds the forks and the first plate starts to disappear.",
    sections: [
      {
        heading: "Cook one thing that holds the room",
        body: [
          "A bubbling pan of beans, a tray of roast vegetables or a big bowl of noodles gives everyone somewhere to gather. It does not need to be impressive; it needs to be generous and easy to pass around.",
          "Add a sharp salad, bread and something cold to drink. Three clear things on the table feel more abundant than seven fussy ones waiting in the kitchen.",
        ],
      },
      {
        heading: "Leave a little work for everybody",
        body: [
          "Hosting does not need to make the room look untouched. It is much friendlier when people can see where to put the glasses and are allowed to open the bread bag themselves.",
          "The table will become ready while you eat. That is the whole point of inviting people in.",
        ],
      },
    ],
    acknowledgements: [
      "This is sample editorial copy with an AI-generated hero image, created to demonstrate the site layout.",
    ],
    permissionNotes:
      "Starter content only. Replace with a creator-authored story and owned media before launch.",
    relatedIds: [
      "starter-recipe-smoky-tomato-butter-beans",
      "starter-recipe-orange-olive-oil-cake",
    ],
  },
];

const allEntries = [...starterRecipes, ...starterArticles];

async function uploadImage(entry) {
  if (dryRun) {
    return {
      _type: "image",
      asset: { _type: "reference", _ref: `dry-run-${entry._id}` },
      alt: entry.imageAlt,
      ...(entry._type === "recipe"
        ? { credit: "AI-generated image for Nibbles with Nifa" }
        : {}),
    };
  }

  const absolutePath = path.join(root, entry.imagePath);
  const body = await fs.readFile(absolutePath);
  const asset = await client.assets.upload("image", body, {
    filename: path.basename(absolutePath),
    contentType: "image/webp",
  });

  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: entry.imageAlt,
    ...(entry._type === "recipe"
      ? { credit: "AI-generated image for Nibbles with Nifa" }
      : {}),
  };
}

async function buildDocument(entry) {
  const document = { ...entry };
  delete document.imagePath;
  delete document.imageAlt;
  delete document.relatedIds;
  if (entry._type === "article") delete document.sections;

  return {
    ...document,
    ...(entry._type === "article"
      ? {
          body: portableTextBody(entry._id, entry.sections),
        }
      : {}),
    image: await uploadImage(entry),
    relatedContent: entry.relatedIds.map(relatedReference),
  };
}

if (dryRun) {
  const documents = [];
  for (const entry of allEntries) documents.push(await buildDocument(entry));

  console.log(
    `Prepared ${starterRecipes.length} starter recipes and ${starterArticles.length} starter stories for ${projectId}/${dataset}.`,
  );
  console.log("Dry run complete. No Sanity writes were made.");
  process.exit(0);
}

async function importStarterContent() {
  const starterIds = allEntries.map(({ _id }) => _id);
  const idsToCheck = starterIds.flatMap((id) => [id, `drafts.${id}`]);
  const existingDocumentIds = new Set(
    await client.fetch(
      `*[_id in $ids]._id`,
      { ids: idsToCheck },
      { perspective: "raw" },
    ),
  );
  const entriesToCreate = allEntries.filter(
    ({ _id }) =>
      !existingDocumentIds.has(_id) &&
      !existingDocumentIds.has(`drafts.${_id}`),
  );
  const existingEntryCount = allEntries.length - entriesToCreate.length;

  if (entriesToCreate.length === 0) {
    console.log(
      `No starter content was imported. All ${allEntries.length} stable document IDs already exist and were left unchanged.`,
    );
    return;
  }

  const documents = [];
  for (const entry of entriesToCreate) {
    documents.push(await buildDocument(entry));
  }

  console.log(
    `Importing ${documents.length} new starter documents into ${projectId}/${dataset}; ${existingEntryCount} existing starter entries will be left unchanged.`,
  );

  const transaction = client.transaction();
  for (const document of documents) transaction.createIfNotExists(document);
  await transaction.commit();

  console.log(
    `Imported ${documents.length} starter documents with ${documents.length} original images. Existing starter IDs were left unchanged.`,
  );
}

try {
  await importStarterContent();
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Starter content import failed: ${message}`);
  process.exitCode = 1;
}

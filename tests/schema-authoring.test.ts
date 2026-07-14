import assert from "node:assert/strict";
import test from "node:test";
import type { DocumentActionComponent } from "sanity";

import {
  articleType,
  hideEmptyLegacySectionsForTravelEssay,
  validateTravelEssayStory,
} from "../sanity/schemaTypes/article";
import {
  recipeType,
  validateIngredientImageAlt,
} from "../sanity/schemaTypes/recipe";
import {
  publicationIssues,
  validateRecipeForPublication,
  type RecipeValidationDocument,
} from "../sanity/schemaTypes/recipeValidation";
import {
  recipePublishActionDescription,
  recipePublishState,
  resolveDocumentActions,
} from "../sanity/documentActions";

type SchemaField = {
  name: string;
  title?: string;
  group?: string | string[];
  description?: string;
  options?: { list?: { title: string; value: string }[] };
  hidden?: unknown;
};

type DocumentSchema = {
  fields: SchemaField[];
  groups?: { name: string; title: string; default?: boolean }[];
};

function schemaField(schema: DocumentSchema, name: string) {
  const field = schema.fields.find((candidate) => candidate.name === name);
  assert.ok(field, `Expected schema field ${name}`);
  return field;
}

function completeReadyRecipe(
  overrides: Partial<RecipeValidationDocument> = {},
): RecipeValidationDocument {
  return {
    editorialStage: "ready",
    title: "Ginger noodles",
    slug: { current: "ginger-noodles" },
    image: {
      asset: { _ref: "image-ginger-noodles" },
      alt: "Glossy ginger noodles in a shallow bowl",
      credit: "Photograph by Nifa Akintola",
    },
    date: "2026-07-13",
    servings: 2,
    prep: 10,
    cook: 15,
    tags: ["Dinner"],
    intro: "The noodles I make when ginger is the main event.",
    ingredients: [
      {
        group: "For the noodles",
        items: [{ amount: "200", unit: "g", ingredient: "noodles" }],
      },
    ],
    steps: ["Cook the noodles until tender with a slight bite."],
    ...overrides,
  };
}

test("recipe stages explain and enforce the private-to-public boundary", () => {
  const schema = recipeType as unknown as DocumentSchema;
  const stageField = schemaField(schema, "editorialStage");

  assert.match(stageField.description ?? "", /Ideas and Cooked drafts stay private/);
  assert.match(stageField.description ?? "", /Ready to publish/);

  for (const editorialStage of ["idea", "cookedDraft"] as const) {
    assert.equal(
      validateRecipeForPublication({ editorialStage, title: "Private work" }),
      true,
    );
    assert.deepEqual(recipePublishState({ editorialStage }), {
      canPublish: false,
      label: "Private draft",
      title:
        "Ideas and Cooked drafts stay private. Move to Ready to publish once every public field is complete.",
    });
  }

  const privateAction = recipePublishActionDescription(
    { label: "Publish", onHandle: () => undefined },
    { editorialStage: "cookedDraft" },
  );
  assert.equal(privateAction?.disabled, true);
  assert.equal(privateAction?.label, "Private draft");

  assert.equal(validateRecipeForPublication(completeReadyRecipe()), true);
  assert.deepEqual(recipePublishState({ editorialStage: "ready" }), {
    canPublish: true,
  });
});

test("the Studio replaces the normal recipe Publish action with the private-aware action", () => {
  const publishAction = Object.assign(
    (() => ({ label: "Publish" })) as DocumentActionComponent,
    { action: "publish" as const },
  );
  const discardAction = Object.assign(
    (() => ({ label: "Discard changes" })) as DocumentActionComponent,
    { action: "discardChanges" as const },
  );

  const resolved = resolveDocumentActions(
    [publishAction, discardAction],
    "recipe",
  );

  assert.notEqual(resolved[0], publishAction);
  assert.equal(resolved[0].action, "publish");
  assert.equal(resolved[1], discardAction);
  assert.deepEqual(
    resolveDocumentActions([publishAction, discardAction], "article"),
    [publishAction, discardAction],
  );
});

test("incomplete Ready recipes report every public field in editor order", () => {
  const issues = publicationIssues({ editorialStage: "ready" });

  assert.deepEqual(issues, [
    "Working title",
    "Slug",
    "Hero image",
    "Hero image — Alternative text",
    "Hero image — Image credit",
    "Publish date",
    "Yield in servings",
    "Prep minutes",
    "Cook minutes",
    "Tags",
    "Personal headnote",
    "Grouped ingredients",
    "Ordered method steps",
  ]);

  assert.equal(
    validateRecipeForPublication({ editorialStage: "ready" }),
    `Ready to publish is missing: ${issues.join(", ")}. Add every item, then publish the recipe.`,
  );
});

test("ingredient validation uses editor-facing metric and counted guidance", () => {
  const missingGroup = publicationIssues(
    completeReadyRecipe({
      ingredients: [
        {
          items: [{ amount: "1 inch", unit: "count", ingredient: "ginger" }],
        },
      ],
    }),
  );

  assert.deepEqual(missingGroup, [
    "Grouped ingredients — add a Group heading to every group",
    "Grouped ingredients — give every ingredient a metric quantity or counted amount",
  ]);
  assert.doesNotMatch(
    missingGroup.join(" "),
    /ingredient\.(?:amount|unit|ingredient)|\b(?:amount|unit|ingredient):/i,
  );

  assert.equal(
    validateRecipeForPublication(
      completeReadyRecipe({
        ingredients: [
          {
            group: "To finish",
            items: [
              { amount: "2", unit: "count", ingredient: "spring onions" },
            ],
          },
        ],
      }),
    ),
    true,
  );
});

test("authored ingredient images require authored alternative text", () => {
  assert.equal(validateIngredientImageAlt(undefined), true);
  assert.equal(
    validateIngredientImageAlt("A sliced lime on a small plate", {
      image: { asset: { _ref: "image-lime" } },
    }),
    true,
  );
  assert.equal(
    validateIngredientImageAlt(undefined, {
      image: { asset: { _ref: "image-lime" } },
    }),
    "Alternative text is required when an ingredient image is added.",
  );
});

test("article authoring follows the reader-facing editorial workflow", () => {
  const schema = articleType as unknown as DocumentSchema;

  assert.deepEqual(schema.groups, [
    { name: "overview", title: "Overview", default: true },
    { name: "travel", title: "Travel context" },
    { name: "story", title: "Story and media" },
    { name: "credits", title: "Credits and sources" },
    {
      name: "discoverability",
      title: "Discoverability and related content",
    },
  ]);

  const expectedGroups = {
    title: "overview",
    slug: "overview",
    dek: "overview",
    image: "overview",
    date: "overview",
    category: "overview",
    format: "overview",
    readTime: "overview",
    place: "travel",
    visitDate: "travel",
    factCheckDate: "travel",
    intro: "story",
    body: "story",
    travelMedia: "story",
    sections: "story",
    acknowledgements: "credits",
    sources: "credits",
    permissionNotes: "credits",
    featured: "discoverability",
    tags: "discoverability",
    seo: "discoverability",
    relatedContent: "discoverability",
  };

  for (const [name, group] of Object.entries(expectedGroups)) {
    assert.equal(schemaField(schema, name).group, group, `${name} group`);
  }

  const categoryValues = schemaField(schema, "category").options?.list;
  assert.deepEqual(categoryValues, [
    { title: "City notes", value: "city notes" },
    { title: "Hosting", value: "hosting" },
    { title: "Pantry", value: "pantry" },
    { title: "Home", value: "home" },
    { title: "Travel", value: "travel" },
  ]);

  const readerSummary = schemaField(schema, "dek");
  assert.equal(readerSummary.title, "Reader summary");
  assert.match(readerSummary.description ?? "", /readers/i);

  const story = schemaField(schema, "body");
  assert.equal(story.title, "Story");
  assert.match(story.description ?? "", /readers/i);
  assert.equal(
    validateTravelEssayStory([], "travelEssay"),
    "Add the Story before publishing a travel essay.",
  );
  assert.equal(validateTravelEssayStory([{}], "travelEssay"), true);
});

test("new travel essays hide only empty legacy sections", () => {
  assert.equal(
    hideEmptyLegacySectionsForTravelEssay({
      document: { format: "travelEssay" },
      value: undefined,
    }),
    true,
  );
  assert.equal(
    hideEmptyLegacySectionsForTravelEssay({
      document: { format: "travelEssay" },
      value: [],
    }),
    true,
  );
  assert.equal(
    hideEmptyLegacySectionsForTravelEssay({
      document: { format: "travelEssay" },
      value: [{ heading: "Existing section" }],
    }),
    false,
  );
  assert.equal(
    hideEmptyLegacySectionsForTravelEssay({
      document: { format: "standard" },
      value: undefined,
    }),
    false,
  );
});

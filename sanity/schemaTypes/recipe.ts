import { defineField, defineType } from "sanity";

import {
  formatRecipeIngredient,
  type RecipeIngredientFields,
  type RecipeIngredientUnit,
  type RecipeInspirationSource,
} from "@/lib/recipe-types";
import {
  validateRecipeForPublication,
  type RecipeValidationDocument,
} from "./recipeValidation";
import { seoField } from "./seoField";

const editorialStages = [
  {
    title: "Idea",
    value: "idea",
  },
  {
    title: "Cooked draft",
    value: "cookedDraft",
  },
  {
    title: "Ready to publish",
    value: "ready",
  },
];

const inspirationSources = [
  { title: "Person", value: "person" },
  { title: "Restaurant or food business", value: "restaurant" },
  { title: "Book or publication", value: "publication" },
  { title: "Social account", value: "social" },
  { title: "Travel or a place", value: "travel" },
  { title: "Research", value: "research" },
  { title: "Other", value: "other" },
] satisfies { title: string; value: RecipeInspirationSource }[];

const ingredientUnits = [
  { title: "grams (g)", value: "g" },
  { title: "kilograms (kg)", value: "kg" },
  { title: "millilitres (ml)", value: "ml" },
  { title: "litres (l)", value: "l" },
  { title: "teaspoons (tsp)", value: "tsp" },
  { title: "tablespoons (tbsp)", value: "tbsp" },
  { title: "counted item (no unit)", value: "count" },
] satisfies { title: string; value: RecipeIngredientUnit }[];

export const recipeType = defineType({
  name: "recipe",
  title: "Recipe",
  type: "document",
  groups: [
    { name: "capture", title: "Capture", default: true },
    { name: "provenance", title: "Inspiration & credit" },
    { name: "cook", title: "Cook & test" },
    { name: "publication", title: "Public recipe" },
    { name: "internal", title: "Internal checks" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Working title",
      type: "string",
      group: ["capture", "publication"],
      description: "A short working title is enough when first saving an idea.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "editorialStage",
      title: "Editorial stage",
      type: "string",
      group: ["capture", "cook", "publication"],
      description:
        "Ideas stay off the public site. Move to cooked draft after one full cook, then ready only when every publication check is complete.",
      options: { list: editorialStages, layout: "radio" },
      initialValue: "idea",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "privateIdeaNotes",
      title: "Private idea notes",
      type: "text",
      rows: 4,
      group: "capture",
      description:
        "Capture the thought while it is fresh. These notes are never sent to the public site.",
    }),
    defineField({
      name: "provenance",
      title: "Inspiration and provenance",
      type: "object",
      group: "provenance",
      description:
        "Record only what is known. Leave a field blank rather than filling a gap from memory.",
      fields: [
        defineField({
          name: "sourceType",
          title: "Source type",
          type: "string",
          options: { list: inspirationSources },
        }),
        defineField({
          name: "sourceName",
          title: "Source name",
          type: "string",
          description:
            "The person, restaurant, book, publication, account, place, or other source.",
        }),
        defineField({
          name: "sourceUrl",
          title: "Source link",
          type: "url",
          validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
        }),
        defineField({
          name: "specificContribution",
          title: "What this source contributed",
          type: "text",
          rows: 3,
          description:
            "Name the specific technique, flavour combination, memory, or other contribution.",
        }),
        defineField({
          name: "placeOrCulturalLane",
          title: "Place or cultural lane",
          type: "string",
          description:
            "Be as precise as the evidence allows; do not broaden a personal influence into a claim about a whole cuisine.",
        }),
        defineField({
          name: "adaptationStatement",
          title: "How Nifa adapted it",
          type: "text",
          rows: 3,
          description:
            "Explain what changed and avoid presenting an adaptation as a definitive traditional recipe.",
        }),
        defineField({
          name: "credit",
          title: "Public credit or thanks",
          type: "text",
          rows: 2,
        }),
        defineField({
          name: "permissionNotes",
          title: "Private permission notes",
          type: "text",
          rows: 3,
          description:
            "Record what may be named, quoted, or pictured. This field is never sent to the public site.",
        }),
      ],
    }),
    defineField({
      name: "cookTest",
      title: "Completed cook checks",
      type: "object",
      group: "cook",
      description:
        "Tick these only after cooking the complete recipe and correcting the written recipe to match.",
      fields: [
        defineField({
          name: "completedCook",
          title: "One full cook is complete",
          type: "boolean",
          initialValue: false,
        }),
        defineField({
          name: "quantitiesCorrected",
          title: "Written quantities were corrected",
          type: "boolean",
          initialValue: false,
        }),
        defineField({
          name: "timingsCorrected",
          title: "Prep and cook timings were corrected",
          type: "boolean",
          initialValue: false,
        }),
        defineField({
          name: "yieldCorrected",
          title: "Yield was corrected",
          type: "boolean",
          initialValue: false,
        }),
      ],
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "publication",
      options: { source: "title", maxLength: 96 },
    }),
    defineField({
      name: "note",
      title: "Card note",
      type: "string",
      group: "publication",
    }),
    defineField({
      name: "image",
      title: "Hero image",
      type: "image",
      group: "publication",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description:
            "Describe the finished dish and useful visual detail without starting with ‘image of’.",
        }),
        defineField({
          name: "credit",
          title: "Image credit",
          type: "string",
          description: "Name the photographer or source of the owned image.",
        }),
      ],
    }),
    defineField({
      name: "featured",
      title: "Featured on home",
      type: "boolean",
      group: "publication",
      initialValue: false,
    }),
    defineField({
      name: "date",
      title: "Publish date",
      type: "date",
      group: "publication",
    }),
    defineField({
      name: "servings",
      title: "Yield in servings",
      type: "number",
      group: "publication",
      validation: (rule) => rule.min(1).integer(),
    }),
    defineField({
      name: "prep",
      title: "Prep minutes",
      type: "number",
      group: "publication",
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: "cook",
      title: "Cook minutes",
      type: "number",
      group: "publication",
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "publication",
      of: [{ type: "string" }],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "intro",
      title: "Personal headnote",
      type: "text",
      rows: 5,
      group: "publication",
      description:
        "Tell the lived story in Nifa's voice. Do not replace missing experience with generic copy.",
    }),
    defineField({
      name: "ingredients",
      title: "Grouped ingredients",
      type: "array",
      group: ["cook", "publication"],
      description:
        "Start each line with a metric quantity or a counted amount, for example ‘300 g rice’ or ‘2 spring onions’.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "group",
              title: "Group heading",
              type: "string",
            }),
            defineField({
              name: "items",
              title: "Items",
              type: "array",
              of: [
                {
                  name: "ingredientItem",
                  title: "Ingredient",
                  type: "object",
                  fields: [
                    defineField({
                      name: "amount",
                      title: "Amount",
                      type: "string",
                      description: "Use a number, decimal, range, or fraction.",
                    }),
                    defineField({
                      name: "unit",
                      title: "Unit",
                      type: "string",
                      options: { list: ingredientUnits },
                    }),
                    defineField({
                      name: "ingredient",
                      title: "Ingredient",
                      type: "string",
                      description:
                        "Name the ingredient without repeating the amount or unit.",
                    }),
                    defineField({
                      name: "preparation",
                      title: "Preparation",
                      type: "string",
                      description:
                        "Optional, for example ‘finely grated’ or ‘drained’.",
                    }),
                    defineField({
                      name: "text",
                      title: "Legacy ingredient line",
                      type: "string",
                      description:
                        "Older recipes may contain a complete line here. Move it into the structured fields above before marking the recipe ready.",
                    }),
                    defineField({
                      name: "image",
                      title: "Ingredient image",
                      type: "image",
                      description:
                        "Upload a small ingredient photo on a white background.",
                      options: { hotspot: true },
                    }),
                    defineField({
                      name: "alt",
                      title: "Image alt text",
                      type: "string",
                      description:
                        "Optional. Defaults to the ingredient text if left empty.",
                    }),
                  ],
                  preview: {
                    select: {
                      amount: "amount",
                      unit: "unit",
                      ingredient: "ingredient",
                      preparation: "preparation",
                      text: "text",
                      media: "image",
                    },
                    prepare({
                      amount,
                      unit,
                      ingredient,
                      preparation,
                      text,
                      media,
                    }) {
                      const measurement = formatRecipeIngredient({
                        amount,
                        unit,
                        ingredient,
                        preparation,
                      } as RecipeIngredientFields);

                      return {
                        title: measurement || text || "Incomplete ingredient",
                        media,
                      };
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { title: "group", items: "items" },
            prepare({ title, items }) {
              return {
                title: title || "Ingredient group",
                subtitle: Array.isArray(items) ? `${items.length} items` : "",
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "steps",
      title: "Ordered method steps",
      type: "array",
      group: ["cook", "publication"],
      description:
        "Use observable cues for colour, texture, sound, heat, or doneness where they help the reader.",
      of: [{ type: "text" }],
    }),
    defineField({
      name: "publicNotes",
      title: "Candid recipe notes",
      type: "array",
      group: "publication",
      description:
        "Optional judgement learned from the completed cook. Be candid without contradicting the core recipe.",
      of: [{ type: "text" }],
    }),
    seoField("publication"),
    defineField({
      name: "testedSubstitutions",
      title: "Tested substitutions",
      type: "array",
      group: "publication",
      description:
        "Only add substitutions actually used in a completed cook. These notes appear publicly.",
      of: [{ type: "text" }],
    }),
    defineField({
      name: "verificationNotes",
      title: "Claims to verify",
      type: "object",
      group: "internal",
      description:
        "Keep uncertain guidance here while checking it. Nothing in this section is sent to the public site.",
      fields: [
        defineField({
          name: "untestedSubstitutions",
          title: "Untested substitution ideas",
          type: "array",
          of: [{ type: "text" }],
        }),
        defineField({
          name: "storageGuidance",
          title: "Storage guidance to verify",
          type: "text",
          rows: 3,
        }),
        defineField({
          name: "allergenClaims",
          title: "Allergen claims to verify",
          type: "text",
          rows: 3,
        }),
        defineField({
          name: "foodSafetyGuidance",
          title: "Food-safety guidance to verify",
          type: "text",
          rows: 3,
        }),
      ],
    }),
  ],
  validation: (rule) =>
    rule.custom((document) =>
      validateRecipeForPublication(document as RecipeValidationDocument),
    ),
  preview: {
    select: { title: "title", stage: "editorialStage", media: "image" },
    prepare({ title, stage, media }) {
      const stageTitle = editorialStages.find(
        ({ value }) => value === stage,
      )?.title;

      return {
        title: title || "Untitled recipe idea",
        subtitle: stageTitle ?? "Stage not set",
        media,
      };
    },
  },
});

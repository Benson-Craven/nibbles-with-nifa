import { defineField, defineType } from "sanity";

export const recipeType = defineType({
  name: "recipe",
  title: "Recipe",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "note",
      title: "Card note",
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured on home",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "date",
      title: "Publish date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "servings", title: "Servings", type: "number" }),
    defineField({ name: "prep", title: "Prep minutes", type: "number" }),
    defineField({ name: "cook", title: "Cook minutes", type: "number" }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "intro", title: "Intro", type: "text" }),
    defineField({
      name: "ingredients",
      title: "Ingredients",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "group", title: "Group heading", type: "string" },
            {
              name: "items",
              title: "Items",
              type: "array",
              of: [
                {
                  name: "ingredientItem",
                  title: "Ingredient",
                  type: "object",
                  fields: [
                    {
                      name: "text",
                      title: "Ingredient text",
                      type: "string",
                      validation: (rule) => rule.required(),
                    },
                    {
                      name: "image",
                      title: "Ingredient image",
                      type: "image",
                      description:
                        "Upload a small ingredient photo on a white background.",
                      options: { hotspot: true },
                    },
                    {
                      name: "alt",
                      title: "Image alt text",
                      type: "string",
                      description:
                        "Optional. Defaults to the ingredient text if left empty.",
                    },
                  ],
                  preview: {
                    select: {
                      title: "text",
                      media: "image",
                    },
                  },
                },
              ],
            },
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
      title: "Method steps",
      type: "array",
      of: [{ type: "text" }],
    }),
  ],
});

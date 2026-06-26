import { defineField, defineType } from "sanity";

const articleCategories = [
  { title: "City notes", value: "city notes" },
  { title: "Hosting", value: "hosting" },
  { title: "Pantry", value: "pantry" },
  { title: "Home", value: "home" },
];

export const articleType = defineType({
  name: "article",
  title: "Article",
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
      name: "dek",
      title: "Deck",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      title: "Publish date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: articleCategories, layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "readTime",
      title: "Read time in minutes",
      type: "number",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "heading",
              title: "Heading",
              type: "string",
              validation: (rule) => rule.required(),
            },
            {
              name: "body",
              title: "Paragraphs",
              type: "array",
              of: [{ type: "text" }],
              validation: (rule) => rule.required(),
            },
          ],
        },
      ],
    }),
    defineField({
      name: "relatedRecipes",
      title: "Related recipes",
      type: "array",
      of: [{ type: "reference", to: [{ type: "recipe" }] }],
    }),
    defineField({
      name: "relatedProducts",
      title: "Related products",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({
      name: "relatedKitchenItems",
      title: "Related kitchen items",
      type: "array",
      of: [{ type: "reference", to: [{ type: "kitchenItem" }] }],
    }),
  ],
});

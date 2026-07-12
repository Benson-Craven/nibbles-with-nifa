import { defineField, defineType } from "sanity";

export const kitchenItemType = defineType({
  name: "kitchenItem",
  title: "Kitchen item",
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
      name: "blurb",
      title: "Blurb",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description: "Describe the tool and useful visible detail.",
          validation: (rule) => rule.required().min(10),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "affiliateUrl",
      title: "Affiliate URL",
      type: "url",
    }),
  ],
});

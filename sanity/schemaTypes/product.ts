import { defineField, defineType } from "sanity";

const productCategories = [
  { title: "Home", value: "home" },
  { title: "Gift", value: "gift" },
  { title: "Host", value: "host" },
  { title: "Wine", value: "wine" },
  { title: "Goods", value: "goods" },
];

export const productType = defineType({
  name: "product",
  title: "Product",
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
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "price", title: "Price", type: "string" }),
    defineField({
      name: "externalUrl",
      title: "External URL",
      type: "url",
      description: "Use when this item should link out instead of pretending to checkout.",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: productCategories, layout: "radio" },
      validation: (rule) => rule.required(),
    }),
  ],
});

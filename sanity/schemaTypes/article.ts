import { defineField, defineType } from "sanity";

const articleCategories = [
  { title: "City notes", value: "city notes" },
  { title: "Hosting", value: "hosting" },
  { title: "Pantry", value: "pantry" },
  { title: "Home", value: "home" },
];

const articleFormats = [
  { title: "Standard article", value: "standard" },
  { title: "Travel essay", value: "travelEssay" },
];

const hideForStandardArticle = ({ parent }: { parent?: { format?: string } }) =>
  parent?.format !== "travelEssay";

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
      name: "format",
      title: "Article format",
      type: "string",
      description:
        "Choose travel essay for a story built around a specific route, day, neighbourhood, or idea.",
      options: { list: articleFormats, layout: "radio" },
      initialValue: "standard",
    }),
    defineField({
      name: "place",
      title: "Place",
      type: "string",
      description:
        "Name the specific city, neighbourhood, route, or setting at the centre of the essay.",
      hidden: hideForStandardArticle,
      validation: (rule) =>
        rule.custom((value, context) =>
          context.document?.format !== "travelEssay" ||
          (typeof value === "string" && value.trim())
            ? true
            : "Add the specific place before publishing a travel essay.",
        ),
    }),
    defineField({
      name: "visitDate",
      title: "Visit date",
      type: "date",
      description: "When the lived scenes in this essay took place.",
      hidden: hideForStandardArticle,
      validation: (rule) =>
        rule.custom((value, context) =>
          context.document?.format !== "travelEssay" ||
          (typeof value === "string" && value)
            ? true
            : "Add the visit date before publishing a travel essay.",
        ),
    }),
    defineField({
      name: "factCheckDate",
      title: "Last fact-check date",
      type: "date",
      description:
        "When opening times, prices, access, and other changing details were last checked.",
      hidden: hideForStandardArticle,
      validation: (rule) =>
        rule.custom((value, context) =>
          context.document?.format !== "travelEssay" ||
          (typeof value === "string" && value)
            ? true
            : "Add the last fact-check date before publishing a travel essay.",
        ),
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
      name: "body",
      title: "Editorial body",
      type: "array",
      description:
        "Write the essay in sequence using paragraphs, headings, links, and occasional pull quotes.",
      of: [
        {
          type: "block",
          styles: [
            { title: "Paragraph", value: "normal" },
            { title: "Heading", value: "h2" },
            { title: "Subheading", value: "h3" },
            { title: "Pull quote", value: "blockquote" },
          ],
          lists: [],
          marks: {
            decorators: [],
            annotations: [
              {
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  {
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (rule) =>
                      rule.required().uri({
                        scheme: ["http", "https", "mailto"],
                      }),
                  },
                ],
              },
            ],
          },
        },
      ],
      validation: (rule) =>
        rule.custom((value, context) =>
          context.document?.format !== "travelEssay" ||
          (Array.isArray(value) && value.length > 0)
            ? true
            : "Add an editorial body before publishing a travel essay.",
        ),
    }),
    defineField({
      name: "sections",
      title: "Legacy sections",
      type: "array",
      description:
        "Existing articles can continue using these sections. For new work, use the editorial body above.",
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
      name: "acknowledgements",
      title: "Public acknowledgements",
      type: "array",
      description:
        "Publishable thanks or credits for people who helped shape the essay. These appear on the public page.",
      of: [{ type: "text", rows: 2 }],
    }),
    defineField({
      name: "sources",
      title: "Public sources",
      type: "array",
      description:
        "Relevant sources readers may need for factual or time-sensitive context.",
      of: [
        {
          name: "articleSource",
          title: "Source",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Source title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              title: "Source URL",
              type: "url",
              validation: (rule) =>
                rule.uri({ scheme: ["http", "https"] }),
            }),
          ],
          preview: { select: { title: "title", subtitle: "url" } },
        },
      ],
    }),
    defineField({
      name: "permissionNotes",
      title: "Internal permission notes",
      type: "text",
      rows: 4,
      description:
        "Record naming, quotation, or photography permissions for editorial reference. This field is never sent to the public site.",
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

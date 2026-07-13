import { defineField, defineType } from "sanity";
import { seoField } from "./seoField";
import { relatedContentFields } from "./relatedContentFields";
import {
  editorialTagOptions,
  validateEditorialTags,
} from "@/lib/editorial-tags";

const articleCategories = [
  { title: "City notes", value: "city notes" },
  { title: "Hosting", value: "hosting" },
  { title: "Pantry", value: "pantry" },
  { title: "Home", value: "home" },
  { title: "Travel", value: "travel" },
];

const articleFormats = [
  { title: "Standard article", value: "standard" },
  { title: "Travel essay", value: "travelEssay" },
];

const hideForStandardArticle = ({ parent }: { parent?: { format?: string } }) =>
  parent?.format !== "travelEssay";

export function hideEmptyLegacySectionsForTravelEssay({
  document,
  value,
}: {
  document?: unknown;
  value?: unknown;
}) {
  const format =
    document && typeof document === "object"
      ? (document as { format?: unknown }).format
      : undefined;

  return (
    format === "travelEssay" &&
    (!Array.isArray(value) || value.length === 0)
  );
}

export function validateTravelEssayStory(value: unknown, format: unknown) {
  return format !== "travelEssay" || (Array.isArray(value) && value.length > 0)
    ? true
    : "Add the Story before publishing a travel essay.";
}

export const articleType = defineType({
  name: "article",
  title: "Article",
  type: "document",
  groups: [
    { name: "overview", title: "Overview", default: true },
    { name: "travel", title: "Travel context" },
    { name: "story", title: "Story and media" },
    { name: "credits", title: "Credits and sources" },
    {
      name: "discoverability",
      title: "Discoverability and related content",
    },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "overview",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "overview",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "dek",
      title: "Reader summary",
      type: "text",
      group: "overview",
      rows: 2,
      description:
        "Write one or two sentences readers will see on article cards and beneath the title.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Hero image",
      type: "image",
      group: "overview",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description:
            "Describe the meaningful scene or object without starting with ‘image of’.",
          validation: (rule) => rule.required().min(10),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      title: "Publish date",
      type: "date",
      group: "overview",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      group: "overview",
      options: { list: articleCategories, layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "format",
      title: "Article format",
      type: "string",
      group: "overview",
      description:
        "Choose travel essay for a story built around a specific route, day, neighbourhood, or idea.",
      options: { list: articleFormats, layout: "radio" },
      initialValue: "standard",
    }),
    defineField({
      name: "place",
      title: "Place",
      type: "string",
      group: "travel",
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
      group: "travel",
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
      group: "travel",
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
      group: "overview",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "featured",
      title: "Featured on home",
      type: "boolean",
      group: "discoverability",
      initialValue: false,
      description:
        "Featured published articles can appear in the home-page editorial modules.",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "discoverability",
      description:
        "Choose a few specific reusable tags. Keep this list small; add a new option only when Nifa's published work needs it repeatedly.",
      of: [{ type: "string", options: { list: editorialTagOptions } }],
      validation: (rule) => rule.custom(validateEditorialTags),
    }),
    defineField({
      name: "intro",
      title: "Opening paragraph",
      type: "text",
      group: "story",
      description:
        "Open the story in Nifa's voice. Readers see this before the main story.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Story",
      type: "array",
      group: "story",
      description:
        "Write the story in the order readers should experience it, using paragraphs, headings, links, and occasional pull quotes.",
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
          validateTravelEssayStory(value, context.document?.format),
        ),
    }),
    defineField({
      name: "travelMedia",
      title: "Ordered travel media",
      type: "array",
      group: "story",
      description:
        "Arrange web-ready images and short videos in the order readers should encounter them. Sanity holds published web copies, not your original masters.",
      hidden: hideForStandardArticle,
      of: [
        {
          name: "travelImage",
          title: "Image",
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "alt",
              title: "Alternative text",
              type: "string",
              description:
                "Describe the meaningful visual detail for someone who cannot see the image.",
              validation: (rule) => rule.required().min(10),
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "text",
              rows: 2,
            }),
            defineField({
              name: "credit",
              title: "Credit",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "caption", subtitle: "credit", media: "image" },
            prepare({ title, subtitle, media }) {
              return { title: title || "Travel image", subtitle, media };
            },
          },
        },
        {
          name: "travelVideo",
          title: "Short video",
          type: "object",
          fields: [
            defineField({
              name: "video",
              title: "Web-ready MP4",
              type: "file",
              description:
                "Upload a short, compressed 1080p MP4 exported for the web. Keep the original master in your own backup storage.",
              options: { accept: "video/mp4" },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "text",
              rows: 2,
              description:
                "Explain the editorial point so the clip does not depend on autoplay or sound.",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "aspectRatio",
              title: "Video frame",
              type: "string",
              description:
                "Choose the frame that matches the exported clip so the page can reserve its space before loading.",
              options: {
                list: [
                  { title: "Landscape (16:9)", value: "landscape" },
                  { title: "Portrait (9:16)", value: "portrait" },
                  { title: "Square (1:1)", value: "square" },
                ],
                layout: "radio",
              },
              initialValue: "landscape",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "credit",
              title: "Credit",
              type: "string",
            }),
            defineField({
              name: "speechConveysMeaning",
              title: "Speech conveys meaning",
              type: "boolean",
              description:
                "Turn this on when readers need spoken words to understand the clip.",
              initialValue: false,
            }),
            defineField({
              name: "transcript",
              title: "Transcript",
              type: "text",
              rows: 5,
              description:
                "Provide the meaningful spoken words or an equivalent text description.",
              validation: (rule) =>
                rule.custom((value, context) => {
                  const parent = context.parent as {
                    speechConveysMeaning?: boolean;
                  };

                  return !parent?.speechConveysMeaning ||
                    (typeof value === "string" && value.trim())
                    ? true
                    : "Add a transcript when speech conveys meaning.";
                }),
            }),
          ],
          preview: {
            select: { title: "caption", subtitle: "credit" },
            prepare({ title, subtitle }) {
              return { title: title || "Travel video", subtitle };
            },
          },
        },
      ],
    }),
    defineField({
      name: "sections",
      title: "Legacy sections",
      type: "array",
      group: "story",
      description:
        "Existing articles can continue using these sections. For new work, use Story above.",
      hidden: hideEmptyLegacySectionsForTravelEssay,
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
      group: "credits",
      description:
        "Publishable thanks or credits for people who helped shape the essay. These appear on the public page.",
      of: [{ type: "text", rows: 2 }],
    }),
    defineField({
      name: "sources",
      title: "Public sources",
      type: "array",
      group: "credits",
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
      group: "credits",
      rows: 4,
      description:
        "Record naming, quotation, or photography permissions for editorial reference. This field is never sent to the public site.",
    }),
    seoField("discoverability"),
    ...relatedContentFields("discoverability"),
  ],
});

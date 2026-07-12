import { defineField } from "sanity";

export function seoField(group?: string) {
  return defineField({
    name: "seo",
    title: "Search and sharing",
    type: "object",
    group,
    description:
      "Optional overrides for search results and shared links. Leave blank to reuse the public title, summary, and hero image.",
    fields: [
      defineField({
        name: "title",
        title: "SEO title",
        type: "string",
        description: "Defaults to the public title.",
      }),
      defineField({
        name: "description",
        title: "Meta description",
        type: "text",
        rows: 3,
        description: "Defaults to the public note or deck.",
      }),
      defineField({
        name: "image",
        title: "Social-sharing image",
        type: "image",
        options: { hotspot: true },
        description: "Defaults to the public hero image.",
      }),
    ],
  });
}

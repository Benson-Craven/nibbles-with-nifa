import { defineField, defineType } from "sanity";

const socialPlatforms = [
  { title: "Instagram", value: "instagram" },
  { title: "TikTok", value: "tiktok" },
  { title: "YouTube", value: "youtube" },
  { title: "Pinterest", value: "pinterest" },
  { title: "Website", value: "website" },
];

export const creatorProfileType = defineType({
  name: "creatorProfile",
  title: "Creator profile",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Public name",
      type: "string",
      description: "The name shown on every published recipe and article.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "biography",
      title: "Biography",
      type: "text",
      rows: 4,
      description:
        "A short public introduction written in your first-person voice. Leave blank until the wording is ready.",
    }),
    defineField({
      name: "portrait",
      title: "Portrait",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description:
            "Briefly describe yourself and the setting in the portrait.",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      of: [
        {
          name: "socialLink",
          title: "Social link",
          type: "object",
          fields: [
            defineField({
              name: "platform",
              title: "Platform",
              type: "string",
              options: { list: socialPlatforms, layout: "dropdown" },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              title: "Profile URL",
              type: "url",
              validation: (rule) =>
                rule.required().uri({ scheme: ["http", "https"] }),
            }),
          ],
          preview: {
            select: { platform: "platform", url: "url" },
            prepare({ platform, url }) {
              const label = socialPlatforms.find(
                ({ value }) => value === platform,
              )?.title;
              return { title: label ?? "Social link", subtitle: url };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "name", media: "portrait" },
  },
});

import { defineField } from "sanity";

export function relatedContentFields(group?: string) {
  return [
    defineField({
      name: "relatedContent",
      title: "Related content",
      type: "array",
      group,
      description:
        "Build an intentional next-reading journey. Mix articles, recipes, products, and kitchen items in the exact order readers should see them.",
      of: [
        {
          type: "reference",
          to: [
            { type: "article" },
            { type: "recipe" },
            { type: "product" },
            { type: "kitchenItem" },
          ],
        },
      ],
      validation: (rule) => rule.unique(),
    }),
  ];
}

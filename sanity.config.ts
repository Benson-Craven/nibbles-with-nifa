import { defineConfig } from "sanity";
import {
  defineDocuments,
  defineLocations,
  presentationTool,
} from "sanity/presentation";
import { structureTool } from "sanity/structure";

import { dataset, studioProjectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

const singletonActions = new Set(["publish", "discardChanges", "restore"]);
const singletonTypes = new Set(["creatorProfile"]);
const previewUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SANITY_STUDIO_PREVIEW_URL ||
  "http://localhost:3000";

const mainDocuments = defineDocuments([
  {
    route: "/recipes/:slug",
    filter: '_type == "recipe" && slug.current == $slug',
  },
  {
    route: "/articles/:slug",
    filter:
      '_type == "article" && format == "travelEssay" && slug.current == $slug',
  },
]);

const locations = {
  recipe: defineLocations({
    select: { title: "title", slug: "slug.current" },
    resolve: (document) => ({
      locations: document?.slug
        ? [
            {
              title: document.title || "Untitled recipe",
              href: `/recipes/${document.slug}`,
            },
            { title: "Recipe index", href: "/recipes" },
          ]
        : [{ title: "Recipe index", href: "/recipes" }],
    }),
  }),
  article: defineLocations({
    select: {
      format: "format",
      title: "title",
      slug: "slug.current",
    },
    resolve: (document) => ({
      locations:
        document?.format !== "travelEssay"
          ? []
          : document.slug
            ? [
                {
                  title: document.title || "Untitled article",
                  href: `/articles/${document.slug}`,
                },
                { title: "Article index", href: "/articles" },
              ]
            : [{ title: "Article index", href: "/articles" }],
    }),
  }),
};

export default defineConfig({
  name: "default",
  title: "Nibbles with Nifa",
  projectId: studioProjectId,
  dataset,
  basePath: process.env.SANITY_STUDIO_BASEPATH || "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .id("creatorProfile")
              .title("Creator profile")
              .child(
                S.document()
                  .schemaType("creatorProfile")
                  .documentId("creatorProfile"),
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (listItem) => listItem.getId() !== "creatorProfile",
            ),
          ]),
    }),
    presentationTool({
      previewUrl: {
        initial: previewUrl,
        previewMode: {
          enable: "/api/draft-mode/enable",
          disable: "/api/draft-mode/disable",
          shareAccess: false,
        },
      },
      resolve: { locations, mainDocuments },
    }),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    actions: (previousActions, context) =>
      singletonTypes.has(context.schemaType)
        ? previousActions.filter(
            ({ action }) => action && singletonActions.has(action),
          )
        : previousActions,
    newDocumentOptions: (previousOptions) =>
      previousOptions.filter(
        ({ templateId }) => !singletonTypes.has(templateId),
      ),
  },
});

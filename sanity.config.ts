import { defineConfig } from "sanity";
import {
  defineDocuments,
  presentationTool,
} from "sanity/presentation";
import { structureTool } from "sanity/structure";

import {
  isSingletonType,
  resolveDocumentActions,
} from "./sanity/documentActions";
import { dataset, studioProjectId } from "./sanity/env";
import {
  presentationLocations,
} from "./sanity/presentation-locations";
import { resolvePresentationOrigin } from "./sanity/preview-origin";
import { schemaTypes } from "./sanity/schemaTypes";

const previewUrl = resolvePresentationOrigin();

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
      resolve: { locations: presentationLocations, mainDocuments },
    }),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    actions: (previousActions, context) =>
      resolveDocumentActions(previousActions, context.schemaType),
    newDocumentOptions: (previousOptions) =>
      previousOptions.filter(
        ({ templateId }) => !isSingletonType(templateId),
      ),
  },
});

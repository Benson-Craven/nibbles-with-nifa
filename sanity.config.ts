import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { dataset, studioProjectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

const singletonActions = new Set(["publish", "discardChanges", "restore"]);
const singletonTypes = new Set(["creatorProfile"]);

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

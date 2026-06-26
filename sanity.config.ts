import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { dataset, studioProjectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

export default defineConfig({
  name: "default",
  title: "Nibbles with Nifa",
  projectId: studioProjectId,
  dataset,
  basePath: process.env.SANITY_STUDIO_BASEPATH || "/studio",
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});

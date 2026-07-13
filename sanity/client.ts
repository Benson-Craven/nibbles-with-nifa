import { createClient } from "next-sanity";

import { apiVersion, dataset, studioProjectId } from "./env";

export const client = createClient({
  projectId: studioProjectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: {
    enabled: false,
    studioUrl: "/studio",
  },
});

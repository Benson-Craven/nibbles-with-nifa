import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "t03519e6",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  },
  deployment: {
    appId: "a9xcqpze9pvup63hy9n5lz4l",
  },
});

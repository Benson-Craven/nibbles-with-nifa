export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-06-26";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "t03519e6";

export const hasSanityEnv = Boolean(projectId);
export const studioProjectId = projectId;

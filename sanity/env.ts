type SanityEnvironmentVariable =
  | "SANITY_STUDIO_PROJECT_ID"
  | "SANITY_STUDIO_DATASET"
  | "SANITY_STUDIO_API_VERSION"
  | "NEXT_PUBLIC_SANITY_PROJECT_ID"
  | "NEXT_PUBLIC_SANITY_DATASET"
  | "NEXT_PUBLIC_SANITY_API_VERSION";

type SanityEnvironment = Partial<Record<SanityEnvironmentVariable, string>>;

export function resolveSanityEnvironment(environment: SanityEnvironment) {
  return {
    apiVersion:
      environment.SANITY_STUDIO_API_VERSION?.trim() ||
      environment.NEXT_PUBLIC_SANITY_API_VERSION?.trim() ||
      "2026-06-26",
    dataset:
      environment.SANITY_STUDIO_DATASET?.trim() ||
      environment.NEXT_PUBLIC_SANITY_DATASET?.trim() ||
      "production",
    projectId:
      environment.SANITY_STUDIO_PROJECT_ID?.trim() ||
      environment.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() ||
      "t03519e6",
  };
}

const sanityEnvironment = resolveSanityEnvironment({
  SANITY_STUDIO_PROJECT_ID: process.env.SANITY_STUDIO_PROJECT_ID,
  SANITY_STUDIO_DATASET: process.env.SANITY_STUDIO_DATASET,
  SANITY_STUDIO_API_VERSION: process.env.SANITY_STUDIO_API_VERSION,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
});

export const { apiVersion, dataset, projectId } = sanityEnvironment;

export const hasSanityEnv = Boolean(projectId);
export const studioProjectId = projectId;

const LOCAL_PREVIEW_ORIGIN = "http://localhost:3000";

type PreviewOriginVariable =
  | "SANITY_STUDIO_PREVIEW_URL"
  | "NEXT_PUBLIC_VERCEL_URL"
  | "NEXT_PUBLIC_SITE_URL";

export type PreviewOriginEnvironment = Partial<
  Record<PreviewOriginVariable, string>
>;

function normalizeOrigin(
  value: string,
  variableName: PreviewOriginVariable,
  defaultProtocol = "",
) {
  const candidate = value.includes("://")
    ? value
    : `${defaultProtocol}${value}`;

  try {
    const url = new URL(candidate);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("unsupported protocol");
    }

    return url.origin;
  } catch {
    throw new Error(`${variableName} must contain a valid HTTP(S) origin.`);
  }
}

export function resolvePresentationOrigin(
  environment: PreviewOriginEnvironment,
) {
  const hostedStudioOrigin = environment.SANITY_STUDIO_PREVIEW_URL?.trim();
  if (hostedStudioOrigin) {
    return normalizeOrigin(
      hostedStudioOrigin,
      "SANITY_STUDIO_PREVIEW_URL",
    );
  }

  const vercelDeploymentOrigin = environment.NEXT_PUBLIC_VERCEL_URL?.trim();
  if (vercelDeploymentOrigin) {
    return normalizeOrigin(
      vercelDeploymentOrigin,
      "NEXT_PUBLIC_VERCEL_URL",
      "https://",
    );
  }

  const configuredSiteOrigin = environment.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredSiteOrigin) {
    return normalizeOrigin(configuredSiteOrigin, "NEXT_PUBLIC_SITE_URL");
  }

  return LOCAL_PREVIEW_ORIGIN;
}

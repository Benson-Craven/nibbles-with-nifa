import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { withoutSecretSearchParams } from "@sanity/preview-url-secret/without-secret-search-params";
import { cookies, draftMode } from "next/headers";
import { NextResponse } from "next/server";

import { client } from "@/sanity/client";

type PreviewValidation = {
  isValid: boolean;
  redirectTo?: string;
};

type EnableDraftModeHandlerOptions = {
  validate: (request: Request) => Promise<PreviewValidation>;
  enable: () => Promise<void>;
};

function safePreviewPath(redirectTo: string | undefined, requestUrl: string) {
  const requestOrigin = new URL(requestUrl).origin;
  const destination = withoutSecretSearchParams(
    new URL(redirectTo || "/", requestUrl),
  );

  if (destination.origin !== requestOrigin) return "/";

  return `${destination.pathname}${destination.search}${destination.hash}`;
}

export function createEnableDraftModeHandler({
  validate,
  enable,
}: EnableDraftModeHandlerOptions) {
  return async function enableDraftMode(request: Request) {
    let validation: PreviewValidation;

    try {
      validation = await validate(request);
    } catch {
      return new Response("Invalid secret", { status: 401 });
    }

    if (!validation.isValid) {
      return new Response("Invalid secret", { status: 401 });
    }

    await enable();
    return NextResponse.redirect(
      new URL(safePreviewPath(validation.redirectTo, request.url), request.url),
    );
  };
}

async function enableNextDraftMode() {
  const draftModeStore = await draftMode();
  if (!draftModeStore.isEnabled) draftModeStore.enable();

  const isSecure = process.env.NODE_ENV === "production";
  const cookieStore = await cookies();
  const bypassCookie = cookieStore.get("__prerender_bypass");
  if (!bypassCookie) return;

  cookieStore.set({
    name: bypassCookie.name,
    value: bypassCookie.value,
    httpOnly: true,
    path: "/",
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
  });
}

export async function GET(request: Request) {
  const readToken = process.env.SANITY_API_READ_TOKEN;

  if (!readToken?.trim()) {
    return new Response(
      "Draft preview is not configured. Set SANITY_API_READ_TOKEN and restart the app.",
      { status: 503 },
    );
  }

  return createEnableDraftModeHandler({
    validate: async (previewRequest) =>
      validatePreviewUrl(
        client.withConfig({ token: readToken }),
        previewRequest.url,
      ),
    enable: enableNextDraftMode,
  })(request);
}

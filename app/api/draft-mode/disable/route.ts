import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

function safeReturnPath(request: Request) {
  const requestUrl = new URL(request.url);
  const returnTo = requestUrl.searchParams.get("returnTo");

  if (
    !returnTo?.startsWith("/") ||
    returnTo.startsWith("//") ||
    returnTo.includes("\\")
  ) {
    return "/";
  }

  const destination = new URL(returnTo, requestUrl.origin);
  return destination.origin === requestUrl.origin
    ? `${destination.pathname}${destination.search}${destination.hash}`
    : "/";
}

export function createDisableDraftModeHandler(
  disable: () => Promise<void> = async () => {
    (await draftMode()).disable();
  },
) {
  return async function disableDraftMode(request: Request) {
    await disable();
    return NextResponse.redirect(
      new URL(safeReturnPath(request), new URL(request.url).origin),
    );
  };
}

export const GET = createDisableDraftModeHandler();

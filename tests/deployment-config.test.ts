import assert from "node:assert/strict";
import test from "node:test";

import { resolvePresentationOrigin } from "../sanity/preview-origin";

test("Presentation uses the immutable Vercel deployment origin", () => {
  assert.equal(
    resolvePresentationOrigin({
      VERCEL_URL: "nibbles-with-nifa-abc123.vercel.app",
    }),
    "https://nibbles-with-nifa-abc123.vercel.app",
  );

  assert.equal(
    resolvePresentationOrigin({
      NEXT_PUBLIC_VERCEL_URL: "nibbles-with-nifa-framework.vercel.app",
    }),
    "https://nibbles-with-nifa-framework.vercel.app",
  );
});

test("an explicit hosted Studio origin wins over deployment and local values", () => {
  assert.equal(
    resolvePresentationOrigin({
      SANITY_STUDIO_PREVIEW_URL:
        "https://nibbles-with-nifa-final.vercel.app/presentation",
      VERCEL_URL: "nibbles-with-nifa-other.vercel.app",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    }),
    "https://nibbles-with-nifa-final.vercel.app",
  );
});

test("Presentation keeps explicit local development and safe fallback origins", () => {
  assert.equal(
    resolvePresentationOrigin({
      NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3000/studio",
    }),
    "http://127.0.0.1:3000",
  );
  assert.equal(resolvePresentationOrigin({}), "http://localhost:3000");
});

test("invalid configured origins fail the Studio build", () => {
  assert.throws(
    () =>
      resolvePresentationOrigin({
        SANITY_STUDIO_PREVIEW_URL: "javascript:alert(1)",
      }),
    /SANITY_STUDIO_PREVIEW_URL must contain a valid HTTP\(S\) origin/,
  );
});

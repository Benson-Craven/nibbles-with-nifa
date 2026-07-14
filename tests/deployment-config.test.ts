import assert from "node:assert/strict";
import test from "node:test";

import { resolveSanityEnvironment } from "../sanity/env";
import { resolvePresentationOrigin } from "../sanity/preview-origin";

test("hosted Studio variables select the rehearsal dataset at build time", () => {
  assert.deepEqual(
    resolveSanityEnvironment({
      SANITY_STUDIO_PROJECT_ID: "hosted-project",
      SANITY_STUDIO_DATASET: "preview-rehearsal",
      SANITY_STUDIO_API_VERSION: "2026-06-26",
      NEXT_PUBLIC_SANITY_PROJECT_ID: "embedded-project",
      NEXT_PUBLIC_SANITY_DATASET: "production",
      NEXT_PUBLIC_SANITY_API_VERSION: "2025-01-01",
    }),
    {
      projectId: "hosted-project",
      dataset: "preview-rehearsal",
      apiVersion: "2026-06-26",
    },
  );
});

test("embedded Studio variables remain the fallback outside a hosted build", () => {
  assert.deepEqual(
    resolveSanityEnvironment({
      NEXT_PUBLIC_SANITY_PROJECT_ID: "embedded-project",
      NEXT_PUBLIC_SANITY_DATASET: "preview-rehearsal",
      NEXT_PUBLIC_SANITY_API_VERSION: "2026-06-26",
    }),
    {
      projectId: "embedded-project",
      dataset: "preview-rehearsal",
      apiVersion: "2026-06-26",
    },
  );
});

test("Presentation uses the immutable Vercel deployment origin", () => {
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
      NEXT_PUBLIC_VERCEL_URL: "nibbles-with-nifa-other.vercel.app",
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

"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Public route failed", error.digest ?? "no-digest");
  }, [error]);

  return (
    <main className="public-error shell">
      <p className="eyebrow">That&apos;s not gone to plan</p>
      <h1>This page has gone a bit sideways.</h1>
      <p>
        Give it another go. If it still won&apos;t load, head back home and try
        again later.
      </p>
      <div className="public-error__actions">
        <button className="button" onClick={reset} type="button">
          Try again
        </button>
        <Link className="text-link" href="/">
          Back home
        </Link>
      </div>
    </main>
  );
}

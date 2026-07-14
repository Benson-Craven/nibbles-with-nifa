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
      <p className="eyebrow">Something went wrong</p>
      <h1>We couldn&apos;t bring this page to the table.</h1>
      <p>
        Please try again. If it still won&apos;t load, head home and come back a
        little later.
      </p>
      <div className="public-error__actions">
        <button className="button" onClick={reset} type="button">
          Try again
        </button>
        <Link className="text-link" href="/">
          Go to the homepage
        </Link>
      </div>
    </main>
  );
}

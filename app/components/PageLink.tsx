"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type PageLinkProps = Omit<ComponentProps<typeof Link>, "onNavigate" | "scroll">;

/**
 * Internal links keep the current position long enough to animate the window
 * back to the top, rather than letting Next.js jump there immediately.
 */
export function PageLink(props: PageLinkProps) {
  return (
    <Link
      {...props}
      scroll={false}
      onNavigate={() => {
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        });
      }}
    />
  );
}

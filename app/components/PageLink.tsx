"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type PageLinkProps = Omit<ComponentProps<typeof Link>, "onNavigate" | "scroll">;

/**
 * Non-fragment links keep the current position long enough to animate the
 * window back to the top. Fragment links retain Next.js's native anchor scroll.
 */
export function PageLink(props: PageLinkProps) {
  const hasFragment =
    typeof props.href === "string" && props.href.includes("#");

  return (
    <Link
      {...props}
      scroll={hasFragment ? undefined : false}
      onNavigate={
        hasFragment
          ? undefined
          : () => {
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "instant"
                  : "smooth",
              });
            }
      }
    />
  );
}

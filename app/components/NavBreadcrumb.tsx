"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";

import { NibblesWordmark } from "./NibblesWordmark";
import { PageLink } from "./PageLink";

const sectionLabels = [
  { path: "/recipes", label: "recipes" },
  { path: "/shop", label: "the edit" },
  { path: "/kitchen", label: "kit list" },
  { path: "/articles", label: "travel" },
];

export function NavBreadcrumbTrail({
  pathname,
  shouldReduceMotion = false,
}: {
  pathname: string;
  shouldReduceMotion?: boolean | null;
}) {
  const activeSection = sectionLabels.find(
    ({ path }) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const navTrail = activeSection
    ? { key: activeSection.path, label: activeSection.label, isCurrent: true }
    : undefined;

  return (
    <div className="nav-breadcrumb">
      <PageLink className="mini-brand" href="/">
        <NibblesWordmark />
      </PageLink>
      <AnimatePresence mode="wait" initial={!shouldReduceMotion}>
        {navTrail && (
          <motion.span
            key={navTrail.key}
            className="nav-breadcrumb__current"
            initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, x: 8 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.2, ease: "easeOut" }
            }
            aria-current={navTrail.isCurrent ? "page" : undefined}
          >
            <span aria-hidden="true">/</span> {navTrail.label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export function NavBreadcrumb() {
  const pathname = usePathname() ?? "/";
  const shouldReduceMotion = useReducedMotion();

  return (
    <NavBreadcrumbTrail
      pathname={pathname}
      shouldReduceMotion={shouldReduceMotion}
    />
  );
}

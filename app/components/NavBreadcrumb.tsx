"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";

import { PageLink } from "./PageLink";

const sectionLabels = [
  { path: "/recipes", label: "recipes" },
  { path: "/shop", label: "shop" },
  { path: "/kitchen", label: "kit list" },
  { path: "/articles", label: "articles" },
];

export function NavBreadcrumb() {
  const pathname = usePathname() ?? "/";
  const shouldReduceMotion = useReducedMotion();
  const activeSection = sectionLabels.find(
    ({ path }) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const navTrail = activeSection
    ? { key: activeSection.path, label: activeSection.label, isCurrent: true }
    : undefined;

  return (
    <div className="nav-breadcrumb">
      <PageLink className="mini-brand" href="/">
        nibbles with nifa
      </PageLink>
      <AnimatePresence mode="wait" initial={!shouldReduceMotion}>
        {navTrail && (
          <motion.span
            key={navTrail.key}
            className="nav-breadcrumb__current"
            initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, x: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            aria-current={navTrail.isCurrent ? "page" : undefined}
          >
            <span aria-hidden="true">/</span>{" "}
            {navTrail.label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import * as React from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcramb";

type BreadcrumbEntry = {
  href?: string;
  label: string;
};

type RevealBreadcrumbsProps = {
  initiallyRevealed?: boolean;
  items: BreadcrumbEntry[];
};

/**
 * Keeps the current page quiet until someone hovers, focuses, or taps the
 * trail, then gently reveals the full navigation path.
 */
export function RevealBreadcrumbs({
  initiallyRevealed = false,
  items,
}: RevealBreadcrumbsProps) {
  const [isRevealed, setIsRevealed] = React.useState(initiallyRevealed);
  const shouldReduceMotion = useReducedMotion();
  const currentItem = items.at(-1);
  const parentItems = items.slice(0, -1);

  if (!currentItem) return null;

  const reveal = () => setIsRevealed(true);
  const hide = () => setIsRevealed(false);
  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) hide();
  };

  const itemMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, x: -10 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -6 },
        transition: { duration: 0.18, ease: "easeOut" as const },
      };

  return (
    <div
      className="reveal-breadcrumbs"
      onPointerEnter={reveal}
      onPointerLeave={hide}
      onFocusCapture={reveal}
      onBlurCapture={handleBlur}
    >
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap gap-1 overflow-hidden text-[11px] font-semibold uppercase tracking-[0.12em]">
          <AnimatePresence initial={false} mode="popLayout">
            {isRevealed &&
              parentItems.map((item) => (
                <React.Fragment key={item.label}>
                  <motion.li
                    layout={!shouldReduceMotion}
                    {...itemMotion}
                    className="inline-flex shrink-0 items-center gap-1.5"
                  >
                    <BreadcrumbLink asChild>
                      <Link href={item.href ?? "#"} className="breadcrumb-link">
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  </motion.li>
                  <motion.li
                    layout={!shouldReduceMotion}
                    {...itemMotion}
                    className="inline-flex shrink-0 items-center"
                  >
                    <BreadcrumbSeparator className="px-0.5">/</BreadcrumbSeparator>
                  </motion.li>
                </React.Fragment>
              ))}
          </AnimatePresence>
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="block truncate">
              {currentItem.label}
            </BreadcrumbPage>
          </BreadcrumbItem>
          {parentItems.length > 0 && (
            <BreadcrumbItem>
              <button
                type="button"
                className="breadcrumb-toggle"
                aria-expanded={isRevealed}
                aria-label={isRevealed ? "Hide breadcrumb path" : "Show breadcrumb path"}
                onClick={() => setIsRevealed((revealed) => !revealed)}
              >
                <motion.span
                  animate={{ rotate: isRevealed ? 180 : 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18 }}
                >
                  <ChevronDown aria-hidden="true" className="size-3" />
                </motion.span>
              </button>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

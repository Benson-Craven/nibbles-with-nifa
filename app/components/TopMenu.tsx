"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import type { RefObject } from "react";

import { Button } from "@/components/ui/button";
import { PageLink } from "./PageLink";
import { publicationNavigation } from "./publication-navigation";

const focusableSelector =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

type FocusTarget = { focus: () => void };
type InertTarget = { inert: boolean };
type OverflowStyle = { overflow: string };

export function focusMenuTarget(target?: FocusTarget | null) {
  target?.focus();
}

export function lockMenuBackground(
  elements: Iterable<InertTarget>,
  style: OverflowStyle,
) {
  const previousOverflow = style.overflow;
  const previousInertValues = [...elements].map((element) => ({
    element,
    inert: element.inert,
  }));

  for (const { element } of previousInertValues) {
    element.inert = true;
  }
  style.overflow = "hidden";

  return () => {
    style.overflow = previousOverflow;
    for (const { element, inert } of previousInertValues) {
      element.inert = inert;
    }
  };
}

export function resolveFocusTrapTarget<T>({
  activeElement,
  activeWithinPanel,
  first,
  last,
  shiftKey,
}: {
  activeElement: T | null;
  activeWithinPanel: boolean;
  first: T;
  last: T;
  shiftKey: boolean;
}): T | null {
  if (shiftKey && (activeElement === first || !activeWithinPanel)) return last;
  if (!shiftKey && (activeElement === last || !activeWithinPanel)) return first;
  return null;
}

export function isOutsideMenuActivation(
  panelContainsTarget: boolean,
  triggerContainsTarget: boolean,
) {
  return !panelContainsTarget && !triggerContainsTarget;
}

export function TopMenuPanel({
  firstDestinationRef,
  onNavigate,
}: {
  firstDestinationRef?: RefObject<HTMLAnchorElement | null>;
  onNavigate?: () => void;
}) {
  return (
    <nav className="mobile-navigation" aria-label="Mobile navigation">
      <ul className="mobile-navigation__list">
        {publicationNavigation.map(({ href, label, secondary }, index) => (
          <li
            className={secondary ? "secondary-navigation" : undefined}
            key={label}
          >
            <PageLink
              className={`mobile-navigation__link${
                secondary ? " navigation-link--secondary" : ""
              }`}
              href={href}
              onClick={onNavigate}
              ref={index === 0 ? firstDestinationRef : undefined}
            >
              {label}
            </PageLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function TopMenu() {
  const [open, setOpen] = useState(false);
  const firstDestinationRef = useRef<HTMLAnchorElement>(null);
  const menuId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        focusMenuTarget(triggerRef.current);
      }
      return;
    }

    wasOpenRef.current = true;
    const panel = panelRef.current;
    const header = panel?.closest<HTMLElement>(".site-header");
    const body = document.body;
    const desktopNavigation = window.matchMedia("(min-width: 900px)");
    const backgroundElements = new Set<HTMLElement>();

    for (const child of header?.parentElement?.children ?? []) {
      if (child !== header && child instanceof HTMLElement) {
        backgroundElements.add(child);
      }
    }

    for (const child of body.children) {
      if (
        child instanceof HTMLElement &&
        child !== header &&
        (!header || !child.contains(header))
      ) {
        backgroundElements.add(child);
      }
    }

    const restoreBackground = lockMenuBackground(
      backgroundElements,
      body.style,
    );

    const focusFrame = window.requestAnimationFrame(() => {
      focusMenuTarget(firstDestinationRef.current);
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key === "Tab") {
        const focusableElements = Array.from(
          panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ??
            [],
        );

        if (focusableElements.length === 0) {
          event.preventDefault();
          panelRef.current?.focus();
          return;
        }

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        const activeElement =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

        const focusTarget = resolveFocusTrapTarget({
          activeElement,
          activeWithinPanel: panel?.contains(activeElement) ?? false,
          first,
          last,
          shiftKey: event.shiftKey,
        });

        if (focusTarget) {
          event.preventDefault();
          focusMenuTarget(focusTarget);
        }
      }
    }

    function closeOnOutsidePointerDown(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        isOutsideMenuActivation(
          panelRef.current?.contains(target) ?? false,
          triggerRef.current?.contains(target) ?? false,
        )
      ) {
        setOpen(false);
      }
    }

    function closeAtDesktop(event: MediaQueryListEvent) {
      if (event.matches) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", closeOnOutsidePointerDown);
    desktopNavigation.addEventListener("change", closeAtDesktop);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", closeOnOutsidePointerDown);
      desktopNavigation.removeEventListener("change", closeAtDesktop);
      restoreBackground();
    };
  }, [open]);

  return (
    <>
      <Button
        ref={triggerRef}
        className="top-menu-trigger"
        variant="ghost"
        size="icon"
        onClick={() => setOpen((current) => !current)}
        aria-controls={menuId}
        aria-expanded={open}
        aria-label={open ? "Close navigation" : "Open navigation"}
      >
        <span className="hamburger-icon cursor-pointer" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </Button>

      <AnimatePresence initial={false}>
        {open && (
          <>
            <motion.div
              aria-hidden="true"
              className="top-menu-backdrop"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
            />
            <motion.div
              ref={panelRef}
              className="top-menu-panel"
              id={menuId}
              aria-label="Navigation menu"
              aria-modal="true"
              role="dialog"
              tabIndex={-1}
              initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -8 }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <TopMenuPanel
                firstDestinationRef={firstDestinationRef}
                onNavigate={() => setOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { PageLink } from "./PageLink";

const menuGroups = [
  {
    title: "Recipes",
    href: "/recipes",
    links: [],
  },
  {
    title: "Travel essays",
    href: "/articles",
    links: [{ href: "/kitchen", title: "Our kitchen" }],
  },
  {
    title: "The edit",
    href: "/shop",
    links: [],
  },
];

const menuCards = [
  {
    title: "Travel essays",
    href: "/articles",
    image: "/images/shop/supper-kit.png",
  },
  {
    title: "Recipe archive",
    href: "/recipes",
    image: "/images/kitchen/apron-and-sheet-pan.png",
  },
];

export function TopMenuPanel({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="top-menu-panel__inner">
      <nav className="top-menu-columns" aria-label="Menu sections">
        {menuGroups.map((group) => (
          <section className="top-menu-group" key={group.title}>
            <PageLink href={group.href} onClick={onNavigate}>
              {group.title}
            </PageLink>
            {group.links.length > 0 && (
              <div>
                {group.links.map((link) => (
                  <PageLink
                    href={link.href}
                    key={link.title}
                    onClick={onNavigate}
                  >
                    {link.title}
                  </PageLink>
                ))}
              </div>
            )}
          </section>
        ))}
      </nav>

      <div className="top-menu-cards">
        {menuCards.map((card) => (
          <PageLink
            className="top-menu-card"
            href={card.href}
            key={card.title}
            onClick={onNavigate}
          >
            <span
              className="top-menu-card__image"
              style={{ backgroundImage: `url(${card.image})` }}
            />
            <span className="top-menu-card__label">{card.title}</span>
          </PageLink>
        ))}
      </div>
    </div>
  );
}

export function TopMenu() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnOutsidePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    }

    window.addEventListener("pointerdown", closeOnOutsidePointerDown);
    return () =>
      window.removeEventListener("pointerdown", closeOnOutsidePointerDown);
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
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <span className="hamburger-icon cursor-pointer" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </Button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            ref={panelRef}
            className="top-menu-panel"
            id={menuId}
            aria-label="Main menu"
            initial={
              shouldReduceMotion ? false : { opacity: 0, y: -14, scaleY: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -10, scaleY: 0.985 }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.26, ease: [0.22, 1, 0.36, 1] }
            }
            style={{ transformOrigin: "top" }}
          >
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.2, ease: "easeOut", delay: 0.04 }
              }
            >
              <TopMenuPanel onNavigate={() => setOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

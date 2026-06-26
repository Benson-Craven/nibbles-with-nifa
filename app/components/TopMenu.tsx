"use client";

import { Search } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { PageLink } from "./PageLink";

const menuGroups = [
  {
    title: "Recipes",
    links: [
      "Popular",
      "Lunch",
      "Dinner",
      "Donabe",
      "Noodles",
      "Donburi",
      "All",
    ],
    href: "/recipes",
  },
  {
    title: "Goods",
    links: [
      "Clothing",
      "Hats",
      "Accessories",
      "Sunglasses",
      "Wine",
      "Cookbook",
      "All",
    ],
    href: "/shop",
  },
  {
    title: "World",
    links: ["Kitchen", "Blog"],
    href: "/articles",
    follow: ["TikTok", "Instagram"],
  },
];

const menuCards = [
  {
    title: "Weekend Snack Plan",
    href: "/articles/weekend-snack-plan",
    image: "/images/shop/supper-kit.png",
  },
  {
    title: "Popular Recipes",
    href: "/recipes",
    image: "/images/kitchen/apron-and-sheet-pan.png",
  },
];

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

      <div className="header-actions" aria-label="Site tools">
        <button type="button">
          <Search aria-hidden="true" size={17} />
          <span>Search</span>
        </button>
      </div>

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
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top" }}
          >
            <motion.div
              className="top-menu-panel__inner"
              initial={shouldReduceMotion ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: 0.04 }}
            >
              <nav className="top-menu-columns" aria-label="Menu sections">
                {menuGroups.map((group) => (
                  <section className="top-menu-group" key={group.title}>
                    <PageLink href={group.href} onClick={() => setOpen(false)}>
                      {group.title}
                    </PageLink>
                    <div>
                      {group.links.map((link) => (
                        <PageLink
                          href={
                            group.title === "World" && link === "Kitchen"
                              ? "/kitchen"
                              : group.href
                          }
                          key={link}
                          onClick={() => setOpen(false)}
                        >
                          {link}
                        </PageLink>
                      ))}
                    </div>
                    {group.follow && (
                      <div className="top-menu-follow">
                        <p>Follow</p>
                        {group.follow.map((link) => (
                          <a href="#" key={link} onClick={() => setOpen(false)}>
                            {link}
                          </a>
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
                    onClick={() => setOpen(false)}
                  >
                    <span
                      className="top-menu-card__image"
                      style={{ backgroundImage: `url(${card.image})` }}
                    />
                    <span className="top-menu-card__label">{card.title}</span>
                  </PageLink>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const DISPATCH_POPOVER_SHOWN_KEY = "nibbles-dispatch-popover-shown";

export function DispatchPopover() {
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    let showTimer: number | undefined;

    try {
      if (window.localStorage.getItem(DISPATCH_POPOVER_SHOWN_KEY)) {
        return;
      }

      window.localStorage.setItem(DISPATCH_POPOVER_SHOWN_KEY, "true");
      showTimer = window.setTimeout(() => setIsVisible(true), 0);
    } catch {
      showTimer = window.setTimeout(() => setIsVisible(true), 0);
    }

    return () => {
      if (showTimer) {
        window.clearTimeout(showTimer);
      }
    };
  }, []);

  const motionProps = shouldReduceMotion
    ? {
        initial: false,
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, rotate: -6, scale: 0.96, y: 18 },
        animate: { opacity: 1, rotate: -3, scale: 1, y: 0 },
        exit: { opacity: 0, rotate: -10, scale: 0.92, y: 18 },
        transition: { duration: 0.22, ease: "easeOut" as const },
      };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          className="dispatch-popover"
          aria-label="Nibbles Notes signup"
          {...motionProps}
        >
          <button
            aria-label="Close newsletter signup"
            onClick={() => setIsVisible(false)}
            type="button"
          >
            ×
          </button>
          <strong>Nibbles Notes</strong>
          <p>
            New recipes, grocery-list ideas, cute finds, and plans worth leaving
            the house for.
          </p>
          <form action="#">
            <input
              aria-label="Email address"
              type="email"
              placeholder="Email address"
            />
            <button type="submit">Sign up</button>
          </form>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

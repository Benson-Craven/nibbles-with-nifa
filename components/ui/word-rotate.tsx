"use client";

import * as React from "react";
import { AnimatePresence, type HTMLMotionProps, motion } from "motion/react";

import { cn } from "@/lib/utils";

export interface WordRotateProps {
  /** Array of words to rotate through. */
  words: string[];
  /** Duration in milliseconds before the next word is shown. */
  duration?: number;
}

export function WordRotate({
  words,
  className,
  duration = 2000,
  ...props
}: HTMLMotionProps<"div"> & WordRotateProps) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (words.length < 2) return;

    const timeoutId = window.setTimeout(() => {
      setIndex((currentIndex) => (currentIndex + 1) % words.length);
    }, duration);

    return () => window.clearTimeout(timeoutId);
  }, [duration, index, words.length]);

  if (words.length === 0) return null;

  return (
    <div className="overflow-hidden p-2" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.div
          key={words[index]}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={cn(className)}
          {...props}
        >
          {words[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

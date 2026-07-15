"use client";

import { useRef } from "react";
import { ImageTrail } from "@/components/ui/image-trail";

const ImageTrailDemo = () => {
  const ref = useRef<HTMLDivElement>(null);

  const foods = [
    "🍇",
    "🍈",
    "🍉",
    "🍊",
    "🍋",
    "🍋‍🟩",
    "🍌",
    "🍍",
    "🥭",
    "🍎",
    "🍏",
    "🍐",
    "🍑",
    "🍒",
    "🍓",
    "🫐",
    "🥝",
    "🍅",
    "🫒",
    "🥥",
    "🥑",
    "🍆",
    "🥔",
    "🥕",
    "🌽",
    "🌶️",
    "🫑",
    "🥒",
    "🥬",
    "🥦",
    "🧄",
    "🧅",
    "🍄",
    "🥜",
    "🫘",
    "🌰",
    "🫚",
    "🫛",
    "🍞",
    "🥐",
    "🥖",
    "🫓",
    "🥨",
    "🥯",
    "🥞",
    "🧇",
    "🧀",
    "🍖",
    "🍗",
    "🥩",
    "🥓",
    "🍔",
    "🍟",
    "🍕",
    "🌭",
    "🥪",
    "🌮",
    "🌯",
    "🫔",
    "🥙",
    "🧆",
    "🥚",
    "🍳",
    "🥘",
    "🍲",
    "🫕",
    "🥣",
    "🥗",
    "🍿",
    "🧈",
    "🧂",
    "🥫",
    "🍱",
    "🍘",
    "🍙",
    "🍚",
    "🍛",
    "🍜",
    "🍝",
    "🍠",
    "🍢",
    "🍣",
    "🍤",
    "🍥",
    "🥮",
    "🍡",
    "🥟",
    "🥠",
    "🥡",
    "🦀",
    "🦞",
    "🦐",
    "🦑",
    "🦪",
    "🍦",
    "🍧",
    "🍨",
    "🍩",
    "🍪",
    "🎂",
    "🍰",
    "🧁",
    "🥧",
    "🍫",
    "🍬",
    "🍭",
    "🍮",
    "🍯",
    "🍼",
    "🥛",
    "☕",
    "🫖",
    "🍵",
    "🍶",
    "🍾",
    "🍷",
    "🍸",
    "🍹",
    "🍺",
    "🍻",
    "🥂",
    "🥃",
    "🫗",
    "🥤",
    "🧋",
    "🧃",
    "🧉",
    "🧊",
  ];

  return (
    <section
      aria-label="Nibbles with Nifa"
      className="relative flex min-h-[calc(100svh-68px)] w-full items-center justify-center overflow-hidden bg-[var(--color-paper)] px-6 py-24"
      ref={ref}
    >
      <div className="absolute inset-0 z-0">
        <ImageTrail
          containerRef={ref}
          interval={70}
          rotationRange={22}
          animationSequence={[
            [
              { scale: 1.35, opacity: 0.95 },
              { duration: 0.12, ease: "circOut" },
            ],
            [
              { scale: 0.55, opacity: 0, y: -28 },
              { duration: 0.7, ease: "circIn" },
            ],
          ]}
        >
          {foods.map((food) => (
            <div
              key={food}
              className="-translate-x-1/2 -translate-y-1/2 select-none text-5xl drop-shadow-sm sm:text-7xl"
              aria-hidden="true"
            >
              {food}
            </div>
          ))}
        </ImageTrail>
      </div>
      <div className="pointer-events-none relative z-10 mx-auto flex max-w-6xl select-none flex-col items-center text-center">
        <p className="mb-6 max-w-[34ch] font-[family-name:var(--font-utility)] text-[length:var(--text-meta)] leading-relaxed font-normal uppercase tracking-[0.22em] text-[var(--color-text-secondary)]">
          recipes, cute finds & food notes
        </p>
        <h1 className="w-full font-[family-name:var(--font-utility)] text-[length:var(--text-masthead)] font-semibold leading-[0.78] text-[var(--color-text-primary)]">
          <span className="block whitespace-nowrap">nibbles with</span>
          <span className="block">nifa</span>
        </h1>
      </div>
    </section>
  );
};

export { ImageTrailDemo };

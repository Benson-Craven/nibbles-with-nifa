"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { PageLink } from "../PageLink";

export interface SparkItem {
  id: string;
  imageSrc: string;
  title: string;
  note: string;
  meta: string;
  href: string;
}

interface SparksCarouselProps {
  title: string;
  subtitle: string;
  items: SparkItem[];
}

export function SparksCarousel({ title, subtitle, items }: SparksCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const checkScrollPosition = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const { scrollLeft, scrollWidth, clientWidth } = carousel;
    setIsAtStart(scrollLeft < 10);
    setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 10);
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    checkScrollPosition();
    carousel.addEventListener("scroll", checkScrollPosition, { passive: true });
    const observer = new ResizeObserver(checkScrollPosition);
    observer.observe(carousel);

    return () => {
      carousel.removeEventListener("scroll", checkScrollPosition);
      observer.disconnect();
    };
  }, [checkScrollPosition, items]);

  const scroll = (direction: "left" | "right") => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    carousel.scrollBy({
      left: (direction === "left" ? -1 : 1) * carousel.clientWidth * 0.82,
      behavior: "smooth",
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scroll("left");
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      scroll("right");
    }
  };

  return (
    <section className="recipe-carousel" aria-labelledby="featured-recipes-title">
      <div className="recipe-carousel__header">
        <div>
          <p className="eyebrow">From our table</p>
          <h2 id="featured-recipes-title">{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="recipe-carousel__controls" aria-label="Featured recipe carousel controls">
          <button type="button" onClick={() => scroll("left")} disabled={isAtStart} aria-label="Show previous recipes">
            <ChevronLeft aria-hidden="true" size={20} strokeWidth={1.7} />
          </button>
          <button type="button" onClick={() => scroll("right")} disabled={isAtEnd} aria-label="Show more recipes">
            <ChevronRight aria-hidden="true" size={20} strokeWidth={1.7} />
          </button>
        </div>
      </div>

      <div
        aria-label="Featured recipes. Use the left and right arrow keys to browse."
        className="recipe-carousel__viewport"
        onKeyDown={handleKeyDown}
        ref={carouselRef}
        role="region"
        tabIndex={0}
      >
        {items.map((item, index) => (
          <motion.article
            className="recipe-carousel__item"
            key={item.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, delay: index * 0.07 }}
          >
            <PageLink href={item.href} className="recipe-carousel__link">
              <Image
                src={item.imageSrc}
                alt={item.title}
                className="recipe-carousel__image"
                width={800}
                height={920}
                sizes="(max-width: 760px) 82vw, 33vw"
              />
              <div className="recipe-carousel__copy">
                <p className="recipe-carousel__meta">{item.meta}</p>
                <h3>{item.title}</h3>
                <p>{item.note}</p>
                <span>Read recipe <b>→</b></span>
              </div>
            </PageLink>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

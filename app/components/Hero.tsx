"use client";
import { PageLink } from "./PageLink";
import { useEffect, useState } from "react";

const slides = [
  {
    eyebrow: "Tonight, perhaps",
    title: "Miso mushroom pasta",
    text: "Silky noodles, glossy mushrooms, and just enough miso to make you pause between bites.",
    href: "/recipes/miso-mushroom-pasta",
    action: "Make dinner",
    image:
      "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=1800",
  },
  {
    eyebrow: "A new bottle",
    title: "Our chilled red",
    text: "A bright little red for fridge doors, small plates, and summer light that refuses to leave.",
    href: "/shop/house-red",
    action: "Meet the wine",
    image:
      "https://images.pexels.com/photos/1123260/pexels-photo-1123260.jpeg?auto=compress&cs=tinysrgb&w=1800",
  },
  {
    eyebrow: "From the oven",
    title: "Sweet potato bread pudding",
    text: "A soft, golden excuse to make a little more room around the table.",
    href: "/recipes/sweet-potato-bread-pudding",
    action: "See the recipe",
    image:
      "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=1800",
  },
];
export function Hero() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      6500,
    );
    return () => window.clearInterval(timer);
  }, []);
  const slide = slides[index];
  return (
    <section
      className="hero"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(42,39,36,.72) 0%, rgba(42,39,36,.25) 54%, rgba(42,39,36,.02) 100%), url(${slide.image})`,
      }}
    >
      <div className="hero__content">
        <p className="eyebrow">{slide.eyebrow}</p>
        <h1>{slide.title}</h1>
        <p>{slide.text}</p>
        <PageLink className="button button--light" href={slide.href}>
          {slide.action}
        </PageLink>
        <div className="hero-dots" aria-label="Featured stories">
          {slides.map((item, i) => (
            <button
              aria-label={`Show ${item.title}`}
              className={index === i ? "active" : ""}
              key={item.title}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

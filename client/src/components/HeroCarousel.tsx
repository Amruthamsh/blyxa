import { useEffect, useState } from "react";
import type { Product } from "../lib/types";

interface HeroCarouselProps {
  products: Product[];
  onView: (product: Product) => void;
}

const AUTOPLAY_MS = 4500;

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={
          direction === "left"
            ? "M15.75 19.5 8.25 12l7.5-7.5"
            : "m8.25 4.5 7.5 7.5-7.5 7.5"
        }
      />
    </svg>
  );
}

export default function HeroCarousel({ products, onView }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const count = products.length;
  // Products can change after a refetch; keep the index in range
  const current = count > 0 ? index % count : 0;

  // Restarts whenever the slide changes, so manual navigation gets a full
  // interval before the next automatic advance
  useEffect(() => {
    if (count < 2) return;
    const timer = window.setTimeout(
      () => setIndex((current + 1) % count),
      AUTOPLAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [current, count]);

  function go(delta: number) {
    setIndex((current + delta + count) % count);
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Plants in our collection"
      className="group/carousel relative aspect-square overflow-hidden rounded-[2.5rem] bg-moss-50"
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {products.map((product, i) => (
          <button
            key={product.id}
            type="button"
            onClick={() => onView(product)}
            aria-hidden={i !== current}
            tabIndex={i === current ? 0 : -1}
            aria-label={`View details for ${product.name}`}
            className="relative h-full w-full shrink-0 cursor-pointer focus-visible:outline-none"
          >
            <img
              src={product.image_url!}
              alt=""
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/80 via-forest-950/35 to-transparent px-6 pb-12 pt-16 text-left">
              <p className="font-serif text-2xl font-semibold leading-tight text-sand-50">
                {product.name}
              </p>
              {product.categories?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {product.categories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full bg-white/15 px-2.5 py-0.5 text-[0.68rem] font-semibold text-sand-50 backdrop-blur"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous plant"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-forest-900 opacity-0 shadow-md backdrop-blur transition-opacity hover:bg-white focus-visible:opacity-100 group-hover/carousel:opacity-100"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next plant"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-forest-900 opacity-0 shadow-md backdrop-blur transition-opacity hover:bg-white focus-visible:opacity-100 group-hover/carousel:opacity-100"
          >
            <ChevronIcon direction="right" />
          </button>

          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
            {products.map((product, i) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${product.name}`}
                aria-current={i === current}
                className={`h-1.5 cursor-pointer rounded-full transition-all ${
                  i === current
                    ? "w-5 bg-white"
                    : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

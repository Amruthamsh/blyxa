import { formatPrice } from "../lib/format";

interface ProductFiltersProps {
  query: string;
  priceBounds: [number, number];
  priceStep: number;
  priceRange: [number, number];
  isFiltering: boolean;
  resultCount: number;
  totalCount: number;
  onQueryChange: (value: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onClear: () => void;
}

export default function ProductFilters({
  query,
  priceBounds,
  priceStep,
  priceRange,
  isFiltering,
  resultCount,
  totalCount,
  onQueryChange,
  onPriceRangeChange,
  onClear,
}: ProductFiltersProps) {
  const [boundMin, boundMax] = priceBounds;
  const [low, high] = priceRange;
  const span = boundMax - boundMin;
  const hasRange = span > 0;
  const lowPct = hasRange ? ((low - boundMin) / span) * 100 : 0;
  const highPct = hasRange ? ((high - boundMin) / span) * 100 : 100;

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
        <div className="relative w-full sm:max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-900/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search plants"
            aria-label="Search plants"
            className="w-full rounded-full border border-forest-900/15 bg-white py-2.5 pl-11 pr-4 text-sm text-forest-950 shadow-sm transition-colors placeholder:text-forest-900/35 focus:border-moss-500 focus:outline-none focus:ring-2 focus:ring-moss-500/25"
          />
        </div>

        {hasRange && (
          <div className="w-full sm:max-w-[16rem] sm:flex-1">
            <div className="mb-1.5 flex items-baseline justify-between text-sm">
              <span className="font-medium text-forest-900">Price</span>
              <span className="text-forest-900/60">
                {formatPrice(low)} – {formatPrice(high)}
              </span>
            </div>
            <div className="relative h-5">
              <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-forest-900/10" />
              <div
                className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-moss-500"
                style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
              />
              <input
                type="range"
                className="price-range"
                min={boundMin}
                max={boundMax}
                step={priceStep}
                value={low}
                aria-label="Minimum price"
                onChange={(e) =>
                  onPriceRangeChange([Math.min(Number(e.target.value), high), high])
                }
              />
              <input
                type="range"
                className="price-range"
                min={boundMin}
                max={boundMax}
                step={priceStep}
                value={high}
                aria-label="Maximum price"
                onChange={(e) =>
                  onPriceRangeChange([low, Math.max(Number(e.target.value), low)])
                }
              />
            </div>
          </div>
        )}
      </div>

      {isFiltering && (
        <div className="mt-3 flex items-center justify-between text-sm text-forest-900/60">
          <span aria-live="polite">
            Showing {resultCount} of {totalCount}{" "}
            {totalCount === 1 ? "plant" : "plants"}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="font-semibold text-moss-700 underline decoration-moss-400 underline-offset-2 transition-colors hover:text-moss-900"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

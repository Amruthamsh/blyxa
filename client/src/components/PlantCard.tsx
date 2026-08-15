import type { Plant } from "../data/plants";
import { formatPrice, stockLevel, whatsappLink } from "../data/plants";
import { PlantIcon } from "./PlantIcon";
import { WhatsAppIcon } from "./WhatsAppIcon";

interface PlantCardProps {
  plant: Plant;
  onAdd: (id: string) => void;
}

export function PlantCard({ plant, onAdd }: PlantCardProps) {
  const stock = stockLevel(plant);

  const stockBadge =
    stock === "in" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-100 px-3 py-1 text-xs font-semibold text-leaf-800">
        <span className="size-2 rounded-full bg-leaf-500" />
        In stock
      </span>
    ) : stock === "low" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-200 px-3 py-1 text-xs font-semibold text-sun-700">
        <span className="size-2 rounded-full bg-sun-500" />
        Only {plant.stockCount} left
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold text-stone-500">
        <span className="size-2 rounded-full bg-stone-400" />
        Out of stock
      </span>
    );

  const quickOrder = whatsappLink(
    `Hello Blyxa Enterprises! 🌿\n\nI'd like to order the *${plant.name}* (${formatPrice(plant.price)}).`,
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-leaf-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-leaf-900/10">
      <div className="relative flex h-56 items-center justify-center overflow-hidden bg-art">
        <div className="absolute -top-10 -right-10 size-36 rounded-full bg-leaf-200/50 blur-2xl" />
        <div className="absolute -bottom-12 -left-10 size-36 rounded-full bg-sun-200/60 blur-2xl" />
        <PlantIcon
          variant={plant.art}
          pot={plant.pot}
          leaf={plant.leaf}
          accent={plant.accent}
          className="relative z-10 h-44 w-52 drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
        />
        {plant.tag && (
          <span className="absolute top-3 left-3 z-20 rounded-full bg-sun-300 px-3 py-1 text-xs font-bold tracking-wide text-leaf-900 uppercase shadow-sm">
            {plant.tag}
          </span>
        )}
        {stock === "out" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
            <span className="rounded-full bg-stone-800 px-4 py-1.5 text-xs font-semibold tracking-wide text-white uppercase">
              Back in stock soon
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-leaf-900">
              {plant.name}
            </h3>
            <p className="text-sm italic text-leaf-700/70">{plant.latin}</p>
          </div>
          <div className="shrink-0 rounded-2xl bg-leaf-50 px-3 py-1.5 text-right">
            <p className="font-display text-lg font-semibold text-leaf-800">
              {formatPrice(plant.price)}
            </p>
          </div>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-stone-600">
          {plant.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          {stockBadge}
          <a
            href={quickOrder}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Order ${plant.name} over WhatsApp`}
            className="inline-flex items-center justify-center rounded-full border border-leaf-200 p-2.5 text-leaf-700 transition-colors hover:border-leaf-500 hover:bg-leaf-50"
          >
            <WhatsAppIcon className="size-5" />
          </a>
        </div>

        {stock === "out" ? (
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-full bg-stone-100 py-2.5 text-sm font-semibold text-stone-400"
          >
            Sold out
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onAdd(plant.id)}
            className="w-full rounded-full bg-leaf-700 py-2.5 text-sm font-semibold text-white shadow-sm shadow-leaf-700/30 transition-all hover:bg-leaf-800 active:scale-[0.98]"
          >
            Add to cart
          </button>
        )}
      </div>
    </article>
  );
}

export type PlantArtVariant =
  | "monstera"
  | "fiddle"
  | "pothos"
  | "snake"
  | "lily"
  | "aloe"
  | "zz"
  | "rubber"
  | "fern"
  | "lavender";

export const ART_VARIANTS: PlantArtVariant[] = [
  "monstera",
  "fiddle",
  "pothos",
  "snake",
  "lily",
  "aloe",
  "zz",
  "rubber",
  "fern",
  "lavender",
];

export interface ArtPalette {
  pot: string;
  leaf: string;
  accent: string;
}

export const ART_PALETTES: ArtPalette[] = [
  { pot: "#b5633a", leaf: "#3f8f3d", accent: "#7cc06b" },
  { pot: "#cfd8c9", leaf: "#4c8f4a", accent: "#8fbf72" },
  { pot: "#e2b93c", leaf: "#4fa443", accent: "#ffe46a" },
  { pot: "#415d43", leaf: "#4e7d46", accent: "#9ccf8a" },
  { pot: "#344e41", leaf: "#3f8f5a", accent: "#9fd1a8" },
  { pot: "#c98a5b", leaf: "#37663a", accent: "#8fbf9a" },
  { pot: "#8fb27a", leaf: "#4c8f4a", accent: "#a3cb9c" },
  { pot: "#a89fc4", leaf: "#6a9c5a", accent: "#8b6fc7" },
];

export const PLANT_CATEGORIES = [
  "Indoor",
  "Air purifying",
  "Low light",
  "Outdoor",
] as const;

export type PlantCategory = (typeof PLANT_CATEGORIES)[number];

export const CATEGORIES = ["All", ...PLANT_CATEGORIES] as const;

export interface Plant {
  id: string;
  name: string;
  latin: string;
  price: number;
  stockCount: number;
  category: PlantCategory;
  description: string;
  tag?: string;
  art: PlantArtVariant;
  pot: string;
  leaf: string;
  accent: string;
}

export const WHATSAPP_NUMBER = "14155552671";

export const PLANTS: Plant[] = [
  {
    id: "monstera",
    name: "Monstera Deliciosa",
    latin: "Monstera deliciosa",
    price: 34,
    stockCount: 12,
    category: "Indoor",
    description:
      "The icon of the houseplant world — glossy split leaves that grow into a dramatic jungle statement.",
    tag: "Bestseller",
    art: "monstera",
    pot: "#b5633a",
    leaf: "#3f8f3d",
    accent: "#7cc06b",
  },
  {
    id: "fiddle",
    name: "Fiddle Leaf Fig",
    latin: "Ficus lyrata",
    price: 49,
    stockCount: 6,
    category: "Indoor",
    description:
      "Tall, sculptural and endlessly elegant. The fiddle leaf fig anchors any bright corner beautifully.",
    tag: "Statement",
    art: "fiddle",
    pot: "#cfd8c9",
    leaf: "#4c8f4a",
    accent: "#8fbf72",
  },
  {
    id: "pothos",
    name: "Golden Pothos",
    latin: "Epipremnum aureum",
    price: 22,
    stockCount: 18,
    category: "Air purifying",
    description:
      "A forgiving trailing vine with golden-marbled leaves. Grows anywhere, thrives everywhere.",
    tag: "Easy care",
    art: "pothos",
    pot: "#e2b93c",
    leaf: "#4fa443",
    accent: "#ffe46a",
  },
  {
    id: "snake",
    name: "Snake Plant",
    latin: "Sansevieria trifasciata",
    price: 28,
    stockCount: 3,
    category: "Air purifying",
    description:
      "Bold upright blades that purify the air and survive almost any neglect. The ultimate beginner plant.",
    tag: "Air purifier",
    art: "snake",
    pot: "#415d43",
    leaf: "#4e7d46",
    accent: "#9ccf8a",
  },
  {
    id: "lily",
    name: "Peace Lily",
    latin: "Spathiphyllum wallisii",
    price: 26,
    stockCount: 9,
    category: "Air purifying",
    description:
      "Glossy green leaves crowned with soft white blooms. Graceful, calming, and easy to adore.",
    tag: "Blooms",
    art: "lily",
    pot: "#e8efe4",
    leaf: "#4a8f45",
    accent: "#f7f7f0",
  },
  {
    id: "aloe",
    name: "Aloe Vera",
    latin: "Aloe barbadensis",
    price: 18,
    stockCount: 0,
    category: "Indoor",
    description:
      "A spiky succulent with soothing gel inside every leaf. Handsome, hardy, and useful on sunny sills.",
    art: "aloe",
    pot: "#f2a25c",
    leaf: "#5a9c55",
    accent: "#b7d9a0",
  },
  {
    id: "zz",
    name: "ZZ Plant",
    latin: "Zamioculcas zamiifolia",
    price: 30,
    stockCount: 15,
    category: "Low light",
    description:
      "Glossy, architectural and unbothered by low light. The ZZ plant forgives even the busiest schedules.",
    tag: "Low light",
    art: "zz",
    pot: "#344e41",
    leaf: "#3f8f5a",
    accent: "#9fd1a8",
  },
  {
    id: "rubber",
    name: "Rubber Plant",
    latin: "Ficus elastica",
    price: 38,
    stockCount: 4,
    category: "Indoor",
    description:
      "Big, shiny, burgundy-tinged leaves that bring instant depth and drama to any living space.",
    tag: "Statement",
    art: "rubber",
    pot: "#c98a5b",
    leaf: "#37663a",
    accent: "#8fbf9a",
  },
  {
    id: "fern",
    name: "Boston Fern",
    latin: "Nephrolepis exaltata",
    price: 24,
    stockCount: 8,
    category: "Outdoor",
    description:
      "Feathery, lush fronds that soften any shelf or balcony. A cloud of calm, pet-friendly green.",
    tag: "Pet friendly",
    art: "fern",
    pot: "#8fb27a",
    leaf: "#4c8f4a",
    accent: "#a3cb9c",
  },
  {
    id: "lavender",
    name: "French Lavender",
    latin: "Lavandula stoechas",
    price: 20,
    stockCount: 20,
    category: "Outdoor",
    description:
      "Fragrant purple spikes that perfume your windowsill. A sun-loving pocket of Provence at home.",
    tag: "Fragrant",
    art: "lavender",
    pot: "#a89fc4",
    leaf: "#6a9c5a",
    accent: "#8b6fc7",
  },
];

export type StockLevel = "in" | "low" | "out";

export function stockLevel(plant: Plant): StockLevel {
  if (plant.stockCount === 0) return "out";
  if (plant.stockCount <= 5) return "low";
  return "in";
}

export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildOrderMessage(
  items: { plant: Plant; qty: number }[],
  name: string,
  note: string,
): string {
  const lines = items.map(
    ({ plant, qty }) =>
      `• ${qty} × ${plant.name} — ${formatPrice(plant.price * qty)}`,
  );
  const total = items.reduce(
    (sum, { plant, qty }) => sum + plant.price * qty,
    0,
  );
  const noteLine = note.trim() ? `\nNote: ${note.trim()}` : "";

  return [
    "Hello Blyxa Enterprises! 🌿",
    "",
    "I'd like to place an order:",
    "",
    ...lines,
    "",
    `Order total: ${formatPrice(total)}`,
    "",
    `Name: ${name}`,
    noteLine,
  ].join("\n");
}

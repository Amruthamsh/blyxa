import { ART_PALETTES } from "../data/plants";
import type { PlantArtVariant, PlantCategory } from "../data/plants";

export interface PlantInput {
  name: string;
  latin: string;
  price: number;
  stockCount: number;
  category: PlantCategory;
  description: string;
  tag: string;
  art: PlantArtVariant;
  pot: string;
  leaf: string;
  accent: string;
}

export function emptyPlantInput(): PlantInput {
  return {
    name: "",
    latin: "",
    price: 0,
    stockCount: 0,
    category: "Indoor",
    description: "",
    tag: "",
    art: "monstera",
    ...ART_PALETTES[0],
  };
}

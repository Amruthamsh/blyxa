import { createContext, useContext } from "react";
import type { Plant } from "../data/plants";
import type { PlantInput } from "./plantInput";

export interface PlantsContextValue {
  plants: Plant[];
  getPlant: (id: string) => Plant | undefined;
  addPlant: (input: PlantInput) => Plant;
  updatePlant: (id: string, patch: Partial<PlantInput>) => void;
  deletePlant: (id: string) => void;
}

export const PlantsContext = createContext<PlantsContextValue | null>(null);

export function usePlants(): PlantsContextValue {
  const context = useContext(PlantsContext);
  if (!context) {
    throw new Error("usePlants must be used within a PlantsProvider");
  }
  return context;
}

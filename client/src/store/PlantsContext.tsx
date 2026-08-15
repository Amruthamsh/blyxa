import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { PLANTS } from "../data/plants";
import type { Plant } from "../data/plants";
import type { PlantInput } from "./plantInput";
import { PlantsContext } from "./plantsContextValue";

const STORAGE_KEY = "blyxa.plants.v1";

function loadPlants(): Plant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Plant[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore corrupt storage
  }
  return PLANTS;
}

export function PlantsProvider({ children }: { children: ReactNode }) {
  const [plants, setPlants] = useState<Plant[]>(loadPlants);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
    } catch {
      // storage may be unavailable; ignore
    }
  }, [plants]);

  const getPlant = (id: string) => plants.find((plant) => plant.id === id);

  const addPlant = (input: PlantInput): Plant => {
    const plant: Plant = {
      id: `plant-${Date.now()}`,
      ...input,
    };
    setPlants((current) => [plant, ...current]);
    return plant;
  };

  const updatePlant = (id: string, patch: Partial<PlantInput>) => {
    setPlants((current) =>
      current.map((plant) =>
        plant.id === id ? { ...plant, ...patch } : plant,
      ),
    );
  };

  const deletePlant = (id: string) => {
    setPlants((current) => current.filter((plant) => plant.id !== id));
  };

  return (
    <PlantsContext.Provider
      value={{ plants, getPlant, addPlant, updatePlant, deletePlant }}
    >
      {children}
    </PlantsContext.Provider>
  );
}

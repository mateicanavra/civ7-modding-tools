export type Civ7MapSizePreset = {
  id: "MAPSIZE_TINY" | "MAPSIZE_SMALL" | "MAPSIZE_STANDARD" | "MAPSIZE_LARGE" | "MAPSIZE_HUGE";
  label: "Tiny" | "Small" | "Standard" | "Large" | "Huge";
  dimensions: { width: number; height: number };
};

export const CIV7_MAP_SIZES: Civ7MapSizePreset[] = [
  { id: "MAPSIZE_TINY", label: "Tiny", dimensions: { width: 60, height: 38 } },
  { id: "MAPSIZE_SMALL", label: "Small", dimensions: { width: 74, height: 46 } },
  { id: "MAPSIZE_STANDARD", label: "Standard", dimensions: { width: 84, height: 54 } },
  { id: "MAPSIZE_LARGE", label: "Large", dimensions: { width: 96, height: 60 } },
  { id: "MAPSIZE_HUGE", label: "Huge", dimensions: { width: 106, height: 66 } },
];

export function getCiv7MapSizePreset(id: Civ7MapSizePreset["id"]): Civ7MapSizePreset {
  return CIV7_MAP_SIZES.find((m) => m.id === id) ?? CIV7_MAP_SIZES[CIV7_MAP_SIZES.length - 1]!;
}

export function formatMapSizeLabel(p: Civ7MapSizePreset): string {
  return `${p.label} (${p.dimensions.width}×${p.dimensions.height})`;
}

type RegionSlot = 0 | 1 | 2;

type LandmassRegionEngine = Readonly<{
  getLandmassId: (name: "NONE" | "WEST" | "EAST") => number;
  setLandmassRegionId: (x: number, y: number, regionId: number) => void;
}>;

/**
 * Restamps the recipe's abstract landmass-region slots into Civ7 engine region
 * ids after terrain maintenance.
 *
 * Area recalculation can rewrite engine-side region bookkeeping. This helper
 * belongs to `prepare-placement-surface` because that step is the single
 * maintenance boundary responsible for making the engine surface ready before
 * resources, starts, and discoveries consume it.
 */
export function applyLandmassRegionSlots(
  engine: LandmassRegionEngine,
  width: number,
  height: number,
  slotByTile: Uint8Array
): void {
  const size = width * height;
  if (slotByTile.length !== size) {
    throw new Error(`Expected slotByTile length ${size} (received ${slotByTile.length}).`);
  }

  const westRegionId = engine.getLandmassId("WEST");
  const eastRegionId = engine.getLandmassId("EAST");
  const noneRegionId = engine.getLandmassId("NONE");

  for (let i = 0; i < size; i++) {
    const y = (i / width) | 0;
    const x = i - y * width;
    const slot = (slotByTile[i] ?? 0) as RegionSlot;
    const regionId = slot === 1 ? westRegionId : slot === 2 ? eastRegionId : noneRegionId;
    engine.setLandmassRegionId(x, y, regionId);
  }
}

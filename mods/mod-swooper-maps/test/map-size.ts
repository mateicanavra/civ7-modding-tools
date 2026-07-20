import {
  type Civ7StandardMapSizeId,
  type Civ7StandardMapSizePreset,
  findCiv7StandardMapSizePreset,
  getCiv7StandardMapSizePreset,
} from "@civ7/adapter";

const DEFAULT_TEST_MAP_SIZE_ID = "MAPSIZE_TINY" satisfies Civ7StandardMapSizeId;

function resolveTestMapSize(): Civ7StandardMapSizePreset {
  const configuredId = process.env.SWOOPER_TEST_MAP_SIZE;
  if (configuredId === undefined) {
    return getCiv7StandardMapSizePreset(DEFAULT_TEST_MAP_SIZE_ID);
  }

  const preset = findCiv7StandardMapSizePreset(configuredId);
  if (preset) return preset;

  throw new Error(
    `SWOOPER_TEST_MAP_SIZE must name a Civ7 standard map-size preset; received ${JSON.stringify(configuredId)}.`
  );
}

/** Civ7 preset selected for map-size-independent Swooper behavior tests. */
export const TEST_MAP_SIZE = resolveTestMapSize();

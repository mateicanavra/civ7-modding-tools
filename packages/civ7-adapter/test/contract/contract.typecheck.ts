import {
  type CurrentMapElevationSnapshot,
  createMockAdapter,
  type EngineAdapter,
  type FeatureData,
  findCiv7StandardMapSizePreset,
  getCiv7RowLatitude,
  type MockAdapterConfig,
  type ProjectedRiverClass,
  type RiverCapabilities,
  type RiverDirection,
  type RiverFinalizationArgs,
  type RiverWriteIntent,
} from "@civ7/adapter";

const config = {
  rngSeed: 7,
} satisfies MockAdapterConfig;
const adapter: EngineAdapter = createMockAdapter(config);
const feature: FeatureData = {
  Feature: 3,
  Direction: 0,
  Elevation: 1,
};

adapter.setFeatureType(0, 0, feature);
adapter.setElevation([0, -0.5, 1.25] as const);
adapter.generateCliffsFromElevation();
const riverDirection: RiverDirection = "SOUTHWEST";
const riverClass: ProjectedRiverClass = "MINOR";
const riverIntent: RiverWriteIntent = { x: 0, y: 0, direction: riverDirection, riverClass };
const riverFinalization: RiverFinalizationArgs = [false, 25, 2, 2] as const;
adapter.setRiverInfo(riverIntent);
adapter.finalizeRivers(riverFinalization);
const riverCapabilities: RiverCapabilities = adapter.getRiverCapabilities();
if (riverCapabilities.setRiverInfo.status === "unavailable") {
  const reason: string = riverCapabilities.setRiverInfo.reason;
  void reason;
}
// @ts-expect-error Projected intent is immutable.
riverIntent.x = 1;
// @ts-expect-error Finalization arguments are immutable.
riverFinalization[1] = 0;
// @ts-expect-error Portable directions are not native integer enums or grid slots.
adapter.setRiverInfo({ x: 0, y: 0, direction: 0, riverClass: "MINOR" });
// @ts-expect-error The native enum name is not the portable projected class.
adapter.setRiverInfo({ x: 0, y: 0, direction: "EAST", riverClass: "RIVER_MINOR" });
// @ts-expect-error Finalization requires the complete explicit tuple.
adapter.finalizeRivers([false, 25, 2]);
// @ts-expect-error Finalization accepts one tuple, not native positional arguments.
adapter.finalizeRivers(false, 25, 2, 2);
// @ts-expect-error Civ7 1.5 no longer exposes the automatic river-naming operation.
adapter.defineNamedRivers();
const elevationSnapshot: CurrentMapElevationSnapshot = adapter.readCurrentMapElevationSnapshot();
if (elevationSnapshot.status === "available") {
  const values: Float64Array = elevationSnapshot.values;
  void values;
} else {
  // @ts-expect-error Unavailable elevation cannot masquerade as numeric readback.
  elevationSnapshot.values;
}
// @ts-expect-error Native elevation dispatch takes an ordinary array, not a typed-array view.
adapter.setElevation(new Float64Array(3));
findCiv7StandardMapSizePreset("MAPSIZE_STANDARD");
getCiv7RowLatitude({ firstRowLatitude: 90, exclusiveEndLatitude: -90 }, 1, 0);

// @ts-expect-error Concrete lowering and setup capture are owned by the mod realization.
import { captureCiv7MapGenerationSetup, createCiv7Adapter } from "@civ7/adapter";

// @ts-expect-error The adapter no longer exposes a concrete runtime subpath.
import("@civ7/adapter/civ7");

// @ts-expect-error Map-script compilation is owned by the mod realization.
import("@civ7/adapter/map-script-build");

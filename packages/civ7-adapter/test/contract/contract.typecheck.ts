import {
  createMockAdapter,
  type EngineAdapter,
  type FeatureData,
  findCiv7StandardMapSizePreset,
  getCiv7RowLatitude,
  type MockAdapterConfig,
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
findCiv7StandardMapSizePreset("MAPSIZE_STANDARD");
getCiv7RowLatitude({ firstRowLatitude: 90, exclusiveEndLatitude: -90 }, 1, 0);

// @ts-expect-error Concrete lowering and setup capture are owned by the mod realization.
import { captureCiv7MapGenerationSetup, createCiv7Adapter } from "@civ7/adapter";

// @ts-expect-error The adapter no longer exposes a concrete runtime subpath.
import("@civ7/adapter/civ7");

// @ts-expect-error Map-script compilation is owned by the mod realization.
import("@civ7/adapter/map-script-build");

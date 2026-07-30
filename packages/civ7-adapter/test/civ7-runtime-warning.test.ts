import { beforeAll, describe, expect, it, mock } from "bun:test";

mock.module("/base-standard/maps/map-globals.js", () => ({}));
mock.module("/base-standard/scripts/voronoi-utils.js", () => ({
  VoronoiUtils: {},
}));
mock.module("/base-standard/maps/feature-biome-generator.js", () => ({
  designateBiomes: () => {},
  addFeatures: () => {},
}));
mock.module("/base-standard/maps/snow-generator.js", () => ({
  generateSnow: () => {},
}));
mock.module("/base-standard/maps/discovery-generator.js", () => ({
  generateDiscoveries: () => {},
}));
mock.module("/base-standard/maps/resource-generator.js", () => ({}));
mock.module("/base-standard/maps/assign-starting-plots.js", () => ({
  assignStartPositions: () => [],
  chooseStartSectors: () => [],
}));
mock.module("/base-standard/maps/map-utilities.js", () => ({
  needHumanNearEquator: () => false,
}));
mock.module("/base-standard/maps/assign-advanced-start-region.js", () => ({
  assignAdvancedStartRegions: () => {},
}));
mock.module("/base-standard/maps/elevation-terrain-generator.js", () => ({
  generateLakes: () => {},
  expandCoasts: () => {},
}));

let Civ7AdapterCtor: typeof import("../src/civ7-adapter.js").Civ7Adapter;

beforeAll(async () => {
  ({ Civ7Adapter: Civ7AdapterCtor } = await import("../src/civ7-adapter.js"));
});

describe("Civ7 runtime warnings", () => {
  it("uses warn when the host provides it and falls back to tagged log output when it does not", () => {
    const adapter = new Civ7AdapterCtor(1, 1);
    const hostConsole = console as unknown as {
      warn?: (message: string) => void;
      log: (message: string) => void;
    };
    const originalWarn = hostConsole.warn;
    const originalLog = hostConsole.log;
    const warnings: string[] = [];
    const logs: string[] = [];

    try {
      hostConsole.warn = (message) => warnings.push(message);
      hostConsole.log = (message) => logs.push(message);
      adapter.emitRuntimeWarning("full console");
      expect(warnings).toEqual(["full console"]);
      expect(logs).toEqual([]);

      hostConsole.warn = undefined;
      adapter.emitRuntimeWarning("Civ7 isolate");
      expect(logs).toEqual(["[warn] Civ7 isolate"]);
    } finally {
      hostConsole.warn = originalWarn;
      hostConsole.log = originalLog;
    }
  });
});

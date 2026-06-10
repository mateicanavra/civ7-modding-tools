import { describe, expect, test } from "bun:test";

import {
  buildDryRunOutput,
  buildMutationOutput,
  parseArgs,
  type RiverModelingRuntimeInventory,
} from "./probe-river-modeling";

const runtimeInventory = {
  terrainBuilder: {
    exists: true,
    type: "object",
    ownKeys: ["modelRivers", "validateAndFixTerrain", "defineNamedRivers", "storeWaterData"],
    prototypeKeys: [],
    modelRivers: {
      exists: true,
      type: "function",
      length: 3,
      signature: "function modelRivers() { [native code] }",
    },
    validateAndFixTerrain: {
      exists: true,
      type: "function",
      length: 0,
      signature: "function validateAndFixTerrain() { [native code] }",
    },
    defineNamedRivers: {
      exists: true,
      type: "function",
      length: 0,
      signature: "function defineNamedRivers() { [native code] }",
    },
    storeWaterData: {
      exists: true,
      type: "function",
      length: 0,
      signature: "function storeWaterData() { [native code] }",
    },
  },
  riverTypes: { NO_RIVER: -1, RIVER_MINOR: 0, RIVER_NAVIGABLE: 1 },
  terrainNavigableRiver: 12,
  officialCompatibilityDefaults: {
    minLength: 5,
    maxLength: 15,
  },
} satisfies RiverModelingRuntimeInventory;

describe("river modeling probe", () => {
  test("keeps dry-run mode gated behind explicit disposable-session confirmation", () => {
    const output = buildDryRunOutput({ inventory: runtimeInventory });

    expect(output).toMatchObject({
      ok: false,
      status: "dry-run",
      mutationAttempted: false,
      blockedBy: ["river-modeling-probe.confirm-disposable-session"],
    });
  });

  test("reports writer-supported when the official sequence changes runtime river metadata", () => {
    const output = buildMutationOutput({
      inventory: runtimeInventory,
      preReadback: {
        plotCount: 4,
        omitted: 0,
        terrainNavigableRiver: 0,
        river: 0,
        navigableRiver: 0,
        minorRiver: 0,
        noRiver: 4,
        missingFacts: [],
        failedFacts: [],
      },
      mutation: {
        attempted: true,
        ok: true,
        sequence: ["modelRivers", "validateAndFixTerrain", "defineNamedRivers", "storeWaterData"],
        minLength: 5,
        maxLength: 15,
        navigableTerrain: 12,
      },
      postReadback: {
        plotCount: 4,
        omitted: 0,
        terrainNavigableRiver: 2,
        river: 3,
        navigableRiver: 2,
        minorRiver: 1,
        noRiver: 1,
        missingFacts: [],
        failedFacts: [],
      },
    });

    expect(output).toMatchObject({
      ok: true,
      status: "writer-supported",
      blockedBy: [],
      deltas: {
        terrainNavigableRiver: 2,
        river: 3,
        navigableRiver: 2,
        minorRiver: 1,
        noRiver: -3,
        terrainChanged: true,
        metadataChanged: true,
      },
    });
  });

  test("keeps a successful call unproven when metadata is unchanged", () => {
    const readback = {
      plotCount: 2,
      omitted: 0,
      terrainNavigableRiver: 1,
      river: 0,
      navigableRiver: 0,
      minorRiver: 0,
      noRiver: 2,
      missingFacts: [],
      failedFacts: [],
    };

    const output = buildMutationOutput({
      inventory: runtimeInventory,
      preReadback: readback,
      mutation: {
        attempted: true,
        ok: true,
        sequence: ["modelRivers", "validateAndFixTerrain", "defineNamedRivers", "storeWaterData"],
        minLength: 5,
        maxLength: 15,
        navigableTerrain: 12,
      },
      postReadback: readback,
    });

    expect(output).toMatchObject({
      ok: false,
      status: "unsupported-or-unproven",
      blockedBy: ["river-modeling-probe.metadata-unchanged"],
      deltas: {
        metadataChanged: false,
        terrainChanged: false,
      },
    });
  });

  test("parses official compatibility arguments", () => {
    expect(
      parseArgs([
        "--confirm-disposable-session",
        "--min-length",
        "10",
        "--max-length",
        "85",
        "--navigable-terrain",
        "44",
      ]),
    ).toMatchObject({
      confirmDisposableSession: true,
      minLength: 10,
      maxLength: 85,
      navigableTerrain: 44,
    });
  });
});

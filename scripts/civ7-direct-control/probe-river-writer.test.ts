import { describe, expect, test } from "bun:test";

import {
  CIV7_BROWSER_TABLES_V0,
  CIV7_RIVER_TYPE_METADATA_SOURCE,
  NO_RIVER_TYPE,
  RIVER_TYPE_MINOR,
  RIVER_TYPE_NAVIGABLE,
} from "../../packages/civ7-map-policy/src/index.ts";
import {
  buildDryRunOutput,
  buildMutationOutput,
  type RiverMetadataReadbackSummary,
  type RiverWriterRuntimeInventory,
  summarizeRiverMetadataReadback,
} from "./probe-river-writer";

const NAVIGABLE_RIVER_TERRAIN = CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_NAVIGABLE_RIVER;

const runtimeInventory = {
  terrainBuilder: {
    exists: true,
    type: "object",
    ownKeys: ["setRiverValidationValues"],
    prototypeKeys: [],
    setRiverValidationValues: {
      exists: true,
      type: "function",
      length: 0,
      signature: "function setRiverValidationValues() { [native code] }",
    },
  },
  mapRivers: {
    exists: true,
    type: "object",
    ownKeys: ["numRivers"],
    prototypeKeys: [],
  },
  riverTypes: CIV7_RIVER_TYPE_METADATA_SOURCE.values,
  terrainNavigableRiver: NAVIGABLE_RIVER_TERRAIN,
} satisfies RiverWriterRuntimeInventory;

describe("river writer probe", () => {
  test("dry-run output blocks mutation even when the native candidate exists", () => {
    const output = buildDryRunOutput({ inventory: runtimeInventory });

    expect(output).toMatchObject({
      ok: false,
      status: "dry-run",
      mutationAttempted: false,
      blockedBy: ["river-writer-probe.confirm-disposable-session"],
    });
  });

  test("summarizes terrain-row and metadata river readback separately", () => {
    const summary = summarizeRiverMetadataReadback({
      plotCount: 3,
      omitted: 0,
      plots: [
        {
          facts: {
            terrain: { ok: true, value: NAVIGABLE_RIVER_TERRAIN },
            riverType: { ok: true, value: NO_RIVER_TYPE },
            river: { ok: true, value: false },
            navigableRiver: { ok: true, value: false },
          },
        },
        {
          facts: {
            terrain: { ok: true, value: 2 },
            riverType: { ok: true, value: RIVER_TYPE_MINOR },
            river: { ok: true, value: true },
            navigableRiver: { ok: true, value: false },
          },
        },
        {
          facts: {
            terrain: { ok: true, value: NAVIGABLE_RIVER_TERRAIN },
            riverType: { ok: true, value: RIVER_TYPE_NAVIGABLE },
            river: { ok: true, value: true },
            navigableRiver: { ok: true, value: true },
          },
        },
      ],
    } as Parameters<typeof summarizeRiverMetadataReadback>[0]);

    expect(summary).toMatchObject({
      plotCount: 3,
      terrainNavigableRiver: 2,
      noRiver: 1,
      minorRiver: 1,
      navigableRiver: 1,
      river: 2,
      missingFacts: [],
      failedFacts: [],
    });
  });

  test("keeps a successful native call unproven when metadata readback is unchanged", () => {
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
    } satisfies RiverMetadataReadbackSummary;

    const output = buildMutationOutput({
      inventory: runtimeInventory,
      preReadback: readback,
      mutation: { attempted: true, ok: true, returnedType: "undefined" },
      postReadback: readback,
    });

    expect(output).toMatchObject({
      ok: false,
      status: "unsupported-or-unproven",
      blockedBy: ["river-writer-probe.metadata-unchanged"],
      deltas: {
        metadataChanged: false,
        terrainChanged: false,
      },
    });
  });
});

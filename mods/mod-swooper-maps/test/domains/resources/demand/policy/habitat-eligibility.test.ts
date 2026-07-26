import { describe, expect, it } from "bun:test";
import type { OfficialResourceType } from "@civ7/map-policy";
import {
  buildHabitatEligibility,
  type HabitatMaskFields,
  RESOURCE_HABITAT_SIGNALS,
} from "@mapgen/domain/resources";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const { width, height } = TEST_MAP_SIZE.dimensions;
const size = width * height;

describe("resource demand habitat eligibility policy", () => {
  it("admits crabs from the navigable-river-mouth signal", () => {
    const result = resolveEligibility(
      "RESOURCE_CRABS",
      fieldsWith("navigableRiverMouthMask", oneAt(4))
    );

    expect(result.signalFields).toEqual(["navigableRiverMouthMask"]);
    expect(result.eligibleTileCount).toBe(1);
    expect(result.mask[4]).toBe(1);
  });

  it("preserves the distinct cultivated highland, coastal, oasis, and wetland lanes", () => {
    const cases = [
      {
        resourceType: "RESOURCE_TEA",
        field: "highlandOrReliefMask",
        laneId: "highland-medicinal",
        laneKind: "land",
        plotIndex: 2,
      },
      {
        resourceType: "RESOURCE_DYES",
        field: "coastalMarineMask",
        laneId: "marine-dye",
        laneKind: "water",
        plotIndex: 3,
      },
      {
        resourceType: "RESOURCE_DATES",
        field: "oasisOrDesertWaterMask",
        laneId: "arid-oasis-resin",
        laneKind: "land",
        plotIndex: 5,
      },
      {
        resourceType: "RESOURCE_RICE",
        field: "wetlandPaddyMask",
        laneId: "wetland-paddy",
        laneKind: "land",
        plotIndex: 7,
      },
    ] as const satisfies readonly {
      resourceType: OfficialResourceType;
      field: keyof HabitatMaskFields;
      laneId: string;
      laneKind: "land" | "water";
      plotIndex: number;
    }[];

    for (const row of cases) {
      const signal = requireSignal(row.resourceType);
      const result = buildHabitatEligibility(
        fieldsWith(row.field, oneAt(row.plotIndex)),
        size,
        signal
      );

      expect(signal.laneId, row.resourceType).toBe(row.laneId);
      expect(signal.laneKind, row.resourceType).toBe(row.laneKind);
      expect(result.signalFields, row.resourceType).toContain(row.field);
      expect(result.eligibleTileCount, row.resourceType).toBe(1);
      expect(result.mask[row.plotIndex], row.resourceType).toBe(1);
    }
  });

  it("keeps narrow geological proxies from broadening into adjacent signal fields", () => {
    const cases = [
      {
        resourceType: "RESOURCE_JADE",
        admittedField: "ultramaficMask",
        unrelatedField: "alluvialPlacerMask",
      },
      {
        resourceType: "RESOURCE_NITER",
        admittedField: "aridSoilMask",
        unrelatedField: "wetAlluvialMask",
      },
      {
        resourceType: "RESOURCE_LIMESTONE",
        admittedField: "carbonateBeltMask",
        unrelatedField: "tundraDesertHillMask",
      },
      {
        resourceType: "RESOURCE_RUBIES",
        admittedField: "metamorphicBeltMask",
        unrelatedField: "carbonateBeltMask",
      },
    ] as const satisfies readonly {
      resourceType: OfficialResourceType;
      admittedField: keyof HabitatMaskFields;
      unrelatedField: keyof HabitatMaskFields;
    }[];

    for (const row of cases) {
      const signal = requireSignal(row.resourceType);
      const admitted = buildHabitatEligibility(
        fieldsWith(row.admittedField, oneAt(1)),
        size,
        signal
      );
      const broadened = buildHabitatEligibility(
        fieldsWith(row.unrelatedField, oneAt(1)),
        size,
        signal
      );

      expect(signal.primary, row.resourceType).toContain(row.admittedField);
      expect(signal.primary, row.resourceType).not.toContain(row.unrelatedField);
      expect(admitted.eligibleTileCount, row.resourceType).toBe(1);
      expect(broadened.eligibleTileCount, row.resourceType).toBe(0);
    }

    expect(requireSignal("RESOURCE_COAL").primary).toEqual([
      "sedimentaryBasinMask",
      "forestWetlandBasinMask",
    ]);
  });

  it("applies terrestrial and geological suppressors after primary admission", () => {
    const cases = [
      {
        resourceType: "RESOURCE_HORSES",
        primaryField: "openGrassPlainsMask",
        suppressionField: "denseForestMask",
        suppressedPlot: 0,
      },
      {
        resourceType: "RESOURCE_WILD_GAME",
        primaryField: "diverseWildHabitatMask",
        suppressionField: "cultivatedPressureMask",
        suppressedPlot: 1,
      },
      {
        resourceType: "RESOURCE_GOLD",
        primaryField: "orogenyMask",
        suppressionField: "flatNonGeologicMask",
        suppressedPlot: 2,
      },
      {
        resourceType: "RESOURCE_OIL",
        primaryField: "hydrocarbonBasinMask",
        suppressionField: "offshoreMask",
        suppressedPlot: 3,
      },
      {
        resourceType: "RESOURCE_LIMESTONE",
        primaryField: "carbonateBeltMask",
        suppressionField: "igneousTerrainMask",
        suppressedPlot: 4,
      },
    ] as const satisfies readonly {
      resourceType: OfficialResourceType;
      primaryField: keyof HabitatMaskFields;
      suppressionField: keyof HabitatMaskFields;
      suppressedPlot: number;
    }[];

    for (const row of cases) {
      const signal = requireSignal(row.resourceType);
      const result = buildHabitatEligibility(
        fieldsWith(
          row.primaryField,
          new Uint8Array(size).fill(1),
          row.suppressionField,
          oneAt(row.suppressedPlot)
        ),
        size,
        signal
      );

      expect(signal.suppress, row.resourceType).toContain(row.suppressionField);
      expect(result.eligibleTileCount, row.resourceType).toBe(size - 1);
      expect(result.mask[row.suppressedPlot], row.resourceType).toBe(0);
    }
  });
});

function requireSignal(resourceType: OfficialResourceType) {
  const signal = RESOURCE_HABITAT_SIGNALS.get(resourceType);
  if (!signal) throw new Error(`Missing habitat signal for ${resourceType}.`);
  return signal;
}

function resolveEligibility(resourceType: OfficialResourceType, fields: HabitatMaskFields) {
  return buildHabitatEligibility(fields, size, requireSignal(resourceType));
}

function fieldsWith(
  field: keyof HabitatMaskFields,
  mask: Uint8Array,
  secondField?: keyof HabitatMaskFields,
  secondMask?: Uint8Array
): HabitatMaskFields {
  const fields: HabitatMaskFields = { [field]: mask };
  if (secondField !== undefined && secondMask !== undefined) fields[secondField] = secondMask;
  return fields;
}

function oneAt(plotIndex: number): Uint8Array {
  const mask = new Uint8Array(size);
  mask[plotIndex] = 1;
  return mask;
}

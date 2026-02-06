import { describe, expect, it } from "bun:test";

import { foundationArtifacts } from "../../src/recipes/standard/stages/foundation/artifacts.js";
import { M1_FOUNDATION_GATES } from "../support/foundation-invariants.js";

function findGate(name: string) {
  const gate = M1_FOUNDATION_GATES.find((entry) => entry.name === name);
  if (!gate) throw new Error(`Missing gate ${name}`);
  return gate;
}

function makeInvariantContext(artifacts: Map<string, unknown>, width = 2, height = 1) {
  return {
    context: {
      artifacts,
      dimensions: { width, height },
    } as any,
    fingerprints: { artifacts: {}, missing: [] },
  };
}

describe("foundation invariant gates", () => {
  it("fails the coupling gate when plateFitRms has non-finite values", () => {
    const artifacts = new Map<string, unknown>([
      [
        foundationArtifacts.mantleForcing.id,
        {
          forcingU: new Float32Array([1, 1]),
          forcingV: new Float32Array([0, 0]),
        },
      ],
      [
        foundationArtifacts.plateMotion.id,
        {
          plateFitRms: new Float32Array([Number.NaN, 0.2]),
          plateQuality: new Uint8Array([120, 120]),
          cellFitError: new Uint8Array([10, 10]),
        },
      ],
    ]);

    const gate = findGate("foundation-plate-motion-coupling");
    const result = gate.check(makeInvariantContext(artifacts));

    expect(result.ok).toBe(false);
    expect(result.message).toContain("non-finite");
    expect((result.details as { nonFinite?: number } | undefined)?.nonFinite).toBe(1);
  });

  it("includes era-0 origins in provenance causality checks", () => {
    const size = 16;
    const zeroes = new Uint8Array(size);
    const artifacts = new Map<string, unknown>([
      [
        foundationArtifacts.tectonicHistoryTiles.id,
        {
          perEra: [
            {
              boundaryType: zeroes,
              upliftPotential: zeroes,
              riftPotential: zeroes,
              shearStress: zeroes,
              volcanism: zeroes,
              fracture: zeroes,
            },
            {
              boundaryType: zeroes,
              upliftPotential: new Uint8Array(size).fill(80),
              riftPotential: zeroes,
              shearStress: zeroes,
              volcanism: zeroes,
              fracture: zeroes,
            },
          ],
          rollups: {
            upliftTotal: zeroes,
            fractureTotal: zeroes,
            volcanismTotal: zeroes,
          },
        },
      ],
      [
        foundationArtifacts.tectonicProvenanceTiles.id,
        {
          originEra: new Uint8Array(size).fill(0),
          lastBoundaryEra: new Uint8Array(size).fill(255),
        },
      ],
    ]);

    const gate = findGate("foundation-event-provenance-causality");
    const result = gate.check(
      makeInvariantContext(
        artifacts,
        4,
        4
      )
    );

    expect(result.ok).toBe(false);
    expect(result.message).toContain("Origin resets lack same-era event signal");
    expect((result.details as { originCount?: number } | undefined)?.originCount).toBe(size);
  });
});

import { describe, expect, it } from "bun:test";

import { foundationArtifacts } from "../../src/recipes/standard/stages/foundation/artifacts.js";
import { M1_FOUNDATION_GATES } from "../support/foundation-invariants.js";

function findGate(name: string) {
  const gate = M1_FOUNDATION_GATES.find((entry) => entry.name === name);
  if (!gate) throw new Error(`Missing gate ${name}`);
  return gate;
}

function makeInvariantContext(artifacts: Map<string, unknown>) {
  return {
    context: {
      artifacts,
      dimensions: { width: 2, height: 1 },
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
});

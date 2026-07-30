import { describe, expect, it } from "bun:test";

import foundation from "@mapgen/domain/foundation/router";
import { normalizeOperationSelectionForTest, TestCompileError } from "@swooper/mapgen-core/testing";

const { computeEraPlateMembership } = foundation.tectonics.ops;

describe("foundation/compute-era-plate-membership config", () => {
  it("admits only schedules whose weights and drift budgets describe the same eras", () => {
    let refusal: unknown;
    try {
      normalizeOperationSelectionForTest(computeEraPlateMembership, {
        strategy: "backward-drift",
        config: {
          eraWeights: [0.3, 0.25, 0.2, 0.15, 0.1],
          driftStepsByEra: [12, 9, 6, 3, 1, 0],
        },
      });
    } catch (error) {
      refusal = error;
    }

    expect(refusal).toBeInstanceOf(TestCompileError);
    expect((refusal as TestCompileError).errors).toContainEqual({
      code: "config.invalid",
      path: "/ops/foundation/compute-era-plate-membership/config",
      message: "Era weights and backward-advection steps must describe the same eras.",
    });

    expect(
      normalizeOperationSelectionForTest(computeEraPlateMembership, {
        strategy: "backward-drift",
        config: {
          eraWeights: [0.3, 0.25, 0.2, 0.15, 0.1],
          driftStepsByEra: [12, 9, 6, 3, 1],
        },
      })
    ).toEqual({
      strategy: "backward-drift",
      config: {
        eraWeights: [0.3, 0.25, 0.2, 0.15, 0.1],
        driftStepsByEra: [12, 9, 6, 3, 1],
      },
    });
  });
});

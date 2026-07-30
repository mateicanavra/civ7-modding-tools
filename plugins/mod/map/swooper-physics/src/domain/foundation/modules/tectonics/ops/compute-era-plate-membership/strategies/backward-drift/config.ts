import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

const ERA_COUNT_MIN = 5;
const ERA_COUNT_MAX = 8;

/**
 * Defines oldest-to-newest era weights and backward-advection budgets; both arrays must describe
 * the same five to eight eras. Defaults reconstruct five increasingly recent eras with
 * progressively shorter drift.
 */
export default defineStrategy({
  id: "backward-drift",
  config: Type.Refine(
    Type.Object(
      {
        eraWeights: Type.Array(
          Type.Number({
            minimum: 0,
            maximum: 10,
            description:
              "Controls one era's contribution weight when pseudo-evolution history is rolled forward.",
          }),
          {
            default: [0.3, 0.25, 0.2, 0.15, 0.1],
            minItems: ERA_COUNT_MIN,
            maxItems: ERA_COUNT_MAX,
            description:
              "Controls per-era history weights from oldest to newest; array length determines era count (5..8).",
          }
        ),
        driftStepsByEra: Type.Array(
          Type.Integer({
            minimum: 0,
            maximum: 16,
            description:
              "Controls one era's drift step count when reconstructing plate membership history.",
          }),
          {
            default: [12, 9, 6, 3, 1],
            minItems: ERA_COUNT_MIN,
            maxItems: ERA_COUNT_MAX,
            description:
              "Controls per-era drift steps from oldest to newest; array length determines era count (5..8).",
          }
        ),
      },
      {
        additionalProperties: false,
        description:
          "Era weights and backward-advection steps used to reconstruct historical plate membership from present-day plate seeds.",
      }
    ),
    (config) => config.eraWeights.length === config.driftStepsByEra.length,
    () => "Era weights and backward-advection steps must describe the same eras."
  ),
});

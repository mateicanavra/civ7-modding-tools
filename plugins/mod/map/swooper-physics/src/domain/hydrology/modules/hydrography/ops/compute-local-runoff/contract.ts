import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import annualWaterYieldDefinition from "./strategies/annual-water-yield/config.js";

/** Partitions annual dry-ground precipitation by water and energy availability before routing. */
const ComputeLocalRunoffContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-local-runoff",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      externalWaterMask: TypedArraySchemas.u8(),
      precipitation: TypedArraySchemas.f32({ description: "Baseline annual precipitation in empirical rainfall-index units, not clipped native rainfall." }),
      potentialDemand: TypedArraySchemas.f32({ description: "Same-vintage baseline mean seasonal demand in rainfall-index-equivalent units; not recomputed from annual or refined temperature." }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      runoff: Type.Array(Type.Number({ minimum: 0 }), {
        description:
          "Map-grid Number-precision approximate annual dry-ground water yield on all finite ground; zero on prescribed external water. Withheld actual ET is limited by precipitation and potential demand; the basin substitutes wet P-D on its final wet footprint.",
      }),
    },
    { additionalProperties: false }
  ),
  strategies: [annualWaterYieldDefinition],
});
export default ComputeLocalRunoffContract;

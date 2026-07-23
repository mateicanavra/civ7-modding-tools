import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as PlateIdByEraArtifact } from "../../artifacts/plate-id-by-era.artifact.js";
import { artifact as FoundationTectonicEraFieldsInternalListArtifact } from "../../artifacts/tectonic-era-fields.artifact.js";
import { artifact as FoundationTectonicHistoryArtifact } from "../../artifacts/tectonic-history.artifact.js";

const StrategySchema = Type.Object(
  {
    activityThreshold: Type.Integer({
      default: 1,
      minimum: 0,
      maximum: 255,
      description: "Threshold used to compute lastActiveEra (0..255).",
    }),
  },
  { additionalProperties: false }
);

const ComputeTectonicHistoryRollupsContract = defineOp({
  kind: "compute",
  id: "foundation/compute-tectonic-history-rollups",
  input: Type.Object(
    {
      eras: FoundationTectonicEraFieldsInternalListArtifact.schema,
      plateIdByEra: PlateIdByEraArtifact.schema,
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      tectonicHistory: FoundationTectonicHistoryArtifact.schema,
    },
    {
      additionalProperties: false,
      description:
        "Mesh-wide tectonic history that preserves every reconstructed era and plate assignment while aggregating cumulative, recent, and last-active signals per cell.",
    }
  ),
  strategies: {
    "cumulative-era-rollup": StrategySchema,
  },
});

export default ComputeTectonicHistoryRollupsContract;
export type ComputeTectonicHistoryRollupsConfig = Static<typeof StrategySchema>;

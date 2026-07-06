import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import { Schema as FoundationTectonicEraFieldsInternalListSchema } from "../../artifacts/tectonic-era-fields.artifact.js";
import { Schema as TectonicEventsSchema } from "../../artifacts/tectonic-events.artifact.js";
import { FoundationMeshSchema } from "../compute-mesh/contract.js";

const FoundationTectonicEraFieldsInternalSchema =
  FoundationTectonicEraFieldsInternalListSchema.items;

const StrategySchema = Type.Object(
  {
    beltInfluenceDistance: Type.Integer({
      default: 8,
      minimum: 1,
      maximum: 64,
      description: "Controls how far tectonic belt influence spreads across mesh-neighbor steps.",
    }),
    beltDecay: Type.Number({
      default: 0.55,
      minimum: 0.01,
      maximum: 10,
      description:
        "Controls the exponential decay rate for tectonic belt influence per mesh-neighbor step.",
    }),
    orogenyActivityGain: Type.Number({
      default: 1,
      minimum: 0,
      maximum: 10,
      description:
        "Activity gain on convergent-uplift and subduction-volcanism emission intensity, applied AFTER boundary-regime classification (so regime topology is fixed and the lever stays smooth/monotonic). Set by the foundation-tectonics plateActivity knob; a direct authored value is overwritten by the knob. 1 is an exact no-op.",
    }),
  },
  { additionalProperties: false }
);

const ComputeEraTectonicFieldsContract = defineOp({
  kind: "compute",
  id: "foundation/compute-era-tectonic-fields",
  input: Type.Object(
    {
      mesh: FoundationMeshSchema,
      segmentEvents: TectonicEventsSchema,
      hotspotEvents: TectonicEventsSchema,
      weight: Type.Number({ minimum: 0, maximum: 10 }),
      eraGain: Type.Number({ minimum: 0, maximum: 10 }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      eraFields: FoundationTectonicEraFieldsInternalSchema,
    },
    { additionalProperties: false }
  ),
  strategies: {
    default: StrategySchema,
  },
});

export default ComputeEraTectonicFieldsContract;
export type ComputeEraTectonicFieldsConfig = Static<typeof StrategySchema>;

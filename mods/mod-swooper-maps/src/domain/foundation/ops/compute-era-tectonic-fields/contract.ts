import { Type, defineOp } from "@swooper/mapgen-core/authoring";
import type { Static } from "@swooper/mapgen-core/authoring";

import { FoundationMeshSchema } from "../compute-mesh/contract.js";
import {
  FoundationTectonicEraFieldsInternalSchema,
  TectonicEventsSchema,
} from "../compute-tectonic-history/lib/internal-contract.js";

const StrategySchema = Type.Object(
  {
    beltInfluenceDistance: Type.Integer({
      default: 8,
      minimum: 1,
      maximum: 64,
      description: "Base belt influence distance in mesh-neighbor steps.",
    }),
    beltDecay: Type.Number({
      default: 0.55,
      minimum: 0.01,
      maximum: 10,
      description: "Exponential decay coefficient for belt influence per mesh-neighbor step.",
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

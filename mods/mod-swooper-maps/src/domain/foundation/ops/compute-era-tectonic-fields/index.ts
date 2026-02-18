import { createOp } from "@swooper/mapgen-core/authoring";

import { requireMesh } from "../../lib/require.js";
import { buildEraFields, deriveEmissionParams } from "../compute-tectonic-history/lib/pipeline-core.js";
import type { TectonicEventRecord } from "../compute-tectonic-history/lib/internal-contract.js";
import ComputeEraTectonicFieldsContract from "./contract.js";

const computeEraTectonicFields = createOp(ComputeEraTectonicFieldsContract, {
  strategies: {
    default: {
      run: (input, config) => {
        const mesh = requireMesh(input.mesh, "foundation/compute-era-tectonic-fields");
        const segmentEvents = (input.segmentEvents ?? []) as TectonicEventRecord[];
        const hotspotEvents = (input.hotspotEvents ?? []) as TectonicEventRecord[];
        const events: TectonicEventRecord[] = [...segmentEvents, ...hotspotEvents];
        const emission = deriveEmissionParams({
          beltInfluenceDistance: config.beltInfluenceDistance,
          beltDecay: config.beltDecay,
        });

        const eraFields = buildEraFields({
          mesh,
          events,
          weight: input.weight,
          eraGain: input.eraGain,
          driftSteps: 0,
          emission,
        });

        return { eraFields } as const;
      },
    },
  },
});

export default computeEraTectonicFields;

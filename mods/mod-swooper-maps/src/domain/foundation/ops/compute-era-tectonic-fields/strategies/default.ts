import { createStrategy } from "@swooper/mapgen-core/authoring";

import { buildEraFields, deriveEmissionParams, requireMesh } from "../rules/index.js";
import type { TectonicEventRecord } from "../rules/index.js";
import ComputeEraTectonicFieldsContract from "../contract.js";

export const defaultStrategy = createStrategy(ComputeEraTectonicFieldsContract, "default", {
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
});

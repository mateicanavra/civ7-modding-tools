import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeEraTectonicFieldsContract from "../contract.js";
import type { TectonicEventRecord } from "../rules/index.js";
import { buildEraFields, deriveEmissionParams } from "../rules/index.js";

export const eventDistanceDecayStrategy = createStrategy(
  ComputeEraTectonicFieldsContract,
  "event-distance-decay",
  {
    run: (input, config) => {
      const mesh = input.mesh;
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
        activityGain: config.orogenyActivityGain,
        driftSteps: 0,
        emission,
      });

      return { eraFields } as const;
    },
  }
);

import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeEraTectonicFieldsContract from "../../contract.js";
import { buildEraFields, deriveEmissionParams } from "../../rules/index.js";
import EventDistanceDecayDefinition from "./config.js";

/**
 * Spreads discrete tectonic events across the mesh using bounded distance decay.
 * Rules own the emission math; the strategy adapts admitted operation inputs and authored config.
 */
export default createStrategy(ComputeEraTectonicFieldsContract, EventDistanceDecayDefinition, {
  run: (input, config) => {
    const mesh = input.mesh;
    const segmentEvents = input.segmentEvents ?? [];
    const hotspotEvents = input.hotspotEvents ?? [];
    const events = [...segmentEvents, ...hotspotEvents];
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
});

import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { routing } from "./steps/index.js";

/**
 * Morphology-routing has no knobs today (reserved for basin/outlet expansions).
 */
const knobsSchema = Type.Object(
  {},
  { additionalProperties: false, description: "Morphology-routing knobs." }
);

export default createStage({
  id: "morphology-routing",
  knobsSchema,
  public: Type.Object({}, { additionalProperties: false, description: "Morphology routing has no authored controls today." }),
  steps: [routing],
  compile: () => ({
    routing: {
      routing: { strategy: "default", config: {} },
    },
  }),
} as const);

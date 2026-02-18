import { Type, createStage, type Static } from "@swooper/mapgen-core/authoring";
import { routing } from "./steps/index.js";

/**
 * Advanced Morphology-routing step config baseline.
 */
const publicSchema = Type.Object(
  {
    advanced: Type.Optional(
      Type.Object(
        {
          routing: Type.Optional(routing.contract.schema),
        },
        {
          additionalProperties: false,
          description: "Advanced Morphology-routing step config baseline.",
        }
      )
    ),
  },
  { additionalProperties: false }
);

type MorphologyRoutingStageConfig = Static<typeof publicSchema>;

/**
 * Morphology-routing has no knobs today (reserved for basin/outlet expansions).
 */
const knobsSchema = Type.Object({}, { additionalProperties: false, description: "Morphology-routing knobs." });

export default createStage({
  id: "morphology-routing",
  knobsSchema,
  public: publicSchema,
  compile: ({ config }: { config: MorphologyRoutingStageConfig }) => (config.advanced ? config.advanced : {}),
  steps: [routing],
} as const);

import { Type, createStage, type Static } from "@swooper/mapgen-core/authoring";
import {
  HydrologyLakeinessKnobSchema,
  HydrologyRiverDensityKnobSchema,
} from "@mapgen/domain/hydrology/shared/knobs.js";
import { lakes, plotRivers } from "./steps/index.js";

/**
 * Advanced Map-hydrology step config baseline (engine projection tuning).
 * Knobs apply last as deterministic transforms over this baseline.
 */
const publicSchema = Type.Object(
  {
    advanced: Type.Optional(
      Type.Object(
        {
          lakes: Type.Optional(lakes.contract.schema),
          "plot-rivers": Type.Optional(plotRivers.contract.schema),
        },
        {
          additionalProperties: false,
          description:
            "Advanced Map-hydrology step config baseline (engine projection tuning). Knobs apply last as deterministic transforms over this baseline.",
        }
      )
    ),
  },
  { additionalProperties: false }
);

type MapHydrologyStageConfig = Static<typeof publicSchema>;

const knobsSchema = Type.Object(
  {
    lakeiness: Type.Optional(HydrologyLakeinessKnobSchema),
    riverDensity: Type.Optional(HydrologyRiverDensityKnobSchema),
  },
  {
    description:
      "Map-hydrology knobs (lakeiness/riverDensity). Knobs apply to engine projection only.",
  }
);

export default createStage({
  id: "map-hydrology",
  knobsSchema,
  public: publicSchema,
  compile: ({ config }: { config: MapHydrologyStageConfig }) => (config.advanced ? config.advanced : {}),
  steps: [lakes, plotRivers],
} as const);

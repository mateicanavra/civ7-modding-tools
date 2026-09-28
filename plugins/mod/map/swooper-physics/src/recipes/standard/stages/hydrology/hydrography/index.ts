import { createStage, type Static, Type } from "@swooper/mapgen-core/authoring";
import hydrology from "../../../../../domain/hydrology/index.js";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import {
  applyHydrologyLakeinessPolicy,
  HYDROLOGY_RIVER_DENSITY_MAJOR_PERCENTILE,
  HYDROLOGY_RIVER_DENSITY_MINOR_PERCENTILE,
} from "./model/policy/hydrography-knob-policy.js";
import { NetworkStep } from "./steps/network/step.js";

const ops = hydrology.hydrography.ops;
const envelopes = NetworkStep.contract.schema.properties;
type NetworkConfig = Static<typeof NetworkStep.contract.schema>;

/** Authors exactly one physical model; inactive static envelopes are private compiler plumbing. */
export default createStage({
  id: "hydrology-hydrography",
  knobsSchema: Type.Object(
    {
      riverDensity: Type.Union(
        [Type.Literal("sparse"), Type.Literal("normal"), Type.Literal("dense")],
        {
          default: "normal",
          description: "Adjusts minor and major channel discharge thresholds relative to authored values.",
        }
      ),
    },
    {
      additionalProperties: false,
      description: "River-density controls shared by both physical water models.",
    }
  ),
  public: Type.Object(
    {
      water: Type.Union(
        [
          Type.Object(
            {
              model: Type.Literal("legacy-sink-budget"),
              lakeiness: Type.Union(
                [Type.Literal("few"), Type.Literal("normal"), Type.Literal("many")],
                {
                  default: "normal",
                  description: "Adjusts legacy sink admission and lake expansion budgets relative to authored values.",
                }
              ),
              drainageRouting: envelopes.drainageRouting,
              accumulateDischarge: envelopes.accumulateDischarge,
              planLakes: envelopes.planLakes,
              classifyRiverNetwork: envelopes.classifyRiverNetwork,
            },
            {
              additionalProperties: false,
              description: "Legacy conditioned drainage with budgeted sink lakes and river classification.",
            }
          ),
          Type.Object(
            {
              model: Type.Literal("certified-sill-spill"),
              computeLocalRunoff: envelopes.computeLocalRunoff,
              computeDrainageBasins: envelopes.computeDrainageBasins,
              computeOpenBasinNetwork: envelopes.computeOpenBasinNetwork,
              classifyBasinRiverNetwork: envelopes.classifyBasinRiverNetwork,
            },
            {
              additionalProperties: false,
              description: "Certified sill-spill basins with complete wet footprints and body-aware river topology.",
            }
          ),
        ],
        {
          description: "Selects one physical water model and exposes only its applicable operation controls.",
          default: {
            model: "legacy-sink-budget",
            lakeiness: "normal",
            drainageRouting: ops.computeDrainageRouting.defaultConfig,
            accumulateDischarge: ops.accumulateDischarge.defaultConfig,
            planLakes: ops.planLakes.defaultConfig,
            classifyRiverNetwork: ops.classifyRiverNetwork.defaultConfig,
          },
        }
      ),
      projectRiverNetwork: envelopes.projectRiverNetwork,
    },
    { additionalProperties: false }
  ),
  compile: ({ config, knobs }) => {
    const authored = config.projectRiverNetwork;
    const minorDelta =
      HYDROLOGY_RIVER_DENSITY_MINOR_PERCENTILE[knobs.riverDensity] -
      HYDROLOGY_RIVER_DENSITY_MINOR_PERCENTILE.normal;
    const majorDelta =
      HYDROLOGY_RIVER_DENSITY_MAJOR_PERCENTILE[knobs.riverDensity] -
      HYDROLOGY_RIVER_DENSITY_MAJOR_PERCENTILE.normal;
    const projectRiverNetwork = {
      ...authored,
      config: {
        ...authored.config,
        minorPercentile: Math.max(0, Math.min(1, authored.config.minorPercentile + minorDelta)),
        majorPercentile: Math.max(0, Math.min(1, authored.config.majorPercentile + majorDelta)),
      },
    };
    const water = config.water;
    if (water.model === "legacy-sink-budget")
      return {
        network: {
          model: water.model,
          projectRiverNetwork,
          drainageRouting: water.drainageRouting,
          accumulateDischarge: water.accumulateDischarge,
          planLakes: {
            ...water.planLakes,
            config: {
              ...water.planLakes.config,
              ...applyHydrologyLakeinessPolicy(water.planLakes.config, water.lakeiness),
            },
          },
          classifyRiverNetwork: water.classifyRiverNetwork,
          computeLocalRunoff: ops.computeLocalRunoff.defaultConfig,
          computeDrainageBasins: ops.computeDrainageBasins.defaultConfig,
          computeOpenBasinNetwork: ops.computeOpenBasinNetwork.defaultConfig,
          classifyBasinRiverNetwork: ops.classifyBasinRiverNetwork.defaultConfig,
        } satisfies NetworkConfig,
      };
    return {
      network: {
        model: water.model,
        projectRiverNetwork,
        computeLocalRunoff: water.computeLocalRunoff,
        computeDrainageBasins: water.computeDrainageBasins,
        computeOpenBasinNetwork: water.computeOpenBasinNetwork,
        classifyBasinRiverNetwork: water.classifyBasinRiverNetwork,
        drainageRouting: ops.computeDrainageRouting.defaultConfig,
        accumulateDischarge: ops.accumulateDischarge.defaultConfig,
        planLakes: ops.planLakes.defaultConfig,
        classifyRiverNetwork: ops.classifyRiverNetwork.defaultConfig,
      } satisfies NetworkConfig,
    };
  },
  steps: orderStandardStageSteps("hydrology-hydrography", { network: NetworkStep }),
});

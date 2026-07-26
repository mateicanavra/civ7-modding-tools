import { ISLAND_FORMATION_CLASS } from "@mapgen/domain/morphology/modules/landforms/model/policy/island-formation.js";
import { deriveStepSeed } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { defineStandardVizCategoryMeta, STANDARD_VIZ_COLORS } from "../../../../../viz.js";
import { config } from "./config.js";

const GROUP_ISLANDS = "Morphology / Islands";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Publishes operation-owned island topography and projects its formation evidence.
 */
export const IslandsStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const plates = deps.artifacts.foundationPlates.read(context);
    const topography = deps.artifacts.erodedTopography.read(context);
    const coastline = deps.artifacts.baseCoastline.read(context);
    const result = ops.islands(
      {
        width,
        height,
        elevation: topography.elevation,
        seaLevel: topography.seaLevel,
        landMask: topography.landMask,
        bathymetry: topography.bathymetry,
        distanceToCoast: coastline.distanceToCoast,
        boundaryCloseness: plates.boundaryCloseness,
        boundaryType: plates.boundaryType,
        volcanism: plates.volcanism,
        rngSeed: deriveStepSeed(context.setup.mapSeed, "morphology:computeIslandTopography"),
      },
      stepConfig.islands
    );

    context.trace.event(() => {
      let islandChainTiles = 0;
      let microcontinentTiles = 0;
      for (const formationClass of result.islandClass) {
        if (formationClass === ISLAND_FORMATION_CLASS.islandChain) islandChainTiles += 1;
        if (formationClass === ISLAND_FORMATION_CLASS.microcontinent) microcontinentTiles += 1;
      }
      return {
        kind: "morphology.islands.summary",
        islandChainTiles,
        microcontinentTiles,
      };
    });
    deps.artifacts.topography.publish(context, result.topography);
    return result.islandClass;
  },
  viz: ({ result: islandClass, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "morphology.islands.formationClass",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: islandClass },
      meta: defineStandardVizCategoryMeta(
        "morphology.islands.formationClass",
        [
          {
            value: ISLAND_FORMATION_CLASS.unchanged,
            label: "Unchanged",
            color: STANDARD_VIZ_COLORS.absent,
          },
          {
            value: ISLAND_FORMATION_CLASS.islandChain,
            label: "Island Chain",
            color: STANDARD_VIZ_COLORS.land,
          },
          {
            value: ISLAND_FORMATION_CLASS.microcontinent,
            label: "Microcontinent",
            color: STANDARD_VIZ_COLORS.field.high,
          },
        ],
        {
          label: "Island Formation Class",
          group: GROUP_ISLANDS,
        }
      ),
    },
  ],
});

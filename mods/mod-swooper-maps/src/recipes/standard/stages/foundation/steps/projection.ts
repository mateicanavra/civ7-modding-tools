import { computeSampleStep, defineVizMeta, renderAsciiGrid } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { foundationArtifacts } from "../artifacts.js";
import ProjectionStepContract from "./projection.contract.js";
import {
  validateCrustTilesArtifact,
  validatePlatesArtifact,
  validateTileToCellIndexArtifact,
  wrapFoundationValidate,
} from "./validation.js";
import {
  FOUNDATION_PLATE_ACTIVITY_BOUNDARY_INFLUENCE_DISTANCE_DELTA,
  FOUNDATION_PLATE_ACTIVITY_KINEMATICS_MULTIPLIER,
} from "@mapgen/domain/foundation/shared/knob-multipliers.js";
import type { FoundationPlateActivityKnob } from "@mapgen/domain/foundation/shared/knobs.js";

const GROUP_PLATES = "Foundation / Plates";
const GROUP_CRUST_TILES = "Foundation / Crust Tiles";
const GROUP_TILE_MAP = "Foundation / Tile Mapping";

function clampInt(value: number, bounds: { min: number; max?: number }): number {
  const rounded = Math.round(value);
  const max = bounds.max ?? Number.POSITIVE_INFINITY;
  return Math.max(bounds.min, Math.min(max, rounded));
}

function clampNumber(value: number, bounds: { min: number; max?: number }): number {
  if (!Number.isFinite(value)) return bounds.min;
  const max = bounds.max ?? Number.POSITIVE_INFINITY;
  return Math.max(bounds.min, Math.min(max, value));
}

export default createStep(ProjectionStepContract, {
  artifacts: implementArtifacts([foundationArtifacts.plates, foundationArtifacts.tileToCellIndex, foundationArtifacts.crustTiles], {
    foundationPlates: {
      validate: (value, context) => wrapFoundationValidate(value, context.dimensions, validatePlatesArtifact),
    },
    foundationTileToCellIndex: {
      validate: (value, context) => wrapFoundationValidate(value, context.dimensions, validateTileToCellIndexArtifact),
    },
    foundationCrustTiles: {
      validate: (value, context) => wrapFoundationValidate(value, context.dimensions, validateCrustTilesArtifact),
    },
  }),
  normalize: (config, ctx) => {
    const { plateActivity } = ctx.knobs as Readonly<{ plateActivity?: FoundationPlateActivityKnob }>;
    const kinematicsMultiplier = FOUNDATION_PLATE_ACTIVITY_KINEMATICS_MULTIPLIER[plateActivity ?? "normal"] ?? 1.0;
    const boundaryDelta =
      FOUNDATION_PLATE_ACTIVITY_BOUNDARY_INFLUENCE_DISTANCE_DELTA[plateActivity ?? "normal"] ?? 0;

    const computePlates =
      config.computePlates.strategy === "default"
        ? {
            ...config.computePlates,
            config: {
              ...config.computePlates.config,
              boundaryInfluenceDistance: clampInt(
                (config.computePlates.config.boundaryInfluenceDistance ?? 0) + boundaryDelta,
                { min: 1, max: 32 }
              ),
              movementScale: clampNumber((config.computePlates.config.movementScale ?? 0) * kinematicsMultiplier, {
                min: 1,
                max: 200,
              }),
              rotationScale: clampNumber((config.computePlates.config.rotationScale ?? 0) * kinematicsMultiplier, {
                min: 1,
                max: 200,
              }),
            },
          }
        : config.computePlates;

    return { ...config, computePlates };
  },
  run: (context, config, ops, deps) => {
    const { width, height } = context.dimensions;
    const mesh = deps.artifacts.foundationMesh.read(context);
    const crust = deps.artifacts.foundationCrust.read(context);
    const plateGraph = deps.artifacts.foundationPlateGraph.read(context);
    const tectonics = deps.artifacts.foundationTectonics.read(context);

    const platesResult = ops.computePlates(
      {
        width,
        height,
        mesh,
        crust,
        plateGraph,
        tectonics,
      },
      config.computePlates
    );

    deps.artifacts.foundationPlates.publish(context, platesResult.plates);
    deps.artifacts.foundationTileToCellIndex.publish(context, platesResult.tileToCellIndex);
    deps.artifacts.foundationCrustTiles.publish(context, platesResult.crustTiles);

    context.viz?.dumpGrid(context.trace, {
      layerId: "foundation.plates.tilePlateId",
      dims: { width, height },
      format: "i16",
      values: platesResult.plates.id,
      meta: defineVizMeta("foundation.plates.tilePlateId", {
        label: "Plate Id",
        group: GROUP_PLATES,
        palette: "categorical",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      layerId: "foundation.plates.tileBoundaryType",
      dims: { width, height },
      format: "u8",
      values: platesResult.plates.boundaryType,
      meta: defineVizMeta("foundation.plates.tileBoundaryType", {
        label: "Plate Boundary Type",
        group: GROUP_PLATES,
        categories: [
          { value: 0, label: "None/Unknown", color: [107, 114, 128, 180] },
          { value: 1, label: "Convergent", color: [239, 68, 68, 240] },
          { value: 2, label: "Divergent", color: [59, 130, 246, 240] },
          { value: 3, label: "Transform", color: [245, 158, 11, 240] },
        ],
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      layerId: "foundation.plates.tileBoundaryCloseness",
      dims: { width, height },
      format: "u8",
      values: platesResult.plates.boundaryCloseness,
      meta: defineVizMeta("foundation.plates.tileBoundaryCloseness", {
        label: "Plate Boundary Closeness",
        group: GROUP_PLATES,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      layerId: "foundation.plates.tileTectonicStress",
      dims: { width, height },
      format: "u8",
      values: platesResult.plates.tectonicStress,
      meta: defineVizMeta("foundation.plates.tileTectonicStress", {
        label: "Plate Tectonic Stress",
        group: GROUP_PLATES,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      layerId: "foundation.plates.tileUpliftPotential",
      dims: { width, height },
      format: "u8",
      values: platesResult.plates.upliftPotential,
      meta: defineVizMeta("foundation.plates.tileUpliftPotential", {
        label: "Plate Uplift Potential",
        group: GROUP_PLATES,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      layerId: "foundation.plates.tileRiftPotential",
      dims: { width, height },
      format: "u8",
      values: platesResult.plates.riftPotential,
      meta: defineVizMeta("foundation.plates.tileRiftPotential", {
        label: "Plate Rift Potential",
        group: GROUP_PLATES,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      layerId: "foundation.plates.tileShieldStability",
      dims: { width, height },
      format: "u8",
      values: platesResult.plates.shieldStability,
      meta: defineVizMeta("foundation.plates.tileShieldStability", {
        label: "Plate Shield Stability",
        group: GROUP_PLATES,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      layerId: "foundation.plates.tileVolcanism",
      dims: { width, height },
      format: "u8",
      values: platesResult.plates.volcanism,
      meta: defineVizMeta("foundation.plates.tileVolcanism", {
        label: "Plate Volcanism",
        group: GROUP_PLATES,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      layerId: "foundation.plates.tileMovementU",
      dims: { width, height },
      format: "i8",
      values: platesResult.plates.movementU,
      meta: defineVizMeta("foundation.plates.tileMovementU", {
        label: "Plate Movement U",
        group: GROUP_PLATES,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      layerId: "foundation.plates.tileMovementV",
      dims: { width, height },
      format: "i8",
      values: platesResult.plates.movementV,
      meta: defineVizMeta("foundation.plates.tileMovementV", {
        label: "Plate Movement V",
        group: GROUP_PLATES,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      layerId: "foundation.plates.tileRotation",
      dims: { width, height },
      format: "i8",
      values: platesResult.plates.rotation,
      meta: defineVizMeta("foundation.plates.tileRotation", {
        label: "Plate Rotation",
        group: GROUP_PLATES,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      layerId: "foundation.crustTiles.type",
      dims: { width, height },
      format: "u8",
      values: platesResult.crustTiles.type,
      meta: defineVizMeta("foundation.crustTiles.type", {
        label: "Crust Type",
        group: GROUP_CRUST_TILES,
        categories: [
          { value: 0, label: "Oceanic", color: [37, 99, 235, 230] },
          { value: 1, label: "Continental", color: [34, 197, 94, 230] },
        ],
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      layerId: "foundation.crustTiles.age",
      dims: { width, height },
      format: "u8",
      values: platesResult.crustTiles.age,
      meta: defineVizMeta("foundation.crustTiles.age", {
        label: "Crust Age",
        group: GROUP_CRUST_TILES,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      layerId: "foundation.crustTiles.buoyancy",
      dims: { width, height },
      format: "f32",
      values: platesResult.crustTiles.buoyancy,
      meta: defineVizMeta("foundation.crustTiles.buoyancy", {
        label: "Crust Buoyancy",
        group: GROUP_CRUST_TILES,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      layerId: "foundation.crustTiles.baseElevation",
      dims: { width, height },
      format: "f32",
      values: platesResult.crustTiles.baseElevation,
      meta: defineVizMeta("foundation.crustTiles.baseElevation", {
        label: "Crust Base Elevation",
        group: GROUP_CRUST_TILES,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      layerId: "foundation.crustTiles.strength",
      dims: { width, height },
      format: "f32",
      values: platesResult.crustTiles.strength,
      meta: defineVizMeta("foundation.crustTiles.strength", {
        label: "Crust Strength",
        group: GROUP_CRUST_TILES,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      layerId: "foundation.tileToCellIndex",
      dims: { width, height },
      format: "i32",
      values: platesResult.tileToCellIndex,
      meta: defineVizMeta("foundation.tileToCellIndex", {
        label: "Tile To Cell Index",
        group: GROUP_TILE_MAP,
      }),
    });

    context.trace.event(() => {
      const sampleStep = computeSampleStep(width, height);
      const boundaryType = platesResult.plates.boundaryType;
      const rows = renderAsciiGrid({
        width,
        height,
        sampleStep,
        cellFn: (x, y) => {
          const idx = y * width + x;
          const t = boundaryType[idx] ?? 0;
          const base = t === 1 ? "C" : t === 2 ? "D" : t === 3 ? "T" : ".";
          return { base };
        },
      });
      return {
        kind: "foundation.plates.ascii.boundaryType",
        sampleStep,
        legend: ".=none C=convergent D=divergent T=transform",
        rows,
      };
    });
  },
});

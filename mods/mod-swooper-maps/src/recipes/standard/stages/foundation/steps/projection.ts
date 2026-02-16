import { computeSampleStep, defineVizMeta, dumpVectorFieldVariants, renderAsciiGrid } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { mapArtifacts } from "../../../map-artifacts.js";
import ProjectionStepContract from "./projection.contract.js";
import {
  validateCrustTilesArtifact,
  validatePlatesArtifact,
  validateTectonicHistoryTilesArtifact,
  validateTectonicProvenanceTilesArtifact,
  validateTileToCellIndexArtifact,
  wrapFoundationValidate,
} from "./validation.js";
import {
  resolvePlateActivityBoundaryDelta,
  resolvePlateActivityKinematicsMultiplier,
} from "@mapgen/domain/foundation/shared/knob-multipliers.js";
import type { FoundationPlateActivityKnob } from "@mapgen/domain/foundation/shared/knobs.js";
import { clampFinite, clampInt } from "@swooper/mapgen-core/lib/math";

const GROUP_PLATES = "Foundation / Plates";
const GROUP_CRUST_TILES = "Foundation / Crust Tiles";
const GROUP_TILE_MAP = "Foundation / Tile Mapping";
const GROUP_TECTONIC_HISTORY_TILES = "Foundation / Tectonic History Tiles";
const GROUP_TECTONIC_PROVENANCE_TILES = "Foundation / Tectonic Provenance Tiles";
const TILE_SPACE_ID = "tile.hexOddR" as const;

export default createStep(ProjectionStepContract, {
  artifacts: implementArtifacts(
    [
      mapArtifacts.foundationPlates,
      mapArtifacts.foundationTileToCellIndex,
      mapArtifacts.foundationCrustTiles,
      mapArtifacts.foundationTectonicHistoryTiles,
      mapArtifacts.foundationTectonicProvenanceTiles,
    ],
    {
      foundationPlates: {
        validate: (value, context) => wrapFoundationValidate(value, context.dimensions, validatePlatesArtifact),
      },
      foundationTileToCellIndex: {
        validate: (value, context) => wrapFoundationValidate(value, context.dimensions, validateTileToCellIndexArtifact),
      },
      foundationCrustTiles: {
        validate: (value, context) => wrapFoundationValidate(value, context.dimensions, validateCrustTilesArtifact),
      },
      foundationTectonicHistoryTiles: {
        validate: (value, context) =>
          wrapFoundationValidate(value, context.dimensions, validateTectonicHistoryTilesArtifact),
      },
      foundationTectonicProvenanceTiles: {
        validate: (value, context) =>
          wrapFoundationValidate(value, context.dimensions, validateTectonicProvenanceTilesArtifact),
      },
    }
  ),
  normalize: (config, ctx) => {
    const { plateActivity } = ctx.knobs as Readonly<{ plateActivity?: FoundationPlateActivityKnob }>;
    const kinematicsMultiplier = resolvePlateActivityKinematicsMultiplier(plateActivity);
    const boundaryDelta = resolvePlateActivityBoundaryDelta(plateActivity);

    const computePlates =
      config.computePlates.strategy === "default"
        ? {
            ...config.computePlates,
	            config: {
	              ...config.computePlates.config,
	              boundaryInfluenceDistance: clampInt(
	                (config.computePlates.config.boundaryInfluenceDistance ?? 0) + boundaryDelta,
	                1,
	                32
	              ),
	              movementScale: clampFinite((config.computePlates.config.movementScale ?? 0) * kinematicsMultiplier, 1, 200),
	              rotationScale: clampFinite((config.computePlates.config.rotationScale ?? 0) * kinematicsMultiplier, 1, 200),
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
    const plateMotion = deps.artifacts.foundationPlateMotion.read(context);
    const tectonics = deps.artifacts.foundationTectonics.read(context);
    const tectonicHistory = deps.artifacts.foundationTectonicHistory.read(context);
    const tectonicProvenance = deps.artifacts.foundationTectonicProvenance.read(context);

    const platesResult = ops.computePlates(
      {
        width,
        height,
        mesh,
        crust,
        plateGraph,
        plateMotion,
        tectonics,
        tectonicHistory,
        tectonicProvenance,
      },
      config.computePlates
    );

    deps.artifacts.foundationPlates.publish(context, platesResult.plates);
    deps.artifacts.foundationTileToCellIndex.publish(context, platesResult.tileToCellIndex);
    deps.artifacts.foundationCrustTiles.publish(context, platesResult.crustTiles);
    deps.artifacts.foundationTectonicHistoryTiles.publish(context, platesResult.tectonicHistoryTiles);
    deps.artifacts.foundationTectonicProvenanceTiles.publish(context, platesResult.tectonicProvenanceTiles);

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "foundation.plates.tilePlateId",
      spaceId: TILE_SPACE_ID,
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
      dataTypeKey: "foundation.plates.tileBoundaryType",
      spaceId: TILE_SPACE_ID,
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
      dataTypeKey: "foundation.plates.tileBoundaryCloseness",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: platesResult.plates.boundaryCloseness,
      meta: defineVizMeta("foundation.plates.tileBoundaryCloseness", {
        label: "Plate Boundary Closeness",
        group: GROUP_PLATES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "foundation.plates.tileTectonicStress",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: platesResult.plates.tectonicStress,
      meta: defineVizMeta("foundation.plates.tileTectonicStress", {
        label: "Plate Tectonic Stress",
        group: GROUP_PLATES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "foundation.plates.tileUpliftPotential",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: platesResult.plates.upliftPotential,
      meta: defineVizMeta("foundation.plates.tileUpliftPotential", {
        label: "Plate Uplift Potential",
        group: GROUP_PLATES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "foundation.plates.tileRiftPotential",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: platesResult.plates.riftPotential,
      meta: defineVizMeta("foundation.plates.tileRiftPotential", {
        label: "Plate Rift Potential",
        group: GROUP_PLATES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "foundation.plates.tileShieldStability",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: platesResult.plates.shieldStability,
      meta: defineVizMeta("foundation.plates.tileShieldStability", {
        label: "Plate Shield Stability",
        group: GROUP_PLATES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "foundation.plates.tileVolcanism",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: platesResult.plates.volcanism,
      meta: defineVizMeta("foundation.plates.tileVolcanism", {
        label: "Plate Volcanism",
        group: GROUP_PLATES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "foundation.plates.tileMovementU",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i8",
      values: platesResult.plates.movementU,
      meta: defineVizMeta("foundation.plates.tileMovementU", {
        label: "Plate Movement U",
        group: GROUP_PLATES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "foundation.plates.tileMovementV",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i8",
      values: platesResult.plates.movementV,
      meta: defineVizMeta("foundation.plates.tileMovementV", {
        label: "Plate Movement V",
        group: GROUP_PLATES,
        visibility: "debug",
      }),
    });
    dumpVectorFieldVariants(context.trace, context.viz, {
      dataTypeKey: "foundation.plates.tileMovement",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      u: { format: "i8", values: platesResult.plates.movementU },
      v: { format: "i8", values: platesResult.plates.movementV },
      label: "Plate Movement",
      group: GROUP_PLATES,
      palette: "continuous",
      magnitude: { debugOnly: true },
      arrows: { maxArrowLenTiles: 1.25 },
      points: { debugOnly: true },
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "foundation.plates.tileRotation",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i8",
      values: platesResult.plates.rotation,
      meta: defineVizMeta("foundation.plates.tileRotation", {
        label: "Plate Rotation",
        group: GROUP_PLATES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "foundation.crustTiles.type",
      spaceId: TILE_SPACE_ID,
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
      dataTypeKey: "foundation.crustTiles.age",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: platesResult.crustTiles.age,
      meta: defineVizMeta("foundation.crustTiles.age", {
        label: "Crust Age",
        group: GROUP_CRUST_TILES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "foundation.crustTiles.buoyancy",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: platesResult.crustTiles.buoyancy,
      meta: defineVizMeta("foundation.crustTiles.buoyancy", {
        label: "Crust Buoyancy",
        group: GROUP_CRUST_TILES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "foundation.crustTiles.baseElevation",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: platesResult.crustTiles.baseElevation,
      meta: defineVizMeta("foundation.crustTiles.baseElevation", {
        label: "Crust Base Elevation",
        group: GROUP_CRUST_TILES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "foundation.crustTiles.strength",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: platesResult.crustTiles.strength,
      meta: defineVizMeta("foundation.crustTiles.strength", {
        label: "Crust Strength",
        group: GROUP_CRUST_TILES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "foundation.history.upliftTotal",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: platesResult.tectonicHistoryTiles.rollups.upliftTotal,
      meta: defineVizMeta("foundation.history.upliftTotal", {
        label: "History Uplift Total",
        group: GROUP_TECTONIC_HISTORY_TILES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "foundation.history.lastActiveEra",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: platesResult.tectonicHistoryTiles.rollups.lastActiveEra,
      meta: defineVizMeta("foundation.history.lastActiveEra", {
        label: "History Last Active Era",
        group: GROUP_TECTONIC_HISTORY_TILES,
        visibility: "debug",
      }),
    });

    const historyPerEra = platesResult.tectonicHistoryTiles.perEra ?? [];
    for (let eraIndex = 0; eraIndex < historyPerEra.length; eraIndex++) {
      const era = historyPerEra[eraIndex];
      if (!era) continue;
      const variantKey = `era:${eraIndex + 1}`;

      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "foundation.history.boundaryType",
        variantKey,
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: era.boundaryType,
        meta: defineVizMeta("foundation.history.boundaryType", {
          label: "History Boundary Type",
          group: GROUP_TECTONIC_HISTORY_TILES,
          categories: [
            { value: 0, label: "None/Unknown", color: [107, 114, 128, 180] },
            { value: 1, label: "Convergent", color: [239, 68, 68, 240] },
            { value: 2, label: "Divergent", color: [59, 130, 246, 240] },
            { value: 3, label: "Transform", color: [245, 158, 11, 240] },
          ],
        }),
      });
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "foundation.history.upliftPotential",
        variantKey,
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: era.upliftPotential,
        meta: defineVizMeta("foundation.history.upliftPotential", {
          label: "History Uplift Potential",
          group: GROUP_TECTONIC_HISTORY_TILES,
        }),
      });
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "foundation.history.riftPotential",
        variantKey,
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: era.riftPotential,
        meta: defineVizMeta("foundation.history.riftPotential", {
          label: "History Rift Potential",
          group: GROUP_TECTONIC_HISTORY_TILES,
          visibility: "debug",
        }),
      });
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "foundation.history.shearStress",
        variantKey,
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: era.shearStress,
        meta: defineVizMeta("foundation.history.shearStress", {
          label: "History Shear Stress",
          group: GROUP_TECTONIC_HISTORY_TILES,
          visibility: "debug",
        }),
      });
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "foundation.history.volcanism",
        variantKey,
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: era.volcanism,
        meta: defineVizMeta("foundation.history.volcanism", {
          label: "History Volcanism",
          group: GROUP_TECTONIC_HISTORY_TILES,
          visibility: "debug",
        }),
      });
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "foundation.history.fracture",
        variantKey,
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: era.fracture,
        meta: defineVizMeta("foundation.history.fracture", {
          label: "History Fracture",
          group: GROUP_TECTONIC_HISTORY_TILES,
          visibility: "debug",
        }),
      });
    }
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "foundation.provenance.originEra",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: platesResult.tectonicProvenanceTiles.originEra,
      meta: defineVizMeta("foundation.provenance.originEra", {
        label: "Provenance Origin Era",
        group: GROUP_TECTONIC_PROVENANCE_TILES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "foundation.provenance.lastBoundaryType",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: platesResult.tectonicProvenanceTiles.lastBoundaryType,
      meta: defineVizMeta("foundation.provenance.lastBoundaryType", {
        label: "Provenance Last Boundary Type",
        group: GROUP_TECTONIC_PROVENANCE_TILES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "foundation.tileToCellIndex",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i32",
      values: platesResult.tileToCellIndex,
      meta: defineVizMeta("foundation.tileToCellIndex", {
        label: "Tile To Cell Index",
        group: GROUP_TILE_MAP,
        visibility: "debug",
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

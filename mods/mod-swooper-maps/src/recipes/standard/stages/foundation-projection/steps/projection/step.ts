import { computeSampleStep, renderAsciiGrid } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import {
  buildVectorFieldProjections,
  type VizDims,
  type VizGridProjection,
  type VizLayerMeta,
  type VizScalarSource,
  type VizVariantKey,
} from "@swooper/mapgen-viz";
import {
  defineStandardVizCategoryMeta,
  defineStandardVizMeta,
  STANDARD_VIZ_COLORS,
} from "../../../../viz.js";
import { ProjectionStepContract } from "./config.js";

const GROUP_PLATES = "Foundation / Plates";
const GROUP_CRUST_TILES = "Foundation / Crust Tiles";
const GROUP_TILE_MAP = "Foundation / Tile Mapping";
const GROUP_TECTONIC_HISTORY_TILES = "Foundation / Tectonic History Tiles";
const GROUP_TECTONIC_PROVENANCE_TILES = "Foundation / Tectonic Provenance Tiles";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

const BOUNDARY_TYPE_CATEGORIES = [
  { value: 0, label: "None/Unknown", color: STANDARD_VIZ_COLORS.unknown },
  { value: 1, label: "Convergent", color: STANDARD_VIZ_COLORS.field.positive },
  { value: 2, label: "Divergent", color: STANDARD_VIZ_COLORS.field.negative },
  { value: 3, label: "Transform", color: STANDARD_VIZ_COLORS.field.high },
] as const;

function gridProjection(
  input: Readonly<{
    dataTypeKey: string;
    dims: VizDims;
    field: VizScalarSource;
    meta: VizLayerMeta;
    variantKey?: VizVariantKey;
  }>
): VizGridProjection {
  return {
    kind: "grid",
    dataTypeKey: input.dataTypeKey,
    variantKey: input.variantKey,
    spaceId: TILE_SPACE_ID,
    dims: input.dims,
    field: input.field,
    meta: input.meta,
  };
}

/**
 * Projects mesh-space crust, plate, history, and provenance truth into aligned
 * tile artifacts while leaving terrain shaping to Morphology.
 */
export const ProjectionStep = createStep(ProjectionStepContract, {
  run: (context, config, ops, deps) => {
    const { width, height } = context.setup.dimensions;
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
    deps.artifacts.foundationTectonicHistoryTiles.publish(
      context,
      platesResult.tectonicHistoryTiles
    );
    deps.artifacts.foundationTectonicProvenanceTiles.publish(
      context,
      platesResult.tectonicProvenanceTiles
    );

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
    return platesResult;
  },
  viz: ({ result, dimensions }) => {
    const projections: VizGridProjection[] = [];
    const addGrid = (
      dataTypeKey: string,
      field: VizScalarSource,
      meta: VizLayerMeta,
      variantKey?: VizVariantKey
    ) =>
      projections.push(gridProjection({ dataTypeKey, dims: dimensions, field, meta, variantKey }));

    addGrid(
      "foundation.plates.tilePlateId",
      { format: "i16", values: result.plates.id },
      defineStandardVizMeta("foundation.plates.tilePlateId", "category.distinct", {
        label: "Plate Id",
        group: GROUP_PLATES,
      })
    );
    addGrid(
      "foundation.plates.tileBoundaryType",
      { format: "u8", values: result.plates.boundaryType },
      defineStandardVizCategoryMeta(
        "foundation.plates.tileBoundaryType",
        BOUNDARY_TYPE_CATEGORIES,
        { label: "Plate Boundary Type", group: GROUP_PLATES }
      )
    );
    for (const [dataTypeKey, label, values] of [
      [
        "foundation.plates.tileBoundaryCloseness",
        "Plate Boundary Closeness",
        result.plates.boundaryCloseness,
      ],
      [
        "foundation.plates.tileTectonicStress",
        "Plate Tectonic Stress",
        result.plates.tectonicStress,
      ],
      [
        "foundation.plates.tileUpliftPotential",
        "Plate Uplift Potential",
        result.plates.upliftPotential,
      ],
      ["foundation.plates.tileRiftPotential", "Plate Rift Potential", result.plates.riftPotential],
      [
        "foundation.plates.tileShieldStability",
        "Plate Shield Stability",
        result.plates.shieldStability,
      ],
      ["foundation.plates.tileVolcanism", "Plate Volcanism", result.plates.volcanism],
    ] as const) {
      addGrid(
        dataTypeKey,
        { format: "u8", values },
        defineStandardVizMeta(dataTypeKey, "field.intensity", {
          label,
          group: GROUP_PLATES,
          visibility: "debug",
        })
      );
    }
    for (const [dataTypeKey, label, values] of [
      ["foundation.plates.tileMovementU", "Plate Movement U", result.plates.movementU],
      ["foundation.plates.tileMovementV", "Plate Movement V", result.plates.movementV],
      ["foundation.plates.tileRotation", "Plate Rotation", result.plates.rotation],
    ] as const) {
      addGrid(
        dataTypeKey,
        { format: "i8", values },
        defineStandardVizMeta(dataTypeKey, "field.signed", {
          label,
          group: GROUP_PLATES,
          visibility: "debug",
        })
      );
    }

    const movement = buildVectorFieldProjections({
      dataTypeKey: "foundation.plates.tileMovement",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      u: { format: "i8", values: result.plates.movementU },
      v: { format: "i8", values: result.plates.movementV },
      magnitude: { debugOnly: true },
      arrows: { maxArrowLengthTiles: 1.25 },
      points: { debugOnly: true },
      meta: defineStandardVizMeta("foundation.plates.tileMovement", "field.intensity", {
        label: "Plate Motion",
        group: GROUP_PLATES,
      }),
    });

    addGrid(
      "foundation.crustTiles.type",
      { format: "u8", values: result.crustTiles.type },
      defineStandardVizCategoryMeta(
        "foundation.crustTiles.type",
        [
          { value: 0, label: "Oceanic", color: STANDARD_VIZ_COLORS.water.ocean },
          { value: 1, label: "Continental", color: STANDARD_VIZ_COLORS.land },
        ],
        {
          label: "Crust Type",
          group: GROUP_CRUST_TILES,
        }
      )
    );
    addGrid(
      "foundation.crustTiles.age",
      { format: "u8", values: result.crustTiles.age },
      defineStandardVizMeta("foundation.crustTiles.age", "field.intensity", {
        label: "Crust Age",
        group: GROUP_CRUST_TILES,
        visibility: "debug",
      })
    );
    for (const [dataTypeKey, label, values, style] of [
      [
        "foundation.crustTiles.buoyancy",
        "Crust Buoyancy",
        result.crustTiles.buoyancy,
        "field.signed",
      ],
      [
        "foundation.crustTiles.baseElevation",
        "Crust Base Elevation",
        result.crustTiles.baseElevation,
        "terrain.elevation",
      ],
      [
        "foundation.crustTiles.strength",
        "Crust Strength",
        result.crustTiles.strength,
        "field.intensity",
      ],
    ] as const) {
      addGrid(
        dataTypeKey,
        { format: "f32", values },
        defineStandardVizMeta(dataTypeKey, style, {
          label,
          group: GROUP_CRUST_TILES,
          visibility: "debug",
        })
      );
    }
    addGrid(
      "foundation.history.upliftTotal",
      { format: "u8", values: result.tectonicHistoryTiles.rollups.upliftTotal },
      defineStandardVizMeta("foundation.history.upliftTotal", "field.intensity", {
        label: "History Uplift Total",
        group: GROUP_TECTONIC_HISTORY_TILES,
        visibility: "debug",
      })
    );
    addGrid(
      "foundation.history.lastActiveEra",
      { format: "u8", values: result.tectonicHistoryTiles.rollups.lastActiveEra },
      defineStandardVizMeta("foundation.history.lastActiveEra", "category.distinct", {
        label: "History Last Active Era",
        group: GROUP_TECTONIC_HISTORY_TILES,
        visibility: "debug",
      })
    );

    for (let eraIndex = 0; eraIndex < result.tectonicHistoryTiles.perEra.length; eraIndex++) {
      const era = result.tectonicHistoryTiles.perEra[eraIndex];
      if (!era) continue;
      const variantKey = `era:${eraIndex + 1}`;
      addGrid(
        "foundation.history.boundaryType",
        { format: "u8", values: era.boundaryType },
        defineStandardVizCategoryMeta("foundation.history.boundaryType", BOUNDARY_TYPE_CATEGORIES, {
          label: "History Boundary Type",
          group: GROUP_TECTONIC_HISTORY_TILES,
        }),
        variantKey
      );
      for (const [dataTypeKey, label, values, visibility] of [
        [
          "foundation.history.upliftPotential",
          "History Uplift Potential",
          era.upliftPotential,
          "default",
        ],
        ["foundation.history.riftPotential", "History Rift Potential", era.riftPotential, "debug"],
        ["foundation.history.shearStress", "History Shear Stress", era.shearStress, "debug"],
        ["foundation.history.volcanism", "History Volcanism", era.volcanism, "debug"],
        ["foundation.history.fracture", "History Fracture", era.fracture, "debug"],
      ] as const) {
        addGrid(
          dataTypeKey,
          { format: "u8", values },
          defineStandardVizMeta(dataTypeKey, "field.intensity", {
            label,
            group: GROUP_TECTONIC_HISTORY_TILES,
            visibility,
          }),
          variantKey
        );
      }
    }
    addGrid(
      "foundation.provenance.originEra",
      { format: "u8", values: result.tectonicProvenanceTiles.originEra },
      defineStandardVizMeta("foundation.provenance.originEra", "category.distinct", {
        label: "Provenance Origin Era",
        group: GROUP_TECTONIC_PROVENANCE_TILES,
        visibility: "debug",
      })
    );
    addGrid(
      "foundation.provenance.lastBoundaryType",
      { format: "u8", values: result.tectonicProvenanceTiles.lastBoundaryType },
      defineStandardVizCategoryMeta(
        "foundation.provenance.lastBoundaryType",
        BOUNDARY_TYPE_CATEGORIES,
        {
          label: "Provenance Last Boundary Type",
          group: GROUP_TECTONIC_PROVENANCE_TILES,
          visibility: "debug",
        }
      )
    );
    addGrid(
      "foundation.tileToCellIndex",
      { format: "i32", values: result.tileToCellIndex },
      defineStandardVizMeta("foundation.tileToCellIndex", "category.distinct", {
        label: "Tile To Cell Index",
        group: GROUP_TILE_MAP,
        visibility: "debug",
      })
    );
    return [...projections, ...movement];
  },
});

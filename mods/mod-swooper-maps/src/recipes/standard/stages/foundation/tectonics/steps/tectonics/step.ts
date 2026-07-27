import { applyPlateActivityOrogenyGain } from "@mapgen/domain/foundation/modules/tectonics/model/policy/plate-activity.js";
import { createStep } from "@swooper/mapgen-core/authoring";
import { wrapDeltaPeriodic } from "@swooper/mapgen-core/lib/math";
import {
  interleaveXY,
  type VizProjection,
  type VizScalarSource,
  type VizVariantKey,
} from "@swooper/mapgen-viz";
import {
  defineStandardVizCategoryMeta,
  defineStandardVizMeta,
  STANDARD_VIZ_COLORS,
} from "../../../../../viz.js";
import { segmentsFromCellPairs } from "../../../viz.js";
import { config } from "./config.js";

type Uint8VizValues = Extract<VizScalarSource, { format: "u8" }>["values"];

const GROUP_PLATE_MOTION = "Foundation / Plate Motion";
const GROUP_TECTONICS = "Foundation / Tectonics";
const GROUP_TECTONIC_HISTORY = "Foundation / Tectonic History";
const WORLD_SPACE_ID = "world.xy" as const;
const OROGENY_ERA_GAIN_MIN = 0.85;
const OROGENY_ERA_GAIN_MAX = 1.15;

function velocityAtPoint(params: {
  plateId: number;
  plateMotion: {
    plateCenterX: ArrayLike<number>;
    plateCenterY: ArrayLike<number>;
    plateVelocityX: ArrayLike<number>;
    plateVelocityY: ArrayLike<number>;
    plateOmega: ArrayLike<number>;
  };
  x: number;
  y: number;
  wrapWidth: number;
}): { vx: number; vy: number } {
  const plateId = params.plateId | 0;
  const vx = params.plateMotion.plateVelocityX[plateId] ?? 0;
  const vy = params.plateMotion.plateVelocityY[plateId] ?? 0;
  const omega = params.plateMotion.plateOmega[plateId] ?? 0;
  if (!omega) return { vx, vy };

  const cx = params.plateMotion.plateCenterX[plateId] ?? 0;
  const cy = params.plateMotion.plateCenterY[plateId] ?? 0;
  const dx = wrapDeltaPeriodic(params.x - cx, params.wrapWidth);
  const dy = params.y - cy;
  return { vx: vx + -dy * omega, vy: vy + dx * omega };
}

function buildVectorSegments(params: {
  siteX: ArrayLike<number>;
  siteY: ArrayLike<number>;
  plateIdByCell: ArrayLike<number>;
  plateMotion: {
    plateCenterX: ArrayLike<number>;
    plateCenterY: ArrayLike<number>;
    plateVelocityX: ArrayLike<number>;
    plateVelocityY: ArrayLike<number>;
    plateOmega: ArrayLike<number>;
  };
  wrapWidth: number;
}): { segments: Float32Array; values: Float32Array } {
  const cellCount = Math.min(params.siteX.length, params.siteY.length, params.plateIdByCell.length);
  let maxMagnitude = 0;
  for (let index = 0; index < cellCount; index++) {
    const velocity = velocityAtPoint({
      plateId: params.plateIdByCell[index] ?? 0,
      plateMotion: params.plateMotion,
      x: params.siteX[index] ?? 0,
      y: params.siteY[index] ?? 0,
      wrapWidth: params.wrapWidth,
    });
    maxMagnitude = Math.max(maxMagnitude, Math.hypot(velocity.vx, velocity.vy));
  }

  const scale = maxMagnitude > 0 ? 0.8 / maxMagnitude : 0;
  const sampleStep = Math.max(1, Math.round(Math.sqrt(cellCount / 400)));
  const segments: number[] = [];
  const values: number[] = [];
  for (let index = 0; index < cellCount; index += sampleStep) {
    const x = params.siteX[index] ?? 0;
    const y = params.siteY[index] ?? 0;
    const velocity = velocityAtPoint({
      plateId: params.plateIdByCell[index] ?? 0,
      plateMotion: params.plateMotion,
      x,
      y,
      wrapWidth: params.wrapWidth,
    });
    const magnitude = Math.hypot(velocity.vx, velocity.vy);
    if (!Number.isFinite(magnitude) || magnitude <= 0) continue;
    segments.push(x, y, x + velocity.vx * scale, y + velocity.vy * scale);
    values.push(magnitude);
  }

  return {
    segments: new Float32Array(segments),
    values: new Float32Array(values),
  };
}

const BOUNDARY_TYPE_CATEGORIES = [
  { value: 0, label: "None/Unknown", color: STANDARD_VIZ_COLORS.unknown },
  { value: 1, label: "Convergent", color: STANDARD_VIZ_COLORS.field.positive },
  { value: 2, label: "Divergent", color: STANDARD_VIZ_COLORS.field.negative },
  { value: 3, label: "Transform", color: STANDARD_VIZ_COLORS.field.high },
] as const;

/**
 * Runs the ordered multi-era tectonic chain and publishes segments, history,
 * current fields, and provenance as one coherent vintage.
 */
export const TectonicsStep = createStep(config, {
  normalize: (stepConfig, ctx) => {
    // plateActivity scales post-classification orogeny intensity without moving boundaries.
    const { plateActivity } = ctx.knobs as Readonly<{ plateActivity?: number }>;
    if (stepConfig.computeEraTectonicFields.strategy !== "event-distance-decay") return stepConfig;
    const orogenyActivityGain = applyPlateActivityOrogenyGain(
      stepConfig.computeEraTectonicFields.config.orogenyActivityGain,
      plateActivity
    );
    return {
      ...stepConfig,
      computeEraTectonicFields: {
        ...stepConfig.computeEraTectonicFields,
        config: { ...stepConfig.computeEraTectonicFields.config, orogenyActivityGain },
      },
    };
  },
  run: (_context, stepConfig, ops, deps) => {
    const mesh = deps.artifacts.mesh.read();
    const mantleForcing = deps.artifacts.mantleForcing.read();
    const crust = deps.artifacts.initialCrust.read();
    const plateGraph = deps.artifacts.plateGraph.read();
    const topologyMesh = {
      cellCount: mesh.cellCount,
      wrapWidth: mesh.wrapWidth,
      siteX: mesh.siteX,
      siteY: mesh.siteY,
      neighborsOffsets: mesh.neighborsOffsets,
      neighbors: mesh.neighbors,
    } as const;
    const motionMesh = { ...topologyMesh, areas: mesh.areas } as const;
    const motionForcing = {
      forcingU: mantleForcing.forcingU,
      forcingV: mantleForcing.forcingV,
    } as const;
    const plateGraphInput = {
      cellToPlate: plateGraph.cellToPlate,
      plates: plateGraph.plates,
    } as const;
    const plateMotion = ops.computePlateMotion(
      {
        mesh: motionMesh,
        mantleForcing: motionForcing,
        plateGraph: plateGraphInput,
      },
      stepConfig.computePlateMotion
    ).plateMotion;
    deps.artifacts.plateMotion.publish(plateMotion);
    const segmentCrust = { strength: crust.strength, type: crust.type } as const;
    const plateMotionInput = {
      plateCount: plateMotion.plateCount,
      plateCenterX: plateMotion.plateCenterX,
      plateCenterY: plateMotion.plateCenterY,
      plateVelocityX: plateMotion.plateVelocityX,
      plateVelocityY: plateMotion.plateVelocityY,
      plateOmega: plateMotion.plateOmega,
    } as const;

    const segmentsResult = ops.computeTectonicSegments(
      {
        mesh: topologyMesh,
        crust: segmentCrust,
        plateGraph: plateGraphInput,
        plateMotion: plateMotionInput,
      },
      stepConfig.computeTectonicSegments
    );
    deps.artifacts.tectonicSegments.publish(segmentsResult.segments);

    const eraPlateMembership = ops.computeEraPlateMembership(
      {
        mesh: topologyMesh,
        plateGraph: plateGraphInput,
        plateMotion: {
          plateCount: plateMotion.plateCount,
          plateVelocityX: plateMotion.plateVelocityX,
          plateVelocityY: plateMotion.plateVelocityY,
        },
      },
      stepConfig.computeEraPlateMembership
    );

    const eraFieldsChain: Array<ReturnType<typeof ops.computeEraTectonicFields>["eraFields"]> = [];
    for (let era = 0; era < eraPlateMembership.eraCount; era++) {
      const eraPlateId =
        eraPlateMembership.plateIdByEra[era] ??
        eraPlateMembership.plateIdByEra[eraPlateMembership.plateIdByEra.length - 1];
      if (!eraPlateId) continue;

      const eraPlateGraph = {
        cellToPlate: eraPlateId,
        plates: plateGraph.plates,
      } as const;
      const eraPlateMotion = ops.computePlateMotion(
        {
          mesh: motionMesh,
          mantleForcing: motionForcing,
          plateGraph: eraPlateGraph,
        },
        stepConfig.computePlateMotion
      ).plateMotion;
      const eraSegments = ops.computeTectonicSegments(
        {
          mesh: topologyMesh,
          crust: segmentCrust,
          plateGraph: eraPlateGraph,
          plateMotion: {
            plateCount: eraPlateMotion.plateCount,
            plateCenterX: eraPlateMotion.plateCenterX,
            plateCenterY: eraPlateMotion.plateCenterY,
            plateVelocityX: eraPlateMotion.plateVelocityX,
            plateVelocityY: eraPlateMotion.plateVelocityY,
            plateOmega: eraPlateMotion.plateOmega,
          },
        },
        stepConfig.computeTectonicSegments
      ).segments;
      const segmentEvents = ops.computeSegmentEvents(
        {
          mesh: { cellCount: mesh.cellCount },
          crust: { type: crust.type },
          segments: {
            segmentCount: eraSegments.segmentCount,
            aCell: eraSegments.aCell,
            bCell: eraSegments.bCell,
            plateA: eraSegments.plateA,
            plateB: eraSegments.plateB,
            regime: eraSegments.regime,
            polarity: eraSegments.polarity,
            compression: eraSegments.compression,
            extension: eraSegments.extension,
            shear: eraSegments.shear,
            volcanism: eraSegments.volcanism,
            fracture: eraSegments.fracture,
            driftU: eraSegments.driftU,
            driftV: eraSegments.driftV,
          },
        },
        stepConfig.computeSegmentEvents
      );
      const hotspotEvents = ops.computeHotspotEvents(
        {
          mesh: { cellCount: mesh.cellCount },
          mantleForcing: {
            upwellingClass: mantleForcing.upwellingClass,
            forcingMag: mantleForcing.forcingMag,
            stress: mantleForcing.stress,
            forcingU: mantleForcing.forcingU,
            forcingV: mantleForcing.forcingV,
          },
          eraPlateId,
        },
        stepConfig.computeHotspotEvents
      );
      const t = eraPlateMembership.eraCount > 1 ? era / (eraPlateMembership.eraCount - 1) : 0;
      const eraGain = OROGENY_ERA_GAIN_MIN + (OROGENY_ERA_GAIN_MAX - OROGENY_ERA_GAIN_MIN) * t;
      const eraFields = ops.computeEraTectonicFields(
        {
          mesh: topologyMesh,
          segmentEvents: segmentEvents.events,
          hotspotEvents: hotspotEvents.events,
          weight: eraPlateMembership.eraWeights[era] ?? 0,
          eraGain,
        },
        stepConfig.computeEraTectonicFields
      );
      eraFieldsChain.push(eraFields.eraFields);
    }

    const historyResult = ops.computeTectonicHistoryRollups(
      {
        cellCount: mesh.cellCount,
        eras: eraFieldsChain,
        plateIdByEra: eraPlateMembership.plateIdByEra,
      },
      stepConfig.computeTectonicHistoryRollups
    );
    const newestEra =
      eraFieldsChain[eraPlateMembership.eraCount - 1] ?? eraFieldsChain[eraFieldsChain.length - 1];
    if (!newestEra) {
      throw new Error("[Foundation] tectonics step failed to derive newest era fields.");
    }
    const tectonicsResult = ops.computeTectonicsCurrent(
      {
        cellCount: mesh.cellCount,
        newestEra,
        upliftTotal: historyResult.tectonicHistory.upliftTotal,
      },
      stepConfig.computeTectonicsCurrent
    );
    const tracerResult = ops.computeTracerAdvection(
      {
        mesh: topologyMesh,
        mantleForcing: {
          forcingU: mantleForcing.forcingU,
          forcingV: mantleForcing.forcingV,
        },
        eras: eraFieldsChain.map((eraFields) => ({
          boundaryDriftU: eraFields.boundaryDriftU,
          boundaryDriftV: eraFields.boundaryDriftV,
        })),
        eraCount: eraPlateMembership.eraCount,
      },
      stepConfig.computeTracerAdvection
    );
    const provenanceResult = ops.computeTectonicProvenance(
      {
        mesh: { cellCount: mesh.cellCount },
        plateGraph: { cellToPlate: plateGraph.cellToPlate },
        eras: eraFieldsChain.map((eraFields) => ({
          boundaryType: eraFields.boundaryType,
          boundaryPolarity: eraFields.boundaryPolarity,
          boundaryIntensity: eraFields.boundaryIntensity,
          riftPotential: eraFields.riftPotential,
          volcanism: eraFields.volcanism,
          riftOriginPlate: eraFields.riftOriginPlate,
          volcanismOriginPlate: eraFields.volcanismOriginPlate,
          volcanismEventType: eraFields.volcanismEventType,
        })),
        tracerIndex: tracerResult.tracerIndex,
        eraCount: eraPlateMembership.eraCount,
      },
      stepConfig.computeTectonicProvenance
    );

    deps.artifacts.tectonicHistory.publish(historyResult.tectonicHistory);
    deps.artifacts.tectonicProvenance.publish(provenanceResult.tectonicProvenance);
    deps.artifacts.currentTectonics.publish(tectonicsResult.tectonics);
    return {
      mesh,
      plateGraph,
      plateMotion,
      segments: segmentsResult.segments,
      tectonics: tectonicsResult.tectonics,
      history: historyResult.tectonicHistory,
    };
  },
  viz: ({ result: { mesh, plateGraph, plateMotion, segments, tectonics, history } }) => {
    const projections: VizProjection[] = [];
    const positions = interleaveXY(mesh.siteX, mesh.siteY);
    const motionVectors = buildVectorSegments({
      siteX: mesh.siteX,
      siteY: mesh.siteY,
      plateIdByCell: plateGraph.cellToPlate,
      plateMotion,
      wrapWidth: mesh.wrapWidth,
    });
    projections.push({
      kind: "segments",
      dataTypeKey: "foundation.plateMotion.motion",
      spaceId: WORLD_SPACE_ID,
      segments: motionVectors.segments,
      values: { format: "f32", values: motionVectors.values },
      meta: defineStandardVizMeta("foundation.plateMotion.motion", "field.intensity", {
        label: "Plate Motion (Vectors)",
        group: GROUP_PLATE_MOTION,
        role: "vector",
        visibility: "debug",
      }),
    });
    const segmentGeometry = segmentsFromCellPairs(
      segments.aCell,
      segments.bCell,
      mesh.siteX,
      mesh.siteY
    );
    const addPoints = (
      dataTypeKey: string,
      values: Uint8VizValues,
      label: string,
      group: string,
      visibility: "default" | "debug" = "default",
      variantKey?: VizVariantKey
    ) => {
      projections.push({
        kind: "points",
        dataTypeKey,
        variantKey,
        spaceId: WORLD_SPACE_ID,
        positions,
        values: { format: "u8", values },
        meta: defineStandardVizMeta(dataTypeKey, "field.intensity", {
          label,
          group,
          visibility,
        }),
      });
    };
    const addSegments = (
      dataTypeKey: string,
      values: Uint8VizValues,
      label: string,
      visibility: "default" | "debug" = "debug"
    ) => {
      projections.push({
        kind: "segments",
        dataTypeKey,
        spaceId: WORLD_SPACE_ID,
        segments: segmentGeometry,
        values: { format: "u8", values },
        meta: defineStandardVizMeta(dataTypeKey, "field.intensity", {
          label,
          group: GROUP_TECTONICS,
          visibility,
        }),
      });
    };

    projections.push({
      kind: "segments",
      dataTypeKey: "foundation.tectonics.boundaryType",
      variantKey: "snapshot:latest",
      spaceId: WORLD_SPACE_ID,
      segments: segmentGeometry,
      values: { format: "u8", values: segments.regime },
      meta: defineStandardVizCategoryMeta(
        "foundation.tectonics.boundaryType",
        BOUNDARY_TYPE_CATEGORIES,
        { label: "Boundary Type", group: GROUP_TECTONICS, role: "edges" }
      ),
    });
    projections.push({
      kind: "points",
      dataTypeKey: "foundation.tectonics.boundaryType",
      variantKey: "snapshot:latest",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: { format: "u8", values: tectonics.boundaryType },
      meta: defineStandardVizCategoryMeta(
        "foundation.tectonics.boundaryType",
        BOUNDARY_TYPE_CATEGORIES,
        { label: "Boundary Type", group: GROUP_TECTONICS, visibility: "debug" }
      ),
    });
    for (const [dataTypeKey, label, values, visibility] of [
      [
        "foundation.tectonics.upliftPotential",
        "Uplift Potential",
        tectonics.upliftPotential,
        "default",
      ],
      ["foundation.tectonics.riftPotential", "Rift Potential", tectonics.riftPotential, "debug"],
      ["foundation.tectonics.shearStress", "Shear Stress", tectonics.shearStress, "debug"],
      ["foundation.tectonics.volcanism", "Volcanism", tectonics.volcanism, "default"],
      ["foundation.tectonics.fracture", "Fracture", tectonics.fracture, "debug"],
    ] as const) {
      addPoints(dataTypeKey, values, label, GROUP_TECTONICS, visibility, "snapshot:latest");
    }
    for (const [dataTypeKey, label, values] of [
      [
        "foundation.tectonics.segmentCompression",
        "Tectonic Segment Compression",
        segments.compression,
      ],
      ["foundation.tectonics.segmentExtension", "Tectonic Segment Extension", segments.extension],
      ["foundation.tectonics.segmentShear", "Tectonic Segment Shear", segments.shear],
      ["foundation.tectonics.segmentVolcanism", "Tectonic Segment Volcanism", segments.volcanism],
    ] as const) {
      addSegments(dataTypeKey, values, label);
    }
    for (const [dataTypeKey, label, values, style] of [
      ["foundation.history.upliftTotal", "Uplift Total", history.upliftTotal, "field.intensity"],
      [
        "foundation.history.fractureTotal",
        "Fracture Total",
        history.fractureTotal,
        "field.intensity",
      ],
      [
        "foundation.history.volcanismTotal",
        "Volcanism Total",
        history.volcanismTotal,
        "field.intensity",
      ],
      [
        "foundation.history.upliftRecentFraction",
        "Recent Uplift Fraction",
        history.upliftRecentFraction,
        "field.intensity",
      ],
      [
        "foundation.history.lastActiveEra",
        "Last Active Era",
        history.lastActiveEra,
        "category.distinct",
      ],
    ] as const) {
      projections.push({
        kind: "points",
        dataTypeKey,
        spaceId: WORLD_SPACE_ID,
        positions,
        values: { format: "u8", values },
        meta: defineStandardVizMeta(dataTypeKey, style, {
          label,
          group: GROUP_TECTONIC_HISTORY,
          visibility: "debug",
        }),
      });
    }
    for (let eraIndex = 0; eraIndex < history.eras.length; eraIndex++) {
      const era = history.eras[eraIndex];
      if (!era) continue;
      const variantKey = `era:${eraIndex + 1}`;
      projections.push({
        kind: "points",
        dataTypeKey: "foundation.history.boundaryType",
        variantKey,
        spaceId: WORLD_SPACE_ID,
        positions,
        values: { format: "u8", values: era.boundaryType },
        meta: defineStandardVizCategoryMeta(
          "foundation.history.boundaryType",
          BOUNDARY_TYPE_CATEGORIES,
          { label: "Boundary Type (History)", group: GROUP_TECTONIC_HISTORY }
        ),
      });
      for (const [dataTypeKey, label, values] of [
        ["foundation.history.upliftPotential", "Uplift Potential (History)", era.upliftPotential],
        ["foundation.history.riftPotential", "Rift Potential (History)", era.riftPotential],
        ["foundation.history.shearStress", "Shear Stress (History)", era.shearStress],
        ["foundation.history.volcanism", "Volcanism (History)", era.volcanism],
        ["foundation.history.fracture", "Fracture (History)", era.fracture],
      ] as const) {
        addPoints(dataTypeKey, values, label, GROUP_TECTONIC_HISTORY, "default", variantKey);
      }
    }
    return projections;
  },
});

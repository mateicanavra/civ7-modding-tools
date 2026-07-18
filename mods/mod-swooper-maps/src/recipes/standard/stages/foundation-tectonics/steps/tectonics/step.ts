import { resolvePlateActivityOrogenyMultiplier } from "@mapgen/domain/foundation/model/policy/plate-activity.js";
import { createStep } from "@swooper/mapgen-core/authoring";
import { interleaveXY, type VizProjection, type VizVariantKey } from "@swooper/mapgen-viz";
import {
  defineStandardVizCategoryMeta,
  defineStandardVizMeta,
  STANDARD_VIZ_COLORS,
} from "../../../../viz.js";
import { segmentsFromCellPairs } from "../../../foundation/viz.js";
import { TectonicsStepContract } from "./config.js";

const GROUP_TECTONICS = "Foundation / Tectonics";
const GROUP_TECTONIC_HISTORY = "Foundation / Tectonic History";
const WORLD_SPACE_ID = "world.xy" as const;
const OROGENY_ERA_GAIN_MIN = 0.85;
const OROGENY_ERA_GAIN_MAX = 1.15;

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
export const TectonicsStep = createStep(TectonicsStepContract, {
  normalize: (config, ctx) => {
    // plateActivity scales post-classification orogeny intensity without moving boundaries.
    const { plateActivity } = ctx.knobs as Readonly<{ plateActivity?: number }>;
    if (config.computeEraTectonicFields.strategy !== "default") return config;
    const orogenyActivityGain = resolvePlateActivityOrogenyMultiplier(plateActivity);
    return {
      ...config,
      computeEraTectonicFields: {
        ...config.computeEraTectonicFields,
        config: { ...config.computeEraTectonicFields.config, orogenyActivityGain },
      },
    };
  },
  run: (context, config, ops, deps) => {
    const mesh = deps.artifacts.foundationMesh.read(context);
    const mantleForcing = deps.artifacts.foundationMantleForcing.read(context);
    const crust = deps.artifacts.foundationCrustInit.read(context);
    const plateGraph = deps.artifacts.foundationPlateGraph.read(context);
    const plateMotion = deps.artifacts.foundationPlateMotion.read(context);

    const segmentsResult = ops.computeTectonicSegments(
      { mesh, crust, plateGraph, plateMotion },
      config.computeTectonicSegments
    );
    deps.artifacts.foundationTectonicSegments.publish(context, segmentsResult.segments);

    const eraPlateMembership = ops.computeEraPlateMembership(
      { mesh, plateGraph, plateMotion },
      config.computeEraPlateMembership
    );

    const eraFieldsChain: Array<ReturnType<typeof ops.computeEraTectonicFields>["eraFields"]> = [];
    for (let era = 0; era < eraPlateMembership.eraCount; era++) {
      const eraPlateId =
        eraPlateMembership.plateIdByEra[era] ??
        eraPlateMembership.plateIdByEra[eraPlateMembership.plateIdByEra.length - 1];
      if (!eraPlateId) continue;

      const eraPlateGraph: typeof plateGraph = {
        cellToPlate: eraPlateId,
        plates: plateGraph.plates,
      };
      const eraPlateMotion = ops.computePlateMotion(
        { mesh, mantleForcing, plateGraph: eraPlateGraph },
        config.computePlateMotion
      ).plateMotion;
      const eraSegments = ops.computeTectonicSegments(
        { mesh, crust, plateGraph: eraPlateGraph, plateMotion: eraPlateMotion },
        config.computeTectonicSegments
      ).segments;
      const segmentEvents = ops.computeSegmentEvents(
        { mesh, crust, segments: eraSegments },
        config.computeSegmentEvents
      );
      const hotspotEvents = ops.computeHotspotEvents(
        { mesh, mantleForcing, eraPlateId },
        config.computeHotspotEvents
      );
      const t = eraPlateMembership.eraCount > 1 ? era / (eraPlateMembership.eraCount - 1) : 0;
      const eraGain = OROGENY_ERA_GAIN_MIN + (OROGENY_ERA_GAIN_MAX - OROGENY_ERA_GAIN_MIN) * t;
      const eraFields = ops.computeEraTectonicFields(
        {
          mesh,
          segmentEvents: segmentEvents.events,
          hotspotEvents: hotspotEvents.events,
          weight: eraPlateMembership.eraWeights[era] ?? 0,
          eraGain,
        },
        config.computeEraTectonicFields
      );
      eraFieldsChain.push(eraFields.eraFields);
    }

    const historyResult = ops.computeTectonicHistoryRollups(
      { eras: eraFieldsChain, plateIdByEra: eraPlateMembership.plateIdByEra },
      config.computeTectonicHistoryRollups
    );
    const newestEra =
      eraFieldsChain[eraPlateMembership.eraCount - 1] ?? eraFieldsChain[eraFieldsChain.length - 1];
    if (!newestEra) {
      throw new Error("[Foundation] tectonics step failed to derive newest era fields.");
    }
    const tectonicsResult = ops.computeTectonicsCurrent(
      { newestEra, upliftTotal: historyResult.tectonicHistory.upliftTotal },
      config.computeTectonicsCurrent
    );
    const tracerResult = ops.computeTracerAdvection(
      { mesh, mantleForcing, eras: eraFieldsChain, eraCount: eraPlateMembership.eraCount },
      config.computeTracerAdvection
    );
    const provenanceResult = ops.computeTectonicProvenance(
      {
        mesh,
        plateGraph,
        eras: eraFieldsChain,
        tracerIndex: tracerResult.tracerIndex,
        eraCount: eraPlateMembership.eraCount,
      },
      config.computeTectonicProvenance
    );

    deps.artifacts.foundationTectonicHistory.publish(context, historyResult.tectonicHistory);
    deps.artifacts.foundationTectonicProvenance.publish(
      context,
      provenanceResult.tectonicProvenance
    );
    deps.artifacts.foundationTectonics.publish(context, tectonicsResult.tectonics);
    return {
      mesh,
      segments: segmentsResult.segments,
      tectonics: tectonicsResult.tectonics,
      history: historyResult.tectonicHistory,
    };
  },
  viz: ({ result: { mesh, segments, tectonics, history } }) => {
    const projections: VizProjection[] = [];
    const positions = interleaveXY(mesh.siteX, mesh.siteY);
    const segmentGeometry = segmentsFromCellPairs(
      segments.aCell,
      segments.bCell,
      mesh.siteX,
      mesh.siteY
    );
    const addPoints = (
      dataTypeKey: string,
      values: Uint8Array,
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
      values: Uint8Array,
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

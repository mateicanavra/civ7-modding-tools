import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { foundationArtifacts } from "../artifacts.js";
import TectonicsStepContract from "./tectonics.contract.js";
import {
  validateTectonicHistoryArtifact,
  validateTectonicSegmentsArtifact,
  validateTectonicsArtifact,
  wrapFoundationValidateNoDims,
} from "./validation.js";
import { interleaveXY, segmentsFromCellPairs } from "./viz.js";

const GROUP_TECTONICS = "Foundation / Tectonics";
const GROUP_TECTONIC_HISTORY = "Foundation / Tectonic History";
const WORLD_SPACE_ID = "world.xy" as const;

export default createStep(TectonicsStepContract, {
  artifacts: implementArtifacts(
    [foundationArtifacts.tectonicSegments, foundationArtifacts.tectonicHistory, foundationArtifacts.tectonics],
    {
      foundationTectonicSegments: {
        validate: (value) => wrapFoundationValidateNoDims(value, validateTectonicSegmentsArtifact),
      },
      foundationTectonicHistory: {
        validate: (value) => wrapFoundationValidateNoDims(value, validateTectonicHistoryArtifact),
      },
      foundationTectonics: {
        validate: (value) => wrapFoundationValidateNoDims(value, validateTectonicsArtifact),
      },
    }
  ),
  run: (context, config, ops, deps) => {
    const mesh = deps.artifacts.foundationMesh.read(context);
    const crust = deps.artifacts.foundationCrust.read(context);
    const plateGraph = deps.artifacts.foundationPlateGraph.read(context);

    const segmentsResult = ops.computeTectonicSegments(
      {
        mesh,
        crust,
        plateGraph,
      },
      config.computeTectonicSegments
    );

    deps.artifacts.foundationTectonicSegments.publish(context, segmentsResult.segments);

    const historyResult = ops.computeTectonicHistory(
      {
        mesh,
        segments: segmentsResult.segments,
      },
      config.computeTectonicHistory
    );

    deps.artifacts.foundationTectonicHistory.publish(context, historyResult.tectonicHistory);
    deps.artifacts.foundationTectonics.publish(context, historyResult.tectonics);

    const positions = interleaveXY(mesh.siteX, mesh.siteY);
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.tectonics.boundaryType",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonics.boundaryType,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonics.boundaryType", {
        label: "Boundary Type",
        group: GROUP_TECTONICS,
        categories: [
          { value: 0, label: "None/Unknown", color: [107, 114, 128, 180] },
          { value: 1, label: "Convergent", color: [239, 68, 68, 240] },
          { value: 2, label: "Divergent", color: [59, 130, 246, 240] },
          { value: 3, label: "Transform", color: [245, 158, 11, 240] },
        ],
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.tectonics.upliftPotential",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonics.upliftPotential,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonics.upliftPotential", {
        label: "Uplift Potential",
        group: GROUP_TECTONICS,
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.tectonics.riftPotential",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonics.riftPotential,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonics.riftPotential", {
        label: "Rift Potential",
        group: GROUP_TECTONICS,
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.tectonics.shearStress",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonics.shearStress,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonics.shearStress", {
        label: "Shear Stress",
        group: GROUP_TECTONICS,
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.tectonics.volcanism",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonics.volcanism,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonics.volcanism", {
        label: "Volcanism",
        group: GROUP_TECTONICS,
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.tectonics.fracture",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonics.fracture,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonics.fracture", {
        label: "Fracture",
        group: GROUP_TECTONICS,
      }),
    });

    context.viz?.dumpSegments(context.trace, {
      dataTypeKey: "foundation.tectonics.segmentRegime",
      spaceId: WORLD_SPACE_ID,
      segments: segmentsFromCellPairs(
        segmentsResult.segments.aCell,
        segmentsResult.segments.bCell,
        mesh.siteX,
        mesh.siteY
      ),
      values: segmentsResult.segments.regime,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonics.segmentRegime", {
        label: "Tectonic Segment Regime",
        group: GROUP_TECTONICS,
      }),
    });

    context.viz?.dumpSegments(context.trace, {
      dataTypeKey: "foundation.tectonics.segmentCompression",
      spaceId: WORLD_SPACE_ID,
      segments: segmentsFromCellPairs(
        segmentsResult.segments.aCell,
        segmentsResult.segments.bCell,
        mesh.siteX,
        mesh.siteY
      ),
      values: segmentsResult.segments.compression,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonics.segmentCompression", {
        label: "Tectonic Segment Compression",
        group: GROUP_TECTONICS,
      }),
    });

    context.viz?.dumpSegments(context.trace, {
      dataTypeKey: "foundation.tectonics.segmentExtension",
      spaceId: WORLD_SPACE_ID,
      segments: segmentsFromCellPairs(
        segmentsResult.segments.aCell,
        segmentsResult.segments.bCell,
        mesh.siteX,
        mesh.siteY
      ),
      values: segmentsResult.segments.extension,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonics.segmentExtension", {
        label: "Tectonic Segment Extension",
        group: GROUP_TECTONICS,
      }),
    });

    context.viz?.dumpSegments(context.trace, {
      dataTypeKey: "foundation.tectonics.segmentShear",
      spaceId: WORLD_SPACE_ID,
      segments: segmentsFromCellPairs(
        segmentsResult.segments.aCell,
        segmentsResult.segments.bCell,
        mesh.siteX,
        mesh.siteY
      ),
      values: segmentsResult.segments.shear,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonics.segmentShear", {
        label: "Tectonic Segment Shear",
        group: GROUP_TECTONICS,
      }),
    });

    context.viz?.dumpSegments(context.trace, {
      dataTypeKey: "foundation.tectonics.segmentVolcanism",
      spaceId: WORLD_SPACE_ID,
      segments: segmentsFromCellPairs(
        segmentsResult.segments.aCell,
        segmentsResult.segments.bCell,
        mesh.siteX,
        mesh.siteY
      ),
      values: segmentsResult.segments.volcanism,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonics.segmentVolcanism", {
        label: "Tectonic Segment Volcanism",
        group: GROUP_TECTONICS,
      }),
    });

    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.tectonicHistory.upliftTotal",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonicHistory.upliftTotal,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonicHistory.upliftTotal", {
        label: "Uplift Total",
        group: GROUP_TECTONIC_HISTORY,
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.tectonicHistory.fractureTotal",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonicHistory.fractureTotal,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonicHistory.fractureTotal", {
        label: "Fracture Total",
        group: GROUP_TECTONIC_HISTORY,
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.tectonicHistory.volcanismTotal",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonicHistory.volcanismTotal,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonicHistory.volcanismTotal", {
        label: "Volcanism Total",
        group: GROUP_TECTONIC_HISTORY,
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.tectonicHistory.upliftRecentFraction",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonicHistory.upliftRecentFraction,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonicHistory.upliftRecentFraction", {
        label: "Recent Uplift Fraction",
        group: GROUP_TECTONIC_HISTORY,
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.tectonicHistory.lastActiveEra",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonicHistory.lastActiveEra,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonicHistory.lastActiveEra", {
        label: "Last Active Era",
        group: GROUP_TECTONIC_HISTORY,
      }),
    });

    const eras = historyResult.tectonicHistory.eras ?? [];
    for (let eraIndex = 0; eraIndex < eras.length; eraIndex++) {
      const era = eras[eraIndex];
      if (!era) continue;
      const prefix = `foundation.tectonicHistory.era${eraIndex}`;
      const eraLabel = `Era ${eraIndex + 1}`;
      const eraGroup = `${GROUP_TECTONIC_HISTORY} / ${eraLabel}`;

      context.viz?.dumpPoints(context.trace, {
        dataTypeKey: `${prefix}.boundaryType`,
        spaceId: WORLD_SPACE_ID,
        positions,
        values: era.boundaryType,
        valueFormat: "u8",
        meta: defineVizMeta(`${prefix}.boundaryType`, {
          label: `${eraLabel} Boundary Type`,
          group: eraGroup,
          categories: [
            { value: 0, label: "None/Unknown", color: [107, 114, 128, 180] },
            { value: 1, label: "Convergent", color: [239, 68, 68, 240] },
            { value: 2, label: "Divergent", color: [59, 130, 246, 240] },
            { value: 3, label: "Transform", color: [245, 158, 11, 240] },
          ],
        }),
      });
      context.viz?.dumpPoints(context.trace, {
        dataTypeKey: `${prefix}.upliftPotential`,
        spaceId: WORLD_SPACE_ID,
        positions,
        values: era.upliftPotential,
        valueFormat: "u8",
        meta: defineVizMeta(`${prefix}.upliftPotential`, {
          label: `${eraLabel} Uplift Potential`,
          group: eraGroup,
        }),
      });
      context.viz?.dumpPoints(context.trace, {
        dataTypeKey: `${prefix}.riftPotential`,
        spaceId: WORLD_SPACE_ID,
        positions,
        values: era.riftPotential,
        valueFormat: "u8",
        meta: defineVizMeta(`${prefix}.riftPotential`, {
          label: `${eraLabel} Rift Potential`,
          group: eraGroup,
        }),
      });
      context.viz?.dumpPoints(context.trace, {
        dataTypeKey: `${prefix}.shearStress`,
        spaceId: WORLD_SPACE_ID,
        positions,
        values: era.shearStress,
        valueFormat: "u8",
        meta: defineVizMeta(`${prefix}.shearStress`, {
          label: `${eraLabel} Shear Stress`,
          group: eraGroup,
        }),
      });
      context.viz?.dumpPoints(context.trace, {
        dataTypeKey: `${prefix}.volcanism`,
        spaceId: WORLD_SPACE_ID,
        positions,
        values: era.volcanism,
        valueFormat: "u8",
        meta: defineVizMeta(`${prefix}.volcanism`, {
          label: `${eraLabel} Volcanism`,
          group: eraGroup,
        }),
      });
      context.viz?.dumpPoints(context.trace, {
        dataTypeKey: `${prefix}.fracture`,
        spaceId: WORLD_SPACE_ID,
        positions,
        values: era.fracture,
        valueFormat: "u8",
        meta: defineVizMeta(`${prefix}.fracture`, {
          label: `${eraLabel} Fracture`,
          group: eraGroup,
        }),
      });
    }
  },
});

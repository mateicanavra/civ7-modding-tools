import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { foundationArtifacts } from "../artifacts.js";
import TectonicsStepContract from "./tectonics.contract.js";
import {
  validateTectonicHistoryArtifact,
  validateTectonicProvenanceArtifact,
  validateTectonicSegmentsArtifact,
  validateTectonicsArtifact,
  wrapFoundationValidateNoDims,
} from "./validation.js";
import { interleaveXY, segmentsFromCellPairs } from "./viz.js";

const GROUP_TECTONICS = "Foundation / Tectonics";
const GROUP_TECTONIC_HISTORY = "Foundation / Tectonic History";
const WORLD_SPACE_ID = "world.xy" as const;

const BOUNDARY_TYPE_CATEGORIES = [
  { value: 0, label: "None/Unknown", color: [107, 114, 128, 180] as [number, number, number, number] },
  { value: 1, label: "Convergent", color: [239, 68, 68, 240] as [number, number, number, number] },
  { value: 2, label: "Divergent", color: [59, 130, 246, 240] as [number, number, number, number] },
  { value: 3, label: "Transform", color: [245, 158, 11, 240] as [number, number, number, number] },
];

export default createStep(TectonicsStepContract, {
  artifacts: implementArtifacts(
    [
      foundationArtifacts.tectonicSegments,
      foundationArtifacts.tectonicHistory,
      foundationArtifacts.tectonicProvenance,
      foundationArtifacts.tectonics,
    ],
    {
      foundationTectonicSegments: {
        validate: (value) => wrapFoundationValidateNoDims(value, validateTectonicSegmentsArtifact),
      },
      foundationTectonicHistory: {
        validate: (value) => wrapFoundationValidateNoDims(value, validateTectonicHistoryArtifact),
      },
      foundationTectonicProvenance: {
        validate: (value) => wrapFoundationValidateNoDims(value, validateTectonicProvenanceArtifact),
      },
      foundationTectonics: {
        validate: (value) => wrapFoundationValidateNoDims(value, validateTectonicsArtifact),
      },
    }
  ),
  run: (context, config, ops, deps) => {
    const mesh = deps.artifacts.foundationMesh.read(context);
    const mantleForcing = deps.artifacts.foundationMantleForcing.read(context);
    const crust = deps.artifacts.foundationCrustInit.read(context);
    const plateGraph = deps.artifacts.foundationPlateGraph.read(context);
    const plateMotion = deps.artifacts.foundationPlateMotion.read(context);

    const segmentsResult = ops.computeTectonicSegments(
      {
        mesh,
        crust,
        plateGraph,
        plateMotion,
      },
      config.computeTectonicSegments
    );

    deps.artifacts.foundationTectonicSegments.publish(context, segmentsResult.segments);

    const historyResult = ops.computeTectonicHistory(
      {
        mesh,
        crust,
        mantleForcing,
        plateGraph,
        plateMotion,
      },
      config.computeTectonicHistory
    );

    deps.artifacts.foundationTectonicHistory.publish(context, historyResult.tectonicHistory);
    deps.artifacts.foundationTectonicProvenance.publish(context, historyResult.tectonicProvenance);
    deps.artifacts.foundationTectonics.publish(context, historyResult.tectonics);

    const positions = interleaveXY(mesh.siteX, mesh.siteY);
    context.viz?.dumpSegments(context.trace, {
      dataTypeKey: "foundation.tectonics.boundaryType",
      variantKey: "snapshot:latest",
      spaceId: WORLD_SPACE_ID,
      segments: segmentsFromCellPairs(
        segmentsResult.segments.aCell,
        segmentsResult.segments.bCell,
        mesh.siteX,
        mesh.siteY
      ),
      values: segmentsResult.segments.regime,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonics.boundaryType", {
        label: "Boundary Type",
        group: GROUP_TECTONICS,
        role: "edges",
        categories: BOUNDARY_TYPE_CATEGORIES,
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.tectonics.boundaryType",
      variantKey: "snapshot:latest",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonics.boundaryType,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonics.boundaryType", {
        label: "Boundary Type",
        group: GROUP_TECTONICS,
        visibility: "debug",
        categories: BOUNDARY_TYPE_CATEGORIES,
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.tectonics.upliftPotential",
      variantKey: "snapshot:latest",
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
      variantKey: "snapshot:latest",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonics.riftPotential,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonics.riftPotential", {
        label: "Rift Potential",
        group: GROUP_TECTONICS,
        visibility: "debug",
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.tectonics.shearStress",
      variantKey: "snapshot:latest",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonics.shearStress,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonics.shearStress", {
        label: "Shear Stress",
        group: GROUP_TECTONICS,
        visibility: "debug",
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.tectonics.volcanism",
      variantKey: "snapshot:latest",
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
      variantKey: "snapshot:latest",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonics.fracture,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.tectonics.fracture", {
        label: "Fracture",
        group: GROUP_TECTONICS,
        visibility: "debug",
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
        visibility: "debug",
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
        visibility: "debug",
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
        visibility: "debug",
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
        visibility: "debug",
      }),
    });

    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.history.upliftTotal",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonicHistory.upliftTotal,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.history.upliftTotal", {
        label: "Uplift Total",
        group: GROUP_TECTONIC_HISTORY,
        visibility: "debug",
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.history.fractureTotal",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonicHistory.fractureTotal,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.history.fractureTotal", {
        label: "Fracture Total",
        group: GROUP_TECTONIC_HISTORY,
        visibility: "debug",
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.history.volcanismTotal",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonicHistory.volcanismTotal,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.history.volcanismTotal", {
        label: "Volcanism Total",
        group: GROUP_TECTONIC_HISTORY,
        visibility: "debug",
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.history.upliftRecentFraction",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonicHistory.upliftRecentFraction,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.history.upliftRecentFraction", {
        label: "Recent Uplift Fraction",
        group: GROUP_TECTONIC_HISTORY,
        visibility: "debug",
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.history.lastActiveEra",
      spaceId: WORLD_SPACE_ID,
      positions,
      values: historyResult.tectonicHistory.lastActiveEra,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.history.lastActiveEra", {
        label: "Last Active Era",
        group: GROUP_TECTONIC_HISTORY,
        visibility: "debug",
      }),
    });

    const eras = historyResult.tectonicHistory.eras ?? [];
    for (let eraIndex = 0; eraIndex < eras.length; eraIndex++) {
      const era = eras[eraIndex];
      if (!era) continue;
      const variantKey = `era:${eraIndex + 1}`;

      context.viz?.dumpPoints(context.trace, {
        dataTypeKey: "foundation.history.boundaryType",
        variantKey,
        spaceId: WORLD_SPACE_ID,
        positions,
        values: era.boundaryType,
        valueFormat: "u8",
        meta: defineVizMeta("foundation.history.boundaryType", {
          label: "Boundary Type (History)",
          group: GROUP_TECTONIC_HISTORY,
          categories: BOUNDARY_TYPE_CATEGORIES,
        }),
      });
      context.viz?.dumpPoints(context.trace, {
        dataTypeKey: "foundation.history.upliftPotential",
        variantKey,
        spaceId: WORLD_SPACE_ID,
        positions,
        values: era.upliftPotential,
        valueFormat: "u8",
        meta: defineVizMeta("foundation.history.upliftPotential", {
          label: "Uplift Potential (History)",
          group: GROUP_TECTONIC_HISTORY,
        }),
      });
      context.viz?.dumpPoints(context.trace, {
        dataTypeKey: "foundation.history.riftPotential",
        variantKey,
        spaceId: WORLD_SPACE_ID,
        positions,
        values: era.riftPotential,
        valueFormat: "u8",
        meta: defineVizMeta("foundation.history.riftPotential", {
          label: "Rift Potential (History)",
          group: GROUP_TECTONIC_HISTORY,
        }),
      });
      context.viz?.dumpPoints(context.trace, {
        dataTypeKey: "foundation.history.shearStress",
        variantKey,
        spaceId: WORLD_SPACE_ID,
        positions,
        values: era.shearStress,
        valueFormat: "u8",
        meta: defineVizMeta("foundation.history.shearStress", {
          label: "Shear Stress (History)",
          group: GROUP_TECTONIC_HISTORY,
        }),
      });
      context.viz?.dumpPoints(context.trace, {
        dataTypeKey: "foundation.history.volcanism",
        variantKey,
        spaceId: WORLD_SPACE_ID,
        positions,
        values: era.volcanism,
        valueFormat: "u8",
        meta: defineVizMeta("foundation.history.volcanism", {
          label: "Volcanism (History)",
          group: GROUP_TECTONIC_HISTORY,
        }),
      });
      context.viz?.dumpPoints(context.trace, {
        dataTypeKey: "foundation.history.fracture",
        variantKey,
        spaceId: WORLD_SPACE_ID,
        positions,
        values: era.fracture,
        valueFormat: "u8",
        meta: defineVizMeta("foundation.history.fracture", {
          label: "Fracture (History)",
          group: GROUP_TECTONIC_HISTORY,
        }),
      });
    }
  },
});

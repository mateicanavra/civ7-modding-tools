import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";
import {
  type ProjectedTectonicHistoryEra,
  ProjectedTectonicHistoryEraSchema,
} from "../model/atoms/tectonic-history-era.schema.js";
import {
  type ProjectedTectonicHistoryRollups,
  ProjectedTectonicHistoryRollupsSchema,
} from "../model/atoms/tectonic-history-rollups.schema.js";

type TectonicHistoryTiles = Readonly<{
  eraCount: number;
  perEra: ReadonlyArray<ProjectedTectonicHistoryEra>;
  rollups: ProjectedTectonicHistoryRollups;
}>;

/**
 * Registers Foundation's ordered 5-8 era history and cumulative/recent
 * rollups after projection from mesh cells into tile space.
 */
export const artifact = defineArtifact({
  name: "foundationTectonicHistoryTiles",
  id: "artifact:foundation.tectonicHistoryTiles",
  schema: Type.Object(
    {
      version: Type.Integer({ minimum: 1 }),
      eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
      perEra: Type.Immutable(Type.Array(ProjectedTectonicHistoryEraSchema)),
      rollups: ProjectedTectonicHistoryRollupsSchema,
    },
    {
      additionalProperties: false,
      description: "Reconstructed tectonic eras and rollups projected into map-tile space.",
    }
  ),
  refine: (input, context?: ArtifactValidationContext): readonly ArtifactValidationIssue[] => {
    const history = input as TectonicHistoryTiles;
    const issues: ArtifactValidationIssue[] = [];

    if (history.perEra.length !== history.eraCount) {
      issues.push({
        message: "[FoundationArtifact] Invalid foundation tectonicHistoryTiles.perEra.",
      });
    }

    const size = artifactCellCount(context);
    for (let index = 0; index < history.perEra.length; index++) {
      const fields = history.perEra[index];
      const label = `tectonicHistoryTiles.perEra[${index}]`;
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.boundaryType`,
        fields.boundaryType,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.convergentMask`,
        fields.convergentMask,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.divergentMask`,
        fields.divergentMask,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.transformMask`,
        fields.transformMask,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.upliftPotential`,
        fields.upliftPotential,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.collisionPotential`,
        fields.collisionPotential,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.subductionPotential`,
        fields.subductionPotential,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.riftPotential`,
        fields.riftPotential,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.shearStress`,
        fields.shearStress,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.volcanism`,
        fields.volcanism,
        Uint8Array,
        size
      );
      appendArtifactTypedArrayIssues(
        issues,
        `${label}.fracture`,
        fields.fracture,
        Uint8Array,
        size
      );
    }

    const fields = history.rollups;
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.upliftTotal",
      fields.upliftTotal,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.collisionTotal",
      fields.collisionTotal,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.subductionTotal",
      fields.subductionTotal,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.fractureTotal",
      fields.fractureTotal,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.volcanismTotal",
      fields.volcanismTotal,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.upliftRecentFraction",
      fields.upliftRecentFraction,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.collisionRecentFraction",
      fields.collisionRecentFraction,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.subductionRecentFraction",
      fields.subductionRecentFraction,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.lastActiveEra",
      fields.lastActiveEra,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.lastCollisionEra",
      fields.lastCollisionEra,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.lastSubductionEra",
      fields.lastSubductionEra,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.movementU",
      fields.movementU,
      Int8Array,
      size
    );
    appendArtifactTypedArrayIssues(
      issues,
      "tectonicHistoryTiles.rollups.movementV",
      fields.movementV,
      Int8Array,
      size
    );

    return Object.freeze(issues);
  },
});

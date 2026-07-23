import type { ArtifactValidationIssue } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";
import {
  type PlateMembership,
  PlateMembershipSchema,
} from "../model/atoms/plate-membership.schema.js";
import {
  type TectonicHistoryEra,
  TectonicHistoryEraSchema,
} from "../model/atoms/tectonic-history-era.schema.js";

type TectonicHistory = Readonly<{
  eraCount: number;
  eras: ReadonlyArray<TectonicHistoryEra>;
  plateIdByEra: ReadonlyArray<PlateMembership>;
  upliftTotal: Uint8Array;
  collisionTotal: Uint8Array;
  subductionTotal: Uint8Array;
  fractureTotal: Uint8Array;
  volcanismTotal: Uint8Array;
  upliftRecentFraction: Uint8Array;
  collisionRecentFraction: Uint8Array;
  subductionRecentFraction: Uint8Array;
  lastActiveEra: Uint8Array;
  lastCollisionEra: Uint8Array;
  lastSubductionEra: Uint8Array;
}>;

/** Registers Foundation's tectonic-history artifact. */
export const artifact = defineArtifact({
  name: "foundationTectonicHistory",
  id: "artifact:foundation.tectonicHistory",
  schema: Type.Object(
    {
      eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
      eras: Type.Immutable(Type.Array(TectonicHistoryEraSchema)),
      plateIdByEra: Type.Immutable(Type.Array(PlateMembershipSchema)),
      upliftTotal: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      collisionTotal: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      subductionTotal: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      fractureTotal: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      volcanismTotal: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      upliftRecentFraction: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      collisionRecentFraction: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      subductionRecentFraction: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      lastActiveEra: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      lastCollisionEra: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      lastSubductionEra: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
    },
    {
      additionalProperties: false,
      description: "Reconstructed tectonic eras, plate membership, totals, and recency evidence.",
    }
  ),
  refine: (value): readonly ArtifactValidationIssue[] => {
    const history = value as TectonicHistory;
    const issues: ArtifactValidationIssue[] = [];
    if (history.eras.length !== history.eraCount) {
      issues.push({ message: "eras length must match eraCount" });
    }
    if (history.plateIdByEra.length !== history.eraCount) {
      issues.push({ message: "plateIdByEra length must match eraCount" });
    }
    const totals = [
      history.upliftTotal,
      history.collisionTotal,
      history.subductionTotal,
      history.fractureTotal,
      history.volcanismTotal,
      history.upliftRecentFraction,
      history.collisionRecentFraction,
      history.subductionRecentFraction,
      history.lastActiveEra,
      history.lastCollisionEra,
      history.lastSubductionEra,
    ].filter((candidate): candidate is Uint8Array => candidate instanceof Uint8Array);
    const cellCount = totals[0]?.length ?? 0;
    if (cellCount <= 0) issues.push({ message: "tectonicHistory arrays must be nonempty" });
    for (const key of [
      "upliftTotal",
      "collisionTotal",
      "subductionTotal",
      "fractureTotal",
      "volcanismTotal",
      "upliftRecentFraction",
      "collisionRecentFraction",
      "subductionRecentFraction",
      "lastActiveEra",
      "lastCollisionEra",
      "lastSubductionEra",
    ] as const) {
      appendArtifactTypedArrayIssues(issues, key, history[key], Uint8Array, cellCount);
    }
    history.eras.forEach((era, eraIndex) => {
      for (const key of [
        "boundaryType",
        "upliftPotential",
        "collisionPotential",
        "subductionPotential",
        "riftPotential",
        "shearStress",
        "volcanism",
        "fracture",
      ] as const) {
        appendArtifactTypedArrayIssues(
          issues,
          `eras[${eraIndex}].${key}`,
          era[key],
          Uint8Array,
          cellCount
        );
      }
    });
    history.plateIdByEra.forEach((era, eraIndex) => {
      appendArtifactTypedArrayIssues(
        issues,
        `plateIdByEra[${eraIndex}]`,
        era,
        Int16Array,
        cellCount
      );
    });
    return issues;
  },
});

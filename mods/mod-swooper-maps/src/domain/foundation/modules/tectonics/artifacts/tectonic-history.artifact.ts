import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { PlateMembershipSchema } from "../model/atoms/plate-membership.schema.js";
import { TectonicHistoryEraSchema } from "../model/atoms/tectonic-history-era.schema.js";

const TECTONIC_HISTORY_ROLLUP_KEYS = [
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
] as const;

const TECTONIC_HISTORY_ERA_KEYS = [
  "boundaryType",
  "upliftPotential",
  "collisionPotential",
  "subductionPotential",
  "riftPotential",
  "shearStress",
  "volcanism",
  "fracture",
] as const;

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
  refine: (value, { issues }) => {
    if (value.eras.length !== value.eraCount) {
      issues.add("eras length must match eraCount");
    }
    if (value.plateIdByEra.length !== value.eraCount) {
      issues.add("plateIdByEra length must match eraCount");
    }
    const cellCount = value.upliftTotal.length;
    if (cellCount <= 0) issues.add("tectonicHistory arrays must be nonempty");
    for (const key of TECTONIC_HISTORY_ROLLUP_KEYS) {
      if (value[key].length !== cellCount) {
        issues.add(`Expected ${key} length ${cellCount} (received ${value[key].length}).`);
      }
    }
    value.eras.forEach((era, eraIndex) => {
      for (const key of TECTONIC_HISTORY_ERA_KEYS) {
        if (era[key].length !== cellCount) {
          issues.add(
            `Expected eras[${eraIndex}].${key} length ${cellCount} (received ${era[key].length}).`
          );
        }
      }
    });
    value.plateIdByEra.forEach((era, eraIndex) => {
      if (era.length !== cellCount) {
        issues.add(
          `Expected plateIdByEra[${eraIndex}] length ${cellCount} (received ${era.length}).`
        );
      }
    });
  },
});

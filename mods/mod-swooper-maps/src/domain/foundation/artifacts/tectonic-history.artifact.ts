import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { Value } from "typebox/value";

const EraFieldsSchema = Type.Object(
  {
    boundaryType: TypedArraySchemas.u8({ shape: null }),
    upliftPotential: TypedArraySchemas.u8({ shape: null }),
    collisionPotential: TypedArraySchemas.u8({ shape: null }),
    subductionPotential: TypedArraySchemas.u8({ shape: null }),
    riftPotential: TypedArraySchemas.u8({ shape: null }),
    shearStress: TypedArraySchemas.u8({ shape: null }),
    volcanism: TypedArraySchemas.u8({ shape: null }),
    fracture: TypedArraySchemas.u8({ shape: null }),
  },
  { additionalProperties: false }
);

export const Schema = Type.Object(
  {
    eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
    eras: Type.Immutable(Type.Array(EraFieldsSchema)),
    plateIdByEra: Type.Immutable(Type.Array(TypedArraySchemas.i16({ shape: null }))),
    upliftTotal: TypedArraySchemas.u8({ shape: null }),
    collisionTotal: TypedArraySchemas.u8({ shape: null }),
    subductionTotal: TypedArraySchemas.u8({ shape: null }),
    fractureTotal: TypedArraySchemas.u8({ shape: null }),
    volcanismTotal: TypedArraySchemas.u8({ shape: null }),
    upliftRecentFraction: TypedArraySchemas.u8({ shape: null }),
    collisionRecentFraction: TypedArraySchemas.u8({ shape: null }),
    subductionRecentFraction: TypedArraySchemas.u8({ shape: null }),
    lastActiveEra: TypedArraySchemas.u8({ shape: null }),
    lastCollisionEra: TypedArraySchemas.u8({ shape: null }),
    lastSubductionEra: TypedArraySchemas.u8({ shape: null }),
  },
  { additionalProperties: false }
);

export type Artifact = Static<typeof Schema>;

export const artifact = defineArtifact({
  name: "foundationTectonicHistory",
  id: "artifact:foundation.tectonicHistory",
  schema: Schema,
});

function issue(message: string): { message: string } {
  return { message };
}

function u8Issue(value: unknown, key: string, length: number): { message: string } | null {
  if (!(value instanceof Uint8Array)) return issue(`${key} must be Uint8Array`);
  if (value.length !== length) return issue(`${key} length must be ${length}`);
  return null;
}

function i16Issue(value: unknown, key: string, length: number): { message: string } | null {
  if (!(value instanceof Int16Array)) return issue(`${key} must be Int16Array`);
  if (value.length !== length) return issue(`${key} length must be ${length}`);
  return null;
}

export function validate(value: unknown): readonly { message: string }[] {
  const issues = Array.from(Value.Errors(Schema, value), (error) =>
    issue(
      `${(error as { path?: string; instancePath?: string }).path ?? (error as { instancePath?: string }).instancePath ?? "/"} ${error.message}`
    )
  );
  if (value && typeof value === "object") {
    const history = value as Record<string, unknown>;
    const eraCount = Number.isInteger(history.eraCount) ? (history.eraCount as number) : 0;
    if (!Array.isArray(history.eras) || history.eras.length !== eraCount) {
      issues.push(issue("eras length must match eraCount"));
    }
    if (!Array.isArray(history.plateIdByEra) || history.plateIdByEra.length !== eraCount) {
      issues.push(issue("plateIdByEra length must match eraCount"));
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
    if (cellCount <= 0) issues.push(issue("tectonicHistory arrays must be nonempty"));
    for (const [key, arr] of [
      ["upliftTotal", history.upliftTotal],
      ["collisionTotal", history.collisionTotal],
      ["subductionTotal", history.subductionTotal],
      ["fractureTotal", history.fractureTotal],
      ["volcanismTotal", history.volcanismTotal],
      ["upliftRecentFraction", history.upliftRecentFraction],
      ["collisionRecentFraction", history.collisionRecentFraction],
      ["subductionRecentFraction", history.subductionRecentFraction],
      ["lastActiveEra", history.lastActiveEra],
      ["lastCollisionEra", history.lastCollisionEra],
      ["lastSubductionEra", history.lastSubductionEra],
    ] as const) {
      const candidate = u8Issue(arr, key, cellCount);
      if (candidate) issues.push(candidate);
    }
    if (Array.isArray(history.eras)) {
      history.eras.forEach((rawEra, eraIndex) => {
        const era = rawEra as Record<string, unknown>;
        for (const field of [
          "boundaryType",
          "upliftPotential",
          "collisionPotential",
          "subductionPotential",
          "riftPotential",
          "shearStress",
          "volcanism",
          "fracture",
        ] as const) {
          const candidate = u8Issue(era?.[field], `eras[${eraIndex}].${field}`, cellCount);
          if (candidate) issues.push(candidate);
        }
      });
    }
    if (Array.isArray(history.plateIdByEra)) {
      history.plateIdByEra.forEach((arr, eraIndex) => {
        const candidate = i16Issue(arr, `plateIdByEra[${eraIndex}]`, cellCount);
        if (candidate) issues.push(candidate);
      });
    }
  }
  return Object.freeze(issues);
}

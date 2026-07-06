import {
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

export const FeatureApplyDiagnosticsArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    attempted: Type.Integer({ minimum: 0 }),
    applied: Type.Integer({ minimum: 0 }),
    rejected: Type.Integer({ minimum: 0 }),
    rejectedCanHaveFeature: Type.Integer({ minimum: 0 }),
    rejectedOutOfBounds: Type.Integer({ minimum: 0 }),
    rejectedUnknownFeature: Type.Integer({ minimum: 0 }),
    attemptedByFeature: Type.Record(Type.String(), Type.Integer({ minimum: 0 })),
    appliedByFeature: Type.Record(Type.String(), Type.Integer({ minimum: 0 })),
    rejectedCanHaveFeatureByFeature: Type.Record(Type.String(), Type.Integer({ minimum: 0 })),
    rejectionMask: TypedArraySchemas.u8({
      description: "Per-tile rejection mask (0=accepted/untouched, 1=rejected).",
    }),
  },
  { additionalProperties: false }
);

export type FeatureApplyDiagnosticsArtifact = Static<typeof FeatureApplyDiagnosticsArtifactSchema>;

export const Schema = FeatureApplyDiagnosticsArtifactSchema;

export const artifact = defineArtifact({
  name: "featureApplyDiagnostics",
  id: "artifact:ecology.featureApplyDiagnostics",
  schema: Schema,
});

export function validate(value: unknown): readonly { message: string }[] {
  return validateArtifactSchema(Schema, value);
}

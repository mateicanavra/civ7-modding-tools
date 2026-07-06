import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";

export const HydrologyClimateDiagnosticsSchema = Type.Object(
  {
    /** Advisory rain shadow proxy (0..1); used for debugging and optional downstream narrative biasing. */
    rainShadowIndex: TypedArraySchemas.f32({
      description:
        "Advisory rain shadow proxy (0..1) per tile (diagnostic projection; not Hydrology internal truth).",
    }),
    /** Advisory continentality proxy (0..1); higher values imply more interior/continental climate. */
    continentalityIndex: TypedArraySchemas.f32({
      description:
        "Advisory continentality proxy (0..1) per tile (diagnostic projection; not Hydrology internal truth).",
    }),
    /** Advisory convergence proxy (0..1); indicates likely convergence zones / storm tracks. */
    convergenceIndex: TypedArraySchemas.f32({
      description:
        "Advisory convergence proxy (0..1) per tile (diagnostic projection; not Hydrology internal truth).",
    }),
  },
  {
    description:
      "Hydrology refinement diagnostics (advisory indices; not Hydrology internal truth).",
  }
);

export const Schema = HydrologyClimateDiagnosticsSchema;

export const artifact = defineArtifact({
  name: "climateDiagnostics",
  id: "artifact:hydrology.climateDiagnostics",
  schema: Schema,
});

type ArtifactValidationIssue = Readonly<{ message: string }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function expectedSize(context: ArtifactValidationContext | undefined): number | undefined {
  const width = context?.dimensions?.width;
  const height = context?.dimensions?.height;
  if (!Number.isFinite(width) || !Number.isFinite(height)) return undefined;
  return Math.max(0, (width! | 0) * (height! | 0));
}

function validateTypedArray(
  errors: ArtifactValidationIssue[],
  label: string,
  value: unknown,
  ctor: { new (...args: any[]): { length: number } },
  expectedLength?: number
): void {
  if (!(value instanceof ctor)) {
    errors.push({ message: `Expected ${label} to be ${ctor.name}.` });
    return;
  }
  if (expectedLength != null && value.length !== expectedLength) {
    errors.push({
      message: `Expected ${label} length ${expectedLength} (received ${value.length}).`,
    });
  }
}

function validatePayload(
  value: unknown,
  context?: ArtifactValidationContext
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  const size = expectedSize(context);
  if (!isRecord(value))
    return [{ message: "Missing hydrology climate diagnostics artifact payload." }];
  const candidate = value as {
    rainShadowIndex?: unknown;
    continentalityIndex?: unknown;
    convergenceIndex?: unknown;
  };
  validateTypedArray(
    errors,
    "climateDiagnostics.rainShadowIndex",
    candidate.rainShadowIndex,
    Float32Array,
    size
  );
  validateTypedArray(
    errors,
    "climateDiagnostics.continentalityIndex",
    candidate.continentalityIndex,
    Float32Array,
    size
  );
  validateTypedArray(
    errors,
    "climateDiagnostics.convergenceIndex",
    candidate.convergenceIndex,
    Float32Array,
    size
  );
  return errors;
}

export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  return Object.freeze([
    ...validateArtifactSchema(Schema, value),
    ...validatePayload(value, context),
  ]);
}

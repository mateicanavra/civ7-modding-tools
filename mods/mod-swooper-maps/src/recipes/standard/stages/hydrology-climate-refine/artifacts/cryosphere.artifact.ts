import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Cryosphere state products (snow/sea-ice/albedo proxies).
 *
 * When `cryosphere` knob is `"off"`, these layers are still published but intentionally neutralized by config.
 */
export const HydrologyCryosphereSchema = Type.Object(
  {
    /** Snow cover fraction (0..255) per tile. */
    snowCover: TypedArraySchemas.u8({ description: "Snow cover fraction (0..255) per tile." }),
    /** Sea ice cover fraction (0..255) per tile. */
    seaIceCover: TypedArraySchemas.u8({ description: "Sea ice cover fraction (0..255) per tile." }),
    /** Albedo proxy (0..255) per tile; may feed bounded albedo feedback into temperature refinement. */
    albedo: TypedArraySchemas.u8({ description: "Albedo proxy (0..255) per tile." }),
    /** Ground ice persistence proxy (0..1) per tile; land-only. */
    groundIce01: TypedArraySchemas.f32({
      description: "Ground ice persistence proxy (0..1) per tile; land-only.",
    }),
    /** Permafrost proxy (0..1) per tile; land-only. */
    permafrost01: TypedArraySchemas.f32({
      description: "Permafrost proxy (0..1) per tile; land-only.",
    }),
    /** Melt potential proxy (0..1) per tile; land-only and snow-weighted. */
    meltPotential01: TypedArraySchemas.f32({
      description: "Melt potential proxy (0..1) per tile; land-only.",
    }),
  },
  {
    description:
      "Hydrology cryosphere state products (snow/sea-ice/albedo + cryosphere truth proxies).",
  }
);

/** Canonical schema entrypoint for snow, sea-ice, albedo, and frozen-ground state. */
export const Schema = HydrologyCryosphereSchema;

/**
 * Registers refined snow, sea-ice, albedo, ground-ice, permafrost, and melt-potential fields.
 * Downstream biome and ice planning consume one dimension-aligned cryosphere vintage.
 */
export const artifact = defineArtifact({
  name: "cryosphere",
  id: "artifact:hydrology.cryosphere",
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
  if (!isRecord(value)) return [{ message: "Missing hydrology cryosphere artifact payload." }];
  const candidate = value as { snowCover?: unknown; seaIceCover?: unknown; albedo?: unknown };
  validateTypedArray(errors, "cryosphere.snowCover", candidate.snowCover, Uint8Array, size);
  validateTypedArray(errors, "cryosphere.seaIceCover", candidate.seaIceCover, Uint8Array, size);
  validateTypedArray(errors, "cryosphere.albedo", candidate.albedo, Uint8Array, size);
  return errors;
}

/**
 * Validates cryosphere state against its closed schema and, when map dimensions are supplied,
 * verifies every tile field matches that width × height. It returns accumulated issues so
 * artifact admission can reject a structurally valid but spatially inconsistent payload.
 */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  return Object.freeze([
    ...validateArtifactSchema(Schema, value),
    ...validatePayload(value, context),
  ]);
}

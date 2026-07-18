import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Seasonal amplitude for Hydrology’s climate field outputs.
 *
 * This is the *public* seasonality output surface: Hydrology may internally simulate 2–4 seasonal modes, but it only
 * publishes the annual mean (via `artifact:hydrology.baselineClimateField`) and the corresponding amplitude fields here.
 */
export const ClimateSeasonalityArtifactSchema = Type.Object(
  {
    /** Number of seasonal modes used internally when computing amplitudes (2 or 4). */
    modeCount: Type.Union([Type.Literal(2), Type.Literal(4)], {
      description: "Seasonal mode count used for internal sampling (2=solstices, 4=quarter-year).",
    }),
    /** Effective axial tilt (declination amplitude) in degrees used for seasonal forcing. */
    axialTiltDeg: Type.Number({
      minimum: 0,
      maximum: 45,
      description:
        "Axial tilt in degrees used to simulate seasonal declination forcing (0 disables seasonal amplitudes).",
    }),
    /** Seasonal rainfall amplitude per tile (0..255), computed from the spread across seasonal modes. */
    rainfallAmplitude: TypedArraySchemas.u8({
      description: "Seasonal rainfall amplitude per tile (0..255; derived from seasonal spread).",
    }),
    /** Seasonal humidity amplitude per tile (0..255), computed from the spread across seasonal modes. */
    humidityAmplitude: TypedArraySchemas.u8({
      description: "Seasonal humidity amplitude per tile (0..255; derived from seasonal spread).",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Hydrology climate seasonality outputs: annual amplitude fields corresponding to the baseline climate mean.",
  }
);

/** Canonical schema entrypoint for seasonal forcing metadata and amplitude fields. */
export const Schema = ClimateSeasonalityArtifactSchema;

/**
 * Registers seasonal temperature, rainfall, and humidity amplitudes together with the sampled
 * seasonal mode count. Consumers can reason about variability without rerunning the baseline
 * circulation pass.
 */
export const artifact = defineArtifact({
  name: "climateSeasonality",
  id: "artifact:hydrology.climateSeasonality",
  schema: Schema,
});

export type ArtifactValidationIssue = Readonly<{ message: string }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validatePayload(value: unknown, expectedLength?: number): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) {
    errors.push({ message: "Missing hydrology climate seasonality artifact payload." });
    return errors;
  }

  const candidate = value as {
    modeCount?: unknown;
    axialTiltDeg?: unknown;
    rainfallAmplitude?: unknown;
    humidityAmplitude?: unknown;
  };

  const modeCount = candidate.modeCount;
  if (modeCount !== 2 && modeCount !== 4) {
    errors.push({ message: "Expected climateSeasonality.modeCount to be 2 or 4." });
  }
  if (typeof candidate.axialTiltDeg !== "number" || !Number.isFinite(candidate.axialTiltDeg)) {
    errors.push({ message: "Expected climateSeasonality.axialTiltDeg to be a finite number." });
  }

  appendArtifactTypedArrayIssues(
    errors,
    "climateSeasonality.rainfallAmplitude",
    candidate.rainfallAmplitude,
    Uint8Array,
    expectedLength
  );
  appendArtifactTypedArrayIssues(
    errors,
    "climateSeasonality.humidityAmplitude",
    candidate.humidityAmplitude,
    Uint8Array,
    expectedLength
  );
  return errors;
}

/**
 * Validates climate seasonality against its closed schema and, when map dimensions are
 * supplied, verifies every tile field matches that width × height. It returns accumulated
 * issues so artifact admission can reject a structurally valid but spatially inconsistent
 * payload.
 */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  return Object.freeze([
    ...validateArtifactSchema(Schema, value),
    ...validatePayload(value, artifactCellCount(context)),
  ]);
}

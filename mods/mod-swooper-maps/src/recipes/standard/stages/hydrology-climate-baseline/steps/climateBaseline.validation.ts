import type { MapDimensions } from "@civ7/adapter";

export type ArtifactValidationIssue = Readonly<{ message: string }>;

type TypedArrayConstructor = { new (...args: unknown[]): { length: number } };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function expectedSize(dimensions: MapDimensions): number {
  return Math.max(0, (dimensions.width | 0) * (dimensions.height | 0));
}

function validateTypedArray(
  errors: ArtifactValidationIssue[],
  label: string,
  value: unknown,
  ctor: TypedArrayConstructor,
  expectedLength?: number
): value is { length: number } {
  if (!(value instanceof ctor)) {
    errors.push({ message: `Expected ${label} to be ${ctor.name}.` });
    return false;
  }
  if (expectedLength != null && value.length !== expectedLength) {
    errors.push({
      message: `Expected ${label} length ${expectedLength} (received ${value.length}).`,
    });
  }
  return true;
}

/**
 * Validates the concrete climate buffers produced by this step before they are
 * published. This is intentionally step-local: the baseline climate algorithm
 * owns these mutable tensors, while TypeBox owns only the static artifact shape.
 */
export function validateClimateFieldArtifact(
  value: unknown,
  dimensions: MapDimensions
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) {
    errors.push({ message: "Missing climate field buffer." });
    return errors;
  }
  const size = expectedSize(dimensions);
  const candidate = value as { rainfall?: unknown; humidity?: unknown };
  validateTypedArray(errors, "climate.rainfall", candidate.rainfall, Uint8Array, size);
  validateTypedArray(errors, "climate.humidity", candidate.humidity, Uint8Array, size);
  return errors;
}

/**
 * Guards the public seasonality output of the climate-baseline step. The step
 * may sample multiple seasonal phases internally, but downstream consumers get
 * mean climate plus these amplitude tensors, so malformed buffers fail here.
 */
export function validateClimateSeasonalityArtifact(
  value: unknown,
  dimensions: MapDimensions
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  const size = expectedSize(dimensions);
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

  validateTypedArray(
    errors,
    "climateSeasonality.rainfallAmplitude",
    candidate.rainfallAmplitude,
    Uint8Array,
    size
  );
  validateTypedArray(
    errors,
    "climateSeasonality.humidityAmplitude",
    candidate.humidityAmplitude,
    Uint8Array,
    size
  );
  return errors;
}

/**
 * Keeps the wind/current buffers honest at the step boundary. These vectors are
 * physical driver fields for climate transport, so publishing a wrong typed
 * array class or wrong map size would create misleading downstream geography.
 */
export function validateWindFieldArtifact(
  value: unknown,
  dimensions: MapDimensions
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  const size = expectedSize(dimensions);
  if (!isRecord(value)) {
    return [{ message: "Missing wind field artifact payload." }];
  }
  const candidate = value as {
    windU?: unknown;
    windV?: unknown;
    currentU?: unknown;
    currentV?: unknown;
  };
  validateTypedArray(errors, "wind.windU", candidate.windU, Int8Array, size);
  validateTypedArray(errors, "wind.windV", candidate.windV, Int8Array, size);
  validateTypedArray(errors, "wind.currentU", candidate.currentU, Int8Array, size);
  validateTypedArray(errors, "wind.currentV", candidate.currentV, Int8Array, size);
  return errors;
}

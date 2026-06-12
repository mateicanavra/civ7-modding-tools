import type { MapDimensions } from "@civ7/adapter";
import { findInvalidRiverClassIndex } from "@mapgen/domain/hydrology/river-class.js";

export type ArtifactValidationIssue = Readonly<{ message: string }>;

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
  ctor: { new (...args: unknown[]): { length: number } },
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
 * Validates the hydrography tensors published by the rivers step. The routing
 * and discharge algorithm owns these arrays, so this publication check stays at
 * the step boundary instead of becoming a domain-wide artifact bucket.
 */
export function validateHydrographyArtifact(
  value: unknown,
  dimensions: MapDimensions
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  const size = expectedSize(dimensions);
  if (!isRecord(value)) {
    errors.push({ message: "Missing hydrology hydrography artifact payload." });
    return errors;
  }
  const candidate = value as {
    runoff?: unknown;
    discharge?: unknown;
    riverClass?: unknown;
    flowDir?: unknown;
    sinkMask?: unknown;
    outletMask?: unknown;
    basinId?: unknown;
    routingElevation?: unknown;
    depressionDepth?: unknown;
    terminalType?: unknown;
  };
  validateTypedArray(errors, "hydrography.runoff", candidate.runoff, Float32Array, size);
  validateTypedArray(errors, "hydrography.discharge", candidate.discharge, Float32Array, size);
  if (validateTypedArray(errors, "hydrography.riverClass", candidate.riverClass, Uint8Array, size)) {
    const invalidIndex = findInvalidRiverClassIndex(candidate.riverClass);
    if (invalidIndex >= 0) {
      errors.push({
        message: `Expected hydrography.riverClass values to be non-negative integer river classes (first invalid index ${invalidIndex}).`,
      });
    }
  }
  validateTypedArray(errors, "hydrography.flowDir", candidate.flowDir, Int32Array, size);
  validateTypedArray(errors, "hydrography.sinkMask", candidate.sinkMask, Uint8Array, size);
  validateTypedArray(errors, "hydrography.outletMask", candidate.outletMask, Uint8Array, size);
  if (candidate.basinId != null) {
    validateTypedArray(errors, "hydrography.basinId", candidate.basinId, Int32Array, size);
  }
  if (candidate.routingElevation != null) {
    validateTypedArray(
      errors,
      "hydrography.routingElevation",
      candidate.routingElevation,
      Float32Array,
      size
    );
  }
  if (candidate.depressionDepth != null) {
    validateTypedArray(
      errors,
      "hydrography.depressionDepth",
      candidate.depressionDepth,
      Float32Array,
      size
    );
  }
  if (candidate.terminalType != null) {
    validateTypedArray(errors, "hydrography.terminalType", candidate.terminalType, Uint8Array, size);
  }
  return errors;
}

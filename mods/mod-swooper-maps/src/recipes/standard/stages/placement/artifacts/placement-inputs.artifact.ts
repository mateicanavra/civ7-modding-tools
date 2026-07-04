import { defineArtifact } from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";
import { PlacementInputsV1Schema } from "../placement-inputs.js";

/** Shared placement planning inputs (`artifact:placementInputs`). One artifact per file by repo convention. */

export const Schema = PlacementInputsV1Schema;

export const artifact = defineArtifact({
  name: "placementInputs",
  id: "artifact:placementInputs",
  schema: Schema,
});

type ValidationIssue = { message: string };

function issue(message: string): ValidationIssue {
  return { message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCount(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

/**
 * Validate hook for the shared placement inputs artifact: the seat counts and
 * the wonder-count plan must be coherent non-negative integers because every
 * downstream product step plans against them.
 */

function validatePayload(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("placementInputs artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  const starts = isRecord(value.starts) ? value.starts : null;
  if (!starts) {
    issues.push(issue("placementInputs.starts must be an object."));
  } else {
    if (!isCount(starts.playersLandmass1)) {
      issues.push(
        issue(`starts.playersLandmass1 ${String(starts.playersLandmass1)} must be a count.`)
      );
    }
    if (!isCount(starts.playersLandmass2)) {
      issues.push(
        issue(`starts.playersLandmass2 ${String(starts.playersLandmass2)} must be a count.`)
      );
    }
  }
  const wonders = isRecord(value.wonders) ? value.wonders : null;
  if (!wonders || !isCount(wonders.wondersCount)) {
    issues.push(issue("placementInputs.wonders.wondersCount must be a count."));
  }
  if (!isRecord(value.placementConfig)) {
    issues.push(issue("placementInputs.placementConfig must be an object."));
  }
  return issues;
}

export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}

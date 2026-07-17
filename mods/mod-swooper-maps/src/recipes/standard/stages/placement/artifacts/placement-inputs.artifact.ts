import placement from "@mapgen/domain/placement";
import {
  defineArtifact,
  type Static,
  Type,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Shared placement planning inputs (`artifact:placementInputs`). One artifact per file by repo convention. */

export const PlacementInputsConfigSchema = Type.Object(
  {
    wonders: placement.ops.planWonders.config,
    naturalWonders: placement.ops.planNaturalWonders.config,
  },
  { additionalProperties: false }
);

const PlacementRuntimeStartsSchema = placement.ops.planStarts["input"].properties.baseStarts;

/** Shared planning-input schema for map facts, seat counts, wonder intent, and authored config. */
export const PlacementInputsV1Schema = Type.Object(
  {
    mapInfo: placement.ops.planWonders["input"].properties.mapInfo,
    starts: PlacementRuntimeStartsSchema,
    wonders: placement.ops.planWonders["output"],
    placementConfig: PlacementInputsConfigSchema,
  },
  { additionalProperties: false }
);

type MapInfo = Static<(typeof placement.ops.planWonders)["input"]["properties"]["mapInfo"]>;
export type PlacementInputsV1 = Static<typeof PlacementInputsV1Schema> & { mapInfo: MapInfo };

/** Canonical artifact schema alias consumed by placement's artifact catalog. */
export const Schema = PlacementInputsV1Schema;

/**
 * Registers the single planning input snapshot shared by wonders, starts, and
 * terminal placement: Civ7 map metadata, seat counts, and authored config.
 */
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

/** Validates nonnegative seat/wonder counts and the presence of the shared config envelope. */
export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}

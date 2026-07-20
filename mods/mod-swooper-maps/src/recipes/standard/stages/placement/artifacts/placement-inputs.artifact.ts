import placement from "@mapgen/domain/placement";
import {
  defineArtifact,
  type Static,
  Type,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Authored placement configuration retained with the shared runtime input snapshot. */
export const PlacementInputsConfigSchema = Type.Object(
  {
    wonders: placement.ops.planWonders.config,
    naturalWonders: placement.ops.planNaturalWonders.config,
  },
  { additionalProperties: false }
);

const PlacementRuntimeStartsSchema = placement.ops.planStarts["input"].properties.baseStarts;

/**
 * Shared planning-input schema for map facts, regional slot contributions,
 * wonder intent, and authored placement configuration.
 */
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
/** Admitted runtime placement inputs consumed by the Standard placement product steps. */
export type PlacementInputsV1 = Static<typeof PlacementInputsV1Schema> & { mapInfo: MapInfo };

/** Canonical artifact schema alias consumed by placement's artifact catalog. */
export const Schema = PlacementInputsV1Schema;

/**
 * Registers the single planning input snapshot shared by wonders, starts, and
 * terminal placement. Its `starts` values sum to the map-size seat-capacity
 * bound, not fixed regional demand; `plan-starts` admits alive-major identities
 * and may reapportion them across generated regions.
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
 * Validate hook for the shared placement inputs artifact: regional slot
 * contributions and the wonder-count plan must be coherent non-negative
 * integers because the combined slot count bounds admitted player demand.
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

/** Validates nonnegative slot-contribution/wonder counts and the shared config envelope. */
export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}

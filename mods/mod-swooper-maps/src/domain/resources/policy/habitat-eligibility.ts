import type { OfficialResourceType } from "../lib/corpus/types.js";
import { AQUATIC_SIGNALS } from "../ops/plan-aquatic-resources/signals.js";
import { CULTIVATED_SIGNALS } from "../ops/plan-cultivated-resources/signals.js";
import { GEOLOGICAL_SIGNALS } from "../ops/plan-geological-resources/signals.js";
import { TERRESTRIAL_SIGNALS } from "../ops/plan-terrestrial-resources/signals.js";

/**
 * Per-type habitat signal lookup shared between the family demand planners
 * (which count eligible tiles) and the site-selection wiring (which needs the
 * same eligibility as a per-tile mask). The signal tables themselves live
 * with their family ops; this module aggregates them and provides the mask
 * builder. A contract test asserts the mask cardinality equals the family
 * planners' eligibleTileCount so the two readings cannot drift.
 */

export type ResourceFamilyId = "aquatic" | "cultivated" | "terrestrial" | "geological";

export type ResourceHabitatSignal = {
  readonly family: ResourceFamilyId;
  readonly laneId: string;
  readonly primary: readonly string[];
  readonly suppress: readonly string[];
};

function withFamily(
  family: ResourceFamilyId,
  table: Record<
    string,
    {
      readonly laneId?: string;
      readonly primary: readonly string[];
      readonly suppress: readonly string[];
    }
  >
): ReadonlyArray<readonly [OfficialResourceType, ResourceHabitatSignal]> {
  return Object.entries(table).map(([resourceType, signal]) => [
    resourceType as OfficialResourceType,
    {
      family,
      laneId: signal.laneId ?? family,
      primary: signal.primary,
      suppress: signal.suppress,
    },
  ]);
}

export const RESOURCE_HABITAT_SIGNALS: ReadonlyMap<OfficialResourceType, ResourceHabitatSignal> =
  new Map([
    ...withFamily("aquatic", AQUATIC_SIGNALS),
    ...withFamily("cultivated", CULTIVATED_SIGNALS),
    ...withFamily("terrestrial", TERRESTRIAL_SIGNALS),
    ...withFamily("geological", GEOLOGICAL_SIGNALS),
  ]);

export type HabitatMaskFields = Readonly<Record<string, Uint8Array | undefined>>;

export type HabitatEligibility = {
  readonly mask: Uint8Array;
  readonly eligibleTileCount: number;
  readonly signalFields: readonly string[];
};

/**
 * Builds the per-type habitat eligibility mask: union of present primary lane
 * masks minus present suppression masks — the same predicate the family
 * planners apply when counting eligible tiles.
 */
export function buildHabitatEligibility(
  fields: HabitatMaskFields,
  size: number,
  signal: ResourceHabitatSignal
): HabitatEligibility {
  const primaryMasks: Uint8Array[] = [];
  const signalFields: string[] = [];
  for (const field of signal.primary) {
    const mask = readSizedMask(fields, field, size);
    if (!mask) continue;
    primaryMasks.push(mask);
    signalFields.push(field);
  }
  const suppressMasks: Uint8Array[] = [];
  for (const field of signal.suppress) {
    const mask = readSizedMask(fields, field, size);
    if (mask) suppressMasks.push(mask);
  }

  const mask = new Uint8Array(size);
  if (primaryMasks.length === 0) {
    return { mask, eligibleTileCount: 0, signalFields };
  }
  let eligibleTileCount = 0;
  outer: for (let i = 0; i < size; i++) {
    let primaryHit = false;
    for (const primary of primaryMasks) {
      if (primary[i] !== 0) {
        primaryHit = true;
        break;
      }
    }
    if (!primaryHit) continue;
    for (const suppress of suppressMasks) {
      if (suppress[i] !== 0) continue outer;
    }
    mask[i] = 1;
    eligibleTileCount += 1;
  }
  return { mask, eligibleTileCount, signalFields };
}

function readSizedMask(
  fields: HabitatMaskFields,
  field: string,
  size: number
): Uint8Array | undefined {
  const value = fields[field];
  if (value === undefined) return undefined;
  if (!(value instanceof Uint8Array)) {
    throw new Error(`[resources] Habitat mask ${field} must be a Uint8Array.`);
  }
  if (value.length !== size) {
    throw new Error(
      `[resources] Habitat mask ${field} length ${value.length} does not match grid size ${size}.`
    );
  }
  return value;
}

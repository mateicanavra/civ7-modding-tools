import type { OfficialResourceType } from "@civ7/map-policy";
import type { ResourceFamily } from "../../../../model/atoms/resource-family.schema.js";
import type { AquaticMaskField, AquaticSuppressionField } from "./aquatic-resource-signals.js";
import { AQUATIC_SIGNALS } from "./aquatic-resource-signals.js";
import type {
  CultivatedMaskField,
  CultivatedSuppressionField,
} from "./cultivated-resource-signals.js";
import { CULTIVATED_SIGNALS } from "./cultivated-resource-signals.js";
import type {
  GeologicalMaskField,
  GeologicalSuppressionField,
} from "./geological-resource-signals.js";
import { GEOLOGICAL_SIGNALS } from "./geological-resource-signals.js";
import type {
  TerrestrialMaskField,
  TerrestrialSuppressionField,
} from "./terrestrial-resource-signals.js";
import { TERRESTRIAL_SIGNALS } from "./terrestrial-resource-signals.js";

export type ResourceFamilyId = ResourceFamily;

type ResourceHabitatMaskField =
  | AquaticMaskField
  | AquaticSuppressionField
  | CultivatedMaskField
  | CultivatedSuppressionField
  | GeologicalMaskField
  | GeologicalSuppressionField
  | TerrestrialMaskField
  | TerrestrialSuppressionField;

export type ResourceHabitatSignal = {
  readonly family: ResourceFamilyId;
  readonly laneId: string;
  readonly laneKind: "land" | "water";
  readonly primary: readonly ResourceHabitatMaskField[];
  readonly suppress: readonly ResourceHabitatMaskField[];
};

function withFamily<
  T extends {
    readonly laneId?: string;
    readonly laneKind?: "land" | "water";
    readonly primary: readonly ResourceHabitatMaskField[];
    readonly suppress: readonly ResourceHabitatMaskField[];
  },
>(
  family: ResourceFamilyId,
  table: Record<string, T>
): ReadonlyArray<readonly [OfficialResourceType, ResourceHabitatSignal]> {
  return Object.entries(table).map(([resourceType, signal]) => [
    resourceType as OfficialResourceType,
    {
      family,
      laneId: signal.laneId ?? family,
      laneKind: signal.laneKind ?? (family === "aquatic" ? "water" : "land"),
      primary: signal.primary,
      suppress: signal.suppress,
    },
  ]);
}

/**
 * Canonical per-resource habitat identity and physical predicate used by terminal demand
 * resolution. Keeping one map binds family, lane, medium, and tile eligibility to one authority.
 */
export const RESOURCE_HABITAT_SIGNALS: ReadonlyMap<OfficialResourceType, ResourceHabitatSignal> =
  new Map([
    ...withFamily("aquatic", AQUATIC_SIGNALS),
    ...withFamily("cultivated", CULTIVATED_SIGNALS),
    ...withFamily("terrestrial", TERRESTRIAL_SIGNALS),
    ...withFamily("geological", GEOLOGICAL_SIGNALS),
  ]);

export type HabitatMaskFields = Partial<Record<ResourceHabitatMaskField, Uint8Array>>;

export type HabitatEligibility = {
  readonly mask: Uint8Array;
  readonly eligibleTileCount: number;
  readonly signalFields: readonly string[];
};

/**
 * Builds one resource's habitat eligibility mask as the union of present primary lane masks
 * minus present suppression masks.
 */
export function buildHabitatEligibility(
  fields: HabitatMaskFields,
  size: number,
  signal: ResourceHabitatSignal
): HabitatEligibility {
  const primaryMasks: Uint8Array[] = [];
  const signalFields: ResourceHabitatMaskField[] = [];
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
  field: ResourceHabitatMaskField,
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

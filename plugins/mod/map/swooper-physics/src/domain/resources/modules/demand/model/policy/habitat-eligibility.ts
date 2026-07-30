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

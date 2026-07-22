import { type Static, Type } from "typebox";
import {
  Civ7GameSetupBaseSchema,
  Civ7MapSetupBaseSchema,
  Civ7PlayerSetupBaseSchema,
} from "./setup-parameters.gen.js";

/** Setup parameter identities owned by first-class lifecycle fields rather than option maps. */
export const CIV7_SETUP_LIFECYCLE_PARAMETER_IDS = [
  "Map",
  "MapSize",
  "MapRandomSeed",
  "GameRandomSeed",
] as const;

const Civ7AuthoredGameOptionsBaseSchema = Type.Omit(Civ7GameSetupBaseSchema, ["GameRandomSeed"]);
const Civ7AuthoredMapOptionsBaseSchema = Type.Omit(Civ7MapSetupBaseSchema, [
  "Map",
  "MapSize",
  "MapRandomSeed",
]);

/**
 * Optional game-setup overrides admitted from official parameter identities.
 * Omission means preserve the loaded or live Civ7 value; this schema never applies official defaults.
 */
export const Civ7GameOptionsSchema = Type.Partial(Civ7AuthoredGameOptionsBaseSchema, {
  additionalProperties: false,
  description:
    "Optional Civ7 game-setup overrides. Omitted parameters preserve loaded or live setup state, and live GameSetup metadata remains the final availability authority.",
});

/** Authored game-setup overrides admitted before live contextual validation. */
export type Civ7GameOptions = Static<typeof Civ7GameOptionsSchema>;

/**
 * Optional map-setup overrides that are independent of lifecycle identity.
 * Map script, size, and map seed have dedicated owners; live setup metadata decides which
 * contextual options, such as sea level, are available for the selected map.
 */
export const Civ7MapOptionsSchema = Type.Partial(Civ7AuthoredMapOptionsBaseSchema, {
  additionalProperties: false,
  description:
    "Optional Civ7 map-setup overrides excluding lifecycle-owned map identity, size, and map seed; live setup metadata remains the final availability authority.",
});

/** Authored non-lifecycle map-setup overrides admitted before live contextual validation. */
export type Civ7MapOptions = Static<typeof Civ7MapOptionsSchema>;

/**
 * Optional setup overrides for one initial Civ7 player slot.
 * Player identity selects the slot separately; omission preserves the slot's loaded or live value.
 */
export const Civ7PlayerOptionsSchema = Type.Partial(Civ7PlayerSetupBaseSchema, {
  additionalProperties: false,
  description:
    "Optional Civ7 setup overrides for one initial player slot; omitted parameters preserve loaded or live setup state.",
});

/** Authored setup overrides for one initial Civ7 player slot. */
export type Civ7PlayerOptions = Static<typeof Civ7PlayerOptionsSchema>;

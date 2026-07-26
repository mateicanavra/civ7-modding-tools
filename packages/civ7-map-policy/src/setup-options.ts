import { Refine, type Static, Type } from "typebox";
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

/** Official game-option identities admitted by {@link Civ7GameOptionsSchema}. */
export const CIV7_GAME_OPTION_IDS = Object.freeze(
  Object.keys(Civ7GameOptionsSchema.properties)
) as readonly (keyof Civ7GameOptions & string)[];

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

/** Official map-option identities admitted by {@link Civ7MapOptionsSchema}. */
export const CIV7_MAP_OPTION_IDS = Object.freeze(
  Object.keys(Civ7MapOptionsSchema.properties)
) as readonly (keyof Civ7MapOptions & string)[];

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

/** Official player-option identities admitted by {@link Civ7PlayerOptionsSchema}. */
export const CIV7_PLAYER_OPTION_IDS = Object.freeze(
  Object.keys(Civ7PlayerOptionsSchema.properties)
) as readonly (keyof Civ7PlayerOptions & string)[];

/** One initial Civ7 player slot and its authored setup overrides. */
export const Civ7PlayerSetupSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, maximum: 63 }),
    options: Civ7PlayerOptionsSchema,
  },
  { additionalProperties: false }
);

/** Initial player setup overrides with one entry at most for each Civ7 player slot. */
export const Civ7PlayerSetupsSchema = Refine(
  Type.Array(Civ7PlayerSetupSchema),
  (players) => new Set(players.map(({ playerId }) => playerId)).size === players.length,
  () => "Civ7 player setup entries must use unique playerId values."
);

/** Authored setup overrides for one initial Civ7 player slot. */
export type Civ7PlayerSetup = Static<typeof Civ7PlayerSetupSchema>;

/** Unique initial Civ7 player setup overrides. */
export type Civ7PlayerSetups = Static<typeof Civ7PlayerSetupsSchema>;

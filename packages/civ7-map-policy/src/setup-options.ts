import { Refine, type Static, Type } from "typebox";
import {
  CIV7_GAME_SETUP_LIFECYCLE_PARAMETER_IDS,
  CIV7_GAME_SETUP_PARAMETER_DESCRIPTORS,
  CIV7_MAP_SETUP_LIFECYCLE_PARAMETER_IDS,
  CIV7_MAP_SETUP_PARAMETER_DESCRIPTORS,
  CIV7_PLAYER_SETUP_PARAMETER_DESCRIPTORS,
  Civ7GameSetupBaseSchema,
  Civ7MapSetupBaseSchema,
  Civ7PlayerSetupBaseSchema,
  type Civ7SetupOptionDescriptor,
} from "./setup-parameters.gen.js";

export {
  type Civ7SetupOptionUnavailableReason,
  Civ7SetupOptionUnavailableReasonSchema,
} from "./setup-option-evidence.js";

export {
  CIV7_GAME_RANDOM_SEED_PARAMETER_DESCRIPTOR,
  CIV7_SETUP_LIFECYCLE_PARAMETER_IDS,
  type Civ7GameOptionEvidence,
  Civ7GameOptionEvidenceSchema,
  type Civ7MapOptionEvidence,
  Civ7MapOptionEvidenceSchema,
  type Civ7PlayerOptionEvidence,
  Civ7PlayerOptionEvidenceSchema,
  type Civ7SetupOptionDescriptor,
} from "./setup-parameters.gen.js";

const Civ7AuthoredGameOptionsBaseSchema = Type.Omit(
  Civ7GameSetupBaseSchema,
  CIV7_GAME_SETUP_LIFECYCLE_PARAMETER_IDS
);
const Civ7AuthoredMapOptionsBaseSchema = Type.Omit(
  Civ7MapSetupBaseSchema,
  CIV7_MAP_SETUP_LIFECYCLE_PARAMETER_IDS
);

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

/** Exact generated descriptor union for authored Game options. */
export type Civ7GameOptionDescriptor = Extract<
  (typeof CIV7_GAME_SETUP_PARAMETER_DESCRIPTORS)[number],
  { parameterId: keyof Civ7GameOptions & string }
>;

/** Exact Game option descriptors after lifecycle-owned setup fields are removed. */
export const CIV7_GAME_OPTION_DESCRIPTORS =
  selectAuthoredOptionDescriptors<Civ7GameOptionDescriptor>(
    CIV7_GAME_SETUP_PARAMETER_DESCRIPTORS,
    Object.keys(Civ7GameOptionsSchema.properties)
  );

/** Official game-option identities derived from {@link CIV7_GAME_OPTION_DESCRIPTORS}. */
export const CIV7_GAME_OPTION_IDS = Object.freeze(
  CIV7_GAME_OPTION_DESCRIPTORS.map(({ parameterId }) => parameterId)
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

/** Exact generated descriptor union for authored Map options. */
export type Civ7MapOptionDescriptor = Extract<
  (typeof CIV7_MAP_SETUP_PARAMETER_DESCRIPTORS)[number],
  { parameterId: keyof Civ7MapOptions & string }
>;

/** Exact Map option descriptors after lifecycle-owned setup fields are removed. */
export const CIV7_MAP_OPTION_DESCRIPTORS = selectAuthoredOptionDescriptors<Civ7MapOptionDescriptor>(
  CIV7_MAP_SETUP_PARAMETER_DESCRIPTORS,
  Object.keys(Civ7MapOptionsSchema.properties)
);

/** Official map-option identities derived from {@link CIV7_MAP_OPTION_DESCRIPTORS}. */
export const CIV7_MAP_OPTION_IDS = Object.freeze(
  CIV7_MAP_OPTION_DESCRIPTORS.map(({ parameterId }) => parameterId)
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

/** Exact generated descriptor union for authored Player options. */
export type Civ7PlayerOptionDescriptor = Extract<
  (typeof CIV7_PLAYER_SETUP_PARAMETER_DESCRIPTORS)[number],
  { parameterId: keyof Civ7PlayerOptions & string }
>;

/** Exact Player option descriptors admitted for every captured player slot. */
export const CIV7_PLAYER_OPTION_DESCRIPTORS =
  selectAuthoredOptionDescriptors<Civ7PlayerOptionDescriptor>(
    CIV7_PLAYER_SETUP_PARAMETER_DESCRIPTORS,
    Object.keys(Civ7PlayerOptionsSchema.properties)
  );

/** Official player-option identities admitted by {@link Civ7PlayerOptionsSchema}. */
export const CIV7_PLAYER_OPTION_IDS = Object.freeze(
  CIV7_PLAYER_OPTION_DESCRIPTORS.map(({ parameterId }) => parameterId)
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

function selectAuthoredOptionDescriptors<Descriptor extends Civ7SetupOptionDescriptor>(
  descriptors: readonly Civ7SetupOptionDescriptor[],
  optionIds: readonly string[]
): readonly Descriptor[] {
  const admittedIds = new Set(optionIds);
  const selected = descriptors.filter(({ parameterId }) => admittedIds.has(parameterId));
  if (
    selected.length !== optionIds.length ||
    selected.some(({ parameterId }, index) => parameterId !== optionIds[index])
  ) {
    throw new Error("Civ7 setup option descriptors diverged from their authored schema authority.");
  }
  return Object.freeze(selected) as readonly Descriptor[];
}

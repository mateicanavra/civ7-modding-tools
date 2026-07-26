import { Type } from "typebox";
import { Value } from "typebox/value";

/**
 * Static Civ7 setup-option policy derived from pinned official resources.
 * Live GameSetup metadata remains authoritative for contextual availability and application.
 */
export {
  CIV7_GAME_OPTION_IDS,
  CIV7_MAP_OPTION_IDS,
  CIV7_PLAYER_OPTION_IDS,
  CIV7_SETUP_LIFECYCLE_PARAMETER_IDS,
  type Civ7GameOptions,
  Civ7GameOptionsSchema,
  type Civ7MapOptions,
  Civ7MapOptionsSchema,
  type Civ7PlayerOptions,
  Civ7PlayerOptionsSchema,
  type Civ7PlayerSetup,
  Civ7PlayerSetupSchema,
  type Civ7PlayerSetups,
  Civ7PlayerSetupsSchema,
} from "./setup-options.js";
export {
  CIV7_SETUP_DOMAIN_EVIDENCE,
  CIV7_SETUP_PARAMETER_FACTS,
  CIV7_SETUP_PARAMETER_GROUPS,
  CIV7_SETUP_PARAMETER_SOURCE,
  type Civ7SetupDomainEvidence,
  type Civ7SetupParameterFact,
  type Civ7SetupSourceRow,
} from "./setup-parameters.gen.js";

/** Smallest map or game seed representable by Civ7's signed 32-bit setup fields. */
export const CIV7_SIGNED_INT_SEED_MIN = -0x8000_0000;

/** Largest map or game seed representable by Civ7's signed 32-bit setup fields. */
export const CIV7_SIGNED_INT_SEED_MAX = 0x7fff_ffff;

/** Canonical schema for map and game seeds authored into Civ7 setup state. */
export const Civ7SignedIntSeedSchema = Type.Integer({
  minimum: CIV7_SIGNED_INT_SEED_MIN,
  maximum: CIV7_SIGNED_INT_SEED_MAX,
  description: "A signed 32-bit integer accepted by Civ7's map and game setup seed fields.",
});

/** Closed admission result for Civ7's signed map and game setup seed domain. */
export type Civ7SeedPolicyResult = Readonly<
  | {
      ok: true;
      value: number;
    }
  | {
      ok: false;
      reason: "not-integer" | "out-of-range";
      min: typeof CIV7_SIGNED_INT_SEED_MIN;
      max: typeof CIV7_SIGNED_INT_SEED_MAX;
    }
>;

/**
 * Admits one caller-provided seed into Civ7's signed setup domain without coercion.
 * Callers that accept text must perform that boundary-specific parsing before admission.
 */
export function assessCiv7SignedIntSeed(value: unknown): Civ7SeedPolicyResult {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return {
      ok: false,
      reason: "not-integer",
      min: CIV7_SIGNED_INT_SEED_MIN,
      max: CIV7_SIGNED_INT_SEED_MAX,
    };
  }
  if (!Value.Check(Civ7SignedIntSeedSchema, value)) {
    return {
      ok: false,
      reason: "out-of-range",
      min: CIV7_SIGNED_INT_SEED_MIN,
      max: CIV7_SIGNED_INT_SEED_MAX,
    };
  }
  return { ok: true, value };
}

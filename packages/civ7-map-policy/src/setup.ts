/**
 * Static Civ7 setup-option policy derived from pinned official resources.
 * Live GameSetup metadata remains authoritative for contextual availability and application.
 */
export {
  CIV7_SETUP_LIFECYCLE_PARAMETER_IDS,
  type Civ7GameOptions,
  Civ7GameOptionsSchema,
  type Civ7MapOptions,
  Civ7MapOptionsSchema,
  type Civ7PlayerOptions,
  Civ7PlayerOptionsSchema,
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

import { TObjectValues } from "../types";
import { AGE } from "./AGE";

/** Civilization domain identifiers used by shell database records. */
export const CIVILIZATION_DOMAIN = {
  AntiquityAgeCivilizations: "AntiquityAgeCivilizations",
  ExplorationAgeCivilizations: "ExplorationAgeCivilizations",
  ModernAgeCivilizations: "ModernAgeCivilizations",

  from(age: TObjectValues<typeof AGE>) {
    return {
      [AGE.ANTIQUITY]: this.AntiquityAgeCivilizations,
      [AGE.EXPLORATION]: this.ExplorationAgeCivilizations,
      [AGE.MODERN]: this.ModernAgeCivilizations,
    }[age];
  },
} as const;

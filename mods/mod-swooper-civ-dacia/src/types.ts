import {
  AbilityBuilder,
  CivilizationBuilder,
  CivilizationUnlockBuilder,
  ConstructibleBuilder,
  ImportFileBuilder,
  LeaderUnlockBuilder,
  ModifierBuilder,
  UnitBuilder,
  UnlockBuilder,
} from "@mateicanavra/civ7-sdk";

/**
 * Interface for unit packages that groups a unit with its optional components
 */
export interface UnitPackage {
  unit: UnitBuilder;
  abilities?: AbilityBuilder[];
  modifiers?: ModifierBuilder[];
  imports?: ImportFileBuilder[];
}

/**
 * Interface for civilization packages that groups a civilization with its optional components
 */
export interface CivilizationPackage {
  civilization: CivilizationBuilder;
  modifiers?: ModifierBuilder[];
  imports?: ImportFileBuilder[];
  unlocks?: {
    civilizations?: CivilizationUnlockBuilder[];
    leaders?: LeaderUnlockBuilder[];
  };
}

/**
 * Interface for constructible packages that groups a constructible with its optional components
 */
export interface ConstructiblePackage {
  constructible: ConstructibleBuilder;
  modifiers?: ModifierBuilder[];
  imports?: ImportFileBuilder[];
}

/**
 * Interface for unlock packages that groups an unlock with its abilities and modifiers
 */
export interface UnlockPackage {
  unlock: UnlockBuilder | CivilizationUnlockBuilder | LeaderUnlockBuilder;
  abilities: AbilityBuilder[];
  modifiers: ModifierBuilder[];
}

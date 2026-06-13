// Import all components
import {
  allCivilizations,
  civilizationAbilities,
  civilizationImports,
  civilizationModifiers,
} from "@civilizations";
import {
  allConstructibles,
  constructibleAbilities,
  constructibleImports,
  constructibleModifiers,
} from "@constructibles";
import { mod } from "@mod";
import { sharedAbilities, sharedModifiers, sharedUnlocks } from "@shared";
import { allUnits, unitAbilities, unitImports, unitModifiers } from "@units";

// Add all components to the mod
mod.add([
  // Main entities
  ...allCivilizations,
  ...allUnits,
  ...allConstructibles,
  ...sharedUnlocks,

  // Abilities from all package types
  ...civilizationAbilities,
  ...unitAbilities,
  ...constructibleAbilities,
  ...sharedAbilities,

  // Modifiers from all package types
  ...civilizationModifiers,
  ...unitModifiers,
  ...constructibleModifiers,
  ...sharedModifiers,

  // Imports from all package types
  ...civilizationImports,
  ...unitImports,
  ...constructibleImports,
]);

// Build the mod to the mod directory (monorepo convention)
mod.build("./mod");

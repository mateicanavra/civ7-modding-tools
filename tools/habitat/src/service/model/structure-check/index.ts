export type {
  StructureCheckDiagnosticKind,
  StructureCheckFileSystem,
  StructureCheckScope,
  StructureCheckSpec,
} from "./policy/structure-check.policy.js";
export {
  evaluateStructureCheckEffect,
  parseStructureCheckSpec,
  runStructureRulesEffect,
} from "./policy/structure-check.policy.js";

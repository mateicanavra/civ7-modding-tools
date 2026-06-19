export {
  aggregateWorkspaceDependency,
  aggregateWorkspaceTarget,
  explicitProjectTarget,
  explicitProjectTargetDependency,
  graphRefusalMessage,
  multiDependencyTarget,
  multiDependencyTargetRelationship,
  resolveDependencyDeclaration,
  resolveTargetDependencyDeclaration,
  sameProjectTarget,
  sameProjectTargetDependency,
} from "./dependencies.js";
export {
  addProjectTarget,
  ensureProject,
  readPackageTargetInventory,
} from "./inventory.js";
export {
  findWorkspaceOwningProject,
  projectTargetStates,
  ruleAliasTargetState,
  ruleGraphTargetStates,
  verifyTargetPlan,
  workspaceProjectHasTarget,
  workspaceTargetStates,
} from "./projections.js";
export {
  NxWorkspaceGraphProjectReader,
  readWorkspaceGraph,
  type WorkspaceGraphProjectReader,
} from "./reader.js";
export type {
  GraphRefusalState,
  PackageJsonTargetInventory,
  RuleGraphTargetNames,
  TargetDependencyDeclaration,
  TargetDependencyResolution,
  VerifyTargetPlan,
  WorkspaceGraphReadState,
  WorkspaceGraphSnapshot,
  WorkspaceGraphTargetNameOptions,
  WorkspaceGraphTargetNames,
  WorkspaceProject,
  WorkspaceTargetState,
} from "./schema.js";
export { RuleGraphTargetNamesSchema, VerifyTargetPlanSchema } from "./schema.js";
export {
  classifyTargetNames,
  verifyTargetNames,
  workspaceGraphTargetNames,
} from "./target-names.js";

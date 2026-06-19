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
} from "./workspace-graph/dependencies.js";
export {
  findWorkspaceOwningProject,
  projectTargetStates,
  ruleAliasTargetState,
  verifyTargetPlan,
  workspaceProjectHasTarget,
  workspaceTargetStates,
} from "./workspace-graph/projections.js";
export {
  NxWorkspaceGraphProjectReader,
  readWorkspaceGraph,
  type WorkspaceGraphProjectReader,
} from "./workspace-graph/reader.js";
export type {
  AggregateWorkspaceTargetDeclaration,
  GraphRefusalReason,
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
} from "./workspace-graph/schema.js";
export { RuleGraphTargetNamesSchema, VerifyTargetPlanSchema } from "./workspace-graph/schema.js";
export {
  classifyTargetNames,
  verifyTargetNames,
  workspaceGraphTargetNames,
} from "./workspace-graph/target-names.js";

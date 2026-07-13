import type {
  GritDiagnosticAcquisitionPolicy,
  RuleBaselineFacts,
  RuleCommandExecutionFacts,
  RuleDiagnosticFacts,
  RuleFileLayerFacts,
  RuleGritFacts,
  RuleHookCheckFacts,
  RuleManifestFacts,
  RuleRegistryRecord,
  RuleReportFacts,
  RuleRoutingFacts,
  RuleSelectorFacts,
  RuleStructureFacts,
} from "../dto/registry.schema.js";

type SelectorRecordInput = Pick<RuleRegistryRecord, "id" | "ownerProject" | "runner">;
type ReportRecordInput = Pick<
  RuleRegistryRecord,
  "id" | "runner" | "lane" | "message" | "remediate"
>;
type RoutingRecordInput = Pick<
  RuleRegistryRecord,
  "id" | "runner" | "ownerProject" | "pathCoverage"
>;
type BaselineRecordInput = Pick<RuleRegistryRecord, "id" | "exceptionPath" | "supportFiles">;
type GritRunner = Extract<RuleRegistryRecord["runner"], { name: "grit" }>;
type StructureRunner = Extract<
  RuleRegistryRecord["runner"],
  { name: "habitat"; mode: "structure" }
>;
type ScriptRunner = Extract<RuleRegistryRecord["runner"], { name: "habitat"; mode: "script" }>;
type FileLayerRunner = Extract<
  RuleRegistryRecord["runner"],
  { name: "habitat"; mode: "file-layer" }
>;
type GritRecordInput = RuleRegistryRecord & { runner: GritRunner; scanRoots: string[] };
type StructureRecordInput = RuleRegistryRecord & { runner: StructureRunner };
type ManifestRecordInput = GritRecordInput & { manifestPath: string };
type FileLayerRecordInput = RuleRegistryRecord & { runner: FileLayerRunner };
type CommandRecordInput = RuleRegistryRecord & { runner: ScriptRunner };
type HookCheckRecordInput = GritRecordInput & { hookCheck: true };

export function ruleSelectorFacts(records: readonly SelectorRecordInput[]): RuleSelectorFacts[] {
  return records.map((rule) => ({
    id: rule.id,
    ownerProject: rule.ownerProject,
    runner: cloneRunner(rule.runner),
  }));
}

export function ruleReportFacts(records: readonly ReportRecordInput[]): RuleReportFacts[] {
  return records.map((rule) => ({
    id: rule.id,
    runner: cloneRunner(rule.runner),
    lane: rule.lane,
    message: rule.message,
    remediate: rule.remediate,
  }));
}

export function ruleRoutingFacts(records: readonly RoutingRecordInput[]): RuleRoutingFacts[] {
  return records.map((rule) => ({
    id: rule.id,
    runner: cloneRunner(rule.runner),
    ownerProject: rule.ownerProject,
    pathCoverage: clonePathCoverage(rule.pathCoverage),
  }));
}

export function ruleBaselineFacts(records: readonly BaselineRecordInput[]): RuleBaselineFacts[] {
  return records.map((rule) => ({
    id: rule.id,
    ...(rule.exceptionPath ? { exceptionPath: rule.exceptionPath } : {}),
    ...(rule.supportFiles?.baseline ? { baselinePath: rule.supportFiles.baseline } : {}),
    ...(rule.supportFiles?.ruleIntroductionManifest
      ? { ruleIntroductionManifestPath: rule.supportFiles.ruleIntroductionManifest }
      : {}),
  }));
}

export function ruleDiagnosticFacts(records: readonly RuleRegistryRecord[]): RuleDiagnosticFacts[] {
  return records.filter(isGritRecord).map((rule) => ({
    id: rule.id,
    lane: rule.lane,
    message: rule.message,
    pathCoverage: clonePathCoverage(rule.pathCoverage),
    scanRoots: [...rule.scanRoots],
  }));
}

export function ruleGritFacts(records: readonly RuleRegistryRecord[]): RuleGritFacts[] {
  return records.filter(isGritRecord).map((rule) => ({
    id: rule.id,
    lane: rule.lane,
    message: rule.message,
    runner: projectedGritRunner(rule.runner),
    patternName: rule.runner.patternName,
    diagnosticAcquisition: gritDiagnosticAcquisitionForRule(rule),
    pathCoverage: clonePathCoverage(rule.pathCoverage),
    scanRoots: [...rule.scanRoots],
  }));
}

export function gritDiagnosticAcquisitionForRule(rule: {
  readonly runner: GritRunner;
}): GritDiagnosticAcquisitionPolicy {
  return rule.runner.diagnosticAcquisition ?? { kind: "check" };
}

export function ruleStructureFacts(records: readonly RuleRegistryRecord[]): RuleStructureFacts[] {
  return records.filter(isStructureRecord).map((rule) => ({
    id: rule.id,
    lane: rule.lane,
    message: rule.message,
    pathCoverage: clonePathCoverage(rule.pathCoverage),
    runner: cloneRunner(rule.runner),
  }));
}

export function ruleManifestFacts(records: readonly RuleRegistryRecord[]): RuleManifestFacts[] {
  return records.filter(isManifestRecord).map((rule) => ({
    id: rule.id,
    lane: rule.lane,
    patternName: rule.runner.patternName,
    manifestPath: rule.manifestPath,
  }));
}

export function ruleCommandExecutionFacts(
  records: readonly RuleRegistryRecord[]
): RuleCommandExecutionFacts[] {
  return records.filter(isCommandRecord).map((rule) => ({
    id: rule.id,
    lane: rule.lane,
    message: rule.message,
    runner: cloneRunner(rule.runner),
  }));
}

export function ruleFileLayerFacts(records: readonly RuleRegistryRecord[]): RuleFileLayerFacts[] {
  return records.filter(isFileLayerRecord).map((rule) => {
    const base = {
      id: rule.id,
      runner: cloneRunner(rule.runner),
      lane: rule.lane,
      message: rule.message,
    };
    if ("generatedZone" in rule) return { ...base, generatedZone: rule.generatedZone };
    if (Array.isArray(rule.forbiddenFileNames)) {
      return { ...base, forbiddenFileNames: [...rule.forbiddenFileNames] };
    }
    return { ...base, hostSurfaceGuard: true as const };
  });
}

export function ruleHookCheckFacts(records: readonly RuleRegistryRecord[]): RuleHookCheckFacts[] {
  return records.filter(isHookCheckRecord).map((rule) => ({
    id: rule.id,
    hookCheck: true as const,
  }));
}

function isGritRecord(rule: RuleRegistryRecord): rule is GritRecordInput {
  return rule.runner.name === "grit" && Array.isArray(rule.scanRoots);
}

function isStructureRecord(rule: RuleRegistryRecord): rule is StructureRecordInput {
  return rule.runner.name === "habitat" && rule.runner.mode === "structure";
}

function isCommandRecord(rule: RuleRegistryRecord): rule is CommandRecordInput {
  return rule.runner.name === "habitat" && rule.runner.mode === "script";
}

function isFileLayerRecord(rule: RuleRegistryRecord): rule is FileLayerRecordInput {
  return rule.runner.name === "habitat" && rule.runner.mode === "file-layer";
}

function isManifestRecord(rule: RuleRegistryRecord): rule is ManifestRecordInput {
  return isGritRecord(rule) && typeof rule.manifestPath === "string";
}

function isHookCheckRecord(rule: RuleRegistryRecord): rule is HookCheckRecordInput {
  return isGritRecord(rule) && rule.hookCheck === true;
}

function cloneRunner<T extends RuleRegistryRecord["runner"]>(runner: T): T {
  return { ...runner } as T;
}

function projectedGritRunner(runner: GritRunner): RuleGritFacts["runner"] {
  const { diagnosticAcquisition: _diagnosticAcquisition, ...projected } = runner;
  return { ...projected, files: { ...projected.files } };
}

function clonePathCoverage<T extends RuleRegistryRecord["pathCoverage"]>(pathCoverage: T): T {
  return pathCoverage.map((coverage) =>
    coverage.kind === "exact-path"
      ? { kind: coverage.kind, patterns: [...coverage.patterns] }
      : { ...coverage }
  ) as T;
}

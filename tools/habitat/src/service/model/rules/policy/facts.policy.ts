import type {
  RuleBaselineFacts,
  RuleCommandExecutionFacts,
  RuleFileLayerFacts,
  RuleGritFacts,
  RuleHookCheckFacts,
  RuleManifestFacts,
  RuleRegistryRecordV1,
  RuleReportFacts,
  RuleRoutingFacts,
  RuleSelectorFacts,
  RuleSourceFacts,
  RuleStructureFacts,
} from "../dto/registry.schema.js";

type SelectorRecordInput = Pick<RuleRegistryRecordV1, "id" | "ownerProject" | "runner">;
type ReportRecordInput = Pick<
  RuleRegistryRecordV1,
  "id" | "runner" | "lane" | "message" | "remediate"
>;
type RoutingRecordInput = Pick<
  RuleRegistryRecordV1,
  "id" | "runner" | "ownerProject" | "pathCoverage"
>;
type BaselineRecordInput = Pick<RuleRegistryRecordV1, "id" | "exceptionPath">;
type GritRunner = Extract<RuleRegistryRecordV1["runner"], { name: "grit" }>;
type StructureRunner = Extract<
  RuleRegistryRecordV1["runner"],
  { name: "habitat"; mode: "structure" }
>;
type ScriptRunner = Extract<RuleRegistryRecordV1["runner"], { name: "habitat"; mode: "script" }>;
type FileLayerRunner = Extract<
  RuleRegistryRecordV1["runner"],
  { name: "habitat"; mode: "file-layer" }
>;
type GritRecordInput = RuleRegistryRecordV1 & { runner: GritRunner; scanRoots: string[] };
type StructureRecordInput = RuleRegistryRecordV1 & { runner: StructureRunner };
type ManifestRecordInput = GritRecordInput & { manifestPath: string };
type FileLayerRecordInput = RuleRegistryRecordV1 & { runner: FileLayerRunner };
type CommandRecordInput = RuleRegistryRecordV1 & { runner: ScriptRunner };
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
    exceptionPath: rule.exceptionPath,
  }));
}

export function ruleSourceFacts(_records: readonly RuleRegistryRecordV1[]): RuleSourceFacts[] {
  return [];
}

export function ruleGritFacts(records: readonly RuleRegistryRecordV1[]): RuleGritFacts[] {
  return records.filter(isGritRecord).map((rule) => ({
    id: rule.id,
    lane: rule.lane,
    message: rule.message,
    runner: cloneRunner(rule.runner),
    patternName: rule.runner.patternName,
    pathCoverage: clonePathCoverage(rule.pathCoverage),
    scanRoots: [...rule.scanRoots],
  }));
}

export function ruleStructureFacts(records: readonly RuleRegistryRecordV1[]): RuleStructureFacts[] {
  return records.filter(isStructureRecord).map((rule) => ({
    id: rule.id,
    lane: rule.lane,
    message: rule.message,
    pathCoverage: clonePathCoverage(rule.pathCoverage),
    runner: cloneRunner(rule.runner),
  }));
}

export function ruleManifestFacts(records: readonly RuleRegistryRecordV1[]): RuleManifestFacts[] {
  return records.filter(isManifestRecord).map((rule) => ({
    id: rule.id,
    lane: rule.lane,
    patternName: rule.runner.patternName,
    manifestPath: rule.manifestPath,
  }));
}

export function ruleCommandExecutionFacts(
  records: readonly RuleRegistryRecordV1[]
): RuleCommandExecutionFacts[] {
  return records.filter(isCommandRecord).map((rule) => ({
    id: rule.id,
    lane: rule.lane,
    message: rule.message,
    runner: cloneRunner(rule.runner),
  }));
}

export function ruleFileLayerFacts(records: readonly RuleRegistryRecordV1[]): RuleFileLayerFacts[] {
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

export function ruleHookCheckFacts(records: readonly RuleRegistryRecordV1[]): RuleHookCheckFacts[] {
  return records.filter(isHookCheckRecord).map((rule) => ({
    id: rule.id,
    hookCheck: true as const,
  }));
}

function isGritRecord(rule: RuleRegistryRecordV1): rule is GritRecordInput {
  return rule.runner.name === "grit" && Array.isArray(rule.scanRoots);
}

function isStructureRecord(rule: RuleRegistryRecordV1): rule is StructureRecordInput {
  return rule.runner.name === "habitat" && rule.runner.mode === "structure";
}

function isCommandRecord(rule: RuleRegistryRecordV1): rule is CommandRecordInput {
  return rule.runner.name === "habitat" && rule.runner.mode === "script";
}

function isFileLayerRecord(rule: RuleRegistryRecordV1): rule is FileLayerRecordInput {
  return rule.runner.name === "habitat" && rule.runner.mode === "file-layer";
}

function isManifestRecord(rule: RuleRegistryRecordV1): rule is ManifestRecordInput {
  return isGritRecord(rule) && typeof rule.manifestPath === "string";
}

function isHookCheckRecord(rule: RuleRegistryRecordV1): rule is HookCheckRecordInput {
  return isGritRecord(rule) && rule.hookCheck === true;
}

function cloneRunner<T extends RuleRegistryRecordV1["runner"]>(runner: T): T {
  return { ...runner } as T;
}

function clonePathCoverage<T extends RuleRegistryRecordV1["pathCoverage"]>(pathCoverage: T): T {
  return pathCoverage.map((coverage) =>
    coverage.kind === "exact-path"
      ? { kind: coverage.kind, patterns: [...coverage.patterns] }
      : { ...coverage }
  ) as T;
}

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
} from "../dto/registry.schema.js";

type SelectorRecordInput = Pick<RuleRegistryRecordV1, "id" | "ownerProject" | "ownerTool">;
type ReportRecordInput = Pick<
  RuleRegistryRecordV1,
  "id" | "ownerTool" | "lane" | "detect" | "message" | "remediate"
>;
type RoutingRecordInput = Pick<
  RuleRegistryRecordV1,
  "id" | "ownerTool" | "ownerProject" | "pathCoverage"
>;
type BaselineRecordInput = Pick<RuleRegistryRecordV1, "id" | "exceptionPath">;
type SourceRecordInput = Extract<RuleRegistryRecordV1, { ownerTool: "source-check" }>;
type GritRecordInput = Extract<RuleRegistryRecordV1, { ownerTool: "grit-check" }>;
type ManifestRecordInput = SourceRecordInput & { manifestPath: string };
type FileLayerRecordInput = Extract<RuleRegistryRecordV1, { ownerTool: "file-layer" }>;
type CommandRecordInput = Extract<
  RuleRegistryRecordV1,
  {
    ownerTool: "command-check" | "format-check" | "habitat" | "nx";
  }
>;
type HookCheckRecordInput = (SourceRecordInput | GritRecordInput) & { hookCheck: true };

export function ruleSelectorFacts(records: readonly SelectorRecordInput[]): RuleSelectorFacts[] {
  return records.map((rule) => ({
    id: rule.id,
    ownerProject: rule.ownerProject,
    ownerTool: rule.ownerTool,
  }));
}

export function ruleReportFacts(records: readonly ReportRecordInput[]): RuleReportFacts[] {
  return records.map((rule) => ({
    id: rule.id,
    ownerTool: rule.ownerTool,
    lane: rule.lane,
    detect: [...rule.detect],
    message: rule.message,
    remediate: rule.remediate,
  }));
}

export function ruleRoutingFacts(records: readonly RoutingRecordInput[]): RuleRoutingFacts[] {
  return records.map((rule) => ({
    id: rule.id,
    ownerTool: rule.ownerTool,
    ownerProject: rule.ownerProject,
    pathCoverage: rule.pathCoverage.map((coverage) =>
      coverage.kind === "exact-path"
        ? { kind: coverage.kind, patterns: [...coverage.patterns] }
        : { ...coverage }
    ),
  }));
}

export function ruleBaselineFacts(records: readonly BaselineRecordInput[]): RuleBaselineFacts[] {
  return records.map((rule) => ({
    id: rule.id,
    exceptionPath: rule.exceptionPath,
  }));
}

export function ruleSourceFacts(records: readonly RuleRegistryRecordV1[]): RuleSourceFacts[] {
  return records
    .filter((rule): rule is SourceRecordInput => rule.ownerTool === "source-check")
    .map((rule) => ({
      id: rule.id,
      lane: rule.lane,
      message: rule.message,
      patternName: rule.patternName,
      pathCoverage: rule.pathCoverage.map((coverage) =>
        coverage.kind === "exact-path"
          ? { kind: coverage.kind, patterns: [...coverage.patterns] }
          : { ...coverage }
      ),
      scanRoots: [...rule.scanRoots],
    }));
}

export function ruleGritFacts(records: readonly RuleRegistryRecordV1[]): RuleGritFacts[] {
  return records
    .filter((rule): rule is GritRecordInput => rule.ownerTool === "grit-check")
    .map((rule) => ({
      id: rule.id,
      lane: rule.lane,
      message: rule.message,
      patternName: rule.patternName,
      pathCoverage: rule.pathCoverage.map((coverage) =>
        coverage.kind === "exact-path"
          ? { kind: coverage.kind, patterns: [...coverage.patterns] }
          : { ...coverage }
      ),
      scanRoots: [...rule.scanRoots],
    }));
}

export function ruleManifestFacts(records: readonly RuleRegistryRecordV1[]): RuleManifestFacts[] {
  return records
    .filter(
      (rule): rule is ManifestRecordInput =>
        rule.ownerTool === "source-check" && typeof rule.manifestPath === "string"
    )
    .map((rule) => ({
      id: rule.id,
      lane: rule.lane,
      patternName: rule.patternName,
      manifestPath: rule.manifestPath,
    }));
}

export function ruleCommandExecutionFacts(
  records: readonly RuleRegistryRecordV1[]
): RuleCommandExecutionFacts[] {
  return records
    .filter((rule): rule is CommandRecordInput => isCommandRule(rule))
    .map((commandRule) => ({
      id: commandRule.id,
      ownerTool: commandRule.ownerTool,
      lane: commandRule.lane,
      detect: [...commandRule.detect],
      message: commandRule.message,
    }));
}

function isCommandRule(rule: RuleRegistryRecordV1): rule is CommandRecordInput {
  return (
    rule.ownerTool === "command-check" ||
    rule.ownerTool === "format-check" ||
    rule.ownerTool === "habitat" ||
    rule.ownerTool === "nx"
  );
}

export function ruleFileLayerFacts(records: readonly RuleRegistryRecordV1[]): RuleFileLayerFacts[] {
  return records
    .filter((rule): rule is FileLayerRecordInput => rule.ownerTool === "file-layer")
    .map((rule) => {
      const base = {
        id: rule.id,
        ownerTool: rule.ownerTool,
        lane: rule.lane,
        message: rule.message,
      };
      if ("generatedZone" in rule) return { ...base, generatedZone: rule.generatedZone };
      if ("forbiddenFileNames" in rule) {
        return { ...base, forbiddenFileNames: [...rule.forbiddenFileNames] };
      }
      return { ...base, hostSurfaceGuard: true as const };
    });
}

export function ruleHookCheckFacts(records: readonly RuleRegistryRecordV1[]): RuleHookCheckFacts[] {
  return records
    .filter(
      (rule): rule is HookCheckRecordInput =>
        rule.ownerTool === "source-check" && rule.hookCheck === true
    )
    .map((rule) => ({
      id: rule.id,
      hookCheck: true as const,
    }));
}

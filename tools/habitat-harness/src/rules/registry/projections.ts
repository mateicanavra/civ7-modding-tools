import type {
  RuleBaselineFacts,
  RuleCommandExecutionFacts,
  RuleFileLayerFacts,
  RuleGritFacts,
  RuleLocalFeedbackFacts,
  RuleRegistryRecordV1,
  RuleReportFacts,
  RuleRoutingFacts,
  RuleSelectorFacts,
} from "./schema.js";

type SelectorProjectionInput = Pick<RuleRegistryRecordV1, "id" | "ownerProject" | "ownerTool">;
type ReportProjectionInput = Pick<
  RuleRegistryRecordV1,
  "id" | "ownerTool" | "lane" | "detect" | "message" | "remediate"
>;
type RoutingProjectionInput = Pick<
  RuleRegistryRecordV1,
  "id" | "ownerTool" | "ownerProject" | "pathCoverage"
>;
type BaselineProjectionInput = Pick<RuleRegistryRecordV1, "id" | "exceptionPath">;
type GritProjectionInput = Extract<RuleRegistryRecordV1, { ownerTool: "grit-check" }>;
type FileLayerProjectionInput = Extract<RuleRegistryRecordV1, { ownerTool: "file-layer" }>;
type CommandProjectionInput = Extract<
  RuleRegistryRecordV1,
  {
    ownerTool: "habitat-native" | "wrapped-script" | "biome" | "nx-boundaries" | "wrapped-test";
  }
>;
type LocalFeedbackProjectionInput = GritProjectionInput & { localFeedback: true };

export function ruleSelectorFacts(
  records: readonly SelectorProjectionInput[]
): RuleSelectorFacts[] {
  return records.map((rule) => ({
    id: rule.id,
    ownerProject: rule.ownerProject,
    ownerTool: rule.ownerTool,
  }));
}

export function ruleReportFacts(records: readonly ReportProjectionInput[]): RuleReportFacts[] {
  return records.map((rule) => ({
    id: rule.id,
    ownerTool: rule.ownerTool,
    lane: rule.lane,
    detect: [...rule.detect],
    message: rule.message,
    remediate: rule.remediate,
  }));
}

export function ruleRoutingFacts(records: readonly RoutingProjectionInput[]): RuleRoutingFacts[] {
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

export function ruleBaselineFacts(
  records: readonly BaselineProjectionInput[]
): RuleBaselineFacts[] {
  return records.map((rule) => ({
    id: rule.id,
    exceptionPath: rule.exceptionPath,
  }));
}

export function ruleGritFacts(records: readonly RuleRegistryRecordV1[]): RuleGritFacts[] {
  return records
    .filter((rule): rule is GritProjectionInput => rule.ownerTool === "grit-check")
    .map((rule) => ({
      id: rule.id,
      lane: rule.lane,
      message: rule.message,
      gritPattern: rule.gritPattern,
      scanRoots: [...rule.scanRoots],
      ...(rule.expandIgnoredTestDirectories ? { expandIgnoredTestDirectories: true as const } : {}),
    }));
}

export function ruleCommandExecutionFacts(
  records: readonly RuleRegistryRecordV1[]
): RuleCommandExecutionFacts[] {
  return records
    .filter((rule): rule is CommandProjectionInput => isCommandRule(rule))
    .map((commandRule) => ({
      id: commandRule.id,
      ownerTool: commandRule.ownerTool,
      lane: commandRule.lane,
      detect: [...commandRule.detect],
      message: commandRule.message,
    }));
}

function isCommandRule(rule: RuleRegistryRecordV1): rule is CommandProjectionInput {
  return (
    rule.ownerTool === "habitat-native" ||
    rule.ownerTool === "wrapped-script" ||
    rule.ownerTool === "biome" ||
    rule.ownerTool === "nx-boundaries" ||
    rule.ownerTool === "wrapped-test"
  );
}

export function ruleFileLayerFacts(records: readonly RuleRegistryRecordV1[]): RuleFileLayerFacts[] {
  return records
    .filter((rule): rule is FileLayerProjectionInput => rule.ownerTool === "file-layer")
    .map((rule) => {
      const base = {
        id: rule.id,
        ownerTool: rule.ownerTool,
        lane: rule.lane,
        message: rule.message,
      };
      return "generatedZone" in rule
        ? { ...base, generatedZone: rule.generatedZone }
        : { ...base, forbiddenFileNames: [...rule.forbiddenFileNames] };
    });
}

export function ruleLocalFeedbackFacts(
  records: readonly RuleRegistryRecordV1[]
): RuleLocalFeedbackFacts[] {
  return records
    .filter(
      (rule): rule is LocalFeedbackProjectionInput =>
        rule.ownerTool === "grit-check" && rule.localFeedback === true
    )
    .map((rule) => ({
      id: rule.id,
      localFeedback: true as const,
    }));
}

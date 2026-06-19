import type {
  RuleGritFacts,
  RuleLocalFeedbackFacts,
  RuleRegistryRecordV1,
  RuleReportFacts,
  RuleSelectorFacts,
} from "./schema.js";

type SelectorProjectionInput = Pick<RuleRegistryRecordV1, "id" | "ownerProject" | "ownerTool">;
type ReportProjectionInput = Pick<
  RuleRegistryRecordV1,
  "id" | "ownerTool" | "lane" | "detect" | "message" | "remediate"
>;
type GritProjectionInput = Extract<RuleRegistryRecordV1, { ownerTool: "grit-check" }>;

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

export function ruleLocalFeedbackFacts(
  records: readonly RuleRegistryRecordV1[]
): RuleLocalFeedbackFacts[] {
  return records.map((rule) => ({
    id: rule.id,
    state:
      rule.ownerTool === "grit-check" && rule.localFeedback?.preCommit === true
        ? ("pre-commit" as const)
        : ("not-eligible" as const),
  }));
}

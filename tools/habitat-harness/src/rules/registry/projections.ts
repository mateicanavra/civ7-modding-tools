import { activeRuleRegistryDocument } from "./load.js";
import type { RuleRegistryRecordV1, RuleReportFacts, RuleSelectorFacts } from "./schema.js";

type SelectorProjectionInput = Pick<RuleRegistryRecordV1, "id" | "ownerProject" | "ownerTool">;
type ReportProjectionInput = Pick<
  RuleRegistryRecordV1,
  "id" | "ownerProject" | "ownerTool" | "lane" | "detect" | "message" | "remediate"
>;
type StagedEligibilityInput = Pick<RuleRegistryRecordV1, "id" | "ownerTool"> & {
  hookScope?: "pre-commit";
};

export function ruleSelectorFacts(
  records: readonly SelectorProjectionInput[] = activeRuleRegistryDocument.rules
): RuleSelectorFacts[] {
  return records.map((rule) => ({
    id: rule.id,
    ownerProject: rule.ownerProject,
    ownerTool: rule.ownerTool,
  }));
}

export function ruleReportFacts(
  records: readonly ReportProjectionInput[] = activeRuleRegistryDocument.rules
): RuleReportFacts[] {
  return records.map((rule) => ({
    id: rule.id,
    ownerProject: rule.ownerProject,
    ownerTool: rule.ownerTool,
    lane: rule.lane,
    detect: [...rule.detect],
    message: rule.message,
    remediate: rule.remediate,
  }));
}

export function stagedEligibleRuleIds(records: readonly StagedEligibilityInput[]): Set<string> {
  return new Set(
    records
      .filter((rule) => rule.ownerTool === "grit-check" && rule.hookScope === "pre-commit")
      .map((rule) => rule.id)
  );
}

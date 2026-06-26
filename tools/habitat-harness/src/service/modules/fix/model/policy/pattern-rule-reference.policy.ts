import type { PatternRuleReferenceInput } from "../dto/pattern-management.schema.js";
import type { PatternRulePackReferenceInput } from "./pattern-validation.policy.js";

export function patternRuleReferenceFromRule(
  rule: PatternRulePackReferenceInput
): PatternRuleReferenceInput {
  return {
    ruleId: rule.id,
    patternName: rule.patternName,
    manifestPath: rule.manifestPath,
    ownerTool: rule.ownerTool,
    lifecycle: rule.lane,
  };
}

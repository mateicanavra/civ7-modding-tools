import type { PatternRuleReferenceInput } from "../dto/pattern-management.schema.js";
import type { PatternRulePackReferenceInput } from "./pattern-validation.policy.js";

export function patternRuleReferenceFromRule(
  rule: PatternRulePackReferenceInput
): PatternRuleReferenceInput {
  return {
    ruleId: rule.id,
    patternName: rule.runner?.name === "grit" ? rule.runner.patternName : undefined,
    manifestPath: rule.manifestPath,
    patternRole: rule.patternRole,
    lifecycle: rule.lane,
  };
}

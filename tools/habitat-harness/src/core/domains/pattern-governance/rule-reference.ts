import type { PatternRuleReferenceInput } from "./schema.js";
import type { PatternRulePackReferenceInput } from "./validation.js";

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

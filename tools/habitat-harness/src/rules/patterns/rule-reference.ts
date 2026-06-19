import type { PatternRulePackReferenceInput } from "./validation.js";
import type { PatternRuleReferenceInput } from "./schema.js";

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

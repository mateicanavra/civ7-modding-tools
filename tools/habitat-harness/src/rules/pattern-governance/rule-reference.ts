import type { PatternAuthorityRulePackReferenceInput } from "./validation.js";
import type { PatternAuthorityRuleReferenceInput } from "./schema.js";

export function patternAuthorityRuleReferenceFromRule(
  rule: PatternAuthorityRulePackReferenceInput
): PatternAuthorityRuleReferenceInput {
  return {
    ruleId: rule.id,
    patternName: rule.gritPattern,
    manifestPath: rule.manifestPath,
    ownerTool: rule.ownerTool,
    lifecycle: rule.lane,
  };
}

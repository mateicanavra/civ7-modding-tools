import { Value } from "typebox/value";
import { activeRuleGritFacts } from "../facts.js";
import type { RuleGritFacts } from "../registry/index.js";
import { applyAdmittedState } from "./admission.js";
import { applyAdmissionProjection } from "./projections.js";
import {
  type ApplyAdmissionProjection,
  ApplyAdmissionProjectionSchema,
  type ApplyTransactionInputProjection,
  ApplyTransactionInputProjectionSchema,
} from "./schema.js";

const BUILT_IN_APPLY_ADMISSIONS = [
  {
    kind: "apply-admission",
    patternId: "deep-import-to-public-surface",
    manifestPath: ".grit/patterns/habitat/apply/deep_import_to_public_surface.md",
    transactionInputRef:
      "pattern-authority:deep-import-to-public-surface:transaction-input",
    transactionInputRuleIds: ["grit-domain-deep-import"],
    dryRunOutput: "compact",
  },
  {
    kind: "apply-admission",
    patternId: "docs-local-checkout-paths",
    manifestPath: ".grit/patterns/habitat/apply/docs_local_checkout_paths_rewrite.md",
    transactionInputRef:
      "pattern-authority:docs-local-checkout-paths:transaction-input",
    transactionInputRuleIds: ["docs-local-checkout-paths"],
    dryRunOutput: "standard",
  },
] as const;

export function defaultApplyAdmissions(): ApplyAdmissionProjection[] {
  return BUILT_IN_APPLY_ADMISSIONS.map((admission) => {
    const projection = applyAdmissionProjection(
      applyAdmittedState(Value.Parse(ApplyAdmissionProjectionSchema, admission))
    );
    if (!projection) throw new Error("internal error: apply admission did not project");
    return projection;
  });
}

export function activeApplyTransactionInputs(): ApplyTransactionInputProjection[] {
  return applyTransactionInputsFromRuleFacts(defaultApplyAdmissions(), activeRuleGritFacts);
}

export function applyTransactionInputsFromRuleFacts(
  admissions: readonly ApplyAdmissionProjection[],
  ruleFacts: readonly RuleGritFacts[]
): ApplyTransactionInputProjection[] {
  const rulesById = new Map(ruleFacts.map((rule) => [rule.id, rule]));
  return admissions.flatMap((admission) => {
    const rules = admission.transactionInputRuleIds.flatMap((ruleId) => {
      const rule = rulesById.get(ruleId);
      return rule ? [rule] : [];
    });
    if (rules.length !== admission.transactionInputRuleIds.length) return [];

    return [
      Value.Parse(ApplyTransactionInputProjectionSchema, {
        kind: "apply-transaction-input",
        patternId: admission.patternId,
        manifestPath: admission.manifestPath,
        transactionInputRef: admission.transactionInputRef,
        dryRunCommands: [
          {
            kind: "grit-dry-run-command",
            commandId: `habitat-fix-${admission.patternId}-dry-run`,
            patternPath: admission.manifestPath,
            roots: sortedUnique(rules.flatMap((rule) => rule.scanRoots)),
            output: admission.dryRunOutput,
          },
        ],
      }),
    ];
  });
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

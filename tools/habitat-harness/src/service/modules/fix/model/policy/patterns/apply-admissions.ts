import { activeRuleSelectorFacts } from "@internal/habitat-harness/service/model/rules/policy/active-facts.policy";
import { Value } from "typebox/value";
import { applyAdmittedState } from "./admission.js";
import {
  type ApplyAdmission,
  ApplyAdmissionSchema,
  type ApplyTransactionInput,
  ApplyTransactionInputSchema,
} from "./schema.js";
import { applyAdmission } from "./views.js";

const BUILT_IN_APPLY_ADMISSIONS = [
  {
    kind: "apply-admission",
    patternId: "deep-import-to-public-surface",
    manifestPath: ".habitat/patterns/apply/deep_import_to_public_surface.md",
    transactionInputRef: "patterns:deep-import-to-public-surface:transaction-input",
    transactionInputRuleIds: ["domain-deep-import"],
    dryRunRoots: ["mods/mod-swooper-maps/src/recipes", "mods/mod-swooper-maps/src/maps"],
    dryRunOutput: "compact",
  },
  {
    kind: "apply-admission",
    patternId: "docs-local-checkout-paths",
    manifestPath: ".habitat/patterns/apply/docs_local_checkout_paths_rewrite.md",
    transactionInputRef: "patterns:docs-local-checkout-paths:transaction-input",
    transactionInputRuleIds: ["docs-local-checkout-paths"],
    dryRunRoots: ["docs"],
    dryRunOutput: "standard",
  },
] as const;

export function defaultApplyAdmissions(): ApplyAdmission[] {
  return BUILT_IN_APPLY_ADMISSIONS.map((admission) => {
    const input = applyAdmission(applyAdmittedState(Value.Parse(ApplyAdmissionSchema, admission)));
    if (!input) throw new Error("internal error: apply admission did not resolve");
    return input;
  });
}

export function activeApplyTransactionInputs(): ApplyTransactionInput[] {
  return applyTransactionInputsFromRuleFacts(defaultApplyAdmissions(), activeRuleSelectorFacts);
}

export function applyTransactionInputsFromRuleFacts(
  admissions: readonly ApplyAdmission[],
  ruleFacts: readonly { id: string }[]
): ApplyTransactionInput[] {
  const rulesById = new Map(ruleFacts.map((rule) => [rule.id, rule]));
  return admissions.flatMap((admission) => {
    const rules = admission.transactionInputRuleIds.flatMap((ruleId) => {
      const rule = rulesById.get(ruleId);
      return rule ? [rule] : [];
    });
    if (rules.length !== admission.transactionInputRuleIds.length) return [];

    return [
      Value.Parse(ApplyTransactionInputSchema, {
        kind: "apply-transaction-input",
        patternId: admission.patternId,
        manifestPath: admission.manifestPath,
        transactionInputRef: admission.transactionInputRef,
        dryRunCommands: [
          {
            kind: "dry-run-command",
            commandId: `habitat-fix-${admission.patternId}-dry-run`,
            patternPath: admission.manifestPath,
            roots: sortedUnique(admission.dryRunRoots),
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

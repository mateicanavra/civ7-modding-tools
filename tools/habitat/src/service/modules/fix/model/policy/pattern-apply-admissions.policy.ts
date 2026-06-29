import { Value } from "typebox/value";
import {
  type ApplyAdmission,
  ApplyAdmissionSchema,
  type ApplyTransactionInput,
  ApplyTransactionInputSchema,
} from "../dto/pattern-management.schema.js";
import { applyAdmittedState } from "./pattern-admission.policy.js";
import { applyAdmission } from "./pattern-view.policy.js";

interface ApplyAdmissionRuleFacts {
  readonly id: string;
  readonly scanRoots: readonly string[];
  readonly runner: {
    readonly name: "grit";
    readonly files: {
      readonly pattern: string;
      readonly applyPattern?: string;
    };
  };
}

const APPLY_ADMISSION_RULES = [
  {
    ruleId: "require_public_domain_surfaces_in_recipes_and_maps",
    patternId: "deep-import-to-public-surface",
    transactionInputRef: "patterns:deep-import-to-public-surface:transaction-input",
    dryRunOutput: "compact",
    patternPath: (rule: ApplyAdmissionRuleFacts) => rule.runner.files.applyPattern,
  },
  {
    ruleId: "ensure_docs_checkout_paths_are_portable",
    patternId: "ensure_docs_checkout_paths_are_portable",
    transactionInputRef: "patterns:ensure_docs_checkout_paths_are_portable:transaction-input",
    dryRunOutput: "standard",
    patternPath: (rule: ApplyAdmissionRuleFacts) => rule.runner.files.pattern,
  },
] as const;

export function defaultApplyAdmissions(
  ruleFacts: readonly ApplyAdmissionRuleFacts[]
): ApplyAdmission[] {
  const rulesById = new Map(ruleFacts.map((rule) => [rule.id, rule]));
  return APPLY_ADMISSION_RULES.flatMap((definition) => {
    const rule = rulesById.get(definition.ruleId);
    const patternPath = rule ? definition.patternPath(rule) : undefined;
    if (!rule || !patternPath) return [];
    const input = applyAdmission(
      applyAdmittedState(
        Value.Parse(ApplyAdmissionSchema, {
          kind: "apply-admission",
          patternId: definition.patternId,
          manifestPath: patternPath,
          transactionInputRef: definition.transactionInputRef,
          transactionInputRuleIds: [definition.ruleId],
          dryRunRoots: sortedUnique(rule.scanRoots),
          dryRunOutput: definition.dryRunOutput,
        })
      )
    );
    if (!input) throw new Error("internal error: apply admission did not resolve");
    return [input];
  });
}

export function admittedApplyTransactionInputs(
  ruleFacts: readonly ApplyAdmissionRuleFacts[]
): ApplyTransactionInput[] {
  return applyTransactionInputsFromRuleFacts(defaultApplyAdmissions(ruleFacts), ruleFacts);
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

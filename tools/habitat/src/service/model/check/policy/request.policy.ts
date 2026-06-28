import type { RuleSelection } from "@habitat/cli/service/model/rules/policy/selection.policy";
import type {
  CheckCommandContext,
  SelectorRequest,
  StructuralCheckRequest,
} from "../dto/check.schema.js";

export interface CheckOptions extends RuleSelection {
  base?: string;
  baselineIntegrity?: boolean;
  command?: CheckCommandContext;
  hookCheck?: boolean;
  repoRoot?: string;
  staged?: boolean;
  stagedPaths?: readonly string[];
}

export interface EmitCheckOptions {
  json?: boolean;
}

export function normalizeSelectorRequest(selection: RuleSelection): SelectorRequest {
  const ruleValues = ruleSelectorValues(selection);
  return {
    ...(selection.owner ? { owner: selection.owner } : {}),
    ...(ruleValues.length === 1 ? { rule: ruleValues[0] } : {}),
    ...(ruleValues.length > 1 ? { rules: ruleValues } : {}),
    ...(selection.runner ? { runner: selection.runner } : {}),
  };
}

export function checkCommandContext(argv: readonly string[] = []): CheckCommandContext {
  return {
    bin: "habitat",
    id: "check",
    argv: [...argv],
    serialized: ["habitat", "check", ...argv].join(" "),
  };
}

export function structuralCheckRequest(options: CheckOptions = {}): StructuralCheckRequest {
  const command = options.command ?? checkCommandContext();
  const selectors = normalizeSelectorRequest(options);
  const base = { base: options.base ?? "main" };
  if (options.staged) {
    return {
      kind: "staged-check",
      selectors,
      staged: {
        ...(options.stagedPaths ? { stagedPaths: [...options.stagedPaths] } : {}),
      },
      base,
      command,
    };
  }
  return {
    kind: "current-tree-check",
    selectors,
    base,
    command,
  };
}

export function baselineAuthoringRequest(
  selection: RuleSelection = {},
  options: { base?: string; command?: CheckCommandContext } = {}
): StructuralCheckRequest {
  return {
    kind: "baseline-authoring",
    selectors: normalizeSelectorRequest(selection),
    base: { base: options.base ?? "main" },
    command: options.command ?? checkCommandContext(),
  };
}

function ruleSelectorValues(selection: RuleSelection): string[] {
  return [...new Set([...(selection.rule ? [selection.rule] : []), ...(selection.rules ?? [])])];
}

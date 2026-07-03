import type { RuleSelection } from "@internal/habitat-harness/service/model/rules/selection/index";
import type { CheckCommandContext, SelectorRequest, StructuralCheckRequest } from "./schema.js";

export interface CheckOptions extends RuleSelection {
  base?: string;
  baselineIntegrity?: boolean;
  command?: CheckCommandContext;
  hookCheck?: boolean;
  staged?: boolean;
  stagedPaths?: readonly string[];
}

export interface EmitCheckOptions {
  json?: boolean;
  output?: string;
}

export function normalizeSelectorRequest(selection: RuleSelection): SelectorRequest {
  return {
    ...(selection.owner ? { owner: selection.owner } : {}),
    ...(selection.rule ? { rule: selection.rule } : {}),
    ...(selection.tool ? { tool: selection.tool } : {}),
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

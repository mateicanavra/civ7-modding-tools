import type { HabitatServiceSharedContext } from "@habitat/cli/service/base";
import { type HabitatModule, service } from "@habitat/cli/service/impl";
import { type CheckOptions, checkCommandContext } from "@habitat/cli/service/model/check/index";
import { createCheckReportEffect } from "@habitat/cli/service/model/check/policy/structural/index";
import {
  describeRuleSelectionFailure,
  type RuleSelection,
} from "@habitat/cli/service/model/rules/policy/selection.policy";
import { expandBaselinesEffect } from "./model/policy/baseline-expansion.policy.js";

export type CheckModuleContext = ReturnType<typeof makeCheckModuleContext>;

export const module: HabitatModule<"check", CheckModuleContext> = service.check.use(
  ({ context, next }) => next({ context: makeCheckModuleContext(context) })
);

function makeCheckModuleContext(
  context: Pick<HabitatServiceSharedContext, "deps" | "structuralCheck">
) {
  const repoRoot = context.deps.platform.repoRoot;
  return {
    checkCommandContext,
    createCheckReport: (options?: CheckOptions) =>
      createCheckReportEffect(checkOptionsWithRepoRoot(options, repoRoot), context.structuralCheck),
    describeRuleSelectionFailure,
    expandBaselines: (selection: RuleSelection = {}, options?: { readonly base?: string }) =>
      expandBaselinesEffect(selection, { base: options?.base, repoRoot }, context.structuralCheck),
    selectorsFromInput,
  };
}

function checkOptionsWithRepoRoot(options: CheckOptions = {}, repoRoot: string): CheckOptions {
  return {
    base: options.base,
    baselineIntegrity: options.baselineIntegrity,
    command: options.command,
    hookCheck: options.hookCheck,
    owner: options.owner,
    repoRoot,
    rule: options.rule,
    rules: options.rules,
    runner: options.runner,
    staged: options.staged,
    stagedPaths: options.stagedPaths,
  };
}

function selectorsFromInput(input: {
  readonly selectors?: {
    readonly owner?: string;
    readonly rule?: string;
    readonly rules?: readonly string[];
    readonly runner?: RuleSelection["runner"];
  };
}): RuleSelection {
  return {
    owner: input.selectors?.owner,
    rule: input.selectors?.rule,
    rules: input.selectors?.rules,
    runner: input.selectors?.runner,
  };
}

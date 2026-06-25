import { type HabitatModule, service } from "@habitat/cli/service/impl";
import {
  type CheckOptions,
  type CheckReport,
  checkCommandContext,
} from "@habitat/cli/service/model/check/index";
import { createCheckReportEffect } from "@habitat/cli/service/model/check/policy/structural/index";
import {
  describeRuleSelectionFailure,
  type RuleSelection,
} from "@habitat/cli/service/model/rules/policy/selection.policy";
import { Effect } from "effect";
import {
  type BaselineExpansionResult,
  expandBaselinesEffect,
} from "./model/policy/baseline-expansion.policy.js";

type CheckModuleEffect<T> = Effect.Effect<T, never, any>;

export interface CheckModuleContext {
  readonly checkCommandContext: typeof checkCommandContext;
  readonly createCheckReport: (options?: CheckOptions) => CheckModuleEffect<CheckReport>;
  readonly describeRuleSelectionFailure: typeof describeRuleSelectionFailure;
  readonly expandBaselines: (
    selection?: RuleSelection,
    options?: { readonly base?: string }
  ) => CheckModuleEffect<BaselineExpansionResult>;
  readonly selectorsFromInput: typeof selectorsFromInput;
}

export const module: HabitatModule<"check", CheckModuleContext> = service.check.use(
  ({ context, next }) =>
    next({
      context: {
        checkCommandContext,
        createCheckReport: (options) =>
          createCheckReportEffect(
            { ...options, repoRoot: context.deps.platform.repoRoot },
            context.structuralCheck
          ),
        describeRuleSelectionFailure,
        expandBaselines: (selection, options) =>
          expandBaselinesEffect(
            selection,
            { ...options, repoRoot: context.deps.platform.repoRoot },
            context.structuralCheck
          ),
        selectorsFromInput,
      } satisfies CheckModuleContext,
    })
);

function selectorsFromInput(input: {
  readonly selectors?: {
    readonly owner?: string;
    readonly rule?: string;
    readonly rules?: readonly string[];
    readonly tool?: string;
  };
}) {
  return {
    ...(input.selectors?.owner ? { owner: input.selectors.owner } : {}),
    ...(input.selectors?.rule ? { rule: input.selectors.rule } : {}),
    ...(input.selectors?.rules ? { rules: input.selectors.rules } : {}),
    ...(input.selectors?.tool ? { tool: input.selectors.tool } : {}),
  };
}

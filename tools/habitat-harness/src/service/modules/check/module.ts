import type { HabitatModule } from "@internal/habitat-harness/service/base";
import type { HabitatServiceContract } from "@internal/habitat-harness/service/contract";
import { service } from "@internal/habitat-harness/service/impl";
import {
  type CheckOptions,
  type CheckReport,
  checkCommandContext,
} from "@internal/habitat-harness/service/model/check/index";
import { createCheckReportEffect } from "@internal/habitat-harness/service/model/check/policy/structural/index"; // TODO: nope, get rid of this shit completely. you can't smuggle core logic into service policy as a standalone effect like this.
import {
  describeRuleSelectionFailure,
  type RuleSelection,
} from "@internal/habitat-harness/service/model/rules/policy/selection.policy";
import { Effect } from "effect";
import type { CheckReportInput } from "./contract.js";	// TODO: also not allowed. module contracts are aggregated and attached at the service level in the service implementer. module should never borrow anything from its contract. this is an import violation. update your patterns
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

export const module: HabitatModule<HabitatServiceContract["check"], CheckModuleContext> =
  service.check.use(({ context, next }) =>
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

function selectorsFromInput(input: Pick<CheckReportInput, "selectors">) {
  return {
    ...(input.selectors?.owner ? { owner: input.selectors.owner } : {}),
    ...(input.selectors?.rule ? { rule: input.selectors.rule } : {}),
    ...(input.selectors?.tool ? { tool: input.selectors.tool } : {}),
  };
}

import type {
  HabitatServiceContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError,
} from "@internal/habitat-harness/service/base";
import type { HabitatServiceContract } from "@internal/habitat-harness/service/contract";
import { service } from "@internal/habitat-harness/service/impl";
import {
  type CheckOptions,
  type CheckReport,
  checkCommandContext,
} from "@internal/habitat-harness/service/model/check/index";
import {
  type BaselineExpansionResult,
  createCheckReportEffect,
  expandBaselinesEffect,
} from "@internal/habitat-harness/service/model/check/policy/structural/index";
import {
  describeRuleSelectionFailure,
  type RuleSelection,
} from "@internal/habitat-harness/service/model/rules/policy/selection.policy";
import { Effect } from "effect";
import type { EffectImplementerInternal } from "effect-orpc";
import type { CheckServiceRunInput } from "./contract.js";

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

type CheckModule = EffectImplementerInternal<
  HabitatServiceContract["check"],
  HabitatServiceContext,
  HabitatServiceContext & CheckModuleContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError
>;

export const module: CheckModule = service.check.use(({ context, next }) =>
  next({
    context: {
      checkCommandContext,
      createCheckReport: (options) =>
        createCheckReport({ ...options, repoRoot: context.deps.platform.repoRoot }),
      describeRuleSelectionFailure,
      expandBaselines: (selection, options) =>
        expandBaselines(selection, { ...options, repoRoot: context.deps.platform.repoRoot }),
      selectorsFromInput,
    } satisfies CheckModuleContext,
  })
);

function createCheckReport(options?: CheckOptions) {
  return createCheckReportEffect(options);
}

function expandBaselines(
  selection: RuleSelection | undefined,
  options: { readonly base?: string; readonly repoRoot: string }
) {
  return expandBaselinesEffect(selection, options);
}

function selectorsFromInput(input: Pick<CheckServiceRunInput, "selectors">) {
  return {
    ...(input.selectors?.owner ? { owner: input.selectors.owner } : {}),
    ...(input.selectors?.rule ? { rule: input.selectors.rule } : {}),
    ...(input.selectors?.tool ? { tool: input.selectors.tool } : {}),
  };
}

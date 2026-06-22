import { service } from "@internal/habitat-harness/service/impl";
import {
  type CheckOptions,
  checkCommandContext,
} from "@internal/habitat-harness/service/model/check/index";
import {
  createCheckReportEffect,
  expandBaselinesEffect,
} from "@internal/habitat-harness/service/model/check/policy/structural/index";
import {
  describeRuleSelectionFailure,
  type RuleSelection,
} from "@internal/habitat-harness/service/model/rules/policy/selection.policy";
import { Effect } from "effect";
import type { CheckServiceRunInput } from "./contract.js";

export interface CheckModuleContext {
  readonly checkCommandContext: typeof checkCommandContext;
  readonly createCheckReport: (options?: CheckOptions) => ReturnType<typeof createCheckReport>;
  readonly describeRuleSelectionFailure: typeof describeRuleSelectionFailure;
  readonly expandBaselines: typeof expandBaselines;
  readonly selectorsFromInput: typeof selectorsFromInput;
}

export const module = service.check.use(({ context, next }) =>
  next({
    context: {
      checkCommandContext,
      createCheckReport: (options) =>
        createCheckReport({ ...options, repoRoot: context.deps.platform.repoRoot }),
      describeRuleSelectionFailure,
      expandBaselines,
      selectorsFromInput,
    } satisfies CheckModuleContext,
  })
);

function createCheckReport(options?: CheckOptions) {
  return createCheckReportEffect(options);
}

function expandBaselines(selection?: RuleSelection, options?: { readonly base?: string }) {
  return expandBaselinesEffect(selection, options);
}

function selectorsFromInput(input: Pick<CheckServiceRunInput, "selectors">) {
  return {
    ...(input.selectors?.owner ? { owner: input.selectors.owner } : {}),
    ...(input.selectors?.rule ? { rule: input.selectors.rule } : {}),
    ...(input.selectors?.tool ? { tool: input.selectors.tool } : {}),
  };
}

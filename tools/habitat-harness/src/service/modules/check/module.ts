import { service } from "@internal/habitat-harness/service/impl";
import { checkCommandContext } from "@internal/habitat-harness/service/model/check/index";
import { describeRuleSelectionFailure } from "@internal/habitat-harness/service/model/rules/policy/selection.policy";
import type { StructuralCheckService } from "@internal/habitat-harness/service/modules/check/model/policy/structural/index";
import type { CheckServiceRunInput } from "./contract.js";

export interface CheckModuleContext {
  readonly checkCommandContext: typeof checkCommandContext;
  readonly describeRuleSelectionFailure: typeof describeRuleSelectionFailure;
  readonly selectorsFromInput: typeof selectorsFromInput;
  readonly structuralCheck: StructuralCheckService;
}

export const module = service.check.use(({ context, next }) =>
  next({
    context: {
      checkCommandContext,
      describeRuleSelectionFailure,
      selectorsFromInput,
      structuralCheck: context.deps.structuralCheck,
    } satisfies CheckModuleContext,
  })
);

function selectorsFromInput(input: Pick<CheckServiceRunInput, "selectors">) {
  // TODO: update pattern -- don't do this.. just us multiple .use()
  return {
    ...(input.selectors?.owner ? { owner: input.selectors.owner } : {}),
    ...(input.selectors?.rule ? { rule: input.selectors.rule } : {}),
    ...(input.selectors?.tool ? { tool: input.selectors.tool } : {}),
  };
}

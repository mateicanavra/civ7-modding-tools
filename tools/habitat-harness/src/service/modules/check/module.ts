import { service } from "@internal/habitat-harness/service/impl";
import {
  checkCommandContext,
  describeRuleSelectionFailure,
  type StructuralCheckService,
} from "@internal/habitat-harness/service/model/check/policy/structural/index";
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
  return {
    ...(input.selectors?.owner ? { owner: input.selectors.owner } : {}),
    ...(input.selectors?.rule ? { rule: input.selectors.rule } : {}),
    ...(input.selectors?.tool ? { tool: input.selectors.tool } : {}),
  };
}

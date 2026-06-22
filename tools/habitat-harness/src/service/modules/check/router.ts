import {
  checkCommandContext,
  describeRuleSelectionFailure,
  StructuralCheck,
} from "@internal/habitat-harness/service/modules/check/structural/index";
import type { CheckServiceRunInput } from "./contract.js";
import { module } from "./module.js";

export const checkRouter = {
  run: module.run.effect(function* ({ input }) {
    const structuralCheck = yield* StructuralCheck;
    return yield* structuralCheck.createReport({
      ...selectorsFromInput(input),
      ...(input.base ? { base: input.base } : {}),
      baselineIntegrity: input.baselineIntegrity ?? false,
      command: input.command ?? checkCommandContext(input.commandArgs ?? []),
      staged: input.staged ?? false,
      ...(input.stagedPaths ? { stagedPaths: input.stagedPaths } : {}),
    });
  }),
  expandBaseline: module.expandBaseline.effect(function* ({ input }) {
    const structuralCheck = yield* StructuralCheck;
    const expansion = yield* structuralCheck.expandBaselines(selectorsFromInput(input), {
      base: input.base ?? "main",
    });
    if (expansion.ok) return { kind: "expanded", messages: expansion.messages };
    return { kind: "refused", message: describeRuleSelectionFailure(expansion) };
  }),
};

export const router = checkRouter;

function selectorsFromInput(input: Pick<CheckServiceRunInput, "selectors">) {
  return {
    ...(input.selectors?.owner ? { owner: input.selectors.owner } : {}),
    ...(input.selectors?.rule ? { rule: input.selectors.rule } : {}),
    ...(input.selectors?.tool ? { tool: input.selectors.tool } : {}),
  };
}

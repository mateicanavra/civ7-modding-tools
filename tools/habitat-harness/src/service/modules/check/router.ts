import {
  checkCommandContext,
  describeRuleSelectionFailure,
  StructuralCheck,
} from "@internal/habitat-harness/service/modules/check/structural/index";
import { Effect } from "effect";
import type { CheckServiceRunInput } from "./contract.js";
import { implementer } from "./module.js";

export const checkRouter = {
  run: implementer.run.effect(({ input }) =>
    Effect.gen(function* () {
      const structuralCheck = yield* StructuralCheck;
      return yield* structuralCheck.createReport({
        ...selectorsFromInput(input),
        ...(input.base ? { base: input.base } : {}),
        baselineIntegrity: input.baselineIntegrity ?? false,
        command: input.command ?? checkCommandContext(input.commandArgs ?? []),
        staged: input.staged ?? false,
        ...(input.stagedPaths ? { stagedPaths: input.stagedPaths } : {}),
      });
    })
  ),
  expandBaseline: implementer.expandBaseline.effect(({ input }) =>
    Effect.gen(function* () {
      const structuralCheck = yield* StructuralCheck;
      const expansion = yield* structuralCheck.expandBaselines(selectorsFromInput(input), {
        base: input.base ?? "main",
      });
      if (expansion.ok) return { kind: "expanded", messages: expansion.messages };
      return { kind: "refused", message: describeRuleSelectionFailure(expansion) };
    })
  ),
};

export const router = checkRouter;

function selectorsFromInput(input: Pick<CheckServiceRunInput, "selectors">) {
  return {
    ...(input.selectors?.owner ? { owner: input.selectors.owner } : {}),
    ...(input.selectors?.rule ? { rule: input.selectors.rule } : {}),
    ...(input.selectors?.tool ? { tool: input.selectors.tool } : {}),
  };
}

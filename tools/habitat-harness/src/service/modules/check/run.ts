import { Effect } from "effect";
import { checkCommandContext } from "../../../lib/check/request.js";
import { describeRuleSelectionFailure } from "../../../lib/rule-selection.js";
import { expandBaselinesEffect } from "./baseline.js";
import type {
  CheckServiceExpandBaselineInput,
  CheckServiceExpandBaselineOutput,
  CheckServiceRunInput,
} from "./contract.js";
import { createCheckReportEffect } from "./report.js";

export function runCheckService(input: CheckServiceRunInput) {
  return createCheckReportEffect({
    ...selectorsFromInput(input),
    ...(input.base ? { base: input.base } : {}),
    baselineIntegrity: input.baselineIntegrity ?? false,
    command: input.command ?? checkCommandContext(input.commandArgs ?? []),
    staged: input.staged ?? false,
    ...(input.stagedPaths ? { stagedPaths: input.stagedPaths } : {}),
  });
}

export function expandCheckBaselinesService(input: CheckServiceExpandBaselineInput) {
  return Effect.gen(function* () {
    const expansion = yield* expandBaselinesEffect(selectorsFromInput(input), {
      base: input.base ?? "main",
    });
    if (expansion.ok) return { kind: "expanded" as const, messages: expansion.messages };
    return { kind: "refused" as const, message: describeRuleSelectionFailure(expansion) };
  });
}

function selectorsFromInput(input: Pick<CheckServiceRunInput, "selectors">) {
  return {
    ...(input.selectors?.owner ? { owner: input.selectors.owner } : {}),
    ...(input.selectors?.rule ? { rule: input.selectors.rule } : {}),
    ...(input.selectors?.tool ? { tool: input.selectors.tool } : {}),
  };
}

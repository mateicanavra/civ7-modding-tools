import { Effect } from "effect";
import {
  checkCommandContext,
  createCheckReport,
  describeRuleSelectionFailure,
  expandBaselines,
} from "../../../lib/check-report.js";
import type {
  CheckServiceExpandBaselineInput,
  CheckServiceExpandBaselineOutput,
  CheckServiceRunInput,
} from "./contract.js";

export function runCheckService(input: CheckServiceRunInput) {
  return Effect.promise(() =>
    createCheckReport({
      ...selectorsFromInput(input),
      ...(input.base ? { base: input.base } : {}),
      baselineIntegrity: input.baselineIntegrity ?? false,
      command: input.command ?? checkCommandContext(input.commandArgs ?? []),
      staged: input.staged ?? false,
      ...(input.stagedPaths ? { stagedPaths: input.stagedPaths } : {}),
    })
  );
}

export function expandCheckBaselinesService(input: CheckServiceExpandBaselineInput) {
  return Effect.promise(async (): Promise<CheckServiceExpandBaselineOutput> => {
    const expansion = await expandBaselines(selectorsFromInput(input), {
      base: input.base ?? "main",
    });
    if (expansion.ok) return { kind: "expanded", messages: expansion.messages };
    return { kind: "refused", message: describeRuleSelectionFailure(expansion) };
  });
}

function selectorsFromInput(input: Pick<CheckServiceRunInput, "selectors">) {
  return {
    ...(input.selectors?.owner ? { owner: input.selectors.owner } : {}),
    ...(input.selectors?.rule ? { rule: input.selectors.rule } : {}),
    ...(input.selectors?.tool ? { tool: input.selectors.tool } : {}),
  };
}

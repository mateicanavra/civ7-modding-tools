import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import { Effect } from "effect";
import type { HabitatConfig } from "../../../config/index.js";
import type { BaselineAuthority } from "../../../domains/baseline-authority/index.js";
import {
  checkCommandContext,
  describeRuleSelectionFailure,
  StructuralCheck,
} from "../../../domains/structural-check/index.js";
import type { CommandRunner } from "../../../providers/command/index.js";
import type { GritProvider, GritProviderRequirements } from "../../../providers/grit/index.js";
import type { HabitatClock } from "../../../resources/index.js";
import type {
  CheckServiceExpandBaselineInput,
  CheckServiceExpandBaselineOutput,
  CheckServiceRunInput,
} from "./contract.js";
import { module as checkModule } from "./module.js";

export const checkRouter = {
  run: checkModule.run.effect(({ input }) => runCheckService(input)),
  expandBaseline: checkModule.expandBaseline.effect(({ input }) =>
    expandCheckBaselinesService(input)
  ),
};

export const router = checkRouter;

export function runCheckService(input: CheckServiceRunInput) {
  return Effect.gen(function* () {
    const structuralCheck = yield* StructuralCheck;
    return yield* structuralCheck.createReport({
      ...selectorsFromInput(input),
      ...(input.base ? { base: input.base } : {}),
      baselineIntegrity: input.baselineIntegrity ?? false,
      command: input.command ?? checkCommandContext(input.commandArgs ?? []),
      staged: input.staged ?? false,
      ...(input.stagedPaths ? { stagedPaths: input.stagedPaths } : {}),
    });
  });
}

export function expandCheckBaselinesService(
  input: CheckServiceExpandBaselineInput
): Effect.Effect<
  CheckServiceExpandBaselineOutput,
  never,
  | BaselineAuthority
  | CommandRunner
  | CommandExecutor
  | GritProvider
  | GritProviderRequirements
  | HabitatConfig
  | HabitatClock
  | StructuralCheck
> {
  return Effect.gen(function* () {
    const structuralCheck = yield* StructuralCheck;
    const expansion = yield* structuralCheck.expandBaselines(selectorsFromInput(input), {
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

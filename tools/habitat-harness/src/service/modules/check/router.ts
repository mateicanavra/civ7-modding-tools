import type { FileSystem } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { BaselineAuthority } from "@internal/habitat-harness/core/domains/baseline-authority/index";
import type { SourceCheck } from "@internal/habitat-harness/core/domains/source-check/index";
import {
  checkCommandContext,
  describeRuleSelectionFailure,
  StructuralCheck,
} from "@internal/habitat-harness/core/domains/structural-check/index";
import type { HabitatConfig } from "@internal/habitat-harness/substrate/config/index";
import type { BiomeProvider } from "@internal/habitat-harness/substrate/providers/biome/index";
import type { CommandRunner } from "@internal/habitat-harness/substrate/providers/command/index";
import type {
  GitProvider,
  GitProviderRequirements,
} from "@internal/habitat-harness/substrate/providers/git/index";
import type {
  GritProvider,
  GritProviderRequirements,
} from "@internal/habitat-harness/substrate/providers/grit/index";
import type { NxProvider } from "@internal/habitat-harness/substrate/providers/nx/index";
import { Effect } from "effect";
import { module } from "./context.js";
import type {
  CheckServiceExpandBaselineInput,
  CheckServiceExpandBaselineOutput,
  CheckServiceRunInput,
} from "./contract.js";

export const checkRouter = {
  run: module.run.effect(({ input }) => runCheckService(input)),
  expandBaseline: module.expandBaseline.effect(({ input }) => expandCheckBaselinesService(input)),
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
  | BiomeProvider
  | CommandRunner
  | NxProvider
  | CommandExecutor
  | SourceCheck
  | HabitatConfig
  | FileSystem.FileSystem
  | GitProvider
  | GitProviderRequirements
  | GritProvider
  | GritProviderRequirements
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

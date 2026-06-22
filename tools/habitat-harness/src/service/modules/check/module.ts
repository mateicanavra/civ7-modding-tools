import type {
  HabitatServiceContext,
  HabitatServiceDeps,
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
  type StructuralExecutionContext,
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
        createCheckReport(
          { ...options, repoRoot: context.deps.platform.repoRoot },
          structuralExecutionContext(context.deps)
        ),
      describeRuleSelectionFailure,
      expandBaselines: (selection, options) =>
        expandBaselines(
          selection,
          { ...options, repoRoot: context.deps.platform.repoRoot },
          structuralExecutionContext(context.deps)
        ),
      selectorsFromInput,
    } satisfies CheckModuleContext,
  })
);

function createCheckReport(options: CheckOptions, context: StructuralExecutionContext) {
  return createCheckReportEffect(options, context);
}

function expandBaselines(
  selection: RuleSelection | undefined,
  options: { readonly base?: string; readonly repoRoot: string },
  context: StructuralExecutionContext
) {
  return expandBaselinesEffect(selection, options, context);
}

function structuralExecutionContext(deps: HabitatServiceDeps): StructuralExecutionContext {
  return {
    baselineFileSystem: {
      isDirectory: deps.platform.isDirectory,
      isFile: deps.platform.isFileEffect,
      makeDirectory: deps.platform.makeDirectory,
      readDirectory: deps.platform.readDirectory,
      readText: deps.platform.readText,
      writeText: deps.platform.writeText,
    },
    biome: deps.biome,
    command: deps.commandRunner,
    git: deps.git,
    grit: {
      runRules: deps.grit.runRules,
    },
    nx: deps.nx,
    repoRoot: deps.platform.repoRoot,
    rules: deps.rules,
    sourceFileSystem: {
      isDirectory: deps.platform.isDirectory,
      isFile: deps.platform.isFileEffect,
      readDirectory: deps.platform.readDirectory,
      readText: deps.platform.readText,
    },
  };
}

function selectorsFromInput(input: Pick<CheckServiceRunInput, "selectors">) {
  return {
    ...(input.selectors?.owner ? { owner: input.selectors.owner } : {}),
    ...(input.selectors?.rule ? { rule: input.selectors.rule } : {}),
    ...(input.selectors?.tool ? { tool: input.selectors.tool } : {}),
  };
}

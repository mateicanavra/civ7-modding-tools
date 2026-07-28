import type { MapContext } from "@mapgen/core/map-context.js";
import {
  compileExecutionPlan,
  computePlanFingerprint,
  type ExecutionPlan,
  type MapGenStep,
  type MapSetup,
  PipelineExecutor,
  type RecipeV2,
  type RunRequest,
  StepRegistry,
} from "@mapgen/engine/index.js";
import type { ReadonlyDeep } from "type-fest";
import { compileRecipeConfig } from "../../compiler/recipe-compile.js";
import { assertExecutionPlanRegistryInternal } from "../../engine/execution-plan.js";
import { isArtifact } from "../artifact/contract.js";
import {
  admitInitialSetupInternal,
  assertInitialSetupDefinitionInternal,
  basePhysicalInitialSetupDefinition,
  type InitialSetupDefinition,
  type InitialSetupInputOf,
  isInitialSetupDefinitionInternal,
  readInitialSetupValueInternal,
} from "../initial-setup/definition.js";
import { bindOperationRuns, type OperationRegistry } from "../operation/bindings.js";
import { isCanonicalDomainOp } from "../operation/create.js";
import { assertStageIds } from "../stage/identity.js";
import type { StageObservation } from "../stage/types.js";
import { isCanonicalStepContractInternal, isCanonicalStepInternal } from "../step/authority.js";
import { assertStepInitialSetupContextInternal } from "../step/context.js";
import { buildDeclaredStepDependencies } from "../step/dependencies.js";
import { analyzeRecipeArtifactDependencies, formatRecipeStepId } from "./artifact-analysis.js";
import type {
  CompiledRecipeConfigOf,
  RecipeAsyncExecutionOptions,
  RecipeDefinition,
  RecipeExecutionOptions,
  RecipeModule,
  RecipePlanEvidence,
  RecipePublicConfigOf,
} from "./types.js";

type AnyStage = StageObservation;
type RecipeArtifactAnalysis = ReturnType<typeof analyzeRecipeArtifactDependencies>;

type StepOccurrence = {
  stageId: string;
  stepId: string;
  step: MapGenStep<unknown>;
};

function snapshotAuthorship<T>(value: T, seen = new WeakMap<object, unknown>()): T {
  if ((typeof value !== "object" || value === null) && typeof value !== "function") return value;
  if (typeof value === "function") return value;
  if (isArtifact(value)) return value;
  if (isCanonicalDomainOp(value)) return value;
  if (isCanonicalStepContractInternal(value)) return value;
  if (isCanonicalStepInternal(value)) return value;
  if (isInitialSetupDefinitionInternal(value)) return value;

  const existing = seen.get(value);
  if (existing !== undefined) return existing as T;

  if (Array.isArray(value)) {
    let lengthDescriptor: PropertyDescriptor | undefined;
    try {
      lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
    } catch {
      throw new TypeError("Recipe authorship array length must be inspectable.");
    }
    if (
      !lengthDescriptor ||
      !("value" in lengthDescriptor) ||
      !Number.isSafeInteger(lengthDescriptor.value) ||
      lengthDescriptor.value < 0 ||
      lengthDescriptor.value > 0xffff_ffff
    ) {
      throw new TypeError(
        "Recipe authorship arrays must own a non-negative uint32 length data property."
      );
    }
    const snapshot: unknown[] = new Array(lengthDescriptor.value);
    seen.set(value, snapshot);
    for (const key of Reflect.ownKeys(value)) {
      if (key === "length") continue;
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !("value" in descriptor)) {
        throw new TypeError("Recipe authorship arrays must contain data properties only.");
      }
      Object.defineProperty(snapshot, key, {
        ...descriptor,
        value: snapshotAuthorship(descriptor.value, seen),
      });
    }
    return Object.freeze(snapshot) as T;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError("Recipe authorship must contain plain data objects and functions only.");
  }

  const snapshot = Object.create(prototype) as Record<PropertyKey, unknown>;
  seen.set(value, snapshot);
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor)) {
      throw new TypeError("Recipe authorship must contain data properties only.");
    }
    Object.defineProperty(snapshot, key, {
      ...descriptor,
      value: snapshotAuthorship(descriptor.value, seen),
    });
  }
  return Object.freeze(snapshot) as T;
}

function assertCanonicalRecipeSteps(recipeId: string, stages: readonly AnyStage[]): void {
  for (const stage of stages) {
    for (const step of stage.steps) {
      if (!isCanonicalStepInternal(step)) {
        throw new Error(
          `[recipe:${recipeId}] stage "${stage.id}" contains noncanonical step "${step.contract.id}"; author steps through createStep`
        );
      }
    }
  }
}

function assertExactInitialSetupAuthorities(
  recipeId: string,
  stages: readonly AnyStage[],
  initialSetup: InitialSetupDefinition
): void {
  for (const stage of stages) {
    for (const step of stage.steps) {
      const declared = step.contract.initialSetup;
      if (declared !== undefined && declared !== initialSetup) {
        throw new Error(
          `[recipe:${recipeId}] step "${stage.id}.${step.contract.id}" declares initial setup authority "${declared.id}", not recipe authority "${initialSetup.id}".`
        );
      }
    }
  }
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rejectMissingCompiledConfig(recipeId: string): never {
  throw new Error(`[recipe:${recipeId}] compiled config required (use recipe.compileConfig(...))`);
}

function requireCompiledStepConfig(
  config: Readonly<Record<string, unknown>>,
  recipeId: string,
  stageId: string,
  stepId: string
): Readonly<Record<string, unknown>> {
  const stageConfig = requireCompiledConfigRecord(
    config[stageId],
    recipeId,
    `missing compiled config for stage "${stageId}" (use recipe.compileConfig(...))`
  );
  return requireCompiledConfigRecord(
    stageConfig[stepId],
    recipeId,
    `missing compiled config for step "${stageId}.${stepId}" (use recipe.compileConfig(...))`
  );
}

function rejectInvalidCompiledConfig(recipeId: string, detail: string): never {
  throw new Error(`[recipe:${recipeId}] ${detail}`);
}

function requireCompiledConfigRecord(
  value: unknown,
  recipeId: string,
  detail: string
): Readonly<Record<string, unknown>> {
  return (isRecord(value) && value) || rejectInvalidCompiledConfig(recipeId, detail);
}

function assertArtifactDependencies(recipeId: string, analysis: RecipeArtifactAnalysis): void {
  const duplicate = analysis.issues.find((issue) => issue.kind === "artifact-provider-duplicate");
  if (duplicate) {
    const [existing, repeated] = duplicate.providers;
    throw new Error(
      `[recipe:${recipeId}] artifact "${duplicate.artifactId}" provided by multiple steps: ${existing.endpoint.fullStepId}, ${repeated.endpoint.fullStepId}`
    );
  }

  const invalid = analysis.issues.find(
    (issue) =>
      issue.kind === "artifact-provider-missing" || issue.kind === "artifact-authority-mismatch"
  );
  if (!invalid) return;
  if (invalid.kind === "artifact-provider-missing") {
    throw new Error(
      `[recipe:${recipeId}] artifact "${invalid.consumer.artifact.id}" required by ${invalid.consumer.endpoint.fullStepId} has no recipe provider`
    );
  }
  throw new Error(
    `[recipe:${recipeId}] artifact "${invalid.consumer.artifact.id}" must use one exact authority identity; provider ${invalid.provider.endpoint.fullStepId}, consumer ${invalid.consumer.endpoint.fullStepId}`
  );
}

function finalizeOccurrences(input: {
  namespace?: string;
  recipeId: string;
  stages: readonly AnyStage[];
  operations: OperationRegistry;
}): StepOccurrence[] {
  const out: StepOccurrence[] = [];

  for (const stage of input.stages) {
    for (const authored of stage.steps) {
      const stepId = authored.contract.id;
      const fullId = formatRecipeStepId({
        namespace: input.namespace,
        recipeId: input.recipeId,
        stageId: stage.id,
        stepId,
      });
      const facets = ((authored.metrics || authored.viz) && {
        metrics: authored.metrics,
        viz: authored.viz,
      }) as MapGenStep<unknown>["facets"] | undefined;

      const boundOps =
        authored.contract.ops && bindOperationRuns(authored.contract.ops, input.operations);

      out.push({
        stageId: stage.id,
        stepId,
        step: {
          id: fullId,
          stageId: stage.id,
          requires: authored.contract.requires,
          provides: authored.contract.provides,
          ...(authored.contract.initialSetup === undefined ? {} : { projectsInitialSetup: true }),
          configSchema: authored.contract.schema,
          normalize: authored.normalize as MapGenStep<unknown>["normalize"] | undefined,
          run: ((context: MapContext, config: unknown) => {
            if (authored.contract.initialSetup !== undefined) {
              assertStepInitialSetupContextInternal(context, authored.contract.initialSetup);
            }
            const dependencies = buildDeclaredStepDependencies(authored, {
              consumerStepId: fullId,
              owner: `recipe:${input.recipeId}`,
              context,
            });
            return (authored.run as any)(context, config, boundOps ?? {}, dependencies);
          }) as MapGenStep<unknown>["run"],
          facets,
        },
      });
    }
  }

  return out;
}

function buildRegistry(occurrences: readonly StepOccurrence[]): StepRegistry {
  const registry = new StepRegistry();
  for (const occ of occurrences) registry.register(occ.step);
  return registry;
}

function toStructuralRecipeV2(
  id: string,
  occurrences: readonly StepOccurrence[]
): ReadonlyDeep<RecipeV2> {
  return Object.freeze({
    schemaVersion: 2,
    id,
    steps: Object.freeze(occurrences.map((occ) => Object.freeze({ id: occ.step.id }))),
  });
}

/**
 * Compiles one authored recipe definition into its config, frozen plan, and execution surface.
 *
 * Caller-owned authorship containers are deeply snapshotted once, so later alias or public
 * structural mutation cannot change future compilation or execution. Values already admitted by
 * canonical authoring constructors retain their exact identity inside that detached structure.
 *
 * A compiled plan retains one admitted setup identity. Direct execution consumes that exact plan;
 * convenience run methods compile once from `context.setup` and delegate without a second pass.
 */
export function createRecipe<
  const TStages extends readonly AnyStage[],
  const TInitialSetup extends InitialSetupDefinition = typeof basePhysicalInitialSetupDefinition,
  const TRecipeId extends string = string,
>(
  input: RecipeDefinition<TStages, TInitialSetup, TRecipeId>
): RecipeModule<
  RecipePublicConfigOf<TStages>,
  CompiledRecipeConfigOf<TStages>,
  TInitialSetup,
  TRecipeId
> {
  const authorship = snapshotAuthorship(input);
  const initialSetup = (authorship.initialSetup ??
    basePhysicalInitialSetupDefinition) as TInitialSetup;
  assertInitialSetupDefinitionInternal(initialSetup);
  assertStageIds(authorship.stages.map((stage) => stage.id));
  assertCanonicalRecipeSteps(authorship.id, authorship.stages);
  assertExactInitialSetupAuthorities(authorship.id, authorship.stages, initialSetup);

  const occurrences = finalizeOccurrences({
    namespace: authorship.namespace,
    recipeId: authorship.id,
    stages: authorship.stages,
    operations: authorship.operations,
  });
  assertArtifactDependencies(
    authorship.id,
    analyzeRecipeArtifactDependencies({
      namespace: authorship.namespace,
      recipeId: authorship.id,
      stages: authorship.stages,
    })
  );
  const registry = buildRegistry(occurrences);
  const recipe = toStructuralRecipeV2(authorship.id, occurrences);

  function requireCompiledConfig(
    config: CompiledRecipeConfigOf<TStages> | null | undefined
  ): Readonly<Record<string, unknown>> {
    const cfg: Readonly<Record<string, unknown>> =
      config || rejectMissingCompiledConfig(authorship.id);
    for (const stage of authorship.stages) {
      for (const step of stage.steps) {
        requireCompiledStepConfig(cfg, authorship.id, stage.id, step.contract.id);
      }
    }
    return cfg;
  }

  function instantiate(config: CompiledRecipeConfigOf<TStages>): RecipeV2 {
    const cfg = requireCompiledConfig(config);
    return {
      ...recipe,
      steps: occurrences.map((occ) => ({
        id: occ.step.id,
        config: requireCompiledStepConfig(cfg, authorship.id, occ.stageId, occ.stepId),
      })),
    };
  }

  function compileAdmittedConfig(
    setup: MapSetup,
    config: RecipePublicConfigOf<TStages>
  ): CompiledRecipeConfigOf<TStages> {
    return compileRecipeConfig({
      setup,
      recipe: { stages: authorship.stages },
      config,
      operations: authorship.operations,
    }) as CompiledRecipeConfigOf<TStages>;
  }

  function admittedRunRequest(
    setup: MapSetup,
    config: CompiledRecipeConfigOf<TStages>
  ): RunRequest {
    return { recipe: instantiate(config), setup };
  }

  function compileConfig(
    setupInput: InitialSetupInputOf<TInitialSetup>,
    config: RecipePublicConfigOf<TStages>
  ): CompiledRecipeConfigOf<TStages> {
    return compileAdmittedConfig(admitInitialSetupInternal(initialSetup, setupInput).setup, config);
  }

  function compile(
    setupInput: InitialSetupInputOf<TInitialSetup>,
    config: RecipePublicConfigOf<TStages>
  ): ExecutionPlan {
    const setup = admitInitialSetupInternal(initialSetup, setupInput).setup;
    const compiled = compileAdmittedConfig(setup, config);
    return compileExecutionPlan(admittedRunRequest(setup, compiled), registry);
  }

  function compileBoundSetup(
    setup: MapSetup,
    config: RecipePublicConfigOf<TStages>
  ): ExecutionPlan {
    const admitted = admitInitialSetupInternal(initialSetup, setup).setup;
    const compiled = compileAdmittedConfig(admitted, config);
    return compileExecutionPlan(admittedRunRequest(admitted, compiled), registry);
  }

  function inspectPlan(plan: ExecutionPlan): RecipePlanEvidence<TInitialSetup, TRecipeId> {
    assertExecutionPlanRegistryInternal(plan, registry);
    return Object.freeze({
      recipeId: authorship.id,
      planFingerprint: computePlanFingerprint(plan),
      initialSetup: Object.freeze({
        definitionId: initialSetup.id,
        value: readInitialSetupValueInternal(plan.setup, initialSetup),
      }),
    });
  }

  function execute(
    context: MapContext,
    plan: ExecutionPlan,
    options: RecipeExecutionOptions = {}
  ): void {
    assertExecutionPlanRegistryInternal(plan, registry);
    const executor = new PipelineExecutor(registry, {
      log: options.log,
      logPrefix: `[recipe:${authorship.id}]`,
    });
    executor.executePlan(context, plan, {
      trace: options.trace ?? null,
      facets: options.facets,
    });
  }

  function run(
    context: MapContext,
    config: RecipePublicConfigOf<TStages>,
    options: RecipeExecutionOptions = {}
  ): void {
    execute(context, compileBoundSetup(context.setup, config), options);
  }

  async function executeAsync(
    context: MapContext,
    plan: ExecutionPlan,
    options: RecipeAsyncExecutionOptions = {}
  ): Promise<void> {
    assertExecutionPlanRegistryInternal(plan, registry);
    const executor = new PipelineExecutor(registry, {
      log: options.log,
      logPrefix: `[recipe:${authorship.id}]`,
    });
    await executor.executePlanAsync(context, plan, {
      trace: options.trace ?? null,
      facets: options.facets,
      abortSignal: options.abortSignal ?? null,
      yieldToEventLoop: options.yieldToEventLoop,
      yieldFn: options.yieldFn ?? null,
    });
  }

  async function runAsync(
    context: MapContext,
    config: RecipePublicConfigOf<TStages>,
    options: RecipeAsyncExecutionOptions = {}
  ): Promise<void> {
    await executeAsync(context, compileBoundSetup(context.setup, config), options);
  }

  return Object.freeze({
    id: authorship.id,
    initialSetup,
    recipe,
    compileConfig,
    compile,
    inspectPlan,
    execute,
    run,
    executeAsync,
    runAsync,
  });
}

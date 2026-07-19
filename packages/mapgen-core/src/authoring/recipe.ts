import type { MapContext } from "@mapgen/core/map-context.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";
import {
  compileExecutionPlan,
  type DependencyTagDefinition,
  type ExecutionPlan,
  type MapGenStep,
  type MapSetup,
  type MapSetupInput,
  PipelineExecutor,
  type RecipeV2,
  type RunRequest,
  StepRegistry,
  TagRegistry,
} from "@mapgen/engine/index.js";
import type { ReadonlyDeep } from "type-fest";
import { compileRecipeConfig } from "../compiler/recipe-compile.js";
import { assertExecutionPlanRegistryInternal } from "../engine/execution-plan.js";
import type { ArtifactContract, ArtifactReadValueOf } from "./artifact/contract.js";
import type { ArtifactModule } from "./artifact/module.js";
import {
  ArtifactMissingError,
  type ProvidedArtifactRuntime,
  type RequiredArtifactRuntime,
} from "./artifact/runtime.js";
import { bindRuntimeOps, type DomainOpRuntimeAny, runtimeOp } from "./bindings.js";
import { assertStageIds } from "./stage.js";
import type {
  CompiledRecipeConfigOf,
  RecipeAsyncExecutionOptions,
  RecipeDefinition,
  RecipeExecutionOptions,
  RecipeModule,
  RecipePublicConfigOf,
  StageContract,
  Step,
  StepDeps,
} from "./types.js";

type AnyStage = StageContract<any, any, any, any, any>;

type StepOccurrence = {
  stageId: string;
  stepId: string;
  step: MapGenStep<unknown>;
};

function snapshotAuthorship<T>(value: T, seen = new WeakMap<object, unknown>()): T {
  if ((typeof value !== "object" || value === null) && typeof value !== "function") return value;
  if (typeof value === "function") return value;

  const existing = seen.get(value);
  if (existing !== undefined) return existing as T;

  if (Array.isArray(value)) {
    const snapshot: unknown[] = new Array(value.length);
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

function assertTagDefinitions(value: unknown): void {
  Array.isArray(value) || rejectMissingTagDefinitions();
}

function rejectMissingTagDefinitions(): never {
  throw new Error("createRecipe requires tagDefinitions (may be an empty array)");
}

function inferTagKind(id: string): DependencyTagDefinition["kind"] {
  if (id.startsWith("artifact:")) return "artifact";
  if (id.startsWith("effect:")) return "effect";
  throw new Error(`Invalid dependency tag "${id}" (expected artifact:/effect:)`);
}

function computeFullStepId(input: {
  namespace?: string;
  recipeId: string;
  stageId: string;
  stepId: string;
}): string {
  const base = [input.namespace, input.recipeId]
    .filter((segment): segment is string => Boolean(segment))
    .join(".");
  return `${base}.${input.stageId}.${input.stepId}`;
}

function createRequiredArtifactRuntime<C extends ArtifactContract>(
  contract: C,
  consumerStepId: string
): RequiredArtifactRuntime<C> {
  return {
    contract,
    read: (context: MapContext) => {
      context.artifacts.has(contract.id) || rejectMissingArtifact(contract, consumerStepId);
      return context.artifacts.get(contract.id) as ArtifactReadValueOf<C>;
    },
  };
}

function rejectMissingArtifact(contract: ArtifactContract, consumerStepId: string): never {
  throw new ArtifactMissingError({
    artifactId: contract.id,
    artifactName: contract.name,
    consumerStepId,
  });
}

function resolveProvidedArtifactRuntime(
  authored: Step<any>,
  contract: ArtifactContract,
  fullStepId: string,
  recipeId: string
): ProvidedArtifactRuntime<any> {
  const runtime = authored.artifacts?.[contract.name as keyof typeof authored.artifacts];
  runtime || rejectMissingProvidedArtifactRuntime(contract, fullStepId, recipeId);
  return runtime as unknown as ProvidedArtifactRuntime<any>;
}

function rejectMissingProvidedArtifactRuntime(
  contract: ArtifactContract,
  fullStepId: string,
  recipeId: string
): never {
  throw new Error(
    `[recipe:${recipeId}] step "${fullStepId}" missing artifact runtime for "${contract.name}"`
  );
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

function buildArtifactDeps(
  authored: Step<any>,
  fullStepId: string,
  recipeId: string
): StepDeps<any>["artifacts"] {
  const artifacts = authored.contract.artifacts;
  if (!artifacts) return {} as StepDeps<any>["artifacts"];

  const out: Record<string, RequiredArtifactRuntime<any> | ProvidedArtifactRuntime<any>> = {};

  const requires: readonly ArtifactContract[] = artifacts.requires ?? [];
  const provides = (artifacts.provides ?? []).map((module: ArtifactModule) => module.artifact);

  for (const contract of requires) {
    out[contract.name] = createRequiredArtifactRuntime(contract, fullStepId);
  }

  for (const contract of provides) {
    out[contract.name] = resolveProvidedArtifactRuntime(authored, contract, fullStepId, recipeId);
  }

  return out as StepDeps<typeof artifacts>["artifacts"];
}

function buildStepDeps(
  authored: Step<any>,
  fullStepId: string,
  recipeId: string
): StepDeps<typeof authored.contract.artifacts> {
  return {
    artifacts: buildArtifactDeps(authored, fullStepId, recipeId),
  } as StepDeps<typeof authored.contract.artifacts>;
}

function collectArtifactTagDefinitions(input: {
  namespace?: string;
  recipeId: string;
  stages: readonly AnyStage[];
}): DependencyTagDefinition[] {
  const defs = new Map<string, DependencyTagDefinition>();
  const providers = new Map<string, string>();

  for (const stage of input.stages) {
    for (const authored of stage.steps) {
      const stepId = authored.contract.id;
      const fullId = computeFullStepId({
        namespace: input.namespace,
        recipeId: input.recipeId,
        stageId: stage.id,
        stepId,
      });

      const hasArtifactDecl = Boolean(authored.contract.artifacts);
      const legacyArtifactTags = authored.contract.provides.filter(
        (tag: string) => tag.startsWith("artifact:") && !hasArtifactDecl
      );
      for (const tag of legacyArtifactTags) {
        const existing = providers.get(tag);
        existing === undefined ||
          rejectDuplicateArtifactProvider(input.recipeId, tag, existing, fullId);
        providers.set(tag, fullId);
      }

      const provides = (authored.contract.artifacts?.provides ?? []).map(
        (module: ArtifactModule) => module.artifact
      );
      for (const contract of provides) {
        const existing = providers.get(contract.id);
        existing === undefined ||
          rejectDuplicateArtifactProvider(input.recipeId, contract.id, existing, fullId);
        const runtime = resolveProvidedArtifactRuntime(authored, contract, fullId, input.recipeId);
        defs.set(contract.id, {
          id: contract.id,
          kind: "artifact",
          satisfies: runtime.satisfies,
        });
        providers.set(contract.id, fullId);
      }
    }
  }

  return Array.from(defs.values());
}

function rejectDuplicateArtifactProvider(
  recipeId: string,
  artifactId: string,
  existingStepId: string,
  duplicateStepId: string
): never {
  throw new Error(
    `[recipe:${recipeId}] artifact "${artifactId}" provided by multiple steps: ${existingStepId}, ${duplicateStepId}`
  );
}

function finalizeOccurrences(input: {
  namespace?: string;
  recipeId: string;
  stages: readonly AnyStage[];
  runtimeOpsById: Readonly<Record<string, DomainOpRuntimeAny>>;
}): StepOccurrence[] {
  const out: StepOccurrence[] = [];

  for (const stage of input.stages) {
    for (const authored of stage.steps) {
      const stepId = authored.contract.id;
      const fullId = computeFullStepId({
        namespace: input.namespace,
        recipeId: input.recipeId,
        stageId: stage.id,
        stepId,
      });
      const deps = buildStepDeps(authored, fullId, input.recipeId);
      const facets = (authored.metrics || authored.viz) && {
        metrics: authored.metrics,
        viz: authored.viz,
      };

      const boundOps =
        authored.contract.ops &&
        bindRuntimeOps(authored.contract.ops as any, input.runtimeOpsById as any);

      out.push({
        stageId: stage.id,
        stepId,
        step: {
          id: fullId,
          stageId: stage.id,
          requires: authored.contract.requires,
          provides: authored.contract.provides,
          configSchema: authored.contract.schema,
          normalize: authored.normalize as MapGenStep<unknown>["normalize"] | undefined,
          run: ((context: MapContext, config: unknown) =>
            (authored.run as any)(
              context,
              config,
              boundOps ?? {},
              deps
            )) as MapGenStep<unknown>["run"],
          facets,
        },
      });
    }
  }

  return out;
}

function collectTagDefinitions(
  occurrences: readonly StepOccurrence[],
  explicit: readonly DependencyTagDefinition[],
  artifactTagDefinitions: readonly DependencyTagDefinition[]
): DependencyTagDefinition[] {
  const defs = new Map<string, DependencyTagDefinition>();

  const tagIds = new Set<string>();
  for (const occ of occurrences) {
    for (const tag of occ.step.requires) tagIds.add(tag);
    for (const tag of occ.step.provides) tagIds.add(tag);
  }
  for (const id of tagIds) {
    defs.set(id, { id, kind: inferTagKind(id) });
  }

  for (const def of artifactTagDefinitions) {
    defs.set(def.id, def);
  }

  for (const def of explicit) {
    defs.set(def.id, def);
  }

  return Array.from(defs.values());
}

function buildRegistry(
  occurrences: readonly StepOccurrence[],
  tagDefinitions: readonly DependencyTagDefinition[],
  artifactTagDefinitions: readonly DependencyTagDefinition[]
): StepRegistry {
  const tags = new TagRegistry();
  tags.registerTags(collectTagDefinitions(occurrences, tagDefinitions, artifactTagDefinitions));

  const registry = new StepRegistry({ tags });
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
 * Authorship is deeply snapshotted once, so later mutation of caller aliases or the public
 * structural recipe cannot change future compilation or execution.
 *
 * A compiled plan retains one admitted setup identity. Direct execution consumes that exact plan;
 * convenience run methods compile once from `context.setup` and delegate without a second pass.
 */
export function createRecipe<const TStages extends readonly AnyStage[]>(
  input: RecipeDefinition<TStages>
): RecipeModule<RecipePublicConfigOf<TStages>, CompiledRecipeConfigOf<TStages>> {
  const authorship = snapshotAuthorship(input);
  assertTagDefinitions(authorship.tagDefinitions);
  assertStageIds(authorship.stages.map((stage) => stage.id));

  const runtimeOpsById =
    authorship.runtimeOpsById ??
    (Object.fromEntries(
      Object.entries(authorship.compileOpsById).map(([id, op]) => [id, runtimeOp(op)])
    ) as Readonly<Record<string, DomainOpRuntimeAny>>);

  const occurrences = finalizeOccurrences({
    namespace: authorship.namespace,
    recipeId: authorship.id,
    stages: authorship.stages,
    runtimeOpsById,
  });
  const artifactTagDefinitions = collectArtifactTagDefinitions({
    namespace: authorship.namespace,
    recipeId: authorship.id,
    stages: authorship.stages,
  });
  const registry = buildRegistry(occurrences, authorship.tagDefinitions, artifactTagDefinitions);
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
      compileOpsById: authorship.compileOpsById,
    }) as CompiledRecipeConfigOf<TStages>;
  }

  function admittedRunRequest(
    setup: MapSetup,
    config: CompiledRecipeConfigOf<TStages>
  ): RunRequest {
    return { recipe: instantiate(config), setup };
  }

  function compileConfig(
    setupInput: MapSetup | MapSetupInput,
    config: RecipePublicConfigOf<TStages>
  ): CompiledRecipeConfigOf<TStages> {
    return compileAdmittedConfig(admitMapSetup(setupInput), config);
  }

  function compile(
    setupInput: MapSetup | MapSetupInput,
    config: RecipePublicConfigOf<TStages>
  ): ExecutionPlan {
    const setup = admitMapSetup(setupInput);
    const compiled = compileAdmittedConfig(setup, config);
    return compileExecutionPlan(admittedRunRequest(setup, compiled), registry);
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
    execute(context, compile(context.setup, config), options);
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
    await executeAsync(context, compile(context.setup, config), options);
  }

  return Object.freeze({
    id: authorship.id,
    recipe,
    compileConfig,
    compile,
    execute,
    run,
    executeAsync,
    runAsync,
  });
}

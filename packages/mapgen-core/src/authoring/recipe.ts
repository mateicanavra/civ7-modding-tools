import type { MapContext } from "@mapgen/core/map-context.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";
import {
  compileExecutionPlan,
  type DependencyTagDefinition,
  type DependencyTagKind,
  DuplicateDependencyTagError,
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
import {
  type InternalDependencyTagDefinition,
  registerDependencyTagsInternal,
} from "../engine/tags.js";
import { isCanonicalArtifact } from "./artifact/authority.js";
import type { ArtifactModule } from "./artifact/module.js";
import { bindRuntimeOps, type DomainOpRuntimeAny, runtimeOp } from "./bindings.js";
import { isCanonicalDomainOp } from "./op/create.js";
import { assertStageIds } from "./stage.js";
import {
  copyCanonicalStepAuthorityInternal,
  isCanonicalStepContractInternal,
  isCanonicalStepInternal,
} from "./step/authority.js";
import {
  buildDeclaredStepDependencies,
  resolveProvidedArtifactRuntimeInternal,
} from "./step/dependencies.js";
import { copyStepProviderRuntimesInternal } from "./step/provider-runtimes.js";
import type {
  CompiledRecipeConfigOf,
  RecipeAsyncExecutionOptions,
  RecipeDefinition,
  RecipeExecutionOptions,
  RecipeModule,
  RecipePublicConfigOf,
  StageObservation,
} from "./types.js";

type AnyStage = StageObservation;

type StepOccurrence = {
  stageId: string;
  stepId: string;
  step: MapGenStep<unknown>;
};

function snapshotAuthorship<T>(value: T, seen = new WeakMap<object, unknown>()): T {
  if ((typeof value !== "object" || value === null) && typeof value !== "function") return value;
  if (typeof value === "function") return value;
  if (isCanonicalArtifact(value)) return value;
  if (isCanonicalDomainOp(value)) return value;
  if (isCanonicalStepContractInternal(value)) return value;

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
  copyStepProviderRuntimesInternal(value, snapshot);
  copyCanonicalStepAuthorityInternal(value, snapshot);
  return Object.freeze(snapshot) as T;
}

function assertTagDefinitions(value: unknown): void {
  Array.isArray(value) || rejectMissingTagDefinitions();
}

function rejectMissingTagDefinitions(): never {
  throw new Error("createRecipe requires tagDefinitions (may be an empty array)");
}

function inferTagKind(id: string): DependencyTagKind {
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

function artifactTagIds(tags: readonly string[]): readonly string[] {
  return tags.filter((tag) => tag.startsWith("artifact:"));
}

function assertExactArtifactEdges(
  recipeId: string,
  stepId: string,
  authored: AnyStage["steps"][number]
): void {
  const required = authored.contract.artifacts?.requires?.map((contract) => contract.id) ?? [];
  const provided = authored.contract.artifacts?.provides?.map((module) => module.artifact.id) ?? [];
  const declaredRequired = artifactTagIds(authored.contract.requires);
  const declaredProvided = artifactTagIds(authored.contract.provides);
  if (
    declaredRequired.length !== required.length ||
    declaredRequired.some((id, index) => id !== required[index])
  ) {
    throw new Error(
      `[recipe:${recipeId}] step "${stepId}" artifact requirements must derive exactly from contract.artifacts.requires`
    );
  }
  if (
    declaredProvided.length !== provided.length ||
    declaredProvided.some((id, index) => id !== provided[index])
  ) {
    throw new Error(
      `[recipe:${recipeId}] step "${stepId}" artifact provisions must derive exactly from contract.artifacts.provides`
    );
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

function collectArtifactTagDefinitions(input: {
  namespace?: string;
  recipeId: string;
  stages: readonly AnyStage[];
}): InternalDependencyTagDefinition[] {
  const defs = new Map<string, InternalDependencyTagDefinition>();
  const providers = new Map<
    string,
    Readonly<{ contract: ArtifactModule["artifact"]; stepId: string }>
  >();

  for (const stage of input.stages) {
    for (const authored of stage.steps) {
      const stepId = authored.contract.id;
      const fullId = computeFullStepId({
        namespace: input.namespace,
        recipeId: input.recipeId,
        stageId: stage.id,
        stepId,
      });
      assertExactArtifactEdges(input.recipeId, fullId, authored);

      const provides = authored.contract.artifacts?.provides ?? [];
      for (const module of provides as readonly ArtifactModule[]) {
        const contract = module.artifact;
        const existing = providers.get(contract.id);
        existing === undefined ||
          rejectDuplicateArtifactProvider(input.recipeId, contract.id, existing.stepId, fullId);
        resolveProvidedArtifactRuntimeInternal(
          authored,
          contract,
          fullId,
          `recipe:${input.recipeId}`
        );
        defs.set(contract.id, {
          id: contract.id,
          kind: "artifact",
          satisfies: (evidence) => evidence.observeArtifact(module).found,
        });
        providers.set(contract.id, { contract, stepId: fullId });
      }
    }
  }

  for (const stage of input.stages) {
    for (const authored of stage.steps) {
      const required = authored.contract.artifacts?.requires ?? [];
      for (const contract of required) {
        const provider = providers.get(contract.id);
        if (!provider) {
          rejectMissingArtifactProvider(
            input.recipeId,
            contract.id,
            computeFullStepId({
              namespace: input.namespace,
              recipeId: input.recipeId,
              stageId: stage.id,
              stepId: authored.contract.id,
            })
          );
        }
        if (provider.contract !== contract) {
          rejectMismatchedArtifactContract(
            input.recipeId,
            contract.id,
            provider.stepId,
            computeFullStepId({
              namespace: input.namespace,
              recipeId: input.recipeId,
              stageId: stage.id,
              stepId: authored.contract.id,
            })
          );
        }
      }
    }
  }

  return Array.from(defs.values());
}

function rejectMissingArtifactProvider(
  recipeId: string,
  artifactId: string,
  consumerStepId: string
): never {
  throw new Error(
    `[recipe:${recipeId}] artifact "${artifactId}" required by ${consumerStepId} has no recipe provider`
  );
}

function rejectMismatchedArtifactContract(
  recipeId: string,
  artifactId: string,
  providerStepId: string,
  consumerStepId: string
): never {
  throw new Error(
    `[recipe:${recipeId}] artifact "${artifactId}" must use one exact contract identity; provider ${providerStepId}, consumer ${consumerStepId}`
  );
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
      const facets = ((authored.metrics || authored.viz) && {
        metrics: authored.metrics,
        viz: authored.viz,
      }) as MapGenStep<unknown>["facets"] | undefined;

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
          run: ((context: MapContext, config: unknown) => {
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

function collectTagDefinitions(
  occurrences: readonly StepOccurrence[],
  explicit: readonly DependencyTagDefinition[],
  artifactTagDefinitions: readonly InternalDependencyTagDefinition[]
): InternalDependencyTagDefinition[] {
  const defs = new Map<string, InternalDependencyTagDefinition>();
  const generatedArtifactTagIds = new Set(
    artifactTagDefinitions.map((definition) => definition.id)
  );
  const explicitTagIds = new Set<string>();

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
    if (generatedArtifactTagIds.has(def.id) || explicitTagIds.has(def.id)) {
      throw new DuplicateDependencyTagError(def.id);
    }
    if (
      (def as InternalDependencyTagDefinition).kind === "artifact" ||
      def.id.startsWith("artifact:")
    ) {
      throw new Error(
        `Explicit artifact dependency tag "${def.id}" is not admitted; declare the canonical contract or module through step artifacts.*`
      );
    }
    explicitTagIds.add(def.id);
    defs.set(def.id, def);
  }

  return Array.from(defs.values());
}

function buildRegistry(
  occurrences: readonly StepOccurrence[],
  tagDefinitions: readonly DependencyTagDefinition[],
  artifactTagDefinitions: readonly InternalDependencyTagDefinition[]
): StepRegistry {
  const tags = new TagRegistry();
  registerDependencyTagsInternal(
    tags,
    collectTagDefinitions(occurrences, tagDefinitions, artifactTagDefinitions)
  );

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
  assertCanonicalRecipeSteps(authorship.id, authorship.stages);

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

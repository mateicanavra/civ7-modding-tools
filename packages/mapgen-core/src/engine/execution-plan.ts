import {
  admitMapSetup,
  type MapSetup,
  type MapSetupInput,
  MapSetupSchema,
} from "@mapgen/core/map-setup.js";
import type { StepRegistry } from "@mapgen/engine/StepRegistry.js";
import { TagRegistry } from "@mapgen/engine/tags.js";
import type { GenerationPhase, MapGenStep } from "@mapgen/engine/types.js";
import { sha256Hex, stableStringify } from "@mapgen/trace/index.js";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import { createPortableJsonSnapshot } from "../compiler/portable-json-snapshot.js";

const UnknownRecord = Type.Record(Type.String(), Type.Unknown(), { default: {} });
const EMPTY_STEP_CONFIG: Readonly<Record<string, never>> = Object.freeze({});
declare const executionPlanBrand: unique symbol;
type ExecutionPlanBinding = Readonly<{
  registry: object;
  nodes: readonly Readonly<{
    step: MapGenStep<unknown, unknown>;
    config: Readonly<Record<string, unknown>>;
  }>[];
  tagRegistry: TagRegistry;
  fingerprint: string;
}>;
const executionPlanBindings = new WeakMap<object, ExecutionPlanBinding>();

interface PlanFingerprintInput {
  version: number;
  recipeSchemaVersion: number;
  recipeId: string | null;
  setup: MapSetup;
  nodes: Array<{
    stepId: string;
    phase: string;
    requires: readonly string[];
    provides: readonly string[];
    config: unknown;
  }>;
}

function hashExecutionPlan(plan: ExecutionPlan): string {
  const fingerprintInput: PlanFingerprintInput = {
    version: 2,
    recipeSchemaVersion: plan.recipeSchemaVersion,
    recipeId: plan.recipeId ?? null,
    setup: plan.setup,
    nodes: plan.nodes.map((node) => ({
      stepId: node.stepId,
      phase: node.phase,
      requires: node.requires,
      provides: node.provides,
      config: node.config,
    })),
  };

  return sha256Hex(stableStringify(fingerprintInput));
}

function snapshotDependencyTags(
  nodes: readonly Readonly<{ step: MapGenStep<unknown, unknown> }>[],
  source: TagRegistry
): TagRegistry {
  const selected = new Set<string>();
  for (const { step } of nodes) {
    for (const tag of step.requires) selected.add(tag);
    for (const tag of step.provides) selected.add(tag);
  }
  return source.snapshot([...selected]);
}

function invalidRunRequest(path: string, message: string): ExecutionPlanCompileError {
  return new ExecutionPlanCompileError([{ code: "runRequest.invalid", path, message }]);
}

function readRunRequestRoot(runRequest: RunRequest): Readonly<{
  recipe: RunRequest["recipe"];
  setup: RunRequest["setup"];
}> {
  let descriptors: PropertyDescriptorMap;
  try {
    descriptors = Object.getOwnPropertyDescriptors(runRequest);
  } catch {
    throw invalidRunRequest("/", "Run request properties could not be read safely");
  }

  for (const key of Reflect.ownKeys(descriptors)) {
    if (key !== "recipe" && key !== "setup") {
      throw invalidRunRequest(
        typeof key === "string" ? `/${key}` : "/",
        "Unknown run request property"
      );
    }
  }

  const recipe = descriptors.recipe;
  const setup = descriptors.setup;
  if (!recipe || !("value" in recipe) || !recipe.enumerable) {
    throw invalidRunRequest("/recipe", "Expected an own enumerable data property");
  }
  if (!setup || !("value" in setup) || !setup.enumerable) {
    throw invalidRunRequest("/setup", "Expected an own enumerable data property");
  }
  return Object.freeze({
    recipe: recipe.value as RunRequest["recipe"],
    setup: setup.value as RunRequest["setup"],
  });
}

/**
 * Recipe schema version 2 (locked):
 * - step ids are unique within the recipe
 * - no instance identity layer; a "step" is a single execution node
 */
export const RecipeStepV2Schema = Type.Object(
  {
    id: Type.String(),
    enabled: Type.Optional(Type.Boolean()),
    config: Type.Optional(UnknownRecord),
  },
  { additionalProperties: false }
);

export type RecipeStepV2 = Static<typeof RecipeStepV2Schema>;

export const RecipeV2Schema = Type.Object(
  {
    schemaVersion: Type.Literal(2),
    id: Type.Optional(Type.String()),
    steps: Type.Array(RecipeStepV2Schema),
  },
  { additionalProperties: false }
);

export type RecipeV2 = Static<typeof RecipeV2Schema>;

export const RunRequestSchema = Type.Object(
  {
    recipe: RecipeV2Schema,
    setup: MapSetupSchema,
  },
  { additionalProperties: false }
);

/** Serializable recipe request accepted before setup and plan admission. */
export type RunRequest = Readonly<
  Omit<Static<typeof RunRequestSchema>, "setup"> & {
    readonly setup: MapSetup | MapSetupInput;
  }
>;

/** Frozen executable projection of one registered recipe step. */
export interface ExecutionPlanNode {
  readonly stepId: string;
  readonly phase: GenerationPhase;
  readonly requires: readonly string[];
  readonly provides: readonly string[];
  readonly config: Readonly<Record<string, unknown>>;
}

/** Frozen recipe execution graph bound to the exact setup used during compilation. */
export interface ExecutionPlan {
  readonly [executionPlanBrand]: true;
  readonly recipeSchemaVersion: number;
  readonly recipeId?: string;
  readonly setup: MapSetup;
  readonly nodes: readonly ExecutionPlanNode[];
}

export type ExecutionPlanCompileErrorCode = "runRequest.invalid" | "step.unknown";

export interface ExecutionPlanCompileErrorItem {
  code: ExecutionPlanCompileErrorCode;
  path: string;
  message: string;
  stepId?: string;
}

export class ExecutionPlanCompileError extends Error {
  readonly errors: ExecutionPlanCompileErrorItem[];

  constructor(errors: ExecutionPlanCompileErrorItem[]) {
    const message = errors.map((err) => `${err.path}: ${err.message}`).join("; ");
    super(`ExecutionPlan compile failed: ${message}`);
    this.name = "ExecutionPlanCompileError";
    this.errors = errors;
  }
}

/** @internal Verifies that a plan was compiled by, and for, the supplied registry. */
export function assertExecutionPlanRegistryInternal(
  plan: ExecutionPlan,
  registry: StepRegistry
): void {
  getExecutionPlanBindingInternal(plan, registry);
}

/** @internal Returns the immutable runtime authority retained by an authentic compiled plan. */
export function getExecutionPlanBindingInternal(
  plan: ExecutionPlan,
  registry?: StepRegistry
): Readonly<{
  nodes: readonly Readonly<{
    step: MapGenStep<unknown, unknown>;
    config: Readonly<Record<string, unknown>>;
  }>[];
  tagRegistry: TagRegistry;
  fingerprint: string;
}> {
  const binding = executionPlanBindings.get(plan);
  if (binding === undefined) {
    throw new Error(
      "Pipeline execution requires an authentic execution plan returned by compileExecutionPlan."
    );
  }
  if (registry !== undefined && binding.registry !== registry) {
    throw new Error("Execution plan was compiled against a different step registry.");
  }
  return binding as Readonly<{
    nodes: readonly Readonly<{
      step: MapGenStep<unknown, unknown>;
      config: Readonly<Record<string, unknown>>;
    }>[];
    tagRegistry: TagRegistry;
    fingerprint: string;
  }>;
}

/**
 * Admits a run request into an immutable execution plan.
 *
 * The returned plan retains the admitted setup by identity; callers must create the execution
 * context from `plan.setup` so setup-dependent configuration cannot cross physical runs.
 */
export function compileExecutionPlan(
  runRequest: RunRequest,
  registry: StepRegistry
): ExecutionPlan {
  const request = readRunRequestRoot(runRequest);
  const setup = admitMapSetup(request.setup);

  const recipeSnapshot = createPortableJsonSnapshot(request.recipe, "/recipe");
  if (!recipeSnapshot.ok) {
    throw new ExecutionPlanCompileError([
      {
        code: "runRequest.invalid",
        path: recipeSnapshot.path,
        message: recipeSnapshot.message,
      },
    ]);
  }
  const recipeErrors = Array.from(Value.Errors(RecipeV2Schema, recipeSnapshot.value));
  if (recipeErrors.length > 0) {
    throw new ExecutionPlanCompileError(
      recipeErrors.map((error) => ({
        code: "runRequest.invalid",
        path: `/recipe${error.instancePath}`,
        message: error.message,
      }))
    );
  }
  const recipe = recipeSnapshot.value as unknown as RecipeV2;

  const errors: ExecutionPlanCompileErrorItem[] = [];
  const nodes: ExecutionPlanNode[] = [];
  const runtimeNodes: Array<
    Readonly<{
      step: MapGenStep<unknown, unknown>;
      config: Readonly<Record<string, unknown>>;
    }>
  > = [];
  const seenStepIds = new Set<string>();

  recipe.steps.forEach((step, index) => {
    const { id: stepId, enabled = true, config: stepConfig } = step;
    if (seenStepIds.has(stepId)) {
      errors.push({
        code: "runRequest.invalid",
        path: `/recipe/steps/${index}/id`,
        message: `Duplicate step id "${stepId}" (recipes require unique step ids)`,
        stepId,
      });
      return;
    }
    seenStepIds.add(stepId);
    if (!enabled) return;

    if (!registry.has(stepId)) {
      errors.push({
        code: "step.unknown",
        path: `/recipe/steps/${index}/id`,
        message: `Unknown step "${stepId}"`,
        stepId,
      });
      return;
    }

    const registryStep = registry.get(stepId);
    let config: Readonly<Record<string, unknown>> = EMPTY_STEP_CONFIG;
    if (stepConfig !== undefined) {
      if (stepConfig === null || typeof stepConfig !== "object" || Array.isArray(stepConfig)) {
        errors.push({
          code: "runRequest.invalid",
          path: `/recipe/steps/${index}/config`,
          message: "Expected object",
          stepId,
        });
        return;
      }
      const ownedConfig = stepConfig as Readonly<Record<string, unknown>>;
      config = Object.keys(ownedConfig).length === 0 ? EMPTY_STEP_CONFIG : ownedConfig;
    }

    nodes.push(
      Object.freeze({
        stepId,
        phase: registryStep.phase,
        requires: Object.freeze([...registryStep.requires]),
        provides: Object.freeze([...registryStep.provides]),
        config,
      })
    );
    runtimeNodes.push(Object.freeze({ step: registryStep, config }));
  });

  if (errors.length > 0) {
    throw new ExecutionPlanCompileError(errors);
  }

  const plan = Object.freeze({
    recipeSchemaVersion: recipe.schemaVersion,
    recipeId: recipe.id,
    setup,
    nodes: Object.freeze(nodes),
  }) as ExecutionPlan;
  const tagRegistry = snapshotDependencyTags(runtimeNodes, registry.getTagRegistry());
  executionPlanBindings.set(
    plan,
    Object.freeze({
      registry,
      nodes: Object.freeze(runtimeNodes),
      tagRegistry,
      fingerprint: hashExecutionPlan(plan),
    }) as ExecutionPlanBinding
  );
  return plan;
}

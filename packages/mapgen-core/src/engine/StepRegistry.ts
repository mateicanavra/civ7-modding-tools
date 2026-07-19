import type { MapContext } from "@mapgen/core/map-context.js";
import { assertStageId } from "@mapgen/authoring/stage-id.js";
import { DuplicateStepError, UnknownStepError } from "@mapgen/engine/errors.js";
import {
  type DependencyTagDefinition,
  TagRegistry,
  validateDependencyTags,
} from "@mapgen/engine/tags.js";
import type { MapGenStep } from "@mapgen/engine/types.js";

/** Owns immutable registered step snapshots and their single MapContext dependency authority. */
export class StepRegistry {
  private readonly steps = new Map<string, MapGenStep<unknown, unknown>>();
  private readonly tags: TagRegistry;

  constructor(options: { tags?: TagRegistry } = {}) {
    this.tags = options.tags ?? new TagRegistry();
  }

  /** Adds one dependency tag to the registry's closed execution vocabulary. */
  registerTag(definition: DependencyTagDefinition): void {
    this.tags.registerTag(definition);
  }

  /** Adds a related set of dependency tags through the same duplicate-safe authority. */
  registerTags(definitions: readonly DependencyTagDefinition[]): void {
    this.tags.registerTags(definitions);
  }

  /** Returns the dependency authority used when execution plans validate step edges. */
  getTagRegistry(): TagRegistry {
    return this.tags;
  }

  /** Snapshots and registers one uniquely identified step after validating its tag edges. */
  register<TConfig, TResult>(step: MapGenStep<TConfig, TResult>): void {
    const { id, stageId, requires, provides, configSchema, normalize, run, facets } = step;
    assertStageId(stageId);
    if (this.steps.has(id)) {
      throw new DuplicateStepError(id);
    }
    const registeredRequires = Object.freeze([...requires]);
    const registeredProvides = Object.freeze([...provides]);
    validateDependencyTags(registeredRequires, this.tags);
    validateDependencyTags(registeredProvides, this.tags);
    const registeredStep = Object.freeze({
      id,
      stageId,
      requires: registeredRequires,
      provides: registeredProvides,
      configSchema,
      normalize,
      run,
      facets:
        facets === undefined
          ? undefined
          : Object.freeze({ metrics: facets.metrics, viz: facets.viz }),
    }) as MapGenStep<unknown, unknown>;
    this.steps.set(id, registeredStep);
  }

  /** Resolves a registered immutable step, rejecting unknown identifiers. */
  get<TConfig = unknown, TResult = unknown>(stepId: string): MapGenStep<TConfig, TResult> {
    const step = this.steps.get(stepId);
    if (!step) throw new UnknownStepError(stepId);
    return step as MapGenStep<TConfig, TResult>;
  }

  /** Reports whether a step identifier is already registered. */
  has(stepId: string): boolean {
    return this.steps.has(stepId);
  }
}

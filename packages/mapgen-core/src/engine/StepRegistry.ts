import { assertArtifact, isArtifact } from "@mapgen/authoring/artifact/contract.js";
import { assertStageId } from "@mapgen/authoring/stage/identity.js";
import type { MapContext } from "@mapgen/core/map-context.js";
import { assertCompletionId } from "@mapgen/engine/completion.js";
import { DuplicateStepError, UnknownStepError } from "@mapgen/engine/errors.js";
import type { MapGenStep, PipelineDependency } from "@mapgen/engine/types.js";

function snapshotDependencies(
  values: readonly PipelineDependency[]
): readonly PipelineDependency[] {
  const snapshot: PipelineDependency[] = [];
  for (const value of values) {
    if (isArtifact(value)) {
      assertArtifact(value);
      snapshot.push(value);
      continue;
    }
    assertCompletionId(value);
    snapshot.push(value);
  }
  return Object.freeze(snapshot);
}

/** Owns immutable registered step snapshots for one compiled MapGen recipe. */
export class StepRegistry {
  private readonly steps = new Map<string, MapGenStep<unknown, unknown>>();

  /** Snapshots and registers one uniquely identified step after admitting its dependencies. */
  register<TConfig, TObservation>(step: MapGenStep<TConfig, TObservation>): void {
    const {
      id,
      stageId,
      requires,
      provides,
      projectsInitialSetup,
      configSchema,
      normalize,
      run,
      facets,
    } = step;
    assertStageId(stageId);
    if (this.steps.has(id)) {
      throw new DuplicateStepError(id);
    }
    const registeredRequires = snapshotDependencies(requires);
    const registeredProvides = snapshotDependencies(provides);
    const registeredStep = Object.freeze({
      id,
      stageId,
      requires: registeredRequires,
      provides: registeredProvides,
      ...(projectsInitialSetup === true ? { projectsInitialSetup: true } : {}),
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
  get<TConfig = unknown, TObservation = unknown>(
    stepId: string
  ): MapGenStep<TConfig, TObservation> {
    const step = this.steps.get(stepId);
    if (!step) throw new UnknownStepError(stepId);
    return step as MapGenStep<TConfig, TObservation>;
  }

  /** Reports whether a step identifier is already registered. */
  has(stepId: string): boolean {
    return this.steps.has(stepId);
  }
}

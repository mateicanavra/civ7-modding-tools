class StepRegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StepRegistryError";
  }
}

/** Refuses registration when another immutable step already owns the same recipe-wide identity. */
export class DuplicateStepError extends StepRegistryError {
  constructor(stepId: string) {
    super(`Step "${stepId}" is already registered.`);
    this.name = "DuplicateStepError";
  }
}

/** Reports a recipe or caller lookup for a step that the active registry does not own. */
export class UnknownStepError extends StepRegistryError {
  constructor(stepId: string) {
    super(`Unknown step "${stepId}".`);
    this.name = "UnknownStepError";
  }
}

class DependencyTagError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DependencyTagError";
  }
}

/**
 * Rejects a dependency tag whose identifier or declared kind violates the registry namespace.
 * Artifact tags are recipe-derived authorities; authored registrations are limited to effect tags.
 */
export class InvalidDependencyTagError extends DependencyTagError {
  constructor(tag: string) {
    super(`Invalid dependency tag "${tag}".`);
    this.name = "InvalidDependencyTagError";
  }
}

/** Reports a dependency edge or lookup whose tag has no definition in the active registry. */
export class UnknownDependencyTagError extends DependencyTagError {
  constructor(tag: string) {
    super(`Unknown dependency tag "${tag}".`);
    this.name = "UnknownDependencyTagError";
  }
}

/** Refuses a second authority for an already registered dependency-tag identity. */
export class DuplicateDependencyTagError extends DependencyTagError {
  constructor(tag: string) {
    super(`Dependency tag "${tag}" is already registered.`);
    this.name = "DuplicateDependencyTagError";
  }
}

/**
 * Rejects a dependency-tag example that fails its definition's synchronous admission check.
 * This keeps invalid or asynchronous demo evidence out of the registry snapshot.
 */
export class InvalidDependencyTagDemoError extends DependencyTagError {
  constructor(tag: string) {
    super(`Invalid demo payload for dependency tag "${tag}".`);
    this.name = "InvalidDependencyTagDemoError";
  }
}

/**
 * Stops a step before execution when one or more declared prerequisites are not satisfied.
 * The captured satisfied set makes dependency-order defects diagnosable without replaying the run.
 */
export class MissingDependencyError extends Error {
  readonly stepId: string;
  readonly missing: readonly string[];
  readonly satisfied: readonly string[];

  constructor(options: {
    stepId: string;
    missing: readonly string[];
    satisfied: readonly string[];
  }) {
    const missingList = options.missing.join(", ");
    super(`Missing dependency for "${options.stepId}": ${missingList}`);
    this.name = "MissingDependencyError";
    this.stepId = options.stepId;
    this.missing = options.missing;
    this.satisfied = options.satisfied;
  }
}

/**
 * Reports that a completed step did not establish the postcondition for every declared provision.
 * The executor leaves those tags unsatisfied so downstream steps cannot observe false evidence.
 */
export class UnsatisfiedProvidesError extends Error {
  readonly stepId: string;
  readonly missingProvides: readonly string[];

  constructor(stepId: string, missingProvides: readonly string[]) {
    super(`Step "${stepId}" did not satisfy declared provides: ${missingProvides.join(", ")}`);
    this.name = "UnsatisfiedProvidesError";
    this.stepId = stepId;
    this.missingProvides = missingProvides;
  }
}

/**
 * Wraps an exception at the step execution boundary while preserving the original cause.
 * Throw-mode executors use this stable error to attribute failures without double-wrapping errors
 * that already carry step identity or cancellation semantics.
 */
export class StepExecutionError extends Error {
  readonly stepId: string;
  readonly cause: unknown;

  constructor(stepId: string, cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    super(`Step "${stepId}" failed: ${message}`);
    this.name = "StepExecutionError";
    this.stepId = stepId;
    this.cause = cause;
  }
}

/**
 * Thrown when a pipeline run is cancelled via an AbortSignal-like mechanism.
 *
 * We intentionally use the conventional `AbortError` name so callers can treat this
 * similarly to DOM AbortController cancellation (in browser runtimes).
 */
export class PipelineAbortError extends Error {
  constructor(message: string = "Pipeline aborted") {
    super(message);
    this.name = "AbortError";
  }
}

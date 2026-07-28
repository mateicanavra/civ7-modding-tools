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

/** Reports the exact artifacts a completed provider declared but did not publish. */
export class MissingArtifactPublicationError extends Error {
  readonly stepId: string;
  readonly missingArtifacts: readonly string[];

  constructor(stepId: string, missingArtifacts: readonly string[]) {
    super(`Step "${stepId}" did not publish declared artifacts: ${missingArtifacts.join(", ")}`);
    this.name = "MissingArtifactPublicationError";
    this.stepId = stepId;
    this.missingArtifacts = missingArtifacts;
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

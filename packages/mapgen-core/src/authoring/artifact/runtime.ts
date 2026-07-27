import {
  getActiveMapContextStepIdInternal,
  type MapContext,
  publishMapContextArtifactInternal,
  readMapContextArtifactInternal,
} from "@mapgen/core/map-context.js";
import { type Artifact, type ArtifactReadValueOf, type ArtifactValueOf } from "./contract.js";

/**
 * Signals that a step attempted to read a declared artifact before any producer published it.
 * Dependency gating and runtime reads retain the artifact identity and active consumer for
 * actionable pipeline diagnostics.
 */
export class ArtifactMissingError extends Error {
  public readonly artifactId: string;
  public readonly artifactName: string;
  public readonly consumerStepId: string;

  constructor(args: { artifactId: string; artifactName: string; consumerStepId: string }) {
    super(
      `Missing artifact ${args.artifactId} (${args.artifactName}) required by step ${args.consumerStepId}`
    );
    this.name = "ArtifactMissingError";
    this.artifactId = args.artifactId;
    this.artifactName = args.artifactName;
    this.consumerStepId = args.consumerStepId;
  }
}

/**
 * Signals that a producer violated the artifact store's write-once lifecycle.
 * The original publication remains authoritative; this error identifies the later producer that
 * attempted to replace it.
 */
export class ArtifactDoublePublishError extends Error {
  public readonly artifactId: string;
  public readonly artifactName: string;
  public readonly producerStepId: string;

  constructor(args: { artifactId: string; artifactName: string; producerStepId: string }) {
    super(
      `Artifact ${args.artifactId} (${args.artifactName}) is already published; write-once violated by step ${args.producerStepId}`
    );
    this.name = "ArtifactDoublePublishError";
    this.artifactId = args.artifactId;
    this.artifactName = args.artifactName;
    this.producerStepId = args.producerStepId;
  }
}

/**
 * Reports structural, typed-array, or semantic admission failures at artifact publication.
 * Validation issues remain inspectable as a batch, while `cause` preserves an unexpected validator
 * exception without allowing malformed evidence into the run.
 */
export class ArtifactValidationError extends Error {
  public readonly artifactId: string;
  public readonly artifactName: string;
  public readonly producerStepId: string;
  public readonly issues: readonly { message: string }[];
  public readonly cause?: unknown;

  constructor(args: {
    artifactId: string;
    artifactName: string;
    producerStepId: string;
    issues: readonly { message: string }[];
    cause?: unknown;
  }) {
    super(
      `Artifact ${args.artifactId} (${args.artifactName}) rejected by validation in step ${args.producerStepId}`
    );
    this.name = "ArtifactValidationError";
    this.artifactId = args.artifactId;
    this.artifactName = args.artifactName;
    this.producerStepId = args.producerStepId;
    this.issues = args.issues;
    this.cause = args.cause;
  }
}

function requireArtifactOccurrence(context: MapContext, expectedStepId?: string): string {
  const activeStepId = getActiveMapContextStepIdInternal(context);
  if (
    activeStepId === undefined ||
    (expectedStepId !== undefined && activeStepId !== expectedStepId)
  ) {
    if (expectedStepId === undefined) {
      throw new Error("Artifact capability requires the currently active step context.");
    }
    throw new Error(
      `Artifact capability for step "${expectedStepId}" requires that step's exact active context.`
    );
  }
  return activeStepId;
}

function normalizeIssues(error: unknown): readonly { message: string }[] {
  if (error instanceof Error) {
    return [{ message: error.message }];
  }
  return [{ message: String(error) }];
}

/** @internal Reads one admitted artifact through its exact identity and active occurrence. */
export function readArtifactValueInternal<A extends Artifact>(
  context: MapContext,
  artifact: A,
  expectedStepId?: string
): ArtifactReadValueOf<A> {
  const consumerStepId = requireArtifactOccurrence(context, expectedStepId);
  const observation = readMapContextArtifactInternal(context, artifact);
  if (!observation.found) {
    throw new ArtifactMissingError({
      artifactId: artifact.id,
      artifactName: artifact.name,
      consumerStepId,
    });
  }
  return observation.value as ArtifactReadValueOf<A>;
}

/** @internal Admits and publishes one artifact through its exact active occurrence. */
export function publishArtifactValueInternal<A extends Artifact>(
  context: MapContext,
  artifact: A,
  value: ArtifactValueOf<A>,
  expectedStepId?: string
): ArtifactReadValueOf<A> {
  const producerStepId = requireArtifactOccurrence(context, expectedStepId);
  if (readMapContextArtifactInternal(context, artifact).found) {
    throw new ArtifactDoublePublishError({
      artifactId: artifact.id,
      artifactName: artifact.name,
      producerStepId,
    });
  }

  let issues: readonly { message: string }[];
  let cause: unknown;
  try {
    issues = artifact.validate(value, { dimensions: context.setup.dimensions });
  } catch (error) {
    cause = error;
    issues = normalizeIssues(error);
  }

  if (issues.length > 0) {
    throw new ArtifactValidationError({
      artifactId: artifact.id,
      artifactName: artifact.name,
      producerStepId,
      issues,
      cause,
    });
  }

  publishMapContextArtifactInternal(context, artifact, value);
  return value as ArtifactReadValueOf<A>;
}

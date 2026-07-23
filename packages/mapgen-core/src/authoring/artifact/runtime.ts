import {
  getActiveMapContextStepIdInternal,
  type MapContext,
  publishMapContextArtifactInternal,
  readMapContextArtifactInternal,
} from "@mapgen/core/map-context.js";
import {
  type Artifact,
  type ArtifactReadValueOf,
  type ArtifactValueOf,
  assertArtifact,
} from "./contract.js";

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

type ArtifactRuntimes<Artifacts extends readonly Artifact[]> = Readonly<{
  [Entry in Artifacts[number] as Entry["name"]]: ImplementedArtifactRuntime<Entry>;
}>;

export type RequiredArtifactRuntime<A extends Artifact> = Readonly<{
  /**
   * Read the stored artifact reference under the pipeline's immutable ownership contract.
   *
   * IMPORTANT:
   * - This does not perform runtime snapshotting/copying in production.
   * - It does not make hostile mutation impossible; typed arrays still expose mutator methods.
   * - Consumers must treat the returned reference as immutable and must not mutate it.
   * - If mutation is needed, callers must copy first (caller-owned copy).
   */
  read: (context: MapContext) => ArtifactReadValueOf<A>;
}>;

export type ProvidedArtifactRuntime<A extends Artifact> = Readonly<{
  /**
   * Publish an artifact (write-once).
   *
   * IMPORTANT:
   * - Publishing stores the provided value reference (no deep freeze, no snapshotting in prod).
   * - Producers must treat published values as immutable once stored.
   */
  publish: (context: MapContext, value: ArtifactValueOf<A>) => ArtifactReadValueOf<A>;
}>;

/** @internal Complete provider binding retained by recipe composition, never authored step code. */
export type ImplementedArtifactRuntime<A extends Artifact> = RequiredArtifactRuntime<A> &
  ProvidedArtifactRuntime<A> &
  Readonly<{ artifact: A }>;

function resolveStepId(context: MapContext): string {
  return getActiveMapContextStepIdInternal(context) ?? "unknown";
}

function snapshotArtifacts(artifacts: readonly Artifact[]): readonly Artifact[] {
  if (!Array.isArray(artifacts)) {
    throw new Error("artifacts must be an array");
  }
  const ownKeys = Reflect.ownKeys(artifacts);
  if (ownKeys.length !== artifacts.length + 1) {
    throw new Error("artifacts must be a dense array without extra keys");
  }

  const snapshots: Artifact[] = [];
  for (let index = 0; index < artifacts.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(artifacts, String(index));
    if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
      throw new Error(`artifact at index ${index} must be an enumerable data property`);
    }
    assertArtifact(descriptor.value);
    snapshots.push(descriptor.value);
  }
  return Object.freeze(snapshots);
}

function assertUniqueArtifacts(artifacts: readonly Artifact[]): void {
  const names = new Set<string>();
  const ids = new Set<string>();
  for (const artifact of artifacts) {
    if (names.has(artifact.name)) {
      throw new Error(`duplicate artifact name "${artifact.name}" in provides list`);
    }
    if (ids.has(artifact.id)) {
      throw new Error(`duplicate artifact id "${artifact.id}" in provides list`);
    }
    names.add(artifact.name);
    ids.add(artifact.id);
  }
}

function readStored<A extends Artifact>(
  context: MapContext,
  artifact: A
): {
  hasValue: boolean;
  value: ArtifactValueOf<A> | undefined;
} {
  const observation = readMapContextArtifactInternal(context, artifact);
  return observation.found
    ? { hasValue: true, value: observation.value as ArtifactValueOf<A> }
    : { hasValue: false, value: undefined };
}

function normalizeIssues(error: unknown): readonly { message: string }[] {
  if (error instanceof Error) {
    return [{ message: error.message }];
  }
  return [{ message: String(error) }];
}

/**
 * Builds write-once runtimes from canonical artifacts. Each artifact's complete validator runs
 * once per publish or satisfaction observation; callers cannot replace the admission path.
 */
export function implementArtifacts<const Artifacts extends readonly Artifact[]>(
  artifacts: Artifacts
): ArtifactRuntimes<Artifacts> {
  const snapshots = snapshotArtifacts(artifacts);
  assertUniqueArtifacts(snapshots);
  const entries: Array<readonly [string, ImplementedArtifactRuntime<Artifact>]> = [];

  for (const artifact of snapshots) {
    const runtime: ImplementedArtifactRuntime<typeof artifact> = {
      artifact,
      read: (context) => {
        const { hasValue, value } = readStored(context, artifact);
        if (!hasValue) {
          throw new ArtifactMissingError({
            artifactId: artifact.id,
            artifactName: artifact.name,
            consumerStepId: resolveStepId(context),
          });
        }
        return value as ArtifactReadValueOf<typeof artifact>;
      },
      publish: (context, value) => {
        if (readMapContextArtifactInternal(context, artifact).found) {
          throw new ArtifactDoublePublishError({
            artifactId: artifact.id,
            artifactName: artifact.name,
            producerStepId: resolveStepId(context),
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
            producerStepId: resolveStepId(context),
            issues,
            cause,
          });
        }

        publishMapContextArtifactInternal(context, artifact, value);
        return value as ArtifactReadValueOf<typeof artifact>;
      },
    };
    entries.push([artifact.name, runtime]);
  }

  return Object.freeze(Object.fromEntries(entries)) as ArtifactRuntimes<Artifacts>;
}

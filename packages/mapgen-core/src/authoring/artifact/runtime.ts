import {
  getActiveMapContextStepIdInternal,
  type MapContext,
  publishMapContextArtifactInternal,
  readMapContextArtifactInternal,
} from "@mapgen/core/map-context.js";
import type { ArtifactContract, ArtifactReadValueOf, ArtifactValueOf } from "./contract.js";
import {
  type ArtifactModule,
  type SchemaBoundArtifactModuleList,
  snapshotArtifactModule,
} from "./module.js";

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

type ArtifactModuleRuntimes<Modules extends readonly ArtifactModule[]> = Readonly<{
  [Module in Modules[number] as Module["artifact"]["name"]]: ImplementedArtifactRuntime<
    Module["artifact"]
  >;
}>;

export type RequiredArtifactRuntime<C extends ArtifactContract> = Readonly<{
  /**
   * Read the stored artifact reference under the pipeline's immutable ownership contract.
   *
   * IMPORTANT:
   * - This does not perform runtime snapshotting/copying in production.
   * - It does not make hostile mutation impossible; typed arrays still expose mutator methods.
   * - Consumers must treat the returned reference as immutable and must not mutate it.
   * - If mutation is needed, callers must copy first (caller-owned copy).
   */
  read: (context: MapContext) => ArtifactReadValueOf<C>;
}>;

export type ProvidedArtifactRuntime<C extends ArtifactContract> = Readonly<{
  /**
   * Publish an artifact (write-once).
   *
   * IMPORTANT:
   * - Publishing stores the provided value reference (no deep freeze, no snapshotting in prod).
   * - Producers must treat published values as immutable once stored.
   */
  publish: (context: MapContext, value: ArtifactValueOf<C>) => ArtifactReadValueOf<C>;
}>;

/** @internal Complete provider binding retained by recipe composition, never authored step code. */
export type ImplementedArtifactRuntime<C extends ArtifactContract> = RequiredArtifactRuntime<C> &
  ProvidedArtifactRuntime<C> &
  Readonly<{ contract: C }>;

function resolveStepId(context: MapContext): string {
  return getActiveMapContextStepIdInternal(context) ?? "unknown";
}

function snapshotArtifactModules(modules: readonly ArtifactModule[]): readonly ArtifactModule[] {
  if (!Array.isArray(modules)) {
    throw new Error("artifact modules must be an array");
  }
  const ownKeys = Reflect.ownKeys(modules);
  if (ownKeys.length !== modules.length + 1) {
    throw new Error("artifact modules must be a dense array without extra keys");
  }

  const snapshots: ArtifactModule[] = [];
  for (let index = 0; index < modules.length; index += 1) {
    const moduleDescriptor = Object.getOwnPropertyDescriptor(modules, String(index));
    if (!moduleDescriptor || !("value" in moduleDescriptor) || !moduleDescriptor.enumerable) {
      throw new Error(`artifact module at index ${index} must be a data property`);
    }

    snapshots.push(
      snapshotArtifactModule(moduleDescriptor.value, `artifact module at index ${index}`)
    );
  }
  return Object.freeze(snapshots);
}

function assertUniqueModules(modules: readonly ArtifactModule[]): void {
  const names = new Set<string>();
  const ids = new Set<string>();
  for (const { artifact: contract } of modules) {
    if (names.has(contract.name)) {
      throw new Error(`duplicate artifact name "${contract.name}" in provides list`);
    }
    if (ids.has(contract.id)) {
      throw new Error(`duplicate artifact id "${contract.id}" in provides list`);
    }
    names.add(contract.name);
    ids.add(contract.id);
  }
}

function readStored<C extends ArtifactContract>(
  context: MapContext,
  contract: C
): {
  hasValue: boolean;
  value: ArtifactValueOf<C> | undefined;
} {
  const observation = readMapContextArtifactInternal(context, contract);
  return observation.found
    ? { hasValue: true, value: observation.value as ArtifactValueOf<C> }
    : { hasValue: false, value: undefined };
}

function normalizeIssues(error: unknown): readonly { message: string }[] {
  if (error instanceof Error) {
    return [{ message: error.message }];
  }
  return [{ message: String(error) }];
}

/**
 * Builds write-once artifact runtimes from the same modules that own contract registration and
 * validation. Each validator runs once per publish or satisfaction observation; callers cannot
 * omit validation or install a second admission path.
 */
export function implementArtifactModules<const Modules extends readonly ArtifactModule[]>(
  modules: Modules & SchemaBoundArtifactModuleList<Modules>
): ArtifactModuleRuntimes<Modules> {
  const snapshots = snapshotArtifactModules(modules);
  assertUniqueModules(snapshots);
  const entries: Array<readonly [string, ImplementedArtifactRuntime<ArtifactContract>]> = [];

  for (const module of snapshots) {
    const { artifact: contract, validate } = module;

    const runtime: ImplementedArtifactRuntime<typeof contract> = {
      contract,
      read: (context) => {
        const { hasValue, value } = readStored(context, contract);
        if (!hasValue) {
          throw new ArtifactMissingError({
            artifactId: contract.id,
            artifactName: contract.name,
            consumerStepId: resolveStepId(context),
          });
        }
        return value as ArtifactReadValueOf<typeof contract>;
      },
      publish: (context, value) => {
        if (readMapContextArtifactInternal(context, contract).found) {
          throw new ArtifactDoublePublishError({
            artifactId: contract.id,
            artifactName: contract.name,
            producerStepId: resolveStepId(context),
          });
        }

        let issues: readonly { message: string }[];
        let cause: unknown;
        try {
          issues = validate(value, { dimensions: context.setup.dimensions });
        } catch (error) {
          cause = error;
          issues = normalizeIssues(error);
        }

        if (issues.length > 0) {
          throw new ArtifactValidationError({
            artifactId: contract.id,
            artifactName: contract.name,
            producerStepId: resolveStepId(context),
            issues,
            cause,
          });
        }

        publishMapContextArtifactInternal(context, contract, value);
        return value as ArtifactReadValueOf<typeof contract>;
      },
    };
    entries.push([contract.name, runtime]);
  }

  return Object.freeze(Object.fromEntries(entries)) as ArtifactModuleRuntimes<Modules>;
}

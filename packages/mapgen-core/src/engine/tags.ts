import type { Artifact } from "@mapgen/authoring/artifact/contract.js";
import {
  observeValidatedArtifactInternal,
  type ValidatedArtifactObservation,
} from "@mapgen/authoring/artifact/validated-read.js";
import type { MapContext } from "@mapgen/core/map-context.js";
import { verifyMapContextEffectInternal } from "@mapgen/core/map-context.js";
import {
  DuplicateDependencyTagError,
  InvalidDependencyTagDemoError,
  InvalidDependencyTagError,
  UnknownDependencyTagError,
} from "@mapgen/engine/errors.js";
import { classifyThenable, containThenable } from "@mapgen/lib/async/thenable.js";

export type DependencyTagKind = "artifact" | "effect";

type SatisfactionState = Readonly<{
  satisfied: ReadonlySet<string>;
}>;

/** Narrow postcondition evidence available to registered dependency-tag authorities. */
export interface DependencyEvidence {
  /** Verifies only the effect tag whose satisfaction predicate is currently being evaluated. */
  readonly verifyEffect: () => boolean;
  readonly observeArtifact: <A extends Artifact>(artifact: A) => ValidatedArtifactObservation<A>;
}

function invokeSatisfactionPredicate(
  tag: string,
  context: MapContext,
  satisfies: (evidence: DependencyEvidence) => boolean
): boolean {
  let activeContext: MapContext | undefined = context;
  const currentContext = (): MapContext => activeContext ?? rejectRevokedDependencyEvidence();
  const evidence: DependencyEvidence = Object.freeze({
    verifyEffect: () => verifyMapContextEffectInternal(currentContext(), tag),
    observeArtifact: <A extends Artifact>(artifact: A) =>
      observeValidatedArtifactInternal(currentContext(), artifact),
  });
  try {
    const result: unknown = satisfies(evidence);
    return typeof result === "boolean" ? result : rejectInvalidSatisfactionResult(tag, result);
  } finally {
    activeContext = undefined;
  }
}

function rejectRevokedDependencyEvidence(): never {
  throw new Error("Dependency evidence is available only during its satisfaction predicate.");
}

function rejectInvalidSatisfactionResult(tag: string, result: unknown): never {
  containThenable(classifyThenable(result));
  throw new TypeError(`Dependency tag "${tag}" satisfaction predicate must return a boolean.`);
}

function rejectInvalidDemoResult(tag: string, result: unknown): never {
  containThenable(classifyThenable(result));
  throw new InvalidDependencyTagDemoError(tag);
}

type DependencyTagDefinitionBase = Readonly<{
  readonly id: string;
  readonly satisfies?: (evidence: DependencyEvidence) => boolean;
  readonly demo?: unknown;
  readonly validateDemo?: (demo: unknown) => boolean;
}>;

/** Immutable authority for one explicitly registered effect dependency. */
export type DependencyTagDefinition = DependencyTagDefinitionBase &
  Readonly<{
    kind: "effect";
  }>;

type ArtifactDependencyTagDefinition = DependencyTagDefinitionBase &
  Readonly<{
    kind: "artifact";
  }>;

/** @internal Complete dependency authority retained after recipe-owned artifact admission. */
export type InternalDependencyTagDefinition =
  | DependencyTagDefinition
  | ArtifactDependencyTagDefinition;

const registryDefinitions = new WeakMap<
  TagRegistry,
  Map<string, InternalDependencyTagDefinition>
>();

function definitionsFor(registry: TagRegistry): Map<string, InternalDependencyTagDefinition> {
  const definitions = registryDefinitions.get(registry);
  if (!definitions) throw new Error("MapGen dependency registry is not initialized.");
  return definitions;
}

function registerDefinition(
  registry: TagRegistry,
  candidate: InternalDependencyTagDefinition,
  allowArtifact: boolean
): void {
  const { id, kind, satisfies, demo, validateDemo } = candidate;
  const definition = Object.freeze({
    id,
    kind,
    satisfies,
    demo,
    validateDemo,
  }) as InternalDependencyTagDefinition;
  const definitions = definitionsFor(registry);
  if (definitions.has(definition.id)) {
    throw new DuplicateDependencyTagError(definition.id);
  }
  if ((!allowArtifact && definition.kind === "artifact") || !isTagKindCompatible(id, kind)) {
    throw new InvalidDependencyTagError(definition.id);
  }
  if (definition.demo !== undefined) {
    const admitted: unknown = definition.validateDemo?.(definition.demo);
    admitted === true || rejectInvalidDemoResult(definition.id, admitted);
  }
  definitions.set(definition.id, definition);
}

/** Registers the closed dependency-tag authority used when compiling execution plans. */
export class TagRegistry {
  constructor() {
    registryDefinitions.set(this, new Map());
  }

  /** Admits one explicit effect definition by owned snapshot. Artifact authority comes from modules. */
  registerTag(candidate: DependencyTagDefinition): void {
    registerDefinition(this, candidate, false);
  }

  /** Admits each definition through the same validation and snapshot boundary as `registerTag`. */
  registerTags(definitions: readonly DependencyTagDefinition[]): void {
    for (const definition of definitions) {
      this.registerTag(definition);
    }
  }

  /** Returns the immutable registered definition for a known dependency tag. */
  get(tag: string): InternalDependencyTagDefinition {
    this.validateTag(tag);
    return definitionsFor(this).get(tag) as InternalDependencyTagDefinition;
  }

  /** Reports whether this registry owns a definition for the exact tag id. */
  has(tag: string): boolean {
    return definitionsFor(this).has(tag);
  }

  /** Refuses empty or unknown dependency tag ids. */
  validateTag(tag: string): void {
    if (typeof tag !== "string" || tag.length === 0) {
      throw new InvalidDependencyTagError(String(tag));
    }
    if (!definitionsFor(this).has(tag)) {
      throw new UnknownDependencyTagError(tag);
    }
  }

  /** Refuses the first dependency tag id not owned by this registry. */
  validateTags(tags: readonly string[]): void {
    for (const tag of tags) {
      this.validateTag(tag);
    }
  }

  /** Captures the already-admitted definitions selected by one execution plan. */
  snapshot(tags: readonly string[]): TagRegistry {
    const snapshot = new TagRegistry();
    for (const tag of tags) {
      const definition = this.get(tag);
      definitionsFor(snapshot).set(definition.id, definition);
    }
    return snapshot;
  }
}

/** @internal Registers recipe-derived artifact definitions through canonical artifact authority. */
export function registerDependencyTagsInternal(
  registry: TagRegistry,
  definitions: readonly InternalDependencyTagDefinition[]
): void {
  for (const definition of definitions) {
    registerDefinition(registry, definition, true);
  }
}

/** Verifies that every dependency tag is registered in the supplied authority. */
export function validateDependencyTags(tags: readonly string[], registry: TagRegistry): void {
  registry.validateTags(tags);
}

/** Evaluates a previously provided tag against its optional runtime postcondition. */
export function isDependencyTagSatisfied(
  tag: string,
  context: MapContext,
  state: SatisfactionState,
  registry: TagRegistry
): boolean {
  const definition = registry.get(tag);
  if (!state.satisfied.has(tag)) return false;
  if (definition.satisfies) {
    return invokeSatisfactionPredicate(tag, context, definition.satisfies);
  }
  return true;
}

/** Creates the empty satisfaction state; tags become available only after explicit provision. */
export function computeInitialSatisfiedTags(): Set<string> {
  // Tags become satisfied only when explicitly provided.
  return new Set<string>();
}

function isTagKindCompatible(id: string, kind: DependencyTagKind): boolean {
  if (kind === "artifact") return id.startsWith("artifact:");
  if (kind === "effect") return id.startsWith("effect:");
  return false;
}

import { type Artifact, assertArtifact } from "@mapgen/authoring/artifact/contract.js";
import type { MapContext } from "@mapgen/core/map-context.js";
import {
  readMapContextArtifactInternal,
  verifyMapContextEffectInternal,
} from "@mapgen/core/map-context.js";
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

/** Immutable authority for one explicitly registered effect dependency. */
export type EffectDependencyTag = Readonly<{
  readonly id: string;
  readonly kind: "effect";
  readonly satisfies?: (evidence: DependencyEvidence) => boolean;
  readonly demo?: unknown;
  readonly validateDemo?: (demo: unknown) => boolean;
}>;

/** @internal Exact artifact authority selected by recipe composition for one causal edge id. */
export type ArtifactDependencyTag = Readonly<{
  readonly id: string;
  readonly kind: "artifact";
  readonly artifact: Artifact;
}>;

/** Closed dependency authority resolved from one step edge id. */
export type DependencyTag = EffectDependencyTag | ArtifactDependencyTag;

const registryDefinitions = new WeakMap<TagRegistry, Map<string, DependencyTag>>();

function definitionsFor(registry: TagRegistry): Map<string, DependencyTag> {
  const definitions = registryDefinitions.get(registry);
  if (!definitions) throw new Error("MapGen dependency registry is not initialized.");
  return definitions;
}

function registerDefinition(
  registry: TagRegistry,
  candidate: DependencyTag,
  allowArtifact: boolean
): void {
  let definition: DependencyTag;
  if (candidate.kind === "artifact") {
    definition = snapshotArtifactDefinition(candidate, allowArtifact);
  } else if (candidate.kind === "effect") {
    definition = snapshotEffectDefinition(candidate);
  } else {
    rejectInvalidDependencyTag(candidate);
  }
  const definitions = definitionsFor(registry);
  if (definitions.has(definition.id)) {
    throw new DuplicateDependencyTagError(definition.id);
  }
  if (!isTagKindCompatible(definition.id, definition.kind)) {
    throw new InvalidDependencyTagError(definition.id);
  }
  if (definition.kind === "effect" && definition.demo !== undefined) {
    const admitted: unknown = definition.validateDemo?.(definition.demo);
    admitted === true || rejectInvalidDemoResult(definition.id, admitted);
  }
  definitions.set(definition.id, definition);
}

function rejectInvalidDependencyTag(candidate: { readonly id?: unknown }): never {
  throw new InvalidDependencyTagError(String(candidate.id));
}

function snapshotArtifactDefinition(
  candidate: ArtifactDependencyTag,
  allowArtifact: boolean
): ArtifactDependencyTag {
  if (!allowArtifact) throw new InvalidDependencyTagError(candidate.id);
  assertArtifact(candidate.artifact);
  if (candidate.id !== candidate.artifact.id) {
    throw new InvalidDependencyTagError(candidate.id);
  }
  return Object.freeze({
    id: candidate.id,
    kind: "artifact",
    artifact: candidate.artifact,
  });
}

function snapshotEffectDefinition(candidate: EffectDependencyTag): EffectDependencyTag {
  const { id, satisfies, demo, validateDemo } = candidate;
  return Object.freeze({
    id,
    kind: "effect",
    satisfies,
    demo,
    validateDemo,
  });
}

/** Registers the closed dependency-tag authority used when compiling execution plans. */
export class TagRegistry {
  constructor() {
    registryDefinitions.set(this, new Map());
  }

  /** Admits one explicit effect definition by owned snapshot. Artifact authority comes from modules. */
  registerTag(candidate: EffectDependencyTag): void {
    registerDefinition(this, candidate, false);
  }

  /** Admits each definition through the same validation and snapshot boundary as `registerTag`. */
  registerTags(definitions: readonly EffectDependencyTag[]): void {
    for (const definition of definitions) {
      this.registerTag(definition);
    }
  }

  /** Returns the immutable registered definition for a known dependency tag. */
  get(tag: string): DependencyTag {
    this.validateTag(tag);
    return definitionsFor(this).get(tag) as DependencyTag;
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

/** @internal Registers recipe-derived artifact and effect edges through their exact authorities. */
export function registerDependencyTagsInternal(
  registry: TagRegistry,
  definitions: readonly DependencyTag[]
): void {
  for (const definition of definitions) registerDefinition(registry, definition, true);
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
  if (definition.kind === "artifact") {
    return readMapContextArtifactInternal(context, definition.artifact).found;
  }
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
  return kind === "effect" && id.startsWith("effect:");
}

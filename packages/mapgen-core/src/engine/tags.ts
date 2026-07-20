import type { MapContext } from "@mapgen/core/map-context.js";
import {
  DuplicateDependencyTagError,
  InvalidDependencyTagDemoError,
  InvalidDependencyTagError,
  UnknownDependencyTagError,
} from "@mapgen/engine/errors.js";
import type { GenerationPhase } from "@mapgen/engine/types.js";

export type DependencyTagKind = "artifact" | "effect";

type SatisfactionState = {
  satisfied: ReadonlySet<string>;
};

/** Authorship metadata identifying the package and pipeline surface that owns a dependency tag. */
export interface TagOwner {
  readonly pkg: string;
  readonly phase: GenerationPhase;
  readonly stepId?: string;
}

/** Immutable authority for one artifact or effect dependency observed by pipeline execution. */
export interface DependencyTagDefinition {
  readonly id: string;
  readonly kind: DependencyTagKind;
  readonly owner?: TagOwner;
  readonly satisfies?: (context: MapContext, state: SatisfactionState) => boolean;
  readonly demo?: unknown;
  readonly validateDemo?: (demo: unknown) => boolean;
}

/** Registers the closed dependency-tag authority used when compiling execution plans. */
export class TagRegistry {
  private readonly tags = new Map<string, DependencyTagDefinition>();

  /** Admits one tag definition by owned snapshot and rejects duplicate or invalid identities. */
  registerTag(candidate: DependencyTagDefinition): void {
    const { id, kind, owner, satisfies, demo, validateDemo } = candidate;
    const definition = Object.freeze({
      id,
      kind,
      owner: owner && Object.freeze({ pkg: owner.pkg, phase: owner.phase, stepId: owner.stepId }),
      satisfies,
      demo,
      validateDemo,
    });
    if (this.tags.has(definition.id)) {
      throw new DuplicateDependencyTagError(definition.id);
    }
    if (!isTagKindCompatible(definition.id, definition.kind)) {
      throw new InvalidDependencyTagError(definition.id);
    }
    if (definition.demo !== undefined) {
      if (!definition.validateDemo || !definition.validateDemo(definition.demo)) {
        throw new InvalidDependencyTagDemoError(definition.id);
      }
    }
    this.tags.set(definition.id, definition);
  }

  /** Admits each definition through the same validation and snapshot boundary as `registerTag`. */
  registerTags(definitions: readonly DependencyTagDefinition[]): void {
    for (const definition of definitions) {
      this.registerTag(definition);
    }
  }

  /** Returns the immutable registered definition for a known dependency tag. */
  get(tag: string): DependencyTagDefinition {
    this.validateTag(tag);
    return this.tags.get(tag) as DependencyTagDefinition;
  }

  /** Reports whether this registry owns a definition for the exact tag id. */
  has(tag: string): boolean {
    return this.tags.has(tag);
  }

  /** Refuses empty or unknown dependency tag ids. */
  validateTag(tag: string): void {
    if (typeof tag !== "string" || tag.length === 0) {
      throw new InvalidDependencyTagError(String(tag));
    }
    if (!this.tags.has(tag)) {
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
      snapshot.tags.set(definition.id, definition);
    }
    return snapshot;
  }
}

/** Verifies that one dependency tag is registered in the supplied authority. */
export function validateDependencyTag(tag: string, registry: TagRegistry): void {
  registry.validateTag(tag);
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
  if (definition.satisfies) return definition.satisfies(context, state);
  return true;
}

/** Creates the empty satisfaction state; tags become available only after explicit provision. */
export function computeInitialSatisfiedTags(_context: MapContext): Set<string> {
  // Tags become satisfied only when explicitly provided.
  return new Set<string>();
}

function isTagKindCompatible(id: string, kind: DependencyTagKind): boolean {
  if (kind === "artifact") return id.startsWith("artifact:");
  if (kind === "effect") return id.startsWith("effect:");
  return false;
}

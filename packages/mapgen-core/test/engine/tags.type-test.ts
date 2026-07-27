import { defineArtifact, Type } from "@mapgen/authoring/index.js";
import type { MapContext } from "@mapgen/core/map-context.js";
import type {
  ArtifactDependencyTag,
  DependencyEvidence,
  DependencyTag,
  EffectDependencyTag,
} from "@mapgen/engine/index.js";

declare const evidence: DependencyEvidence;

evidence.verifyEffect();
// @ts-expect-error Effect evidence is bound to the tag whose predicate is being evaluated.
evidence.verifyEffect("effect:test.other");

// @ts-expect-error Dependency predicates cannot reach runtime integration authority.
evidence.adapter;
// @ts-expect-error Dependency predicates cannot inspect admitted setup state.
evidence.setup;
// @ts-expect-error Dependency predicates cannot reach raw artifact storage.
evidence.artifacts;
// @ts-expect-error Effect predicates cannot observe artifacts through a parallel capability.
evidence.observeArtifact;

const definition: EffectDependencyTag = {
  id: "effect:test.ready",
  kind: "effect",
  satisfies: (postconditionEvidence) => {
    postconditionEvidence.verifyEffect();
    // @ts-expect-error Registered predicates receive evidence rather than the full MapContext.
    postconditionEvidence.trace;
    return true;
  },
};

const artifact = defineArtifact({
  name: "tagAuthority",
  id: "artifact:test.tag-authority",
  schema: Type.Unknown(),
});
const artifactAuthority: ArtifactDependencyTag = {
  id: artifact.id,
  kind: "artifact",
  artifact,
};
const closedAuthority: DependencyTag = artifactAuthority;

// @ts-expect-error Dependency tag definitions no longer carry a context type parameter.
type LegacyDefinition = EffectDependencyTag<MapContext>;

const legacyCallbackDefinition: EffectDependencyTag = {
  id: "effect:test.legacy-context",
  kind: "effect",
  // @ts-expect-error Legacy predicates cannot request the full MapContext.
  satisfies: (_context: MapContext) => true,
};

const legacyLedgerDefinition: EffectDependencyTag = {
  id: "effect:test.legacy-ledger",
  kind: "effect",
  // @ts-expect-error The satisfaction ledger remains executor-private.
  satisfies: (_evidence, _state: { satisfied: ReadonlySet<string> }) => true,
};

const asyncPredicateDefinition: EffectDependencyTag = {
  id: "effect:test.async-predicate",
  kind: "effect",
  // @ts-expect-error Dependency satisfaction is synchronous and returns an exact boolean.
  satisfies: async () => true,
};

const asyncDemoDefinition: EffectDependencyTag = {
  id: "effect:test.async-demo",
  kind: "effect",
  demo: {},
  // @ts-expect-error Demo admission is synchronous and returns an exact boolean.
  validateDemo: async () => true,
};

const explicitArtifactDefinition: EffectDependencyTag = {
  id: "artifact:test.explicit-bypass",
  // @ts-expect-error Artifact dependency definitions are generated from admitted authorities.
  kind: "artifact",
};

void definition;
void closedAuthority;
void legacyCallbackDefinition;
void legacyLedgerDefinition;
void asyncPredicateDefinition;
void asyncDemoDefinition;
void explicitArtifactDefinition;
void (undefined as unknown as LegacyDefinition);

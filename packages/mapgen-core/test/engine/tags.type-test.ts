import { defineArtifact, Type } from "@mapgen/authoring/index.js";
import type { MapContext } from "@mapgen/core/map-context.js";
import type { DependencyEvidence, DependencyTagDefinition } from "@mapgen/engine/index.js";

declare const evidence: DependencyEvidence;

evidence.verifyEffect();
// @ts-expect-error Effect evidence is bound to the tag whose predicate is being evaluated.
evidence.verifyEffect("effect:test.other");

const artifact = defineArtifact({
  name: "tagEvidence",
  id: "artifact:test.tag-evidence",
  schema: Type.Object({ value: Type.Number() }, { additionalProperties: false }),
});
const observation = evidence.observeArtifact(artifact);
function acceptNumber(value: number): true {
  void value;
  return true;
}
void (observation.found && acceptNumber(observation.value.value));

// @ts-expect-error Dependency predicates cannot reach runtime integration authority.
evidence.adapter;
// @ts-expect-error Dependency predicates cannot inspect admitted setup state.
evidence.setup;
// @ts-expect-error Dependency predicates cannot reach raw artifact storage.
evidence.artifacts;

const definition: DependencyTagDefinition = {
  id: "effect:test.ready",
  kind: "effect",
  satisfies: (postconditionEvidence) => {
    postconditionEvidence.verifyEffect();
    // @ts-expect-error Registered predicates receive evidence rather than the full MapContext.
    postconditionEvidence.trace;
    return true;
  },
};

// @ts-expect-error Dependency tag definitions no longer carry a context type parameter.
type LegacyDefinition = DependencyTagDefinition<MapContext>;

const legacyCallbackDefinition: DependencyTagDefinition = {
  id: "effect:test.legacy-context",
  kind: "effect",
  // @ts-expect-error Legacy predicates cannot request the full MapContext.
  satisfies: (_context: MapContext) => true,
};

const legacyLedgerDefinition: DependencyTagDefinition = {
  id: "effect:test.legacy-ledger",
  kind: "effect",
  // @ts-expect-error The satisfaction ledger remains executor-private.
  satisfies: (_evidence, _state: { satisfied: ReadonlySet<string> }) => true,
};

const asyncPredicateDefinition: DependencyTagDefinition = {
  id: "effect:test.async-predicate",
  kind: "effect",
  // @ts-expect-error Dependency satisfaction is synchronous and returns an exact boolean.
  satisfies: async () => true,
};

const asyncDemoDefinition: DependencyTagDefinition = {
  id: "effect:test.async-demo",
  kind: "effect",
  demo: {},
  // @ts-expect-error Demo admission is synchronous and returns an exact boolean.
  validateDemo: async () => true,
};

const explicitArtifactDefinition: DependencyTagDefinition = {
  id: "artifact:test.explicit-bypass",
  // @ts-expect-error Artifact dependency definitions are generated from admitted authorities.
  kind: "artifact",
};

void definition;
void legacyCallbackDefinition;
void legacyLedgerDefinition;
void asyncPredicateDefinition;
void asyncDemoDefinition;
void explicitArtifactDefinition;
void (undefined as unknown as LegacyDefinition);

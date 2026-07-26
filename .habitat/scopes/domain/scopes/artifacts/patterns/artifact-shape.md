# Artifact Shape

Status: active working reference

Subject:
any `*.artifact.ts` file directly under a domain `artifacts/` directory.

Applies to:
- `<domain>/artifacts/<artifact>.artifact.ts` within the MapGen domain
  blueprint.

Generalization:
- the admitted artifact blueprint rule
  `.habitat/blueprints/artifact/require_artifact_file_shape/` now enforces the
  stable artifact owner-file source shape across
  `mods/*/src/**/artifacts/*.artifact.ts`;
- this domain-scope pattern remains the domain blueprint's local expression of
  the same shape and its domain placement boundary.

Does not apply to:
- operation-local `contract.ts` files;
- recipe step `*.contract.ts` files;
- recipe or stage `artifacts.ts` registries;
- artifact directory `index.ts` aggregates, which have their own file-shape
  reference and must not define validation logic.

Required behavior:
- the file exposes exactly one canonical pipeline data-product artifact authority;
- the artifact value is defined by a file-local `Schema`;
- the artifact contract is exported as `artifact = defineArtifact(...)`;
- publish-time validation is exported as
  `validate = defineArtifactValidator(artifact, optionalLocalValidator)`;
- the contract owns validation rules for the artifact value; operation code
  owns call-site choice and contextual values, not reusable artifact-shape
  predicates.

Stable export surface:

```ts
export const Schema = ...;
export type Artifact = Static<typeof Schema>;
export const artifact = defineArtifact(...);
function validateLocal(
  value: unknown,
  context?: ArtifactValidationContext
): readonly ArtifactValidationIssue[];
export const validate = defineArtifactValidator(artifact, validateLocal);
```

The type export may be semantically named when that materially improves
call-site readability or generated declaration output. No other runtime export
is admitted. Callers that need semantic clarity should namespace-import the
contract module.

Validator shape:
- Core's constructor always projects structural issues from `artifact.schema`
  before invoking the optional local validator;
- the local validator owns only cardinality, relational, or domain laws and
  returns Core's readonly issue contract without mutating, normalizing, filling,
  repairing, or coercing the artifact payload;
- an empty issue list means publishable;
- contextual operation preconditions remain operation behavior and are not a
  second artifact-owner export.

Import boundary:
- runtime values may come only from MapGen contract/lib surfaces, static Civ7
  type and policy owners, or public domain contract/schema/policy/data surfaces;
- artifact owners do not import adapters, engines, recipes, private operation
  implementations, Node/browser APIs, or other artifact owner modules;
- dynamic imports and runtime re-export indirection are outside the kind.

Authority separation:
- this pattern defines the artifact contract file class, not any particular
  artifact payload, artifact id, field list, or domain migration decision;
- concrete artifact examples belong in packet evidence, focused fixtures, or
  tests that are explicitly labeled as examples;
- examples do not become part of this pattern unless first generalized into
  class-level structure or constraints.

Violation messages:
- artifact files without the canonical artifact authority or with competing exported authorities;
- any runtime export beyond stable `Schema`, `artifact`, and `validate`;
- additional exported artifact or validator authorities, direct TypeBox error
  projection, or local aliases/interfaces named `ArtifactValidationIssue` or
  `ValidationIssue`;
- validators that normalize, repair, or silently coerce payloads;
- operation implementation, strategy logic, or registries in artifact files;
- non-artifact files directly under a closed domain `artifacts/` directory;
- pattern authority that embeds one artifact's concrete payload shape, artifact
  id, domain-specific compatibility rule, or migration disposition as reusable
  law.

Enforcement:
Artifact blueprint Grit/source-shape gate over
`mods/*/src/**/artifacts/*.artifact.ts`, the artifact blueprint
structure rule, the typed artifact catalog, and package behavior tests for
validation and runtime behavior. Structure owns physical children; Grit
requires the artifact kind's canonical exports, closed imports, and lack of
competing or structural-validation authority. Shared domain schema vocabulary
lives under the owning domain model and has no artifact validation authority.
TypeScript owns artifact
factory provenance, exact Schema/validator binding, and the closed runtime
export surface for registered modules. Durable sibling-to-catalog completeness
waits for Habitat's first-class `blueprint.toml` membership capability rather
than a local source parser.

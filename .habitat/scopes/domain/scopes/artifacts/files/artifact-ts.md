# Artifact File

Status: active working reference

Subject:
`<domain>/artifacts/<artifact>.artifact.ts`

Role:
one pipeline data-product contract.

Required shape:
- one artifact contract per file;
- a file-local `Schema` defines the artifact payload contract;
- a file-local `artifact` export defines the artifact with
  `defineArtifact(...)`;
- a file-local `validate = defineArtifactValidator(artifact, ...)` export binds
  publish-time structural validation to the exact artifact schema;
- supporting types exist only to express that artifact contract.

Allowed contents:
- artifact contract definition;
- artifact-local schema declarations;
- artifact-local type declarations;
- artifact-local cardinality, relational, and domain validation helpers;
- small private helper functions used only by schema construction or validation.

Authority separation:
- this file reference defines the allowed shape for any domain artifact file;
- concrete artifact ids, payload fields, generated examples, and migration
  dispositions are not part of this file reference unless generalized into the
  reusable file shape;
- artifact-specific examples belong in packet evidence, fixtures, or tests that
  are clearly labeled as examples.

Violation messages:
- multiple artifact definitions;
- artifact registries;
- executable implementation logic unrelated to schema construction or validation;
- direct TypeBox error projection or a complete validator not constructed by
  Core's schema-bound artifact validator;
- local aliases or interfaces named `ArtifactValidationIssue` or
  `ValidationIssue`;
- operation input normalization or repair logic;
- runtime exports beyond `Schema`, `artifact`, and `validate`;
- single-artifact example payloads encoded as file-shape requirements;
- narrative notes or markdown-equivalent content.

Import/export boundary:
- exports the artifact contract owner surface using stable per-file names:
  `Schema`, `artifact`, and required schema-bound `validate`;
- imports runtime values only from MapGen contract/lib surfaces, static Civ7
  types and policy, or public domain contract/schema/policy/data surfaces;
- does not import adapters, engines, recipes, private operation implementations,
  Node/browser APIs, or another artifact owner module;
- semantically named artifact types are allowed only when they improve call-site
  readability or generated declaration output;
- callers that need a semantic import name should namespace-import the module
  rather than require semantic function exports.

Enforcement:
domain structure for placement; artifact blueprint
`require_artifact_file_shape` for generalized file grammar.

Shared schema ownership:
- artifact-private schemas remain inline in the artifact owner;
- genuinely shared domain entity/schema primitives live under the owning
  domain's `model/schemas` surface;
- model schema files never own artifact validation, artifact setup, or artifact
  issue/context contracts.

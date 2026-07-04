# Artifact Contract File

Status: active working reference

Subject:
`<domain>/artifacts/contract/<artifact>.contract.ts`

Role:
one pipeline truth product contract.

Required shape:
- one artifact contract per file;
- a file-local `Schema` defines the artifact payload contract;
- a file-local `artifact` export defines the artifact with
  `defineArtifact(...)`;
- a file-local `validate` export owns publish-time artifact validation;
- a file-local `assert` export is optional and exists only for contextual
  operation-boundary preconditions that publish-time validation cannot know;
- supporting types exist only to express that artifact contract.

Allowed contents:
- artifact contract definition;
- artifact-local schema declarations;
- artifact-local type declarations;
- artifact-local validation and assertion helpers;
- small private helper functions used only by validation/assertion.

Violation messages:
- multiple artifact definitions;
- artifact registries;
- executable implementation logic unrelated to validation/assertion;
- operation input normalization or repair logic;
- semantically unique validation or assertion export names;
- narrative notes or markdown-equivalent content.

Import/export boundary:
- exports the artifact contract owner surface using stable per-file names:
  `Schema`, `artifact`, `validate`, and optional `assert`;
- semantically named artifact types are allowed only when they improve call-site
  readability or generated declaration output;
- callers that need a semantic import name should namespace-import the module
  rather than require semantic function exports.

Enforcement:
structure for placement; `patterns/artifact-contract-shape.md` for file
grammar.

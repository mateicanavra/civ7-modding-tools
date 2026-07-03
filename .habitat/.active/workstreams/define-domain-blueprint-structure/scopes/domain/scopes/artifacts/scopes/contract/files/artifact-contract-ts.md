# Artifact Contract File

Status: active working reference

Subject:
`<domain>/artifacts/contract/<artifact>.contract.ts`

Role:
one pipeline truth product contract.

Required shape:
- one artifact contract per file;
- artifact definition uses `defineArtifact(...)`;
- supporting schemas and types exist only to define that artifact contract.

Allowed contents:
- artifact contract definition;
- artifact-local schema and type declarations.

Violation messages:
- multiple artifact definitions;
- artifact registries;
- executable implementation logic;
- narrative notes or markdown-equivalent content.

Import/export boundary:
- exported as the artifact contract owner surface.

Enforcement:
structure for placement; Grit/source-shape for file grammar.

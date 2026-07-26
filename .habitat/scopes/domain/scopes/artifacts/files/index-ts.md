# Artifact Directory Index

Status: active working reference

Subject:
`<domain>/artifacts/index.ts`

Role:
directory-local aggregate for artifact owner modules.

Required shape:
- named-import `artifact` from every sibling `*.artifact.ts` owner under its
  catalog key;
- export the complete sibling set directly as
  `export const artifacts = defineArtifactCatalog({ ... })`;
- contain no artifact schema, artifact validation logic, operation behavior, or
  migration narrative.

Allowed contents:
- named artifact imports from sibling `*.artifact.ts` files;
- one `defineArtifactCatalog({ ... })` call over the sibling modules;
- the direct `artifacts` export.

Authority separation:
- each `*.artifact.ts` file owns one artifact's identity, private schema, and
  complete validation;
- `index.ts` owns the single direct artifact catalog;
- recipe/stage registries still own recipe topology and dependency wiring.

Violation messages:
- validator logic implemented in the index;
- artifact schema or `defineArtifact(...)` calls in the index;
- registry/dependency topology encoded in the index;
- imports from non-sibling artifact files;
- namespace imports or parallel contract, validator, or module maps that
  duplicate artifact authority.

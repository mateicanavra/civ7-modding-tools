# Artifact Directory Index

Status: active working reference

Subject:
`<domain>/artifacts/index.ts`

Role:
directory-local aggregate for artifact owner modules.

Required shape:
- namespace-import every sibling `*.artifact.ts` owner module;
- register the complete sibling set with one `defineArtifactCatalog` call;
- expose `catalog.modules` as `artifactModules` and `catalog.artifacts` as
  `artifacts`;
- contain no artifact schema, artifact validation logic, operation behavior, or
  migration narrative.

Allowed contents:
- imports from sibling `*.artifact.ts` files;
- one `defineArtifactCatalog({ ... })` call over the sibling modules;
- the derived `artifactModules` and `artifacts` exports;
- type-only helpers for those derived surfaces if needed.

Authority separation:
- `*.artifact.ts` files own artifact payload contracts and validation;
- `index.ts` owns the single module catalog and its two derived public surfaces;
- recipe/stage registries still own recipe topology and dependency wiring.

Violation messages:
- validator logic implemented in the index;
- artifact schema or `defineArtifact(...)` calls in the index;
- registry/dependency topology encoded in the index;
- imports from non-sibling artifact files;
- parallel `artifactContracts` or `validators` maps that duplicate catalog
  authority.

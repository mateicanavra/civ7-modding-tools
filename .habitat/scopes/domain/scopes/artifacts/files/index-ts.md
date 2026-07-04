# Artifact Directory Index

Status: active working reference

Subject:
`<domain>/artifacts/index.ts`

Role:
directory-local aggregate for artifact owner modules.

Required shape:
- namespace-import and re-export each sibling `*.artifact.ts` owner module;
- expose a plain object that groups artifact owner modules;
- expose a plain object that groups artifact owner validators;
- contain no artifact schema, artifact validation logic, operation behavior, or
  migration narrative.

Allowed contents:
- imports from sibling `*.artifact.ts` files;
- exports of imported artifact owner namespaces;
- `artifactContracts` and `validators` plain object aggregates;
- type-only helpers for those aggregates if needed.

Authority separation:
- `*.artifact.ts` files own artifact payload contracts and validation;
- `index.ts` owns ergonomic import shape only;
- recipe/stage registries still own recipe topology and dependency wiring.

Violation messages:
- validator logic implemented in the index;
- artifact schema or `defineArtifact(...)` calls in the index;
- registry/dependency topology encoded in the index;
- imports from non-sibling artifact files.

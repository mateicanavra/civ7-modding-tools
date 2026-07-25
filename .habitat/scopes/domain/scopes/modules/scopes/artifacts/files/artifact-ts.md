# Module Artifact File

Status: active working reference

Subject:
`<domain>/modules/<module>/artifacts/<artifact>.artifact.ts`

Role:
one canonical immutable data-product authority.

Required shape:

- exports only `artifact = defineArtifact(...)` as runtime authority;
- defines the complete payload schema directly in `schema: Type.*(...)`;
- defines any relational or domain refinement directly in `refine`;
- composes only smaller model atoms rather than borrowing another owner's
  complete payload schema.

Core owns structural TypeBox admission and issue aggregation. The artifact file
does not project TypeBox errors, declare competing issue types, implement
operations, call adapters, import recipes, or depend on another artifact owner.

Executable authority:
`.habitat/blueprints/artifact/require_artifact_file_shape/`.

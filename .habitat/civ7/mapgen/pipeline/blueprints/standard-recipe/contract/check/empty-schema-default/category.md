# Prohibit Empty Object Defaults In Contract Schemas

Subject ID: `empty-schema-default`

Title: Prohibit Empty Object Defaults In Contract Schemas

Blueprint: `standard-recipe`

Primary category: `contract`

Secondary categories: `policy`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/pipeline/blueprints/standard-recipe/contract/check/empty-schema-default`

Files:
- `empty-schema-default.baseline.json`
- `empty-schema-default.pattern.md`
- `empty-schema-default.rule.json`
- `empty-schema-default.rule.mjs`

Evidence: The pattern forbids empty object defaults in contract schema definitions.

Notes:
- Could become policy if the schema rule is narrowed to semantic config meaning.

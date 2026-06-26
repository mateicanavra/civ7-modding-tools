# empty-schema-default

Blueprint: `standard-pipeline`

Primary category: `contract`

Secondary categories: `policy`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/blueprints/standard-pipeline/contract/check/empty-schema-default`

Files:
- `empty-schema-default.baseline.json`
- `empty-schema-default.pattern.md`
- `empty-schema-default.rule.json`
- `empty-schema-default.rule.mjs`

Evidence: The pattern forbids empty object defaults in contract schema definitions.

Notes:
- Could become policy if the schema rule is narrowed to semantic config meaning.

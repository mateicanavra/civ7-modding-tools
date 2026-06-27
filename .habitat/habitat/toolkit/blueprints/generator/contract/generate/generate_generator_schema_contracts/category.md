# Generate Generator Schema Contracts

Subject ID: `generate_generator_schema_contracts`

Title: Generate Generator Schema Contracts

Blueprint: `generator`

Primary category: `contract`

Secondary categories: `artifact`

Artifact kind: `generate`

Lifecycle: `steady`

Admission: `provisional`

Authority path: `.habitat/habitat/toolkit/blueprints/generator/contract/generate/generate_generator_schema_contracts`

Files:
- `generate_generator_schema_contracts.generate.ts`
- `generate_generator_schema_contracts.operation.md`
- `scaffold-pattern.schema.json`
- `scaffold-project.schema.json`

Evidence: The operation materializes committed Nx generator JSON schemas from Habitat Toolkit TypeBox schemas consumed by `tools/habitat/generators.json`.

Notes:
- Generate operation identity is provisional until typed operation manifests exist.
- The generated schema JSON files remain committed because Nx generator metadata consumes JSON schemas directly.

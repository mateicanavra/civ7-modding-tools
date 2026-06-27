# Generate Generator Schema Contracts

This operation writes the committed JSON schemas consumed by `tools/habitat/generators.json`.

## Inputs

- `tools/habitat/src/generators/scaffold/project/support/schema.ts`
- `tools/habitat/src/generators/scaffold/pattern/support/schema.ts`

## Outputs

- `.habitat/habitat/toolkit/blueprints/generator/contract/generate/generate_generator_schema_contracts/scaffold-project.schema.json`
- `.habitat/habitat/toolkit/blueprints/generator/contract/generate/generate_generator_schema_contracts/scaffold-pattern.schema.json`

## Command

```bash
bun run --cwd tools/habitat generate:schemas
```

The writer is intentionally scoped to these two schema outputs.

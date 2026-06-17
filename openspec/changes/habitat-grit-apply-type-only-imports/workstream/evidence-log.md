# Evidence Log - Type-Only Import Owner Disposition

## ATOI-BIOME-AUTHORITY-2026-06-16

- **Class:** semantic owner authority.
- **Command:** `bunx --no-install biome explain useImportType`
- **Result:** exit 0. Biome reports `lint/style/useImportType` as recommended,
  default `warn`, and safe-fix capable. The rule promotes `import type` for
  imports used only as types and groups inline type imports.
- **Important caveat:** Biome documents a TypeScript experimental-decorator
  caveat because decorator-generated code may use a type annotation as a
  runtime value. That caveat remains a future Biome/Habitat policy input, not a
  Grit apply proof.

## ATOI-BIOME-INVENTORY-2026-06-16

- **Class:** current semantic lint inventory.
- **Command:** `bunx --no-install biome lint --only=style/useImportType --reporter=summary .`
- **Result:** exit 0. Biome checked 2,431 files and reported 242
  `lint/style/useImportType` warnings with no fixes applied.
- **Disposition:** This proves the import-hygiene work is product-relevant, but
  it also proves Biome already identifies the semantic class. This row does not
  enable the rule or apply fixes.

## ATOI-IMPORT-SHAPE-INVENTORY-2026-06-16

- **Class:** TypeScript parser inventory / Grit-owner rejection.
- **Command:** inline Node/TypeScript parser inventory over `packages`, `mods`,
  `apps`, and `tools`, skipping `node_modules`, `.git`, `dist`, `mod`, `.nx`,
  and `generated`.
- **Result:** exit 0. Inventory counted 2,264 `.ts`/`.tsx` files, 7,430 import
  declarations with import clauses, 10 side-effect imports, 1,089 already
  type-only imports, 5,281 named-only value imports, 1,060 default-or-namespace
  value imports, and 0 parse diagnostics.
- **Grit-owner evidence:** sample named value imports include runtime Node
  imports such as `spawnSync`, `cpSync`, `existsSync`, `join`, and `resolve`.
  Syntax or name matching alone would be unsafe.

## Local Validation

- `bun run openspec -- validate habitat-grit-apply-type-only-imports --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git ls-files --deleted`

## Non-Claims

- No active Grit rule, native Grit fixture, Grit baseline, or injected probe.
- No Habitat apply registration, source remediation, safe-write proof, or
  product/runtime proof.
- No Biome configuration or policy change.
- No broad type-only import closure.

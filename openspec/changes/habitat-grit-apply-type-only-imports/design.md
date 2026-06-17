# Design - Type-Only Import Owner Disposition

## Frame

### Objective

Close the `habitat-grit-apply-type-only-imports` candidate as a Grit owner
disposition: broad value-to-type import conversion belongs to semantic
Biome/TypeScript tooling, not a syntax-only Grit apply pattern.

### Product Movement

Future agents should preserve the runtime-dependency invariant without creating
an unsafe import rewrite. The durable record should say where this work belongs,
what evidence proves that routing, and what remains unclaimed.

### Selection

- Candidate id: `habitat-grit-apply-type-only-imports`
- Owner disposition: Biome/TypeScript semantic lint/fix, not Grit apply
- Biome rule: `lint/style/useImportType`
- HG row outcome: candidate disposition and proof-record alignment

### Hard Core

1. Biome's `useImportType` rule is recommended, has a safe fix, and explicitly
   checks imports used only as types.
2. The rule groups inline type imports and documents TypeScript
   `verbatimModuleSyntax` as the compatible compiler posture for preserving
   unmarked value imports.
3. The rule has a documented caveat for experimental decorators because a type
   annotation may imply generated runtime value use.
4. A broad Grit pattern can match named import syntax, but it cannot determine
   semantic usage without a separate TypeScript usage proof.
5. Current repository inventory contains thousands of named-only value imports
   and many examples that are real runtime values, so name-based or syntax-only
   conversion is unsafe.

### Exterior

- Enabling or changing Biome configuration.
- Source import rewrites.
- Habitat `habitat fix` registration.
- Grit apply pattern authoring.
- Package-wide typecheck/product proof after import rewrites.
- Decorator-specific semantic disposition.

### Falsifier

This disposition fails if a Grit pattern can be shown to safely distinguish
type-only usage across the selected roots without relying on name guessing, or
if Biome no longer owns a safe semantic fixer for the rule class.

## Source Synthesis

`biome explain useImportType` reports the rule as `lint/style/useImportType`,
recommended, default `warn`, and safe-fix capable. Its description says it
promotes `import type` for imports used only as types, groups inline type
imports, and recommends `verbatimModuleSyntax` when relying on non-TypeScript
compilers to preserve runtime imports.

The same rule documentation records an experimental-decorator caveat: Biome
does not know whether decorator-generated code uses a type annotation as a
runtime value. That caveat is exactly the kind of semantic boundary a broad
Grit apply row cannot resolve from syntax alone.

`biome.json` does not currently enable `useImportType`, and this checkpoint does
not change Biome policy. The current repository scan with
`biome lint --only=style/useImportType --reporter=summary .` reports 242
warnings, proving there is useful product work here. That work should be framed
as a Biome/Habitat hygiene slice with explicit compiler/decorator policy, not as
an HG Grit apply row.

The TypeScript parser inventory scanned `packages`, `mods`, `apps`, and
`tools`, counted 2,264 `.ts`/`.tsx` files, 7,430 import declarations with import
clauses, 1,089 already type-only imports, 5,281 named-only value imports, 1,060
default-or-namespace value imports, 10 side-effect imports, and 0 parse
diagnostics. Sample named value imports include Node runtime imports such as
`spawnSync`, `cpSync`, `existsSync`, `join`, and `resolve`, demonstrating that
named import syntax alone is not a safe conversion signal.

## Fixture And Inventory Matrix

| Class | Expected behavior |
| --- | --- |
| Import used only as a TypeScript type | Biome `useImportType` can report and safely fix when the rule is enabled for the selected scope |
| Named import used as a runtime value | Must remain a value import; broad Grit conversion would be unsafe |
| `typeof` value query or mixed value/type import | Requires semantic usage classification, not name-only matching |
| Decorator-relevant type annotation | Requires repo policy because Biome documents a runtime-value caveat |
| Side-effect import | Not a candidate for type-only conversion |
| Grit apply broad conversion | Rejected for this row unless a future narrow slice proves TypeScript usage and safe writes |

## Proof Contract

This checkpoint may record:

- `ATOI-BIOME-AUTHORITY-2026-06-16`: Biome rule authority for the semantic
  fixer and its caveats.
- `ATOI-BIOME-INVENTORY-2026-06-16`: current repository `useImportType`
  warning inventory.
- `ATOI-IMPORT-SHAPE-INVENTORY-2026-06-16`: TypeScript parser inventory proving
  the scale of named value imports and the unsafe nature of syntax-only
  conversion.

This checkpoint must not record:

- active Grit rule proof;
- native Grit fixture proof;
- Habitat wrapper/current-tree proof;
- Grit or Habitat apply registration;
- source remediation;
- baseline or injected probe proof;
- apply safety;
- broad type-only import closure;
- product/runtime proof.

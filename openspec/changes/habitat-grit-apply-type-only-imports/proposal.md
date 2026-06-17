## Why

`habitat-grit-apply-type-only-imports` was listed as a candidate Grit apply
row for converting value imports to `import type` where usage is provably
type-only. Current authority review shows that the safe owner is Biome's
semantic `useImportType` rule, not a broad Grit codemod.

The product invariant remains valid: type-only imports should not create
runtime module dependencies. The implementation path must be semantic, because
a syntax-only Grit rewrite cannot know whether a named import is used as a
runtime value, a `typeof` value, a decorator-relevant type, or a pure type.

## Target Authority Refs

- `biome explain useImportType`
- `biome.json`
- TypeScript import semantics
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`

## What Changes

- Record `habitat-grit-apply-type-only-imports` as an owner-disposition
  checkpoint: route broad type-only import conversion to Biome/TypeScript
  semantic tooling rather than a Grit apply row.
- Record deterministic evidence that Biome already reports this exact class and
  offers a safe fix, while the current repository contains many named value
  imports that cannot be converted by name or syntax alone.
- Realign the corpus and aggregate proof records so future HG work does not
  reopen this as a broad Grit codemod without a narrower semantic proof.

## What Does Not Change

- No active Grit pattern is added.
- No `habitat fix` or Habitat apply registration is added.
- No source imports are rewritten.
- No Biome rule configuration is changed.
- No wrapper/current-tree Habitat rule proof, Grit baseline, injected probe,
  source remediation, apply safety, product/runtime proof, or broad import
  hygiene closure is claimed.

## Owner Boundary

This workstream owns the HG candidate disposition only. A future Biome/Habitat
workstream may enable or wrap `lint/style/useImportType` with repo-specific
scope, `verbatimModuleSyntax` posture, decorator caveat disposition, and
package checks. A future Grit row may only reopen this if it is a deliberately
narrow syntax class backed by TypeScript usage proof and safe-write evidence.

## Verification Gates

- `bunx --no-install biome explain useImportType`
- `bunx --no-install biome lint --only=style/useImportType --reporter=summary .`
- deterministic TypeScript parser inventory over `packages`, `mods`, `apps`,
  and `tools`
- `bun run openspec -- validate habitat-grit-apply-type-only-imports --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git ls-files --deleted`

## Why

The Pattern Authority generator can now register advisory and non-hook
enforced Grit rules, while pre-commit hook-scoped generated promotion remains
blocked. The missing owner-layer behavior is in the hook/check execution
surface: staged Grit execution must consume explicit rule-pack
`hookScope: "pre-commit"` metadata as a selection contract instead of treating
metadata as self-activating or running every registered Grit rule over staged
files.

This change makes hook execution truthful for generated hook-scoped patterns:
pre-commit selects only hook-scoped Grit rules and scans only exact staged
eligible paths that remain inside the accepted Grit adapter scan roots.

## Target Authority Refs

- `openspec/changes/habitat-git-hook-hardening/**`
- `openspec/changes/habitat-pattern-generator-metadata-repair/**`
- `tools/habitat-harness/src/lib/hooks.ts`
- `tools/habitat-harness/src/lib/command-engine.ts`
- `tools/habitat-harness/src/lib/grit.ts`
- `tools/habitat-harness/src/rules/rules.json`

## What Changes

- Route pre-commit staged Grit execution through the Habitat check engine
  instead of direct hook-local native Grit parsing.
- In staged check mode, run only Grit rules whose rule-pack entry declares
  `hookScope: "pre-commit"`.
- Limit staged Grit scan roots to exact staged JavaScript/TypeScript files that
  are inside the accepted Grit adapter scan roots.
- Keep JavaScript/TypeScript files outside approved Grit roots eligible for
  Biome while excluding them from hook-scoped Grit execution.
- Preserve hook fail-closed handling for malformed native Grit output, adapter
  parser failures, and normalized Grit findings.

## What Does Not Change

- No generator lifecycle semantics change.
- No baseline creation, mutation, or shrink policy change.
- No HG row semantic proof.
- No generated outputs, product/runtime Civ7 behavior, or CI authority proof.
- No claim that Pattern Authority metadata alone activates pre-commit hooks;
  hook execution must consume the rule-pack hook-scope contract.

## Verification Gates

- `bun run --cwd tools/habitat-harness test -- hooks.test.ts rule-selection.test.ts`
- `bun run --cwd tools/habitat-harness check`
- Controlled staged current-tree hook proof for a hook-scoped Grit rule
- `bun run openspec -- validate habitat-hook-generated-pattern-scope --strict`
- `bun run openspec:validate`
- `git diff --check`

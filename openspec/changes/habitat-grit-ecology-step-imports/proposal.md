## Why

`habitat-grit-ecology-step-imports` closes the mismatch between the active
Habitat rule text and its package-owned executable test. The rule already says
ecology steps must not deep-import ecology ops/rules and must not resurrect
retired ecology topology directories; before this row the test only proved the
retired-directory half.

Ecology recipe steps should compose through declared contracts and public
domain surfaces. Direct `@mapgen/domain/ecology/ops` or
`@mapgen/domain/ecology/rules` imports in step code bypass that owner layer.

## Target Authority Refs

- `tools/habitat-harness/src/rules/rules.json`
- `mods/mod-swooper-maps/AGENTS.md`
- `mods/mod-swooper-maps/package.json`
- `mods/mod-swooper-maps/test/ecology/ecology-step-import-guardrails.test.ts`
- `docs/projects/pipeline-realism/milestones/M2-ecology-architecture-alignment.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`

## What Changes

- Repair the package-owned `arch-test-ecology-step-imports` test so it scans
  active ecology stage source for static imports and re-exports from
  `@mapgen/domain/ecology/ops` and `@mapgen/domain/ecology/rules`.
- Keep the existing retired ecology topology directory proof.
- Record current ecology stage inventory, Habitat per-rule wrapper proof,
  aggregate wrapped-test disposition, baseline ownership, and OpenSpec record
  truth for this row.

## What Does Not Change

- No active Grit check is registered for ecology step imports.
- No Grit baseline or injected Grit probe is added.
- No source remediation is needed; current source has zero findings.
- No dynamic import, source-string, export-map, or product/runtime proof is
  claimed.
- No Swooper generated-output freshness ownership is claimed by this ecology
  row; aggregate wrapped-test success is inherited from accepted downstack
  freshness/enforcement repair.

## Owner Boundary

This workstream owns the package architecture test and Habitat wrapped-test
proof for ecology step import/topology guardrails. It does not own broad domain
import normalization, generated output, Grit rule registration, or runtime
product acceptance.

## Verification Gates

- `nx run mod-swooper-maps:test:architecture-ecology-step-imports --outputStyle=static`
- `bun run habitat:check -- --json --rule arch-test-ecology-step-imports`
- `bun run habitat:check -- --json --tool wrapped-test`
- deterministic ecology stage import/topology inventory
- deterministic wrapped-test baseline inventory
- `bun run openspec -- validate habitat-grit-ecology-step-imports --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git ls-files --deleted`

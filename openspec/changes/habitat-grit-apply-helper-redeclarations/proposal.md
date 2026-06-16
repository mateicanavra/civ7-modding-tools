## Why

`grit-runtime-helper-redeclarations` found three live Swooper domain-strategy
`clamp01` helper redeclarations. Leaving them as a permanent blocker weakens the
runtime-purity guard: future agents need the active check to stay executable
without local helper drift.

This row remediates those exact helper bodies and proves the replacement shape.
It keeps the apply ownership narrow: exact `clamp01` helpers are replaced with
canonical MapGen core helpers, and the non-finite variant rewrites call sites to
explicit `clampPct(value, 0, 1, 0)` calls so `NaN` and infinities preserve the
old fallback-to-zero behavior.

## What Changes

- Add `helper_redeclarations_to_imports` as a row-owned Grit apply pattern.
- Remediate the three live Swooper domain strategy helper redeclarations.
- Keep `habitat fix` registration unchanged because the current apply adapter
  accepts a single apply workflow argument and this row does not repair that
  shared adapter surface.
- Realign the runtime-helper records so the live-candidate blocker is resolved
  by this source-owner/apply checkpoint.

## What Does Not Change

- No new active `grit-check` rule is added.
- No Habitat `habitat fix` registration is added for this apply pattern.
- No baseline or injected probe is added for the apply pattern.
- No generated output, lockfile, or Civ7 runtime artifact is edited.
- No claim is made for arbitrary helper bodies, exported helpers, no-import
  files, `clampChance`, `normalizeRange`, or `rollPercent` remediation.

## Verification Gates

- Native Grit fixture proof for `helper_redeclarations_to_imports`.
- Direct Grit exact-file dry-run and live-apply discovery for the three original
  live helpers, with final P1 source repair recorded.
- Representative behavior equivalence for finite, `NaN`, `Infinity`, and
  `-Infinity` values.
- Swooper package-local validation after building `@swooper/mapgen-core`.
- `grit-runtime-helper-redeclarations` Habitat wrapper proof returns clean.
- Parser inventory confirms zero remaining current-predicate helper
  redeclarations.
- OpenSpec validation, diff hygiene, deleted-file guard, and local Graphite
  commit.

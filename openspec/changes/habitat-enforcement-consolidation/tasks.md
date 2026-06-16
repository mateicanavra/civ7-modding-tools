## 1. Retirement Preconditions

- [x] 1.1 Build the retirement table: every mechanism slated for deletion ×
  its harness owner × parity evidence pointer (from H3/H5 phase records);
  each row MUST cite the H5 parity form (`empty/empty + probe-confirmed`, or
  identical non-empty finding sets); any row without evidence blocks. Owners
  per the corrected corpus: G2/G5/G8/G9/G10/G11 and the G3 runtime-value ban
  retire only against LOCKED grit equivalents; G3's project-edge context is
  the nx `kind:engine` tag rule; G6/G7 move habitat-native; G1
  milestone-prefixed recipe IDs remain original-owned until H6 ports them
  natively or keeps the original wrapped; no row may cite nx-boundaries as
  covering G10/G11 (they are intra-project; grit owns them).
- [x] 1.2 Decide and record: `bun run lint` becomes `habitat check` alias vs
  removed (default: alias, to keep muscle memory working).

## 2. Script And ESLint Retirement

- [x] 2.1 Move habitat-native survivors (workspace-entrypoints, G6/G7
  doc-sync, adr-lint, doc-ambiguity) into
  `tools/habitat-harness/src/rules/` as native TS rules; delete their
  `scripts/lint/` originals. `lint-mapgen-docs.py` is NOT rewritten in TS —
  it relocates (or stays in place) wrapped as-is per corpus disposition
  ("port py→TS only if touched").
- [x] 2.2 Delete or slim ported scripts (adapter-boundary,
  mapgen-recipe-imports, control-orpc-contract-ownership) and the ported
  guardrail families from the two big guardrail scripts, consuming H5's
  explicit enumeration: only the BOUNDARY-profile families of
  `lint-domain-refactor-guardrails.sh` (ops/adapter/context crossing,
  map projection/effect dependency keys, and domain-root config imports) are
  ported and retire here; the FULL-profile-only families (cross-domain deep
  imports, RNG/engine import bans, config-merge bans, JSDoc/schema,
  foundation/ecology special cases) stay wrapped unless separately ported;
  delete whole scripts only when fully emptied. Adapter-boundary broad
  provenance-string scanning requires an explicit H6 disposition before script
  deletion.
- [x] 2.3 Reduce `eslint.config.js` only after preserving all semantics:
  ported families retire to Grit/boundaries, and the value `export *`
  contract/public-surface guard must be absorbed into Grit (with
  `export type *` still allowed) or kept wrapped before `eslint.config.js`
  can be deleted. Remove
  `@typescript-eslint/*` deps only if truly unused; note
  `eslint.boundaries.config.mjs` may still require parser support.
- [x] 2.4 Disposition the suspected orphan data file
  `scripts/lint/no-legacy-m4-foundation-tokens.txt`: verify at execution time
  with a `git grep` whether consumers exist anywhere in the repo; delete only
  if no consumers remain, otherwise keep it and record the consumer evidence.

## 3. Test Dedup

- [x] 3.1 Retire `recipe-import-boundary.test.ts` citing its locked grit
  rule; slim `ecology-step-import-guardrails.test.ts` — retire the
  deep-import assertions (locked grit equivalent), KEEP the
  retired-stage-dirs-absent assertions (no grit/file rule covers directory
  absence); slim `core-purity.test.ts` to runtime-value semantics.
- [x] 3.2 Confirm kept tests (rng-authority, m11 band, bundle-runtime) still
  run in their suites.

## 4. Single-Path Wiring

- [x] 4.1 Historical H6 target was to re-point root `check` and
  `ci:architecture-strict-core` to `habitat verify`; current recovery truth is
  superseded by `habitat-enforcement-surface-cleanup`: root `check` is a
  build/check/lint/test/verify Nx aggregate, root `lint` carries Habitat checks,
  root `verify` runs package-owned verifier targets, and strict-core remains a
  direct diagnostic alias.
- [x] 4.2 Docs/AGENTS sweep for retired-script references.

## 5. Verification And Closure

- [x] 5.1 Per-retired-RULE probe matrix: every retirement-table row gets a
  probe entry (probe file path, injected violation, expected harness rule id)
  demonstrating the replacement rule catches what the retired mechanism
  caught; probes fail through the harness, matrix recorded in the phase
  record, probes removed.
- [x] 5.2 `bun run build && bun run check && bun run test` green; CI
  observation remains post-submission; `git grep` shows no stale active
  references.
- [x] 5.3 `bun run openspec -- validate habitat-enforcement-consolidation
  --strict`; realignment + closure per workstream record.

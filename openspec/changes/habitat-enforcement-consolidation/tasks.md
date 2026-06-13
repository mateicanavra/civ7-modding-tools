## 1. Retirement Preconditions

- [ ] 1.1 Build the retirement table: every mechanism slated for deletion ×
  its harness owner × parity evidence pointer (from H3/H5 phase records);
  each row MUST cite the H5 parity form (`empty/empty + probe-confirmed`, or
  identical non-empty finding sets); any row without evidence blocks. Owners
  per the corrected corpus: G1/G2/G5/G8/G9/G10/G11 and the G3 runtime-value
  ban retire only against LOCKED grit equivalents (H5 ports all of them);
  G3's project-edge context is the nx `kind:engine` tag rule; G6/G7 move
  habitat-native; no row may cite nx-boundaries as covering G10/G11 (they
  are intra-project; grit owns them).
- [ ] 1.2 Decide and record: `bun run lint` becomes `habitat check` alias vs
  removed (default: alias, to keep muscle memory working).

## 2. Script And ESLint Retirement

- [ ] 2.1 Move habitat-native survivors (workspace-entrypoints, G6/G7
  doc-sync, adr-lint, doc-ambiguity) into
  `tools/habitat-harness/src/rules/` as native TS rules; delete their
  `scripts/lint/` originals. `lint-mapgen-docs.py` is NOT rewritten in TS —
  it relocates (or stays in place) wrapped as-is per corpus disposition
  ("port py→TS only if touched").
- [ ] 2.2 Delete ported scripts (adapter-boundary, mapgen-recipe-imports,
  control-orpc-contract-ownership) and the ported guardrail families from the
  two big guardrail scripts, consuming H5's explicit enumeration: only the
  BOUNDARY-profile families of `lint-domain-refactor-guardrails.sh`
  (ops-import bans, cross-domain deep imports, RNG/engine import bans) are
  ported and retire here; the FULL-profile-only families (JSDoc presence,
  schema descriptions, config-merge bans) stay wrapped and MUST NOT be
  deleted; delete whole scripts only when fully emptied.
- [ ] 2.3 Delete `eslint.config.js`; remove `@typescript-eslint/*` deps if now
  unused; confirm `eslint.boundaries.config.mjs` is the only ESLint surface.
- [ ] 2.4 Disposition the orphan data file
  `scripts/lint/no-legacy-m4-foundation-tokens.txt`: verify at execution time
  with a `git grep` that no consumer exists anywhere in the repo, then delete
  it in the sweep with that evidence recorded in the phase record.

## 3. Test Dedup

- [ ] 3.1 Retire `recipe-import-boundary.test.ts` citing its locked grit
  rule; slim `ecology-step-import-guardrails.test.ts` — retire the
  deep-import assertions (locked grit equivalent), KEEP the
  retired-stage-dirs-absent assertions (no grit/file rule covers directory
  absence); slim `core-purity.test.ts` to runtime-value semantics.
- [ ] 3.2 Confirm kept tests (rng-authority, m11 band, bundle-runtime) still
  run in their suites.

## 4. Single-Path Wiring

- [ ] 4.1 Re-point root `check` and `ci:architecture-strict-core` to
  `habitat verify`; CI uploads habitat JSON diagnostics; record CI timing vs
  the retired aggregate (stop-condition bound: ≤ 1.25× the retired
  aggregate's wall-clock on CI; both timings in the phase record).
- [ ] 4.2 Docs/AGENTS sweep for retired-script references.

## 5. Verification And Closure

- [ ] 5.1 Per-retired-RULE probe matrix: every retirement-table row gets a
  probe entry (probe file path, injected violation, expected harness rule id)
  demonstrating the replacement rule catches what the retired mechanism
  caught; probes fail through the harness, matrix recorded in the phase
  record, probes removed.
- [ ] 5.2 `bun run build && bun run check && bun run test` green; CI green;
  `git grep` shows no stale references.
- [ ] 5.3 `bun run openspec -- validate habitat-enforcement-consolidation
  --strict`; realignment + closure per workstream record.

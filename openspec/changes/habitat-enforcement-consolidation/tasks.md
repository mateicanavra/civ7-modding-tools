## 1. Retirement Preconditions

- [ ] 1.1 Build the retirement table: every mechanism slated for deletion ×
  its harness owner × parity evidence pointer (from H3/H5 phase records);
  any row without evidence blocks.
- [ ] 1.2 Decide and record: `bun run lint` becomes `habitat check` alias vs
  removed (default: alias, to keep muscle memory working).

## 2. Script And ESLint Retirement

- [ ] 2.1 Move habitat-native survivors (workspace-entrypoints, G6/G7
  doc-sync, adr-lint, doc-ambiguity, mapgen-docs) into
  `tools/habitat-harness/src/rules/` as native TS rules; delete their
  `scripts/lint/` originals.
- [ ] 2.2 Delete ported scripts (adapter-boundary, mapgen-recipe-imports,
  control-orpc-contract-ownership) and the ported guardrail families from the
  two big guardrail scripts; delete whole scripts when emptied.
- [ ] 2.3 Delete `eslint.config.js`; remove `@typescript-eslint/*` deps if now
  unused; confirm `eslint.boundaries.config.mjs` is the only ESLint surface.

## 3. Test Dedup

- [ ] 3.1 Retire `recipe-import-boundary.test.ts` and
  `ecology-step-import-guardrails.test.ts` citing locked grit rules; slim
  `core-purity.test.ts` to runtime-value semantics.
- [ ] 3.2 Confirm kept tests (rng-authority, m11 band, bundle-runtime) still
  run in their suites.

## 4. Single-Path Wiring

- [ ] 4.1 Re-point root `check` and `ci:architecture-strict-core` to
  `habitat verify`; CI uploads habitat JSON diagnostics; record CI timing vs
  the retired aggregate (stop-condition threshold).
- [ ] 4.2 Docs/AGENTS sweep for retired-script references.

## 5. Verification And Closure

- [ ] 5.1 Per-family synthetic-violation probes fail through the harness;
  probes removed.
- [ ] 5.2 `bun run build && bun run check && bun run test` green; CI green;
  `git grep` shows no stale references.
- [ ] 5.3 `bun run openspec -- validate habitat-enforcement-consolidation
  --strict`; realignment + closure per workstream record.

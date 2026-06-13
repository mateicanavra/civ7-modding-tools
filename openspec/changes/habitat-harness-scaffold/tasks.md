## 1. Package And CLI Skeleton

- [ ] 1.1 Create `tools/habitat-harness` package (private,
  `@internal/habitat-harness`, bun-run TS, no build step) and register in the
  workspace; `bun install`.
- [ ] 1.2 Implement `src/bin/habitat.ts` command surface (`graph`, `classify`,
  `check`, `fix --dry-run`, `verify`, `hook` stub) with `lib/spawn.ts`
  argument-array spawning and `lib/diagnostics.ts` JSON schema.
- [ ] 1.3 Implement `lib/baseline.ts`: load/compare/shrink-only check,
  `--expand-baseline` gate, locked-rule semantics.

## 2. Rule Pack And Wraps

- [ ] 2.1 Implement `rules/architecture.ts` + `rules/messages.ts` with the
  invariant-record fields from design.md.
- [ ] 2.2 Wrap the five root-`check` lint scripts (workspace-entrypoints,
  domain-refactor-guardrails, mapgen-recipe-imports, normalization-guardrails,
  mapgen-docs) as rules with JSON diagnostics.
- [ ] 2.3 Wrap adapter-boundary (allowlist surfaced as reported-baselined
  diagnostics, allowlist file untouched), control-orpc-contract-ownership,
  adr-lint, doc-ambiguity (advisory lane, reusing its existing baseline).
- [ ] 2.4 Wrap `bun run lint` (ESLint) and the architecture test suites
  (`test:architecture-cutover`) as coarse-grained rules.
- [ ] 2.5 Add root scripts (`habitat`, `habitat:check`, `habitat:fix`,
  `habitat:verify`); wire `habitat verify` to check + nx affected targets.

## 3. Nx Plugin

- [ ] 3.1 Implement `src/plugin.ts` `createNodesV2` inferring `habitat:check`
  targets from rule scopes; register in `nx.json` with target-name options.
- [ ] 3.2 `bunx nx run-many -t habitat:check --all` green; target caching
  configured with rule-pack + baselines as inputs.

## 4. Verification And Closure

- [ ] 4.1 Clean-tree run: `bun run habitat check` green; `--json` output
  validates against the diagnostic schema; every corpus-wrapped rule present.
- [ ] 4.2 Synthetic-violation probe (scratch file breaking adapter boundary):
  fails with rule id + remediation message; remove probe.
- [ ] 4.3 Baseline shrink-only probe: hand-adding a baseline entry fails the
  self-check.
- [ ] 4.4 `bun run build && bun run check && bun run test` unchanged-green;
  CI uploads habitat JSON diagnostics artifact.
- [ ] 4.5 `bun run openspec -- validate habitat-harness-scaffold --strict`;
  realign docs (FRAME §7 pointer already exists; add harness README); close
  per workstream record.

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
- [ ] 2.4 Wrap `bun run lint` (ESLint) as a coarse-grained rule. Wrap the
  corpus §C six architecture tests with per-file invocations — each as
  `bun test <explicit test file path>` (they are NOT covered by
  `test:architecture-cutover`):
  `packages/mapgen-core/test/architecture/core-purity.test.ts`,
  `mods/mod-swooper-maps/test/pipeline/rng-authority-boundary.test.ts`,
  `mods/mod-swooper-maps/test/pipeline/recipe-import-boundary.test.ts`,
  `mods/mod-swooper-maps/test/ecology/ecology-step-import-guardrails.test.ts`,
  `mods/mod-swooper-maps/test/foundation/m11-projection-boundary-band.test.ts`,
  `mods/mod-swooper-maps/test/build/map-bundle-runtime-imports.test.ts`.
  Separately wrap `test:architecture-cutover` (coarse, 4 cutover tests) as its
  own wrapped rule.
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
- [ ] 4.2 Synthetic-violation probe matrix — one injected violation per
  wrapped family:
  (a) script family: a `/base-standard/` import outside
  `packages/civ7-adapter` → expect the wrapped adapter-boundary rule id fails;
  (b) ESLint family: a deep `@mapgen/domain/*/ops/*` import → expect the
  wrapped eslint lane fails;
  (c) architecture-test family: a Civ7 runtime ref in mapgen-core prod code →
  expect the wrapped core-purity suite fails.
  Each row records probe file path, injected violation, and expected rule
  id/failure text; matrix recorded in the phase record; probes reverted after
  capture.
- [ ] 4.3 Baseline shrink-only probe: hand-adding a baseline entry fails the
  self-check. CI-side probe: a commit adding an entry to an EXISTING rule's
  baseline must fail the self-check as run in CI (not only via the local CLI).
- [ ] 4.4 `bun run build && bun run check && bun run test` unchanged-green;
  CI uploads habitat JSON diagnostics artifact.
- [ ] 4.5 `bun run openspec -- validate habitat-harness-scaffold --strict`;
  realign docs (FRAME §7 pointer already exists; add harness README); close
  per workstream record.

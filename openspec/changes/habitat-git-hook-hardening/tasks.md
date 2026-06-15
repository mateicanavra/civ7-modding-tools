## 1. Design And Review Gate

- [x] 1.1 Open this packet with proposal, design, spec delta, tasks, phase
  record, source synthesis, review ledger, and downstream realignment ledger.
- [x] 1.2 Run product/outcome, hook transaction, resource publishing,
  Biome/Grit/Nx ownership, Effect/substrate, and evidence/system review lanes.
- [x] 1.3 Disposition every P1/P2 finding in
  `workstream/review-disposition-ledger.md`.
- [x] 1.4 Re-run
  `bun run openspec -- validate habitat-git-hook-hardening --strict`.

## 2. Source Refresh And Current Evidence

- [x] 2.1 Re-read takeover frame, `CLAIM-H7-HOOKS`,
  `CLAIM-P1-EFFECT-FIT`, H7 historical packet, resources-submodule docs,
  official Biome evidence, official Effect evidence, and current hook source.
- [x] 2.2 Inspect `.husky/**`, `tools/habitat-harness/src/lib/hooks.ts`,
  `tools/habitat-harness/src/commands/hook.ts`, hook command tests, and
  `scripts/civ7-resources/publish-submodule.sh`.
- [x] 2.3 Capture current evidence that pre-commit runs resource publishing
  before staged path collection and file-layer checks.
- [x] 2.4 Capture current evidence that the resources script may commit, push,
  and stage the monorepo submodule pointer.
- [x] 2.5 Refresh local Biome version and command behavior before implementation
  selects exact staged/write command contracts.
- [ ] 2.6 Refresh Effect package/runtime fit before implementation selects
  Effect or an equivalent hook transaction architecture.

## 3. Resource Publish Policy

- [x] 3.1 Implement the explicit resource publish command policy.
- [x] 3.2 Ensure default pre-commit cannot publish or push resources.
- [x] 3.3 Add dirty resources detection and clear remediation output for the
  explicit publish command path.
- [x] 3.4 Add resources state classification for `clean`, `not-configured`,
  `uninitialized`, `locked`, `dirty-submodule`, `unstaged-gitlink`, and
  `staged-gitlink`.
- [x] 3.5 Prove resource-state blocking happens before Biome format,
  formatter restage, Biome check, and Grit check.
- [x] 3.6 Remove implicit hook-driven resource publishing from default
  pre-commit.
- [x] 3.7 Update resources-submodule docs to match the accepted policy.

## 4. Hook Transaction Model

- [ ] 4.1 Model hook pre-state and post-state.
- [ ] 4.2 Preserve partial-staging refusal before formatting.
- [ ] 4.3 Preserve formatter-touched restage only.
- [ ] 4.4 Make Grit parse failure a failing proof class.
- [ ] 4.5 Record command provenance for Biome, Grit, Git, Nx, Bun, and resource
  publish commands where relevant.
- [ ] 4.6 Preserve CI-authority non-claims in output or docs.

## 5. Effect Substrate Decision

- [x] 5.1 Record the resource-policy checkpoint Effect decision: this slice
  does not introduce hook transaction orchestration and does not adopt Effect;
  full hook transaction architecture remains open.
- [ ] 5.2 If adopting Effect, add accepted dependency/runtime/service shape,
  hook service boundaries, package dependency surfaces, version pinning,
  package-manager-generated lockfile proof, and runtime-edge proof.
- [ ] 5.3 If rejecting Effect, add architecture proof for equivalent typed hook
  states, command provenance, service substitution, scoped cleanup, and tests.
- [ ] 5.4 Keep `Effect.run*` or runtime construction at hook/CLI/runtime adapter
  boundaries if Effect is adopted.

## 6. Tests

- [ ] 6.1 Add hook unit tests with fake Git, command runner, filesystem, clock,
  reporter, and resource publisher services where the accepted architecture
  supports service substitution.
- [x] 6.2 Add clean resources pre-commit test.
- [x] 6.3 Add dirty resources explicit publish refusal test.
- [x] 6.4 Add uninitialized resources, resources lock, unstaged gitlink, staged
  gitlink, and staged-gitlink-plus-dirty-submodule tests.
- [x] 6.5 Add generated-zone and pnpm artifact tests that prove no resources
  publish happened first.
- [x] 6.6 Add partially staged Biome-supported file test.
- [x] 6.7 Add formatter-touched restage and foreign staged path tests.
- [x] 6.8 Add Grit parse failure and Grit finding tests.
- [x] 6.9 Add pre-push Graphite parent and non-Graphite base tests.
- [x] 6.10 Add docs/guidance scan for stale hook-resource claims.

## 7. Downstream Realignment

- [x] 7.1 Update root AGENTS hook/resource guidance.
- [x] 7.2 Update `tools/habitat-harness/README.md`.
- [x] 7.3 Update `docs/process/resources-submodule.md`.
- [x] 7.4 Update `docs/projects/habitat-harness/recovery-claim-ledger.md`.
- [ ] 7.5 Update `openspec/changes/habitat-git-hooks/**` historical records so
  old H7 closure does not overclaim side-effect proof.
- [ ] 7.6 Update `habitat-pattern-generator-metadata-repair` or Grit pilot
  records only if hook-scope acceptance wording changes their dependencies.

## 8. Verification

- [x] 8.1 `bun run openspec -- validate habitat-git-hook-hardening --strict`
- [x] 8.2 `bun run openspec:validate`
- [x] 8.3 `git diff --check`
- [ ] 8.4 Hook unit/service test matrix
- [ ] 8.5 Pre-commit staged probe matrix
- [x] 8.6 Explicit resource publish policy proof across dirty submodule,
  uninitialized resources, locked resources, unstaged gitlink, staged gitlink,
  clean resources, and not-configured resources
- [x] 8.7 Pre-push base/range proof
- [x] 8.8 Root/dev `habitat hook` proof after command-surface repair is
  consumed
- [x] 8.9 README/AGENTS/resources docs stale guidance scan
- [ ] 8.10 Historical H7 record realignment
- [x] 8.11 Full-depth-language guardrail scan over this packet
- [x] 8.12 Resource-policy checkpoint Effect non-adoption decision proof, with
  dependency/version/lockfile proof left as a non-claim because Effect is not
  adopted in this slice

## 9. Closure

- [ ] 9.1 Record verification results and proof boundaries in
  `workstream/phase-record.md`.
- [ ] 9.2 Ensure review ledger has no unresolved accepted P1/P2 findings.
- [ ] 9.3 Ensure downstream realignment ledger is patched or has exact
  remaining actions.
- [ ] 9.4 Commit through Graphite with a clean worktree.

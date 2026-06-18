# Tasks

These tasks describe the later D11 implementation work after this packet is
accepted for design/specification. They do not authorize source edits while the
source implementation blockers named in this packet remain unresolved.

## 1. Preconditions And Public Surface Inventory

- [ ] 1.1 Read `$D11_SOURCE_PACKET`, `$D11_CHANGE/proposal.md`,
  `$D11_CHANGE/design.md`, this task list, and the accepted D0/D1/D3/D6/D7/D9/D10
  packets before source edits.
- [ ] 1.2 Inventory every touched D11 public or durable surface: `habitat hook`
  command names, help text, human output, exit semantics, `HookTrace`,
  `PreCommitTrace`, `PrePushTrace`, `HookCommandRecord`, exported hook types,
  `.husky/pre-commit`, `.husky/pre-push`, package exports, docs examples, and
  tests that pin hook behavior.
- [ ] 1.3 Cite concrete D0 matrix rows and D1 output/non-claim handling for
  each touched public surface before editing source. If a row is absent, keep
  source implementation blocked or preserve the legacy surface through a facade.
- [ ] 1.4 Confirm live upstream implementation facts needed by D11: D3 graph and
  affected-target facts, D6 staged diagnostic projections, D7
  `LocalFeedbackCheckProjection`, D9 local-feedback-safe transaction projection
  where surfaced, and D10 protected mutation projection.
- [ ] 1.5 Record the implementation write set and protected paths in the phase
  record before source edits. D11 may touch hook source/tests and adjacent docs
  only through D0/D1 compatibility; it must not edit D3/D6/D7/D9/D10 authority
  implementation as a shortcut.

## 2. Resource State And Hook Trace Model

- [ ] 2.1 Replace target resource decision logic with a discriminated
  `ResourcePreCommitDecision` or equivalent where commit allowance derives from
  the variant.
- [ ] 2.2 Preserve current `ResourceState`/`allowPreCommit` output only as a
  D0/D1-compatible facade when public compatibility requires it.
- [ ] 2.3 Add constructor/exhaustiveness tests proving refused resource variants
  cannot also allow commit.
- [ ] 2.4 Define the target local-feedback trace model with ordered stage
  outcomes, consumed authority identities, terminal outcome, recovery text where
  available, and D1 non-claims.
- [ ] 2.5 Project the target trace to legacy `HookTrace` fields only through
  explicit D0/D1 handling.

## 3. Pre-Commit Pipeline Slices

- [ ] 3.1 Implement stage-local results for resource decision, staged path
  selection, D7/D10 structural feedback, partial-staging decision, Biome
  formatting/checking, formatter restage, D6 diagnostic feedback, and terminal
  local feedback.
- [ ] 3.2 Consume D7 local-feedback-safe check projection for structural check
  outcomes. Do not parse D7 human output or `CheckReport` text as D11 authority.
- [ ] 3.3 Consume D10 protected/generated/forbidden mutation refusals directly
  or through D7 projection. Stop before Biome, Grit, publish, and restage when
  D10 authority refuses a path/action.
- [ ] 3.4 Keep partial-staging refusal before formatting, restaging, diagnostic
  checks, resource publish, and generated publish. Do not introduce stash,
  reset, checkout, or hidden worktree rewrite behavior.
- [ ] 3.5 Restage only formatter-touched staged candidate paths after Biome
  formatting. Add tests for unchanged staged paths, foreign staged paths,
  unstaged-only paths, and restage command failure.
- [ ] 3.6 Consume D6 staged diagnostic projections for Grit/native diagnostic
  local feedback. Any current regex/message parsing may exist only as a named
  compatibility bridge until live D6 projection consumption is implemented, and
  the bridge cannot be the final D11 target model.

## 4. D9 Transaction And D8 Eligibility Boundaries

- [ ] 4.1 If D11 surfaces apply/fix or transaction recovery local feedback,
  consume D9 local-feedback-safe transaction projection states and do not
  recompute apply safety from changed paths, diagnostic findings, dry-run
  output, or formatter output.
- [ ] 4.2 If hook-scope eligibility, pattern admission, or local-feedback
  admission is consumed, use the D8 accepted projection and record the exact
  projection field. Otherwise record D8 as non-consumed for this D11 source
  slice.
- [ ] 4.3 Keep G-HOST consumption transitive through accepted D9/D10 projections
  unless D11 directly edits host-owned declaration, protected-zone, generated
  path, or hook policy surfaces.

## 5. Pre-Push Pipeline Slices

- [ ] 5.1 Model pre-push base decision as explicit base, Graphite parent,
  merge-base candidate, literal-main local fallback, or blocked/unavailable
  authority according to the accepted design.
- [ ] 5.2 Consume D3 graph/target availability before reporting affected-target
  pass where D11 depends on graph or target facts.
- [ ] 5.3 Preserve native Nx affected command outcome as local feedback only.
  Nonzero affected command exit blocks local pass and does not become CI,
  Graphite, review, or graph authority.
- [ ] 5.4 Add tests for explicit base, Graphite parent, merge-base `main`,
  merge-base `origin/main`, literal-main local fallback with non-claims, D3
  graph refusal, target unavailable, and Nx affected command failure.

## 6. Public Compatibility, Documentation, And Wording

- [ ] 6.1 Replace target product/code terminology such as legacy hook authority wording with local
  feedback notice, local feedback trace, non-claim, command record, decision,
  diagnostic, transaction, receipt, or outcome terms.
- [ ] 6.2 Preserve existing public wording only through D0/D1 compatibility
  handling. Any replacement, versioning, facade, deprecation, or refusal must
  cite the concrete D0 row.
- [ ] 6.3 Update `.husky/*`, docs, examples, and command help only when D0/D1
  rows authorize the public-surface behavior.
- [ ] 6.4 Keep all source code references repo-relative or fixture-variable
  based in docs; do not introduce brittle host-local paths.

## 7. Later Implementation Validation

- [ ] 7.1 Run `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts`
  and add focused tests for every D11 stage variant, refusal, unavailable
  authority, and public compatibility projection touched by source edits.
- [ ] 7.2 Run non-executing help/command-surface tests. Do not use `habitat hook
  pre-commit --help` or any command shape that can execute a live hook as a help
  gate unless D0 explicitly defines that behavior.
- [ ] 7.3 Run hook command probes only in controlled fixtures with `git status
  --short --branch` before and after any command that can write, stage, or
  inspect the worktree.
- [ ] 7.4 Run `bun run openspec -- validate deep-habitat-d11-local-feedback
  --strict`, `bun run openspec:validate`, and `git diff --check`.
- [ ] 7.5 Record which validation commands prove behavior, which validate
  OpenSpec shape only, and which are non-claims.

## 8. Review And Closure

- [ ] 8.1 Run fresh final D11 rereview lanes after packet/control repair:
  domain/ontology, TypeScript/validation, OpenSpec/information, code/vendor
  topology, and cross-domino/product.
- [ ] 8.2 Repair every accepted P1/P2 finding before packet-index acceptance
  movement.
- [ ] 8.3 Keep D11 source implementation blocked until concrete D0 rows and live
  upstream projections exist for the touched surfaces.
- [ ] 8.4 Update downstream docs, tests, specs, packet index, and workstream
  records only after the current D11 packet state justifies the update.
- [ ] 8.5 Leave the Graphite layer clean and reviewable.

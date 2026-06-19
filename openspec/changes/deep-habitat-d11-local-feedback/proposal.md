# Proposal: D11 Local Feedback

## Path Variables

- `$WORKTREE`: active remediation worktree.
- `$HABITAT_TOOL`: `$WORKTREE/tools/habitat-harness`.
- `$D11_CHANGE`: `$WORKTREE/openspec/changes/deep-habitat-d11-local-feedback`.
- `$REMEDIATION_DIR`: `$WORKTREE/docs/projects/habitat-harness/openspec-remediation`.
- `$D11_SOURCE_PACKET`: `$WORKTREE/docs/projects/habitat-harness/phase2-workstream-packets/D11-local-feedback.md`.

## Summary

Specify D11 as the complete Local Feedback contract for Habitat hook behavior.
D11 owns the `habitat hook` local developer/agent feedback workflow, including
hook sequencing, staged-file handling, local feedback trace shape, resource
state handling, formatter restage policy, pre-push affected-target invocation,
and local-only recovery rendering.

D11 does not own structural check truth, diagnostic acquisition, protected-zone
policy, apply transaction safety, workspace graph truth, Graphite stack state,
CI status, review approval, or product/runtime correctness. It consumes bounded
upstream projections and turns them into local feedback that helps a human or
agent recover quickly before commit or push.

This packet now includes the bounded D11 source implementation layer. Hook-local
feedback is product-shaped, generic resource policy is optional/configured, and
process-only refactor scaffolding is removed from the active Habitat runtime and
package docs. Future D11 slices remain gated by the live dependency and D0/D1
compatibility rules named below.

## Authority

- Source domino packet: `$D11_SOURCE_PACKET`.
- Remediation frame: `$WORKTREE/docs/projects/habitat-harness/openspec-remediation-frame.md`.
- Packet index and accepted upstream status: `$REMEDIATION_DIR/packet-index.md`.
- Current hook implementation and tests as current-behavior input:
  `$HABITAT_TOOL/src/lib/hooks.ts`, `$HABITAT_TOOL/src/commands/hook.ts`, and
  `$HABITAT_TOOL/test/lib/hooks.test.ts`.
- Husky delegator surfaces: `$WORKTREE/.husky/pre-commit` and
  `$WORKTREE/.husky/pre-push`.
- Accepted design/specification inputs:
  - D0 Command Surface Inventory.
  - D1 Receipt And Command Record Boundary.
  - D3 Workspace Graph Boundary.
  - D6 Diagnostic Pattern Catalog.
  - D7 Structural Enforcement Pipeline.
  - D9 Transformation Transaction.
  - D10 Protected Zone Authority.
- Official/native tool behavior:
  - Husky runs native Git hook scripts and can be disabled by the user.
  - Biome CLI supports `--no-errors-on-unmatched` and hook recipes caution about
    staged-file handling.
  - Nx `affected` computes work from explicit `base` and `head` inputs.
  - Grit owns diagnostic and rewrite pattern execution; D11 does not parse raw
    Grit semantics when a D6/D7 projection exists.

## Product Scenario

A developer or agent runs a commit or push in a local checkout. Habitat hooks
should quickly report local repo-maintenance feedback: staged generated/protected
mutation refusals, structural check failures, staged diagnostic findings,
formatter drift, partial staging hazards, resource submodule problems, and
pre-push affected-target failures. The output must be recoverable and scoped:
hook success means only that the local hook workflow completed its configured
checks at that moment.

## What Changes

- Defines Local Feedback as the D11 owner and the only owner of hook sequencing,
  staged-file workflow, hook trace construction, hook human rendering, resource
  state local handling, formatter restage policy, and pre-push affected-target
  invocation.
- Defines D11's upstream consumption model:
  - D6 staged diagnostic projections for hook diagnostic/Grit local feedback.
  - D7 `LocalFeedbackCheckProjection` for structural check outcomes, including
    D6/D5/D10-origin labels carried through D7 without transferring ownership.
  - D9 local-feedback-safe transaction projection for apply/fix state when hook
    feedback needs to discuss transaction readiness or refusal.
  - D10/D7 protected-zone refusal projection for staged generated/protected
    mutation feedback.
  - D3 graph target/base facts for pre-push affected-target behavior.
  - D1 command/output boundary and local feedback trace vocabulary.
  - D0 compatibility rows for every touched hook, human-output, command,
    package export, generated help, script, docs, or example surface.
- Replaces current `ResourceState.kind` plus `allowPreCommit` boolean
  correlation with a discriminated resource decision where allowed behavior is
  derived from the variant.
- Treats current hook human output as a D0/D1 compatibility surface, not D11
  target language.
- Defines later implementation write set, protected paths, validation gates, and
  false-green stop conditions.

## What Does Not Change

- D11 does not redefine check report semantics, rule status, diagnostic
  identity, baseline authority, protected/generated-zone policy, apply
  transaction safety, workspace graph authority, or Graphite stack semantics.
- D11 does not add a broad command-record or artifact substrate.
- D11 does not authorize hidden stash behavior, unstaged hunk rewriting, broad
  restaging, direct generated-output edits, or hook bypass policy changes.
- D11 hook pass remains local feedback. CI, review approval,
  product/runtime correctness, safe apply completion, Graphite readiness,
  OpenSpec acceptance, and current-tree cleanliness each remain owned by their
  explicit command or workflow.

## Required Upstream Edges

| Upstream | D11 consumes | Prohibited inference |
| --- | --- | --- |
| D0 | Closed compatibility rows for hook command behavior, hook human output, generated help, `.husky` delegators, docs/examples, `runHook` export, and any trace/schema surface. | D11 cannot change or rename public surfaces without row citation and closed D0 handling. |
| D1 | `HookTrace` / `LocalFeedbackTrace`, local feedback family, command record boundaries, and public output compatibility handling. | D11 cannot keep authority-shaped wording as target language unless D0/D1 explicitly preserve it for a concrete surface. |
| D3 | Workspace graph/affected-target facts and graph-refusal states needed by pre-push affected behavior. | D11 cannot treat a no-op `nx affected` wrapper, missing graph facts, or unresolved target as hook success. |
| D6 | Staged diagnostic projections, diagnostic identity, adapter/projection/refusal outcomes, and D15 trigger conditions for unrepresentable diagnostic command observations. | D11 cannot parse raw Grit output, invent diagnostic meanings, or collapse D6 diagnostic feedback into D7 check projection. |
| D7 | `LocalFeedbackCheckProjection` for structural check outcomes, including selected rule summaries, failure/advisory counts, dependency/refusal labels, and recovery text. | D11 cannot parse D7 human output or reinterpret `CheckReport` internals as hook truth. |
| D9 | Local-feedback-safe transaction state when hook output references apply/fix behavior. | D11 cannot assert apply/write safety, rollback correctness, or transaction readiness from hook state alone. |
| D10 | Staged protected/generated/forbidden mutation decisions and recovery guidance, either directly through D10 consumer projection or carried through D7. | D11 cannot define path policy, downgrade refusal to warning-only, or equate staged guard refusal with generated freshness. |
| G-HOST | Host declarations only through D10/D9 projections where host-owned paths or host gates are touched. | D11 cannot hard-code host-specific path semantics into generic Local Feedback. |

## D6/D7 Dependency Clarification

D7 publishes D11-safe structural check projection, but D7 does not absorb D6
diagnostic ownership. D11 must name both relations whenever hook feedback renders
diagnostic/Grit results:

- D6 owns diagnostic identity, acquisition/projection/refusal states, adapter
  failure states, and staged diagnostic facts.
- D7 may carry D6-origin diagnostic labels inside
  `LocalFeedbackCheckProjection` only as a bounded consumer projection.
- D11 may render those labels as local feedback, but it may not inspect raw Grit
  output or infer diagnostic truth from D7 report internals.

## Public And Durable Surfaces

This D11 source layer relies on D0 rows for every touched surface from this
list, and future D11 changes must preserve that row-citation discipline:

- `.husky/pre-commit` and `.husky/pre-push` delegator behavior.
- `habitat hook [NAME]` command behavior, unsupported hook behavior, `--base`,
  Oclif help/generated help, and any new dry-run flag.
- Hook human stdout/stderr, including the current local feedback
  notice.
- `runHook` package export through `$HABITAT_TOOL/src/index.ts` and
  `$HABITAT_TOOL/src/lib/command-engine.ts`.
- Any exported or durable `HookTrace`, `PreCommitTrace`, `PrePushTrace`,
  `HookCommandRecord`, resource state, hook outcome, or local feedback trace
  shape.
- Docs/examples under repo docs, Habitat docs, process docs, or generated help
  that describe hook semantics.
- Script/Nx target output if hook behavior changes target invocation or
  reporting.

## Source Write Set

This D11 source layer may touch only these paths, with future changes still
gated by the dependency rules above where needed:

- `$HABITAT_TOOL/src/lib/hooks.ts` or D11-owned extracted hook modules under
  `$HABITAT_TOOL/src/lib/`.
- `$HABITAT_TOOL/src/commands/hook.ts` only for D0-backed command flags/help and
  command rendering.
- `$HABITAT_TOOL/src/lib/command-engine.ts` and `$HABITAT_TOOL/src/index.ts`
  only for D0/D1-compatible export routing.
- `$HABITAT_TOOL/test/lib/hooks.test.ts` and D11-owned focused hook tests.
- `$WORKTREE/.husky/pre-commit` and `$WORKTREE/.husky/pre-push` only if D0 rows
  authorize delegator changes.
- Adjacent docs/examples only when D0 rows classify the public guidance surface
  and the implementation changes accepted behavior.
- `$D11_CHANGE/**`, `$REMEDIATION_DIR/packet-index.md`, and D11 scratch/final
  review records for this design/specification layer.

Protected from D11 implementation: D6 diagnostic acquisition/projection logic,
D7 report construction and structural enforcement ownership, D9 transaction
behavior, D10/G-HOST path policy, D3 graph authority, D8 Pattern Governance,
D12 verify handoff, D13 generators, generated outputs, lockfiles, baselines,
resource submodule contents, and product/runtime Civ7 control code.

## Validation Gates

Design-time gates before D11 acceptance:

- D11 complete-standard wording audit over `$D11_CHANGE/**`,
  `$REMEDIATION_DIR/packet-index.md`, and
  `$REMEDIATION_DIR/agent-scratch/domino-D11-*.md`.
- `bun run openspec -- validate deep-habitat-d11-local-feedback --strict`.
- `bun run openspec:validate`.
- `git diff --check`.
- Fresh final D11 rereview lanes for domain/ontology, TypeScript/validation,
  OpenSpec/information, code/vendor topology, and cross-domino/product.

Source implementation gates:

- `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts` plus any
  D11-owned split tests introduced by implementation.
- Hook resource state matrix tests: not configured, clean, staged gitlink
  allowed, dirty submodule refused, unstaged gitlink refused, locked refused,
  uninitialized refused, and inspection failure refused.
- Staged path tests: file-layer refusal, protected/generated refusal carried
  through D10/D7, partial staging refusal, formatter touched-path restage only,
  formatter failure, restage failure, Biome check failure, D6 diagnostic finding,
  D6 diagnostic unavailable/refused/adapter failure, and clean pass.
- Pre-push tests: explicit base, Graphite parent, merge-base resolution, refused
  unresolved base, graph/target unavailable, Nx affected failure, and bounded
  command timeout/oracle.
- Command-surface checks for unsupported hook and any D0-backed help/dry-run
  behavior. Current behavior input shows `hook --help`, `hook pre-commit
  --help`, and `hook pre-commit --dry-run` exit 2; a future gate must either
  preserve that public behavior or route a D0-backed change.
- `git status --short --branch` after hook/apply-related tests that may touch
  the working tree.

## Stop Conditions

- D11 renders diagnostic/Grit feedback from raw Grit output or D7 internals
  instead of D6/D7 projections.
- A hook can pass after required D6, D7, D9, D10, or D3 authority is unavailable
  or refused.
- Resource decision state can represent both allowed and refused behavior.
- Formatter restage can include paths not touched by the formatter.
- Partial staging is stashed, rewritten, silently skipped, or formatted.
- Hook output, trace, docs, or tests route CI, review, OpenSpec, Graphite,
  apply-safety, runtime/product, or current-tree completion through hook pass.
- Public hook output/help/export behavior changes without concrete D0 row
  citation and D1 output-family handling.

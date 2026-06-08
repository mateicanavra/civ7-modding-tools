# Phase Record

## Phase

- Project: Swooper recovery
- Phase: product closure planning
- Owner: Product/Development DRA
- Branch/Graphite stack:
  `codex/swooper-natural-wonder-row-proof-drain`
- Started: 2026-06-06
- Status: blocked until proof and activated repair changes close

## Objective

- Target movement: reconcile product proof, OpenSpec state, branch/PR state,
  remote predecessor disposition, and downstream docs after recovery closes.
- Non-goals: no new product repair, no stale handoff rewrite as current proof.
- Done condition: recovery lane is clean, reviewable, submitted or deliberately
  preserved, and proof claims are exact.

## Authority

- Root/subtree `AGENTS.md`: Graphite and clean-closure policy.
- Product refs: `openspec/changes/swooper-stack-recovery-consolidation/workstream/branch-recovery-ledger.md`.
- Process refs: `docs/process/GRAPHITE.md`.
- Project refs: all recovery OpenSpec changes.
- Excluded/stale inputs: historical handoff docs as current state.

## Current State

- Repo/Graphite state: current top branch is
  `codex/swooper-natural-wonder-supported-catalog-drain`, stacked above
  `codex/swooper-resource-delta-feasibility-current-record-drain`,
  `codex/swooper-resource-rejection-local-context-drain`,
  `codex/swooper-resource-rejection-assignment-context-rerun-record-drain`,
  `codex/swooper-resource-rejection-assignment-context-drain`,
  `codex/swooper-resource-rejection-identity-rerun-record-drain`,
  `codex/swooper-resource-rejection-proof-identity-drain`, and the current
  Swooper proof/diagnostic drain branches.
- Dirty files and owner: this proof-contract slice owns the current
  Swooper/Studio telemetry and OpenSpec files and must leave the branch clean
  before commit or closure.
- Current code evidence: exact-authorship and mapgen-completion proof are
  complete for `studio-run-in-game-mq3v6xr9-4w9`; final-surface parity remains
  unresolved. The latest parity artifact with exact resource rejection and
  local assignment context is
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3v6xr9-4w9-current-final-surface-parity-with-resource-rejection-local-context.json`
  (`sha256:1387bbcc0d645263a068854884acbc7746c7f82a0742650168393e7e3f78e8cf`,
  `proofHash:66ed0c2537374e77548ac560eb39434bf481162f3a9024a3986fbf0cc1fc0290`).
  It preserves unresolved terrain, biome, feature, resource, and
  resource-coordinate proof links. Exact resource telemetry identifies the
  structured numeric rejected row as `RESOURCE_WINE` with `resourceType:16` at
  plot `4838` (`x=68`, `y=45`), rejected by `canHaveResource` with observed
  resource type `-1`; the fresh exact context now proves it came from
  `assignmentPhase:scarce-floor`, `assignmentOrder:85`,
  `initialResourceType:16`, `preferredResourceType:4`,
  `perTypeCountBefore:1`, `legalPlotCountForResource:313`, and
  `targetMinPerType:7`. Exact `FEATURE_APPLY_V1` reports `1493` attempted,
  `1491` applied, and `2` `canHaveFeature` rejections. Current exact
  `NATURAL_WONDER_PLACEMENT_V1` reports `7` planned, `4` placed, and `3`
  rejected. Joined local context shows the same coordinate locally placed
  `RESOURCE_LIMESTONE` (`46`) from scarce-floor assignment order `168`, with
  original local preferred plan `RESOURCE_SILK` (`13`). These narrow but do
  not close source-authority, natural-wonder repair, final-surface parity, or
  product acceptance. Current resource feasibility artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3v6xr9-4w9-resource-delta-feasibility-local-context.json`
  (`sha256:46bd5b4452000a0696432772f3ea3179efeffd43b80fbfa0947b319e3697842f`,
  `proofHash:8c41a37e08b3375c02f9f6c732a2c54af564583e1978cabd70237c5b3c03bd35`)
  matches runtime identity and records `308` resource rows with `0` omitted
  cells. Its current resource split is dominated by scarce-floor assignment
  (`183/194` local-assigned delta rows), so resource closure is now blocked on
  assignment/materialization owner disposition rather than config cleanup. The
  current follow-on branch repairs the exact natural-wonder
  unsupported-footprint owner class by aligning production adapter catalog
  authority with `@civ7/map-policy`, filtering unsupported footprints before
  planning, and preserving explicit empty footprints as not plannable. Fresh
  exact request `studio-run-in-game-mq3x46sy-20js` proves runtime telemetry
  changed: exact authorship completed with no unresolved exact links, and
  natural-wonder telemetry is `7` planned / `5` placed / `2` rejected, with the
  two previous unsupported-footprint rejections gone. Final-surface parity and
  product acceptance remain open. Current follow-on proof-contract branch
  `codex/swooper-natural-wonder-row-proof-drain` exposes bounded
  natural-wonder row identity through local placement artifact
  `coordinateRows`, compact runtime rejected-row telemetry, and expanded
  Studio exact-authorship `coordinateRows`. It is not a behavior repair or
  closure claim. Fresh exact request `studio-run-in-game-mq3yo4uq-20js`
  consumed the row contract and preserves exact rejected rows for feature `30`
  at plot `4130` and feature `36` at plot `1785`, both
  `readback-mismatch` with `partial-expected-footprint`. The final-surface
  verifier artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3yo4uq-20js-current-final-surface-parity-with-natural-wonder-rows.json`
  (`sha256:b1d7033ef3b8b9e7cf55407ab9cf854dac331ac68953d568515ff19dda91923e`,
  `proofHash:4abcfde0e6a242395611586e501d6b872b1943d6a3c45f6e09d38c8ffb430a46`)
  remains unresolved. Local replay in that artifact plans feature `30` at
  plot `1342` and feature `36` at plot `2065`, so the next natural-wonder
  decision is exact/local plan-input or engine-surface divergence before any
  further readback behavior repair.
- Generated outputs affected: none expected.
- Tests/guards affected: validation and closure audits.

## Scope

- Write set: OpenSpec recovery records, downstream docs/tests/guards when stable
  facts changed, Graphite/PR metadata through repo workflow.
- Protected files: unrelated dirty worktrees, remote predecessor deletion before
  replacement durability.
- Owners: closure state and reconciliation.
- Forbidden owners: product implementation and proof repair.
- Consumer impact: future DRAs inherit clean durable state.
- Downstream assumptions: no closure until proof changes are complete.

## Spec/Tasks

- Spec/proposal: `proposal.md`, `design.md`.
- Tasks: `tasks.md`.
- Validation status: pending for this closure-audit record update.

## Review

- Review lanes: proof ledger, Graphite/remote branch, downstream docs/guards,
  supervisor DRA after implementation categories begin.
- Blocking findings: proof categories not yet complete; final supervisor
  closure review has not run over the latest proof-state stack.
- Accepted findings repaired: none yet.
- Rejected/invalidated/waived/deferred findings: none yet.

## Agent Fleet State

- Active agents: none.
- Completed agents: OpenSpec planner informed this slice.
- Assigned write sets: N/A.
- Latest evidence by agent: closure must come after proof-led recovery.
- Open findings by agent: none.
- Running/stale status: none.
- Integration owner: Product/Development DRA.

## Implementation

- Completed tasks: planning record created; current proof/Graphite audit
  snapshot recorded, including current exact feature-apply telemetry,
  natural-wonder telemetry, resource rejection numeric identity, resource
  rejection assignment/local-context proof rerun, and current resource-delta
  feasibility proof after the exact/local rejection join. Current branch also
  locally repairs the natural-wonder unsupported-catalog / empty-footprint
  planning leak, and fresh exact runtime proof confirms that unsupported
  footprint rows no longer reach live natural-wonder placement telemetry.
- Remaining tasks: final-surface parity, product acceptance, supervisor
  P1/P2 closure review, PR/remote predecessor disposition, and final Graphite
  submit/closure.
- Stop conditions triggered: blocked until proof categories close.

## Verification

- Commands run: `git status --short --branch`; `git rev-parse --abbrev-ref
  HEAD`; `git rev-parse HEAD`; `gt log --no-interactive --stack`; review-ledger
  `rg` scans for P1/P2 state; bounded final-surface parity verifier rerun from
  the current exact-authorship proof.
- Results: repo snapshot clean before this update; latest verifier artifact is
  unresolved with proof hash
  `66ed0c2537374e77548ac560eb39434bf481162f3a9024a3986fbf0cc1fc0290`;
  broader review-ledger scan found historical P1/P2 entries but no active
  review ledger under the two current recovery closure changes. Focused local
  validation for the natural-wonder repair passed: `bun test
  mods/mod-swooper-maps/test/placement/plan-ops.test.ts
  mods/mod-swooper-maps/test/placement/derive-placement-inputs.test.ts
  packages/civ7-adapter/test/natural-wonder-catalog.test.ts`,
  `bun run --cwd packages/civ7-adapter check`, and
  `bun run --cwd mods/mod-swooper-maps check`. Fresh runtime proof:
  `studio-run-in-game-mq3x46sy-20js` completed through materialize, deploy,
  Civ restart, setup, game start, and proof waiting. POST/status/verifier/log
  artifacts have SHA-256 values
  `f56ed199e8f081d34aca7388adc839b175df7953473e43948b28218521d6542b`,
  `c5a223071f580d596f43c34624103281366fb8b2b33f75f2d8beddd4f5ca22b5`,
  `3555c553ade9dd3c810868c34ffa7bff3aa602e477e476b05366fbc8449d60e2`, and
  `a750bce889c3db09c2728323798aee22ad4eef05aa8bb86eed202b174e5a922f`.
- Skipped gates and rationale: closure gates wait for proof closure.
- Evidence boundary: this record proves no product closure.

## Realignment

- Downstream docs/specs/issues updated: pending.
- Tests/guards updated: pending.
- Deferrals/triage updated: pending.
- Downstream realignment ledger: pending.

## Next Action

- Exact next step: classify why exact natural-wonder planning/materialization
  rejects feature `30` at plot `4130` and feature `36` at plot `1785` while
  local replay plans those feature types at plots `1342` and `2065` and places
  all `7`. Do not repair readback behavior until that exact/local plan-input
  or engine-surface divergence is source-owned. Then continue the remaining
  queue: cross-resource scarce-floor divergence at plot `4838`, and exact
  `FEATURE_APPLY_V1` materialization/readback ownership.
- First files to inspect: recovery OpenSpec proof ledgers and Graphite branch
  state.
- Stop condition: accepted P1/P2 findings remain open.

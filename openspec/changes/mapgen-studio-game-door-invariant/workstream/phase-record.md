# D12 Phase Record - Game Door Invariant

## Phase

- Project: Studio runtime Effect refactor
- Domino: D12
- OpenSpec change: `mapgen-studio-game-door-invariant`
- Owner: Codex DRA implementation lane
- Branch/Graphite stack: `codex/runtime-effect-game-door-invariant`
- Status: D12 implementation committed; live Civ7 proof executed; final
  stack-drain proof reconciled from current `origin/main`

## Objective

- Target movement: close the runtime simplification packet train by turning
  runtime ownership into guardrails, residue ledgers, status classifications,
  and stack-drain proof.
- Non-goals: new runtime transport, new browser recovery path, broad product
  redesign of Restart Civ7, or claiming live Civ7 proof from local unit/source
  tests.
- Done condition: the D12 Graphite slice has a truthful implementation commit,
  guard tests, negative searches, classification ledgers, proof labels,
  not-green live handoff if needed, and clean stack/worktree evidence.

## Gate 1 - Frame

- Hard core: one game door, sanctioned session owners, TypeBox contract spine,
  public/manual status classification, tuner-session dispositions, no orphaned
  bridges, final residue ledger, final proof ledger, Graphite stack drain.
- Exterior: code behavior changes already owned by D0-D11 unless D12 finds
  residue; product design of Restart Civ7 unless implemented or dispositioned;
  unrelated deployment cleanup outside runtime closeout.
- Falsifier: D12 leaves `RunInGameHttpError`, Zod contract residue, browser
  polling/watchdog/live cadence, app-local dev supervisor, unsanctioned session
  construction, unclassified status endpoints, or active docs saying convergence
  is out of scope.
- Proof labels: OpenSpec validation, guard tests, package/app gates, negative
  searches, classification ledgers, executed/not-green live proof, Graphite
  submit/merge/sync-drain status, worktree cleanliness.
- Review lanes: direct-control/prework scout, hardening/orphan/black-ice,
  testing/schema/runtime closeout.

## Gate 2 - Repo State

- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-S-studio-runtime-effect-refactor`
- Branch: `codex/runtime-effect-game-door-invariant`
- Entrance status: clean after D11 commit `5cec78079`.
- Dirty-file quarantine: none at D12 implementation entrance. Current D12 dirty
  files are the EventHub scoped-service implementation, focused tests, active
  runtime docs, and D12 workstream records.

## Gate 3 - Diagnosis

The existing `mapgen-studio-game-door-invariant` change was a historical S4.1
implementation closeout record. It claimed implementation, PR, merge, drain, and
program closure. D12 must instead be a final packet that tells future
implementers exactly how to close the runtime refactor on the accepted
implementation base and how to prove no bridge remains.

## Gate 4 - Corpus / Action Surfaces

| Surface | Owner | Consumer | Verification |
| --- | --- | --- | --- |
| game-door invariant doc | evergreen docs | future runtime work | doc review |
| `Civ7DirectControlSession` constructors | direct-control/studio-server owners | guard test | source guard |
| Studio contracts | `@civ7/studio-server` | app/control clients | TypeBox/Zod search |
| public/manual status endpoints | studio-server router/services | manual diagnostics | classification ledger |
| `@civ7/control-orpc` runtime surfaces | control package | Studio/direct-control consumers | classification ledger |
| tuner-session follow-ups | D12 implementation | future work | tasks/deferral proof |
| runtime residue symbols | D0-D11 owners | final closeout | negative searches |
| Graphite stack | repo process | reviewers/future agents | submit/merge/sync proof |

## Gate 5 - Grouping

- Game-door group: direct-control session constructors, invariant doc, guard
  test.
- Schema/status group: TypeBox/Zod residue, diagnostic status endpoint
  classification, mutation-state read/projection classification, exact status
  endpoint corpus.
- Runtime residue group: polling/watchdog/live cadence/dev supervisor/satellite
  paths/generic DTOs/status-code bridges/transport bridges.
- Closeout group: tuner-session dispositions, final proof ledger, stack drain.

## Gate 6 - Expected Behavior

- Production code has only sanctioned session constructors.
- Studio contracts use TypeBox/Standard Schema.
- Retained status endpoints are classified as diagnostic reads,
  mutation-state reads/projections, or identity reads, and none own background
  freshness.
- `mapgen-studio-tuner-session` has no unchecked ownership promises.
- Deleted browser/runtime/dev-process paths remain deleted.
- Active docs point to accepted dispositions, not "out of scope" escapes.
- Final stack state is explicit and clean.

## Gate 7 - Architecture Translation

- Owning docs: `docs/system/direct-control/GAME-DOOR-INVARIANT.md`,
  `docs/system/DEFERRALS.md` when needed.
- Owning packages: `@civ7/studio-server`, `@civ7/direct-control`,
  `@civ7/control-orpc`.
- Forbidden owners: app/browser runtime truth, router-local session
  construction, unclassified public mutation routes, app-local dev supervision,
  old satellite clients, Zod contract residue.

## Gate 8 - Slice Plan

D12 is one OpenSpec change and one Graphite implementation branch. It is the
final packet in the train and owns stack-drain proof after implementation
review/merge policy allows closure.

## Gates 9-10 - Proof Labels

- OpenSpec validation proves packet/spec shape only.
- Guard tests prove game-door source ownership.
- Package/app gates prove code health.
- Negative searches prove deletion and residue classification.
- D10 and D11 live proof were not-green. D12 ran the missing live proof and did
  not consume missing proof by label.
- Graphite proof is separate from code/test proof.

## Gate 11 - Review

- Direct-control/prework scout: completed during packet authoring.
- Hardening/orphan/black-ice reviewer: completed during packet authoring.
- Testing/schema/runtime reviewer: completed during packet authoring.
- Fresh D12 prework/black-ice corpus reviewer: completed during packet
  authoring.
- Review ledger captured all P1/P2 findings before packet acceptance.
- Implementation explorer/supervisor review findings are recorded in
  `review-disposition-ledger.md`; root graph hygiene and Graphite preflight
  remain closure blockers until resolved.

## Gate 12 - Closure

D12 implementation closure requires:

- D12 proposal/design/spec/tasks/ledgers agree.
- review ledger has no unresolved P1/P2.
- strict and full OpenSpec validation pass.
- shortcut scan has no active unowned bridge or stale implementation closure.
- packet train marks D12 accepted and all D0-D12 accepted.
- live proof is recorded from the D12 state-machine pass.
- Graphite/worktree state is clean after commit and final drain is reconciled
  from current main after merge.

## Next Action

D12 is closed for implementation and final drain on current repo evidence.
Future work should not continue from the old D12 branch. If a later audit finds
new stale packet accounting, open a separate docs/OpenSpec realignment slice
instead of reopening runtime code by default.

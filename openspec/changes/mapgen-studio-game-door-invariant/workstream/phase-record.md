# D12 Phase Record - Game Door Invariant

## Phase

- Project: Studio runtime Effect refactor
- Domino: D12
- OpenSpec change: `mapgen-studio-game-door-invariant`
- Owner: Codex DRA packet-authoring lane
- Branch/Graphite stack: `codex/runtime-effect-game-door-invariant`
- Status: accepted pending final validation and Graphite commit

## Objective

- Target movement: close the runtime simplification packet train by turning
  runtime ownership into guardrails, residue ledgers, status classifications,
  and stack-drain proof.
- Non-goals: new runtime transport, new browser recovery path, broad product
  redesign of Restart Civ7, implementation closure on this packet-authoring
  branch.
- Done condition: packet can be handed to a D12 implementer with exact guard
  tests, negative searches, classification ledgers, proof labels, and final
  Graphite stack closure requirements.

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
  searches, classification ledgers, consumed/new live proof, Graphite submit,
  merge, sync/drain, worktree cleanliness.
- Review lanes: direct-control/prework scout, hardening/orphan/black-ice,
  testing/schema/runtime closeout.

## Gate 2 - Repo State

- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-runtime-effect-refactor-frame`
- Branch: `codex/runtime-effect-game-door-invariant`
- Entrance status: clean after D11 commit `6b8dc1429`.
- Dirty-file quarantine: none at entrance; D12 packet edits are restricted to
  `openspec/changes/mapgen-studio-game-door-invariant/**` and
  `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md`.

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

D12 is one OpenSpec change and one future implementation Graphite branch. It is
the final packet in the train and owns stack-drain proof after implementation
review/merge policy allows closure.

## Gates 9-10 - Proof Labels

- OpenSpec validation proves packet/spec shape only.
- Guard tests prove game-door source ownership.
- Package/app gates prove code health.
- Negative searches prove deletion and residue classification.
- Live proof is consumed from behavior-changing slices unless D12 changes live
  runtime behavior or finds a missing live proof.
- Graphite proof is separate from code/test proof.

## Gate 11 - Review

- Direct-control/prework scout: launched.
- Hardening/orphan/black-ice reviewer: launched.
- Testing/schema/runtime reviewer: launched.
- Fresh D12 prework/black-ice corpus reviewer: launched and repaired.
- Review ledger must capture all P1/P2 findings before packet acceptance.

## Gate 12 - Closure

Closure is blocked until:

- D12 proposal/design/spec/tasks/ledgers agree.
- review ledger has no unresolved P1/P2.
- strict and full OpenSpec validation pass.
- shortcut scan has no active unowned bridge or stale implementation closure.
- packet train marks D12 accepted and all D0-D12 accepted.
- Graphite/worktree state is clean after commit.

## Next Action

Finish D12 review loop, repair findings, validate, update packet train ledger,
and commit D12 through Graphite.

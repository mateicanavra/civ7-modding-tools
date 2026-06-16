# D8 Phase Record - Studio Event Hub

## Phase

- Project: Studio runtime Effect refactor
- Domino: D8
- OpenSpec change: `mapgen-studio-event-hub`
- Owner: Codex DRA packet-authoring lane
- Branch/Graphite stack: `codex/runtime-effect-openspec-packets`
- Status: packet accepted; implementation landed on current main; D12 later
  repaired package-owned EventHub lifecycle

## Objective

- Target movement: specify the daemon-owned `StudioEventHub`,
  `studio.events.watch`, client event subscription, reconnect adoption, and
  downstream handoffs needed for operation/live-game push.
- Non-goals: operation publisher conversion, operation polling/watchdog
  deletion, daemon live-game watcher conversion, browser live-game timer
  deletion, alternate transports, browser event recovery.
- Done condition: packet can be handed to a D8 implementer with explicit owners,
  cleanup semantics, retry semantics, TypeBox schema origin, one-route proof,
  downstream deletion owners, tests, stop conditions, and review dispositions.

## Gate 1 - Frame

- Hard core: one daemon event hub, one `/rpc` watch procedure, TypeBox event
  schema origin, Effect scoped subscription cleanup, actual-path nonzero retry,
  `hello` reconnect adoption through `studio.operations.current`.
- Exterior: D9 operation push, D10 live-game watch, D12 game-door invariant,
  unrelated UI storage owners, generated outputs.
- Falsifier: an implementer can add an alternate event route/bus/schema, rely on
  inert retry defaults, leave cleanup unobservable, or treat polling retention as
  unowned.
- Proof labels: OpenSpec validation, package handler tests, app hook tests,
  one-route negative searches, cleanup/leak tests, downstream realignment,
  Graphite/worktree cleanliness. Live Civ7 proof is not a D8 packet claim.
- Review lanes: event-hub ownership, testing/vendor alignment,
  hardening/prework/black-ice, downstream realignment.

## Gate 2 - Repo State

- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-runtime-effect-refactor-frame`
- Branch: `codex/runtime-effect-openspec-packets`
- Entrance status: clean before D8 edits after D7 commit
  `1a159242d`.
- Dirty-file quarantine: none at entrance; D8 edits are restricted to
  `openspec/changes/mapgen-studio-event-hub/**` and
  `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md`.
- Dependency/build entrance: D6 refreshed `bun install --frozen-lockfile`,
  `bun run build`, and `bun run check`; D7/D8 are docs-only packet repairs and
  require OpenSpec/Graphite/status gates unless code is touched.

## Gate 3 - Diagnosis

The existing change is valuable implementation-closure history but not a D8
packet-standard spec. It overstates merged/complete state, uses stale stage
vocabulary, carries retry correction as a note rather than normalized packet
requirements, and does not fully encode D7 cleanup/retry proof shape or D9/D10
deletion ownership.

The architectural residue D8 must remove is hidden ambiguity around whether the
event hub is a temporary additive channel, whether polling retention is a
cheap exit, and whether `ClientRetryPlugin` installation alone proves
reconnect.

## Gate 4 - Corpus / Action Surfaces

| Surface | Owner | Consumer | Verification |
| --- | --- | --- | --- |
| `StudioEventHub` API | `packages/studio-server` | daemon context, watch router, D9/D10 publishers | service tests, handler tests, cleanup counts |
| concrete hub instance | Studio daemon | package runtime, future publishers | context/runtime construction tests |
| event union `hello | operation | live-game` | package contract | app hook, D9/D10 publishers | TypeBox/Standard Schema contract tests |
| `studio.events.watch` | package router | Studio app client | handler/eventIterator tests |
| immediate `hello` | watch procedure | reconnect adoption | first-event test |
| hub event delivery | EventHub/watch bridge | future operation/live-game UI state | publish-after-hello test |
| subscription cleanup | EventHub/watch bridge | daemon resource lifetime | close/abort/interruption/repeated-cycle tests |
| client live options | Studio app hook | TanStack/oRPC event query | hook options tests |
| retry owner | app hook or RPC link context | event reconnect | actual-path nonzero retry test |
| `hello` adoption | app hook + D6 helper | Run in Game and Save/Deploy UI state | adoption tests |
| D9 handoff | operations push packet | operation poll deletion | downstream ledger |
| D10 handoff | live-game watch packet | browser timer deletion | downstream ledger |

## Gate 5 - Grouping

- Contract group: TypeBox event union, Standard Schema adapter, eventIterator
  output, one watch procedure.
- Runtime group: daemon-created hub, Effect PubSub subscription scope,
  shutdown/interrupt cleanup.
- Client group: `experimental_liveOptions`, retry context, `hello` adoption.
- Downstream group: operation event publication/deletions in D9, live-game
  publication/deletions in D10.

## Gate 6 - Expected Behavior

- Every subscription first observes exactly one immediate `hello` for that
  connection before hub events.
- `operation` and `live-game` categories are valid public event shapes even
  before D9/D10 publish them.
- Closing, aborting, interrupting, shutting down, or cycling subscriptions does
  not leave subscriber state above baseline.
- Reconnect truth is `studio.operations.current`; event stream history is not a
  replay ledger.
- Polling retained by D8 has named deletion owners and proof triggers.

## Gate 7 - Architecture Translation

- Owning package: `@civ7/studio-server`.
- App composition owner: `apps/mapgen-studio` daemon/studio context and event
  hook.
- Forbidden owners: browser localStorage event recovery, alternate SSE/HTTP
  route, second RPC mount, Zod event schema, app-local duplicate DTOs.
- Effect resources: `StudioEventHub` tag/service, daemon runtime layer,
  PubSub subscription scope/finalizer.
- Public surface: `studio.events.watch` on existing `/rpc`.

## Gate 8 - Slice Plan

D8 is one OpenSpec change and one future implementation Graphite branch. It
specifies the stable event hub/watch component and leaves operation/live-game
publication work to D9/D10 with explicit handoff constraints.

## Gates 9-10 - Proof Labels

- OpenSpec validation proves packet/spec shape only.
- Package handler tests prove watch delivery, eventIterator bridge, one-route
  behavior, and subscription cleanup.
- Service/runtime tests prove Effect cleanup and repeated-cycle behavior.
- App hook tests prove client helper, retry owner, and reconnect adoption.
- Negative searches prove no alternate route/bus/schema/recovery path.
- Live Civ7 proof is not required for D8 because D8 does not claim game-state
  behavior.

## Gate 11 - Review

- Prework/event surface scout: completed during packet authoring.
- Testing/vendor alignment reviewer: completed during packet authoring.
- Hardening/prework/black-ice reviewer: completed during packet authoring.
- Review ledger captured all P1/P2 findings before packet acceptance.

## Gate 12 - Closure

Packet acceptance required:

- D8 docs/spec/tasks/ledgers agree.
- `review-disposition-ledger.md` has no unresolved P1/P2 finding.
- strict OpenSpec validation and full OpenSpec validation pass.
- shortcut/black-ice scan has no unowned retained-path or deferral language.
- `OPENSPEC-PACKET-TRAIN.md` marks D8 accepted with an accurate owner note.
- Graphite/worktree state is clean after commit.

## Next Action

Implementation opens D8 on its own Graphite branch and runs the gates in
`tasks.md`. D9 implementation cannot claim operation-push proof until D8
EventHub exists.

## Implementation Addendum - 2026-06-15

- Implementation branch: `codex/runtime-effect-event-hub`, parented above the
  separate lower repair slice
  `codex/runtime-effect-domain-contract-import-surface`.
- This implementation slice is not docs-only. It changes the package event
  schema export, handler/EventHub lifecycle behavior, daemon disposal ownership,
  handler/contract tests, and D8 workstream records.
- The packet-authoring branch/status evidence above remains historical context
  for packet acceptance only. Current implementation evidence is in
  `tasks.md`, `testing-ledger.md`, `review-disposition-ledger.md`, and
  `closure-checklist.md`.
- D8 implementation proves event hub/watch/hello/retry/cleanup mechanics. It
  does not claim D9 operation publisher parity, D9 polling/watchdog deletion,
  D10 live-game cadence parity, or D10 browser timer deletion.

# D10 Phase Record - Studio Live Game Watch

## Phase

- Project: Studio runtime Effect refactor
- Domino: D10
- OpenSpec change: `mapgen-studio-live-game-watch`
- Owner: Codex DRA packet-authoring lane
- Branch/Graphite stack: `codex/runtime-effect-live-game-watch`
- Status: packet accepted; implementation pending

## Objective

- Target movement: move live Civ7 status freshness from browser cadence into an
  Effect-scoped daemon runtime watcher that publishes `live-game` events through
  D8 `StudioEventHub`.
- Non-goals: alternate event transport, browser recovery, operation push,
  operation polling/watchdog deletion, snapshot/setup streaming, dev-process
  runner cleanup, final public/manual status endpoint closeout.
- Done condition: packet can be handed to a D10 implementer with explicit
  runtime ownership, TypeBox contract, client follow-up rules, deletion targets,
  live-proof boundary, tests, downstream owners, and review dispositions.

## Gate 1 - Frame

- Hard core: one daemon-runtime live-game watcher, shared `Civ7TunerSession`,
  D8 event hub, first/change-only publication, clock-only quiet behavior, client
  pushed-state application, request/response snapshot/setup follow-ups, browser
  cadence deletion, live proof or not-green `next-packet.md`.
- Exterior: D11 Nx dev runner, D12 game-door invariant, public/manual status
  endpoint classification, operation event push, browser storage recovery,
  generated outputs.
- Falsifier: an implementer can keep a renamed browser live-status loop, read
  FireTuner through an alternate session, publish every tick, count clock-only
  fields as changes, skip live proof while claiming green, or treat old S3.3
  implementation history as current closure.
- Proof labels: OpenSpec validation, package watcher tests, daemon composition
  tests, app event/follow-up tests, negative searches, live Civ7 proof,
  downstream realignment, Graphite/worktree cleanliness.
- Review lanes: prework/corpus scout, hardening/black-ice, testing/vendor
  alignment.

## Gate 2 - Repo State

- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-runtime-effect-refactor-frame`
- Branch: `codex/runtime-effect-live-game-watch`
- Entrance status: clean after D9 commit `c8ff22cb8`.
- Dirty-file quarantine: none at entrance; D10 edits are restricted to
  `openspec/changes/mapgen-studio-live-game-watch/**` and
  `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md`.
- Dependency/build entrance: D6 refreshed dependency/build/check baseline; D8
  and D9 passed strict and full OpenSpec validation. D10 packet authoring is
  docs/OpenSpec-only and requires OpenSpec/status/Graphite gates unless code is
  touched.

## Gate 3 - Diagnosis

The existing `mapgen-studio-live-game-watch` record was historical S3.3
implementation-closure evidence, not a D10 packet. It claimed all tasks done,
merged PR state, and green verification even though the current train now treats
D10 as an accepted packet with implementation pending. That stale closure would
mislead implementation agents into treating unit tests and old merge state as
current live proof.

The design risk D10 must remove is not only one helper name. It is hidden
browser-owned live status freshness: timers, polling hooks, refetch intervals,
background browser status callers, readiness overlay cadence, and any renamed
client scheduler that keeps FireTuner truth outside the daemon runtime.

## Gate 4 - Corpus / Action Surfaces

| Surface | Owner | Consumer | Verification |
| --- | --- | --- | --- |
| `live-game` event payload | `packages/studio-server` TypeBox contract | app event hook | TypeBox/Standard Schema tests |
| live-game key helper | package live-game model | watcher and client model | keying tests, duplicate-helper search |
| `StudioLiveGameWatcher` | daemon runtime service/layer | EventHub and Studio app | package watcher tests, disposal tests |
| shared live status read | `Civ7TunerClient` / `Civ7TunerSession` | watcher and manual status endpoint | composition proof, negative search |
| event publication | D8 `StudioEventHub` | `studio.events.watch` subscribers | first/change/quiet tests |
| client event hook | `useStudioEvents` | `StudioShell` state | app hook/scenario tests |
| snapshot follow-up | request/response `civ7.live.snapshot` | live preview state | request-key/stale-commit tests |
| setup follow-up | request/response setup reads | setup suggestions/visibility | abort/newer-event tests |
| browser cadence deletion | app source/tests | live status freshness | negative searches |
| live proof | local Civ7 runtime | product confidence | bounded logs/payload proof or next packet |

## Gate 5 - Grouping

- Contract group: TypeBox event payload, event union membership, Standard Schema
  origin.
- Runtime group: Effect-scoped watcher, shared session, EventHub publication,
  disposal/finalizer behavior.
- Client group: event hook application, `StudioShell` state update, snapshot and
  setup request/response follow-ups.
- Deletion group: browser timers, polling hooks, refetch intervals, background
  status/readiness calls, cadence tests.
- Proof group: unit/component tests, negative searches, live Civ7 evidence, or
  not-green next-packet handoff.

## Gate 6 - Expected Behavior

- The daemon publishes a `live-game` event on first observation.
- Changed stable live-game key publishes.
- Unchanged key, clock-only changes, and failure-count-only changes stay quiet.
- Production watcher reads through the daemon runtime's shared session.
- Client state updates from pushed events.
- Snapshot/setup reads are request/response follow-ups triggered by pushed
  state, with request keys and stale/newer-event protection.
- Browser live status freshness has no remaining scheduler.
- D10 implementation closure is not green without live Civ7 proof when that
  environment is unavailable.

## Gate 7 - Architecture Translation

- Owning package: `@civ7/studio-server`.
- App composition owner: `apps/mapgen-studio` daemon and Studio shell.
- Effect resources: `StudioLiveGameWatcher` service/layer, scoped fiber or
  schedule loop, shared `Civ7TunerSession`, D8 `StudioEventHub`, finalizer.
- Forbidden owners: browser live-status timer, app-local polling hook, alternate
  FireTuner status reader, direct-control bypass, second event route, Zod event
  mirror, hidden compatibility cadence.
- Public surface: `studio.events.watch` on existing `/rpc`.

## Gate 8 - Slice Plan

D10 is one OpenSpec change and one future implementation Graphite branch. It
specifies live-game daemon publication and browser live-status cadence deletion.
D11 owns Nx dev runner/process simplification. D12 owns final game-door
invariant, public/manual status endpoint classification, and final schema
residue closeout.

## Gates 9-10 - Proof Labels

- OpenSpec validation proves packet/spec shape only.
- Package watcher tests prove first/change/quiet/clock-only/disposal behavior.
- Daemon composition tests prove shared session and EventHub ownership.
- App tests prove pushed event application and event-triggered snapshot/setup
  follow-ups.
- Negative searches prove browser live-status cadence deletion.
- Live Civ7 proof proves product/runtime behavior. If unavailable, D10 writes a
  next packet and remains not-green for live behavior.

## Gate 11 - Review

- Prework scout: completed during packet authoring.
- Hardening/black-ice reviewer: completed during packet authoring.
- Testing/vendor alignment reviewer: completed during packet authoring.
- Review ledger captured all P1/P2 findings before packet acceptance.

## Gate 12 - Closure

Packet acceptance required:

- D10 proposal/design/spec/tasks/ledgers agree.
- `review-disposition-ledger.md` has no unresolved P1/P2 finding.
- strict and full OpenSpec validation pass.
- shortcut/black-ice scan has no unowned retained path or stale S3/S4 closure
  language.
- `OPENSPEC-PACKET-TRAIN.md` marks D10 accepted with an accurate owner note.
- Graphite/worktree state is clean after commit.

## Next Action

Implementation opens D10 on its own Graphite branch and runs the gates in
`tasks.md`. If live Civ7 proof is unavailable, D10 remains not-green for live
behavior and writes `workstream/next-packet.md`.

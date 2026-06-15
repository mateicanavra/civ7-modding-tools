# D9 Phase Record - Studio Operations Push

## Phase

- Project: Studio runtime Effect refactor
- Domino: D9
- OpenSpec change: `mapgen-studio-operations-push`
- Owner: Codex DRA packet-authoring lane
- Branch/Graphite stack: `codex/runtime-effect-operations-push`
- Status: packet accepted; implementation pending

## Objective

- Target movement: specify operation transition publication through the D8
  `StudioEventHub`, client pushed-operation application, and deletion of
  operation polling/watchdog authority.
- Non-goals: live-game event publication, browser live-game polling/timer
  deletion, alternate transports, browser operation recovery, public/manual
  status endpoint deletion without separate proof.
- Done condition: D9 can be implemented without chat context, with publisher
  owners, deletion targets, terminal-toast parity, tests, stop conditions, and
  downstream D10/D12 handoffs explicit.

## Gate 1 - Frame

- Hard core: Run in Game and Save&Deploy transitions publish `operation` events
  through D8 EventHub; client applies pushed events; operation polling/watchdog
  authority is deleted.
- Exterior: D10 live-game watch, D12 game-door invariant, D8 transport/hub
  semantics, public/manual status endpoint closeout.
- Falsifier: an implementer can leave a hidden status poll, keep the daemon
  identity watchdog, publish only one operation family, lose terminal toast
  parity, or add a second operation bus.
- Proof labels: OpenSpec validation, publisher falsification tests, client
  event-application tests, terminal toast parity tests, negative deletion
  searches, downstream realignment, Graphite/worktree cleanliness.
- Review lanes: operation publisher ownership, deletion/black-ice, testing,
  downstream realignment.

## Gate 2 - Repo State

- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-runtime-effect-refactor-frame`
- Branch: `codex/runtime-effect-operations-push`
- Entrance status: clean before D9 edits after D8 commit `3ed082058`.
- Dirty-file quarantine: none at entrance; D9 edits are restricted to
  `openspec/changes/mapgen-studio-operations-push/**` and
  `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md`.
- Dependency/build entrance: D6 refreshed dependency/build/check baseline;
  D7-D9 are docs-only packet repairs and require OpenSpec/Graphite/status gates
  unless code is touched.

## Gate 3 - Diagnosis

The existing change is useful implementation-closure history but not a D9
packet-standard spec. It uses stale stage vocabulary, overstates complete/merged
state, embeds material watcher findings in historical rows, and does not clearly
separate D9 deletion authority from D10 live-game work or public/manual status
endpoint closeout.

## Gate 4 - Corpus / Action Surfaces

| Surface | Owner | Consumer | Verification |
| --- | --- | --- | --- |
| Run in Game store transition | app daemon operation store/engine | D8 EventHub, Studio client | publisher falsification test |
| Save&Deploy store transition | app daemon operation store/engine | D8 EventHub, Studio client | publisher falsification test |
| operation event DTO | `@civ7/studio-server` contract/D6 operation DTOs | app event hook | schema/DTO parity tests |
| client operation event application | `useStudioEvents` / `operationAdoption` | StudioShell state surfaces | app tests |
| terminal toast parity | StudioShell operation effects | user notification behavior | parity test |
| `useOperationStatusPolls` deletion | Studio app | background freshness removal | negative search |
| hidden Save&Deploy loop deletion | map config save API | background freshness removal | negative search |
| polling-only 404 handling deletion | StudioShell | status-miss behavior | negative search/tests |
| `useDaemonInstanceWatchdog` deletion | Studio app | identity authority removal | negative search |
| D10 live-game protection | live runtime surfaces | D10 packet | downstream ledger |

## Gate 5 - Grouping

- Publisher group: Run in Game and Save&Deploy transition-to-event paths.
- Client group: event hook application, operation adoption, terminal toast
  parity.
- Deletion group: polling hook, hidden loop, status-miss callbacks, watchdog.
- Boundary group: D10 live-game and public/manual status endpoint protection.

## Gate 6 - Expected Behavior

- Every retained operation transition for both families publishes one operation
  event on the D8 hub.
- Publisher failure is diagnostic and does not reverse the state transition or
  reopen polling.
- Pushed operation events update visible operation state.
- Boot/reconnect adopted terminal Run in Game operations do not replay old
  terminal toasts; live pushed terminal operations still trigger the existing
  toast effect.
- No background operation freshness or identity polling remains after D9.

## Gate 7 - Architecture Translation

- Owning packages/modules: `apps/mapgen-studio` operation stores/engines and
  client event hook, with public event DTOs from `@civ7/studio-server`.
- Forbidden owners: second operation bus, browser storage recovery, polling
  retained path, app-local event DTO mirror, Zod event schema.
- Public surface: unchanged `studio.events.watch` event stream and canonical
  operation DTOs.
- Protected surfaces: D10 live-game cadence and public/manual diagnostic status
  endpoints unless proven unused by a future packet.

## Gate 8 - Slice Plan

D9 is one OpenSpec change and one Graphite branch stacked on D8. It specifies
operation push and deletion of operation polling authority; D10 owns live-game
cadence and D12 owns final runtime invariant closeout.

## Gates 9-10 - Proof Labels

- OpenSpec validation proves packet/spec shape only.
- Publisher tests prove daemon operation transitions publish through EventHub.
- Client tests prove event application and terminal toast parity.
- Negative searches prove deleted polling/watchdog symbols are gone.
- Live Civ7 proof is not required for D9 packet acceptance because D9 does not
  claim live game-state behavior.

## Gate 11 - Review

- Prework/event surface scout: completed during packet authoring.
- Testing/vendor alignment reviewer: completed during packet authoring.
- Hardening/prework/black-ice reviewer: completed during packet authoring.
- Review ledger captured all P1/P2 findings before packet acceptance.

## Gate 12 - Closure

Packet acceptance required:

- D9 docs/spec/tasks/ledgers agree.
- Review disposition ledger has no unresolved P1/P2 finding.
- strict OpenSpec validation and full OpenSpec validation pass.
- shortcut/black-ice scan has no unowned retained-path or deferral language.
- `OPENSPEC-PACKET-TRAIN.md` marks D9 accepted with an accurate owner note.
- Graphite/worktree state is clean after commit.

## Next Action

Implementation opens D9 on its own Graphite branch after D8 EventHub exists,
then runs the gates in `tasks.md` before claiming operation-push closure.

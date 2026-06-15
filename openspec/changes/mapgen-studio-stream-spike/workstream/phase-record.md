# D7 Packet Phase Record - Stream Transport Decision

Status: accepted
Date: 2026-06-14
Domino: D7
OpenSpec change: `mapgen-studio-stream-spike`
Graphite packet branch: `codex/runtime-effect-openspec-packets`

## Frame

D7 selects the Studio event-stream transport that D8-D10 build on. The selected path is `effect-orpc` `.effect()` returning `eventIterator(...)` over the existing `/rpc` route, backed by Effect `PubSub` subscription scope cleanup and consumed by the Studio client through `experimental_liveOptions` with explicit nonzero retry.

## Hard Core

- One Studio event transport exists: `studio.events.watch` on the existing `/rpc` mount.
- The production watch procedure uses `eventIterator(...)` and `effect-orpc` `.effect()`.
- Event schemas are TypeBox-origin public DTOs through the owned Standard Schema adapter.
- Effect resource cleanup is observable through separate tests for iterator close, abort/disconnect, interruption, and repeated subscribe/close.
- Client consumption uses `experimental_liveOptions` for latest daemon truth.
- Nonzero retry is owned by the actual watch path, not assumed from default plugin construction.
- D8/D9/D10 consume D7; they do not re-decide transport.

## Exterior

- D7 does not specify production EventHub category semantics; D8 owns that.
- D7 does not publish operation events or delete operation polling; D9 owns that.
- D7 does not publish live-game events or delete live-game polling; D10 owns that.
- D7 does not add browser localStorage recovery, alternate event servers, or raw game-door event fields.

## Falsifier

D7 must be reframed if `effect-orpc` `.effect()` cannot return an event iterator on the selected implementation base, if `/rpc` cannot pass at least two ordered event chunks without buffering, if cleanup cannot be observed separately under disconnect and interruption, or if client retry cannot be bound to the actual watch path.

## Proof Labels

- OpenSpec validation: packet shape only.
- Source/API evidence: installed package and current code support for selected bridge.
- Package proof: event delivery and Effect subscription cleanup.
- App proof: Vite `/rpc` stream passthrough, client live-options, and retry owner.
- Negative proof: no alternate event route, stale helper use, default-only retry claim, or unowned spike fixture.
- Product/live proof: not required for D7 because no Civ7 gameplay behavior changes.

## Review Lanes

- Transport/API decision.
- Effect resource cleanup.
- Client retry/live-options.
- Testing/proof adequacy.
- Downstream D8/D9/D10 realignment.
- Hardening/prework philosophy.
- Black-ice disambiguation.

## Repo State / Baseline

- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-runtime-effect-refactor-frame`.
- Branch: `codex/runtime-effect-openspec-packets`.
- Stack position: packet branch above accepted D0-D6 packet commits.
- Dirty-file owner during packet drafting: D7 packet docs under `openspec/changes/mapgen-studio-stream-spike/**`.
- Selected authoring baseline: current packet branch after D6 commit `82fe38319`.
- Dependency/build entrance evidence for this branch was refreshed at D6 acceptance: `bun install --frozen-lockfile`, `bun run build`, and `bun run check` passed on 2026-06-14. D7 acceptance requires OpenSpec/Graphite/status gates because D7 is docs-only and does not change package code.

## Write Set / Protected Paths

Write set:

- `openspec/changes/mapgen-studio-stream-spike/**`
- `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md` when marking acceptance

Protected paths:

- production EventHub, operation-push, live-game watcher, and dev-runner code;
- generated outputs and built bundles;
- D8/D9/D10 packet files except downstream references recorded in D7 ledgers.

## Closure Boundary

D7 closes when the packet records selected transport, proof obligations, downstream realignment, prework, review acceptance, OpenSpec validation, Graphite state, and clean worktree commit. D7 does not claim D8/D9/D10 production behavior.

## Dependencies

- D0 accepted one `/rpc` mount.
- D2.5 accepted TypeBox/Standard Schema as Studio public contract origin.
- D3 accepted typed expected failure/error discipline.
- D4 accepted runtime-owned event publication as a `StudioOperationRuntime` responsibility.
- D6 accepted `studio.operations.current` as reconnect/boot truth.
- D8 consumes the selected bridge for production EventHub/watch semantics.
- D9 consumes the selected bridge for operation transition push.
- D10 consumes the selected bridge for live-game push.

## Diagnosis

The stale S3.0 packet mixed durable transport findings with implementation-closure history, branch/merge state, and an old retained-alternate explanation that kept `.handler()` in view beside the selected `.effect()` route. Current source evidence proves the selected path exists, so D7's normative packet removes bridge ambiguity and treats old branch history as superseded evidence.

## Corpus

| Surface | D7 classification |
| --- | --- |
| `eventIterator(...)` contract output | selected production watch output |
| `effect-orpc` `.effect()` route implementation | selected production bridge |
| plain oRPC `.handler()` event watch | rejected path |
| Effect `PubSub` subscription | selected server resource bridge |
| iterator `return()` cleanup | required proof surface |
| client abort/disconnect cleanup | required proof surface |
| runtime/fiber interruption cleanup | required proof surface |
| repeated subscribe/close | required leak proof surface |
| Vite `/rpc` proxy | required two-ordered-chunk stream passthrough proof surface |
| `experimental_liveOptions` | selected client latest-state helper |
| `experimental_streamedOptions` | rejected for Studio event spine latest-state consumption |
| `ClientRetryPlugin` default constructor | insufficient reconnect proof without nonzero watch policy |
| spike-only fixtures | D8/D9 promotion-or-deletion obligation |

## Downstream Stale Vocabulary Disposition

`openspec/changes/mapgen-studio-event-hub/` and `openspec/changes/mapgen-studio-operations-push/` still contain historical S3.1/S3.2 vocabulary and Turbo-era gate references. D7 records that as downstream packet repair scope. D8 and D9 are not accepted until translated to D8/D9 packet-train vocabulary and current Nx/Habitat-oriented gates where applicable.

## Packet Acceptance Stop Conditions

D7 cannot be accepted if:

- the packet leaves `.handler()` available as a production event bridge;
- the packet allows alternate event routes, second RPC mounts, or parallel SSE endpoints;
- cleanup proof omits iterator close, disconnect/abort, interruption, or repeated subscribe/close;
- retry proof relies on default `ClientRetryPlugin` construction;
- client consumption uses stale or accumulating stream helper vocabulary;
- spike fixture disposition is unowned;
- D8/D9/D10 production event semantics are folded into D7 transport selection;
- review finds unresolved P1/P2 findings.

## Future Implementation Closure Blockers

The D7 implementation slice cannot close if:

- `studio.events.watch` bypasses `eventIterator(...)` or `.effect()`;
- event schemas are not TypeBox/Standard Schema backed;
- subscription cleanup is inferred rather than observed;
- Vite `/rpc` streaming is not proven by body-reader/chunk timing;
- event watch retry is default-only;
- a spike fixture remains beside production tests without promotion/deletion evidence;
- negative searches find alternate event transport or stale helper use.

## Packet Acceptance Evidence

Review:

- Transport/API and client retry: accepted by Curie.
- Effect cleanup and testing proof: accepted by Nietzsche after D7-R1/D7-R2 repairs.
- Hardening/black-ice/downstream: accepted by Darwin.

Verification:

- `bun run openspec -- validate mapgen-studio-stream-spike --strict` passed.
- `bun run openspec:validate` passed 151/151.
- `git diff --check` passed.
- Dirty-file quarantine before commit: only D7 packet docs are dirty.

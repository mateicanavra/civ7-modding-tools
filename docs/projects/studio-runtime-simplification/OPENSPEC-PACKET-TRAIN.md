# Studio Runtime Effect Refactor OpenSpec Packet Train

Status: active packet-authoring control record
Date: 2026-06-14
Branch: `codex/runtime-effect-openspec-packets`
Parent frame: `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md`

## Objective

Create implementation-ready OpenSpec workstream packets for every domino in the Studio runtime Effect refactor frame, D0 through D12, with each packet reviewed and accepted before the next packet is treated as ready.

The packet train is a design-and-specification initiative, not implementation. Its output is a complete set of OpenSpec changes that future implementers can pick up without rediscovering authority, ownership, file structure, test strategy, or deletion obligations.

## Hard Core

- The runtime refactor frame is the controlling authority for this packet train.
- One domino maps to one OpenSpec change identity and one future Graphite slice identity.
- Packets describe system components, not isolated functions.
- TypeBox is the Studio public contract schema origin after the TypeBox spine domino.
- Effect owns runtime resource lifecycle, operation state, concurrency gates, background workers, expected failures, and disposal semantics after the runtime-service dominoes.
- The accepted migrated Nx/Habitat baseline is the implementation base for runtime packets that depend on dev orchestration, package gates, Biome, or GritQL. A pre-Nx checkout is a classification finding and stop/reroute condition, not a supported implementation lane.
- No packet may encode a long-lived fallback, shim, dual path, optional target shape, or "for now" bridge. A bridge can exist only when the same packet names the deletion slice and guard.
- Testing is falsification-first and layered: contract/schema, service/lifecycle, integration, scenario/state-machine, dev-process, and live proof where the claim requires Civ7.
- Worktree operations use the official git-worktree/repo path. New worktrees are not created ad hoc.
- Every worktree entrance requires dependency install and an appropriate build/check baseline before validation results are trusted. On the accepted migrated baseline, that means repo-local Nx/Habitat targets, not Turbo-era substitutes.

## Exterior

- This packet train does not implement D0-D12 code changes.
- It does not merge or drain Graphite stacks.
- It does not rewrite generated artifacts.
- It does not promote runtime rules into evergreen docs except where a packet explicitly requires a later implementation slice to do so.

## Falsifier

The packet train must be reframed if a reviewed packet needs an unowned compatibility path, leaves a runtime mutation surface unclassified, cannot name the owning service/package for a state transition, cannot define an oracle for a high-risk failure mode, or depends on a baseline toolchain that is not present on the selected implementation base.

## Branch And Baseline Policy

Current branch: `codex/runtime-effect-openspec-packets`, stacked above `codex/runtime-effect-refactor-frame`.

Historical local packet-authoring evidence captured before the Habitat/Nx settlement on 2026-06-14:

- `bun install --frozen-lockfile` passed.
- `bun run build` passed on the historical pre-settlement baseline.
- `bun run openspec -- list` passed after dependency install.
- `bun run openspec -- validate mapgen-studio-runtime-one-mount --strict` passed.
- The build rewrote a tracked generated intelligence-bridge UI bundle; that generated churn was reverted because it is not part of this packet train.

Post-Habitat/Nx settlement implementation baseline:

- The accepted baseline is the settled Habitat/Nx stack, with Nx declared in root dev dependencies, root build/check/lint/test/verify scripts entering the Nx DAG, and no Turbo, `bunx nx`, shim, symlink, direct `node_modules` binary, daemon/cache bypass, or routine cache-reset command path.
- Runtime implementation work must use the root Nx/Habitat contract present on the selected worktree. Repo-local Nx targets selected by Habitat/classification own dependency ordering and closure authority; direct package-local scripts may be focused additional evidence only, not substitutes for graph-owned gates.
- `bun run build`, `bun run verify`, and the relevant package/app gates are the normal baseline proofs. `bun run lint` is graph-owned and may fail on locked Habitat/Grit rule debt; such failures are architectural enforcement findings, not evidence that runtime packets should bypass Nx.
- Scout evidence remains recorded in `openspec/changes/mapgen-studio-runtime-one-mount/workstream/nx-habitat-scout-report.md`, but any pre-settlement Turbo or `bunx nx` command text is historical evidence only.

## Review Lanes

Each packet gets only the lanes needed for its risk, selected from:

- Architecture boundary: package ownership, service boundaries, imports/exports, generated/source ownership.
- Runtime lifecycle: Effect `Layer`, `Scope`, `ManagedRuntime`, fibers, queues/semaphores, disposal, backpressure.
- TypeScript/schema: TypeBox origin, Standard Schema adapter ownership, DTO privacy, ADT projection, no Zod residue.
- Testing strategy: falsification-first oracles, boundary cases, state-machine/scenario coverage, adequacy criteria.
- Dev-platform: Nx/Bun-native orchestration, watch graph, continuous tasks, Biome/GritQL gate placement.
- Product/runtime: Play, Save/Deploy, Autoplay, live-game truth, terminal toasts, recovery hints.
- Direct-control/game door: sanctioned session owners, raw protocol boundaries, proof classifications.
- Adversarial complexity/orphan: no hidden ambiguity, no bridge without deletion, no unclassified surface.

Accepted P1/P2 findings block packet acceptance until repaired, rejected with source evidence, or explicitly moved outside the packet's closure boundary with owner and re-entry trigger.

## Systematic Prework And Hardening Protocol

Every remaining packet, D3 through D12, must run as a Civ7 systematic workstream phase before it is accepted:

- **Gate 1 - frame:** record objective, exterior, hard core, falsifier, proof labels, review lanes, write set, and closure boundary in the packet phase record.
- **Gate 2 - repo state:** record branch/worktree/stack position, dirty-file quarantine, selected baseline, and dependency/build entrance evidence before trusting packet validation.
- **Gate 3 - diagnosis:** name the current failure mode or architectural residue from code/docs/tests/history before specifying the future component.
- **Gate 4 - corpus/action surfaces:** enumerate the full endpoint, event, operation, state, process, file, or runtime surface corpus the packet owns.
- **Gate 5 - grouping:** group surfaces by owner, consumer, state/lifecycle shape, and verification strategy without hiding per-surface obligations.
- **Gate 6 - expectations:** predeclare expected behavior, legality, lifecycle, failure, latency, or schema behavior before assigning tests.
- **Gate 7 - architecture translation:** name owning packages/modules, forbidden owners, public/private boundaries, Effect services/layers/resources, and TypeBox/orpc surfaces.
- **Gate 8 - slice plan:** ensure the packet is one OpenSpec change and one future Graphite branch, with implementation tasks rather than design questions.
- **Gates 9-10 - proof labels:** separate OpenSpec validation, package tests, integration/scenario tests, dev-process proof, runtime proof, live proof, and product proof.
- **Gate 11 - review:** run fresh peer reviews for the risk lanes. At least one reviewer must be briefed in the dev harden milestone/prework sweep philosophy, and at least one reviewer must hunt black ice using the disambiguation model.
- **Gate 12 - closure:** close only when tasks, phase record, review ledger, proof labels, downstream assumptions, and Graphite/worktree state agree.

Each packet must also include a `workstream/prework-ledger.md` unless the phase record explicitly explains why the packet has no implementation pre-work. The ledger distinguishes:

- packet-authoring pre-work already completed;
- implementation pre-work that must be completed before code edits;
- peer-agent pre-work lanes that can be assigned without forcing the implementer to rediscover scope;
- black-ice decisions that were resolved, and any human decision that truly remains.

Black-ice review is not a style pass. It blocks acceptance when the packet contains hidden optionality, broad fallback/compatibility paths, unclear owners, unbounded bridges, "later/for now" exits, proof inflation, or pass/fail language without an oracle.

## Domino Acceptance Ledger

| Domino | OpenSpec change | Packet status | Acceptance owner note |
| --- | --- | --- | --- |
| D0 | `mapgen-studio-runtime-one-mount` | accepted | Baseline and artifact classification packet over existing completed one-mount change; accepted after architecture/baseline and testing/adversarial reviews. |
| D1 | `mapgen-studio-dev-watch-deploy-isolation` | accepted | Watch-graph isolation packet accepted after dev-platform, runtime/watch-graph, and testing/adversarial review; requires contract-only recipe source surface, transitive daemon import graph/write-set proof, exact repo-local Nx deploy target, and same-operation live phase proof. |
| D2 | `mapgen-studio-engine-effect-corpus` | accepted | Runtime corpus packet accepted after app-hosted engine, control-oRPC/direct-control authority, and adversarial omission/testing reviews; requires active `StudioEngineError` bridge, live-game read model, operation phase/projection artifacts, retained control-oRPC state machines, and re-entry triggers to stay classified through D3-D12. |
| D2.5 | `mapgen-studio-contract-typebox-spine` | accepted | Contract TypeBox spine packet accepted after schema/testing/adversarial, hardening/prework, and black-ice reviews; requires adapter origin recovery, canonical operation DTO reuse, app-local DTO/cast removal, stale Zod/app-source comment removal, router-only effect-orpc ownership, raw-control open-input proof, and same-stack D3 guard for permissive error details. |
| D3 | `mapgen-studio-error-spine` | accepted | Error spine packet accepted after schema, Effect/lifecycle, testing, hardening/prework, and black-ice reviews; requires D3 implementation to delete production status-code bridge errors, seal TypeBox failure data/reason codes/recovery actions, map lifecycle variants deterministically, cover Autoplay failed outcomes, preserve defect containment outside workflow failure unions, and run Studio/control package gates or untouched-package dispositions. |
| D4 | `mapgen-studio-engine-runtime-services` | accepted | Operation runtime service packet accepted after runtime ownership, Effect/lifecycle, TypeScript/schema, testing/parity, and hardening/black-ice reviews; requires scoped `StudioOperationRuntime`, runtime-owned identity/gate/registries/TTL/current/events, interrupt-and-project disposal, post-disposal admission rejection, runtime-owned duplicate Run in Game fingerprint idempotency, bounded app leaf adapter ports, poison-callback handler proof, all-public-surface ADT privacy, and negative gates for app lifecycle/DTO/patch/fingerprint ownership. |
| D5 | `mapgen-studio-pipeline-effect-services` | accepted | Pipeline Effect services packet accepted after workflow/lifecycle, game-wire/TypeBox, testing/parity, hardening/prework, black-ice, and narrow repair re-reviews; requires package-owned `RunInGameWorkflow`, `SaveDeployWorkflow`, and `AutoplayWorkflow`, pinned workflow/port topology, scoped Effect finalizers before terminal completion, real D4 managed-runtime tests with fake D5 ports, shared `Civ7TunerSession` game-wire routing, explicit public mutation guard corpus for Studio and control-oRPC `risk: "mutation"` procedures, closed TypeBox raw-tunnel rejection, app-host deletion to composition/ports, and D12 game-door handoff evidence. |
| D6 | `mapgen-studio-operations-current` | accepted | Operations current packet accepted after runtime lifecycle, browser recovery deletion, TypeBox/testing, and hardening/black-ice repair reviews; requires terminal-only recent semantics, exact D4/D3 lifecycle matrix for expired-known/pruned/never-known/identity-mismatched ids, D4 `StudioOperationRuntime.current` ownership, one-shot boot adoption through `operationAdoption.ts`, deletion of browser operation recovery storage and request-id replay, protected authoring/preset/theme storage owners, recoverable TypeBox `TSchema` origin with canonical operation DTO reuse, and D8/D9 event-hook protection. |
| D7 | `mapgen-studio-stream-spike` | accepted | Stream transport decision packet accepted after transport/API, Effect cleanup/testing, and hardening/black-ice/downstream reviews; selects `effect-orpc` `.effect()` plus `eventIterator(...)` on the one `/rpc` route, TypeBox event schema origin, Effect PubSub scoped async-iterator bridge, `experimental_liveOptions` with actual watch-path nonzero retry, separate iterator-close/abort/interruption/repeated-close cleanup proofs, two-ordered-chunk Vite stream passthrough proof, and D8/D9 spike-fixture promotion/deletion obligations. |
| D8 | `mapgen-studio-event-hub` | accepted | Event hub packet accepted after prework, hardening/black-ice, and testing/vendor-alignment review repairs; requires one daemon-owned `StudioEventHub`, TypeBox `hello | operation | live-game` event union through the owned Standard Schema adapter, `studio.events.watch` on the existing `/rpc` route with D7 `.effect()` plus `eventIterator(...)`, immediate `hello` with daemon identity, observable cleanup proof for close/abort/interruption/shutdown/repeated cycles, actual watch-path nonzero retry through `experimental_liveOptions`, `hello` re-adoption through D6 `studio.operations.current`, D7 spike fixture promotion/deletion, and D9/D10 deletion ownership for operation polling/watchdog and live-game browser cadence. |
| D9 | `mapgen-studio-operations-push` | accepted | Operations push packet accepted after prework, hardening/black-ice, and testing/vendor-alignment review repairs; requires Run in Game and Save&Deploy transition publication through D8 `StudioEventHub`, production daemon composition proof that EventHub is supplied, publisher failure as diagnostics-only with no retained polling path, pushed operation event application in the client event hook, terminal toast parity for adopted versus live pushed terminal operations, deletion of `useOperationStatusPolls`, polling-only `StudioShell` 404/status-miss handling, hidden Save/Deploy sleep/status loop, `useDaemonInstanceWatchdog`, and client `serverInfo` identity polling, with D10 owning live-game cadence deletion and D12 owning retained public/manual status endpoint classification. |
| D10 | `mapgen-studio-live-game-watch` | accepted | Live-game watch packet accepted after prework, hardening/black-ice, and testing/vendor-alignment review repairs; requires an Effect-scoped daemon runtime `StudioLiveGameWatcher`, TypeBox `live-game` event payload inside the D8 `StudioEvent` union, shared `Civ7TunerSession` production composition proof, first/change-only publication with unchanged/clock-only quiet behavior, client pushed live-game state application, event-triggered request/response snapshot/setup follow-ups with stale/newer-event guards, deletion of browser live-status cadence across timers/status callers/readiness cadence/polling hooks/refetch intervals, live Civ7 proof when available, and a not-green `next-packet.md` when live proof is unavailable. |
| D11 | `mapgen-studio-nx-dev-runner` | accepted | Nx dev runner packet accepted after prework, hardening/black-ice, and testing/Nx-native review repairs; requires the accepted Nx/Habitat baseline as an implementation base, repo-local Nx `mapgen-studio:dev` topology with continuous backend daemon serve and frontend dev dependency, generated/build freshness through Nx target dependencies or workspace watching, hard deletion of `devLive.ts` and its app-local child-process supervisor/tests, no daemon `bun --watch`, no active Turbo local-dev route, process proof showing one Nx-owned backend and one Nx-owned frontend, phase-sampled Play and Save&Deploy stable `serverInstanceId` proof under Nx dev, D1 import/write isolation preservation, deployment-only Turbo residue classification for D12 or deployment follow-up, and not-green `next-packet.md` when live Civ7 proof is unavailable. |
| D12 | `mapgen-studio-game-door-invariant` | accepted | Game-door invariant closeout packet accepted after direct-control/prework, hardening/black-ice, testing/schema/runtime, and final corpus review repairs; requires evergreen game-door invariant, exact production `Civ7DirectControlSession` constructor guard, TypeBox/Zod contract closeout, retained public/manual status endpoint corpus with diagnostic, mutation-state, and identity classifications, `@civ7/control-orpc` procedure-key/risk corpus, hosted controller bridge proof classification, `RunInGameHttpError` and `StudioEngineError` bridge residue disposition, tuner-session follow-up closeout, active docs/OpenSpec residue searches, final proof ledger, and Graphite submit/merge/sync/drain proof. |

## Packet Definition Of Ready

A packet is ready when:

- `proposal.md`, `design.md`, `tasks.md`, and spec deltas exist and agree.
- Workstream records exist under `openspec/changes/<change-id>/workstream/`.
- Required owners, forbidden owners, write set, protected paths, dependencies, enabled parallel work, stop conditions, and downstream realignment are explicit.
- Tasks are implementation steps, not design questions.
- Every high-risk behavior has a test oracle and adequacy criterion.
- Shortcut scan passes for target strategy language.
- Fresh review lanes have no unresolved P1/P2 finding.
- Dependency install, baseline build/check, and `bun run openspec -- validate <change-id> --strict` pass on the accepted implementation base. A missing repo-local tool is an entrance blocker, not a packet acceptance exception.

## Packet Definition Of Accepted

A packet is accepted when:

- The packet definition of ready is satisfied.
- Review disposition ledger has no unresolved material finding.
- Any packet repairs were re-reviewed where the repair affected scope or proof.
- The packet's downstream assumptions are recorded.
- The packet can be handed to an implementer without chat context.

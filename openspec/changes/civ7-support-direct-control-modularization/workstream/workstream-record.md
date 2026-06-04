# Civ7 Support Direct-Control Modularization Workstream

## Watcher Correction Disposition - P1 Controller Bridge Substrate

Status: dispositioned in this support workstream's planning records; still
planning evidence only and not controller/runtime proof.

The main repo accepted a controller bridge substrate correction at
`c7111b120e92e80ccc9e944442020d9e1d5674c7`:
`docs(civ7): align controller bridge substrate`. Read
`/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/docs/projects/civ7-intelligence-layer/workstream/direct-control-game-controller-bridge/supervisor-notice.md`
before any downstream bridge, AI-ingestion, semantic CLI, telemetry,
schema/procedure-core, or Effect/oRPC planning depends on this support
workstream.

This pass repairs the stale support records and records the corrected model:
the in-game controller mod API is an in-process oRPC/Effect callable router
loaded through Civ7 native `scope="game"` `UIScripts`;
`Civ7IntelligenceBridge.invoke(...)` is serialized ingress through the existing
tuner/App UI command boundary into that router; oRPC/Effect is the shared
substrate for the game controller, external direct-control bridge, and future
AI services.

This is not a controller implementation, runtime proof, play-thread action,
Studio HTTP/RPCLink foregrounding, hand-maintained App UI method table, or ad
hoc JSON-envelope product API. Future controller/AI/oRPC work still needs
owners, schemas/tests, proof boundaries, and accepted tasks before
implementation.

## Frame

- Objective: migrate accumulated Civ7 play-support behavior from monolithic CLI
  tests and large direct-control source into focused CLI ownership, stable
  direct-control atoms, semantic CLI player-agent envelopes, and later
  Effect/oRPC composition over those atoms.
- Hard core: player-unblocking authority remains available; proof boundaries
  stay honest; relationship/suzerain labels require official evidence.
- Exterior: no play-thread wakeups while gameplay is parked; no runtime proof
  claims from local tests; no transport-first oRPC; no normal play-command dumps
  of internal service JSON; no generated-output edits.
- Falsifier: implementation starts without corpus/task ownership; dirty user
  notes are committed or lost; monolith coverage is duplicated; direct-control
  behavior changes without focused tests/proof; CLI hierarchy rewrites expose
  transport/proof internals as normal play output; relationship labels outrun
  official evidence.

## Current State

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-watch-civ7-live-play-reference-assembly`
- Stack tip when opened: `codex/add-systematic-workstream-skill-to-support-stack`
- Skill import commit: `0abccba10 docs(skills): add systematic workstream skill`
- Skill review-fix commit:
  `66f9af202 docs(skills): apply systematic workstream review fixes`
- OpenSpec base commit:
  `d2c01f03b docs(openspec): add support modularization workstream`
- Prior test-modularization tip: `4c02bfe71 test(cli): extract dismiss notification queue play tests`
- Gameplay: parked; no play-thread verification requested.

## Protected User Notes

Treat stash messages and paths as authoritative over indices:

- `preserve user direct-control modularization note before dismiss queue slice`
  - `packages/civ7-direct-control/src/index.ts`
- `preserve user effect stream fixture note before notification queue slice`
  - `packages/cli/test/commands/fixtures/tuner-socket-server.ts`
- `preserve user tuner fixture typing note before next play slice`
  - `packages/cli/test/commands/fixtures/tuner-socket-server.ts`
- `preserve user deeper play hierarchy note before ready-unit closure`
  - `packages/cli/test/commands/game/play/NOTE.md`
- `preserve user host-port fixture note before unit-move closure`
  - `packages/cli/test/commands/game/play/unit-move-preview.test.ts`
- `preserve user test-organization note before settlement slice closeout`
  - `packages/cli/test/commands/NOTE.md`

## Parallel Agent Assignments

All launched report-only threads must be read and dispositioned before their
topic is treated as closed. Query failure is not absence; use thread ids,
titles, and parent reports to close the loop.

| Thread id                                                                             | Title                                       | Wave                          | Status                                                                               | Report read                                 | Disposition                                                                                                                                                             | Contribution / follow-up                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `019e8ac1-b9c2-7b22-a1a8-2ef9f8af9e7a`                                                | Audit systematic workstream skill           | older pre-framing             | completed, archived                                                                  | yes                                         | Accepted: full reviewed skill is present above `66f9af202`; no new import needed.                                                                                       | Resolves skill-presence blocker; agents parked below `66f9af202` must move upstack.                                                                                                                                                                                    |
| `019e8ac3-b214-7540-a320-309c5f5482ee`                                                | Inventory CLI play tests                    | older pre-framing             | completed, archived                                                                  | yes                                         | Accepted as informal inventory; superseded/confirmed by framed CLI thread.                                                                                              | Confirms monolith owners and order: exact dismiss, HUD, priorities.                                                                                                                                                                                                    |
| `019e8ac3-b28f-70c2-a98a-60213f5238ec`                                                | Inspect direct-control atoms                | older pre-framing             | completed, archived                                                                  | yes                                         | Accepted as informal inventory; superseded/confirmed by framed direct-control thread.                                                                                   | Seeds atom boundaries, runtime-proof classes, and user TODO stash cautions.                                                                                                                                                                                            |
| `019e8ac3-b2ca-7b53-910a-bc6286c4d04b`                                                | Plan Civ7 support refactor                  | older pre-framing             | completed, archived                                                                  | yes                                         | Accepted review findings; concrete P2 blockers recorded in disposition ledger.                                                                                          | Repairs missing authority ref, stale validation state, baseline-task overclaim, and oRPC authority caveat.                                                                                                                                                             |
| `019e8ac9-2992-73f2-b9dd-0226205390c5`                                                | Investigate CLI play topology               | framed `/goal`                | completed, archived                                                                  | yes                                         | Accepted as current CLI corpus evidence.                                                                                                                                | Provides exact test names, fixture strategy, focused/adjacent gates, and relationship-label scans.                                                                                                                                                                     |
| `019e8ac9-296c-74a3-9d30-f4e3a4f51545`                                                | Investigate direct-control atoms            | framed `/goal`                | completed, archived                                                                  | yes                                         | Accepted as current direct-control corpus evidence; source edits remain blocked.                                                                                        | Provides source regions, proposed owners, forbidden owners, needed tests, and proof boundaries.                                                                                                                                                                        |
| `019e8ac9-2938-7a50-87b9-a1915f35d427`                                                | Review OpenSpec workstream                  | framed `/goal`                | completed, archived                                                                  | yes                                         | Accepted as current pre-code review.                                                                                                                                    | Confirms implementation remains blocked until row detail and single-writer gates are present.                                                                                                                                                                          |
| `019e8ad7-dc15-76a0-88f8-bb5210bfd7e9`                                                | Add notification HUD test                   | framed `/goal` implementation | completed, idle                                                                      | yes                                         | Accepted as boundary-clean net-new candidate only; proof was incomplete in the isolated worktree because `@civ7/direct-control` build artifacts were unavailable there. | Created local/mode-named `game/play/notification/hud.test.ts`; DRA performed single-writer monolith removal, package wiring, and final gates in the support worktree.                                                                                                  |
| `019e8ae4-8b20-79a0-8553-41b71bccb63f`                                                | Add priorities play test                    | framed `/goal` implementation | completed, idle                                                                      | yes                                         | Accepted as boundary-clean net-new candidate only; proof was incomplete in the isolated worktree because `vitest` was unavailable there.                                | Created local `game/play/priorities.test.ts` with priority HUD/ready-unit/ready-city/battlefield fixtures; DRA performed single-writer monolith deletion, package wiring, and final gates in the support worktree.                                                     |
| `019e8af1-0303-7ce2-b059-6178542f833e`                                                | Plan direct-control test boundaries         | framed `/goal` report-only    | completed, idle                                                                      | yes                                         | Accepted as package-test boundary evidence; no mutation authority.                                                                                                      | Identified one broad `packages/civ7-direct-control/test/direct-control.test.ts` suite, missing per-atom package tests, missing atom rows for map/setup/autoplay/turn/root/catalog surfaces, and recommended public API/primitives as first source-adjacent test slice. |
| `019e8af1-427e-7463-a9be-dbdeabbccfdf`                                                | Assess oRPC authority lane                  | framed `/goal` report-only    | completed, idle                                                                      | yes                                         | Accepted as authority disposition; no mutation authority.                                                                                                               | Historical finding: support previously lacked tracked `.agents/skills/civ7-orpc-control-architecture` and `packages/civ7-control-orpc`. Superseded by the 4.9 authority citation to `codex/civ7-orpc-control-architecture-skill`; implementation still remains downstream. |
| `019e8afb-f1c2-7a22-83b4-5d934658d92e`                                                | Add public API tests                        | framed `/goal` implementation | completed, idle                                                                      | yes                                         | Accepted as boundary-clean net-new candidate only; proof was incomplete in the isolated worktree because `vitest` was unavailable there.                                | Created pure `packages/civ7-direct-control/test/public-api.test.ts`; DRA performed broad-suite ownership removal and final package gates in the support worktree.                                                                                                      |
| `019e8b01-475a-7f70-a94d-b671fd61e013`                                                | Add unit move preview test                  | framed `/goal` implementation | completed, idle                                                                      | yes                                         | Accepted as boundary-clean net-new candidate only; proof was incomplete in the isolated worktree because `vitest`/`tsc` were unavailable there.                         | Created local `packages/civ7-direct-control/test/unit-move-preview.test.ts`; DRA corrected the limit-contract assertion and ran final package gates in the support worktree.                                                                                           |
| `pendingWorktreeId local:699af531-ba6e-49e6-8f36-021dd3e27721` / disk worktree `6e69` | Add session/framing package tests           | framed `/goal` implementation | candidate visible on disk; app thread read/archive tools unavailable in this session | yes, from disk candidate and worktree state | Accepted as boundary-clean net-new candidate only; DRA retained integration, broad-suite removal, docs, and final gates.                                                | Created local `packages/civ7-direct-control/test/session.test.ts`; DRA added health/env-host coverage, removed duplicate broad-suite assertions, and ran package gates in the support worktree.                                                                        |
| `pendingWorktreeId local:98a2e225-27e6-4423-abff-c2df614e9547` / disk worktree `ad4e` | Add ready-unit package test                 | framed `/goal` implementation | candidate visible on disk; app thread read/archive tools unavailable in this session | yes, from disk candidate and worktree state | Accepted as boundary-clean net-new candidate only; DRA retained integration, broad-suite removal, docs, and final gates.                                                | Created local `packages/civ7-direct-control/test/ready-unit-view.test.ts`; DRA kept fixture local and moved ready-unit ownership out of the broad suite.                                                                                                               |
| `pendingWorktreeId local:31e49457-5f92-4486-b597-624c44e5d18b` / disk worktree `0425` | Add ready-city package test                 | framed `/goal` implementation | candidate visible on disk; app thread read/archive tools unavailable in this session | yes, from disk candidate and worktree state | Accepted as boundary-clean net-new candidate only; DRA retained integration, broad-suite removal, docs, and final gates.                                                | Created local `packages/civ7-direct-control/test/ready-city-view.test.ts`; DRA preserved the city identity/source guard and moved ready-city ownership out of the broad suite.                                                                                         |
| `pendingWorktreeId local:e7685d6d-1350-4fe5-ab95-335382083cab` / disk worktree `27a4` | Add play notification view package test     | framed `/goal` implementation | candidate visible on disk; app thread read/archive tools unavailable in this session | yes, from disk candidate and worktree state | Accepted as boundary-clean net-new candidate only; DRA retained integration, broad-suite removal, docs, and final gates.                                                | Created local `packages/civ7-direct-control/test/play-notification-view.test.ts`; DRA kept fixture local and moved package notification-view ownership out of the broad suite.                                                                                         |
| `pendingWorktreeId local:f472e74a-276d-4749-ae16-346577f0a5e9` / disk worktree `598a` | Add notification dismissal package test     | framed `/goal` implementation | candidate visible on disk; app thread read/archive tools unavailable in this session | yes, from disk candidate and worktree state | Accepted as boundary-clean candidate with DRA correction; the child included a syntax bug and an extra stale-nonblocking case outside current package ownership.        | DRA integrated the package-owned dismissal cases only, preserved verification semantics, removed broad-suite dismissal ownership, and left CLI bulk-dismiss/stale-nonblocking policy outside this package-test slice.                                                  |
| `019e8b37-7b3c-7ca0-af2f-28fcbeb5bd51`                                                | Add diplomacy response package test         | framed `/goal` implementation | completed, reported up                                                               | yes                                         | Accepted as boundary-clean net-new candidate only; DRA retained integration, records, and final package gates.                                                          | Created `packages/civ7-direct-control/test/diplomacy-response.test.ts` with official-resource-backed assertions for notification activation, `RESPOND_DIPLOMATIC_ACTION`, leader acknowledgement, and diplomacy UI closeout.                                           |
| `019e8b37-b7bd-73f3-a5ff-63d8a1da3e60`                                                | Add narrative choice package test           | framed `/goal` implementation | completed, reported up                                                               | yes                                         | Accepted as boundary-clean net-new candidate only; DRA retained integration, records, and final package gates.                                                          | Created `packages/civ7-direct-control/test/narrative-choice.test.ts` with official-resource-backed assertions for `CHOOSE_NARRATIVE_STORY_DIRECTION`, popup/panel closeout, and validator-rejection no-send behavior.                                                  |
| `019e8b41-ba98-7e53-809f-571dd98f963c`                                                | Add settlement recommendations package test | framed `/goal` implementation | completed, reported up                                                               | yes                                         | Accepted as boundary-clean net-new candidate only; DRA retained integration, records, and final package gates.                                                          | Created `packages/civ7-direct-control/test/settlement-recommendations.test.ts` with official-resource-backed settlement lens read-shape assertions and no operation-send claims.                                                                                       |
| `019e8b41-f665-76a0-8a09-7aeb17eca4cf`                                                | Add progression reads package test          | framed `/goal` implementation | completed, reported up                                                               | yes                                         | Accepted as boundary-clean net-new candidate only; DRA retained integration, records, and final package gates.                                                          | Created `packages/civ7-direct-control/test/progression-reads.test.ts` for traditions view and progress dashboard read-only coverage.                                                                                                                                   |
| `019e8b42-4468-79f0-8a65-124aad4d794f`                                                | Add tactical reads package test             | framed `/goal` implementation | completed, reported up                                                               | yes                                         | Accepted as boundary-clean candidate with DRA correction: one destination-analysis assertion expected echoed input fields that the wrapper does not guarantee.          | Created `packages/civ7-direct-control/test/tactical-reads.test.ts`; DRA narrowed the destination assertion while preserving routed-input and relationship-policy checks.                                                                                               |
| `019e8b4a-0c0c-75b2-914b-928f25827122`                                                | Add setup/lifecycle package test            | framed `/goal` implementation | completed, reported up                                                               | yes                                         | Accepted as boundary-clean net-new candidate only; DRA retained integration, broad-suite removal, records, and final package gates.                                     | Created `packages/civ7-direct-control/test/setup-and-lifecycle.test.ts`; DRA moved setup/start ownership out of the broad suite while leaving restart/begin lifecycle as the last broad-suite owner.                                                                   |
| `019e8b4a-4300-7d42-bbc1-d9fc11317351`                                                | Add autoplay and turn package test          | framed `/goal` implementation | completed, reported up                                                               | yes                                         | Accepted as boundary-clean net-new candidate only; DRA retained integration, broad-suite removal, records, and final package gates.                                     | Created `packages/civ7-direct-control/test/autoplay-and-turn.test.ts` for autoplay approval/configure/start/stop plus turn-completion status/complete/unready coverage.                                                                                                |
| `019e8b4a-7c6a-7f42-9e48-b45a6d9da427`                                                | Add runtime and catalog package test        | framed `/goal` implementation | completed, reported up                                                               | yes                                         | Accepted as boundary-clean net-new candidate only; DRA retained integration, broad-suite removal, records, and final package gates.                                     | Created `packages/civ7-direct-control/test/runtime-and-catalog.test.ts` for runtime routing, snapshots, playable status, GameInfo rows, capability catalogs, official-resource scanner fixture, and fresh-log marker helpers.                                          |
| `019e8b68-ec12-7a20-bb90-2cf46574d189`                                                | Extract direct-control primitives           | framed `/goal` source candidate | completed, idle; disk worktree `9c68` dirty at old parent                            | yes                                         | Partially accepted by evidence. DRA integrated only the smaller ComponentID/error owner subset on current disk; broader constants/runtime/map/player/numeric candidate remains superseded planning evidence, not accepted code. | Candidate proved the direction but was too broad for the first source-owner slice and could not run tests in its isolated worktree. DRA kept package config/docs ownership and final gates in the support worktree.                                                     |
| `019e8b69-465d-7a71-8ef1-1f75f96799c2`                                                | Extract direct-control seams                | framed `/goal` source candidate | completed, idle; disk worktree `fd1b` dirty at old parent                            | yes                                         | Accepted as a narrow source candidate only. DRA integrated tuner frame encode/parse ownership on current disk after ComponentID/error moved first and reran package gates. | Contributed `src/session/framing.ts` boundary for `Civ7TunerFrame`, `encodeCiv7TunerRequest`, and `parseCiv7TunerFrame`; broader session/config/reconnect and restart/setup loops stay pending.                                             |
| `019e8b69-ae88-79f1-b5dd-dd530c2ea2bf`                                                | Identify read-only atoms                    | framed `/goal` report-only     | completed report read; later empty active turn observed; disk worktree `1044` clean  | yes                                         | Accepted as read-only planning evidence. No code candidate was integrated from this lane. Later refined finding supersedes its earlier ready-unit suggestion.             | Recommends `settlementRecommendationsSource` as the safest first read-only embedded-source relocation, followed by traditions, move-preview, progress dashboard, ready-unit, tactical reads, ready-city, and notification view last.                                    |
| `019e8be1-db1e-7c80-ad37-471a48cd520f`                                                | Identify first postcondition-helper slice   | framed `/goal` report-only     | completed, reported up                                                               | yes                                         | Accepted as sequencing guidance only; no mutation authority.                                                                                                               | Recommends the first postcondition-helper move be the synchronous unit-operation classifier group (`unitOperationPostcondition`, `classifyUnitOperationPostcondition`, `unitOperationPostconditionReason`) into `src/play/operations/unit-postconditions.ts`; narrative/diplomacy waiters stay later because they pull in notification matching, polling, and App UI reader dependencies. |
| `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc`                                                | AI-intelligence target thread               | target-thread compatibility evidence | directly readable in this planning repair                                        | yes                                         | Accepted as planning evidence only; closes the earlier direct target-thread access gap without authorizing implementation or runtime proof claims.                         | Frames intelligence as broader than live CLI play: live hotseat player-agent control, strategy/playbook/cookbook generation from human play patterns, and possible static native-AI profile shaping through generated SQL/XML profiles. Requires stable direct-control atoms, semantic state products, action/proof telemetry, and structured machine-ingestion contracts instead of raw `game exec` strings or normal CLI presentation text. |
| `019e86b7-b08b-72f3-8341-6c78a1285c93`                                                | Hotseat/autoplay foundation target thread   | target-thread compatibility evidence | directly readable in this planning repair                                        | yes                                         | Accepted as planning evidence only; hotseat activation/local-player rotation and operation proof remain live runtime gates.                                                | Confirms hotseat/local-player handoff as the leading one-client player-agent base when activation proof passes, keeps local multiplayer as setup/staging evidence under the one-client constraint, and keeps native Autoplay as support/debug infrastructure rather than the primary external-agent executor. |
| `019e8cbe-b9a2-7603-8fc6-ea9387fbbd3b`                                                | AI-intelligence model implications          | report-only compatibility wave | completed; read directly in this planning slice                                      | yes                                         | Accepted as planning evidence only; now cross-checked against direct target-thread evidence.                                                                              | Confirms two authority sides: live external play through `@civ7/direct-control` and static native-AI profile shaping through generated SQL/XML profiles. Requires turn/player context, decision HUD, tactical lenses, action records, proof telemetry, corpus records, enriched evidence from `GameInfo`, debug DB copies, scoring/logs, Mods.sqlite/profile context, and bounded AI/log CSVs where available. |
| `019e8cbf-0138-75d1-9edc-0bda7d413dff`                                                | Hotseat/autoplay base requirements          | report-only compatibility wave | completed; read directly in this planning slice                                      | yes                                         | Accepted as planning evidence only; hotseat runtime claims remain unproved until live gates pass.                                                                        | Confirms one-client hotseat as preferred player-agent base if activation proof passes; direct-control may act only when `GameContext.localPlayerID` is agent-owned. Native `Autoplay` is support infrastructure for smoke tests, native-AI measurement, observer/wait loops, and disposable benchmarks, not the primary external-agent executor. |
| `019e8cbf-5805-7393-82e8-c83353aeac40`                                                | AI/hotseat synthesis review                 | report-only compatibility wave | completed; read directly in this planning slice                                      | yes                                         | Accepted as planning evidence only; no intelligence-layer, transport, or runtime-proof implementation authorized.                                                        | Recommends making `@civ7/direct-control` the stable live-control substrate for hotseat player-agent turns and AI intelligence ingestion; adds matrix fields `playerScope`, `consumerClass`, `evidenceClass`, `procedureCandidate`, `normalCliProjection`, and `debugServiceProjection`, plus action audit vocabulary and proof-label requirements. |
| `019e8d01-441f-79d1-afd7-fe40a3c179e6`                                                | Compatibility matrix gap audit              | report-only peer review        | completed; read directly in hard-gate repair                                         | yes                                         | Accepted as P1 planning repair input; matrix was not hard enough without row-level acceptance fields, proof labels, blocking dependents, and stop conditions.              | Requires explicit matrix row fields: foundation/model thread ids, dependency direction, owners, projections, proof label, acceptance status, blocking dependents, and stop condition. |
| `019e8d01-4382-7da3-bb81-2f322ed739e2`                                                | Hotseat foundation constraint review        | report-only peer review        | completed; read directly in hard-gate repair                                         | yes                                         | Accepted as P1 planning repair input; hotseat remains the lower one-client foundation and not an implemented runtime claim.                                                | Preserves one-client hotseat, agent-slot local-player mutation gating, human-turn refusal, human-visible waiting/restoration, Autoplay as support/debug only, and approval/proof boundaries. |
| `019e8d01-3fc8-74d2-9658-451d3b0e38f8`                                                | AI-consumer compatibility review            | report-only peer review        | completed; read directly in hard-gate repair                                         | yes                                         | Accepted as P1/P2 planning repair input; AI-intelligence is aligned above hotseat but implementation owners/schemas/tests remain open.                                     | Requires semantic CLI envelopes, separate debug/internal outputs, explicit telemetry evidence, prospective source-labeled corpus/model ingestion, direct-control-only live action authority, and procedure cores over stable atoms rather than raw command tunnels. |

## Parallelization Rule

Agents may use separate worktrees or a shared visible worktree, but every lane
must have a disjoint write set before editing. The spec owner coordinates
Graphite; no lane may restack, submit, or mutate unrelated stacks. `package.json`
play-script wiring and `packages/cli/test/commands/game.play.test.ts` are
single-owner files for each active slice.

## DRA Correction Channel

Direct thread communication is the primary channel for supervisor/watcher
corrections to the active DRA thread. If direct thread access is unavailable,
that is not a silent failure condition: keep trying the direct thread path. If a
material correction still cannot be delivered after repeated attempts, write a
visible fallback `NOTE-TO-DRA.md` in the DRA/workstream tree that includes the
missed correction payloads, not just a note that communication failed. When
direct thread access returns, read and disposition the fallback note, send any
still-relevant correction directly, then remove or mark the note resolved
according to repo hygiene. Do not send unresolved DRA correction payloads only
back to user chat when the intended recipient is the DRA thread.

## Service And CLI Surface Rule

`@civ7/direct-control` is the internal control service for CLI, Studio, and
future oRPC procedure cores. It may carry rich structured data for connection
state, route selection, validation, postcondition closeout, proof artifacts,
correlation, and transport diagnostics.

The normal CLI play hierarchy is a semantic local API/view for player agents.
It should project service results into game-relevant state, blockers, decisions,
safe/unsafe actions, and next steps. It should not return the full internal
service JSON payload unless the command or flag is explicitly debug-owned.
Connection and transport state should appear as useful state-machine status, not
as raw plumbing detail.

## Effect/Bun Integration Rule

Effect is a core implementation direction for new/refactored direct-control
logic, procedure cores, and relevant tests. Future source lanes should plan
resource acquisition/release, sockets, buffers, streams, schedules, errors,
layers, and concurrency around Effect affordances where they fit. Bun-native
APIs should be preferred over Node APIs in new/refactored control code except
where Node is the only practical or clearly superior implementation. This does
not replace the existing oclif CLI shell with Effect CLI.

The current setup/restart readiness waits and session helpers may continue as
explicit dependency injection while modularization stabilizes atoms. A later
accepted Effect/Bun lane should decide whether those waits become scoped
resources, schedules, layers, or typed errors; source cleanup slices should not
hide that decision by prematurely absorbing lifecycle wait composition.

## Hotseat And AI-Intelligence Compatibility Rule

The direct-control atom lane must now plan for two first-class downstream
consumers: live player-agent hotseat/autoplay control and the AI-intelligence
strategy-data layer. The hotseat/autoplay thread
`019e86b7-b08b-72f3-8341-6c78a1285c93` is the control foundation; the
AI-intelligence model thread `019e8b5a-f2ee-7ea2-96bc-8c07dc5ab6cc` is the
higher-level data consumer.

Future CLI semantic envelopes, debug/internal service outputs, operation/proof
telemetry, and Effect/oRPC procedure cores must support both without collapsing
their surfaces together. Normal CLI play output remains player-agent semantic
state and action affordances. Machine-ingestion contracts should be structured
and stable, not presentation strings. Raw transport, session, closeout, and
proof machinery remains internal service or explicit debug-owned output.

This branch records the direction and peer-report disposition only. The peer
report threads above are now read directly in this planning slice, with the
earlier supervisor packet retained only as corroborating control input. That
closes only the report-disposition blocker. It does not close hotseat runtime
proof, AI data-ingestion design, CLI semantic-surface implementation, telemetry
source work, or Effect/oRPC procedure-core work.

Compatibility matrix execution gate: Lane G is a live hard gate, not merely
planning evidence. Task 2.9 remains open until matrix rows are accepted with the
required fields: `foundationThread`, `modelThread`, `dependencyDirection`,
`surface`, `primaryConsumer`, `sourceOwner`, `proofOwner`, `playerScope`,
`consumerClass`, `evidenceClass`, `procedureCandidate`, `normalCliProjection`,
`debugServiceProjection`, `proofLabel`, `acceptanceStatus`,
`blockingDependents`, and `stopCondition`. Before acceptance, dependent command
hierarchy, semantic envelope, telemetry, schema/type ownership, runtime-status
projection, debug/internal service output, AI data artifact, Effect/Bun, and
oRPC procedure-core implementation remain blocked. Normal CLI play output
remains semantic player-agent state/action affordances; AI ingestion consumes
stable machine-readable state/action/proof records; raw transport/session/proof
details remain debug/internal service projection unless an explicit debug-owned
surface says otherwise.

Gate-state row: Lane G / AI-on-hotseat compatibility matrix is `acceptanceStatus:
pending-row-acceptance`; `proofLabel: planning-evidence-only`;
`blockingDependents: 5.1-5.7, 6.1-6.9, semantic telemetry, AI ingestion,
runtime-status projection, debug/internal service output, schema/type ownership
used by procedure cores`; `stopCondition: stop if any blocked dependent starts
before accepted matrix rows, if rows collapse normal CLI/debug/AI/telemetry/
procedure consumers, if evidence classes collapse, if Autoplay becomes the
primary external-agent executor, or if direct-control can act on non-agent human
turns`.

Matrix row materialization: `workstream/compatibility-matrix.md` now records
the live gate rows for hotseat handoff state, semantic CLI player-agent view,
strategy/intelligence ingestion, debug/internal service output,
operation/proof telemetry, and Effect/oRPC procedure cores. These rows are
pending rows, not accepted rows: source owners, proof owners, schemas/tests,
and several runtime or contract proof boundaries remain unassigned. Task 2.9.4
therefore remains open, and dependent implementation stays blocked.

Matrix acceptance backlog: `workstream/compatibility-matrix.md` now also
records the row-by-row owner/proof assignments and proof evidence missing
before acceptance. The backlog is intentionally not an implementation plan
closure: hotseat runtime proof, semantic CLI envelopes, AI-ingestion contracts,
debug/internal service boundaries, operation/proof telemetry contracts, and
Effect/oRPC procedure cores remain pending until their rows have accepted
owners, schemas/tests, proof boundaries, and stop-condition coverage.

The action/proof vocabulary for future machine-ingestion and procedure-core
surfaces is: strategy intent, candidate action, operation family, target, args,
approval, validation result, send result, post-read, `requestId` or correlation
id, evidence policy, approval reason, `validation_pre`, `send_receipt`,
`validation_post`, `outcome_delta`, and stale/unknown classification. The
largest design risk is training or acting on vague `verified: true` flags
instead of explicit outcome evidence.

App UI bridge boundary: target-thread synthesis now records
`globalThis.Civ7IntelligenceBridge.invoke(...)` as serialized ingress through
the existing tuner/App UI command boundary into an in-process oRPC/Effect
callable router loaded through Civ7 native `scope="game"` `UIScripts`. It is
not product action authority, not a hand-maintained App UI method table, not an
ad hoc JSON-envelope product API, and not a substitute for lifecycle
certification, method allowlists, approval tokens, local-player/hotseat
identity checks, semantic outcome checks, or live runtime proof. oRPC/Effect is
the shared substrate for the game controller, external direct-control bridge,
and future AI services.

Recommended future intelligence artifacts are `StrategyPlan`,
`ActionCandidate`, `ProfileRecipe`, `LoadedRowProof`, `RunMetric`, and
`PromotionDecision`. These are planning names only until an AI-intelligence lane
assigns owners, schemas, sources, and tests.

Hotseat product claims require live runtime gates before they are treated as
proved: menu/setup hotseat snapshot, disposable hotseat activation, two-slot
local-player rotation, curtain/interface restoration, one approved agent-slot
operation, turn-complete/human-restoration, fallback non-local operation probes
only if hotseat fails, and bounded autoplay measurement proof.

## Agent Framing Protocol

All future agent waves must be framed before delegation:

- Use framing design to state context, objective, hard core, exterior,
  falsifier, required skills, evidence expectations, write-set permissions, and
  return format.
- Treat agents as peer investigators or implementers with explicit evidence
  outputs, not generic helpers.
- Choose reasoning level by task: lower for mechanical inventory, higher for
  architecture, proof, or synthesis.
- Include a `/goal` prefix in instructions for long-running investigation or
  implementation objectives.
- Prefer fresh agents for new topics.
- Reuse an existing agent only when its previous context is intentionally useful.
  If reusing while switching topics, send `/compact`, wait for completion, then
  send the new framed instruction.
- State whether the agent is report-only or may mutate files. Mutating agents
  need disjoint write sets and explicit Graphite constraints.
- For core operation/control investigations, tell agents to consult synced
  official Civ7 resources, relevant live-play topic docs, and read-only runtime
  `GameInfo`/CLI checks when those sources can reveal a better native path. Only
  prefer a different path when behavior clearly matches or component parts are
  compatible; otherwise preserve current behavior and record uncertainty.
- Do not use or restore deprecated Windows VM/FireTuner bridge control paths for
  repo-owned operation work. FireTuner can remain reference-client/native-path
  evidence, but package/CLI behavior must use direct control rather than bridge
  logs, Windows scripts, or VM access.

## Gate State

- Gate 1: framed.
- Gate 2: repo isolated at skill review-fix commit before draft validation.
- OpenSpec validation: passed with
  `bun run openspec -- validate civ7-support-direct-control-modularization --strict`.
- CLI corpus ledger: report findings merged for remaining monolith owners;
  notification HUD and priorities rows completed with parallel candidate
  handoffs and DRA integration proof; `game.play.test.ts` monolith ownership is
  removed.
- Direct-control atom corpus: report findings merged for top-level atom
  boundaries, package-test gaps, and missing public-surface rows; source edits
  remain blocked until the target slice adds package-owned tests/API-shape
  coverage and names proof class.
- CLI semantic surface and Effect/Bun integration guidance: recorded as
  planning gates. They must be converted into dedicated framed agent lanes
  before command hierarchy changes, oRPC procedure work, or Effect-dependent
  source rewrites begin.
- Direct-control public API/primitives test slice: completed as test-only package
  ownership extraction with a boundary-clean parallel net-new test candidate,
  DRA-owned broad-suite removal, local package proof, and no runtime/source
  behavior claim.
- Direct-control unit-move-preview test slice: completed as test-only package
  coverage addition with a boundary-clean parallel net-new candidate, DRA-owned
  contract correction, local package proof, relationship-label guard, and no
  runtime/source behavior claim.
- Direct-control session/framing test slice: completed as test-only package
  ownership extraction with a boundary-clean parallel net-new candidate,
  DRA-owned broad-suite removal, local package proof, and no runtime/source
  behavior claim.
- Direct-control ready unit/city test slice: completed as test-only package
  ownership extraction with two boundary-clean parallel net-new candidates,
  DRA-owned broad-suite removal, local package proof, and no runtime/source
  behavior claim.
- Direct-control notification view/dismissal test slice: completed as test-only
  package ownership extraction with two parallel net-new candidates, DRA-owned
  correction/removal, local package proof, and no runtime/source behavior claim.
- Direct-control unit-operation/production-choice test slice: completed as a
  DRA-owned test-only package ownership extraction because background thread
  creation was unavailable; local fake fixtures stayed in focused files, broad
  suite duplicates were removed, and no runtime/source behavior claim is made.
- Direct-control unit-target and chooser-closeout test slice: completed as
  test-only package ownership extraction with two parallel net-new agents,
  DRA-owned broad-suite removal, official-resource/doc checks for native path
  fit, local package proof, and no runtime/source behavior claim.
- Direct-control unit-target action source/wrapper slice: completed as the
  next mutation-facing operation relocation. It moves only
  `getCiv7UnitTargetAction` / `requestCiv7UnitTargetAction` orchestration, the
  `readUnitTargetAction` embedded source, command builder, and bounded
  post-send stabilizer into `src/play/operations/unit-target-action.ts` while
  keeping public facade exports in `index.ts`. It preserves approval-first
  send behavior, read/send split, parser label, official target-selection
  order, bounded no-repeat-after-unverified polling, and re-read HUD/ready-unit
  guidance. `test/unit-target-action.test.ts` and the focused CLI unit-target
  suite remain proof owners. This is local package/source relocation proof
  only, not runtime proof.
- Unit-target action facade dependency cleanup:
  `src/play/operations/unit-target-action.ts` now imports existing non-facade
  approval, Tuner execution, and payload parser owners directly for
  `getCiv7UnitTargetAction` and `requestCiv7UnitTargetAction`. The public
  facade exports remain stable, but `index.ts` no longer assembles the
  unit-target action dependency object. This preserves the read-vs-send split,
  approval-first send behavior, parser label, default verification timing,
  bounded no-repeat-after-unverified polling, unit-target postcondition
  classification, and package/CLI proof. This is local package/source
  relocation proof only: it does not claim runtime/live-game proof, accept Task
  2.9.4 matrix rows, or unblock telemetry, AI ingestion, semantic CLI
  projection, hotseat runtime proof, schema/procedure-core work, or Effect/oRPC
  implementation.
- Direct-control diplomacy/narrative test slice: completed as additive
  test-only package coverage with two parallel net-new agents, DRA-owned
  integration, official-resource/doc checks for native path fit, local package
  proof, and no runtime/source behavior claim.
- Direct-control map/visibility/GameInfo test slice: completed as test-only
  package ownership extraction with DRA-owned broad-suite removal, local package
  proof, hidden-info policy assertions, bounded-grid cap coverage, and no
  runtime/source behavior claim.
- Direct-control settlement/progression/tactical read test slice: completed as
  additive test-only package coverage with three parallel net-new agents,
  DRA-owned integration/correction, local package proof, official-resource/doc
  checks, relationship-label guards, and no runtime/source behavior claim.
- Direct-control setup/autoplay/runtime catalog test slice: completed as
  test-only package ownership extraction with three parallel net-new agents,
  DRA-owned broad-suite removal, local package proof, official-resource/doc
  checks, and no runtime/source behavior claim. The broad
  `direct-control.test.ts` suite then retained only restart/begin lifecycle
  ownership.
- Direct-control restart lifecycle test slice: completed as DRA-owned serial
  package ownership extraction because `direct-control.test.ts` was the single
  remaining writer surface. `test/restart-lifecycle.test.ts` now owns restart,
  begin, wait-for-Tuner readiness, and restart-output rejection coverage; the
  broad `direct-control.test.ts` file has been removed. This is local
  fake-tuner package proof only, not runtime proof.
- Direct-control ComponentID primitive slice: completed as the first
  source-owner extraction after package-test ownership completed. It moves
  ComponentID schema/guard/assertion plus the direct-control error class/type
  into focused owner modules behind the existing package facade. This is
  type/source ownership proof only, not runtime proof. Disposition for protected
  stash `preserve user direct-control modularization note before dismiss queue
  slice`: compatible and preserved. The note requires tests first, then
  principled modularization/export of constants/types; this slice follows the
  completed package-test coverage and creates named primitive/error owners
  rather than a broad facade or dumping ground.
- Direct-control tuner framing slice: completed from the completed
  `019e8b69-465d-7a71-8ef1-1f75f96799c2` source candidate. It moves only
  `Civ7TunerFrame`, `encodeCiv7TunerRequest`, and `parseCiv7TunerFrame` into
  `src/session/framing.ts` behind the existing package facade. Broader
  session/config/reconnect and restart/setup lifecycle source extraction stays
  pending because those seams have additional helper dependencies.
- Direct-control settlement recommendation source slice: completed from the
  refined read-only atom report in `019e8b69-ae88-79f1-b5dd-dd530c2ea2bf`.
  It moves only the settlement recommendation embedded source into
  `src/play/tactical/settlement.ts`. Wrapper/builder ownership stays in
  `index.ts`; this is source relocation proof only, not runtime proof.
- Direct-control traditions view source slice: completed as the next
  progression read source relocation. It moves only the traditions embedded
  source into `src/play/progression/traditions.ts`. Wrapper/builder ownership
  stays in `index.ts`; this is source relocation proof only, not runtime proof.
- Direct-control unit move preview source slice: completed as the next ready
  read source relocation. It moves only the unit move preview embedded source
  into `src/play/ready/move-preview.ts`. Wrapper/builder ownership stays in
  `index.ts`; this is source relocation proof only, not runtime proof.
- Direct-control progress dashboard source slice: completed as the next
  progression read source relocation. It moves only the progress dashboard
  embedded source into `src/play/progression/progress-dashboard.ts`.
  Wrapper/builder ownership stays in `index.ts`; this is source relocation proof
  only, not runtime proof.
- Direct-control ready-unit source slice: completed as the next ready read
  source relocation. It moves only the ready-unit embedded source into
  `src/play/ready/unit.ts`. Wrapper/builder ownership stays in `index.ts`; this
  is source relocation proof only, not runtime proof.
- Direct-control ready-city source slice: completed as the final ready read
  source relocation. It moves only the ready-city embedded source into
  `src/play/ready/city.ts`. Ready-city's internal production, town-focus, and
  population-placement helpers stay inside that owner; wrapper/builder
  ownership stays in `index.ts`. This is source relocation proof only, not
  runtime proof.
- Direct-control target-candidates source slice: completed as the next
  tactical read source relocation. It moves only the target-candidates embedded
  source into `src/play/tactical/target-candidates.ts`. Wrapper/builder ownership
  stays in `index.ts`; this is source relocation proof only, not runtime proof.
- Direct-control battlefield scan source slice: completed as the next
  tactical read source relocation. It moves only the battlefield scan embedded
  source into `src/play/tactical/battlefield.ts`. Wrapper/builder ownership stays
  in `index.ts`; this is source relocation proof only, not runtime proof.
- Direct-control destination analysis source slice: completed as the final
  tactical/progression read source relocation. It moves only the destination
  analysis embedded source into `src/play/tactical/destination.ts`, importing
  the battlefield source owner because destination analysis composes the
  battlefield read policy. Wrapper/builder ownership stays in `index.ts`; this
  is source relocation proof only, not runtime proof.
- Direct-control map read source/wrapper slice: completed as the first
  map/visibility/GameInfo source relocation. It moves only
  `getCiv7MapSummary`, `getCiv7PlotSnapshot`, and `getCiv7MapGrid`
  orchestration plus their map summary, plot snapshot, bounded grid builders,
  embedded plot snapshot source, field normalization, and bounded-grid input
  validation into `src/play/map/reads.ts` while keeping public facade exports in
  `index.ts`. Visibility summary, reveal mutation, GameInfo rows, setup map
  rows, and player/unit/city summaries stay out of this slice. This is local
  read-only package/source relocation proof only, not runtime proof.
- Direct-control visibility summary source/wrapper slice: completed as the
  next map/visibility/GameInfo read relocation. It moves only
  `getCiv7VisibilitySummary` orchestration plus its bounded visibility-grid
  command/source helper into `src/play/map/visibility.ts` while keeping public
  facade exports in `index.ts`. Reveal mutation, GameInfo rows, setup map rows,
  and player/unit/city summaries stay out of this slice. This is local
  read-only package/source relocation proof only, not runtime proof.
- Direct-control GameInfo rows source/wrapper slice: completed as the next
  map/visibility/GameInfo read relocation. It moves only `getCiv7GameInfoRows`
  orchestration plus its bounded GameInfo table row command/source helper into
  `src/play/map/gameinfo.ts` while keeping public facade exports in `index.ts`.
  Reveal mutation, setup map rows, player/unit/city summaries, AI ingestion,
  and static profile shaping stay out of this slice. This is local read-only
  package/source relocation proof only, not runtime proof.
- Direct-control player/unit/city summary source/wrapper slice: completed as a
  proof-gap repair and read-only source relocation. It moves only
  `getCiv7PlayerSummary`, `getCiv7UnitSummary`, and `getCiv7CitySummary`
  orchestration plus their command/source helpers into `src/play/summaries.ts`
  while keeping public facade exports in `index.ts`. `test/summary-reads.test.ts`
  owns focused package proof for command routing/source shape, validation and
  bounds, read-only/no-send behavior, and unchanged component-id pass-through.
  Reveal mutation, setup map rows, AI ingestion, static profile shaping,
  semantic CLI, telemetry, hotseat runtime proof, and Effect/oRPC procedure-core
  work stay out of this slice. This is local read-only package/source
  relocation proof only, not runtime proof.
- Direct-control runtime API inspection source/wrapper slice: completed as a
  narrow debug/internal service relocation. It moves only
  `inspectCiv7RuntimeApi`, the private default-root selector, and the generated
  runtime API inspection command into `src/runtime/inspection.ts` while keeping
  public facade exports in `index.ts`. App UI snapshot, Tuner health, playable
  status, bounded root inspection, capability catalog, telemetry, hotseat
  runtime proof, AI ingestion, CLI semantic projection, and Effect/oRPC
  procedure-core work stay out of this slice. This is local read-only
  package/source relocation proof only, not runtime proof.
- Direct-control runtime API inspection facade dependency cleanup: completed as
  a narrow debug/internal service dependency pruning slice.
  `src/runtime/inspection.ts` now imports existing non-facade command
  execution, state-name, and runtime inspection default-root owners directly for
  its default wrapper path while the public facade stays a call-through. This
  preserves caller-provided roots, normalized App UI/Tuner default-root
  selection, selected-state execution, generated inspection command semantics,
  and raw debug/internal diagnostic projection. It does not claim runtime/live
  proof, expose runtime reflection as product authority, or unblock telemetry,
  AI ingestion, semantic CLI projection, hotseat runtime proof,
  schema/procedure ownership, Effect/Bun resource composition, Effect/oRPC
  implementation, or Task 2.9.4 matrix-row acceptance.
- Direct-control App UI snapshot source/wrapper slice: completed as a narrow
  read-only runtime-status support relocation. It moves only
  `getCiv7AppUiSnapshot`, the generated App UI snapshot command, and
  `appUiSnapshotFromCommandResult` into `src/runtime/app-ui-snapshot.ts` while
  keeping public facade exports in `index.ts`. Restart/setup lifecycle loops
  still reuse the internal snapshot builder/parser helpers from the module;
  lifecycle orchestration remains in the facade. Tuner health, playable status,
  bounded root inspection, capability catalog, telemetry, hotseat runtime proof,
  AI ingestion, CLI semantic projection, and Effect/oRPC procedure-core work
  stay out of this slice. This is local read-only package/source relocation
  proof only, not runtime proof.
- Direct-control App UI snapshot facade dependency cleanup: completed as a
  narrow owner-local dependency pruning slice. `src/runtime/app-ui-snapshot.ts`
  now imports existing non-facade App UI command execution directly for the
  default wrapper path while the public facade stays a call-through and
  restart/setup lifecycle loops still reuse the same internal builder/parser
  helpers. This preserves the generated snapshot command, parse label/result
  shape, and debug/internal-only raw snapshot classification. It does not move
  lifecycle orchestration, claim runtime/live-game proof, expose raw snapshots
  as normal CLI output, or unblock telemetry, AI ingestion, semantic CLI
  projection, hotseat runtime proof, schema/procedure-core work, Effect/oRPC
  implementation, or Task 2.9.4 matrix-row acceptance.
- Direct-control Tuner health source/wrapper slice: completed as a narrow
  runtime-status support relocation. It moves only `checkCiv7TunerHealth`, the
  generated Tuner health command, `tunerHealthFromCommandResult`, and the
  internal `checkCiv7TunerHealthWithSession` helper into
  `src/runtime/tuner-health.ts` while keeping public facade call-through,
  session creation/close, reconnect execution, and readiness wait orchestration
  in `index.ts`. Playable status, bounded root inspection, capability catalog,
  telemetry, hotseat runtime proof, AI ingestion, CLI semantic projection, and
  Effect/oRPC procedure-core work stay pending. This is local package/source
  relocation proof only, not runtime proof.
- Direct-control Tuner health facade dependency cleanup: completed as a narrow
  runtime-status dependency pruning slice. `src/runtime/tuner-health.ts` now
  imports existing non-facade session and reconnect execution owners directly
  for public `checkCiv7TunerHealth` and `waitForCiv7TunerReady` defaults,
  while setup/start and setup/restart lifecycle loops still pass the same
  session-scoped dependency explicitly through their owner-local composition.
  This preserves Tuner state selection, retry/count behavior, readiness wait
  timing, parse label/result shape, and debug/internal-only readiness
  classification. It does not move lifecycle orchestration, claim runtime/live
  proof, expose raw Tuner health as normal CLI output, or unblock telemetry, AI
  ingestion, semantic CLI projection, hotseat runtime proof, schema/procedure
  ownership, Effect/Bun resource composition, Effect/oRPC implementation, or
  Task 2.9.4 matrix-row acceptance.
- Direct-control proof/log helper slice: completed as a narrow local helper
  relocation. It moves only `FileSnapshot`, `FreshLogMarkerProof`,
  `snapshotFile`, `waitForFreshLogMarkers`, and private ordered-marker/file
  helpers into `src/proof/log-markers.ts` while keeping public facade exports
  in `index.ts`. Capability catalog, operation/proof telemetry, AI ingestion,
  hotseat runtime proof, CLI semantic projection, and Effect/oRPC
  procedure-core work stay pending. A returned `FreshLogMarkerProof` remains
  local/log evidence and is not live runtime proof by itself.
- Direct-control capability catalog source slice: completed as a narrow catalog
  relocation. It moves static catalog construction, runtime inspection catalog
  construction, official-resource capability scanning, sorting/deduplication,
  and private catalog helpers into `src/catalog/capabilities.ts` while keeping
  public facade exports in `index.ts`. Runtime root inspection is injected from
  the facade to avoid executable back-imports. A later schema slice moved the
  catalog TypeBox schemas into the same owner. Operation/proof telemetry, AI
  ingestion, hotseat runtime proof, CLI semantic projection, broader
  schema/type/procedure-core ownership, and Task 2.9.4 matrix-row acceptance
  stay pending. This is local package/source relocation proof only, not runtime
  proof or AI/hotseat product-path support.
- Direct-control playable-status slice: completed as a narrow runtime-status
  composition relocation. It moves only `getCiv7PlayableStatus` composition into
  `src/runtime/playable-status.ts` while keeping public facade exports in
  `index.ts` and injecting App UI snapshot, Tuner health, and error-message
  dependencies from the facade. This preserves shell/playable/readiness
  classification and unready error capture. Bounded root inspection was
  extracted in the later runtime inspection slice; capability catalog schemas
  were extracted in the later catalog schema slice. Broader public and procedure
  schemas, operation/proof telemetry, AI ingestion, hotseat runtime proof, CLI
  semantic projection, Effect/oRPC procedure-core work, and Task 2.9.4
  matrix-row acceptance stay pending. This is local package/source relocation
  proof only, not runtime proof or AI/hotseat product-path support.
- Direct-control playable-status facade dependency cleanup: completed as a
  narrow runtime-status dependency pruning slice. `src/runtime/playable-status.ts`
  now imports existing non-facade App UI snapshot, Tuner health, and
  error-message owners directly for its default composition while the public
  facade remains a call-through. This preserves App UI/Tuner composition,
  shell/playable/readiness classification, unready error capture, and
  debug/internal-only status classification. It does not expose raw runtime
  status as normal CLI output, claim runtime/live proof, or unblock telemetry,
  AI ingestion, semantic CLI projection, hotseat runtime proof,
  schema/procedure ownership, Effect/Bun resource composition, Effect/oRPC
  implementation, or Task 2.9.4 matrix-row acceptance.
- Direct-control bounded root inspection slice: completed as a narrow
  debug/internal inspection relocation. It moves only `inspectCiv7Root` and the
  generated bounded root inspection command builder into
  `src/runtime/root-inspection.ts` while keeping public facade exports in
  `index.ts`. The root-inspection owner now imports existing non-facade command
  execution, validation, bounds, JSON parsing, command serialization, and error
  construction owners directly for its default wiring. This preserves root
  identifier validation, `maxRoots`/`maxKeys`/`maxMethods`, state default,
  parse label, command serialization, and result shape. Capability catalog
  schemas were extracted in the later catalog schema slice. Broader public and
  procedure schemas, operation/proof telemetry, AI ingestion, hotseat runtime
  proof, CLI semantic projection, Effect/oRPC procedure-core work, and Task
  2.9.4 matrix-row acceptance stay pending. This is local package/source
  relocation proof only, not runtime proof, runtime reflection authority, or
  AI/hotseat product-path support.
- Direct-control capability catalog schema slice: completed as a narrow schema
  ownership relocation. It moves only `Civ7CapabilityCatalogEntrySchema`,
  `Civ7CapabilityCatalogSchema`, and their derived catalog entry/result types
  into `src/catalog/capabilities.ts` while keeping public facade re-exports in
  `index.ts`. This preserves the TypeBox schema shape and catalog result typing.
  Broader public constants/types, procedure schemas, operation/proof telemetry,
  AI ingestion, hotseat runtime proof, CLI semantic projection, Effect/oRPC
  procedure-core work, and Task 2.9.4 matrix-row acceptance stay pending. This
  is local package/schema relocation proof only, not runtime proof, AI/hotseat
  product-path support, or procedure-core schema readiness.
- Direct-control static capability catalog facade cleanup slice: completed as a
  narrow catalog/facade hygiene pass. It lets `src/catalog/capabilities.ts` use
  the existing GameInfo table default for static catalog entries and re-exports
  `createStaticCiv7CapabilityCatalog` directly from `index.ts`. Runtime catalog
  generation still injects root inspection and root catalogs from the facade,
  and official-resource scanning remains unchanged. Telemetry, AI ingestion,
  CLI semantic projection, hotseat runtime proof, Effect/oRPC procedure-core
  work, and Task 2.9.4 matrix-row acceptance stay pending. This is local
  package/source cleanup proof only, not runtime/live-game proof.
- Capability catalog facade dependency cleanup:
  `src/catalog/capabilities.ts` now imports existing non-facade bounded root
  inspection and catalog default owners directly for runtime catalog
  generation. The public facade export remains stable, but `index.ts` no
  longer assembles the capability catalog dependency object. This preserves
  static/runtime catalog construction, runtime root caps,
  generated-output-as-evidence policy, official-resource scanner behavior, and
  package proof. This is local package/source relocation proof only: it does not
  claim runtime/live-game proof, accept Task 2.9.4 matrix rows, or unblock
  telemetry, AI ingestion, semantic CLI projection, hotseat runtime proof,
  schema/procedure-core work, or Effect/oRPC implementation.
- Direct-control runtime inspection constants slice: completed as a narrow
  constants ownership relocation. It moves only the default App UI/Tuner API
  root catalogs and bounded root `maxKeys`/`maxMethods` defaults into
  `src/runtime/inspection-constants.ts` while keeping public facade re-exports
  in `index.ts`. This preserves runtime API default-root selection and bounded
  root cap defaults. Broader public constants/types, procedure schemas,
  operation/proof telemetry, AI ingestion, hotseat runtime proof, CLI semantic
  projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
  acceptance stay pending. This is local package/constants relocation proof
  only, not runtime proof, runtime reflection authority, AI/hotseat product-path
  support, or procedure-core readiness.
- Direct-control setup/lifecycle constants slice: completed as a narrow public
  constants ownership relocation. It moves only setup/lifecycle command strings,
  UI loading-state values, and setup parameter IDs into
  `src/setup/constants.ts` while keeping public facade re-exports in `index.ts`.
  This preserves restart/begin/exit/reload command strings, loading-state
  numeric values, and setup parameter IDs. Broader public constants/types,
  procedure schemas, operation/proof telemetry, AI ingestion, hotseat runtime
  proof, CLI semantic projection, Effect/oRPC procedure-core work, and Task
  2.9.4 matrix-row acceptance stay pending. This is local package/constants
  relocation proof only, not runtime proof, AI/hotseat product-path support, or
  procedure-core readiness.
- Direct-control session constants slice: completed as a narrow public
  constants ownership relocation. It moves only default tuner host, port,
  timeout, default state name, and App UI/Tuner state-name constants into
  `src/session/constants.ts` while keeping public facade re-exports in
  `index.ts`. This preserves session config defaults, state selection names, and
  public API values. Broader session/config/socket source extraction, public
  constants/types, procedure schemas, operation/proof telemetry, AI ingestion,
  hotseat runtime proof, CLI semantic projection, Effect/oRPC procedure-core
  work, and Task 2.9.4 matrix-row acceptance stay pending. This is local
  package/constants relocation proof only, not runtime proof, AI/hotseat
  product-path support, or procedure-core readiness.
- Direct-control map/GameInfo constants slice: completed as a narrow public
  constants ownership relocation. It moves only GameInfo table defaults, map
  grid bounds, and GameInfo row bounds into `src/play/map/constants.ts` while
  keeping public facade re-exports in `index.ts`. This preserves map/grid and
  GameInfo wrapper default and hard-limit behavior plus the capability catalog's
  injected GameInfo table list. Broader public constants/types, procedure
  schemas, operation/proof telemetry, AI ingestion, hotseat runtime proof, CLI
  semantic projection, Effect/oRPC procedure-core work, and Task 2.9.4
  matrix-row acceptance stay pending. This is local package/constants relocation
  proof only, not runtime proof, AI/hotseat product-path support, or
  procedure-core readiness.
- Direct-control capability catalog constants slice: completed as a narrow
  public constants ownership relocation. It moves only capability catalog App
  UI/Tuner root defaults into `src/catalog/capabilities.ts` while keeping public
  facade re-exports in `index.ts`. This preserves static/runtime catalog root
  defaults while runtime root inspection keeps its owner-local default wiring. Broader
  public constants/types, procedure schemas, operation/proof telemetry, AI
  ingestion, hotseat runtime proof, CLI semantic projection, Effect/oRPC
  procedure-core work, and Task 2.9.4 matrix-row acceptance stay pending. This
  is local package/constants relocation proof only, not runtime proof,
  AI/hotseat product-path support, or procedure-core readiness.
- Direct-control autoplay constants slice: completed as a narrow public
  constants ownership relocation. It moves only autoplay default max-turn,
  wait, poll, and stop-stability constants into `src/play/autoplay.ts` while
  keeping public facade re-exports in `index.ts`. This preserves autoplay
  wrapper defaults and keeps App UI execution, validation, approval, sleeping,
  and serializer dependencies injected from the facade. Broader public
  constants/types, procedure schemas, operation/proof telemetry, AI ingestion,
  hotseat runtime proof, CLI semantic projection, Effect/oRPC procedure-core
  work, and Task 2.9.4 matrix-row acceptance stay pending. This is local
  package/constants relocation proof only, not runtime proof, AI/hotseat
  product-path support, or procedure-core readiness.
- Direct-control unit-target constants slice: completed as a narrow public
  constants ownership relocation. It moves only unit-target post-send
  verification wait/poll defaults into `src/play/operations/unit-target-action.ts`
  while keeping public facade re-exports in `index.ts`. This preserves bounded
  unit-target verification timing and keeps command execution, parsing, and
  approval dependencies injected from the facade. Broader public constants/types,
  procedure schemas, operation/proof telemetry, AI ingestion, hotseat runtime
  proof, CLI semantic projection, Effect/oRPC procedure-core work, and Task
  2.9.4 matrix-row acceptance stay pending. This is local package/constants
  relocation proof only, not runtime proof, AI/hotseat product-path support, or
  procedure-core readiness.
- Direct-control scripting-log constant slice: completed as a narrow public
  constants ownership relocation. It moves only `DEFAULT_CIV7_SCRIPTING_LOG`
  into `src/proof/log-markers.ts` while keeping public facade re-exports in
  `index.ts`. This preserves the proof/log helper default log path and does not
  change marker matching, file snapshotting, timeout behavior, or log proof
  semantics. Broader public constants/types, operation/proof telemetry, AI
  ingestion, hotseat runtime proof, CLI semantic projection, Effect/oRPC
  procedure-core work, and Task 2.9.4 matrix-row acceptance stay pending. This
  is local package/constants relocation proof only, not runtime proof,
  AI/hotseat product-path support, or procedure-core readiness.
- Direct-control session types slice: completed as a narrow public type
  ownership relocation. It moves only tuner state, tuner state selection,
  direct-control endpoint/options, and command-result public types into
  `src/session/types.ts` while keeping facade type re-exports in `index.ts`.
  This preserves public type contracts and does not move session config, socket
  lifecycle, command execution, reconnect, runtime inspection, setup lifecycle,
  procedure schemas, telemetry, AI ingestion, hotseat runtime proof, CLI
  semantic projection, Effect/oRPC procedure-core work, or Task 2.9.4
  matrix-row acceptance. This is local package/type relocation proof only, not
  runtime proof, AI/hotseat product-path support, or procedure-core readiness.
- Direct-control runtime types slice: completed as a narrow public/runtime type
  ownership relocation. It moves only runtime API inspection, bounded root
  inspection, App UI snapshot, Tuner health, playable status, and runtime probe
  result/input types into existing runtime atom owners while keeping facade
  type re-exports in `index.ts`. This preserves public type contracts and does
  not move source strings, command execution, session/lifecycle orchestration,
  procedure schemas, telemetry, AI ingestion, hotseat runtime proof, CLI
  semantic projection, Effect/oRPC procedure-core work, or Task 2.9.4
  matrix-row acceptance. This is local package/type relocation proof only, not
  runtime proof, AI/hotseat product-path support, or procedure-core readiness.
- Direct-control runtime probe helper slice: completed as a narrow helper
  relocation. It moves only the facade-used `probeHelperSource` and
  `probeValue` helpers into `src/runtime/probe.ts` alongside
  `Civ7RuntimeProbe` while preserving generated `probe` helper source text and
  probe unwrapping semantics. Module-local source-string helpers, shared
  serializer ownership, public procedure schemas, telemetry, AI ingestion,
  hotseat runtime proof, CLI semantic projection, Effect/oRPC procedure-core
  work, and Task 2.9.4 matrix-row acceptance remain pending. This is local
  package/source relocation proof only, not runtime/live-game proof.
- Direct-control map primitive types slice: completed as a narrow public type
  ownership relocation. It moves only `Civ7MapLocation`, `Civ7MapBounds`, and
  `Civ7HiddenInfoPolicy` into `src/play/map/types.ts` while keeping facade type
  re-exports in `index.ts` and switching direct internal map/ready/tactical
  users to the map owner. This preserves public type contracts and does not
  change map validation, source strings, runtime behavior, procedure schemas,
  telemetry, AI ingestion, hotseat runtime proof, CLI semantic projection,
  Effect/oRPC procedure-core work, or Task 2.9.4 matrix-row acceptance. This is
  local package/type relocation proof only, not runtime proof, AI/hotseat
  product-path support, or procedure-core readiness.
- Direct-control map read types slice: completed as a narrow public type
  ownership relocation. It moves only map summary, plot snapshot, map grid
  input/result, and full-map-grid chunk/input/result types into
  `src/play/map/types.ts` while keeping facade type re-exports in `index.ts`
  and switching `src/play/map/reads.ts` to the map and session type owners.
  This preserves public type contracts and does not change map read validation,
  source strings, runtime behavior, visibility or GameInfo types, procedure
  schemas, telemetry, AI ingestion, hotseat runtime proof, CLI semantic
  projection, Effect/oRPC procedure-core work, or Task 2.9.4 matrix-row
  acceptance. This is local package/type relocation proof only, not runtime
  proof, AI/hotseat product-path support, or procedure-core readiness.
- Direct-control map validation helper slice: completed as a narrow map helper
  ownership relocation. It moves only map location/bounds validation into
  `src/play/map/validation.ts` while preserving the existing `x`/`y` range,
  map-grid hard-cap range, and command-failed messages through the generic
  bounded integer helper. Focused package proof covers map location and bounds
  rejection. This does not change map read source strings, runtime behavior,
  procedure schemas, telemetry, AI ingestion, semantic CLI projection, hotseat
  runtime proof, Effect/oRPC procedure-core work, or Task 2.9.4 matrix-row
  acceptance. This is local package/source relocation proof only, not
  runtime/live-game proof.
- Direct-control summary read types slice: completed as a narrow public type
  ownership relocation. It moves only player, unit, and city summary
  input/result types into `src/play/summaries.ts` while keeping facade type
  re-exports in `index.ts` and replacing the summary module's type-only facade
  imports with concrete owner imports. This preserves public type contracts and
  does not change summary validation, component-id pass-through behavior,
  source strings, runtime behavior, relationship-label policy, visibility or
  GameInfo types, procedure schemas, telemetry, AI ingestion, hotseat runtime
  proof, CLI semantic projection, Effect/oRPC procedure-core work, or Task
  2.9.4 matrix-row acceptance. This is local package/type relocation proof
  only, not runtime proof, AI/hotseat product-path support, or procedure-core
  readiness.
- Direct-control GameInfo row types slice: completed as a narrow public type
  ownership relocation. It moves only GameInfo row input/result types into
  `src/play/map/gameinfo.ts` while keeping facade type re-exports in `index.ts`
  and replacing the GameInfo module's type-only facade imports with concrete
  owner imports. This preserves public type contracts and does not change
  GameInfo table or filter validation, lookup/filter semantics, source strings,
  runtime behavior, AI ingestion, static profile shaping, procedure schemas,
  telemetry, hotseat runtime proof, CLI semantic projection, Effect/oRPC
  procedure-core work, or Task 2.9.4 matrix-row acceptance. This is local
  package/type relocation proof only, not runtime proof, AI/hotseat product-path
  support, or procedure-core readiness.
- Direct-control visibility/reveal types slice: completed as a narrow public
  type ownership relocation. It moves only visibility summary input/result types
  and the reveal-map result type into `src/play/map/visibility.ts` while keeping
  facade type re-exports in `index.ts` and replacing moved visibility type
  imports with concrete owner imports. This preserves public type contracts and
  does not change visibility validation, bounded-grid semantics, approval-first
  disposable reveal behavior, reveal classification, source strings, runtime
  behavior, relationship-label policy, telemetry, AI ingestion, hotseat runtime
  proof, CLI semantic projection, Effect/oRPC procedure-core work, or Task 2.9.4
  matrix-row acceptance. This is local package/type relocation proof only, not
  runtime proof, AI/hotseat product-path support, or procedure-core readiness.
- Direct-control setup read types slice: completed as a narrow public type
  ownership relocation. It moves only setup phase, setup snapshot/map-row,
  setup map-row read, and setup map-row visibility result types into
  `src/setup/reads.ts` while keeping facade type re-exports in `index.ts` and
  replacing moved setup read type imports in setup modules with concrete owner
  imports. This preserves public type contracts and does not change setup
  snapshot/map-row source strings, map-script validation, setup map-row refresh
  behavior, setup lifecycle mutation behavior, runtime proof status, telemetry,
  AI ingestion, hotseat runtime proof, CLI semantic projection, Effect/oRPC
  procedure-core work, or Task 2.9.4 matrix-row acceptance. Setup
  prepare/start/run lifecycle input/result types remain pending separate owner
  slices. This is local package/type relocation proof only, not runtime proof,
  AI/hotseat product-path support, or procedure-core readiness.
- Direct-control setup lifecycle types slice: completed as a narrow public type
  ownership relocation. It moves only single-player setup input, setup option
  value, prepared-setup result, prepared-start input, single-player start
  result, and single-player run input/result types into the concrete setup
  owners (`src/setup/prepare.ts`, `src/setup/start.ts`, and `src/setup/run.ts`)
  while keeping facade type re-exports in `index.ts` and replacing moved setup
  lifecycle type imports with concrete owner imports. This preserves public type
  contracts and does not change setup preparation/start/run source strings,
  approval behavior, readback verification, setup lifecycle mutation behavior,
  runtime proof status, telemetry, AI ingestion, hotseat runtime proof, CLI
  semantic projection, Effect/oRPC procedure-core work, or Task 2.9.4
  matrix-row acceptance. Tactical, operation, ready, public procedure schema,
  and telemetry type ownership remain pending separate owner slices. This is
  local package/type relocation proof only, not runtime proof, AI/hotseat
  product-path support, or procedure-core readiness.
- Direct-control autoplay/turn types slice: completed as a narrow public type
  ownership relocation. It moves only autoplay status/options/action result
  types into `src/play/autoplay.ts` and turn-completion status/action result
  types into `src/play/turn-completion.ts` while keeping facade type re-exports
  in `index.ts` and replacing moved autoplay/turn type imports with concrete
  owner imports. This preserves public type contracts and does not change
  autoplay command source, approval behavior, stop-settling/pause behavior,
  turn-completion command strings, stale notification fallback classification,
  runtime proof status, telemetry, AI ingestion, hotseat runtime proof, CLI
  semantic projection, Effect/oRPC procedure-core work, or Task 2.9.4
  matrix-row acceptance. Tactical, operation, ready, public procedure schema,
  and telemetry type ownership remain pending separate owner slices. This is
  local package/type relocation proof only, not runtime proof, AI/hotseat
  product-path support, or procedure-core readiness.
- Direct-control notification types slice: completed as a narrow public type
  ownership relocation. It moves only notification view/decision/queue public
  types into `src/play/notifications/view.ts` and notification dismissal
  input/summary/result types into `src/play/notifications/dismissal-request.ts`
  while keeping facade type re-exports in `index.ts` and replacing moved
  notification type imports in package internals with concrete owner imports.
  This preserves public type contracts and does not change notification
  materialization source strings, decision hint classification,
  `maxNotifications` behavior, dismissal command source, approval-first
  dismissal behavior, dismissal verification polling, CLI queue or bulk-dismiss
  policy, runtime proof status, telemetry, AI ingestion, hotseat runtime proof,
  CLI semantic projection, Effect/oRPC procedure-core work, or Task 2.9.4
  matrix-row acceptance. Diplomacy/narrative/progression closeout, tactical,
  operation, ready, public procedure schema, and telemetry type ownership remain
  pending separate owner slices. This is local package/type relocation proof
  only, not runtime proof, AI/hotseat product-path support, or procedure-core
  readiness.
- Direct-control progression read types slice: completed as a narrow public
  type ownership relocation. It moves only traditions view input/action/summary
  result types and progress dashboard input/legacy-path/result types into
  `src/play/progression/reads.ts` while keeping facade type re-exports in
  `index.ts` and replacing moved progression type imports with concrete
  session/runtime-probe owner imports. This preserves public type contracts and
  does not change traditions/progress dashboard source strings, command
  serialization, parser labels, read-only/no-send behavior, runtime proof
  status, telemetry, AI ingestion, hotseat runtime proof, CLI semantic
  projection, Effect/oRPC procedure-core work, or Task 2.9.4 matrix-row
  acceptance. Diplomacy/narrative closeout, tactical, operation, ready, public
  procedure schema, and telemetry type ownership remain pending separate owner
  slices. This is local package/type relocation proof only, not runtime proof,
  AI/hotseat product-path support, or procedure-core readiness.
- Direct-control tactical read types slice: completed as a narrow public type
  ownership relocation. It moves only settlement recommendation input/factor/
  origin/result types into `src/play/tactical/settlement.ts`, target-candidates
  input/candidate/result types into `src/play/tactical/target-candidates.ts`,
  battlefield scan input/result types into `src/play/tactical/battlefield.ts`,
  and destination analysis input/result types into
  `src/play/tactical/destination.ts` while keeping facade type re-exports in
  `index.ts`. This preserves public type contracts and does not change tactical
  source strings, command serialization, parser labels, read-only/no-send
  behavior, conservative relationship-label policy, runtime proof status,
  telemetry, AI ingestion, hotseat runtime proof, CLI semantic projection,
  Effect/oRPC procedure-core work, or Task 2.9.4 matrix-row acceptance.
  Diplomacy/narrative closeout, operation, ready, public procedure schema, and
  telemetry type ownership remain pending separate owner slices. This is local
  package/type relocation proof only, not runtime proof, AI/hotseat product-path
  support, or procedure-core readiness.
- Direct-control ready read types slice: completed as a narrow public type
  ownership relocation. It moves only ready-unit input/operation/nearby/
  promotion/result types into `src/play/ready/unit.ts`, unit-move-preview
  input/result types into `src/play/ready/move-preview.ts`, and ready-city
  input/operation/production/town-focus/population-placement/result types into
  `src/play/ready/city.ts` while keeping facade type re-exports in `index.ts`.
  This preserves public type contracts and does not change ready-unit,
  unit-move-preview, or ready-city source strings, command serialization,
  parser labels, validator/default/bounds behavior, read-only/no-send behavior,
  conservative relationship-label policy, runtime proof status, telemetry, AI
  ingestion, hotseat runtime proof, CLI semantic projection, Effect/oRPC
  procedure-core work, or Task 2.9.4 matrix-row acceptance.
  Diplomacy/narrative closeout, operation, public procedure schema, and
  telemetry type ownership remain pending separate owner slices. This is local
  package/type relocation proof only, not runtime proof, AI/hotseat product-path
  support, or procedure-core readiness.
- Direct-control progression chooser closeout types slice: completed as a
  narrow public type ownership relocation. It moves only technology closeout
  input/result types into `src/play/progression/technology.ts` and culture
  closeout input/result types into `src/play/progression/culture.ts` while
  keeping facade type re-exports in `index.ts`. This preserves public type
  contracts and does not change technology/culture closeout source strings,
  command serialization, parser labels, wrapper ownership, mutation behavior,
  runtime proof status, telemetry, AI ingestion, hotseat runtime proof, CLI
  semantic projection, Effect/oRPC procedure-core work, or Task 2.9.4
  matrix-row acceptance. Diplomacy/narrative closeout, operation, public
  procedure schema, and telemetry type ownership remain pending separate owner
  slices. This is local package/type relocation proof only, not runtime proof,
  AI/hotseat product-path support, or procedure-core readiness.
- Direct-control unit-target action types slice: completed as a narrow public
  type ownership relocation. It moves only unit-target action input/candidate/
  result types into `src/play/operations/unit-target-action.ts` while keeping
  facade type re-exports in `index.ts`. This preserves public type contracts
  and does not change unit-target source strings, command serialization, parser
  labels, wrapper ownership, approval-first behavior, post-send verification
  timing/wording, no-repeat-after-unverified guidance, runtime proof status,
  telemetry, AI ingestion, hotseat runtime proof, CLI semantic projection,
  Effect/oRPC procedure-core work, or Task 2.9.4 matrix-row acceptance. Generic
  operation, diplomacy/narrative closeout, public procedure schema, and
  telemetry type ownership remain pending separate owner slices. This is local
  package/type relocation proof only, not runtime proof, AI/hotseat product-path
  support, or procedure-core readiness.
- Direct-control turn-completion slice: completed as a narrow turn-completion
  source/wrapper relocation. It moves only `getCiv7TurnCompletionStatus`,
  `sendCiv7TurnComplete`, `sendCiv7TurnUnready`, the status command builder,
  and the private turn-completion fallback classifier helpers into
  `src/play/turn-completion.ts` while keeping public facade exports in
  `index.ts` and injecting App UI execution, JSON parsing, notification reads,
  and approval assertion from the facade. This preserves approval-first
  send/unready behavior, guard-first status read, stale notification fallback
  classification, command strings, parse label, and action result shape.
  Autoplay source ownership, hotseat runtime proof, AI ingestion, CLI semantic
  projection, telemetry, Effect/oRPC procedure-core work, and Task 2.9.4
  matrix-row acceptance stay pending. This is local package/source relocation
  proof only, not runtime proof, live-game proof, hotseat product-path support,
  or procedure-core readiness.
- Turn-completion facade dependency cleanup: `src/play/turn-completion.ts` now
  imports existing non-facade App UI execution, parser, notification-view, and
  approval owners directly for status, send-turn-complete, and send-unready
  wrappers. The public facade in `src/index.ts` remains stable but no longer
  assembles those dependency objects. This is local package/source relocation
  proof only: it does not change approval-first send/unready behavior,
  guard-first status read, stale notification fallback classification, command
  strings, parse label, action result shape, runtime/live-game proof, Task
  2.9.4 matrix-row acceptance, telemetry, AI ingestion, CLI semantic
  projection, hotseat runtime proof, schema/procedure-core work, or Effect/oRPC
  implementation.
- Autoplay facade dependency cleanup: `src/play/autoplay.ts` now imports
  existing non-facade App UI snapshot, App UI execution, approval,
  validation/bounds, serializer, sleep, and timing/default owners directly for
  status, configure, start, and stop wrappers. The public facade in
  `src/index.ts` remains stable but no longer assembles the autoplay dependency
  object. This preserves approval gates, bounded turn/player validation,
  explicit unbounded start semantics, stop-settling/pause behavior, command
  strings, and result shapes. This is local package/source relocation proof
  only: it does not claim hotseat runtime proof, runtime/live-game proof, accept
  Task 2.9.4 matrix rows, or unblock telemetry, AI ingestion, semantic CLI
  projection, schema/procedure-core work, or Effect/oRPC implementation.
- Direct-control notification dismissal source slice: completed as the
  notification action source relocation. It moves only the embedded App UI
  notification dismissal source into `src/play/notifications/dismissal.ts`.
  Wrapper-level polling and identity verification helpers stay in `index.ts`;
  this is source relocation proof only, not runtime proof.
- Direct-control notification view source slice: completed as the
  notification materialization source relocation. It moves only the embedded
  `readPlayNotifications` source into `src/play/notifications/view.ts`.
  Wrapper/build-command ownership stays in `index.ts`; this is source
  relocation proof only, not runtime proof.
- Direct-control notification view wrapper slice: completed as the notification
  materialization wrapper relocation. It moves only `getCiv7PlayNotificationView`
  orchestration plus its command builder into `src/play/notifications/view.ts`
  while keeping the public facade export in `index.ts`, preserving the existing
  `maxNotifications` default and HUD materialization source owner. The package
  play-notification-view test and focused CLI notification HUD suite remain the
  proof owners. This is local package/source relocation proof only, not runtime
  proof.
- Notification-view facade dependency cleanup: `src/play/notifications/view.ts`
  now imports existing non-facade App UI execution and parser owners directly
  for `getCiv7PlayNotificationView`. The public facade in `src/index.ts`
  remains stable but no longer assembles that dependency object. This is local
  package/source relocation proof only: it does not change `maxNotifications`
  defaulting, parse label, read-only materialization behavior, normal CLI
  projection, runtime/live-game proof, Task 2.9.4 matrix-row acceptance,
  telemetry, AI ingestion, hotseat runtime proof, schema/procedure-core work,
  or Effect/oRPC implementation.
- Direct-control operation router source slice: completed as the generic
  operation validation/send source relocation. It moves only the embedded
  operation router source into `src/play/operations/router.ts`. Wrapper-level
  postconditions and specialized closeout sources stay in `index.ts`; this is
  source relocation proof only, not runtime proof.
- Direct-control technology/culture closeout source slice: completed as the
  progression chooser closeout source relocation. It moves only the embedded
  technology and culture chooser closeout sources into
  `src/play/progression/{technology,culture}.ts`. Public wrapper ownership stays
  in `index.ts`; this is source relocation proof only, not runtime proof.
- Direct-control technology choice closeout builder slice: completed as a
  narrow progression closeout command-builder relocation. It moves only the
  App UI technology choice closeout command builder into
  `src/play/progression/technology.ts` while keeping the public facade wrapper
  in `index.ts`. At that slice boundary, the facade still owned approval, App UI
  execution, player-id and node validation, payload parsing, and serialization
  injection. This preserves
  optional notification activation, SET_TECH_TREE_NODE and
  SET_TECH_TREE_TARGET_NODE send behavior, focused technology package/CLI proof,
  and existing pending runtime/live-game proof. Telemetry, AI ingestion,
  semantic CLI projection, Effect/oRPC procedure-core work, and Task 2.9.4
  matrix-row acceptance remain pending. This is local package/source relocation
  proof only, not runtime/live-game proof.
- Direct-control culture choice closeout builder slice: completed as a narrow
  progression closeout command-builder relocation. It moves only the App UI
  culture choice closeout command builder into `src/play/progression/culture.ts`
  while keeping the public facade wrapper in `index.ts`. At that slice boundary,
  the facade still owned approval, App UI execution, player-id and node
  validation, payload parsing, and serialization injection. This preserves optional notification activation,
  SET_CULTURE_TREE_NODE and SET_CULTURE_TREE_TARGET_NODE send behavior, focused
  culture package/CLI proof, and existing pending runtime/live-game proof.
  Telemetry, AI ingestion, semantic CLI projection, Effect/oRPC procedure-core
  work, and Task 2.9.4 matrix-row acceptance remain pending. This is local
  package/source relocation proof only, not runtime/live-game proof.
- Direct-control technology/culture closeout wrapper slice: completed as a
  narrow progression closeout wrapper relocation. It moves the public wrapper
  orchestration for `requestCiv7TechnologyChoiceCloseout` and
  `requestCiv7CultureChoiceCloseout` into
  `src/play/progression/{technology,culture}.ts` while keeping the public
  facade export/call-through in `index.ts`. Executable dependencies remain
  injected from the facade. This preserves approval-first checks, player/node
  validation, App UI execution, payload parse labels, command serialization,
  optional notification activation, SET_*_TREE_NODE and
  SET_*_TREE_TARGET_NODE send behavior, focused package/CLI proof, and pending
  runtime/live-game proof. Telemetry, AI ingestion, semantic CLI projection,
  Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance remain
  pending. This is local package/source relocation proof only, not
  runtime/live-game proof.
- Technology/culture closeout facade dependency cleanup:
  `src/play/progression/{technology,culture}.ts` now import existing
  non-facade approval, App UI execution, payload parser, serializer, player
  validation, and direct-control error owners directly. The public facade in
  `src/index.ts` remains stable but no longer assembles the technology/culture
  closeout dependency objects. This preserves approval-first checks, player/node
  validation, App UI execution, payload parse labels, command serialization,
  optional notification activation, SET_*_TREE_NODE / SET_*_TREE_TARGET_NODE
  send behavior, and focused package/CLI proof. This is local package/source
  relocation proof only: it does not claim runtime/live-game proof, accept Task
  2.9.4 matrix rows, or unblock telemetry, AI ingestion, semantic CLI
  projection, hotseat runtime proof, schema/procedure-core work, or Effect/oRPC
  implementation.
- Production-choice facade dependency cleanup:
  `src/play/operations/production-choice.ts` now imports existing non-facade
  approval, component-id assertion, city-operation validation, App UI execution,
  payload parser, and serializer owners directly. The public facade in
  `src/index.ts` remains stable but no longer assembles the production-choice
  dependency object. This preserves approval-first BUILD request orchestration,
  cityId and production-args validation, validator-first behavior, read-only
  status payload for invalid pre-validation, bounded post-send polling,
  production postcondition classification, and package/CLI proof. This is local
  package/source relocation proof only: it does not claim runtime/live-game
  proof, accept Task 2.9.4 matrix rows, or unblock telemetry, AI ingestion,
  semantic CLI projection, hotseat runtime proof, schema/procedure-core work, or
  Effect/oRPC implementation.
- Direct-control session acquire/release helper slice: completed as a narrow
  session resource-helper relocation. It moves the repeated facade-local
  `new Civ7DirectControlSession(options)` plus `finally` close pattern into
  `src/session/session.ts` as `withCiv7DirectControlSession`, then injects that
  helper into Tuner health and setup/restart dependencies from `index.ts`. This
  preserves session construction, close-on-completion/error behavior,
  Tuner-ready wait dependency shape, setup/restart lifecycle composition, and
  existing package proof. Effect/Bun resource/schedule/layer composition,
  telemetry/correlation contracts, procedure schemas, semantic CLI projection,
  AI ingestion, hotseat runtime proof, Effect/oRPC procedure-core work, and
  Task 2.9.4 matrix-row acceptance remain pending. This is local package/source
  relocation proof only, not runtime/live-game proof.
- Direct-control session execute helper-reuse slice: completed as a narrow
  session execute cleanup. It routes `queryCiv7TunerStates` and
  `executeCiv7Command` through `withCiv7DirectControlSession` while preserving
  package-level execute wrapper behavior, App UI/Tuner state forcing wrappers,
  command result shape, and close-on-completion/error behavior. Reconnect still
  closes caller-owned sessions, and lifecycle behavior is unchanged.
  Effect/Bun resource/schedule/layer composition, telemetry/correlation
  contracts, procedure schemas, semantic CLI projection, AI ingestion, hotseat
  runtime proof, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
  acceptance remain pending. This is local package/source relocation proof only,
  not runtime/live-game proof.
- Direct-control health facade call-through cleanup slice: completed as a
  narrow public facade hygiene pass. It removes the trivial
  `checkCiv7DirectControlHealth` and `waitForCiv7DirectControl` wrapper
  functions from `index.ts` and re-exports the `src/session/health.ts` owner
  functions directly. Public package imports remain stable, health/wait
  behavior remains owned and proved by the session package tests, and no
  lifecycle, runtime, telemetry, semantic CLI, AI ingestion, or Effect/oRPC
  behavior changed. This is local package/source cleanup proof only, not
  runtime/live-game proof.
- Direct-control facade postcondition-helper cleanup slice: completed as a
  narrow stale-helper prune after the specialized operation postcondition and
  unit-target owners moved. It removes only dead private comparison helpers from
  `index.ts` (`probeValueChanged`, `probeFieldChanged`,
  `locationFromUnitProbeValue`, `sameMapLocation`, `sameComponentId`,
  `stableJson`, `isRecord`, and `flattenKeys`) while preserving then-remaining
  facade `jsLiteral`, `probeValue`, and `probeHelperSource` injection helpers.
  Shared serializer/type ownership, runtime/live-game proof, telemetry, AI
  ingestion, semantic CLI projection, Effect/oRPC procedure-core work, and Task
  2.9.4 matrix-row acceptance remained pending from that cleanup. This is local
  package/source cleanup proof only, not runtime/live-game proof.
- Direct-control command-source serializer slice: completed as a narrow runtime
  helper relocation. It moves the existing `jsLiteral` serializer into
  `src/runtime/command-serialization.ts` while preserving `JSON.stringify`
  output shape and `command-failed` rejection for unserializable command input.
  Focused runtime package proof now covers successful serialization and
  undefined rejection. This records current embedded command-builder plumbing
  only; it does not create a raw command tunnel or define telemetry, AI
  ingestion, semantic CLI projection, hotseat runtime proof, Effect/oRPC
  procedure-core schemas, or Task 2.9.4 matrix-row acceptance. This is local
  package/source relocation proof only, not runtime/live-game proof.
- Direct-control production-choice source slice: completed as the next
  operation action source relocation. It moves only the embedded production
  choice source into `src/play/operations/production-choice.ts`. The public
  wrapper/build command plus production postcondition helpers stay in `index.ts`;
  this is source relocation proof only, not runtime proof.
- Direct-control unit-operation postcondition helper slice: completed as the
  first synchronous postcondition-helper relocation. It moves only
  `unitOperationPostcondition`, `classifyUnitOperationPostcondition`, and
  `unitOperationPostconditionReason` into
  `src/play/operations/unit-postconditions.ts`. Population/production
  postconditions plus wrapper-level request composition stay in `index.ts`;
  this is source relocation proof only, not runtime proof.
- Direct-control population-placement postcondition helper slice: completed as
  the next synchronous postcondition-helper relocation. It first adds
  `test/population-placement.test.ts` as package-owned ASSIGN_WORKER and EXPAND
  request/postcondition proof, then moves only
  `populationPlacementPostcondition`,
  `populationPlacementPostconditionEligible`, `probeReadyCleared`,
  `classifyPopulationPlacementPostcondition`, and
  `populationPlacementPostconditionReason` into
  `src/play/operations/population-postconditions.ts`. Production
  postconditions plus wrapper-level request composition stay in `index.ts`;
  this is local package/source relocation proof only, not runtime proof.
- Direct-control production postcondition helper slice: completed as the next
  synchronous postcondition-helper relocation. It first expands
  `test/production-choice.test.ts` to cover both
  `production-choice-cleared` and
  `production-state-changed-blocker-still-live`, then moves only
  `productionPostconditionFor`, `productionSnapshotChanged`,
  `productionBlockerStillLive`, `classifyProductionPostcondition`, and
  `productionPostconditionReason` into
  `src/play/operations/production-postconditions.ts`. The embedded
  production-choice source owner and wrapper-level request composition stay in
  place; this is local package/source relocation proof only, not runtime
  proof.
- Direct-control notification dismissal verification slice: completed as the
  next notification helper relocation. It moves wrapper-level polling and
  identity verification for dismissal settling into
  `src/play/notifications/verification.ts` while keeping the embedded App UI
  dismissal source owner and the public read/send wrappers in place.
  `test/notification-dismissal.test.ts` remains the package-owned proof for
  verified dismissal, stale engine-front rejection, and none-blocker panel
  close paths. This is local package/source relocation proof only, not runtime
  proof.
- Direct-control notification dismissal wrapper slice: completed as the next
  notification composition relocation. It moves only the public
  `getCiv7NotificationDismissal` / `requestCiv7NotificationDismissal`
  orchestration into `src/play/notifications/dismissal-request.ts` while
  keeping the public export surface in `index.ts` and leaving the embedded App
  UI source plus dismissal-settling verifier in their existing notification
  owners. `test/notification-dismissal.test.ts` remains the package-owned proof
  for guarded read/send, identity-based verification, and stale engine-front
  rejection paths. This is local package/source relocation proof only, not
  runtime proof.
- Direct-control notification dismissal builder slice: completed as a narrow
  notification command-builder relocation. It moves only the guarded read/send
  App UI dismissal command builder into
  `src/play/notifications/dismissal-request.ts` while keeping public facade
  exports in `index.ts`. Follow-up facade dependency cleanup lets the dismissal
  request owner import existing non-facade App UI execution, command-result
  parsing, approval, and command serialization owners directly, so the public
  facade no longer assembles those dependency objects. This preserves
  notification dismissal read/send command serialization, approval-first
  dismissal behavior, final identity-based verification, focused package/CLI
  notification dismissal proof, and existing pending runtime/live-game proof.
  Telemetry, AI ingestion, semantic CLI projection, Effect/oRPC procedure-core
  work, and Task 2.9.4 matrix-row acceptance remain pending. This is local
  package/source relocation proof only, not runtime/live-game proof.
- Direct-control narrative choice verification helper slice: completed as the
  next specialized closeout-helper relocation. It first expands
  `test/narrative-choice.test.ts` to cover same-blocker `no-state-change` and
  `narrative-panel-cleared` classification alongside the existing
  blocker-cleared and validator-rejection package proof, then moves the
  wrapper-level wait/postcondition helper group into
  `src/play/operations/narrative-postconditions.ts`. The embedded
  `sendNarrativeChoice` source owner and the public wrapper stay in `index.ts`;
  this is local package/source relocation proof only, not runtime proof.
- Direct-control diplomacy response verification helper slice: completed as the
  matching diplomacy closeout-helper relocation. It expands
  `test/diplomacy-response.test.ts` to cover `turn-unblocked`,
  `no-state-change`, `diplomacy-blocker-cleared`,
  `blocking-notification-changed`, `validation-changed`, and the reachable
  post-closeout `not-sent` path where `payload.sent === false` after successful
  wrapper pre-validation, then moves the wrapper-level wait/postcondition
  helper group into `src/play/operations/diplomacy-postconditions.ts`. The
  embedded `sendDiplomacyResponseCloseout` source owner and the public wrapper
  stay in `index.ts`; this is local package/source relocation proof only, not
  runtime proof.
- Direct-control diplomacy response wrapper slice: completed as the next
  operation-wrapper composition relocation. It moves only
  `requestCiv7DiplomacyResponse` orchestration into
  `src/play/operations/diplomacy-request.ts` while keeping the public facade
  export in `index.ts` and preserving the existing embedded closeout source plus
  diplomacy postcondition owner modules. `test/diplomacy-response.test.ts` and
  the focused CLI diplomacy response command suite remain the proof owners. This
  is local package/source relocation proof only, not runtime proof.
- Direct-control narrative choice wrapper slice: completed as the next
  operation-wrapper composition relocation. It moves only
  `requestCiv7NarrativeChoice` orchestration into
  `src/play/operations/narrative-request.ts` while keeping the public facade
  export in `index.ts` and preserving the existing embedded narrative closeout
  source plus narrative postcondition owner modules. `test/narrative-choice.test.ts`
  and the focused CLI narrative command suite remain the proof owners. This is
  local package/source relocation proof only, not runtime proof.
- Direct-control progression read wrapper slice: completed as the next read-only
  wrapper composition relocation. It moves only `getCiv7TraditionsView` and
  `getCiv7ProgressDashboard` orchestration plus their command builders into
  `src/play/progression/reads.ts` while keeping the public facade exports in
  `index.ts` and preserving the existing embedded progression source owners.
  `test/progression-reads.test.ts` and the focused CLI progression-read command
  suite remain the proof owners. This is local package/source relocation proof
  only, not runtime proof.
- Direct-control settlement recommendation wrapper slice: completed as the next
  read-only wrapper composition relocation. It moves only
  `getCiv7SettlementRecommendations` orchestration plus its command builder
  into `src/play/tactical/settlement.ts` while keeping the public facade export
  in `index.ts` and preserving the existing embedded settlement recommendation
  source owner. `test/settlement-recommendations.test.ts` and the focused CLI
  settlement-recommendations command suite remain the proof owners. This is
  local package/source relocation proof only, not runtime proof.
- Direct-control target-candidates wrapper slice: completed as the next
  read-only tactical wrapper composition relocation. It moves only
  `getCiv7TargetCandidates` orchestration plus its command builder into
  `src/play/tactical/target-candidates.ts` while keeping the public facade
  export in `index.ts` and preserving the existing embedded target-candidates
  source owner. `test/tactical-reads.test.ts` and the focused CLI tactical-read
  command suite remain the proof owners. This is local package/source
  relocation proof only, not runtime proof.
- Direct-control battlefield scan wrapper slice: completed as the next
  read-only tactical wrapper composition relocation. It moves only
  `getCiv7BattlefieldScan` orchestration plus its command builder into
  `src/play/tactical/battlefield.ts` while keeping the public facade export in
  `index.ts` and preserving the existing embedded battlefield scan source
  owner. `test/tactical-reads.test.ts` and the focused CLI tactical-read
  command suite remain the proof owners. This is local package/source
  relocation proof only, not runtime proof.
- Direct-control destination analysis wrapper slice: completed as the next
  read-only tactical wrapper composition relocation. It moves only
  `getCiv7DestinationAnalysis` orchestration plus its command builder into
  `src/play/tactical/destination.ts` while keeping the public facade export in
  `index.ts` and preserving the existing embedded destination analysis source
  owner. `test/tactical-reads.test.ts` and the focused CLI tactical-read
  command suite remain the proof owners. This is local package/source
  relocation proof only, not runtime proof.
- Tactical/progression read facade dependency cleanup:
  `src/play/tactical/{settlement,target-candidates,battlefield,destination}.ts`
  and `src/play/progression/reads.ts` now import existing non-facade App UI
  execution, parser, validation, bounds, and map-validation owners directly for
  settlement recommendations, target candidates, battlefield scan, destination
  analysis, traditions view, and progress dashboard reads. The public facade in
  `src/index.ts` remains stable but no longer assembles those dependency
  objects. This is local package/source relocation proof only: it does not
  change settlement `count` bounds, progression player validation,
  target-candidate/battlefield/destination bounds, destination/origin map
  validation, conservative relationship-label policy, runtime/live-game proof,
  Task 2.9.4 matrix-row acceptance, telemetry, AI ingestion, CLI semantic
  projection, hotseat runtime proof, schema/procedure-core work, or Effect/oRPC
  implementation.
- Direct-control unit move preview wrapper slice: completed as the next
  read-only ready wrapper composition relocation. It moves only
  `getCiv7UnitMovePreview` orchestration plus its command builder into
  `src/play/ready/move-preview.ts` while keeping the public facade export in
  `index.ts`, preserving destination-only pre-validation, preserving the
  existing `maxPlots`/`maxPathPlots` defaults and bounds, and preserving
  embedded-source `unitId` normalization with no new component-id rejection.
  `test/unit-move-preview.test.ts` and the focused CLI unit-move-preview suite
  remain the proof owners. This is local package/source relocation proof only,
  not runtime proof.
- Direct-control ready-unit wrapper slice: completed as the next read-only
  ready wrapper composition relocation. It moves only `getCiv7ReadyUnitView`
  orchestration plus its command builder into `src/play/ready/unit.ts` while
  keeping the public facade export in `index.ts`, preserving the existing
  `radius`/`maxOperations` defaults and bounds, and preserving embedded-source
  `unitId` normalization with no new component-id rejection.
  `test/ready-unit-view.test.ts` and the focused CLI ready-unit suite remain
  the proof owners. This is local package/source relocation proof only, not
  runtime proof.
- Direct-control ready-city wrapper slice: completed as the next read-only
  ready wrapper composition relocation. It moves only `getCiv7ReadyCityView`
  orchestration plus its command builder into `src/play/ready/city.ts` while
  keeping the public facade export in `index.ts`, preserving the existing
  `maxOperations` default/bounds, and preserving embedded-source `cityId`
  normalization and target selection with no new component-id rejection.
  `test/ready-city-view.test.ts` and the focused CLI ready-city suite remain
  the proof owners. This is local package/source relocation proof only, not
  runtime proof.
- Ready-read facade dependency cleanup:
  `src/play/ready/{unit,move-preview,city}.ts` now import existing non-facade
  App UI execution, parser, bounds, and map-validation owners directly for
  `getCiv7ReadyUnitView`, `getCiv7UnitMovePreview`, and
  `getCiv7ReadyCityView`. The public facade in `src/index.ts` remains stable
  but no longer assembles those dependency objects. This is local
  package/source relocation proof only: it does not change ready-unit
  `radius`/`maxOperations` bounds, unit-move-preview destination validation or
  movement bounds, ready-city `maxOperations` bounds, component-id
  pass-through, conservative relationship-label policy, runtime/live-game
  proof, Task 2.9.4 matrix-row acceptance, telemetry, AI ingestion, CLI
  semantic projection, hotseat runtime proof, schema/procedure-core work, or
  Effect/oRPC implementation.
- Direct-control autoplay slice: completed as a narrow mutation-facing
  autoplay wrapper/source relocation. It moves only `getCiv7AutoplayStatus`,
  `configureCiv7Autoplay`, `startCiv7Autoplay`, `stopCiv7Autoplay`, autoplay
  command builders, player inference, config matching, and wait/stop-settling
  helpers into `src/play/autoplay.ts` while keeping public facade exports in
  `index.ts`. The slice preserves approval-first configuration/start/stop,
  bounded turns/player validation, explicit unbounded start behavior, native
  pause-before-stop settling, command strings, and result shapes. This is local
  package/source relocation proof only, not runtime proof; hotseat runtime
  proof, AI ingestion, semantic CLI projection, telemetry, Effect/oRPC
  procedure-core work, and Task 2.9.4 matrix-row acceptance remain pending.
- Direct-control reveal-map slice: completed as a narrow mutation-facing
  visibility wrapper relocation. It moves only `revealCiv7MapForPlayer`
  orchestration and reveal classification into `src/play/map/visibility.ts`
  while keeping public facade exports in `index.ts`. The slice preserves
  approval-first and disposable-session guards, player-id validation, visibility
  before/after reads, `Visibility.revealAllPlots` command text, and result
  classification shape. This is local package/source relocation proof only, not
  live-game proof; setup map rows, AI ingestion, static profile shaping,
  semantic CLI projection, telemetry, hotseat runtime proof, Effect/oRPC
  procedure-core work, and Task 2.9.4 matrix-row acceptance remain pending.
- Direct-control setup reads slice: completed as a narrow setup read/source
  relocation. It moves only `getCiv7SetupSnapshot`, `getCiv7SetupMapRows`,
  their command builders, shared setup snapshot/map-row source, and
  `validateMapScript` into `src/setup/reads.ts` while keeping public facade
  exports in `index.ts`. Lifecycle orchestration still reuses the same setup
  source through an internal helper import, but `ensureCiv7SetupMapRowVisible`,
  `prepareCiv7SinglePlayerSetup`, `startPreparedCiv7SinglePlayerGame`,
  `runCiv7SinglePlayerFromSetup`, restart/begin lifecycle orchestration, and
  no-replay semantics remain in the facade for later setup/lifecycle owner
  slices. This is local package/source relocation proof only, not runtime proof;
  hotseat runtime proof, AI ingestion, semantic CLI projection, telemetry,
  Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance remain
  pending.
- Direct-control setup map-row refresh slice: completed as a narrow
  setup/lifecycle source relocation. It moves only
  `ensureCiv7SetupMapRowVisible` plus the private setup phase and map-row
  polling helpers needed by its exit-to-shell refresh path into
  `src/setup/reads.ts` while keeping the public facade export in `index.ts`.
  This preserves map script validation, `limit` default/bounds, approval-first
  refresh, exit-to-main-menu and reload command strings, setup map-row polling,
  and verified result shape. `prepareCiv7SinglePlayerSetup`,
  `startPreparedCiv7SinglePlayerGame`, `runCiv7SinglePlayerFromSetup`,
  restart/begin lifecycle orchestration, no-replay semantics, hotseat runtime
  proof, AI ingestion, semantic CLI projection, telemetry, Effect/oRPC
  procedure-core work, and Task 2.9.4 matrix-row acceptance remain pending.
  This is local package/source relocation proof only, not runtime/live-game
  proof.
- Direct-control setup preparation slice: completed as a narrow
  setup/lifecycle source relocation. It moves only
  `prepareCiv7SinglePlayerSetup`, the generated setup preparation command,
  setup input normalization, setup map-row/readback assertions, and private
  setup parameter helpers into `src/setup/prepare.ts` while keeping the public
  facade export in `index.ts`. `startPreparedCiv7SinglePlayerGame` and
  `runCiv7SinglePlayerFromSetup` still reuse the internal normalization and
  readback helpers until their owner slices move. This preserves
  approval-first setup mutation, setup snapshot readback, setup map-row proof,
  setup option validation, command string/source shape, and
  no-replay-after-socket-close package proof. Start/run, restart/begin
  lifecycle orchestration, remaining no-replay ownership, hotseat runtime proof,
  AI ingestion, semantic CLI projection, telemetry, Effect/oRPC procedure-core
  work, and Task 2.9.4 matrix-row acceptance remain pending. This is local
  package/source relocation proof only, not runtime/live-game proof.
- Direct-control prepared start slice: completed as a narrow setup/lifecycle
  source relocation. It moves only `startPreparedCiv7SinglePlayerGame`, the
  generated prepared-start command, begin polling, setup pre-readback, Tuner/map
  verification, and post-start seed assertion into `src/setup/start.ts` while
  keeping the public facade export in `index.ts`. Later dependency pruning moves
  the default session creation/close, reconnect execution, Tuner readiness, map
  summary read, approval assertion, command parsing, and constants into
  `src/setup/start.ts`. This preserves
  approval-first start, host-game command source, one-attempt begin send,
  no-replay-after-begin-close package proof, setup-start timeout details, and
  seed mismatch classification. `runCiv7SinglePlayerFromSetup`, restart/begin
  lifecycle orchestration, remaining no-replay ownership, hotseat runtime proof,
  AI ingestion, semantic CLI projection, telemetry, Effect/oRPC procedure-core
  work, and Task 2.9.4 matrix-row acceptance remain pending. This is local
  package/source relocation proof only, not runtime/live-game proof.
- Direct-control setup run slice: completed as a narrow setup/lifecycle source
  relocation. It moves only `runCiv7SinglePlayerFromSetup` composition,
  active-game rejection unless `fromRunningGame: "exit-to-shell"` is supplied,
  exit-to-main-menu command routing, shell wait, prepare/start chaining, and
  verified result shape into `src/setup/run.ts` while keeping the public facade
  export in `index.ts`. Later dependency pruning moves the default App UI
  execution, setup snapshot reads, setup phase waits, prepare/start wrappers,
  approval assertion, validation helpers, and constants into `src/setup/run.ts`.
  This preserves approval-first run
  orchestration, shell-exit behavior, existing prepare/start proof, and
  no-replay package proof. Restart/begin lifecycle orchestration, remaining
  no-replay ownership, hotseat runtime proof, AI ingestion, semantic CLI
  projection, telemetry, Effect/oRPC procedure-core work, and Task 2.9.4
  matrix-row acceptance remain pending. This is local package/source relocation
  proof only, not runtime/live-game proof.
- Direct-control restart/begin slice: completed as a narrow setup/lifecycle
  source relocation. It moves only `beginCiv7Game`, `restartCiv7Game`, and
  `restartCiv7GameAndBegin` orchestration into `src/setup/restart.ts` while
  keeping public facade exports in `index.ts`. Later dependency pruning moves
  the default App UI execution, command execution, session creation/close,
  reconnect execution, Tuner readiness, loading-state constants, and command
  constants into `src/setup/restart.ts`. This
  preserves App UI restart command routing, restart-output rejection,
  begin-notification command routing, GameStarted polling, one-attempt begin
  send, optional Tuner readiness wait, and restart lifecycle package proof.
  Runtime/live-game proof, hotseat runtime proof, AI ingestion, semantic CLI
  projection, telemetry, Effect/oRPC procedure-core work, and Task 2.9.4
  matrix-row acceptance remain pending. This is local package/source relocation
  proof only, not runtime/live-game proof.
- Setup-read facade helper cleanup: completed as a narrow facade cleanup after
  setup-read dependency ownership moved into `src/setup/reads.ts`. It removes
  the stale `setupReadDependencies` helper and unused validation/setup-read
  dependency imports from `index.ts` while keeping public facade exports stable.
  This is local package/source relocation proof only: it does not claim
  runtime/live-game proof, accept Task 2.9.4 matrix rows, or unblock telemetry,
  AI ingestion, semantic CLI projection, hotseat runtime proof,
  schema/procedure-core work, or Effect/oRPC implementation.
- Direct-control production-choice wrapper slice: completed as a narrow
  operation source relocation. It moves only `requestCiv7ProductionChoice`
  orchestration, the private production-choice command builder, production
  argument validation, read-only status payload reads, and bounded post-send
  polling into `src/play/operations/production-choice.ts` while keeping the
  public facade export in `index.ts`. The facade still injects approval,
  ComponentID validation, App UI execution, city-operation validation,
  payload parsing, and serialization. This preserves approval-first BUILD
  request behavior, validator-first sends, invalid-prevalidation no-send
  status payloads, production postcondition classification, and package/CLI
  production proof. Generic operation wrapper composition, telemetry, AI
  ingestion, semantic CLI projection, Effect/oRPC procedure-core work, and
  Task 2.9.4 matrix-row acceptance remain pending. This is local
  package/source relocation proof only, not runtime/live-game proof.
- Direct-control generic operation wrapper slice: completed as a narrow
  operation source relocation. It moves only the public generic
  unit/city/player operation and command validation/request wrapper
  composition, the private operation validation/request command builders,
  operation input validation, validator-first request flow, and
  unit/population/production postcondition composition into
  `src/play/operations/validate-request.ts` while keeping public facade exports
  in `index.ts`. Follow-up facade dependency cleanup lets the operation request
  owner import existing non-facade approval, Tuner execution, command-result
  parser, and command serialization owners directly, so the public facade no
  longer assembles those dependency objects. This preserves approval-first send
  behavior, operation router source routing, unit-operation and
  population-placement package proof, and production postcondition composition.
  Telemetry, AI ingestion, semantic CLI projection, Effect/oRPC procedure-core
  work, and Task 2.9.4 matrix-row acceptance remain pending. This is local
  package/source relocation proof only, not runtime/live-game proof.
- Direct-control shared operation primitive types slice: completed as a narrow
  public type ownership relocation. It moves only operation family/target/input,
  and operation validation result public types into
  `src/play/operations/types.ts` while keeping public facade type re-exports in
  `index.ts`. This preserves public type contracts and does not change
  operation source strings, wrappers, validation, approval-first behavior,
  postconditions, or request semantics. Operation request result, postcondition
  payloads, production choice, diplomacy/narrative closeout, public procedure
  schemas, operation/proof telemetry, hotseat runtime proof, AI ingestion, CLI
  semantic projection, Effect/oRPC procedure-core work, and Task 2.9.4
  matrix-row acceptance remain pending. This is local package/type relocation
  proof only, not runtime/live-game proof.
- Direct-control action approval primitive slice: completed as a narrow
  primitive/helper ownership relocation. It moves `Civ7ActionApproval` and the
  shared `assertApproved` helper into `src/action-approval.ts` while preserving
  public facade type re-exports through `src/play/operations/types.ts`.
  Focused unit-operation package proof now covers rejection before socket use
  when an approval reason is blank. This preserves approval-first rejection
  message/classification and does not define operation telemetry, AI ingestion,
  semantic CLI projection, hotseat runtime proof, Effect/oRPC procedure-core
  work, or Task 2.9.4 matrix-row acceptance. This is local package/source
  relocation proof only, not runtime/live-game proof.
- Direct-control action approval back-import cleanup slice: completed as a
  narrow type-only ownership cleanup. Internal modules that need
  `Civ7ActionApproval` now import it from `src/action-approval.ts` or the
  operation type owner instead of from the public facade. Public facade
  re-exports and all approval-first runtime behavior remain unchanged.
  Unrelated command/session type back-imports, procedure schemas,
  operation/proof telemetry, AI ingestion, semantic CLI projection, hotseat
  runtime proof, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
  acceptance remain pending. This is local type/source relocation proof only,
  not runtime/live-game proof.
- Direct-control command/session/runtime type back-import cleanup slice:
  completed as a narrow type-only ownership cleanup. Internal modules now
  import command results, direct-control options, state selections, sessions,
  runtime probes, snapshot/health results, and operation families from their
  owner modules instead of the public facade. Public facade re-exports remain
  stable for package consumers and no runtime behavior changes. Procedure
  schemas, operation/proof telemetry, AI ingestion, semantic CLI projection,
  hotseat runtime proof, Effect/oRPC procedure-core work, and Task 2.9.4
  matrix-row acceptance remain pending. This is local type/source relocation
  proof only, not runtime/live-game proof.
- Direct-control stale facade filesystem import cleanup slice: completed as a
  narrow import/source ownership cleanup. The current stack had new
  saved-configuration disk listing/parsing in the facade, so the conflict was
  resolved by moving `.civ7cfg` list/read/summary parsing and the default save
  directory into `src/setup/prepare.ts` while keeping facade re-exports and the
  existing App UI saved-configuration load wrapper stable. The public facade no
  longer imports `node:fs/promises`, `node:os`, or `node:path` for saved-config
  listing. Public facade exports remain stable and no runtime behavior changes.
  Procedure schemas, operation/proof telemetry, AI ingestion, semantic CLI
  projection, hotseat runtime proof, Effect/oRPC procedure-core work, and Task
  2.9.4 matrix-row acceptance remain pending. This is local source hygiene
  proof only, not runtime/live-game proof.
- Direct-control stale facade value import cleanup slice: completed as a narrow
  import/source ownership cleanup after direct-control error, action approval,
  map validation, command-result parser, command-source serializer, and runtime
  probe helpers moved to owner modules. The public facade no longer imports
  those values only to satisfy stale pre-extraction shape. Public facade exports
  remain stable and no runtime behavior changes. Procedure schemas,
  operation/proof telemetry, AI ingestion, semantic CLI projection, hotseat
  runtime proof, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
  acceptance remain pending. This is local source hygiene proof only, not
  runtime/live-game proof.
- Direct-control stale facade re-export import cleanup slice: completed as a
  narrow import/source ownership cleanup after public primitive, session,
  proof/log, catalog schema, and runtime-constant values were already exposed
  through direct `export ... from` declarations. The public facade no longer
  imports those values only to re-export them, and public facade exports remain
  stable. Procedure schemas, operation/proof telemetry, AI ingestion, semantic
  CLI projection, hotseat runtime proof, Effect/oRPC procedure-core work, and
  Task 2.9.4 matrix-row acceptance remain pending. This is local source hygiene
  proof only, not runtime/live-game proof.
- Direct-control map/GameInfo constant re-export import cleanup slice:
  completed as a narrow import/source ownership cleanup after map/GameInfo
  constants were already exposed through direct `export ... from` declarations.
  The public facade no longer imports those values only to re-export them, and
  public facade exports remain stable. Procedure schemas, operation/proof
  telemetry, AI ingestion, semantic CLI projection, hotseat runtime proof,
  Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance remain
  pending. This is local source hygiene proof only, not runtime/live-game proof.
- Direct-control map type re-export import cleanup slice: completed as a
  narrow type-only source ownership cleanup after map read helper types were
  already exposed through direct `export type ... from` declarations. The public
  facade no longer imports those types only to re-export them, and public facade
  exports remain stable. Schema ownership, operation/proof telemetry, AI
  ingestion, semantic CLI projection, hotseat runtime proof, Effect/oRPC
  procedure-core work, and Task 2.9.4 matrix-row acceptance remain pending. This
  is local source hygiene proof only, not runtime/live-game proof.
- Direct-control production postcondition type re-export import cleanup slice:
  completed as a narrow type-only source ownership cleanup after the production
  postcondition snapshot type was already exposed through direct
  `export type ... from` declarations. The public facade no longer imports that
  type only to re-export it, and public facade exports remain stable.
  Operation/proof telemetry, AI ingestion, semantic CLI projection, hotseat
  runtime proof, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
  acceptance remain pending. This is local source hygiene proof only, not
  runtime/live-game proof.
- Direct-control runtime diagnostic type re-export import cleanup slice:
  completed as a narrow type-only source ownership cleanup after runtime
  diagnostic helper types were already exposed through direct
  `export type ... from` declarations. The public facade no longer imports
  those types only to re-export them, and public facade exports remain stable.
  Runtime-status projection, operation/proof telemetry, AI ingestion, semantic
  CLI projection, hotseat runtime proof, Effect/oRPC procedure-core work, and
  Task 2.9.4 matrix-row acceptance remain pending. This is local source hygiene
  proof only, not runtime/live-game proof.
- Direct-control session type re-export import cleanup slice: completed as a
  narrow type-only source ownership cleanup after session endpoint and
  state-role types were already exposed through direct `export type ... from`
  declarations. The public facade no longer imports those types only to
  re-export them, and public facade exports remain stable. Session behavior,
  runtime proof, operation/proof telemetry, AI ingestion, semantic CLI
  projection, hotseat runtime proof, Effect/oRPC procedure-core work, and Task
  2.9.4 matrix-row acceptance remain pending. This is local source hygiene proof
  only, not runtime/live-game proof.
- Direct-control notification-view decision helper type re-export import cleanup
  slice: completed as a narrow type-only source ownership cleanup after
  notification-view decision helper types were already exposed through direct
  `export type ... from` declarations. The public facade no longer imports
  those types only to re-export them, and public facade exports remain stable.
  Notification behavior, runtime proof, operation/proof telemetry, AI ingestion,
  semantic CLI projection, hotseat runtime proof, Effect/oRPC procedure-core
  work, and Task 2.9.4 matrix-row acceptance remain pending. This is local
  source hygiene proof only, not runtime/live-game proof.
- Direct-control notification-dismissal summary type re-export import cleanup
  slice: completed as a narrow type-only source ownership cleanup after the
  dismissal summary type was already exposed through a direct
  `export type ... from` declaration. The public facade no longer imports that
  type only to re-export it, and public facade exports remain stable.
  Notification behavior, runtime proof, operation/proof telemetry, AI ingestion,
  semantic CLI projection, hotseat runtime proof, Effect/oRPC procedure-core
  work, and Task 2.9.4 matrix-row acceptance remain pending. This is local
  source hygiene proof only, not runtime/live-game proof.
- Direct-control progression-read helper type re-export import cleanup slice:
  completed as a narrow type-only source ownership cleanup after progression
  helper types were already exposed through direct `export type ... from`
  declarations. The public facade no longer imports those types only to
  re-export them, and public facade exports remain stable. Progression behavior,
  runtime proof, operation/proof telemetry, AI ingestion, semantic CLI
  projection, hotseat runtime proof, Effect/oRPC procedure-core work, and Task
  2.9.4 matrix-row acceptance remain pending. This is local source hygiene proof
  only, not runtime/live-game proof.
- Direct-control production-choice payload type re-export import cleanup slice:
  completed as a narrow type-only source ownership cleanup after the production
  choice command payload type was already exposed through a direct
  `export type ... from` declaration. The public facade no longer imports that
  type only to re-export it, and public facade exports remain stable.
  Production behavior, runtime proof, operation/proof telemetry, AI ingestion,
  semantic CLI projection, hotseat runtime proof, Effect/oRPC procedure-core
  work, and Task 2.9.4 matrix-row acceptance remain pending. This is local
  source hygiene proof only, not runtime/live-game proof.
- Direct-control setup-read helper type re-export import cleanup slice:
  completed as a narrow type-only source ownership cleanup after setup-read
  helper types were already exposed through direct `export type ... from`
  declarations. The public facade no longer imports those types only to
  re-export them, and public facade exports remain stable. Setup behavior,
  runtime proof, operation/proof telemetry, AI ingestion, semantic CLI
  projection, hotseat runtime proof, Effect/oRPC procedure-core work, and Task
  2.9.4 matrix-row acceptance remain pending. This is local source hygiene proof
  only, not runtime/live-game proof.
- Direct-control autoplay poll option type re-export import cleanup slice:
  completed as a narrow type-only source ownership cleanup after the autoplay
  poll options type was already exposed through a direct `export type ... from`
  declaration. The public facade no longer imports that type only to re-export
  it, and public facade exports remain stable. Autoplay behavior, runtime proof,
  operation/proof telemetry, AI ingestion, semantic CLI projection, hotseat
  runtime proof, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
  acceptance remain pending. This is local source hygiene proof only, not
  runtime/live-game proof.
- Direct-control generic validation primitive slice: completed as a narrow
  primitive/helper ownership relocation. It moves only bounded integer, simple
  identifier, and player-id validation helpers into `src/validation.ts` while
  preserving message/classification semantics and existing facade dependency
  injection. Focused package proof covers bounds rejection, identifier
  rejection, and player-id range behavior. Map-specific validation helpers,
  procedure schemas, operation/proof telemetry, AI ingestion, semantic CLI
  projection, hotseat runtime proof, Effect/oRPC procedure-core work, and Task
  2.9.4 matrix-row acceptance remain pending. This is local package/source
  relocation proof only, not runtime/live-game proof.
- Direct-control facade dependency primitive slice: completed as a narrow
  primitive/helper ownership relocation. It moves the facade-injected error
  stringifier into `src/error-message.ts` and the facade-injected sleep
  primitive into `src/timing.ts` while preserving playable-status error shaping
  and autoplay wait dependency behavior. Owner-local sleep/error helpers remain
  in their current modules until a named Effect/Bun resource/schedule/layer pass
  can replace the hand-wired dependency shape. This does not define procedure
  schemas, operation/proof telemetry, AI ingestion, semantic CLI projection,
  hotseat runtime proof, Effect/oRPC procedure-core work, or Task 2.9.4
  matrix-row acceptance. This is local package/source relocation proof only, not
  runtime/live-game proof.
- Direct-control oRPC architecture authority citation slice: completed as a
  docs-only gate repair. The support OpenSpec now cites
  `civ7-orpc-control-architecture` from
  `codex/civ7-orpc-control-architecture-skill` as the oRPC
  procedure/router/context/middleware authority. This closes only the 4.9
  authority-citation blocker. It does not import tracked
  `packages/civ7-control-orpc` source, define procedure-core schemas, implement
  Effect/Bun resource or schedule handling, create telemetry hooks, change CLI
  semantic envelopes, close hotseat runtime proof, close AI ingestion, or accept
  Task 2.9.4 matrix rows.
- Direct-control command-result parser slice: completed as a narrow session
  helper relocation. It moves the command-result JSON payload parser into
  `src/session/command-result.ts` while preserving host/port/state merge
  behavior and invalid JSON message/classification/details. Focused session
  package proof now covers successful payload context merging and malformed
  JSON details. This preserves existing facade dependency injection for
  wrapper modules and does not define telemetry/correlation contracts,
  procedure schemas, AI ingestion, semantic CLI projection, hotseat runtime
  proof, Effect/oRPC procedure-core work, or Task 2.9.4 matrix-row acceptance.
  This is local package/source relocation proof only, not runtime/live-game
  proof.
- Direct-control operation result/postcondition types slice: completed as a
  narrow public type ownership relocation. It moves generic operation request
  result type ownership into `src/play/operations/validate-request.ts` and
  unit-operation, population-placement, and production postcondition public
  type ownership into their respective postcondition helper modules while
  keeping public facade type re-exports in `index.ts`. This preserves public
  type contracts and does not change operation source strings, wrappers,
  validation, approval-first behavior, postcondition classification, or request
  semantics. Production choice, diplomacy/narrative closeout, public procedure
  schemas, operation/proof telemetry, hotseat runtime proof, AI ingestion, CLI
  semantic projection, Effect/oRPC procedure-core work, and Task 2.9.4
  matrix-row acceptance remain pending. This is local package/type relocation
  proof only, not runtime/live-game proof.
- Direct-control production-choice types slice: completed as a narrow public
  type ownership relocation. It moves production-choice input, command payload,
  and result public type ownership into
  `src/play/operations/production-choice.ts` while keeping public facade type
  re-exports in `index.ts`. This preserves public type contracts and does not
  change production-choice source strings, wrapper orchestration, validation,
  approval-first behavior, production postconditions, or request semantics.
  Diplomacy/narrative closeout, public procedure schemas, operation/proof
  telemetry, hotseat runtime proof, AI ingestion, CLI semantic projection,
  Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance remain
  pending. This is local package/type relocation proof only, not
  runtime/live-game proof.
- Direct-control diplomacy response types slice: completed as a narrow public
  type ownership relocation. It moves diplomacy response input, command
  payload, and result public type ownership into
  `src/play/operations/diplomacy-request.ts` and diplomacy response
  postcondition public type ownership into
  `src/play/operations/diplomacy-postconditions.ts` while keeping public
  facade type re-exports in `index.ts`. This preserves public type contracts
  and does not change diplomacy source strings, wrapper orchestration,
  validation, approval-first behavior, postcondition classification, or request
  semantics. Narrative closeout, public procedure schemas, operation/proof
  telemetry, hotseat runtime proof, AI ingestion, CLI semantic projection,
  Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance remain
  pending. This is local package/type relocation proof only, not
  runtime/live-game proof.
- Direct-control narrative choice types slice: completed as a narrow public
  type ownership relocation. It moves narrative choice input, command payload,
  and result public type ownership into
  `src/play/operations/narrative-request.ts` and narrative choice postcondition
  public type ownership into
  `src/play/operations/narrative-postconditions.ts` while keeping public facade
  type re-exports in `index.ts`. This preserves public type contracts and does
  not change narrative source strings, wrapper orchestration, validation,
  approval-first behavior, postcondition classification, or request semantics.
  Public procedure schemas, operation/proof telemetry, hotseat runtime proof,
  AI ingestion, CLI semantic projection, Effect/oRPC procedure-core work, and
  Task 2.9.4 matrix-row acceptance remain pending. This is local package/type
  relocation proof only, not runtime/live-game proof.
- Direct-control capability catalog options type slice: completed as a narrow
  public type ownership relocation. It moves `Civ7CapabilityCatalogOptions`
  into `src/catalog/capabilities.ts` while keeping public facade type
  re-exports in `index.ts` and removing the catalog module's type-only
  dependency on facade root-inspection exports in favor of the runtime owner.
  This preserves catalog option shape and does not change catalog source,
  scanner, schema, sorting, runtime inspection, or wrapper behavior. Remaining
  then-remaining facade-owned lifecycle/health result types, public procedure schemas,
  operation/proof telemetry, hotseat runtime proof, AI ingestion, CLI semantic
  projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
  acceptance remain pending. This is local package/type relocation proof only,
  not runtime/live-game proof.
- Direct-control restart/begin result type slice: completed as a narrow public
  type ownership relocation. It moves `Civ7RestartAndBeginResult` into
  `src/setup/restart.ts` while keeping public facade type re-exports in
  `index.ts`. This preserves restart/begin result shape and does not change
  lifecycle orchestration, command routing, App UI snapshot parsing, Tuner
  readiness waiting, restart-output validation, or no-replay behavior.
  Then-remaining facade-owned health result types, public procedure schemas,
  operation/proof telemetry, hotseat runtime proof, AI ingestion, CLI semantic
  projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
  acceptance remain pending. This is local package/type relocation proof only,
  not runtime/live-game proof.
- Direct-control health result type slice: completed as a narrow public type
  ownership relocation. It moves `Civ7DirectControlHealth` into
  `src/session/types.ts` while keeping public facade type re-exports in
  `index.ts`. This preserves health result shape and does not change endpoint
  discovery, state selection, health polling, error classification,
  session/socket behavior, or runtime-status projection. Health source/session
  orchestration, public procedure schemas, operation/proof telemetry, hotseat
  runtime proof, AI ingestion, CLI semantic projection, Effect/oRPC
  procedure-core work, and Task 2.9.4 matrix-row acceptance remain pending.
  This is local package/type relocation proof only, not runtime/live-game proof.
- Direct-control UI loading-state name type slice: completed as a narrow public
  type ownership relocation. It moves `Civ7UiLoadingStateName` into
  `src/setup/constants.ts` beside `CIV7_UI_LOADING_STATES` while keeping public
  facade type re-exports in `index.ts`. This preserves the derived alias and
  does not change loading-state values, setup/start/restart lifecycle
  orchestration, App UI snapshot parsing, or runtime-status projection. Public
  procedure schemas, operation/proof telemetry, hotseat runtime proof, AI
  ingestion, CLI semantic projection, Effect/oRPC procedure-core work, and Task
  2.9.4 matrix-row acceptance remain pending. This is local package/type
  relocation proof only, not runtime/live-game proof.
- Direct-control session state-selection slice: completed as a narrow session
  helper relocation. It moves `selectCiv7TunerState` and its private selection
  normalizer into `src/session/state.ts` while keeping the public facade export
  in `index.ts`. This preserves role/name/id state selection and
  `state-not-found` error classification, and does not change endpoint
  discovery, config resolution, socket/session lifecycle, command execution,
  reconnect behavior, health polling, or runtime-status projection. Session
  config/socket/reconnect source ownership, public procedure schemas,
  operation/proof telemetry, hotseat runtime proof, AI ingestion, CLI semantic
  projection, Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row
  acceptance remain pending. This is local package/source relocation proof
  only, not runtime/live-game proof.
- Direct-control session config slice: completed as a narrow session helper
  relocation. It moves `resolveCiv7DirectControlConfig` and its private
  host/env/port helpers into `src/session/config.ts` while keeping the public
  facade export in `index.ts`. This preserves host/env ordering,
  deduplication, port and timeout defaults, invalid-port classification, and
  existing CLI resolver behavior. It does not change endpoint discovery,
  socket/session lifecycle, command execution, reconnect behavior, health
  polling, or runtime-status projection. Endpoint discovery, session
  socket/reconnect source ownership, public procedure schemas, operation/proof
  telemetry, hotseat runtime proof, AI ingestion, CLI semantic projection,
  Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance remain
  pending. This is local package/source relocation proof only, not
  runtime/live-game proof.
- Direct-control request-id helper slice: completed as a narrow session helper
  relocation. It moves `createCiv7ControlRequestId` into
  `src/session/request-id.ts` while keeping the public facade export in
  `index.ts`. This preserves the existing prefix/date/pid format and existing
  CLI restart consumer behavior. It does not define telemetry/correlation
  contracts, procedure schemas, endpoint discovery, socket/session lifecycle,
  command execution, reconnect behavior, health polling, or runtime-status
  projection. Endpoint discovery, session socket/reconnect source ownership,
  telemetry/correlation contracts, public procedure schemas, operation/proof
  telemetry, hotseat runtime proof, AI ingestion, CLI semantic projection,
  Effect/oRPC procedure-core work, and Task 2.9.4 matrix-row acceptance remain
  pending. This is local package/source relocation proof only, not
  runtime/live-game proof.
- Direct-control endpoint discovery slice: completed as a narrow session helper
  relocation. It moves the endpoint discovery host-fallback helper into
  `src/session/discovery.ts` while keeping the public facade export in
  `index.ts` and preserving dependency-injected package proof. This preserves
  host/env ordering from config resolution, first-reachable-host selection,
  per-host error details, and `all-hosts-unavailable` classification. It does
  not move socket/session lifecycle, package-level command execution, reconnect
  behavior, health polling, runtime-status projection,
  telemetry/correlation contracts, or procedure schemas. Session
  socket/reconnect source ownership, command execution, telemetry/correlation
  contracts, public procedure schemas, operation/proof telemetry, hotseat
  runtime proof, AI ingestion, CLI semantic projection, Effect/oRPC
  procedure-core work, and Task 2.9.4 matrix-row acceptance remain pending. This
  is local package/source relocation proof only, not runtime/live-game proof.
- Direct-control session socket-open slice: completed as a narrow session helper
  relocation. It moves only `openCiv7TunerSocket` into
  `src/session/socket.ts` while `index.ts` continues to own
  `Civ7DirectControlSession`, frame request handling, state querying, command
  execution, session creation/close, reconnect orchestration, and public facade
  exports. This preserves connection timeout and connection-failed error
  classification. It does not define telemetry/correlation contracts, public
  procedure schemas, semantic CLI projection, AI ingestion, hotseat runtime
  proof, or Effect/oRPC procedure-core work. This is local package/source
  relocation proof only, not runtime/live-game proof.
- Direct-control tuner state-parts parser slice: completed as a narrow session
  state helper relocation. It moves `tunerStatesFromParts` into
  `src/session/state.ts` while preserving LSQ response pair parsing and
  dangling-part omission. `index.ts` still owns `Civ7DirectControlSession`,
  listener allocation, frame request handling, state querying, command
  execution, session creation/close, reconnect orchestration, and public facade
  exports. This does not define telemetry/correlation contracts, public
  procedure schemas, semantic CLI projection, AI ingestion, hotseat runtime
  proof, or Effect/oRPC procedure-core work. This is local package/source
  relocation proof only, not runtime/live-game proof.
- Direct-control tuner listener-id allocator slice: completed as a narrow
  session helper relocation. It moves `allocateListenerId` and its private
  counter into `src/session/listener-id.ts` while preserving positive
  incrementing listener IDs. `index.ts` still owns `Civ7DirectControlSession`,
  frame request handling, state querying, command execution, session
  creation/close, reconnect orchestration, and public facade exports. This does
  not define telemetry/correlation contracts, public procedure schemas,
  semantic CLI projection, AI ingestion, hotseat runtime proof, or Effect/oRPC
  procedure-core work. This is local package/source relocation proof only, not
  runtime/live-game proof.
- Direct-control unused tuner message helper cleanup: completed as a narrow
  facade source-hygiene slice. It removes the unused standalone
  `sendCiv7TunerMessage` helper after listener-id allocation and frame
  encoding/parsing gained named session owners. `index.ts` still owns
  `Civ7DirectControlSession`, frame request handling, state querying, command
  execution, session creation/close, reconnect orchestration, and public facade
  exports. This does not change runtime behavior, define telemetry/correlation
  contracts, public procedure schemas, semantic CLI projection, AI ingestion,
  hotseat runtime proof, or Effect/oRPC procedure-core work. This is local
  dead-code cleanup/source hygiene proof only, not runtime/live-game proof.
- Direct-control session class slice: completed as a narrow session owner
  relocation. It moves `Civ7DirectControlSession` and its private
  pending-request lifecycle into `src/session/session.ts` while preserving
  socket connection fallback, LSQ state queries, framed command execution,
  request timeout/close/error classification, and public facade exports.
  `index.ts` still owns package-level query/execute wrappers, session
  creation/close for public wrapper calls, reconnect orchestration, lifecycle
  composition, and public facade call-through. This does not define
  telemetry/correlation contracts, public procedure schemas, semantic CLI
  projection, AI ingestion, hotseat runtime proof, or Effect/oRPC
  procedure-core work. This is local package/source relocation proof only, not
  runtime/live-game proof.
- Direct-control session command wrapper slice: completed as a narrow session
  execute owner relocation. It moves `queryCiv7TunerStates`,
  `executeCiv7Command`, `executeCiv7AppUiCommand`, and
  `executeCiv7TunerCommand` into `src/session/execute.ts` while preserving
  public facade exports, session creation/close behavior, App UI/Tuner state
  forcing, command result shape, and focused session proof. `index.ts` still
  owns reconnect orchestration, lifecycle composition, and public facade
  call-through for higher-level atoms. This does not define
  telemetry/correlation contracts, public procedure schemas, semantic CLI
  projection, AI ingestion, hotseat runtime proof, or Effect/oRPC
  procedure-core work. This is local package/source relocation proof only, not
  runtime/live-game proof.
- Direct-control public endpoint discovery wrapper slice: completed as a narrow
  session discovery owner relocation. It moves the public
  `discoverCiv7DirectControlEndpoint` wrapper into `src/session/discovery.ts`
  now that `queryCiv7TunerStates` is owned by `src/session/execute.ts`, while
  preserving public facade exports, host/env ordering, first-reachable-host
  selection, per-host error details, `all-hosts-unavailable` classification,
  and focused dependency-injected package proof. `index.ts` still owns
  reconnect orchestration, lifecycle composition, and public facade call-through
  for higher-level atoms. This does not define telemetry/correlation contracts,
  public procedure schemas, semantic CLI projection, AI ingestion, hotseat
  runtime proof, or Effect/oRPC procedure-core work. This is local
  package/source relocation proof only, not runtime/live-game proof.
- Direct-control session reconnect helper slice: completed as a narrow session
  helper relocation. It moves only the private
  `executeSessionCommandWithReconnect` retry helper into
  `src/session/reconnect.ts` while preserving retry attempts,
  close-before-retry behavior, `750 + attempt * 750` backoff, and
  `command-failed` fallback classification. `index.ts` still owns Tuner-ready
  waiting, lifecycle composition, and public facade call-through for
  higher-level atoms. This does not define telemetry/correlation contracts,
  public procedure schemas, semantic CLI projection, AI ingestion, hotseat
  runtime proof, or Effect/oRPC procedure-core work. This is local
  package/source relocation proof only, not runtime/live-game proof.
- Direct-control health check slice: completed as a narrow session health owner
  relocation. It moves only `checkCiv7DirectControlHealth` into
  `src/session/health.ts` while preserving endpoint discovery composition,
  no-state/state-missing/unavailable classification, selected-state reporting,
  and typed error wrapping. `index.ts` still owns `waitForCiv7DirectControl`,
  Tuner-ready waiting, lifecycle composition, and public facade call-through
  for higher-level atoms. This does not define telemetry/correlation contracts,
  public procedure schemas, semantic CLI projection, AI ingestion, hotseat
  runtime proof, or Effect/oRPC procedure-core work. This is local
  package/source relocation proof only, not runtime/live-game proof.
- Direct-control wait wrapper slice: completed as a narrow session health
  owner relocation. It moves only `waitForCiv7DirectControl` into
  `src/session/health.ts` while preserving health polling, timeout/poll
  defaults, last-health timeout details, and `connection-timeout`
  classification. `index.ts` still owns Tuner-ready waiting, lifecycle
  composition, and public facade call-through for higher-level atoms. This does
  not define telemetry/correlation contracts, public procedure schemas,
  semantic CLI projection, AI ingestion, hotseat runtime proof, or Effect/oRPC
  procedure-core work. This is local package/source relocation proof only, not
  runtime/live-game proof.
- Direct-control Tuner-ready wait slice: completed as a narrow Tuner health
  owner relocation. It moves `waitForCiv7TunerReady` and
  `waitForCiv7TunerReadyWithSession` into `src/runtime/tuner-health.ts` while
  preserving session-scoped Tuner health polling, timeout/poll defaults,
  reconnect-close behavior, last-health-or-error timeout details, and
  `connection-timeout` classification. `index.ts` still owns setup/restart
  lifecycle composition and public facade call-through for higher-level atoms.
  This does not define telemetry/correlation contracts, public procedure
  schemas, semantic CLI projection, AI ingestion, hotseat runtime proof, or
  Effect/oRPC procedure-core work. This is local package/source relocation
  proof only, not runtime/live-game proof.
- Direct-control setup phase wait slice: completed as a narrow setup-read
  helper relocation. It moves the shared `waitForCiv7SetupPhase` polling helper
  into `src/setup/reads.ts` so setup map-row refresh and setup-run
  exit-to-shell orchestration use the same owner while `index.ts` continues to
  inject the helper into `src/setup/run.ts`. This preserves shell-phase
  polling, timeout details, `setup-phase-invalid` classification, and existing
  setup/lifecycle package proof. This does not define telemetry/correlation
  contracts, public procedure schemas, semantic CLI projection, AI ingestion,
  hotseat runtime proof, or Effect/oRPC procedure-core work. This is local
  package/source relocation proof only, not runtime/live-game proof.
- Setup-read facade dependency cleanup: `src/setup/reads.ts` now imports
  existing non-facade approval, App UI execution, command-result parser,
  serializer, runtime probe helper, setup constants, and bounds helper owners
  directly for setup snapshot, setup map rows, setup map-row refresh, and
  setup-phase waits. The public facade exports remain stable, but `index.ts`
  no longer assembles the default setup-read dependency object for those read
  and refresh paths. Setup prepare/start/run/restart lifecycle composition stays
  separate and still uses narrow dependency seams until a named Effect/Bun
  resource/schedule/layer pass is accepted. This preserves setup source text,
  parse labels, approval-first refresh behavior, setup map-row polling, and
  `setup-phase-invalid` classification. This is local package/source relocation
  proof only: it does not claim runtime/live-game proof, accept Task 2.9.4
  matrix rows, or unblock telemetry, AI ingestion, semantic CLI projection,
  hotseat runtime proof, schema/procedure-core work, or Effect/oRPC
  implementation.
- Setup-preparation facade dependency cleanup: `src/setup/prepare.ts` now
  imports existing non-facade setup-read defaults, command-result parser, and
  setup option identifier validation directly for
  `prepareCiv7SinglePlayerSetup`. The public facade export remains stable, but
  `index.ts` no longer assembles the preparation parser/validation dependency
  object for the direct prepare call. Prepared-start, setup-run, and
  restart/begin lifecycle composition stay separate and still use narrow
  dependency seams for session/reconnect/map/Tuner dependencies. This preserves
  approval-first setup mutation, setup snapshot readback, map-row proof, setup
  option validation, prepare command source, and no-replay package proof. This
  is local package/source relocation proof only: it does not claim
  runtime/live-game proof, accept Task 2.9.4 matrix rows, or unblock telemetry,
  AI ingestion, semantic CLI projection, hotseat runtime proof,
  schema/procedure-core work, or Effect/oRPC implementation.
- Prepared-start facade dependency cleanup: `src/setup/start.ts` now imports
  existing non-facade setup-read defaults, session/reconnect execution,
  Tuner-ready wait, map-summary read, command-result parser, setup
  loading-state constants, begin command constant, and setup option identifier
  validation directly for `startPreparedCiv7SinglePlayerGame`. The public
  facade export remains stable, but `index.ts` no longer assembles the
  prepared-start dependency object for the direct start call. Setup-run and
  restart/begin lifecycle composition stay separate and still use narrow
  injection seams for their higher-level orchestration. This preserves
  approval-first start, pre-start setup readback, host-game command source,
  begin polling, one-attempt begin send, Tuner/map verification, seed mismatch
  classification, and no-replay package proof. This is local package/source
  relocation proof only: it does not claim runtime/live-game proof, accept Task
  2.9.4 matrix rows, or unblock telemetry, AI ingestion, semantic CLI
  projection, hotseat runtime proof, schema/procedure-core work, or Effect/oRPC
  implementation.
- Setup-run facade dependency cleanup: `src/setup/run.ts` now imports existing
  non-facade setup read, setup prepare, prepared-start, App UI execution, setup
  constants, approval, bounds, and setup option identifier validation owners
  directly for `runCiv7SinglePlayerFromSetup`. The public facade export remains
  stable, but `index.ts` no longer assembles the setup-run dependency object for
  the direct run call. Restart/begin lifecycle composition stays separate and
  still uses narrow injection seams for its higher-level orchestration. This
  preserves approval-first run orchestration, active-game exit-to-shell guard,
  exit-to-main-menu routing, shell wait, prepare/start chaining, verified result
  shape, and no-replay package proof. This is local package/source relocation
  proof only: it does not claim runtime/live-game proof, accept Task 2.9.4
  matrix rows, or unblock telemetry, AI ingestion, semantic CLI projection,
  hotseat runtime proof, schema/procedure-core work, or Effect/oRPC
  implementation.
- Restart/begin facade dependency cleanup: `src/setup/restart.ts` now imports
  existing non-facade App UI execution, command execution, session/reconnect,
  Tuner-ready wait, restart/begin command constants, and UI loading-state
  constants directly for `beginCiv7Game`, `restartCiv7Game`, and
  `restartCiv7GameAndBegin`. The public facade exports remain stable, but
  `index.ts` no longer assembles restart/begin dependency objects for those
  direct lifecycle calls. This preserves begin command routing, restart-output
  rejection, begin-ready polling, one-attempt begin send, optional Tuner
  readiness wait, restart lifecycle package proof, and no-replay package proof.
  This is local package/source relocation proof only: it does not claim
  runtime/live-game proof, accept Task 2.9.4 matrix rows, or unblock telemetry,
  AI ingestion, semantic CLI projection, hotseat runtime proof,
  schema/procedure-core work, or Effect/oRPC implementation.
- Direct-control diplomacy closeout source slice: completed as a narrow
  operation source relocation. It moves only the App UI diplomacy response
  closeout command builder and embedded closeout source into
  `src/play/operations/diplomacy-request.ts` while keeping public facade exports
  in `index.ts`. The facade still injects approval, App UI execution,
  notification reads, player-operation validation, payload parsing, and
  serialization. This preserves optional notification activation,
  RESPOND_DIPLOMATIC_ACTION send behavior, leader acknowledgement, diplomacy UI
  closeout calls, focused diplomacy package/CLI proof, and existing
  postcondition classification. Runtime/live-game proof, telemetry, AI
  ingestion, semantic CLI projection, Effect/oRPC procedure-core work, and
  Task 2.9.4 matrix-row acceptance remain pending. This is local
  package/source relocation proof only, not runtime/live-game proof.
- Diplomacy response facade dependency cleanup:
  `src/play/operations/diplomacy-request.ts` now imports existing non-facade
  approval, player validation, App UI execution, notification view,
  player-operation validation, payload parser, serializer, and direct-control
  error owners directly for `requestCiv7DiplomacyResponse`. The public facade
  export remains stable, but `index.ts` no longer assembles the diplomacy
  response dependency object. This preserves approval-first
  RESPOND_DIPLOMATIC_ACTION orchestration, action/response integer validation,
  validator-first no-send behavior, App UI closeout command serialization,
  diplomacy postcondition classification, and package/CLI proof. This is local
  package/source relocation proof only: it does not claim runtime/live-game
  proof, accept Task 2.9.4 matrix rows, or unblock telemetry, AI ingestion,
  semantic CLI projection, hotseat runtime proof, schema/procedure-core work,
  or Effect/oRPC implementation.
- Direct-control narrative choice source slice: completed as a narrow
  operation source relocation. It moves only the App UI narrative choice
  command builder and embedded source into
  `src/play/operations/narrative-request.ts` while keeping public facade exports
  in `index.ts`. The facade still injects approval, App UI execution,
  notification reads, player-operation validation, payload parsing, ComponentID
  validation, and serialization. This preserves CHOOSE_NARRATIVE_STORY_DIRECTION
  send behavior, narrative popup/panel closeout calls, focused narrative
  package/CLI proof, and existing postcondition classification. Runtime/live-game
  proof, telemetry, AI ingestion, semantic CLI projection, Effect/oRPC
  procedure-core work, and Task 2.9.4 matrix-row acceptance remain pending. This
  is local package/source relocation proof only, not runtime/live-game proof.
- Narrative choice facade dependency cleanup:
  `src/play/operations/narrative-request.ts` now imports existing non-facade
  approval, player validation, ComponentID assertion, App UI execution,
  notification view, player-operation validation, payload parser, serializer,
  and direct-control error owners directly for `requestCiv7NarrativeChoice`.
  The public facade export remains stable, but `index.ts` no longer assembles
  the narrative choice dependency object. This preserves approval-first
  CHOOSE_NARRATIVE_STORY_DIRECTION orchestration, target/action validation,
  validator-first no-send behavior, App UI closeout command serialization,
  narrative postcondition classification, and package/CLI proof. This is local
  package/source relocation proof only: it does not claim runtime/live-game
  proof, accept Task 2.9.4 matrix rows, or unblock telemetry, AI ingestion,
  semantic CLI projection, hotseat runtime proof, schema/procedure-core work,
  or Effect/oRPC implementation.
- Ready-domain note artifact disposition: the temporary user note
  `packages/civ7-direct-control/src/play/ready/note-to-dra-updated.md` is not
  package source and must not be committed. Its control feedback is now
  recorded here and in the direct-control atom corpus: the current
  `src/play/ready/{unit,city,move-preview}.ts` split is only an interim
  extraction seam. A later domain-shape pass should regroup around topic-first
  owners such as city/unit ready modules and movement-local preview ownership
  instead of treating `play/ready` or standalone `move-preview.ts` as final
  authority.
- Review-disposition ledger: agent/reviewer findings recorded.
- Exact dismiss-notification CLI slice: completed as test-only extraction with
  local fixture ownership and no runtime claim.
- Notification HUD CLI slice: completed as test-only extraction with a
  boundary-clean parallel net-new test candidate, DRA-owned monolith/package
  integration, local HUD fixture ownership, and no runtime claim.
- Priorities CLI slice: completed as test-only extraction with a
  boundary-clean parallel net-new test candidate, DRA-owned monolith/package
  integration, local priority fixture ownership, relationship-label guards, and
  no runtime claim.
- Next implementation lane: Task 2.9.4 compatibility matrix-row acceptance
  before any dependent CLI semantic, telemetry, AI-ingestion, runtime-status,
  schema/type, debug/internal service, Effect/Bun, or oRPC procedure-core work.
  Direct-control atom extraction and package proof are verified for the current
  modularization phase; future source edits must either stay independent of
  those downstream gates or start from accepted matrix rows with source owners,
  proof owners, schemas/tests, and stop conditions recorded.
- oRPC/Effect lane: planning-only in this support branch. The OpenSpec now
  explicitly cites `civ7-orpc-control-architecture` from
  `codex/civ7-orpc-control-architecture-skill` as the oRPC
  procedure/router/context/middleware authority, but tracked
  `packages/civ7-control-orpc` source, procedure-core schemas, CLI semantic
  surface work, telemetry hooks, and Effect/Bun implementation planning remain
  pending before changing hierarchy/source shape.
- TypeBox versus Effect Schema report disposition: report-only thread
  `019e8efd-a057-7263-83a9-828e49a07b70` is accepted as planning evidence only.
  The workstream adopts a bounded-hybrid planning default: keep current TypeBox
  public contracts in place until a consumer-backed schema slice proves
  replacement value; consider Effect Schema for new/refactored Effect-native
  procedure-core, telemetry, and AI-ingestion contracts where decode/encode,
  transformations, typed parse errors, Effect integration, or
  machine-ingestion ergonomics materially help. Zod must not become a third
  durable schema authority by drift; if oRPC needs it as an adapter layer, that
  boundary must be explicit. Schema migration remains blocked on Task 2.9.4
  matrix-row acceptance plus oRPC schema/procedure validation, error-shape
  snapshot, encode/decode round trip, Bun runtime check, CLI semantic
  projection test, and AI-ingestion contract fixture test. This does not
  migrate schemas, add Effect Schema artifacts, import root-branch oRPC
  experiment source, unblock 5.x/6.x work, or claim procedure-core readiness.
- Map-read facade dependency cleanup: `src/play/map/reads.ts` now imports
  existing non-facade executor, parser, serializer, probe, validation, and map
  bound/default owners directly for map summary, plot snapshot, and map grid
  reads. The public facade in `src/index.ts` remains stable but no longer
  assembles that dependency object. This is local package/source relocation
  proof only: it does not change map read behavior, claim runtime/live-game
  proof, accept Task 2.9.4 matrix rows, or unblock telemetry, AI ingestion,
  CLI semantic projection, hotseat runtime proof, schema/procedure-core work,
  or Effect/oRPC implementation.
- Summary-read facade dependency cleanup: `src/play/summaries.ts` now imports
  existing non-facade executor, parser, serializer, probe, validation, and
  bounds helpers directly for player, unit, and city summary reads. The public
  facade in `src/index.ts` remains stable but no longer assembles that
  dependency object. This is local package/source relocation proof only: it
  does not change summary validation, component-id pass-through behavior,
  relationship-label policy, runtime/live-game proof, Task 2.9.4 matrix-row
  acceptance, telemetry, AI ingestion, CLI semantic projection, hotseat runtime
  proof, schema/procedure-core work, or Effect/oRPC implementation.
- GameInfo-read facade dependency cleanup: `src/play/map/gameinfo.ts` now
  imports existing non-facade executor, parser, serializer, probe, validation,
  constants, and bounds helpers directly for GameInfo row reads. The public
  facade in `src/index.ts` remains stable but no longer assembles that
  dependency object. This is local package/source relocation proof only: it
  does not change GameInfo table/filter validation, lookup/filter value
  pass-through, limit/offset bounds, schema/primary-key options,
  runtime/live-game proof, Task 2.9.4 matrix-row acceptance, telemetry, AI
  ingestion, CLI semantic projection, hotseat runtime proof,
  schema/procedure-core work, or Effect/oRPC implementation.
- Visibility/reveal facade dependency cleanup: `src/play/map/visibility.ts`
  now imports existing non-facade approval, executor, parser, serializer,
  probe, validation, constants, and bounds helpers directly for visibility
  summary reads and reveal-map orchestration. The public facade in
  `src/index.ts` remains stable but no longer assembles that dependency object.
  This is local package/source relocation proof only: it does not change
  visibility bounds behavior, reveal approval/disposable-session behavior,
  reveal classification, runtime/live-game proof, Task 2.9.4 matrix-row
  acceptance, telemetry, AI ingestion, CLI semantic projection, hotseat runtime
  proof, schema/procedure-core work, or Effect/oRPC implementation.
- Direct-control source verification checkpoint: current stack top
  `83aebdb45` on `codex/disposition-schema-evaluation-report` passed
  `bun run --cwd packages/civ7-direct-control check`,
  `bun run --cwd packages/civ7-direct-control test`,
  `bun run --cwd packages/civ7-direct-control build`,
  `bun run openspec -- validate civ7-support-direct-control-modularization --strict`,
  `bun run resources:status`, `git diff --check`, `bun run check:cli`, and
  `bun run test:cli:play`. Ownership/no-cycle scans found no executable
  back-imports from `packages/civ7-direct-control/src` to `index.ts`, and
  `packages/civ7-direct-control/src/index.ts` no longer owns embedded command
  source builders or postcondition helper definitions. This closes only the
  direct-control source-slice verification and OpenSpec validation checklist
  items. Test-only slice closure, runtime proof labeling, CLI semantic/debug
  output proof, Effect/Bun source proof, final downstream realignment, Task
  2.9.4 matrix-row acceptance, telemetry, AI ingestion, schema migration, and
  Effect/oRPC procedure-core work remain pending.
- Runtime proof disposition checkpoint: gameplay remains parked, so this
  workstream attaches the explicit `pending-runtime-proof` label instead of
  claiming live-game evidence. All source relocation and mutation-facing package
  tests in this modularization stack remain local package/source proof only.
  Runtime/live-game proof, hotseat activation/rotation/action/restoration
  proof, AI-on-hotseat product-path proof, and any support-owned real-game
  verification remain pending until a separately framed runtime proof lane runs
  against fresh in-game Tuner/HUD state. This closes only checklist item 7.3's
  proof-labeling requirement; it does not close runtime proof itself, Task 2.9.4
  matrix-row acceptance, telemetry, AI ingestion, CLI semantic projection,
  schema migration, Effect/Bun implementation, or Effect/oRPC procedure-core
  work.
- CLI test-only verification checkpoint: current stack top
  `ce980a41b` on `codex/record-runtime-proof-disposition` preserves the
  section 3 CLI play test ownership closure. Fresh focused verification passed
  `bun run --cwd packages/cli test -- game/play/notification/dismiss.test.ts game/play/notification/hud.test.ts game/play/priorities.test.ts`.
  The previous source verification checkpoint passed `git diff --check`,
  `bun run check:cli`, and canonical `bun run test:cli:play`; the adjacent
  monolith proof is now represented by the absence of
  `packages/cli/test/commands/game.play.test.ts` plus the CLI corpus rows that
  record the original focused/adjacent filters for exact dismissal,
  notification HUD, and priorities. Ownership scans show
  `GamePlayDismissNotification`, `GamePlayNotifications`, and
  `GamePlayPriorities` owned by their extracted test files, with priority
  relationship wording limited to negative assertions and
  `relationship-unproven` fixture policy. This closes only checklist item 7.1's
  test-only verification requirement; it does not close CLI semantic-surface
  implementation/proof, Task 2.9.4 matrix-row acceptance, telemetry, AI
  ingestion, schema migration, Effect/Bun implementation, or Effect/oRPC
  procedure-core work.
- Blocked-lane proof disposition checkpoint: checklist items 7.4 and 7.5 are
  satisfied for this modularization phase by absence/disposition, not by
  implementation. Rows 5.1-5.7 remain blocked on Task 2.9.4 and no CLI semantic
  surface slice was implemented in this closure pass, so there is no new normal
  CLI/debug-surface proof to attach beyond the test-only ownership and broad
  `test:cli:play` gates already recorded. Rows 6.1-6.9 remain blocked on Task
  2.9.4 and no Effect/Bun source slice was implemented, so there is no resource,
  stream/error, or API-choice source proof to attach. This closes only the
  checklist obligations for completed work in this OpenSpec phase. It does not
  start or close CLI semantic envelopes, debug hierarchy changes, telemetry, AI
  ingestion, schema migration, Effect/Bun implementation, Effect/oRPC
  procedure-core work, or Task 2.9.4 matrix-row acceptance.
- Downstream realignment and closure checklist checkpoint: section 7 is complete
  for the current modularization closure pass. The support stack has current
  local verification records for test-only CLI ownership, direct-control source
  slices, OpenSpec strict validation, explicit `pending-runtime-proof`, and
  blocked downstream lanes. The stale next-lane pointer now points at Task 2.9.4
  compatibility matrix-row acceptance rather than more atom extraction. This
  does not close the OpenSpec change as a whole: Task 2.9 parent/2.9.4,
  2.10 guardrails, CLI semantic lane 5.x, Effect/Bun/oRPC lane 6.x, runtime
  proof, hotseat runtime proof, telemetry, AI ingestion, schema migration, and
  procedure-core work remain pending by design.
- Command parser/serializer dependency-record alignment: the atom corpus now
  matches the current dependency-pruning stack by recording that shared
  command-result parser and command-source serializer consumers import the
  existing owner modules directly instead of receiving those helpers from
  `index.ts`. Atom-local source serializers remain local where not yet
  normalized. This is a docs/OpenSpec record alignment only; it does not change
  source behavior, claim runtime/live-game proof, accept Task 2.9.4, or unblock
  CLI semantic, telemetry, AI ingestion, schema migration, Effect/Bun, or
  Effect/oRPC procedure-core work.

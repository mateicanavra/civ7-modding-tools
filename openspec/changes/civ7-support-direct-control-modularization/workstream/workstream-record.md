# Civ7 Support Direct-Control Modularization Workstream

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
| `019e8af1-427e-7463-a9be-dbdeabbccfdf`                                                | Assess oRPC authority lane                  | framed `/goal` report-only    | completed, idle                                                                      | yes                                         | Accepted as authority disposition; no mutation authority.                                                                                                               | Confirms current support branch lacks tracked `.agents/skills/civ7-orpc-control-architecture` and `packages/civ7-control-orpc`; oRPC stays downstream until authority/source is imported or cited from the relevant branches.                                          |
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

## Parallelization Rule

Agents may use separate worktrees or a shared visible worktree, but every lane
must have a disjoint write set before editing. The spec owner coordinates
Graphite; no lane may restack, submit, or mutate unrelated stacks. `package.json`
play-script wiring and `packages/cli/test/commands/game.play.test.ts` are
single-owner files for each active slice.

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
- Direct-control ComponentID primitive slice: in progress as the first
  source-owner extraction after package-test ownership completed. It moves
  ComponentID schema/guard/assertion plus the direct-control error class/type
  into focused owner modules behind the existing package facade. This is
  type/source ownership proof only, not runtime proof. Disposition for protected
  stash `preserve user direct-control modularization note before dismiss queue
  slice`: compatible and preserved. The note requires tests first, then
  principled modularization/export of constants/types; this slice follows the
  completed package-test coverage and creates named primitive/error owners
  rather than a broad facade or dumping ground.
- Direct-control tuner framing slice: in progress from the completed
  `019e8b69-465d-7a71-8ef1-1f75f96799c2` source candidate. It moves only
  `Civ7TunerFrame`, `encodeCiv7TunerRequest`, and `parseCiv7TunerFrame` into
  `src/session/framing.ts` behind the existing package facade. Broader
  session/config/reconnect and restart/setup lifecycle source extraction stays
  pending because those seams have additional helper dependencies.
- Direct-control settlement recommendation source slice: in progress from the
  refined read-only atom report in `019e8b69-ae88-79f1-b5dd-dd530c2ea2bf`.
  It moves only the settlement recommendation embedded source into
  `src/play/tactical/settlement.ts`. Wrapper/builder ownership stays in
  `index.ts`; this is source relocation proof only, not runtime proof.
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
- Next implementation lane: direct-control atom planning/tests. Source edits
  remain blocked until atom rows name owners, consumers, proof class, and package
  test coverage.
- oRPC/Effect lane: planning-only in this support branch. Current tracked files
  do not include `.agents/skills/civ7-orpc-control-architecture` or
  `packages/civ7-control-orpc`; later work must import or explicitly cite the
  oRPC authority branch before implementation and must include the CLI semantic
  surface and Effect/Bun planning phases before changing hierarchy/source shape.

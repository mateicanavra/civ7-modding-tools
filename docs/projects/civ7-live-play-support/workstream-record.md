# Civ7 Live Play Support

Status: `active-draft`.
Branch: `agent-watch-civ7-live-play-reference-assembly`.
DRA: `Codex watcher`.
Dates: `2026-06-01 -> active`.

This minimal record preserves state and handoff context for one bounded
workstream. It is not the purpose of the workstream.

## Frame

Objective:

Watch the active Civ7 play agent, help it while it plays by feeding timely
direct-control/resource/strategy evidence, and convert the useful discoveries
into normative reference artifacts and CLI play shortcuts that can later become
skills or skill assets.

Done means:

- The watcher worktree is based on the latest relevant studio/direct-control
  branch and remains clean at handoff.
- The active play thread is trailed with evidence-scoped support notes when the
  watcher has useful, non-noisy information.
- Research lanes produce provenance-backed evidence packs for direct-control
  blocker mechanics, local official game data, and current online strategy
  context.
- The CLI gains bounded categorical shortcuts for common play operations where
  operation shape is supported by direct-control evidence.
- Durable artifacts separate confirmed normative guidance, inferred guidance,
  open questions, and future skill assets.

Authority inputs:

- Root `AGENTS.md`.
- `docs/DOCS.md`.
- `docs/process/GRAPHITE.md`.
- `docs/process/resources-submodule.md`.
- `packages/civ7-direct-control/AGENTS.md`.
- `.agents/skills/civ7-architecture-authority`.
- `.agents/skills/civ7-product-authority`.
- `.agents/skills/civ7-operational-debugging`.
- `workstream-runner`, `workstream-review-loops`, `team-design`, and
  `framing-design`.
- Active play thread `019e821b-364c-72a3-83ef-9263120ece72`.

Non-goals:

- Do not become the play agent or take over live game mutation.
- Do not add alternate runtime transports or caller-local socket control.
- Do not hand-edit generated outputs, deployed Mods folders, lockfiles, or
  official resource outputs.
- Do not promote online strategy advice above official game data or live
  direct-control evidence.
- Do not encode speculative operation schemas as normative shortcuts.

Stop/escalation conditions:

- A proposed CLI shortcut requires undocumented or speculative operation args.
- Live direct-control evidence contradicts official UI/resource interpretation.
- The play agent asks for exclusive control or the watcher risks interfering
  with live mutation sequencing.
- Graphite/worktree state becomes dirty with unrelated changes.

## Work

Plan:

1. Ground watcher worktree, repo workflow, active thread, and live direct-control
   status.
2. Run framed agent lanes for direct-control blocker mechanics, local official
   resources, and online strategy context.
3. Add bounded CLI play shortcuts for confirmed/common operation families.
4. Assemble normative references and topic essays from confirmed evidence.
5. Review proof boundaries, verify, commit, and leave the worktree clean.

Outputs:

- This workstream record.
- CLI play shortcut commands and tests:
  - `game play end-turn`
  - `game play notifications`
  - `game play operation`
  - `game play advisor-warning`
  - `game play choose-tech`
  - `game play set-tech-target`
  - `game play choose-culture`
  - `game play set-culture-target`
  - `game play choose-celebration`
  - `game play respond-diplomacy`
  - `game play choose-narrative`
  - `game play buy-attribute`
  - `game play consider-attributes`
  - `game play change-tradition`
  - `game play consider-traditions`
  - `game play assign-worker`
  - `game play set-town-focus`
  - `game play consider-town-project`
  - `game play expand-city`
  - `game play build-production`
  - `game play ready-city`
  - `game play build-unit`
  - `game play ready-unit`
  - `game play promotion-readiness`
  - `game play unit-target`
  - `game play settlement-recommendations`
  - `game play target-candidates`
  - `game play battlefield-scan`
  - `game play destination-analysis`
  - `game watch`
  - `game play topics`
  - `game ai loaded-levers`
  - `game local-data inspect`
- Evidence packs and topic/reference artifacts:
  - `SKILL-ASSET-ASSEMBLY.md`
  - `topics/end-turn-blockers.md`
  - `topics/early-game-decision-context.md`
  - `topics/unit-target-actions.md`
  - `topics/notification-decision-hud.md`
  - `topics/ready-unit-commander-actions.md`
  - `topics/production-build-placement.md`
  - `topics/ready-city-decision-view.md`
  - `topics/population-placement-expansion.md`
  - `topics/progression-tree-targets.md`
  - `topics/celebration-choice.md`
  - `topics/runtime-state-sources.md`
  - `topics/settlement-recommendations.md`
  - `topics/strategic-planning-snapshot.md`
  - `topics/target-candidates.md`
  - `topics/battlefield-scan.md`
  - `topics/destination-analysis.md`
  - `topics/civilian-route-triage.md`
  - `topics/tactical-lens-api-roadmap.md`
  - `topics/rhq-ai-mod-baseline.md`
  - `evidence-packs/current-online-play-context.md`
  - `evidence-packs/agent-evidence-summary.md`
- Watcher notes sent to the active play thread when useful.

Evidence:

- Watcher worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-watch-civ7-live-play-reference-assembly`.
- Base branch:
  `codex/integrate-authoring-guards-over-studio`.
- Live game read-only snapshot on 2026-06-01:
  turn `77`, date `2100 BCE`, Tuner ready, autoplay inactive, map `84 x 54`,
  local human player `0`.
- Active play thread proved `VIEWED_ADVISOR_WARNING` can clear advisor blockers
  when sent through the official player-operation path, then advanced turn
  `76 -> 77`.
- Active play thread turn `79` produced exact next-family args:
  `RESPOND_DIPLOMATIC_ACTION {"ID":56,"Type":-1907089594}`,
  `SET_CULTURE_TREE_NODE {"ProgressionTreeNodeType":115}`,
  `CHOOSE_NARRATIVE_STORY_DIRECTION
  {"TargetType":"TOT_30001B","Target":{"owner":0,"id":45,"type":35},"Action":-1326475004}`,
  `BUY_ATTRIBUTE_TREE_NODE {"ProgressionTreeNodeType":20}`, and
  `CONSIDER_ASSIGN_ATTRIBUTE {}`.
- Active play thread then proved the tradition swap family:
  `CHANGE_TRADITION {"TraditionType":2057145683,"Action":1318334332}`,
  `CHANGE_TRADITION {"TraditionType":-331546976,"Action":-1326475004}`,
  followed by `CONSIDER_ASSIGN_TRADITIONS {}` to move the blocker from
  `TRADITIONS` to `NONE`.
- Active play thread turn `80` surfaced town projects as a distinct
  `city-command CHANGE_GROWTH_MODE` family. Official UI code confirms the
  town-focus args shape: `{Type, ProjectType, City: cityID.id}`.
- The exact turn-80 Fishing Town args were
  `CHANGE_GROWTH_MODE {"Type":-284569333,"ProjectType":-548685232,"City":131073}`
  on city `{"owner":0,"id":131073,"type":1}`. The production panel close path
  also uses `city-operation CONSIDER_TOWN_PROJECT {}`, but the live thread
  showed that closeout alone did not clear `NEW_POPULATION`.
- The live user click later cleared the town population gate, but direct-control
  did not capture the exact operation. Official UI evidence says the
  `NEW_POPULATION` notification enters `INTERFACEMODE_ACQUIRE_TILE`; the click
  path then sends `ASSIGN_WORKER` for workable plots or city-command `EXPAND`
  for expansion.
- A follow-up production-family research lane confirmed the official UI split:
  ordinary `BUILD` production uses `UnitType`, `ConstructibleType`, or
  `ProjectType` depending on item kind, while town focus remains a separate
  `CHANGE_GROWTH_MODE` command.
- Agent lanes produced evidence packs for direct-control blocker mechanics,
  local official resource facts, current online strategy context, and CLI
  shortcut demand.
- Direct-control now owns a read-only play notification view via
  `getCiv7PlayNotificationView`; the CLI exposes it as
  `game play notifications`.
- The end-turn guard now records `firstReadyUnitId` and accepts the App UI
  evidence set `hasSentTurnComplete:false`, blocker `0`, ready unit `null` even
  when the `canEndTurn()` probe is conservative around non-blocking
  notifications.
- Turn 81 shifted from blocker resolution into tactical play. Official UI
  evidence shows right-click unit targeting is not a bare operation choice:
  `WorldInput.requestMoveOperation` tries naval, air, ranged, overrun, swap,
  then `MOVE_TO` with attack/unexplored modifiers and uses target plot
  coordinates. Direct-control now owns `getCiv7UnitTargetAction` /
  `requestCiv7UnitTargetAction`; the CLI exposes it as
  `game play unit-target`.
- The notification materialized view has been upgraded into a decision HUD:
  `hud.nextDecision` and `hud.decisionQueue` put the current blocker first and
  list required live inputs, common safe actions, operation family/type, target,
  location, and notes. This keeps the raw notification facts available while
  giving the active play agent a smaller "what do I need before acting?"
  surface.
- Narrative research for `ATTRIBUTE_QUEST_1004A` showed no official
  `NarrativeStory_Links` rows. Official narrative UI falls back to a single
  `CLOSE` option when no links are present, so this family should be treated as
  an acknowledgement unless validation proves otherwise. The bounded query path
  is `Stories.getFirstPendingMetId()`, `Stories.find(target)`,
  `GameInfo.NarrativeStories.lookup(story.type)`, then a narrow
  `NarrativeStory_Links.filter`.
- Turn 85 exposed the next `COMMAND_UNITS` support gap: the HUD can identify
  the ready unit id, but commander play needs the unit's resolved type, legal
  no-target operation/command candidates, and nearby occupied plots before
  choosing hold, pack, unpack, promote, move, or attack. Direct-control now owns
  `getCiv7ReadyUnitView`; the CLI exposes it as `game play ready-unit`.
- Turn 97 exposed a default-handler notification gap:
  `NOTIFICATION_WONDER_COMPLETED` blocked end-turn despite having no valid
  target/location and no specialized registered handler. Direct-control now owns
  a guarded notification dismissal read/request surface; the CLI exposes it as
  `game play dismiss-notification` for reviewed, user-dismissible information
  notices.
- Turn 62 exposed a first-meet diplomacy gap: `NOTIFICATION_PLAYER_MET` looked
  like a default-handler notice until the live panel path proved it was a
  `RESPOND_DIPLOMATIC_FIRST_MEET` player operation with
  `{ Player1, Player2, Type }`. The HUD now classifies it as
  `first-meet-diplomacy`, and the CLI exposes `game play respond-first-meet`.
- Turn 78 exposed a constructible placement gap in ordinary production:
  `BUILD {"ConstructibleType":713967338}` for Ancient Walls validated but did
  not clear the blocker; adding the official placement coordinates
  `{"X":22,"Y":31}` queued production. The CLI now exposes
  `game play build-production` so agents can send unit, constructible, or
  project production with explicit item-kind and placement args.
- Turn 58 exposed a progression-tree target gap: the apparent culture row index
  `224` was not enough; the operation needed the actual
  `ProgressionTreeNodeType` hash `-1677668973`, and
  `SET_CULTURE_TREE_TARGET_NODE` was part of the closeout path. The CLI now
  exposes `game play set-culture-target` and `game play set-tech-target`.
- Local on-disk research showed that app-support debug SQLite copies are useful
  static catalogs (`gameplay-copy.sqlite`, `frontend-copy.sqlite`,
  localization/images/colors), while current autosaves are opaque `CIV7`
  binary data and logs are bounded forensic evidence. The support frame is
  hybrid: direct-control remains live decision authority; local disk becomes a
  cache/enrichment lane.
- A read-only `game play ready-city --json` smoke on 2026-06-01 resolved the
  current blocker city to `{"owner":0,"id":65536,"type":1}`, returned 21
  actionable production candidates, no town-focus options for that non-town
  city, `isReadyToPlacePopulation:false`, and sent no operation.
- Follow-up local DB review confirmed the source split: app-support SQLite
  files can support catalog/history enrichment, and `HallofFame.sqlite` has
  recorded game/player/object history tables, but none of the observed local DB
  surfaces provide a proven live contract for the current notification queue,
  selected entity, modal state, operation validators, or post-send state.
  Disposition: keep direct-control as live authority and treat the notification
  HUD as a short-lived runtime materialized view enriched by local catalogs.
- Online source review on 2026-06-01 confirmed the current official online
  context should be date-bound and advisory: the official update notes identify
  Update 1.4.0 / Test of Time as the latest patch, while 2K's newsroom dates
  the Test of Time update to 2026-05-19. Reviewer follow-up also identified
  2K's Test of Time announcement/out-now pages and the support tracker as
  higher-signal official URLs for the online lane. Disposition: add
  `evidence-packs/current-online-play-context.md` and keep online advice below
  direct-control, local official resources, and validators.
- Turn 79 after rest-of-game autoplay restart proved the open `NEW_POPULATION`
  expansion branch: `city-command EXPAND {"X":16,"Y":19}` on city
  `{"owner":0,"id":196610,"type":1}`. This complements the already proven
  `ASSIGN_WORKER { Location, Amount: 1 }` branch for workable plots.
  Disposition: add `game play expand-city` and
  `topics/population-placement-expansion.md`.
- Turn 80 exposed another first-meet blocker, this time Napoleon. The
  notification HUD now reads `notification.Player` and materializes
  first-meet details: `player1:0`, `player2:1`, other-player labels, validated
  friendly/neutral/unfriendly args, and a conservative neutral
  `recommendedCli`. A validate-only smoke proved
  `RESPOND_DIPLOMATIC_FIRST_MEET {"Player1":0,"Player2":1,"Type":673478009}`
  succeeds without sending. Disposition: enrich `game play notifications` so
  future agents do not need a separate manual first-meet panel scrape when the
  notification exposes `Player`.
- Local SQLite is readable and valuable for static catalog enrichment:
  `gameplay-copy.sqlite` has 492 tables, `frontend-copy.sqlite` has 118 tables,
  `Types` has 13,714 rows, and `LocalizedText` has 41,837 rows. Disposition:
  capture the authority split in `topics/local-catalog-enrichment.md`; use
  local DBs to enrich HUD labels and shortcuts, not to replace live runtime
  blockers, validators, or postcondition reads.
- Turn 82 after the restart recovery exposed a reviewed natural-disaster report
  blocker: `NOTIFICATION_VOLCANO_ACTIVE`, `canUserDismiss:true`, reported plot
  `(6,27)`, no ready unit, and blocker enum `0`. Official resources define
  active/inactive volcano and river flood notices as expiring, non-auto-notify
  report notifications with no specialized handler. Disposition: classify these
  default-handler disaster reports as `informational-notification` so the HUD
  points to reviewed `game play dismiss-notification` closeout instead of a
  generic unknown operation.
- Turn 100 after a human-side restart exposed another default-handler closeout:
  `NOTIFICATION_GRIEVANCES_AGAINST_YOU` id
  `{"owner":0,"id":459,"type":20}`. Live rehydration proved a turn mismatch
  from expected turn `97` to live turn `100 / 1620 BCE`. Official handler
  registration has specialized entries for ordinary diplomatic actions,
  responses, relationship changes, war, and espionage, but not grievances
  against you. A read-only dismissal probe showed the grievance notice was
  user-dismissible and not a `RESPOND_DIPLOMATIC_ACTION` operation.
  Disposition: classify grievance reports as reviewed informational closeout
  while preserving the strategic relationship/Influence context in the summary.
- Turn 101 exposed a targetless `NOTIFICATION_NEW_POPULATION` gap. The HUD
  correctly classified the blocker, but `ready-city` initially returned no city
  because the notification target and selected city were empty. Official
  `NewPopulationHandler` does not rely on the target in that case; it scans the
  local player's cities for `Growth.isReadyToPlacePopulation`. Disposition:
  add the same fallback to `game play ready-city`. A live re-read resolved city
  `{"owner":0,"id":131073,"type":1}`, returned workable plots `2623` and
  `2708`, and validate-only `assign-worker --location 2708` succeeded.
- Strategy-snapshot research refined the next read gaps: official XML gives
  age legacy/victory thresholds and AI strategy hints, but live victory
  progress, diplomacy relationships, Influence income/cost, and rival
  comparison need first-class UI-equivalent direct-control wrappers before a
  deterministic `game play strategic-snapshot` can be promoted.
- Observer-mode research refined the watcher product shape: trust App UI first
  after restart, re-prove Tuner with a canary before gameplay reads, and keep
  passive human-turn watch at low-impact polling rather than broad map/entity
  reads. Foreground focus remains an inference, not a proven OS-level signal.

Review findings and disposition:

- Finding: a generic `choose-civic` shortcut is not yet supported as a separate
  concept from the proven turn-79 culture-tree operation.
  Disposition: added `choose-culture`; keep `choose-civic` deferred unless a
  future civic surface proves a distinct operation shape.
- Finding: constructible production can require placement coordinates even when
  the initial `ConstructibleType` validator succeeds.
  Disposition: added `game play build-production` with optional `X`/`Y` for
  constructible placement and documented the turn-78 Ancient Walls proof.
  Ordinary city-project production still needs more live postcondition proof.
- Finding: the exact town population click operation is still unknown.
  Disposition: the original user click stayed unresolved, but a later turn-79
  live operation proved the expansion branch as `city-command EXPAND { X, Y }`;
  add a named shortcut while keeping tile ranking and candidate cataloging open.
- Finding: agents need a fast way to see blocker notifications and candidate
  operation families before choosing a shortcut.
  Disposition: added the read-only `game play notifications` materialized view,
  then expanded it into a decision HUD with required inputs and common safe
  actions.
- Finding: validator-success unit actions can still be tactical no-ops.
  Disposition: added `game play unit-target`, which resolves target actions
  through official right-click order and returns before/after probes so agents
  can treat postconditions, not send plumbing, as proof. The result now includes
  `verification.status`, so sent-but-unchanged actions are explicit
  `no-state-change` postcondition misses rather than ambiguous command success.
- Finding: stale combat coordinates are now the dominant play-quality risk
  during the active agent's wartime turns.
  Disposition: added an early-war stale-state tactical guard topic that combines
  local tutorial/Civilopedia/unit-stat evidence with official combat and
  diplomacy framing.
- Finding: active human play can coincide with long direct-control response
  times, including read-only calls.
  Evidence: the active play thread observed ordinary subsecond reads/sends plus
  7-20 second delays while the human was interacting with Civ. Current evidence
  supports a runtime-busy/stale-state frame but does not prove foreground focus
  as the root cause.
  Disposition: added a watcher-latency observer-mode evidence pack with
  human-turn watch, agent-turn play, restart recovery, and JSONL observation
  schema guidance.
- Finding: `COMMAND_UNITS` is too broad for the notification HUD alone,
  especially when the ready unit is an Army Commander.
  Disposition: added the read-only `game play ready-unit` view and a commander
  topic that separates support-radius anchoring from direct combat.
- Finding: not every end-turn blocking notification is a gameplay decision.
  Disposition: added `game play dismiss-notification` for reviewed,
  user-dismissible default-handler notices, and documented why specialized
  decision families must not use generic dismissal.
- Finding: wartime report notifications can block end-turn after all unit
  readiness is resolved.
  Evidence: turn 57 showed `NOTIFICATION_UNIT_ATTACKED` with
  `canUserDismiss:true`, `isEndTurnBlocking:true`, blocker enum `0`, and
  `firstReadyUnitId:null`. Official resources define unit attacked, district
  attacked, and volcano eruption notices as expiring report notifications with
  no specialized registered handler.
  Disposition: classified these report families as reviewed informational
  closeout candidates in the HUD while preserving the tactical review
  requirement before dismissal.
- Finding: a strict "any end-turn-blocking notification blocks end turn"
  fallback is too blunt.
  Evidence: turn 58 showed why expired culture choice must remain blocked until
  the exact `ProgressionTreeNodeType` enum and target node are corrected; turn
  59 showed the opposite stale lifecycle case, where `COMMAND_UNITS` remained
  as an end-turn-blocking notification after blocker `0` and
  `firstReadyUnitId:null`.
  Disposition: refined the end-turn fallback so stale `COMMAND_UNITS` can pass
  only when the ready-unit queue is clean, reviewed default-handler report
  notifications can pass when user-dismissible, and real decision families
  still block.

Verification:

- `bun run --cwd packages/civ7-direct-control test` -> pass, 32 tests.
- `bun run --cwd packages/civ7-direct-control check` -> pass.
- `bun run --cwd packages/civ7-direct-control build` -> pass; required because
  the CLI resolves `@civ7/direct-control` through `dist`.
- `bun run --cwd packages/cli test -- game.play.test.ts` -> pass, 20 tests.
- `./node_modules/.bin/tsc -p packages/cli/tsconfig.json
  --noEmitOnError false || true` -> emitted the new CLI command while reporting
  the pre-existing `@civ7/plugin-mods` declaration errors.
- `git diff --check` -> pass.
- `bun run --cwd packages/cli check` -> not passed because existing
  `@civ7/plugin-mods` declaration/build availability errors block package-wide
  typecheck in this worktree; the errors are outside the new `game play` files.

## Outcome

Objective outcome: `partially achieved`.

Residual objective gaps:

- The first CLI shortcut family is implemented and verified by focused tests.
- The second player-operation shortcut family from turn 79 has been added,
  including tradition and attribute review closeout commands.
- The first town-focus shortcut from turn 80 has been added as a city-command
  wrapper rather than a production shortcut, with a separate town-project
  review closeout shortcut.
- A read-only notification HUD/materialized view has been added for play agents.
- A unit-target resolver has been added for tactical plot targeting and
  validator-success/no-op diagnosis.
- The end-turn shortcut now checks the notification HUD before using its
  conservative fallback when `canEndTurn` is false. It permits stale
  `COMMAND_UNITS` closeout when no ready unit remains and permits reviewed
  informational report closeout when user-dismissible, but continues to reject
  real unresolved decision families.
- Initial normative project artifacts are assembled.
- A notification-decision HUD topic now captures the blocker-family frame and
  narrative `CLOSE` lesson for later skill/resource promotion.
- A ready-unit/commander topic now captures the turn-85 commander decision
  frame, official local resource anchors, and online commander/Harriet context.
- An informational-notification topic now captures the wonder-completed
  and unit-attacked closeout frames, and a local-on-disk evidence pack captures
  why local SQLite supplements but does not replace runtime polling.
- An early-war stale-state tactical guard topic now captures ranged-first,
  wounded-melee preservation, naval postcondition, and influence-conservation
  norms for play agents.
- A watcher-latency observer-mode evidence pack now captures low-impact polling,
  slow-read thresholds, restart recovery, and future timing instrumentation
  candidates without overclaiming focus causality. It now also records the
  App UI first / Tuner canary restart discipline and the candidate
  `game watch --jsonl --human-aware` product shape.
- A first-meet diplomacy topic now captures `NOTIFICATION_PLAYER_MET` as a real
  greeting operation, including the conservative neutral-greeting norm and the
  new `game play respond-first-meet` shortcut. The notification HUD now carries
  live first-meet details and a neutral recommended command when
  `notification.Player` exposes the met-player id.
- A local catalog enrichment topic now captures why readable on-disk SQLite is
  static support evidence rather than current live-turn authority, plus the
  candidate local-data and local-catalog shortcuts that can reduce UI polling
  without bypassing validators.
- The informational-notification rules now include active/inactive volcano and
  river-flood report notices alongside volcano eruptions, unit attacks, district
  attacks, district attacks, wonder reports, and grievance-against-you reports.
- A production placement topic now captures the ordinary production `BUILD`
  item-kind split, the official placement-mode `X`/`Y` commit path, and the
  turn-78 Ancient Walls proof.
- A progression tree target topic now captures the current-node vs target-node
  operation split and the row-index-vs-node-hash failure mode.
- A celebration-choice topic and `game play choose-celebration` shortcut now
  capture the turn-98 `NOTIFICATION_CHOOSE_GOLDEN_AGE` blocker. Official UI
  evidence shows the chooser sends `player-operation CHOOSE_GOLDEN_AGE`
  with `{ GoldenAgeType: Database.makeHash(goldenAgeType) }`; the live culture
  and wonder choices both validated, with culture recommended for the current
  expansion/defense plan.
- A runtime-state-sources topic now captures why local SQLite should enrich
  play support while direct-control remains the live blocker and validator
  authority, including the materialized-HUD source split.
- A skill-asset assembly now groups the support topics and CLI shortcuts into
  candidate skill families, proof classes, promotion gates, and open shortcut
  candidates.
- A ready-city topic and read-only shortcut now materialize city blockers into
  live city state, production candidate args, constructible placement plots,
  town focus options, and population placement evidence without sending.
- A population-placement topic and `game play expand-city` shortcut now capture
  the proven `NEW_POPULATION` expansion branch alongside `assign-worker`.
  `ready-city` also now resolves targetless population blockers by mirroring the
  official city scan fallback.
- A current-online-context evidence pack now captures Test of Time / Update
  1.4.0 as advisory patch context and warns future agents not to promote older
  launch-era guides above live tooltips, local official rows, or validators.
- A restart-rehydration shortcut and topic now capture the restart/reconnect
  guard: `game play rehydrate` composes live notifications with ready-unit state
  and optional expected turn/date/unit checks, so agents discard stale
  pre-restart assumptions before sending.
- A multi-turn strategy and AI-levers topic now captures the architecture split
  between external strategy runner, static AI/resource mods, native autoplay,
  and possible telemetry-only JS bridge. It folds in play-style heuristics,
  official AI schema/resource levers, and RHQ's Workshop/changelog claims as a
  baseline for static AI manipulation over autoplay.
- A strategic-planning snapshot topic now defines the read-only 5-10 turn
  planning contract: compose live blocker/ready views with settlement posture,
  met-civ comparison, and victory/legacy context, then expire the plan after
  turn advance, restart, human input, mutation, or long-latency reads.
- An RHQ AI MOD baseline topic now separates static AI/resource tuning from the
  direct-control strategy runner. RHQ's public changelog maps to official AI
  tables and behavior-tree surfaces, but actual RHQ mod files still need
  source-level comparison before we treat any specific SQL/XML change as
  verified implementation.
- A unit-command topic and two thin CLI wrappers now capture live-exercised
  `RESETTLE` and `UPGRADE` shapes. `resettle-unit` sends
  `unit-command UNITCOMMAND_RESETTLE { X, Y }`; `upgrade-unit` sends
  `unit-command UNITCOMMAND_UPGRADE {}`. The wrappers prevent family/args
  mistakes, but richer postcondition polling remains open.
- Turn 102-104 added two expansion/support improvements. Storm-arrival,
  storm-moved, and storm-dissipated reports now follow the same reviewed
  natural-disaster closeout path as flood and volcano reports. `game play
  settlement-recommendations` wraps the official settlement lens API as a
  read-only expansion planning shortcut, so agents can compare candidate sites
  before moving Settlers through the unit validator path.
- The unit-target topic now records why `MOVE_TO` plus `no-state-change` is
  unresolved rather than successful: adjacent enemy plots may require the
  official war-confirmation callback path, and naval moves may need queued
  destination/path probes beyond the current unit/target summaries.
- The RHQ AI MOD baseline now records public status caveats observed on June 1,
  2026: the Steam page still exposes author claims/changelogs but also showed
  removal/incompatibility warnings, so RHQ should be treated as an experimental
  comparator measured by bounded autoplay telemetry, not as canonical current
  behavior.
- Commander promotion readiness now has a read-only support path:
  `ready-unit` reports the unit `Experience` slice, and
  `game play promotion-readiness` extracts it directly. The live Turtanu proof
  showed `PROMOTE` can be visible while stored promotion points and
  commendations are both zero, so the norm is to treat PROMOTE as UI-open proof
  until `availablePromotions` carries validator-backed args.
- Passive observer mode now has a first CLI surface: `game watch` polls the
  read-only notification HUD, optionally composes the ready-unit and ready-city
  views, and emits or appends JSONL observations with duration and stale-risk
  labels for human-aware watching.
- RHQ follow-up research refined the AI experiment candidates: add loaded
  `GameInfo` AI-row inspection before static mod comparisons, then summarize
  bounded autoplay with settlement, naval, air, repair, war, assault, raid, and
  independent/city-state attack telemetry.
- The Steam Workshop RHQ link was re-checked as a source-status item. It still
  exposes current title/description/changelog/comment metadata, but also shows
  removal and Civ VII incompatibility warnings; the CivFanatics mirror is useful
  lineage but stale relative to Steam v3.x. Disposition: keep RHQ as an
  advisory comparator, add Workshop refresh/one-AI-mod verification as support
  norms, and require loaded-row or downloaded-file proof before attributing
  local behavior to RHQ.
- A categorical CLI index now exists as `game play topics`. It maps play
  families such as blockers, progression, cities, tactics, diplomacy,
  runtime-sources, restart-watch, strategy, and RHQ/static AI to their reference
  docs, relevant CLI shortcuts, load conditions, and proof boundaries without
  touching the live game runtime.
- The first static-AI comparison shortcut now exists as
  `game ai loaded-levers`. It samples bounded runtime `GameInfo` rows for AI
  operation definitions, allowed operations, operation teams, unit priorities,
  favored items, pseudo-yields, behavior-tree rows, and strategy rows. The
  command is intentionally read-only and records the proof boundary: loaded
  rows prove the current policy substrate, not actual native AI behavior.
- Live smoke on 2026-06-01 with
  `game ai loaded-levers --family rhq --limit-per-table 2 --json` succeeded
  against the current runtime. It found loaded totals for RHQ-relevant tables:
  11 `AiOperationDefs`, 12 `AllowedOperations`, 4
  `AIUnitPrioritizedActions`, 855 `AiFavoredItems`, 79 `PseudoYields`, 20
  `BehaviorTrees`, and 303 `TreeData` rows. Targeted `AiFavoredItems`
  spotlights found 7 `PSEUDOYIELD_NEW_CITY` rows and 0
  `PSEUDOYIELD_REPAIR_BONUS` rows in the current loaded policy substrate.
- Turn 112 exposed why passive watch needs optional ready-city composition:
  `NOTIFICATION_NEW_POPULATION` had no direct operation shortcut in the HUD,
  but `game play ready-city --json` resolved blocking town
  `{"owner":0,"id":262147,"type":1}` at `(20,20)`, proved
  `workablePlotIndexes:[]`, and showed legal `city-command EXPAND` candidate
  plots. Disposition: `game watch --include-ready-city` now appends a compact
  ready-city projection to watcher observations so population and production
  blockers can be triaged from the passive JSONL stream. A follow-up live smoke
  after the blocker enum returned to `0` showed the old notification id still
  visible while ready-city returned `cityId:null`; treat that as a stale
  closeout boundary, not an active expansion proof.
- The same turn-112 population branch gap drove ready-city enrichment:
  `populationPlacement.workablePlots` now materializes already-workable
  assignment candidates, and `populationPlacement.expansionCandidates` maps
  `EXPAND` result plots to map coordinates plus best-effort constructible
  labels. This removes the manual plot-index conversion step from watcher
  support notes while preserving the live validator as action authority.
- Two read-only background lanes rechecked the RHQ/static-AI frame and the
  playstyle-to-strategy frame. Both converged on the same split: use RHQ-style
  AI/resource changes as an autoplay/static-policy comparator, and use an
  external direct-control runner for adaptive player strategy. The most useful
  next materializations are strategic snapshots, target-candidate ranking, and
  formation/settler-siege snapshots.
- Turn 113 exposed the next strategy-materialization need: the active agent had
  to inspect opponent settlements and choose a first conquest target from
  distance, apparent strength, and approach. `game play target-candidates` now
  wraps that read-only pattern as a named shortcut. It ranks runtime target
  owners from a supplied formation origin and labels the result as planning
  support, not movement/combat authority. Live context at implementation time
  favored independent owner `9` near `(13,17)` as the first staging conquest,
  with Napoleon northwest as a later major-civ target.
- Turn 115 and the ongoing campaign frame exposed a broader tactical-lens gap:
  per-unit legal operations are too narrow for military planning and
  advancement. `game play battlefield-scan` now materializes a read-only radius
  scan around a front, formation, city, or destination. It summarizes nearby
  units, cities, owner pressure, wounded friendly units, civilian risk, and
  city/front POIs. It is deliberately not pathfinding, strategy selection,
  movement, attack, or war authority; it should guide which ready-unit,
  target-candidate, path, or validator read comes next.
- Live smoke on turn 115 with
  `game play battlefield-scan --x 17 --y 20 --radius 8 --json` succeeded. It
  found the friendly formation around `(17,20)`, the independent city front at
  `(13,17)`, a civilian-risk POI for the friendly Settler near `(17,14)`, and
  owner-pressure from nearby independent units around `(12,20)`.
- The same turn exposed `NOTIFICATION_ASSIGN_NEW_RESOURCES` as the current
  blocker. Official UI handler evidence shows it opens
  `screen-resource-allocation`, so the HUD now classifies it as
  `resource-assignment` instead of an unknown generic blocker. No
  validator-backed resource assignment shortcut is proven yet.
- The follow-on tactical-lens slice adds `game play destination-analysis`, a
  read-only endpoint and corridor-pressure lens. It takes an intended
  destination, optionally takes an origin, samples a straight-line grid
  corridor, and reports destination pressure, corridor contact, sampled plot
  state, and POIs such as unsupported endpoints or civilian route risk. This is
  deliberately a cheap deterministic inspection lens: it helps the active agent
  decide what to inspect before moving, but it is not pathfinding, reachability
  proof, movement authority, or strategy selection.
- Live smoke on turn 116 with
  `game play destination-analysis --from-x 20 --from-y 14 --to-x 13 --to-y 17 --corridor-radius 2 --destination-radius 4 --json`
  succeeded. It found a high-pressure destination around the independent city
  at `(13,17)`, corridor contact along the Galley-to-city line, and
  civilian-route risk for the friendly Settler near `(17,14)`. This supports
  the lens as heads-up context before movement, not as proof that any specific
  unit can reach or safely occupy the endpoint.
- A later turn-116 read showed the ready unit had become the Settler at
  `(17,13)` with valid `MOVE_TO`, while scans still reported civilian exposure:
  non-friendly naval pressure at `(15,13)`, a scout near `(13,14)`, and the
  independent city/front at `(13,17)`. `settlement-recommendations --x 17 --y 13`
  returned distant official sites such as `(26,9)`, `(27,30)`, and `(23,38)`;
  `destination-analysis --from-x 17 --from-y 13 --to-x 20 --to-y 20` still
  reported civilian-route risk. This became `topics/civilian-route-triage.md`:
  a read-stack that separates good settlement sites, safe near-term movement,
  and fresh movement validation.
- A concurrent explorer check explained a watcher ambiguity from an earlier
  Ballista read: `readyUnit.legalOperationCount: 0` in `game watch` was only the
  no-target ready-unit candidate count, not proof that the Ballista had no plot
  move or attack. `game watch` now emits `legalOperationScope: "no-target"` and
  `legalNoTargetOperationCount` so agents know when to follow up with
  `game play unit-target` for target-arg operations.
- Three read-only sidecars converged on the next tactical-lens layer. The RHQ
  lane remains a static AI/resource-policy comparator; the local playstyle lane
  favors a supervised runner with validator-first mutations; and the tactical
  API lane recommends bounded read-only commands for priorities, actors,
  proximity scans, pressure maps, route analysis, civilian routes, and
  tactical-plan dry runs. Disposition: `topics/tactical-lens-api-roadmap.md`
  now records the command build order, current usable lenses, hidden-info
  boundary, and proof labels before this becomes implementation work.
- A turn-117 watcher read showed the first ready unit as Warrior
  `{"owner":0,"id":589830,"type":26}` at `(16,22)`, with zero no-target
  operations in `game watch` but a valid `MOVE_TO` from `game play unit-target`
  toward the independent city at `(13,17)`. Wider tactical reads changed the
  interpretation: `battlefield-scan` showed a strong friendly siege cluster,
  `target-candidates` kept owner `9` at `(13,17)` as the first city objective,
  and `destination-analysis` flagged high endpoint and corridor pressure. The
  active play thread was notified to stage/screen rather than overextend just
  because direct movement validated.
- Remaining gaps are promotion-send/hardening work: richer ready-entity reads,
  stronger live postcondition polling, civic choice proof, population-placement
  postconditions, visibility-filtered path/front analysis beyond the cheap
  destination lens, AI autoplay telemetry shortcuts, and eventual promotion
  into canonical docs/skills.

Deferred items:

- Prove whether any future civic surface differs from `game play
  choose-culture`.
- Prove ordinary non-town city-project production postconditions.
- Add a population-placement postcondition helper so sends report whether
  `Growth.isReadyToPlacePopulation` cleared and the city worker/plot state
  changed as expected.
- Add visibility/pathing and diplomacy context to target-candidate ranking so
  future siege plans can distinguish public knowledge, debug summaries, and
  unwanted multi-front war risk.
- Add terrain-aware destination/path analysis so `destination-analysis` can
  separate cheap corridor pressure, visible reachable movement, road/river
  constraints, and validator-backed unit-specific movement options.
- Specify the first strategy-runner dry run and the first fixed-seed AI
  resource-mod A/B experiment before implementing multi-turn automation.
- Promote stable topic docs into canonical docs and skill assets after review.

Next Packet:

- Inspect the active play thread first for the newest blocker/action type.
- Then inspect agent outputs for evidence packs.
- Then verify CLI shortcuts against tests before promoting any shortcut as
  normative skill guidance.

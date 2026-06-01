# Civ7 Live Play Skill Asset Assembly

Status: `active-draft`.

## Purpose

This packet assembles the live-play support artifacts that are ready to become
Codex skills, skill assets, or CLI play references. It is not itself the skill.
Its job is to preserve the frame, proof boundaries, topic map, and open gaps so
future promotion work can copy the stable parts without importing speculative
play advice.

## Frame

The support model is hybrid:

- Direct-control/runtime polling is the live authority for blockers, selected
  or ready entities, validators, operation sends, and postconditions. The HUD
  is a short-lived projection of those live reads, valid only with freshness
  and invalidation rules attached.
- Local official resources and SQLite copies are static authority for names,
  definitions, type ids, UI handler code, localization, and cross-reference
  joins.
- Online strategy context is advisory. It can inform the play recommendation,
  but it cannot override live state, official UI/resource evidence, or validator
  results.

The skill boundary should therefore be operational, not encyclopedic. A useful
skill tells an agent what to read, which proof label it has, which shortcut is
safe to try, and when to stop because the live inputs are missing.

## Loader Order

For future skill conversion, load source material in this order:

1. `topics/runtime-state-sources.md` for authority order and the SQLite/live
   runtime boundary.
2. `topics/local-catalog-enrichment.md` for static catalog enrichment and local
   shortcut boundaries.
3. `topics/restart-rehydration.md` when a restart, reconnect, or stale active
   thread state is possible.
4. `topics/notification-decision-hud.md` and `topics/end-turn-blockers.md` for
   the turn-blocker control loop.
5. The domain reference matching the blocker family: progression, production,
   diplomacy, unit targeting, or informational closeout.
6. Evidence packs only when the source reference needs provenance detail.
7. Strategy context last, and only as advisory decision support.

Do not import `workstream-record.md` into a reusable skill except as historical
context during authoring. It contains thread ids, branch state, and next-packet
workflow that are useful for handoff but misleading inside a general play skill.

## Proof Classes

| Class | Meaning | Promotion use |
| --- | --- | --- |
| Live-proved | Observed in the active game with before/after state or blocker movement. | Safe to encode as a norm when the same preconditions are present. |
| Official-UI-backed | Confirmed in official resource/UI code but not yet hit in live play. | Safe to document as an available operation family; keep validation and postcondition language explicit. |
| Static-enrichment | Confirmed in local SQLite/resource data, logs, or catalogs. | Use for names, costs, categories, and contextual joins; do not treat as current legality. |
| Advisory | Current online or community strategy context. | Use only as a tiebreaker after live legality and local game facts. |
| Open | Plausible but not yet captured with enough proof. | Keep out of deterministic skill guidance except as a warning or future work item. |

## Status Normalization

The project topics were written during active play, so their local status labels
are uneven. Skill promotion should normalize them into these categories:

- `promotable-reference`: stable enough to become skill reference material.
- `reference-with-gap`: useful reference material with one or more named proof
  gaps that must stay visible.
- `evidence-only`: provenance or observation material, not user-facing skill
  guidance.
- `advisory-only`: strategy context that can age or vary by patch.
- `do-not-promote-yet`: material whose operation shape or postcondition is not
  proven enough for deterministic guidance.

## Candidate Skill Families

### Turn Blocker Resolution

Source artifacts:

- `topics/notification-decision-hud.md`
- `topics/end-turn-blockers.md`
- `topics/informational-notification-closeout.md`

CLI shortcuts:

- `game play notifications`
- `game play topics`
- `game play end-turn`
- `game play dismiss-notification`
- `game play advisor-warning`

Norms:

- Always read the HUD before resolving a blocker.
- Prefer the specialized operation family over notification dismissal.
- Treat reviewed default-handler notices as dismissible only after the HUD and
  official handler evidence show no real decision surface remains.
- Treat grievance-against-you notifications as reviewed informational
  closeout, not as diplomacy responses. They carry notification context, not
  `{ ID, Type }` response args.
- Do not use force-end-turn as play-agent guidance.

Promotion readiness: ready for a skill asset, with a required warning that
diplomacy, narrative, production, population, progression, and unit blockers are
not generic dismissal candidates.

### Local Evidence Inventory

Source artifacts:

- `topics/runtime-state-sources.md`
- `topics/local-catalog-enrichment.md`
- `evidence-packs/local-on-disk-read-surfaces.md`

CLI shortcut:

- `game local-data inspect`

Norms:

- Use this command to inventory disk evidence and verify which SQLite, save, and
  log files exist.
- Treat its output as static catalog or forensic support.
- Do not use local database existence as proof that a live action is legal.

Promotion readiness: ready as a support asset for the live-play skill, paired
with the runtime HUD authority warning.

### Restart Rehydration

Source artifacts:

- `topics/restart-rehydration.md`
- `topics/runtime-state-sources.md`
- `topics/notification-decision-hud.md`

CLI shortcut:

- `game play rehydrate`

Norms:

- After restart, reconnect, or `undefined` runtime globals, treat the prior
  active-agent turn as an expectation to check, not as authority.
- Use `game play rehydrate --expected-turn <turn> --json` to materialize the
  live turn/date, blocker HUD, ready-unit view, and continuity warnings.
- If `snapshot.continuity.status == "mismatch"`, re-plan from the live snapshot
  before any send.
- SQLite/catalog data can enrich the snapshot later, but live direct-control
  remains authority for current blockers, ready entities, validators, and
  postconditions.

Promotion readiness: ready as a restart/reconnect guard asset for active-play
support.

### Progression And Choice Resolution

Source artifacts:

- `topics/progression-tree-targets.md`
- `topics/celebration-choice.md`
- `topics/notification-decision-hud.md`
- `topics/end-turn-blockers.md`

CLI shortcuts:

- `game play choose-tech`
- `game play set-tech-target`
- `game play choose-culture`
- `game play set-culture-target`
- `game play choose-celebration`
- `game play buy-attribute`
- `game play consider-attributes`
- `game play change-tradition`
- `game play consider-traditions`
- `game play choose-narrative`

Norms:

- Use runtime `ProgressionTreeNodeType` hashes, not row indexes or visible list
  positions.
- Distinguish current-node operations from full-tree target-node operations.
- Send target-node closeout only when the live UI path or postcondition requires
  it.
- Narrative `CLOSE` is an acknowledgement pattern only when the pending story
  has no links.
- `NOTIFICATION_CHOOSE_GOLDEN_AGE` is a celebration chooser, not a dismissal;
  choose from live `GoldenAgeType` hashes with `CHOOSE_GOLDEN_AGE`.

Promotion readiness: ready for culture target, traditions, attributes, and
narrative acknowledgement guidance. Celebration choice is official-UI-backed
with live validator proof but still needs a post-send blocker-cleared
postcondition. Tech target remains official-UI-backed until a live tech-target
blocker proves the postcondition path.

### City Production And Population

Source artifacts:

- `topics/production-build-placement.md`
- `topics/ready-city-decision-view.md`
- `topics/population-placement-expansion.md`
- `topics/runtime-state-sources.md`
- `topics/notification-decision-hud.md`

CLI shortcuts:

- `game play build-production`
- `game play build-unit`
- `game play ready-city`
- `game play set-town-focus`
- `game play consider-town-project`
- `game play assign-worker`
- `game play expand-city`

Norms:

- Ordinary production uses `BUILD`, but the args depend on item kind:
  `UnitType`, `ConstructibleType`, or `ProjectType`.
- Placement-sensitive constructibles need `X` and `Y` when the validator or
  placement UI returns legal plots.
- Town focus is not ordinary production; it uses `CHANGE_GROWTH_MODE`.
- `NEW_POPULATION` opens acquire-tile mode. Worker assignment uses
  `ASSIGN_WORKER { Location, Amount: 1 }` for already-workable plots; expansion
  purchase uses city-command `EXPAND { X, Y }` for expansion plots.
- Targetless `NEW_POPULATION` notifications should still start with
  `ready-city`; it mirrors the official handler by scanning owned cities for
  `Growth.isReadyToPlacePopulation`.
- `ready-city` exposes `populationPlacement.workablePlots` for the assignment
  branch and `populationPlacement.expansionCandidates` for the expansion branch;
  use those mapped coordinates and command hints before sending a population
  placement shortcut.
- Settlement recommendations are a separate read-only planning surface:
  `game play settlement-recommendations` wraps the official settlement lens API
  and should inform where to move Settlers, not replace live movement/founding
  validation.

Promotion readiness: ready for production item-kind and constructible placement
guidance. `ready-city` is ready as a read-only support asset, population
placement now has both proven branch shortcuts, and settlement recommendations
are ready as a read-only expansion-planning shortcut. Keep richer route safety
and founding-legality cataloging open.

### Tactical Unit Control

Source artifacts:

- `topics/battlefield-scan.md`
- `topics/ready-unit-commander-actions.md`
- `topics/unit-target-actions.md`
- `topics/early-war-tactical-stale-state-guard.md`
- `topics/unit-command-resettle-upgrade.md`
- `evidence-packs/watcher-latency-observer-mode.md`

CLI shortcuts:

- `game play ready-unit`
- `game play battlefield-scan`
- `game play promotion-readiness`
- `game play unit-target`
- `game play resettle-unit`
- `game play upgrade-unit`
- `game play operation`

Norms:

- Re-read before every tactical mutation when human input, latency, or combat
  animation may have changed the board.
- Use `game play battlefield-scan --x <front-x> --y <front-y> --json` as a
  background tactical lens before sequencing multiple unit moves. It summarizes
  local pressure and points of interest; it does not path, move, attack, or
  validate operations.
- Target plots, not target unit ids.
- Validator success is not proof of tactical effect; require a postcondition.
- `verification.status == "no-state-change"` means the action is unresolved,
  not successful; re-read before trying the same target again.
- Commanders are support and coordination units first. Do not treat them as
  default attackers without live evidence.
- Treat visible `PROMOTE` as a prompt to check `promotion-readiness`, not as
  proof that a spend is available. Buy only when stored promotion or
  commendation points are positive and an available promotion has
  validator-backed args.
- `RESETTLE` and `UPGRADE` are `unit-command` actions, not `unit-operation`
  actions. Use the named wrappers or `game play operation --family unit-command`.
- Unit-command sends still need board-state postconditions: resettle should
  change unit/settlement population state; upgrade should change unit tier/type
  and cost state.

Promotion readiness: ready as a tactical guard asset. The read-only
`game play promotion-readiness` shortcut is promotable; a future mutating
`game play promote-unit` wrapper still needs explicit send and postcondition
proof. A richer combat-dry-run or tactical-snapshot shortcut should be added
before this becomes a full combat skill.

### Diplomacy And First-Meet

Source artifacts:

- `topics/first-meet-diplomacy.md`
- `topics/notification-decision-hud.md`
- `topics/early-war-tactical-stale-state-guard.md`

CLI shortcuts:

- `game play respond-diplomacy`
- `game play respond-first-meet`

Norms:

- `NOTIFICATION_PLAYER_MET` is a first-meet operation, not a dismissal.
- Ordinary diplomacy uses `{ ID, Type }`; first-meet greetings use
  `{ Player1, Player2, Type }`.
- Prefer neutral first-meet greetings when payoff or Influence cost is unclear.
- Preserve Influence during war pressure unless the action payoff is proven.

Promotion readiness: ready for first-meet handling and conservative diplomacy
defaults. Richer diplomacy option reads and cost explanations remain useful
future assets.

### Runtime Source Authority

Source artifacts:

- `topics/runtime-state-sources.md`
- `topics/local-catalog-enrichment.md`
- `evidence-packs/local-on-disk-read-surfaces.md`
- `evidence-packs/agent-evidence-summary.md`

Norms:

- Poll the game runtime for live decisions because the obvious local SQLite
  copies are static/debug catalogs, not a proven live-state read model.
- Use SQLite for enrichment and lower-cost joins.
- Treat local catalog shortcuts as read-only support surfaces until freshness
  and live-state semantics are proven.
- Treat the HUD as the short-lived live decision materialization layer: runtime
  facts decide legality, local catalog facts make the decision readable.
- Treat saves as forensic snapshots until a stable parser and freshness
  contract exist.
- Treat logs as bounded observations, not proof that something did not happen.

Promotion readiness: ready as an authority preface for every live-play skill.

### Strategy Over Turns And AI Levers

Source artifacts:

- `topics/multi-turn-strategy-and-ai-levers.md`
- `topics/strategic-planning-snapshot.md`
- `topics/battlefield-scan.md`
- `topics/target-candidates.md`
- `topics/rhq-ai-mod-baseline.md`
- `topics/early-game-decision-context.md`
- `topics/early-war-tactical-stale-state-guard.md`
- `topics/runtime-state-sources.md`
- `topics/restart-rehydration.md`

CLI shortcuts:

- `game play topics`
- `game play rehydrate`
- `game play notifications`
- `game watch`
- `game play ready-unit`
- `game play promotion-readiness`
- `game play ready-city`
- `game play settlement-recommendations`
- `game play target-candidates`
- `game play battlefield-scan`
- `game ai loaded-levers`
- `game play unit-target`
- `game autoplay`

Norms:

- Put adaptive multi-turn strategy in an external runner over the live
  direct-control/HUD surface first.
- Use a 5-10 turn read-only strategy snapshot to decide what to inspect next,
  not to bypass blocker, ready-view, validator, or postcondition checks.
- Compare live posture against official legacy/victory thresholds and
  age-specific strategy hints, then choose objectives with reachable deltas
  inside the horizon.
- Compare to rival civs only through public/UI-equivalent or explicitly labeled
  debug signals; do not silently plan from hidden information.
- Treat native autoplay as a turn-runner and experiment clock, not a strategy
  policy engine.
- Use `game watch --jsonl --human-aware --artifact watcher.jsonl` for passive
  human/agent observation; it records HUD timing and stale-risk markers without
  sending operations and leaves a durable JSONL trace for later skill/reference
  extraction. Add `--include-ready-unit` for tactical queue context and
  `--include-ready-city` for production, town-focus, and population blockers.
- Use `game play topics --family <family>` as the categorical index before
  loading project references. It is a read-only shortcut map, not a live
  validator, so it should point agents to the right HUD/ready-view/static
  reference before they act.
- Treat official AI XML/SQL rows as load-time/static-mod levers until a safe
  live mutation contract is proven.
- Use `game ai loaded-levers --json` before RHQ/static-AI comparisons to sample
  the current runtime `GameInfo` policy substrate: operation definitions,
  allowed operations, AI favored items, unit priorities, pseudo-yields,
  behavior-tree rows, and strategy rows. This proves loaded rows, not native AI
  behavior.
- Use `game play target-candidates --x <front-x> --y <front-y> --json` before
  choosing a siege direction. It ranks opponent owners from the current
  formation origin; it does not declare war, path units, or prove tactical
  attack legality.
- Use `game play battlefield-scan --x <front-x> --y <front-y> --json` when the
  agent needs a wider tactical view of a front, city, stack, or destination.
  Treat its POIs as inspection priorities, not as strategy or movement orders.
- Use RHQ AI MOD as the baseline for static AI manipulation over autoplay, not
  as proof that local SQLite edits or in-game JS should own player-side
  strategy. RHQ's public changelog maps to official AI tables and behavior-tree
  surfaces, but the actual mod files still need source-level comparison. Its
  Steam Workshop page currently carries visible metadata plus removed and
  incompatibility warnings, so local support must verify Workshop delivery and
  loaded rows before attributing behavior to RHQ.
- Encode strategy heuristics as conditional objectives with falsifiers:
  defensive production under threat, ranged-first combat, wounded-unit
  preservation, safe expansion, and clean App UI/autoplay handoff.

Promotion readiness: reference-with-gap. Ready for strategy-runner design and
A/B experiment specs, but not yet ready as an autonomous multi-turn skill.
`strategic-planning-snapshot` is ready as a contract; the CLI shortcut should
wait for first-class victory/legacy and diplomacy relationship reads.

### Current Online Context

Source artifacts:

- `evidence-packs/current-online-play-context.md`
- `topics/early-game-decision-context.md`
- `topics/ready-unit-commander-actions.md`

Norms:

- Treat official current patch notes as the highest online context source, but
  still below live direct-control and local official resources for exact
  decisions.
- Treat older launch-era guides and community pages as advisory hypotheses.
- Keep current online context date-stamped because balance, yields, and UI
  affordances can change between patches.
- Use online context to decide what to inspect next, not to skip validators.

Promotion readiness: ready as an advisory-only asset that must be loaded after
runtime and local official resource references.

## Topic-To-Asset Map

| Topic | Candidate destination | Promotion state |
| --- | --- | --- |
| `topics/notification-decision-hud.md` | HUD/blocker skill reference | Ready |
| `topics/end-turn-blockers.md` | HUD/blocker skill reference | Ready |
| `topics/informational-notification-closeout.md` | HUD/blocker skill guardrail | Ready |
| `topics/progression-tree-targets.md` | Progression skill reference | Ready with tech-target proof note |
| `topics/celebration-choice.md` | Progression/celebration choice reference | Ready with postcondition gap |
| `topics/production-build-placement.md` | City production skill reference | Ready with city-project gap |
| `topics/ready-city-decision-view.md` | City blocker read surface | Ready |
| `topics/population-placement-expansion.md` | Population placement branch reference | Ready with postcondition/ranking gaps |
| `topics/settlement-recommendations.md` | Expansion planning reference | Ready as read-only planning surface |
| `topics/runtime-state-sources.md` | Authority preface asset | Ready |
| `topics/local-catalog-enrichment.md` | Static catalog enrichment asset | Ready |
| `topics/first-meet-diplomacy.md` | Diplomacy skill reference | Ready |
| `topics/ready-unit-commander-actions.md` | Tactical guard and promotion-readiness reference | Ready as guard, not full combat planner |
| `topics/battlefield-scan.md` | Tactical/strategic POI lens | Reference with pathing/visibility gaps |
| `topics/unit-target-actions.md` | Tactical operation reference | Ready with postcondition warning |
| `topics/unit-command-resettle-upgrade.md` | Unit command shape reference | Ready with postcondition gap |
| `topics/early-war-tactical-stale-state-guard.md` | Tactical guard and advisory asset | Ready as guard; strategy stays advisory |
| `topics/early-game-decision-context.md` | Strategy context asset | Advisory only |
| `topics/multi-turn-strategy-and-ai-levers.md` | Strategy-over-turns architecture reference | Reference with gap |
| `topics/strategic-planning-snapshot.md` | Short-horizon strategy snapshot contract | Reference with gap |
| `topics/target-candidates.md` | Siege target shortlist reference | Reference with visibility/pathing gaps |
| `topics/rhq-ai-mod-baseline.md` | Static AI/autoplay comparison baseline | Advisory reference |
| `evidence-packs/current-online-play-context.md` | Current online context asset | Advisory only |
| `evidence-packs/local-on-disk-read-surfaces.md` | Runtime-source authority evidence | Ready |
| `evidence-packs/watcher-latency-observer-mode.md` | Watcher operating-mode asset | Ready with initial `game watch` shortcut |
| `evidence-packs/agent-evidence-summary.md` | Proof ledger seed | Active draft |

## CLI Topic Index

`game play topics` is the first categorical shortcut for the skill assembly.
It gives active agents a compact map from decision family to references,
commands, load conditions, and authority boundaries:

- `blockers`: HUD, notification, informational closeout, and end-turn surfaces.
- `progression`: tech, culture, celebration, narrative, attributes, and
  traditions.
- `cities`: production, town focus, population placement, expansion, and
  settlement planning.
- `tactics`: battlefield scans, ready units, target actions, commanders,
  promotions, upgrades, and resettlement.
- `diplomacy`: first-meet and diplomatic action responses.
- `runtime-sources`: direct-control versus local SQLite/resource authority.
- `restart-watch`: rehydration, observer mode, latency, and passive JSONL
  watch.
- `strategy`: short-horizon objectives, autoplay boundaries, and external
  runner framing.
- `rhq-ai`: RHQ/static-AI comparator, loaded-row verification, and bounded
  autoplay telemetry.

The command deliberately does not read Civ7 or send operations. Its job is to
reduce lookup friction and prevent agents from loading the wrong reference
family under time pressure.

## Materialized HUD Asset Shape

A future skill asset should describe the HUD as a two-source read model:

- live layer: blocker, notification target, selected/ready entity, validator
  result, candidate args, and postcondition;
- static enrichment layer: names, costs, categories, UI text, source anchors,
  and mtime/version metadata from SQLite/resource catalogs;
- forensic/history layer: logs, saves, and Hall of Fame rows, used only to
  explain or audit past state.

The live layer expires after every mutation, visible human input, turn advance,
or long-latency read. The static enrichment layer can be cached. The
forensic/history layer must keep explicit read bounds and must not be treated as
current legality. This split is the reason agents should poll direct-control
for decisions while still using local SQLite/resource indexes to avoid noisy UI
exploration.

## Open Shortcut Candidates

These should stay out of deterministic skill guidance until the operation shape
and postcondition are proven:

- `game play tactical-snapshot`: compact read of ready unit, nearby enemies,
  threatened friendly units, valid target plots, and stale-risk markers.
- `game play combat-dry-run`: explain the official target resolver result and
  expected postcondition without sending.
- `game play diplomacy-options`: read available responses, cost, and likely
  relationship effects before choosing a response.
- `game play promote-unit`: send a specific promotion only with live
  `promotion-readiness.availablePromotions` args and postcondition proof.
- `game play upgrade-preview`: read upgrade target, cost, resource/territory
  failures, and projected combat delta before `game play upgrade-unit`.
- `game play resettle-candidates`: read owned-district target candidates and
  settlement/population consequences before `game play resettle-unit`.
- `game play strategic-snapshot`: compact objective/state read that includes
  live blockers, ready entities, visible threats, production/diplomacy context,
  met-civ comparison, victory/legacy progress, current objective ledger, and
  stale-risk markers.
- `game play formation-snapshot`: materialize Settler clusters, escort units,
  Ballistas, wounded units, and next safe advance/founding candidates so a
  slow-siege policy has concrete inputs instead of isolated ready-unit reads.
- `game victory`: read static and live victory/legacy path context, including
  thresholds, current progress when discoverable, next milestone deltas, and
  hidden-info labels.
- `game diplomacy`: read relationship, Influence, diplomatic action cost, and
  response affordability context once the live relationship APIs are proven.
- `game probe-latency`: focused latency sampler with connect/LSQ/CMD timing
  breakdowns beyond the coarse `game watch` duration marker.
- `game strategy run`: external workflow runner for validate-only and bounded
  send loops over multiple turns, using `game autoplay` only after clean
  App UI proof.
- `game ai autoplay-telemetry`: fixed-seed bounded autoplay summary for city
  count, settlement distance, ships, aircraft, repairs, war declarations, city
  attacks, and raids, with RHQ-style levers as the comparison vocabulary.

## Do-Not-Promote Boundaries

Keep these out of normative skill steps until stronger proof exists:

- Ordinary city-project production postconditions beyond the official item-kind
  args shape.
- Commander promotion spend operations. Readiness proof is available through
  `ready-unit` and `promotion-readiness`; mutation still needs a guarded
  `promote-unit` wrapper and postcondition evidence.
- Latency root-cause claims. Current evidence supports runtime-busy and
  stale-state risk, not a proven focus or OS-level cause.
- Thread ids, branch names, and active-workstream handoff instructions.

## Promotion Gate

Before converting a topic into a skill or stable asset, require:

1. A source artifact with explicit proof class labels.
2. A CLI shortcut or a clearly bounded manual fallback.
3. A validator rule and a postcondition rule for mutations.
4. A warning for any similar-looking blocker that must not use the same action.
5. A short verification command or evidence anchor.
6. Open questions separated from norms.

If any item is missing, keep the material as a project topic or evidence pack
instead of promoting it into a skill.

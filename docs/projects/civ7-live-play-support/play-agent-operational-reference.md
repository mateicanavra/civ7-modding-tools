# Play Agent Operational Reference

Status: `active-reference`.
Owner: active play agent.
Commit policy: keep this file. It is not scratch and should be committed by the
watcher with the live-play support work once reviewed.

## Mission Frame

Play the loaded Civ7 game through the end of Antiquity with an assertive,
score-seeking strategy. The objective is not just to keep turns moving. Each
decision should improve the empire's era outcome: settlement security,
production, science/culture tempo, military leverage, victory progress, and
survivability into the next age.

## Strategy

Maintain a two-track plan:

- Stabilize the core: protect settlers and towns, clear blockers, choose
  production that answers live pressure, and avoid losing high-value units.
- Convert pressure into score: expand when safe, keep research/civics pointed
  at current bottlenecks, exploit combat opportunities that validators prove,
  and favor actions that increase future optionality over passive holds.

Do not over-lock on conquest. Military action is justified when it removes a
live threat, opens settlement room, captures value, or prevents score loss. If
the board shifts toward economy, culture, diplomacy, or science payoff, pivot.

## Tactical Loop

1. Rehydrate after any restart, reconnect, stale assumption, human input, or
   long delay.
2. Read `game play priorities --compact --json` before branching into detailed
   lenses.
3. Resolve the current blocker first: city, unit, notification, tech/culture,
   diplomacy, narrative, tradition, attribute, or end-turn.
4. For unit actions, use `ready-unit`, `front-summary`, `battlefield-scan`,
   `formation-snapshot`, `destination-analysis`, `unit-move-preview`, and
   `unit-target` before mutation.
5. For city actions, use `ready-city`, production/focus/population commands,
   and settlement recommendation/civilian-route lenses before committing.
6. Send only validator-backed actions. Treat
   `verification.status:"no-state-change"` as unresolved, re-read, and do not
   repeat the same target unless fresh evidence proves the first send was only
   delayed.
7. After every mutation, re-read the HUD/ready entity before the next action.
8. When the HUD is clean, restart unbounded autoplay and poll for the next real
   blocker.

## State Authority

Live direct-control HUDs, ready-entity views, validators, and postconditions are
the authority for current decisions. Local SQLite, saves, logs, online strategy
notes, and prior thread summaries are enrichment only. They may explain a type,
cost, rule, or hypothesis; they do not authorize a mutation.

Preserve relationship precision. Unless a live diplomacy/war/team source proves
status, describe other-owner entities as `other-owner`, `other-owner pressure`,
or `relationship-unproven`; let validators prove attacks.

## Watcher Collaboration

Ask the watcher for high-leverage surfaces when friction repeats:

- compact victory/score/age progress dashboards;
- turn-plan summaries that rank blockers, risks, and payoff opportunities;
- safe bulk candidate lists for units, cities, notifications, and production;
- better postcondition/audit summaries for no-state-change cases;
- richer tactical lenses around settlers, siege lines, city fronts, and naval
  pressure.

Feature requests should name the observed blocker, the command that was missing
or too noisy, the decision it would improve, and the proof boundary required.
Do not ask the watcher to mutate the game or run live actions on behalf of the
play agent.

## Reframe Triggers

Reframe the operational plan if any of these becomes true:

- the current loaded game diverges from expected turn/date/entity;
- repeated validators block the current military or expansion plan;
- victory/score evidence points to a stronger non-military path;
- settlement happiness/cap pressure makes expansion harmful;
- a CLI shortcut proves stale, overbroad, or unsafe for current play.

# Play-Agent Operational Reference (Live Antiquity Playbook)

Status: active
Session owner: Codex play agent
Scope: one live Civ VII run, from current position through end of Antiquity
Commit policy: keep this file as durable session memory; do not delete it. Persist under Git once session ends (or when watcher does).

## 0) Core objective
Maintain a high-probability win-or-near-top Antiquity outcome by driving score/legacy/achievement pressure while preserving growth and survivability. Military domination is a valid lane but not the only one; policy, culture, science, and economy lanes are competitive if they unlock compounding advantage before turn pressure converges.

Use this objective:
- first as `safe` operations: clear blockers and remove tempo debt;
- then as `tempo conversion`: convert scouting and production freedom into stable expansion;
- then as `legacy scoring`: pursue high-confidence triumph paths and district/civic/science/culture compounding;
- then as `edge correction`: trade off risk if behind vs. double-down on a stronger lane if ahead.

## 1) Non-negotiable execution loop
At each decision window:

1. `civ7 game status --json`
2. `civ7 game play progress-dashboard --compact --json`
3. `civ7 game play priorities --compact --json`
4. Resolve only the first blocking lane, unless multiple non-conflicting independent actions are fully validated.
5. Execute via validator-backed operation (`--json --send`) with explicit `--reason`.
6. Require meaningful postcondition (`sent` + verified change). Treat `no-state-change` as a miss.
7. Re-run priorities and notifications before next action.

Do not add actions that depend on hidden or stale state. If a read fails, rehydrate and validate from a fresh `priorities`/`notifications` snapshot.

## 2) Blocking lane playbook
- `NOTIFICATION_CHOOSE_CULTURE_NODE` → `game play choose-culture --options --json`
- `NOTIFICATION_CHOOSE_TECH` → `game play choose-tech --options --json`
- `NOTIFICATION_CHOOSE_GOVERNMENT` → `game play choose-government --options --json`
- `NOTIFICATION_CHOOSE_GOLDEN_AGE` → `game play choose-celebration --options --json`
- `NOTIFICATION_DIPLOMATIC_ACTION`
  - If response options exist: use diplomacy response surface and send validated response.
  - If no actionable response: reviewed diplomatic closeout (`dismiss-notification` with reviewed reason).
- `NOTIFICATION_COMMAND_UNITS`
  - Prefer `ready-unit` + `unit-target`/`unit-operation` lanes.
  - If `unit-command-stale-expired` and no closeout candidates: end-turn fallback is allowed; otherwise use the specific candidate closeout.
- Reviewed info reports / reports in general → `dismiss-notification` with explicit reviewed reason.
- In all dismissal categories, use official closeout route(s) and verify queue/front-item movement when possible.

## 3) Movement/tactical discipline
- For ready unit decisions use `unit-move-preview --compact --json`.
- Treat any non-obvious move (combat, city approach, worker placement) as a two-step:
  1) `unit-target` / `unit-operation` validation from compact output
  2) send with `--reason` and post-read verification
- Use `unit-target` path summaries and movement reachability for candidate triage.
- Do not infer enemies from owner alone; only treat hostility through verified diplomatic relationship data where surfaced.

## 4) Score/legacy priorities (Antiquity-centric)
- Track every window using:
  - Age progress
  - Cultural, Military, Science, Economic progression
  - Legacy path progress and per-victory score deltas
- Prefer actions that convert immediate tempo to durable growth:
  - stable city production and growth,
  - expansion into safe revealed locations,
  - anti-vulnerability positioning,
  - one lane of legacy pressure supported by current blockers.
- If behind materially on all lanes, rebalance immediately: skip speculative aggression and secure recovery lanes first (civic/production/research + map control).

## 5) Risk controls
- Never perform blind autopilot turns without a blocker-free read window.
- Never trust one stale snapshot for irreversible civic/military commitments.
- If the same blocker remains for multiple windows without progression, send a watcher feature request rather than brute-forcing closeouts.
- Keep all evidence paths in compact outputs in the loop; avoid direct App UI assumptions.

## 6) Watcher escalation protocol
- If repeated friction appears in the same category 3+ turns (example: stale command-queue recovery, diplomacy report closeout, relationship classification gaps), request a dedicated support patch through the watcher thread.
- Prefer support changes that return compact option sets, evidence for why no closeout candidate exists, and deterministic commands with validation templates.

## 7) Current status to resume from
- Live direct-control socket is currently unavailable in this worktree (no active tuner on `127.0.0.1:4318`).
- Resume policy: wait for socket connectivity, then replay the loop above with `progress-dashboard` and `priorities` at top priority.

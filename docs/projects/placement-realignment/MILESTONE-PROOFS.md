# Placement Realignment — Milestone A + B Live-Proof Runbook

Status: **NOT RUN.** This document is the zero-context runbook for the two
live-game milestone boundaries the workstream deliberately left open (live
proof is expensive and milestone-scoped per the proof-class ladder in
`expectations.md`). Nothing in the workstream claims live proof until the
evidence files named below exist.

Prerequisites (user environment):

- Civ7 game install with the Tuner socket enabled (default `127.0.0.1:4318`).
- This repo at branch `placement-realignment` (S0–S8 complete) or its merge
  into `main`. Record branch + commit in every evidence file.
- `bun install` done; CLI invoked via root `bun run dev:cli -- <args>`
  (single binary `civ7`).

Evidence destination: `docs/projects/placement-realignment/evidence/`
(`milestone-a-<date>.md`, `milestone-b-<date>.md`). Every probe records:
branch, commit, deploy command/path, command line, timestamps, parsed
payload, and manual boundaries — per the workstream record's runtime-proof
rules.

## 0. Deploy (both milestones)

```sh
bun run --cwd mods/mod-swooper-maps deploy
```

(builds adapter/core/viz/sdk/cli deps, builds the mod, deploys `mod/` via
`civ7 mod manage deploy --id mod-swooper-maps`). Then start a new game on a
Swooper map (standard size, 8 players for the canonical frame) and note the
seed shown by the map script logs. Confirm the deployed mod commit matches
the repo commit before probing.

## Milestone A — resources vertical + identity (owed since S3)

### A1. Full-grid final-surface parity (NOT sampled probes)

```sh
bun run verify:final-surface-parity -- --proof-file <exact-authorship-proof.json> --output /tmp/parity-A.json
# or, when driven from a studio-server request:
bun run verify:final-surface-parity -- --request-id <id> --studio-url http://127.0.0.1:5174
```

- Rerun the full-grid comparison and classify EVERY delta (terrain / biome /
  feature / resource) — the repo's accepted proof class is full-grid with
  delta classification, not sampling (plan-review finding F3).
- **Corpus disposition:** the
  `openspec/changes/earthlike-live-feature-resource-legality-repair` change
  recorded a `106/6996` resource-mismatch corpus against the PRE-cutover
  pipeline. Re-derive the resource-mismatch set on the new pipeline and
  explicitly refresh that corpus (superseded rows marked superseded with the
  new counts, not orphaned). Record the disposition in the evidence file and
  in that change's ledger.

### A2. `civ7 game` resource probes (E2.2 / E2.4 live counts)

```sh
bun run dev:cli -- game map            # bounded grid: terrain,biome,resource per plot
bun run dev:cli -- game gameinfo Resources
```

- E2.4: count marine placements (FISH/PEARLS/CRABS/COWRIE/TURTLES/DYES) on
  water plots — must be > 0 on a map with coast.
- E2.2: per landmass-region, compare placed counts against the
  modifier-adjusted `MinimumPerHemisphere` rows in `CIV7_POLICY_TABLES_V1`;
  every unsatisfied minimum must correspond to a typed shortfall in the
  run's `resourcePlan` artifact (no silent deficit).

### A3. E4.4 mock-vs-live legality agreement + `canHaveResource`/`ignoreWeight`

- Sample ≥ a few hundred (plot, resource) pairs across lanes; compare live
  `ResourceBuilder.canHaveResource(plot, type, ignoreWeight)` (via
  `bun run dev:cli -- game exec`) against the mock policy emulation on the
  same surface. Gate: ≥ 95% agreement (E4.4); classify disagreements by
  rule (biome/terrain/feature/adjacency).
- Probe `ignoreWeight=true` vs `false` on identical plots to pin whether the
  weight gate is part of legality or only of the official generator's
  selection (the deterministic pipeline assumes legality-only).
- **SILVER (DEF-009):** count live-legal silver tiles on the standard map —
  if live legality admits more than the mock's 16, the E2.7 structural
  exception is a mock-emulation artifact; record which.

### A4. `isResourceRequiredForAge` live semantics

- The S2 table derives "required" statically from `Resource_RequiredLeaders`
  × `Resource_ValidAges`; the live engine additionally filters to leaders
  present in the running game. Probe
  `ResourceBuilder.isResourceRequiredForAge` for the 11 statically-required
  resources in a game WITH and WITHOUT one of the keying leaders; record
  the delta rule so the table's approximation boundary is pinned.

### A5. Player identity (D3) — alive-major id semantics

```sh
bun run dev:cli -- game exec "JSON.stringify(Players.getAliveMajorIds())"
```

- Pin: ordering, contiguity, humans-first grouping, and hemisphere/homeland
  special-casing (official `assign-starting-plots.js:218-243,903-928`).
- Compare against the run's `startAssignment.seats[].playerId` +
  `playerIdSource`; finalize the mapping in
  `domain/placement/ops/plan-starts/policy/seat-identity.ts` (the single
  mapping point) if live semantics diverge from the mock contiguous-ids
  model. This is E1.2's engine-id half.

### A6. Per-civ StartBias resolution

- Read live player→civilization rows (`game gameinfo` / `game exec` over
  `Players`), resolve per-civ StartBias rows from `CIV7_POLICY_TABLES_V1`
  `startBias*`, and wire them as the `seatBiases` op input (the offline hook
  ships neutral; live wiring is a data change, not a code-path change — S4
  decision log). Record one seeded run's per-seat bias contributions.

### A7. E4.1 studio↔live seat parity (first pass)

- Same seed/config in studio (browser runner) and live: seat count and seat
  plots must be identical. Any delta is classified (id mapping vs surface
  drift vs config mismatch).

## Milestone B — parity + planning-surface drift + viz QA (owed since S6/S7)

### B1. Reconstructed planning-surface drift window

- S6 reconstructs the wonder-planning biome surface from
  `ecology.biomeBindings` and features from `field:featureType`, proven
  equivalent on MOCK maintenance only. On live: capture the engine
  biome/feature surface immediately before placement planning (game exec
  grid read) and diff against the artifacts. Zero drift ⇒ the
  reconstruction holds live; any drift ⇒ scope DEF-004 (post-maintenance
  terrain artifact) to cover biome/feature too.

### B2. Live reconciliation of adjusted intents (E3 floor post-stamp)

- On the mock harness plan == placed (zero engine rejections). Live engine
  rejections of adjusted intents could drop a start below the E3.1 support
  floor post-stamp. From the live run's `resourcePlacementOutcomes`
  reconciliation: count rejections among support-adjusted intents
  (`byPhase.support`) and recompute per-start support on the live surface.
  Gate: floor + equity still hold, or the typed shortfall surface shows
  exactly where they don't (the hook for any live-only repair decision).

### B3. E4.1 full studio↔live parity + full-grid rerun

- Rerun A1's full-grid parity at the B boundary (S6/S7 changed planning
  inputs and viz, not stamps — expect no new deltas; prove it).

### B4. Interactive studio visual QA (the S7 pending half)

- Load a dump (or live run) in mapgen-studio and review the placement layer
  set in the browser: colors/legibility of the 29 layers, point sizing,
  overlay composites (9 suggested pairs), transparent None categories,
  stable score legends (unit domains), and the engine landMask
  default-visibility call (DEF-008: keep or demote to debug).

## Recording results

For each milestone create
`evidence/milestone-{a,b}-<date>.md` with: per-probe command, raw payload
(or path to JSON), classification tables, gate verdicts (E2.2, E2.4, E4.1,
E4.4, E1.2-engine, E3.1-live), and dispositions (106/6996 corpus, SILVER,
seat-identity mapping). Then update:

- `workstream/workstream-record.md` Proof Gates (flip "Live game: NOT RUN").
- `docs/system/DEFERRALS.md` DEF-004/008/009/010 if their triggers fired.
- The `seat-identity.ts` mapping + `seatBiases` wiring if A5/A6 require it
  (code changes go through a new OpenSpec change, not this runbook).

# Placement Vertical — Diagnosis

Status: accepted basis for the refactor plan. Evidence register with full
file:line citations and adversarial verdicts: `evidence/audit-register.md`
(7 lanes + gap critique, workflow `wf_f76302ce-424`, audited at `main` @ 90c47d45f).

## Verdicts on the reported impressions

| Impression | Verdict |
| --- | --- |
| Placement is "kind of screwed up" vs foundation/morphology | **Confirmed, with a precise shape** — step boundaries are fine; the divergence is monolithic stage, recipe-layer mega-algorithms, readback-fed planning, dead machinery, and an empty knob surface. |
| Player starts have "two different layers" | **Confirmed with nuance** — only the script-side planner places starts; the base-game engine positioner is wrapped but never called (dead layer), and the inert start-sector machinery + always-rendered sector grid + later engine `assignAdvancedStartRegions` pass make it *look* like two live systems. |
| Starts not tied to good terrain | **Refuted at scoring, confirmed at selection** — scoring uses fertility/moisture/temperature/rivers/lakes/coast/roughness; but candidates may be mountains/volcanoes/wonder tiles (no impassability screen), and a silent 3-level fallback (region-relax → openPool → desperation) abandons viability entirely. |
| Wrong/missing knobs | **Confirmed at three layers** — stage knobs schema is literally empty; resources expose only density/min-spacing/share-cap; **studio exposes zero placement controls at all** (placement absent from `defaultConfig.ts`, which drives the panel). |
| Resources poorly distributed | **Confirmed mechanistically** — planner is resource-identity-blind; materializer discards the plan's types and force-equalizes counts per type, erasing rarity; whole-map fallback scatters legality failures anywhere; spacing decays to 0. |
| Extra/broken/missing studio viz | **Confirmed** — "extra": the always-active sector grid visualizing inert machinery, the opaque `regionSlot` None wash, and a duplicate engine landmask; "broken/missing": 6 of 9 placement steps emit zero layers (blank canvas) even though per-plot data already exists in artifacts. |

## Root causes (structural)

1. **Three regime reversals in four months.** Engine-RNG delegation → deterministic
   plan+stamp (2026-02-14) → official-generator-primary (next day) → deterministic
   typed reconciliation (2026-05-30, normalization D3/D4). Each regime left
   telemetry, fallback and parity scaffolding behind; none of the decisions made
   it into ADR/DEFERRALS despite an explicit requirement to record them.
2. **Planning logic stranded at the recipe layer.** `place-resources/materialize.ts`
   (1134 lines), `assign-starts/materialize.ts` (612), `place-natural-wonders/
   materialize.ts` (688) embed the real algorithms; domain ops produce plans that
   the materializers then re-decide or discard. Foundation/morphology steps are
   thin op-callers. The op/strategy contract model exists and is bypassed.
3. **The intended resource model exists but is dormant.** `domain/resources` has
   per-family planners (terrestrial/aquatic/cultivated/geological), per-resource
   `expectedCountRange`, habitat lanes, an official corpus with Weight /
   MinimumPerHemisphere — wired only into tests. `stages/resources/` has artifacts
   and Earth-like expectations but no steps and is absent from the recipe. The
   live path is a generic scalar scorer + least-used-type round-robin.
4. **Policy grounding is broken in the middle.** Official files → submodule
   (stale: 2026-01-24) → `civ7-tables.gen.ts` (generator missing from repo,
   cannot regenerate) → placement. The tables omit exactly the data the target
   model needs (resource Weight, MinimumPerHemisphere, StartBias\*, DLC
   resources). Per-resource biome legality exists only as the live engine oracle
   `canHaveResource`, so the planner cannot plan within policy and the
   materializer fights it after the fact.
5. **Artifact-model bypasses.** Wonder planning reads terrain/biome/feature from
   live engine readback (contra its own contract doc); elevation comes from an
   undeclared shared buffer; `GameInfo.Resources` is read via `globalThis` in the
   recipe layer; zero artifact validators (only stage with none); plans
   double-published under two artifact identities with cross-step reach-ins.
6. **Identity/count integrity gaps at the engine boundary.** Positional slot index
   used as playerId (base game maps through `Players.getAliveMajorIds()`);
   player counts from mapInfo defaults; studio worker duplicates playerCount
   into both hemisphere slots → doubled seating in studio runs. Start biases
   (coast/river/biome per civ) dropped entirely.
7. **No feedback surfaces.** Start scoring viz is composite-only and emitted only
   on success (nothing to look at exactly when assignment fails); aggregate-only
   `startAssignment` artifact (target card's per-player StartRecord + fairness
   report unbuilt); resource `assignmentTrace` rich but unvisualized; no
   acceptance metrics exist anywhere, so "fixed" is currently unfalsifiable.

## Resolved ambiguities

- **Which CLI:** one binary, `civ7`. Sync: `civ7 data zip` / `unzip` (+ root
  `refresh:data`). Live inspection: `civ7 game map | gameinfo | inspect` over the
  tuner socket; `@civ7/direct-control` is the library underneath, not a second CLI.
- **Where policy lives:** `.civ7/outputs/resources` submodule (raw official),
  `packages/civ7-map-policy` (generated tables + catalogs — partially
  reproducible), live `GameInfo`/`ResourceBuilder` via adapter at runtime.
- **"Two layers" of starts:** dead engine wrapper + live script planner + inert
  sector machinery + separate advanced-start-regions engine pass; see verdict above.
- **Stage split:** the 9-step single-stage shape is the *accepted* D3 posture
  (split at product/effect contracts, maintenance transactional) — the refactor
  should realign internals to the op/artifact model, not blindly re-split the
  stage to mimic morphology.

## Known-but-unscheduled work this plan must absorb

- `PROJECT-resource-distribution-policy.md` (2026-06-05): accepted 5-step strategy
  (metrics first → spacing-preserving fallback → policy test harness → wire
  domain/resources lanes → lane-aware blue-noise selection). Steps 4–5 open.
- Start-placement system card target: per-start record, fairness report,
  never-throw selection. Unbuilt.
- Gameplay-domain absorption appendix vs the newer `domain/resources` — never
  reconciled; this plan must state the relationship explicitly.
- Active evidence-gated OpenSpec changes (`earthlike-live-feature-resource-
  legality-repair`, `earthlike-starts-discoveries-readback-proof`) own live-parity
  defect classes; the refactor must not silently subsume their claims.

## Empirical gaps to close early (cheap, high-leverage)

1. One instrumented browser-runner baseline (stable seed): resource clustering
   stats, marine-resource presence, start count (12 vs 6?), fallback-path
   frequency, per-type counts.
2. One live-game probe via `civ7 game`: engine behavior for `setStartPosition` on
   impassable plots; alive-major id contiguity; whether `canHaveResource`
   (ignoreWeight=false) reintroduces rarity gating.
3. Confirm semantics of `PlayersLandmass1/2` (per-hemisphere counts) against the
   base-game scripts and fix the studio duplication accordingly.

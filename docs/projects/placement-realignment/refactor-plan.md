# Placement Vertical — Refactor Plan

Basis: `diagnosis.md` (root causes RC1–RC7) + `expectations.md` (E1–E4).
Shape: 8 slices, one OpenSpec change + Graphite branch each, stacked on
`placement-realignment`. Each slice names its write set, the expectations it
must satisfy, and its proof class. Live-game proof happens at two milestone
boundaries (after S3 and after S6), not per slice.

## Target architecture (end state)

- **Stage shape:** keep the accepted D3 posture — one placement stage, product
  steps split at real product/effect contracts, maintenance transactional.
  We realign internals; we do not re-split the stage (authority: normalization
  packet D3/D4, implemented 2026-05-30).
- **Ownership:** all placement *decision* logic lives in domain ops
  (plan → select → reconcile); recipe materializers become thin stamp+verify
  shells like foundation/morphology. `domain/resources` is declared the owning
  domain for resource planning (resolving the unreconciled Gameplay-absorption
  question via ADR in S8).
- **Inputs:** placement plans from pipeline artifacts only (terrain/biome via
  ecology artifacts + biomeBindings; elevation via topography). Engine
  readbacks remain evidence-only diagnostics. Policy data (legality, weight,
  hemisphere minimums, start biases) comes from regenerated
  `@civ7/map-policy` tables so planning happens *within* policy instead of
  fighting the live oracle after the fact.
- **Knobs:** semantic knob layer per product (starts, resources) expressing the
  controls we actually want — density AND sparsity, rarity fidelity, type-aware
  spacing, resource↔resource affinity/exclusion, resource↔start support floor +
  equity, freshwater/coastal start preferences — with Earth-like defaults and
  declared min/max expansion. Public schemas derived from op schemas
  (foundation pattern), not hand-shadowed. Studio panel reads them
  schema-driven; the empty `PlacementKnobsSchema` and inert sector machinery go.
- **Feedback:** every product step publishes decision-substance artifacts
  (per-player StartRecord + fairnessReport; per-type resource traces) and viz
  layers (scores from plan-time, placed/rejected with reasons), so studio shows
  what happened and why — at parity with the live game.

## Slices

### S0 — Metrics harness + instrumented baseline (proof: stats)
Build the stats harness that computes E1/E2/E3 metrics from placement artifacts
over stable seeds (test-level + a `scripts/placement/` runner usable on browser
and live dumps). Record the current baseline (including suspected defects:
start doubling, marine-resource absence, fallback rates, per-type uniformity)
as `evidence/baseline-<date>.md`. Absorbs resource-distribution-policy step 1.
No behavior change. Everything later is measured against this.

### S1 — Correctness hotfixes (proof: stats vs S0 baseline)
Small, independently verifiable fixes: (a) impassability/wonder/volcano screen
for start candidates (E1.1); (b) studio worker hemisphere split — stop
duplicating playerCount into both `PlayersLandmass` slots (E1.2 studio half);
(c) loud fallback surfacing (artifact field + warn-level trace when
openPool/desperation fires); (d) spacing-preserving resource fallback — the
materializer's legality rescue must respect authored spacing instead of
decaying to 0 (RDP step 2, owed "immediately" by that accepted strategy);
(e) delete dead code (`chooseLeastUsedLegalResource`, unused constants).
No re-architecture yet.

### S2 — Policy table chain repair (proof: generated-output + tests)
Restore the lost generator as `scripts/civ7-map-policy/generate-tables.ts`:
first reproduce the existing 11 tables byte-stable (per-resource validity rows
and `resourcePlacementFlags` already exist and already drive mock-adapter
`canHaveResource` emulation — the gap is the generator, not those rows), then
extend with: Weight, MinimumPerHemisphere + `MapResourceMinimumAmountModifier`,
isResourceRequiredForAge, StartBias\* tables, hemisphere/landmass globals, DLC
resource sources. **D6:** one generator pass emits both the policy package
tables and the studio subset; retire `generate-civ7-browser-tables.ts` and the
divergent `apps/mapgen-studio/src/civ7-data` twin (same export name today);
keep `verify:placement-catalogs` as guard. Verify/extend the existing mock
emulation against the new rows (E4.4). Byte-stable regeneration committed +
verify script.
**User dependency:** refreshing the submodule snapshot (2026-01-24) needs the
game install (`bun run refresh:data`) — plan proceeds against the current
snapshot; refresh is a flagged follow-up.

### S3 — Resources vertical cutover (proof: stats; **live milestone A after this**)
**Entry gate (D2):** record the ownership ADR in this slice's OpenSpec change —
`domain/resources` owns resource planning; the Gameplay-absorption appendix is
updated to point at it — BEFORE wiring (review finding: deciding in code and
recording in S8 would repeat the exact RC1 pattern this plan diagnoses).

The dormant family planners are **demand/eligibility planners** (per-type
target counts + lane eligibility), not site planners. The cutover is therefore
a pipeline, not a swap:
1. Group/family planners (counts per type: weight-stratified per official
   deficit-rotation semantics E2.1, `expectedCountRange` E2.7, region minimums
   E2.2) — wired from the existing placement stage's plan steps (NOT a revived
   `stages/resources`; its orphan `artifacts.ts` is absorbed into the placement
   stage surface or deleted in this slice).
2. New habitat-mask derivation from ecology/hydrology artifacts (the ~15
   optional lane-mask inputs nothing currently derives), incl. a marine/aquatic
   lane so water resources place (E2.4).
3. **New site-selection op** emitting typed plot intents (D4 plan-authority
   shape): inhomogeneous-Poisson/blue-noise selection with type-aware spacing
   (E2.5, E2.6), per-landmass equity (E2.8), affinity/exclusion matrix (E3.4).
4. Materializer becomes thin: stamp intents, typed reconcile on engine
   legality, no type re-decision, no whole-map fallback (shortfalls recorded).
- Knob surface: density + sparsity + spacing + rarity fidelity + per-family
  overrides + affinity/exclusion.
- Absorbs resource-distribution-policy steps 2–5; RDP ledger updated there.
**Milestone A (live):** deploy; rerun the full-grid
`bun run verify:final-surface-parity` with delta classification (NOT sampled
probes only — the repo's accepted proof class); disposition the
`earthlike-live-feature-resource-legality-repair` 106/6996 resource-mismatch
corpus (superseded rows explicitly refreshed, not orphaned); `civ7 game`
probes for E2.2/E2.4 live counts, E4.4 mock-vs-live legality agreement,
canHaveResource/ignoreWeight semantics.

### S4 — Starts vertical realignment (proof: stats + studio dump)
Move selection out of `assign-starts/materialize.ts` into the plan-starts op as
an explicit selection strategy: tiered candidate pools, declared fallback
policy (never-throw; every degradation recorded per target system card),
spacing floors that respect official 6/12 buffers (E1.5; 12 is a score taper,
not a distance floor), fairness objective (E1.6). Add coastal/river
start-preference knobs; per-civ StartBias scoring from S2 tables where ids are
resolvable. Player identity: the **adapter exposes an alive-majors read
surface; the assign-starts op decides the slot→player mapping** and records it
in the start artifact (decision logic stays out of the adapter; probe from
Milestone A informs the mapping); counts from config, hemisphere split
explicit. Remove inert sector machinery (knobs, contract fields, viz) —
replaced by landmass-region slots that actually drive assignment (divergence
from official `chooseStartSectors` recorded in the D2/S8 ADR).
**Target-card checklist (each ◇ item in-scope here unless reassigned):**
`StartRecord.components{freshwater,fertility,expansion,climate,resource,
roughness}` retained per player; `imputedFlags` + input-coverage assertions
(never silently neutral-defaulted; assertions land here, not S6);
`status: "full"|"degraded"`; the four-rung fallback ladder
(regional → open-pool → quality-relaxed → spacing-relaxed), last resort still
scored; `fairnessReport` with worstPairGap; literal→knob conversions
(`fairnessTolerance`, `roughnessDivisor`, `tierBias`, `rankingBlend`).

### S5 — Resource↔start support pass (proof: stats)
Implements E3: per-start support floor within radius (E3.1), cross-player
equity (E3.2), as a bounded adjustment pass over the resource **plan** with
typed provenance (which placements were support-driven). **Ordering decision
(explicit, D3 contract change):** resource *planning* (S3 steps 1–3) stays
before starts, but resource *stamping* moves after the support pass — i.e.
plan-resources → assign-starts → support-adjust → place-resources(stamp).
The alternative (post-stamp mutation) would require an engine resource-removal
adapter capability that does not exist and its own typed outcome surface; it
is rejected. Knobs: support floor, radius, equity tolerance. This is where
"resources relate to player starts" becomes real instead of the current
one-directional scoring.

### S6 — Inputs/artifact hygiene (proof: tests; **live milestone B after S6+S7**)
Replace readback-as-planning-truth: wonder planning surface reconstructed from
ecology/morphology artifacts + biomeBindings; elevation from topography
artifact; resource catalog via adapter interface (no `globalThis.GameInfo` in
recipe layer). Single-publish each plan artifact; remove cross-step helper
imports and ordering-only artifact reads (tags carry ordering). Add artifact
validators (the only stage with none). Readbacks stay as explicitly-labeled
evidence artifacts. Resolve the heightfield-buffer undeclared edge.

### S7 — Viz + knob surface (proof: studio dump review)
Every product step emits decision-substance layers (E4.2–E4.3): per-component
start scores (from plan, emitted even when selection degrades), resource points
by type/phase + rejected-with-reason, wonder placed/rejected, discovery points,
policy legality masks. Fix presentation defects (regionSlot None wash, sectorId
legend, unstable score domains). Add placement overlay suggestions. Surface the
new knob schemas in studio config (schema-driven; at minimum kill the
hand-maintained drift for placement). Stretch (flagged, not required): registry
or check that emitted dataTypeKeys are declared, so coverage can't silently drift.

### S8 — Docs, ADRs, closure (proof: docs + clean Graphite state)
Refresh `PLACEMENT.md` (stale on 3 counts); ADR entries for: regime history +
deterministic-reconciliation posture, domain/resources ownership vs Gameplay
absorption, readback-evidence-only rule, knob taxonomy. DEFERRALS entries with
triggers for: submodule refresh, DLC coverage, independent-peoples interaction,
map-size knob scaling. Update system cards to as-built. Closure checklist per
workstream skill.

## Dependency graph

S0 → S1 → (S2 → S3 → S5), (S4 after S0/S1, StartBias part after S2),
S6 after S3/S4 (touches same files), S7 after S4/S5, S8 last.
Milestone A (live) after S3; Milestone B (live) after S6/S7 — includes E4.1
studio↔live parity check (peek `wt-agent-mapgen-physical-rivers` for the rivers
parity approach before designing the check).

## Explicit decision points (no silent branching)

- **D1 resolved (authority):** keep single-stage D3 posture; realign internals.
- **D2 (S3 entry gate, ADR recorded in S3's change):** `domain/resources` owns
  resource planning; absorption appendix updated in the same patch. If rejected
  on review → a `domain/gameplay` namespace must be created first (it does not
  exist today); slice content otherwise unchanged. S8 only confirms closure.
- **D3 (Milestone A gate):** playerId mapping design depends on live alive-major
  id semantics; S4 ships config-count seating either way, mapping finalized
  after probe.
- **D4 (user):** submodule refresh timing — needs game install; until then S2
  grounds against the 2026-01-24 snapshot and says so in generated headers.
- **D5 (scope):** independent peoples/minor placements, map-size scaling curves,
  and DLC resource balancing are explicitly OUT of this workstream (deferred
  with triggers in S8) — declared here so absence is a decision, not a gap.
- **D6 (S2):** single generator emits both policy-package tables and the studio
  subset; the old studio generator and `civ7-data` twin are retired (consumer
  gates named in the S2 change for every deleted surface).

## Risks

- The dormant `domain/resources` ops are demand/eligibility planners with
  `proofStatus: "warning-only"` and `runtimeIdStatus: "unverified"` — S3's new
  site-selection op and mask derivation are NEW work, sized accordingly; the
  planners' symbolic→runtime id resolution must be proven before stamping.
- Active evidence-gated OpenSpec changes overlap placement telemetry; slices
  must not weaken their proof artifacts (checked per slice at review).
- Mock-vs-live legality emulation (S2) can diverge; E4.4 bounds the risk and
  Milestone A measures it.

# Crust relief — handoff (locked direction + continuation)

> Companion to the normative frame [`REFERENCE.md`](./REFERENCE.md). This file holds the **locked
> direction**, the **compaction snippet**, and the **context-continuation snippet** for resuming
> mid-workstream after a context compaction.

## Locked direction (do not re-litigate)

Root cause is **content**, not resolution (REFERENCE §2.1, verified by the Juicy counterexample:
swooper-earthlike and latest-juicy share `cellsPerPlate = 13` and differ only in `plateActivity`, yet
both drown). The continental buoyancy field is a smooth, unimodal lump sitting at the waterline; the fix
is to make its **distribution bimodal**, emergent from crust history.

The physics-grounded bimodal solution is **two coupled mechanisms** (REFERENCE §10):

1. **Continental lithospheric thinning** — extensional/rift settings and passive (trailing) margins
   stretch and thin continental lithosphere (β-factor stretching). Thinning sets the broad **thermal +
   crustal-thickness envelope**: thinned crust loses thickness-buoyancy and, being poorly
   isostatically supported, subsides with thermal age → drowned corridors / basins / shelves (the
   **down** mode + fragmentation engine; real-Earth microcontinent-maker).
2. **Cratonic keel patchiness** — only the genuinely ancient, quiescent, boundary-distant interiors
   consolidate into buoyant keels, introducing **lateral heterogeneity in lithospheric strength and
   thermal structure** (discrete buoyant cores = the **up** mode).

**They are coupled, not independent.** A cell's fate (thinned vs keel) is set by its tectonic
trajectory over eras: extension thins; quiescence+age cratonizes. Adjacent cells with divergent
histories diverge in buoyancy → lateral contrast → bimodal hypsometry. Thinning sets the envelope; keel
patchiness breaks symmetry within it. Anchor every layer to this coupling.

Implementation locus: `domain/foundation/ops/compute-crust-evolution` (enrich thickness/maturity
evolution) + `lib/crust/buoyancy.ts` (physical coefficients only — never tuned to an output ratio).
`deriveBuoyancy` already maps thickness/maturity/thermalAge → buoyancy, so the change is mostly in how
thickness/maturity *evolve*. Resolution (REFERENCE §9) is a later enabler, NOT in the first slice —
~19 tiles/cell already yields 13–60-tile microcontinents once cells differentiate.

Acceptance: two-layer framework, REFERENCE §8 (Layer-1 per-map physical envelopes + Layer-2 relational
R1–R6). Judge by coast/ocean reality on ToT (swooper-earthlike HUGE/10), never by a tuned ratio.

State at handoff: worktree `wt-agent-crust-relief-frame`, branch `agent-crust-downstream-realign`
(stacked on `agent-shelf-physical-break`); design + correction committed (`0e00be4db`).

---

## Compaction snippet

```text
COMPACTION GUIDANCE (crust-relief bimodal workstream)

Keep:
- The bimodal physics direction: continental lithospheric thinning + cratonic keel
  patchiness, COUPLED (thinning sets the thermal/thickness envelope; keel patchiness
  adds lateral strength/thermal heterogeneity that breaks symmetry). Locked — do not
  re-litigate. Root cause is CONTENT (smooth unimodal buoyancy at the waterline), proven
  by the Juicy counterexample (earthlike==juicy cellsPerPlate=13; both drown).
- Any baselines/snapshots taken (pre-change R1–R6 + hypsometry/drowned numbers, dump dirs).
- The agent/skill inventory available in the repo (civ7-mapgen-workstream, investigation-
  design, graphite, doc-obsessive, Explore, etc.) and the harness/diag tooling
  (diag:dump, tools/{drowned,hypso,agecorr,ascii-map,render-png}.mjs, collectWorldBalanceStats,
  connectedComponentsLandOddQ, morphology.landmasses).
- Current iteration state + layer sequence + which Graphite slices have landed.
- Verification checkpoints reached (what was measured, on which config/seed, pass/fail vs R1–R6).
- The acceptance framework (REFERENCE §8) and the canonical docs (REFERENCE.md, HANDOFF.md).

Drop:
- Exploratory tangents superseded by the locked direction (the resolution-first detour;
  the earlier wrong success claims — conclusions are captured in REFERENCE §2.1/§6).
- Redundant intermediate outputs and dump-by-dump narration once a layer is measured + recorded.
- Scaffolding notes no longer needed after a layer completes.

Forward anchor:
- Next turn picks up MID-workstream: agent team is live, direction is locked, the goal is to
  drive every remaining slice through to FULL verification (R1–R6 on earthlike HUGE), honestly.
```

## Context-continuation snippet

```text
CONTEXT CONTINUATION (write-to-self, next turn)

You are mid-execution on the crust-relief bimodal mapgen workstream (mods/mod-swooper-maps,
worktree wt-agent-crust-relief-frame, branch stacked on agent-shelf-physical-break). Read
docs/projects/crust-relief/REFERENCE.md (esp. §2.1, §8, §10) and HANDOFF.md first.

The problem: continental crust generates a geologically flat, physically unconvincing buoyancy
field — a smooth unimodal lump at the waterline → vast flat shelves, no microcontinents, no
bimodal signature. Proven CONTENT (not resolution): the Juicy counterexample.

The locked solution is physically grounded and bimodal: (1) continental lithospheric thinning
coupled with (2) cratonic keel patchiness. Thinning sets the broad thermal + crustal-thickness
envelope (extension/passive margins thin → subside → drown → fragment); keel patchiness adds
lateral strength/thermal heterogeneity (ancient quiescent interiors consolidate → buoyant cores).
They INTERACT via per-cell tectonic history and together produce bimodal structure. This is THE
direction — do not re-litigate it. Implement in compute-crust-evolution (+ buoyancy.ts physical
coefficients), emergent from crust history, never tuned to an output ratio. Resolution is a later
enabler, not the lead.

You have full autonomy over: sequencing, baseline selection, snapshot strategy, iteration layering,
agent task allocation. Use the repo skill set (civ7-mapgen-workstream, investigation-design, graphite,
Explore, doc-obsessive). Equip agents with the relevant files. Anchor every decision to the physics.

Job this turn: drive the workstream end-to-end — design slices, implement with the agent team, and
carry all the way through verification (R1–R6 on swooper-earthlike HUGE, plus the harness dump and
renders). No check-ins; go all the way. Verify for real — never claim success without the measured
numbers. Vibe: rigorous, physics-first, complete — no half measures.

Anchor files: REFERENCE.md, HANDOFF.md; domain/foundation/ops/compute-crust-evolution,
lib/crust/buoyancy.ts, compute-era-tectonic-fields (rift/divergent per-era fields),
compute-base-topography (cosmetic-noise strip, later); harness in docs/projects/crust-relief/tools,
diag:dump, test/support/world-balance-stats.ts, test/pipeline/world-balance-stats.test.ts.
```

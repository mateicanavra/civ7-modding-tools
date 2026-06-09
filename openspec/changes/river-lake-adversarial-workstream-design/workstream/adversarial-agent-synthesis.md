# Adversarial Agent Synthesis

Date: 2026-06-09
Branch: `codex/mapgen-physical-rivers`
Commit under review: `77b200c7c`

## Skills And Process Artifacts Gathered First

- `create-goal` framed a new design-only objective after the previous goal was
  incorrectly closed.
- `civ7-systematic-workstream` supplied the 12-gate systematic method:
  diagnose before design, corpus/expectations before tuning, separate proof
  classes, bounded runtime proof, and clean closure.
- `civ7-open-spec-workstream` supplied the phase loop and OpenSpec artifact
  contract.
- `civ7-product-authority` supplied the rule that product behavior and proof
  claims must be explicitly scoped.
- `civ7-architecture-authority` supplied the truth/projection boundary and owner
  map: Hydrology truth, `map-*` projection/materialization, adapter/runtime at
  Civ boundary, generated outputs as evidence.
- `civ7-operational-debugging` supplied the in-game proof boundary: deploy,
  logs, readback, and visible behavior are separate observations.
- `framing-design`, `perspective`, `investigation-design`, `solution-design`,
  `testing-design`, and `team-design` shaped the adversarial roles and closure
  criteria.

Repository grounding:

- `bun run resources:init` and `bun run resources:status` left
  `.civ7/outputs/resources` clean at `fbc38ef8a041d469cad3800011074379ccd5a179`.
- Narsil was consulted as a supporting search rail, but it indexes the primary
  checkout, not this worktree. Direct worktree `rg` and file reads are the
  branch-authoritative evidence.
- The current branch is clean and ahead of `origin/main` by one commit.

## Agent Findings

### Agent 1: Prior-Work Prosecutor

- Product closure is not actually closed in the durable product-closure ledger,
  but `earthlike-visible-river-acceptance/tasks.md` looks too closed for a slice
  that still lacks visual product proof.
- The original failure was product-visible: users reported effectively no
  visible rivers while local tests could pass.
- The current proof is terrain-row materialization: six projected/live
  `TERRAIN_NAVIGABLE_RIVER` tiles with metadata still zero.
- The top-level parity status can be `complete` while river metadata is
  divergent. A proof-scope/status taxonomy is required.

### Agent 2: Runtime/In-Game Visibility Breaker

- Current tooling proves generation, deployed script identity, fresh logs, and
  full-grid terrain-row readback, but not rendered in-game visibility.
- A live session on the current branch had `terrainNavigableRiver=11` while
  `river=0`, `navigableRiver=0`, and `minorRiver=0`.
- Missing proof primitive: choose sampled live river tiles/chains, center the
  Civ camera on them, capture screenshots, hash them, and record an explicit
  visual verdict tied to the same request/session identity.

### Agent 3: Physical Hydrology Critic

- Civ-scale rivers need a hierarchy: hidden drainage network, planned minor
  stream intent, planned major river intent, and a smaller Civ-visible navigable
  trunk subset.
- Tiny fixtures are not enough. Generated-map hydrology metrics should include
  basin identity, upstream area, stream-order proxy, mouth type, slope class, and
  ephemeral/perennial proxy.
- Minor/headwater channels should dominate physical network length; navigable
  trunks should be a small coherent subset.
- Arid and endorheic systems must allow expected no-visible-river outcomes
  without turning them into failures.

### Agent 4: Architecture Prosecutor

- The high-level owner split is defensible: Hydrology truth, map-rivers
  projection, adapter/direct-control runtime readback, Studio display.
- Contract holes remain:
  - mock adapter still risks conflating navigable terrain with metadata;
  - generated catalog wording should say source evidence, not source of truth;
  - `EngineAdapter.modelRivers()` should be labeled engine-generator
    compatibility, not authored river truth;
  - `riverClass` value validation needs a stronger contract.

### Agent 5: DX/Studio Critic

- Studio needs a River Inspector, not only generic data layers.
- Users need a ladder that answers: any physical rivers, any major rivers, any
  selected navigable projection, any engine terrain readback, any mismatch, or
  only metadata missing.
- Normal Studio mode should expose planned minor, planned major, projected
  navigable, and engine terrain river layers. Metadata and mismatch layers can
  sit behind a debug toggle.
- Legacy `map-rivers.knobs.riverDensity` should migrate to
  `navigableRiverDensity` when safe and fail precisely on conflicts.

### Agent 6: Testing And Closure Auditor

- A test that passes while the user sees no useful rivers is not an acceptance
  test.
- Six live terrain tiles on `84x54` Earthlike is too weak for product closure.
  Start with adversarial thresholds such as at least 20 live
  `TERRAIN_NAVIGABLE_RIVER` tiles or at least two connected visible chains when
  planned major rivers exceed 100, and refine only with documented rationale.
- Product acceptance needs fixture tests, fast deterministic seeds, an Earthlike
  acceptance seed, holdout seeds, mountain config contrast, floodplain active
  seed, and arid/no-signal controls.
- Lake exact proof cannot close from `missing-exact-log`; exact logs need final
  lake counters.

## Rebuilt Full-Scope Plan

1. Define proof taxonomy first so no slice can close from the wrong evidence.
2. Harden physical hydrology truth with generated-map network metrics and
   adversarial seed matrices.
3. Repair navigable-river projection defaults and coherence so normal Earthlike
   maps produce player-obvious river trunks, while arid controls can validly
   produce few or none.
4. Add runtime visual proof tooling: exact-authored run, live readback,
   sampled coordinates, camera targeting, screenshot hashes, visual verdict.
5. Add Studio River/Lake Inspector and knob migration so users can understand
   absence, rejection, metadata divergence, and tuning targets.
6. Harden architecture contracts around catalog evidence, mock/live divergence,
   river-class validation, and `modelRivers()` ownership.
7. Add lake exact counters, floodplain active-seed regression, and product
   closure gates.

## Execution Change Set

- `river-lake-proof-class-ledger`
- `hydrology-river-network-metrics`
- `map-rivers-navigable-coherence`
- `river-runtime-visible-proof`
- `studio-river-lake-inspector-dx`
- `river-catalog-adapter-contract-hardening`
- `lake-floodplain-product-proof-gates`

## Non-Negotiable Closure Boundary

The execution goal is not complete until same-run evidence proves:

- physical hydrology meets declared network metrics;
- selected navigable projection is coherent and dense enough for normal maps;
- Civ terrain readback matches projected navigable terrain;
- Civ metadata divergence is either repaired or explicitly scoped out;
- Studio displays the relevant river/lake/floodplain layers and status ladder;
- Civ screenshots centered on sampled live river tiles show visible rivers;
- lake and floodplain acceptance rows have exact counters and active seeds;
- product acceptance rows and peer review disposition agree with the proof
  labels.

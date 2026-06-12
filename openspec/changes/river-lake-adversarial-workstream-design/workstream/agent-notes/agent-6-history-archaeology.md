# Agent 6 - Semantic Git and Spec Archaeology Prosecutor

Date: 2026-06-09
Worktree: `wt-agent-mapgen-physical-rivers`
Branch: `codex/river-lake-adversarial-synthesis`
Role: Semantic git and spec archaeology prosecutor

## 1. Framed objective

### Frame

This is not a "what did rivers do over time?" tour. It is a prosecution of
stale authority. The problem is that old topology, old OpenSpec slices, and old
partial proofs are still exerting design force after later authority rejected
them.

### Active goal

Identify which prior river/lake decisions are still authoritative, which ones
have been superseded or rejected, where present code/docs still contradict that
authority, and what must be reaffirmed, removed, or newly recorded so semantic
history stops pulling the recovery workstream off course.

### What is in

- Durable authority: current ADRs, canonical docs, active architecture packet,
  active execution redesign packet.
- Semantic lineage of river/lake ownership, projection, policy-package
  semantics, and proof claims.
- Branch/worktree topology when it changes what history or indexed search will
  appear authoritative.

### What is exterior

- Re-debugging current river algorithms from first principles.
- Re-litigating already accepted architecture boundaries as if they were open.
- Reviewing unrelated mapgen recovery slices.

### Hard core

- Later accepted authority beats earlier implementation and earlier design docs.
- Current code is evidence, not authority.
- Partial proof artifacts that overclaimed closure are liabilities, not
  precedent.

### Falsifier

This frame is wrong if the cited "stale" artifacts are actually the newest
accepted authority for their question, or if current implementation still
depends on one of the supposedly rejected contracts as a deliberate retained
product surface.

## 2. Investigation brief

### Type and posture

- Investigation type: doc-vs-code reconciliation plus semantic git archaeology.
- Frame stability: committed.
- Evidence standard: audit-grade for authority ordering and contradiction
  claims.
- Search geometry: graph-tracing through authoritative docs, then commit
  lineage, then present-code contradictions.
- Rail coupling: rail-neutral manual investigation over repo history.
- Artifact durability: durable workstream note.
- Uncertainty posture: adjudication with explicit stale-vs-authoritative
  classification.

### Primary questions

1. What is the current accepted authority for river/lake ownership and proof
   boundaries?
2. Which earlier slices or docs encoded a different model?
3. Which of those older ideas were later rejected versus merely left incomplete?
4. What contradictions still exist in present docs, OpenSpec, or branch
   topology?
5. What must be updated so future agents stop inheriting the wrong frame?

### Exclusion questions

- Not: "which river algorithm is best?"
- Not: "can terrain readback alone prove visible rivers?"
- Not: "should we preserve an old config shape because it once existed?"

### Evidence policy

Authority order used for this note:

1. Current user instructions in this thread.
2. Root and subtree `AGENTS.md`.
3. `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
4. `docs/system/mods/swooper-maps/adrs/adr-003-physics-truth-projection-boundary.md`.
5. `docs/system/ADR.md`, especially ADR-008.
6. Current evergreen domain references such as
   `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md`.
7. Active redesign/execution workstream packets under
   `openspec/changes/river-lake-adversarial-workstream-design/workstream/`.
8. Older OpenSpec slices, completion audits, and code/commit history as
   evidence only.

Stop condition: once the remaining disagreements were explainable as either
accepted authority, stale residue, or accidental topology.

## 3. Notes / evidence log

### A. Current authoritative stack

1. Root repo process and Graphite stack rules:
   - `AGENTS.md`
   - `docs/process/GRAPHITE.md`
2. Active architecture baseline:
   - `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
3. Long-lived truth/projection posture:
   - `docs/system/mods/swooper-maps/adrs/adr-003-physics-truth-projection-boundary.md`
4. Current routing owner decision:
   - `docs/system/ADR.md` -> ADR-008, dated 2026-06-09
5. Current domain reference:
   - `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md`
6. Current execution-control packet:
   - `openspec/changes/river-lake-adversarial-workstream-design/workstream/execution-redesign-plan.md`

### B. Branch/worktree topology is itself evidence

`git worktree list` on 2026-06-09:

- primary checkout:
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools`
  at `design/a11y-fixes`
- active river worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-mapgen-physical-rivers`
  at `codex/river-lake-adversarial-synthesis`

Implication:

- The primary checkout is not the river authority surface.
- Any tool indexed only against the primary checkout can surface stale topology
  for this workstream.

`gt log --no-interactive` on the river worktree shows the actual active stack:

- `d4099b573` `codex/river-lake-adversarial-synthesis`
- `c9f7354be` `codex/map-rivers-navigable-coherence`
- `18204a2da` `codex/river-lake-earth-benchmark-goal`
- `3997fa877` `codex/hydrology-river-network-metrics`
- `e43073b60` `codex/river-lake-recovery-redesign-goal`
- `57f934926` `codex/river-trunk-coherence`
- `4faa4e9df` `codex/map-rivers-hydrology-selector`
- `1acf39ace` `codex/river-recovery-execution-plan`
- `5f1ecea82` `codex/river-effect-tag-contract`
- `6fd550d4e` `codex/river-mock-metadata-adjacency`
- `3d9c96f2f` `codex/mapgen-river-visible-proof-sampler`
- `075a305b0` `codex/mapgen-upstream-drainage-routing`
- `3a05332ec` `codex/mapgen-river-proof-claims`
- `57a2e7659` `codex/mapgen-river-contract-hardening`
- `be8082aae` `codex/mapgen-river-recovery-workstreams`
- `58d0974dd` `codex/mapgen-physical-rivers`

Interpretation:

- Current authority is encoded in the active river stack, not the main checkout.
- Any reading of "what the repo says now" that ignores the worktree stack shape
  is methodologically unsound.

### C. River ownership history changed materially, and recently

1. Early projection-authoring authority still preserved a legacy public river
   threshold model:
   - `64a32130e` `feat(mapgen): align projection authoring surface`
   - `openspec/changes/projection-authoring-surface-alignment/design.md`
   - This explicitly kept `map-rivers.riverProjection` and described
     `TerrainBuilder.modelRivers(...)` as retained projection behavior.

2. Recovery work later created a wrong-owner selector file:
   - `d7ceb780` `fix(mapgen): consolidate Swooper stack recovery`
   - created
     `mods/mod-swooper-maps/src/recipes/standard/projection-policies/navigableRiverMaterialization.ts`

3. Metadata-proof hardening patched that file but did not yet delete the wrong
   owner:
   - `58d0974dd` `fix(mapgen): add river metadata readback guardrails`

4. Upstream routing repair then deleted the wrong-owner selector path:
   - `075a305b0` `feat(mapgen): add upstream drainage routing`
   - deleted the same file again while explicitly rejecting downstream fallback
     corridors

5. Selector ownership was then rehomed to Hydrology-owned op semantics:
   - `4faa4e9df` `feat(mapgen): move navigable river selection into hydrology`
   - added
     `mods/mod-swooper-maps/src/domain/hydrology/ops/select-navigable-river-terrain/**`
   - removed the wrong-owner map-rivers length-threshold selector

Interpretation:

- `projection-policies/navigableRiverMaterialization.ts` was not a long-lived
  design center. It was a temporary wrong-owner detour, later explicitly
  reversed.
- Any argument that this area is a valid owner because "it existed in code" is
  rebutted by the deletion lineage itself.

### D. Routing ownership also changed materially

1. Earlier accepted ADR:
   - `docs/system/ADR.md` ADR-006 on 2026-02-03
   - includes `morphology-routing` described as "flow routing truth"
2. Later accepted ADR:
   - `075a305b0` adds ADR-008 on 2026-06-09
   - ADR-008 explicitly says Hydrology owns canonical drainage routing and
     Morphology routing is a geomorphic proxy only

Present evergreen state:

- `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md` matches ADR-008.
- `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md` is mostly updated
  and now calls `artifact:morphology.routing` a geomorphic proxy, but it still
  contains stage wording like "Derives and publishes flow routing buffers from
  current topography," which is accurate but easy to misread if ADR-008 is not
  read with it.

Interpretation:

- Morphology-as-canonical-routing is superseded authority.
- The repo still carries enough older phrasing that an agent can drift backward
  unless ADR-008 is treated as the decisive override.

### E. Truth/projection authority was decided before this river slice

Long-lived accepted authority:

- `docs/system/mods/swooper-maps/adrs/adr-003-physics-truth-projection-boundary.md`
  dated 2026-02-15

This already says:

- pipeline artifacts are truth for scoped surfaces
- engine integration is projection-only
- drift at contract boundaries is fail-hard

Interpretation:

- Later river work should have started from this posture.
- Any attempt to let Civ generator behavior define upstream river truth was
  already architecturally wrong before the current recovery.

### F. Policy package ownership is new and explicit

Relevant lineage:

- `4746ab98b` / `07a49061c` are cited in
  `openspec/changes/earthlike-visible-river-acceptance/workstream/history-evidence.md`
  as the creation/scaffold line for `@civ7/map-policy`
- `58d0974dd` adds
  `packages/civ7-map-policy/src/river-constants.ts` and
  `packages/civ7-map-policy/src/river-type-metadata.source.ts`

Current package authority:

- `packages/civ7-map-policy/AGENTS.md`
- `packages/civ7-map-policy/src/civ7-tables.gen.ts`
- `packages/civ7-map-policy/src/river-constants.ts`

Current shared semantics:

- `NO_RIVER = -1`
- `RIVER_MINOR = 0`
- `RIVER_NAVIGABLE = 1`

Interpretation:

- The policy-package fix is not a speculative relocation. It is consistent with
  the package's explicit owner contract: shared Civ facts and compliance data.
- Any lingering mock/runtime local river enum copy is stale drift.

### G. Proof inflation has a paper trail

1. `openspec/changes/earthlike-visible-river-acceptance/workstream/completion-audit.md`
   contains strong "proved" language for technical slices while also retaining
   "Not Claimed" rows for minor-river stamping, metadata parity, full-surface
   parity, and Graphite closure.
2. `3d9c96f2f` explicitly says the river visible-proof sampler is not automated
   camera proof and does not close fresh in-game proof.
3. The new execution redesign plan now explicitly rejects treating terrain
   readback as rendered visibility or product closure.

Interpretation:

- There is a durable stale artifact family whose filenames and tone sound like
  closure despite open product gaps.
- This is not just a chat mistake; some workstream artifacts themselves need
  reclassification or supersession markers.

## 4. Findings, gaps, risks, and attacks on stale assumptions

### Finding 1: The current authority is not ambiguous anymore

Accepted authority now converges on one model:

- Morphology owns terrain precursors.
- Hydrology owns canonical drainage truth.
- `map-rivers` owns visible projection only.
- `@civ7/map-policy` owns shared Civ constants only.
- proof classes remain separated.

Evidence:

- architecture packet
- ADR-003
- ADR-008
- Hydrology reference
- execution redesign plan

Attack on stale assumption:

- "We still need to figure out where this code belongs" is false. The owner map
  is already decided.

### Finding 2: `map-rivers.riverProjection.minLength/maxLength` is rejected history, not a contract to preserve

The public threshold model came from
`openspec/changes/projection-authoring-surface-alignment/design.md`, which was
an earlier projection-surface slice. Later authority explicitly rejects that
surface:

- `openspec/changes/river-lake-adversarial-workstream-design/workstream/execution-redesign-plan.md`
  lists `map-rivers.riverProjection.minLength/maxLength` under rejected
  contracts.
- `openspec/changes/map-rivers-navigable-coherence/design.md` says this change
  does not preserve or reintroduce authored `minLength/maxLength` controls.

Attack on stale assumption:

- "It used to be public, so we should preserve it" has no authority weight once
  a later accepted redesign rejects it.

### Finding 3: The invented `projection-policies` river owner was already disproven by history

The git lineage shows a create -> patch -> delete arc in less than one week.
That is rejected topology, not durable ownership.

Attack on stale assumption:

- A path existing in code is not evidence of rightful ownership when later
  commits explicitly remove it and rehome the behavior.

### Finding 4: Older Morphology wording can still misframe new work

ADR-006 and parts of the Morphology-stage vocabulary still make it easy to read
"routing" as hydrologic truth if the reader does not also read ADR-008.

Risk:

- New agents can still infer "compute flow routing belongs in Morphology"
  simply from historical naming gravity.

### Finding 5: Primary-worktree indexing is a real epistemic hazard here

Because the primary checkout is on `design/a11y-fixes`, any search/index tooling
that is not pointed at the active river worktree can surface stale code and
wrongly influence implementation or diagnosis.

Risk:

- Agents can misread primary-checkout topology as river authority and reopen
  already rejected directions.

### Finding 6: Some older workstream artifacts are closure-shaped but not closure-safe

The `earthlike-visible-river-acceptance` packet contains valuable evidence, but
its completion-style framing can still distort downstream work by implying a
stronger product state than actually existed.

Risk:

- Reviewers or future agents can cite completion-sounding artifacts as proof
  that visible rivers were already solved.

## 5. Recommended workstream / doc changes

### Reaffirm explicitly

1. Keep ADR-008 as the routing owner override and cite it directly from any
   river/lake execution packet that mentions Morphology routing.
2. Keep `@civ7/map-policy` as the only owner for shared river metadata values
   and generated Civ table parity.
3. Keep the proof-class ladder explicit in every remaining river/lake slice.

### Remove or supersede explicitly

1. Mark the old `map-rivers.riverProjection` threshold model as superseded
   wherever it still appears as normative current design.
2. Treat `projection-policies/navigableRiverMaterialization.ts` as rejected
   history in docs; do not let it survive as an unnamed precedent.
3. Reclassify or supersede closure-shaped artifacts under
   `earthlike-visible-river-acceptance` that can be read as product completion.

### Add explicitly

1. Add a short "history hazards / rejected assumptions" section to the active
   execution redesign packet covering:
   - Morphology-as-canonical-routing
   - `map-rivers.riverProjection.minLength/maxLength`
   - `projection-policies` as an owner
   - terrain-readback-as-visual-proof
2. Add a branch-topology caution note to the river/lake workstream saying the
   active authority lives in the dedicated river worktree/stack, while the
   primary checkout may be on unrelated work.
3. Add a doc cleanup task to make Morphology reference wording point more
   aggressively at ADR-008 when discussing routing.
4. Add a guardrail task or doc scan that flags normative use of:
   - `riverProjection.minLength`
   - `riverProjection.maxLength`
   - `projection-policies/navigableRiverMaterialization`
   in active source/docs outside archived history.

## 6. Final synthesis

The repo is not suffering from missing decisions; it is suffering from stale
force. The decisive boundaries already exist, but older projection-surface docs,
temporary recovery topology, Morphology naming gravity, completion-shaped proof
artifacts, and primary-worktree indexing can still drag agents back into
rejected frames.

The corrective move is not more debate about ownership. It is to strengthen the
active workstream packet as the explicit anti-stale authority, mark rejected
history as rejected, and clean the few remaining evergreen/doc residues that
still make old assumptions feel current.

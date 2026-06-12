# 2026-06-10 Agent 6 - Semantic History Prosecutor

Date: 2026-06-10
Worktree: `wt-agent-mapgen-physical-rivers`
Branch: `codex/map-rivers-bulk-writer-materialization`
Role: semantic git-history and prior-intent prosecutor

## 1. Framed scoped goal

### Frame identity

This is not a chronology exercise and not a river-tuning review. It is a
prosecution of semantic drift across code, docs, tests, and proof claims.

### Scoped goal

Recover what the river/lake system was supposed to do by reconstructing the
load-bearing prior intent around:

- Hydrology truth versus map-stage projection,
- Morphology versus Hydrology ownership,
- Civ runtime river semantics versus repo-local surrogates,
- and proof boundaries for terrain rows, metadata, and visible product outcome.

Then identify which parts of current work preserve legitimate prior intent and
which parts are drift, workaround, stale residue, or overclaim.

### Cynefin / object / lifecycle / durability

- Domain: complicated
- Object-path: problem frame
- Lifecycle: reframe of an already active recovery lane
- Mode: audience-export for future agents/workstream owners
- Durability: standalone durable note

### What is in

- Semantic git history for rivers, lakes, hydrology, morphology, adapter,
  policy, and projection guardrails.
- Canonical docs and later ADRs that supersede earlier intent.
- Abandoned or reversed designs that still exert force through tests, docs, or
  runtime assumptions.
- Current branch behavior where it changes the prosecution.

### What is out

- Re-deriving ideal Earth hydrology metrics from scratch.
- Tuning current river density or lakeiness values.
- Treating current implementation as authoritative simply because it is current.
- Treating a single proof surface as product closure.

### Hard core

1. Later accepted authority beats earlier implementation and earlier design
   notes.
2. Hydrology truth, projection/materialization, runtime metadata, and visible
   product outcome are distinct surfaces unless proved otherwise.
3. Mixed surfaces create fake passes and fake regressions; the workstream must
   classify them separately.
4. A fix that only improves the surrogate while leaving the owner problem
   unresolved is not closure.

### Structural alternative considered

Alternative frame: "river recovery is mainly a current implementation bug hunt."

Why rejected: the recurring failures are not isolated code defects. They recur
because the code, tests, and docs kept changing which layer was supposed to own
river truth, river materialization, and proof. Treating this as a bug hunt
would preserve the same authority confusion.

### Falsifier

This frame fails if the checked-out tree already has one coherent, accepted, and
fully evidenced contract in which:

- Hydrology truth, map-stage projection, Civ metadata, and product visibility
  are consistently separated;
- current tests and docs no longer encode stale owner assumptions;
- and the branch-local corrections from June 9-10 have already been fully
  absorbed into the durable authority surface.

## 2. Investigation brief

### Investigation type and posture

- Investigation type: semantic git archaeology plus doc-vs-code reconciliation
- Frame status: committed
- Evidence standard: audit-grade for contradiction and supersession claims
- Search geometry: graph-tracing through authority docs, then file/commit
  lineage, then present-tree contradiction scan
- Rail coupling: rail-neutral manual repo investigation
- Artifact durability: durable workstream note
- Uncertainty posture: adjudication

### Primary questions

1. What was the intended owner split for rivers and lakes across Morphology,
   Hydrology, map stages, adapter, and `@civ7/map-policy`?
2. When did river materialization move from engine-generator dependence toward
   repo-owned selection and stamping, and why?
3. Which parts of that move were legitimate normalization, and which parts were
   wrong-owner drift or premature closure?
4. How did minor/major river semantics drift between Civ runtime metadata and
   repo-local `riverClass` intent?
5. Which tests, mocks, and guardrails preserved stale assumptions after the
   higher-level frame had already changed?

### Secondary questions

1. Did lakes solve the same authority problem earlier and more cleanly?
2. Which earlier docs or slices remain dangerous because they look canonical but
   are actually superseded?
3. How does the current branch differ from the June 9 branch-local prosecution:
   categorical ban on `modelRivers(...)` versus bounded projection-internal use?

### Exclusion questions

- Not "what is the best river algorithm?"
- Not "are current river screenshots good enough?"
- Not "should we preserve legacy thresholds because users may have authored
  them?"
- Not "can one proof row stand in for all product acceptance?"

### Falsification questions

1. Does current code still prove that `modelRivers(...)` is categorically
   forbidden, or has the branch already retreated to a bounded compatibility
   use?
2. Do current mocks still equate navigable-river terrain stamping with full
   runtime river metadata?
3. Do current docs still misdescribe the public surface in Civ-generator terms
   after implementation moved to Hydrology-owned selection plus mixed
   projection/runtime behavior?

### Search geometry

- Start at current durable authority:
  - root/subtree `AGENTS.md`
  - architecture normalization packet
  - ADR-003
  - ADR-008
  - current `HYDROLOGY.md`
  - current execution redesign plan
- Trace semantic commits on:
  - `hydrology-hydrography/steps/rivers.ts`
  - `map-rivers/steps/plotRivers.ts`
  - `map-stamping.contract-guard.test.ts`
  - `civ7-adapter` types and mock/runtime implementations
  - `civ7-map-policy` river constants
- Then compare:
  - old commitments that were superseded,
  - branch-local archaeology that corrected false assumptions,
  - present-tree state that still mixes surfaces.

Stop rule: stop when every important disagreement can be classified as one of:

- current authority,
- superseded prior intent,
- useful but non-durable branch-local evidence,
- or active unresolved contradiction.

### Contradiction handling

When sources conflict, resolve in this order:

1. Later accepted ADR or canonical packet
2. Current evergreen reference docs
3. Active workstream execution-control docs
4. Present-tree code/tests as evidence of current behavior, not authority
5. Older OpenSpec and archived issue/spec material as prior intent only

If code contradicts higher authority, record that as implementation drift.
If tests contradict runtime evidence, record that as harness drift.
If active workstream docs contradict newer runtime proof, record that as stale
workstream language, not durable truth.

### Evidence policy

Authority order:

1. Current user instructions in this thread
2. Root and subtree `AGENTS.md`
3. `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
4. `docs/system/mods/swooper-maps/adrs/adr-003-physics-truth-projection-boundary.md`
5. `docs/system/ADR.md`, especially ADR-008
6. `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md`
7. Active workstream notes under
   `openspec/changes/river-lake-adversarial-workstream-design/workstream/`
8. Git history, current code, tests, and branch-local proof docs as evidence

Allowed claim strengths:

- `proved in current authority`
- `proved in current branch behavior`
- `supported by branch-local evidence`
- `superseded prior intent`
- `active unresolved contradiction`

What does not count as evidence:

- current output shape alone,
- a passing mock test alone,
- a proposal doc without later acceptance,
- a broad claim that an implementation is "normalized" without owner and proof
  boundary evidence.

## 3. Notes with findings, gaps, risks, regressions

### A. Legitimate prior intent that should be preserved

1. Truth versus projection split was real and early.
   `adr-003-physics-truth-projection-boundary.md` already established that
   engine integration is projection-only and drift at the boundary is fail-hard.

2. Lakes are the cleaner precedent.
   `1914cb44d` and the lake-normalization docs moved lakes to:
   Hydrology truth -> adapter projection/readback -> downstream truth
   consumption. That is legitimate prior intent and should remain the model.

3. Hydrology, not Morphology, owns canonical drainage routing.
   ADR-008 on 2026-06-09 resolves the older ambiguity. Morphology routing is a
   geomorphic proxy; Hydrology owns water-movement truth.

4. Minor/headwater versus major/navigable distinction is load-bearing.
   Older hydrology modeling docs and current hydrology references consistently
   expect separate surfaces for hidden/minor network and a smaller projectable
   major/navigable subset.

5. `@civ7/map-policy` is fact-only.
   The package is meant to own Civ facts, enums, and compliance tables, not
   river-selection logic.

### B. Superseded or abandoned intent that should stop exerting force

1. Morphology-as-canonical-routing is superseded.
   The M9 cutover issue explicitly depended on `artifact:morphology.routing`,
   but ADR-008 later reversed that. Any older argument that Hydrology should
   simply consume Morphology routing as truth is stale.

2. `map-rivers` as owner of selection semantics was a temporary wrong-owner
   detour.
   The existence and later removal of
   `projection-policies/navigableRiverMaterialization.ts` proves this.
   `4faa4e9df` explicitly calls the map-owned length-threshold selector
   wrong-owner and moves it into Hydrology.

3. "No stable writer exists for Civ river metadata" is stale.
   `58d0974dd` carried that claim as of early June 9 based on available proof.
   `60c96ee4c` and the disposable proof note on 2026-06-10 retract it:
   a stable bulk writer exists through the official `modelRivers(...)` sequence.

4. "No stage may call `modelRivers(...)`" is not durable intent.
   The current branch `78f70cfb7` reintroduces `adapter.modelRivers(...)` in
   `map-rivers/plotRivers.ts`, but constrains it to internal projection.

### C. Current branch state: what changed in the prosecution

The prosecution changed between the June 9 archaeology branches and the current
branch head:

1. The branch is no longer on pure direct-stamping doctrine.
   Current `map-rivers/plotRivers.ts`:
   - selects navigable trunks from Hydrology truth,
   - stamps `TERRAIN_NAVIGABLE_RIVER`,
   - then invokes `adapter.modelRivers(...)`,
   - then validates, names, recalculates areas, and stores water data.

2. The guardrail changed from categorical ban to local containment.
   Current `map-stamping.contract-guard.test.ts` no longer forbids all
   `modelRivers(...)` usage. It now requires any callsite to stay inside the
   dedicated `map-rivers` step.

3. The branch preserves a mixed projection contract.
   It still uses Hydrology-owned selection and explicit terrain stamping, but
   now also runs the proven bulk engine writer. That is better than the hard
   ban, but it is not yet a cleanly settled ownership story.

### D. Repeated regressions and drift patterns

1. Proof-surface collapse
   Repeated tendency: treat terrain rows, river metadata, freshwater gameplay,
   Studio layers, and rendered visibility as interchangeable. This created both
   false passes and false regressions.

2. Wrong-owner repair logic
   When upstream truth was weak, downstream projection layers kept trying to
   repair the problem locally rather than forcing a Hydrology fix.

3. Public-surface drift
   Projection knobs and docs retained Civ-generator framing after the
   implementation moved to repo-owned Hydrology selection and mixed projection
   behavior.

4. Harness drift
   Mocks and tests repeatedly made the current projection look more complete
   than runtime evidence justified.

5. Stale workstream claims
   Branch-local proof changed the factual state quickly, but docs and guardrails
   lagged. This allowed superseded assumptions to remain operational.

### E. Present gaps and active contradictions

1. Mixed contract in `map-rivers`
   Current code uses both direct terrain stamping and the bulk engine writer.
   The branch calls this "keep bulk river modeling internal to projection," but
   the durable workstream language still often talks as if the main question
   were direct navigable terrain parity only.

2. Mock still mirrors the bounded contract, not runtime complexity
   Current `MockAdapter.modelRivers(...)` mirrors already-stamped navigable
   terrain into metadata. That is more honest than inventing a fake river
   network, but it still does not exercise bulk-writer divergence or minor-river
   metadata behavior the real engine can produce.

3. Public-surface description drift
   Older projection authoring material still reads as if river projection were a
   Civ-model threshold surface. Current implementation is actually a Hydrology
   selection plus mixed projection/runtime compatibility flow.

4. Surrogate versus runtime semantics remains unresolved
   Hydrology `riverClass` is still a repo-local intent field. That is fine as
   truth, but downstream consumers must not quietly treat it as equivalent to
   Civ runtime river metadata.

### F. Specific regression chain

The most important regression chain is:

1. Discharge-driven Hydrology truth was introduced while engine realization
   still existed.
2. River recovery then over-rotated toward repo-owned projection parity and
   direct terrain stamping.
3. Branch-local archaeology correctly proved that terrain rows and Civ metadata
   are separate surfaces and later that a bulk runtime writer does exist.
4. The current branch partially absorbs that correction by putting
   `modelRivers(...)` back inside projection, but the overall workstream still
   lacks one crisp durable statement of the mixed contract and its risks.

### G. Risks

1. Future agents may re-open the wrong debate:
   "Should we ban `modelRivers(...)`?" instead of
   "What exact projection/runtime contract do we accept, and what proof classes
   must it satisfy?"

2. Workstream docs may still over-credit navigable terrain parity as if it were
   product closure.

3. Downstream systems may continue to treat `riverClass` as a runtime-equivalent
   river fact rather than a Hydrology truth surface.

4. The mixed current contract can silently drift back toward either:
   - opaque engine delegation, or
   - repo-local surrogate closure,
   unless the workstream explicitly constrains both directions.

## 4. Workstream proposal

### Proposal name

`river-runtime-contract-clarification-and-proof-splitting`

### Objective

Preserve the legitimate normalization intent:

- Hydrology owns canonical drainage truth.
- Map stages own projection/materialization.
- Policy package owns pure Civ facts.

But remove the bad drift:

- proof-surface collapse,
- stale categorical claims about writer availability,
- wrong-owner projection doctrine,
- and public/test language that hides the mixed current contract.

### Preserve

1. Hydrology-owned trunk selection and upstream routing truth.
2. Lake-style truth/projection separation as the preferred architecture.
3. `@civ7/map-policy` as fact-only.
4. Explicit proof-class separation.
5. The prohibition on burying authored product config inside engine-generator
   knobs.

### Remove or correct

1. Any remaining claim that `modelRivers(...)` is categorically forbidden.
2. Any remaining claim that no stable Civ river writer exists.
3. Any doc/test language that treats terrain-row parity as equivalent to Civ
   metadata parity or rendered visibility.
4. Any downstream use of `riverClass` that is described as runtime river fact
   instead of Hydrology truth.

### Proposed execution slices

1. **Contract clarification slice**
   - Update durable docs and workstream authority to describe the current mixed
     projection contract honestly:
     Hydrology selection + explicit terrain stamping + bounded internal bulk
     writer compatibility.

2. **Proof splitting slice**
   - Lock separate acceptance rows for:
     - hydrology truth
     - projection plan
     - terrain readback
     - metadata readback
     - Studio visibility
     - Civ-rendered visibility

3. **Harness honesty slice**
   - Tighten mock/test language so tests are explicit about which surfaces they
     prove and which ones they do not.
   - Avoid mock behavior that silently claims runtime parity.

4. **Downstream-surrogate audit slice**
   - Audit placement/ecology/freshwater consumers that read `riverClass`.
   - Classify whether they are consuming Hydrology truth intentionally or
     accidentally impersonating runtime semantics.

5. **Runtime contract decision slice**
   - Decide whether the long-term contract is:
     - bulk engine writer as bounded projection compatibility, or
     - eventual explicit river stamping capability,
     while keeping Hydrology truth upstream either way.

### Stop conditions

- Stop claiming river recovery closure from any one proof surface.
- Stop reopening Morphology-versus-Hydrology routing ownership.
- Stop using code existence alone as proof of proper owner boundaries.

### Recommended next action

Treat this note plus
`workstream/2026-06-10-river-modeling-disposable-proof.md`
as the immediate prosecution baseline for the next workstream edit:

- update the durable execution redesign packet to reflect the current mixed
  `map-rivers` contract,
- then split the remaining acceptance/proof surfaces before more implementation.

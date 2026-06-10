# 1. Framed mission

## Scoped mission

Design the verification, DX, and closure system that could honestly prove
physical rivers and lakes work as a product outcome in Civ7, not merely as a
local pipeline or terrain-stamping outcome.

This frame selects in:

- fresh map generation from authored config;
- same-run Studio/Civ exact-authorship proof;
- physical benchmark expectations grounded in Earth data;
- live direct-control readback after projection/materialization;
- Studio-visible parity for the same run;
- rendered in-game visibility for the same run;
- closure gates strict enough to prevent another false "done" call.

This frame foregrounds:

- proof-class separation;
- same-run evidence binding;
- direct-control-only runtime authority;
- witness-row coverage rather than seed anecdotes;
- operator workflow and DX as part of proof, not an afterthought.

This frame makes exterior:

- implementation detail that does not change proof boundaries;
- broad code-health review outside river/lake verification;
- any claim that a lower proof class can stand in for a higher one.

## Concise internal goal

Record a third-wave brief that turns the current proof fragments into a
closure-capable verification system: matrix, proof artifact contract, operator
workflow, triage ladder, and OpenSpec-ready closure criteria.

## Hard core

- Product proof is not a synonym for hydrology proof, terrain proof, or Studio
  proof.
- Same-run identity is mandatory. Mixed-run evidence is disqualifying.
- Runtime truth must come through `@civ7/direct-control`.
- Rendered gameplay is the final load-bearing river/lake proof class.
- If a proof class is missing, the row stays blocked or partial; it does not
  inherit confidence from lower classes.

## Structural alternative considered and rejected

Rejected frame: "rivers/lakes are done when local tests pass, parity is mostly
clean, and a screenshot looks plausible."

Reason for rejection: this collapses distinct proof classes, allows evidence
splicing across runs, and confuses technical repair with player-visible
outcome.

## Falsifier

If the system cannot bind authorship, local replay, runtime readback, Studio
state, and rendered capture to one exact run identity, then it cannot support a
truthful product-closure claim.

# 2. Investigation brief

## Investigation type and axes

- Investigation type: decision-support plus doc-vs-code reconciliation.
- Frame stability: committed.
- Evidence standard: audit-grade for closure, verified for subclaims.
- Search geometry: narrowing plus graph-tracing across proof packets, scripts,
  acceptance ledgers, and operator commands.
- Rail coupling: rail-neutral first, then rail-constrained for Studio/direct-control.
- Artifact durability: durable source-of-truth note.
- Uncertainty posture: falsification first.

## Primary questions

1. What proof classes are required to support the full product claim for rivers
   and lakes?
2. What exact artifacts and identity fields must travel between fresh
   generation, Studio, runtime readback, and rendered review?
3. What operator workflow would make the strong proof path routine instead of
   exceptional?
4. How should failures be triaged so teams stop claiming "river bug" when the
   defect actually sits in parity, Studio display, capture, or non-river
   residuals?
5. What closure gates would prevent terrain-readback or screenshot-only green
   states from being summarized as product success?

## Secondary questions

1. Which rows can share the same exact-authored run safely?
2. Which witness-row families are mandatory for broad claim coverage?
3. Which proof packet labels already exist and should be preserved rather than
   replaced?
4. Which current gaps are tooling gaps versus genuine product blockers?

## Exclusion questions

- Do not broaden into generic map acceptance beyond river/lake dependencies.
- Do not redesign hydrology itself here.
- Do not treat metadata authoring as required for the narrower terrain-row
  claim unless the product row explicitly depends on metadata.

## Falsification questions

1. Where could the current system produce a technical pass while a normal player
   still sees no convincing river/lake outcome?
2. Which proofs currently allow stale, partial, or manual evidence to appear
   closure-capable?
3. Where does current DX encourage operators to skip same-run binding?
4. Which open rows remain product-blocking even if river terrain parity is
   clean?

## Evidence policy

Authority order:

1. exact-authorship proof packet;
2. final-surface parity proof with labeled claims;
3. direct-control runtime readback;
4. Studio-visible exported proof artifacts;
5. rendered-capture proof artifacts;
6. acceptance matrix / ledger;
7. focused tests and benchmark suites;
8. official-resource / official-engine evidence.

Conflict rule:

- higher same-run proof overrides lower or generalized evidence;
- a contradiction blocks closure until classified;
- unresolved labels remain unresolved and must not be summarized upward as pass.

What does not count as closure evidence:

- mock-only support;
- screenshots without exact-authorship linkage;
- manual-file capture marked closure-capable;
- stage logs without witness-row readback or visible outcome.

## Stop and reframe conditions

Stop if:

- exact-authorship proof is incomplete;
- parity/readback/capture artifacts do not refer to the same run;
- required witness-row families are missing;
- the runtime surface needed for classification does not exist.

Return to framing if:

- the product claim needs to split into narrower independent claims;
- a supposed public authoring surface turns out to be only a compatibility or
  operator control;
- rendered gameplay cannot currently be proven without a new proof rail.

# 3. Adversarial notes: current findings, gaps, risks

## Findings

1. The repo already has the right high-level proof taxonomy:
   `exact-authorship`, `hydrology-truth`, `projection-plan`,
   `terrain-readback`, `metadata-readback`, `studio-visible`,
   `civ-rendered`, `lake-final`, and `product-acceptance`.
2. The current acceptance matrix already says technical rows do not close
   product rows. That is correct and should become stricter, not looser.
3. The visible-river verifier already blocks non-direct-control camera sources,
   manual-file capture, missing exact-authorship, and unsampled targets. That
   is the right direction for closure-capable proof.
4. Exact-authorship proof is already load-bearing and must remain upstream of
   every river/lake product row.

## Gaps

1. The product row for rendered rivers is still open.
2. Studio visualization is still an open proof class, not yet a reliable review
   surface.
3. Lake final counters exist, but exact same-run carriage is still not a hard
   universal gate.
4. Witness-row sampling exists for live river tiles, but the broader witness-row
   family coverage needed for closure is not yet formalized.
5. Operator workflow is fragmented across scripts and ledgers rather than
   expressed as one standard proof path.

## Risks

1. Terrain-readback rows will keep being summarized as "rivers fixed."
2. One strong seed will be overgeneralized into product capability.
3. Manual screenshots or OS fallbacks will be treated as equivalent to
   direct-control-bound proof.
4. Minor-river support will be rhetorically smuggled in by major-river terrain
   success.
5. Non-river residual parity failures will keep confusing river closure unless
   triage stays explicit.

# 4. Test / verification matrix

Every row below is a separate proof obligation. A pass in one row may support a
later row, but it does not substitute for it.

| Row | Product claim | Evidence class | Minimum artifact | Pass rule | Failure means | Primary owner |
| --- | --- | --- | --- | --- | --- | --- |
| Fresh generation identity | The reviewed map is the authored map we intended to test | exact-authorship | Studio run request + source/deploy/runtime/log identity packet | config, seed, size, setup, script hashes, runtime seed/dimensions, game hash, and fresh log packet all match | all downstream rows blocked | Studio + direct-control proof boundary |
| Hydrology truth | River/lake source truth is physically plausible | unit/property + benchmark | local benchmark report over fixed seed family and fixtures | drainage, confluence, rain-shadow, endorheic, and lake coupling oracles pass | upstream physical/model failure | Hydrology |
| Projection plan | Major truth becomes a coherent visible trunk subset | local op + stats | projected navigable mask + no-signal typing + chain stats | selection meets declared major-river visibility thresholds or typed no-signal exception | projection policy failure or wrong thresholding | map-rivers |
| Terrain readback | Civ materialized the projected navigable terrain on the same run | same-run runtime readback | final-surface parity proof | projected navigable terrain matches live terrain rows for witness rows/full grid classification | materialization gap or parity failure | map-rivers + adapter/direct-control |
| Metadata readback | If metadata is claimed, Civ metadata agrees with the claim | same-run runtime readback | parity proof with metadata claim labels | live river metadata matches the scoped metadata claim | metadata writer gap or claim overreach | adapter / runtime capability owner |
| Lake final | Accepted lakes survive final placement | same-run runtime readback | exact-authored lake counters + final lake proof | accepted lakes stay water/lake classified with zero unexplained drift | lake maintenance or placement failure | hydrology + map-hydrology + placement |
| Studio visible parity | Studio shows authored, projected, live, and mismatch surfaces clearly for the same run | same-run Studio export | witness-row-linked overlay/export packet | planned minor, planned major, projected navigable, live terrain, lake state, and mismatches are visible and correctly labeled | Studio visualization or stale artifact failure | Studio |
| Rendered river proof | A normal player actually sees the intended river outcome | same-run rendered capture | direct-control-bound visible-proof packet | camera is bound to sampled live river tiles, capture mode is closure-capable, screenshots exist, verdict is visible, and exact-authorship + terrain-readback already pass | product-visible failure or missing proof rail | product proof / capture |
| Rendered lake proof | A normal player actually sees lakes where the product claims them | same-run rendered capture | lake visible-proof packet (same shape as rivers, lake-focused targets) | sampled accepted lakes are visibly present and not contradicted by runtime readback | product-visible lake failure | product proof / capture |
| Holdout / controls | The accepted behavior is not a single-seed accident | mixed proof stack over fixed rows | accepted row ledger over holdout seeds/configs | at least one normal holdout, one dry/no-signal control, and one fragmented/coastal holdout behave as typed | overfit or missing exception typing | product acceptance |

## Required witness-row families

- major/navigable trunk;
- major confluence;
- headwater/upper reach;
- mouth/coast join;
- inland lake;
- lake-fed or basin-adjacent corridor;
- floodplain-capable corridor;
- dry/no-signal negative control;
- fragmented/coastal holdout;
- any claimed minor-river visible row, only if a real minor-river product claim
  is in scope.

# 5. Proof artifact design

## Proof packet stack

The closure-capable artifact should be a stack, not a single flat JSON:

1. `exact-authorship-packet.json`
2. `final-surface-parity-proof.json`
3. `river-visible-proof.json`
4. `lake-visible-proof.json`
5. `acceptance-row-ledger-entry.json`
6. `operator-run-summary.json`

## Shared envelope fields

Every artifact in the stack should carry:

- `requestId`
- `createdAt`
- `configHash`
- `envelopeHash`
- `seed`
- `mapSize`
- `dimensions`
- `runtime.turn`
- `runtime.gameHash`
- `generatedScriptHash`
- `deployedScriptHash`
- `proofSource`
- `proofVersion`
- `witnessRows[]`
- `evidenceRefs[]`
- `blockedBy[]`

## Labeled proof claims

Each packet should expose a stable `proofClaims` map with statuses:

- `pass`
- `fail`
- `unresolved`
- `blocked`
- `out-of-scope`

Do not overload top-level `status` to mean product closure. Top-level status may
describe packet completeness or transport success; claim labels carry the proof.

## Witness-row record shape

Each witness row should carry:

- stable `rowId`
- `family`
- coordinates or coordinate cluster
- local authored/projection state
- runtime readback state
- Studio-visible references
- rendered-capture references
- typed exception status, if any
- owner classification
- disposition

## Adversarial artifact rules

- manual screenshots may be stored, but never marked closure-capable;
- packets with mixed identity fields fail validation;
- stale runtime snapshot identity must label the packet stale, not current;
- absent proof classes must remain explicitly blocked or unresolved.

# 6. Operator workflow

This is the closure-capable happy path. Any deviation should produce a typed
blocked state rather than an informal fallback.

1. Choose the row to prove:
   - normal Earthlike rendered-river row;
   - holdout row;
   - no-signal control row;
   - lake exact-counter row.
2. Generate or select the authored Studio config and seed.
3. Run Studio Run in Game and capture the exact-authorship packet.
4. Reject the run immediately if exact-authorship is incomplete or mismatched.
5. Run local replay / benchmark classification for the same config/seed:
   - hydrology-truth;
   - projection-plan;
   - typed no-signal status if applicable.
6. Run final-surface parity via direct-control and record labeled claims.
7. If terrain-readback or lake-final is not pass for the scoped row, stop and
   triage before any rendered review.
8. Export Studio-visible overlays bound to the same request and witness rows.
9. Select witness rows from the accepted runtime materialization:
   - even sampling over live river tiles for rendered river proof;
   - explicit lake witness rows for lake proof;
   - include required family coverage.
10. Capture rendered review using closure-capable camera/control path:
   - direct-control camera source;
   - closure-capable capture mode;
   - target bound to sampled live witness row.
11. Record visible verdict and evidence hashes in visible-proof packets.
12. Write or update the acceptance row ledger entry.
13. Apply closure gates:
   - if all required labels pass, mark row pass;
   - if a label fails, mark fail or blocked with owner classification;
   - never summarize unresolved rows as done.

## Operator DX requirements

- one command family should assemble and validate the proof stack;
- blocked reasons should be machine-readable and stable;
- the operator should not need to hand-stitch packet identities;
- the workflow should fail fast on exact-authorship mismatch or stale proof.

# 7. Failure triage ladder

Always triage from strongest boundary failure outward. Do not jump straight to
"river algorithm bug."

1. Identity failure:
   - exact-authorship missing, mismatched, stale, or mixed-run.
   - Action: stop. No downstream interpretation is valid.
2. Runtime authority failure:
   - direct-control health/read surface unavailable.
   - Action: block proof rail, do not substitute manual runtime paths.
3. Upstream physical failure:
   - hydrology truth or Earth benchmark suite fails.
   - Action: assign to Hydrology before discussing rendering.
4. Projection-plan failure:
   - navigable trunk selection is incoherent or wrongly typed.
   - Action: assign to map-rivers selection/policy layer.
5. Terrain/lake readback failure:
   - runtime materialization diverges from projected terrain or accepted lakes.
   - Action: assign to projection/materialization or parity owner.
6. Metadata-only failure:
   - terrain row passes but metadata row fails.
   - Action: keep terrain claim narrow; do not inflate to full river support.
7. Studio-visible failure:
   - runtime truth exists but Studio cannot display it correctly.
   - Action: assign to Studio parity/visualization.
8. Rendered capture failure:
   - runtime truth exists but rendered visibility is absent, obscured, or
     inconclusive.
   - Action: assign to product-visible outcome or capture workflow, depending on
     evidence.
9. Residual non-river parity failure:
   - same-run proof contains other unresolved terrain/feature/resource deltas.
   - Action: keep those residuals classified separately; do not attribute them
     to rivers unless evidence says so.

# 8. OpenSpec-ready closure criteria

## Requirement: River and lake product closure uses labeled same-run proof

River/lake product closure SHALL consume labeled proof claims over one exact
authored run and SHALL reject mixed-run or lower-class substitutions.

### Scenario: Normal Earthlike rendered-river row passes

- **WHEN** exact-authorship, hydrology-truth, projection-plan,
  terrain-readback, studio-visible, civ-rendered, and product-review are all
  `pass` for the accepted row
- **THEN** the rendered-river row MAY be marked `pass`
- **AND** the closure packet SHALL cite the exact request id, config hash,
  envelope hash, seed, dimensions, and evidence hashes

### Scenario: Terrain proof passes but rendered proof is unresolved

- **WHEN** terrain-readback is `pass` and civ-rendered is `unresolved`
- **THEN** the row SHALL remain technical-only
- **AND** product closure SHALL remain blocked

### Scenario: Lake counters are not exact-run bound

- **WHEN** accepted lake counters exist locally or in runtime readback but lack
  exact-authorship carriage
- **THEN** `lake-final` SHALL remain `unresolved`
- **AND** the lake row SHALL not pass

### Scenario: Manual or fallback capture is supplied

- **WHEN** screenshot capture is manual-file, OS fallback, or not bound to a
  sampled live witness row
- **THEN** civ-rendered SHALL remain `blocked`
- **AND** the proof SHALL not be closure-capable

### Scenario: Dry or no-signal control is valid

- **WHEN** a declared dry/control row produces low or absent visible rivers and
  projection-plan records a typed no-signal status
- **THEN** the row MAY pass as a control
- **AND** the absence SHALL not be classified as a projection failure

## Final closure gates

The workstream is not done until:

1. the rendered-river product row passes;
2. at least one holdout/control family row passes with typed outcome;
3. the lake exact-counter row passes;
4. the Studio visualization row passes;
5. no open row is being summarized upward as product closure.

## Forbidden closure shortcuts

- closing on local tests;
- closing on terrain parity alone;
- closing on Studio screenshots alone;
- closing on metadata inference from terrain;
- closing on manual screenshots or off-target captures;
- closing on one accepted seed without holdout/control coverage.

# 9. Recommended immediate next slice

1. Standardize the proof stack and packet envelope first.
2. Add a lake-visible proof packet matching the river visible-proof discipline.
3. Formalize witness-row family coverage in the acceptance matrix.
4. Add a one-command operator workflow that validates packet identity before any
   review step.
5. Convert current open rendered-river and lake rows onto the new stack rather
   than inventing parallel proof formats.

Skills used: framing-design, investigation-design

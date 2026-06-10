# 1. Framed objective

Design a closure-proof verification architecture for Civ7 MapGen rivers and
lakes that makes it impossible to truthfully say "rivers are done" from local
or partial evidence alone.

The hard core is product-outcome-first:

- Hydrology truth is not product proof.
- Projection/materialization success is not product proof.
- Studio visibility is not rendered-game proof.
- A screenshot is not closure unless it is bound to the same authored run as the
  local diagnostics, runtime readback, and rendered gameplay observation.
- Runtime Civ7 proof must stay inside the `@civ7/direct-control` authority
  boundary. No caller-local socket scripts, ad hoc FireTuner snippets, or
  manual console pokes count as closure evidence.

The target is not "good river metrics" in isolation. The target is: for the
same authored run, representative river/lake witness rows survive local
generation, physical expectations, Studio display, Civ projection/materialization,
runtime readback, and rendered in-game visibility without contradiction.

Structural alternative considered and rejected: close on local tests + stats +
one screenshot. That is exactly how false closure happens, because those proofs
do not bind the visible product outcome to the same run or the same owning
layer.

Falsifier for this frame: if the system cannot preserve same-run identity across
all proof classes, or cannot produce direct-control readback for the visible
witness rows, then no river/lake "done" claim is allowed. The correct state is
blocked or partial, not closed.

# 2. Investigation design: questions, exclusions, falsifiers, evidence hierarchy, stop conditions

## Questions

1. Where can a false-positive closure enter the chain: local truth, benchmark
   interpretation, projection/materialization, Studio rendering, readback, or
   rendered gameplay?
2. What exact claim does each proof class answer, and what stronger claim must
   it be forbidden from implying?
3. What same-run identity fields must travel from authored generation to final
   rendered proof so mixed-run evidence is impossible?
4. Which witness-row families must be covered so we do not close on one
   photogenic trunk river while minor rivers, deltas, lakes, or navigable
   conversions still fail?
5. What direct-control read surfaces are required to classify whether a visible
   defect belongs to hydrology truth, projection/materialization, Studio parity,
   or final rendering?
6. What contradictions must block closure immediately rather than getting
   normalized as "visual drift"?

## Exclusions

- No closure from local tests alone.
- No closure from local statistical benchmarks alone.
- No closure from Studio screenshots alone.
- No closure from Civ readback alone.
- No closure from old logs, old saves, or stale screenshots.
- No proof bundle assembled from different requests, seeds, config hashes,
  envelope hashes, commits, or deployed artifacts.
- No non-direct-control runtime path for authoritative live proof.
- No "representative enough" handwave without an explicit witness-row coverage
  matrix.

## Falsifiers

- Same-run identity cannot be proven end to end.
- The visible failure row cannot be classified to an owning layer.
- Readback and rendered outcome disagree on the same witness row.
- Studio and rendered gameplay disagree on the same witness row without a named
  explanation and owner.
- Benchmark-passing seeds still produce visible river/lake failures on the same
  authored run.
- Closure depends on an unavailable or unverified runtime field.

## Evidence hierarchy

This is a hierarchy of closure force, not a license to merge proof classes:

1. Product authority and exact failing-row definition.
2. Same-run rendered gameplay proof.
3. Same-run direct-control runtime readback.
4. Same-run Studio visualization parity.
5. Statistical benchmark checks over stable seed matrices.
6. Unit/property tests.
7. Official-resource and official-engine evidence for rule/constraint grounding.

Interpretation rule: lower classes can explain or localize a failure; they
cannot overrule a higher-class same-run contradiction.

## Stop conditions

- The run identity bundle is incomplete.
- The proof row is stale relative to the deployed authored map.
- A required runtime read surface does not exist yet.
- The witness-row set does not cover the failing family.
- The evidence only proves pipeline completion, not river/lake outcome.
- The observed contradiction spans multiple layers and cannot yet be assigned to
  one owner.

# 3. Verification matrix / proof classes

Cross-cutting prerequisite for every class: one run bundle must carry request
id, seed, dimensions, config hash, envelope hash, branch, commit, deployed mod
fingerprint, log window, and witness-row ids/coordinates. If that bundle breaks,
all stronger proof claims collapse.

| Proof class | Core question answered | Required evidence | Pass condition | Explicitly does not prove |
| --- | --- | --- | --- | --- |
| Unit/property tests | Are the owned local contracts internally consistent? | Focused op tests, property tests, regression fixtures, contract guards | Owning algorithms and adapters satisfy invariants for representative synthetic cases | Product visibility, Civ runtime behavior, Studio parity |
| Statistical benchmark checks | Does generated output over stable seed matrices stay within declared physical/gameplay expectations? | Stable seed matrix, predeclared thresholds, observed metrics for river/lake families | Metrics pass for declared ranges and coverage families | That any specific rendered run looks correct |
| Official-resource / official-engine evidence | What should be possible or expected according to official data and engine semantics? | Official files, accepted docs, engine call contracts, named inference rules | Constraints and expected surfaces are documented and mapped to verification obligations | That current implementation satisfies them |
| Runtime readback | What did Civ actually materialize on the same run? | `@civ7/direct-control` readback for witness rows after mapgen completion, bounded logs, exact run identity | Readback confirms the expected projected/materialized river/lake state for the same rows | That the player-facing rendering matches, absent visual proof |
| Studio visualization parity | Does Studio show the same authored/projection/readback story for the same run? | Same-run Studio overlays/screenshots plus linked witness-row metadata | Studio agrees with authored truth and readback for the same rows, or exposes a classified delta | In-game rendered visibility |
| Rendered gameplay proof | Does the player-visible game actually show the intended rivers/lakes on the same run? | Same-run in-game screenshots/video or bounded rendered observation, linked to the exact run bundle | Witness rows are visibly correct in game after completion, for the same authored run proven by logs/readback | Broader benchmark health across many seeds |

Adversarial note: there should also be a non-closure label for "pipeline proof
only" when logs show `modelRivers(...)`, `defineNamedRivers()`, or step
completion but there is no same-run visible/readback evidence yet.

Recommended witness-row families for coverage:

- minor edge river
- major/navigable river trunk
- headwater segment
- confluence
- river mouth/delta/coast join
- floodplain-capable corridor
- inland lake
- lake near river outlet or lowland basin
- negative controls where no river/lake should be visible

# 4. Closure criteria that truly match product outcome

River/lake recovery is closed only when all of the following are true:

1. The failing product row is current and classified.
2. The owning local tests for the repaired layer exist and pass.
3. Stable benchmark checks pass for the declared river/lake families on a fixed
   seed matrix with predeclared thresholds.
4. The exact authored run used for visible proof has same-run identity binding:
   request id, seed, config hash, envelope hash, branch, commit, deploy target,
   and bounded log window.
5. Same-run direct-control readback proves the relevant witness rows reached the
   expected projected/materialized state.
6. Same-run Studio evidence either matches those witness rows or records a
   classified Studio-only delta.
7. Same-run rendered gameplay evidence proves those witness rows are visible as
   intended in game.
8. No higher-class contradiction remains open. In particular:
   - rendered proof may not disagree with readback;
   - readback may not disagree with authored/projection claims;
   - Studio may not silently disagree with either.

Practical closure rule:

- "Hydrology fixed" is a local/source claim.
- "Projection/materialization fixed" is a runtime readback claim.
- "Studio parity fixed" is a Studio claim.
- "Rivers/lakes done" is a product claim and requires rendered gameplay proof on
  the same run, not merely the other three.

Required closure artifact shape:

- One proof bundle per accepted run.
- One witness-row ledger mapping each row to all satisfied proof classes.
- One contradiction ledger for unsatisfied or downgraded rows.
- One explicit final claim line that names satisfied proof classes and pending
  proof classes separately.

# 5. Tooling / DX implications

- Add a run-bundle contract that every proof rail emits: request id, seed,
  dimensions, config hash, envelope hash, branch, commit, deploy path,
  screenshot paths, log offsets, and witness-row ids.
- Make `@civ7/direct-control` the only live proof transport. Studio must consume
  runtime truth through that boundary, not invent a sibling runtime path.
- Add direct-control read helpers for the minimum river/lake witness-row fields
  needed to classify defects. If a field is unavailable, the bundle must mark
  the proof class blocked rather than inferring.
- Make Studio able to export same-run witness-row overlays, not just pretty
  screenshots.
- Add a proof-class vocabulary to all ledgers and outputs so "test passed",
  "runtime readback passed", and "product proof passed" are mechanically
  distinct labels.
- Add a witness-row coverage generator so proof cannot concentrate only on easy
  or visually dramatic rows.
- Add an automated contradiction check that rejects mixed-run bundles and flags
  class mismatches before humans review screenshots.
- Preserve a "pipeline proof only" state in tooling so operators are not pushed
  toward premature green labels.

# 6. Most likely failure modes in the proof system itself

1. Mixed-run evidence: screenshot from run B, logs from run A, benchmark from
   seed set C.
2. Proof inflation: local tests or stats being summarized as product success.
3. Self-verifying diagnostics: generator code and verifier code reading the same
   derived artifact instead of an independent runtime surface.
4. Render/readback race: readback captured before final engine validation or
   before the rendered state settles.
5. Witness-row cherry-picking: closure on a trunk river while lakes, deltas, or
   floodplain corridors still fail.
6. Studio capture drift: Studio overlays show authored intent but not the same
   post-materialization reality as the live run.
7. Unclassified contradictions being normalized as acceptable variance.
8. Manual runtime interventions contaminating the run after generation.
9. Missing negative controls, causing over-materialization to look like success.
10. Reusing an old deployed mod or stale logs while the source commit changed.

# 7. Recommended immediate next slice(s)

1. Define and implement the same-run proof bundle contract first. Without that,
   every later proof rail is vulnerable to evidence splicing.
2. Define the river/lake witness-row family matrix and coverage minimums,
   including negative controls.
3. Add the direct-control river/lake readback surface needed to classify
   witness-row state after mapgen completion.
4. Add Studio export/parity hooks that bind overlays and screenshots to the same
   run bundle and witness rows.
5. Add rendered gameplay proof capture for the same run, with a strict "product
   proof" label separate from readback.
6. Add contradiction-ledger automation that blocks closure whenever any higher
   proof class disagrees with a lower one.

Skills used: framing-design, investigation-design

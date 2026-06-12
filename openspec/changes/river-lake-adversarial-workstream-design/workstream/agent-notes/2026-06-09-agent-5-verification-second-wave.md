# 1. Framed objective

## Scoped goal

Adversarially test the current river/lake workstream against the actual product
outcome: Civ-visible, physically grounded, user-obvious rivers (minor and
major/navigable) plus lakes that remain correct through final placement and
normal gameplay.

This is a product-prosecutor frame, not a pipeline-success frame.

The hard core is:

- local hydrology truth is not product proof;
- projection/materialization success is not product proof;
- Studio visibility is not rendered-game proof;
- a screenshot is not closure unless it is bound to the exact same authored run
  as the local diagnostics, runtime readback, and rendered gameplay proof;
- runtime evidence only counts when it stays inside the `@civ7/direct-control`
  boundary, not caller-local scripts, ad hoc Tuner pokes, or manual console
  intervention.

The key claim under prosecution is not "did the stage run?" It is "would a
normal player starting a fresh accepted map obviously see rivers and lakes in
the places the product intends, and would those visible outcomes still be
consistent with the physical and authored truth?"

Structural alternative considered and rejected: treat local tests, benchmark
stats, terrain readback, and one screenshot as sufficient closure. That frame
is exactly how false-done claims happen because it allows mixed-run evidence,
ignores rendered gameplay, and collapses distinct proof classes into one
inflated verdict.

Frame falsifier: if the workstream cannot preserve same-run identity across
authorship, local replay, direct-control readback, Studio display, and rendered
gameplay, then no "rivers/lakes done" claim is legitimate. The correct state is
partial, blocked, or technically repaired for a narrower proof class.

## Product capability statement under this frame

The strongest honest current claim is narrow:

- major/navigable river projection can be technically proven as
  `TERRAIN_NAVIGABLE_RIVER` materialization for a selected subset of Hydrology
  major-river truth;
- minor rivers remain physically authored intent, not product-proven Civ-visible
  behavior;
- lakes have stronger physical and readback grounding than rivers but are still
  not product-closed without exact same-run counters and rendered confirmation.

Any broader statement such as "rivers are done" or "minor + major rivers are
working in game" is adversarially suspect until it proves rendered gameplay
outcome on the same run.

# 2. Investigation design: questions, exclusions, falsifiers, evidence hierarchy, stop conditions

This section is the pre-inspection inquiry rail. It defines what counts before
the code/doc pass begins, so the investigation does not silently inherit the
repo's own optimism.

## Primary questions

1. What is the exact product capability statement for minor rivers, major
   rivers, and lakes separately?
2. What should a normal player expect to see on a fresh in-game map without
   debug layers, Studio context, or special knowledge?
3. Which proof class answers which claim, and which stronger claim must it be
   forbidden from implying?
4. Which knobs are legitimate authoring surfaces because they correspond to
   product-meaningful choices, and which are fake, legacy, wrong-owner, or
   debug/operator surfaces?
5. What closure boundary would stop the team from declaring done on terrain
   parity, mock support, or screenshot intuition alone?

## Falsification questions

1. Where can the system show a convincing technical pass while the player still
   does not actually see correct rivers/lakes in normal play?
2. Where can same-run identity break, allowing evidence splicing from different
   authored runs?
3. Where do current tests or docs overclaim support that live runtime evidence
   does not actually prove?
4. Which claims currently depend on readback fields, metadata surfaces, or
   Studio layers that are absent, stale, or not actually authoritative?
5. Which rows could pass on one photogenic trunk river while minor rivers,
   deltas, basins, or lakes still fail?

## Exclusions

- No closure from local unit/property tests alone.
- No closure from physical/statistical benchmark checks alone.
- No closure from Studio screenshots alone.
- No closure from Civ terrain readback alone.
- No closure from old logs, stale saves, or screenshots not bound to exact
  authorship proof.
- No proof packet assembled from different request ids, config hashes, envelope
  hashes, deployed artifacts, or commits.
- No closure from non-direct-control runtime paths.
- No closure from "representative enough" intuition without a witness-row
  matrix.

## Evidence standards

Required confidence level: audit-grade for product closure.

Evidence hierarchy:

1. same-run exact-authorship proof and failing-row definition;
2. same-run rendered gameplay proof;
3. same-run direct-control runtime readback;
4. same-run Studio visualization parity;
5. statistical benchmark checks over predeclared seed matrices;
6. focused unit/property/regression tests;
7. official-resource / official-engine evidence for possibility and semantics.

Interpretation rule: lower classes can localize and explain. They cannot
overrule a contradiction at a higher same-run class.

What does not count:

- mock behavior presented as live capability;
- screenshots without exact-authorship linkage;
- logs proving stage completion without proving visible outcome;
- local replay/verifier code that only re-reads its own derived artifacts.

## Stop conditions

- the same-run identity bundle is incomplete;
- the proof row is stale relative to the currently deployed authored map;
- a required direct-control read surface does not exist yet;
- the witness-row set does not cover the failing family;
- the evidence only proves pipeline completion, not player-visible outcome;
- a contradiction spans multiple layers and cannot yet be assigned to an owner.

## Reframe conditions

Return to framing if:

- the real product claim turns out to be narrower than "rivers/lakes done";
- major/navigable river proof and minor-river proof must be split into separate
  product rows;
- the current closure language cannot survive explicit proof-class separation;
- the authoring surface being defended is actually a compatibility/debug
  surface, not a product surface.

# 3. Verification matrix / proof classes

Cross-cutting prerequisite for every proof class: one run bundle must carry
request id, seed, dimensions, config hash, envelope hash, deployed artifact
identity, witness-row ids/coordinates, and bounded proof artifacts. If that
bundle breaks, stronger proof claims collapse.

## Capability rows under prosecution

| Capability claim | What counts | What does not count | Current adversarial disposition |
| --- | --- | --- | --- |
| Hydrology publishes physically grounded river truth | unit/property tests, benchmark fixtures, local artifacts | screenshots, terrain readback, Studio overlays | plausible lower-level proof class only |
| Selected major trunks materialize as navigable river terrain | same-run exact-authorship + direct-control terrain readback | local logs, mock adapter success, terrain parity from a different run | technically provable row |
| Civ river metadata matches authored/projection truth | same-run metadata readback via direct-control | inferred-from-terrain behavior, mock metadata support | currently unproven / likely false for closure claims |
| Studio shows the same story as authored truth plus runtime readback | same-run Studio overlays linked to witness rows and proof packet | pretty screenshots, stale generated artifacts | still open |
| A player obviously sees correct rivers in normal play | same-run rendered gameplay proof + reviewer disposition | terrain ids, metadata alone, Studio alone | still open |
| Lakes remain correct through final placement | exact same-run lake counters + terrain/readback + rendered/gameplay review where relevant | local accepted-lake counters without exact log carriage | technically promising, not product-closed |
| Minor rivers are a player-visible supported capability | real authoring/write path + same-run runtime and rendered proof | major-river terrain materialization, mock support, intent masks | explicitly not proven |

## Proof classes

| Proof class | Core question answered | Required evidence | Pass condition | Explicitly does not prove |
| --- | --- | --- | --- | --- |
| Unit/property tests | Are local owner contracts internally consistent? | focused tests, regression fixtures, compile/contract guards | owned algorithms satisfy declared invariants | product visibility, Civ runtime behavior, Studio parity |
| Statistical benchmark checks | Does generator output stay within physical/gameplay expectations over a seed family? | stable seed matrix, predeclared thresholds, observed metrics | declared ranges pass for the claimed family | that any specific rendered run looks correct |
| Official-resource / official-engine evidence | What should be possible or expected according to official resources and engine semantics? | official files, engine callsites, accepted docs, bounded inference | possibility and semantics are grounded | that current implementation satisfies them |
| Runtime readback | What did Civ actually materialize on the same run? | `@civ7/direct-control` readback after mapgen completion, exact-authorship linkage | witness rows show expected materialized state | player-visible rendering, absent visual proof |
| Studio visualization parity | Does Studio show the same authored/projection/readback story for the same run? | same-run overlays/screenshots + linked witness-row metadata | Studio matches or classifies the delta | rendered gameplay |
| Rendered gameplay proof | Does a normal player actually see the intended rivers/lakes in game on the same run? | same-run in-game screenshots/video/observation linked to exact-authorship proof | witness rows are visibly correct in play | broader benchmark health across many seeds |

## Findings

1. The repo already separates proof labels in principle, and that separation is
   correct. The recurring failure is not missing vocabulary; it is collapsing
   narrower technical rows into product closure.
2. The current strongest proved river row is terrain-row materialization of a
   selected major/navigable subset. That is materially narrower than "rivers are
   done."
3. Minor-river support is still vulnerable to false inflation because the live
   workstream language keeps it out of scope while at least one mock-driven test
   shape makes support look stronger than the live proof allows.
4. The workstream still needs an explicit "pipeline proof only" label so logs
   and stage completion are not mistaken for product outcome.

## Gaps

- no same-run rendered gameplay closure row is currently strong enough to carry
  the full product claim;
- minor-river product proof remains unsupported;
- lake closure still needs mandatory exact same-run counter carriage;
- Studio parity remains open as a user-facing proof class, not just a debug aid.

## Risks

- terrain parity will be misread as visible river success;
- mock support will be cited as runtime support;
- one seed with photogenic trunks will stand in for the actual capability
  envelope;
- metadata divergence will get normalized because terrain rows already look
  green.

# 4. Closure criteria that truly match product outcome

## Product expectation

For a fresh accepted map, a normal player should see obvious river/lake outcomes
without special knowledge:

- major/navigable rivers should read as coherent visible corridors, not isolated
  terrain curiosities;
- maps that are supposed to have meaningful river signal should show it;
- intentionally dry/no-signal controls may stay low-river only when that
  classification is explicit and justified;
- lakes should remain water/lake outcomes after placement, not vanish, dry out,
  or contradict the authored hydrology story.

Minor-river expectation must stay conservative until a real writer/materializer
surface is proven. The user-facing product statement cannot silently imply more
than the engine path actually supports.

## Closure boundary

River/lake recovery is closed only when all of the following are true:

1. The active product row is current, exact-authored, and same-run bound.
2. Focused local tests exist and pass for the repaired owner layer.
3. Stable benchmark checks pass for the declared river/lake witness families on
   a fixed seed matrix with predeclared thresholds.
4. Same-run direct-control readback proves the relevant witness rows reached the
   expected projected/materialized state.
5. Same-run Studio evidence matches those witness rows or records a classified
   Studio-only delta.
6. Same-run rendered gameplay evidence proves those witness rows are visibly
   correct in normal play.
7. Reviewer disposition signs off the rendered product outcome, not merely the
   technical substrate.
8. No higher-class contradiction remains open.

Practical claim discipline:

- "Hydrology fixed" is a local/source claim.
- "Projection/materialization fixed" is a runtime-readback claim.
- "Studio parity fixed" is a Studio claim.
- "Rivers/lakes done" is a product claim and requires same-run rendered gameplay
  proof.

## False claims that must be forbidden

- "Rivers are done because terrain rows exist."
- "Minor rivers are supported because planned intent exists."
- "The product is done because Studio and local replay agree."
- "A screenshot proves closure even though it is not same-run bound."
- "A mock compatibility path proves live engine support."

# 5. Tooling / DX implications

- Add a mandatory same-run proof bundle contract: request id, seed, dimensions,
  config hash, envelope hash, deployed artifact identity, witness-row ids,
  screenshot paths, log offsets, and readback references.
- Keep `@civ7/direct-control` as the only authoritative live proof transport.
  Studio should consume runtime truth through that boundary, not define a
  sibling path.
- Add direct-control helpers for the minimum river/lake witness-row facts needed
  to classify defects. If a field is unavailable, the proof class must block,
  not infer.
- Make Studio export witness-row-linked overlays, not only screenshots.
- Add explicit proof-class labels to ledgers and scripts so local tests, runtime
  readback, Studio parity, and rendered product proof cannot be merged
  rhetorically.
- Add a witness-row coverage generator, including negative controls, so proof
  cannot concentrate only on easy or dramatic rows.
- Add automated contradiction checks that reject mixed-run bundles and flag
  higher-class disagreements before review.
- Preserve a first-class "pipeline proof only" state in tooling.

# 6. Most likely failure modes in the proof system itself

1. Mixed-run evidence: screenshot from run B, logs from run A, readback from
   run C.
2. Proof inflation: local tests or terrain parity being summarized as product
   success.
3. Self-verifying diagnostics: generator code and verifier code reading the same
   derived artifact instead of an independent runtime surface.
4. Render/readback race: readback captured before final engine validation or
   before rendered state settles.
5. Witness-row cherry-picking: closure on a trunk river while lakes, deltas,
   confluences, or no-signal controls still fail.
6. Studio capture drift: Studio shows authored intent but not the same
   post-materialization reality as the live run.
7. Unclassified contradictions getting normalized as acceptable variance.
8. Manual runtime intervention contaminating a proof run after generation.
9. Public-surface drift: compatibility toggles or selector internals being
   treated as authoring knobs.
10. Mock optimism: tests asserting stronger support than live runtime evidence
    can actually defend.

# 7. Recommended immediate next slice(s)

## Concrete workstream proposal

1. Freeze the product claim vocabulary now. Split major/navigable terrain proof,
   minor-river support, Studio parity, and rendered gameplay into separate rows.
2. Implement the same-run proof bundle contract before expanding more tests.
   Without it, every later proof rail can still splice evidence.
3. Define witness-row family coverage minimums:
   - minor edge river;
   - major/navigable trunk;
   - headwater segment;
   - confluence;
   - river mouth / coast join;
   - floodplain-capable corridor;
   - inland lake;
   - basin-adjacent lake;
   - negative controls where no visible river/lake should appear.
4. Add the missing direct-control river/lake read surfaces needed to classify
   witness-row state after mapgen completion.
5. Add Studio export/parity hooks that bind overlays and screenshots to the same
   run bundle and witness rows.
6. Add rendered gameplay proof capture as a distinct product-proof rail, not an
   optional follow-up.
7. Reclassify suspicious public surfaces:
   - keep `hydrology-hydrography.knobs.riverDensity`;
   - keep `hydrology-hydrography.knobs.lakeiness`;
   - keep `map-rivers.knobs.navigableRiverDensity`;
   - retire or quarantine legacy/wrong-owner/public-debug surfaces such as
     `map-rivers.knobs.riverDensity`, public `minLength/maxLength`, selector
     thresholds, and compatibility toggles presented as authoring knobs.

## Note log

- Framed this as a product-outcome investigation first, not a code-health or
  pipeline-health investigation.
- Designed the investigation brief before re-inspecting repo evidence.
- Read the current workstream docs, proof ledgers, exact-authorship and
  direct-control proof boundaries, `map-rivers`/Hydrology authoring surfaces,
  and current river/lake tests with an adversarial burden-of-proof posture.
- Main conclusion: the repo already has much of the right proof taxonomy, but
  the closure language is still exposed to inflation wherever technical rows can
  be rhetorically promoted into product rows.

Skills used: framing-design, investigation-design

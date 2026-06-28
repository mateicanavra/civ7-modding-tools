# Habitat Dominoes

Status: active sequence ledger for Habitat authority activation

This document records the next reviewable domino sequence for the Habitat
authority tree. It is governed by `.habitat/DOMINO-FRAME.md`; this ledger is
the execution-facing companion, not a replacement frame or exhaustive backlog.

## Status And Source Order

Use this source order when selecting or judging the next domino:

1. Direct user decisions and current repo instructions.
2. `.habitat/DOMINO-FRAME.md`.
3. `.habitat/AUTHORITY-ONTOLOGY.md`.
4. `.habitat/AUTHORITY.md`, `.habitat/AUTHORITY-TREE-SHAPE.md`,
   `.habitat/AUTHORITY-TOOL-SEPARATION.md`, `.habitat/ARTIFACT-KINDS.md`, and
   `.habitat/SUBJECT-CATEGORIES.md`.
5. Current `.habitat` tree shape, generic packet role files, Toolkit behavior,
   and fresh command evidence.
6. Historical branch, PR, and session context as discovery material only.

The center of gravity has moved. Package-script cleanup is not the active
driver anymore. Source-check retirement and mixed command-check extraction are
landed enough to stop driving the plan. The full-suite runner rebuild moves
later, after admitted authority exists and can project into execution.

The next regime is not another cleanup pass. It is the point where the
authority model starts operating vertically: blueprint authority, instance
facts, capability attachment, niche admission, and execution projection become
real for one narrow pilot before they are generalized.

## Target Regime: Authority Activation

Authority Activation is the next whole regime for Habitat.

In this regime:

- Blueprint authority defines a constructible kind and the facts required to
  admit instances of that kind.
- Instance facts are declared by the instance, not inferred from runner history
  or packet path convenience.
- Capabilities attach to admitted instances when the blueprint allows them and
  the instance facts satisfy their requirements.
- Niches govern admission by accepted facts instead of acting only as folder
  jurisdictions.
- Execution tools are projections of admitted authority. They are adapters and
  evidence rails, not ontology sources.
- Transitional `rule.json` routing metadata either serves the migrated slice
  temporarily or gets pruned when admitted authority makes it redundant.

The destination is meaningfully different from the current tree: an agent can
start with one admitted instance, know its blueprint, capabilities, niche
admission basis, and narrow execution projection, and then author or inspect the
slice without reverse-engineering the old packet registry.

That destination is not a final global schema. It is a vertical pilot that
proves the activation stack end to end and gives the next pilot something real
to copy, refine, or reject.

## Domino Selection Rule

Choose the largest bounded vertical slice that makes the next largest slice
more mechanical.

A good domino must do at least one of these:

- admit a concept into the authority model;
- move a fact from transitional metadata into its owning authority surface;
- delete, demote, or fence a misleading bridge;
- create a narrow projection adapter for admitted authority;
- provide proof that falsifies or validates the next ordering decision.

A scan, ledger, or design note only counts when it enables one of those moves
inside the same branch or explicitly proves that the branch must stop before
implementation.

Avoid horizontal cleanup unless it is necessary for the active vertical pilot.
Avoid runner rebuilding until admitted authority exists for it to discover.

## Completed Domino Index

| Domino | Result |
| --- | --- |
| 1. Recover normative frame | Habitat was re-centered as the authority tree for repo structure and policy. |
| 2. Gather authority content | Scattered rule-like assets were gathered under `.habitat` while non-Habitat runtime workflows stayed with their consumers. |
| 3. Co-locate rule packets by subject | Rule records, patterns, baselines, and same-subject scripts were grouped into transition packets. |
| 4. Establish shallow niche jurisdictions | Packets moved under durable jurisdiction paths instead of runner, file-type, or defect labels. |
| 5. Normalize packet filenames | Rule packet files received consistent dot-pattern names for legibility. |
| 6. Separate mutating operations from checks | Read-only checks, repair operations, and generate operations stopped sharing one execution meaning. |
| 7. Migrate first MapGen static guardrails | Clear static architecture checks moved into Habitat-owned transitional packets. |
| 8. Define artifact kinds | Check, fix, generate, and migrate were recorded as mutability and execution intent kinds. |
| 9. Define authority tree shape | The current transitional niche, blueprint, category, kind, and packet path was documented. |
| 10. Flatten and correct the tree | Layer buckets collapsed into the current visible authority-tree projection. |
| 11. Bridge selected package callers | Curated selected-rule execution proved package callers can route through Habitat without direct `.habitat` script paths. |
| 12. Retire source-check as a driver | Source-check-shaped work was moved or demoted enough that it no longer owns the next plan. |
| 13. Extract mixed command checks | Mixed command-check packets were split enough to prove proof-class separation and stop treating the junk drawer as the center. |
| 14. Close triage/residual owner cleanup | Triage packets and residual owners were removed, moved, or retained honestly enough to expose the ontology problem. |
| 15. Polish authority ontology and frame | The ontology and operating frame now name Habitat, blueprint, instance, capability, niche, and proof-class separation as the governing model. |
| 16. Normalize packet role metadata | Packet paths now own semantic placement, child files use generic role names, `rule.json` keeps only non-derived execution facts, and packet `category.md` files are gone. |

This index is intentionally compressed. Completed branches matter because they
changed what the next agent should do; they are not the active plan.

## Remaining Dominoes

### 17. Select One Vertical Activation Pilot Corpus

Purpose: choose the narrow corpus that will prove Authority Activation end to
end.

Done Means:

- One pilot corpus is selected and justified against the selection rule.
- The branch records why rejected candidate corpora are too broad, too runtime
  heavy, or too weak to prove activation.
- The selected slice has a concrete current packet or authority surface to
  migrate.

Moves It Forward:

- Compare `docs-site` and `habitat/toolkit/generator` first.
- Prefer the candidate with one visible blueprint candidate, one plausible
  instance, one narrow capability, and one niche admission rule.
- Avoid MapGen runtime/product proof as the first pilot unless all smaller
  candidates fail.

Dependencies:

- Domino 16 is landed.
- Current `.habitat` authority docs are read as source, not rewritten as part
  of pilot selection.

Proof:

- A short pilot-selection record exists in the owning authority tree location.
- The selected corpus lists the existing packets, docs, and commands that will
  be touched by the next domino.
- The record names the proof classes that the pilot can and cannot exercise.

### 18. Admit One Pilot Blueprint Definition

Purpose: make one blueprint a real authority definition instead of a path label.

Done Means:

- The pilot blueprint defines the constructible kind it governs.
- It states required instance facts without designing the global schema.
- It names allowed or expected capabilities for the pilot slice.
- It identifies which existing packet metadata remains transitional.

Moves It Forward:

- Author the smallest blueprint definition needed for the selected pilot.
- Use current ontology terms exactly: blueprint, instance, capability, niche.
- Reject path-derived facts that should belong to the instance or admission
  rule.
- Keep execution adapter concerns out of blueprint authority.

Dependencies:

- Domino 17 selected a pilot with enough surface area to admit a blueprint.
- Existing `.habitat/AUTHORITY-ONTOLOGY.md` remains the conceptual source.

Proof:

- Adjacent authority docs or metadata show the blueprint as the source for the
  pilot kind.
- No broad schema is introduced beyond the facts needed by the pilot.
- Review can point to one before/after conceptual owner change.

### 19. Admit One Pilot Instance Plus One Capability

Purpose: prove that a concrete instance can declare facts and receive a
capability under the pilot blueprint.

Done Means:

- One concrete pilot instance exists as an admitted authority object.
- The instance declares the facts needed by the pilot blueprint.
- One capability attaches to the instance through an explicit allowed relation.
- Transitional rule metadata for the same facts is either demoted or marked
  for removal in Domino 22.

Moves It Forward:

- Choose the smallest instance that is already implied by the selected corpus.
- Define only the capability needed to make the pilot useful.
- Keep capability authority separate from execution implementation.
- Record any fact that is still duplicated in legacy packet metadata.

Dependencies:

- Domino 18 admitted the pilot blueprint.
- The selected corpus has one concrete authority surface that can be treated as
  an instance without inventing a fake object.

Proof:

- The instance and capability can be inspected without reading the runner.
- Capability attachment can be traced to blueprint permission and instance
  facts.
- Any duplicated transitional fact is explicitly listed for pruning.

### 20. Admit One Niche Selector Or Governance Rule

Purpose: make niche admission real for the pilot.

Done Means:

- One niche selector or governance rule admits the pilot instance by accepted
  facts.
- The rule explains what facts matter for admission and which facts do not.
- The niche stops being only a folder jurisdiction for the migrated slice.

Moves It Forward:

- Use the pilot instance facts from Domino 19.
- Keep niche governance separate from blueprint definition and capability
  attachment.
- Prefer one admission rule over a general selector framework.
- Record falsifiers that would force the pilot back to blueprint or instance
  design.

Dependencies:

- Domino 19 admitted an instance with inspectable facts.
- The selected niche is stable enough to govern one pilot slice.

Proof:

- The pilot instance can be explained as admitted, rejected, or out of scope by
  the niche rule.
- The rule does not rely on the old runner registry as authority.
- Review can identify the exact admission basis.

### 21. Build The Narrow Projection Adapter

Purpose: let execution consume the admitted pilot authority without rebuilding
the full runner.

Done Means:

- One narrow adapter projects the admitted pilot blueprint, instance,
  capability, and niche admission into the existing execution surface needed by
  the pilot.
- The adapter is explicitly an adapter, not the authority source.
- Existing selected-rule or local toolkit behavior still works for the pilot
  slice.

Moves It Forward:

- Build only the projection path needed by the pilot.
- Preserve existing compatibility paths outside the migrated slice.
- Add diagnostics that distinguish admission failure from execution failure if
  the pilot surface can exercise that distinction.
- Stop if implementation requires finalizing the full global schema.

Dependencies:

- Domino 20 admitted the pilot through one niche rule.
- There is a current execution surface worth projecting into for the pilot.

Proof:

- A focused command or local test exercises the pilot projection.
- The proof does not claim broad `habitat check` correctness.
- Failure output, if touched, names the authority layer that failed.

### 22. Prune Transitional Packet Metadata For The Migrated Slice

Purpose: remove duplicated or misleading packet metadata once the pilot
authority owns the facts.

Done Means:

- Transitional metadata for the migrated slice is removed, demoted, or fenced.
- Remaining `rule.json` metadata is limited to runner compatibility or
  documented transitional use.
- The migrated slice no longer teaches future agents that packet metadata is
  the conceptual source.

Moves It Forward:

- Start from duplicated facts listed in Dominoes 18 and 19.
- Delete facts now owned by blueprint, instance, capability, or niche authority.
- Keep only metadata still needed by the narrow projection adapter.
- Update local docs if a reader would otherwise infer the old ownership model.

Dependencies:

- Domino 21 proved the pilot projection can run from admitted authority.
- Duplicated facts have been identified before deletion.

Proof:

- Focused inspection shows migrated facts now have a single conceptual owner.
- Focused command proof still passes for the pilot slice.
- No unrelated packet cleanup is bundled into this branch.

### 23. Repeat Activation Slices

Purpose: prove the activation model across a second and third corpus before
making it the default shape.

Done Means:

- At least two additional vertical slices repeat the blueprint, instance,
  capability, niche, projection, and pruning loop.
- Differences between slices are recorded as model refinements or explicit
  rejected generalizations.
- The authority model becomes easier to apply with each slice.

Moves It Forward:

- Pick the next corpus that stresses the weakest proven part of the pilot.
- Reuse the pilot shape where it held.
- Change the model only when a second slice produces source-backed pressure.
- Keep branch layers reviewable and vertically complete.

Dependencies:

- Domino 22 completed the first migrated slice.
- The first pilot has a clear copyable pattern or named failure mode.

Proof:

- Each repeated slice has its own focused proof.
- Model changes are tied to concrete slice evidence.
- Review can compare slices without reconstructing the old packet history.

### 24. Rebuild Full-Suite Runner Discovery From Admitted Authority

Purpose: rebuild broad Habitat discovery only after authority admission has
enough real shape to discover.

Done Means:

- The broad runner discovers admitted authority rather than deriving ontology
  from packet paths.
- Default inclusion, selector behavior, diagnostics, and failure reporting use
  admitted blueprint, instance, capability, and niche facts.
- Compatibility metadata remains only for unmigrated slices or deliberate
  adapter boundaries.

Moves It Forward:

- Use repeated activation slices as the corpus for runner behavior.
- Keep selected-rule compatibility until migrated authority can replace it.
- Rebuild diagnostics around authority-layer failures.
- Retire legacy assumptions only when their migrated replacements exist.

Dependencies:

- Domino 23 proves the activation model across multiple slices.
- There is enough admitted authority to define default discovery honestly.

Proof:

- Focused runner tests cover admitted and non-admitted slices.
- Broad execution no longer fails because old registry assumptions leak into
  authority discovery.
- Review can map runner behavior back to admitted authority, not path guesses.

## Reorder/Falsifier Gates

Reorder the sequence if any of these become true:

- Pilot selection proves both `docs-site` and `habitat/toolkit/generator` are
  too weak to exercise blueprint, instance, capability, niche, and projection
  together.
- The selected pilot requires MapGen runtime/product proof before authority
  activation can be observed.
- Blueprint admission cannot be stated without first defining an instance fact
  surface.
- Instance or capability admission requires a niche governance decision first.
- The narrow projection adapter cannot be built without a full runner rebuild.
- Two branches in a row add docs or ledgers without moving, admitting, pruning,
  deleting, demoting, or proving a concrete authority surface.

Stop and reframe if the work starts treating runner labels, packet names,
categories, or current folder paths as ontology instead of transition evidence.

## Closure Contract

Every branch in this sequence must close with:

- the before/after authority state named in plain language;
- the exact domino it advances or falsifies;
- proof classes labeled honestly;
- broad `habitat check` excluded from proof unless the branch is the runner
  rebuild domino;
- stale metadata, compatibility bridges, and deferred cleanups named if they
  remain in the touched slice;
- Graphite branch and commit state clean.

The user should be able to read the branch and know what changed in the model,
what became easier next, and what still has to be knocked down.

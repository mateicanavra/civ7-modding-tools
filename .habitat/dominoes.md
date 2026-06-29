# Habitat Dominoes

Status: active sequence ledger for Habitat authority activation

This document records the next reviewable domino sequence for the Habitat
authority tree. It is governed by `.habitat/DOMINO-FRAME.md`; this ledger is
the execution-facing companion, not a replacement frame or exhaustive backlog.

## Status And Source Order

Use this source order when selecting or judging the next domino:

1. Direct user decisions and current repo instructions.
2. `.habitat/DOMINO-FRAME.md`.
3. `.habitat/AUTHORITY-ONTOLOGY.md` for blueprint, instance, capability, and
   niche concepts.
4. `.habitat/AUTHORITY-SLICE-FRAME.md` for bounded slice work.
5. Completed slice frames such as `.habitat/AUTHORITY-DOMAIN-KIND-SLICE.md`
   as precedent and evidence, not as the next active selector.
6. `.habitat/AUTHORITY.md`, `.habitat/AUTHORITY-TREE-SHAPE.md`,
   `.habitat/AUTHORITY-TOOL-SEPARATION.md`, `.habitat/ARTIFACT-KINDS.md`, and
   `.habitat/SUBJECT-CATEGORIES.md`.
7. Current `.habitat` tree shape, generic packet role files, Toolkit behavior,
   and fresh command evidence.
8. Historical branch, PR, and session context as discovery material only.

The center of gravity has moved. Package-script cleanup is not the active
driver anymore. Source-check retirement and mixed command-check extraction are
landed enough to stop driving the plan. The full-suite runner rebuild moves
later, after admitted authority exists and can project into execution.

The next regime is not another cleanup pass and not a broad corpus snapshot.
The authority model should now advance through bounded kind-family slices: pick
one known dependency pocket, move its rules toward the correct blueprint or
coarse remainder context, then re-read the changed structure before selecting
the next slice.

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

That destination is not a final global schema. It is a series of bounded
state-changing slices that teach the next slice what the current tree could not
teach before movement.

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

Avoid horizontal cleanup unless it is necessary for the active bounded slice.
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
| 16. Normalize packet role metadata | Child files use generic role names, `rule.json` stopped carrying owner-tool/detect/scope duplication, and packet `category.md` files are gone. |
| 17. Make rule manifests location independent | `rule.json` now owns stable rule identity, current placement inventory facts, explicit runner file references, and explicit artifact references; Toolkit discovery no longer depends on the packet path grammar. |
| 18. Frame bounded authority slice work | `AUTHORITY-SLICE-FRAME.md` now governs bounded kind-family slices, supersedes broad pilot-corpus selection, and sets the Recipe Kind Pocket as the first working example. |
| 19. Move the Recipe Kind Pocket | Standard-recipe evidence was physically moved into `recipe`, `recipe-stage`, `recipe-step`, `swooper-maps-standard-recipe`, and coarse `mapgen-pipeline` contexts while preserving rule IDs and execution behavior. |
| 20. Select the Domain Operation Kind Pocket | Re-reading the changed Recipe slice selected `domain-operation` and bounded strategy-file pressure as the next slice; `AUTHORITY-DOMAIN-OPERATION-SLICE.md` now specifies the implementation boundary. |
| 21. Move the Domain Operation Kind Pocket | The misplaced map projection/effect dependency guard moved into `domain-operation`; foundation strategy rows stayed contextual with consolidation pressure instead of becoming blueprints by path inheritance. |
| 22. Unnest Rule Packet Paths | Category and artifact-kind directories were removed from live packet paths, leaving location-independent manifests in flatter blueprint/context lanes. |
| 23. Split Affirmed Blueprints From Candidates | Affirmed Recipe and Domain Operation pockets moved to top-level `.habitat/blueprints/`; not-yet-affirmed niche-local blueprint-shaped inventories were renamed `_blueprints/` so they no longer visually claim blueprint authority. |
| 24. Move the Domain Kind Pocket | Domain public-surface and direct domain-root rules moved into affirmed `.habitat/blueprints/domain/`; the mixed config validator stayed contextual, and the standard-recipe tag cleanup moved to the standard-recipe context instead of becoming domain authority. |

This index is intentionally compressed. Completed branches matter because they
changed what the next agent should do; they are not the active plan.

## Remaining Dominoes

### 25. Repeat Bounded Kind-Family Slices

Purpose: continue the same method across adjacent kind families.

Done Means:

- At least two additional slices repeat the bounded state-change loop.
- Each slice starts from an identified kind family or coarse remainder context.
- Capabilities and niches are introduced only when a moved slice proves they
  are needed.

Moves It Forward:

- Builds enough admitted authority to justify projection and runner discovery.
- Keeps ontology pressure grounded in changed structure.

Dependencies:

- Domino 22 removed category/artifact-kind physical nesting.
- Domino 23 separated affirmed blueprint authority from candidate
  blueprint-shaped inventory.

Proof:

- Each slice has focused proof and leaves a clearer owner map than it started
  with.

### 26. Build Narrow Projection From Moved Authority

Purpose: let execution consume moved authority only after multiple slices give
it something honest to discover.

Done Means:

- One narrow adapter projects moved blueprint/context authority into the
  existing execution surface needed by the touched slices.
- The adapter is explicitly an adapter, not the authority source.
- Existing selected-rule or local Toolkit behavior still works for migrated and
  unmigrated slices.

Moves It Forward:

- Build only the projection path needed by moved slices.
- Preserve existing compatibility paths outside the migrated slice.
- Add diagnostics that distinguish admission failure from execution failure if
  the moved surface can exercise that distinction.
- Stop if implementation requires finalizing the full global schema.

Dependencies:

- Bounded kind-family slices have repeated enough to expose projection needs.

Proof:

- A focused command or local test exercises the slice projection.
- The proof does not claim broad `habitat check` correctness.
- Failure output, if touched, names the authority layer that failed.

### 27. Prune Transitional Packet Metadata For Moved Slices

Purpose: remove duplicated or misleading packet metadata once moved authority
owns the facts.

Done Means:

- Transitional metadata for moved slices is removed, demoted, or fenced.
- Remaining `rule.json` metadata is limited to runner compatibility or
  documented transitional use.
- The moved slice no longer teaches future agents that packet metadata is
  the conceptual source.

Moves It Forward:

- Start from duplicated facts exposed during bounded movement.
- Delete facts now owned by blueprint, instance, capability, or niche authority.
- Keep only metadata still needed by the narrow projection adapter.
- Update local docs if a reader would otherwise infer the old ownership model.

Dependencies:

- Narrow projection from moved authority has proved the projection can run.
- Duplicated facts have been identified before deletion.

Proof:

- Focused inspection shows migrated facts now have a single conceptual owner.
- Focused command proof still passes for moved slices.
- No unrelated packet cleanup is bundled into this branch.

### 28. Repeat Activation Slices

Purpose: prove the activation model across a second and third corpus before
making it the default shape.

Done Means:

- At least two additional bounded kind-family slices repeat the movement,
  projection, and pruning loop.
- Differences between slices are recorded as model refinements or explicit
  rejected generalizations.
- The authority model becomes easier to apply with each slice.

Moves It Forward:

- Pick the next corpus that stresses the weakest proven part of the pilot.
- Reuse the pilot shape where it held.
- Change the model only when a second slice produces source-backed pressure.
- Keep branch layers reviewable and vertically complete.

Dependencies:

- Transitional packet metadata has been pruned for moved slices.
- The first moved slices have a clear copyable pattern or named failure mode.

Proof:

- Each repeated slice has its own focused proof.
- Model changes are tied to concrete slice evidence.
- Review can compare slices without reconstructing the old packet history.

### 29. Rebuild Full-Suite Runner Discovery From Admitted Authority

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

- Repeated activation slices prove the activation model across multiple slices.
- There is enough admitted authority to define default discovery honestly.

Proof:

- Focused runner tests cover admitted and non-admitted slices.
- Broad execution no longer fails because old registry assumptions leak into
  authority discovery.
- Review can map runner behavior back to admitted authority, not path guesses.

## Reorder/Falsifier Gates

Reorder the sequence if any of these become true:

- A future bounded pocket cannot place most current evidence under a small set
  of kind blueprints or one coarse transitional context without inventing a
  broad replacement taxonomy.
- A bounded slice creates more new capability or niche buckets than
  blueprint-owned rules.
- A named variant such as `standard recipe` has to be treated as a blueprint
  for the slice to proceed.
- A slice requires MapGen runtime/product proof before authority movement can
  be observed.
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

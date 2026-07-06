# Authority Consolidation Layer 3 Scratchpad

Status: active steward scratchpad

Built: 2026-07-01

Owner: Habitat authority-tree workstream steward

Operational ledger: `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json`

## Authority Model

This scratchpad is a working frame, not a new source of operational truth.
Use three separate authority tracks:

Intent and concept authority:

1. Direct user decisions and current repo instructions.
2. `.habitat/.active/dominoes/README.md`.
3. `.habitat/AUTHORITY-ONTOLOGY.md`.
4. Active `.habitat/.active/frames/*.md` and canonical `.habitat/.active/frames/*.md`
   when a domino names them.

Operational selection authority:

1. `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json`.
2. Current live `.habitat/**/rule.json` manifests and support files.
3. Current generated execution-surface maps when a slice changes execution
   surface state.

Proof and history evidence:

1. Fresh disk and command evidence.
2. Current Git and Graphite stack state.
3. Committed branch history and receipts.
4. Session transcript and prior takeover notes as discovery material only.

Observed means read from current repo, transcript extraction, or Git state.
Inferred means the steward interpretation that makes the next action coherent.

## Frame

### What We Are Doing

Observed: the Habitat initiative has moved from gathering and sorting rule
packets toward Authority Activation. The current work is the latter half of
that initiative: sort all Habitat Authority content for Civilization 7, retire
false authority, consolidate duplicate or proxy rules, and begin encoding the
remaining true authority in the owning layer.

Inferred: Layer 3 is the point where the long classification and decision work
becomes implementation pressure. We are no longer asking what every rule might
mean in the abstract. We are deleting, consolidating, admitting, or moving one
trusted slice at a time, then forcing code and authority records to agree with
the slice.

### In Scope

- Stewarding the Habitat Authority tree for Civilization 7.
- Preserving the ontology distinction between blueprint, instance, capability,
  niche, remainder, rule packet, native rail, and proof class.
- Closing Layer 3 slices only from current implementation-ready rows in the
  canonical ledger.
- Updating rule packets, generated execution-surface maps, receipts, and the
  ledger only when the active slice requires it.
- Keeping transcript and branch history as evidence, not authority.

### Foreground

- Full parity between live rule manifests and canonical ledger rows.
- Honest ownership: a rule stays live only when the current predicate is
  intended, source-backed, and owned by the correct authority layer.
- State-space reduction: delete retired literals, consolidate duplicate proxy
  rules, invert boundaries into native rails, or admit positive authority where
  source backing exists.
- One authority-state mutation slice at a time.
- Re-read after every slice, because each slice changes what the next one can
  safely mean.

### Exterior

- Generic stage-kind sidecars.
- Generic Habitat domain-operation promotion from local Ecology or Foundation
  proxy rules.
- Morphology-local owner reshuffles that do not solve source ownership.
- Workspace hygiene cleanup as semantic remediation.
- Repo-wide ontology redesign not required by the current Layer 3 row.
- Duplicating the canonical JSON queue in Markdown.

### Hard Core

1. Habitat is the repo-local authority plane, not a folder of checks.
2. Blueprint authority applies to every instance of a constructible kind.
3. Context rules are allowed to remain context rules when they honestly govern
   current context state.
4. Negative proxy rules should be deleted, consolidated, inverted, or encoded
   in native owner rails instead of being preserved as live law by inertia.
5. Layer 3 implementation starts only from a current ledger warrant and closes
   only with proof, record updates, and a clean Graphite story.

### Falsifier

This frame is wrong if the next implementation slice can only be justified by
this scratchpad rather than by the canonical ledger plus source evidence. It is
also wrong if a completed slice leaves live manifest count, ledger count,
generated execution-surface maps, or proof records out of parity.

Pre-mutation falsifiers:

- the selected slice is not current in the canonical ledger;
- `gateState`, `slices[]`, and per-rule readiness disagree and the steward
  proceeds without reconciling them;
- a blocked row is smuggled into implementation through narrative momentum;
- source-owner proof is missing or only inferred from Habitat path labels;
- proof classes collapse into one green check;
- config-facade, helper-surface, tag/effect, generated-zone, or
  domain-operation work requires generic Habitat authority that the ledger
  explicitly rejected.

### Structural Alternative Rejected

Alternative: treat the takeover transcript and Git stack as the workstream
authority, then continue the apparent momentum.

Rejection: the long session is heavily compacted, and the stack includes many
valid but superseded local judgments. The transcript and commits are evidence
for timeline and intent. They cannot authorize mutation without the current
authority order, live tree, and ledger warrant.

Alternative: run a broad new content audit before more implementation.

Rejection: Layer 1 and Layer 2 already created the corpus and semantic decision
surface. Broad audit now would blur the Layer 3 entry gate. The right move is
bounded implementation plus re-read after each closed slice.

## Timeline

Observed: the takeover session `019f17a0-03f1-7092-a296-65af14330754` was a
long-running takeover of earlier session `019f0fa1-61d1-7cd0-962a-77249b3e0de4`.
The first takeover prompt asked the agent to start from latest messages, work
backward through dominoes, understand the current objective, and write a frame
for systematic continuation.

Observed: the early takeover product was
`.habitat/.active/frames/POST-DEPENDENCY-TAG-POSITION-FRAME.md`. That frame treated
Domino 39 as a position decision after dependency-tag admission, not as
automatic permission to gather every artifact-looking rule.

Observed: the user then asked for a first-principles next-domino investigation:
evaluate `_blueprints` untangling, blueprint destinations, niches, cleanup,
metrics over vibe, and the tradeoff between small staging steps and a larger
simplification move.

Observed: the answer measured the live tree instead of trusting labels: 126
rules, 26 in affirmed `.habitat/blueprints`, 33 under `_blueprints`, 32 under
`_remainder`, no explicit manifest kind field, and no non-empty baselines. It
recommended targeted `_blueprints` pruning before artifact gathering.

Observed: the next regime pruned false blueprint pockets and corrected lanes:
Studio `_blueprints` moved into operating niches, standard-recipe stage context
was sorted, artifact was affirmed as a blueprint kind without absorbing
label-affinity rows, SDK/core/visualization false blueprint pockets were
demoted, SDK taxonomy was corrected, and the stale map-output niche was closed.

Observed: the work then moved through rule remediation:
Layer 1 produced the canonical action matrix; Layer 2 produced semantic
decision packets and then a corrective re-audit when the user challenged
stage-kind and generic domain-operation trust. The corrected Layer 2 gate
reopened unsafe rows, rejected stage-kind sidecars, rejected generic
domain-operation promotion from local proxy rules, and left a smaller set of
trusted Layer 3 candidates.

Observed: the current Layer 3 entry began with retired literal deletion. The
completed slice deleted three obsolete literal rule packets and updated the
canonical ledger plus generated execution-surface maps.

Observed: later dominoes changed the selector state after the first clean
Layer 3 run. Domino 82 recorded that the clean cascade had exhausted
high-confidence implementation slices. Domino 88 re-read the residual queue and
confirmed no clean residual Layer 3 slice at that point. Domino 92 then reopened
26 local-proxy rows because local repeated-kind special cases needed broader
architecture/source-owner review before local admission.

Observed: that reopening paired `prohibit_foundation_duplicate_math_helper_redefinitions`
with `prohibit_runtime_helper_redeclarations` as a broader MapGen helper-surface
consolidation candidate, and repopulated the canonical Layer 2 / Layer 3 queue
inside the JSON ledger.

Inferred: the momentum now points at implementation slices that remove false
local authority by widening into source-backed owners or by deleting rules made
obsolete by source truth. The intended payoff is to lay down the required
ontology and force the codebase and Habitat authority tree to align with it.

## Ontology

Habitat: the repository-local authority plane that defines, discovers,
validates, repairs, generates, and governs repo structure.

Blueprint: a normative constructible kind. It applies to every admitted
instance of that kind and cannot be created from a path label alone.

Instance: a concrete repo thing admitted under one primary blueprint through
accepted instance facts.

Capability: authority that attaches to an admitted instance when the blueprint
allows it and the instance facts satisfy the requirement.

Niche: governed space and admission context. Niche nesting is containment, not
type inheritance.

Remainder: a staged, reviewed holding state for rules that are not final
authority as whole predicates. Remainder is not garbage by default; it is
pressure waiting for split, deletion, consolidation, inversion, or owner proof.

Rule packet: the current transitional Habitat unit containing a stable rule
identity, manifest, pattern or checker, baseline, and support references.
Location-independent manifests mean movement does not change rule identity.

Native rail: a source-owned enforcement or validation surface outside generic
Habitat packet law, such as package API, compiler/registry validation, build
graph proof, or source verifier.

Proof class: the label for what evidence proves. Static validation, Habitat
classify/check, selected-rule proof, generated-map parity, runtime proof,
native build proof, Graphite commit state, PR state, and product proof are
separate claims.

## Current State

Observed: the active worktree is
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame`.

Observed: this branch is `codex/habitat-layer3-takeover-frame`, stacked on
`codex/habitat-layer2-packet-cascade`.

Observed: the downstack branch `codex/habitat-layer2-packet-cascade` now
contains `84420e9d3 fix(habitat): retire runtime projection literal guards`.
That slice deleted:

- `prohibit_hydrology_runtime_continent_step_tokens`
- `prohibit_map_morphology_legacy_plate_driver_dependencies`
- `prohibit_runtime_continent_contract_tokens`

Observed: current parity proof after that commit shows 109 live `rule.json`
manifests and 109 active `rules[]` ledger rows. The three deleted IDs are
absent from live manifests and active ledger rows, and remain in closed
slices/findings plus retired-rule history.

Observed: the ledger gate says:

- current layer: `Layer 3 retired literal deletion slice complete.`
- next legal action: select the next trusted Layer 3 slice from the canonical
  ledger.

Observed: the same gate text still carries stale candidate language around
config-facade consolidation, while `slices[]` now contains
`mapgen-helper-surface-authority-consolidation` as the implementation-ready
slice with a Layer 3 entry warrant. Treat that as a selector reconciliation
requirement before mutation, not as permission to choose from prose.

Inferred: the ledger's `sourceCommit` field records the entry/source commit for
the slice, while Git HEAD records the closed slice. Use current Git state plus
the ledger gate, not that field alone, when resuming.

## Dominoes

Synthesis: Dominoes 1-17 reduced the problem from scattered repo policy into a
location-independent Habitat authority tree. That made physical movement
possible without changing rule identity.

Synthesis: Dominoes 18-23 reduced broad ontology uncertainty into bounded
authority-slice work. Recipe and domain-operation pockets moved,
categories/operation-kind path buckets were removed, and affirmed blueprints
were separated from candidates. That made candidate false authority visible.

Synthesis: Dominoes 24-39 reduced parent-lane and remainder confusion. Domain,
foundation, hydrology, ecology, standard-recipe, pipeline, mod-map,
projection/placement, and dependency-tag slices sorted whole-rule fit from
label affinity. That made destination simplification mechanical.

Synthesis: Dominoes 40-45 reduced false blueprint pressure. Studio candidates
were sorted into operating niches, artifact was affirmed without absorbing
unrelated rows, SDK/core/visualization were demoted to honest package lanes,
and map-output was closed. That made cleanup and consolidation more
trustworthy.

Synthesis: Dominoes 47-52 reduced remaining Civ7 candidate and remainder pressure.
Resources/platform candidates moved into operating lanes, mixed Civ7 remainder
rules were atomized, foundation duplicate/remainder rules were consolidated,
clean garbage residue was retired, and domain-operation-strategy authority was
admitted without moving local proxy rules. That made Layer 1 and Layer 2
remediation possible.

Synthesis: Dominoes 82-92 are the correction train that matters for the
current selector. The cascade stop gate prevented opportunistic mutation after
clean slices ran out. The residual reread prevented stale blockers from being
reprocessed. The local-proxy reopen converted previously local admissions into
broader source-owner questions, especially helper-surface consolidation.

Synthesis: Layer 1 reduced the live rule corpus into one action matrix. Layer 2
reduced action rows into semantic decisions, blocked rows, and
implementation-ready slices. The corrective Layer 2 re-audit reduced over-trust
by reopening rows that depended on stage-kind, generic domain-operation, or
local proxy claims not backed by source owners.

Observed: current Layer 3 reduced the live corpus by deleting three retired
literal rule packets. That made the next selector cleaner: remaining candidates
should be about consolidation or native-owner rails, not preserving dead
vocabulary.

## Staged Operating Model

This is the formation path for taking the execution seat. Do not skip straight
to editing.

Stage 0: selector reconciliation.
Read `gateState`, `slices[]`, `rules[]`, `blockers[]`, `findings[]`, live
manifests, and the current Graphite stack. Resolve disagreement before
mutation. Today, `gateState.nextSliceId` is null while `slices[]` contains one
implementation-ready slice with a Layer 3 entry warrant:
`mapgen-helper-surface-authority-consolidation`.

Stage 1: context build for one candidate.
Read the selected slice receipt, selected rule packets, excluded adjacent rows,
owning source/docs, and generated execution-surface impact. The output is a
single candidate context, not a refreshed global audit.

Stage 2: skill and source-owner build.
Load the workstream and repo-local Habitat skills first. Add architecture,
product, operational-debugging, Graphite, or other source-owner lenses only
where the selected slice touches those owners. The skill set is part of the
slice warrant, not background decoration.

Stage 3: slice micro-frame.
Before edits, write or confirm selected rules, excluded rows, objective, write
set, source owner, proof classes, proof limits, record targets, and actions not
authorized. A slice without this micro-frame is not in Layer 3.

Stage 4: execute one slice.
Mutate only the declared write set. Parallel agents may inspect proof or source
ownership, but no parallel mutation is allowed across `.habitat`, the ledger,
generated maps, baselines, receipts, or rule packets unless disjointness is
proven.

Stage 5: prove, review, and record.
Run focused checks for the selected slice, manifest/ledger parity when rules
move or disappear, support-path proof, `bun habitat classify .habitat`,
`git diff --check`, and any native owner proof named in the micro-frame.
Independent review is a phase gate, not an afterthought.

Stage 6: close and look around the corner.
Update required records, commit through Graphite, re-read the selector, and
identify what the closed slice made mechanical, stale, blocked, or newly
reachable. No next slice inherits authority from the previous slice without
this reread.

## Layer 3 Ahead

Layer 3 means implementation after Layer 1 action classification and Layer 2
source-owner adjudication.

Observed: the current operational selector is not "pick whatever looks next
from this scratchpad." The JSON gate says to select the next trusted Layer 3
slice, and the live `slices[]` set currently contains
`mapgen-helper-surface-authority-consolidation` as the implementation-ready
slice with a Layer 3 entry warrant. That is the current execution entry unless
the steward explicitly reconciles and re-warrants a different slice in the
ledger.

Observed: config-facade consolidation is a near-ready per-rule candidate for
`prohibit_foundation_op_contract_config_bags` inside the corrected
domain-operation packet. It is not the current top-level selected Layer 3 slice
unless the selector is updated. It may collapse one local op-contract
config-facade proxy; it does not authorize generic config-bag cleanup.

Inferred: after helper-surface consolidation, the strongest strategic shapes
are likely source-owned rails that absorb false local proxy authority:
registered dependency/effect tag-family validation, generated-zone/resource
package authority, deterministic authored-generation and adapter capability,
domain-operation source structure, and tightly scoped config-facade
consolidation. Each needs a current ledger warrant before mutation.

Blocked rows stay blocked until the source owner exists. In particular, do not
implement:

- generic stage-kind sidecars;
- generic domain-operation promotion from local Ecology/Foundation proxy rules;
- morphology-local reshuffles for overlay/story ownership;
- workspace hygiene cleanup as semantic remediation.

## Team Protocol

The main steward owns synthesis, slice selection, file edits, record updates,
Graphite commits, and final claims. Accountability is singular.

Read-only lane agents may audit source ownership, stale-state leaks, generated
map parity, or proof sufficiency. Their output is evidence for the steward, not
authorization to mutate the authority tree.

Reviewer agents should be used before closing material slices. Their review
contract is narrow:

- stale state leaks;
- row coverage and excluded-adjacent-row sufficiency;
- proof-class overclaiming;
- source-owner gaps;
- generated execution-surface parity.

No agent should run broad mutation in parallel unless the write sets are proven
disjoint across `.habitat`, the canonical ledger, generated execution maps,
domino receipts, baselines, and rule packets.

## Dependency Shapes To Expect

This section is not a queue. The only active queue is the canonical JSON
ledger. These are the shapes to expect after the selector chooses a legal
Layer 3 slice.

Completed shape: retired literal deletion.
Reduction: three obsolete live rule packets were removed and retained only as
retired/historical records. Mechanical consequence: live rule and ledger counts
now match at 109.

Current ledger-selected shape: helper-surface authority consolidation.
Reduction sought: widen exact-equivalent helper redeclaration protection into
the source-backed MapGen helper surface, while explicitly excluding byte/int8,
vector, Hydrology transform, Ecology bandpass, Resources hash, and other
semantically distinct helper families. Mechanical consequence expected: false
Foundation-local helper authority collapses into a broader source-owned helper
surface without inventing a shared-utils blueprint.

Near-ready candidate shape: config-facade consolidation.
Reduction sought: collapse the `prohibit_foundation_op_contract_config_bags`
op-contract proxy into the trusted config-facade rail. Explicitly excluded:
`prohibit_foundation_step_contract_config_bags`, morphology config-bag rows,
and blocked domain-operation source-owner rows.

Strategic source-owned shapes: tag/effect registry, generated-zone/resource
package authority, deterministic authored-generation, adapter capability, and
domain-operation source structure. Reduction sought: move recurring local proxy
rules into native owners where source already defines the surface. These are
not current mutation authorization without a ledger warrant.

Blocked source-owner design shape: rows that need an owner before they can be
implemented. Reduction sought: design or admit missing owners only when source
evidence proves the authority belongs there.

## Maintenance Notes

Update this scratchpad only when the working frame changes: a new Layer 3 slice
closes, a blocker becomes implementation-ready, a source-owner decision changes
the next-domino order, or the authority order itself changes.

Do not copy the active queue here. The canonical operational queue remains in
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json`.

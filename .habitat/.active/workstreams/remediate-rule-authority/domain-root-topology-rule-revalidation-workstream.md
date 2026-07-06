# Domain-Root Topology Rule Revalidation Workstream

Status: active workstream plan

Purpose:
run the first post-ratchet rule revalidation cascade after the Domain-Root
Topology ratchet. This document instantiates
`.habitat/.active/frames/POST-RATCHET-RULE-REVALIDATION-FRAME.md` for the
completed domain-root topology descent and defines the containers, lane agents,
tooling, proof gates, deletion stage, review stage, and handoff boundary needed
before any rule mutation begins.

This is a planning and execution-control document. It does not authorize rule
deletion, runner edits, baseline mutation, source movement, or implementation by
itself.

## Controlling Frame

The reusable method component is:

```text
.habitat/.active/frames/POST-RATCHET-RULE-REVALIDATION-FRAME.md
```

The action vocabulary is owned by:

```text
.habitat/.active/frames/RULE-ACTION-CLASSIFICATION-FRAME.md
```

Deep semantic decisions, when needed, are owned by:

```text
.habitat/.active/frames/RULE-DECISION-PACKET-FRAME.md
```

Later mutation slices, when accepted, are owned by:

```text
.habitat/.active/frames/RULE-REMEDIATION-SLICE-FRAME.md
```

The corpus grounding note is:

```text
.habitat/.active/workstreams/remediate-rule-authority/rule-authority-corpus-grounding.md
```

The active machine-readable ledger is:

```text
.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json
```

The earlier instance draft is retained as prework input, not as the active
execution controller:

```text
.habitat/.active/workstreams/remediate-rule-authority/domain-root-topology-rule-revalidation-workstream-draft.md
```

## Ratchet Event

Name: Domain-Root Topology Ratchet

Closure premise:
domain/root/topology consolidation was finalized and enforced. The descent
ratcheted current positive law into Habitat. The first cleanup pass reviews
rules in the blast radius of that ratchet and determines which are now
superseded, residual, owner-shifted, out of scope, or ready for deletion proof.

Ratcheted authority surfaces:

- `require_domain_source_topology`
- `require_domain_ops_binding_surface`
- `require_domain_ops_registry_surface`
- `require_domain_operation_contract_file_shape`

Contextual neighbor surfaces:

- `require_domain_model_schema_policy_owner_shape`
- `require_artifact_file_shape`
- `require_artifact_index_aggregate_shape`
- `require_recipe_stage_authoring_file_shape`

The neighbor surfaces are not automatic inputs. Admit them only when current
manifest, selector, pattern, baseline, source, or command evidence ties the rule
to domain-root topology or domain operation surfaces.

## Workstream Hard Core

1. This is a post-ratchet revalidation pass, not a general all-rule audit.
2. Admission is evidence-bound; source path overlap alone never admits a rule.
3. One fresh lane agent is assigned one lane of candidate rules at a time.
4. Groups reduce coordination cost; they do not hide row-level obligations.
5. NARSIL is a major discovery and code-intelligence component, not an
   authority substitute.
6. Deletion is a formal stage with old-shape proof, recurrence-risk judgment,
   and review before mutation.
7. The DRA owner keeps synthesis, authority calls, Graphite state, review
   disposition, and closure claims.
8. Implementation and review agents are fresh teams and are never reused across
   those roles.

## Exterior

Out of frame for this workstream:

- broad cleanup of every Habitat rule;
- cosmetic relabeling;
- rule runner rewrites;
- baseline growth;
- generated-output currentness repair unless a separable domain-root topology
  clause is admitted;
- source movement;
- package, Studio, runtime, docs, Nx, or generated-output rails that do not
  carry a domain-root topology or domain operation-surface clause;
- mutation before reviewed dispositions and slice readiness exist.

## Admission Tests

Admit a rule into this workstream only if at least one test is true:

1. The rule id, manifest, pattern, baseline, or evidence record references a
   domain-root topology surface: domain root, retired domain catalog, domain
   source topology, domain operation root, root facade, domain source import, or
   operation-surface topology.
2. The rule's source scope overlaps files governed by the completed descent and
   the rule's selector, manifest, pattern, baseline, or current evidence names
   one of the topology surfaces above. Source path overlap alone is not enough.
3. Current manifest, pattern, baseline, source, or command evidence confirms a
   transitional containment concern that the ratcheted domain-root topology
   authority may now absorb. Historical rationale alone is not admission
   evidence.
4. Static source inspection shows the rule can fire only because of shapes now
   owned by the ratcheted topology authority.

If none are true, the per-rule record is `out of scope`.

Native-rail-only rules are not admitted to this semantic pass. A runtime,
generated-output, Studio, package, docs, Nx, or build rule enters only when it
has a separable domain-root topology or domain operation-surface clause; the
native-rail portion is recorded as an exterior dependency or split boundary.

## Skill And Frame Activation

Use these skills and frames by stage:

| Stage | Activate | Purpose |
| --- | --- | --- |
| Orientation | repo-local `civ7-habitat-dra-workstream`; `habitat:systematic-workstream` | Authority order, corpus-before-execution, DRA ownership. |
| Agent prompts | `cognition:prompt-design` | Stateless lane prompts, explicit return contracts, adversarial review prompts. |
| Revalidation method | `POST-RATCHET-RULE-REVALIDATION-FRAME.md` | Per-rule scope and action decision. |
| Action vocabulary | `RULE-ACTION-CLASSIFICATION-FRAME.md` | Exact `actionDecision` values. |
| Deep semantics | `RULE-DECISION-PACKET-FRAME.md` | Clause decomposition when compact records are not enough. |
| Mutation handoff | `RULE-REMEDIATION-SLICE-FRAME.md` | Later implementation readiness, not this document's current scope. |

## Tooling Model

Use tools in this order. Each tool answers a different question.

### 1. Freshness And Corpus Truth

Use shell, `jq`, `find`, and Habitat to prove the current corpus and branch
state:

```bash
git status --short --branch
gt log short
find .habitat -path '*/rule.json' -print | sort
jq -r '.rules[]?.ruleId' .habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json | sort
```

Question answered:
what live rule corpus and ledger are being reviewed?

### 2. Ratchet Authority Reconfirmation

Before any per-rule lane begins, rerun:

```bash
bun habitat check --json --rule require_domain_source_topology
bun habitat check --json --rule require_domain_ops_binding_surface
bun habitat check --json --rule require_domain_ops_registry_surface
bun habitat check --json --rule require_domain_operation_contract_file_shape
bun habitat classify mods/mod-swooper-maps/src/domain
```

Question answered:
is the absorbing authority live in the current tree?

### 3. NARSIL Code Intelligence

NARSIL is used for code/reference discovery and source-surface tracing. Use the
available `mcp__narsil_code_intel_civ7` tools, especially:

- `validate_repo` for repository validation when the worktree changes;
- `search_chunks` for semantic source and rule-surface search;
- `get_chunks` for AST-aware context around a candidate file;
- `get_dependencies` for import and imported-by evidence;
- `get_code_graph` for import, symbol, or hybrid graph shape when a lane needs
  adjacency evidence;
- `get_chunk_stats` and embedding stats only as index-health diagnostics.

Recommended NARSIL discovery questions:

```text
search_chunks(repo="civ7-modding-tools",
  query="<rule id> <old shape> <absorbing authority>")

search_chunks(repo="civ7-modding-tools",
  query="domain source topology ops binding registry contract root facade")

get_dependencies(repo="civ7-modding-tools",
  path="<candidate source file>",
  direction="both")

get_chunks(repo="civ7-modding-tools",
  path="<candidate source file>",
  include_imports=true)

get_code_graph(repo="civ7-modding-tools",
  view="import",
  depth=2)
```

Question answered:
what source imports, symbols, references, or adjacency patterns might explain
overlap, absorption, residual risk, or false ownership?

NARSIL results are hypotheses until cross-checked against current files and
commands.

### 4. Current-File Cross-Check

Every NARSIL lead must be confirmed with current disk evidence:

```bash
jq '.id,.placement,.operation,.runner,.scanRoots,.supportFiles,.pathCoverage' <rule.json>
jq -r '.rules[] | select(.ruleId=="<rule-id>")' .habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json
rg -n "<old-shape|surface|symbol|import>" <current path>
bun habitat check --json --rule <candidate-rule-id>
bun habitat check --json --rule <absorbing-rule-id>
bun habitat classify <candidate source path>
git log --oneline -- <path>
```

Question answered:
does current repo evidence support the proposed admission or disposition?

In the `jq` command above, `.operation` is the Habitat rule manifest operation
field, not a MapGen domain operation surface.

Git history may explain why a shape existed. It does not override current
manifests, baselines, pattern files, source, ledger rows, or fresh Habitat
output.

## Proof Classes

Use these proof classes in per-rule records and synthesis.

| Claim | Required proof |
| --- | --- |
| Admission | Current manifest, pattern, baseline, source, or command evidence ties the rule to a ratcheted surface. |
| Out of scope | A failed admission criterion or exterior owner surface is named against current evidence. |
| Absorption | A ratcheted rule or directly connected owner surface catches the old shape at an equal or stronger owner layer. |
| Retention | Concrete residual risk remains, owner layer is correct, and proof class is named. |
| Split | Live clauses have distinct owners, proof classes, or enforcement surfaces. |
| Inversion | A negative guard should become positive authority, closed structure, or boundary authority; deletion waits until that authority exists and is proven. |
| Deletion | Old shape, absorber or retirement rationale, recurrence-risk judgment, live-reference reconciliation, and review acceptance. |

Green `bun habitat check` output proves `Habitat wrapper behavior` for that rule.
It does not by itself prove injected-violation behavior, absorption, absence, or
safe deletion.

## Agent Team Model

The DRA owner manages the workstream and writes synthesis. Agents provide bounded
evidence and records only.

### Analysis Team

Use fresh read-only lane agents. Each agent receives:

- this workstream document;
- the post-ratchet frame;
- the rule-action classification frame;
- the grounding note;
- the active ledger;
- only its lane definition and candidate rule set.

Each analysis agent returns one compact record per reviewed rule using the
post-ratchet output format:

```text
rule:
scope:
actionDecision:
rationale:
evidence:
ownerLayer:
falseOwner:
residualRisk:
absorber:
oldShape:
dependency:
proofClass:
proof:
decisionPacketNeeded:
falsifier:
```

Agents may use NARSIL, `rg`, `jq`, direct reads, and focused Habitat commands.
They do not edit files.

### Deletion Proof Team

Use fresh deletion-proof agents only after DRA synthesis accepts a deletion
candidate. They prove deletion readiness; they do not delete.

### Review Team

Use a fresh review team after synthesis and deletion proof. Review agents are
not reused from analysis or deletion proof.

### Later Implementation Team

Use fresh implementation agents only in a later remediation slice. They consume
reviewed decisions and the slice frame.

## Lane Categories

The pre-filter assigns one lane agent per category after the ratchet anchor is
confirmed. Candidate lists below are selectors for admission work, not final
rule sets.

### Lane 0. Ratchet Anchor And Absorber Map

Purpose:
validate the live absorbing authority before dependent rules classify against
it.

Primary surfaces:

- `require_domain_source_topology`
- `require_domain_ops_binding_surface`
- `require_domain_ops_registry_surface`
- `require_domain_operation_contract_file_shape`

Conditional neighbor surfaces:

- `require_domain_model_schema_policy_owner_shape`
- `require_artifact_file_shape`
- `require_artifact_index_aggregate_shape`
- `require_recipe_stage_authoring_file_shape`

Output:
absorber map naming which old shapes each ratcheted surface can catch and which
old shapes remain outside its proof.

Run first because deletion-oriented `consolidation/dedup` records require a
named absorber and old shape.

### Lane 1. Retired Domain-Root Layout Guards

Purpose:
review rules about retired domain-root layouts potentially absorbed by
`require_domain_source_topology`.

Candidate selectors:

- `.habitat/blueprints/domain/*`
- ids containing `retired_domain_root`, `domain_artifacts_modules`,
  `domain_entrypoint`, or `unknown_bag_config`;
- source evidence involving domain root `tags.ts`, root `artifacts.ts`, root
  `model`, root `artifacts`, or root `ops.ts` shapes.

Likely action decisions:
`consolidation/dedup`, `retirement/garbage collection`,
`closed structure inversion`, `no action`.

Deletion potential:
high, especially where old root catalog or retired layout shapes are now
deterministically unreachable or absorbed.

### Lane 2. Domain Operation Surface Law

Purpose:
review rules governing root `ops.ts`, `ops/index.ts`, domain operation root
directories, and `ops/<operation>/contract.ts` after the operation-surface
ratchet.

Candidate selectors:

- `.habitat/blueprints/domain-operation/*`
- ids containing `domain_ops`, `cross_op`, `root_config_facade`,
  `operation_contract`, or `ops_root`;
- domain-local proxies whose evidence names domain operation topology, such as
  config-bag, canonical operation module topology, or operation-contract quality
  rules.

Likely action decisions:
`consolidation/dedup`, `boundary inversion`, `closed structure inversion`,
`split by owner`, `runtime/source validation`.

Deletion potential:
high where negative root-facade, contract-bag, or legacy operation-surface
guards are fully replaced by the ratcheted operation surface.

### Lane 3. Public Domain Import Boundaries

Purpose:
review rules about who may import public domain roots, domain operation bundles,
contract roots, model schemas, model policy, and MapGen artifact surfaces.

Candidate selectors:

- `require_public_domain_surfaces_in_recipes_and_maps`
- `require_public_domain_surfaces_in_tests`
- `require_domain_contract_roots_in_step_contracts`
- `require_runtime_domain_op_bundle_imports`
- `prohibit_recipe_imports_in_domain_source`
- `require_morphology_public_surface_imports`
- imports of `@mapgen/domain/*`;
- relative reaches into `mods/mod-swooper-maps/src/domain`.

Likely action decisions:
`boundary inversion`, `consolidation/dedup`, `split by owner`, `no action`.

Deletion potential:
moderate. Many import rules may remain durable boundary rails even after
topology ratchet.

### Lane 4. MapGen Artifact Owner Surfaces

Purpose:
review MapGen artifact file shape, aggregate exports, tag names, contract
surfaces, and old alias/catalog concerns touched by the ratchet.

Candidate selectors:

- `.habitat/blueprints/artifact/*`
- `require_artifact_file_shape`
- `require_artifact_index_aggregate_shape`
- `prohibit_realized_map_artifact_tags`
- domain `artifacts/*.artifact.ts`
- recipe rules naming MapGen artifact contracts or tags.

Likely action decisions:
`consolidation/dedup`, `retirement/garbage collection`,
`positive authority creation`, `runtime/source validation`.

Deletion potential:
moderate to high for old alias/tag checks, but only after separating MapGen
artifact source shape from generated-output proof.

### Lane 5. Recipe Stage Authoring Surface

Purpose:
review rules potentially absorbed by `require_recipe_stage_authoring_file_shape`
or adjacent recipe-stage public authoring authority.

Candidate selectors:

- `.habitat/blueprints/recipe-stage/*`
- `require_recipe_stage_authoring_file_shape`
- `prohibit_wrapper_only_advanced_config`
- `prohibit_foundation_stage_cast_merge_hacks`
- `prohibit_foundation_stage_sentinel_passthrough`
- `prohibit_foundation_step_contract_config_bags`
- `verify_standard_recipe_public_authoring_surface`
- `mods/mod-swooper-maps/src/recipes/standard/stages/**`.

Likely action decisions:
`boundary inversion`, `closed structure inversion`, `split by owner`,
`consolidation/dedup`, `retirement/garbage collection`.

Deletion potential:
high where wrapper-only, sentinel, cast-merge, or config-bag residue is now
covered by positive recipe-stage authoring shape.

### Lane 6. Source-Domain Residuals

Purpose:
review source-domain-specific rules whose paths overlap the ratchet area but
whose semantics may belong to Foundation, Hydrology, Morphology, Resources, or
Ecology recurrence law rather than domain-root topology.

Candidate selectors:

- `.habitat/civ7/mapgen/domains/*/rules/*`
- ids containing `legacy`, `config`, `contract`, `public_surface`,
  `op_module_topology`, `decomposed_ops`, or `aggregate`.

Likely action decisions:
`out of scope`, `context admission`, `no action`, `split by owner`,
`retirement/garbage collection`.

Lane obligation:
reject path-only admission and preserve source-domain owner distinctions.

Deletion potential:
low to moderate. Some retired-shape rows may delete, but many recurrence guards are
domain-specific live law.

### Lane 7. Runtime And Generated-Output Exclusion Guard

Purpose:
prevent runtime, generated-output, Studio, docs, package validation, Nx, or
currentness rails from being pulled into this semantic pass without a separable
domain-root topology clause.

Candidate selectors:

- ids or evidence containing `runtime`, `generated`, `dist`, `currentness`,
  `Studio`, `Nx`, `package`, `docs`, `adapter`, or `build`.

Likely action decisions:
`out of scope` for native-rail-only rows. Use `runtime/source validation` inside
this workstream only for an admitted separable domain-root topology or domain
operation-surface clause whose remaining proof belongs to a native rail.

Run early in parallel with the ratchet anchor so the pre-filter does not admit
native-rail work by broad adjacency.

## Cascade Containers

The workstream runs as nested containers. Each container has one output that
feeds the next.

```text
0. Orientation and authority seal
  1. Corpus coverage and pre-filter
    2. Lane batching
      3. Per-rule lane analysis
        4. DRA synthesis and authority override
          5. Decision packet stage where needed
          6. Dedicated deletion proof stage
            7. Fresh review gate
              8. No-mutation reconciliation or remediation-slice handoff
```

### Container 0. Orientation And Authority Seal

Inputs:

- current worktree and Graphite stack;
- root `AGENTS.md`;
- `docs/process/GRAPHITE.md`;
- controlling frames listed above;
- active ledger and grounding note.

Agent roles:
DRA owner only.

Outputs:

- confirmed branch and stack state;
- live corpus count;
- captured fresh ratchet authority command results, each with command, status,
  proof label, and proof limit;
- explicit exterior and non-authorizations.

Proof gates:

- worktree state is known;
- live manifest count and ledger row count reconcile;
- ratchet authority commands pass with proof label `Habitat wrapper behavior`;
- proof limits state that the commands do not prove absorption,
  injected-violation behavior, or safe deletion.

Stop conditions:

- dirty state cannot be classified;
- ledger/live manifest coverage is stale;
- any ratchet authority command fails, is stale, or cannot be captured.

### Container 1. Corpus Coverage And Pre-Filter

Inputs:

- live `.habitat/**/rule.json` manifests;
- cleanup ledger;
- manifests, patterns, baselines, support files;
- NARSIL, `rg`, `jq`, and Habitat classify/check evidence.

Agent roles:
one fresh read-only pre-filter agent, or DRA owner if the set is small enough.

Outputs:

- admitted candidate list with admission test per row;
- excluded-neighbor list with failed admission reason per row;
- unresolved candidates requiring DRA decision before lane assignment.

Proof gates:

- every admitted row passes an admission test from this active workstream plan's
  Admission Tests section;
- every excluded row names why it is exterior;
- path overlap alone is never the reason.

Stop conditions:

- admission depends only on historical receipt language;
- current manifest or support paths are unreadable;
- three or more candidates require proof outside the ratchet surfaces.

### Container 2. Lane Batching

Inputs:

- admitted candidate list;
- lane categories in this document;
- absorber map from Lane 0.

Agent roles:
DRA owner assigns lanes; no agent self-selects scope.

Outputs:

- one lane packet per category;
- selected rows and excluded adjacent rows per lane;
- lane-specific NARSIL query prompts and proof commands.

Proof gates:

- each row appears in exactly one lane packet or one excluded-neighbor list;
- lane packet names allowed action decisions and proof class expectations;
- lane packet does not mix incompatible proof classes without explicit split
  risk.

Stop conditions:

- a lane hides row-level obligations;
- a row could fit two lanes and owner-layer decision is missing.

### Container 3. Per-Rule Lane Analysis

Inputs:

- one lane packet;
- post-ratchet frame;
- action classification frame;
- current rule files and source evidence;
- NARSIL and command evidence.

Agent roles:
one fresh read-only lane agent per category.

Outputs:
one compact record per reviewed rule:

```text
rule:
scope:
actionDecision:
rationale:
evidence:
ownerLayer:
falseOwner:
residualRisk:
absorber:
oldShape:
dependency:
proofClass:
proof:
decisionPacketNeeded:
falsifier:
```

Proof gates:

- `actionDecision` uses exact vocabulary;
- `consolidation/dedup` and `retirement/garbage collection` records include
  `oldShape`;
- absorption records name an absorber;
- admitted records name `ownerLayer`, `residualRisk`, `proofClass`, and
  `decisionPacketNeeded`;
- out-of-scope records name the failed admission criterion or exterior owner
  surface.

Stop conditions:

- deep clause decomposition is required;
- proof belongs wholly outside this ratchet;
- NARSIL and current files disagree and the conflict cannot be resolved inside
  the lane.

### Container 4. DRA Synthesis And Authority Override

Inputs:

- all lane records;
- excluded-neighbor notes;
- NARSIL/current-file contradictions;
- proof-class claims.

Agent roles:
DRA owner only.

Outputs:

- accepted dispositions;
- rejected dispositions with reason;
- rows needing decision packets;
- deletion-proof candidates;
- provisional slice candidates that cannot become handoff inputs until
  Containers 5-7 pass;
- no-mutation result if no safe domino exists.

Proof gates:

- unsupported agent claims are rejected or downgraded;
- synthesis remains row-keyed so grouping cannot erase rule-level obligations;
- action decisions reconcile with the ledger ontology;
- owner-layer conflicts are surfaced, not silently resolved.

Stop conditions:

- competing records cannot be reconciled without new authority;
- vocabulary collision appears in process naming;
- a deletion candidate lacks old-shape or absorber/retirement rationale.

### Container 5. Decision Packet Stage

Inputs:

- synthesized rows where compact disposition is insufficient;
- `RULE-DECISION-PACKET-FRAME.md`;
- current rule packet and source evidence.

Agent roles:
fresh semantic decision agents, mandatory separate from earlier lane agents.
DRA owner accepts or rejects each packet; review alone is not acceptance. If
fresh separation is impossible, the DRA owner writes the packet directly rather
than reusing a lane agent.

Outputs:

- clause table;
- owner and false-owner map;
- whole-rule fit;
- rule-id strategy;
- semantic remediation decision;
- proof limit.

Proof gates:

- every clause has owner, forbidden owner, action fit, packet disposition, and
  proof class;
- retired literals include recurrence-risk judgment;
- semantic decision is separated from implementation mechanics.

Stop conditions:

- no prior classification exists;
- input classification is stale;
- source authority is insufficient;
- decision would depend on a destination shape not yet designed.

### Container 6. Dedicated Deletion Proof Stage

Inputs:

- synthesized `consolidation/dedup` records with expected old-rule deletion;
- synthesized `retirement/garbage collection` records;
- accepted decision packets when deep semantics were required;
- current rule manifest, packet, runner, support files, and baseline;
- live manifest set and cleanup ledger row;
- source references for old shape and absorber or retirement rationale;
- focused command evidence for candidate and absorber where available.

Agent roles:
fresh deletion-proof agents. They prove deletion readiness and never mutate.

Outputs:
one deletion-readiness record per rule:

```text
rule:
deleteReason:
oldShape:
absorber:
recurrenceRisk:
liveReferenceReconciliation:
proof:
reviewAcceptance:
blockedBy:
```

Deletion readiness requires:

- old shape is specific;
- absorber is named when absorption is claimed;
- retirement rationale is named when no absorber exists;
- recurrence risk is denied with evidence or routed to another action;
- live references are absent or accounted for;
- `reviewAcceptance` is either a Container 7 accepted review reference or
  `pending`; a record with `pending` review remains blocked and is not
  deletion-ready;
- no replacement rule, test, or native rail is invented without an accepted
  action decision requiring it.

Proof gates:

- injected violation proof where practical, or explicit retired-residue proof;
- focused Habitat checks for absorber and candidate where available;
- ledger and live manifest reconciliation plan;
- review acceptance before mutation.

Stop conditions:

- deletion is contested;
- absorber is vague;
- live residual risk remains;
- proof is only manifest syntax;
- positive authority must exist first.

### Container 7. Fresh Review Gate

Inputs:

- synthesized dispositions;
- decision packets;
- deletion-readiness records;
- candidate remediation slices or no-mutation result.

Agent roles:
fresh review agents, separate from analysis, deletion proof, and future
implementation.

Review lanes:

- admission reviewer;
- action-decision reviewer;
- owner-layer and proof reviewer;
- deletion reviewer;
- vocabulary and semantic-collision reviewer.

Outputs:

```text
| Finding | Severity | Disposition | Repair evidence | Residual risk / follow-up |
| --- | --- | --- | --- | --- |
```

Proof gates:

- accepted P1/P2 findings block dependent closure;
- reviewer claims are dispositioned by the DRA owner;
- no deletion proceeds with contested proof.

Stop conditions:

- row loss is found;
- action decision uses non-vocabulary labels;
- deletion proof is under-specified;
- owner-layer claim is unproven.

### Container 8. No-Mutation Reconciliation Or Remediation-Slice Handoff

Inputs:

- reviewed accepted dispositions;
- blocked rows and excluded-neighbor notes;
- deletion-readiness records;
- decision packets.

Agent roles:
DRA owner.

Outputs:
either:

- an explicit no-mutation result with accepted non-moves, blocked rows,
  excluded neighbors, and proof limits; or
- a remediation-slice handoff that satisfies
  `RULE-REMEDIATION-SLICE-FRAME.md` readiness:

```text
Selected rows:
Excluded adjacent rows:
Primary remediation objective:
Decision packet refs:
Expected end state per row:
Write set:
Verification commands / proof limits:
Record-update targets:
Stop conditions:
```

Proof gates:

- no safe domino is invented just to create motion;
- implementation agents receive only reviewed accepted rows;
- later mutation has explicit branch, write set, and verification plan.

Stop conditions:

- missing decision packet;
- stale proof;
- unbounded write set;
- implementation would begin from an unreviewed deletion claim.

## Lane Agent Prompt Skeleton

Use this structure for each future lane agent. Fill in the lane name and row
set before spawning.

```text
You are a read-only lane-analysis agent for the Civ7 Habitat Domain-Root
Topology post-ratchet rule revalidation workstream.

Worktree: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown

Do not edit files. Do not stage. Do not commit. Other agents may be active; do
not revert or touch unrelated changes.

Objective:
review the assigned lane one rule at a time and return exactly one
post-ratchet record per rule. Do not implement remediation.

Required reads:
- .habitat/.active/workstreams/remediate-rule-authority/domain-root-topology-rule-revalidation-workstream.md
- .habitat/.active/frames/POST-RATCHET-RULE-REVALIDATION-FRAME.md
- .habitat/.active/frames/RULE-ACTION-CLASSIFICATION-FRAME.md
- .habitat/.active/workstreams/remediate-rule-authority/rule-authority-corpus-grounding.md
- .habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json

Lane:
<lane name and definition>

Assigned rules:
<rule ids and current paths>

Tooling:
Use NARSIL for code/reference/import/symbol discovery where useful. Cross-check
NARSIL leads against current rule files, source files, jq/rg evidence, and
focused Habitat commands. NARSIL output is not authority by itself.

Return one record per rule:
rule:
scope:
actionDecision:
rationale:
evidence:
ownerLayer:
falseOwner:
residualRisk:
absorber:
oldShape:
dependency:
proofClass:
proof:
decisionPacketNeeded:
falsifier:

Stop and report instead of deciding if deep clause decomposition, owner design,
or proof outside this ratchet is required.
```

## Review Prompt Skeleton

Use fresh agents for review. Do not reuse lane agents.

```text
You are an adversarial reviewer for the Civ7 Habitat Domain-Root Topology
post-ratchet rule revalidation workstream.

Do not edit files. Your job is to find blockers in the proposed dispositions,
not to approve them.

Review against:
- admission criteria;
- exact actionDecision vocabulary;
- residual-risk proof;
- owner-layer correctness;
- NARSIL/current-file cross-check discipline;
- deletion proof completeness;
- semantic-collision language.

Return findings first:
| Finding | Severity | Disposition Needed | Evidence |
| --- | --- | --- | --- |

Use P1 for a disposition that could cause wrong deletion, wrong owner, or false
closure. Use P2 for missing proof or ambiguous scope that blocks dependent
work. Use P3 for clarity or later-maintenance risk.
```

## Degeneration Triggers

Stop and reframe if any of these occur:

- three admitted rows in one batch require proof classes outside domain-root
  topology, domain operation surfaces, or source topology;
- lane agents repeatedly admit by path overlap alone;
- deletion candidates lack old-shape proof;
- runtime/generated-output/package rails dominate the admitted set;
- NARSIL output is being treated as authority without current-file proof;
- review finds row loss caused by grouping;
- the first safe move is not a rule cleanup move but a missing positive
  authority design.

## Expected Workstream Output

The completed revalidation pass should produce:

- ratchet absorber map;
- pre-filtered admitted rule set;
- excluded-neighbor list;
- one compact record per admitted rule;
- DRA synthesis with accepted/rejected dispositions;
- decision packets for rows that need deep semantics;
- deletion-readiness records for clear deletion candidates;
- fresh review disposition;
- first remediation-slice handoff, or explicit no-mutation result.

No implementation is authorized until a later remediation slice consumes the
reviewed outputs and opens its own Graphite layer.

# Habitat Authority Tree Frame

Status: active living frame for Habitat authority-tree direction and pruning

Built: 2026-06-26

Owner: DRA Habitat authority-tree workstream

Durability: standalone authority-tree frame. This document lives with the
authority tree because it governs the whole `.habitat` direction rather than a
single project packet, niche, blueprint, category, or rule.

## Source Order

Use this order when sources disagree:

1. Direct current user instructions.
2. Root `AGENTS.md`, closest subtree `AGENTS.md`, and repo process docs.
3. `.habitat/FRAME.md` for the current authority-tree lens.
4. `.habitat/AUTHORITY.md`, `.habitat/AUTHORITY-TREE-SHAPE.md`,
   `.habitat/RULE-OPERATION-KINDS.md`, `.habitat/SUBJECT-CATEGORIES.md`,
   `.habitat/dominoes.md`, and `.habitat/config.md`.
5. `docs/projects/habitat-harness/FRAME.md`,
   `docs/projects/habitat-harness/dra-takeover-frame.md`, and current
   Habitat recovery/workstream records.
6. Current `.habitat` manifests, packet paths, generic role files, patterns,
   baselines, operation notes, and Toolkit discovery behavior.
7. Current source code, tests, scripts, package metadata, Nx metadata, and
   fresh command behavior.
8. Prior session summaries and archived project notes as discovery material
   only.

If lower evidence contradicts higher authority, preserve the higher source
unless fresh disk or command evidence proves that source stale.

## Stack Geolocation

The current authority-tree stack has moved through these concrete dominoes:

1. `agent-DRA-habitat-edge-miss-stabilization`
   (`f07cc4b5dd`) stabilized task-graph edge misses, generator metadata, and
   canary records.
2. `agent-DRA-habitat-embedded-authority-frame`
   (`e4acac8bae`) framed embedded hidden authority as assertion-level oracle
   classification.
3. `agent-DRA-habitat-embedded-authority-migration`
   (`bb96ae249c`, then `19d2ccb14a`) migrated the first structural authority
   cluster and recorded the Nx parallel task race as a deferral.
4. `agent-DRA-habitat-universal-subject-categories`
   (`135e116aa0`) classified the authority corpus by universal engineering
   purpose.
5. `agent-DRA-habitat-category-tree-physicalization`
   (`87d25ef424`) grouped packets by category.
6. `agent-DRA-habitat-blueprint-tree-physicalization`
   (`0e7a851a29`) organized packets by blueprint.
7. `agent-DRA-habitat-niche-blueprint-correction`
   (`a1ce08c4cf`) separated niches from blueprints.
8. `agent-DRA-habitat-subject-title-metadata`
   (`46e952df71`) separated human titles from executable slugs.
9. `agent-DRA-habitat-underscore-subject-renames`
   (`ac7dbeecdd`) renamed executable subjects with verb-first underscore
   slugs.

We are now after aggregation, migration, physicalization, and semantic naming.
The next phase is pruning and data-quality improvement: remove, demote, split,
consolidate, or relocate gathered packets that should not become permanent
Habitat enforcement.

## WHAT

Treat `.habitat` as the authored repository-local authority tree for structural
policy. It owns what the repo is allowed to look like: source shape,
import/export legality, package ownership, protected generated placement,
public surface structure, boundary reach, artifact ownership, and intentional
fix/generate/migrate operations.

Treat `tools/habitat` as execution mechanics. The Toolkit may discover,
select, run, report, fix, generate, or migrate authority artifacts, but Toolkit
internals, runner types, adapter names, and current implementation defects do
not define the authority ontology.

The current pruning target tree is:

```text
.habitat/blueprints/<blueprint>/<packet>/
.habitat/<niche>/_blueprints/<candidate>/<packet>/
.habitat/<niche>/rules/<packet>/
.habitat/<niche>/_remainder/<packet>/
.habitat/<niche>/<child-niche>/...
```

This tree is intentionally decomposed for the current gathered packet corpus:

- niche: authored jurisdiction;
- blueprint: affirmed constructible kind authority at top level;
- _blueprints: niche-local candidate/likeness grouping, not affirmed
  blueprint authority;
- rules: transitional niche-local inventory, not blueprint authority;
- _remainder: reviewed and sorted deferred inventory, not niche, blueprint,
  capability, or final ontology;
- category: universal engineering-purpose class in `rule.json`;
- kind: mutability and execution intent in `rule.json`;
- packet: current artifact bundle or authority unit.

The durable ontology is narrower than this physical decomposition. Habitat,
blueprint, instance, capability, and niche are conceptual authority types.
Category, kind, and packet are current pruning axes and may change when typed
blueprint, capability, niche, and instance manifests are designed.
`_remainder` is visual debt for packets already reviewed by a bounded slice
but not yet moved to a final owner; sorted-but-deferred packets must not remain
under `rules/` where future agents would read them as intentional context
authority.

## WHY

The earlier work deliberately gathered scattered enforcement material first so
that hidden policy could be seen. Gathering is not endorsement. Some gathered
items are true structural authority. Others are package behavior tests,
runtime/product validators, generated-output currentness checks, dependency
ordering, transitional compatibility, or workstream ledgers.

The current job is to prevent aggregation from becoming accidental law. Habitat
should keep only authority that belongs in Habitat, and it should route each
kept invariant to the right owner layer. That makes future agents safer because
they can classify before authoring, generate supported structure, run checks
through a single authority tree, and avoid treating stale scripts or test names
as architecture.

## Current File-Role Model

Use this model when reading a packet:

- `rule.json` is runner/catalog metadata. It tells the Toolkit how current
  execution is wired. It now owns stable rule identity, current placement
  inventory facts, explicit runner file references, and explicit artifact
  references; the packet path is current placement evidence, not identity.
- `.habitat/_support/execution/source-check/` was transitional source-check
  adapter support. It is now deleted: zero `ownerTool: source-check` records,
  zero central `.rule.mjs` adapters, and no `rule-runtime.policy.mjs` remain.
- `.habitat/_support/execution/` is a temporary support island under the
  authority tree. It is not a niche, blueprint, category, operation kind, or
  final source of authored authority.
- `pattern.md` is policy-pattern text. Grit examples or match/ignore blocks
  that are part of the pattern packet stay with the pattern unless a runner
  consumes them as separate support files.
- `fixtures/` or `support/` should mean runtime/test support needed to execute
  a flow, not examples embedded in policy-pattern authority.
- `check.*` is a command-check executor. These files are the main suspect
  lane for package-local validators, generated-output currentness checks, and
  Nx-ordering issues.
- `fix.*`, `generate.*`, and `operation.md` are operation surfaces, not
  default enforcement rules.

Do not recreate source-check adapter literals or move old adapter literals into
`fixtures/`; the remaining policy payloads now belong in Grit patterns or the
appropriate non-source-check owner.
Do not move `pattern.md` examples merely because they are examples.

## Selection Commitments

In:

- All current `.habitat` packets, especially rows marked `triage`,
  `provisional`, `transition`, `mixed`, `overlaps`, or otherwise caveated.
- Embedded structural authority still hiding in tests, scripts, package
  metadata, Nx targets, docs, and bridge surfaces.
- Existing package-local validators that must be explicitly kept out of
  Habitat when their oracle is behavior, runtime state, or product correctness.
- Nx dependency and target metadata where build ordering or generated-artifact
  freshness is the real owner.

Foreground:

- The assertion oracle: what exact observation makes the assertion fail?
- Mutability: read-only check, fix, generate, migrate, or non-executable
  triage.
- Existing Habitat ownership before new packet creation.
- Duplicate, overlapping, mixed, or transitional packets as the first pruning
  targets.
- Proof class separation: Habitat structural proof, package unit behavior,
  runtime/product proof, generated-output proof, Nx ordering proof, and record
  truth proof are separate claims.

Exterior:

- Whole-file migration or deletion based on names alone.
- Treating `architecture`, `guardrail`, `contract`, `validate`, or `test` in a
  file name as authority.
- Moving package behavior, live Civ7 behavior, SDK semantics, CLI UX,
  generated runtime output correctness, or product acceptance into Habitat.
- Letting plain broad runner behavior redefine the tree model.
- Designing final support-artifact ontology, cascade semantics, or typed
  blueprint manifests in this pruning frame.

## Hard Core

Violating any of these forces a reframe:

1. `.habitat` owns authored Habitat authority; `tools/habitat` owns execution
   mechanics.
2. Niche and blueprint are durable ontology terms. Niche is jurisdiction;
   blueprint is the constructible thing being authored or enforced. Category,
   kind, and packet are current decomposition axes for gathered authority.
3. Classify by assertion oracle and mutability, not by file name, target name,
   current path, runner type, or historical defect label.
4. Habitat owns true structural authority. Package tests own runtime behavior,
   product behavior, API behavior, validation semantics, live integration, and
   generated runtime output correctness.
5. Build ordering, cache behavior, generated-output prerequisites, and target
   dependency freshness belong in Nx unless there is a separate Habitat
   structural invariant.
6. `triage` is not admitted executable authority. Transitional packets must be
   split, admitted, explicitly kept as non-executable, or removed.
7. Mixed tests and mixed packets split assertion-by-assertion. Whole-file or
   whole-packet movement is exceptional.
8. No new loose lint, validation, structural-check, fix, generate, migration,
   or policy script may be introduced as authored authority without
   authority-tree identity.

## Protective Belt

These can change without reframing while the hard core holds:

- Exact subject names, human titles, and executable slugs.
- The temporary `_self` niche-authority packet-placement placeholder.
- Generic packet role filenames as the current colocated file convention.
- `rule.json` as the current location-independent inventory manifest until
  typed blueprint, instance, capability, and niche authority manifests replace
  its transitional placement facts.
- Exact blueprint-definition folder names, manifest schemas, same-kind nesting
  cascade rules, conflict handling, and deprecation semantics.
- Transitional command-check scripts for read-only authority that cannot yet be
  expressed through Grit, Nx, Biome, or another durable adapter.
- Provisional operation notes for fix/generate behavior until typed operation
  manifests exist.
- Selected-rule execution as the proven compatibility bridge while full-suite
  runner discovery is rebuilt.
- Whether a pruning disposition is recorded in a packet role file, a
  higher authority doc, a workstream record, or a future OpenSpec packet.

## Pruning Classifier

Use the smallest assertion or operation as the unit of analysis.

| Oracle or behavior | Disposition | Owner |
| --- | --- | --- |
| Source shape, file tree, import/export legality, public surface structure, package ownership, protected generated placement, boundary reach | Keep, consolidate, or refine as Habitat authority | `.habitat` |
| Runtime behavior, command output, API behavior, validation semantics, state transition, retry/reconnect, telemetry, live Civ7 or FireTuner behavior, generated runtime output correctness, product acceptance | Keep package-local; rename or split only for clarity | owning package |
| Build ordering, generated-output prerequisites, cache/output dependencies, consumer-before-producer ordering | Encode in Nx target graph; Habitat may only check separate structural meaning | Nx/project metadata |
| Mutating repair of authored files | Admit as `fix` only with idempotence and write-scope proof, or keep out of default authority | `.habitat` operation |
| Materialization of generated/scaffolded outputs | Admit as `generate` with declared inputs/outputs, or keep with the consuming package | generator owner |
| Transition from one accepted authored shape to another | Admit as `migrate` with source shape, target shape, review boundary, and stop condition | migration owner |
| Legacy bridge, compatibility ledger, inventory, mixed packet, or unresolved ontology | Keep as non-executable `triage`, split, remove, or defer with trigger | no default execution |

Removal is valid when an item is not authority, duplicates a stronger owner,
or only preserved a transitional state that no longer exists. Demotion is
valid when useful evidence remains but default execution would overclaim.
Consolidation is valid when two packets enforce the same invariant through
different historical mechanisms.

## Disposition Workflow

Do not treat disposition as a single action step. Pruning runs as a staged
funnel that pushes irreversible decisions later, after the authority unit has
been decomposed and labeled.

Stage 1: inventory and decompose. Select one small suspect cluster and break
each packet into assertion rows or operation rows. Record for each row the
packet path, assertion text, current operation kind, mutability, observed oracle,
current owner, candidate owner, proof class, and uncertainty. Do not remove or
move authority in this stage unless the row is mechanically empty or already
superseded by an adjacent row with identical owner and proof.

Stage 2: label without acting. Assign each row one provisional disposition:
`keep-habitat`, `remove`, `demote-triage`, `split`, `consolidate`,
`package-local`, `nx-ordering`, `generate-owner`, `fix-operation`,
`migrate-operation`, or `needs-reframe`. The label is a hypothesis, not a
change request. Rows with mixed or unstable labels remain decomposed until the
owner and proof class are clear.

Stage 3: form a decision cluster. Group rows only when they share the same
owner, proof class, and action shape. Prefer a narrow cluster that can be
proved end to end over a larger cluster with mixed verification. A valid
cluster names what will change, what will not change, what evidence makes the
decision durable, and what would invalidate it.

Stage 4: execute one disposition cluster. Apply only the action named by the
cluster:

- `keep-habitat`: tighten metadata, naming, fixtures, or registration so the
  structural invariant is explicit.
- `remove`: delete the packet or row when no durable authority remains and no
  useful triage evidence should be preserved.
- `demote-triage`: keep evidence non-executable when it is useful history,
  inventory, or unresolved ontology, but must not run as authority.
- `split`: create separate authority units for rows with different owners,
  proof classes, or mutability.
- `consolidate`: merge duplicate authority into the stronger packet and remove
  or redirect the weaker duplicate.
- `package-local`: leave or move the assertion to the owning package's tests,
  validators, or docs, without weakening package behavior proof.
- `nx-ordering`: encode dependency/order/currentness in Nx target metadata or
  project metadata, and remove Habitat enforcement unless separate structural
  meaning remains.
- `generate-owner`, `fix-operation`, or `migrate-operation`: admit the action
  only with declared inputs, outputs, write scope, idempotence or migration
  stop condition, and review boundary.

Stage 5: prove and record. Run focused proof for the touched authority unit and
the smallest broader check that can catch owner or dependency mistakes. Update
authority docs, role files, or project records only when durable authority
changed. Commit each completed cluster as one Graphite layer.

Decision pressure should move left to right. Early stages increase clarity;
later stages reduce the tree. If a cluster cannot pass from labels to a durable
decision, keep it decomposed and choose a smaller or cleaner cluster.

## First Pruning Targets

Start with high-confidence caveats, not a broad sweep. The Toolkit triage
packet cleanup is complete: the registry owner-root index is root metadata at
`.habitat/index.json`, generator schemas live in a `contract/generate` packet,
and the completed transitional adapter ledger was removed. There are no current
`triage` packets.

- Toolkit support bridges:
  `.habitat/_support/execution/`.
- Duplicate adapter boundary authority:
  `enforce_adapter_only_base_standard_imports` and
  `block_unapproved_base_standard_boundary_leaks`.
- Mixed check/fix/generate semantics:
  docs checkout path portability, docs issue-link repair, docs sidebar
  generation, and generator schema writer support.
- Nx-ordering candidates:
  generated recipe/map artifacts, Studio recipe dependencies, visualization
  runtime dependencies, and generated-output freshness checks that exist only
  to make consumers run after producers.
- Package-local behavior validators:
  direct-control, control-oRPC, live-map, generated runtime output, resource
  distribution, and product/runtime tests that must remain outside Habitat.

Search first in packet paths plus `rule.json` and `operation.md` for `triage`,
`provisional`, `transition`, `overlap`, `mixed`, `split`, `legacy`,
`currentness`, `Nx`, `dependency`, `validator`, and `operation`.

## Current Direction

The next irreversible moves should reduce future states:

1. Create or update the frame before pruning.
2. Pick one small suspect cluster and decompose it into assertion or operation
   rows.
3. Label rows by oracle, mutability, current owner, candidate owner, forbidden
   owners, proof class, and provisional disposition.
4. Promote only rows with shared owner, proof class, and action shape into a
   decision cluster.
5. Execute exactly one disposition cluster.
6. Update adjacent authority docs only when durable authority changes.
7. Run focused proof for touched packets plus the smallest broader build or
   static check that proves the move.
8. Commit as one reviewable Graphite layer.

Do not create ledgers as a substitute for shrinking the authority surface. A
ledger is useful only when it directly enables removal, demotion, split,
consolidation, or relocation.

## Stop And Reframe Conditions

Stop and reframe if any of these occur:

- Authored structural policy exists with no Habitat identity.
- A mutating script is registered or preserved as a `check`.
- A package behavior test must be weakened to fit Habitat.
- A candidate duplicates an existing Habitat packet and the owner cannot be
  chosen from source evidence.
- A broad runner limitation is used as evidence that the tree shape is wrong.
- Toolkit internals, adapter names, current defects, or runner classes start
  driving niche, blueprint, category, or kind names.
- Two consecutive pruning candidates move product/runtime proof into Habitat
  or move structural authority back into package-local tests without an
  explicit owner decision.
- The pruning pass needs a support-artifact or typed manifest ontology before
  any concrete disposition can be made.

## NOT HOW

This frame does not define implementation order beyond the next pruning posture.
It does not define final resolver metadata, typed blueprint manifests,
support-file ontology, cascade semantics, broad full-suite runner repair,
OpenSpec packet shape, or a complete backlog.

Execution plans live in `.habitat/dominoes.md`, workstream records, OpenSpec
changes, and Graphite branches. This frame exists to keep those execution
artifacts aimed at the same authority-tree end state.

# D4 Cross-Domino Investigation

## Scope

This is a fresh D4 Orientation and Routing cross-domino/downstream review for
the Deep Habitat OpenSpec remediation pass. It checks D4 against accepted
D0/D1/D2/D3 design/specification state and downstream D14, with attention to
dependency overclaims, D14 example handoff, parallel sequencing, and D0
compatibility action vocabulary.

## Skills And Contracts Read

- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/system-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/civ7-open-spec-workstream/references/team-and-review-lanes.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/civ7-open-spec-workstream/references/artifact-contracts.md`

## Sources Read

- `$REMEDIATION_DIR/context.md`
- `$REMEDIATION_DIR/packet-index.md`
- `$PHASE2_PACKET_DIR/D4-orientation-and-routing.md`
- `$OPENSPEC_CHANGES/deep-habitat-d4-orientation-routing/proposal.md`
- `$OPENSPEC_CHANGES/deep-habitat-d4-orientation-routing/design.md`
- `$OPENSPEC_CHANGES/deep-habitat-d4-orientation-routing/specs/habitat-harness/spec.md`
- `$OPENSPEC_CHANGES/deep-habitat-d4-orientation-routing/tasks.md`
- `$OPENSPEC_CHANGES/deep-habitat-d4-orientation-routing/workstream/review-disposition-ledger.md`
- `$OPENSPEC_CHANGES/deep-habitat-d4-orientation-routing/workstream/downstream-realignment-ledger.md`
- `$AGENT_SCRATCH/domino-D4-review.md`
- D0/D1/D2/D3 source packets, proposal/design/spec/tasks, workstream review ledgers, and downstream ledgers as needed for dependency and handoff checks.
- `$PHASE2_PACKET_DIR/D14-authoring-topology-fence.md`
- `$OPENSPEC_CHANGES/deep-habitat-d14-authoring-topology-fence/proposal.md`
- `$OPENSPEC_CHANGES/deep-habitat-d14-authoring-topology-fence/design.md`
- `$OPENSPEC_CHANGES/deep-habitat-d14-authoring-topology-fence/specs/habitat-harness/spec.md`
- `$OPENSPEC_CHANGES/deep-habitat-d14-authoring-topology-fence/tasks.md`

## D4 Dependency Contract On D0/D1/D2/D3

D4 may consume accepted D0/D1/D2/D3 design/specification state only as design
authority. It may not treat any of those packets as source-implementation facts
until their implementation prerequisites are satisfied.

| Upstream | D4 may consume at design/spec time | Source implementation blocker |
| --- | --- | --- |
| D0 Public Surface Compatibility | Closed compatibility action vocabulary; plane-separated row model; requirement that command JSON, human output, package exports, docs examples, scripts, targets, generators, and hooks cite concrete `surface_id` rows before change. | Concrete D0 matrix rows for `habitat classify`, `Classification`, `DiffClassification`, classify human output, package exports, docs examples, and any D3/D4 graph-target output shape touched by source edits. |
| D1 Receipt Contract Boundary | Refusal, diagnostic, command outcome, recovery instruction, typed relationship, and non-claim vocabulary. D1 protects `ClassifiedTarget.proof` for D3/D4 and treats it as downstream-owned compatibility output, not D1 target language. | D1 implementation is not needed for D4 design, but D4 source changes that introduce refusals/non-claims must align with D1 output-family semantics and concrete D0 rows. D4 may not invent a separate refusal/output family for malformed/pathless diff, unsupported path, unresolved owner, or graph error. |
| D2 Rule Registry Metadata Contract | `ruleRoutingFacts` as the D4 projection: path coverage state, matched glob/source, unresolved reason, and no raw `scope` prose. D4 may also account for `ruleSelectorFacts` only where classify needs selector identity, without taking whole registry rows. | D2 live implementation must provide routing projections before D4 source code relies on them. D4 source implementation is blocked while routing still depends on prose `scope` authority or while malformed metadata can silently disable, skip, or overclaim a rule. |
| D3 Workspace Graph Boundary | Project ownership, project root, target availability, unavailable target, aggregate/workspace target, and `GraphRefusal` states for classify/orientation. D4 may present these facts and combine them with D2 routing facts. | D3 live implementation must provide graph facts before D4 source code relies on them. D4 may not infer project ownership, target existence, alias validity, graph-read status, or dependency resolution locally. |

D4 also depends on the accepted packet-index distinction: D0/D1/D2/D3 are
accepted for design/specification only and are not implementation-complete. D4
must state the same distinction locally. A D4 packet can be accepted for
design/specification after it defines the state model and repairs findings, but
source implementation remains blocked behind concrete D0 rows plus live D2/D3
projection facts.

## D4 Handoff To D14

D14 may rely on D4 only for command-facing classify/orientation examples that
show what Habitat currently supports, refuses, and does not prove. D14 must not
invent classify examples or infer authoring support from classify success.

D4 must hand D14 an example corpus with these exact states:

| D4 state/example | Facts D14 may rely on | Non-claims D14 must preserve |
| --- | --- | --- |
| `project-path` for a supported Habitat-owned source path | Owner project/root, D2-backed scoped rule routing facts, D3-backed available/unavailable/aggregate target facts, recovery guidance where applicable, and classify non-claims. | Does not run targets, prove rule correctness, prove apply safety, or authorize authoring generators. |
| `workspace-path` or docs/workspace fallback | Workspace/documentation ownership or unresolved project-local owner as a bounded orientation result, with next safe command/document guidance. | Does not imply every descendant path is authoring-supported or generator-supported. |
| `diff` with classified paths | Per-path classification, aggregate unresolved facts, and ordering/aggregation rules for multiple changed paths. | Does not prove all changed paths are safe to edit, does not run checks, and does not replace D12 verify handoff. |
| `malformed-or-pathless-diff` | Stable refusal reason, recovery instruction, no inferred owner, and no runnable graph-backed targets. | Does not infer ownership from text shape and must not become a successful empty diff example. |
| `unresolved-owner` | Stable unresolved-owner state, unresolved facts, recovery path, and no project-local runnable targets. | Does not permit D14 to classify the path as future authoring topology or generic scaffolding support. |
| `graph-error` | D3 graph refusal/read-failure state, bounded error class, recovery instruction, and no target commands. | Does not let D14 or D13 reconstruct graph truth locally. |
| `unsupported authoring-looking path/request` where classify can orient but not author | Orientation facts may show the path is in a MapGen or docs area and may name supported structural commands. | Does not add MapGen domain/op/stage/step/recipe authoring support; D14 owns the fence and D13 owns command refusal shape. |

D14 may use the D4 examples to say: "classify can orient this path/diff and
tell you what it does not prove." D14 may not use D4 to claim generator support,
authoring topology support, MapGen product behavior, or structural enforcement
closure.

## D5/D6/D8 Parallel Sequencing Check

No sequencing conflict exists if D4 stays inside orientation/routing and public
DTO changes are coordinated through D0. The source D4 packet explicitly allows
D4 to run after D3 while D5/D6/D8 continue in parallel, provided shared public
DTOs are coordinated through D0.

The parallel boundary is:

- D4 may consume D2 `ruleRoutingFacts`; it must not consume or redefine D5
  `ruleBaselineFacts`, D6 diagnostic semantics, or D8 Pattern Authority
  lifecycle/admission.
- D4 may display baseline, diagnostic, or Pattern Authority facts only as
  unresolved/non-owned facts if D5/D6/D8 have not accepted or implemented their
  source contracts.
- D4 may not require D5, D6, or D8 completion for design/spec acceptance unless
  it adds baseline authority, diagnostic catalog semantics, or governance
  decisions to classify output.
- Any shared public classify DTO or docs example affected by D5/D6/D8 facts
  must be recorded through D0 rows and represented as non-owned/unresolved until
  the owning packet closes its own implementation facts.

## D0 Compatibility Vocabulary Check

The closed D0 compatibility action vocabulary is:

- `preserve`
- `version`
- `facade`
- `deprecate`
- `refuse`
- `document-only`
- `generated-only`

D4 currently uses acceptable prose in the proposal/design when saying public
JSON and human guidance may change only through D0 compatibility decisions, but
it does not yet record a D4 public-surface table with the closed D0 action
values. Any repair must avoid alternate action labels such as "retain",
"rename", "compatibility-only", "migrate", "wrap", "additive", or "blocked" as
the D0 `compatibility_handling` value. Those may appear only as explanatory
strategy or pre-implementation status, not as compatibility actions.

## Findings

### P1: D4 still lacks the cross-domino dependency contract needed to avoid source overclaims

D4 names D0/D2/D3 as requirements, and the negative D4 review already identifies
missing state-model and D0 compatibility repairs. The cross-domino problem is
sharper: D4 does not state the accepted upstream distinction between
design/specification consumption and source implementation blockers.

D2 and D3 explicitly allow downstream design to consume accepted projections,
but source implementation remains blocked until concrete D0 rows and live D2/D3
implementation facts exist. D4's current tasks say to "re-run or cite" D0/D2/D3
dependency gates, which could let an implementation agent cite accepted design
packets as if they were live source facts.

Required realignment text:

```text
D4 may consume accepted D0/D1/D2/D3 design/specification state to define the
classify/orientation contract. D4 source implementation remains blocked until
concrete D0 surface rows cover every classify JSON, human-output, docs-example,
package-export, and graph-target surface touched by D4; D2 live routing
projections replace prose `scope`; and D3 live graph facts provide project
ownership, target availability, unavailable targets, aggregate/workspace
targets, and graph refusals. Accepted D0/D1/D2/D3 design packets are not source
implementation evidence.
```

### P1: D4 handoff to D14 is underspecified enough that D14 would have to invent classify examples

D4's source packet says it unblocks D14 and scenario handoff examples. The
current D4 downstream ledger only says "later domino packets" and does not name
D14's reliance. D14's source packet requires classify/verify examples that state
non-support, and the packet index says D14 has a late command-facing closure
after D4/D12/D13 examples exist.

Without explicit D4 examples, D14 must either invent project-path/diff/refusal
examples or weaken its Authoring Topology fence to generic prose. That would
violate the artifact contract because downstream packets would make local
decisions instead of consuming the upstream handoff.

Required realignment text:

```text
D4 hands D14 a classify/orientation example corpus containing project-path,
workspace-path, diff, malformed-or-pathless-diff, unresolved-owner,
graph-error, unavailable-target, and unsupported authoring-looking path/request
states. Each example records owner/routing facts, recovery guidance, and
non-claims. D14 may rely on these examples only to fence authoring requests and
to show that classify orientation is not authoring support; D14 may not derive
MapGen authoring topology, generator support, rule correctness, target
freshness, or verify handoff closure from D4.
```

### P2: D4's D0 compatibility handling is named as a dependency but not converted into closed-action rows

D0 requires exactly one `compatibility_handling` value from the closed set for
each affected public or durable surface. D4 affects `habitat classify` command
JSON and human output, `Classification`, `DiffClassification`, docs examples,
and possibly package exports and graph-target output. The current D4 design
requires "D0 compatibility disposition" before implementation but does not list
the surfaces or require the closed action values in D4's own packet.

Required realignment text:

```text
Before D4 source implementation, add a D4 public-surface compatibility table
with one row per D0 surface plane for `habitat classify`, classify JSON,
classify human output, `Classification`, `DiffClassification`,
`ClassifiedTarget`/target projection fields, docs examples, and any package
exports touched by D4. Each row must cite a concrete D0 `surface_id` and copy
one D0 action only: `preserve`, `version`, `facade`, `deprecate`, `refuse`,
`document-only`, or `generated-only`.
```

### P2: D4 can run in parallel with D5/D6/D8 only if classify output treats their facts as non-owned or unresolved

The source D4 packet permits parallelism with D5/D6/D8 when shared public DTOs
are coordinated through D0. The current scaffold does not restate the boundary.
D4 consumes D2 routing facts and D3 graph facts; it does not own baseline
authority, diagnostic pattern taxonomy, or Pattern Authority governance. If D4
adds classify fields for baseline, diagnostic, or governance state while
D5/D6/D8 are still draft/blocking, it would either overclaim those domains or
force a hidden sequencing dependency.

Required realignment text:

```text
D4 remains parallel-safe with D5/D6/D8 only while it confines classify routing
to D2 `ruleRoutingFacts` and D3 graph facts. Baseline, diagnostic, and Pattern
Authority/governance information must appear only as non-owned/unresolved facts
or be omitted until D5, D6, and D8 accept and implement their owning contracts.
D4 must not create D5/D6/D8 semantics, and any shared public output shape must
be coordinated through D0 rows.
```

### P3: D4 should explicitly consume D1 refusal/non-claim vocabulary even though D1 is not a direct packet-index prerequisite

The packet index lists D4 as requiring D0/D2/D3, not D1. That is acceptable for
primary dependency order. However, D4's malformed/pathless diff, unsupported
path, unresolved owner, and graph-error states are refusal or command-outcome
families. D1 is the accepted design/specification source for refusal,
recovery-instruction, non-claim, and command-record vocabulary.

This is not a sequencing conflict and should not make D1 implementation a D4
source prerequisite by itself. It should be a vocabulary alignment note so D4
does not invent a parallel refusal model.

Required realignment text:

```text
D4 uses D1 design/specification vocabulary for refusals, recovery
instructions, command outcomes, and non-claims. This does not add D1 source
implementation as a D4 prerequisite, but D4 refusal states must not silently
skip, pass, or invent a new output family.
```

## Downstream Realignment Patch Text

Recommended replacement substance for the D4 downstream ledger:

```text
| Downstream Surface | Disposition | Required Action |
| --- | --- | --- |
| D14 Authoring Topology Fence | blocked on D4 example corpus | D4 must hand D14 project-path, workspace-path, diff, malformed-or-pathless-diff, unresolved-owner, graph-error, unavailable-target, and unsupported authoring-looking examples with recovery guidance and non-claims. D14 may use them only to fence authoring requests and must not infer authoring/generator support. |
| D0 compatibility matrix | blocking before D4 source implementation | Cite concrete D0 rows and one closed compatibility action for classify command JSON, human output, DTOs, docs examples, package exports, and graph-target projection output. |
| D2 routing projections | design-consumable; source-blocking until live | D4 design may use `ruleRoutingFacts`; source waits until prose `scope` is no longer routing authority. |
| D3 graph facts | design-consumable; source-blocking until live | D4 design may use project ownership, target availability, unavailable target, aggregate/workspace target, and `GraphRefusal`; source waits for live D3 graph facts. |
| D5/D6/D8 parallel packets | parallel-safe with non-owned facts | D4 must not define baseline, diagnostic, or Pattern Authority semantics; represent them only as non-owned/unresolved facts unless owning packets close. |
```

## Verdict

D4 remains blocked for cross-domino acceptance until it records the dependency
contract above and gives D14 an exact classify/orientation example handoff. The
current D4 scaffold does not overclaim by explicitly implementing D5/D6/D8
semantics, but it leaves enough unsaid that later implementation or D14 could
overclaim by omission.

Skills used: domain-design, information-design, system-design, solution-design, civ7-open-spec-workstream.

# Rule Remediation Workstream Frame

Status: normative execution frame

Durability: standalone execution frame for running a complete Habitat
authority-tree rule remediation workstream across the three general rule
remediation method frames.

## Frame Identity

Frame name: Rule Remediation Workstream

For situation: a Habitat authority-tree rule corpus needs to be processed as
one cascading workstream, from broad action classification through semantic
decision packets and implementation slices, without losing coverage or
mutating authority state out of sequence.

Mode: systematic execution reference

Object path: objective frame for multi-rule remediation execution

Primary object: the execution geometry of a rule-remediation workstream, not
one rule, not one `_remainder` pocket, and not one implementation slice.

## Purpose

Use this frame when the work is bigger than one rule or one slice and the
operator needs to know where the workstream is: Layer 1 classification, Layer 2
decision packets, or Layer 3 implementation. This frame composes the three
general rule frames into one cascade:

- `RULE-ACTION-CLASSIFICATION-FRAME.md` for Layer 1 `n = 1` rule
  classification.
- `RULE-DECISION-PACKET-FRAME.md` for Layer 2 `n = 1` semantic decision
  packets.
- `RULE-REMEDIATION-SLICE-FRAME.md` for Layer 3 `n = slice`
  implementation.

This frame owns fanout, convergence gates, sequencing, resume state, and
mutation discipline. It does not replace the lower-level method frames and does
not duplicate their row templates, clause tables, or slice plans.

## Selection Commitments

In:

- a bounded live Habitat rule corpus;
- lane assignment for broad rule classification;
- merged action matrix and conflict reconciliation;
- decision-packet action classes and sequencing;
- implementation-ready slice selection;
- resume state at every layer and convergence gate.

Foreground:

- parallel discovery and classification before mutation;
- sequenced convergence gates;
- action-class leverage that can delete, absorb, split, or invert later work;
- one authority-state mutation slice at a time unless write sets are proven
  disjoint;
- durable records that let a later agent resume without chat memory.

Exterior:

- current slice selection for a concrete domino unless a live domino names it;
- broad ontology creation not required by the action matrix;
- per-rule clause decomposition details, which belong in
  `RULE-DECISION-PACKET-FRAME.md`;
- implementation mechanics inside a selected slice, which belong in
  `RULE-REMEDIATION-SLICE-FRAME.md`;
- `_remainder`-specific entry tests and status semantics, which belong in
  `REMAINDER-REMEDIATION-ACTION-FRAME.md`.

## Hard Core

1. Layer 1 parallelizes only `n = 1` light classification by stable tree area.
2. Layer 2 produces decision packets only for rules that need action, normally
   sequenced by action class when one class can change another.
3. Layer 3 mutates authority state sequentially per bounded slice.
4. Every layer stops at an explicit convergence gate with durable resume state.
5. Parallel discovery is allowed; authority-state mutation is sequenced.

## Structural Alternative Considered

Alternative: run one rule end-to-end from classification through
implementation, then repeat.

Rejection: one-rule end-to-end execution destroys state-space leverage. It
cannot see when positive authority, closed structure, boundary inversion,
retirement, or split work would collapse a whole class of rules before
individual implementation begins.

Alternative: run one large parallel swarm over all rules and implementations.

Rejection: broad parallel mutation creates churn because each implementation
slice changes the authority tree, ledgers, baselines, and later slice inputs.
Parallelism belongs in discovery and classification; mutation belongs behind
sequenced gates.

## Artifact Authority

`.habitat/frames/*` files are method and execution frames. They are never the
active workstream state by themselves.

Current-state artifacts follow this precedence:

1. The active domino receipt names the current workstream artifact or current
   execution records.
2. The named workstream artifact names the current matrix, packet index, slice
   receipt, and gate reviews.
3. Ledger rows are evidence or history unless explicitly referenced by the
   active domino or workstream artifact.

Every resume block must include exact paths or ids for the matrix, packet
index, selected slice receipt, and latest gate review that authorize the next
action. No path or id means no authority. Historical ledger rows must never
authorize mutation by themselves.

## The Three-Layer Geometry

```text
Layer 1: broad fanout by stable tree lane
  -> classify every scoped rule lightly with n = 1 method
  -> converge into one reconciled action matrix

Layer 2: targeted decision-packet work by action class
  -> produce packets only for rules needing action
  -> sequence action classes when one class can collapse another
  -> converge into one implementation-ready slice with bounded write set

Layer 3: sequential mini-chain per slice
  -> implement one slice fully
  -> verify, review, update records, commit
  -> re-read corpus state before selecting the next slice
```

The operating principle is:

> Parallelize discovery and classification; sequence anything that mutates
> authority state.

## Layer 1: Light Classification Fanout

Layer 1 answers: for each live rule, what kind of action, if any, would reduce
state space?

Use `RULE-ACTION-CLASSIFICATION-FRAME.md` for every rule. The frame remains
`n = 1`; the workstream provides the team geometry around repeated use.

### Lane Basis

Assign one agent per stable tree lane, not by guessed action type. Action type
is the output of classification and cannot be the input to the first fanout.
When a pocket of rules is smaller than a whole tree area, name it as a stable
tree lane with explicit included and excluded paths.

A lane is a routing boundary, not an owner claim. The lane only keeps related
rules near the same investigator so local context is coherent.

### Lane Agent Contract

Each lane agent must be fresh, anchored, and no-edit. The workstream owner
designs one agent per lane, and each lane prompt must include:

- stable tree area;
- included rule ids;
- excluded neighboring areas;
- source snapshot or commit;
- required skills and repo/source context;
- instruction to read this frame and `RULE-ACTION-CLASSIFICATION-FRAME.md`;
- permission to inspect actual repo source code and docs;
- no-edit instruction;
- one classification row per live rule;
- no local reconciliation, no batching decisions, and no invented action
  vocabulary.

Each lane agent processes rules one by one. It may use source code to qualify a
row, but it must not turn the light classification pass into a full decision
packet.

### Layer 1 Output

The convergence artifact is one merged action matrix. It must contain enough
provenance to resume after compaction:

```text
Rule id:
Stable tree area:
Lane agent:
Current path:
Action decision:
Decision packet needed:
Implementation readiness:
Expected remediation outcome:
Blocker / proof:
Confidence:
Conflicts:
Selected / excluded:
Next action-class candidate:
Evidence note:
```

Use the action vocabulary from `RULE-ACTION-CLASSIFICATION-FRAME.md` exactly.
Do not introduce local synonyms.

### Layer 1 Convergence Gate

The workstream owner reconciles all lane output into one action matrix. This
gate must:

- prove every scoped live rule has exactly one matrix row;
- reject any lane that edited files;
- reject any lane that omitted rule ids or changed the action vocabulary;
- normalize labels without changing the underlying decision;
- surface contradictions and unclear rows;
- identify action clusters;
- decide whether the matrix is good enough to select Layer 2 work.

Do not proceed to Layer 2 while the matrix has unresolved coverage gaps,
duplicate rows, vocabulary drift, or contradictions that affect action-class
selection.

## Layer 2: Decision-Packet Fanout Or Sequenced Action-Class Work

Layer 2 answers: for rules needing action, what exact semantic decision makes
implementation safe?

Use `RULE-DECISION-PACKET-FRAME.md` for each selected rule. Do not create
decision packets for rules marked `no action`, simple context admission, or
simple metadata repair unless the action matrix later proves the classification
stale.

### Action-Class Basis

Layer 2 normally slices by action class, not by tree area:

- split by owner;
- positive authority creation;
- closed structure inversion;
- boundary inversion;
- retirement or consolidation;
- runtime or source validation;
- context admission or metadata repair when the matrix shows a grouped
  correction.

Action-class lanes may fan out internally when the rows are independent.
However, Layer 2 selects one action class at a time by default when sequencing
can reveal leverage.

### Layer 2 Agent Contract

Layer 2 agents must be fresh and no-mutation. Each packet prompt must include:

- source commit;
- selected action class;
- included rule ids;
- excluded neighboring rule ids;
- required skills and source context;
- instruction to read this frame and `RULE-DECISION-PACKET-FRAME.md`;
- decision-packet output location or return contract;
- no authority-state mutation;
- no local slice selection unless explicitly delegated.

Rows are independent enough for internal fanout only when they have disjoint
rule ids and no shared positive authority surface, destination,
deletion/consolidation target, or owner decision.

The workstream owner merges packet output into the packet index. Packet agents
do not authorize Layer 3.

### Sequencing Leverage

Do not produce packets for rows likely to be deleted, absorbed, or made
unnecessary by an earlier action-class slice.

Examples:

- Split-by-owner packets can reveal a group of stale clauses that can be
  retired together.
- Retirement can remove clutter that would otherwise distort positive
  authority design.
- Positive authority creation can absorb negative proxy rules and create a new
  deletion/consolidation class.
- Closed structure or boundary inversion can replace many negative assertion
  rules with a smaller positive rail.

After each action-class decision-packet batch, recompute or annotate the action
matrix before selecting another action class.

### Layer 2 Output

Layer 2 produces:

- durable decision packets for selected rules;
- a packet index keyed by rule id and action class;
- rows marked stale if packet work contradicts Layer 1 classification;
- candidate implementation slices with selected rows, excluded adjacent rows,
  proof class, owner, and rough write-set boundary.

### Layer 2 Convergence Gate

The workstream owner selects one implementation-ready slice. This gate must:

- verify every selected rule has a current classification;
- verify every selected rule needing semantic work has a decision packet;
- reject stale or contradicted classifications until repaired;
- choose the slice with the best state-space reduction and bounded write set;
- explicitly exclude adjacent rows that are not part of the slice;
- name why this slice should run before the next candidate slice;
- confirm the slice can enter `RULE-REMEDIATION-SLICE-FRAME.md`.

Use a fresh packet reviewer before mutation. The reviewer checks action-class
sequencing, deletion or positive-authority leverage, packet completeness, and
whether the bounded implementation slice is actually ready.

## Layer 3: Sequential Remediation Mini-Chain

Layer 3 answers: how does one selected slice become actual authority-tree state
without corrupting later inputs?

Use `RULE-REMEDIATION-SLICE-FRAME.md`. Only one authority-state mutation slice
may be active for a selected action-class chain unless write sets are proven
disjoint.

### Layer 3 Entry Warrant

Layer 3 cannot begin from a remembered or historical slice plan. It requires a
current entry warrant:

```text
Reconciled action matrix path/id:
Source commit:
Packet index path/id:
Selected slice receipt path/id:
Fresh packet reviewer disposition:
No selected row stale or contradicted:
Explicit excluded adjacent rows:
Actions not authorized:
```

`Actions not authorized` must include any authority-state mutation outside the
selected slice. Disjoint write-set parallelism is available only after this
warrant exists.

### Mutation Discipline

Layer 3 is mostly sequential:

1. implement one coherent slice fully;
2. verify the exact slice claim;
3. review and disposition findings;
4. update durable records required by the slice frame;
5. close through the repo workflow;
6. re-read corpus state before choosing the next slice.

Parallel work during Layer 3 is limited to:

- fresh review;
- proof inspection;
- ledger coverage audit;
- independently proven disjoint write sets.

If write sets overlap in `.habitat`, ledgers, dominoes, generated
execution-surface docs, baselines, or rule packets, sequence them.

### Layer 3 Output

Each completed slice produces:

- the completed output contract required by `RULE-REMEDIATION-SLICE-FRAME.md`;
- updated action matrix or next-slice receipt.

### Layer 3 Convergence Gate

The slice is closed only when `RULE-REMEDIATION-SLICE-FRAME.md` closure passes.
After closure, the workstream owner must re-read the live corpus state before
selecting another slice. Do not assume the pre-slice matrix still describes the
tree.

## Resume State

Every layer and convergence gate must emit a resume state block:

```text
Current layer:
Current gate:
Source commit:
Worktree state:
Active matrix / packet / slice artifact:
Authoritative artifact paths:
Completed lanes:
Pending lanes:
Rejected / superseded outputs:
Open blockers:
Reviewer findings blocking:
Stale-input check:
Mutation authorization:
Next legal action:
Actions explicitly not yet authorized:
```

The resume state is the operator's "you are here" marker. It must be updated
before stopping, before compaction handoff, and after any committed Layer 3
slice.

## Review Lanes

Use fresh agents. Do not reuse prior agent threads for a new layer or review
gate.

Recommended review lanes:

- Layer 1 matrix reviewer: checks lane completeness, one-row-per-rule coverage,
  source freshness, action vocabulary, conflicts, and no-edit compliance.
- Layer 2 packet reviewer: checks action-class sequencing, leverage, packet
  completeness, and slice readiness.
- Layer 3 reviewer: checks the slice-frame output contract and closure claim.
- Language/record reviewer: checks active artifact paths, record precedence,
  and resume-state clarity.

Accepted P1/P2 findings block dependent mutation or closure until repaired,
source-rejected, invalidated with later evidence, or explicitly removed from
the active slice boundary.

## Start And Stop Semantics

Start at the earliest layer whose input artifact is missing or stale:

- no reconciled action matrix: start at Layer 1;
- matrix exists but selected rules lack current decision packets: start at
  Layer 2;
- implementation-ready slice exists with current packets: start at Layer 3;
- completed slice exists but corpus state changed: restart at the post-slice
  Layer 1/Layer 2 selection gate by re-reading the matrix against live state.

Layer 3 still requires the Layer 3 entry warrant. Without it, return to the
Layer 2 convergence gate even if a historical slice plan exists.

Stop only at meaningful gates:

- after lane assignment is written but before agents begin;
- after Layer 1 convergence with a reconciled action matrix;
- after Layer 2 convergence with one selected implementation-ready slice;
- after Layer 3 closure with committed state and updated records;
- at a falsifier or blocker that prevents the current layer from producing its
  required artifact.

Do not stop mid-layer without a resume state block.

## Falsifiers

This frame is the wrong tool if:

- the task is one isolated rule and no corpus-level sequencing is needed;
- the task is one already-selected implementation slice with current packets;
- the work is a new ontology or product architecture design rather than
  remediation execution;
- the corpus cannot be bounded;
- the lower-level method frames are stale or missing and must be repaired
  before orchestration can be honest.

A reframe is required if:

- action classes repeatedly fail to produce bounded slices;
- Layer 3 slices keep invalidating large portions of the Layer 1 matrix;
- mutation cannot be sequenced because several live branches are actively
  rewriting the same authority-tree surface;
- the workstream discovers that the rule corpus is not the right unit of
  analysis.

## Review And Judgment Criteria

A valid use of this frame:

- can always answer which layer and gate the work is in;
- keeps `n = 1` classification and decision-packet methods intact;
- assigns Layer 1 fanout by stable tree area, not guessed action type;
- uses Layer 2 action classes for leverage without over-producing packets;
- sequences authority-state mutation in Layer 3;
- preserves per-rule obligations inside group work;
- records start/stop state strongly enough to survive compaction;
- updates durable records before claiming closure.

## Not A Plan

This frame defines gates, object shapes, and execution geometry. Current scope,
lane assignments, slice choices, and concrete rows live in the active artifacts
named by the Artifact Authority section. Historical ledger rows are not a
current plan unless the active domino or named workstream artifact cites them
as current inputs.

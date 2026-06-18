# Global Information Design Review

Role: Information Design Reviewer
Date: 2026-06-18
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`

## Review Scope

I reviewed the full Phase 2 packet suite under
`docs/projects/habitat-harness/phase2-workstream-packets/` and representative
OpenSpec changes that exercise the multi-artifact system:

- `openspec/changes/habitat-harness-scaffold/**`
- `openspec/changes/habitat-git-hook-hardening/**`
- `openspec/changes/habitat-enforcement-surface-cleanup/**`
- `openspec/changes/habitat-effect-grit-adapter/**` by heading map and
  relationship shape

I did not rely on prior-pass agent scratch. This review is about artifact
quality and execution readability only; it does not approve implementation.

## Reader Model

Primary reader: a future execution agent or workstream owner entering with no
chat context.

Reader tasks:

1. Pick the correct next artifact.
2. Understand the controlling authority and forbidden authority.
3. Convert one packet into an OpenSpec proposal/design/tasks/spec/workstream
   set without inventing missing context.
4. Verify and close with exact proof classes and non-claims.
5. Disposition P1/P2 findings without losing downstream realignment.

Navigation mode: random-access with frequent cross-reference. The artifact
system must work when an agent opens only one file first.

## Artifact Structure Standards

### 1. The Suite Index Owns Sequence, Not Detail

`phase2-workstream-packets/README.md` should remain the suite map. It should
not become a second proposal or global design.

Required index contents:

- packet purpose in one sentence per packet;
- authoritative dependency DAG;
- packetization decision table;
- global closure requirements;
- a traceability table from each packet to its future/current OpenSpec change
  id, if one exists;
- global stop conditions that apply before Phase 3 execution.

The current README is mostly strong, especially the sequence and packetization
table. The missing piece is an explicit packet-to-OpenSpec traceability table.
Without it, execution agents must infer whether a packet has been converted,
partially converted, or superseded.

### 2. Packets Own Product Slice Intent

Each D/G packet should answer: what is the slice, why does it exist, who owns
the boundary, who is forbidden from owning it, what does it consume, what does
it unblock, and what exact proof/non-claim shape will closure require.

Packet sections should stay compact and predictive. The repeated template is
acceptable only if each heading carries packet-specific information. Generic
sections such as `Current State-Space Problem` and `Solution Design` must name
the specific contradiction being removed, not merely restate the domain.

Required packet-only fields:

- product scenario;
- single domain owner and forbidden owners;
- dependency order and parallelism;
- public surface impact;
- proof classes and non-claims;
- validation command template with exact command, expected status,
  cache/freshness stance, injected bad case, and non-claim;
- stop conditions.

Packets should not carry implementation progress, completed tasks, or current
verification outcomes except as input evidence.

### 3. OpenSpec Proposal Owns Intent And Boundaries

`proposal.md` should be the high-scent entrypoint for a change. It should let a
reviewer decide whether the change is legitimate without reading the design.

Required proposal contents:

- why this change exists now;
- controlling authority refs;
- what changes and what does not change;
- dependencies and enabled parallel work;
- affected owners and forbidden owners;
- stop conditions;
- verification gate summary.

Proposal should not duplicate detailed design matrices, evidence logs, or task
progress. If evidence is needed, link to `workstream/source-synthesis.md` or an
evidence log.

### 4. Design Owns Decisions, Alternatives, And Boundary Mechanics

`design.md` should explain how the change works and why weaker alternatives
were rejected. Mature examples such as `habitat-git-hook-hardening/design.md`
and `habitat-enforcement-surface-cleanup/design.md` do this well by naming
frame, diagnosis, policy decisions, write set, proof design, and review lanes.

Required design contents:

- frame and falsifier;
- current diagnosis;
- state-space or authority-overlap reduction;
- selected design with rejected alternatives;
- write set;
- proof design;
- downstream proof boundaries;
- review lanes.

Design should not be a task checklist. Every task should be traceable back to a
design decision, but the design should not track task completion.

### 5. Spec Owns Normative Behavior

`specs/<capability>/spec.md` is the normative behavior contract. It should use
requirements and scenarios, not implementation plans.

Required spec contents:

- `ADDED`, `MODIFIED`, or `REMOVED` requirements;
- scenario clauses using concrete `WHEN` / `THEN` / `AND`;
- proof-relevant non-claims where they affect behavior.

Spec should not cite transient branch state, current command results, or review
disposition status. Those belong in workstream records.

### 6. Tasks Own Execution Steps

`tasks.md` should be executable without guessing. Tasks must be implementation
or artifact steps, not unresolved design questions.

Required task qualities:

- ordered by dependency, not by template habit;
- each task starts with a verb and names the artifact or behavior changed;
- review/disposition gates appear before dependent implementation;
- verification tasks name exact commands or exact proof artifact rows;
- closure tasks include review ledger, downstream ledger, and clean repo state.

Black-ice task phrasing to reject:

- "decide whether..." unless it is explicitly a pre-implementation decision
  gate with accepted outputs;
- "update docs" without naming the docs and the claim being changed;
- "verify" without command, expected result, proof class, and non-claim.

### 7. Workstream Ledgers Own Live State And Evidence

`workstream/phase-record.md` should be the compaction-safe continuity record,
not a second design document. It can be long, but each section must answer a
recovery question.

Required phase-record contents:

- active phase, owner, branch/Graphite state, status;
- controlling authority refs;
- scope and write set;
- completed and remaining tasks;
- open findings and dispositions;
- latest gate results with proof classes;
- dirty-file ownership if any;
- agent fleet state if any;
- downstream realignment state;
- next exact action.

Review disposition ledgers should contain only findings, severity, disposition,
required repair, status, and repair evidence. Downstream realignment ledgers
should contain only affected artifacts, current risk, disposition, exact next
action, and status.

### 8. Source Synthesis And Evidence Logs Are Evidence, Not Authority

`source-synthesis.md`, `evidence-log.md`, and similar records should state
their authority level. Historical evidence must be labeled as historical when
superseded. Current command proof must include branch/commit or enough state to
avoid accidental reuse in another worktree.

## Cross-Artifact Relationship Contract

Every implementation change should satisfy this relationship:

1. Packet defines the product slice and domain boundary.
2. Proposal narrows that packet into one OpenSpec change.
3. Design records the chosen mechanics and rejected alternatives.
4. Spec records normative behavior changes.
5. Tasks sequence implementation and verification.
6. Phase record captures live state, evidence, and next action.
7. Review disposition ledger blocks accepted P1/P2 findings until repaired or
   explicitly moved outside the closure claim.
8. Downstream realignment ledger patches or dispositions affected docs, specs,
   tests, guards, generated-output assumptions, and dependent packets.
9. Closure proof records exact proof classes and non-claims.

Minimum traceability row for each OpenSpec change:

| Source packet | Change id | Proposal boundary | Design decision ids | Spec requirements | Task ranges | Review ledger | Downstream ledger | Closure proof |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

This table can live in the suite README, a remediation index, or each packet's
converted OpenSpec record. It must exist somewhere stable before Phase 3 agents
start executing multiple packets in parallel.

## Black Ice Controls

Black ice is information that looks safe but makes an execution agent guess.
Reject or repair these patterns:

- stale absolute worktree paths in commands or authority refs;
- "green", "passed", or "validated" without command, exit status, branch/base,
  cache/freshness stance, and proof class;
- historical phase records cited as current proof;
- broad headings such as `Current State`, `Notes`, `Details`, or `Verification`
  when the section mixes evidence, decisions, and non-claims;
- duplicated authority context across proposal/design/phase record that can
  drift;
- D15/Effect language that sounds like a default migration instead of a
  trigger with a named contradictory state removed;
- candidate/registered/apply-safe pattern states represented by file presence
  or prose only;
- host-specific Civ7/MapGen behavior described as generic Habitat behavior;
- tasks checked complete while review ledgers still contain accepted P1/P2
  blockers;
- downstream ledger rows marked `patched` without naming the exact changed
  claim or no-patch rationale.

## Artifact Quality Rubric

Use this rubric as a gate for the remediation pass.

| Criterion | Pass | P2 Failure | P1 Failure |
| --- | --- | --- | --- |
| Information scent | Headings and file names predict contents and reader action. | Generic headings force local reading. | Agent cannot identify the right artifact or next action. |
| Hierarchy | Suite, packet, proposal, design, spec, tasks, and ledgers have distinct jobs. | Same context repeated in multiple artifacts. | Artifacts conflict or duplicate authority so closure can be claimed from the wrong file. |
| Cross-artifact traceability | Packet-to-change-to-task-to-proof path is explicit. | Trace exists only through prose links. | Agent must infer whether a packet is converted, superseded, or still pending. |
| Authority boundaries | One owner and forbidden owners are explicit. | Owner is named but consumer boundaries are vague. | Two artifacts or domains can both claim the same decision. |
| Proof separation | Proof classes and non-claims are named with exact commands. | Proof labels exist but cache/freshness or injected bad case is missing. | One proof class can be substituted for another. |
| Task executability | Tasks are ordered, concrete, and close over evidence. | Tasks include vague "update/verify/decide" wording. | Tasks are unresolved design questions or allow implementation before blocker disposition. |
| Ledger discipline | Review and downstream ledgers are compact control records. | Ledgers include narrative that obscures status. | Accepted P1/P2 findings or downstream risks lack blocking status and repair evidence. |
| Temporal integrity | Historical/current/superseded evidence is labeled. | Dates/branches exist but reuse boundary is unclear. | Stale branch/worktree evidence can be reused as current closure proof. |

## P1 Risks

| ID | Risk | Why It Blocks | Suggested Repair |
| --- | --- | --- | --- |
| INFO-P1-001 | Phase 2 packets contain many absolute paths to the prior prep worktree (`wt-codex-habitat-toolkit-domain-refactor-frame`) inside command templates and authority refs. | Execution agents in the remediation worktree can run proof commands or inspect source in the wrong checkout. That invalidates proof provenance and can hide current-branch drift. | Add a path policy to the suite index: source-prep paths are provenance only; executable commands must be rewritten to repo-relative or current-worktree paths in each OpenSpec change before implementation. Add a validation check that rejects stale worktree paths in executable command rows. |
| INFO-P1-002 | There is no visible packet-to-OpenSpec traceability table for the D0-D15/G-HOST suite. | Agents can implement from a packet, an older OpenSpec change, or a workstream ledger without knowing which artifact is authoritative for the current slice. Parallel execution increases the risk of duplicated or contradictory closure claims. | Add a traceability index with one row per packet: source packet, target change id, status, controlling proposal/design/spec/tasks paths, review ledger path, downstream ledger path, closure proof path, and supersession notes. |
| INFO-P1-003 | Historical evidence records and phase records are useful but numerous; some representative OpenSpec changes rely on supersession notes to keep old proof from becoming current proof. | If a remediation agent copies command evidence from a phase record or evidence log without checking supersession/current-branch labels, it can close a packet from stale proof. | Require every evidence-bearing artifact to carry `Current`, `Historical`, or `Superseded` status near the top. Closure records must cite only current evidence or explicitly say why historical evidence is provenance-only. |

## P2 Risks

| ID | Risk | Why It Matters | Suggested Repair |
| --- | --- | --- | --- |
| INFO-P2-001 | The D packet template is useful but flat: most packets repeat the same 14 sections at the same hierarchy level. | Readers get consistency but not emphasis. Critical blockers, trigger-only packets, and simple fence packets look structurally equivalent. | In each packet, promote only the packet-specific control points: blocker dependencies, public surface impact, stop conditions, and validation proof. Move low-variance material into compact tables. |
| INFO-P2-002 | Proposal/design/tasks/spec artifacts often restate similar authority and proof context. | Repetition increases drift. A future edit can patch a task or design row while leaving proposal/spec wording stale. | Define single-source rules: proposal owns boundary, design owns mechanics, spec owns SHALL behavior, tasks own execution, phase record owns evidence. Replace duplicated paragraphs with links plus one-line scope pointers. |
| INFO-P2-003 | Some ledgers use `patched`, `accepted`, or `no-edit-needed` without an explicit changed-claim summary in the row. | A reviewer can see status but not what semantic claim changed, so downstream realignment becomes hard to audit. | Require ledger rows to name the exact claim patched or the exact reason no patch was needed. Keep narrative out of the table unless it changes disposition. |
| INFO-P2-004 | D15 is correctly trigger-only, but representative packets show Effect/substrate decisions can still sprawl across proposal, design, tasks, spec, and separate decision records. | The same substrate decision can be read as global architecture policy rather than packet-local minimization. | Add a standard `Substrate Decision Boundary` block: trigger scenario, contradictory state removed, local DTO alternative rejected, adopted/rejected, reopen triggers, non-claims. Use it everywhere D15 is referenced. |
| INFO-P2-005 | Workstream phase records are compaction-safe but can become long mixed logs. | Long records are valuable for continuity, but agents may miss the current action, open blockers, or proof status. | Put a compact `Current Continuity Snapshot` at the top of every phase record: status, open blockers, latest proof, dirty state, next action. Keep detailed evidence below. |

## Recommended Remediation Sequence

1. Add the global traceability/index standard before converting more packets.
2. Repair stale-path policy and executable command path rules.
3. Add current/historical/superseded status labels to evidence-bearing
   artifacts.
4. Normalize the proposal/design/spec/tasks/ledger role boundaries.
5. Apply the rubric as a review gate to each converted OpenSpec packet before
   allowing implementation work.

## Bottom Line

The Phase 2 packet suite has strong domain-boundary thinking and unusually good
proof/non-claim discipline. The main information-design risk is not missing
content; it is too much similarly-shaped content across too many artifacts
without a single traceability spine. Add the spine, reject stale executable
paths, and make each artifact own exactly one job.

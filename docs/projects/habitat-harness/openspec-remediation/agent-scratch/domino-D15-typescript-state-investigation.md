# D15 TypeScript State-Space And Validation Review

## Verdict

D15 is correctly framed as a dormant Command Observation Trigger packet, not as a default Effect/process-substrate migration. The active packet consistently rejects shared substrate work without a trigger and keeps source implementation blocked unless a consuming packet records a concrete local representation failure.

The packet is not yet complete-standard accepted for design/specification in the TypeScript state-space lane. No P1 blocker is present. Two P2 blockers remain:

1. the accepted trigger artifact shape is not falsifiable enough to prevent prose-only local DTO rejection and later optional/flag-soup substrate design;
2. the consumer set is inconsistent across the packet index and D15/G-HOST artifacts, leaving G-HOST trigger authority ambiguous.

Design-time validation commands passed on this disk state:

- `bun run openspec -- validate deep-habitat-d15-execution-provenance-trigger --strict`: passed.
- `bun run openspec:validate`: passed, 249 items valid.
- `git diff --check`: passed.

Review anchoring note: I read the requested design skills available in this runtime: Domain Design, Information Design, Ontology Design, Solution Design, System Design, Testing Design, TypeScript, Civ7 Systematic Workstream, Civ7 OpenSpec Workstream, root `AGENTS.md`, OpenSpec source-map/phase-loop/validation references, and current D15/code inputs. I could not locate a separate TypeScript refactoring skill bundle containing `references/smell-catalog.md`, `references/refactoring-mechanics.md`, `references/paradigms-and-patterns.md`, `references/llm-slop-cleanup.md`, `references/worked-examples.md`, or "both assets" in the installed skill roots. I used the available TypeScript `SKILL.md`, `references/refactoring-patterns.md`, `references/where-defaults-hide.md`, `references/axes.md`, and `references/design-patterns.md` instead.

## Findings

### P2: Trigger artifact can still be satisfied by assertion instead of a falsifiable state-space record

The D15 trigger request contract requires a "concrete contradictory state" and an "exact local DTO/projection alternative attempted or rejected," then asks for "validation gates that falsify the contradiction." That is directionally right, but it does not require the consuming packet to publish a local DTO/projection trigger artifact precise enough to rule out ordinary TypeScript alternatives first.

References:

- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:71`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:73`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:76`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:77`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:83`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/specs/habitat-harness/spec.md:15`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/specs/habitat-harness/spec.md:22`

Why this blocks acceptance:

The current Habitat code already has a general command-observation DTO:

- `HabitatProcessRequest` has optional `env`, `scanRoots`, `cachePolicy`, and `nonClaims`.
- `HabitatCommandResult` carries `gitState`, `cachePolicy`, `parseStatus`, `failureTag | null`, output captures, and exit state.
- `GritApplyTransactionProof` has nullable command slots for dry-run/apply/biome/gates/rollback/copy.

References:

- `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/habitat-process.ts:27`
- `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/habitat-process.ts:35`
- `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/habitat-process.ts:45`
- `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/habitat-process.ts:56`
- `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/habitat-process.ts:70`
- `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/habitat-process.ts:71`
- `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/grit-apply.ts:74`
- `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/grit-apply.ts:79`
- `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/grit-apply.ts:83`

That existing code is a present-behavior record, not target authority. Without a stronger trigger artifact, a future agent can claim "local DTO rejected" in prose, then introduce a shared record that merely centralizes the same optional/null state space. That is the TypeScript smell "boolean flags & optional soup" plus "leaky boundaries": the design would widen representable states instead of removing a named contradiction.

Required repair:

Add a trigger-artifact requirement to `design.md`, `spec.md`, and tasks that requires a consuming packet to provide a local DTO sufficiency artifact before D15 can move beyond `dormant`. The artifact must include:

- the local discriminated union/typestate/projection shape attempted;
- the exact impossible or contradictory state that remains representable locally;
- the exact command family and owner packet;
- the required observation fields, not a whole `HabitatCommandResult` or verification-artifact-shaped record;
- a negative fixture or typed example showing the contradiction;
- the proposed shared substrate discriminants that make the contradiction unrepresentable;
- why safe local TypeScript moves were insufficient: discriminated union input, ADT plus exhaustive handling, DTO/domain separation, boundary parsing, or typed Result/tagged error projection.

Acceptance standard:

D15 remains dormant unless the trigger artifact demonstrates measured state-space reduction. A prose-only claim that local DTOs were "insufficient" must keep D15 dormant.

### P2: G-HOST trigger authority is inconsistent across control artifacts

D15's proposal, design, downstream ledger, and G-HOST downstream ledger treat G-HOST as a dormant D15 trigger consumer. The pre-repair packet index and source packet omitted G-HOST from the D15 trigger-consumer set, leaving the authority surface inconsistent.

References:

- `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/openspec-remediation/packet-index.md:35`
- `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/phase2-workstream-packets/D15-execution-provenance-substrate-trigger.md:28`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/proposal.md:31`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/proposal.md:42`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:69`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:119`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/downstream-realignment-ledger.md:9`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-host-policy-boundary-gate/workstream/downstream-realignment-ledger.md:19`

Why this blocks acceptance:

D15's state machine is only safe if the consumer set is exact. If G-HOST is a valid trigger consumer, the packet index must say so because it is the active sequencing table. If G-HOST is not a valid trigger consumer, the D15 proposal/design/downstream ledger should not mention it as a trigger source. Leaving both statements in place creates an authority gap around host-policy command/projection observations.

Required repair:

Choose one complete-standard consumer set and align every control artifact:

- Option A: include G-HOST in the packet-index D15 Requires cell and source-packet/current D15 consumer language as a dormant trigger consumer.
- Option B: remove G-HOST as a D15 trigger consumer from D15 proposal/design/downstream records and keep G-HOST only as a non-trigger adjacent domain.

Acceptance standard:

The packet index, D15 proposal/design/spec/tasks/workstream records, G-HOST downstream ledger, and source packet must agree on whether G-HOST can trigger D15.

### P3: "Implementation Readiness" wording should be conditional on a later accepted trigger

The design includes an "Implementation Readiness" section saying "Before implementation starts, the executor must have..." The surrounding packet is clear that D15 is dormant and non-implementing, and the phase record preserves that boundary. Still, this heading is easy for a later implementer to read as D15 implementation-readiness rather than "only if a later trigger-accepted packet exists."

References:

- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:88`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/phase-record.md:36`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/closure-checklist.md:30`

Suggested repair:

Rename the section to "Later Trigger-Accepted Implementation Readiness" and add one lead sentence: "This section applies only after a consuming packet has moved D15 from `dormant` to `trigger-accepted` through the trigger-artifact contract."

### P3: Wording/control audit glob is inconsistent with the D15 scratch naming convention

The pre-repair tasks file used an outdated D15 scratch glob, while the context router, closure checklist, and actual review files use the `domino-D15-*.md` convention.

References:

- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/tasks.md:31`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/phase-record.md:32`
- `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/closure-checklist.md:21`
- `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/openspec-remediation/context.md:318`
- `$ACTIVE_REMEDIATION_WORKTREE/docs/projects/habitat-harness/openspec-remediation/context.md:327`

Suggested repair:

Change the tasks audit glob to `$AGENT_SCRATCH/domino-D15-*.md`.

## TypeScript State-Space Assessment

D15's desired TypeScript posture is trigger-gated and mostly right:

- Safety budget: high enough to require state-space reduction, but not high enough to authorize type-level cleverness or framework migration by default.
- API shape: packet-local data-first DTOs/projections should remain the default.
- Boundary rigidity: D15 must stay behind an OpenSpec trigger boundary and must not leak current `HabitatCommandResult` or verification-artifact-shaped internals into public command contracts.
- Type origin: future public output fields must derive from D0/D1 compatibility/output-family handling, not from current module names.
- Error channel: future command failures should use closed tagged variants for expected command-family failures; existing `failureTag | null` should not become the target shape by inertia.
- Extension model: closed, owner-specific command-family variants first; open shared substrate only after a named local-state contradiction.

Current code already demonstrates why D15 must stay dormant by default:

- `HabitatCommandResult` is a general observation record with nullable failure state.
- `CommandCachePolicy` can say cache observability is unknown, fresh, cache-hit, or replay, but the current D15 packet does not need to standardize that globally.
- `GritApplyTransactionProof` already represents many D9 transaction states locally through command slots, changed paths, file digests, rollback command, and non-claims.
- Tests cover missing binary, nonzero command, redaction, workspace routing, rollback failure, interruption, gate failure, and isolated-copy transaction records as current behavior.

That means a future D15 activation must not merely centralize these fields. It must prove that a local discriminated DTO/projection cannot represent a specific reachable command-observation state without contradiction.

## Acceptance Blocker List

- Blocker P2-1: Add a falsifiable local DTO sufficiency artifact contract that prevents assertion-only trigger acceptance and optional command-result substrate design.
- Blocker P2-2: Align the D15 consumer set, especially G-HOST, across packet index, source packet, proposal, design, downstream ledgers, and G-HOST records.

No P1 blockers were found in this TypeScript state-space and validation review. P2 blockers remain, so D15 should not be marked accepted for design/specification until repaired and rereviewed.

## Required Repairs

1. Patch `design.md` and `spec.md` to require a trigger artifact with local DTO/projection shape, contradiction fixture, required field set, proposed discriminants, and safe TypeScript alternatives rejected.
2. Patch `tasks.md` to add the trigger artifact as a design-time gate before D15 can leave `dormant`.
3. Align the G-HOST consumer decision across the packet index and all D15/G-HOST control records.
4. Rename the implementation-readiness heading to make it explicitly conditional on a later `trigger-accepted` packet.
5. Replace the outdated D15 scratch audit glob with `$AGENT_SCRATCH/domino-D15-*.md`.

## Skills Used

Skills used: domain-design, information-design, ontology-design, solution-design, system-design, testing-design, typescript, civ7-systematic-workstream, civ7-open-spec-workstream.

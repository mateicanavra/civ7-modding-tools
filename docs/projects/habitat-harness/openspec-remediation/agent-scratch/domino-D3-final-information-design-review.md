# D3 Final Information-Design Review

## Verdict

Accepted for design/specification only.

D3 now reads as one execution authority for the complete Workspace Graph
Integration contract, not as a `habitat:rule:biome-ci` or biome-ci-only repair.
No accepted P1 or P2 blockers remain in the active repaired packet.

This does not make D3 implementation-complete or source-implementation-ready.
Source implementation remains blocked until concrete D0 public-surface rows and
live D2 graph projection implementation facts exist.

## Inputs Re-Read

- `$D3_NEGATIVE_REVIEW`, especially the Superseding Control Note and repaired
  P2-2/Required Repairs wording.
- `$D3_SOURCE_PACKET`.
- All active files under `$D3_CHANGE`.
- `$REMEDIATION_DIR/context.md`.
- `$REMEDIATION_DIR/packet-index.md`.
- The six D3 investigation scratch docs named in `$D3_REVIEW_LEDGER`.
- Current code topology evidence in `$HABITAT_TOOL/src/plugin.js`,
  `$HABITAT_TOOL/src/lib/nx-projects.ts`, and
  `$HABITAT_TOOL/src/lib/command-engine.ts`.

## Acceptance Basis

The negative control now explicitly says it is active negative-control evidence,
not current design guidance, and that historical reduced-solution wording is
superseded by the complete Workspace Graph Integration standard
(`$D3_NEGATIVE_REVIEW:1` through `$D3_NEGATIVE_REVIEW:7`). The repaired D3
packet satisfies that corrected standard.

The proposal frames the full authority rather than the falsifier alone:
Workspace Graph owns project ownership, target availability, workspace gates,
and rule-target alias dependency declarations (`$D3_CHANGE/proposal.md:5`
through `$D3_CHANGE/proposal.md:9`). It also states that biome-ci is not the
whole scope and that same-project dependencies, explicit project dependencies,
aggregate/workspace dependencies, and multi-dependency targets must all be
modeled through one graph authority (`$D3_CHANGE/proposal.md:47` through
`$D3_CHANGE/proposal.md:51`).

The design now contains the decision center that earlier reviews found missing:
it diagnoses the three current graph authorities (`$D3_CHANGE/design.md:17`
through `$D3_CHANGE/design.md:23`), names the broader dependency topology
problem (`$D3_CHANGE/design.md:34` through `$D3_CHANGE/design.md:48`), defines
the Workspace Graph module boundary (`$D3_CHANGE/design.md:74` through
`$D3_CHANGE/design.md:88`), and makes the target/dependency/refusal model
normative (`$D3_CHANGE/design.md:114` through `$D3_CHANGE/design.md:227`).

The dependency-declaration challenge is repaired. `TargetDependencyDeclaration`
is a closed source topology model with same-project target dependency, explicit
project target dependency, aggregate/workspace dependency, and multi-dependency
target relationship variants (`$D3_CHANGE/design.md:182` through
`$D3_CHANGE/design.md:201`). The constraints define resolution/failure behavior
for same-project, explicit-project, aggregate, and multi-dependency cases
(`$D3_CHANGE/design.md:204` through `$D3_CHANGE/design.md:218`), and the
topology table ties those variants to the current `plugin.js` shapes
(`$D3_CHANGE/design.md:281` through `$D3_CHANGE/design.md:295`).

The spec now constrains the dangerous states rather than just OpenSpec shape:
singular graph authority and full inventory (`$D3_CHANGE/specs/habitat-harness/spec.md:3`
through `$D3_CHANGE/specs/habitat-harness/spec.md:20`), closed target facts
(`$D3_CHANGE/specs/habitat-harness/spec.md:22` through
`$D3_CHANGE/specs/habitat-harness/spec.md:42`), resolved alias dependencies and
all dependency declaration kinds (`$D3_CHANGE/specs/habitat-harness/spec.md:44`
through `$D3_CHANGE/specs/habitat-harness/spec.md:93`), shared plugin/service
validation (`$D3_CHANGE/specs/habitat-harness/spec.md:94` through
`$D3_CHANGE/specs/habitat-harness/spec.md:113`), and explicit
classify/check/verify scope (`$D3_CHANGE/specs/habitat-harness/spec.md:115`
through `$D3_CHANGE/specs/habitat-harness/spec.md:132`).

The tasks are implementation-guiding rather than design prompts. They require D0
and D2 preconditions before source edits (`$D3_CHANGE/tasks.md:3` through
`$D3_CHANGE/tasks.md:8`), concrete dependency-declaration replacement and
coverage for biome-ci, boundaries, generated:check, and broad gates
(`$D3_CHANGE/tasks.md:10` through `$D3_CHANGE/tasks.md:18`), graph service and
refusal implementation (`$D3_CHANGE/tasks.md:19` through `$D3_CHANGE/tasks.md:25`),
plugin/classify/verify migration (`$D3_CHANGE/tasks.md:27` through
`$D3_CHANGE/tasks.md:43`), deletion checks (`$D3_CHANGE/tasks.md:45` through
`$D3_CHANGE/tasks.md:50`), and falsifying validation (`$D3_CHANGE/tasks.md:52`
through `$D3_CHANGE/tasks.md:65`).

The workstream controls now mirror the stronger design instead of lowering it:
the phase record names the complete objective and D0/D2 blockers
(`$D3_PHASE_RECORD:12` through `$D3_PHASE_RECORD:25`), validation result rows
cover graph units, plugin inference, classify, inventory, dependency kinds,
biome-ci alias run, verify, OpenSpec, and diff checks (`$D3_PHASE_RECORD:47`
through `$D3_PHASE_RECORD:62`), the downstream ledger names D4/D7/D12 allowed
facts and non-claims (`$D3_DOWNSTREAM_LEDGER:11` through
`$D3_DOWNSTREAM_LEDGER:18`), and the closure checklist rejects biome-ci-only
acceptance (`$D3_CLOSURE_CHECKLIST:5` through `$D3_CLOSURE_CHECKLIST:13`).

## Current Code Falsifier Coverage

The repaired model covers the actual dependency shapes in current `plugin.js`:

- Same-project dependency shape: `nx-boundaries` aliases `boundaries`, which is
  currently produced by string input to `aliasRuleTarget`
  (`$HABITAT_TOOL/src/plugin.js:203` through `$HABITAT_TOOL/src/plugin.js:207`).
- Explicit project dependency shape: grit and generated-zone aliases currently
  pass explicit `{ projects, target }` dependencies
  (`$HABITAT_TOOL/src/plugin.js:213` through `$HABITAT_TOOL/src/plugin.js:222`).
- Aggregate/multi-dependency shape: `generated:check` has multiple explicit child
  dependencies (`$HABITAT_TOOL/src/plugin.js:130` through
  `$HABITAT_TOOL/src/plugin.js:143`).
- Live false-green shape: `dependencyForTarget` still colon-splits strings in
  current source (`$HABITAT_TOOL/src/plugin.js:182` through
  `$HABITAT_TOOL/src/plugin.js:189`), and `aliasRuleTarget` still emits a no-op
  wrapper (`$HABITAT_TOOL/src/plugin.js:190` through
  `$HABITAT_TOOL/src/plugin.js:197`). D3 now makes those current states
  implementation targets to remove, not accepted architecture.

## P1 Findings

None.

## P2 Findings

None.

## P3 Findings

### P3-1: Post-review status records still need the normal acceptance update

This is sequencing fallout, not a D3 contract blocker. The active workstream
records correctly say D3 remains pending fresh final rereview
(`$D3_PHASE_RECORD:3` through `$D3_PHASE_RECORD:10`,
`$D3_REVIEW_LEDGER:65` through `$D3_REVIEW_LEDGER:75`,
`$D3_CLOSURE_CHECKLIST:13` through `$D3_CLOSURE_CHECKLIST:16`,
`$D3_DOWNSTREAM_LEDGER:38` through `$D3_DOWNSTREAM_LEDGER:42`, and
`$REMEDIATION_DIR/packet-index.md:22`).

After this review is dispositioned, update those status rows to record that D3
is accepted for design/specification, final review found no unresolved P1/P2
blockers, and D3 is not implementation-complete.

### P3-2: One task line can be tightened to avoid "decide during implementation" wording

`$D3_CHANGE/tasks.md:34` says to "Decide every unresolved alias representation
through the D3 data flow." The design and spec already make the intended
decision: unresolved aliases are withheld from runnable alias output and
represented as graph refusals for classify/verify; a command-facing failing
target is allowed only if D0 compatibility covers it (`$D3_CHANGE/design.md:268`
through `$D3_CHANGE/design.md:274`, `$D3_CHANGE/specs/habitat-harness/spec.md:100`
through `$D3_CHANGE/specs/habitat-harness/spec.md:108`).

This is not a blocker because the higher-authority artifacts constrain the
choice. A small wording cleanup from "Decide" to "Apply the D3 data-flow
decision for every unresolved alias representation" would remove the last soft
implementation-time scent.

## Design/Specification Acceptance

D3 can be accepted for design/specification only.

Acceptance means downstream design packets may rely on the named D3 graph facts
and non-claims after the review ledger and packet index are updated. Acceptance
does not authorize source edits. D3 source implementation remains blocked behind:

- concrete D0 rows for classify JSON, verify output/target plan, Nx inferred
  targets, root scripts, package exports, and docs/examples
  (`$D3_CHANGE/proposal.md:79` through `$D3_CHANGE/proposal.md:86`,
  `$D3_CHANGE/design.md:297` through `$D3_CHANGE/design.md:305`);
- live D2 graph projection implementation facts wherever D3 consumes registry
  graph declarations (`$D3_CHANGE/specs/habitat-harness/spec.md:134` through
  `$D3_CHANGE/specs/habitat-harness/spec.md:145`);
- the approved implementation write set and protected paths
  (`$D3_CHANGE/design.md:319` through `$D3_CHANGE/design.md:343`).

## Information-Design And Path-Router Assessment

No blocking information-design repair remains. The artifact set now has a clear
reader path: proposal for scope and non-claims, design for the decision center,
spec for normative scenarios, tasks for execution, phase record for validation
recording, review ledger for disposition, downstream ledger for D4/D7/D12
handoffs, and closure checklist for readiness.

No path-router repair is required. Durable D3 artifacts reference
`$REMEDIATION_DIR/context.md` variables and templates rather than repeating the
active worktree path. The router itself intentionally stores the active
operational checkout values (`$REMEDIATION_DIR/context.md:13` through
`$REMEDIATION_DIR/context.md:17`) and defines the usage rule for durable
artifacts (`$REMEDIATION_DIR/context.md:62` through
`$REMEDIATION_DIR/context.md:71`).

## Validation Run During Final Review

- `bun run openspec -- validate deep-habitat-d3-workspace-graph-boundary --strict`
  passed.
- `bun run openspec:validate` passed.
- `git diff --check` passed.

These are structural review checks only. They do not prove D3 runtime behavior,
dependency execution, public compatibility, downstream packet acceptance, or
implementation readiness.

## Non-Claims

- This review does not edit or authorize source implementation.
- This review does not accept D4, D7, or D12.
- This review does not claim `habitat:rule:biome-ci` is the scope boundary; it is
  a mandatory live falsifier/regression probe for the complete graph authority.
- This review does not claim current source code is correct. Current source code
  still contains the split graph truth D3 is designed to repair.

Skills used: domain-design, information-design, solution-design, system-design,
typescript-refactoring.

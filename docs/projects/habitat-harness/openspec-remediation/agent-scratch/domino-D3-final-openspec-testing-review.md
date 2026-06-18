# D3 Final OpenSpec / Testing Review

## Verdict

Accepted for design/specification only.

D3 now satisfies the complete Workspace Graph Integration acceptance standard in
the OpenSpec packet. The repaired artifacts no longer reduce D3 to a
`habitat:rule:biome-ci` or alias-only patch. The `biome-ci` case is correctly
kept as a live falsifier/regression probe, while the packet now specifies the
full graph authority: owner roots, target names, current Nx project/target
availability, dependency declaration kinds, resolved dependency relationships,
aggregate/workspace targets, graph read/refusal states, classify/check/verify
consumer projections, D0/D2 source blockers, and D4/D7/D12 downstream
non-claims.

D3 is not implementation-ready. Source implementation remains blocked until
concrete D0 public-surface rows exist for every touched durable surface and D2
graph projection implementation facts exist wherever D3 consumes live registry
graph declarations.

## Sources Re-read

- `$D3_NEGATIVE_REVIEW`, including the Superseding Control Note and repaired
  P2-2/Required Repairs framing.
- `$D3_CHANGE/proposal.md`
- `$D3_CHANGE/design.md`
- `$D3_CHANGE/tasks.md`
- `$D3_CHANGE/specs/habitat-harness/spec.md`
- `$D3_PHASE_RECORD`
- `$D3_REVIEW_LEDGER`
- `$D3_DOWNSTREAM_LEDGER`
- `$D3_CLOSURE_CHECKLIST`
- `$REMEDIATION_DIR/context.md`
- `$REMEDIATION_DIR/packet-index.md`
- `$D3_SOURCE_PACKET`
- Six D3 investigation scratch docs under `$AGENT_SCRATCH/domino-D3-*-investigation.md`
- Present-state evidence from `$HABITAT_TOOL/src/plugin.js`
- D0/D2 dependency posture by targeted search over D0/D2 OpenSpec artifacts and
  `$REMEDIATION_DIR/packet-index.md`

## Validation Run

- `bun run openspec -- validate deep-habitat-d3-workspace-graph-boundary --strict` passed.
- `bun run openspec:validate` passed: 249 items passed, 0 failed.
- `git diff --check` passed.
- Targeted lowering-language scan found no remaining acceptance-lowering use of
  fallback/temporary/dual-path/silent-skip/biome-only language in the D3 packet.

These gates prove OpenSpec shape and local artifact hygiene only. They do not
prove source behavior, graph execution, D0 compatibility, D2 implementation
facts, or runtime target correctness.

## P1 Findings

None.

The repaired D3 packet now makes the live false-green alias a blocking contract
without making it the packet boundary. `$D3_CHANGE/proposal.md:42` through
`$D3_CHANGE/proposal.md:51` explicitly says the `biome-ci` falsifier is not the
whole scope and names same-project, explicit-project, aggregate/workspace, and
multi-dependency relationships as in-scope D3 declarations. `$D3_CHANGE/design.md:34`
through `$D3_CHANGE/design.md:48` repeats the same standard and rejects a
`biome-ci`-only fix at `$D3_CHANGE/design.md:400` through
`$D3_CHANGE/design.md:407`.

## P2 Findings

None.

The dependency declaration challenge is repaired. `$D3_CHANGE/design.md:182`
through `$D3_CHANGE/design.md:201` defines `TargetDependencyDeclaration` as a
closed union covering:

- `same-project-target-dependency`
- `explicit-project-target-dependency`
- `aggregate-workspace-dependency`
- `multi-dependency-target-relationship`

The resolution/refusal rules are normative at `$D3_CHANGE/design.md:204`
through `$D3_CHANGE/design.md:220`, and the topology table at
`$D3_CHANGE/design.md:281` through `$D3_CHANGE/design.md:295` ties those kinds
to current `plugin.js` examples. The spec covers the same families at
`$D3_CHANGE/specs/habitat-harness/spec.md:49` through
`$D3_CHANGE/specs/habitat-harness/spec.md:92`, and tasks add implementation and
test gates at `$D3_CHANGE/tasks.md:12` through `$D3_CHANGE/tasks.md:17` and
`$D3_CHANGE/tasks.md:57` through `$D3_CHANGE/tasks.md:62`.

## P3 Findings

### P3-1: One ledger repair-evidence term uses `WorkspaceTargetFact` while the design uses `WorkspaceTargetState`

`$D3_REVIEW_LEDGER:18` and `$D3_REVIEW_LEDGER:55` refer to
`WorkspaceTargetFact`; the normative design uses `WorkspaceTargetState` at
`$D3_CHANGE/design.md:125`. This is not a blocker because the surrounding repair
evidence points to the correct design section, and the spec phrases the
requirement as closed target facts rather than freezing a TypeScript type name.

Suggested cleanup after acceptance: normalize the ledger wording to
`WorkspaceTargetState` or explicitly say "target fact/state model" so the
ledger cannot seed a second type name during implementation.

## Acceptance Rationale

### Complete Authority Contract

The proposal and design now define D3 as the single graph-truth authority. The
proposal states that commands must not appear runnable when project, target,
dependency declaration, or relationship cannot resolve at `$D3_CHANGE/proposal.md:27`
through `$D3_CHANGE/proposal.md:30`. The design assigns Workspace Graph
Integration ownership of graph read status, project identity, owner roots,
target-name policy, dependency declaration construction, target facts, and
refusal/error states at `$D3_CHANGE/design.md:50` through
`$D3_CHANGE/design.md:72`.

The current code falsifier remains accurately described. `$HABITAT_TOOL/src/plugin.js:17`
through `$HABITAT_TOOL/src/plugin.js:24` owns a local `OWNER_ROOTS` map,
`$HABITAT_TOOL/src/plugin.js:182` through `$HABITAT_TOOL/src/plugin.js:189`
colon-splits target names, `$HABITAT_TOOL/src/plugin.js:190` through
`$HABITAT_TOOL/src/plugin.js:197` emits the no-op alias wrapper, and
`$HABITAT_TOOL/src/plugin.js:208` through `$HABITAT_TOOL/src/plugin.js:212`
routes `biome-ci` through the bad string path. D3 now treats those as
present-state evidence to eliminate, not as authority to preserve.

### Plugin / Service Data Flow

The previous implementation-time ambiguity is closed. `$D3_CHANGE/design.md:248`
through `$D3_CHANGE/design.md:279` defines one validation path:

- `workspace-graph-contract.js` is declarative plus validation-capable.
- `workspace-graph.ts` reads Nx metadata and calls the same validation helpers.
- `plugin.js` emits inferred targets only from validated contract output.
- `command-engine.ts` renders D0-compatible output from graph projections and
  may not reconstruct graph truth.

Unresolved aliases are explicitly non-runnable graph refusals, and any
command-facing failure must be D0-covered rather than a `node -e ""` success
path.

### Requirement Families And Bad Cases

The spec now covers the relevant families:

- singular graph authority and full graph inventory:
  `$D3_CHANGE/specs/habitat-harness/spec.md:3` through
  `$D3_CHANGE/specs/habitat-harness/spec.md:20`
- closed target states and graph read failure:
  `$D3_CHANGE/specs/habitat-harness/spec.md:22` through
  `$D3_CHANGE/specs/habitat-harness/spec.md:42`
- alias dependency resolution/refusal and dependency declaration kinds:
  `$D3_CHANGE/specs/habitat-harness/spec.md:44` through
  `$D3_CHANGE/specs/habitat-harness/spec.md:92`
- shared plugin/classify/verify validation path:
  `$D3_CHANGE/specs/habitat-harness/spec.md:94` through
  `$D3_CHANGE/specs/habitat-harness/spec.md:113`
- classify/check/verify consumer scope:
  `$D3_CHANGE/specs/habitat-harness/spec.md:115` through
  `$D3_CHANGE/specs/habitat-harness/spec.md:132`
- D0/D2 blockers and downstream fact boundaries:
  `$D3_CHANGE/specs/habitat-harness/spec.md:134` through
  `$D3_CHANGE/specs/habitat-harness/spec.md:165`

### Validation Gates

The validation plan is falsifying, not smoke-test driven. `$D3_CHANGE/tasks.md:54`
through `$D3_CHANGE/tasks.md:65` requires workspace graph tests, plugin tests,
classify tests, a full-domain graph inventory oracle, corrected `biome-ci`
dependency assertion, cache-disabled alias/dependency execution evidence,
classify JSON state distinction, dependency-kind cases, graph bad cases,
OpenSpec validation, and `git diff --check`.

The phase record mirrors that gate set at `$D3_PHASE_RECORD:51` through
`$D3_PHASE_RECORD:62`. The closure checklist preserves the design versus later
implementation distinction at `$D3_CLOSURE_CHECKLIST:18` through
`$D3_CLOSURE_CHECKLIST:37`.

### D0 / D2 And Downstream State

D3 correctly separates design acceptance from source readiness.
`$D3_CHANGE/proposal.md:79` through `$D3_CHANGE/proposal.md:86`,
`$D3_CHANGE/design.md:297` through `$D3_CHANGE/design.md:305`,
`$D3_CHANGE/tasks.md:3` through `$D3_CHANGE/tasks.md:8`, and
`$D3_PHASE_RECORD:20` through `$D3_PHASE_RECORD:32` all block source edits until
concrete D0 rows and D2 live graph projection facts exist.

Downstream realignment is now concrete enough for design/spec acceptance.
`$D3_DOWNSTREAM_LEDGER:13` through `$D3_DOWNSTREAM_LEDGER:17` names the D4, D7,
and D12 graph facts and non-claims, and `$D3_DOWNSTREAM_LEDGER:21` through
`$D3_DOWNSTREAM_LEDGER:36` records public/durable compatibility dependencies and
D0/D2 source blockers.

## Required Repairs After This Review

No P1/P2 OpenSpec, testing, or control-state repairs are required before D3
design/specification acceptance.

Control-state follow-up required after accepting this review:

- Add this final review to `$D3_REVIEW_LEDGER`.
- Update `$D3_CLOSURE_CHECKLIST` fresh-review/OpenSpec validation rows with this
  review and the validation results above.
- Update `$REMEDIATION_DIR/packet-index.md` D3 status to accepted for
  design/specification only, not implementation-complete.
- Optionally apply the P3 terminology cleanup in `$D3_REVIEW_LEDGER`.

## Non-Claims

- This review does not authorize source implementation.
- This review does not accept D0 or D2 implementation completion.
- This review does not prove `habitat:rule:biome-ci` source behavior is fixed;
  current source still exhibits the false-green risk until D3 is implemented.
- Passing OpenSpec validation proves artifact shape, not graph behavior.
- D3 graph availability does not prove target execution success.
- D4, D7, and D12 remain responsible for their own per-domino review gates.

Skills used: domain-design, information-design, solution-design,
testing-design, civ7-open-spec-workstream, typescript-refactoring.

# D3 Final Domain/Ontology Review

## Verdict

Accepted for design/specification only.

D3 now satisfies the complete Workspace Graph Integration acceptance standard at
the design/spec layer. The repaired packet no longer accepts a reduced
`habitat:rule:biome-ci` fix as closure. The `biome-ci` case is correctly treated
as a live falsifier/regression probe, while the packet models the broader graph
authority: project and target facts, owner roots, dependency declaration kinds,
resolved dependency relationships, aggregate/workspace gates, graph refusals,
classify/check/verify projections, and D4/D7/D12 handoffs.

This is not implementation acceptance. Source edits remain blocked until concrete
D0 public-surface rows and live D2 graph projection implementation facts exist.

## Evidence Read

- `$D3_NEGATIVE_REVIEW`, including the Superseding Control Note.
- `$D3_CHANGE/proposal.md`.
- `$D3_CHANGE/design.md`.
- `$D3_CHANGE/specs/habitat-harness/spec.md`.
- `$D3_CHANGE/tasks.md`.
- `$D3_CHANGE/workstream/review-disposition-ledger.md`.
- `$D3_CHANGE/workstream/downstream-realignment-ledger.md`.
- `$D3_CHANGE/workstream/phase-record.md`.
- `$D3_CHANGE/workstream/closure-checklist.md`.
- `$REMEDIATION_DIR/context.md`.
- `$REMEDIATION_DIR/packet-index.md`.
- `$D3_SOURCE_PACKET`.
- `$HABITAT_TOOL/src/plugin.js` for current dependency declaration evidence.
- Six D3 investigation scratch docs under `$AGENT_SCRATCH/domino-D3-*-investigation.md`.

Validation evidence:

- `bun run openspec -- validate deep-habitat-d3-workspace-graph-boundary --strict` passed.
- `bun run openspec:validate` passed.
- `git diff --check` passed.
- Post-review wording cleanup reread: `$D3_CHANGE/tasks.md:34` now states the
  closed unresolved-alias representation rule and no longer leaves that rule as
  an implementation-time decision.

## P1 Findings

None.

The previous P1 concerns are repaired at the design/spec level:

- The false-green `biome-ci` hazard is a blocking regression contract, not the
  boundary: `$D3_CHANGE/proposal.md:42`, `$D3_CHANGE/proposal.md:47`,
  `$D3_CHANGE/design.md:25`, `$D3_CHANGE/design.md:34`,
  `$D3_CHANGE/design.md:402`.
- Workspace Graph ownership is singular and named:
  `$D3_CHANGE/design.md:50`, `$D3_CHANGE/design.md:74`,
  `$D3_CHANGE/specs/habitat-harness/spec.md:3`.
- Target states are closed before implementation:
  `$D3_CHANGE/design.md:114`, `$D3_CHANGE/design.md:125`,
  `$D3_CHANGE/specs/habitat-harness/spec.md:22`.
- Alias wrappers are projections only after dependency resolution:
  `$D3_CHANGE/design.md:217`, `$D3_CHANGE/design.md:238`,
  `$D3_CHANGE/specs/habitat-harness/spec.md:44`, `$D3_CHANGE/tasks.md:34`.

## P2 Findings

None.

The newly required dependency topology is now covered:

- Current `plugin.js` evidence includes same-project dependencies, explicit
  project dependencies, aggregate/workspace gates, and multi-dependency targets:
  `$HABITAT_TOOL/src/plugin.js:130`, `$HABITAT_TOOL/src/plugin.js:134`,
  `$HABITAT_TOOL/src/plugin.js:182`, `$HABITAT_TOOL/src/plugin.js:190`,
  `$HABITAT_TOOL/src/plugin.js:203`, `$HABITAT_TOOL/src/plugin.js:213`,
  `$HABITAT_TOOL/src/plugin.js:218`.
- `TargetDependencyDeclaration` is a source topology model, not string parsing:
  `$D3_CHANGE/design.md:100`, `$D3_CHANGE/design.md:108`,
  `$D3_CHANGE/design.md:182`.
- Same-project target dependency is modeled and validated:
  `$D3_CHANGE/design.md:183`, `$D3_CHANGE/design.md:208`,
  `$D3_CHANGE/specs/habitat-harness/spec.md:49`,
  `$D3_CHANGE/tasks.md:16`.
- Explicit project target dependency is modeled and validated:
  `$D3_CHANGE/design.md:187`, `$D3_CHANGE/design.md:211`,
  `$D3_CHANGE/specs/habitat-harness/spec.md:64`,
  `$D3_CHANGE/tasks.md:15`.
- Aggregate/workspace and multi-dependency relationships are modeled with
  all-child resolution/refusal semantics:
  `$D3_CHANGE/design.md:192`, `$D3_CHANGE/design.md:197`,
  `$D3_CHANGE/design.md:213`, `$D3_CHANGE/design.md:281`,
  `$D3_CHANGE/specs/habitat-harness/spec.md:69`,
  `$D3_CHANGE/specs/habitat-harness/spec.md:89`,
  `$D3_CHANGE/tasks.md:17`, `$D3_CHANGE/tasks.md:61`.
- Full-domain validation is no longer a smoke test:
  `$D3_CHANGE/design.md:362`, `$D3_CHANGE/design.md:366`,
  `$D3_CHANGE/tasks.md:54`, `$D3_CHANGE/tasks.md:57`,
  `$D3_CHANGE/workstream/phase-record.md:56`,
  `$D3_CHANGE/workstream/phase-record.md:57`.

## P3 Findings

### P3-1: Clean up stale `WorkspaceTargetFact` naming

`WorkspaceTargetState` is the accepted target state model in
`$D3_CHANGE/design.md:125`, and task 5.1 correctly uses it in
`$D3_CHANGE/tasks.md:38`. Two control lines still use the older
`WorkspaceTargetFact` name:

- `$D3_CHANGE/design.md:356`
- `$D3_CHANGE/workstream/review-disposition-ledger.md:18`

This does not block design/spec acceptance because the normative model and task
slice are clear, but implementation handoff should normalize those two mentions
to `WorkspaceTargetState` or explicitly define `WorkspaceTargetFact` as a
compatibility synonym.

### P3-2: Align resolved dependency term names before implementation

The ontology table names `TargetDependency` as the resolved relationship in
`$D3_CHANGE/design.md:101`, while the type sketch names the union
`TargetDependencyResolution` in `$D3_CHANGE/design.md:167`. The semantics are
clear enough for design/spec acceptance, but the implementation should choose
one exported term or define `TargetDependency` as the resolved branch of
`TargetDependencyResolution`.

## Design/Specification Acceptance

D3 can be accepted for design/specification only.

The packet is now sound enough to guide implementation without leaving the
Workspace Graph ontology to an implementation agent. It answers the domain and
ontology questions that previously blocked acceptance:

- What owns graph truth? Workspace Graph Integration:
  `$D3_CHANGE/design.md:50`.
- What are the core accepted entities? `WorkspaceGraphSnapshot`,
  `WorkspaceProject`, `WorkspaceTarget`, `TargetDependencyDeclaration`,
  `TargetDependency`, `TargetAlias`, `GraphRefusal`,
  `ClassifyTargetProjection`, `CheckInvocationSurface`, and
  `VerifyTargetPlan`: `$D3_CHANGE/design.md:90`.
- What states are legal? Closed `WorkspaceGraphReadState`,
  `WorkspaceTargetState`, `TargetDependencyResolution`, and
  `TargetDependencyDeclaration`: `$D3_CHANGE/design.md:114`.
- What consumers may claim? Classify consumes graph facts directly, check is only
  a D3 consumer through Nx-inferred target surfaces, verify consumes graph target
  plans while D12 owns receipt schema:
  `$D3_CHANGE/proposal.md:96`, `$D3_CHANGE/design.md:229`,
  `$D3_CHANGE/specs/habitat-harness/spec.md:115`.
- What downstream packets may assume? D4, D7, and D12 have named facts and
  non-claims: `$D3_CHANGE/design.md:392`,
  `$D3_CHANGE/workstream/downstream-realignment-ledger.md:11`.

## Lowering-Language Audit

No active lowering-language concern remains in the repaired D3 packet.

The active negative-control file correctly supersedes historical reduced-scope
wording in `$D3_NEGATIVE_REVIEW:1`. The repaired packet explicitly rejects
`biome-ci`-only closure in `$D3_CHANGE/proposal.md:47`,
`$D3_CHANGE/design.md:402`, and
`$D3_CHANGE/workstream/closure-checklist.md:12`.

## Required Naming Repairs

Before source implementation starts, repair the P3 naming drift:

- Replace or define stale `WorkspaceTargetFact` mentions.
- Choose one public name for resolved dependency relationships:
  `TargetDependency` or `TargetDependencyResolution`.

These are naming hygiene repairs, not P1/P2 acceptance blockers.

## Non-Claims

- This review does not authorize source implementation.
- This review does not accept D0/D2 implementation readiness.
- This review does not close D4, D7, or D12.
- This review does not prove runtime behavior; it accepts the D3 packet as a
  design/specification authority.
- This review does not edit packet/source files.

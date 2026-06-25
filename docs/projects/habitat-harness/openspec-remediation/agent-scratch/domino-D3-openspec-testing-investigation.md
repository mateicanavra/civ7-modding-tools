# D3 OpenSpec / Testing Investigation

## Verdict

Not accepted.

D3 is materially improved from the earlier negative-control scaffold. The current
`proposal.md`, `design.md`, `specs/habitat-harness/spec.md`, and `tasks.md`
mostly describe the right complete Workspace Graph Integration boundary:
Workspace Graph owns current Nx graph reads, owner roots, graph-owned target
names, aggregate/workspace gates, alias dependency declarations, target facts,
and graph refusal states. `biome-ci` is correctly treated as a live falsifier of
the graph-authority problem.

That is not enough for acceptance yet. D3 acceptance requires the complete
Workspace Graph Integration authority contract to be executable across all
OpenSpec and workstream control artifacts. Current workstream records still
contain stale or inaccurate control data, and the validation contract still needs
one stronger full-domain graph inventory gate so the packet cannot be accepted
as an alias-only `biome-ci` repair.

## Current Guidance

This review does not treat historical scratch as guidance. Historical scratch is
provenance only.

The current bar is:

- D3 is the Workspace Graph Integration authority, not a local alias patch.
- `habitat:rule:biome-ci` is one required falsifier, not the solution boundary.
- A bounded implementation boundary is acceptable only if it names the exact
  owner and explains why that owner protects the full graph-truth problem.
- Validation must prove unresolved graph states cannot become runnable successes
  for the full D3-owned surface, including owner roots, project targets,
  aggregate/workspace targets, alias targets, graph read failures, and
  classify/check/verify consumer scope.

## What Is Strong Now

- `proposal.md` names the full D3 domain: Nx project ownership, target
  availability, workspace gates, and rule-target alias dependencies.
- `design.md` names the Workspace Graph module boundary and the split between
  `workspace-graph-contract.js` for the Nx plugin and `workspace-graph.ts` for
  typed Habitat consumers.
- `design.md` defines closed graph states for available targets, unavailable
  targets, alias targets with resolved dependencies, aggregate/workspace targets,
  and graph refusals.
- `spec.md` now has normative scenarios for singular graph authority, alias
  dependency resolution, graph refusals, classify/check/verify consumer scope,
  D0/D2 blockers, and D4/D7/D12 non-claims.
- `tasks.md` is no longer generic; it names source files, deletion checks,
  protected paths, bad cases, and the cache-disabled alias proof.

## P1 Findings

### P1-1: Workstream control records still contradict the repaired D3 contract

`phase-record.md` still records the old weak validation gates:

- `nx show project @habitat/cli`
- `bun run habitat classify tools/habitat/src/plugin.js`
- OpenSpec validation
- `git diff --check`

Those gates can pass while the complete Workspace Graph authority is broken.
They omit the injected missing-project alias, missing-target alias, malformed
graph JSON, Nx read/daemon failure cases, full graph-owned target inventory, and
cache-disabled alias/dependency-execution evidence.

The review ledger also claims repaired evidence in `phase-record.md` and
`downstream-realignment-ledger.md`, but those files remain stale. The downstream
ledger still says only "Later domino packets: pending" instead of naming D4,
D7, and D12 graph facts and non-claims.

This blocks acceptance because an execution agent can follow the workstream
records rather than the stronger design/tasks/spec and still execute a partial
or false-green D3.

Required repair:

- Update `workstream/phase-record.md` to match the full D3 objective, absolute
  OpenSpec path, D0/D2 blockers, approved write set, protected paths, and all
  falsifying validation gates from `proposal.md`, `design.md`, and `tasks.md`.
- Update `workstream/downstream-realignment-ledger.md` with explicit D4, D7,
  and D12 rows: allowed graph facts, non-claims, and source-implementation
  blockers.
- Update `workstream/closure-checklist.md` so design closure requires the full
  Workspace Graph authority contract, not merely OpenSpec validation.
- Keep `workstream/review-disposition-ledger.md` blocking until fresh review
  accepts those repaired records.

### P1-2: Validation still needs one full-domain graph inventory oracle

The current validation plan correctly requires:

- injected missing-project alias;
- missing-target alias;
- graph read/daemon/malformed graph failures;
- `biome-ci` dependency correction;
- cache-disabled alias run or dependency-execution evidence;
- classify output distinguishing graph states.

That is necessary but still too easy to read as "fix the known `biome-ci`
special case plus fixtures." D3 acceptance requires proving the full Workspace
Graph authority surface, not just the current falsifier.

Required repair:

- Add a validation gate that inventories every D3-owned graph declaration and
  every emitted D3-owned Nx target from `nx show project @habitat/cli
  --json`.
- The gate must assert, for the complete set:
  - every owner root comes from the Workspace Graph contract;
  - every graph-owned target name comes from the contract/service;
  - every aggregate/workspace target is classified as aggregate/workspace, not
    project-local;
  - every alias target has a resolved dependency project/target pair;
  - no emitted alias depends on a missing project, missing target, or
    colon-split fallback;
  - no unresolved alias can succeed through `node -e ""`.
- Keep `habitat:rule:biome-ci` as one named regression assertion inside this
  full-domain inventory, not as the boundary of the proof.

## P2 Findings

### P2-1: The review ledger overstates repair completion

The review ledger says negative-control findings are "accepted; repaired pending
fresh D3 rereview." That is mostly accurate for proposal/design/spec/tasks, but
not for workstream records. It specifically claims phase-record and downstream
ledger repairs that are not present.

Required repair:

- Rephrase disposition to "partially repaired in proposal/design/spec/tasks;
  workstream records pending" until the phase record and downstream ledger are
  actually updated.
- Use the fresh review's scratch path as repair evidence only after this review
  is filed and dispositioned.

### P2-2: Closure checklist is too generic for D3's acceptance bar

The closure checklist currently checks generic design readiness. It does not
require the full Workspace Graph Integration contract, full-domain validation,
D0/D2 implementation blockers, or D4/D7/D12 non-claims.

Required repair:

- Add D3-specific checklist rows for:
  - singular Workspace Graph authority;
  - closed graph state model;
  - complete alias/aggregate/project target inventory;
  - classify/check/verify consumer-scope proof;
  - D0/D2 blocker citations;
  - D4/D7/D12 downstream fact/non-claim rows;
  - no partial `biome-ci`-only acceptance.

### P2-3: D0/D2 dependency state is clearer but still must be mirrored in ledgers

`proposal.md`, `design.md`, `spec.md`, and `tasks.md` now say source
implementation is blocked until D0 public-surface rows and D2 graph projection
implementation facts exist. The phase record and downstream ledger do not mirror
that state.

Required repair:

- Record D0 as a source-implementation blocker for classify JSON, verify target
  plan/output, Nx inferred targets, root scripts, package exports, graph command
  output if touched, and docs/examples.
- Record D2 as a source-implementation blocker for live `ruleGraphFacts` and
  registry graph declarations.
- State explicitly that D3 may be accepted for design/specification only after
  review closure, while source edits remain blocked behind those live facts.

## Required Requirement / Scenario Repairs

- Add a requirement or scenario for complete graph-owned target inventory:
  every emitted D3-owned target must be derived from Workspace Graph contract or
  service data, and every alias dependency must resolve against current Nx
  metadata.
- Add a scenario that a broad aggregate/workspace target with dependencies is
  validated as an aggregate fact and cannot masquerade as a project-local target.
- Add a scenario that the Workspace Graph authority refuses or withholds all
  unresolved graph-owned targets before command execution, not only rule aliases.

## Required Task Repairs

- Add a validation task for the full-domain graph inventory described in P1-2.
- Add a task to update `phase-record.md`, `review-disposition-ledger.md`,
  `downstream-realignment-ledger.md`, and `closure-checklist.md` to match the
  repaired D3 contract.
- Add a task to assert the complete set of D3-owned alias targets has no
  colon-split or missing dependency output.

## Required Validation Repairs

- Keep `NX_DAEMON=false nx run @habitat/cli:habitat:rule:biome-ci
  --skip-nx-cache` as a required regression proof.
- Add full emitted-target inventory assertions from `nx show project
  @habitat/cli --json`.
- Add unit tests or fixtures that cover all graph refusal states, including
  missing project, missing target, unresolved alias dependency, malformed graph
  JSON, Nx read failure, and Nx daemon failure.
- Add classify JSON assertions that cover available project targets, unavailable
  project targets, aggregate/workspace targets, and graph refusals under the
  D0-compatible output shape.

## Downstream Non-Claims

- D4 may consume D3 project ownership, target availability, unavailable-target,
  aggregate-target, and graph-refusal facts. D4 may not infer target truth or
  alias validity.
- D7 may consume D3 available target, aggregate target, and alias dependency
  facts. D7 may not treat wrapper exit 0 as target success without D3 dependency
  resolution.
- D12 may consume D3 graph-read status and verify target-plan facts. D12 owns
  receipt schema and handoff wording, not graph construction.

## Final Acceptance Standard

D3 can be accepted for design/specification only after the packet's proposal,
design, spec, tasks, phase record, review ledger, downstream ledger, closure
checklist, and packet index all agree on the complete Workspace Graph
Integration authority contract.

D3 cannot be accepted as a partial repair, a `biome-ci` patch, or an alias-only
alias fix. The `biome-ci` case is a mandatory regression falsifier for the
complete graph boundary.

Skills used: domain-design, information-design, testing-design, solution-design,
civ7-open-spec-workstream, typescript-refactoring.

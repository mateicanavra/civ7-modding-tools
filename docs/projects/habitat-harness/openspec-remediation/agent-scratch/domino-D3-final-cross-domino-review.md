# D3 Final Cross-Domino Review

## Verdict

Accepted for design/specification only.

D3 now satisfies the complete Workspace Graph Integration acceptance standard. The repaired packet does not reduce the work to `habitat:rule:biome-ci`: it treats that target as the live falsifier/regression probe while defining the larger graph authority for owner roots, target names, current Nx project/target availability, dependency declaration kinds, aggregate/workspace gates, resolved dependency relationships, classify/check/verify projections, graph read/refusal states, and downstream D4/D7/D12 non-claims.

This is not source implementation acceptance. D3 source work remains blocked until concrete D0 public-surface rows exist and D2 graph projection implementation facts exist.

## Acceptance Basis

- `$D3_CHANGE/proposal.md` frames D3 as the single authority for Nx project ownership, target availability, workspace gates, and rule-target dependency declarations, and explicitly says `habitat:rule:biome-ci` is a false-green hazard rather than the whole D3 scope (`proposal.md:5`, `proposal.md:42`, `proposal.md:47`).
- `$D3_CHANGE/design.md` now makes `Workspace Graph Integration` the owner of graph read status, project identity, owner-root mapping, graph-owned target-name policy, dependency declaration construction/normalization/validation, graph target facts, and graph refusal states (`design.md:50`, `design.md:54`).
- `$D3_CHANGE/design.md` defines a concrete module boundary across `workspace-graph-contract.js`, `workspace-graph.ts`, `nx-projects.ts`, `plugin.js`, and `command-engine.ts`, preventing plugin/classify/verify from retaining separate graph authority (`design.md:74`).
- `$D3_CHANGE/design.md` models `TargetDependencyDeclaration` for same-project target dependency, explicit project target dependency, aggregate/workspace dependency, and multi-dependency target relationship (`design.md:182`), and gives each kind resolution/failure semantics (`design.md:281`).
- `$D3_CHANGE/specs/habitat-harness/spec.md` adds normative scenarios for singular graph authority, full graph inventory, closed target facts, same-project dependencies, explicit project dependencies, aggregate child resolution, missing project/target alias refusals, closed declaration kinds, shared plugin/service validation, consumer scope, D0/D2 blockers, and D4/D7/D12 downstream consumption (`spec.md:3`, `spec.md:44`, `spec.md:89`, `spec.md:94`, `spec.md:115`, `spec.md:134`, `spec.md:147`).
- `$D3_CHANGE/tasks.md` is implementation-ready at design level: it blocks source edits on D0/D2 facts, names the source files and protected paths, deletes colon-split parsing as an explicit task, and requires falsifying validation for the false-green alias and all dependency declaration kinds (`tasks.md:3`, `tasks.md:10`, `tasks.md:19`, `tasks.md:27`, `tasks.md:36`, `tasks.md:45`, `tasks.md:52`).
- `$D3_CHANGE/workstream/downstream-realignment-ledger.md` now gives D4, D7, and D12 exact consumable D3 facts and non-claims instead of generic downstream language (`downstream-realignment-ledger.md:11`).

OpenSpec validation evidence:

- `bun run openspec -- validate deep-habitat-d3-workspace-graph-boundary --strict` passed.
- `bun run openspec:validate` passed.

## Findings

### P1

No unresolved P1 findings.

The earlier P1s were repaired in the active packet: false-green alias handling is now a blocking contract (`proposal.md:105`, `design.md:362`, `tasks.md:58`), graph states are specified (`design.md:114`), the owner/write set is concrete (`design.md:319`), and downstream handoffs are explicit (`downstream-realignment-ledger.md:13`).

### P2

No unresolved P2 findings.

D0/D2 handling is now correctly split: D3 design can consume accepted D0/D2 design language, but source implementation remains blocked behind concrete D0 rows and live D2 graph projection facts (`proposal.md:79`, `design.md:297`, `tasks.md:3`, `phase-record.md:27`, `downstream-realignment-ledger.md:30`).

D3 also no longer owns downstream semantics it should not own: D4 may present graph facts without inferring truth, D7 may plan from graph facts without owning dependency declarations or check aggregation semantics, and D12 may record graph facts without owning graph construction or having D3 define receipt schema (`proposal.md:67`, `design.md:392`, `spec.md:147`, `downstream-realignment-ledger.md:13`).

### P3

P3-1: The illustrative TypeScript model should encode resolved-only dependencies inside runnable states before implementation.

`design.md:141` gives `alias-target` a `dependency: TargetDependencyResolution`, and `design.md:148` gives `aggregate-workspace-target` `dependencies: readonly TargetDependencyResolution[]`, while `TargetDependencyResolution` includes unresolved states at `design.md:174`. The surrounding constraints correctly say alias targets can exist only when dependencies resolve and unresolved declarations become graph refusals (`design.md:206`, `design.md:213`, `design.md:217`), and the spec also requires refusal before wrapper execution (`spec.md:44`, `spec.md:74`, `spec.md:79`).

This is not a design acceptance blocker because the normative prose and scenarios close the invalid state. Before source implementation, make the concrete TypeScript types encode that rule directly, for example by using resolved-only dependency types inside `alias-target` and `aggregate-workspace-target`, and reserving unresolved resolutions for `graph-refusal`.

## Dependency And Downstream Repairs Required

Required before packet-index status update:

- Record this final review in `$D3_REVIEW_LEDGER`.
- Update the D3 packet-index row from pending rereview to accepted for design/specification only; not implementation-complete.

Required before source implementation:

- Cite concrete D0 rows for every D3-touched public/durable surface: classify JSON, verify output/target plan, Nx inferred targets, root scripts, package exports, and docs/examples (`tasks.md:5`).
- Cite D2 implementation facts for live rule graph projections before D3 relies on registry graph declarations (`tasks.md:7`).
- Preserve D3's approved write set and protected paths (`design.md:319`, `design.md:337`).

Required for downstream packets:

- D4 may consume D3 project ownership, target availability, unavailable target, aggregate/workspace target, and graph refusal facts; it may not infer target truth or alias validity (`downstream-realignment-ledger.md:15`).
- D7 may consume available targets, aggregate/workspace targets, `TargetDependencyDeclaration`, resolved `TargetDependency`, `TargetAlias`, and graph refusal states; it may not treat wrapper exit 0 as enforcement success or own dependency declaration construction (`downstream-realignment-ledger.md:16`).
- D12 may consume graph-read status, `VerifyTargetPlan`, target availability, dependency resolution, and graph refusal states; it owns receipt schema and handoff wording and may not construct graph truth (`downstream-realignment-ledger.md:17`).

## Completeness-Language Check

No remaining blocking lowering language found.

The current packet repeatedly preserves the complete Workspace Graph Integration boundary and treats `habitat:rule:biome-ci` as a falsifier/regression probe, not a replacement for the complete acceptance boundary (`proposal.md:47`, `design.md:34`, `design.md:364`, `closure-checklist.md:12`). The remaining `biome-ci` references are appropriate validation probes or current-state diagnosis, not substitutes for acceptance of the full contract.

## Non-Claims

- This review does not accept D3 source implementation.
- This review does not accept D4, D7, or D12.
- This review does not prove current `plugin.js` behavior is correct; current source remains present-state evidence of what D3 must later repair.
- Passing OpenSpec validation proves artifact shape only.
- A valid D3 graph fact does not prove target execution success, check correctness, verify receipt correctness, CI, runtime/product behavior, or Graphite readiness.

Skills used: domain-design, information-design, solution-design, system-design, typescript-refactoring, civ7-open-spec-workstream, civ7-habitat-dra-workstream.

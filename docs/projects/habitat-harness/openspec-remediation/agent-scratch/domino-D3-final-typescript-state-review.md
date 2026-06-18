# D3 Final TypeScript State-Space Review

## Verdict

Accepted for design/specification only.

I found no unresolved P1 or P2 TypeScript state-space blockers in the repaired
D3 packet. The packet now specifies the complete Workspace Graph Integration
contract rather than a `habitat:rule:biome-ci`-only repair. It models graph read
states, target states, dependency declaration kinds, resolved dependency
relationships, owner/write boundaries, public compatibility handling, deletion
before rearrangement, and falsifying validation gates tightly enough for a later
implementation packet to execute without designing the boundary while coding.

D3 is not implementation-ready. Source implementation remains blocked exactly as
the packet says: concrete D0 public-surface rows and D2 graph projection
implementation facts must exist first.

## Sources Re-Read

- `$D3_NEGATIVE_REVIEW` top superseding control note and repaired findings.
- All artifacts under `$D3_CHANGE`.
- `$REMEDIATION_DIR/context.md`.
- `$REMEDIATION_DIR/packet-index.md`.
- Current Habitat graph source/tests under `$HABITAT_TOOL`, especially
  `$HABITAT_TOOL/src/plugin.js`, `$HABITAT_TOOL/src/lib/nx-projects.ts`,
  `$HABITAT_TOOL/src/lib/command-engine.ts`, `$HABITAT_TOOL/src/commands/graph.ts`,
  `$HABITAT_TOOL/src/commands/verify.ts`, `$HABITAT_TOOL/test/lib/classify.test.ts`,
  and `$HABITAT_TOOL/test/lib/enforcement-surface.test.ts`.

## Review Evidence

- `bun run openspec -- validate deep-habitat-d3-workspace-graph-boundary --strict`
  passed.
- `git diff --check` passed.
- Full `bun run openspec:validate` was not run in this final review pass; it
  remains a required implementation/design closure gate in `tasks.md`.

## Why D3 Can Be Accepted For Design/Specification

The repaired design now collapses the current TypeScript/JavaScript state-space
problem instead of rearranging it. Current source has at least three graph
truths: `plugin.js` owns `OWNER_ROOTS`, target names, string parsing through
`dependencyForTarget`, and no-op aliases at `$HABITAT_TOOL/src/plugin.js:17` and
`$HABITAT_TOOL/src/plugin.js:182`; `nx-projects.ts` owns project and target
metadata lookup at `$HABITAT_TOOL/src/lib/nx-projects.ts:21` and
`$HABITAT_TOOL/src/lib/nx-projects.ts:50`; `command-engine.ts` owns classify and
verify target facts locally at `$HABITAT_TOOL/src/lib/command-engine.ts:614`,
`$HABITAT_TOOL/src/lib/command-engine.ts:846`, and
`$HABITAT_TOOL/src/lib/command-engine.ts:1032`.

The packet now makes that split illegal. `design.md:76` names the Workspace
Graph module as the canonical boundary, and `design.md:80` through
`design.md:84` assigns the contract/service/plugin/classify roles. The approved
write set and protected paths at `design.md:319` through `design.md:343` are
specific enough to prevent implementation-time ownership drift.

The target model is no longer left to implementation. `design.md:116` through
`design.md:227` defines closed graph read states, target states, dependency
declarations, and resolution/refusal states. It explicitly demotes existing
`ClassifiedTarget` / `UnavailableClassifiedTarget` to compatibility DTOs at
`design.md:222`, which handles the current classify surface at
`$HABITAT_TOOL/src/lib/command-engine.ts:196`.

The new dependency-declaration focus is covered. `design.md:182` through
`design.md:201` defines `TargetDependencyDeclaration` variants for same-project
target dependency, explicit project target dependency, aggregate/workspace
dependency, and multi-dependency target relationship. `design.md:281` through
`design.md:295` maps those variants to current source examples including
`boundaries`, `biome-ci`, Grit aliases, and `generated:check`. The spec mirrors
those cases at `specs/habitat-harness/spec.md:49`, `specs/habitat-harness/spec.md:64`,
`specs/habitat-harness/spec.md:69`, and `specs/habitat-harness/spec.md:89`.

The validation oracle is falsifying, not smoke testing. `tasks.md:54` through
`tasks.md:65` requires workspace graph tests, plugin tests, classify tests, a
full-domain graph inventory oracle, corrected `biome-ci` dependency inspection,
cache/daemon-disabled alias execution evidence, classify JSON state
distinction, dependency-kind unit cases, injected missing-project aliases,
malformed graph JSON, Nx read failure, Nx daemon failure, OpenSpec validation,
and diff check. `design.md:362` through `design.md:394` states the same oracle
as design intent.

Public compatibility and cross-domino boundaries are explicit. D0/D2 blockers
are recorded in `proposal.md:78`, `design.md:297`, `tasks.md:5`, and
`specs/habitat-harness/spec.md:134`. Classify/check/verify scope is explicit in
`proposal.md:98` through `proposal.md:103`, `design.md:229` through
`design.md:246`, and `specs/habitat-harness/spec.md:115`. D4/D7/D12 handoffs
are named in `workstream/downstream-realignment-ledger.md:13` through
`workstream/downstream-realignment-ledger.md:17`.

## P1 Findings

None.

## P2 Findings

None.

## P3 Findings

### P3-1: Aggregate dependency resolution should get its own typed resolution variant

`design.md:167` through `design.md:180` shows `TargetDependencyResolution` with
`project` and `target` required for every resolved or unresolved declaration.
That works for same-project and explicit-project dependencies, but
`design.md:193` through `design.md:201` also allows aggregate/workspace and
multi-dependency declarations, while `design.md:221` says aggregate/workspace
targets are not project-local targets. The surrounding requirements close the
intended behavior, especially `design.md:289`, `design.md:290`,
`specs/habitat-harness/spec.md:36`, and `specs/habitat-harness/spec.md:69`, so
this is not a P1/P2 design blocker.

Required TypeScript repair: during implementation, split dependency resolution
so aggregate/workspace resolution cannot require a fake project. Either add a
distinct variant such as `resolved-aggregate-workspace-dependency`, or keep
aggregate availability entirely in `aggregate-workspace-target.dependencies`
with child `TargetDependencyResolution[]` and never represent the aggregate
itself as a project-target dependency.

### P3-2: `WorkspaceTargetFact` appears as a stale term

Most repaired artifacts use `WorkspaceTargetState`, but `design.md:356` says the
classify migration should move to `WorkspaceTargetFact`, and
`workstream/review-disposition-ledger.md:18` also mentions
`WorkspaceTargetFact`. The target ontology and tasks are otherwise clear:
`design.md:125` defines `WorkspaceTargetState`, and `tasks.md:38` uses
`WorkspaceTargetState`.

Required repair before implementation handoff: normalize the stale
`WorkspaceTargetFact` mentions to the accepted term, or explicitly define
`WorkspaceTargetFact` as a reader-facing alias if that is intentional.

### P3-3: The JS contract needs a typed bridge in implementation

The split between `$HABITAT_TOOL/src/lib/workspace-graph-contract.js` and
`$HABITAT_TOOL/src/lib/workspace-graph.ts` is justified because Nx loads
`plugin.js` as plain ESM. The repo also has `allowJs: true` in
`$HABITAT_TOOL/tsconfig.json`, so a plain JS contract can become an untyped
escape hatch if implementation does not add a typed bridge.

This is not a packet acceptance blocker because `tasks.md:33` requires the JS
contract helpers and TS service validation to prove they use the same dependency
declaration and relationship model. Implementation should satisfy that with
JSDoc typedefs, generated declarations, or a TS-owned type export consumed by
the service tests, so the contract cannot drift into `any`-shaped data.

## Required TypeScript / Refactor-Pattern Repairs For Implementation

- Keep the closed discriminated states from `design.md:116` through
  `design.md:227`; do not replace them with optional-field bags or stringly
  states.
- Delete before rearranging: remove `dependencyForTarget` from
  `$HABITAT_TOOL/src/plugin.js:182`, move `OWNER_ROOTS` out of
  `$HABITAT_TOOL/src/plugin.js:17`, and remove local target-authority arrays from
  `$HABITAT_TOOL/src/lib/command-engine.ts:614`, `$HABITAT_TOOL/src/lib/command-engine.ts:1032`,
  and `$HABITAT_TOOL/src/lib/command-engine.ts:1058` only after graph-backed
  replacements exist.
- Preserve public compatibility through D0 rows. Existing classify `proof`
  fields at `$HABITAT_TOOL/src/lib/command-engine.ts:201` must stay compatibility
  DTOs unless D0 authorizes versioning/removal.
- Add the workspace graph tests before or with the state-model slice; the file
  `$HABITAT_TOOL/test/lib/workspace-graph.test.ts` does not exist yet, and D3
  correctly requires adding it.
- Keep compiler/test gates after each logical move: graph contract, typed
  service, plugin migration, classify migration, verify migration, and deletion
  sweep.

## Non-Claims

- This review accepts D3 only for design/specification.
- This review does not accept source implementation.
- This review does not close D0, D2, D4, D7, or D12.
- Passing strict OpenSpec validation proves artifact shape, not runtime graph
  behavior.
- The current source still contains the false-green hazard; D3 only now
  specifies the contract required to remove it.

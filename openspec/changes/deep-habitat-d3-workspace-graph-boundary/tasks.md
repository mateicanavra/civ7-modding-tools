# Tasks

## 1. Source Preconditions

- [x] 1.1 Confirm the implementation worktree starts from the approved implementation stack and is clean before source edits.
  - Completed: `agent-DRA-d3-workspace-graph-boundary` is a clean layer above submitted D2.
- [x] 1.2 Cite concrete D0 rows for every D3-touched public/durable surface: classify JSON, verify output/target plan, Nx inferred targets, root scripts, package exports, and docs/examples.
  - Completed: see `workstream/implementation-start-inventory.md`.
- [x] 1.3 Cite D2 implementation facts for rule graph projections before relying on live registry graph declarations.
  - Completed: see `workstream/implementation-start-inventory.md`.
- [x] 1.4 Stop before source edits if D0 rows or D2 graph projection facts are missing.
  - Completed: live prerequisites are present; D3 source implementation may begin.

## 2. Workspace Graph Contract Slice

- [ ] 2.1 Add `$HABITAT_TOOL/src/lib/workspace-graph-contract.js` as the plain ESM owner of owner roots, graph-owned target names, aggregate target declarations, rule-target dependency declarations, dependency declaration kinds, and validation helpers.
- [ ] 2.2 Move `OWNER_ROOTS`, target-name constants, and dependency declarations out of `$HABITAT_TOOL/src/plugin.js`.
- [ ] 2.3 Replace colon-delimited dependency parsing with closed dependency declarations: same-project target dependency, explicit project target dependency, aggregate/workspace dependency, and multi-dependency target relationship. Delete `dependencyForTarget` or make its removal mechanically visible.
- [ ] 2.4 Represent `biome-ci` as a dependency on the canonical Habitat project Biome CI target, not as `projects: ["biome"], target: "ci"`.
- [ ] 2.5 Represent `nx-boundaries`/`boundaries` as a same-project target dependency that normalizes to the declaring project before validation.
- [ ] 2.6 Represent `generated:check` and other broad gates as aggregate or multi-dependency relationships whose child dependencies all resolve before the target is runnable.

## 3. Typed Workspace Graph Service Slice

- [ ] 3.1 Add `$HABITAT_TOOL/src/lib/workspace-graph.ts` as the TypeScript service that reads current Nx metadata and returns graph read states plus target facts.
- [ ] 3.2 Implement closed states for available project target, unavailable project target, alias target with resolved dependency, aggregate/workspace target, and graph refusal.
- [ ] 3.3 Implement dependency normalization from declaration to resolution, including same-project dependency normalization against the declaring project and aggregate/multi-dependency child resolution.
- [ ] 3.4 Implement graph refusal states for missing project, missing target, unresolved alias target dependency declaration, malformed graph JSON, Nx read failure, and Nx daemon failure.
- [ ] 3.5 Update `$HABITAT_TOOL/src/lib/nx-projects.ts` to delegate to the Workspace Graph service or become a compatibility adapter whose full target-availability behavior comes from the Workspace Graph service. It must not remain an independent target-availability owner.

## 4. Nx Plugin Migration Slice

- [ ] 4.1 Update `$HABITAT_TOOL/src/plugin.js` to consume `workspace-graph-contract.js`.
- [ ] 4.2 Emit alias wrapper targets only for resolved dependency relationships.
- [ ] 4.3 Refuse or withhold unresolved alias targets before wrapper execution; a `node -e ""` wrapper may not be the success path for an unresolved dependency.
- [ ] 4.4 Update plugin-focused tests in `$HABITAT_TOOL/test/lib/enforcement-surface.test.ts` and, if needed, `$HABITAT_TOOL/test/lib/workspace-graph.test.ts`.
- [ ] 4.5 Prove `workspace-graph-contract.js` validation helpers and `workspace-graph.ts` service validation use the same dependency declaration and relationship model, not parallel local checks.
- [ ] 4.6 Apply the D3 unresolved-alias representation rule: withhold runnable aliases by default; expose graph-refusal classify/verify states; use a command-facing failing graph-refusal target only when a concrete D0 row covers that public behavior.

## 5. Classify And Verify Migration Slice

- [ ] 5.1 Update `$HABITAT_TOOL/src/lib/command-engine.ts` classify target construction to project `WorkspaceTargetState` into D0-compatible classify JSON.
- [ ] 5.2 Preserve or version existing classify JSON fields only as D0 rows allow; treat legacy `proof` fields as compatibility DTO fields, not target-domain language.
- [ ] 5.3 Replace local `projectTargets` and `workspaceTargets` authority with Workspace Graph service projections.
- [ ] 5.4 Update verify target planning to consume Workspace Graph target plan facts while leaving D12 receipt schema and handoff wording untouched.
- [ ] 5.5 Keep `habitat check` direct rule evaluation out of D3 except for Nx-inferred `habitat:check` and `habitat:rule:*` target surfaces.
- [ ] 5.6 Add/update the D3 public compatibility map for classify JSON, verify target plan/output, Nx inferred targets, root scripts, package exports, and docs/examples with D0 row citations before source edits.

## 6. Deletion And Protected-Path Checks

- [ ] 6.1 Confirm no colon-split dependency parser remains in D3-owned code.
- [ ] 6.2 Confirm `plugin.js` and classify no longer carry separate owner-root maps.
- [ ] 6.3 Confirm `$HABITAT_TOOL/src/rules/rules.json` remains untouched unless a later D2 implementation fact explicitly authorizes a graph projection change.
- [ ] 6.4 Confirm D4, D7, and D12 packets are not edited except for allowed downstream/index dependency notes.

## 7. Validation

- [ ] 7.1 Run `bun run --cwd $HABITAT_TOOL test -- test/lib/workspace-graph.test.ts`.
- [ ] 7.2 Run `bun run --cwd $HABITAT_TOOL test -- test/lib/enforcement-surface.test.ts`.
- [ ] 7.3 Run `bun run --cwd $HABITAT_TOOL test -- test/lib/classify.test.ts`.
- [ ] 7.4 Run the full-domain graph inventory oracle and assert every Habitat-owned owner root, aggregate/workspace target, `habitat:check` target, `habitat:rule:*` alias target, dependency declaration kind, resolved dependency relationship, unavailable project target, and graph refusal bad case is emitted from the Workspace Graph module.
- [ ] 7.5 Run `nx show project @internal/habitat-harness --json` and assert `habitat:rule:biome-ci` depends on the canonical Habitat Biome target, not `projects: ["biome"], target: "ci"`.
- [ ] 7.6 Run `NX_DAEMON=false nx run @internal/habitat-harness:habitat:rule:biome-ci --skip-nx-cache` and record dependency execution evidence or failure before wrapper execution. A successful no-op wrapper without resolved dependency execution fails this gate.
- [ ] 7.7 Run `bun run habitat classify $HABITAT_TOOL/src/plugin.js --json` and assert available targets, unavailable targets, aggregate/workspace targets, and graph refusals are distinguishable under the D0-compatible output shape.
- [ ] 7.8 Run unit cases for same-project dependency resolution, same-project missing-target refusal, aggregate/multi-dependency resolution, and aggregate child-dependency failure.
- [ ] 7.9 Run unit bad cases for injected missing-project alias, missing-target alias, malformed graph JSON, Nx read failure, and Nx daemon failure.
- [ ] 7.10 Run `bun run openspec -- validate deep-habitat-d3-workspace-graph-boundary --strict`.
- [ ] 7.11 Run `bun run openspec:validate`.
- [ ] 7.12 Run `git diff --check`.

## 8. Review And Realignment

- [ ] 8.1 Run fresh D3 domain/ontology, code/topology, OpenSpec/testing, TypeScript state-space, information-design, and cross-domino reviews.
- [ ] 8.2 Repair every accepted P1/P2 finding before D3 acceptance.
- [ ] 8.3 Update the D3 phase record, review ledger, downstream ledger, closure checklist, and packet index only after review closure.
- [ ] 8.4 Leave the implementation worktree clean or provide an explicit handoff state.

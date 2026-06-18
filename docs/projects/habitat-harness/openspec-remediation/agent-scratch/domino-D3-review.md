# Superseding Control Note

This file is active negative-control evidence for D3, not current design
guidance. Historical wording that could imply a reduced solution is superseded:
D3 must satisfy the complete Workspace Graph Integration acceptance standard.
`habitat:rule:biome-ci` is a live falsifier/regression probe, not the boundary,
and every finding below must be read against the full graph authority contract.

# Skills Read

- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/information-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-systematic-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/testing-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/system-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/dev/1.0.0/skills/typescript/SKILL.md`

Directly relevant references read:

- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/validation-checks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/artifact-contracts.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/failure-patterns.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-systematic-workstream/references/evidence-and-proof.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-systematic-workstream/references/failure-patterns.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/domain-design/references/where-defaults-hide.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/information-design/references/where-defaults-hide.md`

# Sources Read

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `docs/projects/habitat-harness/openspec-remediation-frame.md`
- `docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D3-workspace-graph-integration-boundary.md`
- All files under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary`
- Dependency checks from D0 and D2 OpenSpec specs/design/ledger:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/specs/habitat-harness/spec.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/workstream/review-disposition-ledger.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/specs/habitat-harness/spec.md`
- Relevant Habitat code/docs/tests:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/nx-projects.ts`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/verify.ts`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/graph.ts`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/classify.test.ts`
  - `docs/CAPABILITIES.md`

Commands run as review evidence only:

- `git status --short --branch`
- `git worktree list`
- `gt status`
- `bun run openspec -- validate deep-habitat-d3-workspace-graph-boundary --strict` passed.
- `bun run habitat classify tools/habitat-harness/src/plugin.js` passed and emitted current classify JSON.
- `nx show project @internal/habitat-harness --json` passed and showed `habitat:rule:biome-ci` depends on `{"projects":["biome"],"target":"ci"}`.
- `nx run @internal/habitat-harness:habitat:rule:biome-ci --skip-nx-cache` exited 0 after Nx printed that `dependsOn` is misconfigured and the project pattern matches no projects.
- `git diff --check` passed.

# Acceptance Verdict

Not accepted. D3 remains blocked for packet acceptance and must be repaired before implementation.

The generated OpenSpec scaffold is valid OpenSpec shape, but it is not a packet-specific execution contract. It drops the source packet's central false-green alias hazard, typed graph-state model, alias dependency normalization, and injected bad-case validation into broad phrases such as "Define graph metadata ownership and target alias policy." That leaves an implementation agent to design the real boundary while coding, which violates the remediation frame's stop condition.

# P1 Findings

## P1-1: The live false-green target alias is not made a blocking contract

The source D3 packet identifies a concrete false-green risk: `habitat:rule:biome-ci` depends on `{"projects":["biome"],"target":"ci"}` even though `biome` is not a project, and later requires an injected missing-project alias test proving the wrapper cannot pass through `node -e ""`.

The generated D3 scaffold does not preserve that as a normative requirement or implementation task. `proposal.md`, `design.md`, `tasks.md`, and `specs/habitat-harness/spec.md` mention target availability and "No fake target aliases", but they never name `node -e ""`, missing-project alias dependencies, dependency execution evidence, cache-disabled alias proof, or the required failure behavior.

Current review evidence confirms this is not theoretical. In `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js:182`, `dependencyForTarget` parses colon-delimited target strings into project/target dependency objects. At `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js:208`, the `biome-ci` rule passes `biomeCiTargetName`, which becomes project `biome`, target `ci`. `nx show project @internal/habitat-harness --json` shows that dependency in the generated target, and `nx run @internal/habitat-harness:habitat:rule:biome-ci --skip-nx-cache` exits 0 despite Nx warning that the project pattern matches no projects.

This blocks acceptance because D3's main hazard can still be implemented as a false-green wrapper while satisfying the current scaffold's vague tasks.

## P1-2: The artifact asks implementation to design the graph state model

The source packet requires `HabitatGraphFact` and `HabitatTargetFact` as discriminated states: available target, unavailable target, alias target, broad aggregate target, and graph-error. The generated design reduces that to "Make target availability a graph fact consumed by classify and verify" and "Define graph metadata ownership and target alias policy."

That is a design question, not an implementation step. Current code already has incomplete graph-state language in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:196` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:211`, where classify exposes `ClassifiedTarget` and `UnavailableClassifiedTarget`. It also hard-codes `check`/`test` in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:1032` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:1055`, and workspace `lint` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:1058` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:1071`.

D3 does not decide whether these current types are the target contract, compatibility facts to migrate, or incomplete target states. It also does not name where alias-target and graph-error states live. That ambiguity is black ice: an implementation agent could bolt a new helper onto `plugin.js`, leave classify's DTO unchanged, and still claim the broad task is done.

## P1-3: Owner and write-set boundaries are not concrete enough to prevent duplicate graph truth

The source packet's boundary is explicit: centralize owner-root and target alias construction behind graph functions consumed by both plugin and classify; plugin and classify must not retain separate owner-root maps. The scaffold never names the current duplicate surfaces or the target module boundary.

Current duplicate truth is visible in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js:17` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js:24` (`OWNER_ROOTS`), `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/nx-projects.ts:21` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/nx-projects.ts:52` (Nx project metadata reader and target lookup), and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:846` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:875` (classify assembly).

The generated phase record says the executor must record the write set later. For D3, that is too late: the packet's purpose is to decide whether graph truth moves to a single owned service or stays split. Without an approved write set and protected path list, adjacent domains can still claim parts of the same authority.

# P2 Findings

## P2-1: Validation gates are smoke checks, not falsifying tests

The scaffold's validation gates are:

- `nx show project @internal/habitat-harness`
- `bun run habitat classify tools/habitat-harness/src/plugin.js`
- OpenSpec validation
- `git diff --check`

These can all pass while D3's central bug remains. Review evidence proves that: `nx show project` and `classify` passed, and the bad alias still false-greened. The source packet required cache-disabled target-alias proof or dependency execution evidence, an injected broken alias, and proof that the wrapper cannot pass through `node -e ""`. Those gates must be restored with exact expected outputs and failure assertions.

## P2-2: The spec delta is under-specified for the complete D3 public contract

`specs/habitat-harness/spec.md` has only two scenarios: project target reported and target unavailable. It does not cover alias targets, broad aggregate targets, workspace gates, graph-error/refusal states, malformed graph JSON, Nx daemon errors, missing projects, or dependency normalization. It also does not specify JSON field compatibility for `classify` under D0.

The result is a misleading green OpenSpec shape: the scenarios are true but do not constrain the dangerous states D3 was created to remove.

## P2-3: D0 and D2 prerequisites are named but not operationally dispositioned

D3 correctly says it requires D0 and D2, but the D0 and D2 review ledgers are still draft scaffolds with per-domino adversarial gates blocking. D3 then phrases task 1.4 as "Re-run or cite the required dependency gates: D0, D2", which is not enough for a blocked dependency. D3 must say that implementation is blocked until D0 public-surface compatibility and D2 typed registry projection requirements are accepted, and must name the D0/D2 rows it consumes once those records exist.

## P2-4: Verify is listed as a consumer without an integration contract

The product scenario says classify, check, and verify depend on graph truth. The concrete design and spec mostly describe classify target availability. `verify` currently uses fixed affected targets in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:614` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:622` and runs `nx affected` in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:722` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:729`.

D3 does not decide whether verify must consume the new graph service, only record graph facts in receipts later, or remain out of scope. That mismatch will cause either under-implementation or scope creep.

## P2-5: Downstream realignment is too generic to control D4, D7, and D12 assumptions

The downstream ledger says "Later domino packets: pending" without naming the actual assumptions D4, D7, and D12 are allowed to make after D3. Since D3 enables orientation/routing, enforcement pipeline, and verify handoff receipt work, it must say which graph facts are stable public contract, which are internal implementation details, and which remain non-claims.

# P3 Findings

## P3-1: "Check" appears in the product scenario but disappears from the tasks

The proposal scenario names classify, check, and verify, but task 2 only names graph metadata ownership, resolved project metadata, and target availability for classify/verify. If `check` is only a consumer through inferred targets, say that. If it consumes graph facts directly, add the contract.

## P3-2: The packet keeps legacy proof language as source provenance without a local disposition table

The source packet has "packet proof commands" and "Operations proof review"; current code still exposes `VerifyProof` and `proof` fields in classify target facts. The scaffold says proof/evidence terms are compatibility facts but does not list which D3-facing names are retained, renamed, or deferred to D1/D12. This is lower severity than the missing graph contract, but it increases implementation-time terminology drift.

## P3-3: The OpenSpec phase record path is relative while the review frame emphasizes absolute paths

The phase record lists `OpenSpec change: openspec/changes/deep-habitat-d3-workspace-graph-boundary/`. It is not wrong inside a repo artifact, but this remediation pass is explicitly sensitive to multiple worktrees. Prefer the absolute path in handoff/control records.

# Required Repairs

- Add a P1 review finding to D3's review disposition ledger for this per-domino review and keep it blocking until repaired.
- Restore the source packet's exact false-green alias contract into `design.md`, `tasks.md`, `specs/habitat-harness/spec.md`, and validation gates.
- Define the target graph state model before implementation: available target, unavailable target, alias target, aggregate/workspace gate target, malformed metadata/refusal, Nx graph/daemon error. State whether current `ClassifiedTarget`/`UnavailableClassifiedTarget` are kept, migrated, or compatibility-only.
- Name the graph service/module boundary and concrete write set. Decide completely how `plugin.js`, `nx-projects.ts`, `command-engine.ts`, and tests share one source of owner-root and target/alias truth.
- Replace "Define graph metadata ownership and target alias policy" with implementation-ready tasks that name the exact source files, exported APIs, test fixtures, and protected surfaces.
- Add falsifying validation: injected bad alias, cache-disabled alias run or dependency execution evidence, assertion that missing project dependency exits non-zero or is refused before wrapper execution, classify JSON compatibility checks, and a graph-error test.
- Block D3 implementation on accepted D0 and D2 prerequisite records, not just "re-run or cite" them.
- Make verify/check consumer scope explicit: direct graph service consumer, receipt-only consumer, or non-goal.
- Realign D4, D7, and D12 assumptions after the repaired contract is concrete.

# Suggested Wording/Structural Repairs

Add a target contract section similar to:

```text
The Workspace Graph Integration boundary SHALL expose one graph-fact service consumed by Nx target inference and Habitat classify/verify surfaces. The service SHALL classify target facts as:
- available-project-target;
- unavailable-project-target;
- alias-target with a resolved dependency;
- aggregate-workspace-target;
- graph-refusal for missing project, missing target, malformed graph JSON, or Nx graph read failure.

Alias targets SHALL NOT execute a no-op wrapper when any declared dependency cannot be resolved to a current Nx project and target. Missing dependency resolution SHALL be a refusal/failure fact before command execution.
```

Replace task 2 with concrete tasks similar to:

```text
- Add the graph-fact contract and service in the owning Habitat graph module.
- Move owner-root resolution and alias dependency construction out of plugin-local constants/string splitting.
- Update `tools/habitat-harness/src/plugin.js` to consume structured alias dependency facts and reject unresolved dependencies before emitting no-op wrapper targets.
- Update classify to consume the same graph fact service and preserve unavailable/refusal facts in JSON without constructing runnable commands.
- Add tests for the current `habitat:rule:biome-ci` missing-project dependency and an injected missing-project alias.
```

Add validation gates similar to:

```text
- `nx show project @internal/habitat-harness --json`: assert `habitat:rule:biome-ci` depends on the real Habitat Biome target, not `projects:["biome"], target:"ci"`.
- Inject a missing-project alias fixture and assert graph-fact resolution reports/refuses it before wrapper execution.
- `nx run @internal/habitat-harness:habitat:rule:biome-ci --skip-nx-cache`: assert dependency execution evidence includes the canonical Biome target or the command fails; a successful no-op wrapper without dependency execution is failure.
- `bun run habitat classify tools/habitat-harness/src/plugin.js --json` or equivalent: assert target facts distinguish project targets, workspace gates, unavailable targets, and graph refusals.
```

# Non-Claims

- This review does not accept D3, D0, or D2.
- Passing OpenSpec validation proves only artifact shape, not D3 readiness.
- The command runs above are review evidence, not implementation proof.
- This review does not authorize source changes.
- This review does not claim the full Habitat graph architecture is wrong; it claims the D3 scaffold does not yet specify the accepted target architecture tightly enough to implement safely.
- This review does not evaluate all later dominoes, except where D3's downstream assumptions affect D4, D7, and D12.

# Skills Read

- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/information-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-systematic-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/testing-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/system-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/dev/1.0.0/skills/typescript/SKILL.md`

# Sources Read

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation-frame.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D0-scenario-public-contract-inventory.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/workstream/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/workstream/downstream-realignment-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/workstream/closure-checklist.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/index.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/package.json`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/bin/habitat.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/check.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/classify.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/hook.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/verify.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/hooks.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/commands/habitat-entrypoints.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/docs/IMPLEMENTED-SURFACE.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/docs/SCENARIOS.md`

Commands run:

- `git status --short --branch` and `gt status`
- `bun run openspec -- validate deep-habitat-d0-command-surface-inventory --strict` passed
- `bun run openspec -- list` showed `deep-habitat-d0-command-surface-inventory` at `0/17 tasks`

# Acceptance Verdict

Not accepted. D0 is directionally the right entrance domino, and the OpenSpec packet is syntactically valid, but the scaffold is not implementation-ready. It leaves three acceptance-critical decisions to the execution agent: the compatibility matrix artifact contract, the concrete write/protected path boundary, and the validation oracle for complete public-surface coverage.

This is a packet-specific blocker, not a global-scaffold complaint. D0 is the gate all later dominoes cite before moving command, DTO, package export, script, Nx, generator, and hook surfaces. A vague D0 matrix lets every downstream packet claim compatibility by interpretation.

# P1 Findings

## P1-1: The compatibility matrix is required, but its artifact contract is undefined

The source packet makes the compatibility ledger the central D0 output and says no later packet may move or remove exported internals until the matrix states compatibility handling (`D0-scenario-public-contract-inventory.md:5`, `:52-59`, `:77-97`). The OpenSpec scaffold repeats "create the compatibility matrix" (`proposal.md:27`, `design.md:24`, `tasks.md:14`) but never defines where the matrix lives, its required sections, row schema, completeness oracle, or row identifiers.

That is black ice for implementation. Two agents could both satisfy "create the compatibility matrix" while producing incompatible artifacts: a prose note in `IMPLEMENTED-SURFACE.md`, a packet-local workstream table, a generated JSON file, or a root docs matrix. Downstream dominoes then cannot cite stable row IDs, and D0 fails its purpose as the public-surface gate.

Evidence from current code raises the stakes: `tools/habitat-harness/src/index.ts:1-133` exports broad baseline, command-engine, diagnostics, Grit, hook/process, proof-artifact, workspace-tool, rule, and pattern-authority internals through the package root, while `tools/habitat-harness/package.json:79-83` exposes `"."`, `"./plugin"`, and `"./rules"`. The packet must constrain how those surfaces are inventoried; it cannot leave row shape and artifact location implicit.

Acceptance repair: define the matrix artifact path(s) and mandatory columns before implementation. At minimum: `surface_id`, `plane`, `source_path`, `symbol_or_command`, `current_behavior_or_schema`, `known_consumers`, `contract_state`, `compatibility_handling`, `target_owner`, `downstream_dominoes`, `validation_gate`, `non_claims`, and `notes`. Require stable row IDs that later dominoes cite.

## P1-2: The write set is claimed as resolved but is not actually named

The proposal says the expected Habitat implementation write set is named in `design.md` (`proposal.md:48-51`). It is not. The design only says the executor must have "a concrete write set and protected path list" before implementation (`design.md:45-53`), and tasks defer recording that boundary to implementation (`tasks.md:7-10`).

This contradicts the remediation frame's purpose: the packet is supposed to be complete enough that execution does not invent product/domain/artifact decisions. For D0, the write set determines whether the matrix is packet-local, project-doc-local, `tools/habitat-harness/docs` public reference, OpenSpec-only, or code/test backed. That is not clerical; it controls downstream citation, docs visibility, and closure evidence.

Acceptance repair: name the approved write set and protected paths in `design.md` and `phase-record.md`. If D0 is docs/spec only, say exactly which docs may be edited and which source paths are read-only. If D0 may introduce a public facade or tests, split that into a later implementation packet or name the source/test paths explicitly.

## P1-3: The D0 domain boundary is too broad without plane-level authority rules

The owner is named as "Command/API Contract" (`design.md:17`), but the packet combines at least seven different contract planes: CLI verbs/flags, JSON DTOs, human output, package exports, root scripts, Nx inferred targets, generators, and hooks (`D0-scenario-public-contract-inventory.md:36-50`; `proposal.md:21-29`). Those planes have different adjacent owners and downstream dominoes. For example, `verify --json` still exposes `VerifyProof` language (`tools/habitat-harness/src/commands/verify.ts:20-52`), hooks emit local feedback and `HookTrace` (`tools/habitat-harness/src/lib/hooks.ts:148-154`, `:199-207`), and package root exports expose proof-artifact names (`tools/habitat-harness/src/index.ts:98-110`).

D0 can own compatibility inventory for all of those surfaces, but it should not silently become target-language authority for all of them. The scaffold says adjacent domains may not recreate D0 authority (`design.md:19-20`) without defining the limit of D0's authority versus D1 receipt, D7 enforcement, D9 transaction, D11 local feedback, D12 handoff, and D13/D14 scaffolding/refusal concerns.

Acceptance repair: add plane-level authority rules. For each plane, state what D0 decides now and what it only inventories for downstream owner decision. D0 should own row completeness and compatibility disposition; downstream packets should own target-domain redesign unless D0 explicitly accepts a term or behavior.

# P2 Findings

## P2-1: Validation gates do not falsify the declared D0 contract

The packet's contract covers every command verb, flags/forwarding, JSON and human outputs, package exports, root scripts, Nx targets, generator schemas, and hook behavior (`D0-scenario-public-contract-inventory.md:36-50`). The validation gates are much narrower: one command-entrypoint test file, one `classify` command, one hook help probe, OpenSpec validation, and `git diff --check` (`proposal.md:72-79`; `tasks.md:18-25`; `phase-record.md:22-29`).

Those gates can pass while the D0 matrix is incomplete. They do not require export declaration diffing, root script inventory, Nx metadata enumeration, generator schema tests, `fix`/`graph`/`verify` behavior checks, human-output samples, or a completeness check that every exported value in `src/index.ts` has a row. The source packet's later proof list names these missing categories (`D0-scenario-public-contract-inventory.md:129-136`), but the generated scaffold does not turn them into executable gates.

Required repair: add validation gates that check matrix completeness against source. Examples: an export inventory check over `tools/habitat-harness/src/index.ts` and `tools/habitat-harness/package.json`, a root script/Nx target inventory command, generator schema tests, representative JSON/human output snapshots for all stable commands, and explicit `fix`, `graph`, `verify`, `hook`, `check`, and `classify` coverage.

## P2-2: The hook validation command is ambiguous and potentially unsafe

The scaffold lists `bun run habitat hook pre-commit -- --help` as a validation gate (`proposal.md:74-76`; `tasks.md:20-23`; `phase-record.md:24-27`). The hook command accepts an optional hook name and only a `--base` flag (`tools/habitat-harness/src/commands/hook.ts:11-19`), then delegates `pre-commit` into `runPreCommit` (`tools/habitat-harness/src/lib/hooks.ts:199-214`). A `--help` token after `--` is not clearly a help probe; it is either extra argv ambiguity or a path into local hook execution.

That is a bad D0 gate because local hooks can inspect staged state and may format/restage files. Even if the current parser happens to reject extra args, the packet does not state the expected exit/output or non-mutation guarantee.

Required repair: replace the gate with a non-mutating command contract probe such as `bun run habitat hook --help` plus separate hook behavior tests from `tools/habitat-harness/test/lib/hooks.test.ts`, or state exactly why the current command cannot execute hook side effects and what output is expected.

## P2-3: Stale source-worktree paths remain un-dispositioned

The source packet still names the old worktree path for the export matrix and classify proof (`D0-scenario-public-contract-inventory.md:52-55`, `:167-170`). The generated proposal and phase record use the current remediation worktree for their own source links, and the validation gate was simplified to `tools/habitat-harness/src/plugin.js`, but no OpenSpec artifact explicitly says the old absolute paths are historical provenance and must not be copied into implementation.

Because D0's job is to prevent command/path ambiguity before downstream work, stale absolute paths are not harmless. An implementation agent could follow the source packet literally, especially because it remains a controlling input.

Required repair: add an explicit stale-path repair note to `design.md` or the phase record: all executable commands must run from `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation` or use repo-relative paths; old `wt-codex-habitat-toolkit-domain-refactor-frame` paths are provenance only.

## P2-4: Contract states are named but not semantically defined

The packet lists states such as stable public, versioned public, package-internal, command-only DTO, test-only, generated/derived, deprecated, and refused (`D0-scenario-public-contract-inventory.md:56-58`, `:77-85`; `proposal.md:27-29`; `design.md:24-26`). It does not define the test for choosing each state, whether states are mutually exclusive, or what downstream action each state permits.

This is an implementation-time judgment trap. For example, `CheckReport` is exported from `src/index.ts` (`tools/habitat-harness/src/index.ts:45-51`) and is also emitted by command JSON; the packet must say whether that can be both exported package type and command DTO, or whether one state is primary and the other is a consumer note.

Required repair: add a state glossary with decision rules, examples, and downstream permissions. Include a conflict rule for surfaces that appear on multiple planes.

## P2-5: OpenSpec requirement is too thin to carry downstream citation

The spec delta contains one added requirement with two scenarios (`specs/habitat-harness/spec.md:3-13`). It requires an inventory before later refactors, but it does not require the matrix artifact path, row IDs, complete plane coverage, compatibility states, stale-path policy, validation proof, or downstream citation mechanics. The result is that OpenSpec validates while the actual D0 acceptance oracle remains outside the spec.

Required repair: expand the spec delta into normative requirements for matrix completeness, row citation by later dominoes, legacy proof-shaped terms as compatibility-only rows, and validation gates that prove every matrix plane was covered.

# P3 Findings

## P3-1: "Proof" language remains in packet structure

The source packet has a "Proof Classes" section (`D0-scenario-public-contract-inventory.md:119-142`), and the generated packet retains proof-oriented validation framing indirectly while saying proof/evidence terms are suspect. This is tolerable for historical compatibility if explicitly labelled, but the D0 scaffold should prefer "validation gates", "command samples", "contract rows", "receipt/diagnostic compatibility", and "non-claims" in new target prose.

## P3-2: Root command examples remain inconsistent in current docs

Current Habitat docs say JSON output is available with `bun run habitat check -- --json` (`tools/habitat-harness/docs/SCENARIOS.md:49-59`), while the source packet calls out a mismatch between `bun run habitat check -- --json` and `bun run habitat check --json` (`D0-scenario-public-contract-inventory.md:38-40`). The packet correctly recognizes the issue, but should name the current accepted invocation examples and which docs are expected to change if D0 resolves the mismatch.

## P3-3: Closure checklist is generic and can pass without D0-specific evidence

The closure checklist says "downstream realignment is recorded" and "OpenSpec validation passes" (`closure-checklist.md:5-11`), but it does not require matrix artifact existence, complete row count, stale-path disposition, or validation output capture. Add D0-specific checklist rows so closure does not become a generic OpenSpec shape check.

# Required Repairs

- Define the D0 compatibility matrix artifact path, row schema, state semantics, completeness oracle, and stable row IDs.
- Name the D0 implementation write set and protected/read-only paths in `design.md` and `phase-record.md`; do not defer this to the executor.
- Add plane-level authority rules separating D0 compatibility inventory authority from downstream target-domain redesign authority.
- Replace or clarify the ambiguous hook validation gate so it cannot run mutating local hook behavior.
- Add validation gates that falsify full surface coverage: package exports, root scripts, Nx inferred targets, generator schemas, command JSON/human samples, hooks, and every CLI verb.
- Explicitly mark stale old-worktree absolute paths in the source packet as provenance-only and current-worktree commands as authoritative.
- Expand the OpenSpec spec delta so later dominoes have normative citation requirements, not only prose prerequisites.

# Suggested Wording/Structural Repairs

Suggested `design.md` addition:

```md
## Compatibility Matrix Contract

D0 writes the compatibility matrix at `<exact path>`. Each row MUST have a stable `surface_id` and MUST include: plane, source path, symbol/command/target/schema, current behavior sample, consumers, contract state, compatibility handling, owning downstream domino, validation gate, and non-claims. Later dominoes MUST cite `surface_id` before changing a listed surface.
```

Suggested state rule:

```md
If a surface appears on multiple planes, the matrix records one row per plane and links them with `related_surface_ids`; package-export stability and command-JSON stability are separate compatibility decisions.
```

Suggested hook gate replacement:

```md
- `bun run habitat hook --help`: expected exit 0; proves the hook command help surface without executing a hook.
- `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts`: expected exit 0; proves hook behavior through isolated tests, not live hook mutation.
```

Suggested stale-path note:

```md
Historical absolute paths under `wt-codex-habitat-toolkit-domain-refactor-frame` are provenance only. All executable D0 commands and matrix source paths use the current remediation worktree or repo-relative paths.
```

# Non-Claims

- This review does not accept or reject any TypeScript implementation.
- This review does not claim current Habitat command behavior is wrong; it claims the D0 packet does not yet define a sufficient acceptance oracle for preserving or intentionally changing that behavior.
- Passing `bun run openspec -- validate deep-habitat-d0-command-surface-inventory --strict` proves OpenSpec shape only, not D0 design readiness.
- Global review artifacts were treated as concern catalogs only, not as packet-specific acceptance evidence.
- I did not run `bun run habitat hook pre-commit -- --help` because the current hook command shape makes that gate ambiguous and potentially side-effecting.

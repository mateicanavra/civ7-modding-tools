# D15 Code/Vendor Topology Review

## Verdict

D15 is acceptable for first-wave code/vendor topology review after the current repair state. No P1 or P2 code/vendor topology blockers remain.

The packet correctly keeps the Command Observation Trigger dormant unless a consuming packet proves a concrete command-observation state cannot be represented by local DTOs or projections. Current Habitat code already contains several command-observation surfaces, but they are not by themselves a reason to open a shared D15 substrate:

- `HabitatProcessRequest` / `HabitatCommandResult` already carry command id, kind, executable, argv, cwd, env delta, git before/after, scan roots, cache policy, timing, exit, bounded output, parse status, failure tag, and non-claims in `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/habitat-process.ts:27` and `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/habitat-process.ts:45`.
- Grit check already treats cache observability as a local diagnostic condition and can fail locally when required cache provenance is unknown in `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/grit.ts:396`.
- Grit apply already owns transaction-specific observations, approved roots, isolated-copy transaction records, rollback, file digests, changed paths, and non-claims in `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/grit-apply.ts:74` and `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/grit-apply.ts:115`.
- Hooks already own a separate local-feedback trace model with command phase, argv, cwd, env, exit code, duration, repo snapshots, staged paths, and outcomes in `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/hooks.ts:72` and `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/hooks.ts:91`.
- The public package surface exports `HabitatCommandResult`, `HabitatProcessRequest`, `GritApplyTransactionProof`, `runGritApplyTransaction`, and verification-artifact-shaped compatibility types from `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/index.ts:56`, `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/index.ts:84`, and `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/index.ts:98`, with package export entrypoint at `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/package.json:79`.

D15 responds to that topology correctly: current code is present-behavior record, not target-domain authority. The repaired D15 design requires `dormant`, `trigger-requested`, and `trigger-accepted` states, and states that no D15 source work is authorized while dormant in `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:51`. The trigger request contract requires the consuming packet to name the command family, concrete contradiction, rejected local DTO/projection alternative, required observation fields, public impact, write/protected set, validation gates, and rollback plan in `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:71`. Missing any required item keeps D15 dormant at `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:86`.

## Topology Map

### Process / Effect Surface

Current owner: Habitat process adapter / Effect runtime bridge.

Current consumers:

- Grit check and docs apply use `HabitatProcess` through `runHabitatEffect` in `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/grit.ts:194` and `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/grit.ts:236`.
- Grit apply uses the same process adapter through transaction-local `runProcess` in `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/grit-apply.ts:998`.
- Effect parity is intentionally limited to the runtime bridge; the test enforces no additional `Effect.run*` edges outside `/src/lib/effect-runtime.ts` at `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/test/lib/effect-parity.test.ts:30`.

Topology pressure:

This surface is the main temptation for an unbounded D15 substrate because it is already rich and exported. D15 correctly rejects treating existing Effect/process code as a mandate for shared substrate work in `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:110`.

### Grit Check / Diagnostic Surface

Current owner: D6 diagnostic pattern catalog for target diagnostic identity; current code owner is `grit.ts`.

Current consumers:

- D7 consumes D6 diagnostic projections, not raw Grit output.
- D11 consumes staged diagnostic projections, not raw Grit output.
- D15 remains dormant unless D6 records an exact local DTO insufficiency.

Evidence:

- `GritCheckParseResult` contains parsed and failed command result branches at `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/grit.ts:45`.
- `gritCheckRequest` records argv, cwd, env, scan roots, cache policy, and non-claims locally at `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/grit.ts:428`.
- D6 explicitly keeps D15 dormant unless D6-local DTOs cannot represent the state at `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/workstream/downstream-realignment-ledger.md:20`.

### Apply / Transaction Surface

Current owner: D9 transformation transaction for target behavior; current code owner is `grit-apply.ts`.

Current consumers:

- `habitat fix` routes through `runFix` to `runGritApplyPatterns` in `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/command-engine.ts:606`.
- D11 may consume D9 local-feedback-safe transaction projections.
- D15 remains dormant unless D9 transaction records cannot represent a dry-run/apply/rollback command-observation contradiction.

Evidence:

- Transaction records already capture before/after git state, dry-run/apply/biome/gate/rollback/isolated-copy commands, inventory, diff records, changed paths, file digests, applied diff, and non-claims at `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/grit-apply.ts:74`.
- Apply root and write approval checks are local: structured inventory is blocked outside approved roots at `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/grit-apply.ts:576`, and isolated copy creates/deletes without pattern approval are blocked at `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/grit-apply.ts:600`.
- D9's downstream ledger says D9 does not trigger D15 by default and only triggers it for a concrete contradiction D9-local transaction records cannot represent at `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d9-transformation-transaction/workstream/downstream-realignment-ledger.md:20`.

### Hook / Local Feedback Surface

Current owner: D11 local feedback for target behavior; current code owner is `hooks.ts`.

Current consumers:

- `habitat hook pre-commit` and `pre-push` expose local feedback only.
- D12 may observe D11 trace boundaries but may not treat hook pass as verification completion.
- D15 remains dormant unless local-feedback command state cannot be represented through D1/D3/D6/D7/D9/D10 projections.

Evidence:

- Hook trace command records carry command phase, argv, cwd, env, exit code, and timing at `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/hooks.ts:72`.
- `runHookCommand` records each command into the trace at `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/hooks.ts:722`.
- Tests prove typed pre-commit state and command provenance through fake services at `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/test/lib/hooks.test.ts:334`.
- D11's ledger keeps D15 conditional on an impossible local observation state at `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d11-local-feedback/workstream/downstream-realignment-ledger.md:25`.

### Git / Verify Proof Surface

Current owner: D12 for verify receipt target behavior; current code owner is `command-engine.ts` and `git-state.ts`.

Evidence:

- `readGitState` records branch, head, dirty, status text, and digest at `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/git-state.ts:18`.
- Verify receipt handling has its own command DTO, base resolution, check summary, Nx affected cache state, post-state, and non-claims at `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/command-engine.ts:101` and `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/command-engine.ts:646`.

This surface is a DTO/projection island, not a D15 trigger by itself.

## Findings

### P1

None.

### P2

None.

### P3

1. Proposal wording implies an implementation write set already exists, but D15 is intentionally dormant.

   `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/proposal.md:54` says the expected Habitat implementation write set is named in `design.md`. The design instead requires a future concrete write set and protected path list before implementation at `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:92`.

   Required repair: reword the proposal line to say no Habitat implementation write set is authorized by D15 while dormant, and any future triggered packet must name the exact write/protected set in its own accepted trigger record or sequential owner packet.

2. Future protected-set expectations would be stronger if D15 named an enumerated protected topology.

   D15 requires a write/protected set in the trigger request contract at `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:82`, and the root router already treats generated artifacts and lockfiles as read-only. Current code also has protected Grit scan roots including `.civ7/`, `.git/`, `.habitat/cache/patterns/`, `dist/`, `node_modules/`, and `tools/habitat/dist/` at `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/lib/grit.ts:92`.

   Required repair: add an enumerated protected-set clause to D15's future-trigger contract: generated outputs, lockfiles unless regenerated by owning scripts, `.git/`, `.civ7/outputs/resources`, `.habitat/cache/patterns/`, `dist/`, `node_modules/`, `tools/habitat/dist/`, and any owning packet's protected/generated zones. This is not a first-wave blocker because no source work is authorized.

3. Public-surface blockers are adequate, but future reviewers should treat `@habitat/cli` exports as public for this repo.

   D15 correctly requires D0/D1 compatibility for every touched public command, JSON, export, script, target, generator, and hook surface at `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/design.md:92`, and downstream ledger rows repeat the D0/D1 blockers at `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/downstream-realignment-ledger.md:10`. Because the package exports `.` at `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/package.json:79`, any future changes to exported command or verification-artifact-shaped compatibility types in `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/index.ts:56` and `$ACTIVE_REMEDIATION_WORKTREE/tools/habitat/src/index.ts:84` must be treated as public-surface changes even though the package is private.

   Required repair: optional wording only. Add `@habitat/cli` package exports to the example public-surface blocker list so future trigger authors do not underclassify exported TypeScript contracts.

## Required Repairs

- No P1 repairs are required.
- No P2 repairs are required.
- P3 precision repairs are recommended before final rereview: clarify the dormant write-set wording, add protected-set examples, and call out private-package exports as public repo contracts when D15 touches exported types.

## Acceptance Blockers

The acceptance blocker list for this review lane is empty.

The broader D15 packet still has its documented non-topology gates: fresh first-wave review files for every lane, disposition of accepted findings, final rereview, D15 wording/control audit, packet-index status update, strict OpenSpec validation, full OpenSpec validation, and `git diff --check`. Those are recorded in `$ACTIVE_REMEDIATION_WORKTREE/openspec/changes/deep-habitat-d15-execution-provenance-trigger/workstream/closure-checklist.md:12`.

## Verification

- `bun run openspec -- validate deep-habitat-d15-execution-provenance-trigger --strict`: passed.
- `bun run openspec:validate`: passed, 249 items valid.
- `git diff --check`: passed.

## Skills Used

Skills used: domain-design, information-design, ontology-design, solution-design, system-design, testing-design, typescript, civ7-systematic-workstream, civ7-open-spec-workstream.

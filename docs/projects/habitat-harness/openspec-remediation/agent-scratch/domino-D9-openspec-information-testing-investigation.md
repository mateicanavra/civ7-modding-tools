# D9 OpenSpec Information And Testing Investigation

Role: D9 OpenSpec/information/testing design investigator.

Lane: artifact shape and validation oracle only. This file does not authorize
source refactor implementation and does not edit the D9 OpenSpec packet.

## Verdict

D9 is blocked from this lane.

The current packet is a useful source input, but it is not yet a complete
OpenSpec authority for implementation. The spec delta has only two scenarios,
the task list leaves transaction states and public compatibility decisions to
the implementer, and the workstream control files still carry global
constraints rather than D9-specific accepted/repaired findings.

The required target is a guarded write transaction contract for `habitat fix`:
dry-run inventory, approved pattern admission, approved path ownership,
isolated-copy proof, live write, rollback, formatter handoff, host/pattern gate
handoff, public output, and no-residue behavior must be explicit states with
falsifying tests.

## Inputs Read

- Root `AGENTS.md`.
- Source packet:
  `$PHASE2_PACKET_DIR/D9-transformation-transaction.md`.
- D9 OpenSpec files:
  `$OPENSPEC_CHANGES/deep-habitat-d9-transformation-transaction/proposal.md`,
  `design.md`, `tasks.md`,
  `specs/habitat-harness/spec.md`, and `workstream/*`.
- Remediation context and packet index:
  `$REMEDIATION_DIR/context.md`,
  `$REMEDIATION_DIR/packet-index.md`.
- Global remediation constraints:
  `review-disposition-ledger.md`,
  `agent-scratch/global-domain-adversary.md`,
  `agent-scratch/global-openspec-architect.md`,
  `agent-scratch/global-information-design-reviewer.md`,
  `agent-scratch/global-testing-validation-designer.md`,
  `agent-scratch/global-cross-domino-sequencer.md`.
- Current code/test evidence:
  `tools/habitat/src/lib/grit-apply.ts`,
  `tools/habitat/src/lib/grit-failures.ts`,
  `tools/habitat/src/lib/command-engine.ts`,
  `tools/habitat/src/commands/fix.ts`,
  `tools/habitat/test/lib/grit-apply.test.ts`,
  `tools/habitat/test/commands/habitat-commands.test.ts`,
  `tools/habitat/test/commands/habitat-entrypoints.test.ts`.

## Current Control State

- Observed worktree branch: `codex/d9-transformation-transaction-packet`.
- Observed repo state before writing this scratch file: clean.
- `gt status` reported the git status pass-through as clean.
- `bun run openspec -- list` reports
  `deep-habitat-d9-transformation-transaction` at `0/16 tasks`.
- The remediation context currently says
  `$ACTIVE_REMEDIATION_BRANCH` is `codex/d8-pattern-governance-packet`, while
  the actual branch for this investigation is
  `codex/d9-transformation-transaction-packet`.
- The context file defines D3-D8 variables but not D9 variables. That is not
  fatal for this scratch file, but it is a packetization/control blocker for
  D9 acceptance because future agents cannot route D9 artifacts through the
  same durable variable convention.

## Primary Blockers

### D9-BLOCKER-001: `spec.md` is not an executable transaction contract

The current D9 spec has one requirement and two scenarios:

- dry run requested;
- live apply fails after writes.

That omits most of the source packet contract. It does not specify the dry-run
zero-match state, approved-change inventory, parse/mismatch refusal, dirty
worktree refusal, apply admission, protected-zone refusal, unexpected path,
create/delete refusal, formatter handoff, gate handoff, rollback success,
rollback failure, public output, or no-residue behavior.

Required repair: expand `specs/habitat-harness/spec.md` into multiple
requirements with concrete scenarios. The spec must make the invalid product
states impossible or explicitly refused, not merely name "transaction" as a
concept.

### D9-BLOCKER-002: `tasks.md` leaves design decisions to implementation

Current tasks 2.1-2.3 say:

- define apply transaction states and rollback boundaries;
- separate Grit diagnostic input from write transaction output;
- use D1 receipt terms only for recovery records.

Those are design decisions, not implementation slices. An implementation agent
would still have to decide the transaction union variants, request modes,
public output compatibility, gate ownership, rollback semantics, and exact
test oracle while coding.

Required repair: tasks must first repair the D9 packet itself, then sequence
implementation slices only after spec/design acceptance. Every implementation
task must name the artifact/code area, state variant, falsifying test, and
upstream owner consumed.

### D9-BLOCKER-003: D9 control files import global findings but do not
disposition D9 findings

The D9 review ledger says global constraints are applied and per-domino review
is blocking. That is correct as an initial packet state, but it is not acceptance evidence.

Required repair: import D9-specific blocker rows from this investigation and
the applicable global constraints, then keep D9 blocked until accepted P1/P2
rows are repaired or explicitly rejected with source evidence.

### D9-BLOCKER-004: D9 is sequenced after D8/D10/G-HOST decisions, but those
inputs are not named concretely

The source packet correctly says D9 depends on D1, D6, D8, D10, and consumes
G-HOST through D10 and directly for host-specific pattern gates. The OpenSpec
proposal/design do not name the exact D8 apply-approved lifecycle state or the
D10/G-HOST protected-zone and gate declaration inputs D9 must consume.

Required repair: D9 design must name the projection/manifest/declaration fields
it consumes. "Approved patterns" is not enough.

### D9-BLOCKER-005: Public `habitat fix` compatibility is unresolved

D1 has already identified `ApplyTransactionRecord` as the target meaning and
treats `GritApplyTransactionProof` as legacy public surface unless D0 permits
versioning. Current D9 proposal only says output "may change"; current D9 tasks
only run `habitat fix --help`; global validation expects
`bun run habitat fix --dry-run --json`, but current `fix.ts` exposes only
`--dry-run`.

Required repair: D9 must include a D0-backed output disposition before
implementation:

- preserve current human output only;
- add JSON output under a versioned/additive contract;
- facade legacy `GritApplyTransactionProof` behind `ApplyTransactionRecord`;
- or refuse JSON scope for D9 and remove `--json` from D9 gates with a
  downstream ledger entry explaining which packet owns it.

The implementer must not invent this compatibility decision.

## Missing `spec.md` Requirements And Scenarios

### Requirement: Apply request modes are explicit

Habitat SHALL construct apply transactions through closed request modes, not
through freely-combinable booleans/options.

Scenarios:

- WHEN a dry-run request is created
  THEN it cannot carry live-write, rollback-after-apply, formatter-write, or
  post-write gate states.
- WHEN a live approved transaction is created
  THEN it requires an apply-approved pattern identity from D8, approved roots,
  a clean-worktree requirement, and a dry-run inventory precondition.
- WHEN a rollback-capable transaction is created
  THEN it requires a live write state and changed-path ownership.
- WHEN a gate handoff is created
  THEN it requires a D10/G-HOST or pattern-owned declaration and cannot be an
  anonymous caller-provided command.

### Requirement: Dry-run inventory is a first-class transaction state

Habitat SHALL distinguish dry-run no-match, dry-run approved changes, dry-run
parse failure, dry-run command failure, and dry-run/live mismatch.

Scenarios:

- WHEN dry-run reports zero matches
  THEN Habitat returns a no-mutation state with empty inventory and prohibited
  inference that no live apply success was proven.
- WHEN dry-run reports approved structured inventory
  THEN every entry records pattern identity, file path, symbol/rewrite target,
  approval source, and raw-output digest.
- WHEN dry-run output is non-empty but not zero-match or structured inventory
  THEN Habitat fails closed before live apply.
- WHEN dry-run reports matches but isolated-copy apply produces no diff
  THEN Habitat fails closed as a dry-run mismatch.

### Requirement: Pattern admission is consumed, not decided, by D9

Habitat SHALL apply only patterns whose D8 lifecycle state is apply-approved
for the requested repair surface.

Scenarios:

- WHEN a diagnostic-registered pattern lacks apply approval
  THEN D9 refuses before dry-run/live write.
- WHEN a candidate file exists without D8 apply approval
  THEN file presence does not authorize a transaction.
- WHEN D8 records pattern refusal/retirement
  THEN D9 refuses even if a Grit pattern file still exists.

### Requirement: D6 diagnostic identity cannot imply apply safety

Habitat SHALL treat diagnostic pattern findings as possible transaction input
only after D8 apply approval and D9 dry-run/path checks.

Scenarios:

- WHEN D6 emits a diagnostic adapter failure
  THEN D9 does not convert it into an apply transaction failure.
- WHEN a diagnostic pattern has current-tree findings
  THEN D9 still requires D8 apply approval and D9 transaction checks before
  any write.

### Requirement: Approved write set owns every changed path

Habitat SHALL refuse changed paths outside approved roots and SHALL refuse
create/delete effects unless a pattern-owned create/delete approval contract
exists.

Scenarios:

- WHEN inventory names a path outside approved roots
  THEN D9 refuses before live apply.
- WHEN isolated-copy diff evidence changes a path outside approved roots
  THEN D9 refuses before live apply.
- WHEN isolated-copy diff evidence creates a file without pattern-owned create
  approval
  THEN D9 refuses.
- WHEN isolated-copy diff evidence deletes a file without pattern-owned delete
  approval
  THEN D9 refuses.
- WHEN live apply produces a changed path not present in the approved write set
  THEN D9 rolls back and reports unexpected-path failure.

### Requirement: Generated/protected-zone policy is a blocking input

Habitat SHALL consume D10/G-HOST protected-zone and generated-zone declarations
before live apply.

Scenarios:

- WHEN a planned write intersects a generated or protected zone without an
  allowed mutation declaration
  THEN D9 refuses before live apply.
- WHEN host policy is missing for a host-specific apply gate
  THEN D9 refuses rather than silently disabling the gate.
- WHEN D10 reports next-safe-action/refusal for a protected path
  THEN D9 reports that refusal as transaction refusal, not as diagnostic or
  formatter failure.

### Requirement: Live write is conditional on dry-run and copy proof

Habitat SHALL run live apply only after dry-run inventory and isolated-copy
proof have approved the exact write set.

Scenarios:

- WHEN live apply starts
  THEN the pre-live git state is clean unless the transaction is explicitly an
  isolated-copy proof that cannot mutate the source tree.
- WHEN live apply succeeds and changed paths equal the approved set
  THEN the transaction enters live-write-applied state and proceeds to handoffs.
- WHEN live apply fails or is interrupted after possible writes
  THEN Habitat attempts rollback and records the rollback relation.

### Requirement: Rollback is an explicit state relation

Habitat SHALL record rollback not as a nullable side field but as a state
transition after a write or rollback-requested dry-run fixture.

Scenarios:

- WHEN live apply fails and rollback succeeds
  THEN the transaction records failed-after-apply with rollback-succeeded and
  final clean git state.
- WHEN formatter handoff fails and rollback succeeds
  THEN the formatter failure remains the cause and rollback is recorded as
  recovery.
- WHEN gate handoff fails and rollback succeeds
  THEN gate failure remains the cause and rollback is recorded as recovery.
- WHEN rollback fails
  THEN the transaction records rollback-failed, residual changed paths, file
  digests, recovery instructions, and prohibited inference that the tree is
  clean.

### Requirement: Formatter handoff is not apply safety proof

Habitat SHALL run Biome or formatter handoff after live apply when changed
paths require it, but SHALL label formatter outcome as hygiene handoff.

Scenarios:

- WHEN formatter succeeds
  THEN D9 may continue to gates but does not claim formatter success proves
  product behavior or apply safety.
- WHEN formatter fails
  THEN D9 attempts rollback and reports formatter-handoff-failed.

### Requirement: Host/pattern gates are declared handoffs

Habitat SHALL run only declared gates associated with the apply-approved pattern
or host policy.

Scenarios:

- WHEN a declared gate succeeds
  THEN D9 records the gate command result and its non-claims.
- WHEN a declared gate fails
  THEN D9 attempts rollback and reports gate-failed.
- WHEN an implementation caller supplies an undeclared arbitrary gate command
  THEN D9 refuses before live apply.

### Requirement: Docs rewrite and source rewrite remain distinct apply lanes

Habitat SHALL keep docs-local-checkout-path rewrites and source public-import
rewrites in separate pattern lanes with separate roots, approval semantics, and
handoff records.

Scenarios:

- WHEN docs dry-run finds a markdown candidate
  THEN docs paths are approved only through the docs pattern lane.
- WHEN source dry-run finds MapGen public import candidates
  THEN source paths are approved only through the source pattern lane and its
  pattern-specific public target gate.
- WHEN docs dry-run lists a markdown file without a rewrite hunk
  THEN it cannot become an approved changed path.

### Requirement: Public fix output is compatibility-controlled

Habitat SHALL expose `habitat fix` transaction output only through D0-backed
compatibility disposition.

Scenarios:

- WHEN `GritApplyTransactionProof` remains exported or rendered
  THEN it is a legacy-name facade for `ApplyTransactionRecord` semantics.
- WHEN JSON output is added
  THEN it has a schema/version decision, stable state tag field, non-claims,
  and bad-case tests.
- WHEN JSON output is not in D9 scope
  THEN D9 validation gates must not require `--json`.

### Requirement: No-residue behavior is observable

Habitat SHALL leave no source-tree residue from dry-run, isolated-copy proof,
or failed live transactions with successful rollback.

Scenarios:

- WHEN dry-run completes
  THEN `git status --short --branch` before and after remains unchanged.
- WHEN isolated-copy proof completes
  THEN probe/source files remain byte-identical and temporary copy directories
  are removed.
- WHEN a failed live transaction rolls back successfully
  THEN final git status is clean or contains only pre-existing non-D9 changes
  explicitly recorded.

### Requirement: D15 trigger is decided, not implied

Habitat SHALL include a D15 decision row for D9 command provenance needs.

Scenarios:

- WHEN `habitat fix --dry-run --json` requires argv/cwd/env/cache/duration
  fields that local D9 DTOs cannot represent without contradictory states
  THEN D9 records the D15 trigger and either blocks on a single substrate owner
  or narrows the output scope.
- WHEN local DTO variants can represent the D9 transaction record
  THEN D15 is rejected for D9 and no shared substrate edit is authorized.

## Required Task Slices And Sequence

### 0. Repair packet control before implementation

1. Add D9 routing variables or a D9 traceability row that gives future agents a
   durable path to D9 source packet, change root, review ledger, phase record,
   downstream ledger, and scratch reviews.
2. Correct branch/worktree fixture drift in control records or record a
   no-patch disposition explaining why the D8 branch value is historical.
3. Import this investigation as a D9 review ledger blocker.

### 1. Close design authority

1. Add the D9 state table to `design.md`: request modes, transaction states,
   allowed transitions, owners, forbidden owners, and required fields.
2. Add the D8 apply-approved pattern input table: lifecycle state, manifest
   fields, pattern identity, approved roots, approved operation class,
   create/delete authorization, and declared gates.
3. Add the D10/G-HOST input table: protected/generated path facts, host gate
   declarations, missing-host-policy refusal.
4. Add the D1/D0 compatibility table for `ApplyTransactionRecord`,
   `GritApplyTransactionProof`, command human output, command JSON output,
   package exports, tests, and docs examples.
5. Add the D15 decision row.

### 2. Repair the normative spec

1. Replace the current single requirement with the requirements listed above.
2. Ensure each scenario is falsifiable and uses `WHEN`/`THEN`/`AND`.
3. Avoid implementation names unless D0/D1 explicitly retain them as
   compatibility surfaces.

### 3. Replace generic tasks with executable slices

1. State model and typed constructors.
2. D8 apply-admission consumption.
3. D10/G-HOST protected-zone and gate-declaration consumption.
4. Dry-run inventory parser/refusal states.
5. Isolated-copy proof and diff evidence states.
6. Path approval and create/delete refusal.
7. Live apply and unexpected-path rollback.
8. Formatter handoff.
9. Declared host/pattern gates.
10. Rollback/recovery record and residual-state output.
11. `habitat fix` human/JSON output compatibility.
12. Docs/source pattern lane split.
13. No-residue cleanup.
14. Downstream docs/tests/spec updates.
15. Validation and closure.

Each task needs its own test or command oracle. Do not combine all behavior
into "run grit-apply tests".

### 4. Only then implement source refactor

Implementation should not start until the D9 review ledger has no accepted
unresolved P1/P2 findings and the packet index no longer marks D9 as blocking.

## Review Ledger Findings To Import As Blockers

| Finding | Severity | Required D9 disposition |
| --- | --- | --- |
| Per-domino review remains blocking. | P1 | Keep blocked until D9-specific domain, OpenSpec, TypeScript/state, validation, information, and cross-domino findings are dispositioned. |
| `spec.md` lacks the source packet's transaction state coverage. | P1 | Add missing requirements/scenarios above. |
| `tasks.md` contains unresolved design decisions. | P1 | Replace with design repair and implementation slices. |
| D9 context fixture drift and missing D9 variables. | P2 | Repair context/index or record explicit no-patch disposition before handoff. |
| Generic proof vocabulary can hide transaction semantics. | P1 | Use `ApplyTransactionRecord`/guarded write transaction language; treat `GritApplyTransactionProof` only as D0/D1 compatibility. |
| Artifact owner can masquerade as domain authority. | P1 | State D9's decision right: guarded writes and rollback; forbid D6/D8/D10/Biome from deciding transaction safety. |
| TypeScript state-space reduction alone is not acceptance. | P1 | Name the product-invalid states removed: unapproved apply, unexpected write, hidden rollback failure, formatter/gate proof inflation. |
| Stale absolute paths and branch evidence can become executable proof. | P1 | Use repo-relative commands and current branch/status evidence for closure. |
| Non-claims can be used to close failed gates. | P2 | State that non-claims narrow passing evidence only; failed required D9 gates block closure. |
| D9 must not become a general auto-repair engine. | P1 | Keep `habitat fix` limited to D8 apply-approved patterns and declared gates. |
| D15 substrate work needs one owner. | P2 | Add D15 decision row; do not authorize shared process/Effect edits from D9 unless trigger passes. |

## Design-Time Gates Versus Later Implementation Gates

### Design-time gates

These must close before source refactor implementation starts:

- D9 review ledger has D9-specific findings and no accepted unresolved P1/P2.
- `proposal.md` states D9 boundary, dependencies, forbidden owners, public
  output impact, and stop conditions without "may affect" ambiguity.
- `design.md` contains the transaction state table, request mode constructors,
  upstream input tables, public compatibility table, D15 row, and rejected
  alternatives.
- `spec.md` contains complete normative requirements and scenarios.
- `tasks.md` is ordered and executable, not a list of decisions.
- D0 compatibility disposition exists for any `habitat fix` output/export/docs
  surface touched.
- D8 apply-approved lifecycle fields consumed by D9 are named.
- D10/G-HOST protected-path and gate-declaration inputs consumed by D9 are
  named.
- Validation commands have exact expected status, oracle, bad case,
  cache/freshness stance, and non-claims.

### Later implementation gates

These prove implementation after packet acceptance; they cannot substitute for
the design-time gates above:

- `bun run --cwd tools/habitat test -- test/lib/grit-apply.test.ts`.
- `bun run --cwd tools/habitat test -- test/commands/habitat-commands.test.ts`.
- `bun run --cwd tools/habitat test -- test/commands/habitat-entrypoints.test.ts` if public CLI behavior changes.
- `bun run habitat fix --dry-run` or `bun run habitat fix --dry-run --json`
  depending on the D0/D9 public output decision.
- `git status --short --branch` before and after dry-run/no-residue checks.
- `bun run openspec -- validate deep-habitat-d9-transformation-transaction --strict`.
- `bun run openspec:validate`.
- `git diff --check`.

## Falsifying Tests And Commands

### Dry-run

Falsifier: dry-run mutates the source tree, conflates no-match with live
success, or treats malformed output as success.

Required checks:

- Unit: dry-run with dirty worktree is allowed only because it does not write;
  proof records dirty pre-state and empty/approved inventory.
- Unit: non-empty unstructured dry-run output returns dry-run mismatch.
- Unit: dry-run reports matches but isolated copy returns no diff returns
  mismatch.
- Command: `git status --short --branch` before and after
  `bun run habitat fix --dry-run` or `--dry-run --json` is unchanged.
- Oracle: no live apply command, no formatter command, and no gate command runs
  in dry-run-only mode unless the spec explicitly defines read-only dry-run
  gate inventory.

### Live write

Falsifier: live apply runs without D8 apply-approved pattern, clean pre-state,
dry-run inventory, isolated-copy proof, approved roots, and D10/G-HOST path
approval.

Required checks:

- Unit: live apply refuses dirty worktree before running Grit.
- Unit: live apply command is observed only after approved inventory/copy proof.
- Unit: changed paths after live apply equal approved paths exactly.
- Unit: `ok: true` with any failure tag or rollback-failed state is impossible
  or rejected.
- Command: live write fixture may alter only expected fixture files and must
  record file digests.

### Rollback

Falsifier: post-write failure hides rollback attempt/outcome or reports clean
success after rollback failure.

Required checks:

- Unit: live apply command failure after possible write triggers rollback.
- Unit: live apply interruption triggers rollback and preserves signal metadata.
- Unit: formatter failure triggers rollback.
- Unit: gate failure triggers rollback.
- Unit: rollback failure returns rollback-failed state with residual paths,
  rollback command result, before/after file digests, and recovery instructions.
- Command: post-rollback `git status --short --branch` is clean for
  rollback-succeeded tests.

### Unexpected path

Falsifier: a path outside the approved write set survives as success or as a
formatter/gate problem.

Required checks:

- Unit: structured inventory outside approved roots is blocked.
- Unit: isolated-copy diff outside approved roots is blocked.
- Unit: live apply that changes an unapproved path is rolled back and reported
  as unexpected-path failure.

### Create/delete refusal

Falsifier: file creation or deletion inside approved roots is silently treated
as an approved modification.

Required checks:

- Unit: isolated-copy create evidence with `beforeSha256: null` is blocked
  unless the pattern has explicit create approval.
- Unit: isolated-copy delete evidence with `afterSha256: null` is blocked
  unless the pattern has explicit delete approval.
- Spec: if create/delete approval is not part of D8's apply-approved lifecycle,
  D9 SHALL refuse all create/delete effects.

### Formatter handoff

Falsifier: Biome success is reported as apply safety/product proof, or Biome
failure leaves writes unrolled-back.

Required checks:

- Unit: formatter command runs only after live changed paths exist.
- Unit: formatter success is recorded as hygiene handoff with non-claims.
- Unit: formatter failure triggers rollback and produces
  formatter-handoff-failed state.
- Oracle: formatter handoff cannot authorize a write path that dry-run/copy
  proof did not approve.

### Gate handoff

Falsifier: arbitrary caller-local gates decide transaction safety, or host gate
failure is hidden as generic command failure.

Required checks:

- Unit: declared gate success is recorded with command id, owner, and
  non-claims.
- Unit: declared gate failure triggers rollback and records gate-failed state.
- Unit: undeclared gate request is refused before live apply.
- Unit: missing G-HOST/D10 host declaration refuses before live apply.

### Docs/source pattern split

Falsifier: docs markdown rewrites and source import rewrites share roots,
approval semantics, or public-ops validation.

Required checks:

- Unit: source lane uses source apply pattern and source roots only.
- Unit: docs lane uses docs pattern and markdown files only, never the whole
  `docs` directory.
- Unit: docs dry-run file with no rewrite hunk cannot become approved changed
  path.
- Unit: MapGen public ops export validation is pattern/host-specific, not
  generic transaction truth.

### Public output

Falsifier: public fields change without D0 disposition, or `--json` is required
by validation but not designed as a public contract.

Required checks:

- Unit/command: `Fix.run(["--dry-run"])` forwards dry-run and renders expected
  human output.
- If JSON is in scope: `bun run habitat fix --dry-run --json` has stable
  schema/version, transaction state tag, non-claims, and bad-case fixtures.
- If JSON is out of scope: D9 tasks/phase record do not require the `--json`
  gate, and downstream validation notes are patched or dispositioned.

### No-residue behavior

Falsifier: dry-run, isolated-copy proof, injected probe, or failed transaction
leaves untracked/tracked residue.

Required checks:

- Unit: isolated-copy proof leaves source probe file byte-identical.
- Unit: missing-export probe cleanup removes injected files.
- Command: `git status --short --branch` before/after dry-run and injected
  probes matches expected state.
- Unit: temporary copy roots are removed after success and failure paths, or the
  design names a cleanup observation if direct temp existence is not testable.

## Wording Audit Terms That Should Block Acceptance

These terms may appear only in forbidden-language sections, historical input
quotes, or explicit rejected alternatives. Their unqualified presence in
proposal/design/spec/tasks/ledger rows blocks D9 acceptance:

- `shim`
- `implicit alternate authority path`
- `temporary`
- `optional target shape`
- `dual path`
- `support both`
- `compatibility until later`
- `silent skip`
- `only if needed`
- `best effort`
- `when feasible`
- `may affect`
- `safe` without a falsifying criterion
- `stable` without a compatibility/versioning criterion
- `trustworthy` or `robust` without an oracle
- `proof` as a generic noun where `ApplyTransactionRecord`, command result,
  handoff record, assertion summary, or prohibited inference is meant
- `non-claim` without naming the prohibited inference
- `state-space reduction` without naming the product-invalid state removed
- `approved pattern` without naming the D8 lifecycle state/fields
- `gate` without naming owner, declaration source, and failure behavior
- `generated/protected path` without naming D10/G-HOST owner and refusal
  behavior
- `ok: boolean` or nullable proof-field language as target design rather than
  legacy compatibility

## Current Code Evidence That The Spec Must Control

- `GritApplyTransactionOptions` currently combines `dryRun`,
  `allowDirtyWorktree`, `rollbackAfterApply`, and `gateCommands`; this is the
  invalid-state source the D9 design must replace with constructors/request
  variants.
- `GritApplyTransactionResult` is currently `ok: boolean`, nullable
  `failureTag`, and `proof`; D1 already identifies the target meaning as
  `ApplyTransactionRecord`.
- `grit-apply.ts` currently owns both generic mechanics and pattern-specific
  details: source/docs pattern constants, docs root discovery, MapGen public
  ops target validation, Biome handoff, gate execution, rollback, and
  no-index diff proof.
- `fix.ts` currently exposes `--dry-run` only and forwards to `runFix`; there
  is no current `--json` flag in the command class.
- `command-engine.ts` currently implements `runFix` as a direct
  `runGritApplyPatterns({ dryRun })` call.
- Existing tests cover many important states but not the complete D9 target
  contract: arbitrary gate declaration/refusal, D8 lifecycle consumption,
  D10/G-HOST generated/protected-zone refusal, public JSON output, and
  docs/source lane authority split need explicit D9 packet decisions before
  implementation expands tests.

## Acceptance Checklist For D9 From This Lane

D9 can move from blocked to accepted for design/specification only when:

- D9 context/traceability is durable for future agents.
- The D9 review ledger imports and dispositions the findings above.
- `spec.md` contains complete guarded transaction requirements and scenarios.
- `design.md` closes request modes, states, owners, public compatibility,
  D8/D10/G-HOST inputs, D15, and rejected alternatives.
- `tasks.md` is executable and ordered by dependency.
- Validation gates include exact commands, expected status, oracle, bad case,
  freshness/cache stance, and non-claims.
- Wording audit finds no unqualified shortcut terms.

Until those repairs exist, D9 implementation agents would still have to decide
transaction states, write-set ownership, public compatibility, validation,
rollback semantics, and downstream handoff while coding.

Skills used: domain-design, information-design, solution-design,
testing-design, civ7-open-spec-workstream, typescript-refactoring.

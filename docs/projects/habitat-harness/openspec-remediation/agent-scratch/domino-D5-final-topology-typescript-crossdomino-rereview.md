# D5 Final Topology / TypeScript / Cross-Domino Rereview

Verdict: accepted for design/specification only.

No unresolved P1/P2 findings remain in the current D5 Baseline Authority OpenSpec packet on disk. No P3 findings found in this rereview lane.

Implementation remains blocked behind concrete D0 rows for every touched public or durable surface and live D2 baseline facts/projections wherever source implementation consumes rule baseline metadata. Acceptance here does not authorize source edits and does not accept D7 or D8.

## Scope Read

- Packet/control surfaces:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/proposal.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/specs/habitat-harness/spec.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/tasks.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/phase-record.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/review-disposition-ledger.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/downstream-realignment-ledger.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/closure-checklist.md`
- Grounding source/topology inputs:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/index.ts`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/pattern-authority/manifest.ts`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/pattern/registration.cjs`
  - `docs/projects/habitat-harness/phase2-workstream-packets/D7-structural-enforcement-pipeline.md`
  - `docs/projects/habitat-harness/phase2-workstream-packets/D8-pattern-governance.md`
- Negative-control inputs:
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D5-code-topology-investigation.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D5-typescript-state-investigation.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D5-cross-domino-investigation.md`

## Findings

### P1

None.

### P2

None.

### P3

None.

## Evidence

### TypeScript state-space collapse is specified tightly enough

Current source still has the exact state-space risks D5 is meant to remediate: `ExternalExceptionSourceModel` uses optional `projectedKeys`, `projectKeys`, and `validate` combinations at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts:109`; `BaselineExpansionGuardResult` is `ok: boolean` with optional `reason` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts:223`; `createCheckReport` loads and applies baseline state inline at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:273`; exported baseline types/functions are public at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/index.ts:1`.

The packet no longer leaves those as prose aspirations. It defines target ontology for `BaselineAuthorityState`, `BaselineRefusal`, `BaselineApplicationResult`, `BaselineIntegrityResult`, `BaselineExpansionDecision`, `ExternalExceptionSource`, `RuleIntroductionBaselineManifest`, and `BaselineAuthorityProjection` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:60`. It then maps current smells to target moves at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:118` and requires closed states before consumer migration/deletion at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:131`.

The normative spec backs the model with scenarios for accepted explicit states, malformed/non-string/duplicate/unsorted/orphan refusals, external fixed/derived projections, external unreadable/malformed/mismatch refusals, parser-owned bypass refusal, shrink-only comparison-base failures, existing-rule growth, and rule-introduction manifest acceptance/refusal at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/specs/habitat-harness/spec.md:3`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/specs/habitat-harness/spec.md:59`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/specs/habitat-harness/spec.md:103`, and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/specs/habitat-harness/spec.md:141`.

Tasks are implementation slices, not open design prompts: closed authority state, refusal reasons, diagnostic/baseline/projection/match type separation, exhaustive handling, discriminated external source model, shrink-only integrity, expansion decision, and consumer projections are enumerated at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/tasks.md:20`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/tasks.md:28`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/tasks.md:36`, and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/tasks.md:46`.

### Write/protected sets and D0/D2 blockers are explicit

The public surface table enumerates baseline JSON, `habitat check --json`, focused `baseline-integrity`, `--expand-baseline`, package exports, Pattern Authority baseline contract fields, generator messages, docs/examples, and generated help/manifests as D0-blocked surfaces at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:136`.

The source write set is bounded to baseline, command-engine consumption, command adapter compatibility, exports, and focused tests at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:191`; protected paths explicitly exclude unrelated D7, D8, D13, generated/lockfile/live-baseline, D2 schema, and non-Habitat domains at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:205`.

D0/D2 are correctly split between design-time consumption and source-time blockers. Proposal requirements state concrete D0 rows and live D2 projections are still required for implementation at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/proposal.md:72`. The phase record repeats that D0/D2 guide design now but block source implementation until concrete/live facts exist at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/phase-record.md:32` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/phase-record.md:51`. The downstream ledger preserves the same blocker as downstream handoff state at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/downstream-realignment-ledger.md:5`.

### D7 and D8 handoffs are exact and one-way

D7 source expects to consume baseline application while owning report construction and forbids baseline internals leaking into enforcement stages at `docs/projects/habitat-harness/phase2-workstream-packets/D7-structural-enforcement-pipeline.md:51` and `docs/projects/habitat-harness/phase2-workstream-packets/D7-structural-enforcement-pipeline.md:151`. D8 source expects Pattern Authority to consume D5 baseline contract while not letting baseline/file presence imply lifecycle at `docs/projects/habitat-harness/phase2-workstream-packets/D8-pattern-governance.md:56` and `docs/projects/habitat-harness/phase2-workstream-packets/D8-pattern-governance.md:146`.

The D5 packet now publishes exactly that. D7 consumes `BaselineApplicationResult`, `BaselineIntegrityResult`, and D5 command diagnostics, while D7 may not decide shrink-only policy, manifest acceptance, or external projection at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:164`. D8 consumes `BaselineAuthorityProjection` / refusal state and may not decide acceptance, external projection validity, seeded debt, or existing-rule growth at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:174`. The downstream ledger states the same allowed facts and non-claims separately for D7 and D8 at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/downstream-realignment-ledger.md:7`.

### Source agents are not left with implementation-time product/design decisions

The packet explicitly rejects target-language ambiguity and ownership-leaking language at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:75`. Stop conditions block success/refusal overlap, incomplete external source models, unguarded `--expand-baseline`, D7/D8 baseline authority decisions, and missing D0 rows at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/proposal.md:101`.

The review ledger imports the prior P1/P2 negative-control findings and records repair evidence for the packet/control surfaces at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/review-disposition-ledger.md:9`, while preserving that final rereview is the remaining acceptance gate at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/review-disposition-ledger.md:27`.

## Validation

- `bun run openspec -- validate deep-habitat-d5-baseline-authority --strict`: passed.
- `bun run openspec:validate`: passed, 249 items passed and 0 failed.
- `git diff --check`: passed.
- Shortcut-language scan over the active D5 packet/control surfaces and current final OpenSpec/testing scratch: no matches for allowed-strategy shortcut terms.

## Final Rereview Statement

D5 is accepted for design/specification only from the topology, TypeScript state-space, and cross-domino lane. There are no unresolved P1/P2 findings on current disk in this lane. Source implementation remains blocked behind concrete D0 rows/live D2 facts, and D7/D8 remain separate downstream packets rather than accepted by implication.

# Proposal: D12 Verify Handoff Receipt

## Summary

D12 designs the `habitat verify` command as a Verify Handoff assembler. The
command produces a bounded `VerifyReceipt` from upstream check, graph target
plan, affected Nx command, and post-state observations. The receipt is a
repo-maintenance handoff record for a reviewer or implementation agent; it is
not CI, product approval, runtime validation, OpenSpec acceptance, apply safety,
or Graphite readiness.

This change repairs the D12 OpenSpec packet for design/specification review
only. It does not implement Habitat source changes and it does not promote D12
to accepted status until fresh final rereviews find no unresolved P1/P2
blockers.

## Authority

- `$REMEDIATION_DIR/openspec-remediation-frame.md`: remediation pass frame and
  product identity.
- `$D12_SOURCE_PACKET`: controlling source domino input for verify handoff.
- `$D0_CHANGE`: public compatibility matrix authority. Concrete D0 rows are
  required before touching verify command JSON, human output, help, exports,
  docs, scripts, or generated surfaces.
- `$D1_CHANGE`: receipt boundary, canonical `NonClaim` identifiers, typed
  handoff relationships, and legacy `VerifyProof` compatibility handling.
- `$D3_CHANGE`: `VerifyTargetPlan`, graph read/refusal states, and target
  availability authority.
- `$D7_CHANGE`: `VerifyCheckSummaryProjection`, check-result authority, and the
  allow/skip signal for affected target execution.
- `$D11_CHANGE`: local-feedback non-claim and hook trace boundary authority
  when D12 observes local-feedback surfaces.
- Current Habitat source and tests under `$HABITAT_TOOL` as present behavior
  input only.
- Nx affected and caching documentation as vendor grounding for affected target
  base selection, task execution, terminal-output replay, and cache observation.

## Product Scenario

A DRA owner runs `habitat verify` before handing work to a reviewer. They need a
single command record that answers:

- what check result was consumed;
- which base and affected target plan were selected;
- whether affected targets ran, were skipped with owner-sourced reason, or
  failed;
- what bounded command output and task-local cache observations were available;
- what post-state was observed;
- which downstream conclusions the command does not assert.

The command must be useful even when upstream check or graph authority refuses
execution. A skipped affected run is a first-class state with owner-sourced
D7/D3 reason, not a missing object and not a success.

D12 also preserves the documented distinction between root `bun run verify` and
diagnostic `bun run habitat verify`. Root `bun run verify` is an Nx aggregate
repo workflow. Diagnostic `habitat verify` is a Habitat command receipt and
must not be presented as a replacement for the root aggregate, CI, or reviewer
approval.

## What Changes

- D12 defines `VerifyReceipt` as the target domain object for verify handoff.
- D12 classifies legacy `VerifyProof` names as compatibility surfaces whose
  preservation, versioning, facade, or deprecation must follow D0 and D1.
- D12 defines closed state families for base selection, check consumption,
  target-plan consumption, affected target execution, task cache observation,
  post-state observation, receipt outcome, selector state, and non-claims.
  Affected non-execution uses upstream D1/D7 `skipped` semantics.
- D12 requires `habitat verify` to consume D3 `VerifyTargetPlan` and D7
  `VerifyCheckSummaryProjection` instead of hard-coding graph/check semantics.
- D12 defines the affected Nx invocation contract: target source, base/head
  handling, output style, stable ordering, command working directory, and
  refusal states when D3/D7 inputs are unavailable.
- D12 sets implementation gates for JSON compatibility, human output, bounded
  streams, affected-failure handling, and canonical non-claims.

## What Does Not Change

- D12 does not execute or model rule diagnostics. D6/D7 own diagnostics and
  structural check outcomes.
- D12 does not construct graph truth, resolve Nx project targets, or define
  target availability. D3 owns those facts.
- D12 does not own baseline policy, pattern governance, apply transactions,
  hook/local feedback, hook trace semantics, or protected-zone mutation policy.
- D12 may observe D11 local-feedback non-claims and hook trace boundaries only
  as upstream/local-feedback observations. It must not cite hook pass,
  local-feedback eligibility, or hook trace output as verify handoff completion,
  CI, graph authority, Graphite readiness, product/runtime readiness, OpenSpec
  acceptance, apply safety, current-tree correctness, or root aggregate
  verification.
- D12 does not change runtime product behavior, CI, Graphite submit/PR state, or
  authoring topology policy.
- D12 does not authorize source implementation before concrete D0 rows and live
  upstream projections exist.

## Requires

- D0 accepted design plus concrete public-surface rows before source edits.
- D1 accepted design plus live receipt/output-family handling where touched.
- D3 accepted design plus live `VerifyTargetPlan` and graph-refusal facts before
  verify source behavior consumes them.
- D7 accepted design plus live `VerifyCheckSummaryProjection` before verify
  source behavior consumes check allow/skip states.
- D11 accepted design plus live local-feedback or hook trace projections only
  if D12 observes D11-owned local-feedback surfaces.

## Enables

- D14 can consume D12 examples and verify handoff limits when fencing authoring
  topology and command-facing closure.

## Public And Durable Surfaces

Source implementation must inventory and cite D0 rows before changing any of
these surfaces:

- `habitat verify`, `habitat verify --json`, `habitat verify --help`, exit
  status, human output, and command examples.
- Legacy `VerifyProof` JSON shape, `schemaVersion`, and any new or versioned
  `VerifyReceipt` shape.
- `createVerifyProof`, any target `createVerifyReceipt` function, and exports
  from `$HABITAT_TOOL/src/index.ts`.
- Verify tests such as `test/lib/verify-proof.test.ts` and
  `test/commands/habitat-commands.test.ts`.
- Nx targets or package scripts that route through verify.
- Habitat docs and examples that teach verify output or handoff behavior.
- The docs distinction between root `bun run verify` and diagnostic
  `bun run habitat verify`.

## Source Implementation Blockers

Source work remains blocked until all of the following are true:

- D0 rows exist for every touched public or durable verify surface.
- D1 live output-family mapping supports the target `VerifyReceipt` semantics
  and any legacy `VerifyProof` compatibility handling.
- D3 live graph projection exposes the verify target plan and graph-refusal
  states used by D12.
- D7 live check projection exposes the allow/skip affected-execution signal
  and requested selector state used by D12.
- D11 live local-feedback or hook trace projections exist before D12 observes
  any D11-owned local-feedback surface.
- D12 final rereviews record no unresolved P1/P2 findings against the repaired
  packet.

## Stop Conditions

- A failed or refused check can still run affected targets as if check passed.
- Missing graph/check projections are represented as passing verify output.
- Affected target failure is hidden inside an executed state without a failed
  receipt outcome.
- `{}` or absent selector state can mean none, unsupported, inherited, or
  requested.
- Free-form non-claim strings replace D1 canonical identifiers.
- Legacy proof-named code becomes target-domain language instead of a D0/D1
  compatibility surface.
- Verify output claims CI, Graphite readiness, OpenSpec acceptance, apply
  safety, product completion, or runtime behavior.

## Design-Time Validation Gates

- `bun run openspec -- validate deep-habitat-d12-verify-handoff-receipt --strict`
- `bun run openspec:validate`
- D12 complete-standard wording audit over `$D12_CHANGE/**`,
  `$REMEDIATION_DIR/packet-index.md`, and `$AGENT_SCRATCH/domino-D12-*.md`.
- `git diff --check`

## Later Implementation Gates

- `bun run --cwd tools/habitat-harness test -- test/lib/verify-proof.test.ts test/commands/habitat-commands.test.ts`
- Focused tests for target receipt states, including check-allowed execution,
  check-skipped affected execution, graph-refusal target plan, affected command
  failure, bounded streams, task cache observation, post-state unavailable, D11
  hook/local-feedback non-claim boundaries where consumed, and canonical
  non-claims.
- Focused tests for exact affected argv after D3 target-plan consumption:
  `nx affected -t <stable-target-list> --base <resolved-base> --head HEAD --outputStyle=static`
  unless final review accepts a different explicit argv with Nx grounding.
- `bun run habitat verify --json` with expected status/oracle recorded for both
  successful and refused/failed scenarios.
- `bun run habitat verify --help` after D0/D1 public-surface handling is cited.

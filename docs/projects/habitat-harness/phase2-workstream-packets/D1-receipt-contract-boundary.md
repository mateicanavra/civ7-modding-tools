# D1 Receipt Contract Boundary

## Intent

Define Habitat's receipt vocabulary and receipt DTO boundaries before check, verify,
hooks, Grit, apply, and Graphite handoff refactors start sharing or reshaping
evidence.

## Product Scenario

A DRA owner hands work to a reviewer and needs Habitat output to say what was
checked, observed, skipped, refused, and not claimed without implying CI,
runtime, OpenSpec, apply safety, or product receipt.

## Domain Owner

Receipt Contract owner.

Forbidden owners:

- `check` may not define receipt semantics beyond structural diagnostics.
- hooks may not define receipt semantics beyond hook runtime.
- apply may not define current-tree diagnostic receipt.
- Graphite state may not be collapsed into command receipt.

## Consumers

`habitat verify`, `habitat check`, hooks, Grit adapter, apply transaction,
review ledgers, DRA handoffs, OpenSpec workstream records.

## Contract

Define receipt labels, non-goal labels, bounded command stream fields, post-state
fields, failure/refusal shape, and compatibility rules for:

- `VerifyReceipt`,
- `CheckReport` receipt summary,
- `GritApplyTransactionReceipt`,
- `HookTrace`,
- `AdapterReceiptArtifact`,
- Graphite state records in docs and handoffs.

## Dependency Order

Blocked by: D0.

Unblocks: D6, D7, D8, D9, D10, D11, D12, D13, D14.

Parallelism: can run after D0 and before D2 implementation, but D2 must consume
the receipt labels rather than invent its own.

## Current State-Space Problem

Receipt-like shapes use different status encodings:

- `CheckReport.ok` is correlated with rule statuses by convention.
- `VerifyReceipt` contains check summary, Nx affected state, streams, and
  post-state in one object.
- `GritApplyTransactionResult` uses `ok: boolean` while transaction receipt has
  separate fields.
- `HookTrace` records local events but can be misread as verification receipt.

The reachable state problem is receipt substitution: a value can be structurally
present but semantically weaker than the caller assumes.

## Solution Design

1. Define a closed receipt-label vocabulary and non-goal vocabulary.
2. Define receipt DTO boundaries around command-facing evidence, not around
   implementation modules.
3. Add constructors or validators that prevent contradictory receipt states, such
   as "affected Nx executed" when Habitat check failed.
4. Require every receipt DTO to carry `receiptClass`, `scope`, `nonClaims`, and
   bounded command evidence where applicable.
5. Keep receipt DTOs shallow and projection-specific; reject a generic receipt
   supertype unless it demonstrably removes contradictory states.

## TypeScript State-Space Reduction

Refactor boolean/correlation contracts into discriminated states:

- `CheckReport` result summary derived by constructor from rule reports.
- `VerifyReceipt.nxAffected` remains an explicit union of executed/skipped/failed
  with reason.
- apply receipt separates dry-run, live-apply, rollback, and formatter handoff.
- hook receipt is tagged as `local-feedback`.

The simpler alternative, a shared `Receipt<T>` wrapper, is rejected because it
would hide receipt-class differences and create a mega-framework.

## Public Surface Impact

Likely affects JSON schema names and exact receipt fields. Must preserve
`schemaVersion: 1` unless a deliberate version bump is designed through D0.
Human output must keep the same receipt/non-goal truth as JSON output.

## Receipt Classes

Required design receipt:

- schema inventory for existing receipt shapes;
- non-goal inventory from prep and current docs;
- current tests that assert receipt output.

Later implementation receipt:

- schema validation tests;
- verify receipt tests;
- hook trace tests;
- Grit/apply receipt tests;
- command behavior for `habitat verify --json` and `habitat check --json`.

Non-claims:

- D1 does not prove rule execution.
- D1 does not prove current-tree cleanliness.
- D1 does not prove apply safety.

## Review Lanes

- Receipt-class adversarial review.
- API compatibility review.
- Operations review for command stream bounding.
- Stale-record review for docs and handoff examples.

## Downstream Realignment

Update:

- receipt-class ledger;
- `tools/habitat/docs/IMPLEMENTED-SURFACE.md`;
- `tools/habitat/docs/SCENARIOS.md`;
- OpenSpec workstream templates if they cite Habitat receipt;
- command examples in project records.

## Validation Commands / Receipt Template

- `bun run --cwd tools/habitat test -- test/lib/receipt-artifact.test.ts test/lib/verify-receipt.test.ts`:
  expected exit 0; schema/test receipt for receipt DTO boundaries.
- `bun run habitat check --json`: expected exit 0 only after current-tree
  receipt risks are fixed or explicitly non-goaled by this packet.
- `git status --short --branch`: expected exit 0; records receipt artifacts do
  not create untracked generated state.
- Cache stance: schema tests may use normal Vitest execution; command receipt
  must record whether Nx cache was used.
- Injected bad case: include one malformed receipt payload and one command failure
  projection that cannot be reported as a passing receipt.
- Non-claim: this packet does not prove any individual rule is correct.

## Graphite/OpenSpec Closure

Use OpenSpec if schema or command JSON changes. Commit as one receipt-contract
layer before packets that consume receipt DTOs. Do not submit/claim Graphite
readiness while downstack `needs restack` remains unresolved.

## Stop Conditions

Stop if:

- receipt labels collapse separate receipt classes;
- a receipt DTO can represent impossible states;
- command JSON changes without D0 compatibility disposition;
- tests assert only snapshots without semantic receipt/non-goal checks.

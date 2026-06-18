# D1 Proof Contract Boundary

## Intent

Define Habitat's proof vocabulary and proof DTO boundaries before check, verify,
hooks, Grit, apply, and Graphite handoff refactors start sharing or reshaping
evidence.

## Product Scenario

A DRA owner hands work to a reviewer and needs Habitat output to say what was
checked, observed, skipped, refused, and not claimed without implying CI,
runtime, OpenSpec, apply safety, or product proof.

## Domain Owner

Proof Contract owner.

Forbidden owners:

- `check` may not define proof semantics beyond structural diagnostics.
- hooks may not define proof semantics beyond local feedback.
- apply may not define current-tree diagnostic proof.
- Graphite state may not be collapsed into command proof.

## Consumers

`habitat verify`, `habitat check`, hooks, Grit adapter, apply transaction,
review ledgers, DRA handoffs, OpenSpec workstream records.

## Contract

Define proof labels, non-claim labels, bounded command stream fields, post-state
fields, failure/refusal shape, and compatibility rules for:

- `VerifyProof`,
- `CheckReport` proof summary,
- `GritApplyTransactionProof`,
- `HookTrace`,
- `AdapterProofArtifact`,
- Graphite state records in docs and handoffs.

## Dependency Order

Blocked by: D0.

Unblocks: D6, D7, D8, D9, D10, D11, D12, D13, D14.

Parallelism: can run after D0 and before D2 implementation, but D2 must consume
the proof labels rather than invent its own.

## Current State-Space Problem

Proof-like shapes use different status encodings:

- `CheckReport.ok` is correlated with rule statuses by convention.
- `VerifyProof` contains check summary, Nx affected state, streams, and
  post-state in one object.
- `GritApplyTransactionResult` uses `ok: boolean` while transaction proof has
  separate fields.
- `HookTrace` records local events but can be misread as verification proof.

The reachable state problem is proof substitution: a value can be structurally
present but semantically weaker than the caller assumes.

## Solution Design

1. Define a closed proof-label vocabulary and non-claim vocabulary.
2. Define proof DTO boundaries around command-facing evidence, not around
   implementation modules.
3. Add constructors or validators that prevent contradictory proof states, such
   as "affected Nx executed" when Habitat check failed.
4. Require every proof DTO to carry `proofClass`, `scope`, `nonClaims`, and
   bounded command evidence where applicable.
5. Keep proof DTOs shallow and projection-specific; reject a generic proof
   supertype unless it demonstrably removes contradictory states.

## TypeScript State-Space Reduction

Refactor boolean/correlation contracts into discriminated states:

- `CheckReport` result summary derived by constructor from rule reports.
- `VerifyProof.nxAffected` remains an explicit union of executed/skipped/failed
  with reason.
- apply proof separates dry-run, live-apply, rollback, and formatter handoff.
- hook proof is tagged as `local-feedback`.

The simpler alternative, a shared `Proof<T>` wrapper, is rejected because it
would hide proof-class differences and create a mega-framework.

## Public Surface Impact

Likely affects JSON schema names and exact proof fields. Must preserve
`schemaVersion: 1` unless a deliberate version bump is designed through D0.
Human output must keep the same proof/non-claim truth as JSON output.

## Proof Classes

Required design proof:

- schema inventory for existing proof shapes;
- non-claim inventory from prep and current docs;
- current tests that assert proof output.

Later implementation proof:

- schema validation tests;
- verify proof tests;
- hook trace tests;
- Grit/apply proof tests;
- command behavior for `habitat verify --json` and `habitat check --json`.

Non-claims:

- D1 does not prove rule execution.
- D1 does not prove current-tree cleanliness.
- D1 does not prove apply safety.

## Review Lanes

- Proof-class adversarial review.
- API compatibility review.
- Operations review for command stream bounding.
- Stale-record review for docs and handoff examples.

## Downstream Realignment

Update:

- proof-class ledger;
- `tools/habitat-harness/docs/IMPLEMENTED-SURFACE.md`;
- `tools/habitat-harness/docs/SCENARIOS.md`;
- OpenSpec workstream templates if they cite Habitat proof;
- command examples in project records.

## Validation Commands / Proof Template

- `bun run --cwd tools/habitat-harness test -- test/lib/proof-artifact.test.ts test/lib/verify-proof.test.ts`:
  expected exit 0; schema/test proof for proof DTO boundaries.
- `bun run habitat check --json`: expected exit 0 only after current-tree
  proof risks are fixed or explicitly non-claimed by this packet.
- `git status --short --branch`: expected exit 0; records proof artifacts do
  not create untracked generated state.
- Cache stance: schema tests may use normal Vitest execution; command proof
  must record whether Nx cache was used.
- Injected bad case: include one malformed proof payload and one command failure
  projection that cannot be reported as a passing proof.
- Non-claim: this packet does not prove any individual rule is correct.

## Graphite/OpenSpec Closure

Use OpenSpec if schema or command JSON changes. Commit as one proof-contract
layer before packets that consume proof DTOs. Do not submit/claim Graphite
readiness while downstack `needs restack` remains unresolved.

## Stop Conditions

Stop if:

- proof labels collapse separate proof classes;
- a proof DTO can represent impossible states;
- command JSON changes without D0 compatibility disposition;
- tests assert only snapshots without semantic proof/non-claim checks.

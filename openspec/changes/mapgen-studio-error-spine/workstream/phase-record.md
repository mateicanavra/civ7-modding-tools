# D3 Packet Phase Record - Error Spine

Status: accepted
Date: 2026-06-14
Domino: D3
OpenSpec change: `mapgen-studio-error-spine`
Graphite packet branch: `codex/runtime-effect-openspec-packets`

## Frame

D3 turns Studio runtime expected failures into a typed spine that D4-D6 can use as Effect failures and that oRPC exposes through TypeBox-backed declared error data. The packet repairs the older S1.2 closure record; it does not claim the current code already satisfies the refactor target.

## Dependencies

- D0 accepted one-mount baseline.
- D1 accepted dev-watch deploy isolation.
- D2 accepted the runtime engine corpus.
- D2.5 accepted the TypeBox contract spine and requires D3 to delete or narrow permissive expected-error details.
- D4 consumes D3 failure values as runtime-service `Effect.fail` values.
- D6/D8/D9 consume D3 failure projections for operations-current and events.

## Required Review Lanes

- Error-corpus / runtime-surface review.
- TypeScript/schema authority review.
- Effect/lifecycle alignment review.
- Testing/parity review.
- Hardening/prework philosophy review.
- Black-ice disambiguation review.
- Adversarial residue/orphan review.

## Packet Acceptance Stop Conditions

D3 cannot be accepted if:

- the packet treats old S1.2 implementation closure as current packet acceptance;
- the failure corpus omits any stateful runtime mutation surface from D2;
- the D2.5 `details?: unknown` bridge lacks a deletion/narrowing target;
- raw `ORPCError`, status-code truth, or app-local public error-data ownership remains ambiguous;
- proof labels conflate packet validation, package tests, scenario tests, or live proof;
- required implementation prework is missing from `prework-ledger.md`;
- review finds an unresolved P1/P2 finding.

## Future Implementation Closure Blockers

The D3 implementation slice cannot close if:

- expected public error data still contains `Type.Unknown()` / `details?: unknown`;
- expected failures are emitted as raw `Error`, status-code-shaped bridge errors, or caller-local `ORPCError`s;
- mapper totality is not proven across all expected failure tags and operation namespaces;
- status misses lack daemon identity;
- recovery actions are arbitrary strings without TypeBox vocabulary;
- stale old-S1.2 closure comments/spec text remain live;
- production status-code bridge residue remains in app/package code.

## Acceptance Evidence

- Reviews accepted: TypeScript/schema, Effect/lifecycle, testing/parity, hardening/prework, black-ice disambiguation, and adversarial residue/orphan lanes.
- `bun install --frozen-lockfile`: passed, no lockfile changes.
- `bun run build`: passed; generated intelligence bridge bundle churn was restored and not staged.
- `bun run check`: passed with existing mapgen docs warnings only.
- `bun run openspec -- validate mapgen-studio-error-spine --strict`: passed.
- `bun run openspec:validate`: passed, 149/149 items.
- `git diff --check`: passed.
- Selected baseline: Graphite branch `codex/runtime-effect-openspec-packets` stacked above accepted D2.5 packet commit.

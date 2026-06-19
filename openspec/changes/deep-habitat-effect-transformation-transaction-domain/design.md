# Design: Transformation Transaction Domain

## Owner

Transformation transaction and protected-zone authority domains.

## Target Files

```text
tools/habitat-harness/src/domains/transformation-transaction/index.ts
tools/habitat-harness/src/domains/transformation-transaction/worktree.ts
tools/habitat-harness/src/domains/transformation-transaction/apply.ts
tools/habitat-harness/src/domains/transformation-transaction/rollback.ts
tools/habitat-harness/src/domains/protected-zone-authority/index.ts
tools/habitat-harness/src/domains/protected-zone-authority/guard.ts
tools/habitat-harness/src/domains/protected-zone-authority/scan-root.ts
tools/habitat-harness/src/domains/protected-zone-authority/recovery.ts
tools/habitat-harness/src/lib/pattern-apply/**       # drained
tools/habitat-harness/src/lib/protected-zones/**     # drained
```

## Required State-Space Reductions

- A write transaction has explicit requested writes, admitted writes, blocked
  protected zones, rollback data, and final disposition.
- Grit dry-run output is not treated as write proof without local verification.
- Temp/cache/write-set resources are scoped through Effect.

## Stop Conditions

- `grit apply --force` becomes a live-write path without a new packet.
- Protected-zone refusals degrade to strings.
- Transaction code performs direct filesystem mutations outside resource
  providers.

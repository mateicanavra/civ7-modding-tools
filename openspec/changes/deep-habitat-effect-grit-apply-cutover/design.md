# Design: Deep Habitat Effect Grit Apply Cutover

## Domain Boundary

Owner: GritProvider cutover.

Grit provider owns command construction and resource/cache policy. Grit parsing
that is vendor-output specific lives with `providers/grit`. This packet drains
`src/adapters/grit/**` only after `TransformationTransaction` and
`ProtectedZoneAuthority` already own write admission, rollback, recovery, and
protected-zone checks.

## Write Set

```text
tools/habitat-harness/src/providers/grit/**
tools/habitat-harness/src/adapters/grit/**                 # drained by this packet
tools/habitat-harness/test/lib/grit-adapter.test.ts
tools/habitat-harness/test/lib/pattern-apply.test.ts
```

## Carry Forward

- Keep `decidePatternScanRoots` and Grit output parsing behavior.
- Keep D9 transaction refusal semantics.
- Keep dry-run-only live-write refusal unless a later packet opens live writes.

## Required Deletions

- Remove direct `mkdirSync`, `mkdtempSync`, and `rmSync` from Grit provider and
  adapter cutover code; scoped filesystem resources own those operations.
- Remove direct dependency on `HabitatProcessLive` from Grit adapter logic;
  require `GritProvider` and consume already-migrated
  `TransformationTransaction` and `ProtectedZoneAuthority` services where
  apply behavior needs transaction context.

## Stop Conditions

- `grit apply --force` becomes a live-write path.
- Grit dry-run output is treated as a no-write proof without local verification.
- Pattern apply records lose transaction refusal/recovery specificity.

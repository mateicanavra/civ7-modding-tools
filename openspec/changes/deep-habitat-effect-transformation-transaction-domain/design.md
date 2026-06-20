# Design: Fix Service Module

## Owner

Fix service module and transformation transaction domain, with protected-zone
internals still owning the current path authority behavior.

`fix` is the command surface for Habitat-owned transformations. This slice
moves command-level fix orchestration into that owned service module. The
domain drain moves pattern apply contracts and transaction records out of
generic `lib` ownership. Protected-zone, rollback, cleanup, and deeper
write-resource ownership remain separate follow-on drains.

## Target Flow

```text
Fix CLI -> Habitat service client -> fix service module -> transformation transaction domain
```

## Write Set

```text
tools/habitat-harness/src/service/modules/fix/**
tools/habitat-harness/src/domains/transformation-transaction/**
tools/habitat-harness/src/service/contract.ts
tools/habitat-harness/src/service/router.ts
tools/habitat-harness/src/commands/fix.ts
tools/habitat-harness/test/service/fix-service.test.ts
tools/habitat-harness/test/service/service-architecture.test.ts
tools/habitat-harness/test/commands/habitat-commands.test.ts
tools/habitat-harness/test/lib/pattern-apply.test.ts
```

Deleted path:

```text
tools/habitat-harness/src/lib/fix.ts
tools/habitat-harness/src/lib/pattern-apply/**
```

## Required Cutover In This Slice

- Define a contract for `fix.run`.
- Bind the procedure through `effect-orpc` in `src/service/modules/fix`.
- Own fix intent parsing, apply admission lookup, worktree observation,
  transaction request construction, and result rendering in the fix service
  module.
- Refuse `D0-package-export-symbol-runfix`; this slice does not add a
  replacement package helper export or a compatibility wrapper.
- Route the CLI through `client.fix.run`.
- Move pattern apply contracts, refusal records, renderers, transaction input
  resolution, and worktree observation into
  `src/domains/transformation-transaction/**`.
- Keep dry-run and live-write intent projection stable.
- Add tests that fail if the CLI imports or calls a `lib/fix` path directly.
  Add tests that fail if active transaction logic remains under
  `src/lib/pattern-apply/**`.

## Follow-On Transformation Domain Drain

- A write transaction has explicit requested writes, admitted writes, blocked
  protected zones, rollback data, and final disposition.
- Grit dry-run output is not treated as write proof without local verification.
- Temp/cache/write-set resources are scoped through Effect.
- Pattern apply source moves into the transformation transaction domain.
- Protected-zone source moves in a later protected-zone domain drain.

## Stop Conditions

- `src/commands/fix.ts` calls a `src/lib/fix.ts` wrapper directly.
- `src/service/modules/fix/run.ts` delegates command orchestration to a `lib/fix`
  wrapper.
- This slice changes dry-run or live-write intent behavior.
- The packet presents this service-module slice as the complete transaction
  domain migration.
- `grit apply --force` becomes a live-write path without a new packet.
- Protected-zone refusals degrade to strings.
- Future transaction code performs direct filesystem mutations outside resource
  providers.

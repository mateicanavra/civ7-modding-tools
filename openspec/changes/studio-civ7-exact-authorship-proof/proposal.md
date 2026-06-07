## Why

The recovery stack has bounded deploy and runtime generation proof, but product
closure still requires one exact identity chain from the visible Studio config
to the Civ game that starts. Without that chain, map tuning and visible
acceptance can be testing the wrong map or setup.

## Target Authority Refs

- `openspec/changes/swooper-stack-recovery-consolidation/workstream/branch-recovery-ledger.md`
- `openspec/changes/studio-run-current-map-config/proposal.md`
- `openspec/changes/studio-run-current-map-config/design.md`
- `openspec/changes/studio-run-current-map-config/tasks.md`
- `openspec/changes/studio-live-civ7-map-sync/workstream/parity-verification-and-runtime-proof.md`

## What Changes

- Create an executable exact-authorship proof packet for one Studio-visible
  Swooper Earthlike config.
- Bind Studio config hash, envelope hash, generated source script hash,
  deployed script hash, Civ setup row, setup seed/readback, post-start runtime
  seed/dimensions, and Swooper log request id.
- Add or repair Studio request/endpoint coverage that protects proof assembly.
- Update downstream run-current-map-config proof tasks and ledgers.

## Requires

- `studio-run-current-map-config`
- `studio-live-runtime-snapshot-completion` for reliable bound snapshot labels
  when live observations are used
- `direct-control-new-game-setup`

## Enables Parallel Work

- Final-surface parity burn-down against the exact run.
- Earthlike product acceptance over the same selected seed/config.

## Affected Owners

- `apps/mapgen-studio/**`
- `mods/mod-swooper-maps/**`
- `packages/civ7-direct-control/**` only for missing readback wrappers
- OpenSpec proof ledgers under this change and downstream run-current-map-config

## Forbidden Owners

- No authored config seed persistence caused by disposable runtime launch.
- No raw setup JavaScript or caller-local control script in Studio.
- No generated-output hand edits.

## Stop Conditions

- Studio cannot expose the exact config/hash/seed currently visible to the user.
- Civ setup row/readback cannot be tied to the generated/deployed script.
- Runtime log proof cannot be bounded to the selected request/config/envelope.
- Live seed/dimensions do not match the launched proof packet.

## Consumer Impact

Developers can trust that a Run in Game proof packet refers to the map and setup
they saw in Studio.

## Verification Gates

- Focused Studio request assembly/endpoint tests.
- Generated/deployed script hash evidence.
- Fresh bounded live proof through the Studio Run in Game exact proof packet.
  `bun run verify:studio-run-in-game:live` is supporting evidence only when
  bound to the same request/source snapshot/config/envelope/materialization
  chain.
- OpenSpec strict validation.

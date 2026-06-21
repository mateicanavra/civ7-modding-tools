# Change: Deep Habitat Effect Rule Selection Test Drain

## Why

`rule-selection.test.ts` used the full Habitat check report runtime to prove two
small domain contracts: invalid selector report rendering and staged Grit
not-applicable disposition. That made ordinary unit feedback pay for baseline
authority, provider wiring, and report execution when the behavior under test
belongs to the structural-check domain.

Habitat should reduce agent labor by pushing ambiguity into explicit rules and
patterns. Its own tests should follow that product shape: narrow domain
contracts are tested at the owning domain seam, while full command/runtime
composition remains an intentional validation target.

## What Changes

- Export the selector-refusal report seam from the structural-check domain.
- Add an owned staged Grit not-applicable record helper.
- Replace broad `createCheckReportEffect` unit coverage with direct
  selector-refusal report coverage.
- Replace the 90s-timeout staged Grit report test with deterministic
  rule-disposition coverage over staged scan roots.
- Remove the full Habitat runtime dependency from `rule-selection.test.ts`.

## Non-Goals

- Do not change rule selection semantics.
- Do not change command report schema or rendering.
- Do not add topology or structural enforcement tests.
- Do not add shims, fallbacks, or duplicate Grit execution paths.

## Validation

- `bun run --cwd tools/habitat-harness test -- rule-selection.test.ts` must pass
  with no long-running staged Grit scenario.
- Package test/check/build and OpenSpec validation must stay green before
  closure.

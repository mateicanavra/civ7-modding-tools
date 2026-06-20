# Design: Deep Habitat Effect Check Baseline Cutover

## Service And Domain Boundary

Owner: `check` owned service module plus structural check and baseline
authority domains.

The `check` service module is the Effect-oRPC procedure boundary for Habitat
check capabilities. It owns the named procedures users and in-process callers
invoke: `check.run` and `check.expandBaseline`.

Structural check owns rule selection, execution orchestration, disposition, and
normalized report assembly. Baseline authority owns shrink-only baseline
state, integrity, expansion admission, and baseline writes. Providers own side
effects. The service module may compose domains and providers; providers must
not import service or domain modules.

The active `check` service path is backed by named Effect domain services:
`StructuralCheck` owns check orchestration and consumes `BaselineAuthority` for
baseline state, application, refusal diagnostics, integrity, expansion
admission, and baseline writes. That is the owned Habitat capability boundary;
Git, filesystem, clock, command execution, and vendor tools remain dependencies
under that boundary, not procedure owners.

The old implementation shape where `src/service/modules/check/run.ts` merely
wrapped `src/lib/check-report.ts` is explicitly rejected. `src/lib/**` may keep
temporary public adapters only for exports that already form part of the
Habitat package surface; it must not remain the active owner for check or
baseline behavior.

## Write Set

```text
tools/habitat-harness/src/domains/structural-check/**
tools/habitat-harness/src/domains/baseline-authority/**
tools/habitat-harness/src/service/modules/check/**
tools/habitat-harness/src/lib/check/**              # drained by this packet
tools/habitat-harness/src/lib/check-report.ts       # public adapter only
tools/habitat-harness/src/lib/baseline-core/**      # drained by this packet
tools/habitat-harness/src/lib/baseline.ts           # public adapter only
tools/habitat-harness/test/lib/baseline.test.ts
tools/habitat-harness/test/lib/check-summaries.test.ts
tools/habitat-harness/test/service/check-service.test.ts
tools/habitat-harness/test/service/service-architecture.test.ts
```

## Required State-Space Reductions

- Baseline context options stop being a loose bag of optional side-effect
  functions; the feature declares service requirements.
- Rule execution disposition remains a discriminated union and expands only by
  owned variants.
- Direct `Date.now` durations move behind `HabitatClock`.
- Git operations move through `GitProvider`.
- The service test for `check` must stop mocking `src/lib/check-report.ts`;
  procedure behavior is tested through the owned domain/provider boundary.
- `src/lib/check/**` and `src/lib/baseline-core/**` must not remain as
  duplicate active implementations after the move.

## Public Surface

Any public export moved from `src/lib/baseline.ts` or `src/lib/check-report.ts`
must be re-exported intentionally from `src/index.ts` until the public-surface
guard packet narrows it.

## Stop Conditions

- A baseline write shells out or writes files outside provider services.
- Check execution catches generic `Error` and renders it directly.
- Tests touch live repo baselines as ordinary unit coverage.

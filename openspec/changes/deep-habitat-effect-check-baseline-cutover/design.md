# Design: Deep Habitat Effect Check Baseline Cutover

## Domain Boundary

Owner: structural check and baseline authority domains.

Check owns rule selection, execution orchestration, disposition, and normalized
report assembly. Baseline owns shrink-only baseline authority. Providers own
side effects.

## Write Set

```text
tools/habitat-harness/src/domains/structural-check/**
tools/habitat-harness/src/domains/baseline-authority/**
tools/habitat-harness/src/lib/check/**              # drained by this packet
tools/habitat-harness/src/lib/check-report.ts       # drained by this packet
tools/habitat-harness/src/lib/baseline-core/**      # drained by this packet
tools/habitat-harness/src/lib/baseline.ts           # public adapter only if public surface permits
tools/habitat-harness/test/lib/baseline.test.ts
tools/habitat-harness/test/lib/check-summaries.test.ts
```

## Required State-Space Reductions

- Baseline context options stop being a loose bag of optional side-effect
  functions; the feature declares service requirements.
- Rule execution disposition remains a discriminated union and expands only by
  owned variants.
- Direct `Date.now` durations move behind `HabitatClock`.
- Git operations move through `GitProvider`.

## Public Surface

Any public export moved from `src/lib/baseline.ts` or `src/lib/check-report.ts`
must be re-exported intentionally from `src/index.ts` until the public-surface
guard packet narrows it.

## Stop Conditions

- A baseline write shells out or writes files outside provider services.
- Check execution catches generic `Error` and renders it directly.
- Tests touch live repo baselines as ordinary unit coverage.

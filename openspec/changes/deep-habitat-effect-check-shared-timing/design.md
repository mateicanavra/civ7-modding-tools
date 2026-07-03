# Design: Check Shared Timing

## Frame

Habitat coordinates vendor-backed and native structural checks. A rule report is
both machine data and a human-facing diagnosis, so timing needs to describe the
actual execution model. When Habitat scans source files once for many pattern
rules, or runs one Nx target for several graph-backed rules, that is a shared
operation. The report should say that directly.

## Ownership

- `domains/structural-check/schema.ts` owns the report contract.
- `domains/structural-check/execution.ts` owns execution grouping metadata.
- `domains/structural-check/report.ts` carries execution metadata into rule
  reports.
- `rules/messages.ts` owns human rendering.

## Implementation

Add a `RuleExecutionTiming` union with `dedicated` and `shared` variants. Keep
the existing `durationMs` field for compatibility and schema stability, but add
optional `timing` metadata to explain whether the duration belongs to one rule
or a shared group.

Source-check pattern execution attaches a `source-check:pattern-rules` shared
timing object when more than one pattern rule is selected. Graph-backed command
execution attaches an `nx:graph-targets` shared timing object when more than one
rule consumes the same grouped graph execution.

Human output renders shared rules as `shared:<groupId>` and adds one `shared
work` section listing the real elapsed duration and rule count per group.

## Risks

- JSON consumers that reject unknown optional fields outside the TypeBox schema
  will now see a new optional `timing` field. This is an additive report
  contract change and remains schema-valid.
- The existing `durationMs` field remains populated, so legacy consumers that
  only read durations continue to work.

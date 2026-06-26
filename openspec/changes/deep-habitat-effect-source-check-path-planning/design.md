# Design: Source Check Path Planning

## Frame

Habitat's rule registry already says where each rule applies. Source-check
should use that domain knowledge before running rule logic, rather than
delegating every applicability decision to generated policy code. The outcome
is a clearer rule pipeline: registry facts describe applicability, source-check
plans files, policy code inspects content.

## Ownership

- `domains/rule-registry` owns rule facts and path coverage matching.
- `domains/source-check` owns file collection and rule-to-file planning.
- `domains/workspace-graph-integration` continues to consume the same
  path-coverage matcher for classify/routing behavior.

## Implementation

Extend `RulePatternFacts` to include `pathCoverage` with cloned exact-path
patterns. Extract the existing path coverage matcher from workspace routing
into `domains/rule-registry/path-coverage.ts`.

During source-check execution, each rule first derives exact-path coverage
patterns. If exact coverage exists, source-check invokes generated policy logic
only for files matching those patterns. If exact coverage is absent, it falls
back to the existing scan-root overlap behavior so unresolved metadata and
workspace-gate rules remain conservative.

## Risks

- Exact path coverage must be at least as broad as the generated policy rule's
  internal path checks. Rules still marked `unresolved-metadata` intentionally
  keep the broader scan-root fallback.
- This reduces policy invocations, not file discovery. A later slice can plan
  collection roots more aggressively once all pattern rules have exact typed
  coverage.

# Decision 001: Strategy Container Law

Status: sealed by later user authority

## Question And Provenance

Must every operation have a `strategies/` directory, or may a
single-implementation operation keep behavior in its root module?

This was nondeterministic when the opening corpus was built: survivor
structure allowed `strategies/` but did not require it, the ecology proxy
required it only in one domain, and current source used both shapes.

## Evidence

- 92 of 101 operations have `strategies/`.
- 83 existing containers are exactly `default.ts` plus `index.ts`.
- The nine missing containers are Foundation `compute-*` operations.
- All nine contracts already declare strategy envelopes.
- Operation kind does not explain the difference; most compute operations
  already use strategy containers.

## Alternatives Considered

1. Require `strategies/` for every operation.
2. Admit inline single implementation as a second closed shape.
3. Key the shape to operation kind.

The second option makes every tool and reader understand two representations
of the same concept. The third encodes an accident contradicted by current
compute operations.

## Ruling

Every operation requires:

```text
strategies/
  index.ts
  <named-strategy>.ts
```

There is at least one named strategy. `strategies/index.ts` is export-only and
sources only local named strategies. Root inline implementation is not a valid
alternate operation shape.

The nine missing containers are red under this law. Their intended correction
is behavior-preserving structural placement, not algorithm or configuration
redesign.

## Boundary And Falsifier

This ruling changes representation only. If any operation cannot gain the
container without changing behavior, configuration, public imports, or
runtime semantics, stop that row: it is no longer a mechanical consequence of
D1.

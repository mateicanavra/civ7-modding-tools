# Design — error spine (S1.2)

## D1. The failure model must be owned before transport mapping

The current adapter uses `RunInGameHttpError.statusCode` as the source of truth
and treats unmapped statuses as `*_FAILED` 500. That preserves rough HTTP
compatibility, but it does not encode the domain reason the engine already
knows: mutex blocked, invalid request, dependency unavailable, missing
operation, proof/materialization failure, or unexpected infrastructure failure.

S1.2 promotes those reasons into a sealed tagged union that engine code emits
and `createStudioServerContext` maps exhaustively. The mapping function should
have no known-category `else -> 500` path. A genuine unknown exception may still
be converted to the declared `*_FAILED` code, but known engine failures must not
silently downgrade to anonymous 500s.

## D2. Defined errors remain the wire authority

`packages/studio-server/src/contract/errors.ts` remains the oRPC contract
authority. The engine failure union feeds declared codes and permissive data
schemas; it does not create a second client-visible protocol. Contract data
schemas should carry structured details and normalized recovery hints without
making future detail additions fail validation.

## D3. Status misses echo daemon identity consistently

Run in Game status 404 already carries `serverInstanceId` and `serverStartedAt`
so the client can distinguish an unknown request from a daemon restart. S1.2
changes Save&Deploy status 404 to the same restart-aware shape. This is a
deliberate correction of the current documented asymmetry, and tests should
move with the slice.

## D4. Recovery hints are structured, not prose-only

Run in Game already has several one-off fields such as `recoveryHint`,
`reloadRequired`, and `reloadBoundary`; Save&Deploy mostly exposes raw failure
messages. S1.2 should normalize recovery guidance into a consistent field that
the client can reason about, while preserving existing durable detail payloads
where they are already useful.

## D5. Verification shape

Static/unit pins should enumerate the sealed failure union and assert that each
member maps to a declared oRPC error code/status/data shape. Procedure tests
should cover Run in Game and Save&Deploy start/status failures, including
mutex, invalid request, unavailable dependency, status not found with identity
echo, and the intentional unexpected failure fallback.

## D6. OpenSpec and contract residue must move with the parity correction

S1.2 intentionally reverses the older `mapgen-studio-server-orpc` parity note
that said Save&Deploy status 404 does not echo daemon identity. That older
change is still live in the OpenSpec tree, and the package contract files still
document the same asymmetry. Closure requires updating or explicitly
dispositioning those residues in the S1.2 slice so the spec tree and contract
comments do not disagree with the new runtime invariant.

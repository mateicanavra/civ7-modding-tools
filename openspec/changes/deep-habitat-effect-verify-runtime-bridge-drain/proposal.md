# deep-habitat-effect-verify-runtime-bridge-drain

## Why

The verify service already composes proof-contract Effect programs through the
Habitat service runtime. Keeping Promise-returning proof-contract helpers beside
those Effect programs preserves an obsolete runtime edge: internal callers can
bypass the service/module implementer and run domain programs directly.

Habitat should have one obvious execution shape. Verify domain modules should
export contracts, pure projection helpers, and Effect programs. Service routers
decide when those programs run. Host commands call the service. Tests that need
to run a program directly may do so at the test edge with explicit fake layers.

## What Changes

- Remove the Promise wrappers from the verify proof-contract domain:
  `resolveVerifyBase`, `runAffectedVerification`, and `observeGitStatus`.
- Keep the Effect procedures consumed by the verify service:
  `resolveVerifyBaseEffect`, `runAffectedVerificationEffect`, and
  `observeGitStatusEffect`.
- Delete the stale `src/substrate/lib/effect-runtime.ts` re-export.
- Update verify-base coverage to run the Effect program directly with fake
  layers.

## Non-Goals

- Do not change verify receipt schemas, CLI output, affected-target execution,
  or base-resolution semantics.
- Do not remove the substrate runtime runner in this slice; that follow-on is
  owned by `deep-habitat-effect-substrate-runtime-runner-drain`, which later
  deletes the generic runner after provider tests move to explicit test-edge
  execution.

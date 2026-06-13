# Civ7 Game Door Invariant

## Invariant

**ID:** `studio-runtime/CIV7-GAME-DOOR`

**Owner:** `@civ7/direct-control` owns socket protocol mechanics; `@civ7/studio-server` owns the Studio daemon's shared runtime session.

**Scope:** MapGen Studio daemon runtime, `@civ7/studio-server`, `@civ7/control-orpc` consumers hosted by Studio, and `@civ7/direct-control` session helpers.

**Rule:** Every Studio game-wire call flows through one sanctioned door:

- Long-lived daemon reads use the Effect-scoped `Civ7TunerSession` service in `packages/studio-server/src/services/Civ7TunerSession.ts`.
- Per-flow direct-control operations use `withCiv7DirectControlSession` in `packages/civ7-direct-control/src/session/session.ts`, which constructs, owns, and closes the bounded session.

## Forbids

- Constructing `Civ7DirectControlSession` directly in app code, router leaves, feature modules, operation engines, or caller-local utility scripts.
- Adding alternate Studio runtime transports for FireTuner calls.
- Keeping a second session owner as a compatibility path beside the daemon runtime.
- Reintroducing client-side polling or request-id recovery that treats the browser as owner of daemon truth.

## Detection

- Guard test: `packages/studio-server/test/gameDoorInvariant.test.ts`.
- Focused scan:

```bash
rg -n "new Civ7DirectControlSession" apps packages -g '*.{ts,tsx}'
```

The only production matches may be:

- `packages/studio-server/src/services/Civ7TunerSession.ts`
- `packages/civ7-direct-control/src/session/session.ts`

Test-only constructors are allowed when they exercise the session package or assert the shared owner path.

## Remediation

If a new constructor appears outside the sanctioned paths, remove it rather than wrapping it in a second owner. Route daemon reads through `Civ7TunerSession.use(...)`; route bounded direct-control package workflows through `withCiv7DirectControlSession(...)`. If a workflow genuinely needs a new ownership mode, add a dedicated OpenSpec change and update this invariant, the guard test, and the direct-control docs in the same slice before implementation.

## Rationale

The runtime simplification program made the daemon the owner of ephemeral truth. FireTuner socket ownership follows the same rule: the daemon owns shared polling state and pushes observations; bounded package workflows may own a short-lived session only inside the direct-control package wrapper. This keeps descriptor lifetime, backoff, shutdown release, event publishing, and restart behavior visible in one place instead of being redistributed across callers.

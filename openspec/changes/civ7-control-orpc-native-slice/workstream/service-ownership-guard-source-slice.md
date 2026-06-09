# Service Ownership Guard Source Slice

Status: implemented workstream rebaseline.
Date: 2026-06-04.

## Scope

This slice records the service-ownership correction after the initial native
read leaves proved in-process oRPC mechanics. It also rebaselines the
workstream away from repeated read-only wrappers.

The write set is:

- `packages/civ7-control-orpc/AGENTS.md` for the enduring package rule that
  new procedures should own service behavior/composition instead of only
  delegating to direct-control facade methods;
- OpenSpec task/spec/design/workstream updates that classify the current
  facade-only read leaves as transitional debt and stop the read-only wrapper
  lane.

No runtime/control source, transport edge, CLI caller, Studio caller, in-game
bridge, direct-control procedure-core scaffolding, custom middleware/context
pipeline, Task 2.9.4/5.x/6.x acceptance, runtime proof, or play-thread action
is part of this slice.

## Enforcement Boundary

This slice deliberately does not add a brittle test over the current
facade-only shell strings. If a categorical enforcement mechanism is needed, it
should live in the repo lint/guardrail system as a broad boundary rule, not as a
punitive fixture over transient debt that should be removed anyway.

The likely future owner is a repo-level guardrail under `scripts/lint/`, wired
through a named root script only after the baseline and allowlist are stable.

## Refactor Direction

The target is not `@civ7/direct-control` as a pure TypeScript service wrapped
by oRPC. The target is native oRPC service ownership:

- `packages/civ7-control-orpc` owns the offered service procedure behavior,
  composition, contracts, routers, typed context, tagged errors, and native
  middleware;
- `@civ7/direct-control` owns low-level runtime ports and facts that must stay
  runtime-owned: Tuner/App UI/session execution, command serialization,
  validators, postcondition classifiers, no-repeat policy, relationship
  evidence policy, and proof labels.

The next implementation sequence is:

1. Modularize real code first, including write-capable behavior.
2. Reorganize the capability hierarchy semantically for Sieve/future
   consumers.
3. Layer policy/dependency/read-port/middleware boundaries.
4. Compose the resulting service behavior into native oRPC/effect-orpc routers.

## Proof Captured

Verification run:

- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc build`
- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization
  --strict`
- `git diff --check`

## Remaining Boundaries

This is an architecture ratchet, not the service-logic migration itself. The
next source slice should retire or rewrite transitional shells, or promote a
real repeated policy through native oRPC/effect-orpc primitives without custom
wrapper plumbing.

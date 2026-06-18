# D0 Scenario/Public Contract Inventory

## Intent

Create the compatibility ledger that all later refactor packets must preserve or
intentionally change. This packet prevents Phase 3 from moving internals before
Habitat knows what agents, humans, tests, scripts, Nx, generators, hooks, and
package consumers currently depend on.

## Product Scenario

An agent needs to use Habitat before, during, and after a repo edit without
guessing which command shape, JSON shape, package export, Nx target, generator,
or hook output is stable.

## Domain Owner

Command/API Contract owner.

Forbidden owners:

- Structural Enforcement may not define public command compatibility while
  refactoring `createCheckReport`.
- Workspace Graph Integration may not define root script compatibility while
  fixing target aliases.
- Local Feedback may not define hook proof language outside the public hook
  contract.

## Consumers

Agents, humans, package tests, root scripts, Nx inferred targets, Oclif command
entrypoints, generators, hooks, and future packet authors.

## Contract

Inventory and classify:

- CLI verbs: `check`, `classify`, `verify`, `fix`, `graph`, `hook`.
- CLI flags and argument forwarding, including the observed mismatch between
  `bun run habitat check -- --json` and `bun run habitat check --json`.
- JSON schemas and human output for `CheckReport`, `Classification`,
  `DiffClassification`, `VerifyProof`, `GritApplyTransactionProof`, and
  `HookTrace`.
- package exports from `/tools/habitat-harness/src/index.ts` and
  `/tools/habitat-harness/package.json`.
- root scripts and Habitat script entrypoints.
- inferred Nx targets from `/tools/habitat-harness/src/plugin.js` and
  `/nx.json`.
- generator surfaces under `/tools/habitat-harness/src/generators/`.
- Husky delegators and `habitat hook` behavior.

The output must include an export matrix for
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/index.ts`
and
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/package.json`.
Each export must be classified as public stable, public versioned,
package-internal, command-only DTO, test-only, generated/derived, deprecated, or
refused. No later packet may move or remove exported internals until this matrix
states compatibility handling.

## Dependency Order

Blocked by: fresh checkout, source-authority register, current command evidence.

Unblocks: D1-D14. No later packet may move or narrow a public surface before D0
states whether that surface is public, internal, deprecated, or unstable.

Parallelism: none. D0 is the suite entrance.

## Current State-Space Problem

Public and internal surfaces are mixed. `/tools/habitat-harness/src/index.ts`
exports broad internals from `command-engine.ts`, `baseline.ts`, `grit-apply.ts`,
`hooks.ts`, and pattern authority. The TypeScript state space is too large
because every exported inferred type can become an accidental public contract.

D0 reduces state by producing a contract matrix with explicit states:

- public stable,
- public but intentionally versioned,
- package-internal,
- command-only,
- test-only,
- generated/derived,
- deprecated or refused.

## Solution Design

1. Build a public-surface matrix from source, tests, root scripts, package
   exports, Oclif manifest expectations, Nx inferred targets, generator schemas,
   and hook delegators.
2. Assign every surface one contract state from the explicit set above.
3. Record exact compatibility examples for command JSON and human output.
4. Record surfaces that Phase 3 must stabilize with type facades before any
   extraction.
5. Mark any command invocation ambiguity as a product contract issue, not a doc
   typo.

## TypeScript State-Space Reduction

The implementation packet should plan a public facade before extraction:

- package public exports become an explicit `public.ts` or curated `index.ts`;
- command JSON DTOs are separate from internal domain types;
- internal helpers stop leaking through broad exports;
- accidental inferred return types become named contracts only where consumers
  exist.

The simpler alternative, "just move internals and fix imports," is rejected
because it lets inferred types drift silently and hardens implementation details
through current exports.

## Public Surface Impact

No public behavior changes in this packet. It may identify future intentional
changes, but it must not implement them. Any future public change must name
compatibility, versioning, migration, or refusal behavior.

## Proof Classes

Required design proof:

- command inventory from source and tests;
- package export inventory;
- Nx target inventory;
- generator schema inventory;
- hook command inventory.

Later implementation proof:

- command behavior tests for every stable CLI shape;
- package export compatibility check or declaration diff;
- root script smoke checks;
- Nx metadata checks;
- generator schema tests;
- hook trace tests.

Non-claims:

- D0 does not prove command correctness.
- D0 does not prove current-tree structural cleanliness.
- D0 does not prove runtime or product behavior.

## Review Lanes

- API/CLI contract review.
- Product scenario review.
- TypeScript public-surface review.
- Stale docs review.
- Graphite stack review.

## Downstream Realignment

Update or create:

- command/API compatibility matrix;
- README command examples;
- `tools/habitat-harness/docs/IMPLEMENTED-SURFACE.md`;
- generator surface notes;
- root script documentation;
- OpenSpec packet prerequisites for D1-D14.

## Validation Commands / Proof Template

- `git status --short --branch`: expected exit 0; records clean Graphite state
  before and after packet implementation.
- `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts`:
  expected exit 0; command behavior proof for public CLI compatibility.
- `bun run habitat classify /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/plugin.js`:
  expected exit 0; command behavior proof for a stable representative path.
- `bun run lint`: expected exit 0; hygiene proof, cache acceptable only if Nx
  reports matching inputs.
- Cache stance: `git status`, command entrypoint tests, and `classify` must run
  fresh from the current worktree; `bun run lint` may use Nx cache only when the
  output records matching inputs.
- Fixture requirement: include one unsupported scenario fixture and prove it
  refuses with a named product reason.
- Non-claim: this packet does not prove internal module extraction, only the
  public contract inventory that later extraction must preserve or version.

## Graphite/OpenSpec Closure

Phase 3 implementation should be one docs/spec layer if it only inventories, or
one code+tests layer if it introduces a public facade. Use OpenSpec if any
public command or package export behavior changes.

## Stop Conditions

Stop if:

- any later packet needs a public surface that D0 has not classified;
- command examples still disagree on `--` forwarding;
- package exports are treated as internal without a compatibility decision;
- the matrix cannot distinguish stable JSON DTOs from internal types.
- `src/index.ts` broad exports remain only "tracked" risk rather than a hard
  packet stop condition.

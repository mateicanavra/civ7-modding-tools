# Why

The Deep Habitat refactor starts by stabilizing the compatibility frame.
Habitat currently exposes a useful but mixed surface: Oclif commands, command
JSON DTOs, root scripts, inferred Nx targets, Nx generators, Husky delegators,
and broad `src/index.ts` exports that include internal helpers. Later packets
will move responsibilities into clearer owners. Without D0, those moves can
accidentally break agent-facing behavior or harden implementation details as
public API.

D0 creates the contract inventory that every later packet must consult before
moving, narrowing, deleting, or versioning a surface.

## What Changes

- Add a durable public contract matrix at
  `docs/projects/habitat-harness/deep-refactor/D0-public-contract-inventory.md`.
- Classify command verbs, flags, invocation examples, JSON DTOs, package
  exports, `src/index.ts` exports, root scripts, inferred Nx targets,
  generators, and hook delegators.
- Record the `bun run habitat check --json` versus
  `bun run habitat check -- --json` forwarding ambiguity as a product contract
  issue.
- Add OpenSpec requirements that make the D0 matrix a prerequisite for later
  refactor packet closure.
- Link the matrix from Habitat's implemented-surface reference.

## What Does Not Change

- No command behavior changes.
- No package export moves.
- No new public facade implementation.
- No generator, hook, graph, Grit, baseline, or verify behavior changes.
- No Civ7- or MapGen-specific policy is added to generic Habitat.

## Product Impact

Agents and humans get a durable compatibility map before the refactor starts.
Later packets can simplify TypeScript state and move internals without guessing
whether a symbol, command shape, or DTO is stable, versioned, internal,
generated, test-only, deprecated, or refused.

## Verification

- `bun run openspec -- validate deep-habitat-d0-public-contract-inventory --strict`
- `bun run openspec:validate`
- `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts`
- `bun run habitat classify tools/habitat-harness/src/plugin.js`
- unsupported generator refusal receipt:
  `bun run nx g @internal/habitat-harness:project unsupported-d0-probe --kind=mod --dry-run`
- `bun run lint`
- `git diff --check`

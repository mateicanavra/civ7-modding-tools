# Proposal: D0 Public Surface Compatibility Matrix

## Summary

Design the D0 OpenSpec change packet for Habitat's public surface compatibility
matrix. D0 is the entrance packet for Deep Habitat Phase 2: before any later
domino moves TypeScript internals, command DTOs, package exports, root scripts,
Nx target metadata, generators, or hook output, Habitat must know which current
surfaces are public contracts, compatibility facts, internal implementation
details, generated/derived records, deprecated surfaces, or refused surfaces.

This packet does not implement TypeScript refactors. It specifies the inventory
artifact, row schema, state semantics, plane authority, write envelope,
validation oracle, and downstream citation rules that the D0 implementation
must produce.

## Product Scenario

An agent or human is doing repo work and invokes Habitat before, during, or
after a change. They need to know which command shape, JSON shape, package
export, root script, Nx target, generator, or hook output is safe to rely on,
which is only present behavior, and which later domino owns any redesign.

## Authority

- Current user direction: design one change packet at a time, deeply, before
  moving to the next packet.
- Remediation frame:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation-frame.md`.
- Source domino packet:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D0-scenario-public-contract-inventory.md`.
- D0 per-domino review:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D0-review.md`.
- Domain Design, Information Design, Solution Design, Testing Design,
  Systematic Workstream, OpenSpec Workstream, and TypeScript Refactoring skills.
- Current Habitat code/tests/docs as present-behavior evidence only.

## What Changes

- D0 implementation creates the durable matrix at:
  `docs/projects/habitat-harness/public-surface-compatibility-matrix.md`.
- Every matrix row has a stable `surface_id` that later dominoes must cite
  before changing a listed surface; the ID is derived from D0's deterministic
  plane-specific identity rules, not ad hoc implementation naming.
- Each surface is classified by plane and contract state with explicit
  compatibility handling and target owner.
- Legacy proof/evidence-shaped names are recorded as current compatibility
  facts, not target-domain endorsements.
- D0 defines current command invocation ambiguity, including `--` forwarding, as
  a compatibility issue that later packets cannot treat as a doc typo.

## What Does Not Change

- No Habitat TypeScript source behavior changes.
- No package export narrowing, facade extraction, command JSON migration, or
  root script changes.
- No broad terminology churn in product docs.
- No live hook execution as a validation shortcut.

## Contract Planes

| Plane | D0 Decides | D0 Does Not Decide |
| --- | --- | --- |
| CLI verbs and flags | Current verb/flag/input/output surfaces, invocation examples, compatibility state, and row IDs. | Target behavior redesign for each command. |
| Command JSON DTOs | Current DTO shape, schema/version state, known consumers, compatibility handling. | Target DTO redesign owned by D1/D4/D7/D12 as applicable. |
| Human output | Current user-visible lines that downstream docs/tests rely on. | New copy unless needed to describe current compatibility. |
| Package exports | Current exported symbols and export subpaths, accidental/internal risk, compatibility handling. | Actual facade extraction or export narrowing. |
| Root scripts | Current root scripts that call Habitat or Habitat-owned Nx targets. | Root script rewrites. |
| Nx inferred targets | Current plugin targets, aliases, cache stance, metadata descriptions, and owning rows. | D3 target alias redesign. |
| Generators and migrations | Current generator names, schemas, factories, and refusal surface. | D13 scaffolding/refusal redesign. |
| Hooks | Current `habitat hook` command surface, Husky delegation assumptions, output records. | D11 local feedback redesign. |

## Requires

- Fresh remediation worktree from `main`.
- Baseline dependency install/build/OpenSpec/lint grounding.
- Current command/code evidence from the remediation worktree, not historical
  worktree paths.

## Enables

All later Deep Habitat packets. Later packets may not move, narrow, rename,
version, or reinterpret a listed surface unless they cite the D0 `surface_id`
and use the D0 compatibility handling. `compatibility_handling` is a closed
action set: preserve, version, facade, deprecate, refuse, document-only, or
generated-only. Downstream redesign ownership is recorded in `target_owner`; it
is not a substitute for compatibility handling.

## Consumer Impact

D0 itself changes no runtime behavior. Its implementation produces a durable
compatibility matrix and may update adjacent docs only to link to that matrix or
clarify current invocation examples. Later public-surface changes must preserve,
version, deprecate, or refuse according to matrix rows.

## Stop Conditions

- Any current CLI verb, command flag, command JSON DTO, human output class,
  package export, root script, inferred Nx target, generator, migration, or hook
  surface lacks a row.
- A row can be interpreted as target-domain approval for proof/evidence-shaped
  names instead of compatibility recording.
- A surface appearing on multiple planes is collapsed into one ambiguous row.
- A row uses an ad hoc `surface_id`, reuses an old `surface_id`, or omits the
  deterministic identity rule that produced it.
- A row uses an unclassified value instead of one closed compatibility handling
  action.
- Validation can pass without proving matrix completeness against source.
- The implementation write set expands into Habitat source behavior changes.

## Verification Gates

- `git status --short --branch`: expected clean before and after D0
  implementation.
- `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts`:
  expected exit 0; command entrypoint behavior remains pinned.
- `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts`:
  expected exit 0; hook behavior is checked through tests, not a live hook run.
- `bun run habitat check --json`: expected command JSON sample captured or
  recorded with exit status and non-claims.
- `bun run habitat classify tools/habitat-harness/src/plugin.js`: expected
  command JSON sample captured for a stable representative path.
- `bun run habitat verify --json`: expected command JSON sample captured or
  recorded with exit status and non-claims.
- `bun run habitat fix --dry-run`: expected dry-run sample captured without
  writing.
- `bun run habitat graph --json`: expected graph command sample captured or
  recorded with exit status.
- `bun run habitat hook --help`: expected help surface only; does not execute a
  hook.
- `nx show project @internal/habitat-harness`: expected current target metadata
  captured for matrix rows.
- `bun run openspec -- validate deep-habitat-d0-command-surface-inventory --strict`.
- `bun run openspec:validate`.
- `git diff --check`.

# Change: Deep Habitat Effect Orientation Workspace Graph

## Why

Classify/orientation and workspace graph logic currently mix Nx facts, package
inventory fallback, filesystem reads, and command routing. The result is unclear
authority over what is a fact, a fallback, or an executable target.

## What Changes

- Move classify/orientation routing into `src/domains/workspace-graph-integration/**`.
- Route Nx graph and affected facts through `NxProvider`.
- Keep Habitat classification language separate from Nx provider execution.

## What Does Not Change

- No classify output contract change.
- No Nx target names or root script changes.

## Verification

- `bun run openspec -- validate deep-habitat-effect-orientation-workspace-graph --strict`
- `git diff --check`

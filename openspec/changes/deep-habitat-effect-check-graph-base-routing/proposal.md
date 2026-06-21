# Change: Deep Habitat Effect Check Graph Base Routing

## Why

Root graph checks were calling `nx affected` without an explicit stack-aware
base. On a deep Graphite stack, that makes local graph validation expand toward
the whole repo instead of the current slice.

## What Changes

- Route root `check:graph` through `habitat verify`.
- Teach verify base resolution to prefer the Graphite parent before falling back
  to the remote-default merge-base.
- Record `graphite-parent` as a first-class verify receipt base source.

## Non-Goals

- Do not submit Graphite stacks or create PRs.
- Do not remove remote merge-base fallback.
- Do not change explicit `--base` behavior.

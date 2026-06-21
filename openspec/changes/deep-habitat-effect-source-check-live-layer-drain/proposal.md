# Change: Deep Habitat Effect Source Check Live Layer Drain

## Why

`SourceCheck` is an owned Habitat domain engine, but its domain service file was
also constructing the live Effect layer. That mixes domain contract/logic with
runtime provision and leaves service/resource boundaries harder to reason
about.

## What Changes

- Keep `SourceCheck` service contract and source-rule implementation in the
  source-check domain.
- Move the live `Layer` assembly for `SourceCheck` into the runtime layer
  boundary.
- Remove unused source-check fake/live layer exports from the domain barrel.
- Preserve current runtime behavior and source-rule execution semantics.

## Non-Goals

- Do not change source-check rule behavior.
- Do not move source-rule modules or scan-root planning in this slice.
- Do not introduce a new provider abstraction for owned source-check logic.

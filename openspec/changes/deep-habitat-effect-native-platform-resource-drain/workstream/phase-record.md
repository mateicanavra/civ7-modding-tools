# Phase Record: Deep Habitat Effect Native Platform Resource Drain

## Frame

Habitat should feel like a professional AI-native repo harness: it composes
strong tools into enforceable structure instead of making agents rebuild common
infrastructure. This phase applies that standard inward by removing resource
substrate that Habitat should not own.

## Scope

Write set:

```text
tools/habitat-harness/src/resources/**
tools/habitat-harness/src/runtime/**
tools/habitat-harness/src/providers/{command,git,nx,biome}/**
tools/habitat-harness/src/adapters/grit/provider/**
tools/habitat-harness/src/domains/{baseline-authority,rule-registry,structural-check,workspace-graph-integration}/**
tools/habitat-harness/src/service/modules/{check,graph,verify}/**
tools/habitat-harness/test/**
scripts/lint/lint-habitat-public-surface-guards.mjs
openspec/changes/deep-habitat-effect-native-platform-resource-drain/**
```

Protected paths:

```text
dist/**
mod/**
.civ7/outputs/resources/**
```

## Gate State

- Gate 1 frame: complete.
- Gate 2 repo state: branch `agent-DRA-effect-native-platform-resource-drain`
  in worktree `wt-agent-DRA-deep-habitat-prep-frame`.
- Gate 7 architecture: native Effect platform resources are the substrate;
  Habitat resource files own only typed error translation and sync edge
  containment.
- Gate 8 implementation: complete for this packet.
- Gate 11 review: adversarial reviewer lane requested; findings disposition is
  accepted and repaired by removing the `HabitatFileSystem` alias, adding
  native Clock and sync-helper guard ratchets, and narrowing resource barrel
  exports.
- Gate 12 closure: commit through Graphite, do not submit the stack.

## Verification Results

- `bun install`: passed.
- `bun run --cwd tools/habitat-harness check`: passed.
- `bun run --cwd tools/habitat-harness test`: passed, 31 files / 290 tests.
- `bun run habitat check --tool habitat --json`: passed.
- `bun run biome:ci`: passed.
- `bun run build`: passed; existing Vite chunk-size warnings and Nx flaky-task
  notice were non-fatal.
- `git diff --check`: passed.

## Downstream Realignment

- The runtime/config/errors packet originally named local clock/filesystem/scope
  services. This packet supersedes that local-resource shape with native Effect
  platform resources.
- The public-surface guard packet now allows the resource time edge instead of a
  deleted local clock service, and ratchets native Effect `Clock` plus sync
  filesystem helper imports to explicit owners.
- Remaining provider and service-router work must not recreate resource
  wrappers to move context manually; owned logic should compose platform/vendor
  services through the selected Effect/oRPC module shape.

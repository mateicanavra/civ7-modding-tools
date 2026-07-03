# Change: Deep Habitat Effect Pre-Push Hook Plan

## Why

Pre-push reused the same broad target recipe as root graph validation. That made
local hook feedback pay for workspace aggregate source/file/boundary checks even
when the hook only needed changed-path feedback before the CI-grade graph lane.

## What Changes

- Add a pre-push changed-path source-check lane backed by `GitProvider`.
- Restrict that lane to source-check rules marked `hookCheck: true`.
- Pass changed paths into the in-process `StructuralCheck` service instead of
  invoking the full source-check catalog.
- Keep root `check:graph` as the explicit broad graph-validation command.
- Narrow the pre-push Nx affected target set to package `check` plus explicit
  validation targets.

## Non-Goals

- Do not remove full source-check, file-layer, or boundaries graph targets.
- Do not rewrite the source-check AST/indexing engine in this slice.
- Do not enforce target topology through tests.

## Validation

- `bun run --cwd tools/habitat-harness check`
- `bun run --cwd tools/habitat-harness test -- test/service/hook-service.test.ts`
- `bun run openspec -- validate deep-habitat-effect-prepush-hook-plan --strict`
- pre-push task-plan comparison with `nx affected --graph=stdout`

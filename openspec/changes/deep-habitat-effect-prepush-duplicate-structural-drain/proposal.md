# Change: Deep Habitat Effect Pre-Push Duplicate Structural Drain

## Why

Habitat pre-push should be fast because each lane has one clear owner. The
current Habitat-tooling path still schedules overlapping Habitat structural
work: the hook runs changed-path source checks, then Nx runs the harness package
check, then Nx affected re-enters Habitat owner/component rule targets.

That duplicates Habitat rule execution inside one workstation hook and keeps
the slow-path smell alive.

## What Changes

- Keep pre-push changed-path source checks in the hook service.
- Keep the owner-local `@internal/habitat-harness:check` TypeScript check for
  Habitat tooling source edits.
- Stop scheduling affected `habitat:check` and `source:check` for the same
  Habitat tooling source-edit path.
- Keep distinct affected structural guards that are not Habitat rule
  re-entry: boundary taxonomy and native Grit pattern fixture validation.
- Preserve authority-only and ordinary repo pre-push target planning.

## Non-Goals

- Do not weaken authority-only validation.
- Do not remove ordinary repo affected `check`.
- Do not add structural topology tests.
- Do not hide slow work behind longer timeouts.

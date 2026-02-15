# Worker C Baseline Check/Test Fix Scratch

Date: 2026-02-15
Branch: codex/agent-C-baseline-check-test-fixes
Parent branch: codex/agent-B-placement-s2-verification-docs

## Scope
- Stabilize baseline checks for `bun run check` docs lint failures.
- Stabilize baseline tests for `bun run test` failures in `mapgen-studio` default config schema tests.

## Status
- Setup complete.
- Investigation in progress.

## Narsil Evidence (required)
- `list_repos` (narsil): only `civ7-modding-tools#25fd7575` is indexed for this session.
- `get_index_status` (narsil): index complete for the repo.
- `get_project_structure` (narsil): docs + scripts anchor official resource workflow via:
  - `docs/process/resources-submodule.md`
  - `scripts/civ7-resources/*`
- Scope boundary for this slice: failing targets are local docs/test surfaces (`ECOLOGY.md`, `apps/mapgen-studio/test/config/defaultConfigSchema.test.ts`) and do not require direct reads from CIV official resource catalog content.

## Notes
- Pending root-cause analysis and fix implementation for:
  - broken ecology anchor targets in docs lint;
  - stale foundation schema expectations in studio test.

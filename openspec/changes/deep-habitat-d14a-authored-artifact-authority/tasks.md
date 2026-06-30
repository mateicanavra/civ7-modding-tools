# Tasks

## 1. Source Boundary

- [x] 1.1 Add `.habitat/` as checked-in authored authority data root.
- [x] 1.2 Move active rule registry to `.habitat/rules/index.json` plus `.habitat/rules/<rule-id>/rule.json`.
- [x] 1.3 Move explicit baselines to `.habitat/baselines/*.json`.
- [x] 1.4 Add a central artifact-path module.
- [x] 1.5 Update registry, baseline, Nx plugin, and generator consumers.
- [x] 1.6 Remove package export/files treatment of authored data.

## 2. Test Design

- [x] 2.1 Remove live CLI entrypoint Vitest suite that shells out and mutates
  checked-in baselines.
- [x] 2.2 Remove native Grit corpus Vitest suite.
- [x] 2.3 Add explicit validation scripts for CLI smoke and Grit pattern corpus.

## 3. Records And Validation

- [x] 3.1 Update D0 matrix and packet index for D14A.
- [x] 3.2 Run focused Habitat tests.
- [x] 3.3 Run typecheck/build.
- [x] 3.4 Run OpenSpec validation.
- [x] 3.5 Run final scans for old authored-data paths and live-test regressions.

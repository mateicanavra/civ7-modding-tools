## 0. Parent Design Preconditions

- [x] 0.1 Confirm this parent change remains design-only and is stacked after
  closed H7 `habitat-git-hooks` and H8 `habitat-generators-migrations`.
- [x] 0.2 Record branch/stack state, protected owners, and current stop-condition
  status in the phase record.
- [x] 0.3 Run OpenSpec, Effect-idiom, and Habitat-parity review lanes and record
  finding dispositions before committing this design slice.
- [x] 0.4 Re-investigate completed H8 from branch diff, OpenSpec records, phase
  record, generator/migration metadata, classify implementation, generator
  source, migration source, tests, README, and AGENTS updates.

## 1. Parent Spec Split

- [x] 1.1 Replace the singular `habitat-harness` spec delta with child-aligned
  parent deltas for runtime substrate, process/baselines, check orchestration,
  command programs, Nx generators/migrations, hooks, and generated verifier.
- [x] 1.2 Add H8 reassessment evidence covering classify, project generator,
  pattern generator, migration metadata, tests, README, and AGENTS changes.
- [x] 1.3 Update proposal, design, frame, phase record, and review disposition
  so oclif command programs and Nx generator/migration factories have separate
  host-adapter boundaries.
- [x] 1.4 Run formal review lanes for authority/H8 parity, OpenSpec shape,
  Effect architecture, Nx generator/migration boundary, proof/closure, and
  future-DRA information design.
- [x] 1.5 Repair accepted review findings in the parent artifacts.

## 2. Next Child Changes

The parent is complete when this checklist closes. Future implementation work
starts new OpenSpec child changes:

- `habitat-effect-runtime-substrate`
- `habitat-effect-process-baselines`
- `habitat-effect-check-orchestration`
- `habitat-effect-command-programs`
- `habitat-effect-nx-generators-migrations`
- `habitat-effect-hooks`
- `habitat-effect-generated-verifier`

## 3. Parent Verification

- [x] 3.1 Run `bun run openspec -- validate habitat-effect-native-core --strict`.
- [x] 3.2 Run `bun run openspec:validate`.
- [x] 3.3 Run `git diff --check`.
- [x] 3.4 Run `git status --short --branch`.
- [x] 3.5 Run `gt status` and `gt info`.
- [x] 3.6 Commit the initial parent design slice via Graphite without editing
  H1-H8 historical records.
- [x] 3.7 Validate and commit the H8 reassessment plus split-spec revision via
  Graphite without editing H1-H8
  historical records.

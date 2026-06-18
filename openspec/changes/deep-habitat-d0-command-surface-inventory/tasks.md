# Tasks

## 1. Ground D0 From Current Worktree

- [ ] 1.1 Confirm the worktree is
      `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`
      on branch `codex/deep-habitat-openspec-remediation`.
- [ ] 1.2 Run `git status --short --branch` and record the initial state.
- [ ] 1.3 Read the source D0 packet, this OpenSpec packet, and the D0 review
      scratch document before authoring the matrix.
- [ ] 1.4 Treat historical absolute paths from older worktrees as provenance
      only; do not run commands from them.

## 2. Author The Matrix

- [ ] 2.1 Create
      `docs/projects/habitat-harness/public-surface-compatibility-matrix.md`
      with the required sections from `design.md`.
- [ ] 2.2 Add state glossary and plane authority sections exactly once in the
      matrix.
- [ ] 2.3 Inventory every CLI command file under
      `tools/habitat-harness/src/commands`, including verb, args, flags,
      JSON output, human output, and command examples.
- [ ] 2.4 Inventory every export from `tools/habitat-harness/src/index.ts`.
- [ ] 2.5 Inventory every `exports` subpath from
      `tools/habitat-harness/package.json`.
- [ ] 2.6 Inventory root scripts that invoke Habitat or Habitat-owned Nx targets.
- [ ] 2.7 Inventory `tools/habitat-harness/package.json` scripts, generators,
      migrations, package files, and Nx targets.
- [ ] 2.8 Inventory inferred Nx targets from
      `tools/habitat-harness/src/plugin.js` and root `nx.json`.
- [ ] 2.9 Inventory generator and migration surfaces from
      `tools/habitat-harness/generators.json`,
      `tools/habitat-harness/migrations.json`, and schema/factory files.
- [ ] 2.10 Inventory hook command and Husky delegation assumptions without
      executing a live hook.
- [ ] 2.11 Add stable `surface_id` values and typed `row_relationships` for
      surfaces that appear on multiple planes, are renamed, are deprecated with
      replacements, are generated from source authority, or are docs examples of
      another surface. Use the deterministic row identity and closed row
      relationship contracts from `design.md`; do not choose ad hoc slug names
      or untyped links.
- [ ] 2.12 Classify legacy proof/evidence-shaped names as compatibility facts
      or downstream redesign targets; do not approve them as target language.
- [ ] 2.13 Assign exactly one closed `compatibility_handling` action to every
      row: preserve, version, facade, deprecate, refuse, document-only, or
      generated-only. Use `target_owner` and `downstream_dominoes` for downstream
      ownership; do not add an unclassified handling value.

## 3. Matrix Completeness Checks

- [ ] 3.1 Confirm every `export` in `tools/habitat-harness/src/index.ts` has a
      `package-export` row.
- [ ] 3.2 Confirm every command file has at least one `cli` row.
- [ ] 3.3 Confirm every command JSON DTO emitted by a command has a
      `command-json` row or a documented non-JSON non-claim.
- [ ] 3.4 Confirm every root script containing `habitat`,
      `@internal/habitat-harness`, `grit:check`, `generated:check`, or
      `habitat:rule:` has a `root-script` row.
- [ ] 3.5 Confirm every generator and migration entry has rows for name, schema,
      factory, and compatibility/refusal surface.
- [ ] 3.6 Confirm every Habitat-owned Nx target observed through
      `nx show project @internal/habitat-harness` has an `nx-target` row.
- [ ] 3.7 Confirm every row ID can be re-derived from its plane-specific source
      identity, and that no row ID is reused for a different surface.
- [ ] 3.8 Confirm every row has one closed compatibility handling action and no
      row depends on a later packet to choose that action.
- [ ] 3.9 Confirm every cross-row link uses one closed `row_relationships`
      relation and that no relationship is hidden in `notes`.

## 4. Validation Commands

- [ ] 4.1 Run `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts`.
- [ ] 4.2 Run `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts`.
- [ ] 4.3 Run `bun run habitat check --json`; record status, sample location,
      and non-claims.
- [ ] 4.4 Run `bun run habitat classify tools/habitat-harness/src/plugin.js`;
      record status, sample location, and non-claims.
- [ ] 4.5 Run `bun run habitat verify --json`; record status, sample location,
      and non-claims.
- [ ] 4.6 Run `bun run habitat fix --dry-run`; record status, sample location,
      and non-claims.
- [ ] 4.7 Run `bun run habitat graph --json`; record status, sample location,
      and non-claims.
- [ ] 4.8 Run `bun run habitat hook --help`; record status and confirm no hook
      executes.
- [ ] 4.9 Run `nx show project @internal/habitat-harness`; record target
      inventory source.
- [ ] 4.10 Run `bun run openspec -- validate deep-habitat-d0-command-surface-inventory --strict`.
- [ ] 4.11 Run `bun run openspec:validate`.
- [ ] 4.12 Run `git diff --check`.

## 5. Downstream Handoff

- [ ] 5.1 Update `tools/habitat-harness/docs/IMPLEMENTED-SURFACE.md` only if a
      link to the matrix is needed for discoverability.
- [ ] 5.2 Update `tools/habitat-harness/docs/SCENARIOS.md` only if command
      examples need current compatibility clarification.
- [ ] 5.3 Update `docs/projects/habitat-harness/openspec-remediation/packet-index.md`
      to mark D0 as designed and cite the matrix path.
- [ ] 5.4 Leave a D0 review disposition with every accepted P1/P2 finding
      repaired by this packet.
- [ ] 5.5 Stop after D0 review. Do not author D1 until D0 has a clean review
      disposition.

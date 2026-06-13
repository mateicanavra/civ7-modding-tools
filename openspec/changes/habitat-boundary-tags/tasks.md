## 1. Tags

- [x] 1.1 Add `"nx": {"tags": [...]}` to all 21 workspace package.json files,
  exactly per taxonomy.md §2. `tools/habitat-harness/package.json` already
  carries `kind:tooling` pre-seeded by H2 — verify it matches taxonomy.md,
  don't re-add.
- [x] 1.2 `bunx nx show project` spot-checks (adapter, mapgen-core,
  mod-swooper-maps, studio-server) confirm tags in the graph.

## 2. Boundary Rule

- [x] 2.1 Add `@nx/eslint-plugin` and `eslint` devDependencies (the
  `boundaries` target owns the ESLint invocation; H6 only re-points aggregate
  entrypoints); create `eslint.boundaries.config.mjs` containing only
  `@nx/enforce-module-boundaries` with taxonomy.md §3 depConstraints,
  per-constraint agent-readable messages, `enforceBuildableLibDependency`
  evaluated and recorded (expected: false — no buildable-lib split here).
- [x] 2.2 Run the rule repo-wide; if any constraint is red, follow the stop
  condition (baseline the edge explicitly, log in discrepancy-log.md) —
  expected green per taxonomy verification.

## 3. Harness Integration

- [x] 3.1 Register `boundaries` inferred target in the harness plugin; add to
  `habitat check`/`verify` composition with JSON diagnostics.
- [x] 3.2 Add rule-pack entry (owner `nx-boundaries`, baseline empty, locked);
  remediation message points at taxonomy.md and the revision protocol.
- [x] 3.3 Add `boundaries` to CI affected targets.

## 4. Verification And Closure

- [x] 4.1 `bunx nx run-many -t boundaries --all` green; violation probe fails
  with tag-rule message, then removed.
- [x] 4.2 Harness README documents tag vocabulary + taxonomy revision
  protocol; taxonomy.md marked "locked at adoption" with date.
- [x] 4.3 `bun run build && bun run check && bun run test` posture recorded
  (build/check green; test remains red only for pre-existing failure classes);
  `bun run openspec -- validate habitat-boundary-tags --strict`; downstream
  realignment (AGENTS.md routers mention boundaries target) and closure per
  workstream record.

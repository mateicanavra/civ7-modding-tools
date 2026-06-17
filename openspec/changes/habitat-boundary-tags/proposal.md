## Why

The project-plane architecture (which workspace project may depend on which)
is currently enforced only indirectly (scripts checking specific import
strings) or not at all. With Nx adopted, the derived taxonomy
(docs/projects/habitat-harness/taxonomy.md) can be locked as graph law:
tags on every project, dependency constraints via
`@nx/enforce-module-boundaries`, ESLint quarantined to exactly that one rule.
The taxonomy encodes the implied architecture at adoption time (Matei D4). This
historical H3 slice locked the initial project-plane rule. Current recovery
closure for that taxonomy is owned by
`habitat-boundary-taxonomy-tightening`, which rechecks manifests, resolved Nx
metadata, boundary config, graph edges, and false-negative probes against the
current repository.

## Target Authority Refs

- `docs/projects/habitat-harness/taxonomy.md` (tags, assignments, constraints — the controlling table)
- `docs/projects/habitat-harness/FRAME.md` (hard core #2, #4)
- `docs/projects/habitat-harness/habitat-harness-spec-draft-input.md` §5.4 (ESLint quarantine), §12.1
- `https://nx.dev/docs/technologies/eslint/eslint-plugin/guides/enforce-module-boundaries`

## What Changes

- Add `"nx": {"tags": ["kind:..."]}` to every workspace project's
  `package.json` exactly per taxonomy.md §2 (including
  `tools/habitat-harness` → `kind:tooling`).
- Create `eslint.boundaries.config.mjs` whose only rule is
  `@nx/enforce-module-boundaries` with the depConstraints from taxonomy.md §3
  (after architecture review A1, no `kind:control` → `kind:mod` allowance).
- Add `@nx/eslint-plugin` devDependency; ESLint runs on Node via `bunx eslint`.
- Register a `boundaries` inferred target in the harness plugin (target name
  `boundaries`, never `lint`); add it to `habitat check`/`verify` composition
  and CI affected targets.
- Register the rule in the harness rule pack as `nx-boundaries` owner with an
  empty baseline at adoption. Later current-state proof must use the active
  taxonomy recovery matrix rather than this historical adoption statement.
- Document tag vocabulary and the revision protocol (taxonomy changes are
  deliberate rule-pack edits with provenance) in the harness README.

## What Does Not Change

- The existing `eslint.config.js` and `bun run lint` stay untouched (their
  rules are ported and retired in `habitat-grit-catalog` /
  `habitat-enforcement-consolidation`).
- No intra-project rules (grit/file-layer territory).
- No package dependency edits as a way to weaken constraints. If the rule
  discovers a hidden but tag-legal source import, repair the import shape by
  using the package entrypoint and declaring the existing edge; if a constraint
  is truly red, do NOT weaken it: record the edge, baseline it explicitly, and
  log the discovery in the discrepancy log.

## Requires

- `habitat-nx-adoption`
- `habitat-harness-scaffold`

## Enables Parallel Work

- `habitat-biome-hygiene` (H4) is serialized AFTER this change — both touch
  root `package.json`, `ci.yml`, and the harness rule pack, and H4's repo-wide
  reformat rewrites the `package.json` files this change edits tags into
  (ledger F1).
- `habitat-enforcement-consolidation` (boundary-adjacent retirements).

## Affected Owners

- Every workspace `package.json` (tags field only)
- New `eslint.boundaries.config.mjs`; root `package.json` devDependencies
- `tools/habitat-harness` rule pack + plugin target wiring
- `.github/workflows/ci.yml` (add `boundaries` to affected targets)

## Forbidden Owners

- No rules other than `@nx/enforce-module-boundaries` in the boundaries
  config; no style/hygiene rules through ESLint ever again.
- No `project.json` files; tags live in package.json.
- No source-code edits in product packages.
- No tag taxonomy redesign beyond taxonomy.md (revisions are future deliberate
  changes).

## Stop Conditions

- A constraint from taxonomy.md is red against the real graph (taxonomy
  verification was wrong) — stop, baseline the specific edge, log in
  discrepancy-log.md, continue; do not weaken the constraint silently.
- The boundary rule cannot see a dependency edge that exists (graph inference
  gap) — stop and record before papering over.

## Consumer Impact

Cross-project imports that violate the taxonomy now fail `habitat check` and
CI with an agent-readable message naming the tag rule. Currently-green repo
means zero immediate disruption.

## Verification Gates

- `bun run openspec -- validate habitat-boundary-tags --strict`
- Historical gate: `bunx nx run-many -t boundaries --all` green on the clean
  adoption tree; `bunx nx affected -t boundaries` ran as a smoke check only
  because affected on a clean tree runs nothing and proves nothing. Current
  recovery proof uses repo-local `bun run nx ...` forms with normal Nx defaults.
- Probe: add `import '@civ7/adapter'` (plus the dependency edge) in a scratch
  file inside `packages/config/src/` — `kind:foundation` may depend only on
  `kind:foundation`, so the `boundaries` target must fail naming the
  `kind:foundation` constraint; probe then reverted.
- `bunx nx show project <p>` displays expected tags for spot-checked projects.
- `bun run habitat check` includes the locked `nx-boundaries` rule.
- `bun run build && bun run check && bun run test` unchanged-green.

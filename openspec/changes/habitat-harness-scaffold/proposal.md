## Why

The habitat harness needs a home before any rule migrates: a repo-local
package (`tools/habitat-harness`) owning the `habitat` CLI, the rule-pack
format, the ratchet/baseline machinery, and an Nx plugin for target inference.
This slice creates that machinery and wraps ALL existing enforcement behind it
with machine-readable output — adding zero new rules and changing zero rule
semantics — so every later slice is a pure rule migration with a stable
harness underneath (FRAME hard core #1, #3).

## Target Authority Refs

- `docs/projects/habitat-harness/FRAME.md` (hard core #1–#3; degeneration trigger)
- `docs/projects/habitat-harness/invariant-corpus.md` (wrap dispositions)
- `docs/projects/habitat-harness/habitat-harness-spec-draft-input.md` §4.3
  (layout), §6 (command set), §7.1–7.2 (rule pack + invariant record), §9
  (machine-readable output)
- `https://nx.dev/docs/extending-nx/project-graph-plugins` (createNodesV2)

## What Changes

- Create workspace package `tools/habitat-harness`
  (`@internal/habitat-harness`, `kind:tooling`): Bun-run TS CLI at
  `src/bin/habitat.ts`, libs (`graph`, `paths`, `spawn` with argument-array
  spawning, `diagnostics`, `git`, `baseline`), rule pack at
  `src/rules/architecture.ts`, agent-readable messages in `src/rules/messages.ts`.
- Implement the normative command set: `habitat graph`, `habitat classify
  <path-or-diff>`, `habitat check [--staged]`, `habitat fix [--dry-run]`,
  `habitat verify`, `habitat hook <name>` (hook bodies land in
  `habitat-git-hooks`).
- Implement the ratchet: every rule has an explicit baseline file under
  `tools/habitat-harness/baselines/<rule-id>.json` (violation list, frozen);
  `habitat check` fails on NEW violations only; baselines shrink-only
  (a CI-checked invariant); a rule with an empty baseline is **locked** and
  hard-fails on any violation.
- Wrap every existing check from the invariant corpus as a harness rule with
  unchanged semantics: the 9 `scripts/lint/*` scripts, ESLint (`bun run lint`),
  and the architecture test suites, each emitting JSON diagnostics
  (`{ruleId, path, line, message, severity, baselined}`).
- Add root scripts `habitat`, `habitat:check`, `habitat:fix`,
  `habitat:verify` per the spec draft.
- Implement the Nx plugin (`src/plugin.ts`, `createNodesV2`) registering
  inferred targets for harness rules (`habitat:check`, later `boundaries`,
  `biome:ci`, `grit:check`, `verify`) driven by the rule pack; register in
  `nx.json` plugins.

## What Does Not Change

- No rule semantics change; no rule is added, removed, or re-owned.
- Existing scripts keep working standalone until
  `habitat-enforcement-consolidation` retires them.
- `bun run check` and CI continue to pass identically.

## Requires

- `habitat-nx-adoption`

## Enables Parallel Work

- `habitat-boundary-tags` and `habitat-biome-hygiene` (parallel after this).
- `habitat-grit-catalog`, `habitat-git-hooks`, `habitat-generators-migrations`.

## Affected Owners

- New: `tools/habitat-harness/**`
- Root `package.json` scripts; `nx.json` plugins entry
- `.github/workflows/ci.yml` (artifact upload of habitat JSON diagnostics only)

## Forbidden Owners

- No edits to `scripts/lint/*` internals (wrap, don't rewrite).
- No edits to product packages (`apps/**`, `packages/**` outside tools,
  `mods/**`).
- No new rules, no baseline entries beyond what existing checks report today.
- No shell-string command concatenation in spawn paths.

## Stop Conditions

- A wrapped check cannot produce stable machine-readable output without
  changing its semantics — stop, record, and wrap at a coarser granularity.
- The ratchet design cannot express an existing allowlist (e.g.
  adapter-boundary's 6 files) losslessly.
- Harness code starts importing product packages.

## Consumer Impact

Agents and contributors gain one entrypoint (`bun run habitat check|fix|verify`)
with JSON evidence; existing entrypoints unchanged. CI gains diagnostic
artifacts.

## Verification Gates

- `bun run openspec -- validate habitat-harness-scaffold --strict`
- `bun run habitat check` exits green on a clean tree and reports every
  corpus-wrapped rule with status + baseline counts.
- `bun run habitat check --json` validates against the diagnostic schema.
- Probe: introduce a synthetic adapter-boundary violation in a scratch file →
  `habitat check` fails naming the rule and remediation; baseline untouched.
- Probe: shrink-only invariant — adding a baseline entry fails the baseline
  self-check.
- `bunx nx run-many -t habitat:check --all` runs via the plugin.
- `bun run build && bun run check && bun run test` unchanged-green.

# Phase Record — H5 `habitat-grit-catalog`

## Phase

- Project: habitat-harness (FRAME.md controlling)
- Phase: H5 — GritQL syntax catalog, fixture-gated codemods, and file-layer
  generated-zone protection
- Owner: workstream owner agent (Codex continuation)
- Branch/Graphite stack: `agent-F-habitat-grit-catalog` above
  `agent-F-swooper-recipe-artifact-race`
- Started: 2026-06-13
- Status: CLOSED — H5 implementation and verification complete.

## Objective

- Target movement: move intra-project source-shape enforcement into a
  Habitat-owned GritQL catalog with fixtures and parity evidence; add
  fixture-gated apply-mode codemods; make generated zones actually
  write-protected through Habitat/file-layer rules and CI drift checks.
- Non-goals: no retirement of the original ESLint/script/test checks yet
  (H6 owns consolidation); no semantic product/runtime rewrites; no
  hand-edits to generated zones; no pattern without fixtures in apply mode.
- Done condition: H5 tasks 1.1-5.3 complete; every ported rule has fixture and
  parity evidence; generated-zone staged probe fails with remediation and is
  removed; root build/check/test remain green; OpenSpec validation passes;
  Graphite branch committed cleanly.

## Authority

- Root/subtree `AGENTS.md`: generated artifacts are read-only; update adjacent
  docs/tests when behavior/contracts move; use Graphite; keep worktree clean.
- H5 OpenSpec: `openspec/changes/habitat-grit-catalog/{proposal.md,design.md,tasks.md,specs/habitat-harness/spec.md}`.
- Project refs: `docs/projects/habitat-harness/FRAME.md`,
  `docs/projects/habitat-harness/invariant-corpus.md`,
  `docs/projects/habitat-harness/taxonomy.md`,
  `docs/projects/habitat-harness/workstream-record.md`.
- User protocol note: structural/boundary/lint-style checks currently in
  normal tests are not the intended end state; H5/H6 should migrate them into
  Habitat-owned enforcement with parity proof before normal-test retirement.
- Cross-agent sharing protocol: meaningful capability unlocks must be offered
  to active agent stacks before normal drain when they could benefit.

## Current State

- Repo/Graphite state: branch `agent-F-habitat-grit-catalog`, clean at branch
  open, stacked above locally closed H4 proof repairs.
- H4 prerequisite state: Biome hygiene is locally closed pending upstream
  drain; full root `test` passed after promoted H4 proof repairs; H4.5 oclif
  CLI is implemented below this branch.
- Existing enforcement still active: wrapped lint scripts, wrapped ESLint, and
  wrapped architecture tests remain authoritative until H6 retirement. H5 only
  ports, proves parity, and adds generated-zone protection.
- Generated outputs affected: none expected; all `dist/**`, `mod/**`,
  `types/**`, generated map/config/type/table outputs remain protected from
  hand edit.

## Scope

- Write set: root devDependency/lockfile for Grit; `.grit/grit.yaml` and
  `.gitignore` cache ignores; `tools/habitat-harness/**` wrapper/rule-pack/
  plugin/CLI/fixtures/patterns; generated-zone rule records; H5 phase records
  and parity tables.
- Protected files: generated zones and build outputs, including
  `mods/mod-swooper-maps/src/maps/generated/**`,
  `packages/civ7-types/generated/**`,
  `packages/civ7-map-policy/src/civ7-tables.gen.ts`, `dist/**`, `mod/**`,
  `types/**`, `.civ7/outputs/**`.
- Owners: Grit owns syntax/source-shape patterns and fixture-gated codemods;
  file-layer owns generated-zone write protection; Habitat owns orchestration,
  baselines, and ratchet reporting; Biome owns formatting after apply-mode
  rewrites.
- Forbidden owners: Nx-boundaries must not be used for intra-project path
  shape; Grit must not own project graph law; Grit apply must not perform
  semantic/domain rewrites; normal tests must not be called the final home for
  structural guards.

## Spec/Tasks

- Spec/proposal: `openspec/changes/habitat-grit-catalog/proposal.md` and
  `specs/habitat-harness/spec.md`
- Tasks: `openspec/changes/habitat-grit-catalog/tasks.md` (0 complete at
  phase open)
- Validation status: pending after phase-record creation

## Investigation Lanes

- Enforcement inventory lane: map each current rule/script/test source to H5
  pattern/file-layer/native disposition and identify executable original
  commands for parity.
- Grit implementation lane: confirm repo-local `@getgrit/cli` command shape,
  JSON output schema, fixture format, apply-mode behavior, and Bun/Nx
  integration constraints.
- File-layer lane: inspect existing Habitat rule-pack/baseline/check/staged
  APIs and design the complete generated-zone write-protection integration for
  this slice.
- Structural-test migration lane: identify H4-discovered structural tests
  (`catalog-ownership`, `standard-recipe-artifact-guards`) as H5/H6 migration
  candidates, but do not retire normal-test copies in H5 without parity and
  explicit H6 disposition.

## Grit Findings

- 2026-06-13 export-star probe: the repo-local `@getgrit/cli`
  (`grit` → `grit 0.1.1`) can express the
  value-star/type-star distinction in `grit check`. The current
  `sdk_mapgen_entrypoint` snippet guard matches `export * from "./mapgen"` and
  does not flag `export type * from "./mapgen"`; AST `export_statement()`,
  regex, and JS-function probes also confirmed that the check path can bind or
  inspect the type-star source.
- Native sample limitation: both Markdown `.grit/patterns/*.md` samples and
  `.grit/grit.yaml` samples currently parse-error on `export type *` before
  the pattern runs (`Error parsing source code at 1:8`). Filename markers,
  no filename marker, JS/TS fences, and single-vs-two-block sample shapes did
  not change that. Keep native samples for normal match/no-match cases; do not
  add temp-workspace harness tests around this parser edge in H5.
- Native sample performance: `grit patterns test` should be subsecond for the
  H5 catalog (43 samples measured at ~0.43s after cleanup). If it takes
  20-50s with low CPU, remove generated `.grit/.gritmodules` and `.grit/cache`
  directories from the worktree; those are local caches/modules, not source.
  `.gitignore`, `.grit/.gitignore`, and `.gritignore` all exclude them.
- Official Grit integration shape confirmed from docs on 2026-06-13:
  patterns live under `.grit/patterns`, `grit patterns test` is the native
  sample authority, `.gritignore` is the native omission mechanism, and
  `grit check` accepts path arguments plus `--only-in-json` for upstream
  eslint-style ranges. H5 uses those native surfaces only.
- Full-audit scan shape: the harness runs one native `grit check --json
  --level error` over declared audit roots that match the H5 pattern scopes:
  `packages`, `apps/mapgen-studio/src`,
  `mods/mod-swooper-maps/src/{recipes,maps,domain}`. The Nx `grit:check`
  target intentionally routes through `habitat check --tool grit-check`
  instead of a raw Grit command: Grit owns matching, Habitat owns rule-pack
  mapping, baselines, and pass/fail interpretation, and Nx owns scheduling and
  cache.
- Exit-code probe: a temporary scanned file containing
  `import "/base-standard/maps/map-globals.js";` produced an
  `adapter_base_standard_import` JSON finding while raw
  `grit --json check --level error <file>` exited 0. The same finding with
  `grit check --github-actions --level error <file>` exited 1, but that mode
  emits GitHub annotations rather than Habitat diagnostics/baseline state.
  Therefore H5 keeps the shallow Habitat JSON adapter and rejects a raw direct
  Nx target as semantically weaker.
- oclif dev loader fix: `bin/dev.ts` now loads the root plugin with
  `ignoreManifest: true`, so Nx/dev targets execute current `src/**` through
  oclif's development TypeScript path resolution even when ignored
  `dist/`/`oclif.manifest.json` artifacts are absent or stale. Production
  `bin/run.js` still uses generated dist.

## Verification

- Green:
  - `GRIT_TELEMETRY_DISABLED=true grit patterns test --verbose`
    — 22 patterns, 43 samples, all passed; latest measured run completed in
    ~0.5s.
  - `bun run --cwd tools/habitat-harness test -- grit-patterns.test.ts` — 1
    native-pattern test passed in ~0.5s.
  - `bun run --cwd tools/habitat-harness check` — TypeScript check passed.
  - `bun run --cwd tools/habitat-harness test` — 9 tests passed.
  - `bunx --bun @biomejs/biome check .` — green.
  - `bun tools/habitat-harness/bin/dev.ts check` — full Habitat rule pack
    passed: 44 rules, 0 failing, 1 advisory finding (`doc-ambiguity`).
  - Failure probe:
    `bun tools/habitat-harness/bin/dev.ts check --tool grit-check --rule
    grit-adapter-base-standard-import` failed on a temporary
    `packages/sdk/src/habitat-grit-exit-probe.ts` `/base-standard/` import,
    emitted the locked-baseline diagnostic, and exited 1. Probe file removed.
  - Original mechanisms remain green on the current tree:
    `bun tools/habitat-harness/bin/dev.ts check --tool wrapped-script`
    passed with the existing adapter baseline debt and `doc-ambiguity`
    advisory; `--tool wrapped-eslint` passed; `--tool wrapped-test` passed.
  - `bunx nx run @internal/habitat-harness:grit:check --outputStyle=static`
    — green via `habitat check --tool grit-check`; one shared Grit scan
    accounted for ~2.9s and projected rules completed at 0-1ms.
  - `bunx nx affected -t grit:check --outputStyle=static` — green via Nx
    cache.
  - Generated-zone staged probe:
    `bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer`
    failed on a staged edit to
    `mods/mod-swooper-maps/src/maps/generated/mountain-patch.ts`, named
    `bun run --cwd mods/mod-swooper-maps gen:maps` as remediation, and the
    probe edit was removed.
  - `bun run openspec -- validate habitat-grit-catalog --strict` — valid.
  - `bunx nx run @internal/habitat-harness:generated:check
    --outputStyle=static` — green; `gen:maps` and
    `verify:civ7-map-policy-tables` reported current outputs.
  - `bun run build && bun run check && bun run test` — green; Nx successfully
    ran the repo build/check/test closure sequence, with existing benign
    warnings only (React key warnings and expected ORPC 404 stderr in tests).

## Stop Conditions

- A ported rule cannot reach parity with its original mechanism.
- A Grit pattern cannot express a rule family without weakening it.
- A codemod fixture produces non-format semantic diff beyond the declared
  rewrite.
- A generated-zone check requires hand-editing generated output to pass.
- H5 implementation would require retiring original checks before H6.

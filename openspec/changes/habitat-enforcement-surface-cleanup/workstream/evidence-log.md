# Evidence Log

**Change:** `habitat-enforcement-surface-cleanup`
**Owner:** DRA Habitat recovery owner
**Cwd:** `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-F-habitat-harness-workstream`
**Branch:** `codex/habitat-dra-takeover-frame`
**Base commit at capture:** `5008656a6`
**Touched-path status:** packet files only.

## Supersession Note

Rows below were captured before `habitat-nx-worktree-state-contract` normalized
root workflows. They remain useful historical diagnosis for wrapper and
selector behavior, but root command/CI rows that mention `habitat:verify` or
separate CI build/Biome/lint/test steps are superseded by the current contract:
root `lint` is `nx run-many --targets=lint,habitat:check`, root `verify` is
`nx run-many --targets=verify`, root `check` is
`nx run-many --targets=build,check,lint,test,verify`, and CI runs `bun run ci`
plus a separate strict-core diagnostic job.

## Command Evidence

| ID | argv | env | exit | bounded output / artifact | parsed result | proof class |
| --- | --- | --- | --- | --- | --- | --- |
| HESC-E1 | `git status --short --branch` | default | 0 | `## codex/habitat-dra-takeover-frame` | clean worktree before packet authoring | repo state |
| HESC-E2 | `gt status` | default | 0 | Graphite delegates to `git status`; clean worktree | Graphite state matches git state | workflow state |
| HESC-E3 | `bun run openspec -- list` | default | 0 | existing repair packets listed; new packet absent before creation | next repair selected from current OpenSpec state | source map |
| HESC-E4 | `jq '.scripts' package.json` | default | 0 | root scripts show `check`, `lint`, `ci:architecture-strict-core`, `lint:mapgen-docs`, strict-core alias, and Habitat scripts | root enforcement surfaces captured | script inventory |
| HESC-E5 | `sed -n '90,130p' .github/workflows/ci.yml` | default | 0 | Historical capture: CI ran `bun run habitat:verify`, wrote Habitat JSON diagnostics, uploaded artifact | Superseded by Nx workflow contract; keep as pre-remediation evidence only | historical CI wiring |
| HESC-E6 | `jq -r '.rules[] | [.id, .ownerTool, .ownerProject, .lane, (.detect|join(" "))] | @tsv' tools/habitat-harness/src/rules/rules.json` | default | 0 | ownerTool inventory includes wrapped-script, wrapped-test, grit-check, file-layer, habitat-native, biome, nx-boundaries | rule surface corpus captured | rule inventory |
| HESC-E7 | `bun tools/habitat-harness/bin/dev.ts check --tool wrapped-script --json` | default | 0 | `mapgen-docs`, `adapter-boundary`, `domain-refactor-guardrails`, `baseline-integrity`; `adapter-boundary` has 7 baselined diagnostics | wrapped scripts still live through Habitat | wrapper proof |
| HESC-E8 | `bun tools/habitat-harness/bin/dev.ts check --tool wrapped-test --json` | default | 0 | six wrapped architecture-test rules plus `baseline-integrity`, all pass | wrapped tests still live through Habitat | test wrapper proof |
| HESC-E9 | `bun tools/habitat-harness/bin/dev.ts check --tool wrapped-eslint --json` | default | 0 | historical seed capture: only `baseline-integrity` was present | superseded by accepted selector-proof evidence: current `wrapped-eslint` tool selection fails through `rule-selection-integrity` with no `baseline-integrity` false green | selector false-green |
| HESC-E10 | `bun run lint:mapgen-docs` | default | 0 | direct Python output prints 3 warnings and exits OK | direct output differs from Habitat diagnostics-empty report | wrapper parser evidence |
| HESC-E11 | `bun run habitat:check -- --json --rule mapgen-docs` | default | 0 | `mapgen-docs` and `baseline-integrity`, both pass, zero diagnostics | current wrapper reports no warnings | wrapper parser evidence |
| HESC-E12 | `bun run lint:domain-refactor-guardrails:strict-core` | strict-core env from root script | 1 | 29 violation groups across runtime config merge, JSDoc, canonical op files, and placement policy shapes | strict-core alias remains red diagnostic evidence, not default green proof | diagnostic surface |
| HESC-E13 | `bun run habitat:verify` | default | 0 | Historical capture: Habitat check passed 42 rules; Nx affected ran build/check/test/boundaries/biome:ci/grit:check/generated:check for 22 projects plus one dependency task; one task read from cache | Superseded as root proof by `bun run verify`; still relevant to direct Habitat CLI verify proof design | historical CLI verify proof |
| HESC-E14 | `bun run resources:status` | default | 0 | resources submodule clean at `fbc38ef...` | broad verify run did not dirty resources | resource hygiene |
| HESC-E15 | `sed -n '1,180p' .github/workflows/ci.yml` | default | 0 | Historical capture: main `ci` job ran build, Biome, lint, and test; `architecture-strict-core` ran Habitat verify and diagnostics upload | Superseded by current `bun run ci` graph step plus strict-core diagnostic job | historical CI classification |
| HESC-E16 | `sed -n '150,240p' docs/projects/habitat-harness/effect-orchestration-evaluation.md` | default | 0 | existing Effect evaluation requires a decision before command/check/fix/hook orchestration implementation | Effect gate must occur before implementation touches orchestration surfaces | substrate decision |
| HESC-E17 | `sed -n '1,120p' docs/projects/habitat-harness/invariant-corpus.md` | default | 0 | historical seed capture found the corpus assigning adapter-boundary only to strict-core and excluding root `check` | superseded by downstream realignment; current corpus separates root Nx/Habitat lint, strict-core diagnostic proof, and Habitat diagnostics artifacts | stale record evidence |
| HESC-E18 | `sed -n '1,140p' tools/habitat-harness/src/commands/verify.ts` | default | 0 | `Verify` renders CheckReport, runs Nx affected, writes stdout/stderr, and exits with Nx result | current verify has no structured proof artifact | verify implementation |
| HESC-E19 | `sed -n '1,140p' tools/habitat-harness/src/lib/spawn.ts` | default | 0 | shared `SpawnResult` is exit code, stdout, and stderr | current command runner cannot carry full proof provenance | command provenance |
| HESC-E20 | `sed -n '470,610p' tools/habitat-harness/src/rules/rules.json` | default | 0 | six `wrapped-test` rows use direct `bun test` or package test commands | wrapped-test parity must compare direct output and Habitat report output | test wrapper proof |

## Non-Claims

- This evidence does not close `CLAIM-H6-ONE-PATH`.
- This evidence does not prove Grit pattern semantics or apply safety.
- This evidence does not prove explicit baseline state.
- This evidence does not prove CI has run on this exact commit.
- This evidence does not prove root/dev/prod oclif help repair.

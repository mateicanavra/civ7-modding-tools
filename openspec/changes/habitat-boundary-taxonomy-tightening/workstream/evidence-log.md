# Evidence Log

**Change:** `habitat-boundary-taxonomy-tightening`
**Owner:** DRA Habitat recovery owner
**Cwd:** `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-F-habitat-harness-workstream`
**Branch:** `codex/habitat-dra-takeover-frame`
**Base commit at capture:** `b0e766ec6`
**Touched-path status:** packet files only; created probes were removed before capture closure.

## Settlement Boundary

This log preserves historical design evidence. After the later Nx workflow
settlement on `agent-F-habitat-nx-worktree-state`, entries that use
`--skipNxCache` or `NX_DAEMON=false` are diagnostic context only. Forward
implementation proof must use normal Nx defaults and must not adopt daemon
disabling, cache disabling, socket overrides, symlink repair, or routine cache
reset as steady-state policy.

## Command Evidence

| ID | argv | env | exit | bounded output / artifact | parsed result | proof class |
| --- | --- | --- | --- | --- | --- | --- |
| BTT-E1 | `git status --short --branch` | default | 0 | `## codex/habitat-dra-takeover-frame`; packet path untracked after draft creation | repo state known before and during packet authoring | hygiene state |
| BTT-E2 | `gt status` | default | 0 | Graphite delegates to `git status`; packet path untracked after draft creation | Graphite state matches git state | workflow state |
| BTT-E3 | `bun run openspec -- list` | default | 0 | `habitat-boundary-tags` complete; current packet listed after creation | historical H3 exists; new repair packet is active | source map |
| BTT-E4 | `find apps packages mods tools -maxdepth 3 -name package.json -print \| sort \| xargs jq -r '(.name // input_filename) + "\t" + ((.nx.tags // []) \| join(","))'` | default | 0 | 22 rows including `mod-civ7-intelligence-bridge kind:mod,kind:control` and `@internal/habitat-harness kind:tooling` | package manifest tag inventory captured | tag corpus |
| BTT-E5 | `nx show project @internal/habitat-harness --json` | default | 0 | tags include `npm:private`, `kind:tooling`; targets include `boundaries` | resolved Nx metadata carries expected tooling tag and target | resolved tag proof |
| BTT-E6 | `nx show project mod-civ7-intelligence-bridge --json` | default | 0 | tags include `npm:private`, `kind:mod`, `kind:control` | resolved Nx metadata carries live dual project tags | resolved tag proof |
| BTT-E7 | `nx graph --file /tmp/habitat-boundary-graph.json` | default | 0 | graph artifact written under `/tmp`; parsed during design as 44 workspace dependency edges | current graph edge corpus exists for implementation audit | graph corpus |
| BTT-E8 | `nx run @internal/habitat-harness:boundaries --skipNxCache` | default | 0 | boundary target exits green on clean tree | historical focused proof; rerun without cache flags for closure | historical command proof |
| BTT-E9 | `nx run-many -t boundaries --all --skipNxCache` | default daemon/cache behavior | 1 | target reported success, then Nx emitted SQLite foreign-key transaction failure | historical aggregate failure; normal aggregate proof must be rerun and repaired/escalated if still failing | command reliability |
| BTT-E10 | `NX_DAEMON=false nx run-many -t boundaries --all --skipNxCache` | `NX_DAEMON=false` | 0 | aggregate boundary run exits green | diagnostic only; not accepted steady-state proof policy | historical diagnostic |
| BTT-E11 | `bun run habitat:check -- --json --rule nx-boundaries` | default | 0 | JSON `rules[]` contains `nx-boundaries` and `baseline-integrity` | selected boundary rule is present, locked, passing, and diagnostics-empty | Habitat JSON proof |
| BTT-E12 | created `mods/mod-civ7-intelligence-bridge/src/habitat-boundary-dual-tag-probe.ts`; ran `nx run @internal/habitat-harness:boundaries --skipNxCache`; removed probe; reran boundary target | default | fail then 0 | failure named `kind:control` constraint for SDK import; clean rerun passed | live dual-tag SDK-negative sentinel is enforced and leaves no file behind; rerun without cache flags for closure | false-negative probe |
| BTT-E13 | `cat package.json \| jq -r '.devDependencies.nx // .dependencies.nx // empty'` | default | 0 | `22.7.5` | pinned Nx version refreshed before implementation command selection | tool version |

## Parsed Habitat JSON Assertion

Accepted boundary JSON proof must parse the `rules[]` array and assert:

- `ruleId: nx-boundaries` is present.
- `ownerTool: nx-boundaries`.
- `lane: enforced`.
- `status: pass`.
- `locked: true`.
- `diagnostics.length === 0`.
- `baseline-integrity` may also pass, but it cannot substitute for the selected
  boundary rule.

The current parsed excerpt:

```json
{
  "ok": true,
  "ruleReports": [
    {
      "ruleId": "nx-boundaries",
      "status": "pass",
      "locked": true,
      "ownerTool": "nx-boundaries",
      "lane": "enforced",
      "diagnostics": 0
    },
    {
      "ruleId": "baseline-integrity",
      "status": "pass",
      "locked": true,
      "ownerTool": "habitat-native",
      "lane": "enforced",
      "diagnostics": 0
    }
  ],
  "reportIds": [
    "nx-boundaries",
    "baseline-integrity"
  ]
}
```

## Non-Claims

- This evidence does not close `CLAIM-H3-TAXONOMY`.
- This evidence does not prove every graph edge legal; implementation still must
  run the edge legality audit.
- This evidence does not prove every dual-tag combination; it proves the live
  `kind:mod` plus `kind:control` SDK-negative sentinel.
- This evidence does not prove root/dev/prod command parity or `habitat verify`.

## Implementation Checkpoint Evidence

The following evidence belongs to the current implementation checkpoint on
`agent-HR-habitat-boundary-taxonomy-proof`. It supersedes the design evidence
above for current recovery claims.

| ID | argv | env | exit | bounded output | parsed result | proof class |
| --- | --- | --- | --- | --- | --- | --- |
| BTT-I1 | structured audit through `tools/habitat-harness/src/lib/boundary-taxonomy.ts` | default | 0 | JSON summary: `ok:true`, `issues:0`, `projectCount:23`, `nxProjectCount:22`, `graphEdgeCount:46`; note records repo root as taxonomy guidance, not resolved Nx project | workspace manifests, resolved Nx tags, boundary config constraints, and graph edges agree | taxonomy audit |
| BTT-I2 | `bun run --cwd tools/habitat-harness test -- boundary-taxonomy.test.ts` | default | 0 | 1 file / 6 tests passed | committed verifier coverage for parsing, current audit, dual-tag intersection, forbidden-edge sentinels, config drift, and duplicated ESLint config blocks | unit/integration behavior |
| BTT-I3 | create `packages/config/src/__habitat_boundary_foundation_adapter_probe.ts`; `bun run nx run @internal/habitat-harness:boundaries --outputStyle=static`; remove probe | default | 1 then cleaned | failure names `kind:foundation` constraint for `@civ7/adapter` import | foundation-to-adapter false-negative probe fails and is removed | current-tree probe |
| BTT-I4 | create `mods/mod-civ7-intelligence-bridge/src/__habitat_boundary_control_sdk_probe.ts`; `bun run nx run @internal/habitat-harness:boundaries --outputStyle=static`; remove probe | default | 1 then cleaned | failure names `kind:control` constraint for `@mateicanavra/civ7-sdk` import | dual-tag mod/control-to-SDK false-negative probe fails and is removed | current-tree probe |
| BTT-I5 | `find packages/config/src mods/mod-civ7-intelligence-bridge/src -name '__habitat_boundary_*_probe.ts' -print` | default | 0 | no output | probe files removed with targeted cleanup | hygiene |
| BTT-I6 | `bun run nx run @internal/habitat-harness:boundaries --outputStyle=static` | default | 0 | direct boundary target succeeds; Nx reports matching cached output after live negative probes | command surface is green under normal Nx defaults, but cached success is not the sole enforcement proof | command proof |
| BTT-I7 | `bun run nx run-many -t boundaries --all --outputStyle=static` | default | 0 | aggregate boundary command succeeds; Nx reports matching cached output for the single boundary target | aggregate command no longer shows the historical post-target Nx failure | command reliability |
| BTT-I8 | `bun run habitat:check -- --json --rule nx-boundaries` | default | 0 | CheckReport v1 selects `nx-boundaries` and `baseline-integrity`; `nx-boundaries` locked/pass/diagnostics-empty with ownerTool `nx-boundaries` | Habitat wrapper exposes the boundary owner without selector false-green inflation | Habitat wrapper proof |
| BTT-I9 | `bun run --cwd tools/habitat-harness check` | default | 0 | `tsc -p tsconfig.json --noEmit` passes | verifier implementation typechecks | type behavior |
| BTT-I10 | `bun run habitat -- verify --base HEAD` | default | 1 | full Habitat check fails on unrelated `biome-ci` and `arch-test-map-bundle-runtime-imports` before affected tasks | `habitat verify` remains a non-claim for this packet | non-claim evidence |
| BTT-I11 | `bun run openspec -- validate habitat-boundary-taxonomy-tightening --strict` | default | 0 | active change is valid | active packet record/spec shape is valid | spec validation |
| BTT-I12 | `bun run openspec -- validate habitat-boundary-tags --strict` | default | 0 | touched historical H3 change is valid | historical record realignment preserved OpenSpec shape | spec validation |
| BTT-I13 | `bun run openspec:validate` | default | 0 | 181 passed, 0 failed | aggregate OpenSpec shape remains valid | spec validation |
| BTT-I14 | `git diff --check`; `git ls-files --deleted \| wc -l`; probe/scratch residue scans | default | 0 | no whitespace errors, `0` deleted files, no probe/scratch residue | hygiene is clean before Graphite commit | hygiene |

Current non-claims:

- No `habitat verify` closure.
- No Grit row semantics, file-layer, Biome, hook, baseline, generated-output,
  registered promotion, runtime, or product proof.
- No HG-owned aggregate proof-record mutation.

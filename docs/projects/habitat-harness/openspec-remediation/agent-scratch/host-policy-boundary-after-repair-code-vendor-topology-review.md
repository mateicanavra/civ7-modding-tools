# G-HOST After-Repair Code/Vendor Topology Rereview

## Verdict

Accepted for design/specification from the code/vendor topology lane. No
unresolved P1/P2 findings remain on the current disk state.

This is not source implementation acceptance. The current Habitat source still
contains host-specific facts in `tools/habitat/src/lib/generated-zones.ts`
and `tools/habitat/src/lib/grit-apply.ts`; the repaired packet now treats
those files as current-behavior evidence and keeps source work blocked behind
accepted/live G-HOST projections, concrete D0 rows, and D1 output-family handling.

## Review Scope

- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`
- Branch: `codex/host-policy-boundary-gate-packet`
- Source packet:
  `docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md`
- Current packet:
  `openspec/changes/deep-habitat-host-policy-boundary-gate/**`
- Current code topology:
  `tools/habitat/src/lib/generated-zones.ts`,
  `tools/habitat/src/lib/grit-apply.ts`,
  `tools/habitat/src/plugin.js`,
  `tools/habitat/src/rules/rules.json`,
  `tools/habitat/scripts/verify-generated-zones.mjs`,
  `biome.json`, `.gritignore`, `.gitignore`, and `nx.json`.

## P1 Findings

None.

## P2 Findings

None.

## P3 Findings

None for this lane.

Historical scratch files still mention the earlier stale
`test/lib/generated-zones.test.ts` concern, but the active G-HOST source packet
and OpenSpec validation tasks no longer use that path as active validation.

## Evidence

### Stale Generated-Zone Unit Path

Accepted. The stale `test/lib/generated-zones.test.ts` path is not an active
G-HOST validation gate.

- The source packet proof template now names
  `test/lib/host-policy.test.ts` plus `test/lib/grit-apply.test.ts`, and states
  that the host-policy test is created by the later implementation slice.
- `openspec/changes/deep-habitat-host-policy-boundary-gate/tasks.md` requires
  host declaration parser/validator coverage through `test/lib/host-policy.test.ts`.
- A targeted scan of the active G-HOST packet, packet index, and remediation
  context found no active `generated-zones.test.ts` reference. Remaining hits are
  historical scratch/provenance records.

### `host-policy.ts` Topology

Accepted. `$HABITAT_TOOL/src/lib/host-policy.ts` is coherent with the current
Habitat package topology as the first implementation's internal owner module.

- The file does not exist yet, matching the packet's design/specification-only
  status.
- `tools/habitat/package.json` uses `type: module`, exports only
  `.`/`./plugin`/`./rules`, and `tools/habitat/src/index.ts` does not
  export host policy. That matches the packet requirement that host declarations
  stay internal unless a later packet and D0 rows make them public.
- `tools/habitat/tsconfig.json` includes `src/**/*.ts`, so
  `src/lib/host-policy.ts` is a normal internal TypeScript source location.
- The packet explicitly blocks user-authored config files, repo-authored data
  files, documented declaration locations, and public declaration exports for
  the first implementation source shape.

### `mod/**` Drift Observation

Accepted. The repaired design keeps `mods/mod-swooper-maps/mod/**` as
generated-check drift observation, not a D10 guard/protected/generated fact.

- The declaration matrix marks `mods/mod-swooper-maps/mod/config/**`,
  `mods/mod-swooper-maps/mod/swooper-maps.modinfo`, and
  `mods/mod-swooper-maps/mod/text/en_us/MapText.xml` as drift-observation inputs
  only.
- The same matrix explicitly says these rows are not `HostPolicyDeclaration`
  rows, do not authorize hand edits under `mod/**`, and cannot be consumed by
  D10 until a later accepted row upgrades them.
- Current Nx metadata still wires these paths through
  `@habitat/cli:generated:check`, with `cache: false` and the
  existing `verify-generated-zones.mjs` snapshot/restore drift script. That is
  native generated-drift observation, not D10 mutation authority.

### Native Nx/Biome/Grit/Git Boundaries

Accepted. The packet preserves native tool ownership.

- Nx remains owner of target resolution, dependency metadata, cache flags, and
  target inputs. The inspected `@habitat/cli` project metadata keeps
  `generated:check` in Nx with `cache: false` and explicit dependencies on
  `@swooper/mapgen-core:build` and `@civ7/map-policy:verify`.
- Biome remains owner of formatting/lint configuration. `biome.json` excludes
  `mod/**`, generated map outputs, Civ7 generated types, and map-policy tables;
  the packet allows future mirroring only through Biome-owned config contracts.
- Grit remains owner of pattern execution and ignore behavior. G-HOST may declare
  which host gate uses a Grit pattern, but the packet does not replace Grit
  syntax or native apply execution.
- Git remains owner of staged/current-tree identity. Current file-layer logic
  reads staged paths from `git diff --cached --name-status -z`; G-HOST consumes
  those facts rather than replacing Git status semantics.

### Current Source Topology Is Correctly Treated As Evidence

Accepted. The repaired packet does not pretend current source is already generic.

- `generated-zones.ts` still embeds the three concrete generated surfaces:
  Swooper generated maps, Civ7 generated types, and Civ7 map-policy generated
  tables.
- `rules.json` still points file-layer rules at `generatedZone` ids.
- `grit-apply.ts` still contains current MapGen public-ops validation over
  `@mapgen/domain/**/ops` imports and `mods/mod-swooper-maps/src/domain/**`
  target paths.
- The repaired packet records these as current-state drivers and requires later
  implementation to move them behind `HostSurfaceProjection` and
  `HostApplyGateProjection`.

## Commands Run

- `git status --short --branch` -> dirty worktree as expected from existing
  packet/scratch changes; no source implementation changes by this review.
- `gt status --no-interactive 2>/dev/null || gt status` -> Graphite command
  passed through to git status; branch is
  `codex/host-policy-boundary-gate-packet`.
- `bun run openspec -- validate deep-habitat-host-policy-boundary-gate --strict`
  -> exit 0.
- `bun run openspec:validate` -> exit 0; 249 OpenSpec items passed, 0 failed.
- `git diff --check` -> exit 0.
- `nx show project @habitat/cli --json` -> confirmed native target
  topology for `generated:check`, `biome:*`, `grit:check`, and `boundaries`.
- Targeted `rg`/`nl`/`node` inspections over active G-HOST artifacts, Habitat
  source, native config, and rule metadata.

## Final Status

No unresolved P1/P2 remain for the after-repair code/vendor topology lane.
G-HOST may advance from this lane once the other final rereview lanes and
workstream owner acceptance rules agree on the same disk state.

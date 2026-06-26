# Final Code/Vendor Topology Rereview: G-HOST Host Policy Boundary Gate

Date: 2026-06-18T21:43:20Z

Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`

Branch: `codex/host-policy-boundary-gate-packet`

## Verdict

Accepted for design/specification.

No unresolved P1/P2 findings remain in this code/vendor topology lane. The
current OpenSpec packet matches the observed Habitat code and vendor topology for
the bounded G-HOST design surface. Source implementation remains blocked exactly
as the packet states: concrete D0 rows, D1 output-family handling, and
accepted/live G-HOST projections are still required before D9/D10/D13/D14 source
consumers can claim closure.

## Findings

### P1

None.

### P2

None.

### P3

- Legacy source-packet proof template still names the nonexistent
  `test/lib/generated-zones.test.ts` path:
  `docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md:134`.
  This is not a current design/specification blocker because the repaired
  OpenSpec control artifacts no longer require that path and instead specify
  future focused declaration/projection tests:
  `openspec/changes/deep-habitat-host-policy-boundary-gate/proposal.md:116` and
  `openspec/changes/deep-habitat-host-policy-boundary-gate/tasks.md:47`.
  Cleanup requirement: before using the Phase 2 source packet as an executable
  handoff/proof checklist, replace the stale test-path command with the current
  OpenSpec validation/test matrix.

## Topology Checks

### Write/protected set

The packet's current declaration matrix covers the three file-layer generated
surfaces that are real generic Habitat facts today:

- `tools/habitat/src/lib/generated-zones.ts:17` defines
  `swooper-map-generated`, `civ7-types-generated`, and
  `civ7-map-policy-tables`.
- `tools/habitat/src/rules/rules.json:570`,
  `tools/habitat/src/rules/rules.json:584`, and
  `tools/habitat/src/rules/rules.json:598` are the current
  `file-layer` rules that consume those ids.
- `openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:65`
  declares the same three rows with owners, consumer projections, recovery, and
  non-claims.

The protected-path set is also aligned with current generated/vendor surfaces:
`openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:266` blocks
hand edits to generated map outputs, generated Civ7 type outputs, map-policy
tables, `.civ7/outputs/**`, lockfiles, `dist/**`, and `mod/**`.

### Declaration matrix and mod drift

The `mod/**` rows are correctly classified as drift-observation input, not D10
guard/protected/generated declarations:

- `tools/habitat/scripts/verify-generated-zones.mjs:7` snapshots
  `mods/mod-swooper-maps/src/maps/generated`, `mod/config`,
  `mod/swooper-maps.modinfo`, and `mod/text/en_us/MapText.xml`.
- `tools/habitat/scripts/verify-generated-zones.mjs:24` runs the map
  artifact generator and restores snapshots at
  `tools/habitat/scripts/verify-generated-zones.mjs:32`.
- `tools/habitat/src/plugin.js:130` exposes that verifier as the Nx
  `generated:check` target, with `mod/**` inputs at
  `tools/habitat/src/plugin.js:145`.
- The packet explicitly refuses to promote those `mod/**` paths into D10 facts
  without a later accepted declaration row:
  `openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:70` and
  `openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:76`.

That matches the current classifier evidence: a representative generated map
path matches `file-layer-swooper-map-generated`; a representative `mod/**` path
is project-owned drift/build artifact scope, not an exact D10/file-layer
generated-zone declaration.

### Native tool boundaries

The packet correctly separates G-HOST from native tool ownership:

- Nx owns target inference, dependencies, cache flags, and inputs:
  `tools/habitat/src/plugin.js:130`.
- Grit owns scan-root validation and pattern execution:
  `tools/habitat/src/lib/grit.ts:82`,
  `tools/habitat/src/lib/grit.ts:682`.
- Grit apply currently discovers source roots from `mods/*/src/{recipes,maps}`:
  `tools/habitat/src/lib/grit-apply.ts:1122`.
- The MapGen public-ops validation is real host-specific logic in generic
  transaction code today:
  `tools/habitat/src/lib/grit-apply.ts:866` and
  `tools/habitat/src/lib/grit-apply.ts:908`.
- G-HOST records those as host declarations/projections, not native-tool
  replacement semantics:
  `openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:81`.

### Consumer projections

The repaired D9/D10/D13/D14 projection split matches both current code and
downstream packet status:

- D10 consumes `HostSurfaceProjection` and must not author host owners/path lists:
  `openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:157`.
- D9 consumes `HostApplyGateProjection` for MapGen public-ops validation:
  `openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:173`.
- D13 consumes `HostProjectSupportProjection` for host-owned supported/refused
  creation requests:
  `openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:189`.
- D14 consumes only the authoring-boundary relation/non-claim projection:
  `openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:205`.

The current generator topology supports the D13 projection need. The schema
admits unsupported names such as `mod`, `engine`, `control`, `adapter`, `sdk`,
and `tooling` (`tools/habitat/src/generators/project/schema.json:18`),
while runtime refuses anything outside `plugin`, `foundation`, and `app`
(`tools/habitat/src/generators/project/generator.cjs:51`). The G-HOST
matrix correctly keeps host-owned support/refusal facts behind a declaration
instead of letting schema enum values become authority:
`openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:74`.

## Validation Run

- `bun run openspec -- validate deep-habitat-host-policy-boundary-gate --strict`
  passed.
- `bun run openspec:validate` passed: 249 passed, 0 failed.
- `bun run habitat classify mods/mod-swooper-maps/src/maps/generated/swooper-earthlike.ts`
  passed and showed the exact `file-layer-swooper-map-generated` scope.
- `bun run habitat classify mods/mod-swooper-maps/mod/text/en_us/MapText.xml`
  passed and showed `mod/**` as project/build-artifact scope, not an exact
  generated-zone declaration.
- `bun run habitat classify packages/civ7-map-policy/src/civ7-tables.gen.ts`
  passed and showed the exact `file-layer-civ7-map-policy-tables` scope.

Non-claims: these checks do not prove generated outputs are current, MapGen
runtime behavior works, apply transactions are safe, or source implementation is
authorized.

Skills used: domain-design, information-design, solution-design, system-design,
testing-design, civ7-open-spec-workstream, typescript-refactoring.

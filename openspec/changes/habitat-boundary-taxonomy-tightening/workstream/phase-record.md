# Phase Record

## Phase

- Project: Habitat Harness
- Phase: boundary taxonomy tightening / `habitat-boundary-taxonomy-tightening`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack: `agent-HR-habitat-boundary-taxonomy-proof`, inserted
  above `agent-HR-habitat-hook-hardening-closure` and below the HG pattern
  chain.
- Started: 2026-06-14
- Status: taxonomy verify-proof checkpoint implemented locally; supervisor
  acceptance pending.

## Objective

- Target movement: make project-plane taxonomy a current, graph-proven,
  command-truthful authority for classify, generator, and Grit pattern design.
- Exterior: product/runtime behavior, intra-project Grit/file-layer/test
  semantics, Biome policy, Nx Enterprise Conformance/Owners, generated output.
- Done condition: reviewed OpenSpec packet, accepted proof matrix,
  current-state stale-record realignment, validation, Graphite commit, clean
  worktree.

## Authority

- Root router and workflow: `AGENTS.md`, `docs/process/GRAPHITE.md`.
- Product frame: `docs/projects/habitat-harness/dra-takeover-frame.md`.
- Original Habitat frame: `docs/projects/habitat-harness/FRAME.md`.
- Stage 0 ledger:
  `docs/projects/habitat-harness/recovery-claim-ledger.md`.
- Taxonomy: `docs/projects/habitat-harness/taxonomy.md`.
- H3 historical source: `openspec/changes/habitat-boundary-tags/**`.
- Official Nx evidence:
  `docs/projects/habitat-harness/research/official-docs-nx.md` and current
  Nx official docs cited in `proposal.md`.

## Current State

- Repo state at implementation: clean HR worktree before taxonomy edits, then
  scoped edits on `agent-HR-habitat-boundary-taxonomy-proof`.
- Current packet follows the Nx workflow settlement: repo-local pinned `nx`,
  normal Nx defaults, no daemon/cache/socket/link workaround policy.
- `CLAIM-H3-TAXONOMY` is repaired for the current project-plane proof boundary
  and remains non-claim for runtime, Grit, file-layer, Biome, baseline, hook,
  and product behavior.
- Structured taxonomy audit reads workspace manifests, package/project tags,
  resolved Nx project metadata, boundary config constraints, and resolved graph
  edges. Current audit result: 23 taxonomy rows, 22 resolved Nx project-plane
  nodes, 46 graph edges, zero issues, and one note that the repo root is
  workspace orchestration guidance rather than a resolved Nx project.
- Current graph evidence exposed a real `mod-swooper-maps ->
  @civ7/plugin-mods` edge through package workflow support. The repair adds
  `kind:plugin` to the documented and enforced `kind:mod` allowed set rather
  than weakening source semantics.
- Historical direct/run-many/no-daemon/cache-flag proof remains diagnostic
  context only. Current accepted command proof uses normal repo-local Nx
  invocations, Habitat `nx-boundaries` JSON proof, and live false-negative
  probes. Cached Nx success is recorded as command-surface behavior, not as
  the sole enforcement proof.
- `bun run habitat -- verify --base HEAD --json` now exits 0 for the explicit
  clean `HEAD` range after the H4 Biome and H6 generated-output blockers were
  repaired in their owner packets. This proof records taxonomy participation in
  the full structural surface; it does not claim CI execution, broad
  changed-range affected coverage, or non-taxonomy proof classes.

## Source Synthesis

See `workstream/source-synthesis.md`.

Core synthesis:

- H3's original taxonomy direction remains structurally useful but historical
  adoption proof was not enough for current recovery closure.
- Current proof must use resolved Nx state, not only historical records.
- Command reliability is part of the claim because a target can succeed inside
  a failing Nx command.
- Normal Nx defaults are the accepted steady-state proof surface.
- Downstream classify/Grit packets need exact taxonomy proof boundaries.

## Scope

- Write set used: taxonomy doc, ESLint boundary config, focused Habitat
  verifier library/test, active packet records, recovery ledger, H3 historical
  records, and relevant Habitat workstream record truth.
- Protected paths: generated outputs, resources, product/runtime source except
  created-and-reverted probes, Grit patterns, Biome config, broad command-surface
  refactors.
- Owner: project-plane boundary taxonomy and proof records.
- Forbidden owners: product/runtime behavior, Grit semantics, Biome semantics,
  generated-output repairs, Enterprise-gated Nx adoption.

## Review

- Required lanes were completed in packet design and dispositioned in
  `workstream/review-disposition-ledger.md`.
- Blocking findings: no unresolved accepted P1/P2 remains.
- Active coordination guardrail: HG owns active row files in
  `tools/habitat-harness/src/rules/rules.json` and
  `openspec/changes/habitat-grit-proof-repair/workstream/injected-probes.json`;
  this taxonomy checkpoint does not touch those files.

## Agent Fleet State

- Active agents: none.
- No sidecar output is consumed as proof.

## Implementation

- Completed design tasks: 1.1-2.6, 8.1-8.3, 8.14, and 9.1-9.3.
- Completed implementation tasks: structured taxonomy verifier/test,
  taxonomy/config parity repair, false-negative live probes, direct Nx and
  Habitat wrapper proof, normal aggregate command proof, stale-record
  realignment, and owner-layer proof boundary.
- Remaining tasks: supervisor review/acceptance of the taxonomy verify-proof
  checkpoint.
- The prior `habitat verify` blocker is repaired by downstream H4/H6 owner
  packets and consumed here as explicit clean-range proof.

## Verification

Commands and inspections run for current implementation proof:

- `git status --short --branch`
- structured audit over taxonomy/manifests/Nx metadata/config/graph:
  `ok:true`, `issues:0`, `projectCount:23`, `nxProjectCount:22`,
  `graphEdgeCount:46`
- `bun run --cwd tools/habitat-harness test -- boundary-taxonomy.test.ts`
- created `packages/config/src/__habitat_boundary_foundation_adapter_probe.ts`;
  `bun run nx run @internal/habitat-harness:boundaries --outputStyle=static`
  failed on the `kind:foundation` constraint; removed the probe.
- created
  `mods/mod-civ7-intelligence-bridge/src/__habitat_boundary_control_sdk_probe.ts`;
  the same boundary target failed on the `kind:control` constraint; removed
  the probe.
- `find packages/config/src mods/mod-civ7-intelligence-bridge/src -name '__habitat_boundary_*_probe.ts' -print`
  returned no probe residue.
- `bun run nx run @internal/habitat-harness:boundaries --outputStyle=static`
  exited 0 under normal Nx defaults; Nx served matching cached output after
  the live negative probes.
- `bun run nx run-many -t boundaries --all --outputStyle=static` exited 0
  under normal Nx defaults; Nx served matching cached output for the single
  boundary target.
- `bun run habitat:check -- --json --rule nx-boundaries` exited 0 and selected
  `nx-boundaries` plus `baseline-integrity`; `nx-boundaries` was ownerTool
  `nx-boundaries`, lane `enforced`, locked, pass, diagnostics empty, and used
  the direct ESLint detect argv.
- `bun run --cwd tools/habitat-harness check`
- `bun run habitat -- verify --base HEAD --json` exited 0: Habitat check
  selected 42 rules including `nx-boundaries` and `baseline-integrity`, had
  zero failing rules and one advisory, Nx affected executed for the explicit
  clean `HEAD` range and ran no tasks, and post-state was clean.
- `bun run openspec -- validate habitat-boundary-taxonomy-tightening --strict`
- `bun run openspec -- validate habitat-boundary-tags --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git ls-files --deleted | wc -l`
- scratch/probe residue scans

Validation results:

- Focused taxonomy unit/integration test: PASS, 6 tests.
- Harness typecheck: PASS.
- Direct false-negative probes: PASS, expected failures then targeted cleanup.
- Habitat wrapper proof: PASS for selected `nx-boundaries`.
- Explicit clean-range Habitat verify proof: PASS.
- Strict OpenSpec validation: PASS for active packet and touched H3 packet.
- Aggregate OpenSpec validation: PASS.
- Diff/deleted-file/residue hygiene: PASS.

Evidence boundary:

- Proves project-plane taxonomy/config/tag/graph parity, selected
  false-negative behavior, Habitat wrapper `nx-boundaries` selection, and
  explicit clean-range `habitat verify` participation after unrelated full-check
  blockers were repaired by their owners.
- Does not prove CI execution, broad changed-range affected coverage, Grit,
  file-layer, Biome, runtime, generated-output, hook, baseline, registered
  promotion, or product behavior.
- Daemon disabling, cache disabling, socket overrides, symlink repair, and
  routine cache reset remain excluded from accepted steady-state proof policy.

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.
- Stage 0 `CLAIM-H3-TAXONOMY` now records the current proof boundary.
- Historical H3 records are patched to remain adoption history, not a substitute
  for the current recovery proof matrix.

## Next Action

- Hold for supervisor acceptance or repair of the taxonomy verify-proof
  checkpoint before opening another HR slice.

# Source Synthesis

**Change:** `habitat-boundary-taxonomy-tightening`
**Owner:** DRA Habitat recovery owner

## Frame Carry-Forward

The takeover frame requires current executable behavior to outrank stale
closure prose. `CLAIM-H3-TAXONOMY` remains unknown because the prior H3 closure
has not been re-proven against current graph evidence and command behavior.

The product movement is architecture authority trust: agents cannot safely
classify, generate, or cite Grit normative sources from taxonomy unless the
taxonomy has current proof.

## Current Evidence Captured

- Worktree clean on `codex/habitat-dra-takeover-frame`.
- `bun run openspec -- list` shows `habitat-boundary-tags` complete and this
  repair row still unopened before this packet.
- Package manifest audit found 22 workspace projects with expected `kind:*`
  tags.
- `bun run nx show project @internal/habitat-harness --json` reports
  `kind:tooling`.
- `bun run nx show project mod-civ7-intelligence-bridge --json` reports
  `kind:mod` and `kind:control`.
- `bun run nx graph --file /tmp/habitat-boundary-graph.json` produced a graph
  with 44 workspace dependency edges.
- `bun run nx run @internal/habitat-harness:boundaries --skipNxCache` exits 0.
- One fresh default
  `bun run nx run-many -t boundaries --all --skipNxCache` ran the target
  successfully but exited 1 with an Nx SQLite foreign-key transaction failure.
- `NX_DAEMON=false bun run nx run-many -t boundaries --all --skipNxCache`
  exits 0.
- `bun run habitat:check -- --json --rule nx-boundaries` exits 0 and reports
  `nx-boundaries` locked pass plus `baseline-integrity` in `rules[]`.
- Created-and-reverted probe
  `mods/mod-civ7-intelligence-bridge/src/habitat-boundary-dual-tag-probe.ts`
  importing `@mateicanavra/civ7-sdk` failed through the `kind:control`
  constraint and was removed. A clean boundary rerun passed.
- Durable command evidence is recorded in `workstream/evidence-log.md`.

## Official Documentation Evidence

- Nx official module-boundary docs state that project tags and dependency
  constraints are the boundary mechanism.
- Nx official project-configuration docs show tags can be declared in
  `package.json`.
- Nx official ESLint rule docs state `@nx/enforce-module-boundaries` is the
  JavaScript/TypeScript import and package dependency enforcement path.
- Nx official docs distinguish Enterprise-gated Conformance from the open
  ESLint path; this repair does not adopt Conformance.
- Nx official multiple-dimension tag docs show `sourceTag` and `allSourceTags`
  patterns, so the local dual-tag intersection contract must be proven against
  current installed behavior.

## Diagnosis

Historical H3 likely implemented the correct core shape: tags exist, the
boundary config is single-rule, and direct boundary target proof currently
passes. The remaining risk is proof drift:

1. `CLAIM-H3-TAXONOMY` has not been promoted from unknown to a reviewed
   evidence state.
2. Historical records can overclaim command paths that now show daemon/cache
   sensitivity.
3. Dual-tag semantics are load-bearing and must stay as an executable probe.
4. Downstream classify and Grit packets depend on taxonomy proof but do not own
   taxonomy repair.

## Design Implications

- This packet should not weaken taxonomy or redesign project kinds.
- Implementation must prove current state through resolved Nx graph and command
  behavior.
- Whole-command exit status is part of proof.
- A dedicated verifier script is allowed only if it preserves owner boundaries
  and produces deterministic proof.
- Effect is relevant only if Habitat command orchestration around Nx becomes a
  typed command/provenance/daemon-error problem. It does not own taxonomy
  semantics.

## Uncertainties

- Whether the daemon SQLite transaction failure is transient local state,
  pinned Nx behavior, or a command configuration issue.
- Whether a structured taxonomy verifier is worth adding now or whether exact
  proof commands and probe tests are sufficient for implementation.
- Whether any downstream records outside the known H3/H8/Grit packets cite H3
  in a way that will require patching after implementation proof.

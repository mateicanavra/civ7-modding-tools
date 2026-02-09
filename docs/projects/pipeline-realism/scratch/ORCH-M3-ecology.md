# ORCH: M3 Ecology Physics-First Feature Scoring + Planning (Pipeline-Realism)

Status: ACTIVE (orchestrator scratch plan; keep concise; update at phase boundaries)
Last updated: 2026-02-09
Owner: agent-codex
Branch/worktree: `agent-codex-m3-ecology-physics-first-plan` / `wt-agent-codex-m3-ecology-physics-first-plan`

## North Star (Human Vision)

- Earth-system-first stage splits (pedology, biomes, vegetation, wetlands, reefs, ice).
- Architecture semantics are sacred: stages compile configs; steps orchestrate; ops compute; strategies encode variants; rules encode policy inputs.
- Physics truth first; later projection is the modding layer.
- No legacy shims/dual paths. Break surfaces, build new ones, polish them.
- No output fudging: no chance percentages, multipliers, probabilistic gating. Deterministic selection + seeded tie-breaks only.

## Outputs We Must Produce (docs are the product for this branch)

1. Packet: `docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/`
2. Milestone: `docs/projects/pipeline-realism/milestones/M3-ecology-physics-first-feature-planning.md`
3. Local issue docs: `docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M3-*.md`
4. Prework sweep complete: zero remaining `## Prework Prompt (Agent Brief)` in the M3 issue scope.

Current status:
- Packet: DONE (decision-complete; topology/contracts aligned)
- Milestone: DONE (derived from packet; "M3 remediates M2" framing explicit)
- Issues: DONE (M3-001..009; no prework prompts)
- Phase runbooks: DONE (phase 0..8 runbooks under packet)

## Phase Checklist (stop at gates)

### Phase 0: Context + anchor
- [ ] Confirm M2 is existing architecture-alignment plan: `docs/projects/pipeline-realism/milestones/M2-ecology-architecture-alignment.md`
- [ ] Treat engine-refactor-v1 as evidence only.
- [ ] Packet becomes execution authority.

### Phase 1: Vision capture
- [ ] Write `PACKET.../VISION.md` first.
- [ ] Ensure every agent reads it first.

### Phase 2/3: Decision-complete architecture + contracts
- [ ] Stage list + step list is explicit.
- [ ] `artifact:ecology.scoreLayers` schema is explicit.
- [ ] Per-feature score layer inventory is explicit.
- [ ] Planning order + conflict model is explicit.
- [ ] “Must not exist” list is explicit.

### Phase 4-7: Workflows
- [ ] Spec -> milestone (`dev-spec-to-milestone` posture)
- [ ] Harden milestone (`dev-harden-milestone` posture)
- [ ] Milestone -> issues (`dev-milestone-to-issues` posture)
- [ ] Prework sweep (`dev-prework-sweep` posture)

Note: for M3 docs, we executed the posture manually and captured it in packet runbooks:
- `docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/RUNBOOKS/PHASE-4-spec-to-milestone.md`
- `docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/RUNBOOKS/PHASE-5-harden-milestone.md`
- `docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/RUNBOOKS/PHASE-6-milestone-to-issues.md`
- `docs/projects/pipeline-realism/resources/packets/PACKET-M3-ecology-physics-first/RUNBOOKS/PHASE-7-prework-sweep.md`

## Non-Negotiable Gates

- Determinism and no-fudging posture is encoded as:
  - static scan gates (patterns + allowlists)
  - runtime invariants (diagnostic dumps/diffs + tests)
- No silent skips / no shouldRun.
- Steps do not import op impls or rules.

## Tooling Notes (Do Not Forget)

- Prefer `$narsil-mcp` for semantic code discovery and impact analysis.
  - Do **not** use `hybrid_search` (currently crashes the server in this environment).
  - Native tools (`rg`, `git`, file reads) are still preferred for bulk/fast scans.
- MCP freshness depends on the primary checkout:
  - Keep `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools` checked out on the latest changes (can be detached HEAD).
  - Work happens in worktrees; the primary checkout is for keeping the index current.

## Agent Team (peers; each keeps scratch)

- ARCH: stage topology + truth/projection invariants + recipe wiring
- SCORE: feature inventory + scoreLayers schema + scoring ops/rules catalog
- PLAN: planners + occupancy/conflict model + deterministic tie-break policy
- VIZ: viz keys + deck.gl identity + inventory gates
- GATES: tests/guardrails + static scan gates

Scratch files (untracked; clear per phase):
- `docs/projects/pipeline-realism/scratch/agent-ARCH-M3.scratch.md`
- `docs/projects/pipeline-realism/scratch/agent-SCORE-M3.scratch.md`
- `docs/projects/pipeline-realism/scratch/agent-PLAN-M3.scratch.md`
- `docs/projects/pipeline-realism/scratch/agent-VIZ-M3.scratch.md`
- `docs/projects/pipeline-realism/scratch/agent-GATES-M3.scratch.md`

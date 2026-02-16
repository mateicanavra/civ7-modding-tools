# Orchestrator Takeover Context Packet — M4 Foundation Domain Axe (Personal Scratch)

This is **my** operator scratch packet for taking over orchestration going forward. It is **not** a replacement for the milestone doc or issue pack; it’s the “what do I do next, with what rules” packet.

## Snapshot (ground truth)

```yaml
timestamp_local: 2026-02-15
repo_root: /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools
active_worktree: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack
active_branch: codex/prr-m4-s06d-foundation-scratch-audit-ledger
stack_tip_pr:
  graphite_pr: https://app.graphite.com/github/pr/mateicanavra/civ7-modding-tools/1332
  note: "Last submitted version v1; local commits exist (needs submit)"
local_state:
  working_tree: clean
  local_ahead_of_origin_commits: 3
local_stashes_created_for_hygiene:
  - repo: /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools
    stash_message: "WIP local: swooper-earthlike.config.json (pre-orchestrator takeover cleanup)"
  - repo: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack
    stash_message: "WIP local: earthlike.json (pre-orchestrator takeover cleanup)"
session_source:
  session_id: 019c5e12-6f1c-73a3-b6d5-212716ffb808
  transcript_path: /Users/mateicanavra/.codex-rawr/sessions/2026/02/14/rollout-2026-02-14T16-33-12-019c5e12-6f1c-73a3-b6d5-212716ffb808.jsonl
```

## What we are doing (architecture-first)

**Milestone canonical source:**
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-integration-restack/docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md`

Mission summary:
- Execute the Foundation “domain axe” cutover: **clean boundaries** (stage/step/op/strategy/rules), **locked 3-stage topology**, and a **phased lane split** to `artifact:map.*` with **no final dual paths**.

This milestone is intentionally willing to **break contracts** if required to prevent fossilizing bad boundaries.

## Carry-forward directives extracted from your early session messages (load-bearing only)

### Repo + workflow hygiene (non-negotiable)
- Never leave worktrees dirty (unless explicitly asked).
- Always ground: current worktree path, current branch, stack position, uncommitted/unpushed state.
- Use Graphite (stacked PRs) as the default workflow; keep changes as small reviewable layers.
- If work becomes a “blob”, stop and **slice it** into clean layers; do not proceed while blind to scope.

### Architecture posture (non-negotiable)
- Steps orchestrate; **ops do not orchestrate peer ops**.
- Strategies/rules are **op-internal**; strategy selection is via config envelope, not imports.
- “Truth vs projection” must remain explicit; no drift-by-duplication and no backfeeding.
- No legacy, no shims, no weird dual paths in final state.

### Agent orchestration posture (non-negotiable)
- Agents are peers: give context + ownership + autonomy.
- Every agent writes **append-only** scratch notes with **concrete evidence paths**.
- Respect the thread cap: **max six agents**.
- Don’t rush agents; use idle time for synthesis/cleanup/integration.
- For path-heavy docs, embed **YAML blocks inside Markdown** (avoid “dumpster fires” of absolute paths).

## Canonical architecture anchors (I enforce these)

```yaml
required_docs:
  - /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
  - /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md
  - /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md
  - /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/system/libs/mapgen/reference/domains/FOUNDATION.md
core_invariants:
  - steps_call_ops_ops_do_not_call_peer_ops: true
  - strategies_rules_are_op_internal_only: true
  - compile_is_not_runtime_normalization: true
  - truth_vs_projection_lane_is_enforced: true
  - single_path_no_shims_no_dual_publish: true
```

## Current execution state (what’s real today)

### Stack (branch order)

```yaml
stack_tip_to_trunk:
  - codex/agent-E-placement-discoveries-wonders-fix
  - codex/agent-D-placement-discovery-owned-catalog
  - codex/agent-C-baseline-check-test-fixes
  - codex/agent-B-placement-s2-verification-docs
  - codex/agent-A-placement-s1-runtime-hardening
  - codex/prr-m4-s06e-earthlike-studio-typegen-fix
  - codex/prr-m4-s06d-foundation-scratch-audit-ledger
  - codex/spike-ecology-placement-regression
  - codex/prr-m4-s06c-foundation-guardrails-hardening
  - codex/prr-m4-s06b-foundation-tectonics-local-rules
  - codex/prr-m4-s06a-foundation-knobs-surface
  - codex/prr-m4-s06-test-rewrite-architecture-scans
  - codex/prr-m4-s05-ci-strict-core-gates
  - codex/prr-m4-s03-tectonics-op-decomposition
  - codex/prr-m4-s02-contract-freeze-dead-knobs
  - codex/agent-ORCH-foundation-domain-axe-execution
  - codex/agent-ORCH-foundation-domain-axe-spike
  - main
```

### Milestone/issue pack decision-completeness spot-check
- M4 milestone and issue docs under `docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-003..006` are structurally decision-complete (deliverables, gates, and verification are explicit).
- The biggest “practical drift” I see is operational: some checkpoint docs refer to scripts that do not currently exist in this repo (see next section).

## Drift / underspec / missing tooling (must not be ignored)

### IG-1 scripts referenced but missing in-repo
Resolved: IG-1 docs now use a concrete command checklist (Graphite + `bun run ...`) instead of referencing repo-local scripts, and IG-1 is marked complete. Any future “integration checkpoint” work must follow the same posture: no hidden scripts; evidence captured in scratch artifacts.

### Local-only commits on the stack tip
The active branch is ahead of `origin/...` by 3 commits. This means:
- reviewers won’t see the latest state until submit/push occurs,
- and “what exists” differs between local and remote.

## Orchestrator workflow I will run (max 6 agents)

### Roles
```yaml
agent_roles_default:
  orchestrator:
    owns:
      - architecture invariants enforcement
      - slice boundaries + sequencing
      - conflict resolution + integration
      - final handoff packet + scratch coherence
  worker_integration_ig1:
    owns:
      - make IG-1 executable (resolve missing-script problem)
      - ecology merge readiness and evidence packet
  worker_stage_topology_s04:
    owns:
      - stage/step ID churn plan + compile-surface single-path cleanup
      - viz/tracing semantic identity safeguards
  worker_lane_split_s07:
    owns:
      - artifact namespace cutover inventory + no-dual-publish enforcement
  worker_guardrails_tests:
    owns:
      - ensure guardrails cover new topology + lane split and stay strict
  worker_config_docs_parity:
    owns:
      - earthlike intent checks (ELIKE-01..04)
      - preset/schema parity + docs/comments sweep readiness
```

### Worker contract (per assignment)
```yaml
worker_contract:
  required:
    - docs_first_attestation_block
    - absolute_paths_only
    - append_only_scratch_updates
    - every_non_obvious_claim_has_evidence_paths
    - explicit_owned_files_and_out_of_scope
    - verification_commands_and_expected_pass_meaning
  forbidden:
    - leaving_worktree_dirty_at_handoff
    - introducing_shims_or_dual_paths_as_final_state
    - unanchored_contract_changes_without_consumer_updates
```

## Phase map of the session (so I don’t repeat history)

```yaml
session_phase_map:
  - phase: 1
    name: initial_problem_identification
    signal: "compute-tectonic-history mega-op and foundation boundary violations"
  - phase: 2
    name: research_spike_orchestration
    signal: "dev-spike, A-F axis ownership scratchpads, integrated spike doc"
  - phase: 3
    name: execution_pack_creation
    signal: "milestone + issue docs hardened; slice mapping and gates established"
  - phase: 4
    name: anchoring_red_team_pass
    signal: "AR1/AR2/RP1; triage; mandatory pre-IG1 fixes; successor handoff rewrite"
  - phase: 5
    name: post_merge_restack_integration_hygiene
    signal: "dedicated restack agent; integration worktree rename; restack evidence logged"
  - phase: 6
    name: post_ig1_forward_execution
    signal: "IG-1 complete; proceed with lane split (S07) + config/preset/docs parity (S08/S09)"
```

## Immediate next actions (orchestrator)

1. Keep operating off the true stack tip (`gt log short`) and avoid topology drift.
2. Treat lane split (M4-004 / S07) as the next major execution slice; prepare an inventory + verification suite before cutting code.
3. Enforce Studio/typegen and architecture cutover scans as always-on gates (`build:studio-recipes`, `test:architecture-cutover`).

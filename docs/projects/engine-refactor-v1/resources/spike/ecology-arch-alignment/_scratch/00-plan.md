# Spike Plan (Agreed)

## Metadata

- **Base branch:** `agent-GOBI-PRR-s102-plan-fix-blobular-continents-restore-mountains-post-s101-docs`
- **Spike branch:** `agent-ORCH-spike-ecology-arch-alignment`
- **Worktree root:** `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-ORCH-spike-ecology-arch-alignment`
- **Repo:** `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools`

## Agent Roster (Axes + Outputs)

All agents work in the same worktree. Each agent writes findings to their own scratch pad:

1. **Contracts** → `_scratch/agent-contracts.md`
2. **Domain refactor targeting (ops/rules/strategies)** → `_scratch/agent-domain.md`
3. **Stages & steps** → `_scratch/agent-stages-steps.md`
4. **Integration (upstream/downstream consumers)** → `_scratch/agent-integration.md`
5. **Drift analysis (target vs current)** → `_scratch/agent-drift.md`
6. **Ideal target shape (greenfield-ish refactor target)** → `_scratch/agent-target-shape.md`
7. **Deck.gl / Viz compatibility surface** → `_scratch/agent-deckgl.md`
8. **Hardening (no-behavior-change invariants + parity harness)** → `_scratch/agent-hardening.md`

## Full Plan

PLEASE IMPLEMENT THIS PLAN:
# Dev Spike Plan: Ecology Domain Architecture Alignment (No Behavior Change)

## Summary
We will run a **research-only** spike to understand:
- the **current** Ecology domain (ops, rules/strategies, stages/steps, artifacts/tags, viz),
- the **target architecture** (domains/ops vs steps vs stages, truth vs projection, contracts),
- the **drift** between them,
- and the **conceptual shape** of a behavior-preserving refactor (modularization + reshaping, not algorithm changes).

**Deliverables (end of spike):** a small directory of **integrated, final spike docs** plus separate **scratch pads** (for agent collaboration), all in one shared worktree/branch.

**Non-goals:** implementing the refactor; tuning algorithms; changing behavior; landing production code changes.

## Grounded Facts (From Repo Inspection)
- Repo uses **Graphite** (`gt` is installed; stacked branches are in use).
- Target-architecture docs and “ops/steps/stages” specs are already present and should be treated as canonical anchors:
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/system/libs/mapgen/reference/domains/ECOLOGY.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
- Ecology “domain + recipe” reality to investigate is centered in:
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/domain/ecology/**`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/recipes/standard/stages/ecology/**`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/**`
- Deck.gl visualization posture is documented (and is a hard compatibility surface for refactors that touch `dataTypeKey`s):
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
- Narsil MCP repo id for code intelligence queries:
  - `civ7-modding-tools#25fd7575`

## Spike Workflow (What We’ll Do, In Order)

### Phase 0: Setup (Isolated Shared Worktree, Single Branch)
We follow the repo’s **git-worktrees** invariant: worktree/branch names include an `agent-<id>-` prefix.

1. **Primary-worktree hygiene (no mutation)**
   ```bash
   cd /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools
   git status
   gt ls
   git branch --show-current
   ```
   - If `git status` is not clean, stop and do not proceed (no stashing/resetting).

2. **Base branch selection**
   - Default: use the **current branch** (captures the latest in-flight architecture changes in the stack).
   - Record the base branch name in scratch (below) so the spike is reproducible.

3. **Create the shared spike worktree**
   - Agent id: `ORCH`
   - Branch name: `agent-ORCH-spike-ecology-arch-alignment`
   - Worktree dir:
     - `WORKTREES_ROOT="/Users/mateicanavra/Documents/.nosync/DEV/worktrees"`
     - `"$WORKTREES_ROOT/wt-agent-ORCH-spike-ecology-arch-alignment"`
   ```bash
   cd /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools
   git fetch --all --prune
   WORKTREES_ROOT="/Users/mateicanavra/Documents/.nosync/DEV/worktrees"
   git worktree add -b agent-ORCH-spike-ecology-arch-alignment \
     "$WORKTREES_ROOT/wt-agent-ORCH-spike-ecology-arch-alignment" \
     <BASE_BRANCH>
   cd "$WORKTREES_ROOT/wt-agent-ORCH-spike-ecology-arch-alignment"
   ```

4. **Sanity-check (must match worktree expectations)**
   ```bash
   pwd -P
   git rev-parse --show-toplevel
   git branch --show-current
   git log -1 --oneline
   ```

5. **Mandatory first step (before any other research actions)**
   - Create the spike directory + scratch area, then **write this agreed plan into a scratch document**.
   - Location (chosen to match existing project conventions in `engine-refactor-v1/resources/spike/`):
     - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/`
   - First scratch doc:
     - `.../ecology-arch-alignment/_scratch/00-plan.md`
   - The contents of `00-plan.md` must include:
     - base branch name
     - spike branch/worktree path
     - agent roster + responsibilities
     - the full plan (this document)

6. **Install dependencies (only after the plan is recorded)**
   ```bash
   cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-ORCH-spike-ecology-arch-alignment
   bun install
   ```
   - If `bun install` changes lockfiles, stop and decide explicitly whether the spike should include that change (default: do not).

### Phase 1: Orient (Seed The Mental Map)
Goal: build the initial **mental map** and identify the high-leverage threads.

1. Seed map from existing routers and canonical docs:
   - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/AGENTS.md`
   - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/packages/mapgen-core/AGENTS.md`
   - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/packages/mapgen-viz/AGENTS.md`
   - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
   - `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/system/libs/mapgen/reference/domains/ECOLOGY.md`

2. Create and start updating:
   - `.../ecology-arch-alignment/_scratch/01-mental-map.md`
   - Format:
     - “Explored / Partial / Untouched” sections
     - Breadcrumb lines: `BREADCRUMB: <path> -> <finding> -> <why it matters>`

3. Identify 2–3 initial “threads to pull” (expected):
   - Step ↔ op binding correctness (no direct op imports bypassing contracts).
   - Feature planning/apply modeling (ops vs steps orchestration boundaries).
   - Ecology truth vs projection boundary (ecology vs map-ecology) and tag/effect posture.
   - Deck.gl/viz compatibility surface for ecology (`dataTypeKey`, `spaceId`, render kinds).

### Phase 2: Parallel Investigation (Multi-Agent, Same Worktree)
We spawn multiple peer agents as teammates. All agents:
- operate in the **same** spike worktree path,
- write findings into dedicated scratch pads,
- keep claims grounded with file pointers (and short excerpts when helpful),
- avoid implementation (no production refactors).

**Orchestrator responsibilities**
- Create scratch pad files before spawning agents:
  - `.../ecology-arch-alignment/_scratch/agent-<axis>.md`
- Provide each agent:
  - objective
  - “definition of done” (what they must write)
  - required pointers and specific files to start from
  - a shortlist of Narsil queries to run
- Run lightweight sync points:
  - T+45 min: first-pass findings
  - T+90 min: second-pass deepening (only for high-uncertainty areas)

**Agent roster (explicit axes)**
1. **Agent: Contracts**
   - Scratch: `_scratch/agent-contracts.md`
   - Output:
     - ecology artifacts inventory (truth + projection)
     - step contracts inventory (ids, phases, artifacts requires/provides, tags/effects)
     - op contracts inventory (ids, kinds, input/output, strategy sets)
     - “contract breaks” list (e.g., steps calling ops not declared in `ops` contract)

2. **Agent: Domain Refactor Targeting (Ops/Rules/Strategies)**
   - Scratch: `_scratch/agent-domain.md`
   - Output:
     - op module inventory and whether each matches the “operation module” spec shape
     - rule/strategy correctness checks (rules not exported; steps don’t import rules/strategies)
     - identify “mega-ops” vs “good split ops” relative to the key principle

3. **Agent: Stages & Steps**
   - Scratch: `_scratch/agent-stages-steps.md`
   - Output:
     - stage compile mapping for `ecology` and `map-ecology`
     - step normalize posture (compile-time only, shape-preserving)
     - where orchestration currently lives (and whether it is correctly step-owned)

4. **Agent: Integration (Upstream/Downstream)**
   - Scratch: `_scratch/agent-integration.md`
   - Output:
     - upstream dependencies (hydrology/morphology artifacts/tags consumed)
     - downstream consumers (map-ecology projection, placement/gameplay consumers, viz)
     - any hidden couplings (direct imports, adapter calls outside projection steps, artifact reads not declared)

5. **Agent: Drift Analysis (Target vs Current)**
   - Scratch: `_scratch/agent-drift.md`
   - Output:
     - drift matrix keyed to target-architecture invariants (ops/steps/stages, truth vs projection, schemas/validation, dependency gating)
     - each drift entry has: pointer, why it violates target, and a “refactor shape” sketch (conceptual, not task plan)

6. **Agent: Ideal Target Shape (Greenfield-ish Spec For Ecology Refactor)**
   - Scratch: `_scratch/agent-target-shape.md`
   - Output:
     - proposed op catalog (one feature = one op when justified; strategies for algorithm variants only)
     - proposed step breakdown (orchestration only)
     - proposed artifact boundaries (what stays as truth artifacts, what is projection)
     - propose where shared semantics live (knob enums, ids)

7. **Agent: Deck.gl / Viz**
   - Scratch: `_scratch/agent-deckgl.md`
   - Output:
     - ecology-emitted viz layers (`dataTypeKey`, `spaceId`, kind) and where emitted
     - how Studio renders them (pointers into Studio renderer)
     - “compatibility surface” list: keys and conventions we must not break in refactor

8. **Agent: Hardening (Behavior Preservation)**
   - Scratch: `_scratch/agent-hardening.md`
   - Output:
     - identify existing diagnostic tooling usable as a parity harness
     - propose invariants for “no behavior change” (artifacts, fields, engine effects, viz keys, determinism)
     - propose the minimal parity experiment we could run to establish a baseline

**Code intelligence usage (Narsil MCP)**
- Prefer Narsil for:
  - finding symbols by intent (`hybrid_search`)
  - mapping coupling (`get_import_graph`, `get_dependencies`)
  - enumerating references (`find_references`, `find_symbol_usages`)
  - pulling scoped context (`get_excerpt`)
- Keep repo id consistent: `civ7-modding-tools#25fd7575`
- Note: worktree writes won’t be indexed; use Narsil for reading existing code, and normal file reads for new spike docs.

### Phase 3: Synthesis (Canonical Spike Docs)
We produce a **small integrated directory** (final spike output) and keep scratch pads separate.

**Canonical spike directory**
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/`

**Canonical docs (final integrated output)**
1. `README.md`
   - 2–3 minute narrative spike report:
     - Objective
     - Assumptions/unknowns
     - What we learned
     - Potential refactor shapes (1–2 options, with a recommended default)
     - Risks/open questions
     - Next steps (including whether to escalate to feasibility)
2. `CURRENT.md` (Explanation)
   - mental map of current ecology (entry points, data flow)
   - step-by-step “what runs where” (ecology vs map-ecology)
3. `TARGET.md` (Explanation)
   - ecology-specific interpretation of target architecture
   - cite canonical docs rather than copying them
4. `DRIFT.md` (Reference)
   - drift matrix: Target invariant → Current reality → Evidence pointer → Why it matters → Refactor shape note
5. `REFRACTOR-TARGET-SHAPE.md` (Explanation)
   - conceptual refactor target (ops/steps/stages reshaping) without implementation sequencing
6. `CONTRACTS.md` (Reference)
   - artifact ids, step ids, op ids, tag/effect ids relevant to ecology
7. `DECKGL-VIZ.md` (Reference)
   - ecology visualization keys and deck.gl mapping implications
8. `HARDENING.md` (How-to for future refactor, but created during spike)
   - proposed “no behavior change” invariants
   - parity harness approach (existing scripts, what to diff, what not to diff)
9. `DOCS-IMPACT.md` (Explanation)
   - Diataxis classification of ecology-related docs
   - which canonical docs would need updates after refactor, and why

**Decision packets (only when needed)**
- Directory: `.../ecology-arch-alignment/DECISIONS/`
- Use decision packets when we discover genuine “this-or-this” architecture choices:
  - op boundaries vs step boundaries (especially for feature planning/apply)
  - artifact schema tightening ownership (domain vs SDK)
  - whether to split steps for gating/observability

### Phase 4: Minimal Experiments (Optional, Only If They Reduce Uncertainty)
If we need a concrete baseline for later “no behavior change” refactors:
- Run a fixed-seed standard recipe diagnostic dump and record:
  - what ecology emits (artifacts + viz layers)
  - determinism expectations and current drift/noise sources
- Candidate commands (document, don’t commit large binaries):
  - `bun --cwd /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps run diag:dump`
  - `bun --cwd /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps run diag:list`
  - `bun --cwd /Users/mateicanavra/Documents/.nosync/DEV/civ7-modding-tools/mods/mod-swooper-maps run diag:diff`

### Phase 5: Exit (Capture vs Discard, Cleanup Safe)
At the end of the spike report, explicitly ask:

A) **Capture spike** (recommended):
- Commit the spike docs directory (canonical + scratch pads, if desired) on `agent-ORCH-spike-ecology-arch-alignment`.
- Optionally `gt track` the spike branch if we want it visible as a PR; do not restack unrelated branches.

B) **Discard**:
- Remove worktree and delete spike branch; findings remain only in the conversation.

**Cleanup invariants**
- Do not run destructive commands (`git reset --hard`, `git clean -fdx`).
- Ensure primary worktree is unchanged and clean when we return.

## How We’d Use Graphite “Slices” If We Needed Them (But We Probably Don’t)
Default for this spike: **single branch** (one worktree, one commit or a small number of commits).

If we later wanted to slice for reviewability:
- One Graphite branch per durable doc group (e.g., CURRENT/TARGET/DRIFT in one, HARDENING in another).
- Use `gt create` / `gt modify` on the spike branch, and only restack within that spike stack.
- In parallel-worktree posture, prefer `gt sync --no-restack` to avoid accidental global restacks.

## Acceptance Criteria (Definition Of Done)
By the end of the spike we have:
- A complete **mental map** of ecology: ops, rules/strategies, steps/stages, artifacts/tags, viz.
- A clear, ecology-scoped **target architecture summary** with canonical pointers.
- A grounded **drift matrix** with code/doc evidence for every major divergence.
- A **refactor target shape** (conceptual) describing how ecology would be reshaped to match architecture without changing behavior.
- A **hardening/invariants** write-up describing how we will prove behavior didn’t change during the future refactor.
- A **deck.gl/viz compatibility** inventory to prevent accidental UI/tooling regressions.
- A Diataxis-aware **docs impact** plan (what to update/promote after implementation).

## Assumptions & Defaults (Explicit)
- Base branch is “current branch when the spike starts” to capture latest architecture changes; we record it in `_scratch/00-plan.md`.
- Spike docs live under `engine-refactor-v1/resources/spike/` because that project already houses the target-architecture posture and prior domain spikes; we treat this as **final spike output**, not canonical system docs.
- We do not change production behavior; any code execution is diagnostic only and outputs are not committed unless explicitly decided.

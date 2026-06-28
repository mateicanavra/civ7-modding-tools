# Skill Pack — StudioShell decomposition

> Curated anchor for me **and** every subagent I spawn. Split into **read-in-full** (central) vs **entry-point** (navigate when a sub-task calls). Budget-aware policy: cross-cutting skills are read now; phase-local central skills are read **just-in-time (JIT)** at the start of the phase that uses them, and named in each subagent prompt so the team anchors to the same pack.
>
> Confirmed available via the session skill registry (dev / cognition / habitat plugins + repo-local `.agents/skills`). The React/Vercel skills live under `dev:` as `dev:vercel-*` (there is no separate "vercel" plugin).

## A. Read-in-full — cross-cutting (loaded this session)

| Skill | Why central | Status |
|---|---|---|
| `habitat:systematic-workstream` | The anchor. authority→corpus→expectation→owner→slices→proof→closure; invariants (authority-before-corpus, expectations-before-proof, proof-classes-stay-separate, review-findings-block, clean-closure). Governs every stage. | ✅ read |
| `dev:git-worktrees` | Worktree mechanics (workspace setup). | ✅ read |
| `dev:graphite` | Stacked-branch mechanics (Phase 8 slices). | ✅ read (will reload at P8) |

## B. Read-in-full — phase-local (JIT at phase start)

| Skill | Phase | Why central |
|---|---|---|
| `cognition:domain-design` | 4 | Classification-first product model — boundaries, authority, what the app *should be*. |
| `cognition:testing-design` | 5 | Design tests against **behavior**, not structure (structure→Habitat). Core to preserve/improve split. |
| `civ7-operational-debugging` (repo-local) | 5, 8 | Live-game flows (run-in-game, live runtime): deployed-mod checks, Civ7 logs, FireTuner, in-game verification. |
| `dev:refactor-typescript` | 6, 7, 8 | The core mechanic — code-smell detection, compiler-gated moves, complexity reduction. Primary skill. |
| `dev:typescript` | 7, 8 | Target patterns — module boundaries, type-driven APIs, what "good" looks like. |
| `dev:vercel-react-best-practices` | 5, 7, 8 | "You Might Not Need an Effect", memoization, data-fetching — judges the effect→derived improve-slices. |
| `dev:vercel-composition-patterns` | 7, 8 | Hook/composition APIs, prop-proliferation, React 19 — shapes target hook interfaces. |
| `dev:architecture` | 7 | Target SPEC, OpenSpec change sets, migration slices, owner placement. |
| `civ7-open-spec-workstream` (repo-local) | 7 | How a bounded OpenSpec phase runs in *this* repo (authority→spec→review→impl→verify→handoff). |
| `dev:review-code-quality` | review loop (every slice) | The bar my own reviews must clear: strict maintainability, behavior-preserving complexity reduction, no wrong-owner preservation, no wrapper/branch sprawl. |
| `habitat:workstream-review-loops` | review loop | Review-loop machinery (framed peer agents, disposition). |

## C. Entry-point only (navigate deeper when a sub-task calls)

- `cognition:framing-design` (my owner frame — already applied), `cognition:solution-design`, `cognition:investigation-design` (Phase 6 brief shaping).
- `habitat:workstream-runner` (entry point), `habitat:dual-role-workstream`, `habitat:dra-structural-watcher`.
- `dev:web-design-guidelines`, `dev:frontend-design` (UI-craft sanity — minimal; this work is non-visual).
- `dev:typebox`, `dev:orpc`, `dev:bun`, `nx:nx-workspace` / `nx:nx-run-tasks` (reach only if a build/test/contract question arises).
- `search:narsil-mcp` (structural code-intel — find_references/call-graph during Phase 6 if grep is insufficient).
- Other Civ7-domain skills (product/architecture authority, control-oRPC, map-gen) — peripheral to a React-shell refactor; reach only for a genuine Civ7-domain question.

## D. Codex review surfaces (alongside my own Claude/Opus reviews — complementary)

- `codex:review` — review-only pass over the slice's local git state (defect lane).
- `codex:adversarial-review` — challenges the *approach/design/assumptions* (use for design-level + improve-slices).
- `codex:rescue` — delegates investigation or an explicit fix (not a review); reach only when I want Codex to dig in/fix.
- Supporting: `codex:codex-cli-runtime`, `codex:codex-result-handling`, `codex:gpt-5-4-prompting`.
- All three of review/adversarial-review/rescue are **commands/agents**, not skills.

## E. Subagent anchoring rule

Every subagent prompt names: (1) the relevant read-in-full skill(s) for its task, (2) the parity floor + do-not-break registry from `OWNER-FRAME.md §6`, (3) that it must **test behavior, not structure** (structure/lint = Habitat's job), (4) absolute worktree paths.

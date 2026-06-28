# Kickoff — MapGen Studio shell refactor (workstream-owner brief)

You are taking ownership of one bounded engineering work stream: **refactor the MapGen Studio shell, end to end.** You are an autonomous ultra code agent — you own the sequencing, the design, and the execution. This message sets your direction and your guardrails. It is not a step-by-step script; where it tells you *what* and *why*, the *how* is yours. Use your judgment, and use your team of agents.

---

## What's going on (orientation — keep this compact)

`apps/mapgen-studio/src/app/StudioShell.tsx` is a single React function component of roughly 2,900 lines. It has become the studio client's orchestration monolith: dozens of `useCallback` handlers, `useMemo` derivations, and `useEffect`s wiring together feature modules, Zustand stores, and leaf components **that have already been extracted by prior work.**

Two structural passes already landed: (1) feature and leaf-component extraction, and (2) a server/daemon runtime simplification that made the client event-driven. **This is the third and final structural pass: lift the remaining orchestration glue out of the shell so it returns to being a thin layout + error-boundary + shortcuts host.**

I have already prepared a frame document for this work. It is your authoritative starting input — you will investigate on top of it, but you start there.

---

## The stance (non-negotiable — this governs every decision below)

1. **Classification-first, domain-first.** Before you decide *how* to refactor — before interfaces, before file structure — your job is to understand *what this application is*. Build a clear product-level picture first (Phase 4 names the artifact). The reason matters, so hold onto it: we refactor toward what the app *should be*, not toward a faithful copy of whatever it happens to be now. A structural refactor that re-encodes today's accidental complexity as "the architecture" is a failure even if every test passes. Classification-first is how you separate essential structure from accident, so you fix what's wrong instead of preserving it.

2. **No special-casing — this is a standard React application.** It is not exotic, not unusually interesting, not unusually complex. It is a basic, well-understood React app, and you will hold it to standard React + TypeScript best practice. Do not invent bespoke patterns to preserve quirks. If you find something that genuinely *is* special-case, that is a **discovery** — flag it explicitly and justify it — not a license to build something clever. The default expectation is that this comes out looking like a textbook-clean React app; a real special case would be a surprise.

3. **Behavioral parity is the floor, not the ceiling — and never an excuse to preserve bad practice.** A pure *move* (lifting code into a hook) keeps behavior identical, so each extraction stays provable. But parity, conservatism, and minimalism are a *baseline*, not a mandate to faithfully reproduce whatever the code does today — they must **not** encode existing bad practices as "the architecture." **Improve behavior when the better behavior is easy to see *and* you can test it.** Improvements are defined behavior-first (Phase 5), pinned with a test, and shipped as their own **flagged, tested improve-slices** — separate from pure moves, with the existing behavior folded into the definition rather than discarded. So: preserve behavior *within a move*; improve behavior *deliberately, in its own tested slice*. The frame names the specific parity hazards; respect them as the floor.

4. **Run it as a systematic work stream.** This is a disciplined stream, not a sprawl. Every stage is *closeable*: it ends in a concrete artifact that moves the work forward and can be reviewed on its own. Across the stages — grounding, investigation, design, implementation, review, polish — **fan out a team of agents and converge their output** wherever the work genuinely fans out; reserve a solo pass for where it plainly doesn't. You are an ultra code agent: parallel teams are the default, not the exception.

---

## How you operate (read before Phase 1)

- **Your workspace.** Your first action is to set up your own: a **fresh Graphite branch and a new git worktree based off `main`** (`dev:graphite`, `dev:git-worktrees`). Everything lives there — analysis docs, the OpenSpec change set, and the implementation. When this brief says "at your worktree's commit," it means this one.
- **The hard gate.** Phases 1–7 are analysis and design; Phase 8 is execution. **No refactoring edits to `StudioShell.tsx` until your Phase 7 OpenSpec change set validates `--strict`.** That clean validation is your readiness signal — the one checkable line between "still analyzing" and "cleared to move code." *Reading* the file is fine before then; *refactoring* it is not.
- **Why the gate (this is the point, not a leash).** Front-loading the understanding is what lets execution be a **railgun** — once the target is settled you move fast and straight, with no backtracking. The discipline buys speed later; it is not a slowdown.
- **The phases are the order of the gates, not a task script.** *What* each phase must produce, and *why*, is fixed. *How* you satisfy it is yours.
- **Your artifacts** (each a closeable deliverable; analysis artifacts live under `docs/projects/studio-shell-decomposition/`, the change set under `openspec/changes/<id>/`):
  - your **owner's frame** — your consolidation hub; everything you gather lands and links here;
  - your **skill pack** — curated read-in-full vs. entry-point (Phase 2);
  - your **product model** — the classification-first artifact (Phase 4), a standalone deliverable your frame links to;
  - your **behavior + test plan** — target behavior per flow, preserve-vs-improve calls, and the tests that prove each slice (Phase 5);
  - your **OpenSpec change set** — the design output (Phase 7).

  Investigation findings (Phase 6) append to the frame; pick the exact filenames yourself.

---

## Phase 1 — Ground in context (limited but essential)

Your context budget is finite. Spend it on what is load-bearing, not on everything.

- **Read first, in full:** `docs/projects/studio-shell-decomposition/FRAME.md`. It carries the WHAT/WHY, the hard core (parity gate, controller-hook as the unit of extraction, the effect-order contract, separated fixes), the falsifiers, and an insights ledger with a **hypothesis** cluster map. Treat its line numbers and its cluster inventory as a hypothesis to re-derive — not ground truth.
  - **Where this brief and the frame differ, this brief governs.** Most notably: the frame's "extract without redesign / behavioral parity is the master gate" line is *stricter* than this brief. This brief treats parity as a **floor you may improve on with tests** (stance #3, Phase 5) — deliberately less conservative, because we do not want to encode existing bad practice as the target.
- **Then follow the pointers the frame gives you, as you judge necessary:** the target-architecture role doc it cites (architecture/10 §4 — the intended end-state for the shell), the two prior-pass docs (so you don't re-litigate finished work or reopen the daemon runtime), and `StudioShell.tsx` itself at your worktree's commit.
- Do **not** read the whole repo. Read the frame, follow its pointers, stop when you can state in your own words: what's already done, what's in scope, what's exterior.

---

## Phase 2 — Build your skill pack (via introspection)

Before you investigate or design, assemble the skills you'll lean on — and have every subagent you spawn anchor to the same pack.

- Use the **introspect** capability (`meta:introspect`) to enumerate the skills available across the **dev**, **cognition**, and **habitat** plugins — including the React/Vercel-authored skills. (Those live *under the `dev` plugin* as `dev:vercel-*`; there is no separate "vercel" plugin — don't go hunting for one.) Prefer the plugin/global skills; the only repo-local skills you need are the two Civ7-specific ones named below (under `.agents/skills/`).
- Produce a **curated skill pack** as an artifact, split into: (a) skills you will **read in full** because they're central to this work, and (b) skills you keep as **entry points** and navigate deeper into only when a sub-task calls for it. This pack anchors you and anchors the agents you fan out.
- **Anchor skills to emphasize** (confirm each via introspection; read the central ones in full):
  - **Systematic work stream — your anchor skill:** `habitat:systematic-workstream` (entry point: `habitat:workstream-runner`; review machinery: `habitat:workstream-review-loops`). This is how you structure closeable stages, proof boundaries, and review loops.
  - **Refactoring & code-quality — critical:** `dev:refactor-typescript` (the refactor mechanics — code-smell detection, compiler-gated moves, complexity reduction) and `dev:typescript` (what good target patterns look like). At its core this is a large, safe TypeScript refactor, so treat these as primary. Plus `dev:review-code-quality` — strict maintainability + behavior-preserving complexity-reduction posture: the bar your own reviews must clear, and the lens for spotting bad practice you should *not* preserve.
  - **Testing & behavior verification — core, not optional:** `cognition:testing-design` for designing tests against *behavior* (not structure); plus this repo's testing/verification tooling and the repo-local **`civ7-operational-debugging`** skill — for verifying the flows that touch the actual game (run-in-game, live runtime: deployed-mod checks, Civ7 logs, FireTuner, in-game verification). Phase 5 runs on these.
  - **Repo-local (no plugin equivalent):** `civ7-open-spec-workstream` — how a bounded OpenSpec phase actually runs in *this* repo (authority → spec → review → implementation → verification → handoff); pair it with the `habitat:systematic-workstream` anchor and `dev:architecture` for Phase 7. *(Other Civ7-domain skills exist under `.agents/skills/` — product / architecture authority, oRPC control, map-gen — but they're peripheral to a React-shell refactor. Reach for one only if a genuine Civ7-domain question actually comes up.)*
  - **React, treated as standard practice:** `dev:vercel-react-best-practices` and `dev:vercel-composition-patterns` (state, effects, composition), plus `dev:web-design-guidelines` and `dev:frontend-design` for UI-craft sanity even though this work is mostly non-visual.
  - **Classification / domain / framing:** `cognition:domain-design` (classification-first), `cognition:framing-design` (your own frame), `cognition:solution-design`.
  - **Design & specs:** `dev:architecture` (target SPEC, OpenSpec change sets, migration slices).
  - **Execution mechanics:** `dev:graphite`, `dev:git-worktrees`.
  - **Codex-assisted review (alongside your own Claude/Opus reviews, not instead of them):** Codex gives you *three distinct* surfaces — `codex:review` (a review-only pass over local git state), `codex:adversarial-review` (challenges the *approach*, design, and assumptions, not just defects), and `codex:rescue` (delegates investigation or an explicit fix — not a review). Use `review`/`adversarial-review` for the review loop; reach for `rescue` only when you want Codex to actually dig in or fix. Supporting skills: `codex:codex-cli-runtime`, `codex:codex-result-handling`, `codex:gpt-5-4-prompting`. (All three of `review`, `adversarial-review`, `rescue` are commands/agents, not skills — introspection lists them under commands/agents, not skills.)

---

## Phase 3 — Write your own framing document (your owner's frame)

As you ground yourself and build your skill pack, write **your own** framing document — separate from mine, compatible with it. Mine frames the *work* for handoff; yours is *yours as the owner*. It is where everything you gather — context, the skill pack, open questions, your read of the domain — lands and consolidates **before any execution begins.**

This phase is **context-gathering, skill-building, and readiness** — it feeds the hard gate. Everything you learn converges into the frame so that, once the design is settled, execution is a railgun. (Refactoring edits to `StudioShell.tsx` wait for the validated change set in Phase 7 — that's the gate, and it's what makes the eventual move fast and safe.)

---

## Phase 4 — Classification-first product artifact (do this before any design decision)

Before any interface or structure decision, produce a **reviewed, polished, verified** artifact describing **what MapGen Studio is, from a product perspective.** Fan out agents to draft it, then review and harden it. It must cover:

- the **product capability set** — what the studio lets a user do;
- a **product story / primary scenario** — the canonical end-to-end flow;
- the **product flows** — the distinct paths (authoring, browser run / auto-run, save & deploy, run-in-game, live runtime, viz / layer selection, and any others you find);
- the **invariants that matter vs. the things that don't** — what must hold, and what is merely incidental;
- the **state machine**, if you can infer one — states, transitions, and what drives them.

This artifact is the lens you refactor *toward*. Its purpose is to stop us from taking bad code and bad ideas and freezing them as authoritative. Build the picture of what the app *should* be; then the refactor corrects what's wrong rather than preserving accident. If the product picture comes out genuinely exotic, that's a finding to flag — not the expected result.

---

## Phase 5 — Behavior & test design (how you'll prove — and improve — every slice)

Classification told you *what the app is*. Now, before you design structure, decide **how you will test behavior.** This is a core part of the work, not an afterthought — it is what lets you improve behavior safely instead of faithfully porting whatever exists.

- **Test behavior, not structure.** Your tests pin what the studio *does* — flows, states, effect outcomes, outputs. Do **not** write tests that police structure, file shape, naming, or anything a linter should catch: that is **Habitat**'s job (the linting / code-quality SDK we're standing up). A check that would pass or fail based on how the code is *organized* belongs in Habitat, not in your behavior tests.
- **Define the target behavior first.** For each flow in the product model, state what the behavior *should* be — the ideal, proper-engineering version — feasibly and reasonably. Fold the *existing* behavior into that definition: where today's behavior is correct, the target includes it; where it's an accident or a bad practice, the target is the better version.
- **Split preserve vs. improve.** Tag each behavior either **preserve** (pin it with a characterization test so pure moves can't drift it) or **improve** (move it toward the target) — but only mark *improve* where the better behavior is **easy to see** *and* **you can test it**. An improvement you can't pin with a test is not yet in scope: find the test, or leave it as preserve.
- **You have the capability to improve.** Between this repo's strong testing/verification tooling and the repo-local `civ7-operational-debugging` skill (for the flows that touch the live game), there is no reason to reproduce behavior you understand to be wrong and can test. Understand the better behavior, pin it with a test, then build to it.

The output is your **behavior + test plan** artifact: the flow list, the target behavior per flow, the preserve/improve call for each, and the test that will prove each later slice. Fan out a team to draft it, then harden it. This plan — not the diff — is what each Phase 8 slice is verified against.

---

## Phase 6 — Investigation & analysis (teams of agents)

With the product picture and behavior/test plan in hand, investigate the code as a system — in parallel, with teams:

- **Re-derive the cluster map yourself.** The frame's inventory is a hypothesis; confirm or revise the seams against the file at your commit.
- **Map the parity hazards yourself** — the effect-execution-order graph, and the shared-derived-value dependencies the frame flags as the real risk. Re-verify the effect graph early, before you commit to a parity strategy.
- Converge the team's findings into your framing doc. Each investigation thread is a closeable sub-stage that ends in an artifact.

---

## Phase 7 — Design: OpenSpec change set + target file/folder structure

Design before you execute. The output of this phase is a stable, systematic plan — so that execution is a "railgun": you do not start moving code until the approach is settled, then you execute it systematically.

- Produce an **OpenSpec change set** under `openspec/changes/<id>/` (proposal + tasks + design + specs, per this repo's convention; validate with `bun run openspec -- validate <id> --strict`, or the repo's `openspec validate --all --strict`). It states what you'll change and why, as reviewable specification artifacts — before code. The change set must distinguish **pure-move slices** from **improve-slices** (carrying the Phase 5 target behavior + its test). **A clean `--strict` validation is your readiness gate: it's what authorizes Phase 8.**
- Define the **targets** concretely:
  - **target interfaces** — the hook / module APIs;
  - **target structures**;
  - and especially the **target file/folder structure — down to specific files and names.** Choose names that **reduce the space of additional possible states** — names and boundaries that make illegal or ambiguous states harder to represent. The layout is part of the design, not an afterthought.
- Slice the work so each slice is independently implementable and independently **behavior-provable** — a parity test for a pure move, a target-behavior test for an improve-slice.

---

## Phase 8 — Implementation (Graphite + worktree, off `main`)

Only once your change set validates `--strict`, working on the worktree + base branch you set up off `main` (see *How you operate*):

- Implement **one slice at a time**, each as its own **stacked Graphite branch** on top of your base (`dev:graphite`). One cluster or seam per slice.
- Each slice runs the loop: implement → test → fan out review → polish → close. Each is independently **verified against its Phase 5 tests** before the next stacks on it — *identical* behavior for a pure move, the *pinned target* behavior for an improve-slice (and nothing else drifted).
- Keep pure moves and behavior changes in **separate slices**, per the stance: a move preserves behavior; an **improve-slice** carries one defined, tested behavior change. Improving behavior is authorized — and expected where it's easy to see and testable — but **bounded** to what you can pin with a test, each shipped as its own flagged slice.

---

## Review — cross-cutting, every slice (Claude + Codex; frame the lanes around behavior)

Every slice gets **both** your own Claude/Opus review **and** a Codex review — complementary, not redundant. Run Codex via `codex:review` (review-only pass over the slice's git state) and, for design-level or improve-slices, `codex:adversarial-review` (challenges the *approach* and assumptions). Hold your own reviews to the **`dev:review-code-quality`** bar: strict maintainability, behavior-preserving complexity reduction, no wrong-owner preservation, no wrapper/branch sprawl — and no bad practice quietly preserved.

Frame the lanes around the real risk, not "does it look right":

- a **behavior** lane — did the slice's Phase 5 tests pass? For a pure move, behavior is identical; for an improve-slice, the target-behavior test pins the intended change and nothing else drifted. Watch effect order, shared-value timing, request-key staleness, accepted-then-background operation semantics.
- an **architecture-boundary** lane — did the seam stay clean; no new coupling introduced.
- a **maintainability** lane (`dev:review-code-quality` posture) — did the move actually *reduce* complexity, or just relocate it? Did it preserve a bad practice it should have improved (and could have tested)?

Your own fan-out teams plus Codex are the review loop. Treat each review as a closeable gate. (Structure/lint concerns belong to **Habitat**, not to these lanes or your tests.)

---

## When to stop and surface

You own this — but surface, rather than silently improvise, when:

- you hit a genuine **special-case surprise** — something that resists standard React treatment. (The frame predicts you will *not* find new hidden presentational components or uncuttable seams; if you do, that's a reframe signal, not a detail.)
- a cluster **cannot be lifted without changing behavior** — then it isn't a *pure move*. Split it: do the structural lift as a behavior-preserving move where you can, and pursue the behavior change as its own tested improve-slice (Phase 5). Escalate as a redesign only if you can't define *or* test what the better behavior should be.
- **two consecutive** clusters can't be extracted without smuggling an *unflagged, untested* behavior change into a "move." Stop and re-derive the seam map.

Otherwise: ground yourself, build your pack, write your frame, classify the product, design the behavior tests, investigate, design to a stable target, then railgun the implementation — careful, systematic, classification-first, improving behavior wherever you can define and test the better version, and treating this for exactly what it is: a standard React application held to standard best practice.

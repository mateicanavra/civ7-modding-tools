# Kickoff — MapGen Studio UI Library Extraction

You are the owner of a new workstream in the `civ7-modding-tools` monorepo (`/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools`).

**Objective:** extract MapGen Studio's design-synced UI surface — 46 components plus the token/theme layer — out of `apps/mapgen-studio` into a standalone workspace package with a real build (dist, generated `.d.ts`, exports map, CSS entry, and a home for the 46 stories — Storybook topology is yours to decide), rewire the app to consume the package, repoint the Claude Design sync at the package's real artifacts, and delete the `build-inputs.sh` reverse-engineering layer entirely. You own this end-to-end: grounding, classification, design, implementation, review, landing.

You are an ultra agent: fan out teams of sub-agents at every stage — investigation, design alternatives, implementation, review, polish. You are the orchestrator and editor; sub-agents do the breadth. Design every sub-agent brief deliberately: give it a lens, a bounded focus, a falsifier, and pointers — not a dump of your context.

## 0. Your normative anchor

Read `docs/projects/studio-ui-extraction/FRAME.md` **first**, before anything else. (It may not be on `main` yet. Look in order: the repo checkout, then attached/pasted alongside this message. If you find it off-main, commit it into your worktree as the workstream's first artifact. If you cannot find it at all, stop and ask Matei — do not proceed without it, and do not reconstruct it from adjacent docs.)

The frame is normative. It defines scope, the definition of done, non-goals, hard-earned knowledge you must not re-derive, and the open questions that are yours to answer. Treat it precisely:

- Where the frame marks something **known**, do not re-litigate it without new evidence. If your investigation contradicts it, surface the contradiction explicitly — do not silently comply with the frame, and do not silently override it. Contradictions are Matei's to adjudicate: escalate them; do not proceed on your own resolution.
- Where the frame marks something **unknown** (§5), discovering it is your job. Do not fill those gaps by assumption.
- Where the frame **reserves a decision to Matei** (package naming, publishing policy, scope changes, anything touching the live design project), bring options with trade-offs; do not decide unilaterally.

**Before grounding any further, settle two mechanical things.** First, verify the frame's §8 precondition: the studio stack (PRs #1991–#1994) must already be merged to `main` — a quick `gh pr view` per PR settles it. If it has not landed, stop and report before doing anything else; grounding against a pre-flip surface would all be thrown away. Second, once the precondition holds, create your Graphite branch + dedicated worktree off `main` immediately — the frame copy (above), your workstream document (§3), and the OpenSpec change set (§5) all live there.

## 1. Ground — limited but essential

Your context is finite; spend it deliberately. Beyond the frame, ground in: the frame's §10 pointer table (config, NOTES.md, the converter, the token source), and whatever the frame cites that your judgment says you need. Prefer sending sub-agents to read broadly and report; read in full yourself only what is load-bearing for decisions you personally must make.

## 2. Build your skill pack

Before touching anything, use the introspection capability (`meta:introspect`) to enumerate the installed skill plugins — expect at least dev, cognition, habitat, nx, and codex, but enumerate rather than assume, and note that some skills live where you might not guess (the Vercel React skills are inside the dev plugin). From that inventory, produce a **curated skill pack**: which skills you read in full because they are core to this work, and which you hold as entry points to navigate deeper when needed. Likely coverage — confirm and extend by introspection; do not trust any list from memory, including this one: systematic workstream execution (your anchor skill), TypeScript refactoring and package/API design, structural code-quality review, Graphite and git-worktree mechanics, Vite/Storybook, React best practices, and Nx. One skill lives outside the plugins entirely: the `design-sync` skill is bundled with the **DesignSync tool itself** — load the DesignSync tool and the skill surfaces with it; plugin introspection will not find it. Read **both** of its shape sub-skills — the end-state sync shape is one of your open decisions.

The pack anchors you **and every sub-agent you spawn**. When you fan out, tell each sub-agent which skills from the pack apply to its brief.

## 3. Write your own frame

As you gather context and skills, write your own workstream document under `docs/projects/studio-ui-extraction/` — separate from, and compatible with, the normative frame. This is the workstream owner's operating picture: what you've verified, what you've decided, what remains open, how you'll sequence. Everything decision-relevant lands there before execution begins — distilled, not dumped; it is an operating picture, not a transcript. This phase is context gathering, skill building, and readiness — **not** the start of code changes.

## 4. Classification first — the non-negotiable

Before any interface, file layout, or package API is decided, produce the **classification ledger**: every design-synced component (derive the authoritative list from `componentSrcMap` in `.design-sync/config.json`, not from directory listings), its coupling tier with evidence, its target home, and its story/preview status. Alongside it, write the short product description of what this package *is* and what each of its clients demands of it. The scope bound is hard — the app, Storybook, and the design-sync pipeline, nothing else (frame §3: not a general design-system program); how Storybook relates to the package is one of your open decisions (frame §5).

The reason this comes first, preserved from the work that produced the frame: extraction under time pressure encodes accidental complexity as authoritative architecture. Classification is how you see what the surface *should* be before you freeze it into a package boundary. Get the ledger reviewed and verified by fan-out reviewers before you build on it.

The standard-issue stance applies throughout: this is a normal React component-library extraction in a normal TypeScript monorepo. If something appears to require a special case, treat that as a surprising discovery to verify and surface — not a pattern to build around.

## 5. Design — spec before code

When classification is stable, run the design phase as a real solution-design exercise (generate alternatives where the frame's §5 questions genuinely fork — build recipe, Storybook topology, sync end-state shape — and pick with stated reasons). The design phase produces, before implementation starts:

- An **OpenSpec change set** (the repo has live OpenSpec tooling: `openspec/`, `bun run openspec:validate`) describing what will change.
- **Target interfaces** and the **target file/folder structure — down to specific files and names.** Naming should reduce the space of possible states: a reader of the tree alone should be able to predict where anything lives. This is what makes execution a railgun: wait until the approach is systematic and stable, then execute systematically.

## 6. Execute — one change set at a time

- All implementation happens on the Graphite branch + dedicated worktree you created in §0. Never branch off a stale base, and never touch the precondition stack yourself.
- Implement one change set at a time, each closeable with artifacts that move forward. Fan out implementation where units are independent; fan out review and polish on everything.
- **Behavior bar** (frame §6): parity is the baseline gate, but do not preserve bad practices because they exist. Where an improvement is clearly right *and testable*, design the test first, then make the improvement. Tests target behavior, never structure — structural hygiene is lint's job.
- **Reviews:** use your own fan-out review agents *plus* an independent Codex review pass on substantial diffs. Structural maintainability review (code-judo: delete wrappers, branches, false owners) is part of the bar, not a nice-to-have.
- **Verification:** the 46-story oracle and the re-sync compare machinery are the fidelity gate. All 46 must re-verify at the end — the four portal dialogs via the manual-verification path (frame §3), not by forcing recapture. Any drift outside that known portal-dialog class is a stop-and-diagnose event.
- **Lane discipline** (frame §6): never touch foreign `codex/*` or habitat lanes; `git diff --cached` before every commit; draft PRs via `gt submit --draft --no-interactive` with `gt parent` = main confirmed; titles/bodies via `gh pr edit`; repo-standard commit and PR footers.
- **Uploads to the live design project are outward-facing:** re-syncing project `531d158d` requires Matei's go-ahead. Everything up to the upload can be verified locally.

## 7. Report and escalate

Keep the workstream record current as stages close. Escalate to Matei only what the frame reserves or what genuinely changes scope; otherwise decide and record. When the workstream is done, the definition of done is the frame's §2 — walk it line by line and show evidence for each item. At close-out, also honor the frame's §8 standing preference: move the parked studio runner worktree up to the new tip and relaunch it.

Begin with §0.

# Workstream Record — `typescript-refactoring` skill

## Objective
Build a repo-local skill: a TypeScript-specific, first-principles complexity
reduction and refactoring skill ("Thermonuclear Code Quality Review, but deeply
layered for TypeScript"). An agent handed it must be able to read it + linked
references/assets, look at TS code, and execute a thorough refactor — detecting
smells, designing a solution, and cleaning up LLM-generated slop.

## Containment boundary
- All edits in worktree `wt-codex-skill-typescript-refactoring`, Graphite branch
  `codex/skill-typescript-refactoring`, stacked on
  `codex/habitat-toolkit-reference-docs` (top of the active stack).
- Skill lives at `.agents/skills/typescript-refactoring/`.
- Workstream state (research, design, this record) under
  `docs/projects/typescript-refactoring-skill/`.
- Refactoring Guru raw scrape cached OUTSIDE the repo
  (`…/worktrees/.refactoring-guru-cache/`); copyrighted — never committed.

## Non-goals
- Not a TypeScript language tutorial; not a rewrite of `dev:typescript`.
- No code in the civ7 product is refactored as part of this workstream.
- No PR submission / push unless the user asks.

## Authority order
1. User instructions in this session.
2. Local skill conventions (`.agents/skills/README.md`, house style).
3. Research digests (`./research/`) and `./DESIGN.md` (authoring contract).
4. Primary external source: refactoring.guru (synthesized, never copied).

## Phases
- [x] P0 Ground & frame — stack, worktree, tracked branch.
- [x] P1 Research wave — r1 thermonuclear, r2 typescript boundary, r3 authoring,
      r4a/b/c refactoring.guru, r5 link-outs + local conventions.
- [x] P2 Design lock — `DESIGN.md`.
- [x] P3 Build — SKILL.md (host) + 5 references (agent wave) + 2 assets (host).
- [x] P4 Review & repair — two adversarial lanes (skill-conventions + TS-principal);
      all blockers/majors repaired, minors dispositioned.
- [x] P5 Close — README registration, gates, Next Packet.

## Closure
**Outputs (skill at `.agents/skills/typescript-refactoring/`):**
- `SKILL.md` (266→269 ln) — spine, axes, standards, mandate, workflow, boundaries,
  good-phrases, approval bar, invariants.
- `references/`: smell-catalog (29 smells, 5 classic + TS-native), refactoring-mechanics
  (gated workflow + 17 moves + DoD), llm-slop-cleanup (10 slop patterns + indirection
  audit), paradigms-and-patterns (functions-vs-classes rule + GoF-in-TS verdicts +
  collapse map + migration mechanics), worked-examples (6 before→after refactors).
- `assets/`: refactor-plan-template, refactor-findings-template.
- `.agents/skills/README.md` — one Skills-table row added.

**Gates:**
- Frontmatter: `name`+`description` only ✓ (12 quoted triggers + negative boundaries).
- Cross-links: 50/50 internal links + anchors resolve ✓ (GitHub-slug validator).
- Code fences balanced across all 8 files ✓.
- New branded-type snippet typechecks clean under `tsc --strict` ✓ (reviewer also
  compiled the worked-example after-blocks clean).
- No `23 smells` / no `](plugin:skill)` residue ✓.

**Review disposition:** both lanes GO-WITH-FIXES. Repaired: B1 (9 broken anchors +
2 missing mechanics added: Introduce Branded Type, Extract Module), M1-TS (relabeled
an `as`-cast falsely called "parse"), markdown-link-as-URL ×7, B3 (smell count 23→29),
structuredClone caveat (Prototype/Memento), axis deferral, bare path prefix, before/
after markers, grep "candidates-not-verdicts" caveat. Accepted as-authored: M2-skill
(verdict column is decision content; shape is explicitly deferred to dev:typescript).
Won't-fix (acceptable): reference line counts over soft target (single-responsibility);
"review this TS for quality" trigger (negative boundary disclaims /code-review overlap).

**Repo/Graphite state:** branch `codex/skill-typescript-refactoring` tracked on
`codex/habitat-toolkit-reference-docs`; worktree `wt-codex-skill-typescript-refactoring`.
Refactoring Guru raw cache kept outside the repo (uncommitted, copyrighted).

**Deferred inventory:** none blocking. Optional future: a CI markdown link-checker for
`.agents/skills/**` to prevent anchor regressions; optional companion `/ts-refactor`
command if invocation ergonomics are wanted.

**Next Packet:** to use the skill, an agent reads `SKILL.md`, inventories smells via
`references/smell-catalog.md` + the detection toolkit, copies
`assets/refactor-plan-template.md`, and transforms via `references/refactoring-mechanics.md`
keeping `tsc --strict` green per step. To extend it, add moves to refactoring-mechanics
or examples to worked-examples; keep SKILL.md lean and link out per DESIGN §4.

## Evidence inputs
- `research/r1-thermonuclear.md` … `research/r5-linkouts-and-conventions.md`
- `.refactoring-guru-cache/` (23 smells, 66 techniques, 22 patterns, 10 concept).

## Stop conditions
- If a reference would duplicate `dev:typescript`, stop and link instead.
- If a naming/scope decision can't be inferred, surface to user.

## Closure (filled at P5)
- Outputs:
- Gates:
- Review disposition:
- Repo/Graphite state:
- Deferred inventory:
- Next Packet:

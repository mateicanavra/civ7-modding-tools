# Design Lock — `typescript-refactoring` skill

This is the authoring contract. Every file in the skill is built against it. It
is grounded in the research digests under `./research/` (r1–r5, r4a–r4c).

## 1. Identity

- **Name / dir:** `typescript-refactoring` (kebab, not `civ7-` prefixed — this
  skill is technology-scoped, not repo-scoped; see r5).
- **One-liner:** Thermonuclear-grade, first-principles complexity reduction and
  refactoring for TypeScript.
- **Sibling:** Tone/approach sibling of the Thermonuclear Code Quality Review
  skill (r1). It owns the TypeScript substance the Thermonuclear skill omits.
- **Location:** `.agents/skills/typescript-refactoring/`.

## 2. The Spine (the coined mental model)

**Complexity in TypeScript is the count of reachable states.** Every `any`,
every optional field, every boolean flag, every non-exhaustive branch multiplies
the states a reader (and the program) can be in. Refactoring is not tidying —
it is **collapsing the state space**, ideally so the *compiler* proves the
collapse.

Three forces (our analog to Thermonuclear's "code judo," r1):
- **Type-level judo** — the highest-leverage move changes the *types* so whole
  categories of runtime branches and bugs become impossible, and code deletes
  itself. The win is *fewer reachable states, not fewer lines.*
- **Delete > rearrange** — prefer removing complexity over relocating it. A
  refactor that only moves the mess around has not earned its diff.
- **A repeated branch is a missing model** — duplicated conditionals/flags are
  evidence of a type (usually a discriminated union) that wants to exist.

## 3. Voice & Conventions (every file obeys)

From r1 (Thermonuclear) + r2/r5 (dev:typescript + local house style):
- **Demanding about quality, never rude** (r1). Harshness lives in the *bar*,
  not in adjectives or theatrics. Sober body, high standards.
- **Ambition over defect-hunting**: lead with the simpler design that should
  exist, then close the diff to it.
- **No rule without a reason** (r3). Every directive states *why*.
- **Show, don't just tell**: TypeScript before→after pairs (Thermonuclear shows
  none — this is our differentiator). Bad→good code blocks, `ts` fenced.
- **Compose, don't duplicate** (r5 local value): when another skill owns a
  topic, link to it in one line; never restate it as a second spec.
- **Detection is concrete**: every smell carries a greppable/tooling signal.
- **Imperative, dense, operator-facing** (local house style).
- Cross-skill references use the `plugin:skill` form (e.g. `dev:typescript`,
  `cognition:domain-design`). Own-material references use relative
  `references/*.md` paths.
- Lowercase peer-PR-comment voice for the "good phrases" library (r1).
- End SKILL.md with the skill-usage-disclosure footer pattern used locally.

## 4. Boundary — what we OWN vs LINK (r2 gaps G1–G6, r5 link table)

**We OWN (the gaps dev:typescript leaves):**
- G1 — a TypeScript code-smell catalog with detection signals.
- G2 — safe refactoring *mechanics* (step-by-step, compiler-gated).
- G3 — an end-to-end, gated refactor workflow + definition of done.
- G4 — cleaning up **LLM-generated slop** (our strongest differentiator).
- G5 — functional vs class **decision procedure** + bidirectional migration.
- G6 — over-/under-engineering detection + naming/style cleanup.

**We LINK (never rewrite):**
| Concern | Hand off to |
| --- | --- |
| What good TS looks like; target patterns (DU, brands, ports, FC/IS, type-state) | `dev:typescript` (`references/design-patterns.md`, `philosophy.md`, `axes.md`, `where-defaults-hide.md`, `refactoring-patterns.md`, `module-organization.md`) |
| Whether to refactor at all / reframing the problem | `cognition:solution-design` |
| Why complexity recurs; coupling/feedback/second-order effects | `cognition:system-design` |
| Where boundaries go; module ownership; bounded contexts | `cognition:domain-design` |
| The safety net before changing behavior (what to test, risk-proportional) | `cognition:testing-design` |
| Structuring docs the refactor emits | `cognition:information-design` |
| Target-state SPEC + phased migration/cutover | `dev:architecture` |
| Refactor crosses a public/exported surface; versioning | `dev:api-design` |
| Graph-safe mechanical rename/move/extract across the repo | `gitnexus-refactoring` |
| Quick diff-scoped cleanup / bug-hunt review | `/simplify`, `/code-review` |

**Coordinate (don't duplicate) with dev:typescript `refactoring-patterns.md`:**
flags→DU, union→ADT, introduce-Result, branded types already live there — we
reference them and add *mechanics depth* + *detection*, not a second copy.

## 5. File Inventory

### SKILL.md (lean, ~200–260 lines, principle-first)
Section order (merges r1 Thermonuclear structure + r5 local house style):
1. Title + 2-sentence mission.
2. **The Spine** — complexity = reachable states; the three forces.
3. **Scope / When to use / When not to** (+ one-line hand-offs).
4. **Before you touch code** — intent-first questions; characterize first;
   safety net → `cognition:testing-design`.
5. **The Core Prompt** — a reusable blockquoted seed (TS-flavored).
6. **Refactor Decision Axes** — table `Axis | Spectrum | What moving it changes`;
   refactor-specific dials; link to `dev:typescript/axes.md` for design-time
   dials (don't duplicate those 6).
7. **Non-Negotiable Standards** — numbered 0–7, rule 0 = meta.
8. **The Mandate** — named self-checks the agent runs on its own output.
9. **Default Workflow** — numbered, one line per step (detect → triage/rank →
   characterize → transform in compiler-green steps → verify → done).
10. **Reference Map** table.
11. **Asset Map** table.
12. **Anti-Patterns / Failure Signals** — short; LLM-slop + over-engineering tells.
13. **Boundaries — related skills / when to hand off** table.
14. **Review Tone & Good Phrases** — lowercase PR-comment library.
15. **Approval Bar / Definition of Done** — presumptive blockers + done criteria.
16. **Core Invariants** — `<invariants><invariant name="…">…</invariant>` (local).
17. Quick Start + skill-usage-disclosure footer.

### references/ (depth, on-demand)
1. `smell-catalog.md` — DIAGNOSE. 5 categories, 23 smells (r4a). Each: signs,
   why it hurts, TS manifestation, **detection signal**, treatment → links to
   mechanics/patterns. Closes with the detection-tooling cheat-sheet.
2. `refactoring-mechanics.md` — TRANSFORM SAFELY. Top TS techniques (r4b) with
   step-by-step safe mechanics; the compiler-as-safety-net cadence; the gated
   workflow + definition of done; commit granularity; characterization tests;
   the "mostly skip in idiomatic TS" list. (G2, G3)
3. `llm-slop-cleanup.md` — the generated-code triage pass (G4) + naming/style
   cleanup (part of G6): arbitrarily named files, structureless mega-files,
   premature abstraction, redundant reimplementation, mixed conventions, dead
   scaffolding, narration comments, naming incoherence — each detect→fix.
4. `paradigms-and-patterns.md` — functional vs class decision procedure (G5) +
   GoF-in-TS verdicts & criticism (r4c) + over-/under-engineering & the
   indirection audit (G6). Includes the collapse map and bidirectional
   migration mechanics.
5. `worked-examples.md` — 5–6 full TS before→after refactors that demonstrate
   the spine (flag soup → DU; primitive obsession → branded; god module → split;
   class hierarchy → composition/DU; nested conditionals → guard clauses; an
   LLM-slop file → cleaned). Each names the smell, the move, and the state-space
   delta.

### assets/ (copy-forward templates — must be genuinely copied, r3)
1. `refactor-plan-template.md` — fill before touching code; doubles as execution
   log + DoD checklist (smell inventory, ranked targets, safety net, per-step
   plan with verification gates, definition of done).
2. `refactor-findings-template.md` — review-output template: priority-ranked
   findings (Thermonuclear 1–7 tiers, TS-flavored), presumptive blockers, and
   before/after sketches, in the good-phrase voice.

## 6. Refactor Decision Axes (locked content for SKILL.md §6)
Each passes the decision test (move the dial → the output changes):
1. **State space** — admits many reachable states (flags/optionals/`any`) ↔
   illegal states unrepresentable (DU + `never`). *Master dial.*
2. **Abstraction** — premature indirection/over-generic ↔ inlined concrete ↔
   abstraction earned by ≥2 real call sites. (over/under-engineering)
3. **Paradigm** — class + inheritance ↔ functions + data + DU. (when each earns it)
4. **Cohesion / placement** — scattered or god-module ↔ one canonical owner.
5. **Type-safety budget** — escape hatches inside the core ↔ sound, parse at the
   boundary. (full treatment → `dev:typescript/axes.md` Safety Budget)
6. **Delete vs rearrange** — relocate the mess ↔ delete the model that caused it.

## 7. Non-Negotiable Standards (locked content for SKILL.md §7)
0. **(meta)** Pursue the simpler *model*, not a tidier version of the same mess.
   Collapse the state space; prefer deletion over rearrangement.
1. Don't grow a module toward ~400+ LOC or a function past ~40–50 LOC / cyclomatic
   ~10 without a structural reason; decompose by responsibility.
2. No new escape hatch (`any`, `as`, `as any`, `!`, `@ts-ignore`,
   `Record<string, any>`) without a written justification; push unsafety to a
   typed boundary (parse, don't validate).
3. Make illegal states unrepresentable: flag/boolean soup and sometimes-set
   optionals → discriminated unions; non-exhaustive switch → `never` exhaustiveness.
4. Prefer boring/explicit over clever/magical: no abstraction without ≥2 real
   call sites; functions over classes unless a class earns it.
5. Keep logic in its canonical module; reuse existing repo helpers; never
   reimplement what the repo already provides.
6. Behavior- and contract-preserving: `tsc --strict` green and tests passing
   after EACH step; no silent public-type drift.
7. Clean the slop you touch: coherent names, no dead scaffolding, no narration
   comments.

## 8. The Mandate (locked content for SKILL.md §8 — self-checks)
- **State-collapse test** — did reachable-state count actually drop?
- **Deletion test** — did I delete complexity or just move it?
- **Compiler-proof test** — is the invariant now enforced by the type checker,
  not a comment/convention/runtime guard?
- **Reuse test** — did I reimplement something the repo already has?
- **Naming-coherence test** — do file names ↔ export names ↔ concepts line up?
- **Swap test** — would the opposite choice (class/function, generic/concrete)
  give an equivalent result? If yes, the abstraction isn't earned.
- **Behavior-preservation test** — external behavior + public types unchanged
  (or intentionally changed and recorded)?
- **Reader test** — fewer concepts to hold in your head than before?

## 9. Quality gates (r3 — definition of done for the skill itself)
- Frontmatter = `name` + `description` only.
- Description: ≥8 quoted triggers + capability sentence + negative boundaries
  naming siblings.
- SKILL.md lean/navigational; depth in references/; maps accurate; no orphans;
  all relative paths resolve.
- Every axis passes the decision test; every standard/mandate item has a reason.
- Every smell is self-detectable → mapped to a remedy.
- ≥1 failure mode with symptom→fix.
- The skill obeys its own mandate (low complexity, no duplication).
- README Skills table updated with exactly one row.

---
name: typescript-refactoring
description: |
  Use when refactoring, simplifying, or reducing complexity in TypeScript/JavaScript
  code. Triggers: "refactor this", "clean up this code", "reduce the complexity",
  "fix this LLM slop", "is this over-engineered?", "functional vs class here?",
  "review this TS for quality". Owns: a code-smell catalog with detection signals,
  compiler-gated refactoring mechanics, first-principles complexity reduction
  (collapsing the reachable-state space), the functions-vs-classes decision,
  over-/under-engineering detection, and cleanup of tangled, structureless generated
  code. Defers to dev:typescript (what good TS and target patterns look like),
  cognition:solution-design (whether to refactor at all), cognition:domain-design
  (module ownership/boundaries), cognition:testing-design (the test safety net),
  dev:architecture (large target-state migrations), and dev:api-design
  (public/exported surface contracts). Not a language tutorial; not a diff-scoped bug
  hunt (use /code-review).
---

# TypeScript Refactoring — Thermonuclear Complexity Reduction

Refactoring is not tidying. It is **collapsing the state space** — shrinking the
set of states the program (and the reader) can be in, ideally so the compiler
proves the collapse. Hold the bar high: assume a dramatically simpler design
exists, find it, and close the diff to it.

This skill is the TypeScript-deep sibling of the Thermonuclear Code Quality
Review. That skill is language-agnostic and review-only; this one carries the
TypeScript substance and the mechanics to *execute* the refactor.

## The Spine: complexity is reachable states

In TypeScript, complexity is the **count of reachable states**. Every `any`,
every optional field, every boolean flag, every non-exhaustive branch multiplies
the states a reader must hold and the program can reach. Three forces follow:

- **Type-level judo.** The highest-leverage move changes the *types* so whole
  categories of runtime branches and bugs become impossible — and code deletes
  itself. The win is **fewer reachable states, not fewer lines.**
- **Delete > rearrange.** Prefer removing complexity over relocating it. A
  refactor that only moves the mess around has not earned its diff. If you can
  delete a concept rather than restructure it, push hard for that path.
- **A repeated branch is a missing model.** Duplicated conditionals or flag
  checks are evidence of a type — usually a discriminated union — that wants to
  exist. Build the model; the branches collapse into it.

Prefer the solution that makes the code feel inevitable in hindsight.

## Scope

**Use this skill when** you are reducing complexity in TypeScript: a file or
module is a mess, code is over- or under-engineered, generated/LLM code needs
untangling, you must choose functions vs classes, or you are doing a quality
review with intent to fix.

**When *not* to use** (hand off — see Boundaries):
- "*Should* we even change this / what's the real problem?" → `cognition:solution-design`.
- "What does good TS / the target pattern look like?" → `dev:typescript`.
- "Where should this live / who owns it?" → `cognition:domain-design`.
- "How do I make this change safe?" (the test net) → `cognition:testing-design`.
- A multi-file target-state migration with a cutover → `dev:architecture`.
- The change reshapes a public/exported API → `dev:api-design`.

## Before you touch code

Answer these out loud first. If you cannot, **ask and stop** — do not guess.
1. **Intent** — what is this code *supposed* to do? What is the simpler model it
   is failing to be?
2. **Contract** — what external behavior and *public types* must stay fixed?
   That is the invariant a refactor may not break.
3. **Safety net** — are there tests that pin the behavior? If not, design a
   characterization net first (→ `cognition:testing-design`), or work in steps
   small enough that `tsc --strict` is your net.
4. **Blast radius** — does this cross a module/published boundary
   (→ `cognition:domain-design`, `dev:api-design`) or is it local?

## The Core Prompt

> Review and refactor this TypeScript for the *simplest correct model*, not a
> cleaner version of the same mess. Count the reachable states: every `any`,
> optional, flag, and unchecked branch is complexity. Find the type-level move
> that makes illegal states unrepresentable and lets the compiler delete the
> branches for you. Prefer deleting a concept over relocating it. Preserve
> external behavior and public types; keep `tsc --strict` and tests green after
> every step. Be thorough and demanding. Measure twice, cut once.

## Refactor decision axes

The dials you turn when *reducing* complexity. Each one changes the output when
you move it. (For greenfield design-time dials — Safety Budget, API Shape,
Boundary Rigidity, Type Origin, Error Channel, Extension Model — see
`dev:typescript` `references/axes.md`; do not re-derive them here.)

| Axis | Spectrum | What moving it changes |
| --- | --- | --- |
| **State space** *(master)* | many reachable states (flags/optionals/`any`) ↔ illegal states unrepresentable (DU + `never`) | how many cases the reader and compiler must track |
| **Abstraction** | premature/over-generic indirection ↔ inlined concrete ↔ abstraction earned by ≥2 real call sites | over- vs under-engineering |
| **Paradigm** | class + inheritance ↔ functions + data + discriminated unions | who holds state, how dispatch happens |
| **Cohesion / placement** | scattered or god-module ↔ one canonical owner | where a change has to be made |
| **Type-safety budget** | escape hatches inside the core ↔ sound, parse at the boundary | where unsafety is allowed to live (full Safety-Budget treatment → `dev:typescript` `references/axes.md`) |
| **Delete vs rearrange** | relocate the mess ↔ delete the model that caused it | whether complexity drops or just moves |

## Non-Negotiable Standards

0. **(meta)** Pursue the simpler *model*, not a tidier version of the same mess.
   Collapse the state space; prefer deletion over rearrangement. Everything
   below serves this rule.
1. **Decompose by responsibility.** Don't grow a module toward ~400+ LOC, a
   function past ~40–50 LOC, or cyclomatic complexity past ~10 without a
   structural reason. *Why: size and branching are the readable proxy for state.*
2. **No new escape hatches.** `any`, `as`, `as any`, `!`, `@ts-ignore`,
   `Record<string, any>` need a written justification; push unsafety to a typed
   boundary (parse, don't validate). *Why: each hatch re-admits the states the
   types were collapsing.*
3. **Make illegal states unrepresentable.** Flag/boolean soup and sometimes-set
   optionals → discriminated unions; non-exhaustive `switch` → `never`
   exhaustiveness. *Why: this is type-level judo — the compiler deletes branches.*
4. **Boring over magical.** No abstraction without ≥2 real call sites; functions
   over classes unless a class earns it (identity + lifecycle + multiple methods
   sharing state). *Why: speculative generality is complexity with no payoff.*
5. **One canonical home; reuse, don't reimplement.** Keep logic in its owning
   module; use existing repo helpers. *Why: duplication is the parent of
   divergent change and shotgun surgery.*
6. **Behavior- and contract-preserving.** `tsc --strict` green and tests passing
   after **every** step; no silent public-type drift. *Why: a refactor that
   changes behavior is a bug with good intentions.*
7. **Clean the slop you touch.** Coherent names, no dead scaffolding, no
   narration comments. *Why: the next reader inherits what you leave.*

## The Mandate — self-checks on your own output

Run these on the refactor you just produced. A "no" is a finding against
yourself.
- **State-collapse test** — did the reachable-state count actually drop (fewer
  optionals/flags/`any`, or a DU the compiler now checks)?
- **Deletion test** — did I delete complexity, or just move it? Could the model
  be simpler still?
- **Compiler-proof test** — is the invariant enforced by the type checker, not a
  comment, convention, or runtime guard?
- **Reuse test** — did I reimplement something the repo already provides?
- **Naming-coherence test** — do file names ↔ export names ↔ concepts line up?
- **Swap test** — would the opposite choice (class/function, generic/concrete)
  give an equivalent result? If yes, the abstraction isn't earned.
- **Behavior-preservation test** — external behavior and public types unchanged,
  or intentionally changed and recorded?
- **Reader test** — fewer concepts to hold in the head than before?

## Default Workflow

1. **Detect.** Inventory smells with `references/smell-catalog.md`; run the
   detection toolkit (knip/ts-prune, jscpd, madge, ESLint complexity, escape-hatch
   grep) to ground intuition in signals.
2. **Triage & rank.** Order targets by leverage: state-space collapse first,
   then deletions, then placement. Note blast radius and what's load-bearing.
3. **Plan.** Fill `assets/refactor-plan-template.md` — targets, the safety net,
   per-step sequence, definition of done. For generated code, run the
   `references/llm-slop-cleanup.md` triage first.
4. **Characterize.** Ensure behavior is pinned (tests, or steps small enough that
   `tsc --strict` is the net). → `cognition:testing-design` for the net's design.
5. **Transform in safe steps.** Apply mechanics from
   `references/refactoring-mechanics.md`; keep `tsc --strict` and tests green
   **after each step**; commit one logical move at a time.
6. **Verify & report.** Confirm behavior/contract held; capture findings and
   before/after with `assets/refactor-findings-template.md`; check against The
   Mandate and the Approval Bar.

## Reference Map

| Reference | Open when |
| --- | --- |
| `references/smell-catalog.md` | Detecting/naming smells — 29 smells (5 classic categories + a TypeScript-native group), TS manifestations + detection signals + tooling cheat-sheet |
| `references/refactoring-mechanics.md` | Executing a transform — the top TS techniques as safe compiler-gated steps, the gated workflow + definition of done, what to skip in idiomatic TS |
| `references/llm-slop-cleanup.md` | The code is AI-generated or structureless — the triage pass for arbitrary names, mega-files, premature abstraction, reimplementation, dead scaffolding |
| `references/paradigms-and-patterns.md` | Choosing functions vs classes, judging over-/under-engineering, or evaluating a design pattern (GoF-in-TS verdicts, the indirection audit, migration mechanics) |
| `references/worked-examples.md` | You want a concrete before→after — six full TS refactors with the state-space delta named |

## Asset Map

| Asset | Use when |
| --- | --- |
| `assets/refactor-plan-template.md` | Starting a refactor — copy and fill before touching code; doubles as execution log + DoD checklist |
| `assets/refactor-findings-template.md` | Reporting a review/refactor — priority-ranked findings, blockers, before/after, in the good-phrase voice |

## Anti-Patterns / Failure Signals

- **Rearranged, not reduced** — files moved, folders renamed, state count
  unchanged. The classic "looks refactored, isn't."
- **Abstraction theatre** — interfaces with one implementation, factories of
  factories, generics that earn nothing (the Swap test fails).
- **Escape-hatch creep** — `as any`, `!`, `@ts-ignore` quietly re-admitting the
  states the types were collapsing.
- **Flag/optional soup** — booleans and sometimes-set optionals encoding a state
  machine that wants to be a discriminated union.
- **LLM-slop tells** — `utils2.ts`, `final`, `helper`, `Manager`; mega-files
  with no internal structure; re-implementations of existing repo utilities;
  narration comments restating the next line.
- **Inheritance for reuse** — class trees where a function + data + DU is simpler
  and safer (exhaustiveness > polymorphism for closed sets).

## Boundaries — related skills / when to hand off

| Skill | Use instead when | What it owns |
| --- | --- | --- |
| `dev:typescript` | You need *what good looks like* / the target pattern | TS philosophy, design-time axes, target patterns (DU, brands, ports, FC/IS, type-state), module-organization, SDK design |
| `cognition:solution-design` | The question is *whether/what* to change | Problem reframing, depth calibration, solution-space navigation |
| `cognition:system-design` | Complexity keeps coming back | Feedback loops, coupling, second-order effects, leverage points |
| `cognition:domain-design` | "Where should this live / who owns it?" | Boundaries, single-authority ownership, bounded contexts |
| `cognition:testing-design` | You need the safety net before changing behavior | What to test, risk-proportional effort, falsification, oracles |
| `cognition:information-design` | Structuring a doc the refactor emits | Hierarchy, progressive disclosure, reader scent |
| `dev:architecture` | A multi-file target-state migration + cutover | Target SPEC, decision packets, migration slices, dependency order |
| `dev:api-design` | The refactor reshapes a public/exported surface | Contracts, consumer model, versioning/evolution |
| `gitnexus-refactoring` | You want graph-safe mechanical rename/move/extract | Reference-safe structural edits across the repo |
| `/simplify`, `/code-review` | A quick diff-scoped cleanup or bug hunt | Changed-code-only review and fixes |

## Review tone & good phrases

Be direct, serious, and demanding about quality. Do not be rude, and do not
soften real maintainability problems into mild suggestions. Lead with the
simpler design; phrase findings as questions that propose the fix:
- "this moves complexity around but doesn't delete it — can the model itself be simpler?"
- "these three booleans encode one state machine; a discriminated union makes the impossible combos unrepresentable."
- "this `as any` re-opens the states the type was closing — can we parse at the boundary instead?"
- "one-implementation interface — what does this abstraction buy us today?"
- "we already have this helper in `<module>`; reuse it rather than reimplement."
- "non-exhaustive switch — add a `never` default so the compiler catches the next case."
- "this file is doing four jobs; splitting by responsibility makes each change local."

## Approval bar / definition of done

Do not approve a refactor merely because behavior seems correct. Presumptive
blockers:
- Reachable-state count did not drop (state-collapse test fails).
- Incidental complexity a type-level move would delete is left in place.
- A new escape hatch was added without justification.
- An abstraction was introduced with one call site / failing the swap test.
- A module crossed the size tripwire without being decomposed.
- A helper was reimplemented instead of reused.
- Public types drifted silently, or `tsc --strict`/tests are not green.

Done when: smells are detected and triaged; the state space is measurably
smaller and compiler-enforced where possible; behavior and public types are
preserved; each step left the build green; The Mandate passes; findings are
recorded.

<invariants>
<invariant name="behavior-preserving">External behavior and public type signatures are held fixed unless a change is intended and recorded. `tsc --strict` and tests are green after every step.</invariant>
<invariant name="state-space-down">A refactor must reduce the reachable-state count or it has not earned its diff. Deletion beats rearrangement.</invariant>
<invariant name="compiler-enforced">Invariants are pushed into the type system (DU + `never`, branded types, parse-at-boundary), not maintained by comment, convention, or runtime guard.</invariant>
<invariant name="compose-dont-duplicate">When another skill owns a topic (target patterns, ownership, the test net, migrations, API contracts), link to it; never restate it here as a second spec.</invariant>
<invariant name="earned-abstraction">No abstraction without ≥2 real call sites and a failing swap test. Speculative generality is a smell, not foresight.</invariant>
</invariants>

## Quick start

1. Read this SKILL.md.
2. Open `references/smell-catalog.md`, inventory the smells, run the detection toolkit.
3. Copy `assets/refactor-plan-template.md`; rank targets by state-space leverage.
4. Transform with `references/refactoring-mechanics.md`, compiler green each step.
5. For generated code, run `references/llm-slop-cleanup.md` first.
6. Report with `assets/refactor-findings-template.md`; check The Mandate and the Approval Bar.

---

*Skill usage disclosure: on completion, state "Skills used: typescript-refactoring"
(add others as applicable).*

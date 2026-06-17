# R1 — Thermonuclear Code Quality Review: reference synthesis

**Purpose:** Study the "Thermo-Nuclear Code Quality Review" skill as the tone/approach reference
for our new TypeScript-specific, first-principles complexity-reduction & refactoring skill. This
document tells us exactly what to emulate, what to quote, and where the white space is.

## Source

- Raw SKILL.md (used):
  `https://raw.githubusercontent.com/cursor/plugins/main/cursor-team-kit/skills/thermo-nuclear-code-quality-review/SKILL.md`
- GitHub dir listing (confirms single-file skill, no references/assets):
  `https://api.github.com/repos/cursor/plugins/contents/cursor-team-kit/skills/thermo-nuclear-code-quality-review`
- HTML view:
  `https://github.com/cursor/plugins/blob/main/cursor-team-kit/skills/thermo-nuclear-code-quality-review/SKILL.md`

The skill is **one file, ~12.4 KB**. There are NO reference files, assets, scripts, or subdirectories.
Everything below is from that single SKILL.md. Frontmatter sets `disable-model-invocation: true`
(invoked explicitly, never auto-triggered) and the description keys off phrases like "thermo-nuclear
code quality review", "thermonuclear review", "deep code quality audit", "especially harsh
maintainability review".

---

## 1. VOICE & TONE

- **Blunt, demanding, unapologetically opinionated** — but explicitly NOT rude. The "Review Tone"
  section codifies this: *"Be direct, serious, and demanding about quality. Do not be rude, but do
  not soften major maintainability issues into mild suggestions."*
- **The "thermonuclear" framing is calibrated severity, not theatrics.** The word "thermo-nuclear"
  appears in the title/frontmatter to signal *unusually strict*, but the body never leans on
  explosion metaphors or edgelord posturing. The intensity is delivered through *standards*
  ("Non-Negotiable", "presumptive blockers", "Approval Bar") rather than through purple prose.
  Lesson: the harshness lives in the *bar*, not in the adjectives.
- **Ambition is the dominant emotional register.** The single most-repeated idea is to be
  *ambitious* about structure — stated in the opening, restated as rule 0, and threaded through
  "code judo". It reframes review from defect-finding to *aspiration toward an inevitable design*.
- **Anti-rubber-stamp / anti-"it works".** Recurrent refrain that correctness is not the bar:
  *"Do not approve merely because behavior seems correct."* / *"Do not rubber-stamp 'it works'
  implementations that leave the codebase messier."*
- **Lowercase, peer-to-peer comment voice.** The "Good phrases" are written like real PR comments —
  lowercase, conversational, ending in a question that proposes the fix. This is a deliberate
  register: senior engineer leaving a comment, not a linter emitting an error.
- **Memorable signature device: "code judo".** A coined term for behavior-preserving restructurings
  that make code *dramatically* simpler by using the existing architecture better. It's the skill's
  branding hook and recurs ~6 times.

### Verbatim phrases to echo (steal the cadence, not the words)

1. *"Prefer the solution that makes the code feel inevitable in hindsight."*
2. *"If you see a path to delete complexity rather than rearrange it, push hard for that path."*
3. *"Do not be satisfied with a merely cleaner version of the same messy idea if there is a
   plausible path to a much simpler idea."*
4. *"this refactor moves complexity around, but doesn't really delete it. is there a way to make
   the model itself simpler?"*
5. *"Measure twice, cut once."*
6. (bonus) *"Treat brittle, ad-hoc, or 'magic' behavior as a code-quality problem."*

---

## 2. STRUCTURE (section skeleton)

```
Frontmatter (name, description, disable-model-invocation: true)
# Thermo-Nuclear Code Quality Review
  ── 2-sentence framing: scope + the "be AMBITIOUS / code judo" thesis (the mission, up front)
## Core Prompt              → a single blockquoted "baseline prompt" the reviewer starts from
## Non-Negotiable Additional Standards   → 8 numbered rules (0–7), each with sub-bullets
## Primary Review Questions  → ~13 questions to ask "for every meaningful change"
## What to Flag Aggressively → ~17-item escalation list (the smell catalog)
## Preferred Remedies        → ~16-item list of fixes to prefer (mirrors the flags)
## Review Tone               → how to speak + "Good phrases" (9 verbatim PR comments)
## Output Expectations       → 7-tier priority ordering of findings + "don't flood with nits"
## Approval Bar              → the pass criteria + "presumptive blockers" list
```

**Architecture of the document (worth copying):**
- **Opens with the mission/thesis, not with rules.** First two paragraphs set ambition + code judo
  before any procedure. The *why* precedes the *what*.
- **Core Prompt as a reusable seed.** A literal blockquote the agent can adopt verbatim as its
  internal instruction. Elegant: gives the model a single dense paragraph to anchor on, then
  layers structured rules on top.
- **Rule 0 is the meta-rule** (ambition / code judo); rules 1–7 are concrete smells. Numbering from
  0 signals "this one governs all the others."
- **Mirrored lists.** "What to Flag" and "Preferred Remedies" are nearly 1:1 — every smell has a
  named cure. This pairing is a strong structural pattern to emulate.
- **Closes with a hard gate.** "Output Expectations" (how to prioritize) then "Approval Bar"
  (when to block). The doc ends on *decision procedure*, not vibes.

---

## 3. HOW IT MAKES YOU THINK (the first-principles mechanism)

This is the most important part to emulate. The skill does NOT operate as a checklist that you tick.
It installs a *stance* and a *search procedure*:

1. **Reframe the goal from "find defects" to "find the inevitable design."** The mission line
   *"Prefer the solution that makes the code feel inevitable in hindsight"* makes the reviewer
   imagine the ideal end-state first, then measure the diff against it.
2. **The "code judo" prime.** *"Assume there is often a 'code judo' move available."* By telling the
   agent to *assume a simplification exists*, it forces active search rather than passive
   acceptance. This is a cognitive forcing function: the default is "there's a better version,"
   not "this is fine."
3. **Delete > rearrange, as a ranked instinct.** Repeatedly insists that removing moving pieces
   beats redistributing them: *"Strongly prefer simplifications that remove moving pieces altogether
   over refactors that merely spread the same complexity around."* This gives a *gradient* to
   optimize along, not a binary pass/fail.
4. **Questions over rules.** The "Primary Review Questions" section is Socratic — 13 questions the
   reviewer asks of *every* change ("Is there a code judo move? Can this be reframed so fewer
   concepts are needed? Is this abstraction actually earning its keep?"). Questions generalize to
   code the checklist never anticipated.
5. **Smell → model, not smell → patch.** The remedies push for *changing the model* ("Reframe the
   state model so conditionals disappear instead of getting centralized") rather than localized
   cleanup. Repeated conditionals are read as *evidence of a missing abstraction*, not as lines to
   tidy. First-principles: the symptom points to a structural cause.
6. **A complexity budget made explicit.** The 1000-line threshold and "concepts a reader must hold
   in their head" turn vague "maintainability" into a measurable pressure the reviewer can apply.

The mechanism in one sentence: **assume a dramatically simpler design exists, hunt for it, prefer
deletion over rearrangement, and treat every repeated branch as a missing model.**

---

## 4. RUBRICS / CHECKLISTS / DECISION PROCEDURES (verbatim)

### Core Prompt (the baseline seed — verbatim)
> Perform a deep code quality audit of the current branch's changes.
> Rethink how to structure / implement the changes to meaningfully improve code quality without impacting behavior.
> Work to improve abstractions, modularity, reduce Spaghetti code, improve succinctness and legibility.
> Be ambitious, if there is a clear path to improving the implementation that involves restructuring some of the codebase, go for it.
> Be extremely thorough and rigorous. Measure twice, cut once.

### Non-Negotiable Additional Standards (the 8 rules, condensed verbatim headers)
- **0. Be ambitious about structural simplification.** (look to make whole branches/helpers/modes/
  conditionals/layers *disappear*; "code judo"; delete complexity rather than rearrange it.)
- **1. Do not let a PR push a file from under 1k lines to over 1k lines without a very strong
  reason.** (strong smell by default; extract before sprawling; explicitly ask to decompose at the
  threshold.)
- **2. Do not allow random spaghetti growth in existing code.** (suspicious of new ad-hoc
  conditionals / scattered special cases / one-off branches; "weird if statements in random places"
  = design problem, not nit.)
- **3. Bias toward cleaning the design, not just accepting working code.** (don't rubber-stamp "it
  works"; prefer removing moving pieces.)
- **4. Prefer direct, boring, maintainable code over hacky or magical code.** (skeptical of generic
  mechanisms hiding data-shape assumptions; flag thin/identity/pass-through wrappers.)
- **5. Push hard on type and boundary cleanliness when they affect maintainability.** (question
  unnecessary optionality, `unknown`, `any`, cast-heavy code; prefer explicit typed models / shared
  contracts; challenge silent fallbacks papering over invariants.)
- **6. Keep logic in the canonical layer and reuse existing helpers.** (feature logic leaking into
  shared paths; reuse canonical utilities; push to the right package/service/module; don't normalize
  architectural drift.)
- **7. Treat unnecessary sequential orchestration and non-atomic updates as design smells when the
  cleaner structure is obvious.** (serialize independent work → consider parallel; half-applied
  state → push for atomic; don't over-index on micro-opts.)

### Output Expectations — priority ordering of findings (verbatim list)
1. Structural code-quality regressions
2. Missed opportunities for dramatic simplification / code-judo restructuring
3. Spaghetti / branching complexity increases
4. Boundary / abstraction / type-contract problems that make the code harder to reason about
5. File-size and decomposition concerns
6. Modularity and abstraction issues
7. Legibility and maintainability concerns

Plus: *"Do not flood the review with low-value nits if there are larger structural issues. Prefer a
smaller number of high-conviction comments over a long list of cosmetic notes."*

### Approval Bar (the gate — verbatim criteria)
> Do not approve merely because behavior seems correct.

The bar for approval is (all must hold): no clear structural regression; no obvious missed
opportunity to make the implementation dramatically simpler when such a path is visible; no
unjustified file-size explosion; no obvious spaghetti-growth from special-case branching; no
obviously hacky or magical abstraction; no unnecessary wrapper/cast/optionality churn; no clear
architecture-boundary leak or avoidable canonical-helper duplication; no missed opportunity for an
obvious decomposition.

**Presumptive blockers** (treated as blockers unless author justifies clearly):
- preserves a lot of incidental complexity when a plausible code-judo move would delete it
- pushes a file from below 1000 lines to above 1000 lines
- adds ad-hoc branching that makes an existing flow more tangled
- solves a local problem by scattering feature checks across shared code
- adds an unnecessary abstraction, wrapper, or cast-heavy contract
- duplicates an existing helper or puts logic in the wrong layer when there's a clear canonical home

### Good phrases (verbatim PR-comment library — note lowercase, question-ending)
- `this pushes the file past 1k lines. can we decompose this first?`
- `this adds another special-case branch into an already busy flow. can we move this behind its own abstraction?`
- `this works, but it makes the surrounding code more spaghetti. let's keep the behavior and restructure the implementation.`
- `this feels like feature logic leaking into a shared path. can we isolate it?`
- `this abstraction seems unnecessary. can we just keep the direct flow?`
- `why does this need a cast / optional here? can we make the boundary more explicit instead?`
- `this looks like a bespoke helper for something we already have elsewhere. can we reuse the canonical one?`
- `i think there's a code-judo move here that makes this much simpler. can we reframe this so these branches disappear?`
- `this refactor moves complexity around, but doesn't really delete it. is there a way to make the model itself simpler?`

**Note on rubrics:** There is **no numeric scoring, no 1–10 scale, no letter grades, no severity
matrix.** Severity is expressed entirely as (a) the ranked priority list above and (b) the binary
"presumptive blocker" gate. "Quality" is never defined by a single metric — it's defined by the
*dimensions* below.

---

## 5. HOW IT DEFINES "QUALITY" (dimensions reviewed)

Quality = maintainability, not correctness. The dimensions, drawn from the rules:
- **Structural simplicity / number of concepts** a reader must hold in their head (the headline metric).
- **Abstraction quality** — is it "earning its keep" or a thin/identity/pass-through wrapper?
- **Spaghetti / branching complexity** — ad-hoc conditionals, scattered special cases, one-off flags.
- **File/module size & decomposition** — the explicit 1000-line tripwire.
- **Type & boundary cleanliness** — optionality, `any`/`unknown`, casts, silent fallbacks, explicit
  contracts.
- **Layer/ownership correctness** — canonical layer, no leakage, reuse over bespoke duplication.
- **Orchestration shape** — unnecessary sequencing, non-atomic/half-applied state.
- **Legibility / directness** — "direct, boring, maintainable" over "magic".

---

## 6. WHAT IT DELIBERATELY DOES NOT DO (the white space)

- **Not language-specific.** TypeScript appears only incidentally (`any`, `unknown`, casts in rule 5).
  No mention of generics, conditional/mapped types, discriminated unions, `satisfies`, inference,
  module resolution, declaration files, build/tsconfig, type-level performance, etc.
- **No concrete code examples.** Zero before/after snippets. It tells you *what* to look for and
  *how to talk*, never *shows* a transformation. (Big opportunity for us.)
- **No tooling / mechanics.** Doesn't reference linters, AST tools, codemods, tests-as-safety-net,
  or *how* to perform a safe refactor without breaking behavior. It's a review/judgment skill, not a
  do-the-refactor skill.
- **No scoring system / quantitative rubric.** Deliberately qualitative + gate-based.
- **Review-time, diff-scoped.** Framed around "the current branch's changes" / "for every meaningful
  change" — it audits a *diff*, not a greenfield design or a from-scratch implementation.
- **No process / workflow.** No steps, no phases, no "first do X then Y." It's a stance + catalog,
  not a procedure.
- **No correctness / security / performance focus.** Explicitly brackets these out ("without
  impacting behavior", "do not over-index on micro-optimizations"). Pure maintainability lens.

---

## 7. WHAT TO EMULATE in our TS skill

1. **Lead with mission + a coined mental model.** Open with the thesis before any rules. Adopt our
   own signature term that plays the role "code judo" plays here (a memorable name for the
   behavior-preserving, dramatically-simplifying move).
2. **Provide a "Core Prompt" seed** — one dense blockquoted paragraph the agent adopts as its
   internal instruction, then layer structured rules on top.
3. **Numbered Non-Negotiable Standards with a rule-0 meta-rule** (ambition / simplification first),
   then concrete TS-specific smells as rules 1..n.
4. **Mirror "What to Flag" ↔ "Preferred Remedies"** — every smell gets a named cure.
5. **Socratic "Primary Review Questions"** the agent asks of every change — generalizes beyond a
   checklist.
6. **A verbatim "Good phrases" library** in lowercase, peer PR-comment voice, each ending in a
   question that proposes the fix.
7. **Close with a priority ordering + a hard Approval Bar / presumptive-blocker gate.**
8. **Make the complexity budget explicit** — the 1000-line tripwire is effective because it's
   concrete. Give our skill TS-flavored concrete tripwires (e.g., type-arg count, union arm count,
   conditional-type nesting depth, `as` casts per file, optional-chain depth) so "complexity" is
   measurable, not vibes.
9. **Adopt the stance: assume a simpler design exists; prefer deletion over rearrangement; treat
   repeated branches as a missing model.** Keep the anti-"it works" refrain.
10. **Tone calibration:** harsh via the *bar*, not via adjectives. Direct, serious, demanding, not
    rude.

---

## 8. WHAT TO OWN DIFFERENTLY (our opportunity / the white space)

1. **TypeScript-as-design-medium, first principles.** Where Thermonuclear is language-agnostic
   maintainability, we own *the type system as the primary tool for deleting complexity*: model the
   domain so illegal states are unrepresentable, push invariants into types so runtime branches
   disappear, replace boolean/flag soup with discriminated unions, use `satisfies`/inference to
   delete casts. Our "code judo" is largely *type-level judo*.
2. **Show, don't just tell — before/after transformations.** Thermonuclear has zero code. We should
   include concrete TS before/after snippets demonstrating each simplification (flag-arg →
   discriminated union; `any`/cast chain → typed boundary; nested optionals → `Result`/tagged-error;
   class hierarchy → tagged union + exhaustive switch).
3. **Be a do-the-refactor skill, not only a review skill.** Thermonuclear is review/diff-scoped. We
   can own *the safe-refactoring mechanics*: how to preserve behavior (tests/types as the safety
   net), incremental migration slices, leaning on the compiler (`tsc --noEmit`), and codemod-style
   sweeps. Cover both greenfield design and existing-code rescue, not just diff audit.
4. **TS-specific smell catalog & tripwires.** `any`/`unknown`/`as` density, type assertions hiding
   invariants, over-generic abstractions ("generics that earn nothing"), barrel-file/module-boundary
   tangles, enum vs union, `interface` vs `type` boundaries, optionality vs explicit
   absence, type-check performance (deep conditional/mapped types) as a maintainability cost.
5. **First-principles framing of TS quality**: types should *encode intent and shrink the state
   space*; the win is *fewer reachable states*, not just fewer lines. Distinguish "incidental
   complexity the language forces" from "essential domain complexity."
6. **Keep correctness/perf out of scope** (same as Thermonuclear) — stay a complexity-reduction /
   maintainability skill, but specialized to TypeScript. Our differentiation is *depth in one
   language*, theirs is *breadth across all code*. We are the sibling that goes deep where they go
   wide.

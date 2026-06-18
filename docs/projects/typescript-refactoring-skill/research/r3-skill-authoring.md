# R3 — Skill Authoring: The Canonical Method (Synthesis + Blueprint)

**Lane:** Research — extract the canonical METHOD for authoring an excellent skill.
**Target consumer:** the workstream building a NEW repo-local skill (TypeScript first-principles complexity-reduction & refactoring).
**Date:** 2026-06-17

## Sources read (fully)

- `dev:resource-skill-builder` — `SKILL.md` + all 6 references (elicitation-playbook, multi-agent-orchestration, research-playbook, skill-doc-template, sync-and-validate, upstream-skill-packs).
- `cognition:create-principles-skill` command (the principle-first build pipeline).
- `hq:skill-authoring` — `SKILL.md` + 3 references (progressive-disclosure, quality-patterns, validation-checklist) + `assets/skill-template.md`.
- **Gold-standard exemplars** (named by create-principles-skill as the structures to absorb): `design:ui-design/SKILL.md` and `cognition:information-design/SKILL.md`.

> Note: `cognition:create-principles-skill` references `references/domain-brief-framework.md` and the `references/principles.md` / `references/critique.md` / `references/axes.md` / `references/where-defaults-hide.md` files of the exemplars. The framework file is not present in the local plugin cache (it lives in the cognition source repo alongside the command), but the command body fully specifies its contents — captured below. The exemplar SKILL.md files themselves were read in full and are the authoritative structural reference.

---

## 0. The three lineages (and which one we follow)

There are three overlapping but distinct skill-authoring doctrines in this toolkit. Knowing which we are building matters because they prescribe different shapes.

| Lineage | Optimizes for | Output shape | Use for our skill? |
|---|---|---|---|
| **hq:skill-authoring** | A lean, reliable, navigational **operator manual** | Purpose → workflow → reference map → invariants → anti-patterns → failure modes | YES — this is the baseline convention (frontmatter rules, progressive disclosure, validation gates). |
| **dev:resource-skill-builder** | Capturing **durable domain knowledge** (a canonical reference doc) | Overview → mental model → patterns → best practices → pitfalls → annotated sources | Partially — borrow the research rigor, authority tagging, and "mental model first" discipline. |
| **cognition:create-principles-skill** | Teaching agents **how to THINK** about a domain (generative principles, not checklists) | The Problem → Where Defaults Hide → Intent/Before-Anything → Decision Axes → The Mandate → Workflow → Reference Map → Invariants → Anti-Patterns → Failure Modes → Boundaries → Quick Start | **YES — this is the primary doctrine for our skill.** A TS refactoring/complexity-reduction skill is principle-first by nature: it must generate correct decisions across unseen code, not list rules that expire. |

**Verdict for our skill:** Build it as a **principle-first skill** (cognition doctrine) that **obeys the hq operator-manual conventions** (frontmatter, progressive disclosure, validation gates, reference maps) and **uses resource-skill-builder's research method** to ground the principles in real authority. The exemplars `ui-design` and `information-design` are the literal structural templates to adapt.

---

## 1. SKILL.md ANATOMY

### 1.1 Frontmatter (HARD RULE)

Frontmatter contains **only two keys**: `name` and `description`. Nothing else. This is a local convention enforced by the sync validator (`sync-and-validate.md` programmatically asserts `bad = [k for k in keys if k not in ("name","description")]` and fails on extras). No `version`, no `tags`, no `argument-hint` (that's for commands, not skills).

```yaml
---
name: <skill-slug>            # kebab-case, matches the directory name
description: |               # block scalar; see format rules below
  This skill should be used when the user asks to "<trigger 1>", "<trigger 2>",
  ... or needs <specific outcome>. <One sentence on what it provides.>
  Not for <X> — use <other-skill> for that.
---
```

- `name`: kebab-case slug, **must equal the folder name**. (Plugin-namespaced skills appear as `plugin:skill` but the `name` field itself is the bare slug.)
- `description`: a **YAML block scalar** (`|`) so it can span lines. This is the ONLY part of the skill always loaded into context — it is the trigger surface. See §5 for the exact format.

### 1.2 Description format & length (the discovery/trigger engine)

The description is loaded for **every** prompt; the body is loaded only when the skill fires. So the description must do two jobs in a tight budget: **fire at the right time** and **NOT fire at the wrong time**.

Canonical format (from `skill-template.md` + validation-checklist + the exemplars):

```
This skill should be used when the user asks to "<trigger 1>", "<trigger 2>", "<trigger 3>",
… or needs <specific outcome>. <1 sentence: what the skill provides / its domain>.
Not for <adjacent case> — use <other-skill> for that. [repeat boundaries as needed]
```

Rules:
- **5–12 concrete trigger phrases** — the literal words users actually type, in quotes. (validation-checklist: "`description` includes 5-12 concrete trigger phrases.")
- **Lead with quoted trigger phrases**, then a capability sentence, then **explicit negative boundaries** ("Not for X — use Y").
- **Length:** roughly 1–4 sentences / ~300–600 characters of substance. `ui-design` is deliberately terse (one scope sentence + one negative). `information-design` and `dev:typescript` are long (many quoted triggers + capability + multiple boundaries). For a skill that must **fire precisely and link out heavily**, model on the longer `information-design`/`dev:typescript` style: many triggers + clear negatives.
- The `dev:typescript` skill already in this repo is the closest sibling — study its description: it enumerates ~15 quoted triggers, states the domain ("design medium, not a language tutorial"), and lists what it covers. Our skill must **carve a boundary against `dev:typescript`** (philosophy/architecture) so the two don't misfire on each other.

### 1.3 Body section structure

Two valid skeletons depending on doctrine. **We use the principle-first skeleton** (below), which is what `create-principles-skill` Stage 4 prescribes and what both exemplars instantiate.

**Principle-first SKILL.md skeleton (adapt; do not copy verbatim):**

1. **Title + one-line essence** — e.g. "Reduce complexity from first principles. Not cleanup — design."
2. **Scope** — Use for / Not for (with redirects to sibling skills).
3. **The Problem** — what agents get wrong *by default* in this domain and *why* (the mechanism). This is the hook that justifies the whole skill. (ui-design: "You will generate generic output… intent lives in prose, but code generation pulls from patterns.")
4. **Where Defaults Hide** — the specific traps, each as: *what it looks like → why the agent does it → what principle it violates*. Summary here; deep version in `references/`.
5. **Before Doing Anything** — the intent/diagnosis questions to answer *out loud* before acting. (ui-design "Intent First"; info-design "Before Structuring Anything".)
6. **The Decision Axes** — a **table** of 4–7 axes: `Axis | Spectrum | What It Changes`. Each axis is a dial; moving it changes the output. Depth in `references/axes.md`.
7. **The Mandate** — named self-checks to run *before delivering* (the "swap test", "logic test", etc.). This is the quality gate the agent applies to its own output.
8. **Default Workflow** — ordered, actionable steps for the most common case (Assess → Diagnose → Design → Execute → Check).
9. **Reference Map** — table: `Reference | Path | Open when`. Every reference linked here (one-hop rule).
10. **Core Invariants** — `<invariants>` block with named `<invariant name="...">` tags (rules worth enforcing in review).
11. **Anti-Patterns** — named, brief catalog (deep version in references/).
12. **Failure Modes** — `Symptom → Fix` pairs.
13. **Boundaries** — explicit "This skill is NOT …" naming adjacent skills.
14. **Commands** (if any) — assess / reshape / critique trio.
15. **Quick Start** — minimal steps for the most common entry point.

Not every section is mandatory; but for a principle-first skill, sections 3–8 + 9 + 10 + 13 are the load-bearing bones. Drop sections that don't earn their place rather than padding.

### 1.4 Length discipline (when to split to references/)

- **SKILL.md stays lean and navigational.** It is the always-loaded-when-triggered interface; everything else is on-demand.
- **The test (progressive-disclosure):** "Read only `SKILL.md`: can you follow the default workflow without guessing?" If yes, depth belongs in references/.
- **Practical ceiling:** the exemplars run ~150–390 lines. `information-design` (~170 lines) is the better model for *lean* — it pushes all deep treatment to references (`where-defaults-hide.md`, `axes.md`, `principles.md`, `examples.md`). `ui-design` (~390 lines) is on the heavy side because it inlines a lot of craft detail; treat it as the *upper* bound, not the target.
- **Split trigger:** when a section's depth exceeds what's needed to *follow the workflow*, move the depth to a reference and leave a 2–4 line summary + a link. "If a section grows, move depth into `references/` and keep `SKILL.md` navigational."
- **Rule of thumb for ours:** aim for SKILL.md ≈ 150–250 lines. The Problem / Where Defaults Hide / Axes / Mandate stay summarized in SKILL.md; full catalogs (every default, every axis explained, before/after code transformations, the complexity-metric playbook) go to references.

---

## 2. PROGRESSIVE DISCLOSURE — what goes where

Three buckets (hq:progressive-disclosure + resource-skill-builder writing workflow):

| Bucket | Contains | Loaded when | Decision rule |
|---|---|---|---|
| **`SKILL.md`** | Purpose, when-to-trigger, the principles in summary, decision axes table, the mandate, default workflow, links | Every time the skill triggers | "If it must be read *every time* the skill triggers → SKILL.md." |
| **`references/*.md`** | Deep treatment of each axis; full default/anti-pattern catalog; before/after worked examples; per-pattern playbooks; troubleshooting; the "theory behind" the principles | On demand, when a branch/variant needs it | "If it's only needed in *some* branches/variants → references/." |
| **`assets/*`** | Copy-forward templates and skeleton outputs (e.g. a refactor-plan template, a complexity-audit report skeleton) — meant to be **copied into the output**, not read as docs | When producing an artifact | "If it's meant to be *copied into output* → assets/." |

Operating rules:
- **One-hop rule:** SKILL.md links directly to every reference/asset. No chains (`SKILL.md → ref-a → ref-b`).
- **No orphans:** every file in references/ and assets/ must be linked from SKILL.md, or delete it. (Validator checks this: `missing = [name for name in ref_files if f"references/{name}" not in text]` must be empty.)
- **References = documentation to read; assets = templates to copy.** Don't put heavy explanation in assets ("templates as documentation" anti-pattern); don't put copy-forward boilerplate in references.
- **Split big references** into multiple small files; if a reference is large, add suggested search terms at the top.
- **Progressive-disclosure test:** open each linked reference — does it earn its existence? If not linked → link or delete.

For our skill specifically, a likely layout:
- `references/where-defaults-hide.md` — the full catalog of TS complexity defaults (premature abstraction, type gymnastics, boolean-prop proliferation, over-generic generics, etc.).
- `references/axes.md` — each decision axis explained with how position changes the refactor.
- `references/principles.md` — the generative principles + the reasoning behind them.
- `references/examples.md` — before/after worked refactors (the load-bearing proof).
- `references/critique.md` — the post-refactor craft critique protocol.
- `assets/refactor-plan-template.md` — copy-forward plan skeleton (only if it earns it).

---

## 3. PRINCIPLE-FIRST DESIGN — the core idea + concrete techniques

**The central thesis** (create-principles-skill): a skill should **activate latent knowledge and teach how to THINK**, not list rules that expire. "Capture the durable thinking of a domain — decision frameworks that produce correct choices across contexts, not checklists that expire. The principles generate decisions; the skill doesn't just describe them."

Why this matters for us: rules ("max 3 params", "no `any`") are brittle and context-blind. A complexity-reduction skill must produce the *right* call on code it has never seen — that requires generative principles + decision procedures, not a lint list.

### Concrete techniques used to achieve "teach how to think":

**(a) Name the failure mechanism, not just the failure.** The Problem section explains *why* the agent defaults ("intent lives in prose, but code generation pulls from patterns; the gap is where defaults win"). Naming the mechanism lets the agent self-detect it.

**(b) "Where Defaults Hide" — make invisible decisions visible.** Defaults disguise themselves as infrastructure ("typography feels like a container"; "bullets feel like structure"). Each entry: *what it looks like → why you do it → what it violates*. For us: "premature abstraction feels like good engineering"; "a generic type parameter feels like flexibility."

**(c) Intent-first / "Before Doing Anything" questions.** Force explicit answers (out loud, to self or user) before acting: who/what/how. For refactoring: *What is this code's actual job? What changes together? What is the simplest thing that could replace this? Who maintains it?* "If you cannot answer these specifically, stop. Ask. Do not default."

**(d) Decision axes (the heart of generativity).** Replace rules with **dials**. A 4–7 row table: `Axis | Spectrum | What It Changes`. The axes are independent. The **decision test** validates each axis: "If I move the dial, does the output actually change in a meaningful way?" Kill any axis that doesn't change the decision; merge axes that always move together. (info-design's six axes are the model.)

**(e) Principles in three tiers** (create-principles-skill Stage 2):
- **Tier 1 — Universal** (always apply, regardless of axis position).
- **Tier 2 — Axis-dependent** (apply when a given axis is in play).
- **Tier 3 — Heuristics** (rules of thumb *with known exceptions*).
Every principle must pass two tests:
  - **Decision test:** applied to a concrete scenario, does it tell you to do something *different* than your default?
  - **Swap test:** could you swap the principle for its opposite and get equivalent results? If yes, it's doing no work — sharpen or kill it.

**(f) The Mandate — self-applied quality gates.** Named tests the agent runs on its *own* output before delivering. The naming makes them referenceable ("the swap test", "the squint test", "the logic test", "the noise test", "the scent test"). For us, invent domain-specific ones, e.g.:
  - *The deletion test:* could this abstraction be deleted and the code get simpler? Then it's not earning its place.
  - *The swap test:* if you swapped this refactor for "do nothing", would complexity meaningfully drop? If not, you didn't reduce complexity.
  - *The reader test:* can someone unfamiliar follow the control flow without jumping between files?

**(g) Principles vs rules — the explicit distinction.** Rules say *what*; principles say *why + how to decide*. The skill must justify every directive with reasoning so the agent can extrapolate. ("Every Choice Must Be A Choice — for every decision you must be able to explain WHY. If your answer is 'it's common' or 'it works' you haven't chosen, you've defaulted.")

**(h) The skill is its own test case.** Apply the domain's principles to the skill's own structure. A complexity-reduction skill must itself be low-complexity and well-factored. If it violates its own mandate, either the mandate is wrong or the skill is.

**(i) Exemplar-driven, not template-driven.** Absorb ui-design/information-design's *bones*, then adapt — don't fill in a template. "These are not templates to fill in. They're exemplars to absorb."

---

## 4. THE skill-doc-template (its shape, summarized)

Two templates exist; pick per doctrine.

**(A) hq `assets/skill-template.md` (operator-manual shape):** frontmatter (name+description) → `## Purpose` → `## When to use` → `## Non-goals / boundaries` → `## Default workflow` (numbered) → `## Reference map` (table) → `## Asset map` (table, optional) → `## Core invariants` (`<invariants>` block) → `## Anti-patterns to avoid` → `## Failure modes (symptom → fix)` → `## Quick start`. Designed to be copied, then trim unused sections.

**(B) resource-skill-builder `references/skill-doc-template.md` (canonical-reference shape):** frontmatter → Subject and scope (+ out of scope) → Version + date context → Overview (1 para: what/why/problems solved) → Key concepts (mental model, optional Mermaid) → Common patterns (minimal snippets) → Best practices → Constraints and pitfalls → **Annotated sources** (grouped by `[Official]/[Maintainer]/[Community]`) → "How this relates to our world" (optional, observational) → Summary (3–5 takeaways + when-to-use + what-next).

**For our skill:** use the **principle-first skeleton from §1.3** (which neither template fully captures — it comes from create-principles-skill Stage 4 and is realized in the exemplars). Borrow from (A) the invariants/failure-modes/reference-map mechanics, and from (B) the "Annotated sources" + version/date discipline if we cite external TS authority.

---

## 5. DESCRIPTION / TRIGGER writing rules

The description is the firing mechanism. Get it right or the skill never runs (or runs constantly and annoys).

**Do:**
- Open with the canonical stem: `This skill should be used when the user asks to "…", "…", …`.
- Include **5–12 quoted, literal trigger phrases** — the exact words a user types. For ours: "reduce complexity", "simplify this code", "refactor this", "this is over-engineered", "untangle this", "this file is too complex", "extract this", "flatten this abstraction", "remove this indirection", "first-principles refactor", "this has too many layers".
- State the **capability/domain** in one sentence after the triggers.
- Add **explicit negative boundaries** that name the sibling skill: `Not for general TypeScript architecture/philosophy — use the typescript skill. Not for safe-rename/move mechanics — use gitnexus-refactoring.`
- Keep triggers **specific to this skill's job-to-be-done**; near-misses are fine to *exclude* via the negative boundary.

**Don't:**
- Trigger soup: a broad keyword dump ("code, refactor, clean, improve, fix, help") → constant misfires.
- Vague verbs: "help", "stuff", "work with", "improve" *alone*.
- Omit boundaries when an adjacent skill exists (here `dev:typescript`, `gitnexus-refactoring`, `simplify`/`code-review` slash commands all overlap — disambiguate explicitly).

**Boundary collision check (mandatory for us):** there is already a `dev:typescript` skill and a `/simplify` command and `gitnexus-refactoring`. Our description MUST carve a non-overlapping lane: *first-principles complexity reduction & structural refactoring of TS* vs. typescript=*design philosophy/architecture reference*, /simplify=*apply quick cleanups to the current diff*, gitnexus-refactoring=*mechanical rename/move/extract via the graph*. Validation-checklist: "If the skill is easy to confuse with another, document a boundary ('do not use when …')."

---

## 6. ASSETS vs REFERENCES — distinction + naming

| | `references/` | `assets/` |
|---|---|---|
| **Purpose** | Documentation the agent *reads* for depth | Templates/skeletons the agent *copies* into output |
| **Loaded** | On demand, into context, to inform reasoning | Copied/instantiated, not "read as docs" |
| **Content** | Variants, deep patterns, checklists, troubleshooting, failure modes, theory, worked examples | Copy-forward templates, skeleton outputs, copy-forward checklists; only minimal embedded guidance (short comments OK) |
| **Anti-pattern** | "duplicate truth" (copy/pasting canonical docs without a reason) | "templates as documentation" (heavy explanation belongs in references, not assets) |
| **Invariant** | linked from SKILL.md (no orphans) | "Assets are meant to be copied into outputs, not loaded as docs" + must be copy-ready without hidden context |

**Naming conventions:**
- Files are kebab-case `.md` (for references). Name by *what they're for / when opened*, not by sequence: `where-defaults-hide.md`, `axes.md`, `principles.md`, `examples.md`, `critique.md`. (resource-skill-builder: "one file per subdomain", e.g. `deployment.md`, `react.md`.)
- The folder slug = the `name` field = kebab-case.
- Assets named by the artifact they produce: `refactor-plan-template.md`, `complexity-audit-report.md`.
- Avoid deep nesting; keep references/ and assets/ flat (one level).

---

## 7. QUALITY GATES / VALIDATION — what makes a skill pass review

Combine three checklists into one definition-of-done.

### 7.1 hq validation-checklist (the 14-gate baseline)

**Frontmatter & triggering**
- [ ] Frontmatter contains only `name` and `description`.
- [ ] `description` includes 5–12 concrete trigger phrases (what users actually say).
- [ ] No vague triggers ("help", "stuff", "work with").
- [ ] If confusable with another skill, an explicit boundary is documented ("do not use when …").

**SKILL.md body (operator manual)**
- [ ] Purpose and boundaries are explicit.
- [ ] Default workflow is ordered and actionable (not prose-only).
- [ ] SKILL.md is navigational, not encyclopedic.
- [ ] Reference/asset maps exist and are accurate.

**Progressive disclosure**
- [ ] Deep detail lives in `references/` (not in SKILL.md).
- [ ] No orphan references/assets (everything linked from SKILL.md).
- [ ] Assets are copy-ready without hidden context.

**Failure modes & safety**
- [ ] At least one failure mode documented (symptom → fix).
- [ ] High-risk ambiguity requires an explicit "ask and stop" rule.

**Regression guard (for refactors)**
- [ ] Important content was moved, not silently dropped.
- [ ] Paths referenced in docs exist and are correct.

### 7.2 Principle-first additional gates (create-principles-skill Stage 6 + process invariants)

- [ ] **Decision test on every axis:** moving the dial changes the output. No dead axes.
- [ ] **Decision + swap test on every principle:** it changes behavior vs. default; its opposite would NOT give equivalent results.
- [ ] **Anti-patterns are recognizable, mapped, and remediated:** each is self-detectable, mapped to a specific principle violation, and has a concrete "instead, do this".
- [ ] **The skill passes its own mandate** (apply the domain's principles to the skill's own structure).
- [ ] **60-second skim test:** someone skimming SKILL.md knows what it does.
- [ ] **Reference structure matches how the skill is USED, not how it was researched.**
- [ ] **The open-ended case works:** if a user says "this code is a mess, fix it", the skill gives enough guidance to act.
- [ ] **Durability:** would these principles still be correct in 5 years? (Avoid time-bound project status, version-pinned trivia in SKILL.md.)
- [ ] **Boundary clarity with adjacent skills** (no confusing trigger overlaps).
- [ ] All cross-references resolve (no broken paths). Run the sync validator.

### 7.3 Common failure modes to AVOID (named, so review can cite them)

- **Trigger soup** — broad keyword dump → constant misfires. (Fix: specific quoted triggers + negative boundaries.)
- **Wall of text** — everything in SKILL.md, nothing navigable. (Fix: push depth to references/.)
- **Orphan references** — deep docs exist but SKILL.md never links them. (Fix: link or delete.)
- **Duplicate truth** — copy/pasting canonical docs without reason. (Fix: synthesize, link, don't mirror.)
- **Templates as documentation** — heavy explanation in assets. (Fix: explanation → references; assets stay copy-ready.)
- **Rules without reasoning** — directives with no "why" → agent can't extrapolate. (Fix: every directive earns a principle/justification.)
- **Frontmatter drift** — any key beyond name/description → sync validator fails.
- **Decorated, not designed** — formatting (bold/bullets/rules) substituting for actual structure. (Fix: the logic test — remove formatting, does the flow hold?)

### 7.4 Mechanical validation (run before "done")

The sync-and-validate Python check asserts (1) YAML frontmatter exists, (2) top-level keys ⊆ {name, description}, (3) every `references/*.md` is linked in SKILL.md. Run an equivalent check on our skill before shipping even if we don't sync to Codex. Also: confirm every path mentioned in the reference/asset maps actually exists.

---

## 8. CROSS-LINKING to OTHER skills (critical — ours must link out heavily)

This is a first-class concern for our skill, which is meant to be a hub that routes into the broader TS ecosystem.

**How the canon handles cross-linking:**
- **Boundaries section names siblings explicitly** (information-design's "This skill is not:" lists diataxis, docs-architecture, style guides, data-viz — each with the *distinction* and the *redirect*). Do the same: name `dev:typescript`, `gitnexus-refactoring`, `dev:vercel-composition-patterns`, `/simplify`, `/code-review`, and say when to defer to each.
- **Scope redirects inline** (ui-design: "Not for … Redirect those to `/frontend-design`").
- **Commands listed** as a trio at the bottom (`/info:assess`, `/info:reshape`, `/info:critique`) — if we build companion commands, surface them here.
- **create-principles-skill Stage Pre/Step 2 ("Ground in the domain")** — before authoring, read adjacent skills' SKILL.md and write an `adjacency-map.md` noting concepts to reference, boundaries to respect, handoff points. This is the *input* that makes good cross-links possible.
- **Reference Map / Asset Map tables** are the in-skill navigation surface; the **Boundaries** + **Commands** sections are the out-of-skill navigation surface.
- **Cross-reference contract (multi-agent-orchestration "Integration contract"):** "Ensure each reference links to related references (cross-reference map). Resolve conflicts explicitly." If our references cross-cite each other, keep a coherent cross-reference map and avoid contradictions.

**Concrete recommendation for our skill:** add a **"Related skills / when to hand off"** subsection (inside Boundaries) as a table: `Skill | Use instead when | What it owns`. List `dev:typescript` (philosophy/architecture decisions), `gitnexus-refactoring` (graph-safe mechanical rename/move/extract), `dev:vercel-composition-patterns` (React-specific composition), `cognition:information-design` / `cognition:system-design` (for non-code structural reasoning), and the `/simplify` + `/code-review` slash commands (diff-scoped cleanup vs. structural redesign). This both prevents trigger collisions and makes the skill a genuine hub.

---

## 9. THE BLUEPRINT (concrete + prescriptive)

### 9.1 Frontmatter spec (drop-in)

```yaml
---
name: <our-slug>            # e.g. typescript-refactoring or reduce-complexity (kebab; = folder name)
description: |
  This skill should be used when the user asks to "reduce complexity", "simplify this code",
  "refactor this", "untangle this", "this is over-engineered", "this file is too complex",
  "flatten this abstraction", "remove this indirection", "first-principles refactor",
  "extract this", or needs to redesign TypeScript code to be structurally simpler.
  Provides generative principles for finding the real shape of a problem, removing premature
  abstraction and indirection, and reducing complexity from first principles.
  Not for general TypeScript design/architecture philosophy — use the typescript skill.
  Not for graph-safe mechanical rename/move/extract — use gitnexus-refactoring.
  Not for diff-scoped quick cleanups — use the /simplify command.
---
```

### 9.2 Section skeleton (use this for SKILL.md)

```
# <Title — e.g. "Reduce Complexity From First Principles">
<one-line essence: "Not cleanup — design. Find the real shape, then remove everything else.">

## Scope            (Use for / Not for + redirects)

## The Problem      (what agents do by default in TS + the mechanism — why)

## Where Defaults Hide   (the traps, summarized; → references/where-defaults-hide.md)

## Before Touching Code  (intent/diagnosis questions to answer out loud)

## The Decision Axes     (table: Axis | Spectrum | What It Changes; → references/axes.md)

## The Mandate           (named self-checks: deletion test, swap test, reader test…)

## Default Workflow      (Assess → Diagnose → Design → Refactor → Verify, numbered)

## Reference Map         (table: Reference | Path | Open when)

## Core Invariants       (<invariants> with named tags)

## Anti-Patterns         (named, brief; deep → references/where-defaults-hide.md)

## Failure Modes         (Symptom → Fix)

## Boundaries            ("This skill is NOT…" + Related-skills handoff table)

## Commands              (if we build assess/reshape/critique companions)

## Quick Start           (minimal steps for the most common request)
```

### 9.3 Progressive-disclosure rules (apply mechanically)

1. SKILL.md target ≈ 150–250 lines, navigational. If a section's depth exceeds "enough to follow the workflow", split it.
2. Each axis/default/principle: 1-line summary in SKILL.md, full treatment in references/.
3. Worked before/after refactors → `references/examples.md` (NOT SKILL.md).
4. Copy-forward artifacts (refactor plan, audit report) → `assets/` only if they'll actually be copied.
5. One-hop, no-orphans: every reference/asset linked from SKILL.md; every link resolves.

### 9.4 Principle-first techniques to apply (checklist for authoring)

- [ ] Open with The Problem + the *mechanism* of the default.
- [ ] Build "Where Defaults Hide" as *what it looks like → why → what it violates*.
- [ ] Force intent questions before action ("ask and stop" if unanswerable).
- [ ] Express the method as 4–7 **decision axes** (table), each passing the decision test.
- [ ] Write principles in 3 tiers (universal / axis-dependent / heuristics); each passes decision + swap tests.
- [ ] Define named **mandate self-checks** the agent runs on its own output.
- [ ] Justify every directive with a "why" (no rules without reasoning).
- [ ] Make the skill obey its own mandate (low-complexity, well-factored).
- [ ] Adapt ui-design / information-design bones; don't fill a template.

### 9.5 Quality-gate checklist (definition of done — run before shipping)

- [ ] Frontmatter = name + description only (mechanical check passes).
- [ ] Description: 5–12 quoted triggers + capability sentence + explicit negative boundaries naming `dev:typescript`, `gitnexus-refactoring`, `/simplify`.
- [ ] SKILL.md lean (~150–250 lines), navigational; deep content in references/.
- [ ] Reference Map + Asset Map present and accurate; no orphans; all paths resolve.
- [ ] Every decision axis passes the decision test (dial moves → output changes).
- [ ] Every principle passes decision + swap tests.
- [ ] Anti-patterns are self-detectable, mapped to a principle, and have a remedy.
- [ ] ≥1 failure mode (symptom → fix); high-risk ambiguity → explicit "ask and stop".
- [ ] 60-second skim test passes; open-ended "this is a mess, fix it" case is answerable.
- [ ] The skill passes its own mandate.
- [ ] Durable (no time-bound trivia in SKILL.md); would hold in 5 years.
- [ ] Boundaries clear vs. all adjacent skills (no trigger collision).
- [ ] Cross-links: Boundaries section has a Related-skills handoff table; references cross-cite coherently.

### 9.6 Authoring process (lift from create-principles-skill, lightweight)

1. **Ground:** read adjacent skills (`dev:typescript`, `gitnexus-refactoring`, `cognition:system-design`, `vercel-composition-patterns`), write an adjacency map (concepts to reference, boundaries, handoffs).
2. **Research → write before you synthesize:** capture raw source material to file before interpreting (authority-weighted; tag `[Official]/[Maintainer]/[Community]`).
3. **Axes:** extract 4–7 decision axes; kill dead ones (decision test).
4. **Principles:** three tiers; decision + swap tests.
5. **Defaults:** catalog TS complexity anti-patterns (recognizable → mapped → remedy).
6. **Architecture:** decide SKILL.md vs references vs assets; produce an outline; confirm.
7. **Write:** SKILL.md first (the interface), then references in reach-for order.
8. **Validate:** run §9.5; run mechanical frontmatter/link check; run the skill's own mandate against itself; finally run `info:critique` on the SKILL.md.
```

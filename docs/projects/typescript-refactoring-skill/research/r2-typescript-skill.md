# R2 — `dev:typescript` Skill: Ownership Map, Overlap → Link Targets, and Gaps

**Research lane:** R2 (existing-skill audit for the new "Thermonuclear-for-TypeScript" complexity-reduction + refactoring skill)
**Source under review:** `dev:typescript` skill at `~/.claude/plugins/cache/local/dev/0.1.0/skills/typescript/`
**Files read in full:** `SKILL.md`, `references/{axes, design-patterns, ecosystem, integration-combos, module-organization, philosophy, real-world-examples, refactoring-patterns, sdk-design, where-defaults-hide}.md`
**Bottom line:** This skill is a *design/architecture-altitude* discipline. It owns the "what good looks like, choose your position, parse at boundaries" layer richly. It is **thin-to-absent** on (a) a named code-smell catalog with detection signals, (b) mechanical step-by-step refactoring recipes, (c) an end-to-end refactor decision procedure with verification gates, (d) cleaning up LLM slop, and (e) a real functional-vs-class decision procedure. Those gaps define what our new skill must own.

---

## 1. OWNERSHIP MAP (per file)

### `SKILL.md` — the router + the mandate
- Owns the **framing**: "You will write TypeScript like JavaScript with annotations." Defines the core problem (decorating code with types instead of designing with types as material) and "The Spirit of TypeScript" (two programs, types as design material, inference as primary interface, proportional complexity).
- Owns **"Before Designing Anything"** — the four questions: *What are the boundaries? What must be enforced and where? Who consumes this? How will this grow?*
- Owns **The Mandate** — six pre-delivery checks: inference test, honesty test, proportionality test, boundary test, swap test, consumer test. Plus **Core Invariants** (`two-programs`, `types-are-api`, `inference-first`, `proportional-complexity`, `parse-at-boundaries`, `one-strategy-per-boundary`, `mandate-before-delivery`).
- Owns the **workflow index** (design new subsystem / refactor safely / evaluate-critique) and the **Reference Map** table. Note: its "Refactor safely" workflow is only 7 high-level bullets that *point to* `refactoring-patterns.md` — it is a pointer, not a procedure.

### `references/axes.md` — the six decision axes (the crown jewel)
- Owns the **six independent design dimensions**, each as a spectrum with "when to choose," code for each pole, and "warning sign you've gone too far": **Safety Budget** (minimal ↔ make-illegal-states-unrepresentable), **API Shape** (data-first ↔ builder-first), **Boundary Rigidity** (fluid ↔ enforced `exports`), **Type Origin** (annotation-first ↔ inference-first), **Error Channel** (exceptions ↔ Result/typed unions), **Extension Model** (closed sealed unions ↔ open registries/hooks).
- Owns the **Decision Framework** with a *default position* + *trigger to move* + *warning-sign-you-overshot* for every axis (e.g. Safety default = "middle ground, strict:true + brands for critical ids"; over-engineering warning = "new members spend days understanding the type system instead of shipping").
- Owns the **Expression Problem** framing (closed = easy new ops/hard new cases; open = easy new cases/hard new ops) and the "positions shape an architecture" worked example.

### `references/philosophy.md` — the "why," build-from-zero, and when-TS-is-wrong
- Owns the **two-programs** doctrine in depth (lying types vs honest types; `as` = "you are lying to the compiler"), inference-friendly vs annotation-heavy, **proportional complexity**, **data-first vs class hierarchies**, boundary discipline (the "fortress").
- Owns **Building from Zero** (a 6-step ordering: identify boundaries → model domain in types → let types tell you the API shape → place effects at the edges → design extension points upfront → choose error strategy upfront).
- Owns **When TypeScript Is Wrong** (CPU-bound hot paths, systems programming, short-lived scripts, teams-under-time-pressure, type-check-time dominates iteration, when-JS-is-fine) and **The Structural Typing Advantage** + 6 decision principles (Types Are the API; Inference Is the Primary Interface; Proportional Complexity; **Parse, Don't Validate**; One Strategy Per Subsystem; The Compiler Is Your Refactoring Engine).

### `references/where-defaults-hide.md` — the *default* catalog (closest thing to a smell catalog)
- Owns **8 named structural defaults**, each with "what it looks like / why it happens / what principle it violates / the fix / the rule": (1) `any` as problem-solving, (2) types divorced from values, (3) flat uniform module structure, (4) class-heavy OOP, (5) over-engineered type safety, (6) ignoring the runtime, (7) inconsistent error handling, (8) export everything hide nothing.
- Owns a **Self-Check** — scan-your-own-output checklist mapping each default to its fix.
- IMPORTANT for our gap analysis: these are **design/type-honesty defaults**, NOT a general code-smell catalog. They are oriented to "types lying about runtime" and "boundaries not enforced," not to long functions, deep nesting, duplication, dead code, poor naming, feature envy, primitive obsession, etc. (See Gaps.)

### `references/design-patterns.md` — the pattern catalog (runtime + type-level)
- Owns a **grouped catalog**: (A) model domain invariants — discriminated unions/ADTs, opaque/branded types, type-state, boundary parsing, phantom types; (B) type-driven APIs — accumulating-generic builders, `satisfies` conformance gate, overloads-vs-unions, constraint-first generics, infer-based extractors; (C) coordinate behavior — strategy via function injection, command+handler map, state machine, typed pub/sub event maps, middleware/pipeline; (D) scale architecture — functional core/imperative shell, ports & adapters, CQRS+event sourcing, plugin architecture, monorepo boundary types; (E) type-level power tools — `unique symbol` brands, `as const`+`satisfies`, template-literal DSLs, non-distributive conditionals.
- Owns **selection heuristics** and a **pitfalls/anti-patterns** list (types-as-truth fallacy, type-level overfitting, union explosion, `any` creep, boolean-flag/optional soup, base-class framework, leaky boundaries, ambient/augmentation abuse, error-channel confusion).
- Owns a **Symptom (code smell) → Refactoring move → Likely pattern(s)** cross-link table (9 rows; e.g. "Many booleans control behavior → replace flags with tagged union input → A1, C3").

### `references/refactoring-patterns.md` — TS-specific refactoring *moves* (the most relevant existing file)
- Owns the **mental model** ("the compiler is a change detector / dependency graph / change-impact analyzer / conformance gate") and the **internal-vs-public-API-refactor** distinction ("if downstream consumes it, types are part of the API").
- Owns a **pre-flight checklist** (define boundary / build is green / record strictness flags / public-surface inventory) and a **core loop** (constrain blast radius → quarantine unknown → refactor behind seams → IDE refactors first → codemods only at 50+ call sites).
- Owns a **catalog of 8 TS-focused moves**, each with *when to use / TS hazards / safe steps / micro-snippet*: (1) type-façade exports, (2) extract module boundary (ports/adapters), (3) introduce Result/tagged-error, (4) flags-soup → discriminated union input, (5) branded/opaque types, (6) union → ADT + `assertNever`, (7) split overloaded function, (8) dependency inversion via function ports.
- Owns **architecture refactors** (strangler fig + branch-by-abstraction TS variant; ports/adapters migration steps; DTO/domain separation), **type-check performance refactors** (union explosion, deep generic chains, computed-types-exported-widely, circular imports), and **stop/rollback signals**.
- NOTE: The "safe steps" are 3-4 bullets per move — they are *sequencing guidance*, not the fully mechanical, test-after-each-step transformations of a Fowler-style recipe.

### `references/module-organization.md` — boundaries, packages, monorepos, DI
- Owns the **three levels** (Level 1 functions & types: "one file, one reason to change"; Level 2 modules & packages: cohesion/public surface/dependency direction/barrels; Level 3 systems & monorepos: package contracts, project references, team ownership).
- Owns **boundary enforcement** spectrum (convention → lint `no-restricted-imports` → package boundaries with `exports` + project references) and the **dependency-direction rule** (adapters → application → domain → nothing; acyclic).
- Owns **monorepo patterns** (shared-types package, project references, workspace protocols, modular monolith), the **"shared dumping ground" anti-pattern** with symptoms + fix, the **barrel-file nuanced take** ("one barrel per package boundary, zero internal barrels"), three **practical organization patterns** (feature-slice / layer-first / modular-monolith-in-packages), **when to split a module into a package**, and **DI in TS** (explicit composition root, function-vs-interface ports, when DI containers make sense).

### `references/sdk-design.md` — library/SDK API surface design
- Owns **7 SDK principles**: contract-first value tree, inference-friendly surfaces (`satisfies`, prefer DU over overloads, `const` type params), error contracts (typed expected errors vs throw for bugs), schema as single source of truth, middleware as context transformer, curated public surface (`exports`), version evolution (type changes are breaking; `@deprecated`; migration utils; break loudly not silently).
- Owns **patterns from strong SDKs** (procedure builders, router trees, client-inference-from-server, composable plugins) and an **SDK Design Checklist** + "The Invisible SDK" closing principle.

### `references/ecosystem.md` — tool selection along the type chain
- Owns the **convergence principle** (whole stack shares one type system → refactors cascade as errors) and runtime selection (Bun / Node 22.6+ strip-types / Deno).
- Owns **schema-validation selection** (Zod default / Valibot client-heavy / TypeBox JSON-Schema-first / ArkType performance — "don't mix schema libraries"), **data-access selection** (Drizzle code-first / Prisma schema-first / Kysely SQL-first), **API-layer selection** (tRPC / oRPC / Hono / Elysia), testing (Vitest / Bun test), the **full-stack composition** worked example (rename a column → error cascade), and **tool-stack-not-tools** selection principle.

### `references/integration-combos.md` — composing patterns into migratable architectures
- Owns the **"combo" mindset** (hard systems = implicit boundaries) and **foundation patterns** (hexagonal/clean slices: domain/application/ports/adapters/infra; functional core/imperative shell; typed boundaries DTO pipeline `unknown → InputDTO → DomainCommand → DomainResult → OutputDTO`; Result+tagged-union error contracts; interface-vs-function ports; module boundaries; strangler fig).
- Owns **7 combo recipes** (problem → target architecture → key patterns → refactor path): "we can't test anything," "we keep rewriting controllers," "service god object," "upstream integrations keep breaking us," "Clean Arch but TS DI is messy," "refactor a live legacy app safely," "monorepo spaghetti."
- Owns **operational guardrails** (composition root, no-outward-domain-imports, no smart-ORMs-in-domain, DTO parsing near edges, typed errors, fixture libraries).

### `references/real-world-examples.md` — patterns in the wild (tRPC, oRPC, Elysia)
- Owns **cross-cutting patterns to steal** (contract-first value tree, fluent builder with type-state, context-transforming middleware, runtime schema as source of truth) and per-framework **"build it from scratch" blueprints** (procedure builder + context + middleware + router tree; contract object + typed client + transport proxy; typed route tree + plugins).
- Owns the **Elysia type-performance debugging workflow** (`tsc --generateTrace` → inspect in Perfetto → split into sub-apps to isolate inference).

---

## 2. PHILOSOPHY & VOICE (so our skill is a coherent sibling)

**Philosophy (the load-bearing axioms):**
- **Two programs, one design.** Every `.ts` file is a runtime program and a type-time (erased) program; they must be designed together. "A type that claims safety without runtime backing is a lie."
- **Types are design material, not documentation.** An interface is a structural constraint that shapes what code can be written, a promise to consumers.
- **Inference is the primary interface.** "Every required annotation is a design smell." If consumers need `<T,U,V>`, the API is leaking.
- **Proportional complexity.** "If the type is harder to understand than the bug it prevents, simplify." Every type-level construct must earn its cost in readability/compile-time/error quality.
- **Parse, don't validate; parse at boundaries.** Treat `unknown` as radioactive until parsed; inside the fortress, trust the types.
- **One strategy per subsystem.** Consistency beats local optimization.
- **The compiler is your refactoring engine.** Honest types + discriminated unions + `assertNever` make the compiler hunt your bugs during change.
- **Descriptive, not prescriptive, on the axes.** "There is no universally correct position." Start simple, move conservative only with evidence.

**Voice:**
- Second person, imperative, confrontational-but-coaching. Opens by predicting the reader's failure ("You will write TypeScript like JavaScript with annotations") and frames craft as the gap between "type-checks" and "well-designed."
- "Defaults hide" framing: failure modes "feel like the normal way to write TypeScript" — the skill's job is to make you *catch yourself*.
- Structured for progressive disclosure: a tight `SKILL.md` (problem → spirit → defaults → four questions → six axes → mandate → workflows → reference map) that defers depth to references via an "Open when" table.
- Test-shaped self-checks ("The inference test," "The swap test," "Self-Check," checklists). Heavy use of bad→good code pairs. Reference files carry **authority-tagged annotated sources** ([PRIMARY]/[PRACTICE]/[BOOK]/[COMMUNITY]) and a "Durable as of <date>" stamp.
- Honest about limits: an explicit "When TypeScript Is Wrong" / "Boundaries" section. Closes most files with a "Summary"/"The Principles" recap.

**Implication for our skill:** Match the voice (predict-the-failure opener, bad→good pairs, named tests/checklists, authority-tagged sources, "Open when" reference table, Core Invariants block, skill-usage-disclosure footer). Position ours as the *execution/mechanics* sibling to this *design/altitude* skill — and link out, hard, rather than restate the philosophy.

---

## 3. OVERLAP RISK → LINK TARGETS (what NOT to rewrite)

A complexity-reduction + refactoring skill will be *tempted* to re-author each of these. Don't. Link instead.

| Tempting topic in our skill | Already owned by `dev:typescript` | LINK target (don't rewrite) | What to do instead |
|---|---|---|---|
| The "why" of good TS / two-programs / parse-at-boundaries / proportional complexity | philosophy.md (full treatment) | `dev:typescript` → `references/philosophy.md` | One-line restatement + link; assume the reader absorbed it. Our skill is mechanics, not mindset. |
| "Make illegal states unrepresentable," exceptions-vs-Result, data-first-vs-builder tradeoffs | axes.md (six axes + decision framework) | `dev:typescript` → `references/axes.md` | When a refactor *moves a dial* (e.g. flags→DU is a Safety-Budget move), cite the axis; don't re-derive the tradeoff. |
| The TS pattern vocabulary (DU/ADT, branded types, type-state, phantom, ports/adapters, FC/IS, state machine, middleware, pub/sub) | design-patterns.md (catalog A–E) | `dev:typescript` → `references/design-patterns.md` | Reference the *target* pattern by name (e.g. "A1 discriminated union," "D2 ports & adapters"); our skill says *how to get there safely*, not what the pattern is. |
| TS-specific refactoring moves (façade exports, ports seam, introduce Result, flags→DU, brands, union→ADT+assertNever, split overloads, function ports) | refactoring-patterns.md (8 moves + core loop + stop/rollback) | `dev:typescript` → `references/refactoring-patterns.md` | **Highest overlap.** Do NOT duplicate these 8 moves. Either (a) link and go deeper *mechanically* on a few high-value ones, or (b) own the moves the existing file omits (see Gaps). Be explicit about the boundary. |
| Module/package boundaries, barrels, monorepo structure, dependency direction, DI/composition root, shared-dumping-ground | module-organization.md (three levels + enforcement + monorepo) | `dev:typescript` → `references/module-organization.md` | Link for "where should this extracted module live / how to enforce the boundary." Don't re-explain barrels or `exports`. |
| SDK/public-API discipline, type-as-breaking-change, version evolution, curated surface | sdk-design.md | `dev:typescript` → `references/sdk-design.md` | Link when a refactor crosses a *published* surface. Reuse its "types are part of the API" rule rather than restating. |
| Schema lib / ORM / API-framework / runtime selection | ecosystem.md | `dev:typescript` → `references/ecosystem.md` | Link for any "which tool" decision. Our skill should be tool-agnostic on selection. |
| Strangler fig / branch-by-abstraction / "legacy app safely" / "monorepo spaghetti" recipes | integration-combos.md (7 recipes) + refactoring-patterns.md | `dev:typescript` → `references/integration-combos.md` | Link for *architecture-scale* migrations. Our skill owns *unit/module-scale* mechanics; hand off to combos when the refactor is a multi-slice migration. |
| Type-check performance refactors / `--generateTrace` / split-into-sub-apps | refactoring-patterns.md ("type-check performance refactors") + real-world-examples.md (Elysia trace workflow) | `dev:typescript` → `references/refactoring-patterns.md` and `references/real-world-examples.md` | Link; don't re-author the perf-trace workflow. |
| Worked patterns from tRPC/oRPC/Elysia | real-world-examples.md | `dev:typescript` → `references/real-world-examples.md` | Link only if illustrating a target shape. |

**One-sentence rule for the new skill:** *`dev:typescript` answers "what good looks like and which pattern to target"; our skill answers "how to detect the bad, and the exact safe sequence to transform it" — and it links to `dev:typescript` for every target it names.*

---

## 4. GAPS — what our new skill must OWN (the most important output)

These are missing or thin in `dev:typescript`. Each is a candidate to own outright.

### G1. A concrete code-smell catalog with detection signals (LARGELY MISSING)
- `where-defaults-hide.md` is the *only* smell-ish catalog, and it covers exactly 8 **design/type-honesty** defaults (`any`, type-value drift, flat modules, class-heavy OOP, over-engineered types, ignoring runtime, inconsistent errors, export-everything). It is *not* a general code-smell taxonomy.
- **Absent named smells (with no detection signals anywhere in the skill):** long function / god function, long parameter list, deep nesting / arrow-code, duplicated logic (copy-paste), dead code & unreachable branches, unused exports/vars, primitive obsession, feature envy, data clumps, shotgun surgery, divergent change, message chains / law-of-Demeter violations, speculative generality, temporary fields, comments-as-deodorant, magic numbers/strings, large file / kitchen-sink module, cyclomatic-complexity hotspots.
- **TS-flavored smells absent or only mentioned in passing:** `as`/`as any`/`as unknown as` chains as a *smell to hunt* (philosophy mentions `as` is lying, but there's no detection-and-sweep procedure), `!` non-null assertion overuse, optional-property soup as invalid-state generator, enum-vs-union misuse, `@ts-ignore`/`@ts-expect-error` accumulation, index-signature `Record<string, any>` escape hatches, overload sprawl (refactoring file has the *move* but no *detection signal/threshold*), barrel-induced import cycles (module-org has the rule, not a detector), re-export mazes.
- **What to own:** a catalog where each smell = **name + detection signal (concrete, ideally greppable/metric-based: e.g. "function > ~40 lines or cyclomatic > 10," "3+ chained `as`," ">5 optional fields on one type," "two type defs with overlapping fields and separate validators") + why it's costly in TS specifically + pointer to the transformation**. This is the skill's center of gravity.

### G2. Refactoring *mechanics* — step-by-step safe transformations (THIN)
- `refactoring-patterns.md` gives 8 moves with 3-4 "safe steps" each — *sequencing*, not *mechanics*. There is no Fowler-style "do X, run tests, do Y, run tests" with the compiler/test loop interleaved at each micro-step.
- **Absent mechanical recipes:** Extract Function / Inline Function, Extract Variable, Extract Type/Interface, Rename Symbol (the safe TS way with tsserver), Move Function/Move Module, Inline Class, Replace Conditional with Polymorphism *or its TS-idiomatic inverse* (replace polymorphism/inheritance with discriminated-union + switch), Decompose Conditional, Replace Nested Conditional with Guard Clauses, Replace Magic Literal with named const, Split Phase, Separate Query from Modifier, Parameterize Function, Remove Dead Code safely (find unused exports → confirm → delete), Consolidate Duplicate Conditional Fragments.
- The existing file's own framing concedes the gap: it says it "assumes you already know how to refactor in general" and is "**not** refactoring 101."
- **What to own:** the actual micro-mechanics, TS-specialized — what the compiler/tsserver does for you at each step, where it *won't* catch you (e.g. structural typing means a wrong rename can still type-check; `as` masks breakage; `noUncheckedIndexedAccess` off hides index errors), and the test/compile cadence. Tie each mechanic to the smell(s) in G1.

### G3. An end-to-end refactor decision procedure / workflow with verification gates (THIN)
- The closest artifacts: `SKILL.md` "Refactor safely" (7 bullets, pure pointer) and `refactoring-patterns.md` "core loop" (5 bullets) + pre-flight checklist. There is **no** decision tree for *"given this code, what do I do first, in what order, and how do I know I'm done."*
- **Absent:** a triage/prioritization procedure (which smell to attack first — highest leverage vs lowest risk; `SKILL.md` says "identify the highest-leverage fix" but gives no procedure to rank them), a "characterization test before you touch untested code" step, a per-step verification gate (typecheck green + tests green + behavior unchanged + no public-type drift), commit/rollback granularity ("one transformation per commit"), and a **definition of done** / when-to-stop (the existing "stop/rollback signals" are about *type perf blowups*, not about "the refactor is complete and safe").
- **What to own:** a numbered, gated workflow — Characterize (lock behavior) → Inventory smells → Rank by leverage/risk → Transform one mechanic at a time behind a green build → Verify (typecheck/tests/behavior/public-surface) → Commit → repeat → Done criteria. Make the verification loop explicit and TS-specific (use `tsc --noEmit`, the test runner, `git diff` of `.d.ts`/exports).

### G4. Cleaning up "LLM-generated slop" (ENTIRELY MISSING — strong differentiator)
- Zero coverage. The existing skill assumes a human-authored codebase that drifted via familiar defaults. It does not address machine-generated tangle.
- **Absent and high-value to own:** detecting/fixing **arbitrarily named files** (`utils2.ts`, `helpers.ts`, `index-new.ts`, `final_v2`), **structureless tangle** (everything in one mega-file, no boundaries), **over-abstraction** (premature generics, factory-of-factory, interfaces with one implementation, config objects for two call sites, "enterprise" wrappers around one-liners), **redundant re-implementations** (the LLM rebuilt `groupBy`/`pick`/a Result type that already exists in the repo), **inconsistent local conventions** (mixed error channels, mixed `type` vs `interface`, mixed import styles introduced across generated files), **dead scaffolding** (TODO stubs, unused exports, commented-out alternatives, "example" code left in), **comment slop** (narration comments restating the code), and **naming incoherence** (names that don't match the repo's ubiquitous language).
- **What to own:** a "slop triage" pass — *consolidate duplicate/near-duplicate files, rename to repo conventions, collapse premature abstractions to their single use, delete dead scaffolding, reconcile to one strategy per subsystem* — explicitly framed for code an agent (possibly the same agent) just generated. This is the skill's most distinctive surface and should be a first-class reference.

### G5. Functional vs class-based paradigm — *when* and *how to choose* (BIASED, NOT A DECISION PROCEDURE)
- The skill has a strong *bias* ("Classes are occasionally useful; they're rarely the right default"; default 4 "class-heavy OOP"; philosophy "prefer discriminated unions and plain objects over class hierarchies") and a worked class→composition fix. But it provides **no decision procedure** for the legitimate cases.
- **Absent:** an explicit chooser — *when classes genuinely win* (private state with invariants, `Symbol.dispose`/resource lifecycle, instanceof-based ecosystems, errors extending `Error`, framework requirements e.g. Angular/Nest/decorators, hot-path allocation where shape stability matters), vs *when functions+data+closures win* (most app/domain/service logic, testability, serialization, tree-shaking), plus the **migration mechanics** in both directions (class → factory-closure; inheritance tree → discriminated union + dispatch function) as gated recipes. The skill gives the conclusion, not the rule or the move.
- **What to own:** the decision procedure + bidirectional migration mechanics. Cite axes.md (Safety/Extension) and design-patterns.md (A1/C1/C5) for the targets, but own the *choice* and the *transformation*.

### G6. Over/under-engineering signals & TS-specific style/naming failures (PARTIAL — extend, don't restate)
- Over-engineering at the *type level* is well covered (where-defaults-hide #5, design-patterns "type-level overfitting," axes warning-signs, refactoring "type-check performance"). **Under-engineering** and **structural** over-engineering are NOT: premature abstraction, needless indirection layers, one-impl interfaces, config-driven everything, wrapper-around-stdlib, "manager/handler/service/util" name-noise, generic parameters that are never varied.
- **Naming/style failures** are essentially uncovered as a *detect-and-fix* topic: vague names (`data`, `result`, `temp`, `obj`, `handle`), `Manager`/`Helper`/`Util` grab-bags, abbreviations, boolean naming, `type` vs `interface` consistency, file-name ↔ export-name coherence, casing conventions, "stuttering" (`user.userId`). The skill cares about *type honesty*, not *readability craft*.
- **What to own:** under-engineering signals, structural over-engineering (the "indirection audit": can you delete this layer and lose nothing?), and a TS naming/style cleanup pass with detection signals. (`dev:architecture` has an "indirection audit" concept; coordinate to avoid duplicating that one.)

### Smaller gaps worth a mention
- **No tooling pipeline for *finding* smells** (knip/ts-prune for unused exports, `madge`/`dpdm` for cycles, ESLint `complexity`/`max-lines`/`max-depth`/`sonarjs`, `tsc --noUnusedLocals`, jscpd for duplication, `ts-morph`/codemods for mechanical sweeps). Refactoring file mentions "codemods at 50+ call sites" and `--generateTrace` but no detection toolchain.
- **No guidance on refactoring *without* tests** (characterization/approval tests, the "make it safe before you make it clean" step).
- **No "categorical fix" doctrine** (a pointed-out smell is a *class*, sweep the whole codebase) — strongly aligned with the user's own MEMORY (`fix-issues-categorically`); our skill should own it explicitly.

---

## 5. EXACT LINK TARGETS (concern → file → one-liner)

Use the form: **`dev:typescript` skill, file `references/<x>.md`**.

| Concern (when our skill needs it) | Link target | What that file owns (one line) |
|---|---|---|
| Mindset / "what good looks like" / two-programs / parse-at-boundaries | `dev:typescript` → `references/philosophy.md` | The design philosophy, build-from-zero ordering, and when TS is the wrong tool. |
| Choosing a design position / naming the tradeoff a refactor moves | `dev:typescript` → `references/axes.md` | Six decision axes with default position + trigger-to-move + overshoot warning. |
| Diagnosing type-honesty/boundary defaults; self-check before delivery | `dev:typescript` → `references/where-defaults-hide.md` | 8 named structural defaults (any, type-value drift, flat modules, class-heavy, over-typed, ignore-runtime, mixed errors, export-everything) + fixes. |
| The target pattern to refactor *toward* (DU, brands, type-state, ports, FC/IS, state machine, middleware) | `dev:typescript` → `references/design-patterns.md` | Runtime+type-level pattern catalog (A–E) + selection heuristics + symptom→move→pattern table. |
| TS-specific refactoring moves, blast-radius control, type-perf refactors, stop/rollback | `dev:typescript` → `references/refactoring-patterns.md` | 8 API-safe refactoring moves (façade, ports seam, Result, flags→DU, brands, union→ADT, split overloads, function ports) + core loop. |
| Where extracted code should live; enforcing boundaries; monorepo/barrels/DI | `dev:typescript` → `references/module-organization.md` | Three design levels, boundary enforcement spectrum, monorepo patterns, composition-root DI. |
| Refactors that cross a published/library surface; versioning a type change | `dev:typescript` → `references/sdk-design.md` | 7 SDK principles incl. "types are breaking changes," curated `exports`, version evolution. |
| "Which tool" decisions (schema lib, ORM, API framework, runtime) | `dev:typescript` → `references/ecosystem.md` | Type-chain tool selection (Bun/Node/Deno, Zod/Valibot/TypeBox, Drizzle/Prisma/Kysely, tRPC/oRPC/Hono/Elysia). |
| Architecture-scale migration (legacy app, monorepo spaghetti, strangler fig) | `dev:typescript` → `references/integration-combos.md` | 7 problem→architecture→refactor-path combo recipes + hexagonal/FC-IS foundations. |
| Illustrating a target shape from real frameworks; type-perf trace workflow | `dev:typescript` → `references/real-world-examples.md` | tRPC/oRPC/Elysia patterns-to-steal + `tsc --generateTrace`→Perfetto→sub-apps. |
| Pre-delivery quality gate (reuse, don't reinvent) | `dev:typescript` → `SKILL.md` ("The Mandate" + Core Invariants) | Six mandate checks + 7 core invariants to run before presenting TS code. |

---

## Recommended division of labor (for skill design)

- **`dev:typescript` keeps:** philosophy, the six axes, the pattern catalog, module/SDK/ecosystem design, architecture-scale migration recipes, and its 8 design-level refactoring moves.
- **Our skill owns:** (G1) a real code-smell catalog with detection signals, (G2) mechanical step-by-step safe transformations, (G3) an end-to-end gated refactor workflow with a definition of done, (G4) LLM-slop cleanup, (G5) the functional-vs-class *decision procedure* + bidirectional migration mechanics, (G6) under-/structural-over-engineering + naming/style cleanup, plus the detection toolchain, refactoring-without-tests, and the categorical-fix doctrine.
- **Coordinate (don't duplicate):** the flags→DU / union→ADT / introduce-Result / branded-types moves already in `refactoring-patterns.md` — our skill should link to them and only add *mechanics depth* the existing file omits; and the "indirection audit" idea shared with `dev:architecture`.

# r4a — Code Smells: A TypeScript-Oriented Synthesis

> **Primary source.** This document is an original synthesis built on the code-smell
> catalog and refactoring philosophy of **Refactoring.Guru** (Alexander Shvets,
> https://refactoring.guru/refactoring/smells), which in turn distills Martin Fowler's
> *Refactoring* and Kent Beck's "code smell" vocabulary. The taxonomy (5 categories,
> 23 smells), the per-smell structure (signs / reasons / treatments), and the named
> refactorings are theirs. Everything below is rewritten in our own words and
> re-grounded in modern TypeScript/JavaScript: the *prose is original*, the *examples
> and detection tooling are TS-native*, and the *citations point back to RG*. We do not
> reproduce RG's text.

---

## Part 1 — Refactoring philosophy (first principles)

### 1.1 What refactoring is

Refactoring is changing the **internal structure** of code without changing its
**external behavior**. The behavior contract is held fixed — same inputs, same outputs,
same observable side effects — while the shape of the code underneath is improved. Per
RG, the purpose is to fight **technical debt**: to transform a mess into clean code and
a simpler design.

The discipline is the *behavior-preservation* clause. If observable behavior changes,
that is not refactoring — it is a feature change or a bugfix wearing refactoring's
clothes. In TypeScript the type system gives you an extra preservation surface: a refactor
should also leave the **public type signature** of a module/function stable (or strictly
widen it in a compatible way) unless tightening types *is* the refactor.

### 1.2 What "clean code" means

Synthesizing RG's definition for a TS context, clean code is:

- **Obvious to other readers.** Not clever — clear. Good names beat magic numbers,
  stringly-typed flags, and bloated functions. In TS this extends to *types as
  documentation*: a well-named union or branded type explains intent without comments.
- **Free of duplication.** Every duplicated fragment is a place you must remember to
  edit in lockstep. Duplication raises cognitive load and is a bug incubator.
- **Minimal in moving parts.** Fewer classes, functions, and abstractions to hold in
  your head. *Code is a liability, not an asset* — keep it short and simple. (This is
  the antidote to Speculative Generality.)
- **Fully tested / fully type-checked.** RG's bar is "passes all tests." In TS we add:
  `tsc --noEmit` is green under `strict`, and there are no escape hatches (`any`,
  `as`, `@ts-ignore`, `!`) silently disabling the checker.
- **Cheap to maintain.** The payoff of all the above.

### 1.3 The technical-debt metaphor

RG attributes the metaphor to Ward Cunningham. Shipping unclean code is like taking a
loan: you move faster *now* and pay **interest** later — every future change against the
messy code is slower and riskier. Skipping tests, leaving kludges to hide unfinished
work, and deferring refactoring all draw down the principal. The danger is the same as
real debt: interest can compound until the cost of change exceeds your capacity to
deliver. RG's catalog of debt causes maps cleanly onto TS teams:

| RG cause | TS-flavored manifestation |
| --- | --- |
| Business pressure | `as any` to "make it compile" before a deadline; `// @ts-ignore` on a red line |
| Not understanding the consequences | treating `strict: false` as permanent rather than a migration waypoint |
| Tight component coupling | barrel files and god modules that import everything; circular imports |
| Lack of tests | refactors done blind because there's no green suite to confirm preservation |
| Lack of documentation | types *are* the docs in TS; weak types = undocumented contracts |
| Long-lived divergent branches | merge-time type drift between parallel feature branches |
| Delayed refactoring | a smell left alone accretes dependents that must all move later |
| No compliance monitoring | no ESLint/`tsc` gate in CI; each author writes "their way" |

### 1.4 When to refactor

RG names four moments. Treat them as triggers, not a scheduled chore:

1. **The Rule of Three.** First time, just write it. Second time, wince but duplicate.
   Third time, refactor. Two occurrences can be coincidence; three is a pattern that
   has earned an abstraction. This guards against premature abstraction (the cure for
   Speculative Generality is *not* abstracting on the first instance).
2. **When adding a feature.** Refactor first to understand and to make room. It is far
   cheaper to extend clean code than to bolt onto a mess. Refactoring someone else's
   dirty code is how you *learn* it.
3. **When fixing a bug.** Bugs nest in the dirtiest code. Cleaning the area often makes
   the defect self-evident. In TS, tightening a loose type (e.g., turning a wide
   `string` into a union) frequently surfaces the bug at compile time.
4. **During code review.** The last cheap moment to tidy before code goes public. Best
   done with the author present.

### 1.5 How to refactor safely

RG's safety rules, restated for a TS workflow:

- **Small, behavior-preserving steps.** A refactor is a *sequence* of tiny changes, each
  leaving the program working. Don't batch a dozen restructurings into one commit — that
  is how you lose the thread and can't tell which step broke something.
- **Keep the build and tests green throughout.** After each step: `tsc --noEmit` passes,
  tests pass, lint passes. If a step breaks tests, either you made an error (fix it) or
  your tests were too low-level (testing private internals); the latter means the tests,
  not the refactor, are wrong. Prefer behavior-level (BDD-style) tests so structure can
  move freely underneath them.
- **Wear one hat at a time.** *Refactoring* and *adding functionality* are separate
  activities. Don't create new behavior mid-refactor; isolate the two at least at the
  commit boundary. In TS this also means: don't sneak a type-tightening that changes
  runtime behavior into a "pure rename" commit.
- **Know when to stop — or to rewrite.** If the code is no cleaner after an hour, you
  either over-batched or the code is past incremental help. Sometimes the right call is
  a bounded rewrite — but only behind tests and with time budgeted, or you reproduce the
  original mess.

### 1.6 Why smells matter (the through-line)

A *code smell* is a surface symptom that usually points to a deeper design problem. Smells
are heuristics, not laws — RG repeatedly lists "When to Ignore." The skill is to (a)
recognize the smell, (b) diagnose the underlying weakness, (c) pick the smallest
refactoring that removes the cause, and (d) verify behavior is preserved. The five
categories below organize the 23 smells by the *kind* of damage they do.

---

## Part 2 — The five smell categories (with TS through-lines)

RG groups the smells into five families by failure mode. Each family has a characteristic
TypeScript signature:

1. **Bloaters** — code/functions/classes that have grown to unwieldy size. They
   accumulate; nobody removes anything. *TS through-line:* megafunctions, god modules,
   primitive-typed everything, sprawling parameter lists, repeated field groups that want
   to be an `interface`.

2. **Object-Orientation Abusers** — incomplete or wrong application of OO/polymorphism.
   *TS through-line:* `switch`/`if` ladders that should be discriminated unions with
   `never` exhaustiveness; optional props that are only sometimes valid; inheritance used
   where composition belongs; two modules doing the same job with mismatched signatures.

3. **Change Preventers** — structure such that one logical change forces edits in many
   places (or many unrelated changes land in one place). *TS through-line:* poor module
   boundaries, leaky cross-cutting concerns, type definitions duplicated across files so a
   shape change is a multi-file edit.

4. **Dispensables** — things whose *absence* makes the code better: narration comments,
   duplication, do-nothing classes, anemic data holders, dead code, and "just in case"
   generality. *TS through-line:* unused exports, unreachable branches, `any`-typed
   pass-through wrappers, over-parameterized generics nobody instantiates differently.

5. **Couplers** — excessive coupling, or its over-correction into excessive delegation.
   *TS through-line:* functions reaching deep into another object's fields, `a.b.c.d`
   chains, modules importing each other's internals, pass-through facades that only
   forward calls.

| Category | Members | TS detection focus |
| --- | --- | --- |
| Bloaters | Long Method · Large Class · Primitive Obsession · Long Parameter List · Data Clumps | `max-lines-per-function`, `max-params`, `complexity`, branded types, options objects |
| OO Abusers | Switch Statements · Temporary Field · Refused Bequest · Alternative Classes w/ Different Interfaces | exhaustive-switch lint, discriminated unions, `jscpd` on near-twin modules |
| Change Preventers | Divergent Change · Shotgun Surgery · Parallel Inheritance Hierarchies | `madge`/`dpdm` graph fan-in/out, "edit-count per change" review heuristic |
| Dispensables | Comments · Duplicate Code · Lazy Class · Data Class · Dead Code · Speculative Generality | `knip`/`ts-prune`, `jscpd`, comment-density grep, generic-arity audit |
| Couplers | Feature Envy · Inappropriate Intimacy · Message Chains · Middle Man · Incomplete Library Class | LCOM-style locality, `madge --circular`, chain-depth grep, module-`@internal` boundaries |

---

## Part 3 — The 23 smells (TypeScript field guide)

Each entry: **Signs & symptoms** (detect) → **Why it happens / why it hurts** → **Treatment**
(RG refactorings by name) → **TypeScript manifestation** → **Detection signal**
(greppable / tooling). Refactoring names in *italics* are RG's named techniques.

---

### Bloaters

#### 1. Long Method

- **Signs & symptoms.** A function whose body is long enough that you can't hold it in
  your head; RG's rule of thumb: start asking questions past ~10 lines. Telltale: you feel
  the urge to add a *comment* explaining the next block — that block wants to be its own
  function.
- **Why it happens / why it hurts.** It is always easier to append a line than to extract
  a function ("it's just two lines…"), so methods grow monotonically. Long functions are
  hard to understand, hard to test in isolation, and are the ideal hiding place for
  duplicated logic.
- **Treatment.** *Extract Method* is the workhorse. When locals/params block extraction,
  *Replace Temp with Query*, *Introduce Parameter Object*, or *Preserve Whole Object*. For
  conditionals, *Decompose Conditional*; for stubborn cases, *Replace Method with Method
  Object*; for tangled algorithms, *Substitute Algorithm*.
- **TypeScript manifestation.** A 200-line React component or an Express handler doing
  validation + business logic + persistence + serialization inline. Extract pure helper
  functions; in components, extract custom hooks and child components. A comment like
  `// build the request payload` above a block is a named-function in disguise.
- **Detection signal.** ESLint `max-lines-per-function`, `complexity`,
  `max-statements`, `max-depth`. `grep -rn "// " src | wc -l` correlates with narration
  blocks. `madge`/coverage: long functions tend to have low branch coverage.

#### 2. Large Class

- **Signs & symptoms.** A class (or, in TS, a module/service/store) with too many fields,
  methods, and lines — "wearing too many hats."
- **Why it happens / why it hurts.** Same gravity as Long Method: it is easier to add to
  an existing class than to create a new one. The result violates Single Responsibility;
  you must keep a huge surface in your head, and unrelated concerns change together.
- **Treatment.** *Extract Class* (spin off cohesive behavior), *Extract Subclass* (variant
  behavior), *Extract Interface* (publish the contract clients use). For UI-bound state,
  *Duplicate Observed Data* to split presentation from domain.
- **TypeScript manifestation.** A `UserService` of 1,500 lines, or a Zustand/Redux slice
  that owns auth + cart + telemetry. Also the **god module**: an `index.ts` re-exporting
  everything so the file becomes the de-facto class. Split by responsibility into focused
  modules; expose a narrow `interface` per consumer.
- **Detection signal.** ESLint `max-lines` (per file), `max-classes-per-file`; method
  count via a custom rule. High **fan-in** on a single module in `madge`/`dpdm` graphs.
  LCOM (lack of cohesion) tools flag classes whose methods touch disjoint field sets.

#### 3. Primitive Obsession

- **Signs & symptoms.** Using raw primitives for domain concepts (currency, phone number,
  user-id, email, ranges); using bare constants as type codes (`const ROLE_ADMIN = 1`);
  using string keys as pseudo-fields into loose objects/arrays.
- **Why it happens / why it hurts.** A primitive field is cheaper to type than a class, so
  it proliferates. Result: validation and behavior tied to the concept are scattered, and
  unrelated values of the same primitive type are freely (and wrongly) interchangeable —
  the compiler can't stop you passing a `userId` where an `orderId` is expected.
- **Treatment.** *Replace Data Value with Object*; for params, *Introduce Parameter Object*
  / *Preserve Whole Object*; for type codes, *Replace Type Code with Class /
  Subclasses / State/Strategy*; for array-as-record, *Replace Array with Object*.
- **TypeScript manifestation.** This is the canonical TS smell. **Stringly-typed code**
  (`status: string`) should be a **union** (`status: "active" | "suspended" | "closed"`).
  Interchangeable ids should be **branded/nominal types**:
  ```ts
  type UserId = string & { readonly __brand: "UserId" };
  type OrderId = string & { readonly __brand: "OrderId" };
  // now fn(userId: UserId) rejects an OrderId at compile time
  ```
  Validated primitives (email, positive int) become branded types minted by a parser
  (Zod `.brand()`, or a `parseEmail(): Email` smart constructor). Magic numbers/strings →
  `as const` objects or enums-as-unions.
- **Detection signal.** `grep -rnE ': (string|number)\b' src` density on domain fields;
  high count of bare string/number literals in conditionals. Type-coverage tools
  (`type-coverage`) reward replacing wide primitives. Lint: `@typescript-eslint/no-magic-numbers`.

#### 4. Long Parameter List

- **Signs & symptoms.** More than ~3–4 parameters; especially several booleans or several
  of the same type in a row (call sites become positional guessing games).
- **Why it happens / why it hurts.** Merging algorithms into one function, or
  decoupling object creation from use, pushes data in through parameters. Long lists are
  hard to read, easy to misorder, and resist change.
- **Treatment.** *Replace Parameter with Method Call* (when an arg is derivable),
  *Preserve Whole Object* (pass the object, not its fields), *Introduce Parameter Object*
  (group related args). RG caveat: don't add coupling just to shorten a list.
- **TypeScript manifestation.** The **options object** is the idiomatic fix:
  ```ts
  // smell
  function createUser(name: string, email: string, isAdmin: boolean, notify: boolean) {}
  // cure — named, order-free, self-documenting, easily extended
  function createUser(opts: { name: string; email: string; isAdmin?: boolean; notify?: boolean }) {}
  ```
  Multiple same-typed positional params (`drawRect(x, y, w, h)`) are a swap-hazard the
  compiler can't catch; an object or branded coords fix it. Boolean params are a double
  smell (also see Switch/flag): prefer a union (`mode: "create" | "update"`).
- **Detection signal.** ESLint `max-params` (set to 3–4). `grep -rnE '\([^)]*,[^)]*,[^)]*,[^)]*,' src`
  for 4+ comma call signatures. Consecutive same-type params show up in review; a custom
  lint or TS AST scan can flag `(a: string, b: string, c: string)`.

#### 5. Data Clumps

- **Signs & symptoms.** The same group of values travels together repeatedly — as
  parameters (`x, y`), as fields (`street, city, zip`), as the same trio of DB-connection
  args. RG's litmus test: delete one value; if the rest stop making sense, they're a clump.
- **Why it happens / why it hurts.** Copy-paste and incremental growth. The clump is an
  un-named concept; its members can drift apart, and behavior over the group has nowhere
  cohesive to live.
- **Treatment.** *Extract Class* (clump-as-fields), *Introduce Parameter Object*
  (clump-as-params), *Preserve Whole Object* (pass the new object onward). Then migrate
  behavior onto the new type.
- **TypeScript manifestation.** Repeated inline shapes begging for a named `interface`/
  `type`:
  ```ts
  // clump appears in 6 signatures
  function ship(street: string, city: string, zip: string) {}
  function tax(street: string, city: string, zip: string) {}
  // extract the concept
  interface Address { street: string; city: string; zip: string }
  function ship(addr: Address) {}
  ```
  In TS the clump is often *already* a duplicated anonymous object type — DRY it into one
  exported interface so a field change is one edit (also kills latent Shotgun Surgery).
- **Detection signal.** `jscpd` flags repeated literal shapes. A grep for the same
  ordered param triple: `grep -rnE 'street: string, city: string, zip: string' src`.
  Repeated inline object-type literals across files are reviewable; some AST tools detect
  structurally identical anonymous types.

---

### Object-Orientation Abusers

#### 6. Switch Statements

- **Signs & symptoms.** A complex `switch`, or an `if/else if` ladder, branching on a
  type code or mode — and the *same* branching logic appears in several places, so adding
  a case means hunting down every copy.
- **Why it happens / why it hurts.** Procedural habits in an OO/typed setting. Scattered
  switches on the same discriminant are change-amplifiers: a new variant touches N sites,
  and it's easy to miss one.
- **Treatment.** RG: "when you see `switch`, think polymorphism." Localize via *Extract
  Method* + *Move Method*; for type codes, *Replace Type Code with Subclasses* or *…with
  State/Strategy*; then *Replace Conditional with Polymorphism*. For null branches,
  *Introduce Null Object*. RG's "ignore" cases: trivial switches, and factory-pattern
  selection.
- **TypeScript manifestation.** The signature TS move is the **discriminated union with a
  `never` exhaustiveness check** — keep the switch but make the compiler enforce
  totality:
  ```ts
  type Shape =
    | { kind: "circle"; r: number }
    | { kind: "square"; s: number };
  function area(sh: Shape): number {
    switch (sh.kind) {
      case "circle": return Math.PI * sh.r ** 2;
      case "square": return sh.s ** 2;
      default: { const _exhaustive: never = sh; return _exhaustive; } // compile error if a case is added
    }
  }
  ```
  This converts "scattered, non-exhaustive switch" into "one switch the compiler forces
  you to complete." Where behavior (not just data) varies, a **Strategy** record
  (`Record<Kind, () => T>`) or polymorphic classes beat the switch entirely.
- **Detection signal.** ESLint `@typescript-eslint/switch-exhaustiveness-check`
  (requires `default` handling / errors on missing union members);
  `no-fallthrough`; `default-case`. `grep -rnE '\bswitch\s*\(' src` then check each for a
  `never` guard. Repeated switches on the same discriminant: grep the discriminant name.

#### 7. Temporary Field

- **Signs & symptoms.** A field that holds a meaningful value only during a specific
  operation and is empty/`null`/`undefined` the rest of the time. You expect object state
  to be populated, but it's usually blank.
- **Why it happens / why it hurts.** To avoid a long parameter list, an algorithm's
  intermediate inputs get parked on instance fields. Readers can't tell when the field is
  valid; invariants live in the programmer's head, not the type.
- **Treatment.** *Extract Class* / *Replace Method with Method Object* (move the algorithm
  and its scratch fields into a dedicated object that lives only for the computation).
  *Introduce Null Object* to replace existence checks.
- **TypeScript manifestation.** Optional props that are "sometimes set" are the TS
  signature: `interface Job { status: string; error?: string; result?: T }`. Model the
  *states* as a **discriminated union** so impossible combinations are unrepresentable:
  ```ts
  type Job<T> =
    | { status: "pending" }
    | { status: "done"; result: T }       // result present iff done
    | { status: "failed"; error: string };// error present iff failed
  ```
  This is "make illegal states unrepresentable." Scratch fields on a class become locals
  in an extracted function or fields on a short-lived helper object.
- **Detection signal.** `grep -rnE '\?\s*:' src` density of optional props on a single
  type, especially several that are mutually exclusive. Frequent `if (this.x !== undefined)`
  guards on a field. `strictNullChecks` makes the optionals visible; clusters of `!`
  non-null assertions on the same field point here.

#### 8. Refused Bequest

- **Signs & symptoms.** A subclass uses only part of what it inherits; the unused members
  go dead, or are overridden to throw ("not supported here").
- **Why it happens / why it hurts.** Inheritance chosen for code reuse alone, between
  classes that aren't truly an *is-a*. It breaks the Liskov substitution principle: a
  client holding the base type can call a method the subclass refuses.
- **Treatment.** If the relationship is bogus, *Replace Inheritance with Delegation*
  (compose instead). If inheritance is genuine but the base is too fat, *Extract
  Superclass* — pull the shared parts into a new common parent both classes extend.
- **TypeScript manifestation.** A subclass overriding to `throw new Error("unsupported")`,
  or implementing an `interface` with stubbed members. Prefer **composition over
  inheritance** and **narrow interfaces** (Interface Segregation): split a fat interface so
  classes implement only what they truly support. TS's structural typing means you rarely
  *need* inheritance for reuse — a shared module of functions or an injected dependency is
  usually cleaner.
- **Detection signal.** `grep -rnE 'throw new (Error|TypeError)\(.*(not |un)support' src`
  for refusal stubs. Overrides that ignore the parent entirely; methods that `super` is
  never called from. Review heuristic: any `extends` where the subclass overrides most
  methods.

#### 9. Alternative Classes with Different Interfaces

- **Signs & symptoms.** Two classes/modules do essentially the same job but expose
  different method names and signatures, so callers can't treat them interchangeably.
- **Why it happens / why it hurts.** Whoever wrote the second one didn't know the first
  existed. You get duplicated capability with no shared abstraction, and clients hard-code
  to one or the other.
- **Treatment.** Converge the interfaces: *Rename Method*, *Move Method*, *Add Parameter*,
  *Parameterize Method* until signatures match; *Extract Superclass* for shared behavior;
  then delete the redundant class. RG "ignore": when the twins live in third-party libs you
  can't unify.
- **TypeScript manifestation.** Two `HttpClient`s — `get()/post()` vs `fetchData()/send()`
  — that should satisfy one **interface**. Because TS is structurally typed, defining a
  common `interface` and aligning method names lets both be used polymorphically without an
  inheritance hierarchy. When you can't change a third-party twin, wrap it with an
  **Adapter** to the common interface (links to Incomplete Library Class).
- **Detection signal.** `jscpd` / `find_semantic_clones`-style tools flag two modules with
  near-identical bodies and different names. Review: two types with the same fields/return
  shapes but divergent method names. Grep for duplicated domain nouns across modules
  (`grep -rniE 'class .*Client' src`).

---

### Change Preventers

#### 10. Divergent Change

- **Signs & symptoms.** One class/module must be edited for *many unrelated reasons* — add
  a product type and you touch find, display, and order methods in the same file.
- **Why it happens / why it hurts.** Multiple responsibilities crammed into one unit (SRP
  violation). Every axis of change collides in one place, so unrelated changes risk each
  other and the file is a perpetual merge-conflict magnet.
- **Treatment.** *Extract Class* along the axes of change — each resulting unit should have
  *one reason to change*. If several classes now share behavior, *Extract Superclass* /
  *Extract Subclass*.
- **TypeScript manifestation.** A `utils.ts` or `api.ts` touched by every feature; a store
  slice changed by formatting, networking, *and* validation work. Split by **reason to
  change** into feature/domain modules with explicit boundaries. Co-locate the type, its
  logic, and its tests so a single concern is a single directory.
- **Detection signal.** **Git history is the detector**: `git log --format= --name-only |
  sort | uniq -c | sort -rn | head` — files at the top change for everything. High
  authorship/commit churn on one module. `madge` fan-out from one module into many domains.

#### 11. Shotgun Surgery

- **Signs & symptoms.** The opposite of Divergent Change: one logical change forces small
  edits across *many* files/classes (rename a concept → touch 14 files).
- **Why it happens / why it hurts.** A single responsibility was smeared across many units.
  Each change is tedious and error-prone; it's easy to miss a site, leaving an
  inconsistency the type checker may not catch.
- **Treatment.** *Move Method* / *Move Field* to consolidate the scattered responsibility
  into one home; if the donor classes end up empty, *Inline Class* them away.
- **TypeScript manifestation.** A status string duplicated as a literal in 14 files instead
  of one shared union; an env-var read inline everywhere instead of one config module; a DTO
  shape redefined per file. **Centralize**: one exported `type`/`const`, imported
  everywhere, so the change is one edit and the compiler propagates it. (A shared union also
  means a new variant *breaks compilation* everywhere it must be handled — turning Shotgun
  Surgery into compiler-guided edits.)
- **Detection signal.** `grep -rn "literal-or-name" src | wc -l` — a concept appearing in
  many files is the smell. `madge`/`dpdm` showing one concept's edits rippling across the
  graph. Review heuristic: PRs that touch many files for one conceptual change.

#### 12. Parallel Inheritance Hierarchies

- **Signs & symptoms.** Every time you add a subclass in hierarchy A, you must add a
  matching subclass in hierarchy B (`Shape`→`Circle`/`Square` forces
  `ShapeRenderer`→`CircleRenderer`/`SquareRenderer`).
- **Why it happens / why it hurts.** A special case of Shotgun Surgery driven by mirrored
  taxonomies. The two trees are coupled by convention only; forgetting the mirror edit
  silently breaks things.
- **Treatment.** Make instances of one hierarchy *refer to* instances of the other, then
  collapse the redundant tree via *Move Method* / *Move Field*. RG "ignore": if
  de-duplication produces uglier code, revert.
- **TypeScript manifestation.** Mirrored class trees, or mirrored unions —
  `type Event = "click" | "hover"` paired with a separate `class ClickHandler /
  HoverHandler` tree. Collapse with a **strategy map** keyed by the discriminant:
  `const handlers: Record<Event, Handler>`. Composition + a single source-of-truth union
  removes the second hierarchy. React: prefer one config-driven component over parallel
  component subtrees.
- **Detection signal.** Two directories whose file lists mirror each other
  (`diff <(ls a/) <(ls b/)` shows matching stems). Review: "added X, now must add Y"
  recurring in commit messages. `madge` showing two cluster shapes that always grow together.

---

### Dispensables

#### 13. Comments

- **Signs & symptoms.** A function dense with explanatory comments narrating *what* the
  next lines do.
- **Why it happens / why it hurts.** Comments written to compensate for unclear code —
  "deodorant over fishy code." They drift out of sync with the code (the comment lies after
  the next edit), and they signal that names/structure are doing too little work.
- **Treatment.** *Extract Variable* (name a sub-expression), *Extract Method* (name a block
  — often the comment text *is* the method name), *Rename Method* (make the name carry the
  meaning), *Introduce Assertion* (encode a required precondition as a check). RG "keep":
  comments that explain *why* (rationale, tricky-algorithm notes), not *what*.
- **TypeScript manifestation.** `// loop over active users and sum balances` →
  `const total = sumBalances(activeUsers(users))`. In TS, the **type and the name** are the
  primary documentation; a narration comment usually means a missing well-named helper or a
  too-wide type. Keep JSDoc that documents public API contracts and `// why:` comments; cut
  the play-by-play. `@deprecated`/`@internal` JSDoc tags are *useful* comments (tooling reads
  them).
- **Detection signal.** Comment density per function (high `// ` count inside a body).
  `grep -rnE '^\s*//' src | wc -l` trend over time. Comments immediately above a code block
  (vs at module top) are the suspect pattern. ESLint `capitalized-comments`/custom rules can
  surface narration.

#### 14. Duplicate Code

- **Signs & symptoms.** Two fragments that are identical or near-identical; subtler:
  fragments that *look* different but do the same job.
- **Why it happens / why it hurts.** Parallel work without awareness; copy-paste under
  deadline pressure. Every clone must be edited in lockstep forever — the prime driver of
  maintenance cost and inconsistency bugs.
- **Treatment.** Same class: *Extract Method*. Sibling subclasses: *Extract Method* +
  *Pull Up Method/Field* (or *Pull Up Constructor Body*); similar-not-identical:
  *Form Template Method*; different algorithms: *Substitute Algorithm*. Across unrelated
  classes: *Extract Superclass* or *Extract Class* + reuse. Duplicated conditionals:
  *Consolidate Conditional Expression* / *Consolidate Duplicate Conditional Fragments*.
- **TypeScript manifestation.** Copy-pasted validation, mappers, fetch wrappers; the same
  `try/catch/log` boilerplate in every handler. Extract a shared function/module; for
  varying-shape data, a **generic** function (`function pick<T, K extends keyof T>(...)`);
  for varying *behavior*, pass a callback/strategy. Duplicated *types* → one exported
  `type`/`interface` (ties to Data Clumps + Shotgun Surgery). Beware false DRY: don't merge
  fragments that merely *look* alike but change for different reasons.
- **Detection signal.** **`jscpd`** (token-level copy-paste detector) is the standard;
  set a threshold in CI. `find_semantic_clones` / similarity search for non-textual
  duplication. ESLint `no-duplicate-imports`. Review: identical diffs landing in two files.

#### 15. Lazy Class

- **Signs & symptoms.** A class/module that does too little to justify the cost of
  understanding and maintaining it — often a husk left after refactoring, or a placeholder
  for work that never happened.
- **Why it happens / why it hurts.** Over-extraction, or speculative scaffolding. Every
  unit has a fixed cognitive and navigational tax; an under-employed one is pure overhead.
- **Treatment.** *Inline Class* (fold it into its sole user); for thin subclasses,
  *Collapse Hierarchy*. RG "ignore": a class deliberately marking a planned extension point.
- **TypeScript manifestation.** A one-method `class` that should be a plain function; a
  wrapper module that just re-exports one symbol; a single-field interface used once. TS
  favors functions and plain objects — inline trivial classes, delete pass-through barrels.
  A `type Alias = OtherType` used in one place is the type-level version.
- **Detection signal.** `knip`/`ts-prune` flag barely-used exports; files with one tiny
  symbol. `grep -rnE 'export class' src` then check method/field counts. Modules with high
  import cost but ~1 reference.

#### 16. Data Class

- **Signs & symptoms.** A class that is only fields + getters/setters, with no behavior —
  a dumb container others operate on.
- **Why it happens / why it hurts.** Fine as a transient stage, but if logic about the data
  lives *outside* it, that logic gets duplicated across clients and the data's invariants go
  unenforced (anemic domain model).
- **Treatment.** *Encapsulate Field* / *Encapsulate Collection* to control access; find
  behavior in clients that belongs on the data and *Move Method* / *Extract Method* it in;
  then *Remove Setting Method* / *Hide Method* to tighten the now-rich API. (Note the
  tension with Feature Envy: behavior should sit with the data it uses.)
- **TypeScript manifestation.** Nuance: in TS a pure-data **DTO/`interface`** is often
  *correct and idiomatic* — a wire shape, a Redux state slice, a function's plain return
  object. The smell is specifically a *class* that holds data but where related behavior is
  scattered. Cure: either move behavior onto the type's module (functions that take the
  type), or, if it really is just data, make it an `interface`/`readonly` record and stop
  pretending it's an object with methods. `class` with only public mutable fields → `interface`
  or `Readonly<T>`.
- **Detection signal.** `grep -rnE 'get [a-zA-Z]+\(\)|set [a-zA-Z]+\(' src` (getter/setter
  density). Classes with fields but trivial method bodies. Review: logic over a type living
  in many call sites rather than near the type.

#### 17. Dead Code

- **Signs & symptoms.** A variable, parameter, field, function, class, file, or branch that
  is never reached or never used — often after a requirement changed and cleanup was skipped.
- **Why it happens / why it hurts.** Nobody removed the obsolete code; or a conditional
  branch became unreachable. It bloats the codebase, misleads readers ("this must matter"),
  and inflates build/test surface.
- **Treatment.** Delete it. For an unused class in a hierarchy, *Inline Class* /
  *Collapse Hierarchy*; for unused params, *Remove Parameter*. Trust version control — you
  can always recover deleted code.
- **TypeScript manifestation.** Unused exports, unreferenced files, dead union branches,
  unreachable code after `return`/`throw`, unused generic params, commented-out blocks.
  TS/lint catch the local cases; the *export-graph* cases need dedicated tools.
- **Detection signal.** **`knip`** and **`ts-prune`** for unused exports/files/deps;
  TS `noUnusedLocals` / `noUnusedParameters`; ESLint `no-unreachable`,
  `@typescript-eslint/no-unused-vars`, `no-dead-code`-style rules. `find_dead_code` /
  `find_unused_exports` (code-intel). `grep -rn "^\s*//.*[;{}]" src` for commented-out code.

#### 18. Speculative Generality

- **Signs & symptoms.** Abstractions, hooks, params, or "framework" machinery built for a
  future that never arrived: an abstract base with one implementation, a strategy interface
  with one strategy, a config option never set to anything but its default.
- **Why it happens / why it hurts.** "We might need it later" / YAGNI violation.
  Unnecessary indirection makes code harder to follow and maintain *now*, in exchange for
  flexibility you may never use. (This is the counterweight to the Rule of Three — don't
  abstract before the third instance.)
- **Treatment.** *Collapse Hierarchy* (drop the lone abstract layer), *Inline Class*
  (remove pointless delegation), *Inline Method* (remove unused indirection),
  *Remove Parameter* (drop unused params), delete unused fields. RG "ignore": genuine
  library/framework APIs whose extensibility serves external users; and test-only hooks.
- **TypeScript manifestation.** Over-generic signatures — `function f<T, U, V>()` where
  callers always pass the same concrete types; a `Strategy` interface with a single impl;
  options objects full of never-used flags; an event-bus for one event. **Prefer concrete
  until duplication demands generic.** Remove unused type parameters (they're dead code at
  the type level). A one-implementation `interface` + DI container is often
  premature — inline it.
- **Detection signal.** `knip`/`ts-prune` (unused exports & types). Generic arity audit:
  `grep -rnE '<[A-Z], ?[A-Z], ?[A-Z]' src` for high-arity generics; check each type param's
  variance of use. Interfaces with exactly one `implements`. Review: "added for future use"
  in comments/PRs.

---

### Couplers

#### 19. Feature Envy

- **Signs & symptoms.** A method/function is more interested in *another* object's data
  than its own — it reaches across to pull fields and compute over them.
- **Why it happens / why it hurts.** Behavior placed away from the data it operates on
  (often after fields were moved to a Data Class). It couples the two units and scatters
  logic that should be co-located; "things that change together should live together."
- **Treatment.** *Move Method* (relocate it to the data's home); *Extract Method* first if
  only part of the function envies, then move that part; if it envies several classes, put
  it where the *majority* of the data lives. RG "ignore": Strategy/Visitor intentionally
  separate behavior from data.
- **TypeScript manifestation.** `function totalPrice(order: Order) { return order.items.reduce(...) }`
  living in a `utils` file rather than as `order.totalPrice()` or in the order module. In a
  functional TS style, "move method" means **co-locate the function in the module that owns
  the type** and operates on its internals. React: a component digging through
  `props.user.profile.settings.x` repeatedly wants a selector/method nearer the data.
- **Detection signal.** Functions whose body references `other.` far more than `this`/own
  params: `grep`-count `someObj\.` accesses vs own. Code-intel `get_data_flow` /
  `find_references` showing a function bound tightly to a foreign type. LCOM-style locality
  metrics; review heuristic: many dotted accesses into one external object.

#### 20. Inappropriate Intimacy

- **Signs & symptoms.** One class/module reaches into another's *internal* fields and
  methods; bidirectional knowledge of each other's privates.
- **Why it happens / why it hurts.** Boundaries eroded over time. Good units know as little
  about each other as possible; intimate ones can't be changed, tested, or reused
  independently.
- **Treatment.** *Move Method* / *Move Field* (relocate what's used into the user);
  *Extract Class* + *Hide Delegate* (formalize the relationship through a clean interface);
  *Change Bidirectional Association to Unidirectional* (cut the back-reference); if it's a
  sub/superclass overreach, *Replace Delegation with Inheritance* (or vice-versa).
- **TypeScript manifestation.** A module importing another's *non-public* internals (deep
  import paths into `dist/internal/...`), components mutating each other's state,
  reaching past a public API into private fields (TS `private` is compile-time only — a
  determined caller can still `(obj as any).field`). Cures: expose a **narrow public
  interface**, mark internals with `@internal` / `private` / `#privateFields`, enforce
  module boundaries with import-path lint, break cycles.
- **Detection signal.** **`madge --circular`** / `dpdm` / `find_circular_imports` for
  mutual dependence. `grep -rnE "as any\)\.[a-zA-Z]" src` for private-field reach-arounds.
  Deep relative imports `grep -rnE "from '\.\./\.\./\.\./" src`. ESLint
  `import/no-internal-modules`, `no-restricted-imports` to fence boundaries.

#### 21. Message Chains

- **Signs & symptoms.** A train of calls/property accesses: `a.b().c().d()` or
  `a.b.c.d.e`. The caller is navigating deep through the object graph.
- **Why it happens / why it hurts.** The client depends on the *entire navigation path*;
  any structural change anywhere along the chain breaks the caller. It leaks the internal
  shape of intermediate objects.
- **Treatment.** *Hide Delegate* (let the first object expose a method that hides the
  traversal); or, if the chain exists to do something at the end, *Extract Method* +
  *Move Method* that work to the chain's head. RG caveat: don't over-hide into a Middle Man.
- **TypeScript manifestation.** `user.getAddress().getCity().getZip()`, or
  `config.server.tls.options.cert`, or Redux `state.a.b.c.d`. Cures: a method on the head
  (`user.zip()`), a **selector** function, the **Law of Demeter** ("talk to friends, not
  strangers"). Note TS **optional chaining** `a?.b?.c?.d` makes chains *safe* but not
  *uncoupled* — `?.` papering over a deep chain is the smell, not the fix.
- **Detection signal.** `grep -rnE '\)\.[a-zA-Z]+\(\)\.[a-zA-Z]+\(' src` for `.x().y()`
  chains; `grep -rnE '(\?\.[a-zA-Z]+){3,}' src` for `?.`-chains 3+ deep; `(\.[a-zA-Z]+){4,}`
  for long property paths. Review heuristic: any access ≥3 dots deep into a graph.

#### 22. Middle Man

- **Signs & symptoms.** A class/module whose methods mostly just *delegate* to another
  object and do nothing else — a pass-through shell.
- **Why it happens / why it hurts.** Over-zealous *Hide Delegate* (the over-correction of
  Message Chains), or behavior gradually migrating out until only forwarding remains. The
  middle layer adds indirection and maintenance with no value; readers can't find where work
  actually happens.
- **Treatment.** *Remove Middle Man* — let clients talk to the real object directly.
  RG "ignore": deliberate indirection (Proxy, Decorator, Facade) or middle men that exist to
  *cut* a dependency.
- **TypeScript manifestation.** A "service" class every method of which is
  `return this.repo.x(args)`; a wrapper module that re-exports and forwards with no added
  logic; a React component that only spreads props to one child (`<Child {...props} />`).
  Remove the layer unless it's an intentional Adapter/Facade adding a real seam. Distinguish
  from a legitimate **anti-corruption layer** — that one *transforms*, it doesn't just forward.
- **Detection signal.** Methods whose bodies are a single `return this.x.method(...args)`:
  `grep -rnE 'return this\.[a-zA-Z]+\.[a-zA-Z]+\(' src`. `knip` showing a module is a thin
  re-export. Review: a class where ≥half the methods are one-line forwards.

#### 23. Incomplete Library Class

- **Signs & symptoms.** A third-party library almost meets your need but lacks a method/
  behavior, and you can't edit it (it's read-only / external).
- **Why it happens / why it hurts.** Library authors can't anticipate every use; you're
  stuck between forking and duplicating. Working around it ad hoc spreads compensating code
  everywhere the library is used.
- **Treatment.** *Introduce Foreign Method* (a helper function that takes the library object
  as its first argument, for a small gap); *Introduce Local Extension* (a subclass or wrapper
  that adds the missing behavior, for larger gaps). RG "ignore": if extending creates more
  churn than it saves.
- **TypeScript manifestation.** TS gives extra options the OO catalog predates:
  **declaration merging / module augmentation** (`declare module "lib" { interface X { ... } }`)
  to extend third-party *types*; **`Adapter`/wrapper** modules to add behavior; standalone
  **helper functions** (`function withRetry(client: LibClient) {...}`) as Foreign Methods;
  and ambient `.d.ts` augmentation when the lib's *types* (not behavior) are incomplete.
  Prefer a thin local extension module so the workaround lives in one place.
- **Detection signal.** Repeated identical helper/utility wrappers around the same library
  call across the codebase (`jscpd`, or grep the library symbol). Many `as`/`@ts-ignore`
  near a specific import (its types are incomplete): `grep -rnE "from '(lib-name)'" src`
  cross-referenced with `as`/`@ts-ignore` density. Patterns of `(libObj as any).x`.

---

## Part 4 — TypeScript detection cheat-sheet (cross-smell)

A consolidated tooling map; wire these into CI so smells fail the build rather than
accreting as debt.

| Tool / signal | Catches (smells) |
| --- | --- |
| **ESLint** `complexity`, `max-lines-per-function`, `max-statements`, `max-depth`, `max-nested-callbacks` | Long Method |
| **ESLint** `max-lines`, `max-classes-per-file` | Large Class |
| **ESLint** `max-params` (≤3–4) | Long Parameter List, Data Clumps |
| **ESLint** `@typescript-eslint/switch-exhaustiveness-check`, `default-case`, `no-fallthrough` | Switch Statements, Temporary Field (via DU modeling) |
| **ESLint** `@typescript-eslint/no-magic-numbers`, `no-magic-strings`-style | Primitive Obsession |
| **ESLint** `@typescript-eslint/no-unused-vars`, `no-unreachable`; **tsc** `noUnusedLocals`, `noUnusedParameters` | Dead Code |
| **ESLint** `import/no-internal-modules`, `no-restricted-imports`, `import/no-cycle` | Inappropriate Intimacy, Message Chains, Middle Man |
| **`knip`** / **`ts-prune`** | Dead Code, Lazy Class, Speculative Generality (unused exports/types/files/deps) |
| **`jscpd`** | Duplicate Code, Data Clumps, Alternative Classes w/ Different Interfaces |
| **`madge`** / **`dpdm`** (`--circular`, fan-in/out) | Inappropriate Intimacy, Divergent Change, Shotgun Surgery, Parallel Inheritance |
| **`type-coverage`** | Primitive Obsession (rewards branded/typed over wide primitives) |
| **`tsc` `--strict`** (incl. `strictNullChecks`, `exactOptionalPropertyTypes`) | Temporary Field, Primitive Obsession, escape-hatch debt |
| **grep escape-hatch density**: `grep -rnE 'as any\|@ts-(ignore\|expect-error)\|: any\b\|!\.' src \| wc -l` | global type-debt proxy (correlates with Primitive Obsession, Inappropriate Intimacy, Incomplete Library Class) |
| **grep chain depth**: `(\?\.[a-zA-Z]+){3,}` / `\)\.[a-z]+\(\)\.[a-z]+\(` | Message Chains |
| **git churn**: `git log --format= --name-only \| sort \| uniq -c \| sort -rn` | Divergent Change (hot file = many reasons to change) |
| **code-intel** `find_dead_code`, `find_unused_exports`, `find_circular_imports`, `find_semantic_clones`, `get_data_flow` | Dead Code, cycles/intimacy, Duplicate/Alternative Classes, Feature Envy |

**TS-specific anti-smell techniques referenced throughout:** discriminated unions +
`never` exhaustiveness (Switch, Temporary Field, Parallel Hierarchies); branded/nominal
types and smart constructors (Primitive Obsession); options objects (Long Parameter List);
extracted named `interface`/`type` (Data Clumps, Duplicate Code, Shotgun Surgery);
composition + narrow interfaces over inheritance (Refused Bequest, Parallel Hierarchies);
"make illegal states unrepresentable" (Temporary Field, Primitive Obsession); module
augmentation / Adapter (Incomplete Library Class); selectors + Law of Demeter (Message
Chains). These connect the smell catalog to the refactoring-technique and design-pattern
references (see r4b, r4c).

---

*Synthesis of the Refactoring.Guru code-smell catalog (https://refactoring.guru/refactoring/smells)
and refactoring philosophy pages, re-grounded for TypeScript. Original prose; RG cited as the
primary external reference.*

# Smell Catalog — DIAGNOSE

The diagnostic reference. Use it in three moves: **detect** a symptom, **name** the
smell, **look up the treatment** (which links out — this file never restates mechanics,
paradigm decisions, or target patterns).

**Spine framing.** A smell is a place where the code admits more **reachable states**
than the problem needs. A boolean flag doubles the states; a sometimes-set optional
doubles them again; an `any` blows the count to infinity; a non-exhaustive `switch`
leaves reachable states unhandled. Every entry is one diagnosis: *this construct
inflates the reachable-state space; the treatment collapses it, ideally so the compiler
proves the collapse.* Smells are heuristics, not laws — recognize the smell, diagnose
the weakness, pick the smallest move that removes the *cause*, verify behavior holds.

**Taxonomy source.** The five classic categories, the 23 classic smells
(entries 1–23), and the *italicized* refactorings are from
[refactoring.guru](https://refactoring.guru/refactoring/smells) (Shvets,
distilling Fowler's *Refactoring* and Beck); entries 24–29 are a TypeScript-native
group we add (29 smells total). The prose, TypeScript forms, and detection signals
here are original and TS-native.

**Treatments point to:** mechanics → `refactoring-mechanics.md`; paradigm/pattern
decisions (functions vs classes, GoF verdicts, indirection audit) →
`paradigms-and-patterns.md`; target shape (DU, brands, ports, FC/IS, type-state) →
`dev:typescript` (`references/design-patterns.md`).

---

## The five categories at a glance

| Category | Failure mode | Members | TS detection focus |
| --- | --- | --- | --- |
| **Bloaters** | grown too large; nobody removes anything | Long Method · Large Class · Primitive Obsession · Long Parameter List · Data Clumps | `complexity`, `max-lines*`, `max-params`, brands, options objects |
| **OO Abusers** | OO/polymorphism applied wrong or half-way | Switch Statements · Temporary Field · Refused Bequest · Alternative Classes w/ Different Interfaces | exhaustive-switch lint, DUs, `jscpd` on near-twins |
| **Change Preventers** | one change forces edits in many places (or vice versa) | Divergent Change · Shotgun Surgery · Parallel Inheritance Hierarchies | git churn, `madge`/`dpdm` fan-in/out |
| **Dispensables** | their *absence* improves the code | Comments · Duplicate Code · Lazy Class · Data Class · Dead Code · Speculative Generality | `knip`/`ts-prune`, `jscpd`, comment density, generic-arity |
| **Couplers** | too much coupling, or its over-correction | Feature Envy · Inappropriate Intimacy · Message Chains · Middle Man · Incomplete Library Class | `madge --circular`, chain-depth grep, `as any).` reach-arounds |

---

## Bloaters

### 1. Long Method

- **Signs.** A body you can't hold in your head (questions start past ~10 lines); the urge to write a comment above a block — that block wants to be a named function.
- **Why it hurts.** Length is the readable proxy for state: more statements/branches/locals in flight at once; long bodies also hide duplication and resist isolated testing.
- **TypeScript form.** A 200-line React component or Express handler doing validation + business logic + persistence + serialization inline; each `// build the payload` comment marks an unextracted function.
- **Detection signal.** ESLint `complexity`, `max-lines-per-function`, `max-statements`, `max-depth`, `max-nested-callbacks`; code-intel `get_complexity`/`get_function_hotspots`; long functions cluster low branch coverage.
- **Treatment.** *Extract Method*; *Decompose Conditional*; *Replace Nested Conditional with Guard Clauses* for arrow-code → `refactoring-mechanics.md`. In components, extract hooks/children.

### 2. Large Class

- **Signs.** A class — or in TS a module/service/store — with too many fields, methods, and lines, "wearing too many hats."
- **Why it hurts.** SRP violation: unrelated concerns change together and the whole surface stays in your head; the unit's state space is the product of every concern it owns.
- **TypeScript form.** A 1,500-line `UserService`; a slice owning auth + cart + telemetry; the **god module** — an `index.ts` re-exporting everything until the file *is* the de-facto class.
- **Detection signal.** ESLint `max-lines`, `max-classes-per-file`; high **fan-in** in `madge`/`dpdm`; LCOM tools flag methods touching disjoint fields; code-intel `get_hotspots`.
- **Treatment.** *Extract Class* by responsibility; *Extract Interface* for the consumer contract → `refactoring-mechanics.md`. Placement → `cognition:domain-design`; target module shape → `dev:typescript` (`references/design-patterns.md`).

### 3. Primitive Obsession

- **Signs.** Raw primitives for domain concepts (currency, phone, ids, email); constants as type codes (`const ROLE_ADMIN = 1`); string keys as pseudo-fields.
- **Why it hurts.** The compiler can't stop you passing a `userId` where an `orderId` is wanted — same-typed values are interchangeable and validation scatters; a wide `string` admits ∞ states where the domain has ~3.
- **TypeScript form.** The canonical TS smell. Stringly-typed values want a union; interchangeable ids want **branded/nominal** types minted by a parser:

  ```ts
  function suspend(userId: string, status: string) {}        // every string is every other string
  type UserId = string & { readonly __brand: "UserId" };
  type Status = "active" | "suspended" | "closed";
  function suspend(userId: UserId, status: Status) {}        // illegal values unrepresentable
  ```

- **Detection signal.** `grep -rnE ': (string|number)\b' src` density on domain fields; bare literals in conditionals; `type-coverage` rewards the fix; ESLint `@typescript-eslint/no-magic-numbers`.
- **Treatment.** *Replace Data Value with Object* / *Replace Type Code with…* → `refactoring-mechanics.md`. Brand/smart-constructor shapes → `dev:typescript` (`references/design-patterns.md`).

### 4. Long Parameter List

- **Signs.** More than ~3–4 params; worse, several booleans or several same-typed params in a row — call sites become positional guessing games.
- **Why it hurts.** Order-dependence the compiler can't catch (`drawRect(x, y, w, h)`); each param multiplies call-site states; flag soup (`(true, false, true)`) is a state machine smuggled through the signature.
- **TypeScript form.** The **options object** is the idiomatic fix; booleans become a mode union:

  ```ts
  function createUser(name: string, email: string, isAdmin: boolean, notify: boolean) {}   // order-fragile, flag-laden
  function createUser(opts: { name: string; email: string; role: "user" | "admin"; notify?: boolean }) {}
  ```

- **Detection signal.** ESLint `max-params` (3–4); `grep -rnE '\([^)]*,[^)]*,[^)]*,[^)]*,' src` for 4+-arg calls; consecutive same-type params flagged in review or AST scan.
- **Treatment.** *Introduce Parameter Object*, *Preserve Whole Object*, *Replace Parameter with Method Call* → `refactoring-mechanics.md`. Boolean→union is a **flags→DU** move; coordinate with `dev:typescript` (`references/refactoring-patterns.md`).

### 5. Data Clumps

- **Signs.** The same group of values travels together repeatedly (`x, y`; `street, city, zip`). Litmus: delete one; if the rest stop making sense, they're a clump.
- **Why it hurts.** An un-named concept whose members can drift apart, with no cohesive home for group behavior; it's latent Shotgun Surgery — a field change becomes a multi-file edit.
- **TypeScript form.** A duplicated anonymous object type begging to be one exported `interface`:

  ```ts
  function ship(street: string, city: string, zip: string) {}   // same clump across 6 sites
  function tax(street: string, city: string, zip: string) {}
  interface Address { street: string; city: string; zip: string }
  function ship(addr: Address) {}                               // one edit propagates
  ```

- **Detection signal.** `jscpd` on repeated literal shapes; `grep -rnE 'street: string, city: string, zip: string' src` for the ordered triple; structurally identical anonymous types are reviewable.
- **Treatment.** *Extract Class* / *Introduce Parameter Object* / *Preserve Whole Object*, then migrate group behavior onto the type → `refactoring-mechanics.md`.

---

## Object-Orientation Abusers

### 6. Switch Statements

- **Signs.** A complex `switch`/`if-else if` ladder branching on a type code — and the *same* branching appears in several places, so a new case means hunting every copy.
- **Why it hurts.** Scattered, non-exhaustive switches are change-amplifiers: a new variant touches N sites and one is always missed; no totality check leaves reachable states silently unhandled.
- **TypeScript form.** Keep the switch, but make the compiler enforce totality via a **discriminated union + `never` exhaustiveness check**:

  ```ts
  type Shape = { kind: "circle"; r: number } | { kind: "square"; s: number };
  function area(sh: Shape): number {
    switch (sh.kind) {
      case "circle": return Math.PI * sh.r ** 2;
      case "square": return sh.s ** 2;
      default: { const _x: never = sh; return _x; }  // adding a variant breaks compilation here
    }
  }
  ```

- **Detection signal.** ESLint `@typescript-eslint/switch-exhaustiveness-check`, `default-case`, `no-fallthrough`; `grep -rnE '\bswitch\s*\(' src` then check each for a `never` guard; grep the discriminant name to find scattered copies.
- **Treatment.** *Replace Conditional with Polymorphism* — or its TS-idiomatic inverse, DU + `never` → `refactoring-mechanics.md`. DU vs Strategy-record vs polymorphism → `paradigms-and-patterns.md`; target shape → `dev:typescript` (`references/design-patterns.md`).

### 7. Temporary Field

- **Signs.** A field meaningful only during one operation, empty/`null` the rest of the time — you expect state populated, but it's usually blank.
- **Why it hurts.** Readers can't tell when the field is valid; the invariant lives in someone's head, not the type, and it admits the illegal state *field-set-but-not-computing*.
- **TypeScript form.** "Sometimes-set" optionals are the signature. Model states as a DU so impossible combinations are unrepresentable:

  ```ts
  // before: error? and result? can each be present/absent independently
  interface Job<T> { status: string; error?: string; result?: T }
  // after: each field exists only in the variant that owns it
  type Job<T> =
    | { status: "pending" }
    | { status: "done"; result: T }     // result present iff done
    | { status: "failed"; error: string };
  ```

- **Detection signal.** Density of optional props on one type (`grep -rnE '\?\s*:' src`), especially mutually-exclusive ones; clusters of `!` or `if (this.x !== undefined)` guards on one field; `exactOptionalPropertyTypes` sharpens it.
- **Treatment.** *Extract Class* / *Replace Method with Method Object* for scratch fields; make illegal states unrepresentable via DU → `refactoring-mechanics.md`; target shape → `dev:typescript` (`references/design-patterns.md`).

### 8. Refused Bequest

- **Signs.** A subclass uses only part of what it inherits; unused members go dead or are overridden to `throw new Error("unsupported")`.
- **Why it hurts.** Inheritance chosen for reuse between non-*is-a* classes breaks Liskov — a client holding the base type can call a method the subclass refuses, a reachable crash.
- **TypeScript form.** Override-to-throw, or an `interface` with stubbed members. Structural typing means you rarely *need* inheritance for reuse — a shared function module or injected dependency is cleaner; prefer **composition** + **narrow interfaces** (ISP).
- **Detection signal.** `grep -rnE 'throw new (Error|TypeError)\(.*(not |un)support' src` for refusal stubs; review any `extends` where the subclass overrides most methods.
- **Treatment.** *Replace Inheritance with Delegation*, or *Extract Superclass* if genuine → `refactoring-mechanics.md`. The functions-vs-classes call → `paradigms-and-patterns.md`; FC/IS target → `dev:typescript` (`references/design-patterns.md`).

### 9. Alternative Classes with Different Interfaces

- **Signs.** Two classes/modules do the same job with different method names and signatures, so callers can't treat them interchangeably.
- **Why it hurts.** Duplicated capability with no shared abstraction; clients hard-code to one and the two drift — two copies of the same state space to keep in sync.
- **TypeScript form.** Two `HttpClient`s (`get/post` vs `fetchData/send`) that should satisfy one `interface`. Structural typing lets both be used polymorphically once names align — no inheritance. For an unchangeable third-party twin, wrap with an **Adapter** (see Incomplete Library Class).
- **Detection signal.** `jscpd` / code-intel `find_semantic_clones` on near-identical bodies with different names; `grep -rniE 'class .*Client' src` for duplicated domain nouns.
- **Treatment.** *Rename/Move/Parameterize Method* to converge, *Extract Superclass*, then delete the redundant class → `refactoring-mechanics.md`. Adapter/port shape → `dev:typescript` (`references/design-patterns.md`).

---

## Change Preventers

### 10. Divergent Change

- **Signs.** One module edited for *many unrelated reasons* — add a product type and you touch find, display, and order code in the same file.
- **Why it hurts.** Multiple responsibilities in one unit (SRP): every axis of change collides in one place, and the file is a perpetual merge-conflict magnet.
- **TypeScript form.** A `utils.ts`/`api.ts` touched by every feature; a slice changed by formatting, networking, *and* validation. Split by **reason to change** into domain modules; co-locate type + logic + tests per concern.
- **Detection signal.** **Git history is the detector:** `git log --format= --name-only | sort | uniq -c | sort -rn | head` — top files change for everything; `madge` fan-out into many domains.
- **Treatment.** *Extract Class* along the axes of change (each unit = one reason to change) → `refactoring-mechanics.md`. Boundary/ownership → `cognition:domain-design`.

### 11. Shotgun Surgery

- **Signs.** The inverse of Divergent Change: one logical change forces small edits across *many* files (rename a concept → touch 14 files).
- **Why it hurts.** A single responsibility smeared across many units — tedious, error-prone, easy to miss a site and leave an inconsistency.
- **TypeScript form.** A status literal duplicated in 14 files instead of one shared union; an env-var read inline everywhere; a DTO redefined per file. **Centralize** into one exported `type`/`const` — a shared union turns a new variant into a *compile error everywhere it must be handled*, making the edit compiler-guided.
- **Detection signal.** `grep -rn "<literal-or-name>" src | wc -l`; `madge`/`dpdm` showing edits rippling across the graph; review PRs touching many files for one concept.
- **Treatment.** *Move Method/Field* to consolidate; *Inline Class* the emptied donors → `refactoring-mechanics.md`. Cross-repo graph-safe move → `gitnexus-refactoring`.

### 12. Parallel Inheritance Hierarchies

- **Signs.** Adding a subclass in hierarchy A forces a matching one in B (`Circle`/`Square` ⇒ `CircleRenderer`/`SquareRenderer`).
- **Why it hurts.** A special case of Shotgun Surgery from mirrored taxonomies, coupled by convention only; forgetting the mirror edit silently breaks things.
- **TypeScript form.** Mirrored class trees or union+handler trees. Collapse with a **strategy map** keyed by the discriminant: `const handlers: Record<Event, Handler>`. One source-of-truth union removes the second hierarchy; React prefers one config-driven component.
- **Detection signal.** Mirrored file stems (`diff <(ls a/) <(ls b/)`); recurring "added X, now must add Y" in commits; `madge` clusters that always grow together.
- **Treatment.** Reference one hierarchy from the other, then collapse the redundant tree (*Move Method/Field*) → `refactoring-mechanics.md`. Strategy-record vs polymorphism → `paradigms-and-patterns.md`.

---

## Dispensables

### 13. Comments

- **Signs.** A body dense with comments narrating *what* the next lines do.
- **Why it hurts.** "Deodorant over fishy code" — comments compensate for unclear names/structure and drift out of sync (the comment lies after the next edit).
- **TypeScript form.** `// loop over active users and sum balances` → `const total = sumBalances(activeUsers(users))`. In TS the **type and the name** are the primary docs; a narration comment usually means a missing helper or a too-wide type. **Keep** `// why:` rationale, tricky-algorithm notes, and JSDoc `@deprecated`/`@internal` (tooling reads them).
- **Detection signal.** Comment density inside a body; `grep -rnE '^\s*//' src | wc -l` trend; comments immediately above a block (vs module top) are the suspect pattern.
- **Treatment.** *Extract Variable* / *Extract Method* (the comment text is often the method name) / *Rename Method* → `refactoring-mechanics.md`. Narration comments in generated code → `llm-slop-cleanup.md`.

### 14. Duplicate Code

- **Signs.** Two identical or near-identical fragments; subtler, fragments that *look* different but do the same job.
- **Why it hurts.** Every clone must be edited in lockstep forever — the prime driver of maintenance cost and inconsistency bugs; two copies = two state spaces that can diverge.
- **TypeScript form.** Copy-pasted validation, mappers, the same `try/catch/log` per handler. Extract a shared function; for varying shape, a **generic** (`function pick<T, K extends keyof T>(…)`); for varying *behavior*, pass a callback. Duplicated *types* → one exported `type`. Beware false DRY — don't merge fragments that change for different reasons.
- **Detection signal.** **`jscpd`** (token-level; CI threshold) is the standard; code-intel `find_semantic_clones` for non-textual dupes; ESLint `no-duplicate-imports`.
- **Treatment.** *Extract Method* / *Extract Class* / *Pull Up Method* / *Form Template Method* / *Substitute Algorithm* → `refactoring-mechanics.md`. Repo-wide reuse (don't reimplement) → `llm-slop-cleanup.md`.

### 15. Lazy Class

- **Signs.** A class/module doing too little to justify its cost — often a husk left after refactoring or scaffolding for work that never happened.
- **Why it hurts.** Every unit carries a fixed cognitive and navigational tax; an under-employed one is pure overhead.
- **TypeScript form.** A one-method `class` that should be a function; a wrapper module re-exporting one symbol; a single-field interface used once; `type Alias = OtherType` used once. TS favors functions and plain objects — inline trivial classes, delete pass-through barrels.
- **Detection signal.** `knip`/`ts-prune` flag barely-used exports; `grep -rnE 'export class' src` then check method/field counts; modules with high import cost but ~1 reference.
- **Treatment.** *Inline Class* / *Collapse Hierarchy* → `refactoring-mechanics.md`. The "is this layer earning its keep" call → `paradigms-and-patterns.md` (indirection audit).

### 16. Data Class

- **Signs.** A *class* that is only fields + getters/setters, no behavior — a dumb container others operate on.
- **Why it hurts.** If logic about the data lives outside it, that logic duplicates across clients and invariants go unenforced (anemic domain model).
- **TypeScript form.** **Nuance:** a pure-data **DTO/`interface`** is often *correct* in TS — a wire shape, a Redux slice, a plain return object. The smell is specifically a *class* holding data with related behavior scattered. Cure: move behavior into the type's module (functions taking the type), or demote to `interface`/`Readonly<T>` and stop pretending it has methods.
- **Detection signal.** `grep -rnE 'get [a-zA-Z]+\(\)|set [a-zA-Z]+\(' src` (getter/setter density); classes with fields but trivial method bodies; review logic over a type living in many call sites.
- **Treatment.** *Encapsulate Field/Collection*, *Move Method* behavior in, or demote to `interface` → `refactoring-mechanics.md`. Class-vs-data call → `paradigms-and-patterns.md`.

### 17. Dead Code

- **Signs.** A variable, param, field, function, file, or branch never reached or used — usually after a requirement changed and cleanup was skipped.
- **Why it hurts.** Bloats the codebase, misleads readers ("this must matter"), inflates build/test surface; a dead branch is a reachable-looking state that isn't.
- **TypeScript form.** Unused exports, unreferenced files, dead union branches, unreachable code after `return`/`throw`, unused generic params, commented-out blocks. TS/lint catch local cases; export-graph cases need dedicated tools.
- **Detection signal.** **`knip`** and **`ts-prune`** (unused exports/files/deps); tsc `noUnusedLocals`/`noUnusedParameters`; ESLint `no-unreachable`, `@typescript-eslint/no-unused-vars`; code-intel `find_dead_code`/`find_unused_exports`; `grep -rn "^\s*//.*[;{}]" src` for commented-out code.
- **Treatment.** Delete it (trust version control); *Remove Parameter*; *Inline Class* for dead hierarchy members. Find → confirm → delete safely → `refactoring-mechanics.md`.

### 18. Speculative Generality

- **Signs.** Machinery built for a future that never arrived: an abstract base with one implementation, a strategy interface with one strategy, a config option never set off its default, `<T, U, V>` where callers always pass the same concrete types.
- **Why it hurts.** YAGNI violation — indirection costs reading and maintenance *now* for flexibility you may never use; the counterweight to the Rule of Three (don't abstract before the third instance).
- **TypeScript form.** Over-generic signatures, one-impl `interface` + DI container, options objects full of unused flags, an event-bus for one event. **Prefer concrete until duplication demands generic.** Unused type params are dead code at the type level.
- **Detection signal.** `knip`/`ts-prune`; `grep -rnE '<[A-Z], ?[A-Z], ?[A-Z]' src` for high-arity generics; interfaces with exactly one `implements`; review "added for future use."
- **Treatment.** *Collapse Hierarchy* / *Inline Class* / *Inline Method* / *Remove Parameter* → `refactoring-mechanics.md`. The earned-abstraction **Swap test** / indirection audit → `paradigms-and-patterns.md`.

---

## Couplers

### 19. Feature Envy

- **Signs.** A function more interested in *another* object's data than its own — it reaches across to pull fields and compute over them.
- **Why it hurts.** Behavior placed away from the data it uses couples the two units and scatters logic; "things that change together should live together."
- **TypeScript form.** `function totalPrice(order: Order) { return order.items.reduce(…) }` living in `utils` rather than the order module. In functional TS, "move method" means **co-locate the function in the module that owns the type**. React: a component digging through `props.user.profile.settings.x` wants a selector nearer the data.
- **Detection signal.** Bodies referencing `other.` far more than own params; code-intel `get_data_flow`/`find_references` showing a function bound to a foreign type; LCOM locality.
- **Treatment.** *Move Method* (relocate to the data's home); *Extract Method* first if only part envies → `refactoring-mechanics.md`. Correct home → `cognition:domain-design`.

### 20. Inappropriate Intimacy

- **Signs.** One module reaches into another's *internal* fields/methods; bidirectional knowledge of each other's privates.
- **Why it hurts.** Eroded boundaries mean intimate units can't be changed, tested, or reused independently; cycles couple two state spaces into one.
- **TypeScript form.** Deep imports into `dist/internal/…`; reaching past a public API via `(obj as any).field` (TS `private` is compile-time only); mutual imports. Cures: a **narrow public interface**, `@internal`/`#private`, import-path lint, broken cycles.
- **Detection signal.** **`madge --circular`** / `dpdm` / code-intel `find_circular_imports`; `grep -rnE "as any\)\.[a-zA-Z]" src` for reach-arounds; `grep -rnE "from '\.\./\.\./\.\./" src` for deep relative imports; ESLint `import/no-internal-modules`, `no-restricted-imports`, `import/no-cycle`.
- **Treatment.** *Move Method/Field*, *Hide Delegate*, *Change Bidirectional Association to Unidirectional* → `refactoring-mechanics.md`. Boundary placement → `cognition:domain-design`; module shape → `dev:typescript` (`references/design-patterns.md`).

### 21. Message Chains

- **Signs.** A train of calls/accesses: `a.b().c().d()` or `a.b.c.d.e` — the caller navigates deep through the object graph.
- **Why it hurts.** The client depends on the *entire path*; any structural change anywhere along it breaks the caller, and it leaks the shape of every intermediate object.
- **TypeScript form.** `user.getAddress().getCity().getZip()`, `config.server.tls.options.cert`, Redux `state.a.b.c.d`. Cures: a method on the head (`user.zip()`), a **selector**, the Law of Demeter. Note: optional chaining `a?.b?.c?.d` makes a chain *safe* but not *uncoupled* — `?.` papering over depth is the smell, not the fix.
- **Detection signal.** `grep -rnE '\)\.[a-zA-Z]+\(\)\.[a-zA-Z]+\(' src` for `.x().y()`; `grep -rnE '(\?\.[a-zA-Z]+){3,}' src` for `?.`-chains 3+ deep; `(\.[a-zA-Z]+){4,}` for long property paths.
- **Treatment.** *Hide Delegate*, or *Extract+Move Method* to the chain's head — but don't over-hide into a Middle Man → `refactoring-mechanics.md`.

### 22. Middle Man

- **Signs.** A class/module whose methods mostly just *delegate* and do nothing else — a pass-through shell.
- **Why it hurts.** The over-correction of Message Chains: indirection and maintenance with no value, and readers can't find where work actually happens.
- **TypeScript form.** A "service" whose every method is `return this.repo.x(args)`; a wrapper module re-exporting and forwarding; a React component that only spreads props (`<Child {...props} />`). Remove it unless it's an intentional Adapter/Facade adding a real seam — distinguish from an **anti-corruption layer**, which *transforms*, not forwards.
- **Detection signal.** `grep -rnE 'return this\.[a-zA-Z]+\.[a-zA-Z]+\(' src`; `knip` showing a thin re-export module; review ≥half the methods being one-line forwards.
- **Treatment.** *Remove Middle Man* (clients talk to the real object) → `refactoring-mechanics.md`. Is-the-layer-earning-its-keep → `paradigms-and-patterns.md`.

### 23. Incomplete Library Class

- **Signs.** A third-party library almost meets your need but lacks a method/behavior, and you can't edit it.
- **Why it hurts.** Working around it ad hoc spreads compensating code everywhere the library is used — N copies of the workaround.
- **TypeScript form.** TS adds options the OO catalog predates: **declaration merging / module augmentation** (`declare module "lib" { interface X { … } }`) for the *types*; an **Adapter/wrapper** for behavior; a standalone helper (`function withRetry(client: LibClient) {…}`) as a Foreign Method; ambient `.d.ts` augmentation for incomplete types. Keep the workaround in **one** local extension module.
- **Detection signal.** Repeated identical wrappers around the same library call (`jscpd`, or grep the symbol); many `as`/`@ts-ignore` near one import: `grep -rnE "from '(lib-name)'" src` cross-referenced with escape-hatch density; `(libObj as any).x` patterns.
- **Treatment.** *Introduce Foreign Method* (small gap) / *Introduce Local Extension* (large gap) → `refactoring-mechanics.md`. Adapter/port target → `dev:typescript` (`references/design-patterns.md`).

---

## TypeScript-native smells

No clean entry in the classic OO catalog, but the highest-signal smells in modern
TS/JS. Each is a hole the type system was meant to close that someone re-opened.

### 24. Escape-hatch density (`as` / `as any` / `as unknown as` / `!`)

- **Signs.** A cast or non-null assertion every few lines; `as unknown as T` forcing incompatible shapes; `!` sprinkled to silence `strictNullChecks`.
- **Why it hurts.** `as` is the programmer *asserting* a fact the compiler couldn't verify — each one re-admits exactly the states the type was collapsing and goes stale when the real type changes; `!` claims "never null" with zero proof.
- **TypeScript form.** `const u = (raw as any).user!.profile as Profile;` — three unproven claims in one line. Cure: **parse at the boundary** so the core needs no casts.
- **Detection signal.** `grep -rnE '\bas any\b|\bas unknown as\b|\bas [A-Z]' src | wc -l`; `grep -rnE '!\.|!\)|!,' src` for non-null assertions; `type-coverage` as the global metric; ESLint `@typescript-eslint/no-explicit-any`, `no-non-null-assertion`, `consistent-type-assertions`.
- **Treatment.** Parse-don't-validate at the boundary; introduce a brand or DU so the cast vanishes → `refactoring-mechanics.md`. Safety-budget axis + parse-at-boundary target → `dev:typescript` (`references/where-defaults-hide.md`, `references/design-patterns.md`).

### 25. Optional-property soup

- **Signs.** A type with many `?:` fields, several mutually exclusive ("`a` set ⇒ `b` too; `c` only with `d`"); valid combinations are a fraction of what the type permits.
- **Why it hurts.** `n` optionals admit up to `2ⁿ` shapes where the domain has a few; every consumer must defensively check, and invalid combos are reachable bugs. Temporary Field generalized to plain data.
- **TypeScript form.**

  ```ts
  interface Req { loading?: boolean; data?: T; error?: Error; retryCount?: number }   // 2^4 = 16 shapes, ~3 valid
  type Req<T> =
    | { state: "loading" }
    | { state: "success"; data: T }
    | { state: "error"; error: Error; retryCount: number };                           // exactly the valid states
  ```

- **Detection signal.** Count `?:` per type (`grep -rnE '\?\s*:' src`); >4–5 optionals is suspect; `exactOptionalPropertyTypes` sharpens; clusters of `!`/`?.` on the fields confirm.
- **Treatment.** Model states as a DU (flags/optionals → DU) → `refactoring-mechanics.md`; coordinate with `dev:typescript` (`references/refactoring-patterns.md`); target shape → `dev:typescript` (`references/design-patterns.md`).

### 26. `@ts-ignore` / `@ts-expect-error` debt

- **Signs.** Suppression comments accreting over red lines; bare `@ts-ignore` with no reason; stale `@ts-expect-error` left after its error was fixed.
- **Why it hurts.** Each suppression is an un-checked region — the type system's guarantees stop at that line; bare `@ts-ignore` also hides *new* errors that drift in later. Compounding business-pressure debt.
- **TypeScript form.** Prefer `@ts-expect-error` (it *fails* once the error is gone, so it self-cleans) over `@ts-ignore`, always with a reason — better, fix the type so neither is needed.
- **Detection signal.** `grep -rnE '@ts-(ignore|expect-error|nocheck)' src | wc -l` as a debt counter; ESLint `@typescript-eslint/ban-ts-comment` (require a description, ban `@ts-ignore`); track the count in CI.
- **Treatment.** Resolve the underlying error (often Primitive Obsession or an upstream escape hatch); convert survivors to documented `@ts-expect-error` → `refactoring-mechanics.md`. A **categorical sweep**, not a one-off.

### 27. `Record<string, any>` / index-signature escape hatch

- **Signs.** `Record<string, any>`, `{ [k: string]: any }`, or `object`/`any` as a "bag" type for config, props, or payloads.
- **Why it hurts.** It defeats the checker on access — every key returns `any`, so the bag is an `any` factory threaded through the program. Primitive Obsession at the object level.
- **TypeScript form.** Replace with a precise shape, a `Record<KnownKey, V>` over a key union, or a DU of payload variants. If genuinely dynamic, use `Record<string, unknown>` (forces narrowing) and parse at the boundary.
- **Detection signal.** `grep -rnE 'Record<string, ?any>|\{\s*\[\w+: string\]: ?any' src`; `type-coverage` flags the `any` leakage; ESLint `@typescript-eslint/no-explicit-any`.
- **Treatment.** Introduce the precise type / key-union; parse dynamic input at the boundary → `refactoring-mechanics.md`. Target shape → `dev:typescript` (`references/design-patterns.md`, `references/where-defaults-hide.md`).

### 28. Overload sprawl

- **Signs.** Many `function f(...)` overload signatures (or stacked interface call signatures) reconciled by internal `typeof`/`as` branching.
- **Why it hurts.** Each overload is a hand-maintained API corner the implementation must keep consistent by hand — TS does *not* soundly check the impl against the overloads, so they drift; high arity means the function is really several functions or wants a generic/DU input.
- **TypeScript form.** Replace N overloads with a single generic, a union parameter, or separate named functions (often clearest). Coordinate with the split-overloads move in `dev:typescript` (`references/refactoring-patterns.md`).
- **Detection signal.** `grep -rnE '^\s*export function (\w+)\b' src` then count repeats per name; ≥3 overloads on one symbol is the threshold; stacked call signatures in one `interface`.
- **Treatment.** *Parameterize Function* / replace with generic or union / split into named functions → `refactoring-mechanics.md`.

### 29. Barrel / module-boundary cycles

- **Signs.** `index.ts` barrels re-exporting whole subtrees; import cycles surfacing as init-time `undefined`/load-order bugs; a re-export maze where a symbol's real home is three hops away.
- **Why it hurts.** Barrels create accidental fan-in and **circular imports** (a module importing the barrel that imports it), which break tree-shaking, slow `tsc`, and cause init-order `undefined` bugs no type catches; mazes hide the canonical owner (ties to god module + Inappropriate Intimacy).
- **TypeScript form.** Import from the **canonical module**, not the barrel, on hot paths; keep barrels thin and acyclic, or drop them; enforce with import-boundary lint.
- **Detection signal.** **`madge --circular`** / `dpdm --circular` / code-intel `find_circular_imports`; `knip` flags barrel-only re-exports; ESLint `import/no-cycle`, `import/no-internal-modules`.
- **Treatment.** Break the cycle (move the shared symbol to a leaf module; import direct) → `refactoring-mechanics.md`. Module-organization target → `dev:typescript` (`references/module-organization.md`); ownership → `cognition:domain-design`.

---

## Detection toolkit cheat-sheet

Wire these into CI so smells fail the build rather than accreting as debt.

| Tool / command | What it finds | Smells |
| --- | --- | --- |
| ESLint `complexity`, `max-lines-per-function`, `max-statements`, `max-depth`, `max-nested-callbacks` | over-long, over-branched, deeply-nested functions | Long Method |
| ESLint `max-lines`, `max-classes-per-file` | oversized files/classes | Large Class |
| ESLint `max-params` (≤3–4) | sprawling signatures | Long Parameter List, Data Clumps |
| ESLint `@typescript-eslint/switch-exhaustiveness-check`, `default-case`, `no-fallthrough` | non-total switches | Switch Statements, Temporary Field (via DU) |
| ESLint `@typescript-eslint/no-magic-numbers` | bare literals as type codes | Primitive Obsession |
| ESLint `@typescript-eslint/no-explicit-any`, `no-non-null-assertion`, `consistent-type-assertions` | escape hatches | Escape-hatch density, `Record<string,any>` |
| ESLint `@typescript-eslint/ban-ts-comment` | undocumented/banned suppressions | `@ts-ignore` debt |
| ESLint `import/no-cycle`, `import/no-internal-modules`, `no-restricted-imports` | cycles, boundary breaches | Barrel cycles, Inappropriate Intimacy, Message Chains, Middle Man |
| ESLint `no-unreachable`, `@typescript-eslint/no-unused-vars`; tsc `noUnusedLocals`/`noUnusedParameters` | local dead code | Dead Code |
| `tsc --strict` (`strictNullChecks`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) | optional/null holes, index unsafety | Temporary Field, Optional-property soup, Primitive Obsession |
| **`knip`** / **`ts-prune`** | unused exports, files, deps, types | Dead Code, Lazy Class, Speculative Generality, barrel re-exports |
| **`jscpd`** | token-level copy-paste | Duplicate Code, Data Clumps, Alternative Classes |
| **`madge`** / **`dpdm`** (`--circular`, fan-in/out) | cycles, hot modules, mirrored clusters | Inappropriate Intimacy, Divergent Change, Shotgun Surgery, Parallel Inheritance, Barrel cycles |
| **`type-coverage`** | `any` leakage / wide primitives | Primitive Obsession, Escape-hatch density, `Record<string,any>` |
| `grep -rnE '\bas any\b\|@ts-(ignore\|expect-error)\|!\.\|: any\b' src \| wc -l` | global type-debt proxy | Escape-hatch density, `@ts-ignore` debt |
| `grep -rnE '\?\s*:' <type-file>` | optional-prop count per type | Optional-property soup, Temporary Field |
| `grep -rnE '(\?\.[a-zA-Z]+){3,}\|\)\.[a-z]+\(\)\.[a-z]+\('` src | deep chains | Message Chains |
| `grep -rnE '^\s*export function (\w+)' src` + count repeats | overload count per symbol (≥3) | Overload sprawl |
| `git log --format= --name-only \| sort \| uniq -c \| sort -rn` | hot files (many reasons to change) | Divergent Change |
| code-intel `find_dead_code`, `find_unused_exports`, `find_circular_imports`, `find_semantic_clones`, `get_data_flow`, `get_complexity`, `get_hotspots` | graph-level dead code, cycles, clones, envy, hotspots | Dead Code, Inappropriate Intimacy, Duplicate/Alternative Classes, Feature Envy, Long Method, Large Class |

A detected smell is a **class, not an instance** — when a grep or lint surfaces one,
sweep the codebase for siblings and fix them together. Treatment mechanics live in
`refactoring-mechanics.md`; paradigm/pattern choices in `paradigms-and-patterns.md`;
target shapes in `dev:typescript` (`references/design-patterns.md`).

---

*Synthesis of the [Refactoring.Guru](https://refactoring.guru/refactoring/smells)
code-smell catalog, re-grounded for TypeScript. Original prose; RG cited as the
taxonomy source. Named refactorings in italics are RG's.*

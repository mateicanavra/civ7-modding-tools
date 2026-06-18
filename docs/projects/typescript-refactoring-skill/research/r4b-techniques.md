# r4b — Refactoring Techniques Catalog, TypeScript-Flavored

> **Primary reference:** [Refactoring.Guru / Techniques](https://refactoring.guru/refactoring/techniques) (the Fowler catalog, re-illustrated). All 66 techniques below are grouped into Refactoring Guru's 6 families. Each entry is an **original synthesis** — problem→solution, compressed mechanics, and a modern-TS note. Where a language feature supersedes a technique, or where the technique is OO bookkeeping with little payoff in idiomatic TS, that is flagged.
>
> **How to read the TS notes.** "Idiomatic TS" here means: small modules over big class hierarchies, plain functions + data, discriminated unions over runtime type tags, `readonly`/immutability by default, structural typing, and the compiler doing the work a refactoring step used to do by hand. The catalog predates all of this; ~40% of it is timeless, ~25% is "your IDE does this now," and ~35% is OO inheritance/association choreography that idiomatic TS mostly sidesteps.
>
> **Legend:** ⭐ core for cleaning real/LLM-generated TS · 🔧 IDE-automated (TS Language Service does it safely) · ⚠️ dated / low-value in idiomatic TS · 🔁 superseded by a language feature

---

## 1. Composing Methods

The family for taming long functions and tangled locals. The most universally useful family in TS — most of it is "make the body readable."

### Extract Method ⭐
- **What:** A code fragment that hangs together → pull it into a named function/method; replace with a call.
- **Mechanics:** Name it for *intent*, not mechanism. Free variables read inside become params; a single mutated local becomes the return value; multiple mutated locals are a signal to split or use Replace Method with Method Object.
- **TS note:** The workhorse. Prefer free `function`s/arrow functions over methods unless the data is genuinely object-bound. Multi-return-value extractions are clean in TS via tuples or a small object literal. IDE "Extract to function" is reliable, but *you* must pick the name.

### Inline Method ⭐
- **What:** A method whose body is as clear as its name and adds no value → replace calls with the body, delete the method.
- **Mechanics:** Confirm it isn't overridden anywhere; substitute body at every call site; delete.
- **TS note:** Used to collapse over-eager indirection (a constant problem in LLM-generated code, which loves one-line wrapper functions). With no subclass-override concern for plain functions, inlining is low-risk. The inverse of Extract Method — reach for it when abstraction earns nothing.

### Extract Variable ⭐
- **What:** A hard-to-read expression → name its parts in `const`s that explain intent.
- **Mechanics:** Hoist a subexpression into a `const`; replace the original occurrence; repeat.
- **TS note:** Use `const` (never `let`) so the extraction is provably side-effect-free. *Caveat from the source:* extracting parts of a short-circuited `a() || b()` forces both to evaluate — watch for changed eval semantics and perf when the operands are effectful. Naming an `if`/ternary condition (`const isEligible = …`) is the highest-leverage version.

### Inline Temp 🔧
- **What:** A temp assigned a simple expression and used once → replace the temp with the expression.
- **Mechanics:** Substitute the expression at each use; delete the declaration.
- **TS note:** Almost never done for its own sake; it's a setup step for Replace Temp with Query or Extract Method. Don't inline a temp that caches an expensive call. Minor cleanup; IDE-assisted.

### Replace Temp with Query ⭐
- **What:** A local holding a computed value → move the computation into a (pure) function and call it where the temp was used.
- **Mechanics:** Ensure the temp is assigned exactly once (Split Temporary Variable first if not); Extract Method on the expression (it must be side-effect-free — Separate Query from Modifier if not); replace temp with the call.
- **TS note:** Enables reuse and shrinks long functions. In TS, prefer a pure helper or a `get` accessor / computed getter. The classic perf objection is mostly moot; keep the temp only for genuinely expensive memoizable work (and then reach for an explicit memo).

### Split Temporary Variable ⭐
- **What:** One mutable local reused for several unrelated values → one variable per concept, each named.
- **Mechanics:** At each reassignment that begins a new "meaning," introduce a new well-named variable and update its uses.
- **TS note:** Highly relevant — LLM code frequently reuses a `let result`/`temp`/`data` for three different things. The TS upgrade: make each new variable a `const`. If you *can't* make them `const`, that's a smell pointing at Extract Method. (Loop counters are exempt.)

### Remove Assignments to Parameters ⭐
- **What:** Reassigning a parameter inside the body → copy it into a local and mutate that instead.
- **Mechanics:** `const local = param;` then use `local` everywhere downstream.
- **TS note:** Still worth doing for clarity, *and* TS gives you a sharper tool: mark params `readonly` (for arrays/objects) or simply treat all params as immutable by convention. Reassigning a param obscures the input contract and breaks the mental model that "params = the inputs." Object/array params are reference-shared, so mutating them is a real foot-gun, not just a style nit.

### Replace Method with Method Object 🔁⚠️
- **What:** A function so long that its tangled locals defeat Extract Method → promote it to a class whose fields are those locals.
- **Mechanics:** New class; private field per local + a backref to the original object; constructor takes the locals; copy the body; split it into private methods.
- **TS note:** Mostly superseded. The modern move is **closures**: a factory function captures the "fields" as closed-over `let`/`const`, and inner functions replace the would-be private methods — no class, no `this`. Reach for the class form only if you already live in a class-heavy codebase. Often a sign you should rethink the data model entirely.

### Substitute Algorithm ⭐ (process, not a mechanical refactor)
- **What:** An algorithm that's cluttered or obsolete → replace the whole body with a cleaner/standard one.
- **Mechanics:** Simplify and extract first so the surface is small; write the new algorithm; diff outputs against the old on real inputs; delete the old once tests pass.
- **TS note:** The "replace with a library / standard method" case is huge in TS — hand-rolled grouping/dedup/sort → `Array` methods, `Map`/`Set`, `Object.groupBy`, or a vetted util. Lean on the type checker + tests as your equivalence oracle.

---

## 2. Moving Features Between Objects

Where responsibilities live. In idiomatic TS this is often "which **module/file** owns this function," not "which class."

### Move Method ⭐ (reframed: move function)
- **What:** A method that uses another class's data more than its own → move it there.
- **Mechanics:** Check it isn't part of an override chain; declare it on the recipient; ensure you have a reference to the recipient; turn the old method into a delegating call or delete it.
- **TS note:** The "Feature Envy" fix. In module-first TS this usually means **moving a function to the module that owns the data it operates on**, or co-locating it with the type it returns. With plain functions there's no override-chain ceremony — just move and update imports (IDE does the import rewrite).

### Move Field 🔧
- **What:** A field used more by another class than its owner → move it (and redirect accessors).
- **Mechanics:** Encapsulate first if public; add the field + accessors on the recipient; redirect references; delete the original.
- **TS note:** For class-based code, IDE-assisted. For idiomatic TS, this is "move a property to the interface/type where it belongs" — a type edit plus follow-the-compiler-errors. Frequently a substep of Extract Class.

### Extract Class ⭐
- **What:** One class (or module) doing two jobs → split the second job into its own unit.
- **Mechanics:** Create the new unit; prefer a one-way relationship; Move Field/Move Method the relevant members over a few at a time, testing between.
- **TS note:** Strongly relevant, but generalize "class" → **module**. The TS version: split a god-module/god-type along a seam (the Single Responsibility cut), often producing a small focused module + a type. The most common real-world structural refactor. Watch for a hidden domain concept wanting to become its own type.

### Inline Class 🔧
- **What:** A class/module that barely does anything → fold it into its sole consumer.
- **Mechanics:** Recreate its members on the consumer; redirect references; Move Method/Field everything over; delete.
- **TS note:** Inverse of Extract Class — kill "Lazy Class"/needless-wrapper modules (LLM code generates these constantly). In TS this is often "delete this 6-line file and inline the function." Low-risk with good imports.

### Hide Delegate 🔧
- **What:** Client reaches `a.getB().doThing()` → add `a.doThing()` so the client doesn't know about B.
- **Mechanics:** Add a delegating method on the server for each delegate call the client makes; repoint the client; drop the now-unused accessor.
- **TS note:** This is the Law-of-Demeter fix. Useful but easy to overdo (→ Middle Man). In TS, often better solved by **passing the right thing in the first place** or exposing a focused interface, rather than accreting delegating methods. Optional chaining (`a.b?.doThing()`) addresses the *null* pain but not the *coupling* pain.

### Remove Middle Man 🔧
- **What:** A class that's mostly pass-through delegating methods → let clients talk to the delegate directly.
- **Mechanics:** Expose a getter for the delegate; replace delegating calls with direct calls.
- **TS note:** Inverse of Hide Delegate; the two are a dial, not a rule. Relevant for trimming anemic "service" wrappers. Judgment call — too far in either direction is a smell.

### Introduce Foreign Method 🔁
- **What:** You need a method on a type you can't modify (3rd-party) → put it in your code, taking that type as the first arg.
- **Mechanics:** Write a helper in your class taking the foreign object as a parameter; extract the repeated logic into it; tag it so future readers know it "wants" to live on the foreign type.
- **TS note:** Just **write a standalone utility function** `fn(x: Foreign, …)`. No ceremony, no "foreign method" tag culture needed. The structural-typing era makes this a non-event. (Avoid prototype/declaration-merging monkey-patching for this — a plain function is clearer and tree-shakeable.)

### Introduce Local Extension 🔁⚠️
- **What:** You need *several* methods on an unmodifiable type → make a subclass or wrapper that adds them.
- **Mechanics:** Subclass the utility type (if not `final`/sealed) **or** wrap it, re-delegating its public surface, plus your new methods + a converting constructor.
- **TS note:** Largely obsolete. Use a **module of free functions** keyed on the foreign type, or a thin adapter object — not a subclass and not a full delegating wrapper. The wrapper variant ("re-expose the whole public interface") is exactly the kind of boilerplate TS lets you skip. Dated.

---

## 3. Organizing Data

Turning primitives and loose data into typed, encapsulated shapes. In TS, **the type system supersedes a large slice of this family** — many "type code" and "value/reference" techniques collapse into "define a union/branded type."

### Self-Encapsulate Field ⚠️
- **What:** Direct private-field access inside a class → route even internal access through getters/setters.
- **Mechanics:** Add accessor(s); replace internal direct uses with them.
- **TS note:** Low value. The original motivation (override accessors in subclasses, lazy-init) is rare in idiomatic TS. Use TS `get`/`set` accessors only when you actually need lazy init, validation, or a computed view — otherwise a plain public `readonly` field is cleaner. Don't pre-encapsulate "just in case."

### Replace Data Value with Object ⭐ (as: give the primitive a type)
- **What:** A primitive field that has grown its own behavior/associated data → promote it to its own type.
- **Mechanics:** New class holds the value + behavior; original field becomes that type.
- **TS note:** The *spirit* is gold — it's the antidote to "Primitive Obsession." The TS form is usually lighter than a class: a **branded type** (`type UserId = string & { readonly __brand: unique symbol }`), a small `interface`/object, or a value object with methods. Don't reach for a full class unless there's real behavior.

### Change Value to Reference ⚠️
- **What:** Many equal value-objects that should be one shared identity → route creation through a factory/registry returning a canonical instance.
- **Mechanics:** Replace Constructor with Factory Method; introduce a store/registry; factory returns the shared instance.
- **TS note:** Niche. This is really an **identity/caching/interning** concern (e.g., entity identity maps in an ORM, flyweight interning). Don't apply broadly. When you need it, model it explicitly as a `Map`-backed registry, not as an OO ritual.

### Change Reference to Value ⭐ (as: make it immutable)
- **What:** A shared mutable reference object that's small and rarely changes → make it an immutable value with equality-by-content.
- **Mechanics:** Remove setters (immutable); add a content-equality method; consider making the constructor public.
- **TS note:** Very aligned with idiomatic TS: prefer **immutable value objects** (`readonly` fields, no setters; copy-on-change). TS lacks value equality, so provide an explicit `equals`/comparator or compare on a normalized key. The "make it immutable" half is mainstream best practice; the equality half needs manual work.

### Replace Array with Object ⭐🔁 (as: replace tuple/array with a typed shape)
- **What:** An array whose positions mean different things (`[name, …, address]`) → an object/record with named fields.
- **Mechanics:** New type with a field per element; create access methods; migrate uses; drop the array.
- **TS note:** Strongly relevant and **type-driven** in TS: replace `any[]`/positional arrays with an `interface`, or at minimum a **named tuple type** (`[name: string, age: number]`) when positional access is intentional. Heterogeneous arrays are a TS smell the compiler can't fully guard — naming the shape gives you real checking.

### Duplicate Observed Data ⚠️🔁
- **What:** Domain data trapped in GUI classes → split domain from view and sync via Observer.
- **Mechanics:** Encapsulate the data; create a domain class; wire an Observer so view and domain stay in sync.
- **TS note:** Dated as written (classic GOF Observer + "doesn't apply to web apps"). The *principle* — separate domain state from presentation — is alive and well, but the modern implementation is **reactive state** (signals, stores, hooks, observables), not a hand-rolled observer with recursion guards. Treat the technique as historical; apply the principle via your framework's state layer.

### Change Unidirectional Association to Bidirectional ⚠️
- **What:** Two classes that each now need to reach the other, but the link is one-way → add the back-pointer.
- **Mechanics:** Add the reverse field; pick a "dominant" side that owns updates; add controlled helper(s) to keep both sides consistent.
- **TS note:** Low-value OO bookkeeping. Bidirectional object graphs create coupling, cycles, and serialization headaches in TS. Prefer: keep it unidirectional and **derive/look up** the reverse direction (e.g., via a `Map` or a query) instead of storing it. Avoid unless a framework (ORM relations) demands it.

### Change Bidirectional Association to Unidirectional ⭐ (as: cut a coupling)
- **What:** A two-way link where one side no longer uses the other → delete the unused direction.
- **Mechanics:** Confirm the link is unused (or reconstructable); replace the field with a param/lookup; delete assignments and the field.
- **TS note:** The useful direction of the association pair — **removing** edges from the object graph reduces coupling, breaks cycles, and helps tree-shaking and serialization. The GC/memory-leak rationale is mostly historical; the decoupling rationale is current.

### Replace Magic Number with Symbolic Constant ⭐
- **What:** An unexplained literal → a named constant carrying its meaning.
- **Mechanics:** Declare the constant; find every occurrence; replace only those that truly mean *this* concept.
- **TS note:** Always-do. In TS: `const TAX_RATE = 0.2` for scalars; for sets of related literals prefer a **`const` object + union** (`const Role = {Admin:'admin',…} as const; type Role = typeof Role[keyof typeof Role]`) over a numeric `enum`. Note the catalog's own pointer: magic numbers used as *type codes* → see the Replace Type Code family. Not every literal is magic (`i < count`, `* 2`).

### Encapsulate Field 🔧⚠️
- **What:** A public field → make it private + accessors.
- **Mechanics:** Add getter/setter; redirect external uses; make the field private.
- **TS note:** Low ceremony in TS and usually unnecessary: use `private`/`#private` + a `readonly` public field, or expose `get` only for a computed/validated view. Don't auto-wrap every field in get/set — that's a Java reflex. Encapsulate only when access needs logic.

### Encapsulate Collection ⭐
- **What:** A class exposes its collection via plain get/set, letting clients mutate it freely → return a read-only view; provide add/remove methods.
- **Mechanics:** Add `add`/`remove`; initialize to empty; getter returns a non-mutating view/copy; rename any "set whole collection" to `replace`.
- **TS note:** Very relevant and a frequent real bug source. TS form: type the getter as `ReadonlyArray<T>`/`readonly T[]` (or return a copy), keep mutation behind intent-named methods, and store the field `readonly`. The compiler then *enforces* the no-external-mutation contract that the original technique could only document.

### Replace Type Code with Class ⭐🔁 (→ branded type / union)
- **What:** A field holding coded values (`'A'|'E'|'U'`) that don't drive behavior → give it a real type.
- **Mechanics (classic):** New type class; private value + getter; static instance per code; swap the field's type.
- **TS note:** **Superseded by the type system.** Use a **string-literal union** (`type Role = 'admin'|'editor'|'user'`) or a `const`-object-derived union. This gives you exactly the IDE type-hinting the technique was straining toward — for free, with zero runtime objects. Reach for an actual class only if the type needs behavior/methods.

### Replace Type Code with Subclasses 🔁
- **What:** A type code that *does* drive behavior (branches in conditionals) → one subclass per code, behavior pushed down, conditionals → polymorphism.
- **Mechanics:** Self-encapsulate the code; private constructor + static factory that maps code→subclass; push fields/methods down; finish with Replace Conditional with Polymorphism.
- **TS note:** Usually **superseded by a discriminated union + exhaustive `switch`** (with a `never` default to force exhaustiveness), or a **strategy map** (`Record<Code, Handler>`). Both give Open/Closed-ish extensibility without an inheritance tree, and the compiler checks you handled every case. Subclasses are the heavier, rarely-warranted option in idiomatic TS.

### Replace Type Code with State/Strategy 🔁
- **What:** Behavior-driving type code that *changes at runtime* or can't use subclasses → delegate to a swappable state/strategy object.
- **Mechanics:** Self-encapsulate; state class hierarchy with a factory; original holds a reference and delegates; finish with polymorphism.
- **TS note:** The legitimate survivor of the type-code trio, but lighten it: a **strategy map of functions/objects keyed by the union tag** beats a State class hierarchy in most TS code. Use it when the variant changes over an object's lifetime or carries variant-specific data. Still: start with a discriminated union; escalate to strategy only if behavior is large or pluggable.

### Replace Subclass with Fields ⭐ (as: collapse trivial subclasses into data)
- **What:** Subclasses that differ only in constant return values → delete them; store the constants as fields on the parent (set via factory).
- **Mechanics:** Factory method per subclass; parent fields for the constants; protected constructor; constant methods return the fields; delete subclasses.
- **TS note:** Excellent guidance, even more so in TS: collapse a needless class hierarchy into **plain data** — a record/lookup table or a config object — and a single function. Subclassing to vary a constant is pure overkill; this technique is the cure. Often the endgame after realizing a "hierarchy" is really a data table.

---

## 4. Simplifying Conditional Expressions

Flattening and clarifying branching logic. After Composing Methods, the **second-most valuable family for real/LLM TS** — generated code is conditional-heavy.

### Decompose Conditional ⭐
- **What:** A complex `if/else`/`switch` → extract the condition and each branch into named functions.
- **Mechanics:** Extract the test (`isX()`), the then-body, and the else-body via Extract Method.
- **TS note:** High leverage. Naming the predicate (`const isPastDue = …` or `function isPastDue(x): boolean`) is the single best readability win on dense conditionals. Pairs with type guards: an extracted predicate typed `x is Foo` also *narrows* — readability and type-safety in one move.

### Consolidate Conditional Expression ⭐
- **What:** Several separate checks that all lead to the same result → combine into one expression, then name it.
- **Mechanics:** Join nested conditions with `&&`, consecutive ones with `||`; Extract Method on the combined predicate. **First confirm no branch has side effects.**
- **TS note:** Solid. The side-effect caveat matters more in TS because `&&`/`||` short-circuit — consolidating effectful branches changes behavior. Keep predicates pure; name the result.

### Consolidate Duplicate Conditional Fragments ⭐
- **What:** Identical code in every branch of a conditional → hoist it out.
- **Mechanics:** Common prefix → before the `if`; common suffix → after it; scattered dupes → move to an edge first, then Extract Method if multi-line.
- **TS note:** Straightforward dedup, common in generated code that repeats a `return`/`log`/`cleanup` in each arm. Always-do.

### Remove Control Flag ⭐
- **What:** A boolean flag steering loop/exit flow → use `break` / `continue` / `return` / early exit instead.
- **Mechanics:** Find the flag-assignment that means "stop"; replace with the matching control-flow keyword; delete the flag and its checks.
- **TS note:** Very relevant — `let done = false; while(!done)…` is a classic LLM pattern. TS/JS additions: `Array.prototype.some`/`every`/`find` often eliminate the loop *and* the flag entirely. Prefer early `return` from an extracted function over deep flag-driven loops.

### Replace Nested Conditional with Guard Clauses ⭐
- **What:** Arrow-shaped nested `if`s where the happy path is buried → handle special cases up front with early returns.
- **Mechanics:** Pull each edge case to the top as a guard that returns/throws; flatten; then Consolidate guards with the same outcome.
- **TS note:** Top-tier technique for TS. Early-return guards + **narrowing** make the rest of the function operate on already-validated, well-typed values (great with `if (!x) return;` to strip `undefined`). Reduces nesting *and* tightens types simultaneously. One of the highest-ROI cleanups on generated code.

### Replace Conditional with Polymorphism 🔁
- **What:** A conditional that switches on an object's type/field, repeated across methods → push each branch into a subclass method; call polymorphically.
- **Mechanics:** Ensure/Build a class hierarchy (often via the type-code techniques); override the method per subclass with that branch's body; delete the conditional, make the base abstract.
- **TS note:** Partially superseded. For *open* sets of variants with rich behavior, polymorphism (or a **strategy map**) wins. But for *closed* variant sets, idiomatic TS prefers a **discriminated union + one exhaustive `switch`** checked by the compiler (`never` in the default). Don't manufacture a class hierarchy just to kill a `switch` — a tagged union + exhaustiveness is often cleaner, more local, and equally safe. Use polymorphism/strategy when the same switch is duplicated across many functions.

### Introduce Null Object 🔁
- **What:** Pervasive `if (x == null)` checks → return a special object with default/no-op behavior instead of `null`.
- **Mechanics:** Subclass with `isNull()` + default behaviors; return it where you'd return null; replace null-checks with polymorphic calls.
- **TS note:** Largely **superseded by the type system + language ergonomics.** With `strictNullChecks`, the compiler *forces* you to handle absence — model it explicitly as `T | undefined` and use optional chaining (`?.`), nullish coalescing (`??`), or an `Option`/`Result` type. The Null Object *pattern* still has niche uses (a no-op logger, an empty collection, a default strategy), but the broad "stop checking for null" goal is better served by explicit-absence types. Don't build `isNull()` subclasses.

### Introduce Assertion ⭐ (reframed: encode invariants in types, assert what types can't)
- **What:** Code that silently assumes a condition holds → make the assumption explicit and checked.
- **Mechanics:** Add an assertion where the assumption lives; it must not change behavior when the assumption holds; don't assert things that can legitimately be false.
- **TS note:** Reframe for TS: **first try to make the invariant unrepresentable-if-false via types** (non-optional fields, narrowed unions, branded types) so no runtime check is needed. For invariants the type system can't express (external input, parsing, "this was validated upstream"), use **assertion functions** (`function assert(x): asserts x`) or schema validation (zod et al.) at the boundary — these both check *and* narrow. The catalog's "use an exception when the user/system can cause it; assertion only for impossible-bug states" distinction maps cleanly onto "validate at boundaries, assert in the core."

---

## 5. Simplifying Method Calls

Cleaner signatures and call sites. A mix of timeless naming/parameter hygiene and a few OO-era items.

### Rename Method ⭐🔧
- **What:** A name that doesn't describe what it does → rename it.
- **Mechanics:** Repeat across the override chain; (for public APIs) add a new method delegating to the old, deprecate the old, migrate, then remove.
- **TS note:** Always-do; IDE rename is safe across a project. The deprecation dance is only for **published** APIs (use `@deprecated` JSDoc — IDEs strike it through). Renaming for intent is the cheapest readability upgrade.

### Add Parameter 🔧⚠️
- **What:** A method lacks data it now needs → add a parameter.
- **Mechanics:** (Classically) clone-and-delegate to keep things working, migrate callers, retire the old.
- **TS note:** Trivial with IDE + compiler (errors flag every caller). But treat the catalog's own warning as the headline: adding params breeds **Long Parameter List**. Prefer an **options object** from the start, and consider whether the data belongs on an existing object instead. The mechanical refactor is a non-event; the *design* caution is the point.

### Remove Parameter ⭐🔧
- **What:** An unused parameter → delete it.
- **Mechanics:** Confirm unused across overrides; clone-and-delegate or just delete; fix callers.
- **TS note:** The compiler finds unused params (`noUnusedParameters`) and IDE refactors callers. Good hygiene — every param is a question in the reader's head. Speculative "might need it later" params are exactly what to cut.

### Separate Query from Modifier ⭐
- **What:** A method that both returns a value *and* mutates state → split into a pure query and a separate command (CQS).
- **Mechanics:** New pure query returning the value; original keeps only the mutation; at call sites, call the modifier then the query.
- **TS note:** Strong fit with functional-leaning TS. Pure queries are referentially transparent, cacheable, and trivially testable; commands isolate effects. Enables Replace Temp with Query and safe predicate extraction. The "but I want the deleted-row count" exception is real — return-from-command is fine when the result *is* the effect's report.

### Parameterize Method ⭐
- **What:** Several near-identical methods differing only by a literal/value → one method taking that value as a param.
- **Mechanics:** Extract the common body into a parameterized method; replace the varying literal with the param; redirect and delete the originals.
- **TS note:** Good dedup, common in generated code (`getAdminUsers`/`getEditorUsers` → `getUsersByRole(role)`). Caution (from the source): don't parameterize into a boolean "mode flag" that grows a big internal conditional — that's the inverse smell (see next). Union-typed params keep it honest.

### Replace Parameter with Explicit Methods ⭐ (the inverse of the above)
- **What:** A method whose behavior is fully selected by a parameter's value (esp. a boolean flag) → split into one clearly-named method per value.
- **Mechanics:** A method per variant; route callers to the right one; delete the original.
- **TS note:** Directly attacks the **boolean-flag-parameter** smell (`setValue('enabled', true)` → `enable()`). Very relevant. *But* if variants share most logic and differ in data, a discriminated-union param may beat N methods — judge by how much branches diverge. Don't over-split rarely-changing variants.

### Preserve Whole Object ⭐
- **What:** You pull several values off an object just to pass them as separate args → pass the object.
- **Mechanics:** Add an object param; replace the individual params with reads from it inside; delete the pre-call unpacking.
- **TS note:** Reduces param lists and future churn. TS caveat: passing the whole object *widens* the dependency — for testability/purity you sometimes *want* to depend only on the two fields you use (and TS structural typing lets you accept a minimal `{x; y}` shape). So it's a real tradeoff: cohesion vs. minimal coupling. Pick the narrowest type that's still stable.

### Replace Parameter with Method Call ⚠️
- **What:** Caller computes a value via a query then passes it in, but the callee could call that query itself → drop the param, query inside.
- **Mechanics:** Confirm the value doesn't depend on the caller's locals; move/extract the query into the callee; remove the param.
- **TS note:** Modest. It trades a smaller signature for **hidden coupling** to the query — the opposite of dependency-injection/testability goals. Idiomatic TS often prefers the *explicit* parameter (easier to test, more pure). Use sparingly, mainly to shrink genuinely redundant params. Mild tension with DI-friendly design.

### Introduce Parameter Object ⭐
- **What:** The same clump of params recurs across methods → bundle them into one type.
- **Mechanics:** Create an (immutable) type for the group; add it as a param; replace the individual params with its fields; relocate related behavior onto it if warranted.
- **TS note:** Very TS-friendly. Use an `interface`/`type` (often `readonly`) — this is also the canonical fix for **Long Parameter List** and a near-cousin of the **options-object** convention. Bonus: named fields kill positional-argument bugs and improve call-site readability. If it ends up pure data with no behavior, that's acceptable in TS (it's a DTO), unlike the OO "Data Class" worry.

### Remove Setting Method ⭐ (as: make it `readonly`)
- **What:** A field that should only be set at construction → delete its setter.
- **Mechanics:** Ensure the constructor sets it; redirect any "set right after construct" callers into the constructor; replace internal setter use with direct field access; delete the setter.
- **TS note:** In TS this is mostly a **declaration change**: mark the field `readonly` (or use a `readonly` property in the type / parameter property `constructor(readonly id: string)`). The compiler then forbids reassignment everywhere — stronger than deleting a setter. Immutability-by-default is idiomatic; this technique is "do that."

### Hide Method 🔧
- **What:** A method not used outside its class/hierarchy → make it `private`/`protected`.
- **Mechanics:** Find candidates (unused-export analysis helps); reduce visibility as far as it'll go.
- **TS note:** Relevant at two scales: class members (`private`/`#`) and — more importantly in module-first TS — **module exports**. Stop `export`ing internals; `noUnusedExports`/dead-export tooling finds them. Shrinking the public surface is a top maintainability lever. (`#private` gives true runtime privacy vs. `private`'s compile-only.)

### Replace Constructor with Factory Method ⭐
- **What:** A constructor doing more than field-setting, or needing to return subtype/cached/variant instances → use a factory function instead.
- **Mechanics:** Factory wraps the constructor; redirect callers; make the constructor private; pull non-construction logic into the factory.
- **TS note:** Idiomatic TS leans on **factory functions** heavily (constructors can't be async, can't fail gracefully without throwing, can't return a union/cached instance). Pair with `Result`/`Option` for fallible creation, or a `create*` returning a discriminated union. A named factory also reads better than `new Thing(…)`. Strong fit.

### Replace Error Code with Exception ⚠️ (TS: often the *reverse* is preferred)
- **What:** A method returning a sentinel error value → throw an exception.
- **Mechanics:** Wrap callers in try/catch; throw inside instead of returning the code; document the throw.
- **TS note:** **Flag as contested in idiomatic TS.** Modern type-safe TS frequently goes the *other way*: return an explicit **`Result<T, E>` / tagged union** so failures are in the type signature and the compiler forces handling — exceptions are invisible to the type system (no checked exceptions). Use exceptions for truly exceptional/unrecoverable cases and at boundaries; prefer `Result` for expected, recoverable failures. So: apply this technique to escape *stringly-typed sentinels*, but consider a typed `Result` rather than `throw` as the destination.

### Replace Exception with Test ⭐
- **What:** Using try/catch where a cheap precondition check would do → test the condition first.
- **Mechanics:** Add a guard for the edge case before the try; move the catch body into that guard; verify nothing else throws; drop the try/catch.
- **TS note:** Solid and common — generated code overuses try/catch for control flow (catching to provide a default, etc.). Prefer `??`/optional chaining/`in`/`Array.includes`/explicit checks over catch-as-flow. Exceptions are for the exceptional; this technique enforces that.

---

## 6. Dealing with Generalization

Inheritance hierarchy maintenance. **The lowest-value family for idiomatic TS** — it's almost entirely class-inheritance bookkeeping. Most of it is "skip; prefer composition / unions / modules." Listed for completeness with honest TS verdicts.

### Pull Up Field ⚠️🔧
- **What:** Same field in sibling subclasses → move it to the superclass.
- **TS note:** Only meaningful inside an existing class hierarchy. Idiomatic TS prefers composition / shared interfaces over deepening inheritance. IDE-assisted when you do have the hierarchy. Skip unless you're already committed to inheritance.

### Pull Up Method ⚠️
- **What:** Identical/near-identical methods in sibling subclasses → unify and move to the superclass.
- **Mechanics:** Align signatures/bodies; copy up (abstract-out subclass-only deps); delete from subclasses.
- **TS note:** The dedup goal is valid; the inheritance vehicle usually isn't. In TS, extract the shared logic into a **free function / shared module / mixin** the variants call, rather than a base class. Useful only in class-committed code.

### Pull Up Constructor Body ⚠️
- **What:** Subclass constructors share opening code → move it to a superclass constructor called via `super`.
- **TS note:** Niche, inheritance-only. With composition you sidestep constructor-chaining entirely (factories + shared init functions). Skip in idiomatic TS.

### Push Down Field ⚠️🔧
- **What:** A superclass field used by only some subclasses → move it down to them.
- **TS note:** Inheritance-only cleanup. The same need in union-modeled TS is just "this field belongs only on these variants" — expressed directly in the discriminated union. Skip unless class-bound.

### Push Down Method ⚠️
- **What:** A superclass method used by only one/few subclasses → move it down.
- **TS note:** As above — inheritance bookkeeping. In TS, variant-specific behavior lives in the variant's branch/handler. Substep of the (also-dated) type-code-to-subclasses techniques. Skip.

### Extract Subclass ⚠️🔁
- **What:** A class with features used only in some cases → push those into a new subclass.
- **TS note:** The catalog *itself* warns this dead-ends on multiple axes (the "Large + Smooth dog" problem) and steers you to **composition / Strategy**. Take that advice: model the axes as composed fields or a discriminated union, not a subclass. Dated; prefer composition.

### Extract Superclass ⚠️🔁
- **What:** Two classes sharing fields/methods → hoist commonality into a new shared superclass.
- **TS note:** For *shared contract*, use **Extract Interface** (below) — structural typing makes it frictionless. For *shared code*, use a shared module/function or mixin. A concrete superclass is rarely the best tool in TS (single-inheritance ceiling, tight coupling). Prefer interface + composition.

### Extract Interface ⭐
- **What:** Multiple clients use the same slice of a class's surface (or two classes share a sub-interface) → name that slice as an interface.
- **TS note:** **The one genuinely valuable member of this family.** TS structural typing means you can extract an `interface`/`type` for a role and have existing types satisfy it with no `implements` edits — perfect for ports/adapters, dependency seams, and test doubles. Defines capability contracts ("what this needs") independent of concrete classes. Use freely. (Remember its limit: interfaces share *shape*, not *implementation* — for code dedup use Extract Class/module.)

### Collapse Hierarchy ⭐ (as: delete a needless layer)
- **What:** A subclass and superclass that have become nearly identical → merge them into one class.
- **Mechanics:** Pull-up/push-down to consolidate members; repoint references; delete the empty class; watch LSP for remaining siblings.
- **TS note:** Worth doing — flattening accidental/speculative inheritance layers reduces complexity, and LLM/over-engineered code generates these. The broader idiomatic move is "collapse the hierarchy into composition or a union" when the inheritance never earned its keep.

### Form Template Method ⚠️🔁
- **What:** Sibling subclasses run the same algorithm skeleton with differing steps → lift the skeleton to the superclass, leave abstract step hooks for subclasses.
- **TS note:** The Template Method *pattern*. In idiomatic TS, prefer **higher-order functions / dependency injection**: write the skeleton once as a function that takes the varying steps as callbacks (or a strategy object). Same Open/Closed benefit, no inheritance, easier to test. Use the inheritance form only in class-committed code; otherwise HOF.

### Replace Inheritance with Delegation ⭐
- **What:** A subclass uses only part of its superclass, or inheritance violates LSP (was used just to share code) → hold the former superclass in a field and delegate.
- **Mechanics:** Add a field for the (ex-)superclass instance; route methods through it; add delegating methods for the surface clients use; drop `extends`.
- **TS note:** Embodies **"composition over inheritance"** — the most important principle in this whole family. Highly endorsed for TS. The "many tedious delegating methods" drawback is real but often the right trade; and TS lets you expose a focused **interface** instead of re-proxying the entire surface. The endpoint is frequently a Strategy-style pluggable field. Apply whenever inheritance was a code-sharing shortcut rather than a true is-a.

### Replace Delegation with Inheritance ⚠️
- **What:** A class that delegates to *all* public methods of one other class (and has no parent) → just inherit from it, deleting the forwarders.
- **Mechanics:** Subclass the delegate; remove the delegating methods; repoint the delegate field to `this`.
- **TS note:** **Low value / mild anti-pattern in idiomatic TS.** This pushes *toward* inheritance, against the prevailing grain. The boilerplate it removes is better removed by exposing the delegate directly or via an interface. The catalog's own guards (only if delegating to *every* public method, only if no existing parent) make it narrow. Generally skip — prefer keeping composition.

---

## TOP TECHNIQUES FOR MODERN TS

The ~15 that do the most work cleaning up real-world and LLM-generated TypeScript (roughly in order of everyday leverage):

1. **Extract Method / Extract Function** — name behavior; shrink long functions; the universal primitive.
2. **Replace Nested Conditional with Guard Clauses** — flatten the arrow; early-return + narrowing tightens types as a bonus.
3. **Extract Variable** (esp. naming conditions) — turn opaque expressions into `const isX = …`.
4. **Decompose Conditional** — extract predicate + branches; pairs with `x is T` type guards.
5. **Replace Type Code with Class/Subclasses/State** → in TS: **discriminated unions + exhaustive `switch` (with `never`)**, or a **strategy map** — the highest-value *conceptual* upgrade for branchy code.
6. **Replace Magic Number with Symbolic Constant** — `const` scalars; `as const` objects + derived unions for related literals.
7. **Encapsulate Collection** — return `readonly T[]`, mutate only via intent-named methods; the compiler enforces it.
8. **Introduce Parameter Object / Preserve Whole Object** — kill Long Parameter List; the options-object convention.
9. **Replace Parameter with Explicit Methods** — kill boolean-flag parameters (`enable()` vs `setEnabled(true)`).
10. **Split Temporary Variable + Remove Assignments to Parameters** — one `const` per concept; treat params as immutable.
11. **Replace Temp with Query / Separate Query from Modifier** — pure, reusable, testable reads; CQS.
12. **Replace Constructor with Factory Method** — async/fallible/variant creation; pairs with `Result`/unions.
13. **Remove Setting Method** → make it `readonly` (declaration-level immutability).
14. **Replace Inheritance with Delegation** + **Extract Interface** — composition over inheritance, plus capability contracts for seams/testing.
15. **Inline Method / Inline Class / Collapse Hierarchy / Remove Parameter** — the *deletion* refactors; remove the speculative indirection LLMs love to generate.

Honorable mentions: **Replace Exception with Test** (stop catch-as-control-flow), **Substitute Algorithm** (replace hand-rolled loops with `Array`/`Map`/`Set` methods or a library), **Introduce Assertion** → encode invariants in types + assertion functions / boundary validation, **Extract Class** → split god-modules.

---

## MOSTLY SKIP IN IDIOMATIC TS

OO/inheritance-and-association bookkeeping with little payoff when you favor modules, composition, unions, and immutability. (Skip the *technique-as-written*; the underlying *goal* often survives via a TS-native move noted inline above.)

- **Pull Up Field / Pull Up Method / Pull Up Constructor Body** — inheritance choreography; prefer shared functions/modules/mixins.
- **Push Down Field / Push Down Method** — inheritance choreography; variant-specific data/behavior lives in the union branch.
- **Extract Subclass** — the catalog itself routes you to composition/Strategy; multi-axis variation dead-ends on inheritance.
- **Extract Superclass** — prefer Extract Interface (shape) + composition/modules (code).
- **Form Template Method** — prefer higher-order functions / DI over a base-class skeleton with abstract hooks.
- **Replace Delegation with Inheritance** — pushes the wrong way (toward inheritance); mild anti-pattern; keep composition.
- **Change Unidirectional → Bidirectional Association** — adds coupling/cycles/serialization pain; derive the reverse via lookup instead.
- **Introduce Local Extension** — replace wrappers/subclasses of 3rd-party types with free utility functions / thin adapters.
- **Introduce Foreign Method** — just write a standalone function; no "foreign method" ceremony.
- **Self-Encapsulate Field / Encapsulate Field** — don't reflexively wrap fields in get/set; use `readonly`/`private`/`#` and add accessors only for real logic.
- **Duplicate Observed Data** (as written) — the hand-rolled Observer is dated; keep the *separate-domain-from-view* principle via reactive state (signals/stores/hooks).
- **Change Value to Reference** — niche identity/interning concern; model explicitly with a registry only when actually needed.

**Net:** Families 1 and 4 (Composing Methods, Simplifying Conditionals) are almost entirely high-value in TS. Family 5 (Method Calls) is mostly valuable with a couple of contested items (error-code→exception leans toward `Result` instead; replace-parameter-with-method-call fights DI). Family 3 (Organizing Data) splits cleanly: the "type the primitive / make it immutable / encapsulate the collection" half is core, while the type-code and value/reference machinery is **superseded by the type system** (discriminated unions, branded types). Family 6 (Generalization) is the one to mostly skip — except **Extract Interface**, **Replace Inheritance with Delegation**, and **Collapse Hierarchy**, which actively support a composition-first TS style.

---

*Source: synthesized from the Refactoring.Guru techniques catalog (https://refactoring.guru/refactoring/techniques), originating in Martin Fowler's* Refactoring*. All entries are original paraphrase + TypeScript analysis; no source prose is reproduced.*

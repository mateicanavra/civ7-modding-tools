# Paradigms & Patterns — JUDGE THE ABSTRACTION

The decision reference. Open it when you must choose **functions vs classes**, judge
whether a design is **over- or under-engineered**, or evaluate a **GoF pattern** before
reaching for it. This file does not teach the target patterns themselves — for *what*
the good shapes look like (discriminated unions, branded types, type-state builders,
ports/adapters, FC/IS, the expression problem) it links to `dev:typescript`
(`references/design-patterns.md`). It owns the *verdict* and the *migration*.

**Spine framing.** A pattern is machinery, and machinery has a state-space cost: every
interface, base class, factory, and wrapper is another shape the reader must hold and
another seam the program can be wrong at. A pattern earns that cost only when it
*collapses* more states than it adds — when it names a real, present force in the code.
Most GoF patterns, in TypeScript, do the opposite: they reintroduce ceremony to fake a
feature the language already gives you for free. Judging a pattern is judging whether it
pays for itself.

---

## 1. Patterns are vocabulary; in TypeScript most are workarounds

A design pattern is a *typical solution to a recurring design problem* — a blueprint you
adapt, not a snippet you paste ([refactoring.guru](https://refactoring.guru/design-patterns),
*What's a design pattern?*). That definition has a hard consequence: a pattern is a
**concept**, not a library. You can't `npm install` it. And because it's a concept, a
sufficiently expressive language can *satisfy the concept with a built-in feature* — at
which point the pattern stops being a structure you build and becomes a one-liner you
already write. The problem it solved still gets solved; the named artifact vanishes.

This is exactly what happens in TypeScript, and refactoring.guru says so itself. Its
*Criticism of patterns* page makes three arguments; all three anchor a rule in this
skill.

- **"Kludges for a weak programming language."** RG quotes Paul Graham's *Revenge of the
  Nerds*: the need for patterns "arises when people choose a programming language … that
  lacks the necessary level of abstraction," and patterns become "a kludge that gives
  the language much-needed super-abilities." RG's own example is the load-bearing one:
  *"the Strategy pattern can be implemented with a simple anonymous (lambda) function in
  most modern programming languages."* TypeScript **is** one of those languages —
  first-class functions, closures, modules, structural typing, generators, union types.
  So a large fraction of the GoF catalog is, by RG's own admission, a workaround for a
  missing feature TS already ships.
- **Dogmatic application produces ceremony.** Patterns systematize common approaches;
  applied "to the letter" without adapting to context, they generate boilerplate. The
  translation for us: **implement the *intent*, not the UML.** A five-class Strategy
  hierarchy to pick between two functions is the textbook offense.
- **The hammer/nail problem.** RG names the dominant failure mode: novices "try to apply
  [patterns] everywhere, even in situations where simpler code would do just fine." This
  is **cargo-culting**, and it is the single most common defect in LLM-generated
  TypeScript — the model has read ten thousand pattern tutorials and reaches for a
  `Factory`/`Manager`/`AbstractBaseStrategy` where a function literal would do.

Keep the half that survives: the **names are an asset even when the classes are a
liability.** "Use a strategy map here" communicates intent in four words, and it's true
even when the implementation is a `Record<K, Fn>`. Teach the vocabulary as
*communication*; refuse the class machinery unless a present force demands it.

> **The over-engineering rule.** A pattern is justified only when it names a real,
> present force in your code — a varying axis, a stable boundary, a coupling you must
> break. If the pattern's machinery (interface + concrete classes + wiring) is larger
> than the problem, you are paying the **kludge tax** for an abstraction TypeScript
> already gives you for free. Name the role in plain language; reach for the class
> skeleton only when the language feature genuinely falls short.

---

## 2. The functions-vs-classes decision procedure

This is the core of the file. The skill's bias is settled — *functions + data +
discriminated unions are the default; a class is the exception that must earn its place.*
This section is the rule that decides when the exception holds, so the choice is
reproducible instead of a matter of taste.

### 2.1 The rule

> **A class (or a stateful object — TS lets you encapsulate state without `class`) earns
> its place only when ALL THREE hold:**
>
> 1. **Identity + lifecycle.** The thing has its own mutable state that evolves over time
>    and that callers reference *by identity* — a connection, a parser cursor, a live
>    subscription, a game entity. Functions are stateless; this is the strongest pro-object
>    signal. *No mutable state referenced by identity ⇒ no class.*
> 2. **Multiple methods sharing that state.** A *cohesive* cluster of operations over the
>    same private data. One operation over the state is a function that takes the state as
>    an argument; many operations over shared mutable state is an object.
> 3. **A boundary worth naming.** Wrapping a vendor edge, a subsystem, or an access-control
>    seam in one named unit is a real design win (this is why Adapter/Facade/Proxy survive).
>
> **Fail any one and you do not have a class — you have functions + data + a discriminated
> union wearing a costume.**

A corollary that resolves most cases on sight:

> **The one-method-interface rule.** If an interface has exactly one method, it is a
> *function type*. `interface Strategy { execute(x: X): Y }` is `type Strategy = (x: X) => Y`.
> A class implementing a one-method interface is a function with extra steps. This is the
> direct cash-out of RG's "Strategy = a lambda," generalized across the catalog.

### 2.2 The checklist

Run it in order; the first "no" is your answer.

1. Does the thing hold **mutable state referenced by identity**? — No ⇒ functions + data.
2. Do **≥2 methods share** that state cohesively? — No (one method) ⇒ a function.
3. Is there a **boundary** (vendor/subsystem/access) worth encapsulating? — Yes ⇒ a
   stateful object is legitimate even if (1)/(2) are weak.
4. Is the thing really a **closed set of shapes** with operations over them (a tree, a
   state machine, a serializable command)? — Yes ⇒ a **discriminated union + functions**,
   *not* a class. Exhaustiveness beats polymorphism for closed sets.
5. Would the **swap test** pass — does the opposite choice (function ↔ class,
   generic ↔ concrete) give an equivalent result? — Yes ⇒ the heavier choice isn't earned.

### 2.3 Contrasts

A one-method "strategy" class is a function. The interface is the function's type:

```ts
// over-built: an interface + N one-method classes to pick a discount
interface DiscountStrategy { apply(price: number): number; }
class TenPercent implements DiscountStrategy { apply(p: number) { return p * 0.9; } }
class NoDiscount  implements DiscountStrategy { apply(p: number) { return p; } }
const strategy: DiscountStrategy = pickStrategy(kind);
const final = strategy.apply(base);

// earned: a function type and a map keyed by a union
type Discount = (price: number) => number;
const discounts: Record<DiscountKind, Discount> = {
  ten:  (p) => p * 0.9,
  none: (p) => p,
};
const final = discounts[kind](base);
```

A "service" with no state is a module of functions, not an instantiated class:

```ts
// over-built: a class you new up once, with no state to hold
class PriceCalculator {
  calcSubtotal(items: Item[]) { /* pure */ }
  calcTax(subtotal: number, region: Region) { /* pure */ }
}
const calc = new PriceCalculator();   // why does this object exist?

// earned: exported functions; the module is the namespace
export const calcSubtotal = (items: Item[]) => { /* pure */ };
export const calcTax = (subtotal: number, region: Region) => { /* pure */ };
```

A class is *correct* when identity + lifecycle + cohesion all hold:

```ts
// legitimately a stateful object: identity, lifecycle, multiple methods over shared state
class RateLimiter {
  private hits = new Map<string, number[]>();      // mutable state, referenced by identity
  allow(key: string): boolean { /* reads + mutates this.hits */ }
  reset(key: string): void { this.hits.delete(key); }
  snapshot(): Readonly<Map<string, number[]>> { return this.hits; }
}
```

The `RateLimiter` passes all three gates: callers hold *one* limiter and reference it by
identity, `allow`/`reset`/`snapshot` share `hits`, and it names a coherent
rate-limiting boundary. A class is the right tool here — don't reflexively functionalize
genuine stateful objects (that's the inverse over-correction; see §6 and §5's migration
*the other way*).

---

## 3. GoF-in-TypeScript verdict tables

Each pattern carries a **TS verdict**:

- **IDIOMATIC** — still pulls its weight; the TS form (often a function or small object,
  not a class hierarchy) is the right call.
- **SUPERSEDED-BY-LANGUAGE** — a TS/JS feature does it better; the pattern becomes a
  *description of a one-liner*, not a structure you build.
- **OVER-ENGINEERING-RISK** — solves a real but *rare* problem; defaults to ceremony.
  Worth it only when a specific, present, often *measured* force justifies it.

Verdicts and the language-feature mappings are synthesized from the GoF catalog read
through TypeScript ([refactoring.guru](https://refactoring.guru/design-patterns); see the
research digest behind this skill). Intents are one line; the **Modern TS alternative**
names the language feature; **Worth it when** is the genuine trigger that flips the
verdict back toward "build it."

### 3.1 Creational

| Pattern | Intent | TS verdict | Modern TS alternative | Worth it when |
| --- | --- | --- | --- | --- |
| **Factory Method** | Subclass decides which concrete type to instantiate | SUPERSEDED-BY-LANGUAGE | a factory *function* returning the interface; inject the creator | an overridable creation hook on a class hierarchy that *already exists* for other reasons |
| **Abstract Factory** | Produce *families* of compatible objects | OVER-ENGINEERING-RISK | an object of factory functions (`UIKit` literal), structurally checked | a real family × type *matrix*, swapped wholesale, cross-family mixing must be statically blocked |
| **Builder** | Construct a complex object step by step | SUPERSEDED (config) / IDIOMATIC (staged) | an **options object** with optional props; a type-state builder for staged APIs | a fluent SDK where the type forbids `.build()` until required steps ran, or genuinely *different representations* from one sequence |
| **Prototype** | Copy objects without coupling to their class | SUPERSEDED-BY-LANGUAGE | `structuredClone` for **plain data** (handles cycles; **drops methods/prototype and throws on functions — not for class instances**); spread for shallow override | clone semantics structural copy can't capture (reattach live handles, named-prototype registry) |
| **Singleton** | One instance, globally accessible | SUPERSEDED-BY-LANGUAGE | an **ES module** export (evaluates once); prefer **DI** for testability | ~never as a class; the need is a module export, the *concern* (testing) pushes you to DI |

### 3.2 Structural

| Pattern | Intent | TS verdict | Modern TS alternative | Worth it when |
| --- | --- | --- | --- | --- |
| **Adapter** | Make incompatible interfaces collaborate | **IDIOMATIC** | a wrapper function/object at a boundary | integrating any external/legacy API; isolating your domain from a vendor's shape |
| **Bridge** | Split abstraction from implementation (vary separately) | OVER-ENGINEERING-RISK | inject an implementation (composition over a 2-D inheritance grid) | two axes that *both* genuinely grow and must ship independently (N drivers × M frontends) |
| **Composite** | Treat individual objects and trees uniformly | **IDIOMATIC** | a recursive **discriminated union** + a fold function | your core model genuinely *is* a tree (filesystem, UI tree) |
| **Decorator** | Stack behavior by wrapping (runtime) | SUPERSEDED-BY-LANGUAGE | higher-order function composition (≠ TS `@decorators`, an unrelated AOP feature) | stacked wrappers must preserve an *object* interface and carry state |
| **Facade** | Simplified interface to a complex subsystem | **IDIOMATIC** | a **module** exporting a few named functions | wrapping a complex dependency; decoupling subsystems so they talk only through facades |
| **Flyweight** | Share intrinsic state to fit more in RAM | OVER-ENGINEERING-RISK | an intern pool / memoized factory (`Map<key, shared>`) | a *profiler-measured* memory ceiling with a huge number of shared-state objects |
| **Proxy** | Same-interface stand-in controlling access | **IDIOMATIC** | a wrapper, or the native runtime `Proxy` for dynamic traps | lazy/expensive resources, caching, access guards, remote stubs, reactivity |

### 3.3 Behavioral

| Pattern | Intent | TS verdict | Modern TS alternative | Worth it when |
| --- | --- | --- | --- | --- |
| **Chain of Responsibility** | Pass a request along a chain of handlers | IDIOMATIC (concept) | an **array of middleware functions** | pluggable, runtime-configurable pipelines where order + short-circuit matter |
| **Command** | A request as a standalone object | SUPERSEDED-BY-LANGUAGE | a **closure**; a DU-of-data + interpreter for *serializable* commands | undo/redo, event sourcing, job queues — commands need identity + data |
| **Iterator** | Traverse without exposing representation | SUPERSEDED-BY-LANGUAGE | the iteration protocol — **generators**, `[Symbol.iterator]`, `for…of` | ~never; implement the protocol, not a `hasNext()/next()` class |
| **Mediator** | Centralize many-to-many communication | OVER-ENGINEERING-RISK | an **event bus / store / reducer** | genuine N×N coupling that no off-the-shelf store/bus fits |
| **Memento** | Capture/restore state without breaking encapsulation | SUPERSEDED-BY-LANGUAGE | an **immutable snapshot** (`structuredClone` of **plain data** — not class instances; or a `readonly` history) | a class with private complex internals must control what's snapshotted |
| **Observer** | Notify many subscribers of state changes | SUPERSEDED-BY-LANGUAGE/ECOSYSTEM | `EventTarget`, signals, RxJS, or a tiny typed emitter | always *use* the pattern — via these tools, not a hand-rolled `Subject`/`Observer` pair |
| **State** | Change behavior when internal state changes | **IDIOMATIC** | a **DU of states + a transition function** (a typed FSM; XState at scale) | a real finite-state machine with many states / frequent change |
| **Strategy** | Interchangeable algorithms, swapped at runtime | SUPERSEDED-BY-LANGUAGE | a **function** (or `Record<K, Fn>`) | the strategy needs multiple methods *or* its own state |
| **Template Method** | Algorithm skeleton, overridable steps | SUPERSEDED-BY-LANGUAGE | a **higher-order function** taking step functions | a real base-class lifecycle consumers extend (framework hooks) |
| **Visitor** | New operations over a fixed object structure | OVER-ENGINEERING-RISK | a **DU + a `switch` function** (+ `assertNever`) | an *open* hierarchy you don't own, with operations that keep growing |

For the **positive** TS pattern catalog — how to actually *build* a discriminated union,
branded types, a type-state builder, ports/adapters, FC/IS, and the **expression problem**
that decides Visitor-vs-DU — do not restate it here; read `dev:typescript`
(`references/design-patterns.md`). This file decides *against*; that file shows what to
build *instead*, and the two are meant to be read side by side.

---

## 4. The functional-vs-class collapse map

The catalog above sorts cleanly once you ask the right question: **what does the pattern
collapse into?** That collapse target *is* the functional-vs-class discriminator.

### 4.1 The map

| GoF pattern | Verdict | Collapses into (idiomatic TS) | Wants a class/object when… |
| --- | --- | --- | --- |
| **Strategy** | SUPERSEDED | a function / `Record<K, Fn>` | multiple methods or own state |
| **Command** | SUPERSEDED | a closure; DU-of-data if serializable | undo/event-sourcing needs identity + data |
| **Template Method** | SUPERSEDED | an HOF taking step functions | a real base-class lifecycle consumers extend |
| **Factory Method** | SUPERSEDED | a factory function / injected creator | overridable hook on an existing hierarchy |
| **Iterator** | SUPERSEDED | a generator / `[Symbol.iterator]` / `for…of` | ~never |
| **Observer** | SUPERSEDED | `EventTarget` / signals / RxJS / tiny emitter | a tiny typed dependency-free emitter |
| **Decorator** | SUPERSEDED | HOF composition (≠ `@decorators`) | stacked wrappers preserving an object interface + state |
| **Prototype** | SUPERSEDED | `structuredClone` / spread | custom clone semantics (reattach handles) |
| **Singleton** | SUPERSEDED | an ES module export (prefer DI) | ~never |
| **Memento** | SUPERSEDED | immutable snapshot / `structuredClone` | private complex internals control snapshot |
| **Adapter** | IDIOMATIC | a wrapper fn/object at a boundary | wrapping a stateful multi-method service |
| **Facade** | IDIOMATIC | a module of named functions | (rarely) a stateful subsystem handle |
| **Proxy** | IDIOMATIC | a wrapper or native `Proxy` | access control / lazy / caching / reactivity |
| **Composite** | IDIOMATIC | a recursive DU + fold | nodes carry real behavior + identity |
| **State** | IDIOMATIC | a DU + transition fn (XState at scale) | complex orchestration + side-effects |
| **Chain of Resp.** | IDIOMATIC | an array of middleware functions | handlers are stateful objects |
| **Abstract Factory** | OVER-ENG | an object of factory functions | real family × type matrix, swapped wholesale |
| **Builder** | OVER-ENG | an options object | fluent type-state SDK; multiple representations |
| **Bridge** | OVER-ENG | inject an implementation (composition) | two axes both grow + ship independently |
| **Flyweight** | OVER-ENG | an intern pool / memoized factory | measured memory ceiling, huge object counts |
| **Mediator** | OVER-ENG | an event bus / store / reducer | genuine N×N coupling no store fits |
| **Visitor** | OVER-ENG | a DU + `switch` function | open hierarchy you don't own + growing ops |

### 4.2 The three collapse targets

Read top to bottom; almost every "becomes a function" reduces to one of these.

1. **Single-method patterns → a function or `Record<K, Fn>`.** Strategy, Command,
   Template Method, Factory Method, and Visitor-over-a-closed-set all reduce to "pass
   behavior as a value." If a pattern's interface has exactly one method, it is a function
   type — this is the one-method-interface rule (§2.1) applied to the catalog.

2. **One-shared-instance / copied-state patterns → modules and value semantics.**
   Singleton → a module export. Prototype/Memento → `structuredClone` / `readonly`
   immutable values. Flyweight → an intern `Map`. The OO ceremony existed to manage
   *access to shared or copied state*; modules and value semantics handle that without a
   class.

3. **Iteration & notification patterns → built-in protocols and platform APIs.**
   Iterator → the iteration protocol / generators; Observer → `EventTarget` / signals /
   RxJS. The platform *is* the pattern. Reimplementing it by hand is the purest
   cargo-cult.

### 4.3 The data-shaped patterns → discriminated union + functions

A separate group doesn't collapse into a *function* — it collapses into a **shape**.
Composite, State, serializable Command, and Visitor-over-a-closed-set are all "model the
closed set of cases as a tagged union and fold over it." The functional form here isn't
just lighter; it's **strictly safer**, because exhaustiveness checking turns "did I
handle every case?" into a compile error instead of a runtime surprise.

```ts
// State, Composite, serializable Command, and closed-set Visitor share this shape:
type Node =
  | { kind: "leaf"; price: number }
  | { kind: "box"; packaging: number; children: Node[] };

const total = (n: Node): number => {
  switch (n.kind) {
    case "leaf": return n.price;
    case "box":  return n.packaging + n.children.reduce((s, c) => s + total(c), 0);
    default:     return assertNever(n);   // compiler enforces totality
  }
};

// "Add a new operation" = write another function. Zero edits to existing cases —
// the open/closed property Visitor exists to fake, for free.
const depth = (n: Node): number =>
  n.kind === "leaf" ? 1 : 1 + Math.max(0, ...n.children.map(depth));
```

The trade-off is the **expression problem**: a DU + `switch` makes adding *operations*
free but adding *cases* costly; classes/Visitor are the inverse. Choose by which axis
actually changes in your code. For the full framing, see `dev:typescript`
(`references/design-patterns.md`).

---

## 5. Bidirectional migration mechanics

When a pattern is on the wrong side of the collapse map, migrate it. Both directions are
behavior-preserving and compiler-gated; for the general safe-step cadence (green after
every step, commit one move at a time, characterize first) see
[`refactoring-mechanics.md`](./refactoring-mechanics.md). Below are the two
pattern-specific shapes.

### 5.1 Class → factory-closure

For a stateless "service" class, or a stateful one whose state is private and small. The
goal is to drop the `class` keyword and `this` while preserving the public surface.

1. **Pin the public surface.** Note every method the class exposes; that signature set is
   the contract a migration may not break.
2. **Move construction into a function.** Replace `class X { constructor(deps) }` with
   `const makeX = (deps) => { … }`. Constructor params become factory params.
3. **Lift fields into closure variables.** Private fields become `let`/`const` in the
   factory body; `this.x` becomes `x`. Mutable state stays mutable — it's now closed-over.
4. **Return the methods as an object.** Each method becomes a function in the returned
   literal; they close over the same variables, so they share state exactly as before.
5. **Re-point call sites.** `new X(deps)` → `makeX(deps)`. The call shape (`.method()`)
   is unchanged, so consumers don't move.
6. **Green after each step**; the public type of the returned object should match the old
   class's instance type.

```ts
// before
class Counter {
  private n = 0;
  constructor(private step: number) {}
  inc() { this.n += this.step; return this.n; }
  value() { return this.n; }
}

// after — same surface, no `this`, no `class`
const makeCounter = (step: number) => {
  let n = 0;
  return {
    inc()   { n += step; return n; },
    value() { return n; },
  };
};
```

### 5.2 Inheritance hierarchy → discriminated union + dispatch function

For a base class with subclass-per-variant where subclasses are *data with a little
behavior* (the State / Visitor / closed-set Command shape). This is the highest-leverage
migration in the file: it trades runtime polymorphism for compile-time exhaustiveness.

1. **Enumerate the subclasses.** Each becomes a variant of the union, tagged by a literal
   discriminant (`kind`).
2. **Turn fields into the variant's data.** Each subclass's fields become that variant's
   properties; drop the class wrapper.
3. **Collect the per-subclass method bodies.** For each polymorphic method, the
   subclass overrides become the `case` arms of a `switch` over the discriminant.
4. **Write the dispatch function** with a `default: assertNever(x)` arm so the compiler
   forces you to handle every variant — the guarantee the class form never gave you.
5. **Re-point call sites.** `shape.area()` → `area(shape)`. Construction `new Circle(r)`
   → the data literal `{ kind: "circle", r }`.
6. **Green after each step.** The exhaustiveness error *is* your migration checklist:
   `tsc` will name any case you forgot.

```ts
// before: a class hierarchy for a closed set of shapes
abstract class Shape { abstract area(): number; }
class Circle extends Shape { constructor(public r: number) { super(); } area() { return Math.PI * this.r ** 2; } }
class Square extends Shape { constructor(public s: number) { super(); } area() { return this.s ** 2; } }

// after: a DU + a dispatch function the compiler proves total
type Shape =
  | { kind: "circle"; r: number }
  | { kind: "square"; s: number };

const area = (shape: Shape): number => {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.r ** 2;
    case "square": return shape.s ** 2;
    default:       return assertNever(shape);   // add a variant → compile error here
  }
};
```

### 5.3 When to migrate the *other* way

Migration is not unidirectional. If functions-and-data have drifted into a pile of
free functions all threading the same mutable record through every signature — and that
record has identity, a lifecycle, and a cohesive cluster of operations (§2.1) — then the
*honest* shape is a stateful object, and you should migrate **toward** a class:

```ts
// drifted: every function re-threads the same evolving state, by hand
let cursor = { pos: 0, src };
const advance = (c: typeof cursor) => ({ ...c, pos: c.pos + 1 });
const peek    = (c: typeof cursor) => c.src[c.pos];
// …state passed in and out of a dozen call sites — that's a parser cursor

// honest: identity + lifecycle + cohesion ⇒ a stateful object earns it
class Cursor {
  constructor(private src: string, private pos = 0) {}
  advance() { this.pos++; }
  peek() { return this.src[this.pos]; }
  done() { return this.pos >= this.src.length; }
}
```

The mechanics are §5.1 run in reverse. The point of §2's rule is to make this call
*symmetric*: don't functionalize a genuine stateful object any more than you'd classify a
pure function. The test is the three gates, not a paradigm preference.

---

## 6. Over-engineering vs under-engineering — the pattern-level view

Patterns are where over-engineering hides, because each pattern leaves a *layer* — a
wrapper, interface, factory, base class, or "service" — and a layer is exactly what an
over-engineered design has too many of. The diagnostic is the **indirection audit**:
*"delete this layer and lose nothing?"* If the only loss is "flexibility we don't use
yet," delete it.

This file does not own the full audit. The five-step procedure (name the force → count
call sites → swap test → deletion question → justify survivors) and its detection greps
live in [`llm-slop-cleanup.md`](./llm-slop-cleanup.md#the-indirection-audit), because the
audit is the spine of the generated-code triage pass. Here is the pattern-level framing:
**a pattern is a layer that must pass the audit like any other.** Run the audit on every
abstraction a pattern introduced — an `IFooRepository` with one implementor, a `Factory`
wrapping one `switch`, a `BaseDecorator` with three one-line subclasses — and collapse the
ones that fail.

The cargo-cult tells — the layers that *predictably* fail the audit, with the one-line
collapse:

| Cargo-cult tell | Why it fails | Collapse to |
| --- | --- | --- |
| `getInstance()` / `private static instance` | a module is already a singleton | a module export (inject for testing) |
| one-implementation interface (`IFoo` + one `class Foo`) | the interface decorates a single concrete type | the concrete type; the swap test passes |
| `class XStrategy implements Strategy` | one-method interface = a function type | a function / `Record<K, Fn>` |
| `class XFactory` wrapping one `switch` | a function holds a `switch` fine | a factory function |
| `Visitor` + `accept()` over an *owned, closed* set | fakes dispatch TS gives natively | a DU + `switch` (+ `assertNever`) |
| `AbstractBaseX` hosting one template method | inheritance to share one skeleton | a higher-order function |
| hand-rolled `hasNext()/next()` | reinvents the iteration protocol | a generator / `for…of` |

The opposite failure — **under-engineering** — is the same audit run with the polarity
flipped: not "too many layers" but "no model where one is owed." Its pattern-level form is
a *repeated branch that's a missing discriminated union*: `switch (kind)` copy-pasted
across five functions, a `status: string` that admits infinite states for a three-member
domain, primitives standing in for a type-state machine. The fix is to *introduce* the
shape from §4.3, not to delete a layer. The throughline across both directions:
**match the machinery to the force.** Over-engineering is machinery with no force;
under-engineering is a force with no machinery. The audit catches the first; the
missing-model heuristic catches the second. For under-engineering's full detection grep
set, see [`llm-slop-cleanup.md`](./llm-slop-cleanup.md#under-engineering-tells-the-opposite-failure);
for the smells these manifest as (Speculative Generality, Primitive Obsession, Switch
Statements), see [`smell-catalog.md`](./smell-catalog.md).

---

## Definition of a justified pattern

A pattern (or the abstraction it leaves behind) is justified when it clears every line —
the pattern-level analog of the skill's Approval Bar:

- [ ] **Names a present force** — a varying axis, a stable boundary, or a coupling it
  breaks; not "we might need it someday."
- [ ] **Passes the swap test** — the opposite choice (function ↔ class, generic ↔
  concrete, pattern ↔ language feature) would *not* give an equivalent result.
- [ ] **Earns its layers** — every wrapper/interface/factory it introduces survives the
  indirection audit; no one-implementation interface, no `getInstance()`, no
  Visitor/`accept()` over an owned closed set.
- [ ] **Sits on the right side of the collapse map** — if §4 says SUPERSEDED, the
  language feature is used instead; if a class, the three gates of §2.1 all hold.
- [ ] **Collapses more states than it adds** — the machinery shrinks the reachable-state
  count (exhaustive DU, parsed boundary), it doesn't merely relocate it.

When all five hold, the pattern is design, not ceremony. When any fails, you are paying
the kludge tax — name the role in plain language and reach for the language feature.

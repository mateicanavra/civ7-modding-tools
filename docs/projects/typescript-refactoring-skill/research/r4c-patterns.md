# R4c — GoF Design Patterns Through a TypeScript Lens

**Research lane:** R4c (design-patterns synthesis for the new TypeScript first-principles
complexity-reduction & refactoring skill).
**Mandatory primary reference:** Refactoring Guru — `refactoring.guru/design-patterns`
(catalog + concept pages), cached locally and read in full for this synthesis.
**Source pages read:** all 22 pattern articles plus the five concept pages
(*What's a design pattern?*, *Why learn patterns?*, *Criticism of patterns*,
*Classification of patterns*, *Design Patterns in TypeScript*).
**Stance:** This is an **original, opinionated synthesis**, not a copy of RG prose.
Where I lean on RG's framing (especially its own "Criticism" section), I cite it
explicitly. The deliverable feeds two downstream concerns of the skill: (1) the
**over-engineering / cargo-cult** guidance, and (2) the **functional-vs-class
decision** guidance.

> **One-sentence thesis.** The GoF catalog is a fixed vocabulary for object
> *collaboration*; in idiomatic TypeScript roughly half of it dissolves into
> functions, closures, modules, iterables, and discriminated unions — and the
> patterns that *survive* are the ones that name a **boundary** (Adapter, Facade,
> Proxy) or a **shape of data/state** (State-as-DU, Composite), not the ones that
> exist to compensate for a language without first-class functions.

---

## 1. What patterns are — and the criticism that matters most to us

### 1.1 What a pattern actually is

Refactoring Guru frames a design pattern as a **typical solution to a commonly
occurring design problem** — "like a pre-made blueprint you customize," explicitly
*not* a copy-pasteable snippet (RG, *What's a design pattern?*). Two distinctions
from that page are load-bearing for our skill:

- **Pattern ≠ algorithm.** An algorithm is a recipe (fixed steps to a goal); a
  pattern is a blueprint (you see the result and its properties, but the
  implementation order is yours). The same pattern looks different in two programs.
- **Pattern ≠ library.** You can't `npm install` a pattern. It's a *concept*, which
  is exactly why a pattern can be "implemented" by a language feature instead of by
  classes — and why, in a sufficiently expressive language, the pattern can vanish
  as a named artifact while the *problem it solved* still gets solved.

RG also classifies patterns by **scope/altitude** (*Classification*): low-level
**idioms** (single-language), the three GoF **intent groups** (creational /
structural / behavioral), and high-level **architectural** patterns. The skill
should keep this altitude axis: most GoF patterns are *idiom-to-mid* altitude, and
in TS the idiom layer is where language features do the most replacing.

### 1.2 Why RG says to learn them — the half we keep

RG's defense of patterns (*Why learn patterns?*) reduces to two claims. **One is
durable, one is contingent.**

- **Durable — shared vocabulary.** "Just use a Strategy for that" communicates an
  intent in three words. This survives the move to TypeScript completely. Even when
  the *implementation* is a `Record<string, Fn>`, calling it "a strategy map" tells
  a reviewer what role it plays. **The names are an asset even when the classes are
  a liability.** Our skill should teach the vocabulary as *communication*, decoupled
  from the class machinery.
- **Contingent — "tried-and-tested OO solutions."** This is the part TS erodes. The
  value of memorizing a class skeleton drops sharply when the language gives you the
  collaboration mechanism natively (a closure, an iterable, a module).

### 1.3 The criticism — central to our over-engineering guidance

RG dedicates a whole page to criticism (*Criticism of patterns*), and it is unusually
candid. The three arguments, in RG's own framing, and why each one anchors a rule in
our skill:

1. **"Kludges for a weak programming language."** RG attributes this to Paul Graham's
   *Revenge of the Nerds*: *"Usually the need for patterns arises when people choose
   a programming language or a technology that lacks the necessary level of
   abstraction. In this case, patterns become a kludge that gives the language
   much-needed super-abilities."* RG's own example: **"the Strategy pattern can be
   implemented with a simple anonymous (lambda) function in most modern programming
   languages."** This is the single most important sentence for us. TypeScript *is*
   one of those modern languages — first-class functions, closures, modules,
   structural typing, generators, union types. So a large fraction of GoF is, by
   RG's own admission, a workaround for a missing feature TS already has.

2. **"Inefficient solutions" / dogmatic application.** Patterns systematize
   already-common approaches; treated as dogma and applied "to the letter" without
   adapting to context, they produce ceremony. Our skill's translation:
   **implement the *intent*, not the UML.** A 5-class Strategy hierarchy to choose
   between two functions is the textbook case.

3. **"Unjustified use" — the hammer/nail problem.** RG: novices who just learned
   patterns "try to apply them everywhere, even in situations where simpler code
   would do just fine." This is **cargo-culting**, and it is the dominant failure
   mode in LLM-generated TypeScript specifically: the model has read thousands of
   pattern tutorials and reaches for a `Factory`/`Manager`/`AbstractBaseStrategy`
   when a function literal would do.

> **Skill rule derived from §1.3.** *A pattern is justified only when it names a
> real, present force in your code — a varying axis, a stable boundary, a coupling
> you must break. If the pattern's machinery (interface + concrete classes +
> wiring) is larger than the problem, you are paying the "kludge tax" for an
> abstraction TypeScript already gives you for free. Name the role in plain
> language; reach for the class skeleton only when the language feature genuinely
> falls short.*

### 1.4 RG's own TypeScript page — what it does and doesn't say

The *Design Patterns in TypeScript* page (RG) is a **catalog index with one-line
intents**, not a verdict page. It does not say "this pattern is obsolete in TS."
That editorial gap is precisely what this lane fills: RG tells you *what* each
pattern is in TS; we add *whether you should still reach for it*. The one explicit
language-feature nod RG itself makes is inside the **Strategy** article's Pros/Cons:
*"A lot of modern programming languages have functional type support that lets you
implement different versions of an algorithm inside a set of anonymous functions …
without bloating your code with extra classes and interfaces."* We generalize that
admission across the catalog.

---

## 2. The three categories (RG classification) with members

Per RG's *Classification*:

- **Creational** — object-creation mechanisms that increase flexibility/reuse:
  **Factory Method, Abstract Factory, Builder, Prototype, Singleton.**
- **Structural** — assembling objects/classes into larger structures, kept flexible:
  **Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy.**
- **Behavioral** — communication and assignment of responsibilities between objects:
  **Chain of Responsibility, Command, Iterator, Mediator, Memento, Observer, State,
  Strategy, Template Method, Visitor.**

Each entry below uses one of three **TS verdicts**:

- **IDIOMATIC** — still pulls its weight in TS; the class form (or a light version of
  it) is often the right call.
- **SUPERSEDED-BY-LANGUAGE** — a TS/JS feature does the job better; the named pattern
  becomes a description of a one-liner, not a structure you build.
- **OVER-ENGINEERING-RISK** — solves a real but *rare* problem; defaults to ceremony.
  Worth it only when a specific, present force justifies it.

---

## 3. Creational patterns

### Factory Method
- **Intent.** Define an interface for creating an object, but let subclasses decide
  which concrete type to instantiate (RG).
- **Real problem it solves.** Decouple client code from `new ConcreteThing()` so new
  product types don't force edits across the codebase; give framework users an
  extension seam to override which component class is built.
- **TS verdict: SUPERSEDED-BY-LANGUAGE (mostly) → a factory *function* / DI.** The
  "subclass overrides the creation method" mechanism is inheritance ceremony. In TS
  the idiom is a plain function returning the interface type, or passing a creator
  function as a parameter:
  ```ts
  type Transport = { deliver(): void };
  const makeTransport = (kind: "road" | "sea"): Transport =>
    kind === "road" ? roadTransport() : seaTransport();
  ```
  Returning an interface (structural type) gives you the decoupling Factory Method
  promises without a `Creator` hierarchy.
- **Worth it when.** You're authoring a library/framework and want a documented,
  overridable creation hook on a class consumers already subclass — i.e. the
  inheritance is *already there for other reasons* (RG's own "best case scenario").
- **Smell when.** A `Factory` class wrapping a single `switch` that a function would
  hold; or `*Factory` classes created reflexively for objects that have one variant.

### Abstract Factory
- **Intent.** Produce *families* of related objects without naming their concrete
  classes (RG).
- **Real problem it solves.** Guarantee that objects used together are
  **compatible** (all "Modern" furniture, all "macOS" widgets) and swap the whole
  family by swapping one factory.
- **TS verdict: OVER-ENGINEERING-RISK → an object of factory functions, or a config
  record.** The genuine value (family consistency) is real but narrow. The
  lightweight TS form is a single object literal whose methods return the interfaces:
  ```ts
  type UIKit = { button(): Button; checkbox(): Checkbox };
  const macKit: UIKit = { button: makeMacButton, checkbox: makeMacCheckbox };
  ```
  No `AbstractFactory` interface + N concrete classes needed; the object *is* the
  factory, and TS structurally checks `macKit` against `UIKit`.
- **Worth it when.** Multiple product *families* × multiple product *types* form a
  real matrix (RG's "map out a matrix"), variants are swapped wholesale, and
  cross-family mixing must be statically prevented (cross-platform UI, theming
  engines, multi-backend drivers).
- **Smell when.** One family, or a family that never changes — then it's just five
  interfaces guarding a constructor call (RG lists this exact downside: "a lot of
  new interfaces and classes").

### Builder
- **Intent.** Construct a complex object step by step; reuse the construction code to
  produce different representations (RG).
- **Real problem it solves.** Kill the **telescoping constructor** (RG's named
  trigger) and the explosion of config subclasses; allow partial/optional
  configuration without a 10-arg constructor.
- **TS verdict: SUPERSEDED-BY-LANGUAGE (for config) → options object;
  IDIOMATIC (narrowly) for fluent/typed staged builders.** TypeScript's
  **optional properties on an options object** solve the telescoping-constructor
  problem directly and idiomatically:
  ```ts
  function makeHouse(opts: { walls: number; pool?: boolean; garage?: boolean }) { … }
  ```
  The *Director* role almost always collapses into a named factory function. The
  Builder *class* re-earns its place only when you want a **fluent, type-state API**
  where the accumulating generic forbids `.build()` until required steps ran — a TS
  *type-level* win that the plain options object can't express (see R2's
  "accumulating-generic builder").
- **Worth it when.** Public SDK ergonomics where chaining + compile-time "you forgot
  a required step" matters; or genuinely building *different representations* from
  one sequence (RG's car + manual example).
- **Smell when.** A builder for a 3-field record. Use an options object.

### Prototype
- **Intent.** Copy existing objects without coupling to their concrete classes (RG).
- **Real problem it solves.** Clone configured instances (including private state)
  when you only hold an interface; avoid re-running expensive init; use pre-built
  presets instead of init-only subclasses.
- **TS verdict: SUPERSEDED-BY-LANGUAGE → `structuredClone`, spread, immutable
  updates.** The cloning problem RG describes (private fields invisible from
  outside) is solved natively:
  ```ts
  const copy = structuredClone(original);          // deep, handles cycles
  const tweaked = { ...original, color: "red" };    // shallow override
  ```
  `structuredClone` even handles RG's "circular references" caveat. A `clone()`
  method per class is rarely needed.
- **Worth it when.** A class encapsulates clone semantics that structural copy can't
  capture (reattaching live handles, custom deep-copy invariants, registry of named
  prototypes). Then a `clone()` method is a legitimate domain operation, not a
  pattern.
- **Smell when.** Hand-rolled `clone()` that copies each field — that's
  `structuredClone`/spread reinvented.

### Singleton
- **Intent.** One instance, globally accessible (RG).
- **Real problem it solves.** Control a single shared resource (a connection pool, a
  config) and provide one access point.
- **TS verdict: SUPERSEDED-BY-LANGUAGE → ES modules.** A module is a singleton: it
  evaluates once, and its exports are the single shared instances. No private
  constructor, no `getInstance`, no double-checked locking (RG's multithreading
  caveat doesn't even apply to single-threaded JS).
  ```ts
  // db.ts — imported anywhere, evaluated once
  export const db = createConnection(config);
  ```
  RG *itself* lists the Singleton's downsides: SRP violation, masks bad design,
  hard to unit-test ("Or just don't use the Singleton pattern."). The module form
  inherits the **same testability problem** (hidden global coupling), so the real
  upgrade is **dependency injection**: pass the dependency in, default it to the
  module instance.
- **Worth it when.** Truly never — as a *class pattern*. The legitimate need (one
  shared instance) is met by a module export; the legitimate *concern* (testability)
  pushes you toward DI.
- **Smell when.** A `class X { static getInstance() }` in TS. It's a module wearing a
  costume, and it imports the hardest-to-test property of globals.

---

## 4. Structural patterns

### Adapter
- **Intent.** Let objects with incompatible interfaces collaborate (RG).
- **Real problem it solves.** Use a 3rd-party/legacy thing whose shape doesn't match
  your code, *without* editing it (you may not own it).
- **TS verdict: IDIOMATIC.** This is one of the patterns that **fully survives** —
  but the TS form is usually a **function or a small wrapper object**, not a class
  hierarchy. The pattern is fundamentally "a boundary translation," and boundaries
  are exactly where TS wants explicit code (parse-at-the-edges).
  ```ts
  // wrap a JSON-only lib for an XML-shaped caller
  const xmlToJsonAdapter = (svc: JsonAnalytics): XmlAnalytics => ({
    analyze: (xml) => svc.analyze(xmlToJson(xml)),
  });
  ```
- **Worth it when.** Integrating any external/legacy API; isolating your domain from
  a vendor's shape so swapping vendors touches one file. (This is the same instinct
  as ports-and-adapters.)
- **Smell when.** "Adapting" code you own and could just change (RG: "sometimes it's
  simpler just to change the service class"); or a class with one delegating method
  that should be a function.

### Bridge
- **Intent.** Split a class into two independent hierarchies — *abstraction* and
  *implementation* — that vary separately (RG).
- **Real problem it solves.** Prevent the **combinatorial subclass explosion** when
  a type varies along two orthogonal axes (Shape × Color; GUI × OS API).
- **TS verdict: OVER-ENGINEERING-RISK → composition / inject the implementation.**
  The *insight* is excellent and timeless: **prefer composition over a 2-D
  inheritance grid.** But the named "abstraction/implementation hierarchy" framing
  (which RG admits "sound too academic") is heavier than TS needs. In TS you just
  give the high-level object a field of an interface type and inject the
  implementation — which is also how Strategy and State look (RG notes all three
  share a structure).
  ```ts
  type Renderer = { drawCircle(r: number): void };       // "implementation"
  class Circle { constructor(private r: Renderer) {} … }   // "abstraction"
  ```
- **Worth it when.** Two axes that *both* genuinely grow over time and must ship
  independently (e.g. N device drivers × M frontends), decided up-front (RG: "Bridge
  is usually designed up-front").
- **Smell when.** Applied to a "highly cohesive class" (RG's own warning) or when one
  axis is actually fixed. Then it's indirection with no payoff.

### Composite
- **Intent.** Compose objects into trees and treat individual objects and
  compositions uniformly (RG).
- **Real problem it solves.** Run an operation recursively over a part-whole
  hierarchy (file system, UI tree, order-of-boxes) without the client knowing
  leaf-vs-container.
- **TS verdict: IDIOMATIC — best expressed as a recursive discriminated union +
  fold.** The pattern's intent is sound and common. But the *idiomatic TS* shape is
  **data + a function**, not a class tree:
  ```ts
  type Node =
    | { kind: "leaf"; price: number }
    | { kind: "box"; children: Node[]; packaging: number };

  const total = (n: Node): number =>
    n.kind === "leaf" ? n.price : n.packaging + n.children.reduce((s, c) => s + total(c), 0);
  ```
  The DU gives exhaustiveness checking the class form lacks; the recursive function
  *is* the "uniform treatment." Use classes only when nodes carry real behavior +
  identity.
- **Worth it when.** Your core model genuinely is a tree (RG: "makes sense only when
  the core model can be represented as a tree").
- **Smell when.** Forcing a tree onto flat data, or "overgeneralizing the component
  interface" (RG's stated downside) so leaves carry meaningless `add()/remove()`.

### Decorator
- **Intent.** Attach new behavior by wrapping objects in interface-compatible
  wrappers; stackable at runtime (RG).
- **Real problem it solves.** Add responsibilities (logging, compression, formatting,
  extra notification channels) *combinatorially* without a subclass per combination,
  and at runtime.
- **TS verdict: SUPERSEDED-BY-LANGUAGE → higher-order functions / function
  composition.** ⚠️ **Distinct from TS `@decorators`** — those are a metadata/AOP
  annotation feature, *not* this pattern. The GoF Decorator's "wrap-and-delegate,
  stack the wrappers" is exactly function composition:
  ```ts
  type Notify = (msg: string) => void;
  const withSlack = (next: Notify): Notify => (m) => { sendSlack(m); next(m); };
  const withSms   = (next: Notify): Notify => (m) => { sendSms(m); next(m); };
  const notify = withSlack(withSms(emailNotify));   // stacked decorators
  ```
  For object-shaped services, a wrapper object spreading the original
  (`{ ...inner, method: … }`) is the equivalent. RG's own downsides ("hard to remove
  a specific wrapper," "behavior depends on stack order," "config code looks ugly")
  apply to HOFs too, but with far less boilerplate.
- **Worth it when.** You need the *object* interface preserved across many stacked
  layers and the wrappers carry state. Otherwise compose functions.
- **Smell when.** A `BaseDecorator` abstract class + N subclasses to add behaviors
  that are one-line wrappers.

### Facade
- **Intent.** Provide a simplified interface to a complex subsystem (RG).
- **Real problem it solves.** Shield clients from a sprawling library's
  initialization order/dependencies; define a clean entry point per subsystem layer.
- **TS verdict: IDIOMATIC — usually a module, sometimes a function.** Survives
  cleanly; the TS form is **a module that exports a few well-named functions** which
  internally orchestrate the messy subsystem. No `Facade` class required.
  ```ts
  // videoFacade.ts
  export function encode(file: string, format: string): Blob { /* hides 12 classes */ }
  ```
- **Worth it when.** Wrapping any complex dependency you want to use a slice of, or
  decoupling subsystems so they talk only through facades (RG's layering use).
- **Smell when.** The facade grows into a **god object** coupled to everything (RG's
  explicit warning) — the sign it should be split into several smaller facades/modules.

### Flyweight
- **Intent.** Share common (intrinsic) state across many objects to fit more in RAM;
  pass per-instance (extrinsic) state in as arguments (RG).
- **Real problem it solves.** Millions of near-identical objects exhausting memory
  (RG's particle-system example).
- **TS verdict: OVER-ENGINEERING-RISK → only under a measured memory ceiling.** This
  is a genuine *optimization* pattern, not a design pattern; its value "depends
  heavily on how and where it's used" (RG). In TS the lightweight expression is an
  **intern pool / memoized factory** (`Map<key, shared>`) returning shared immutable
  objects — no `Flyweight` class hierarchy.
- **Worth it when.** You have *measured* that a huge number of objects with shared
  immutable state is blowing the heap (RG: "only when your program must support a
  huge number of objects which barely fit into available RAM").
- **Smell when.** Applied speculatively. RG's own downside: "the code becomes much
  more complicated; new team members will always be wondering why the state was
  separated." Don't pay that without a profiler reading.

### Proxy
- **Intent.** A stand-in with the **same interface** that controls access to the real
  object — for lazy init, access control, caching, logging, remoting, smart refs (RG).
- **Real problem it solves.** Insert cross-cutting behavior *before/after* calls
  without changing the real object or its clients (it can't tell the difference).
- **TS verdict: IDIOMATIC — and JS has a literal `Proxy` built-in.** Survives; two
  TS forms. (1) A **wrapper object/function** with the same shape (most cases —
  caching, logging, lazy init via a getter). (2) The runtime **`Proxy`** object for
  truly dynamic interception (`get`/`set`/`apply` traps) — e.g. reactive state, ORMs.
  ```ts
  const lazyDb: Db = new Proxy({} as Db, { get: (_, k) => (realDb ??= connect())[k] });
  ```
- **Worth it when.** Lazy/expensive resources, caching layers, access guards, remote
  stubs, reactive frameworks. The "same interface" constraint (vs Adapter's
  *different* interface, vs Decorator's *enhanced* one) is the discriminator (RG).
- **Smell when.** A proxy that only forwards with no added control — that's dead
  indirection; or hand-written interception that the native `Proxy` would do.

---

## 5. Behavioral patterns

### Chain of Responsibility
- **Intent.** Pass a request along a chain of handlers; each handles or forwards (RG).
- **Real problem it solves.** Decouple sender from the (dynamic, reorderable) set of
  processors; run ordered checks/filters where any link may stop the flow
  (auth → sanitize → rate-limit → cache → handle).
- **TS verdict: IDIOMATIC (as a concept) → an array of handler *functions* /
  middleware.** The pattern is alive and everywhere — but the linked-list-of-handler-
  *classes* form is superseded by the **middleware array** idiom (Express/Koa/
  oRPC-style):
  ```ts
  type Handler = (req: Req, next: () => Res) => Res;
  const run = (hs: Handler[], req: Req): Res =>
    (function go(i): Res { return i < hs.length ? hs[i](req, () => go(i + 1)) : final(req); })(0);
  ```
  Handlers as functions are reorderable at runtime (RG's key requirement) without a
  `setNext` field.
- **Worth it when.** Pluggable, runtime-configurable pipelines where order matters and
  short-circuiting is real (middleware, validation chains, event bubbling).
- **Smell when.** A fixed two-step check modeled as a handler hierarchy. RG's own
  downside — "some requests may end up unhandled" — is a real failure mode to guard.

### Command
- **Intent.** Turn a request into a standalone object holding all call info; enables
  queueing, logging, undo (RG).
- **Real problem it solves.** Parameterize objects with operations; defer/queue/
  serialize/log/undo invocations; decouple invoker from receiver.
- **TS verdict: SUPERSEDED-BY-LANGUAGE → closures (and tagged unions for
  serializable commands).** "A request as an object with an `execute()`" is a
  **closure** that captures its args:
  ```ts
  const copy = () => editor.copy();        // a command
  history.push(copy);                       // queue / store / replay
  ```
  When commands must be **serialized** (sent over the wire, persisted, replayed —
  RG's queue/log use), model them as a **discriminated union of plain data** + one
  interpreter function; that's better than command classes because it's
  exhaustively typed and trivially JSON-able.
- **Worth it when.** Undo/redo with state mementos, event sourcing, job queues — i.e.
  commands need *identity and data*, not just behavior. Then the DU-of-data form wins.
- **Smell when.** A `Command` interface + N classes each wrapping one function call.
  RG even pairs Command with Memento for undo — in TS that's "a data record + a
  reducer," not two class hierarchies.

### Iterator
- **Intent.** Traverse a collection's elements without exposing its representation
  (RG).
- **TS verdict: SUPERSEDED-BY-LANGUAGE → iteration protocol + generators +
  `for…of`.** This is the cleanest "the language already has it" case. JS/TS have a
  built-in iteration protocol (`Symbol.iterator`), **generators** for custom
  traversal, and `for…of`/spread that consume any iterable:
  ```ts
  function* inOrder(t: Tree): Iterable<number> {
    if (t.left) yield* inOrder(t.left);
    yield t.value;
    if (t.right) yield* inOrder(t.right);
  }
  for (const v of inOrder(tree)) { … }
  ```
  Multiple independent traversals, lazy iteration, pause/resume (all RG benefits)
  come for free, with lazy evaluation as a bonus the classic pattern lacks.
- **Worth it when.** Effectively never as a hand-built `Iterator` class. Implement
  `[Symbol.iterator]` / write a generator instead.
- **Smell when.** A `hasNext()`/`next()` class in TS. That's the iteration protocol,
  reinvented and incompatible with `for…of`.

### Mediator
- **Intent.** Centralize chaotic many-to-many object communication behind one
  mediator; components talk only to it (RG).
- **Real problem it solves.** Untangle N components that each know about the others
  (a form where every field reacts to every other) so they depend on one hub.
- **TS verdict: OVER-ENGINEERING-RISK → an event bus / store / reducer.** The intent
  (kill direct component-to-component coupling) is sound, and it's the basis of real
  architectures (Redux-style stores, `EventTarget` buses, parent-coordinator
  components). But a bespoke `Mediator` class/interface is heavy; reach for an
  existing coordination mechanism first. RG itself notes a Mediator "can evolve into
  a God Object," and that an Observer-based mediator "may look very similar to
  Observer."
- **Worth it when.** A real web of mutual dependencies among UI/components that you
  must decouple and reuse independently (RG's dialog example), *and* an off-the-shelf
  store/bus doesn't fit.
- **Smell when.** A "Manager/Coordinator" hub that accretes every interaction until
  it's the god object RG warns about.

### Memento
- **Intent.** Capture and restore an object's state without breaking encapsulation
  (RG).
- **Real problem it solves.** Undo/redo and transactional rollback while keeping
  snapshot internals private to the originator.
- **TS verdict: SUPERSEDED-BY-LANGUAGE (largely) → immutable snapshots /
  `structuredClone` / readonly state.** With immutable data, a "memento" is just a
  previous value you kept:
  ```ts
  const history: readonly State[] = [];
  const snapshot = structuredClone(state);   // or state is already immutable
  ```
  RG's whole motivating problem — "how to copy private fields without exposing them"
  — is mostly an OO artifact; with plain immutable state objects there's nothing to
  hide and nothing to clone-by-hand. RG even concedes dynamic languages "can't
  guarantee" memento immutability — so lean on `readonly`/`Readonly<T>` + discipline.
- **Worth it when.** A class with genuinely private, complex internals must control
  exactly what's snapshotted/restored (custom serialization, partial state). Then a
  real memento method is justified.
- **Smell when.** A `Memento` + `Caretaker` + `Originator` trio guarding a value you
  could have cloned.

### Observer
- **Intent.** Define a subscription so many subscribers are notified of a subject's
  state changes (RG).
- **Real problem it solves.** One-to-many dynamic notification without the publisher
  knowing concrete subscriber classes.
- **TS verdict: SUPERSEDED-BY-LANGUAGE / ECOSYSTEM → `EventTarget`, signals, RxJS,
  framework reactivity.** The mechanism RG describes (a subscriber list + add/remove
  + notify) is provided natively and by standard libraries:
  - **`EventTarget`** (built into browsers and Node) — `addEventListener` /
    `dispatchEvent` *is* Observer.
  - **Signals / reactive primitives** (Solid, Vue refs, Preact/Angular signals,
    the TC39 signals proposal) — fine-grained auto-subscription.
  - **RxJS `Observable`** — Observer at scale, with operators.
  - A typed micro-emitter (`Map<event, Set<handler>>`) when you want zero deps.
  ```ts
  const bus = new EventTarget();
  bus.addEventListener("restock", (e) => render(e));   // subscribe
  bus.dispatchEvent(new CustomEvent("restock"));        // notify
  ```
- **Worth it when.** Effectively always *use* the pattern — but via these tools, not
  a hand-rolled `Subject`/`Observer` interface pair. Roll your own only for a tiny,
  dependency-free, strongly-typed emitter.
- **Smell when.** A `Publisher`/`Subscriber` interface hierarchy reimplementing
  `EventTarget`. RG's "subscribers notified in random order" caveat is yours to own.

### State
- **Intent.** Let an object change behavior when its internal state changes — "as if
  it changed its class" (RG).
- **Real problem it solves.** Replace the sprawling `switch(state)` repeated across
  every method (RG's exact motivation) with per-state behavior, and make transitions
  explicit.
- **TS verdict: IDIOMATIC — as a discriminated union + transition function (a typed
  FSM).** This is the flagship "the pattern is real, the *class* form isn't" case.
  RG's own problem statement is a `switch` on a `state: string`; the TS answer isn't
  N state classes — it's a **DU of states** + a transition function with
  **exhaustiveness checking**:
  ```ts
  type Doc =
    | { status: "draft" }
    | { status: "moderation" }
    | { status: "published" };

  const publish = (d: Doc, user: User): Doc => {
    switch (d.status) {
      case "draft":      return { status: "moderation" };
      case "moderation": return user.isAdmin ? { status: "published" } : d;
      case "published":  return d;
      default:           return assertNever(d);   // compiler enforces totality
    }
  };
  ```
  This keeps RG's win (no scattered conditionals, easy to add states) and adds
  compile-time guarantees that the class form can't give. For complex state +
  side-effects, a library FSM (XState) is the scaled form. (This directly feeds the
  skill's "State-as-DU" guidance.)
- **Worth it when.** A real finite-state machine with many states / frequent change
  (RG). DU for logic-heavy; XState for orchestration/side-effects.
- **Smell when.** A class-per-state hierarchy where states share most behavior, or a
  2-state toggle dressed as an FSM (RG: "overkill if a state machine has only a few
  states").

### Strategy
- **Intent.** Define a family of interchangeable algorithms; swap them at runtime
  (RG).
- **Real problem it solves.** Stop a class from ballooning with every algorithm
  variant; pick behavior at runtime; isolate algorithm internals from the caller.
- **TS verdict: SUPERSEDED-BY-LANGUAGE → first-class functions (and a `Record` of
  them).** This is the pattern RG *itself* uses as the headline example of the
  "kludge for a weak language" criticism, and repeats in the Strategy Pros/Cons. A
  strategy is **a function**:
  ```ts
  type RouteFn = (from: Point, to: Point) => Point[];
  const strategies: Record<Mode, RouteFn> = { car: drive, walk: walkRoute, bus: transit };
  const route = strategies[mode](a, b);
  ```
  Pass the function as a parameter, or look it up in a map keyed by a union. No
  `Strategy` interface, no concrete classes.
- **Worth it when.** A strategy needs **multiple methods or its own state** — then an
  object (still not necessarily a class) earns its keep. A single-method strategy is
  always a function.
- **Smell when.** `interface Strategy { execute() }` + N one-method classes. That's
  the literal kludge RG describes.

### Template Method
- **Intent.** Define an algorithm's skeleton in a base class; let subclasses override
  specific steps without changing the structure (RG).
- **Real problem it solves.** Remove duplication across near-identical algorithms by
  hoisting the shared shape and varying only the differing steps (parse → analyze →
  report, where only parsing differs).
- **TS verdict: SUPERSEDED-BY-LANGUAGE → higher-order function taking step
  functions.** The "skeleton + overridable steps" is a function that accepts the
  varying steps as parameters/callbacks:
  ```ts
  const mine = (steps: { open(): Raw; parse(r: Raw): Data }) => {
    const raw = steps.open();
    const data = steps.parse(raw);
    return analyze(data);          // shared skeleton
  };
  ```
  This sidesteps RG's stated downsides: the inheritance form risks **Liskov
  violations** (suppressing a default step) and gets "harder to maintain the more
  steps they have." Passing steps as data has neither problem.
- **Worth it when.** You already have an inheritance hierarchy and the skeleton truly
  belongs to a base class consumers extend (framework lifecycle hooks). RG notes
  Factory Method is a specialization of Template Method — same caveats.
- **Smell when.** A new abstract base class created *just* to host a template method,
  when an HOF would do.

### Visitor
- **Intent.** Separate algorithms from the object structure they operate on; add new
  operations without changing the element classes (RG).
- **Real problem it solves.** Add operations (export-to-XML, then export-to-JSON, …)
  over a fixed set of element types you can't/won't keep editing; uses **double
  dispatch** to route to the right method.
- **TS verdict: OVER-ENGINEERING-RISK → discriminated union + a `switch` function.**
  Visitor exists to fake the dispatch and open/closed properties that TS gives you
  natively. The double-dispatch + `accept()` ceremony is unnecessary: with a DU,
  "add an operation" is just "write another function" — no element changes:
  ```ts
  type Node = City | Industry | Sightseeing;       // closed set
  const toXml = (n: Node): string => {              // a "visitor" = a function
    switch (n.kind) {
      case "city":        return …;
      case "industry":    return …;
      case "sightseeing": return …;
    }                                               // exhaustiveness checked
  };
  const toJson = (n: Node): string => { … };        // new op, zero element edits
  ```
  This wins on RG's own axis (new behavior without touching elements) *and* adds
  exhaustiveness, *and* removes the `accept()` boilerplate.
- **Worth it when.** The classic Visitor still has a niche: when **element types are
  stable but operations grow** AND you cannot use a DU because the element set is an
  *open class hierarchy you don't control*. RG's own downside ("update all visitors
  each time a class is added") is the **expression-problem** tradeoff — DU/`switch`
  makes adding *operations* free but adding *cases* costly; Visitor/classes are the
  inverse. Choose by which axis actually changes. (See R2's "expression problem"
  framing.)
- **Smell when.** A `Visitor` interface + `accept()` over a closed set you *do* own —
  that's a DU and a function, with worse ergonomics.

---

## 6. Synthesis — patterns as a functional-vs-class lens

This is the section that feeds the skill's functional-vs-class decision guidance. The
GoF catalog, run through TypeScript, sorts cleanly into **what collapses into plain
language constructs** and **what legitimately wants an object/class (or a tree of
data).** The collapse target is the discriminator.

### 6.1 The collapse map

| GoF pattern | TS verdict | Collapses into (idiomatic TS) | Wants a class/object when… |
|---|---|---|---|
| **Strategy** | SUPERSEDED | a **function** / `Record<K, Fn>` | strategy has multiple methods or own state |
| **Command** | SUPERSEDED | a **closure**; DU-of-data if serializable | undo/event-sourcing needs identity + data |
| **Template Method** | SUPERSEDED | **HOF** taking step functions | a real base-class lifecycle consumers extend |
| **Iterator** | SUPERSEDED | **generator** / `[Symbol.iterator]` / `for…of` | ~never (use the protocol) |
| **Observer** | SUPERSEDED | `EventTarget` / **signals** / RxJS / tiny emitter | a tiny typed dependency-free emitter |
| **Decorator** | SUPERSEDED | **HOF composition** (≠ TS `@decorators`) | stacked wrappers must preserve an object interface + state |
| **Prototype** | SUPERSEDED | `structuredClone` / **spread** | custom clone semantics (reattach handles) |
| **Singleton** | SUPERSEDED | an **ES module** export (prefer DI) | ~never (module + DI) |
| **Memento** | SUPERSEDED | **immutable snapshot** / `structuredClone` | private complex internals control snapshot |
| **Factory Method** | SUPERSEDED | a **factory function** / injected creator | overridable hook on an existing class hierarchy |
| **Adapter** | IDIOMATIC | a **wrapper fn/object** at a boundary | wrapping a stateful multi-method service |
| **Facade** | IDIOMATIC | a **module** of named functions | (rarely) a stateful subsystem handle |
| **Proxy** | IDIOMATIC | a **wrapper** or native **`Proxy`** | access control / lazy / caching / reactivity |
| **Composite** | IDIOMATIC | a **recursive DU + fold function** | nodes carry real behavior + identity |
| **State** | IDIOMATIC | a **DU + transition fn** (FSM; XState at scale) | complex orchestration + side-effects |
| **Chain of Resp.** | IDIOMATIC | an **array of middleware functions** | handlers are stateful objects |
| **Abstract Factory** | OVER-ENG | an **object of factory functions** | real family × type matrix, swapped wholesale |
| **Builder** | OVER-ENG | an **options object** (optional props) | fluent type-state SDK; multiple representations |
| **Bridge** | OVER-ENG | **inject an implementation** (composition) | two axes both grow + ship independently |
| **Flyweight** | OVER-ENG | an **intern pool / memoized factory** | measured memory ceiling, huge object counts |
| **Mediator** | OVER-ENG | an **event bus / store / reducer** | genuine N×N coupling no store fits |
| **Visitor** | OVER-ENG | a **DU + `switch` function** | open hierarchy you don't own + growing ops |

### 6.2 The three collapse targets (what "becomes a function" really means)

1. **Single-method patterns → a function or `Record<K, Fn>`.** Strategy, Command,
   Template Method, Factory Method, and Visitor-over-a-closed-set all reduce to "pass
   behavior as a value." If a pattern's interface has exactly one method, it is a
   function type in TS. **Rule: one-method interface ⇒ use a function.** This is the
   direct cash-out of RG's "Strategy = a lambda" criticism, generalized.

2. **"One shared instance / shared state" patterns → modules and data.** Singleton →
   module export. Prototype/Memento → `structuredClone`/immutable values. Flyweight →
   an intern `Map`. The OO ceremony existed to manage *access to shared/copied state*;
   modules and value semantics handle that without classes.

3. **Iteration & notification patterns → built-in protocols & platform APIs.**
   Iterator → the iteration protocol/generators; Observer → `EventTarget`/signals/
   RxJS. The platform *is* the pattern. Reimplementing it by hand is the purest
   cargo-cult.

### 6.3 What legitimately wants a class — or at least a stateful object

A class (or a stateful object — TS lets you have encapsulated state without `class`)
earns its place when **all three** of these hold; otherwise prefer functions + data:

- **Identity + lifecycle.** The thing has its own mutable state evolving over time
  that callers reference by identity (a connection, a parser cursor, a live
  subscription, a game entity). Functions are stateless; this is the strongest
  pro-object signal.
- **Multiple methods that share that state.** A *cohesive* cluster of operations over
  the same private data. One method ⇒ function. Many methods over shared mutable
  state ⇒ object.
- **A boundary worth naming/enforcing.** Adapter, Facade, Proxy all wrap a *boundary*
  (vendor edge, subsystem, access control). Encapsulating that boundary in one
  named unit is a real design win, not ceremony.

Conversely, the **data-shaped** patterns (Composite, State, serializable Command,
Visitor-over-closed-set) want a **discriminated union + functions**, not classes.
These are the cases where the "pattern" is really *"model the shape as a tagged union
and fold over it,"* and TS's exhaustiveness checking makes the functional form
strictly safer than the polymorphic class form.

### 6.4 The decision rule (for the skill)

> **When you reach for a GoF pattern in TypeScript, first ask which collapse target
> it has.** If the pattern's interface is **one method**, write a function (or a
> `Record` of functions). If it manages a **single shared instance or copied state**,
> use a module or value semantics (`structuredClone`/immutability). If it's
> **iteration or notification**, use the built-in protocol / platform API
> (`for…of`/generators, `EventTarget`/signals). If it models a **closed set of
> shapes** with operations over them, use a **discriminated union + a `switch`
> function** (with `assertNever` for exhaustiveness). Reach for a **class/stateful
> object only** when there is genuine identity + lifecycle + multiple methods over
> shared state, or a **boundary** worth naming (Adapter / Facade / Proxy). Reach for
> the **full multi-class pattern** (Abstract Factory, Bridge, Mediator, Visitor,
> Flyweight) only when a specific, present, *measured* force — a real variant matrix,
> two independently-growing axes, true N×N coupling, an open foreign hierarchy, a
> profiler-confirmed memory ceiling — justifies the ceremony. Absent that force, the
> pattern is the "kludge tax" RG warns about, paid for an abstraction TypeScript
> already gives you.**

### 6.5 The cargo-cult tells (for LLM-slop cleanup)

The patterns most over-applied in generated TS, with the one-line fix:

- `class FooStrategy implements Strategy` → a function.
- `class FooFactory` wrapping one `switch` → a factory function.
- `class FooManager` / `FooMediator` coordinating two things → direct calls or a store.
- `getInstance()` singleton → a module export (or inject it).
- hand-written `hasNext()/next()` iterator → a generator / `for…of`.
- `Subject`/`Observer` interface pair → `EventTarget` or a typed emitter.
- `Visitor` + `accept()` over a closed, owned set → a DU + `switch`.
- `AbstractBaseX` whose only job is one template method → an HOF.

Each of these is "the pattern's *name* survives, its *class machinery* should not."

---

## 7. Cross-references for the skill

- **R2** (`dev:typescript` audit) already owns the *positive* TS pattern catalog
  (DUs/ADTs, branded types, type-state builders, strategy-via-function-injection,
  command+handler map, FSM, typed pub/sub, ports & adapters, the **expression
  problem**). This lane is the **deciding-against** companion: it maps each GoF
  pattern to *when not to* and *what it collapses into*. The skill should link the
  two so "don't build Visitor" lands next to "here's the DU you build instead."
- The **§1.3 criticism → §6.4 decision rule** path is the spine of the
  over-engineering guidance; the **§6.1 collapse map** is the spine of the
  functional-vs-class guidance.
- Citations throughout are to **refactoring.guru/design-patterns** (catalog +
  *What's a design pattern?*, *Why learn patterns?*, *Criticism of patterns*,
  *Classification of patterns*, *Design Patterns in TypeScript*). All prose here is
  original synthesis; RG's wording is quoted only where explicitly marked.

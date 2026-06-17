# Refactoring Mechanics — Transform Safely

This is the **TRANSFORM-SAFELY** reference: the compiler-gated mechanics for
executing a refactor, the gated workflow that wraps them, and the definition of
done. Open it once you have *detected* a smell (→ `smell-catalog.md`) and decided
to fix it. For *what good looks like* — the target shapes you refactor toward —
this file links out and never restates: `paradigms-and-patterns.md` (functional
vs class, GoF verdicts, the indirection audit) and the `dev:typescript` skill
(`references/design-patterns.md`, `references/refactoring-patterns.md`,
`references/axes.md`).

Technique names follow the Fowler catalog as re-illustrated by
[Refactoring.Guru](https://refactoring.guru/refactoring/techniques); the
mechanics below are an original, TypeScript-specialized synthesis, not the source
prose.

## The compiler-as-safety-net cadence

A refactor is **behavior-preserving by construction**, not by hope. The way you
get that guarantee is rhythm, not care:

- **Small steps.** Each transform is the smallest edit that compiles. A move you
  cannot do in one green step is two moves wearing a trenchcoat — split it.
- **Green after every step.** `tsc --strict --noEmit` clean *and* tests passing
  is the gate between steps. If the build is red, you are no longer refactoring;
  you are debugging a half-applied edit. Get back to green before the next move.
- **The compiler is the net the source catalog never had.** Fowler's mechanics
  say "compile and test" after each step because Java lacked the type density to
  prove the step. In strict TS, the type checker *is* most of the net: rename,
  extract, move, and signature changes surface every stale reference as an error.
  Exploit that — let red squiggles drive the edit, then run tests for the
  behavior the types can't see.
- **Where the net has holes.** Structural typing means a *wrong* rename can still
  type-check (two unrelated types with the same shape). `as` / `as any` / `!`
  mask the breakage a refactor would otherwise reveal. `noUncheckedIndexedAccess`
  off hides index errors a decomposition introduces. Before a risky move, grep
  the blast zone for escape hatches and strip them, or the net is lying to you.
- **Refactor and add-feature are separate hats — and separate commits.** Never
  change behavior and structure in the same diff. If you discover a bug
  mid-refactor, note it, finish the structural move green, commit, *then* switch
  hats and fix the bug as its own change. Mixing the two makes both unreviewable
  and destroys the "behavior is unchanged" guarantee that makes a refactor safe.

> **Categorical, not instance.** A smell you found once is a *class*. When a
> mechanic below fixes one site, sweep the module (or repo) for siblings and fix
> them in the same pass — one fix, many sites. A `codemod` / `ts-morph` script
> earns its keep past ~20–50 call sites.

---

## The gated refactor workflow

The six SKILL.md steps, expanded into procedure. Every step has a gate; you do
not advance past a red gate.

### 1. Detect

Inventory smells with `smell-catalog.md` and ground intuition in tooling, not
vibes: `knip` / `ts-prune` (dead exports), `jscpd` (duplication), `madge` /
`dpdm` (cycles), ESLint `complexity` / `max-lines` / `max-depth` / `sonarjs`,
`tsc --noUnusedLocals --noUnusedParameters`, and an escape-hatch grep
(`as any`, `as unknown as`, `@ts-ignore`, `!`, `Record<string, any>`). The
catalog's *Detection toolkit cheat-sheet* has the exact invocations.

**Gate:** a written smell inventory, each with a concrete signal — not "this
feels messy."

### 2. Triage & rank by state-space leverage

Order targets so the highest-leverage move lands first. The ranking key is **how
much a fix collapses the reachable-state space**, traded against blast radius:

1. **State-space collapses first** — flags/optionals/`any` → discriminated union
   + exhaustive `switch`. One such move can delete a dozen downstream branches.
2. **Deletions next** — dead code, lazy classes, one-line wrappers, speculative
   generality. Deleting a concept beats restructuring it (Delete > rearrange).
3. **Placement last** — moving a function to its owning module reduces coupling
   but doesn't shrink the state space; do it after the high-leverage cuts.

Note what is load-bearing and what crosses a published boundary (defer surface
contracts to `dev:api-design`). For *whether to refactor at all* and *where the
boundary goes*, this is the moment to hand off to `cognition:solution-design` /
`cognition:domain-design` — not later.

**Gate:** a ranked list; the top item is a state-space collapse or a deletion,
not a rename.

### 3. Characterize (build the safety net)

Before you change untested code, pin its behavior. Either there are tests that
already lock the contract, or you write a characterization net first (see
*Refactoring without tests*, below), or each step is small enough that
`tsc --strict` alone proves it. Design of the net — what to test, how much, the
oracle — is owned by `cognition:testing-design`; do not re-derive it here.

**Gate:** behavior is pinned. You can name *how you would know* if a step broke
something. If you can't, you are not ready to transform.

### 4. Transform step-by-step

Apply one mechanic from this file at a time. Each mechanic below carries its own
numbered steps with the compile/test checkpoint marked. The discipline across
mechanics:

- One logical move per edit; `tsc --strict --noEmit` + tests green between edits.
- **Commit granularity: one logical move per commit.** A commit should be
  revertable in isolation and describable in one line ("extract `isEligible`
  predicate", "flags → `Status` DU"). Squash typo-fix churn; never bundle two
  independent moves. This keeps `git bisect` and review sane and makes rollback a
  scalpel, not a sledgehammer.

**Gate:** green build + green tests after each move; each move is its own commit.

### 5. Verify

Confirm the contract held: external behavior unchanged, and **public types
didn't drift silently**. Diff the emitted `.d.ts` / exported surface
(`git diff` on declaration output, or `knip`/`api-extractor`) — a structural
edit can change an inferred return type without touching a single annotation.

**Gate:** behavior preserved; `git diff` of the public surface is empty or
intended-and-recorded.

### 6. Definition of done

Run the checklist at the end of this file. Record findings and before/after with
`../assets/refactor-findings-template.md`. Check the result against SKILL.md's
Mandate and Approval Bar.

### Stop / rollback signals

Abort the current move and revert to the last green commit when:

- **The build won't go green in small steps.** If a "small" step cascades into
  dozens of unrelated errors, the step was too big or the seam was wrong. Revert,
  re-plan a smaller cut.
- **Type-check performance blows up.** A refactor that introduces deep
  conditional types, large unions, or heavy inference can make `tsc` crawl. If
  editor responsiveness or `tsc` wall-time degrades sharply, stop: profile with
  `tsc --generateTrace ./trace` and inspect in Perfetto. The diagnosis-and-fix
  workflow (sub-apps, breaking the inference chain, `interface` over deep
  intersections) lives in `dev:typescript` `references/real-world-examples.md` —
  hand off rather than guessing.
- **Behavior diverges.** A characterization test goes red on a step that should
  have been behavior-preserving → you found a latent bug *or* mis-stepped.
  Revert, isolate, decide (fix-as-separate-commit vs. the step was wrong).
- **The state space didn't drop.** If the planned move only relocates complexity
  (Swap test passes, reachable-state count unchanged), it has not earned its
  diff. Stop and find the move that deletes the model instead.

---

## The top TypeScript refactoring moves

The ~15 that do the most work on real and LLM-generated TS, roughly in order of
everyday leverage. For each: which **smell** it cures (→ `smell-catalog.md`), the
**mechanics** (TS-specialized, with the green checkpoint), and a short
before→after where it sharpens. For the *target shapes* (DU, branded types,
ports, strategy maps) refer to `paradigms-and-patterns.md` and `dev:typescript`
`references/design-patterns.md` — this file owns the *moves*, not the targets.

### Extract Function

**Cures:** Long Method; Duplicate Code; Comments (when a comment is really a
function name waiting to happen). → `smell-catalog.md`.

**Mechanics:**
1. Find a fragment that hangs together; name it for **intent**, not mechanism
   (`recalculateTax`, not `processData`).
2. Free variables read inside become parameters; the single mutated local becomes
   the return value. *Two or more mutated locals → split the fragment further, or
   return a small object literal / tuple — don't smuggle out multiple results via
   parameter mutation.*
3. Create the function; replace the fragment with a call. **Checkpoint:**
   `tsc --noEmit` + tests green.
4. Prefer a free `function` / arrow over a method unless the data is genuinely
   object-bound. The IDE's "Extract to function" is reliable for the move — but
   *you* pick the name.

```ts
// before
function priceOrder(order: Order) {
  let total = 0;
  for (const line of order.lines) total += line.qty * line.unitPrice;
  // apply discount
  if (order.coupon) total *= 1 - order.coupon.rate;
  return total;
}
// after
const subtotal = (lines: readonly Line[]) =>
  lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
const applyCoupon = (total: number, c: Coupon | undefined) =>
  c ? total * (1 - c.rate) : total;

const priceOrder = (order: Order) =>
  applyCoupon(subtotal(order.lines), order.coupon);
```

### Replace Nested Conditional with Guard Clauses

**Cures:** Long Method; arrow-shaped nesting; Optional-property soup (the guard
strips `undefined`). → `smell-catalog.md`.

**Mechanics:**
1. Identify each special/edge case nested around the happy path.
2. Pull each to the top as a guard that returns or throws early. **Checkpoint**
   after each guard: green.
3. Flatten the remaining body — it now runs on validated, narrowed values.
4. Consolidate guards that share an outcome.

The TS bonus: `if (!x) return;` doesn't just dedent — it **narrows** the type, so
the rest of the function sees `x` without `undefined`. Nesting and type-noise
collapse together.

```ts
// before
function pay(user?: User) {
  if (user) {
    if (user.active) {
      if (user.balance > 0) return charge(user);
    }
  }
  return null;
}
// after — each guard narrows; body operates on a known-good User
function pay(user?: User) {
  if (!user) return null;
  if (!user.active) return null;
  if (user.balance <= 0) return null;
  return charge(user); // user: User, active, positive balance
}
```

### Extract Variable (name conditions)

**Cures:** Long Method; opaque expressions; Comments. → `smell-catalog.md`.

**Mechanics:**
1. Hoist a subexpression into a `const` named for **what it means**
   (`isPastDue`), never `let`. The `const` proves the extraction is
   side-effect-free.
2. Replace the original occurrence; repeat for other parts. **Checkpoint:** green.
3. **Watch eval semantics:** extracting an operand of `a() || b()` forces both to
   evaluate — if the operands are effectful or expensive, the short-circuit you
   removed mattered. Keep predicates pure.

```ts
// before
if (order.total > 100 && !order.coupon && order.customer.tier === "gold") { … }
// after
const qualifiesForFreeShipping =
  order.total > 100 && !order.coupon && order.customer.tier === "gold";
if (qualifiesForFreeShipping) { … }
```

### Decompose Conditional

**Cures:** Long Method; Switch Statements; dense branching. → `smell-catalog.md`.

**Mechanics:**
1. Extract the test into a named predicate (`isSummerRate(date)`).
2. Extract the then-branch and else-branch each into a named function.
   **Checkpoint:** green after each extraction.
3. If the predicate distinguishes a *type*, type it as a guard
   (`x is Foo`) — you get readability **and** narrowing in one move.

```ts
// before
if (date.month >= 6 && date.month <= 8) charge = base * summerRate;
else charge = base * winterRate;
// after
const isSummer = (d: Date) => d.month >= 6 && d.month <= 8;
charge = isSummer(date) ? summerCharge(base) : winterCharge(base);
```

### Replace Type Code with discriminated union + exhaustive `switch`/`never`

**Cures:** Switch Statements; Primitive Obsession; flag/boolean soup;
Optional-property soup. *The highest-value conceptual move on branchy code.*
→ `smell-catalog.md`. For the union shape and exhaustiveness pattern itself, see
`dev:typescript` `references/design-patterns.md` and the flags→DU /
union→ADT moves in `dev:typescript` `references/refactoring-patterns.md` —
coordinate, don't duplicate. Migration mechanics also expand in
`paradigms-and-patterns.md`.

**Mechanics:**
1. Name the variants: model the type code (or the cluster of booleans/optionals)
   as a `type` with a literal discriminant per case, each carrying *only* its
   own data.
2. Construct values through the new type at every creation site. **Checkpoint:**
   green.
3. Replace each branchy read with a `switch (x.kind)`; in the `default`, assign
   to a `never` to force exhaustiveness. Adding a future variant now becomes a
   compile error at every switch — the compiler maintains the branch list.
4. Delete the now-impossible combinations (the soup that admitted illegal states
   is gone).

```ts
// before — three booleans encode one state; illegal combos representable
interface Job { loading: boolean; error?: string; data?: Result }
// after — one discriminant; illegal states unrepresentable
type Job =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "done"; data: Result };

function render(j: Job) {
  switch (j.kind) {
    case "loading": return spinner();
    case "error":   return banner(j.message);
    case "done":    return view(j.data);
    default: { const _exhaustive: never = j; return _exhaustive; }
  }
}
```

When the *same* switch is duplicated across many functions, escalate to a
**strategy map** (`Record<Kind, Handler>`) rather than copying the switch —
verdict and mechanics in `paradigms-and-patterns.md`.

### Replace Magic Number with named const

**Cures:** Primitive Obsession; Comments. → `smell-catalog.md`.

**Mechanics:**
1. Declare a `const` carrying the meaning (`const TAX_RATE = 0.2`).
2. Replace only the occurrences that *truly mean this concept* — not every `0.2`.
   **Checkpoint:** green.
3. For a *set* of related literals, prefer an `as const` object + derived union
   over a numeric `enum` (no runtime enum object, exact literal types):

```ts
const Role = { Admin: "admin", Editor: "editor", User: "user" } as const;
type Role = (typeof Role)[keyof typeof Role]; // "admin" | "editor" | "user"
```

Not every literal is magic — `i < count`, `* 2`, `[0]` are usually fine. A
literal used as a *type code* belongs in the discriminated-union move above.

### Introduce Branded Type

**Cures:** Primitive Obsession (interchangeable ids/quantities typed as bare
`string`/`number`). → `smell-catalog.md`. Target shape (nominal/branded types)
lives in `dev:typescript` `references/design-patterns.md`; this is the safe
sequence to retrofit one.

**Mechanics:**
1. Declare the brand and the branded alias. The runtime value is unchanged — the
   brand exists only in the type system, so this is zero-overhead:

```ts
declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };
type UserId = Brand<string, "UserId">;
```

2. Add **one** constructor per brand — the single place a raw value becomes a
   branded one. Confine the `as` cast here. If the source is untrusted, *validate
   in this constructor* (this is your parse-at-the-boundary seam); if it is
   already trusted, the cast alone is fine because it is the only one:

```ts
const toUserId = (raw: string): UserId => {
  if (raw === "") throw new Error("empty UserId"); // validate when untrusted
  return raw as UserId;
};
```

3. Change the *consuming* signatures from `string` to `UserId` and follow the
   compiler; every call site that mixed ids now fails to type-check.
   **Checkpoint:** green — and a deliberately swapped argument is now a red.
4. Push the constructors to the boundary (parse/DTO layer) so the core never sees
   a raw `string`. The `as` cast count in the core should drop to zero.

*Why it earns its keep:* it makes "which `string` is this?" a compiler question
instead of a convention, with no runtime cost. Do not brand every primitive —
only ones that are semantically distinct and get mixed up.

### Encapsulate Collection (`readonly`)

**Cures:** the "exposed mutable collection" bug; Inappropriate Intimacy.
→ `smell-catalog.md`.

**Mechanics:**
1. Store the field `readonly`; type the getter as `readonly T[]` /
   `ReadonlyArray<T>` (or return a copy).
2. Add intent-named mutators (`addLine`, `removeLine`); rename any "replace the
   whole collection" to `replace`.
3. Follow the compiler errors at call sites that mutated the array directly —
   each is a real escaped-mutation bug the type now forbids. **Checkpoint:**
   green once all external mutation routes through the methods.

```ts
// before — callers can push into internals
class Cart { items: Item[] = []; }
// after — the compiler enforces the no-external-mutation contract
class Cart {
  readonly #items: Item[] = [];
  get items(): readonly Item[] { return this.#items; }
  add(i: Item) { this.#items.push(i); }
}
```

### Introduce Parameter Object / Preserve Whole Object (options object)

**Cures:** Long Parameter List; Data Clumps. → `smell-catalog.md`.

**Mechanics (Introduce Parameter Object):**
1. Define an (often `readonly`) `interface`/`type` for the recurring param clump.
2. Add it as a single param; replace the individual params with reads from it.
   **Checkpoint:** green.
3. Relocate behavior that operates only on that clump onto/near the type if
   warranted.

**Mechanics (Preserve Whole Object):** when you unpack several fields off an
object only to pass them separately, pass the object — but choose the **narrowest
stable type** that still satisfies the callee. Structural typing lets the callee
accept `{ x: number; y: number }` instead of the whole `Widget`; that keeps the
dependency minimal and the function testable. Whole-object widens coupling;
minimal-shape keeps it tight. Pick deliberately.

```ts
// before
function createUser(name: string, email: string, age: number, admin: boolean) {}
// after — named fields kill positional-arg bugs; readonly = no surprise mutation
interface CreateUserOptions {
  readonly name: string; readonly email: string;
  readonly age: number; readonly admin: boolean;
}
function createUser(opts: CreateUserOptions) {}
```

### Replace Parameter with Explicit Methods (kill boolean-flag params)

**Cures:** boolean-flag parameters; Long Parameter List. → `smell-catalog.md`.

**Mechanics:**
1. For a param whose *value fully selects behavior* (especially a boolean), write
   one clearly-named function per variant.
2. Route each caller to the right one; delete the original. **Checkpoint:** green.

```ts
// before — call site reads as a riddle: setValue(true)? for what?
function setEnabled(on: boolean) { … }
setEnabled(true);
// after
function enable() { … }
function disable() { … }
enable();
```

Judgment: if the variants share most logic and differ only by *data*, a
discriminated-union param can beat N near-identical methods. Don't over-split
rarely-changing variants. The reverse smell — N near-identical methods differing
by one literal — is cured by **Parameterize Function** (`getAdminUsers` /
`getEditorUsers` → `getUsersByRole(role)`); just keep the param a union, not a
boolean mode flag that grows an internal conditional.

### Split Temporary Variable + Remove Assignments to Parameters

**Cures:** Long Method; the reused-`let result`/`temp`/`data` smell.
→ `smell-catalog.md`.

**Mechanics (Split Temporary Variable):**
1. Each time a local is reassigned to mean *something new*, introduce a new,
   well-named variable for that concept.
2. Make each new variable `const`. If you *can't* make it `const`, that's a
   signal the fragment wants Extract Function instead. **Checkpoint:** green.
   (Loop counters are exempt.)

**Mechanics (Remove Assignments to Parameters):**
1. Reassigning a param? Copy it into a local: `const local = param;` and mutate
   `local`. **Checkpoint:** green.
2. Better: treat all params as immutable by convention; mark object/array params
   `readonly`. Reassigning a param obscures the input contract; mutating a
   reference-shared object/array param is a genuine foot-gun, not a style nit.

```ts
// before — one `let` carries two meanings, and mutates the input
function f(items: number[]) {
  let temp = items.reduce((a, b) => a + b, 0); // sum
  temp = temp / items.length;                  // now it's the average
  items = items.filter((x) => x > temp);       // param reassigned
  return items;
}
// after — one const per concept; param left alone
function f(items: readonly number[]) {
  const sum = items.reduce((a, b) => a + b, 0);
  const average = sum / items.length;
  return items.filter((x) => x > average);
}
```

### Replace Temp with Query / Separate Query from Modifier

**Cures:** Long Method; Duplicate Code; hidden side effects (CQS violation).
→ `smell-catalog.md`.

**Mechanics (Replace Temp with Query):**
1. Ensure the temp is assigned exactly once (Split Temporary Variable first if
   not).
2. Extract the computing expression into a **pure** helper (Separate Query from
   Modifier first if it isn't pure).
3. Replace the temp with the call. **Checkpoint:** green. Keep the temp only for
   genuinely expensive, memoizable work — and then reach for an explicit memo.

**Mechanics (Separate Query from Modifier):**
1. A function that both returns a value *and* mutates → create a pure query that
   returns the value; leave the original holding only the mutation.
2. At call sites, call the modifier, then the query. **Checkpoint:** green. Pure
   queries are cacheable and trivially testable; the command isolates the effect.
   (Exception: returning a value that *is the effect's report* — e.g. a
   deleted-row count — is fine.)

### Replace Constructor with Factory Method

**Cures:** constructors doing more than field-setting; fallible/async/variant
creation. → `smell-catalog.md`. For *target* SDK/factory shapes see
`dev:typescript` `references/design-patterns.md`.

**Mechanics:**
1. Write a `create*` factory function that wraps the constructor.
2. Redirect callers to it; make the constructor `private`. **Checkpoint:** green.
3. Pull non-construction logic (validation, defaulting, async fetch) into the
   factory. For fallible creation, return a `Result` / discriminated union rather
   than throwing — failure becomes part of the type signature.

```ts
// before — a constructor that can't fail gracefully or be async
class Client { constructor(url: string) { /* validates, throws */ } }
// after — factory can be async, can return a typed failure
class Client {
  private constructor(readonly url: URL) {}
  static create(raw: string): Result<Client, "bad-url"> {
    const url = parseUrl(raw);
    return url ? ok(new Client(url)) : err("bad-url");
  }
}
```

### The deletion moves: Inline Function, Inline Class, Collapse Hierarchy, Remove Parameter

**Cures:** Lazy Class; Middle Man; Speculative Generality; Dead Code; needless
indirection (the slop LLMs love). → `smell-catalog.md`. *Delete > rearrange — the
highest-confidence way to drop the state space is to remove a concept.*

**Inline Function:** body is as clear as its name and earns nothing → substitute
the body at every call site, delete the function. For plain functions there's no
override chain to check; low-risk. **Checkpoint:** green.

**Inline Class:** a 6-line wrapper module/class that barely does anything → fold
its members into the sole consumer, redirect references, delete the file.
**Checkpoint:** green.

**Collapse Hierarchy:** a subclass and superclass have drifted nearly identical →
pull-up/push-down to consolidate, repoint references, delete the empty layer.
Watch remaining siblings for LSP breakage. The broader move is "collapse the
accidental hierarchy into composition or a union" — see
`paradigms-and-patterns.md`.

**Remove Parameter:** a param no reader needs → confirm unused
(`noUnusedParameters` + IDE), delete it, fix callers (the compiler lists them).
Every param is a question in the reader's head; cut the speculative
"might-need-it-later" ones. **Checkpoint:** green.

### Replace Inheritance with Delegation + Extract Interface

**Cures:** Refused Bequest; inheritance-for-code-reuse; tight is-a coupling that
isn't really is-a. → `smell-catalog.md`. *Composition over inheritance — the most
important move in the generalization family.* Target shapes (ports/adapters,
strategy fields) live in `paradigms-and-patterns.md` and `dev:typescript`
`references/design-patterns.md`.

**Mechanics (Replace Inheritance with Delegation):**
1. Hold the former superclass in a field instead of `extends`-ing it.
2. Add delegating methods for the surface the clients actually use — or, better in
   TS, expose a focused **interface** rather than re-proxying the whole surface.
3. Drop `extends`; follow the compiler. **Checkpoint:** green. The endpoint is
   often a Strategy-style pluggable field.

**Mechanics (Extract Interface) — the one high-value generalization move:**
1. Name the slice of a type's surface that multiple clients (or a dependency
   seam, or a test double) actually use, as an `interface`/`type`.
2. Thanks to **structural typing**, existing types satisfy it with *no*
   `implements` edits. Depend on the interface at the seam. **Checkpoint:** green.
   Use freely for ports/adapters and testability. (Its limit: interfaces share
   *shape*, not *code* — for dedup use Extract Function / Extract Class.)

### Extract Module (split a god module)

**Cures:** Large Class / god-module; Divergent Change (one file edited for many
unrelated reasons). → `smell-catalog.md`. *Where* the boundaries go is a domain
question — defer that judgment to `cognition:domain-design`; this is the safe
mechanical sequence once you know the split.

**Mechanics:**
1. Identify the axes of change — group functions/types by the *reason they change*
   (fetching vs validation vs formatting vs caching). Each group is a candidate
   module.
2. Move one cohesive group to a new, concept-named file. Keep the moved symbols
   exported for now so callers still resolve. **Checkpoint:** green.
3. Fix imports across the original module and follow the compiler. Move one group
   per step, re-checking between each. **Checkpoint:** green after each group.
4. **Shrink the public surface:** demote symbols that were only internal
   implementation (a cache `Map`, a validator) from `export` to module-private.
   The package should expose only its use-case verbs, not its internals.
   **Checkpoint:** green; the export count should drop.
5. Verify no consumer reached into the now-private state; if one did, give it a
   narrow accessor instead of re-exporting the raw collection (see Encapsulate
   Collection above).

*The win is measured by export-surface and reasons-to-change, not file count:*
splitting one 400-line file into four that each still export everything has not
reduced coupling.

---

## Refactoring without tests

When you must change untested code, make it **safe before you make it clean** —
write **characterization (golden-master) tests** first. These don't assert what
the code *should* do; they pin what it *currently does*, so any behavior change
shows up red.

Briefly, when and how:
- **When:** the code has no test net, behavior is non-trivial, and a step might
  change output. Skip only when steps are small enough that `tsc --strict` alone
  proves them (pure renames, signature-driven moves the compiler fully checks).
- **How (golden master):** capture the current output for a representative spread
  of inputs (record real outputs into a snapshot/fixture), then assert future
  runs match. For wide output, snapshot serialization is the fast path; for a few
  cases, inline expected values. Run it green *before* the first refactor step —
  a characterization test that's red at the start is pinning a bug, not behavior.
- **Then refactor** behind that net, step by step, green between steps. Delete or
  upgrade the golden master once the design stabilizes and proper tests exist.

Design of the net — risk-proportional coverage, choosing oracles, what *not* to
test — is owned by `cognition:testing-design`. Hand off for the design; this file
only says *do it, and do it first*.

---

## Mostly skip in idiomatic TS

The dated family — class-inheritance and association bookkeeping with little
payoff when you favor modules, composition, unions, and immutability. Skip the
*technique-as-written*; the underlying goal usually survives via a TS-native
move. One line each:

- **Pull Up Field / Pull Up Method / Pull Up Constructor Body** — inheritance
  choreography. → shared function / module / mixin the variants call.
- **Push Down Field / Push Down Method** — inheritance choreography. → put
  variant-specific data/behavior directly in the discriminated-union branch.
- **Extract Subclass** — multi-axis variation dead-ends on inheritance. →
  composed fields or a discriminated union (the catalog itself routes you here).
- **Extract Superclass** — single-inheritance ceiling, tight coupling. →
  **Extract Interface** for shared shape; shared module/function for shared code.
- **Form Template Method** — base-class skeleton with abstract hooks. →
  higher-order function / DI: a skeleton function taking the varying steps as
  callbacks or a strategy object.
- **Replace Delegation with Inheritance** — pushes the wrong way. → keep
  composition; expose the delegate directly or via an interface.
- **Change Unidirectional → Bidirectional Association** — adds coupling, cycles,
  serialization pain. → keep it one-way and *derive* the reverse via a `Map` /
  lookup.
- **Self-Encapsulate Field / Encapsulate Field** — the Java get/set reflex. →
  `readonly` / `private` / `#`; add accessors only when access needs real logic.
- **Introduce Foreign Method / Introduce Local Extension** — "foreign method"
  ceremony / subclassing a 3rd-party type. → a plain standalone utility
  `fn(x: Foreign, …)` or a thin adapter.
- **Change Value to Reference** — niche identity/interning. → an explicit
  `Map`-backed registry, only when you actually need shared identity.
- **Duplicate Observed Data** (as written) — hand-rolled Observer. → keep the
  separate-domain-from-view *principle*; implement with reactive state
  (signals/stores/hooks).
- **Replace Conditional with Polymorphism** (as a class hierarchy) — for *closed*
  variant sets, prefer the discriminated-union + exhaustive `switch` move above;
  escalate to polymorphism/strategy only when the same switch is duplicated
  across many functions or variants are *open*.
- **Introduce Null Object** — `isNull()` subclasses. → `strictNullChecks` +
  explicit `T | undefined` + `?.` / `??`; keep Null Object only for genuine
  no-op cases (a no-op logger, an empty default strategy).

---

## Definition of done — the refactor checklist

A refactor is done when **all** of these hold. A "no" on any line is a finding
against the work, not a nit:

- [ ] **State-collapse.** Reachable-state count actually dropped — fewer
  optionals/flags/`any`, or a discriminated union the compiler now checks. (If
  it didn't, the diff isn't earned.)
- [ ] **Deletion over rearrangement.** Incidental complexity a type-level move
  could delete is gone, not relocated. The Swap test fails for any new
  abstraction (the opposite choice would *not* be equivalent — i.e. the
  abstraction is earned).
- [ ] **Compiler-enforced.** New invariants live in the type system (DU +
  `never`, `readonly`, branded types, parse-at-boundary) — not in a comment,
  convention, or runtime guard.
- [ ] **No new escape hatch.** No added `any` / `as` / `as any` / `!` /
  `@ts-ignore` / `Record<string, any>` without written justification.
- [ ] **Reuse, not reinvention.** Nothing reimplements a helper the repo already
  provides.
- [ ] **Naming coherence.** File names ↔ export names ↔ concepts line up; no
  dead scaffolding; no narration comments left behind.
- [ ] **Size tripwires.** No module pushed toward ~400+ LOC, function past
  ~40–50 LOC, or cyclomatic ~10 without a structural reason.
- [ ] **Behavior & contract preserved.** External behavior unchanged; public
  types didn't drift silently (declaration diff is empty or recorded).
- [ ] **Green throughout.** `tsc --strict --noEmit` and tests passed after every
  step; type-check performance did not regress.
- [ ] **Clean history.** One logical move per commit; refactor commits carry no
  behavior change; any bug found mid-refactor was deferred to its own commit.
- [ ] **Recorded.** Findings and before/after captured via
  `../assets/refactor-findings-template.md`; result checked against SKILL.md's
  Mandate and Approval Bar.

---

*Source: technique names from the Refactoring.Guru techniques catalog
(https://refactoring.guru/refactoring/techniques), originating in Martin Fowler's*
Refactoring*. All mechanics and code are original TypeScript synthesis; no source
prose is reproduced.*

# Worked Examples — six refactors, end to end

These are the demonstration. Each one is a complete before→after refactor with a
single punchline: **the reachable-state count drops, and the compiler proves it.**

How to read each example: the **Smell(s)** name what's wrong (see
[`smell-catalog.md`](./smell-catalog.md)); **The move** names the refactoring
technique (see [`refactoring-mechanics.md`](./refactoring-mechanics.md)) and the
target shape (see [`paradigms-and-patterns.md`](./paradigms-and-patterns.md) or
the `dev:typescript` skill); the **State-space delta** is the load-bearing
line — it counts the states you collapsed and states what the type checker now
enforces. Every "after" block is written to pass `tsc --strict` with no `any`.

---

## 1. Flag/boolean soup → discriminated union

**Smell(s):** [Optional-property soup](./smell-catalog.md#25-optional-property-soup),
[Switch Statements](./smell-catalog.md#6-switch-statements) (the missing-model kind).
Three booleans plus two optionals encode one request state machine; nothing stops
`isLoading && isError`, and `data`/`error` can be present in the wrong phase.

**Before:**

```ts
interface RequestState<T> {
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  data?: T;
  error?: Error;
}

function render<T>(state: RequestState<T>): string {
  if (state.isLoading) return "Loading…";
  if (state.isError) return `Failed: ${state.error?.message ?? "unknown"}`;
  if (state.isSuccess) return `Got ${JSON.stringify(state.data)}`;
  return "Idle";
}

// Nothing stops these from being constructed:
const broken: RequestState<number> = {
  isIdle: false, isLoading: true, isSuccess: true, isError: false,
  data: 1, error: new Error("???"), // loading AND success AND has an error
};
```

**The move:** [Replace Type Code with a discriminated union](./refactoring-mechanics.md#replace-type-code-with-discriminated-union--exhaustive-switchnever):
the four booleans collapse into one `status` tag, and `data`/`error` move *inside*
the variant that owns them. Target shape: a tagged union with an exhaustive
`switch` guarded by a `never` assertion.

**After:**

```ts
type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

function assertNever(x: never): never {
  throw new Error(`Unhandled request state: ${JSON.stringify(x)}`);
}

function render<T>(state: RequestState<T>): string {
  switch (state.status) {
    case "idle":
      return "Idle";
    case "loading":
      return "Loading…";
    case "success":
      return `Got ${JSON.stringify(state.data)}`; // data is in scope, non-optional
    case "error":
      return `Failed: ${state.error.message}`; // error is in scope, non-optional
    default:
      return assertNever(state); // adding a 5th variant fails the build here
  }
}

// The broken object no longer type-checks — there is no such state to build.
```

**State-space delta:** the type previously admitted `2^4 = 16` boolean
combinations × the cross-product of two optionals (present/absent) ≈ **64 nominal
states**, of which only 4 are legal. After, exactly **4 states** exist, the
illegal combos (`loading + success`, `error` with no `Error`) are
*unrepresentable*, and `data`/`error` are reachable only in the variant that
defines them. The compiler now enforces both exhaustiveness (via `never`) and
field-presence-per-state — no `?.` defensive access survives.

**Why it's better:**
- The 15 impossible boolean combinations can't be constructed, so no code needs
  to defend against them.
- Adding a `"refreshing"` variant turns the `assertNever` line red until every
  consumer handles it — the compiler becomes your change checklist.
- `state.data` and `state.error` are non-optional inside their case; the `?.` and
  `?? "unknown"` ceremony is deleted, not relocated.

---

## 2. Primitive obsession → branded types

**Smell(s):** [Primitive Obsession](./smell-catalog.md#3-primitive-obsession),
[Data Clumps](./smell-catalog.md#5-data-clumps). Every id is a bare `string`, so
`userId` and `orderId` are the same type and freely swap at call sites — a bug
the compiler is blind to.

**Before:**

```ts
function getOrdersForUser(userId: string): Promise<Order[]> {
  return db.orders.where("ownerId", userId);
}

function cancelOrder(userId: string, orderId: string): Promise<void> {
  return db.orders.update(orderId, { canceledBy: userId });
}

declare const order: Order;
declare const session: { userId: string };

// Both compile. The second is a real bug: arguments are swapped.
await cancelOrder(session.userId, order.id);
await cancelOrder(order.id, session.userId); // ☠️ accepted by tsc
```

**The move:** [Introduce Branded Type](./refactoring-mechanics.md#introduce-branded-type)
(a form of Replace Data Value with Object, but here we keep the runtime value a
`string` and add a *compile-time* brand). Target shape: nominal/branded types
(see the `dev:typescript` skill) minted by one smart constructor per id — the
single place a raw `string` becomes a branded id, and the place to *validate* if
the source is untrusted.

**After:**

```ts
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

// One constructor per id — the single place a raw string becomes branded.
// The `as` cast is confined here; validate in this seam when the source is
// untrusted (e.g. `if (!isUuid(raw)) throw …`). These are trusted, so the
// confined cast is the whole constructor.
const UserId = (raw: string): UserId => raw as UserId;
const OrderId = (raw: string): OrderId => raw as OrderId;

function getOrdersForUser(userId: UserId): Promise<Order[]> {
  return db.orders.where("ownerId", userId);
}

function cancelOrder(userId: UserId, orderId: OrderId): Promise<void> {
  return db.orders.update(orderId, { canceledBy: userId });
}

declare const order: { id: OrderId };
declare const session: { userId: UserId };

await cancelOrder(session.userId, order.id); // ok
// await cancelOrder(order.id, session.userId); // ✗ OrderId is not assignable to UserId
```

**State-space delta:** before, `UserId` and `OrderId` shared one type, so the set
of *call shapes the compiler accepts* included every transposition — argument
order was an unguarded runtime invariant. After, `UserId` and `OrderId` are
disjoint types; the **two-way mixup states collapse to zero**, and the single
allowed conversion (raw `string` → branded id) lives only in the two smart
constructors. The brand is erased at runtime, so the safety costs nothing.

**Why it's better:**
- The swapped-argument bug becomes a compile error at the call site, not a
  production incident.
- "Where does an untrusted string turn into a real id?" has exactly two answers
  (`UserId`, `OrderId`) instead of "anywhere a `string` is passed."
- Zero runtime overhead — the `unique symbol` brand exists only in the type
  system; the value is still a plain `string`.

---

## 3. Long parameter list + boolean flags → options object + explicit functions

**Smell(s):** [Long Parameter List](./smell-catalog.md#4-long-parameter-list),
plus flag parameters that change *what the function does* (a function doing two
jobs behind a boolean). Positional `boolean`s at call sites are unreadable
(`true, false, true`) and silently swappable.

**Before:**

```ts
function exportReport(
  rows: Row[],
  format: string,
  includeHeader: boolean,
  compress: boolean,
  toEmail: boolean,
  recipient: string,
): Buffer | void {
  const body = format === "csv" ? toCsv(rows, includeHeader) : toJson(rows);
  const payload = compress ? gzip(body) : Buffer.from(body);
  if (toEmail) {
    mailer.send(recipient, payload); // recipient only meaningful when toEmail
    return;
  }
  return payload; // …but the return type lies when toEmail is true
}

// Call site: what do these booleans mean?
exportReport(rows, "csv", true, false, true, "ops@acme.io");
```

**The move:** [Introduce Parameter Object](./refactoring-mechanics.md#introduce-parameter-object--preserve-whole-object-options-object)
for the cohesive options, and
[Replace Parameter with Explicit Methods](./refactoring-mechanics.md#replace-parameter-with-explicit-methods-kill-boolean-flag-params)
for the `toEmail` flag that selects between two genuinely different operations
(one returns a `Buffer`, one sends and returns nothing). Target shape: a typed
options object plus two named functions with honest return types.

**After:**

```ts
type ReportFormat = "csv" | "json";

interface ReportOptions {
  format: ReportFormat;
  includeHeader?: boolean; // defaulted; only read for csv
  compress?: boolean;
}

function buildReport(rows: Row[], options: ReportOptions): Buffer {
  const { format, includeHeader = true, compress = false } = options;
  const body = format === "csv" ? toCsv(rows, includeHeader) : toJson(rows);
  return compress ? gzip(body) : Buffer.from(body);
}

function emailReport(rows: Row[], recipient: string, options: ReportOptions): void {
  mailer.send(recipient, buildReport(rows, options));
}

// Call sites now read themselves, and recipient is required exactly when it matters.
const csv = buildReport(rows, { format: "csv", compress: true });
emailReport(rows, "ops@acme.io", { format: "csv" });
```

**State-space delta:** the original signature accepted `string × 2³ booleans ×
string` arguments — including the **incoherent states** `toEmail: false` with a
non-empty `recipient` (ignored), and `toEmail: true` returning a `Buffer | void`
the caller had to narrow. Splitting on the real fork removes the `toEmail`
boolean entirely (2 states → 0) and gives each function a single honest return
type. `format` narrows from `string` (infinite) to a 2-member union. The
"recipient supplied but unused" and "Buffer returned but discarded" states
become unreachable.

**Why it's better:**
- `Buffer | void` is gone: `buildReport` always returns a `Buffer`, `emailReport`
  always returns `void`. Callers stop narrowing a union the API invented.
- `recipient` is a required parameter of `emailReport` only — you cannot call the
  email path without one, and you cannot pass one to the non-email path.
- Boolean-at-call-site (`true, false, true`) becomes self-documenting keys; adding
  an option doesn't reshuffle positional arguments.

---

## 4. God module → split by responsibility

**Smell(s):** [Large Class](./smell-catalog.md#2-large-class) /
[Divergent Change](./smell-catalog.md#10-divergent-change). One `user-service.ts`
does fetching, validation, formatting, and caching; four unrelated reasons to
change live in one file, and the export surface leaks internals.

**Before:**

```ts
// user-service.ts — one file, four jobs, everything exported
export const cache = new Map<string, User>();

export function isValidEmail(s: string): boolean {
  return /^[^@]+@[^@]+$/.test(s);
}

export function formatUser(u: User): string {
  return `${u.name} <${u.email}>`;
}

export async function getUser(id: string): Promise<User> {
  if (cache.has(id)) return cache.get(id)!; // non-null assertion smell
  const res = await fetch(`/api/users/${id}`);
  const raw = (await res.json()) as User; // unchecked cast at the boundary
  if (!isValidEmail(raw.email)) throw new Error("bad email");
  cache.set(id, raw);
  return raw;
}
```

Where the boundaries go is a domain question — defer that judgment to the
`cognition:domain-design` skill: cache is infrastructure, validation is a boundary
parse, formatting is presentation, fetching is the use case that composes them.

**The move:** [Extract Class → Extract Module](./refactoring-mechanics.md#extract-module-split-a-god-module)
(here Extract Function/Module, since these are free functions), splitting by axis
of change. Each module owns one job and exports only its public surface; the
internal `cache` and validator stop being part of the package's API. Target:
cohesive modules per the `dev:typescript` skill's module organization.

**After:**

```ts
// user-cache.ts — infrastructure; cache is private to this module
const store = new Map<string, User>();
export const getCached = (id: string): User | undefined => store.get(id);
export const putCached = (id: string, user: User): void => void store.set(id, user);

// user-parse.ts — the boundary parse; returns a typed User or throws once
export function parseUser(raw: unknown): User {
  const u = raw as Partial<User>;
  if (typeof u.email !== "string" || !/^[^@]+@[^@]+$/.test(u.email)) {
    throw new Error("invalid user payload");
  }
  return u as User;
}

// user-format.ts — presentation only
export const formatUser = (u: User): string => `${u.name} <${u.email}>`;

// user-service.ts — the use case; composes the others, exposes one verb
import { getCached, putCached } from "./user-cache";
import { parseUser } from "./user-parse";

export async function getUser(id: string): Promise<User> {
  const hit = getCached(id);
  if (hit) return hit; // no `!` — the type already says "or undefined"
  const user = parseUser(await (await fetch(`/api/users/${id}`)).json());
  putCached(id, user);
  return user;
}
```

**State-space delta:** the public surface shrank from **5 exports in 1 file**
(`cache`, `isValidEmail`, `formatUser`, `getUser`, and the mutable `Map` itself)
to **1 use-case export** (`getUser`) plus three internal modules that callers
don't import. The mutable `cache` is no longer a reachable state for the rest of
the app — it can't be cleared, mutated, or read out of band, because it isn't
exported. The `cache.get(id)!` non-null assertion is gone: `getCached` returns
`User | undefined` and the `if (hit)` narrows it, so the unsafe state ("assert
present when the Map says maybe") is deleted.

**Why it's better:**
- Each module has one reason to change: swap the cache, tighten validation,
  restyle formatting, or change the fetch — each edit is local to one file.
- The cache is encapsulated; the rest of the codebase can no longer reach into
  shared mutable state, so a whole class of "who cleared the cache?" bugs can't
  arise.
- The boundary cast (`as User`) is replaced by a single `parseUser` that *checks*
  before it trusts — unsafety is confined to one named function.

---

## 5. Class hierarchy → discriminated union + exhaustive dispatch

**Smell(s):** [Refused Bequest](./smell-catalog.md#8-refused-bequest) /
[Switch Statements](./smell-catalog.md#6-switch-statements) latent in a small
inheritance tree. The hierarchy buys nothing: each subclass is data + one
formula, and `abstract` only enforces that `area()` exists — nothing forces a new
shape to be handled wherever shapes are consumed.

**Before:**

```ts
abstract class Shape {
  abstract area(): number;
}

class Circle extends Shape {
  constructor(public readonly radius: number) { super(); }
  area(): number { return Math.PI * this.radius ** 2; }
}

class Rectangle extends Shape {
  constructor(public readonly w: number, public readonly h: number) { super(); }
  area(): number { return this.w * this.h; }
}

// Consumers must remember every subclass; nothing warns when Triangle is added.
function describe(shapes: Shape[]): string[] {
  return shapes.map((s) => {
    if (s instanceof Circle) return `circle r=${s.radius}`;
    if (s instanceof Rectangle) return `rect ${s.w}×${s.h}`;
    return "unknown shape"; // silent fallthrough — a new shape lands here
  });
}
```

**The move:** [collapse the hierarchy into a discriminated union](./paradigms-and-patterns.md#52-inheritance-hierarchy--discriminated-union--dispatch-function),
replacing polymorphic dispatch with a function over the union (or a
`Record<Kind, Fn>` lookup). Target shape: a discriminated union with
`never`-checked exhaustiveness — the exhaustiveness win the class tree could not
give you. See the
[functions-vs-classes decision procedure](./paradigms-and-patterns.md#2-the-functions-vs-classes-decision-procedure)
for when a class still earns its keep.

**After:**

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; w: number; h: number };

function assertNever(x: never): never {
  throw new Error(`Unhandled shape: ${JSON.stringify(x)}`);
}

// area lives in one place, exhaustively
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.w * shape.h;
    default:
      return assertNever(shape);
  }
}

function describe(shapes: Shape[]): string[] {
  return shapes.map((s) => {
    switch (s.kind) {
      case "circle":
        return `circle r=${s.radius}`;
      case "rectangle":
        return `rect ${s.w}×${s.h}`;
      default:
        return assertNever(s); // adding "triangle" fails the build until handled
    }
  });
}
```

**State-space delta:** the class version had the same 2 concrete shapes, but the
*consumer* state space included an unreachable-on-paper-yet-reachable-in-practice
"unknown shape" branch — the type system permitted a third subclass to flow
through `describe` and hit the silent fallthrough. After, `Shape` is a closed
2-member union, the silent default is replaced by `assertNever`, and adding a
`"triangle"` variant turns **every** non-exhaustive `switch` red. The set of
"shapes that compile but aren't handled everywhere" drops from *unbounded* to
**zero**.

**Why it's better:**
- Adding a shape is compiler-guided: the build lists every site that must handle
  it, instead of you hoping you found them all.
- No `instanceof` ladders, no `super()` ceremony, no `abstract` boilerplate —
  the data is plain and serializable (survives a `JSON.parse` round-trip, which
  `instanceof` would not).
- For a *closed* set of variants, exhaustiveness beats polymorphism: the
  open-for-extension property of inheritance was a liability here, not a feature.

---

## 6. LLM-slop file → cleaned

**Smell(s):** the generated-code cluster from
[`llm-slop-cleanup.md`](./llm-slop-cleanup.md): arbitrary filename
([§1](./llm-slop-cleanup.md#1-arbitrary-file--symbol-names)), one-implementation
interface + factory ([§3 premature abstraction](./llm-slop-cleanup.md#3-premature--speculative-abstraction)),
an `as any` ([§9 escape-hatch smuggling](./llm-slop-cleanup.md#9-escape-hatch-smuggling)),
a reimplemented helper ([§4](./llm-slop-cleanup.md#4-reimplementation-of-existing-repo-utilities)),
narration comments ([§7](./llm-slop-cleanup.md#7-narration-comments)), and a dead
export ([§6 dead scaffolding](./llm-slop-cleanup.md#6-dead-scaffolding--stubs)).

**Before:**

```ts
// utils2.ts
import { clamp } from "./math"; // the repo already has clamp

// Interface for the price calculator service
export interface IPriceCalculator {
  calculate(cents: number, discountPct: number): number;
}

// Factory function to create a price calculator
export function createPriceCalculator(): IPriceCalculator {
  // Return an object that implements the interface
  return {
    calculate(cents: number, discountPct: number): number {
      // Clamp the discount between 0 and 100
      const safePct = Math.min(100, Math.max(0, discountPct));
      // Apply the discount to the price
      const result = (cents * (100 - safePct)) / 100;
      // Round to the nearest integer and return
      return Math.round(result);
    },
  };
}

// Helper to format the price for display
export function formatPriceLabel(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Exported for future use
export const DEFAULT_CURRENCY = "USD";
```

**The move:** the [LLM-slop cleanup pass](./llm-slop-cleanup.md): rename the file
to its concept, [inline the one-impl interface + factory](./refactoring-mechanics.md#the-deletion-moves-inline-function-inline-class-collapse-hierarchy-remove-parameter)
into a plain function, replace the reimplemented clamp with the repo's existing
helper ([reuse, don't reimplement](./smell-catalog.md#14-duplicate-code)), delete
the `as any` and the narration comments, and drop the dead `DEFAULT_CURRENCY`
export (no call sites). Target: a small, honestly-named module of plain
functions.

**After:**

```ts
// pricing.ts
import { clamp } from "./math";

/** Apply a percentage discount to a cents amount, rounded to the nearest cent. */
export function applyDiscount(cents: number, discountPct: number): number {
  const pct = clamp(discountPct, 0, 100);
  return Math.round((cents * (100 - pct)) / 100);
}

export function formatPriceLabel(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
```

(The original `IPriceCalculator`/`createPriceCalculator` had a single
implementation and a single call site; collapsing the factory to `applyDiscount`
is the **Swap test** in action — the interface bought nothing.
There was also an `(config as any)` access in the unshown call site; it's deleted
because `applyDiscount` takes typed primitives directly.)

**State-space delta:** the export surface drops from **4 exports** (an interface,
a factory, a formatter, a dead constant) to **2** (`applyDiscount`,
`formatPriceLabel`). The one-implementation interface meant the factory could
*in principle* return any conforming object — an open set of implementations
nobody needed — now collapsed to exactly one named function. The `as any` is
removed, closing the hole through which arbitrarily-typed values re-entered.
Reusing `clamp` deletes a divergent second copy of the clamp logic (one source of
truth instead of two). Net: fewer concepts, one canonical clamp, zero escape
hatches.

**Why it's better:**
- The filename names the concept (`pricing.ts`), so the next reader finds it by
  grep instead of guessing what `utils2` holds.
- The interface+factory indirection is gone; the Swap test passes (a plain
  function is equivalent), so the abstraction wasn't earned.
- The narration comments ("Apply the discount", "Round and return") restated the
  code; the one surviving doc comment says *what the function guarantees*, which
  the code does not say for you.
- The dead `DEFAULT_CURRENCY` and the reimplemented clamp are deleted — less
  surface to keep in sync, one source of truth for clamping.

---

## The through-line

Every refactor above subtracted reachable states and handed the invariant to the
compiler: flag soup (64 → 4), interchangeable ids (mixups → 0), flag-driven dual
returns (`Buffer | void` → honest types), a god module's leaked surface (5 → 1),
an open class tree (unbounded unhandled shapes → 0), a slop file's speculative
surface (4 → 2). If your "after" doesn't lower that count — if it only moved the
mess to new files — it hasn't earned its diff. The state-collapse test and the
compiler-proof test in
[The Mandate](../SKILL.md#the-mandate--self-checks-on-your-own-output) are the
ones that catch a rearrangement masquerading as a refactor.

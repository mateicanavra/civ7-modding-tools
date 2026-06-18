# LLM-Slop Cleanup — the generated-code triage pass

Generated TypeScript fails in a *characteristic* way, and it is not the way
human code fails. Human code rots: it starts coherent and drifts under deadline
pressure, so its mess has history and intent buried in it. Generated code is
born incoherent. A model emits the *most plausible next token*, file by file,
with no standing model of your repo — so it produces code that **compiles, reads
fluently, and is locally reasonable everywhere while being globally wrong.** That
is the trap: nothing looks broken. `tsc --strict` is green. The tests it wrote
pass. And yet the change multiplied the reachable-state count, named three things
arbitrarily, abstracted a thing used once, and re-implemented a helper you
already ship.

This is why slop needs a *triage pass before refactoring*, not refactoring
itself. Refactoring (→ [`refactoring-mechanics.md`](./refactoring-mechanics.md))
assumes a coherent starting point you transform in behavior-preserving steps.
Slop has no coherent starting point. Triage **restores coherence** — deletes the
unearned, names by responsibility, reuses what exists, normalizes conventions —
so that the deeper state-space collapse has something real to work on. You are
not improving a design here; you are finding out whether there is one.

---

## The slop triage checklist

Run top to bottom. **Deletions come first** — every line you delete is a line
you do not have to name, type, reuse-check, or restructure. Restructuring a
file you are about to split in half is wasted work; deleting the dead half first
makes the split obvious. Order matters: do not skip ahead.

```
DELETE first — shrink the surface before you reason about it
[ ] 1. Dead scaffolding & stubs — TODO stubs, unused exports/params,
       commented-out alternates, stray console.log, empty catch.        → §6
[ ] 2. Narration comments — comments restating the next line.           → §7
[ ] 3. Defensive over-checking — redundant guards, re-validation of
       already-typed data, try/catch that swallows.                     → §8
[ ] 4. Premature / speculative abstraction — one-impl interfaces,
       factory-of-factory, generics with one instantiation, config
       objects no one varies. (Run the indirection audit, below.)       → §3
[ ] 5. Reimplementation of existing repo utilities — re-rolled
       debounce/clamp/group-by/Result. Find-and-reuse; delete the dupe. → §4

THEN restructure — what survives, made coherent
[ ] 6. Escape-hatch smuggling — as any / as unknown as / ! / @ts-ignore
       added to make generated code compile.                            → §9
[ ] 7. Cargo-culted patterns — XStrategy/getInstance/Visitor over an
       owned closed set. Collapse to function / module / DU+switch.     → §10
[ ] 8. Arbitrary file/symbol names — rename by responsibility; make
       file ↔ export coherent.                                          → §1
[ ] 9. Structureless mega-files — split by responsibility.              → §2
[ ] 10. Mixed conventions — type vs interface, default vs named export,
        error style, casing — normalize to the repo's choice.           → §5

VERIFY — the change is real, not cosmetic
[ ] 11. Run the indirection audit on every surviving layer.             → audit
[ ] 12. Confirm against "definition of de-slopped".                     → close
```

A note on order discipline: it is tempting to rename and re-section first because
it *feels* like progress. Resist it. You will rename symbols you are about to
delete and section files you are about to collapse. Delete, then reuse, then
name what remains.

---

## 1. Arbitrary file & symbol names

**Tell.** Names that encode authoring order or vague catch-all roles instead of
responsibility. The model needed *a* name and picked a filler.

```bash
# files named by version/sequence/vagueness, not by what they hold
git ls-files '*.ts' | grep -nEi '(utils?2?|helpers?|misc|common|shared|index[-_]?(new|2|copy)|[-_](v2|final|new|old|tmp|temp|backup))\.ts$'
# grab-bag suffixes on symbols
grep -rnE '\b(class|const|function|type|interface)\s+\w*(Manager|Helper|Processor|Handler|Util|Service|Data|Wrapper)\b' src
# vacuous local names
grep -rnE '\b(const|let)\s+(data|result|temp|obj|res|ret|val|item|thing|stuff)\b' src
```

**Why it's slop.** A name is a *promise about contents*. `userBalances.ts`
promises one thing; `utils2.ts` promises nothing and invites anything — so it
becomes a junk drawer (a Large Class / god module in disguise; see
[`smell-catalog.md`](./smell-catalog.md)). `Manager`/`Helper`/`Processor` are
not responsibilities, they are the absence of one: a `UserManager` that
validates, persists, *and* emails has three reasons to change wearing one name.
Vacuous locals (`data`, `result`, `temp`) force a re-derivation on every line,
and "stuttering" (`user.userId`) is the same failure at field level.

**Fix.** Name by *what it is responsible for*, then enforce **file ↔ export
coherence**: a file's name should match its primary export, and a module of
functions should be named for the concept they operate on
(`balances.ts` exports `computeBalance`, not `utils2.ts` exports `helper`). If
you cannot find a responsibility-name for a file, that is a finding — the file
has no single responsibility (→ §2). Rename through the language server / a
graph-safe tool so references move with the symbol, not a blind find-replace
that hits strings and comments — hand off mechanical repo-wide renames to
`gitnexus-refactoring`. This is the **naming-coherence test** from the Mandate;
for *what* coherent names look like in TS, defer to `dev:typescript`.

---

## 2. Structureless mega-files

**Tell.** One file, hundreds of lines, no internal sectioning, multiple
unrelated concerns interleaved — types, HTTP, validation, business rules, and a
React component all in `feature.ts`.

```bash
# files over the tripwire (~400 LOC), sorted worst-first
git ls-files '*.ts' '*.tsx' | xargs wc -l 2>/dev/null | sort -rn | awk '$1 > 400'
# concern density in one file: imports spanning unrelated layers
grep -nE "from '(react|express|fs|node:|\./db|zod)'" src/feature.ts
```

**Why it's slop.** The model has no spatial model of your repo, so it pours
everything into the file it was told to edit. A mega-file is a **Divergent
Change** magnet (refactoring.guru): touched for every reason, so unrelated
changes collide and the file becomes a merge-conflict zone. It is also the
readable proxy for an oversized state space — which is why Standard 1 puts a size
tripwire on it.

**Fix.** Split by **responsibility** — one reason to change per module. The cut
lines are the concern seams the grep above reveals: types to a `*.types.ts` or
domain module, IO to an adapter, pure logic to its own file. *Where* each split
piece should live, who owns it, and how to enforce the boundary is a
domain-design question, not a slop question — hand off to
`cognition:domain-design` for placement and `dev:typescript` for the
module-organization mechanics. Triage's job is only to recognize that the file
is doing N jobs and to make the seams visible; do the actual extraction with
Extract Module from [`refactoring-mechanics.md`](./refactoring-mechanics.md),
green after each move.

---

## 3. Premature / speculative abstraction

**Tell.** Indirection built for a second use case that never arrived. The
fingerprints:

```bash
# interfaces with exactly one implementation
grep -rnE '\binterface\s+I?[A-Z]\w+' src        # then check each for >1 `implements`/value
grep -rnE '\bimplements\s+\w+' src | sort | uniq -c | sort -n   # 1 ⇒ suspect
# factories that build factories / configs nobody varies
grep -rnE '\b(create|make|build)\w*Factory\b|Factory\w*Factory' src
# high-arity generics — count instantiations per param
grep -rnE '<\s*[A-Z]\w*\s*,\s*[A-Z]\w*\s*,\s*[A-Z]' src
```

```ts
// slop: an interface, a factory, and a generic — for ONE concrete path
interface IPaymentProcessor<TInput, TResult> {
  process(input: TInput): TResult;
}
class StripeProcessorFactory {
  static create(): IPaymentProcessor<Charge, Receipt> { return new StripeProcessor(); }
}
// the only call site, ever:
const receipt = StripeProcessorFactory.create().process(charge);
```

**Why it's slop.** This is **Speculative Generality** (refactoring.guru): YAGNI
flexibility you pay for *now* in indirection and never cash in. The model has
read ten thousand "enterprise" tutorials and reaches for the ceremony reflexively.
Each layer is a hop to trace and an extra reachable shape; an unused type
parameter is *dead code at the type level*.

**Fix.** Inline until there are **≥2 real call sites** (the Rule of Three's
floor; abstract on the third, not the first). Apply the **swap test** from the
Mandate: if the opposite choice — concrete instead of generic, function instead
of factory — gives an equivalent result, the abstraction is not earned. The
example above collapses to:

```ts
const receipt = processStripeCharge(charge);
```

Run the **indirection audit** (below) on every layer you are unsure about. For
the broader over-/under-engineering treatment and the GoF-pattern verdicts that
sit behind this, see
[`paradigms-and-patterns.md`](./paradigms-and-patterns.md).

---

## 4. Reimplementation of existing repo utilities

**Tell.** A freshly minted `debounce`, `clamp`, `groupBy`, `pick`, `omit`,
`sleep`, `isEmpty`, or a bespoke `Result`/`Either` type — when your repo (or a
dependency you already ship) has exactly that.

```bash
# did the model re-roll a utility you already have?
grep -rnE '\b(function|const)\s+(debounce|throttle|clamp|groupBy|pick|omit|chunk|uniq|sleep|delay|isEmpty|deepEqual)\b' src
# a second Result/Either type appearing
grep -rnE '\btype\s+(Result|Either|Option|Maybe)\b' src | sort | uniq -c
# then confirm what already exists before you delete the dupe:
grep -rnE 'export (function|const|type)\s+(groupBy|Result|clamp)\b' src node_modules/<your-utils-pkg>
```

**Why it's slop.** The model cannot see your repo's existing helpers, so it
rebuilds them — confidently and slightly differently. Now you have two
`groupBy`s with divergent edge cases and the **Duplicate Code** tax: every fix
applied in lockstep forever, the divergence a latent bug (refactoring.guru).
Worse, a parallel `Result` type fractures your error channel — half the code
can't compose with the other half.

**Fix.** **Find-and-reuse, then delete the dupe.** Search the repo and its
deps for the canonical implementation (use semantic/structural search — code-intel
`find_semantic_clones` / `hybrid_search`, or `grep` on the symbol; `jscpd` will
surface token-level twins). Re-point call sites at the existing helper, delete
the generated copy, and confirm green. This is the **reuse test** from the
Mandate. If the repo genuinely *lacks* the helper, that is a different finding —
add one canonical version in its owning module, don't leave the inline copy. See
**Duplicate Code** and **Alternative Classes with Different Interfaces** in
[`smell-catalog.md`](./smell-catalog.md).

---

## 5. Mixed conventions across generated files

**Tell.** Within a *single change*, the model picks different conventions in
different files — because each file was generated against the local context of
its own prompt window, not against the repo's house style.

```bash
# type vs interface — is the change consistent with the repo's dominant choice?
grep -rcE '^\s*interface ' src | awk -F: '$2>0'    # vs:
grep -rcE '^\s*(export )?type \w+ =' src | awk -F: '$2>0'
# default vs named exports mixed in new files
grep -rnE '^export default' src
# error styles: throw string vs throw Error vs Result, all in one change
grep -rnE 'throw (new )?(Error|"|`|'\'')' src
# casing drift in filenames
git ls-files '*.ts' | grep -E '[A-Z]' ; git ls-files '*.ts' | grep -E '-'
```

**Why it's slop.** Inconsistency is itself a cost: every convention switch is a
micro-decision the reader must notice and reconcile ("is this `type` alias
meaningful, or just a different file's mood?"). Mixed error channels are the
worst case — `throw` here, `Result` there, swallowed `catch` elsewhere — because
they don't compose and each call site must guess which discipline applies. This
is the slop version of *One Strategy Per Subsystem*.

**Fix.** Pick the **repo's** convention (the dominant one in the grep counts, or
the documented one), and **normalize the whole change to it** — not file by file,
the entire diff. Don't invent a new convention to "harmonize"; conform to what
exists. This is categorical: a mixed convention is a *class* of defect, so sweep
every file the change touched, not just the one you noticed. For *what* the right
convention is (when to prefer `type` vs `interface`, the error-channel decision),
defer to `dev:typescript`; triage only enforces *internal consistency*.

---

## 6. Dead scaffolding & stubs

**Tell.** The leftover apparatus of generation: stubs the model wrote "to be
filled in," alternates it kept "just in case," and debug output it forgot.

```bash
grep -rnE 'TODO|FIXME|XXX|placeholder|implement me|not implemented' src
grep -rnE 'console\.(log|debug|info|warn)' src
grep -rnE '^\s*//.*[;{}()]\s*$' src                 # commented-out code
grep -rnE 'catch\s*\([^)]*\)\s*\{\s*\}' src         # empty catch
# unused exports / params / files — the export-graph cases tooling must find:
npx knip            # unused files, exports, deps
npx ts-prune        # unused exports
# tsc: noUnusedLocals / noUnusedParameters catch the local cases
```

**Why it's slop.** Dead code is **Dispensable** (refactoring.guru): it bloats
the surface, misleads the next reader into thinking it matters, and inflates the
build/test footprint. A stubbed `function processRefund() { /* TODO */ }` that's
already exported and imported is a live lie; an empty `catch {}` is worse than
dead — an active bug that swallows failures silently (→ §8); generated
`console.log`s leak into production.

**Fix.** **Delete it.** Version control is your undo; you can always recover.
Unused exports/files → confirm with `knip`/`ts-prune` then remove; commented-out
alternates → delete (the model's other idea is not documentation); `console.log`
→ remove or route through the real logger; empty `catch` → either handle the
error or let it propagate, never swallow. For the safe mechanics of dead-code
removal (confirm-then-delete, watch for dynamic references the graph can't see),
see Remove Dead Code in
[`refactoring-mechanics.md`](./refactoring-mechanics.md) and **Dead Code** in
[`smell-catalog.md`](./smell-catalog.md).

---

## 7. Narration comments

**Tell.** Comments that restate the line below them, or play-by-play a sequence
the code already shows.

```bash
# step-narration and "what" comments (not "why")
grep -rnE '//\s*(now |then |first |next |loop (over|through)|iterate|create (a|the|new)|get the|set the|return the|check if)' src
```

```ts
// slop
// loop over the active users and sum their balances
let total = 0;                          // initialize total
for (const user of users) {             // for each user
  if (user.active) total += user.balance; // if active, add balance
}
```

**Why it's slop.** Narration comments are **Comments-as-deodorant**
(refactoring.guru): they compensate for code that should explain itself and drift
out of sync the moment the line below changes — a comment that lies is worse than
no comment. The model emits them because tutorials are full of them; they add
reading volume and zero information. In TypeScript the *type and the name* are
the primary documentation — a narration comment is usually a missing well-named
helper.

**Fix.** **Delete them; let names and types carry the meaning.** The example
collapses to a named function whose name *is* the comment:

```ts
const total = sumActiveBalances(users);
```

Keep the comments that earn their place: `// why:` rationale, non-obvious
algorithm notes, and tooling-read JSDoc (`@deprecated`, `@internal`). The test
is *what vs why* — cut every comment that says *what* the next line does; keep
the ones that say *why* it's there. See **Comments** in
[`smell-catalog.md`](./smell-catalog.md).

---

## 8. Defensive over-checking

**Tell.** Guards and re-validation for conditions the types already guarantee —
the model hedging because it has no proof the value is safe, even when the
compiler does.

```bash
# guards on values that are already non-optional in their type
grep -rnE 'if\s*\(!\w+\)\s*(return|throw)' src
# re-validating an already-typed param at the top of every function
grep -rnE 'typeof \w+ (!==|===) ('\''string'\''|'\''number'\''|'\''undefined'\'')' src
# try/catch wrapping pure, non-throwing code
grep -rnE 'try\s*\{' src
```

**These greps surface candidates, not verdicts.** Most `try`/`catch` and most
`if (!x)` guards are legitimate — a guard on data from a boundary (I/O, JSON,
user input, `any`/`unknown`) is load-bearing and must stay. Only delete a guard
when the value's *type* already excludes the state it checks. When in doubt, keep
it and parse once at the boundary instead.

```ts
// slop: user is already User (non-optional), id is already string
function greet(user: User) {
  if (!user) throw new Error("user required");        // can't happen — typed non-null
  if (typeof user.name !== "string") return "";        // name: string already
  return `Hello, ${user.name}`;
}
```

**Why it's slop.** Each redundant guard *re-admits a state the type already
excluded* — it tells the reader "this might be null" when it can't be, expanding
the apparent state space and contradicting the type. It's cargo-culted safety:
the model can't tell trusted-interior from untrusted-boundary, so it validates
everywhere. Worst is `try/catch` that swallows — it converts a typed failure
into a silent wrong answer.

**Fix.** **Trust the types; parse once at the boundary.** Inside the fortress —
code reachable only through a parsed boundary — the types are proof; delete the
interior guards. Do the validation *once*, at the edge, where `unknown` becomes a
real type (parse, don't validate). The example collapses to:

```ts
function greet(user: User) {
  return `Hello, ${user.name}`;
}
```

If a guard *is* load-bearing (the value genuinely arrives untyped), that's a
boundary that wants a parser, not a scattering of `if`s. The full
parse-at-boundary discipline belongs to `dev:typescript`; triage's job is to
delete interior re-checking. Defensive `!` and `as` are the same instinct — §9.

---

## 9. Escape-hatch smuggling

**Tell.** `as any`, `as unknown as`, `!`, `@ts-ignore`, `@ts-expect-error`, and
`Record<string, any>` sprinkled to make generated code *compile* — the model
hitting a type error and reaching for the silencer instead of the fix.

```bash
# the global escape-hatch census — track this number; it should fall, never rise
grep -rnE 'as any|as unknown as|@ts-(ignore|expect-error)|\bany\b|Record<string,\s*any>|\w+!' src | wc -l
grep -rnE 'as any|as unknown as' src
grep -rnE '@ts-(ignore|expect-error)' src
grep -rnE '!\.' src        # non-null assertions on property access
```

```ts
// slop: silence the checker rather than model the data
const config = JSON.parse(raw) as any;            // now everything downstream is unsound
const port = (config as any).server!.port as number;
```

**Why it's slop.** Every escape hatch **re-admits exactly the states the type was
collapsing** (Standard 2). `as any` doesn't make the value safe — it makes the
*compiler stop telling you it isn't*, so the unsafety propagates invisibly to
every downstream read. `!` asserts "trust me, not null" with no proof; the next
refactor makes it a runtime crash. These are the master signal of generated
code that was *forced* to compile rather than *designed* to.

**Fix.** **Parse at the boundary; remove the hatch.** Where untyped data enters
(`JSON.parse`, `fetch`, env, FFI), run it through a real parser so it leaves the
boundary as a sound type — then the interior needs no `as`:

```ts
const config = ConfigSchema.parse(JSON.parse(raw)); // unknown → Config, validated
const port = config.server.port;                     // sound, no hatch
```

A hatch that *cannot* be removed needs a written justification at the call site
(Standard 2) and should be isolated to one typed boundary, never scattered. The
escape-hatch census above is your scorecard — a de-slopped change *lowers* it.
For TS-native escape-hatch smells (the `as` chain, `!` overuse, index-signature
`any`) and their detection thresholds, see
[`smell-catalog.md`](./smell-catalog.md); for the parse-at-boundary pattern
itself, defer to `dev:typescript`.

---

## 10. Cargo-culted patterns

**Tell.** GoF pattern *machinery* applied where a language feature already does
the job — the model reproducing the class skeletons from its training data.

```bash
grep -rnE 'class\s+\w+Strategy\b|interface\s+\w*Strategy\b|implements\s+\w*Strategy' src
grep -rnE 'getInstance\b|private\s+static\s+instance' src         # Singleton
grep -rnE 'class\s+\w+(Factory|Manager|Mediator|Coordinator)\b' src
grep -rnE 'accept\(.*[Vv]isitor|interface\s+\w*Visitor' src       # Visitor
grep -rnE '\bhasNext\b|\bnext\(\)\s*:' src                        # hand-rolled Iterator
```

```ts
// slop: a Strategy interface + one-method classes to pick between two functions
interface DiscountStrategy { apply(price: number): number; }
class TenPercent implements DiscountStrategy { apply(p: number) { return p * 0.9; } }
class NoDiscount  implements DiscountStrategy { apply(p: number) { return p; } }
```

**Why it's slop.** This is the **"kludge for a weak language"** criticism, made
concrete (refactoring.guru, *Criticism of patterns*; Paul Graham via RG): GoF
patterns largely exist to fake first-class functions, closures, modules, and
sum types in languages that lack them. TypeScript has all four. A `Strategy`
interface + one-method classes is *a function* wearing five files of ceremony;
`getInstance()` is *a module export* in a costume; a `Visitor` + `accept()` over
a set you own is *a discriminated union + a `switch`* with worse ergonomics and
no exhaustiveness. The pattern's **name** survives as vocabulary; its **class
machinery** should not.

**Fix.** Collapse to the language feature — the cargo-cult tells and their
one-line fixes (refactoring.guru r4c §6.5):

| Generated machinery | Collapse to |
| --- | --- |
| `class XStrategy implements Strategy` | a function / `Record<K, Fn>` |
| `class XFactory` wrapping one `switch` | a factory function |
| `class XManager` / `XMediator` coordinating two things | direct calls or a store |
| `getInstance()` singleton | a module export (inject for testability) |
| hand-rolled `hasNext()/next()` | a generator / `for…of` |
| `Subject`/`Observer` interface pair | `EventTarget` or a typed emitter |
| `Visitor` + `accept()` over an owned closed set | a DU + `switch` (+ `assertNever`) |
| `AbstractBaseX` hosting one template method | a higher-order function |

The Strategy example collapses to:

```ts
const discounts = { ten: (p: number) => p * 0.9, none: (p: number) => p };
const price = discounts[kind](base);
```

The decision rule — *which* collapse target a pattern has, and the rare cases
where the full pattern is genuinely earned (a measured variant matrix, two
independently-growing axes, an open foreign hierarchy) — lives in
[`paradigms-and-patterns.md`](./paradigms-and-patterns.md). Triage only spots
the reflex and collapses the obvious cases.

---

## The indirection audit

Premature abstraction (§3) and cargo-cult (§10) both leave *layers*. The audit
is the procedure that decides, per layer, whether it earns its existence. Run it
on every wrapper, interface, factory, adapter, base class, barrel re-export, and
"service" the generated code introduced.

For each layer, in order:

1. **Name the force it claims to serve.** A layer must name a *present* reason:
   a varying axis, a stable boundary worth enforcing, a coupling it breaks. Say
   it out loud. "This `IFooRepository` interface exists because…" — if the
   sentence ends in "…we might swap the DB someday," that's speculative, not
   present.
2. **Count the real call sites / implementations.** One implementation behind an
   interface ⇒ the interface is decoration. One caller through a wrapper ⇒ the
   wrapper is a hop. `grep` the symbol; count.
3. **Run the swap test.** Would inlining the layer — replacing the interface with
   its single concrete type, the factory with a direct call, the wrapper with its
   target — produce equivalent behavior with fewer concepts? If yes, the layer is
   not earned.
4. **Ask the deletion question:** *"Delete this and lose nothing?"* If the only
   loss is "flexibility we don't use yet," delete it. The Rule of Three is the
   bar: abstraction is earned at the *third* real instance, not the first.
5. **If it survives, write down why** — one line, at the layer, naming the force
   from step 1. A layer worth keeping is worth justifying.

```bash
# audit fuel: interfaces with one implementor, factories, thin wrappers
grep -rnE 'implements\s+\w+' src | sed -E 's/.*implements\s+(\w+).*/\1/' | sort | uniq -c | sort -n
grep -rnE '\b(make|create|build)\w+\b' src        # candidate factories — count call sites each
```

The audit is just the **swap test** and the **deletion test** from the Mandate,
applied mechanically to every layer. Most generated indirection fails step 2.

---

## Under-engineering tells (the opposite failure)

Slop is usually over-built, but the same model under-builds where types are
hard. These are the inverse findings — push *toward* types, not away from
structure:

- **Stringly-typed everything.** `status: string`, `kind: string`, mode flags as
  free strings. → a union (`status: "active" | "suspended" | "closed"`); a repeated
  branch on a string is a missing discriminated union.
  `grep -rnE ':\s*string\b' src` density on domain fields.
- **No boundary parsing.** `JSON.parse(...) as Foo`, `fetch` results read
  directly, env vars used raw. → parse once at the boundary into a sound type
  (this is the cure for §8/§9 both). `grep -rnE 'JSON\.parse|process\.env\.' src`.
- **Copy-paste instead of a shared function.** The same fetch-wrap / try-catch /
  mapper inlined in every handler. → extract one function (this is §4 from the
  other direction — the model duplicated instead of reusing *or* abstracting).
  `jscpd` flags it.
- **Everything `any` (or implicit `any`).** Untyped params, `any[]`,
  `Record<string, any>` as a "flexible" shape. → model the actual shape; `any`
  is the absence of a type, not a type. `grep -rnE '\bany\b' src | wc -l`.

The throughline: under-engineered slop has a *small text* but a *large state
space* — `string` admits infinitely more states than a three-member union. **Push
the invariant into the types** so the compiler shrinks the state space for you.
For the target shapes (unions, brands, parse-at-boundary), defer to
`dev:typescript`; for the smells themselves (Primitive Obsession, etc.), see
[`smell-catalog.md`](./smell-catalog.md).

---

## Definition of de-slopped

The triage pass is done when the change clears every line. This is the slop
analog of the skill's Approval Bar — not "behavior is correct" (it was, the
whole time; that's the trap) but **"the code is now coherent."**

- [ ] **Coherent names** — every file and symbol named by responsibility; no
  `utils2`/`Manager`/`data`; file name ↔ primary export agree.
- [ ] **No dead code** — no stubs, unused exports/params, commented-out
  alternates, stray `console.log`, or empty `catch`; `knip`/`ts-prune` clean.
- [ ] **No narration comments** — comments explain *why*, never *what*.
- [ ] **No unearned abstraction** — every surviving layer passed the indirection
  audit; nothing abstracted below ≥2 real call sites; no cargo-culted pattern
  machinery.
- [ ] **No reimplementation** — every re-rolled helper/`Result` replaced with the
  repo's canonical one; the dupe deleted.
- [ ] **Consistent conventions** — `type`/`interface`, exports, error channel,
  and casing normalized to the repo's choice across the *whole* change.
- [ ] **No escape hatches** — no `as any`/`as unknown as`/`!`/`@ts-ignore` added;
  the escape-hatch census is lower than before, not higher; unsafety lives at one
  typed boundary with a written reason.
- [ ] **State space reduced** — defensive over-checking removed, stringly-typed
  fields pushed to unions, illegal states made unrepresentable where they
  appeared. The reachable-state count *dropped*.

When all eight hold, the generated code has a real design to refactor. *Now* open
[`refactoring-mechanics.md`](./refactoring-mechanics.md) and collapse the state
space further; or, if you want to see a full slop file cleaned end to end, the
LLM-slop case in [`worked-examples.md`](./worked-examples.md). De-slopping is not
the refactor — it is the precondition that makes the refactor honest.

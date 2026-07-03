# Habitat Restack — Semantic Resolution Handoff (mapgen-studio decomposition stack)

**Status:** ready for the Habitat conflict-resolver
**Author lane:** studio-shell decomposition (`fix/react-sonner-theme-store` @ `aa389e317`)
**Consumer:** whoever (human or agent) restacks the **Habitat Toolkit** stack
(`codex/habitat-niche-lane-method-frame` @ `3ca96cee6`) onto a `main` that has
already absorbed this studio stack.

---

## 0. Why this document exists

A restack tool resolves **text**. It cannot see **intent**. This stack's
changes have two failure surfaces that a raw-diff merge will not protect:

1. **One camouflaged silent-drop** in a file Git *will* flag as a conflict — but
   where the natural ("take Habitat's side") resolution is **correct for every
   line except one**, and dropping that one line produces **zero red signal**
   (no failing test, no CI red). Git raises the conflict; mis-resolving it is
   invisible.
2. **~64 files Git will NOT flag at all** (Habitat never touches them) whose
   *behavior* is nonetheless fragile: a regeneration, an auto-format, or a
   well-meaning "this host glue looks dead, fold it into the hook" cleanup
   silently breaks a load-bearing ordering / synchronicity / identity contract.
   These are not merge actions — they are **"do not "clean up" these"** notes.

This doc transfers the **WHY** so you preserve semantic intent, not diff lines.

**Refs used throughout** (all in the one shared repo):
- `STUDIO_BASE` = `5aa6ccf7c` (current `main`; this stack's merge target)
- `STUDIO_TIP` = `fix/react-sonner-theme-store` (`aa389e317`)
- `HABITAT_BASE` = `921075e9c` (Habitat's merge-base; pre-design-sync)
- `HABITAT_TIP` = `codex/habitat-niche-lane-method-frame` (`3ca96cee6`)

---

## 1. TL;DR — the 30-second version

- **Raw file intersection of the two stacks = exactly 3 files:**
  `apps/mapgen-studio/package.json`, root `package.json`, `bun.lock`.
  The other **~64 studio files land on paths Habitat never touches, renames, or
  deletes** (rename-aware sweep = zero content collisions).
- **The ONE thing you must do by hand:** in the
  `apps/mapgen-studio/package.json` **`scripts`** conflict, resolve toward
  Habitat's gutted block, **then manually re-insert exactly this line:**

  ```json
  "lint:react-compiler": "node scripts/lint-react-compiler.mjs"
  ```

  Every *other* studio-side script in that hunk (`dev`, `build`, `check`,
  `test`, `build:vite`, `check:worker-bundle`) is **correctly** superseded by
  Habitat's new Nx `project.json` — let them go. Only `lint:react-compiler` has
  no Nx home and must survive.
- **root `package.json` and `bun.lock`:** auto-merge / regenerate. Do a **real
  3-way merge** of root `package.json` (not "take Habitat whole-file"), and
  **`bun install` to regenerate `bun.lock` AFTER both package.jsons are
  resolved** — never hand-merge the lock.
- **Two worries you can drop:** the three jsdom test devDeps are **not** at risk
  (clean-merge region), and **`biome.json` has no collision** (Habitat doesn't
  touch it; the `agent-F` biome branch is its *origin*, already in main — not a
  rival). See §5.
- **The unflagged semantic layer (§4):** if your restack regenerates or
  "tidies" `StudioShell.tsx` or the extracted hooks, honor the §5 ordered hook
  init, the §7.6 **synchronous** host memos (one is security-adjacent), and the
  `useStudioEvents` stream policy. Git won't warn you here.

---

## 2. The file intersection — verdict per file

| File | Both stacks edit? | Git signal | Action |
|---|---|---|---|
| `apps/mapgen-studio/package.json` | **Yes** | **Real conflict** (scripts block) | Resolve toward Habitat; **re-add the one `lint:react-compiler` line**. Keep the 3 jsdom devDeps (clean sub-region). §3 |
| root `package.json` | Yes (disjoint hunks) | Clean 3-way (no markers) | Real 3-way merge. Verify `eslint-plugin-react-hooks@7.1.1` AND Habitat's `patchedDependencies` both present. §5.1 |
| `bun.lock` | Yes (churn) | Conflict = noise | Discard conflicted state, `bun install` **after** both package.jsons resolved. §5.2 |
| ~64 other studio files | **No** (Habitat-untouched) | None | Land as pure additions/edits. **But** see §4 — intent is fragile to regeneration/cleanup. |

That's the whole merge surface. Everything below explains the *why* so you
resolve each correctly.

---

## 3. THE conflict: `apps/mapgen-studio/package.json` `scripts` block

This is the single genuine, high-stealth hazard. Verified by `git merge-file`
simulation (exit=1, one conflict hunk localized to the `scripts` object).

### 3.1 The three sides

```
base (5aa6ccf7c)     ours (Habitat tip)        theirs (this stack)
-----------------    --------------------       -------------------
dev                  serve                      dev
dev:frontend         gen:civ7-tables            dev:frontend
dev:server           ensure:studio-recipe-...   dev:server
serve                preview                    serve
gen:civ7-tables                                 gen:civ7-tables
check:worker-bundle                             check:worker-bundle
check                                           check
test                                            lint:react-compiler   ← NET-NEW (mine)
build                                           test
preview                                         build
build:vite                                      preview
                                                build:vite
```

### 3.2 What's actually happening (the intent on each side)

- **Habitat's side is a deliberate regime change, not a deletion.** Habitat is
  **Nx-projectizing** the studio: `dev`, `serve-daemon`, `build`, `check`,
  `test`, `build:vite` are redefined as command-targets in a **new
  `apps/mapgen-studio/project.json`** and invoked via `nx run mapgen-studio:<target>`.
  The package.json `scripts` block is intentionally slimmed to
  `{serve, gen:civ7-tables, ensure:studio-recipe-artifacts, preview}`, and the
  inline `nx:{targets}` block is removed. `check:worker-bundle` is gone because
  its script file is relocated to the `.habitat/` blueprint tree (rename R086)
  and run by the habitat runner, not Nx build. **All of this is correct — keep
  it.**
- **My side added exactly ONE net-new line:** `lint:react-compiler`. The other
  studio-side lines (`check`, `test`, `build`, `build:vite`, `check:worker-bundle`)
  are just the *base* scripts that my stack happened to carry forward unchanged —
  Habitat is legitimately superseding them with Nx targets.

### 3.3 The trap

`lint:react-compiler` sits **buried in the middle of a block whose other six
lines Habitat legitimately wants gone.** So "take Habitat's gutted scripts" — the
natural call — is right for everything *except* that one line, which it silently
swallows. And the drop is **invisible**: `lint:react-compiler` is wired into
**nothing** — not husky, not nx, not the `ci`/`check`/`lint` aggregates (verified
by `git grep`: referenced only in its own definition + the script's header). So
dropping it **turns no test red.** Git flags the conflict; mis-resolving leaves
no trace. Highest-stealth drop in the entire change-set.

### 3.4 Correct resolution

1. Resolve the `scripts` hunk **toward Habitat's side** (its Nx-projectization is
   intended).
2. **Manually re-insert exactly one line** into the slimmed scripts block:
   ```json
   "lint:react-compiler": "node scripts/lint-react-compiler.mjs"
   ```
3. Do **not** restore `check` / `test` / `build` / `build:vite` /
   `check:worker-bundle` — those are correctly replaced by `project.json`.
4. The referenced file `apps/mapgen-studio/scripts/lint-react-compiler.mjs` is a
   **clean new addition** in a dir Habitat keeps — it survives on disk untouched.

### 3.5 What `lint:react-compiler` is (so you know it's worth saving, and why it stays a bare script)

It is an **advisory, on-demand** React-Compiler / Rules-of-React diagnostic. It
runs the official `eslint-plugin-react-hooks` v7 family (purity, set-state-in-
render, ref-stability, manual-memoization) that **Biome has no equivalent for**
and GritQL can't express. It deliberately adds **no** `eslint.config` to the tree
(inline config + `overrideConfigFile:true`) and drops rules-of-hooks /
exhaustive-deps because Biome owns those.

**Regime-orphaning note (intended, not a bug):** even correctly re-added, this
script has **no Nx home** — Habitat's `project.json` has no `lint` target, so
`nx run-many --targets=lint` will not pick it up. **That is fine and matches its
design:** React Compiler is *not* wired into this app's build (see the bail
comment at `apps/mapgen-studio/src/app/hooks/useVizSelection.ts:207`), so the
diagnostic is meant to be invoked manually via
`bun run lint:react-compiler` from `apps/mapgen-studio`. **Do not** over-couple it
into an Nx lint target to "fix" the orphaning. (If Habitat later grows a
mapgen-studio `lint` target, that is its natural future home — optional, not
required for parity. Tracked checkback for a Biome-native equivalent:
biomejs/biome#10710.)

### 3.6 Regression signal

`bun run lint:react-compiler` (from `apps/mapgen-studio`) → "script not found".
No automated signal otherwise — the only symptom is the silent disappearance of
the manual diagnostic and an orphaned `.mjs` file. **This is why it's in this
doc:** nothing else will tell you.

---

## 4. The UNFLAGGED layer — intent that survives text but dies to "cleanup"

Habitat touches **none** of the files below. They merge as pure additions. The
risk is **not** a merge marker — it's that a regeneration, reformat, or
well-intentioned refactor during the restack silently breaks a contract. **If
your restack does not regenerate `StudioShell.tsx` or the hooks, you can skip
this section — it's an insurance policy.** Tiered by blast radius.

### 4.1 🔴 HIGH — `StudioShell.tsx` §5 ordered hook-init contract

`StudioShell.tsx` (2552→1033 lines) decomposes into a **fixed-order chain of 14
hooks**. The order is **load-bearing** and self-documented in the host's inline
**§5** comments. Canonical order:

`useStudioOperations` (FIRST — owns op state + busy booleans + error channel) →
`useViewportLayout` → browser/viz cluster → `usePresetLifecycle` →
`useSaveDeploy` → `useLiveRuntime` → `runInGameMaterializationMode` memo →
`useRunInGame` → §7.6 cycle-break memos → `useSetupControls` (LAST) → **single
mount-time operation-adoption `useEffect`** → `useStudioEvents` →
`useKeyboardShortcuts`.

**Why:** `useSaveDeploy` + `useLiveRuntime` must initialize **before** the
adoption effect so their setters exist when a daemon-adopted terminal op resolves
a pending waiter. `useRunInGame` comes **after** both because adoption needs both
op setters and its sync-back reads live-runtime outputs. `useSetupControls` is
**last** because its autoplay toggle reads live `liveRuntime.autoplayActive` +
`setLiveRuntime`.

**What breaks it (no marker):** reordering the calls, or hoisting/sinking one
across the adoption effect → pending save/deploy waiters that never resolve,
run-in-game adoption reading `undefined` setters, autoplay reading a stale
runtime. **The adoption `useEffect` deps are intentionally `[markRunInGameToastHandled]`
(effectively run-once)** — adding a "missing" dep makes it re-run on every status
change.

**Carry-forward:** treat the inline §5 / §7.6 comments as **normative spec**.
Preserve the 14-call relative order and the single adoption effect's position
(between `useSetupControls` and `useStudioEvents`).
**Regression signal:** save/deploy or run-in-game toast never fires (or
double-fires); daemon-completed op not re-adopted on reload; React "rendered
more/fewer hooks than previous render" if a conditional creeps in.

### 4.2 🔴 HIGH — §7.6 host-side cycle-break memos stay SYNCHRONOUS (one is security-adjacent)

Four derivations live in **host render scope** on purpose — they span outputs of
two hooks, so folding either into a hook re-creates a cycle:
`runInGameMaterializationMode`, `liveGameStudioRelation`,
`studioMatchesProvedLiveSource`, `displayedPresetOptions`.

**`runInGameMaterializationMode` is SECURITY-ADJACENT.** It decides whether
Run-in-Game writes config to a **durable on-disk map script** vs a **disposable**
one. It is computed synchronously via `useMemo` **precisely so an effect can't
lag a render** and let an edited config inherit a stale "durable" verdict —
deploying unintended bytes to disk.

**What breaks it (no marker):** folding `runInGameMaterializationMode` into an
effect or into `useRunInGame` → the stale-durable-verdict bug (wrong bytes
written to the on-disk map script), invisible until a live deploy. The other
three drive truthful preset-dropdown labels and the GameConsole
current/stale/sync affordance.

**Carry-forward:** keep all four memos in host render scope, `useMemo`,
synchronous. Thread `runInGameMaterializationMode` + `provedRunInGameSource`
**into** `useRunInGame` as args — do not let the hook re-derive them. **Never
convert to effects.**

### 4.3 🔴 HIGH — `useStudioEvents` stream-persistence + retry policy

`useStudioEvents` is the live counterpart to the mount-time adoption effect: the
daemon **pushes** operation / live-game / error events and the host stays in
lockstep. Deliberate constants:
`STUDIO_EVENT_STREAM_RETRY_ATTEMPTS = Infinity` (the stream must never give up; a
dropped connection is a recoverable banner, not a torn subscription), plus the
live-query pins `retry:false`, `refetchOnWindowFocus:false`, `staleTime:Infinity`,
`gcTime:0` (drops the snapshot on unmount so a stale event can't replay on
remount). Op-status reads go through `useLatestRef` so the hello/re-adopt effect
reads latest op state **without** depending on (and re-running for) every status
change.

**What breaks it (no marker):** "fixing" retry to a finite number, flipping
`refetchOnWindowFocus`, or setting `gcTime>0` → silently degrades reconnection /
replays stale events. **Carry-forward:** preserve all five values and the
`useLatestRef` mirrors. **Regression signal:** event stream stops reconnecting
after a daemon restart; stale op event replays on refocus/remount; duplicate
run-in-game toasts (the dedupe seam via `markRunInGameToastHandled` is broken).

### 4.4 🟠 MEDIUM — `useStudioOperations` synchronous busy-boolean threading

`runInGameRunning` / `saveDeployRunning` are derived **synchronously as plain
render-scope consts** in `useStudioOperations` and threaded **down** into
`useBrowserRun` / `useSaveDeploy` / `useRunInGame` / `useSetupControls` — never
re-derived per-hook, never republished via `useState`+`useEffect`. A republish
would **lag one render** and let a second operation race through the busy gate.
`error`/`status` are deliberately **not** derived here (they also depend on
`browserRunner.state`, owned by `useBrowserRun`, which would reintroduce the very
ordering dependency this layer removes).

**What breaks it (no marker):** a resolver consolidating "duplicate" busy logic
into each consumer, or moving the derivation into an effect → reopens the race.
**Carry-forward:** keep busy booleans produced once and passed as args; keep the
`error`/`status` composite in the host **after** both `useStudioOperations` and
`useBrowserRun` run.

### 4.5 🟠 MEDIUM — new exported pure helpers with PRODUCTION consumers

Three extracted helpers are imported by **production** hook code (not just tests),
so a botched carry breaks a type/import **loudly** — except one subtle identity
contract:

- `prunePipelineExpandedStageIds` (`features/recipeDag/prunePipelineExpansion.ts`,
  consumed by `useViewportLayout`) — **returns the SAME `Set` reference when
  nothing is dropped** so a setter updater bails out of re-render. A resolver who
  keeps the export but "simplifies" it to always allocate a new `Set` silently
  **reopens a render loop**. Preserve the same-reference-when-unchanged contract
  verbatim.
- `isSaveDeployTerminal` + `saveDeployResultFromTerminalStatus`
  (`features/mapConfigSave/status.ts`, 4 call sites in `useSaveDeploy`).
- `useLatestRef` (`app/hooks/useLatestRef.ts`) — the single render-phase
  ref-mirror primitive; 4 consumers (`useStudioOperations`, `useStudioEvents`,
  `useKeyboardShortcuts`, `StudioShell`). Keep it as the one such primitive.

### 4.6 🟠 MEDIUM — `SchemaConfigForm` hooks hoisted above the early return

`SchemaConfigForm.tsx` moves `uiSchema` / `formContext` memos **above** the
`!resolved` early-return (with null-safe inputs), fixing a real **"rendered more
hooks than during previous render"** crash on the `null→resolved` schema
transition. A resolver who re-introduces an early return before those memos
reopens that crash. (Three sibling components — `ExplorePanel`, `RecipePanel`,
`PresetDialogs` — use the same store-prev-value-during-render pattern to replace
set-state-in-effect; keep them.)

### 4.7 🟡 LOW (textual) — `sonner.tsx` exports + `biome.json` warn-handshake

- **`sonner.tsx`** was rewritten to `useSyncExternalStore` (module-scoped
  `subscribeToThemeClass` / `getThemeSnapshot` / `getThemeServerSnapshot`).
  `useThemeFromClass` is **now exported** (previously local) so
  `test/ui/sonnerTheme.test.tsx` can `renderHook` it. Keep **both** named exports
  (`Toaster`, `useThemeFromClass`) and keep `subscribeToThemeClass`
  **module-scoped** (inlining it into the hook re-subscribes every render). Only a
  file *regeneration* could drop the export; Habitat doesn't touch the file.
- **`biome.json`** adds three correctness rules: `useExhaustiveDependencies:"warn"`,
  `useHookAtTopLevel:"error"`, `useJsxKeyInIterable:"error"`. The **`"warn"` is
  deliberate** — ~20 dependency arrays were preserved **byte-for-byte** for
  decomposition parity, so promoting exhaustive-deps to `"error"` would light them
  all up as false-positive CI errors. This is a **semantic handshake**: any future
  fold into `recommended:true` (or warn→error) must first consciously audit those
  ~20 arrays. See §5.3 for why this is **not** a merge collision.

---

## 5. Worries you can DROP (verified non-risks — don't waste effort here)

The mappers explicitly disproved two over-broad concerns and confirmed two clean
files. Recorded so you don't burn cycles re-litigating them.

### 5.1 root `package.json` — clean 3-way (just don't go whole-file)
Both stacks edit it in **disjoint** hunks: mine adds one line
(`eslint-plugin-react-hooks@7.1.1` in devDeps, ~line 116); Habitat rewrites the
scripts block (→ `nx run-many` dispatchers) and adds a `patchedDependencies` block
(`effect-orpc@0.5.0`). `git merge-file` exits **0**, no markers; both survive.
**Only risk:** a lazy "accept Habitat whole-file" drops my one line (low blast
radius — Biome carries the React rules natively, not via this plugin). **Do a real
3-way merge**, then confirm both `eslint-plugin-react-hooks` and
`patchedDependencies` are present.

### 5.2 `bun.lock` — regenerate, never hand-merge
Both stacks churn it (mine: testing-library/jsdom/sonner; Habitat: effect-orpc
patch + tooling). It's a generated `lockfileVersion 1` artifact. On any conflict:
take either side (or delete), then **`bun install` at repo root AFTER both
package.jsons are resolved** (resolving the lock against an unresolved
package.json re-introduces drift).

### 5.3 the three jsdom devDeps and `biome.json` are NOT at risk
- **`@testing-library/dom@10.4.1`, `@testing-library/react@16.3.2`,
  `jsdom@29.1.1`** (app devDeps): Habitat's devDependencies block is
  **byte-identical to base** (Habitat made zero devDep edits), so in the 3-way
  these land in a region where `ours==base` and Git takes **my** side with **no
  marker**. They are safe **unless you hand-delete them while resolving the
  separate `scripts` conflict in the same file** — don't. (If ever dropped, they
  fail **loudly**: every `.test.tsx` errors at import — unlike the silent
  `lint:react-compiler` drop.) Run `bun install` after.
- **`biome.json`:** Habitat's tip **does not touch it** (empty diff). The
  `agent-F-habitat-biome-hygiene` branch flagged as a possible rival is actually
  the **historical origin** of `biome.json` — its blob hash equals my **base**
  `biome.json` blob, already in `main` at `5aa6ccf7c`. It's the predecessor, not a
  future overwrite. My three React rules survive **verbatim**, zero merge hazard.
  (The §4.7 warn-handshake is a *narrative* note for future biome work, not a
  restack action.)

---

## 6. Open questions / assumptions for the integrator

1. **`lint:react-compiler` enforcement tier — decided: keep it a bare script.**
   Re-add it to the slimmed package.json `scripts` block (§3.4). Do **not** wire
   it into an Nx `lint` target; that over-couples an intentionally-advisory
   diagnostic. (Optional future home only if Habitat grows a mapgen-studio `lint`
   target.)
2. **Merge direction is carry-forward-independent.** Mapper C modeled the restack
   as a 3-way merge (base = common ancestor, ours = Habitat tip, theirs =
   my-merged-main, i.e. replaying Habitat commits onto the new main). A literal
   `git merge` of Habitat-tip into new-main swaps ours/theirs but yields
   **identical conflict content** — the `lint:react-compiler` line must be
   hand-preserved either way.
3. **The scripts conflict may recur across the replay.** The analysis diffed
   endpoint-to-endpoint (`921075e9c..tip`). If an intermediate Habitat commit also
   touches the scripts block, the same conflict surfaces more than once during the
   replay — the same one-line re-add applies at each occurrence.
4. **`bun.lock` ordering is strict:** regenerate **after** both `package.json`
   files (root + mapgen-studio) are resolved, never before.

---

## 7. Provenance

Derived from a 3-mapper analysis (Opus, ~226k tokens, 54 tool calls) over the
exact refs in §0, cross-checked against primary evidence:
- **Mapper A (studio anatomy):** read the §5/§7.6 inline contracts and each
  hook's JSDoc → the intent layer in §4.
- **Mapper B (Habitat regime blast-radius):** `git show HABITAT_TIP:apps/mapgen-studio/project.json`
  (Nx targets, no `lint`/`check:worker-bundle`), the slimmed package.json, root
  `nx run-many` collapse, R086/R094/R099 relocations.
- **Mapper C (overlap / silent-drop hunt):** `git merge-file` simulation
  (exit=1 at the scripts block; exit=0 for root package.json), rename-aware sweep
  over all 70 studio files (zero content collisions outside the 3 intersection
  files), and the biome-hygiene blob-hash check that retired the false rival.

All three independently converged on the §3 single-line carry-forward as the one
genuine hazard. Confidence: **high** across every finding.

# Frame — StudioShell client-orchestration decomposition

> Standalone frame (`framing-design`; durability = standalone, mode = audience-export, object-path = solution, lifecycle = novel). It carries WHAT + WHY + hard core + falsifier + scope + assumptions, and **deliberately not HOW**. The HOW (staging, exact seams, verification mechanics) is the future team's to design — see the *Downstream input* appendix, which is explicitly non-binding.
>
> Built by: Claude (Opus 4.8), 2026-06-28. Built for: a future agent + its review team taking on the StudioShell decomposition as a separate worktree/session work stream, with Codex assisting review.

---

## Frame identity

- **Frame name:** StudioShell client-orchestration decomposition
- **Built by:** Claude (Opus 4.8) · **Built when:** 2026-06-28
- **For situation:** `apps/mapgen-studio/src/app/StudioShell.tsx` has grown to ~2,897 lines — a single React function component that is now the studio client's orchestration monolith. The work stream's job is to decompose it.
- **Object-path:** solution (framing the *work*, at the frame level — not designing the solution; the future team designs the staging).
- **Mode:** audience-export — the recipient is a fresh agent + team in a worktree who will re-investigate before acting. Epistemic markers in this document (*hypothesis*, *approximate*, *re-derive yourself*) are load-bearing; do not sanitize them into certainty.

---

## Scope and provenance

**In scope:**
- The CLIENT-side React orchestration glue inside `StudioShell.tsx`: the ~40 `useCallback` handlers, ~30 `useMemo` derivations, ~20 `useEffect`s, and their refs, that wire the already-extracted feature modules, stores, and leaf components together.
- Authorized cleanups encountered while decomposing (see hard core #4).

**Out of scope (constructed exterior — see Selection commitments):**
- The server/daemon runtime (already refactored — `studio-runtime-simplification` D0–D12, landed #1748). Do not reopen it.
- The feature modules and leaf components (already extracted — `APP-TSX-REFACTOR-PLAN`). Do not re-extract them.
- The Zustand store layer (`authoring`/`view`/`run`) — already the state owner; not re-architected here.
- Storybook introduction (a separate, independent track — see Downstream input).
- Any new design-system / syncable UI component work.

**Source pointers (required for cold handoff — verify these before trusting the frame):**
- `apps/mapgen-studio/src/app/StudioShell.tsx` — read in full this session, 2026-06-28, at 2,897 lines. **Line numbers in this frame are anchors-as-of-that-read; the file may have drifted. Re-read at your worktree's commit.**
- `docs/projects/mapgen-studio-redesign/architecture/10-target-architecture.md` — §4 names StudioShell's *intended* role: "layout, error boundary host, global shortcuts host." §3 (stores), §7 (hard-core behavior). This is the canonical target-role doc; the decomposition's end-state should match §4.
- `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md` — the completed *server-runtime* counterpart (D0–D12, landed via #1748). Its `## Review Loop Design` section (orchestrator + specialized reviewers) and `## Always-On Proof Gates` are reusable precedent for this pass.
- `docs/projects/mapgen-studio/resources/APP-TSX-REFACTOR-PLAN.md` — the prior *feature-extraction* pass. Its "extract without redesign / move code over logic changes / stack of small Graphite PRs" philosophy and behavioral-invariant list are direct precedent.
- `apps/mapgen-studio/src/app/hooks/` (existing extracted hooks: `useStudioEvents`, `useSetupDataQueries`, `useToast`, `useRunInGameTerminalToast`), `src/app/StudioProviders.tsx` (39-line thin provider shell), `src/stores/` (authoring/view/run).
- This conversation (full-file read + analysis, 2026-06-28).

---

## WHAT (the situation as framed)

This frame treats **the React controller glue** as the unit of analysis — the orchestration that survives *after* two prior structural passes. It makes **behavioral parity** the primary signal (the studio must behave identically across each move), and makes the **controller-hook / pure-helper** the unit of extraction. It holds **exterior**: the daemon runtime, the feature modules, the leaf components, and the store layer — all already factored out by prior work and not in play here. The decomposition is the **third and final structural pass** on the studio client: Pass 1 extracted features + leaves; Pass 2 moved runtime ownership to the daemon and made the client event-driven; **this pass lifts the remaining orchestration glue out of the host so StudioShell returns to its architecture/10 §4 role** (layout + error-boundary + shortcuts host). What to look for next is not "what new components exist" — it is "where are the clean seams between orchestration clusters, and can each be cut without changing *when* effects run."

---

## WHY (rationale and stakes)

A 2,897-line component is the studio's single largest comprehension and change-risk surface; every feature touch routes through it. The structurally different alternative — centralizing all orchestration into one explicit state machine — was considered and demoted (see Construction history): it is a bigger conceptual bet, harder to verify incrementally for parity, and risks a *second* source of orchestration truth competing with the daemon runtime that Pass 2 just established. Partitioning into React-idiomatic controller hooks keeps the seams familiar, lets each extraction be **independently parity-verified**, and matches the repo's established "extract without redesign" philosophy. The stakes if the frame degenerates: the chief hazard is **silent behavior change** — this component owns subtle, load-bearing timing (effect order, request-key staleness, accepted-then-background operation semantics). A decomposition that reorders effects "while moving code" ships a regression that looks like a clean refactor. The frame exists to keep that from happening.

---

## Construction history

**Structural alternative considered:** *State-machine centralization* — instead of partitioning orchestration into many controller hooks (modularize-into-hooks), centralize all of it into one explicit orchestration model (e.g. an XState actor or an expanded orchestration store) that StudioShell reads from. This is a genuinely different ontological category: one centralized machine vs. many idiomatic hooks.

**Why rejected / demoted:** It changes the mental model, is far harder to parity-verify incrementally, and risks a competing client-side source of truth against the daemon runtime ownership Pass 2 just landed. Kept exterior; the hook-partition is the lower-risk, incrementally-verifiable path. (If the future team's own investigation finds the hook seams don't hold — see falsifier — this alternative is the natural fallback to reconsider.)

**Perspective / discovery passes used:** Full read of StudioShell.tsx + reconciliation against the two prior workstreams (runtime-simplification, APP-TSX-REFACTOR) and architecture/10.

---

## Selection commitments

**In (selected):**
- The controller glue: handlers, derived memos, orchestration effects, and the refs that coordinate them.
- The two-prior-passes substrate as *fixed context* (stores, features, leaves, daemon events) the hooks read from.
- Authorized in-flight cleanups within touched clusters.

**Foreground (made salient):**
- Behavioral parity per extraction stage.
- Effect-execution order and render-time value-derivation timing (the parity mechanism).
- Cluster seams and their cross-dependencies (the shared-value DAG).

**Exterior (deliberately off-frame — constructed, not absent):**
- The daemon/server runtime (Pass 2, done) — reopening it is out of frame.
- Feature modules + leaf components (Pass 1, done) — not re-extracted.
- New visual/syncable components — there are none to mint here (see Insights ledger #5); minting them signals the frame is wrong.
- Storybook — independent track; its sequencing is informed by this frame's findings but not governed by it.

---

## Hard core and protective belt

**Hard core (load-bearing — violating any forces a complete reframe):**
1. **Behavioral parity is the master gate.** After each stage the studio behaves identically — authoring, browser run/auto-run, save/deploy, run-in-game, live-runtime, viz/layer selection, keyboard shortcuts. This is "extract without redesign." (The only sanctioned exception is hard-core #4's separately-flagged fixes — and only those; a parity violation is never excused by "it was a fix.")
2. **The unit of decomposition is the controller-hook / pure helper — not new UI components.** State already lives in stores; leaves are already components. Work that starts minting visual/syncable components has left the frame.
3. **Effect ordering and shared-derived-value timing are a preserved contract.** React runs effects in call order; several effects here are order-dependent, and shared values (`selection`, `resolvePreset`, the busy-booleans, `materializationMode`) are consumed across clusters. Reordering or re-timing them is a behavior change, not a refactor.
4. **Pure moves and behavior-changing fixes are separated and independently reviewable.** Authorized fixes ship as distinct, flagged changes — never blended into a "pure move" — so parity can be proven per stage.

**Protective belt (auxiliary — flex/patch without reframing):**
- Exact cluster boundaries and hook names (the Insights-ledger inventory is a hypothesis to re-derive).
- The staging order (which cluster first).
- Whether to add a `<StudioLayout>` presentational shell, a `useLatestRef` helper, or a `controllers/` directory vs. extending `src/app/hooks/`.
- The verification mechanism specifics (characterization tests vs. snapshot vs. Codex-review depth).
- Whether shortcuts/viewport stay inline in the host or become hooks.

---

## Reframe conditions

**What would force a reframe (specific falsifiers — not "if it doesn't work"):**
- **Seam-uncuttable:** If a target cluster cannot be lifted into a hook without reordering effects or shifting render-time value derivation in an *observably different* way — i.e., parity cannot be held by a pure move — then that cluster is a behavior-redesign, not a decomposition seam, and the "parity-preserving extraction" frame does not govern it (escalate that cluster to a design pass; reconsider the centralization alternative for it).
- **Hidden components:** If re-investigation finds substantial NEW presentational components embedded in StudioShell (beyond the already-extracted leaves), the "controller-hooks-only, no new syncable surface" premise is false → re-scope, and revisit the Storybook-sequencing decision (new visual leaves would change that calculus).

**Degeneration trigger (accumulation rule):** If **2 consecutive** target clusters cannot be extracted without smuggling behavior changes into the "move" (fixes masquerading as moves), stop and re-frame — the seam map is wrong; re-run the cluster-boundary investigation before continuing.

---

## Composition and assumptions

**Perspectives composed:** a single structural read of `StudioShell.tsx` folded with reconciliation against the two prior workstreams (runtime-simplification, APP-TSX-REFACTOR) and architecture/10. No separate `perspective`-skill passes.

**Assumptions committed (taken as given — verify if cheap, flag if violated):**
- The two prior passes (feature extraction; runtime simplification D0–D12) are landed and are the **stable substrate** — this pass builds on them, does not redo them, and does not reopen the server runtime.
- The client live-runtime/operation code is already in its post-D9/D10 **event-driven** shape (daemon push + `operations.current` adoption + event-triggered request/response reads). The decomposition is purely structural; it does not re-architect how operations or live state flow. *Verify cheaply via the `readAndAdoptStudioOperationsCurrent` effect (~1656–1673), `src/app/operationAdoption.ts`, and the `useStudioEvents` hook (~142–145).*
- The existing test suite + Codex adversarial review — plus characterization tests added where coverage is thin — can establish per-stage behavioral parity.
- The future team **re-reads StudioShell.tsx at the worktree commit and re-derives the cluster map**. This frame's inventory is an evidence-grounded *hypothesis*, not ground truth; the file may have drifted since 2026-06-28.
- "Fix issues found along the way" is authorized but **bounded** to issues encountered within touched clusters, each shipped as a separate flagged change.

---

## NOT HOW

Staging order, exact seam APIs, commit/PR structure, and verification mechanics are intentionally excluded from the frame's core — they rot fastest and belong to the team that picks this up. Non-binding input on those lives in the *Downstream input* appendix below, explicitly marked as hypothesis-to-pressure-test, not prescription.

---
---

# Appendix A — Insights ledger (evidence captured 2026-06-28)

> Authoritative *reference input*, not part of the durable frame core. This is what a full read of StudioShell.tsx surfaced. Treat line numbers as anchors-as-of-2026-06-28 and re-verify.

### 1. Anatomy
One giant function component. Breakdown (approximate, as of 2026-06-28): ~150 lines imports (1–149); ~35 lines of module-level pure helpers (`isSaveDeployTerminal`, `saveDeployResultFromTerminalStatus`, ~171–204) plus a small props/waiter-type preamble — already cleanly extractable; ~2,400 lines orchestration inside the component; ~300 lines JSX `return` (~2,598–2,896) that only threads props into already-extracted components. (Counts: ~43 `useCallback`, ~31 `useMemo`, ~21 `useEffect`.)

### 2. The substrate is already factored out (why this is glue-only)
- **State → Zustand stores** already: `authoringStore`, `viewStore`, `runStore` (the long blocks of store selectors at the top).
- **Some behavior → hooks** already: `src/app/hooks/{useStudioEvents, useSetupDataQueries, useToast, useRunInGameTerminalToast}` + feature hooks (`useBrowserRunner`, `useVizState`, `usePresets`, `useRecipeDagQuery`).
- **All visual leaves → components** already: CanvasStage, LeftDock/RightDock, AppHeader/AppFooter, RecipePanel, ExplorePanel, GameConsole, StageViewTabs, PipelineStage, the 3 preset dialogs, ErrorBanner.
- `StudioProviders.tsx` (39 lines) is the thin provider shell. So what's left in StudioShell is purely the wiring.

### 3. Cluster inventory (hypothesis — re-derive before acting)
Approximate line counts; clusters are candidate hook seams. They are **not independent** — see #4. The per-cluster counts are independent rough approximations and will **not** sum to the ~2,400 anatomy figure — don't hunt for a phantom cluster.

| Cluster → candidate hook | ~Lines | Owns |
|---|---|---|
| Live runtime `useLiveRuntimeController` | ~450 | snapshot/setup reads, request-key staleness state machine, abort controllers, autoplay, explore, sync-from-live, `liveGameStudioRelation` |
| Viz/layer selection `useLayerSelection` | ~350 | dataType→space→renderMode→variant→era selection machine + all `handle*Change` |
| Preset lifecycle `usePresetCommands` | ~400 | apply effects, save-to-current/as-new/delete, import/export, confirm-switch |
| Run-in-Game `useRunInGameController` | ~200 | `handleRunInGame`, materialization mode, fingerprint, relation, snapshot, diagnostics |
| Save/Deploy `useSaveDeployController` | ~150 | terminal-event waiter map, status effects, `saveRepoBackedConfigWithState` |
| Browser/auto-run `useBrowserRun` | ~150 | `startBrowserRun`, `reroll`, `triggerRun`, auto-run debounce effects |
| Keyboard shortcuts `useKeyboardShortcuts` | ~150 | `shortcutsRef` + the global keydown effect |
| Setup controls `useSetupControls` | ~120 | leader/civ/difficulty/speed option derivation, saved-config change/drift |
| Stage/step nav `useStageNavigation` | ~100 | stage/step memos + selection-sync effects |
| Viewport/header | ~30 | ResizeObserver + header-height |

After extraction, StudioShell itself should collapse to roughly a few hundred lines (call hooks, assemble JSX) — matching architecture/10 §4.

### 4. The two parity hazards (the real risk — not the moves themselves)
- **Effect ordering is load-bearing.** ~21 effects, several order-dependent — confirmed examples (anchors as of 2026-06-28): preset-apply → default-config seeding (~410–476); stage → step → viz selection sync (~857–873); overlay pruning (~2188–2235). Extraction must preserve hook *call order* = effect *fire order*, or prove pairwise independence. **This is the single highest-risk claim — re-verify the effect graph yourself on day one before committing the parity strategy.**
- **Shared derived values thread across clusters.** `selection` (~2061), `resolvePreset` (~399), the `browserRunning`/`runInGameRunning`/`saveDeployRunning` booleans (~496/592/593), and `materializationMode`/`runInGameMaterializationMode` (~1444) are consumed by multiple clusters → the hooks form a dependency DAG, not islands. Getting the threading right (and not re-deriving at a different time) is where subtle bugs hide.

### 5. No new visual/syncable components
The JSX `return` assembles `const header / leftPanel / rightPanel / footer / presetDialogs` — these are **prop-assembly blocks, not inline components**, and every leaf they reference is already extracted. Zero hidden syncable UI leaves. The only optional component extraction is a thin presentational `<StudioLayout>` (pure layout slots). This is the evidence behind hard-core #2 and the "hidden components" falsifier.

### 6. Two concrete cleanups (authorized fixes, ship as flagged changes)
- **Dead write-only state:** `const [, setLiveRuntimeSnapshot] = useState(...)` (~line 529) — the snapshot value is set but never read anywhere. Removable.
- **Ref-mirrors-state smell:** `runInGameOperationRef.current = runInGameOperation` / `saveDeployOperationCurrentRef.current = ...` (~lines 506–507) and `shortcutsRef.current = {…}` (~line 2421) reassigned every render. This is a *deliberate* latest-value pattern for event-stream/keyboard closures — **do not naively delete it**; formalize it (e.g. a `useLatestRef` helper) rather than "fix" it away.

### 7. Lineage (so the team doesn't re-litigate done work)
- Pass 1 `APP-TSX-REFACTOR-PLAN`: feature + leaf extraction. ✅
- Pass 2 `studio-runtime-simplification` D0–D12 (#1748): daemon/Effect runtime, TypeBox contracts, push events, live-game watch, Nx dev runner. ✅ (server-side; also made the client event-driven). One known residue: D10's live-game-watcher Civ7 live-proof gap — exterior to this pass; do not investigate it.
- Pass 3 (this frame): client orchestration-glue decomposition. ← you are here.

---

# Appendix B — Downstream input (non-binding; pressure-test, don't obey)

> NOT the frame. These are starting hypotheses for the team's own design phase. Discard freely.

- **Suggested staging principle (a hypothesis):** extract the leaf-most / least-entangled clusters first (viewport, stage/step nav, keyboard shortcuts) to stand up the verification harness and build confidence, *then* the high-value entangled ones (live-runtime, viz-selection, preset-lifecycle) once the harness exists and the shared-value DAG is mapped. Pure helpers (`isSaveDeployTerminal`, `saveDeployResultFromTerminalStatus`) are a trivial zeroth step.
- **Verification posture:** the de-risker here is **characterization tests + Codex adversarial review focused on parity** (effect order, shared-value timing) — *not* a visual workbench. Frame Codex's review lanes around the parity hazards (à la the runtime-simplification "Review Loop Design": a product/runtime-parity reviewer + an adversarial-orphan reviewer + an architecture-boundary reviewer), not "does it look right."
- **Per-stage verifiability:** one cluster per Graphite branch / change, each independently provable for parity — mirrors both prior passes' "stack of small PRs" discipline. Consider whether this repo's OpenSpec + Nx/Habitat proof-gate machinery (used heavily in runtime-simplification) should govern these slices.
- **Storybook sequencing (resolved by this frame's findings):** this decomposition yields controller hooks and pure logic — non-visual — so it produces no Storybook material and is not de-risked by Storybook. The two tracks are independent; there is no reason to do Storybook *first* for the sake of this work. (Only the "hidden components" falsifier firing would change that.)
- **Watch-outs, condensed:** (1) effect re-ordering masquerading as a move; (2) shared-value re-timing across the hook DAG; (3) the deliberate latest-value ref pattern — formalize, don't delete; (4) fixes blended into pure moves (breaks per-stage parity proof); (5) don't reopen the daemon runtime or re-extract leaves — both are done.

---

*Skills used: framing-design (standalone frame, audience-export), solution-design (axis placement carried from prior analysis).*

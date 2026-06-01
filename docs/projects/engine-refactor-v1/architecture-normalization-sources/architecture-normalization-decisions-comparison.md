# Source Material Notice

This document is preserved for provenance only. The active normalization
authority is `../architecture-normalization-packet.md`.

# MapGen Normalization Decisions — Independent vs Codex (steelman comparison)

Status: `source-material-only`.
Date: `2026-05-29`.

Compares the two independent decision passes:

- **IND** = `architecture-normalization-decisions-independent.md` (this team).
- **CDX** = `architecture-normalization-decisions-codex.md` (Codex team).

Method: half the room argues IND, half argues CDX. For each decision we **build up**
the strongest version of each side, then **tear it down** against engineering first
principles (YAGNI, contract-first, the shared phase/stage/step definition) and the
product priority the owner set — **simplicity first, but keep the flexibility we
actually need**. We then select the strongest position, even where it revises a prior
owner lean.

---

## Headline: the two passes converge almost completely

Run independently, both teams derived **the same phase/stage/step vocabulary** and the
**same conclusion on D2, D3, D4, and 0e**. That convergence is itself a signal: those
four are low-risk to ratify. Only **two decisions genuinely diverge**:

| Decision | IND | CDX | Divergence? |
|---|---|---|---|
| **D1** schema surface | **Flat** `{knobs?, [stepId]?}`, no SDK affordance | **Nested** `{knobs?, advanced?}`, SDK owns it | **YES — real** |
| **D2** lakes | Hydrology truth, adapter-first | Hydrology truth, adapter-first | No (CDX adds: migrate placement off `engineProjectionLakes`) |
| **D3** placement split | Split, but only at genuine contracts | Split, but only at product/effect boundaries | No (same conclusion, complementary detail) |
| **D4** resource/discovery | Typed reconciliation; reject `placed===planned` | Plan-authoritative + legality oracle; reject `placed===planned` | No (same conclusion, complementary framing) |
| **D5** ecology stages | **Keep 7 stages** (future-knob namespaces) | **Collapse to 1 truth + 1 projection** | **YES — real; later synthesis revises both toward input/handoff stages** |
| **0e** import policy | Keep G4; one recipe-scoped rule + sizing | Keep G4; 6-row audience matrix | No (same decision; differ on enforcement complexity) |

The rest of this doc spends its energy where it matters: **D1 and D5**. The convergent
four are handled briefly at the end with the deltas worth merging.

---

## D1 — flat vs nested `advanced` (the real debate)

### The fact that reframes it

The current SDK already synthesizes a **flat** default surface for no-`public` stages
(`stage.ts:55-63`): `{ knobs?, [stepId]?: Type.Unknown() }`. Two consequences:

1. The flat shape **already exists** — IND's "no new SDK shape" claim is literally true.
2. Each step key is `Type.Unknown()` — CDX's "the fallback is weak" claim is **also**
   true. (Real per-step validation happens later at recipe compile against
   `step.contract.schema`, so it's weak-at-surface by design, not broken.)

Both docs were half-right. So D1 is **not** a correctness dispute. It is a shape choice:
**flat per-step keys vs a nested `advanced` wrapper** — plus a shared, separable
question of whether to keep `Type.Unknown()` or strengthen it.

### Build up IND (flat)

- The synthesized surface is **already flat**. Choosing flat = deleting the 5 hand-rolled
  `advanced` blocks and letting them fall back to what the SDK already does. **Zero new
  SDK machinery.**
- One fewer layer, no reserved word, no `advanced` indirection. Occam + YAGNI.
- This is exactly the owner's scrutiny applied: *"extra wrapping on top of an
  already-simple existing solution… extra layers can be unnecessary."* `advanced` is the
  extra wrapper; the existing flat surface is the already-simple solution.

### Build up CDX (nested `advanced`)

- `advanced` is a **named escape hatch**: "you have left curated-knobs territory and are
  hand-setting raw per-step config." That semantic boundary has DX value and matches the
  owner's other instinct — *"I generally prefer explicitness in design"* — and the
  documented knobs/advanced mental model (`how-to/tune-realism-knobs.md`).
- **Migration asymmetry CDX exploits:** the stages that actually carry populated per-step
  config today (the 5 morphology/hydrology stages) are **already nested under
  `advanced`**. The flat-today stages (foundation, the 7 ecology stages) have little or no
  per-step config (empty step schemas). So standardizing on **nested** migrates almost no
  real config; standardizing on **flat** migrates exactly the stages that *do* have real
  `advanced.{stepId}` payloads. IND's own doc concedes this ("overrides move from
  `advanced.{stepId}` to top-level… coordinated migration of Studio config, presets,
  tests, docs").

### Tear down

- **Against CDX:** the explicitness it buys is thin. `additionalProperties:false` +
  `RESERVED_STAGE_KEY` already prevent collisions, and the Shape A→B graduation boundary
  already exists for stages that grow genuine top-level fields. So `advanced` adds a layer
  to name a distinction the type system already enforces. And the migration-churn argument,
  while real, is a **one-time** cost — it should not set a permanent surface shape.
- **Against IND:** "no new SDK shape" is its strongest card, but it quietly leans on
  `Type.Unknown()` staying weak. If you go flat **and** leave per-step keys untyped, you've
  shipped an untyped top-level escape hatch sitting flush against curated `knobs` — which is
  precisely the un-explicit blur CDX warns about. Flat is only clearly better *if* the
  per-step keys are also **properly typed**.

### Selected position: **flat — but adopt CDX's typing fix**

Keep the owner's flat call. It wins on the decisive axis: the synthesized surface is
**already flat**, so flat is the only option that adds **no new SDK shape** — the cleanest
reading of "let the existing simple solution handle it." But fold in CDX's real critique:
**replace `Type.Unknown()` with the actual per-step schema** in
`buildInternalAsPublicSurfaceSchema` so the flat surface is typed and validated at author
time, not just at compile. That neutralizes CDX's only durable objection (untyped escape
hatch) while keeping the structure flat.

> **Net D1:** flat surface, no `advanced` wrapper, no new SDK affordance — **plus** strengthen
> the synthesized per-step keys from `Type.Unknown()` to real step schemas. Honest caveat
> preserved: flat is the larger one-time config migration (it touches the 5 stages that
> actually use `advanced` today); that cost is accepted in exchange for a permanently
> simpler surface.

---

## D5 — keep 7 ecology stages vs collapse to 1 truth + 1 projection (the real debate)

Both teams wrote **nearly identical stage definitions**: a stage earns existence only when
a group of steps needs a **distinct authoring surface / knobs scope / wiring**. The fight is
about *applying* that shared rule to ecology — where **all 7 stages have empty knobs and all
underlying step schemas are empty today**.

### Build up IND (keep 7)

- No churn now; preserves the deliberate recent mega→split (`#1221`/`#1223`, legacy
  `ecology` stage deleted in `6471a7f7a`). Re-collapsing thrashes recent work.
- Each concern (ice, reefs, wetlands, vegetation, biomes, pedology, feature-score) is a
  **plausible future knob owner**; keeping the stage pre-positions the namespace the knob
  will attach to.
- 7 named stages make the ecology pipeline legible at the recipe level.

### Build up CDX (1 truth + 1 projection)

- **Internally consistent with the shared definition.** Empty knobs + empty schemas = **no
  distinct surface today** ⇒ by *both* teams' own rule, the 7 don't currently earn stage
  status. CDX applies the rule; IND carves a speculative exception to it.
- **YAGNI.** 7 empty-knob stages are 7 placeholders for hypothetical requirements.
- Steps remain first-class contracted, traced, individually enable-able units — so
  collapsing loses **no** wiring, observability, or granularity (both teams agree stages buy
  zero wiring). The only thing "lost" is 7 empty namespaces.
- A single `ecology.knobs` object holds every future ecology knob **just as well** as 7
  scattered ones — arguably better tuning DX (one place).

### Tear down

- **Against IND:** the "future knob owner" justification doesn't survive its own premise. If
  the future knob can live in one `ecology.knobs` object, the per-concern stage isn't
  *required* for the future case — so the rule reduces to "keep structure for a hypothetical,"
  the exact anti-pattern the owner's D1-flavor scrutiny targets. IND's only **durable**
  advantage is churn-avoidance of recent work — real, but transient and weaker than a
  standing structural principle.
- **Against CDX:** a hard one-step collapse to a single opaque `ecology` over-corrects and
  risks hiding genuine causal layers (substrate → feature planning → projection)
  behind one blob. CDX itself concedes this and names a middle path.
- **Against the first synthesis:** splitting `features-score` from
  `feature-intents` names a real substrate/planning distinction, but it treats
  an internal handoff as a stage boundary before there is a distinct authoring,
  review, enablement, or recipe-ordering need.

### Selected position: **revise both — split by input/handoff surface, audit-driven; keep IND's split-brain fix regardless**

The original CDX critique is stronger than keeping seven speculative
feature-family stages, but a pure one-truth-stage collapse underweights the
domain-operation input concern. The better synthesis is multiple ecology truth
stages by concrete input/handoff surface:

1. **Don't keep 7 on speculation.** Collapse per-feature wrappers into a
   smaller set of stages whose upstream artifact inputs, authoring surfaces,
   and downstream handoff artifacts differ: pedology, biomes, feature planning,
   plus `map-ecology` projection.
2. **Don't collapse all truth to one stage.** Stage count does not directly
   shrink domain-op input schemas; steps and op-input builders do that. But
   named stages are still useful when they explain which artifact families and
   config/knob surfaces belong together. Score/substrate layers are a valid
   internal seam inside feature planning; promote them only when they gain an
   independent stage-level surface.
3. **Promote a feature-family stage only when a real surface appears** — when
   an actual knob family, independent enablement, or recipe insertion point
   materializes, split that feature family out then. That is the rule both
   teams wrote, applied honestly.
4. **Adopt IND's split-brain fix unconditionally.** Regardless of final count, the steps
   re-exported from the stale `../ecology/steps/` hub (`ecology-pedology/index.ts:7`,
   `ecology-biomes/index.ts:2`) must be made stage-local and the bare `stages/ecology/` hub
   dissolved. This is orthogonal to the count and correct either way.

> **Net D5:** revise from both "keep 7" and "one truth stage" to
> `ecology-pedology`, `ecology-biomes`, `ecology-features`, and
> `map-ecology`, audit-driven and promote-on-real-surface. Keep
> score/substrate and intent planning as step/artifact seams inside
> `ecology-features` unless a real stage-level need appears. Adopt IND's
> split-brain cleanup as-is. This trades a transient churn cost for a surface
> that obeys the shared stage definition, the domain-op input policy, and the
> simplicity priority.

### Map-* Back-Application

The feature-score correction does not imply "delete every projection stage."
It implies a stricter stage-promotion test. `map-ecology` is acceptable when it
means projection/materialization: truth in, engine-facing fields/effects out,
adapter writes and parity diagnostics at the boundary. It is not acceptable if
it means "a useful internal Ecology implementation area" or "a Studio grouping."

That rule back-applies as follows:

- Keep `map-morphology`, `map-hydrology`, and `map-ecology` only where they own
  Gameplay/map projection, adapter/materialization effects, `artifact:map.*`
  handoffs, or projection-specific authoring knobs.
- Keep pure truth, substrate, scoring, and intent planning in the Physics/domain
  stages.
- If Studio needs a grouping that does not match recipe architecture, solve it
  with UI/SDK metadata rather than another recipe stage.

---

## The convergent four (ratify; merge the deltas)

These need no debate — both teams landed the same call. Worth merging the complementary
detail each contributed.

### D2 — lakes = Hydrology truth, adapter capability first
Agreement is total: implement `plan-lakes`, stamp via a new adapter capability **before**
any fail-hard gate, never gate against `sinkMask`, split/close DEF-020. **Merge from CDX:**
explicitly **migrate Placement to consume the Hydrology lake plan instead of
`engineProjectionLakes`** — IND implies this; CDX names it as a required step. Keep it.

### D3 — split placement, but only at genuine boundaries
Both reject a mechanical helper-by-helper split. **Merge:** CDX's concrete first-class
candidate list (`place-natural-wonders`, `place-resources`, `assign-starts`,
`place-discoveries`, `assign-advanced-starts`; maintenance ops stay transactional) +
IND's enforcement insight (the genuine seam is **plan→apply**; each promoted sub-step must
carry a real artifact/effect contract, not a synthetic `requires: previous.provides` chain;
**reframe G8** to fire on *uncontracted* hidden sub-concerns). These compose into one plan.

### D4 — plan-authoritative intent, never `placed===planned`
Both reject naive count equality and both require an adapter that returns **per-tile
placement + rejection reason** before any gate, with official generators primary until then.
**Merge:** CDX's "legality oracle" framing (Civ7 resource/discovery generation is *real game
logic* — Swooper must own those semantics or delegate legality to the adapter) + IND's gate
shape (**typed reconciliation**: fail only on *unexplained* drift; explicitly **supersede
ADR-ER1-020**, whose "best-effort placeholders / avoid new adapter read surfaces" stance
blocks reconciliation). Same path, two halves of one design.

### 0e — keep G4, scope it, don't broad-ban
Same decision. The only difference is **enforcement complexity**: CDX specifies a 6-row
audience matrix (docs/apps/recipe/steps/internals/tests); IND specifies a single
recipe-scoped rule ("`src/recipes/**` may not deep-reach domain internals") plus real sizing
(35 occurrences / 7 specifiers, mostly `shared/knobs.js`). **Selected:** enforce IND's
**single mechanical rule** in CI now (a guardrail must be checkable), and keep CDX's matrix as
the **documented intent** that the rule approximates. Simplicity in the enforced check;
flexibility preserved in the written policy. Ship after the small knobs-surface remediation.

---

## Final selection table

| Decision | Winner | Selected resolution |
|---|---|---|
| **D1** | IND (revised) | Flat surface, no `advanced`, no new SDK affordance — **plus** type the synthesized per-step keys (drop `Type.Unknown()`). Accept the one-time flat config migration. |
| **D2** | Tie | Hydrology truth; adapter `stampLakeMask` first; migrate Placement off `engineProjectionLakes` (CDX); split DEF-020; never gate on `sinkMask`. |
| **D3** | Tie | Split at product/effect boundaries (CDX list); leverage the plan→apply seam, real contracts only, reframe G8 (IND). |
| **D4** | Tie | Plan-authoritative intent; adapter per-tile placement+reason before any gate; typed-reconciliation gate (IND) over Civ7 legality-oracle semantics (CDX); supersede ADR-ER1-020; official-primary until then. |
| **D5** | Revised synthesis | Multiple ecology truth stages by input/handoff surface (`ecology-pedology`, `ecology-biomes`, `ecology-features`) + `map-ecology` as projection/materialization; keep score/substrate and intent planning as internal seams unless a real stage-level surface emerges; adopt IND's split-brain fix regardless. |
| **0e** | IND for enforcement, CDX for intent | One CI-checkable recipe-scoped rule now; matrix as documented intent; ship after the small remediation. |

**Two honest revisions vs the IND doc:** D1 gains CDX's typing fix; **D5 moves
away from the seven-stage feature-family split** but does not fully collapse to
one truth stage. Everything else is ratify-and-merge. Packet remains untouched
pending your sign-off on these selections.

# MapGen Architecture Normalization Packet (candidate consolidated baseline)

Status: `candidate-consolidated-baseline`.
Date: `2026-05-29`.
Branch: `codex/add-civ7-repo-skill-templates` for this packet edit pass; source review branch was `codex/mapgen-architecture-normalization-review`.

This is the **project baseline packet** for the MapGen normalization refactor once accepted. It merges two independent reviews:

- Codex pass — `architecture-normalization-review.md` (commit `375ca51df`).
- Independent pass — `architecture-normalization-review-independent.md` (Claude team).

Both reviews reached the same broad destinations from independent code reading. This packet reconciles them into one candidate architecture baseline, one stage scorecard, and one domino-sequenced normalization plan. Where the two passes diverged, the sharper finding is kept and marked.

It also does what the prior reviews did not: it states the **schema / contract / compile** model plainly enough to stop negotiating, grounds it in the ORPC reference pattern, and lists the exact spec/index edits needed to make the spec match.

> This packet is a **review/decision artifact**, not a replacement for the SPEC. Once accepted, use it as the controlling project baseline for the normalization workstream until the SPEC realignment actions in §6 fold its decisions back into `resources/spec/SPEC-*`, which remains the long-lived contract authority.

---

## 0. How to read this packet

- §1 — **The architecture target.** The part we stop re-deriving from stale docs.
- §2 — **The schema/contract/compile model.** The specific thing past agents kept overengineering. Read this if you read nothing else.
- §3 — **Authority stack.** Which docs win when they disagree.
- §4 — **Reconciled stage scorecard.** One table, both teams merged.
- §5 — **Normalization plan (domino-sequenced).** Each slice unlocks the next.
- §6 — **Spec realignment actions.** Exact edits to make the SPEC match §1–§2.
- §7 — **Convergence guardrails.** Mechanical checks so it can't relapse.
- §8 — **Divergences kept from the independent pass.** Provenance.

---

## 1. The architecture target

MapGen is a deterministic 7-layer pipeline. Each layer has exactly one job. If a concern lives in the wrong layer, that is the bug.

| Layer | Owns | Must NOT |
|---|---|---|
| **Domain** | Algorithms, as contract-first **ops** (`defineOp`/`createOp`), `strategies/` (incl. a `default`), op-local `rules/`, types in `types.ts`. Shared semantics (knob enums). | Orchestrate, read context, know about steps/stages/recipes. |
| **Step** | Orchestration: declare `requires`/`provides`/`artifacts`, declare a config `schema`, bind `ops`, implement `run()`/`normalize()`. | Heavy compute (belongs in an op), reach into a sibling stage's source. |
| **Stage** | The **author surface** + the **compile** from surface → per-step config; local step membership/composition. | Compute; own global recipe ordering/enablement; own truth. |
| **Recipe** | The single source of **global stage/step ordering + enablement**. | Use manifests, prose ordering, or `shouldRun`/silent skips. |
| **Compilation** | Config compilation: strict schema validation, defaults, normalization → compiled per-stage/per-step config. Plan compilation: compiled config → `ExecutionPlan`. | Run side effects. |
| **Execution** | `PipelineExecutor`: tag gating, write-once artifacts, buffer rules, trace/viz. | Be reimplemented inside steps. |
| **Consumers** | Studio + runtimes drive the pipeline via a run boundary. They are *reference implementations of posture*. | Be treated as architecture authority; require SDK internals or `dist` artifacts. |

Two cross-cutting invariants govern everything:

1. **Truth vs projection.** Truth stages compute and publish domain artifacts. `map-*` stages *project* that truth into engine state. For MapGen-owned surfaces, **the engine is a projection target, not the truth authority.** Any place the engine generates a surface the pipeline claims to own (lakes, resources, discoveries) is a violation to resolve, not a feature.
2. **Colocation by default.** A thing lives next to the thing that owns it. Centralized cross-owner catalogs (`tags.ts`, `artifacts.ts`, `config.ts` at a recipe or domain root) are forbidden unless they are **thin re-export barrels**. Stage-scoped shared modules remain allowed when they are explicit, stage-local, and do not become cross-stage/domain definition hubs.

**The DX litmus.** `foundation` is the architecture's own worked example for the authoring path. Both review teams independently picked it as the reference. "Good DX" therefore has a concrete shape, not a vibe: *a tiny knobs surface, compute fully in ops, tag-wired dependencies, explicit artifact contracts, no recipe/domain-root catalogs, nothing the developer must know about `dist` or codegen.* Foundation is not proof that every surrounding artifact file is final; it still has a large stage-local `artifacts.ts`, which is tolerated as stage-scoped today but should not be generalized into cross-stage catalogs. **Anything whose authoring DX is worse than foundation's is wrong** — that is the operational definition we use for grading.

**The trap (why past agents reverted).** The "bad" architecture is the legacy `MapGenConfig` mega-object + presets/tunables + stage manifests + `shouldRun` + recipe-root catalogs + engine-as-authority. The codebase is **mostly cut over** already — none of those survive in their full form. So the risk is not relapse; it is **residual legacy fixtures** (`tags.ts` catalog, centralized `config.ts`, engine-authoritative placement/lakes, orphaned stage hubs) being mistaken for "fine" and re-cemented. §7 turns those fixtures into mechanical checks once the clearing slices land.

---

## 2. The schema / contract / compile model (the decisive part)

This is the area past agents repeatedly overcomplicated. The `createStage` *mechanism* (`packages/mapgen-core/src/authoring/stage.ts`) is sound, but the **dominant idiom built on top of it is the overengineering itself** — and an adversarial pass against an earlier draft of this packet caught it. The fix is a public recipe-config contract decision plus a small SDK affordance and doc realignment, not "the code is already correct."

### 2.1 The one rule

> **A stage exposes a surface and compiles it down to the config its steps declare. Steps own their config contracts. The author writes a `compile` function *only* when the surface genuinely differs from the step config — never as boilerplate.**

That is the whole model. Everything below is unpacking it — including the part the current code gets wrong.

### 2.2 What the code actually does today (and why it's the pain point)

`createStage` (`stage.ts:115-159`) has exactly two overloads:

**Shape A — knobs-only.** Declare `knobsSchema` + steps, **no** `public`, **no** `compile`. The authoring shape is `{ knobs?, [stepId]?: <step config> }`: `toInternal` splits `knobs` off and passes per-step config straight through, and `deriveRecipeConfigSchema(...)` expands no-public stages to the actual step schemas for Studio/config validation. The current `createStage.surfaceSchema` fallback itself is weaker (`Type.Unknown()` per step), which is part of why D1 must tighten the default surface instead of treating today's mechanism as fully finished. Zero stage boilerplate. This is the **foundation** pattern.

**Shape B — public + compile.** Declare a `public` schema **and** a `compile`; the two are co-required (`stage.ts:122-124` throws if `public` lacks `compile`). The surface is `{ knobs?, ...publicProps }`; `toInternal` calls `compile({env,knobs,config})` to produce per-step config.

**The problem:** five standard stages use Shape B to do *nothing but wrap passthrough config under an `advanced:` key*:

- `morphology-coasts/index.ts:12-29` declares `public = { advanced: { "landmass-plates"?, "rugged-coasts"? } }`, then `compile: ({config}) => config.advanced ? config.advanced : {}` (`:53`).
- Identical boilerplate in `morphology-routing/index.ts:35`, `morphology-erosion/index.ts:44`, `morphology-features/index.ts:46`, `map-hydrology/index.ts:48`.

So `advanced` **is** a literal schema key today, and the `compile` attached to it is pure ceremony — it unwraps one level and returns it. That is exactly the "precious semantics that should just be standard" the team keeps tripping over. The earlier draft of this packet claimed "advanced is not a schema key" — **that was false**, and an engineer opening any morphology stage would have re-opened the debate immediately.

### 2.3 The decisive call (apply the user's own DX rule: "if the SDK can hide it cleanly, hide it")

`advanced` is a *good* idea — it's the documented "deep per-step overrides" namespace, visually separated from semantic `knobs` (the core `how-to/tune-realism-knobs.md` mental model, though that doc has stale foundation/profile wording called out in §6). The defect is that **five stages hand-write the same trivial unwrap `compile`.** Fix it once, in the SDK:

> **For default/no-public stages, `createStage` natively supports `{ knobs?, advanced?: { [stepId]: stepConfig } }` and applies `advanced` automatically as the per-step config baseline. No stage writes a `compile` to unwrap it.** The synthesized `advanced` surface is built from the step contracts (one known optional entry per step), but D1 must preserve the current two-phase validation behavior: stage-surface validation catches the stage shape/known step ids, then op-default prefill + strict step-schema validation happens in recipe config compilation. Do not strict-validate raw partial `advanced` overrides against full step schemas before defaults/prefill unless D1 also introduces a correct partial authoring-input schema.

After D1, `advanced` is an SDK-reserved stage surface key alongside `knobs`: a step id cannot be `advanced`, and a custom `public` schema cannot define its own `advanced` property. Shape B (`public` + `compile`) remains a full custom surface: it does **not** get an implicit `advanced` merge path, because that would create two competing ways to set the same step config. If a Shape-B stage needs exact per-step control, first ask whether its public keys should simply become step ids so it can return to the default surface; otherwise the stage owns the custom transform explicitly.

After this:
- **Shape A (knobs + auto `advanced`)** is the default for every stage whose public surface is just semantic knobs plus per-step overrides. The five morphology/map stages delete their `public`+`compile` boilerplate entirely; foundation's current top-level step override surface moves under `advanced` when D1 lands.
- **Shape B (`public` + hand-written `compile`)** is reserved for the genuine case: the surface really differs from step config (a curated public field, or a knob that needs a custom transform beyond "apply last"). Today, `map-morphology` is the one legitimate Shape-B candidate because it performs key renaming; the five `advanced` unwrap stages are boilerplate to remove.

This unifies foundation and morphology on one surface shape, preserves the `knobs`/`advanced` mental model, and removes the only real schema ceremony in the repo. The decision is **nested `advanced`**, not top-level step ids: it keeps semantic knobs visually separate from expert overrides and prevents every stage from inventing its own "simple vs deep" shape.

### 2.4 Where knobs fit

Knobs are optional semantic sugar. They are resolved before step/op normalization, and step/op normalization may read `{ env, knobs }`; the intended posture is that knobs act as the final semantic transform over the advanced/default baseline, not as a separate schema system. In practice that means knobs usually belong in each step's `normalize()` or op normalization path, not in stage `compile`. `how-to/tune-realism-knobs.md` teaches the intended knobs-last mental model but must be corrected for foundation/no-public stages and stale `profiles` language.

### 2.5 The ORPC grounding ("this is the correct way to do it")

The repo already cites the ORPC `implement(contract)` pattern (`resources/spec/recipe-compile/DX-ARTIFACTS-PROPOSAL.md:283`): *the contract defines the shape; the implementation fills in runtime behavior with full type safety.* Apply it literally:

| ORPC | MapGen |
|---|---|
| A procedure declares an **input/output contract** (schemas). | A **step** declares its config `schema` (+ requires/provides/artifacts). |
| A **router** composes procedures. | A **stage** composes steps. |
| `implement(contract)` binds runtime behavior to the contract with full type safety. | `createStep`/`createStage` bind `run`/`compile` to the declared contracts. |
| The caller's input is validated against the contract; the implementation can't drift from it. | The stage surface compiles to per-step config; the compiler validates each step config against its step schema. D1 should preserve schema-derived default-stage authoring, make `advanced` a typed/deferred per-step override surface, and tighten public `compile` outputs to the step schemas. |

**Assertion (stop negotiating):** the contract is the procedure/step. The surface is just an input shape that resolves to those contracts. ORPC procedures don't carry two parallel schema systems for "simple" vs "advanced" callers, and neither should a stage. The `advanced` namespace is the per-step baseline and the SDK applies it for free in the default/no-public path; a hand-written `compile` is the *exception* (a genuine transform), not the rule. Caveat on the analogy: ORPC's contract is the caller's I/O, whereas a stage surface is an authoring/tuning surface that knobs transform last — that "apply knobs last" dimension has no ORPC analog, so use ORPC as the mental model for *contract→implementation discipline*, not as a 1:1 spec. Also note the current `StageCompileFn` only constrains returned step ids statically; per-step values are runtime-schema validated today. D1 should preserve schema-derived default-stage authoring and make native `advanced` plus public `compile` outputs per-step typed rather than relying on `unknown`.

### 2.6 Consequence for grading

A stage is **schema-correct** iff:
- it uses the default surface (`knobs?` + auto-`advanced?`) with **no** hand-written `compile`, **or**
- it uses a hand-written `compile` that performs a *genuine* transform (surface fields that differ from step config, or a custom knob application). Today that output is step-id constrained at type level and schema-validated during recipe compilation; D1 should tighten `StageCompileFn` so public compile output is per-step typed instead of `Partial<Record<StepId, unknown>>`.

"No knobs" is **not** a violation (a stage with empty knobs and pure `advanced` passthrough is legal). The real violations are: a `compile` that only unwraps `advanced` (boilerplate — delete it once the SDK affordance lands), heavy compute in a step, a stage importing a sibling stage's `steps/`, and engine-as-authority.

---

## 3. Authority stack (which doc wins)

When sources disagree, defer in this order:

1. **`docs/projects/engine-refactor-v1/resources/spec/SPEC-*.md`** — canonical target spec. Use the active splits (`-architecture-overview`, `-step-domain-operation-modules` [R-001..R-007], `-packaging-and-file-structure` [§2.3 forbids recipe-root catalogs; §2.4 colocation], `-standard-content-package`, `-global-invariants`, `-appendix-target-trees` [⚠️ stale `morphology-pre/mid/post` naming]). The `resources/spec/recipe-compile/**` docs are implementation-design authority for the compile model, but §6 must update their top-level step-id examples if D1 is ratified. `resources/spec/SPEC.md` is the intended index but still points at the now-archived `resources/SPEC-target-architecture-draft.md`, so §6 must fix the index instead of following that stale pointer.
2. **`docs/system/libs/mapgen/`** Diátaxis canon — `explanation/ARCHITECTURE.md`, `policies/*`, `reference/*`, `how-to/tune-realism-knobs.md`.
3. **ADRs/deferrals** — project ADR-ER1-002 (no `shouldRun`), ADR-ER1-003 (RunRequest boundary), ADR-ER1-032 (proposed/at-risk no global overrides), ADR-ER1-034 (op kind), ADR-ER1-020 (placement verification limits), DEF-020 (hydrography stamping limitation), and system ADR-006 (coasts/routing/erosion/features naming).
4. **Current code** as implementation evidence — `recipes/standard/recipe.ts` (ordering SoT), `authoring/stage.ts` (compile mechanics SoT), `compiler/recipe-compile.ts`.

**Known-stale traps** (both teams confirmed): `resources/spec/SPEC.md` points at an archived target draft; `docs/system/libs/mapgen/architecture.md` is a legacy router only; `reference/STANDARD-RECIPE.md` lists a single `ecology` stage but the recipe has seven split ecology stages; `reference/STAGE-AND-STEP-AUTHORING.md` uses the forbidden `M4_/M10_` tag imports as its example; `how-to/tune-realism-knobs.md` correctly teaches `knobs` vs `advanced` but falsely says foundation exposes `profiles`; `SPEC-appendix-target-trees.md` uses superseded `morphology-pre/mid/post` names. These are doc gravity, not authority.

---

## 4. Reconciled stage scorecard

Verdicts: **clean** (reference shape) / **transitional** (right surface, internal gaps) / **divergent** (violates a core invariant). Both teams' grades reconciled; evidence is file:line.

| Stage / area | Verdict | Evidence (file:line) | Both teams? |
|---|---|---|---|
| **foundation** | ✅ clean (reference) | knobs-only Shape A; knobs applied last `steps/mesh.ts:17-33`; compute in ops; explicit artifact contracts. Caveat: large stage-local `artifacts.ts` is tolerated stage scope, not the model for recipe/domain-root catalogs. | ✔ agree |
| **morphology-routing / -erosion / -features** | 🟡 transitional | compute correctly in `plan-*`/`compute-*` ops + knobs applied last — but each carries the **boilerplate `advanced`-unwrap `compile`** (`-routing:35`, `-erosion:44`, `-features:46`) that the §2.3 SDK affordance deletes. Clean once that lands. | independent (sharpened post-review) |
| **morphology-coasts** | 🟡 transitional | heavy BFS in step: `computeDistanceToCoast` `steps/ruggedCoasts.ts:70-101`; elevation rewrite `:193-213` (belongs in an op); **also** carries the boilerplate `advanced`-unwrap `compile` (`index.ts:53`). | independent (sharper) |
| **map-morphology** | 🟡 transitional | correct projection; but flat-key renaming `compile` `index.ts:30-37` + milestone tags `M10_EFFECT_TAGS`. (Its renaming `compile` is a *genuine* transform, so it's a legit Shape-B candidate — unify the key naming rather than delete.) | ✔ agree |
| **map-hydrology surface** | 🟡 transitional | carries the boilerplate `advanced`-unwrap `compile` (`index.ts:48`) — deleted by §2.3 affordance. (Separate from the lakes-authority issue below.) | independent (post-review) |
| **hydrology-climate-baseline / -hydrography / -climate-refine** | 🟡 transitional | best knob surfaces; clean colocation; ordering rides artifact deps with empty semantic tags (`requires:[]/provides:[]`). | ✔ agree |
| **map-hydrology (lakes)** | 🔴 divergent | engine is lake truth authority: `lakes.ts:73` `adapter.generateLakes(...)`; `sinkMask` demoted to telemetry `:122-124`; **`plan-lakes` op is a contract-only abandoned stub** (no `index.ts`/`types.ts`/`strategies/`). | independent (sharper: stub) |
| **ecology-features-score** | 🟡 transitional | textbook orchestration (reads artifacts, 17 ops, publishes 2); reads centralized `ecologyArtifacts`. The de-facto real ecology compute. | ✔ agree |
| **ecology-pedology / -biomes** | 🔴 divergent (split-brain) | re-export steps from sibling `../ecology/steps/index.js` (`ecology-pedology/index.ts:7`, `ecology-biomes/index.ts:2`). | ✔ agree |
| **ecology-ice / -reefs / -wetlands / -vegetation** | 🟡 transitional | near-empty wrappers; sequencing via `occupancy*` artifact daisy-chain instead of tags. | ✔ agree |
| **map-ecology** | 🟡 transitional | richest projection; correct engine-as-target; milestone tags + inconsistent step layout. | ✔ agree |
| **placement** | 🔴 divergent | god-step `apply.ts` 1115 lines; `applyPlacementPlan` opens at `:83` and its sub-op sequence extends past `:586` (the `:83-351` cited earlier understates it); 11 sub-ops via internal `runPlacementStep` harness (`:69`, mimics step boundaries w/o contracts); resources `:581` + discoveries `:498` use official generators as authority; **commit #1348 checks discovery count finite/≥0 (`:504-508`), NOT `placed===planned`**. Wonders/starts correctly plan-projected + fail-hard. | independent (sharper: localized + #1348) |
| **narrative** | 🔴 legacy/unwired | absent from the standard recipe; `ops/contracts.ts = {}`. Some narrative config/overlay/orogeny utilities still exist, but canonical docs describe Narrative as legacy absorbed by Gameplay. Evaluate remaining code under that absorption path rather than treating the whole directory as a simple delete. | ✔ agree |
| **Core SDK purity** | 🔴 divergent (real backslide) | `packages/mapgen-core/src/authoring/maps/index.ts` references Civ7 types `:1`, runtime-imports `@civ7/adapter/civ7` `:6`, and uses `GameplayMap`/`engine` globals `:48,88,131`; contradicts the target pure-core spec. `packages/mapgen-core/AGENTS.md:18` is itself ambiguous because it says engine interaction goes through `@civ7/adapter`, so Slice 0c must fix that router wording too. | ✔ agree |
| **Recipe-root `tags.ts`** | 🔴 forbidden catalog | 263-line catalog; milestone buckets `M3_/M4_/M10_` `:8,18,28`; centralized `EFFECT_OWNERS` `:55-141`; ~15 importers. SPEC §2.3 violation. | ✔ agree |
| **`domain/morphology/config.ts`** | 🔴 centralized catalog | 877 lines of schemas for 10+ unrelated ops; foundation has no domain-root config catalog. Current SPEC still allows true shared domain config fragments, so the finding is "multi-owner catalog," not "all domain config files are illegal." | independent (named) |
| **`stages/morphology/` & `stages/ecology/`** | 🔴 split-brain shared hubs | the bare hub dirs aren't in `recipe.ts`, but their contents are **load-bearing**: `stages/morphology/artifacts.ts` has ~26 relative importers, `stages/ecology/` ~20. Old single-stage roots never dissolved → now de-facto domain catalogs. (Not "dead orphans" — rehoming is a real refactor, not a delete.) | independent (named; counts verified) |
| **Studio config exports** | 🔴 DX violation | `STANDARD_RECIPE_CONFIG[_SCHEMA]` only in `dist`; runtime machinery already exists: `deriveRecipeConfigSchema` `recipe-config-schema.ts:30`. | ✔ agree |
| **Doc routers / AGENTS.md entrypoints** | 🔴 poor DX | `mapgen-core/AGENTS.md` points at legacy `architecture.md` + missing `design.md`/`climate.md`; mod routers repeat it. | codex (kept) |
| **Presets / `domain/config.ts` barrel** | ✅ clean | presets knobs-only (`earthlike.config.ts`); `domain/config.ts` 3-line thin barrel (allowed). | ✔ agree |

**Op-module conformance (R-001..R-007):** strong overall. Real nits: R-006 violation `compute-era-tectonic-fields/rules/index.ts:580` (rule re-exports a type); `plan-lakes` stub. Consistency gap (not a hard break): 10 foundation ops author `default` inline rather than out-of-line `strategies/`.

---

## 5. Normalization plan (domino-sequenced)

Sequenced so each slice unlocks the next and the cheapest/safest land first. Slice numbering parallels the Codex pass; per-slice tiering and file anchors come from the independent pass. **Two adversarial-review fixes are baked in:** the four "structural forks" are now *pre-decided* (§5.0 Decisions) rather than left open — leaving them open would contradict the whole point of this packet — and the wasted `tags.ts` rename was dropped in favor of going straight to decomposition.

### Slice 0 — Lock the baseline AND the decisions (do first, before code)
Make the spec/docs match §1–§2, and **commit the structural decisions now** so no slice stalls on a fork mid-refactor.

**0a — Decisions to ratify before implementation (veto here, not mid-slice):** these follow from §1's invariants and the user's DX rule. If a decision is rejected, stop and update this packet before code work.
- **D1 — Schema surface.** Adopt the §2.3 public recipe-config contract for default/no-public stages: native `{ knobs?, advanced? }` with auto-applied `advanced`; reserve `advanced` as an SDK key; delete all boilerplate unwrap-`compile`s. This is not just an internal helper: update `createStage`, `StageConfigInputOf`, `StageCompileFn`, `deriveRecipeConfigSchema`, Studio/default-config tests, presets/configs, and docs together. Shape-B stages keep a fully custom public surface rather than receiving an implicit `advanced` merge path. *(Reason: removes the only real schema ceremony; "if the SDK can hide it, hide it"; avoids dual-path config.)*
- **D2 — Lake intent = Hydrology truth; engine lake stamping + placement input migration are prerequisites.** Implement `plan-lakes`, then project explicit lake intent. Because DEF-020 says the adapter lacks explicit river/lake stamping today, Slice 4a must either add the adapter stamping capability and close/update DEF-020, or leave engine lake generation explicitly labeled as projection limitation. Placement must also stop consuming `engineProjectionLakes` as `lakePlan` (`derive-placement-inputs`) before lake truth can be considered normalized. *(Reason: deleting the stub would bless the violation this packet exists to kill, but fail-hard drift checks require a projection capability that does not exist in code, and downstream placement currently reads engine lake output as input truth.)*
- **D3 — Placement = split (not optional).** *(Reason: it's the prerequisite for D4 and the only way G8 can ever pass; there is no defensible "don't split.")*
- **D4 — Resource/discovery authority realignment.** The target posture is plan-authoritative, projected resources/discoveries with fail-hard drift checks, and Swooper ADR-003 already claims that posture; however current placement docs, ADR-ER1-020, and code still accept official-generator/best-effort behavior. Slice 4c must disposition that authority conflict explicitly. If the target wins, update/supersede the conflicting records and implement projection verification; if official generators remain primary, that is not a quiet implementation choice — it must explicitly supersede/reject the ADR-003 truth claim and rename plans/artifacts/docs as diagnostics. Do not silently assert `placed===planned` while ADR-ER1-020 remains unchanged. *(Reason: same invariant as D2; #1348's finite/≥0 check is a half-measure, but accepted authority must be updated honestly.)*
- **D5 — Ecology = ratify split stages and give each stage a genuine surface; do NOT collapse to one mega-stage.** *(Reason: the recipe already commits to split ecology stages; collapsing reintroduces a mega-stage, fighting foundation's "tiny surface per unit" litmus. Because durable docs still describe a single `ecology` stage, Slice 0d/§6 must ratify the split in docs/spec before file moves target standalone stages directly.)*

**0b — Spec/doc realignment:** land §6 edits (spec index, schema/compile model, projection-authority conflicts, and stale-naming fixes).
**0c — Authority routing:** fix `mapgen-core/AGENTS.md`, `mods/mod-swooper-maps/AGENTS.md`, `mods/mod-swooper-maps/src/AGENTS.md` → live canon; remove dead `design.md`/`climate.md` links.
**0d — Inventory:** correct `STANDARD-RECIPE.md` to the 19-stage order; update `ECOLOGY.md` to the split stages.
**0e — Resolve the import guardrail precisely** (blocks G4): the current SPEC already sanctions `@mapgen/domain/<domain>`, `@mapgen/domain/<domain>/ops` for recipe assembly, and `@mapgen/domain/config` for schema/type fragments, while `IMPORTS.md` bans `@mapgen/*` only in canonical docs/examples. Do **not** write a broad `@mapgen/*` ban for mod source. Write a scoped import matrix instead: docs/examples, package public consumers, mod recipe assembly, cross-domain source, and intra-op relative imports. The real decision is narrower: which deep internals (`@mapgen/domain/<domain>/shared/*`, `types.js`, `ops/<op>/**`, etc.) remain allowed because no public surface exists yet, and which must be routed through domain entrypoints before G4 can turn on.
- *Unlocks:* every later slice has one unambiguous target and no open fork.

### Slice 1 — Zero-risk fixture removal (no behavior change)
- **1a.** Inventory `domain/narrative` and remove the unwired op shell plus genuinely unused legacy utilities/config, or classify any still-imported pieces under Gameplay absorption before deletion.
- *(Dropped: the `M3_/M4_/M10_` rename. Renaming ~70 call sites only to dissolve most of them in Slice 3a is wasted work — go straight to decomposition and pick the final colocated names once. G1 therefore turns on after 3a, not here.)*
- *Unlocks:* removes a dead `defineDomain` shell with zero risk.

### Slice 2 — Purity, consumer DX, and the schema affordance
- **2a.** Move `createMap` out of pure core: relocate `authoring/maps/index.ts` to the mod content package (or a `@civ7`-bound package); update `maps/*.ts`. Removes `@civ7/adapter/civ7` runtime import + globals from core. *Highest-value purity fix.* **Atomic-within-PR:** core won't compile between the move and the importer updates — land them together.
- **2b.** Make Studio config source-derived through a browser-safe source artifact module: use a source-exported stage list such as `STANDARD_STAGES` with `deriveRecipeConfigSchema(STANDARD_STAGES)`, plus source-owned defaults/UI metadata. Do not import the runtime recipe module directly into the UI if it remains worker/engine-bound. Eliminates the hidden `dist`/codegen dependency without forcing Studio to load runtime-only glue.
- **2c. (D1) Public config surface + SDK auto-`advanced` affordance.** Add native `{knobs?, advanced?}` support to default/no-public `createStage` usage (synthesize the `advanced` schema from step contracts; reserve the key; auto-apply as the baseline), update config input typing/schema derivation/tests/docs, tighten `StageCompileFn` output typing for Shape B, and migrate foundation top-level step overrides under `advanced`. Then delete the five boilerplate `public`+`compile` blocks (`morphology-coasts:12-53`, `-routing`, `-erosion`, `-features`, `map-hydrology:12-48`), leaving each as default-surface stages. This is a public config contract change, so it is not "tiny" even though the runtime SDK affordance is small.
- *Unlocks:* core is Civ7-free (G3 can go live); every passthrough stage now shares one surface shape, so the schema portion of grading is settled.

### Slice 3 — Colocation (dissolve catalogs & hubs)
- **3a.** Decompose `tags.ts`: move each field/effect tag declaration + `owner` into the closest owning step/stage contract (choosing final colocated names directly); leave `tags.ts` a thin aggregating barrel or delete it if assembly can move fully into `runtime.ts`. *(G1 can go live after all `M\d+_` identifiers are gone.)*
- **3b.** Rehome `stages/morphology/artifacts.ts` → a recipe-owned, stage-neutral morphology shared surface (for example `recipes/standard/shared/morphology/artifacts.ts`, not `src/domain/**`, because dependency IDs are recipe-owned); update ~26 importers; delete the old live-stage-looking hub dir. **Atomic-within-PR.**
- **3c. (executes D5)** Dissolve `stages/ecology/`: move `ecologyArtifacts`/validation into a stage-neutral shared module (not named like a live stage); relocate the pedology/biomes steps into their own standalone stages (D5 target), so no stage imports a sibling's `steps/`. **Atomic-within-PR** (~20 importers).
- **3d.** Break up `domain/morphology/config.ts`: colocate each op's schema into its own `contract.ts` where the fragment is op-local; preserve or recreate only genuinely shared domain config fragments under the closest real owner allowed by the SPEC.
- *Unlocks:* hubs gone → each stage self-contained → G5 can go live; the structural slice below is now local edits.

### Slice 4 — Structural implementation (decisions already made in 0a)
- **4a. (D2) Lakes.** Implement `plan-lakes` (give the stub `index.ts`/`types.ts`/`strategies/`) and add/route through an explicit adapter lake-stamping capability before claiming fail-hard projection parity. Migrate placement input derivation off `engineProjectionLakes` and onto the Hydrology lake-plan truth artifact in the same slice, because `derive-placement-inputs` currently reads `engineProjectionLakes` as `lakePlan`. Update/close DEF-020 and disposition Swooper `architecture.md`/ADR-003 lake claims in the same slice. Until that capability and downstream migration exist, `map-hydrology/lakes.ts` may only describe engine output as projection/materialization evidence, not lake truth.
- **4b. (D3) Split placement.** Promote each `runPlacementStep(...)` block (wonders / floodplains / terrain-validate / restamp / resources / starts / discoveries / fertility) to a contract-bounded sub-step with explicit artifact/effect tags. **Multi-PR, not mechanical:** the blocks share mutable engine state in sequence; extract one boundary at a time, each independently green. This is the largest single effort in the plan.
- **4c. (D4) Resource/discovery authority** (after 4b's boundaries exist): disposition the conflict among current placement docs, ADR-ER1-020, system Swooper Maps ADR-003, and code. If the plan-authoritative target wins, update/supersede the conflicting authority, add the projection capability needed for fail-hard drift checks (`placed===planned` or stronger typed evidence), and delete the dead "diagnostic" plan path. If official generators remain primary, explicitly supersede/reject ADR-003's deterministic resource/discovery claim, rename the plans/artifacts/docs as projection diagnostics, and remove any deterministic-truth claim.
- *Unlocks:* the structurally divergent truth/projection stages are now gradeable; G8 can go live.

### Slice 5 — Consistency pass (low priority)
- Extract `ruggedCoasts` BFS into a morphology op; fix R-006 type re-export at `compute-era-tectonic-fields/rules/index.ts:580`; align foundation's inline strategies to out-of-line `strategies/`; unify `map-morphology` surface idiom + `map-ecology` step layout.

### Slice 6 — Turn on guardrails (§7)
- Land the mechanical checks once the violations they target are cleared, so CI stays green and the repo can't drift back.

---

## 6. Spec realignment actions (make the spec match §1–§2)

These are the edits that turn this packet's decisions into the long-lived SPEC. Keep where the spec already maps; change only where it diverges. For D1, split wording carefully between **accepted target, implementation pending** and **conformance rule after Slice 2c**: docs may describe the target before code lands, but guardrails/tests that reject current unwrap-`compile` or require foundation `advanced` must wait for the 2c consumer migration.

- **Keep:** 7-layer model, truth-vs-projection, colocation default, R-001..R-007, RunRequest boundary, no-`shouldRun`, system ADR-006 morphology naming.
- **Change — spec index hygiene:**
  1. Update `resources/spec/SPEC.md` so its entrypoint points at the active split specs, not the archived/missing `resources/SPEC-target-architecture-draft.md`.
- **Change — schema/compile framing (the core realignment):**
  2. In `SPEC-step-domain-operation-modules.md`, `resources/spec/recipe-compile/architecture/**`, `resources/spec/recipe-compile/examples/EXAMPLES.md`, and `reference/STAGE-AND-STEP-AUTHORING.md`, replace any "public schema vs advanced schema" dual-subsystem or top-level step-id default-surface language with the §2 model: **one surface, one compile, default/no-public `{ knobs?, advanced? }`, public+compile only for genuine custom surfaces, steps own their config contracts.**
  3. State explicitly that **`public` and `compile` are co-required** and that **knobs-only stages need no `compile`** (cite `stage.ts:122-124,140-156`).
  4. Specify the **SDK-native `advanced` affordance (Decision D1):** `advanced` is the canonical per-step override namespace for default/no-public stages — `{ knobs?, advanced?: { [stepId]: stepConfig } }` — and `createStage` applies it automatically as the per-step config baseline. Document that `advanced` is reserved alongside `knobs`; custom public schemas may not define it; Shape B receives no implicit `advanced` merge path. Document that a **hand-written `compile` is the exception**, reserved for genuine transforms (reshaping/merging/deriving step config), and that authoring an `advanced` key plus an unwrap-`compile` is the anti-pattern this affordance removes. (Do **not** carry forward the earlier "advanced is not a schema key" framing — see §8.6; today it *is* a hand-rolled key in 5 stages, and the fix is to make the SDK own it, not to deny it exists.)
  5. Add the ORPC `implement(contract)` analogy (§2.5) as the canonical mental model; cite `DX-ARTIFACTS-PROPOSAL.md:283`.
  6. State that **"no knobs" is legal** (Shape A with pure passthrough) and is *not* a conformance violation — correcting the implicit "every stage needs knobs" reading.
  7. In `SPEC-packaging-and-file-structure.md` §2.3, **forbid the boilerplate unwrap-`compile`** (`compile: ({config}) => config.advanced ? config.advanced : {}` / `config.advanced ?? {}`) once the D1 affordance lands; the SDK supplies it, so a stage that hand-writes it is a conformance smell (paired with G9).
  8. In `how-to/tune-realism-knobs.md`, keep the `knobs`/`advanced` mental model but remove the stale claim that foundation exposes `profiles`; after D1, document foundation's expert overrides under `advanced`, not top-level step ids.
  9. Add an explicit D1 consumer migration gate covering Studio schema/default tests, generated recipe artifacts or their source replacement, presets, and map configs. Existing tests currently assert no foundation `advanced`, so the docs must not mark current code conformant until those tests and artifacts move.
- **Change — projection authority conflicts:**
  10. For lakes, update DEF-020, `docs/system/mods/swooper-maps/architecture.md`, and Swooper ADR-003 when Slice 4a adds explicit lake stamping, or keep engine lakes explicitly documented as a projection limitation until then. Also document the placement input migration away from `engineProjectionLakes` as a blocker for lake truth closure.
  11. For placement resources/discoveries, update or supersede the conflicting placement authority records if D4 is ratified: `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`, ADR-ER1-020, and the relevant Swooper Maps ADR/doc references. Do not claim fail-hard `placed===planned` while those records still describe best-effort/official-generator behavior.
- **Change — stale naming/inventory:**
  12. Update `SPEC-appendix-target-trees.md` to system ADR-006 morphology names (`coasts/routing/erosion/features`), not `pre/mid/post`.
  13. Update `reference/STANDARD-RECIPE.md` to the 19-stage order; update `ECOLOGY.md` to split stages.
- **Change — forbidden-fixture explicitness:**
  14. In `SPEC-packaging-and-file-structure.md` §2.3, add milestone-prefixed tag identifiers (`M\d+_…`) and multi-owner recipe/domain-root config catalogs to the explicit forbidden list. Preserve the SPEC's allowance for genuine shared domain config fragments and the `@mapgen/domain/config` schema/type-only alias.

---

## 7. Convergence guardrails (so it can't relapse)

Encode "the bad architecture" as mechanical CI failures, not review opinions. **A guardrail ships only after the slice that makes the codebase pass it lands** — otherwise it red-bars main on day one. The "turn on after" column is the sequencing contract.

| ID | Fails on | Turn on after |
|----|----------|---------------|
| **G1** | `M\d+_` tag identifiers anywhere in source | 3a (all field/effect tag decomposition uses final names; no milestone tags remain) |
| **G2** | recipe-root catalogs and multi-owner recipe/domain-root catalogs (`config.ts` / `tags.ts` / `artifacts.ts`) that are not thin re-export barrels, scoped recipe-owned shared surfaces, or SPEC-allowed shared schema/type fragments | 3a (`tags.ts` dissolved) + 3b/3c (old artifact hubs rehomed) + 3d (`domain/morphology/config.ts` rehomed or narrowed to true shared fragments) |
| **G3** | Civ7-bound surfaces inside `packages/mapgen-core`: `@civ7/adapter` value imports, `/// <reference types="@civ7/types" />`, and Civ globals such as `GameplayMap`/`engine` outside an explicitly Civ7-bound package | 2a (purity pass removes adapter imports, type references, and globals from core) |
| **G4** | import-policy violations according to the Slice 0e import matrix: docs/examples must not use workspace-only `@mapgen/*`; public consumers use package exports; recipe assembly may use sanctioned `@mapgen/domain/<domain>` and `/ops`; cross-domain source avoids unresolved deep internals once public entrypoints exist; intra-op internals stay relative | **PENDING 0e decision.** Do not ship a broad `@mapgen/*` ban; ship only after the scoped matrix, allowed entrypoints, and remediation are explicit. |
| **G5** | a stage dir importing a sibling stage's `steps/` | 3c (ecology split to standalone stages; no sibling `steps/` reach-ins remain) |
| **G6** | `STANDARD-RECIPE.md` stage list ≠ `STANDARD_STAGES` | 0d (inventory reconciled) — pairs with the 0d doc fix |
| **G7** | non-archive docs referencing superseded stage ids (`morphology-pre/mid/post`) outside migration/history sections | 0b/0d (spec/doc inventory + naming reconciled) |
| **G8** | a broad step (e.g. placement) growing hidden sub-concerns without an explicit contract boundary (heuristic: file LOC ceiling + sub-op count, or allowlist + tracked deferral) | 4b (placement split into contracted sub-steps) |
| **G9** | a stage hand-writing the unwrap-`compile` (`config.advanced ? config.advanced : {}` or `config.advanced ?? {}`) instead of relying on the D1 SDK affordance | 2c (D1 affordance lands; the 5 boilerplate blocks deleted) |

G1/G2 stay off until the relevant catalog dissolves are complete so they don't block the very refactor that satisfies them; G4 stays off until the narrower deep-import policy is decided.

---

## 8. Divergences kept from the independent pass

Where the two reviews differed, this packet keeps the sharper independent finding:

1. **Lakes is a violation, not a soft gate.** Codex framed it as "telemetry not fail-hard." Independent confirmed that *and* that `plan-lakes` is a specced-then-abandoned stub with no upstream lake truth at all → a clean truth-vs-projection violation. (Sharpens Slice 4a.)
2. **Placement localized + #1348 caveat.** God-step entry is `apply.ts:83-351`, backed by helpers through the resource/discovery generator calls past `:586`, via an internal `runPlacementStep` harness mimicking step boundaries without contracts. Commit #1348's discovery-count check is finite/≥0 (`:504-508`), **not** `placed===planned` — discoveries remain engine-authoritative despite it. (Sharpens Slice 4b/4c.)
3. **Orphaned hubs named.** `stages/morphology/` + `stages/ecology/` as a concrete structural smell with import counts (20+/18+). (Drives Slice 3b/3c.)
4. **`domain/morphology/config.ts` (877 lines)** named as a distinct catalog violation, with foundation's zero-`config.ts` colocation as the explicit contrast. (Drives Slice 3d.)
5. **Narrative op shell is empty; remaining narrative utilities are legacy/unwired.** (Slice 1a must inventory remaining imports and either delete unused code or classify it under Gameplay absorption, not blindly remove active utilities.)
6. **`advanced` IS a real schema key (adversarial self-correction).** An earlier draft of §2 asserted "advanced is not a schema key — it's just per-step config passed through untouched." The adversarial pass falsified this against the actual stages: `advanced` is a hand-rolled `public` key in **5 standard stages** (`morphology-coasts/index.ts:14`, `-routing`, `-erosion`, `-features`, `map-hydrology/index.ts:14`), each paired with the boilerplate `compile: ({config}) => config.advanced ? config.advanced : {}`. Verified first-hand against the source. This correction is load-bearing: it is exactly the user's stated pain point, and it produced **Decision D1** (SDK natively owns `{ knobs?, advanced? }` for default/no-public stages), **Slice 2c** (land the affordance, delete the 5 boilerplate blocks), **§6's post-2c conformance rule** (spec forbids the unwrap-`compile`), and **G9** (CI guard). The fix is *make the SDK own the key*, not pretend it doesn't exist.

Codex-only findings kept because they are correct and additive: the doc-router/AGENTS.md entrypoint breakage (Slice 0c) and the recipe-vs-doc inventory drift (Slice 0d, G6).

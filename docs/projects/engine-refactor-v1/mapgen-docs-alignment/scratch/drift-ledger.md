<toc>
  <item id="purpose" title="Purpose"/>
  <item id="drift-table" title="Drift table (spec vs code vs docs)"/>
  <item id="decisions-needed" title="Decisions needed"/>
  <item id="doc-policy" title="Doc policy for mixed state"/>
</toc>

# Scratch: Drift ledger (spec vs code vs docs)

## Purpose

Capture “doc-visible drift” that must be reconciled explicitly in canonical docs:
- where spec/ADRs say one thing
- current implementation says another
- existing docs/examples are mixed or unclear

Goal: produce an actionable, prioritized drift table with:
- **what drift exists**
- **where it lives** (spec / code / docs)
- **impact on readers**
- **recommended resolution** (rename, alias, doc callout, or code change)

## Drift table (spec vs code vs docs)

| Drift | Spec/ADR authority | Current code reality | Current docs reality | Impact | Recommended reconciliation |
|---|---|---|---|---|---|
| Run boundary naming: `settings` vs `env` | ADR-ER1-003 (`RunRequest = { recipe, settings }`) | `packages/mapgen-core/src/engine/execution-plan.ts` defines `RunRequestSchema` as `{ recipe, env }` using `EnvSchema` | Mixed; many docs talk about “settings” or “env” inconsistently | Readers can’t tell what the minimal run-global input is; confuses “config vs settings” | Docs should teach: “today the concrete type is `Env`, conceptually this is the target `RunSettings`”; decide whether to rename in code (breaking) or create an alias layer (`RunSettings = Env`) and migrate docs |
| Dependency kind naming: `buffer:*` vs `field:*` | SPEC-architecture-overview + SPEC-tag-registry mention `buffer:*`; SPEC-step-domain-operation-modules uses `field:*` | Runtime registry uses `field:*` kind (`packages/mapgen-core/src/engine/tags.ts`), and authoring `createRecipe` infers `field:` | Domain conceptual docs talk about buffers/fields interchangeably | High confusion for “mutable engine-facing data surface” | Pick one canonical term for docs (recommend: “field (aka buffer)”), add an explicit glossary section, and decide whether tag prefixes should converge (`field:` everywhere or `buffer:` everywhere) |
| Two compilation layers are under-documented | Spec implies config validation at compile-time and plan compilation into nodes | `compileRecipeConfig` (schema + normalize + op defaults) vs `compileExecutionPlan` (structural nodes only) | Docs often say “compile” without specifying which | Contributors don’t know where validation/defaults belong; misplaces responsibilities | Canonical docs must define: **config compilation** (stage/step schema boundary) vs **plan compilation** (graph compile); enforce language consistency |
| Import alias collision: `@mapgen/*` means different things in different packages | Not specified (build/tooling detail) | `packages/mapgen-core` uses `@mapgen/*` as an internal TS path alias to its own `src/*` (`packages/mapgen-core/tsconfig.paths.json`) while `mods/mod-swooper-maps` uses `@mapgen/domain/*` as an alias to its own domain sources (`mods/mod-swooper-maps/tsconfig.json`) | Docs/examples sometimes use `@mapgen/*` without clarifying scope | Severe confusion for readers: “what package am I importing from?”; copy-paste breaks depending on context | Docs should prefer published entrypoints (`@swooper/mapgen-core`, `@swooper/mapgen-core/authoring`, etc.) and treat `@mapgen/*` as *internal-only* (only within a package/workspace that defines it) |
| Kebab-case vs PascalCase runtime module naming | SPEC-core-sdk says kebab-case in runtime is legacy; prefer `ExecutionPlan.ts` etc | Current engine uses `execution-plan.ts` | Docs sometimes reference spec names | Search friction and perception of “two architectures” | Docs should reference actual file paths but also state the target naming convention and whether a cleanup will happen (defer) |
| Narrative: story-entry contract vs overlays/views | ADR-ER1-008 + ADR-ER1-025 define canonical story-entry artifacts; views/overlays are derived and non-canonical | Narrative domain exists (`mods/mod-swooper-maps/src/domain/narrative/*`) but is not obviously wired into standard recipe stages (needs verification) | Domain docs describe narrative; some references to missing PRD file | Misleads readers: “narrative is canonical but missing in pipeline” | Canonical docs must explicitly state current integration status (wired vs not) and how story entries map to any existing overlay debug views |
| Studio recipe artifacts import surface drift | Not directly in engine-refactor spec; affects DX and examples | Studio imports from `mod-swooper-maps/recipes/*` and `*-artifacts` (see `apps/mapgen-studio/src/recipes/catalog.ts`) | Seams doc references deleted `packages/browser-recipes` / `@mapgen/browser-recipes` | New devs follow docs and hit dead packages | Treat Studio seams docs as partially salvageable; update canonical guidance to current import surfaces (follow-up PR) |
| Studio runner protocol/cancel semantics drift | Not in engine-refactor spec (project-level tooling) | Worker supports `run.cancel` via AbortController; recipe IDs are `${namespace}/${recipeId}`; plan fingerprint used as runId | Some docs describe an earlier proposed protocol and claim cancel is terminate/unimplemented | People trying to extend Studio follow misleading protocol docs and reintroduce dead patterns | Update/replace Studio runner docs with “how it works today”; clearly label older seam/proposal docs as non-canonical |
| “Canonical” doc references missing files | Multiple docs reference `docs/projects/engine-refactor-v1/resources/PRD-target-narrative-and-playability.md` | File does not exist | `docs/system/libs/mapgen/architecture.md` links it | Broken navigation and trust loss | In docs, point to ADR-ER1-008 as current authority; decide whether to restore/create PRD as a separate artifact |

## Decisions needed

Decisions that likely require an explicit choice (and maybe an ADR if not already covered):

1) **Rename `Env` → `RunSettings` (or alias)?**
   - Doc-only alias keeps code stable but leaves a long-lived mismatch.
   - Code rename improves coherence but is breaking across packages and mods.
2) **Canonical dependency kind name: `field` vs `buffer`**
   - If `field:` is canonical, update specs/docs that still say `buffer:`.
   - If `buffer:` is canonical, change code to accept `buffer:` and decide where “engine-facing final fields” live.
3) **Narrative integration status**
   - If narrative is intentionally not in standard recipe yet, docs must say so and point to intended insertion.
   - If narrative should be wired now, create a follow-up implementation task and align docs to planned cutover.

## Doc policy for mixed state

Proposed policy:

- Canonical docs must teach a single, DX-first “happy path” that works today.
- Where spec and code differ, docs must:
  - name the **target term** (“RunSettings”), then immediately map to the **current concrete type** (`Env`) with a 1–2 sentence reconciliation note.
  - avoid implying that future-only features exist (mark as “target / not yet wired”).
- Avoid prose that requires the reader to mentally merge multiple architectures; instead, provide an explicit “Drift” callout section that is short, curated, and links back to this ledger.

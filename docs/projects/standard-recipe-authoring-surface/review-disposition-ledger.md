# Review Disposition Ledger

## 2026-05-31: Corpus And Taxonomy Slice

| reviewer | priority | finding | disposition |
| --- | --- | --- | --- |
| taxonomy/OpenSpec peer | P1 | Migration and Studio proof were sequenced too late as a final shared slice. | Accepted. Project and OpenSpec now require shipped config/preset migration, generated artifact updates, Studio/default/schema proof, and unknown-key tests in the same behavior slice that changes the surface. Final shared slice is guard hardening only. |
| taxonomy/OpenSpec peer | P2 | Flat shape language made `{ knobs?, [publicKey]?: publicConfig }` sound like the default shape. | Accepted. Docs/spec now distinguish default `{ knobs?, [stepId]?: stepConfig }` from justified public+compile transforms with recorded public/internal keys and reason. |
| taxonomy/OpenSpec peer | P2 | `internal-as-public transitional surface` was used without acceptance criteria. | Accepted. Taxonomy/spec now define accepted internal-as-public low-level surfaces and require gameplay/execution meaning, docs, numeric bounds, and no private runtime/projection plumbing. |
| taxonomy/OpenSpec peer | P2 | Deferral language was weaker than the proof posture. | Accepted. Deferral now requires accepted owner, authority reference, trigger, and explicit non-claim of behavior proof. |
| corpus peer | P1 | Strategy coverage collapsed multi-strategy op config leaves onto duplicate paths. | Accepted. Ledger paths now include `strategies.<strategy>.config.*`; duplicate field-path check reports zero duplicates. |
| corpus peer | P1 | Studio focus paths were not enumerated. | Accepted. Ledger now emits `focusRows` for every standard step and summary output includes a Studio focus path table. |
| corpus peer | P2 | Generated artifact coverage omitted dist schema/default/config artifacts. | Accepted. Consumer refs now include standard schema/default/preset, standard artifacts, and standard map-config dist outputs. |
| corpus peer | P2 | Runtime read-site coverage was too narrow. | Accepted. Runtime refs now include core recipe compile/run, standard runtime, Studio runtime recipe registry, Studio worker compile path, and SDK createMap. |
| corpus peer | P2 | Array item schemas were omitted from field coverage. | Accepted. Schema flattening now traverses `items`, including array item object properties. |
| corpus peer | P3 | Step handoff dependencies were not represented. | Accepted. Step rows now include phase, requires/provides tags, and artifact requires/provides. |

## 2026-05-31: Foundation Authoring Surface Alignment Slice

| reviewer | priority | finding | disposition |
| --- | --- | --- | --- |
| OpenSpec/proof peer | P1 | `foundation.meshResolution.cellCount` was still public even though the design treats it as derived. | Accepted. Foundation public schema omits `cellCount`, MapGen and Studio schema guards assert absence, and strict compile tests reject authored `foundation.meshResolution.cellCount`. |
| OpenSpec/proof peer | P1 | Behavior-equivalence proof was temporary rather than durable. | Accepted. Added `mods/mod-swooper-maps/test/fixtures/legacy-foundation-compiled.json` from the pre-slice compiled Foundation output and a focused shipped-config equivalence test. |
| implementation peer | P1 | Studio generated recipe artifacts were stale and still exposed `meshResolution.cellCount`. | Accepted. Regenerated artifacts with `bun run build:studio-recipes`; Studio default schema guard now passes with the explicit `cellCount` absence check. |
| OpenSpec/proof peer | P2 | Foundation public documentation coverage was weaker than the spec/test claim. | Accepted. Strengthened Foundation TypeBox descriptions and added an exhaustive Foundation public-field description guard; ledger now reports `desc missing/weak=0/0`. |
| OpenSpec/proof peer | P2 | Foundation proof/review ledgers did not record the behavior-slice gates. | Accepted. Added Foundation proof and review disposition sections with tests, artifact generation, equivalence fixture, OpenSpec validation, and runtime non-proof. |
| OpenSpec/proof peer | P2 | Deferred profile-collapse work lacked owner, authority, trigger, and proof boundary. | Accepted. Design now names the workstream owner, authority basis, re-entry trigger, and non-claim of final product optimality proof. |
| OpenSpec/proof peer | P2 | OpenSpec forbidden-key scenario omitted legacy `crust-evolution`. | Accepted. Added `crust-evolution` to the forbidden internal Foundation keys scenario. |
| implementation peer | P2 | Compile-equivalence test depended on an untracked fixture. | Accepted. The legacy compiled Foundation fixture is part of the slice write set and will be staged with the tests. |

## 2026-05-31: Morphology Authoring Surface Alignment Slice

| reviewer | priority | finding | disposition |
| --- | --- | --- | --- |
| OpenSpec/proof peer | P2 | Morphology proof and review ledgers did not yet record closure evidence. | Accepted. Added the Morphology proof section with exact commands/results, ledger counts, fixture provenance, Studio artifact proof, OpenSpec validation, peer review disposition, TypeScript residual risk, and explicit runtime non-proof. |
| OpenSpec/proof peer | P2 | OpenSpec tasks did not explicitly require Studio recipe artifact regeneration even though Studio tests consume generated artifacts. | Accepted. Updated tasks to require artifact regeneration and recorded `bun run build:studio-recipes` in the proof ledger. |
| implementation peer | P2 | `volcanoes.maxVolcanoes` documentation said all nonpositive values disable the cap, while the schema accepted only down to `-1`. | Accepted. Clarified the accepted nonpositive sentinel range and broadened the lower bound to `-1000` while preserving a finite authoring range. |
| implementation peer | P2 | Morphology public stage descriptions still used internal `step/op` or `envelope` vocabulary. | Accepted. Reworded public stage descriptions to author-facing map semantics and added generated/source schema guards against `step/op`, `envelope`, or `internal` wording in Morphology public stage descriptions. |

## 2026-05-31: Hydrology Authoring Surface Alignment Slice

| reviewer | priority | finding | disposition |
| --- | --- | --- | --- |
| OpenSpec/proof peer | P1 | Hydrology closure proof and review disposition were not recorded before peer review. | Accepted. Added the Hydrology proof section with exact commands/results, ledger counts, fixture provenance, Studio artifact proof, OpenSpec validation, TypeScript residual risk, and explicit runtime non-proof; this review-disposition section records accepted findings before commit. |
| OpenSpec/proof peer | P2 | Migration notes contradicted the intended `hydrology-hydrography.lakes` semantic public key by listing `lakes` among removed internal authoring keys. | Accepted. Clarified that `lakes` remains a semantic public group while legacy nested `lakes.planLakes.{strategy,config}` is removed, updated the OpenSpec scenario, and added a strict compile-error guard for the legacy nested wrapper. |
| OpenSpec/proof peer | P2 | Hydrology documentation gates did not fully prove author-facing language quality. | Accepted. Normalized cloned Hydrology descriptions away from `strategy`, `internal`, and envelope vocabulary, and added MapGen plus Studio schema guards against `step/op`, `envelope`, `internal`, or `strategy` wording in Hydrology public field descriptions. |
| implementation peer | P2 | Hydrology public knob descriptions still exposed `step config` vocabulary. | Accepted. Reworded Hydrology stage knob descriptions and the shared temperature knob description to author-facing climate/refinement-control language, expanded Hydrology-only description guards to catch plain `step` wording, and regenerated Studio recipe artifacts. |
| implementation peer | P2 | `apps/mapgen-studio/src/ui/data/defaultConfig.ts` still exported stale Hydrology raw envelopes even though current Studio uses generated artifacts. | Accepted. Migrated the legacy source helper to semantic Hydrology baseline/hydrography/refine keys and added a Studio test guard so that helper cannot reintroduce Hydrology raw envelopes. |

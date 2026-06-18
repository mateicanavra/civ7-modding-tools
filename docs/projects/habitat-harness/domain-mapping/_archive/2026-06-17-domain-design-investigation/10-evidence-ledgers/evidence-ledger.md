# Habitat Domain Mapping Evidence Ledger

Every meaningful domain claim in the packet cites this ledger or a scenario
that cites this ledger. Labels separate current behavior, reference intent,
architecture target, hypotheses, and explicit non-claims.

## Evidence Rows

| Evidence ID | Claim | Label | Sources | Scenario / Authority Links | Conflict Check | Confidence | Non-claims | Next Action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E01 | Habitat is currently a repo-local structural toolkit for agents and maintainers. | reference intent | `DOMAIN-MAPPING.md`, `CAPABILITIES.md`, `IMPLEMENTED-SURFACE.md` | S01-S12 | checked against code surfaces S01-S09 | corroborated | final implementation model | keep as product frame |
| E02 | Current Habitat code composition is evidence, not target domain authority. | reference intent | `DOMAIN-MAPPING.md`; `command-engine.ts` mixes routing, check, verify, graph, classify, fix | all | current flows cross one file but have different proof classes | corroborated | current behavior invalid | preserve in packet |
| E03 | Habitat classifies paths/diffs into project, tags, scoped rules, targets, and unavailable target facts. | verified current behavior | `command-engine.ts`, `nx-projects.ts`, `test/lib/classify.test.ts`, `CAPABILITIES.md` | S01, S02, A01 | tests cover supported paths and missing target | verified | final boundary shape | add command examples if needed |
| E04 | Habitat check runs selected rules, normalizes diagnostics, applies baselines, and adds baseline-integrity. | verified current behavior | `createCheckReport`, `selectRules`, `baseline.ts`, rule-selection and baseline tests | S03, A02, A03 | selector and baseline failure paths traced | verified | product runtime correctness | preserve check as enforcement context |
| E05 | Baselines are shrink-only contract artifacts with explicit empty/debt states and integrity failure modes. | verified current behavior | `baseline.ts`, `CAPABILITIES.md`, baseline tests | S03, A03 | guard and integrity paths traced | verified | whether a specific baseline should exist | keep baseline authority separate |
| E06 | Verify produces structured proof and explicit non-claims around Nx affected and product/runtime behavior. | verified current behavior | `createVerifyProof`, `verify-proof.test.ts`, `CAPABILITIES.md` | S04, A12 | skip path on failed check traced | verified | CI equivalence or runtime proof | keep proof contract explicit |
| E07 | Nx graph integration is an infrastructure substrate used by classify, verify, and inferred targets. | verified current behavior | `plugin.js`, `nx-projects.ts`, `createVerifyProof`, `CAPABILITIES.md` | S01, S04, A04 | graph consumers traced separately | verified | domain ownership by Nx | model as Workspace graph integration |
| E08 | Grit diagnostics are acquired through a guarded adapter with scan-root validation, parse failures, cache provenance, and non-claims. | verified current behavior | `grit.ts`, Grit adapter tests, `CAPABILITIES.md` | S03, A05 | acquisition separated from pattern admission | verified | transformation safety | keep Diagnostic pattern catalog separate |
| E09 | Habitat fix is limited to approved Grit apply transactions and does not make broad transformation claims. | verified current behavior | `runFix`, `grit-apply.ts`, Grit apply tests, `CAPABILITIES.md` | S05, A06 | dirty tree, approval, diff, rollback paths traced | verified | arbitrary safe rewrite capability | keep as Transformation transaction |
| E10 | Hooks are local feedback surfaces and explicitly do not replace CI authority. | verified current behavior | `hooks.ts`, hooks tests, hook proof notice, `CAPABILITIES.md` | S06, A07 | pre-commit/pre-push paths traced | verified | CI proof | model Local feedback separately |
| E11 | Generated zones are protected through staged file-layer checks and a generated-check target. | verified current behavior | `generated-zones.ts`, `plugin.js`, generated-zone tests | S06, A08 | hook and CI target roles separated | verified | regeneration itself | model Generated/protected zone authority |
| E12 | Project generation supports only uniform app/foundation/plugin scaffolds and refuses domain-owned shapes. | verified current behavior | project generator code/tests, `IMPLEMENTED-SURFACE.md`, `CAPABILITIES.md` | S07, A09, S10 | refusal message explicitly names unsupported kinds | verified | MapGen topology generation | keep scaffolding narrow |
| E13 | Pattern Authority governs candidate and registered rule admission through manifests and baseline contracts. | verified current behavior | pattern generator, registration program, manifest schema/tests | S08, S09, A10 | Grit prose and Nx options rejected as sufficient authority | verified | authoring UX completeness | use as governance precedent |
| E14 | Habitat is not yet a complete MapGen authoring toolkit. | reference intent plus verified gap | `AUTHORING-NEXT.md`, `GAPS.md`, `DOMAIN-MAPPING.md`, project generator refusal | S10, S11, A11 | current supported generators inspected | corroborated | future generator design | investigate MapGen conventions next |
| E15 | Current code directories are not sufficient domain boundaries. | corroborated domain finding | flow maps F01-F12, authority rows A01-A12, `DOMAIN-MAPPING.md` | all | flows explain behavior better than file layout | corroborated | exact refactor plan | use only for design packet |
| E16 | The Habitat product outcome is ambiguity reduction for humans and agents through routing, enforcement, proof, guarded repair, and governed authoring. | architecture target | S01-S12, `DOMAIN-MAPPING.md`, `CAPABILITIES.md`, `AUTHORING-NEXT.md` | S12 | unsupported authoring kept hypothesis-labeled | corroborated | current full authoring implementation | review against falsifiers |

## Evidence Discipline

- Passing OpenSpec validation proves artifact shape only.
- Passing Habitat classify proves routing only for the exercised path.
- Hook success proves local feedback only.
- Verify proof proves the structured command path and explicit non-claims, not
  product runtime behavior.

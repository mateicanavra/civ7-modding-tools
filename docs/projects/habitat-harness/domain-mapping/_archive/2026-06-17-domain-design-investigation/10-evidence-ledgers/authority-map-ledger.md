# Habitat Domain Mapping Authority Map Ledger

This ledger records one owner per invariant. Current modules may implement more
than one concern; that does not make them the target authority.

## Authority Rows

| Authority ID | Concern | Current Apparent Owner | Target Authority Hypothesis | Evidence | Conflicts | Proof Class | Consumer | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A01 | Project/path ownership and target truth | `classify*`, `nx-projects.ts`, Nx project graph | Orientation and routing | S01, F01, classify tests, `CAPABILITIES.md` | rule scope prose is partly parsed in classify | current command + Nx metadata | agents before editing | verified-current, proposed target |
| A02 | Rule selection and diagnostic normalization | `command-engine.ts`, rule registry, diagnostics schema | Structural enforcement | S03, F03, `rules.json`, rule-selection tests | baselines and proof assembly are nearby but separate | check output + tests | agents, CI, maintainers | verified-current, proposed target |
| A03 | Baseline and shrink-only ratchet state | `baseline.ts`, baseline files, baseline-integrity rule | Baseline authority | S03, F03, `baseline.ts`, baseline tests, `CAPABILITIES.md` | rule introduction manifest and pattern promotion depend on it | baseline files + integrity rule | rule authors, maintainers | verified-current, proposed target |
| A04 | Nx graph integration | `plugin.js`, Nx graph reader, Nx affected calls | Workspace graph integration | S01, S04, F01, F04, `plugin.js`, verify proof tests | classify, verify, and Nx plugin all consume graph facts | Nx graph/target proof | root workflows, classify, verify | verified-current, proposed target |
| A05 | Grit diagnostic acquisition | `grit.ts`, Grit rule mappings, Grit env | Diagnostic pattern catalog | S03, F03, Grit adapter tests, `CAPABILITIES.md` | Pattern Authority owns admission; Grit adapter owns acquisition | fixture/current-tree/adapter proof | structural rule owners | verified-current, proposed target |
| A06 | Guarded structural transformation | `grit-apply.ts`, Biome handoff, rollback | Transformation transaction | S05, F05, Grit apply tests | current apply pattern is MapGen-specific; Pattern governance owns admission | dry-run/apply/rollback proof | maintainers and agents | verified-current, proposed target |
| A07 | Hook-local feedback | `hooks.ts`, Husky delegators | Local feedback | S06, F06, hooks tests, hook proof notice | pre-push uses Nx affected but is not CI authority | hook trace and staged-state proof | local developer workflow | verified-current, proposed target |
| A08 | Generated-zone protection | `generated-zones.ts`, file-layer rules, generated target | Generated/protected zone authority | S06, F06, generated-zone code/tests, `plugin.js` generated target | hook stages local checks; CI generated target is broader | generated-zone check | all agents | verified-current, proposed target |
| A09 | Project scaffolding | project generator | Scaffolding | S07, F07, project generator tests | future MapGen authoring must not use this owner | scratch generation + Nx discovery | agents creating projects | verified-current, proposed target |
| A10 | Pattern candidate admission and promotion | Pattern Authority manifests and pattern generator | Pattern governance | S08, S09, F08, F09, manifest schema/tests | Grit markdown and Nx options are explicitly not enough | manifest + rule registration proof | rule authors and maintainers | verified-current, proposed target |
| A11 | Future MapGen topology authoring | not implemented; referenced by docs | Authoring topology | S10, F10, `AUTHORING-NEXT.md`, `GAPS.md` | MapGen product authority; current project generator refusal | future generator + recipe compile proof | agents authoring MapGen | hypothesis |
| A12 | Proof artifacts and non-claims | verify proof helpers, proof artifact helpers, workstream records | Proof contract authority | S04, F04, proof tests, `proof-artifact.ts` | command success can be mistaken for broader product proof | structured proof artifact + review | DRA owner, reviewers | verified-current, proposed target |

## Authority Findings

- Current `command-engine.ts` implements Orientation and routing, Structural
  enforcement, Proof contract assembly, and Transformation entry routing. The
  file is therefore a conflict signal, not a domain boundary.
- Pattern governance is the clearest existing example of domain language:
  lifecycle, normative sources, proving sources, scan roots, fixture strategy,
  false-positive model, baseline contract, hook decision, and apply safety.
- Future authoring topology must remain hypothesis-labeled until MapGen
  conventions and product acceptance loops are investigated directly.

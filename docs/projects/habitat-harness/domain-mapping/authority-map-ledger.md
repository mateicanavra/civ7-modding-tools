# Habitat Domain Mapping Authority Map Ledger

This ledger records which Habitat authority owns each invariant, decision,
refusal, and proof class. It exists to enforce one owner per invariant before
candidate contexts are promoted into the domain design packet.

## Row Contract

| Field | Required content |
| --- | --- |
| Authority ID | Stable key. |
| Concern | Invariant, decision, refusal, proof class, or transformation boundary. |
| Current apparent owner | Current module, rule, command, doc, or process that appears to own it. |
| Target authority hypothesis | Candidate domain authority after scenario analysis. |
| Evidence | Docs, code, tests, commands, ledgers, or explicit hypothesis. |
| Conflicts | Other owners or duplicated enforcement. |
| Proof class | What proves the concern. |
| Consumer | Who depends on this authority. |
| Status | proposed / verified-current / conflict / unresolved / rejected. |

## Seed Authority Rows

| Authority ID | Concern | Current apparent owner | Target authority hypothesis | Evidence | Conflicts | Proof class | Consumer | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A01 | Project/path ownership and target truth | classify, Nx metadata helpers | Orientation and routing | TODO | TODO | current command + Nx metadata | agents before editing | unresolved |
| A02 | Rule selection and diagnostic normalization | command engine, rule registry, diagnostics | Structural enforcement | TODO | TODO | check output + tests | agents, CI, maintainers | unresolved |
| A03 | Baseline and shrink-only ratchet state | baseline services and baseline files | Baseline authority | TODO | TODO | baseline files + integrity rule | rule authors, maintainers | unresolved |
| A04 | Nx graph integration | Habitat Nx plugin and Nx config | Workspace graph integration | TODO | TODO | Nx graph/target proof | root workflows, classify, verify | unresolved |
| A05 | Grit diagnostic acquisition | Grit adapter and rule mappings | Diagnostic pattern catalog | TODO | TODO | fixture/current-tree/adapter proof | structural rule owners | unresolved |
| A06 | Guarded structural transformation | Grit apply transaction and Biome handoff | Transformation transaction | TODO | TODO | dry-run/apply/rollback proof | maintainers and agents | unresolved |
| A07 | Hook-local feedback | hook orchestration | Local feedback | TODO | TODO | hook trace and staged-state proof | local developer workflow | unresolved |
| A08 | Generated-zone protection | generated-zone checks and file-layer rules | Generated/protected zone authority | TODO | TODO | generated-zone check | all agents | unresolved |
| A09 | Project scaffolding | project generator | Scaffolding | TODO | TODO | scratch generation + Nx discovery | agents creating projects | unresolved |
| A10 | Pattern candidate admission and promotion | Pattern Authority artifacts and generator | Pattern governance | TODO | TODO | manifest + rule registration proof | rule authors and maintainers | unresolved |
| A11 | Future MapGen topology authoring | not implemented | Authoring topology | TODO | MapGen product authority | generator + recipe compile proof | agents authoring MapGen | hypothesis |
| A12 | Proof artifacts and non-claims | verify/proof helpers and workstream records | Proof contract authority | TODO | TODO | structured proof artifact + review | DRA owner, reviewers | unresolved |

## Conflict Rule

If a row has more than one plausible owner, do not resolve it by current file
placement. Resolve it by scenario responsibility, consumer, change pattern, and
proof class. If those still conflict, mark the row `conflict` and block the
candidate context from promotion.

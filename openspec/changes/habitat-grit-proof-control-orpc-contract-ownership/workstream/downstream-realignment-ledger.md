# Downstream Realignment Ledger - Control oRPC Contract Ownership

| Surface | Disposition | Evidence / notes |
| --- | --- | --- |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Updated | Row now records predicate repair, native fixture/parser-edge proof, parser inventory/live zero-candidate evidence, wrapper proof, explicit empty baseline proof, and row-specific injected proof. |
| `openspec/changes/habitat-grit-proof-repair/workstream/command-proof-log.md` | Updated | Command records include row-specific OpenSpec validation, native fixture proof, parser inventory, wrapper proof, injected proof, full OpenSpec validation, and diff hygiene. |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Updated | Corpus row now names the closure packet, proof ids, zero-candidate inventory, explicit baseline, injected proof, and non-claims. |
| `docs/projects/habitat-harness/taxonomy.md` | No change | This row does not change architecture taxonomy or project-plane ownership. |
| `docs/projects/habitat-harness/invariant-corpus.md` | No change | This row records proof for an existing Grit check; it does not add or retire an invariant. |
| `docs/projects/habitat-harness/discrepancy-log.md` | No change | No discrepancy is closed or opened by the bounded fixture/parser inventory checkpoint. |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` | No change | No recovery claim is made. |
| Habitat wrapper/current-tree records | Blocked / non-claim | HR command-trust/selector and adapter surfaces are not in this row's stack/base. |
| Root-index module-contract schema export closure | Repaired / proved | `COCO-PREDICATE-REPAIR-2026-06-16` and `COCO-NATIVE-FIXTURES-2026-06-16` prove direct and aliased root `index.ts` schema re-exports from `./modules/<module>/contract`. |
| Raw acquisition, source remediation, apply safety, broader architecture, product/runtime proof | Non-claim | This row closes the active Grit check proof only; it does not mutate control-oRPC source or prove product/runtime behavior. |

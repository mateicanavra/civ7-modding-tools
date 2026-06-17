# Evidence Log - Studio Recipe Artifacts Proof

| ID | Command or source | Result | Claim supported | Non-claim |
| --- | --- | --- | --- | --- |
| SRA-E1 | `docs/system/ADR.md` ADR-004 | Accepted decision: UI imports recipe artifacts; worker imports runtime recipe modules. | Policy authority exists. | Does not prove current Grit behavior. |
| SRA-E2 | `docs/projects/habitat-harness/invariant-corpus.md` | `eslint-studio-recipe-imports` is assigned to `grit-check`. | Retired invariant and owner mapping exist. | No parity closure. |
| SRA-E3 | `tools/habitat-harness/src/rules/rules.json` | `grit-studio-recipe-artifacts` is registered as enforced `grit-check` with Studio source scope and artifact remediation. | Rule identity and metadata exist. | Metadata does not prove wrapper behavior. |
| SRA-E4 | `.grit/patterns/habitat/checks/studio_recipe_artifacts.md` | Current predicate matches exact runtime recipe imports in Studio `.ts`/`.tsx`, excluding `browser-runner` and `server`. | Authored current predicate exists. | No injected, baseline, raw acquisition, wrapper, or product proof. |
| SRA-E5 | `apps/mapgen-studio/src/recipes/catalog.ts` | UI catalog imports artifact modules and map-config artifacts. | Current allowed UI exemplar exists. | No full inventory proof by itself. |
| SRA-E6 | `apps/mapgen-studio/src/browser-runner/recipeRuntime.ts` | Worker exception imports runtime recipe modules. | Current exception exemplar exists. | Does not authorize UI runtime imports. |
| SRA-E7 | `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter studio_recipe_artifacts --json` on branch `agent-HG-habitat-grit-studio-recipe-artifacts` | Exit 0; one testable pattern succeeds. The committed fixture produces 8 current-predicate matches across default, named, namespace, type-only, side-effect, standard/browser-test runtime sources, and `browser-runnerish`/`serverish` path-lookalike classes. The ignore sample produces 0 matches for artifact imports, map-config artifacts, source lookalikes, re-exports, worker/server exception paths, `.js`/`.jsx`, non-Studio app paths, and package paths. | Native fixture/parser-edge proof for current predicate behavior. | No Habitat wrapper selector truth, current-tree wrapper proof, raw acquisition, baseline proof, injected cleanup proof, Effect adapter proof, retired parity, apply safety, product proof, or exact policy closure beyond current predicate. |
| SRA-E8 | Inline Bun/Node TypeScript parser inventory over `apps/mapgen-studio/src` on branch `agent-HG-habitat-grit-studio-recipe-artifacts` | Scan root: `apps/mapgen-studio/src`; exclusions: `node_modules`, `dist`, `mod`; parsed `.ts`/`.tsx` imports and re-exports with the TypeScript compiler API. Counts: 145 scanned TS/TSX files, 487 import/export references, 2 runtime recipe references, 5 artifact recipe references, 0 current-predicate runtime matches, 2 browser-runner runtime references, 0 server runtime references, 0 UI runtime references, 3 UI artifact references, 0 runtime re-exports, 0 runtime side-effect imports, 2 runtime default imports, and 0 source lookalikes. Temporary stdout was scratch only; durable evidence is this bounded summary. | Parser inventory and live zero-candidate evidence inside the current Studio root. | Not native Grit current-tree behavior, not Habitat wrapper behavior, not raw Grit acquisition, not baseline behavior, not injected violation proof, not product proof, and not stale-record closure. |

## Evidence Still Required

- wrapper current-tree proof after command-trust/selector layer is available in
  this row's stack/base;
- raw acquisition or accepted adapter proof;
- injected proof and cleanup proof;
- explicit baseline proof;
- retired parity proof.

## 1. Baseline

- [x] 1.1 Measure current `nx show project @internal/habitat-harness --json`
  startup.
- [x] 1.2 Measure direct `habitat check --tool source-check --json`.
- [x] 1.3 Map duplicate root, hook, verify, and package-local check lanes.

## 2. Nx Graph Metadata

- [x] 2.1 Replace live plugin domain imports with graph-local target metadata.
- [x] 2.2 Remove Effect/resource/runtime loading from Nx graph construction.
- [x] 2.3 Return one anchored inferred-project map instead of duplicating it for
  every matched registry JSON file.
- [x] 2.4 Keep graph-time failures limited to malformed metadata that Nx needs.

## 3. Scoped Inputs

- [x] 3.1 Drive rule target inputs from `pathCoverage`, `scanRoots`, manifests,
  and source-check policy files.
- [x] 3.2 Keep workspace-wide inputs only for true workspace gates.
- [x] 3.3 Make owner-check inputs the union of owned rule inputs without
  collapsing to broad Habitat inputs unless required.
- [x] 3.4 Replace remaining source-check `unresolved-metadata` records with
  explicit exact path coverage derived from the generated source-check policy.

## 4. Verification Lanes

- [x] 4.1 Define local staged checks as staged-file Habitat/Biome work only.
- [x] 4.2 Define owner checks as scoped Habitat source/structural enforcement.
- [x] 4.3 Define affected checks as Nx-owned project verification.
- [x] 4.4 Remove duplicate Biome/Grit/Habitat execution across root scripts,
  hooks, and verify.
- [x] 4.5 Keep `check:graph` focused on affected package checks plus structural
  validation; explicit build/test/verify/CI lanes own heavier fanout.
- [x] 4.6 Stop root CI from re-entering `habitat verify`; CI owns build, check,
  lint, test, and structural targets directly.
- [x] 4.7 Keep local affected graph and pre-push lanes from expanding dependency
  build/test tasks; `verify` remains the explicit heavier dependency lane.

## 5. Validation

- [x] 5.1 `nx show project @internal/habitat-harness --json`
- [x] 5.2 `bun tools/habitat-harness/bin/dev.ts check --tool source-check --json`
- [x] 5.3 `bun run habitat -- check --owner @internal/habitat-harness --json`
- [x] 5.4 `bun run --cwd tools/habitat-harness check`
- [x] 5.5 `bun run openspec -- validate deep-habitat-effect-fast-check-architecture --strict`
- [x] 5.6 `jq -r 'select(.ownerTool=="source-check" and
  (.pathCoverage[]?.kind=="unresolved-metadata")) | .id'
  .habitat/rules/*/rule.json`
- [x] 5.7 `bun run --cwd tools/habitat-harness test --
  test/rules/registry/contract.test.ts test/rules/registry/facts.test.ts
  test/lib/rule-selection.test.ts test/service/check-service.test.ts`
- [x] 5.8 `nx affected
  --targets=check,boundaries,generated:check,source:check,validate:boundary-taxonomy,validate:grit-patterns
  --base agent-DRA-effect-rule-input-scope-fastpath --head HEAD
  --outputStyle=static --excludeTaskDependencies`
- [x] 5.9 `nx show project mod-swooper-maps --json`

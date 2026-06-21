## 1. Baseline

- [ ] 1.1 Measure current `nx show project @internal/habitat-harness --json`
  startup.
- [ ] 1.2 Measure direct `habitat check --tool source-check --json`.
- [ ] 1.3 Map duplicate root, hook, verify, and package-local check lanes.

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

## 4. Verification Lanes

- [ ] 4.1 Define local staged checks as staged-file Habitat/Biome work only.
- [ ] 4.2 Define owner checks as scoped Habitat source/structural enforcement.
- [ ] 4.3 Define affected checks as Nx-owned project verification.
- [ ] 4.4 Remove duplicate Biome/Grit/Habitat execution across root scripts,
  hooks, and verify.

## 5. Validation

- [x] 5.1 `nx show project @internal/habitat-harness --json`
- [x] 5.2 `bun tools/habitat-harness/bin/dev.ts check --tool source-check --json`
- [x] 5.3 `bun run habitat -- check --owner @internal/habitat-harness --json`
- [x] 5.4 `bun run --cwd tools/habitat-harness check`
- [x] 5.5 `bun run openspec -- validate deep-habitat-effect-fast-check-architecture --strict`

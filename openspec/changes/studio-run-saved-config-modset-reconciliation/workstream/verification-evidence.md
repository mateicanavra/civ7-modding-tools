# Verification Evidence

```json
{
  "change": "studio-run-saved-config-modset-reconciliation",
  "base_head": "628bf4d8fced804b4c5c72045fa7138836e7dfac",
  "state": "static-green-live-pending"
}
```

| Gate | Command Or Oracle | Result |
| --- | --- | --- |
| OpenSpec | `bun run openspec -- validate studio-run-saved-config-modset-reconciliation --strict` | passed strictly |
| Classification | `bun habitat classify <candidate path>` for all active paths | passed; native project, boundaries, and scoped lint gates executed |
| Saved-config projection | focused Nx Studio setup/config tests | passed; 28 tests |
| Unified Studio mount | focused `oneMount` test | passed; stale pre-B2 live-status expectation corrected, 3 tests |
| Project graph | `nx run-many -t check,test --projects=mapgen-studio,control-studio-server,control-orpc,control-direct --outputStyle=static` | passed as one native graph; Studio 289 tests and all four project checks/tests green |
| Boundaries and lint | Habitat boundaries plus scoped Effect/Biome lint | passed; 4 changed TypeScript files have zero diagnostics |
| Rendered saved-config path | one current enumerated `.Civ7Cfg` through Run in Game | pending |
| Review roles | TypeScript/state-space, architecture/authority, product/runtime/library | pending final candidate |

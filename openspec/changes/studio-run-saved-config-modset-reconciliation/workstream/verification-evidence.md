# Verification Evidence

```json
{
  "change": "studio-run-saved-config-modset-reconciliation",
  "base_head": "628bf4d8fced804b4c5c72045fa7138836e7dfac",
  "runtime_source_head": "923d69c89a39dffd17c2f17cec4c6ca4efab7f63",
  "state": "closed",
  "live_request": "studio-run-in-game-mrlu00je-1q2b-3",
  "diagnostics_id": "run-diagnostics-5dfd9f20-4e50-469e-be4d-d2de8dd7a488",
  "run_artifact_id": "run-f13678ee44a0097a9ff4",
  "saved_config": "ToT_BasicModsEnabled.Civ7Cfg",
  "config_id": "swooper-earthlike",
  "seed": 1538316415,
  "map_size": "MAPSIZE_HUGE",
  "player_count": 10,
  "resources": "balanced",
  "setup_map_script": "{mod-swooper-studio-run}/maps/studio-run.js",
  "runtime_dimensions": { "width": 106, "height": 66 },
  "runtime_turn": 1,
  "generated_mod_digest": "e105ec2f4e3aafb5f033b6a5070b361ba0d365a0e9fbeea89f3310a3d07542fd",
  "deployed_mod_digest": "e105ec2f4e3aafb5f033b6a5070b361ba0d365a0e9fbeea89f3310a3d07542fd",
  "civ7_process_before": 35577,
  "civ7_process_after": 35577,
  "result": "complete"
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
| Rendered saved-config path | one current enumerated `.Civ7Cfg` through Run in Game | passed; one rendered request loaded `ToT_BasicModsEnabled.Civ7Cfg`, reconciled the stable generated row, and completed in the same Civ7 process |
| Review roles | TypeScript/state-space, architecture/authority, product/runtime/library | passed; three fresh roles reported no P0-P3 findings |

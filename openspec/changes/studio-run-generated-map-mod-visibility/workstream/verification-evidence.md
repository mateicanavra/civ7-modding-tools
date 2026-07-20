# Verification Evidence

```json
{
  "change": "studio-run-generated-map-mod-visibility",
  "runtime_source_head": "62e6d3fb38f38767b1bbdeb74105ef077e6b666d",
  "live_request": "studio-run-in-game-mrlheeah-v38-3",
  "diagnostics_id": "run-diagnostics-4dce54c3-2a7f-474c-9a76-8a1c068981e4",
  "run_artifact_id": "run-2dcaaf99de3017f19d84",
  "canonical_config_digest": "cfda96a53b5fdd77d280d7ea6799043ac5e844782a17c8c53f01db38d8da296d",
  "launch_envelope_digest": "020e39b0199de8158e8809cd3ff31166a45ea43ed2ba74599bc105b898d634ec",
  "generation_manifest_digest": "2ff02a6c25b93b5bbeee18de4d4a121fa2fd0400376ba64ddfee44b0f889ceb9",
  "generated_tree_digest": "57833a72f09bf31a7aef15aed67e4693526a584f35685e990554fe8f7c713768",
  "deployed_tree_digest": "57833a72f09bf31a7aef15aed67e4693526a584f35685e990554fe8f7c713768",
  "civ7_process_before": { "pid": 74595, "started_at": "2026-07-14T22:48:07-04:00" },
  "civ7_process_after": { "pid": 74595, "started_at": "2026-07-14T22:48:07-04:00" },
  "map_script": "{mod-swooper-studio-run}/maps/studio-run.js",
  "seed": 124,
  "map_size": "MAPSIZE_STANDARD",
  "dimensions": { "width": 84, "height": 54 },
  "turn": 1,
  "result": "complete"
}
```

| Gate | Command Or Oracle | Result |
| --- | --- | --- |
| OpenSpec | `bun run openspec -- validate studio-run-generated-map-mod-visibility --strict` | passed strictly |
| Classification | `bun habitat classify <candidate path>` for all seven paths | passed; Nx check/test, portability, boundaries, and scoped lint gates executed |
| Generated mod | `nx run-many -t check,test --projects=mod-swooper-maps --outputStyle=static` | passed; 75 policy rules and 503 tests, with 2 intentional skips |
| Deployment snapshot | `nx run mapgen-studio:test --outputStyle=static -- test/runInGame/deploymentSnapshot.test.ts` | passed; 1 test and 24 dependency tasks |
| Lint | scoped Effect/Biome lint and root `bun run lint` | changed test passed with zero diagnostics; root audit retains 582 pre-existing errors outside this changeset |
| Control lifecycle | Nx-owned direct-control, control-oRPC, and Studio-server tests | passed at `62e6d3fb3` before this authority-only closure |
| Live rendered path | Studio button request and private diagnostics above | passed; one stable row, exact correlation/digest, same PID, terminal complete |
| Review roles | TypeScript/state-space, architecture/authority, product/runtime/library | passed on successor freeze `a2129cd240871991cc708e344f25fbee2bf3a771f93cb827f7bff4be919f3de2`; receipt-only closure followed |

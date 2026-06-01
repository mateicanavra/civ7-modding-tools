## ADDED Requirements

### Requirement: Resource Runtime Proof Emits Placement Telemetry

Runtime resource proof SHALL include bounded resource-placement telemetry from
the deployed Civ7 map-generation run.

#### Scenario: Resource placement executes in Civ7
- **WHEN** the deployed Swooper Maps standard recipe reaches
  `placement.place-resources` in a Civ7 `MapGeneration` context
- **THEN** the scripting log includes a single
  `[SWOOPER_MOD] RESOURCE_PLACEMENT_V1` JSON line
- **AND** the payload includes planned, placed, rejected, and mismatch totals
- **AND** the payload includes compact planned, placed, and rejected numeric
  resource id lists from the runtime `GameInfo.Resources` catalog
- **AND** the payload includes unique placed type count and min/max placed
  count spread
- **AND** the payload remains parseable within Civ7 `Scripting.log` line-size
  limits

### Requirement: Resource Placement Materialization Uses Engine-Legal Assignments

Resource placement materialization SHALL not treat a locally balanced numeric
plan as sufficient when Civ7 rejects the preferred resource id for a tile.

#### Scenario: Preferred resource id is illegal for a planned tile
- **WHEN** the resource product step materializes planned resource placements
- **THEN** it checks Civ7 resource legality before choosing the resource id for
  that tile
- **AND** it prioritizes covering each candidate resource id on a legal tile
  when one exists
- **AND** it fills remaining placements with least-used legal resource ids
- **AND** the resource placement artifact preserves original preferred ids,
  reassignment counts, unassigned preferred placements, legal candidate ids, and
  unassignable candidate ids separately from final placed outcomes
- **AND** it still records typed placement outcomes rather than invoking the
  aggregate official resource generator

### Requirement: Resource Runtime Proof Uses FireTuner Socket Restart Boundary

Final resource runtime proof SHALL use the downstack FireTuner socket/API
restart path and record its exact branch/commit and command/path.

#### Scenario: Runtime proof is collected
- **WHEN** final resource runtime proof is attempted
- **THEN** the resource stack has verified whether
  `codex/firetuner-socket-studio-restart` at `bb39b3cf7` or a successor is the
  active downstack restart boundary
- **AND** successor restart work is integrated/restacked before proof if it
  exists
- **AND** the restart request is issued through the Studio FireTuner socket/API
  path that uses the downstack socket restart integration
- **AND** the workstream records the exact restart command/path, request id,
  socket response, branch, and commit used
- **AND** if Civ7 stops at a front-end confirmation boundary after the socket
  restart returns true, the workstream records that confirmation step separately
  from the socket/API restart response

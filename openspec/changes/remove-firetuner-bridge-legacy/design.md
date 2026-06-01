## Design

Bridge removal is a deletion and contract-tightening change.

The only accepted runtime control path in repo-owned code is
`@civ7/direct-control`. CLI commands expose that boundary directly:

- `civ7 game health` for listener and scripting-state readiness;
- `civ7 game exec "<js>"` for arbitrary JavaScript command execution;
- `civ7 game restart` for the `Network.restartGame()` convenience path.

Callers do not append bridge logs, shell out to Windows scripts, or silently
fallback to FireTuner UI automation. Direct-control errors stay visible because
they are the actionable failure mode.

## Cleanup Inventory

Repo-owned removal candidates:

- `packages/cli/src/utils/firetunerBridge.ts`
- `packages/cli/test/utils/firetunerBridge.test.ts`
- CLI restart `--transport bridge` and `--bridge-log` options
- operational skill references that instruct agents to append bridge commands
- stale oclif manifest entries from the bridge command

External shared-drive inventory:

- Scanned
  `~/Parallels Tunnel/Sid Meier's Civilization VII Development Tools/Comms`
  for bridge scripts/wrappers and command/log artifacts.
- No `.ps1`, `.bat`, `.cmd`, `.ahk`, `.vbs`, command-log, or bridge-named files
  were present during this cleanup pass.
- `Comms/Modifiers.ltp` was present and preserved because it is not a bridge
  script or wrapper.

Official FireTuner binaries under the Civ7 Development Tools folder are not part
of this deletion. They remain installed tools and reference-client evidence.

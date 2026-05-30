# Proof Boundaries

## Evidence Classes

| Evidence | Proves | Does Not Prove |
|---|---|---|
| Typecheck/test | Source-level contracts exercised by that command | Generated output, deployment, or Civ7 runtime behavior |
| Package build | The package build command completed and emitted expected local artifacts | The mod was deployed, selected, loaded, or executed by Civ7 |
| Generated `mods/<mod-slug>/mod/` files | Source generation produced local mod files | The deployed copy matches or Civ7 loaded the files |
| Deploy command | Files were copied into `<game-data>/Mods/<mod-id>/` | Civ7 discovered, enabled, or executed the mod |
| Deployed file inspection | The OS-level Mods directory contains specific files | The game used those files in a run |
| Log lines | Civ7 emitted the observed message in the bounded log window | A missing message means the behavior is impossible |
| In-game observation | The exercised game path behaved as observed | Unexercised maps, settings, eras, or mod combinations behave the same |
| Official resources | Current game data has the inspected shape | Repo SDK, adapter, MapGen, CLI, or mod policy |

## Closure Labels

Use these labels in final reports and handoffs:

- `built`: the relevant build command completed.
- `generated`: expected files exist in `mods/<mod-slug>/mod/`.
- `deployed`: expected files exist in `<game-data>/Mods/<mod-id>/`.
- `logged`: bounded Civ7 logs contain the named signal.
- `in-game observed`: the relevant path was exercised inside Civ7.
- `resource-backed`: official resources support the stated game-data fact.
- `unresolved`: the available evidence does not prove the claim.

## Claim Discipline

- If only source checks ran, say source checks passed.
- If a build ran, name the package and artifact inspected.
- If deploy ran, name the target Mods directory and mod id.
- If logs were read, name the files and how the log window was bounded.
- If in-game behavior was checked, name the map/mod/settings path exercised.
- If official resources were inspected, name the resource files or directories.

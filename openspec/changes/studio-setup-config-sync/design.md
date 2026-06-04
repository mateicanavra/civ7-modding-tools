## Design

The setup-sync boundary has two owners.

`@civ7/direct-control` owns Civ7 mechanics:

- game parameters are read through `GameSetup.findGameParameter` and written
  through `GameSetup.setGameParameterValue`;
- local/player parameters are read through `GameSetup.findPlayerParameter` and
  written through `GameSetup.setPlayerParameterValue`;
- readback fails if any requested setup option is absent or mismatched.

Mapgen Studio owns authoring intent:

- `Civ7StudioSetupConfig` is the only Studio payload shape for setup choices;
- it admits only bounded game/player setup ids currently supported by Studio;
- it participates in local persistence and Run in Game staleness fingerprints;
- live setup snapshots can hydrate initial leader/civ/difficulty choices without
  forcing a map override, while explicit Sync from Live adopts the live map row.

Map selection is represented as an explicit map-script override. If unset, Run
in Game keeps the existing materialized Studio map path. If set to a different
row, launch honors the override and skips Swooper proof-marker waiting because
the selected row may not run the Swooper generated script.

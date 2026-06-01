## Why

Studio disposable Run in Game is the path that makes the current unsaved Studio
config runnable without turning it into authored source. Live proof showed the
new `studio-current` row is deployed to disk but not visible to Civ setup until
the App UI returns to shell/main-menu. Treating that as a caveat leaves the
central product flow incomplete.

## What Changes

- Add a direct-control setup-row visibility helper that can refresh setup rows
  by returning to shell and reloading App UI when a deployed row is missing.
- Route Studio disposable Run in Game through that helper before setup/start.
- Keep Studio above the canonical package boundary: no raw setup JavaScript or
  local socket logic in Studio.
- Keep process restart as a fallback boundary only if shell reload cannot make
  the row visible.

## Requires

- `direct-control-new-game-setup`
- `studio-run-current-map-config`

## Affected Owners

- `packages/civ7-direct-control`
- `apps/mapgen-studio`
- Studio Run in Game workstream proof ledger

## Verification Gates

- Direct-control mock socket test proving hidden rows become visible through
  shell/App UI reload.
- Studio disposable Run in Game live proof with fresh request/config hash log
  markers.
- OpenSpec validation and Studio Run in Game verifier.

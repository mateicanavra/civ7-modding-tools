## Design

The reload boundary belongs in `@civ7/direct-control` because it is an App UI
state-role behavior, not a Studio endpoint concern. Studio may request a
disposable row reload, but the package owns the command sequence, polling, and
proof shape.

## Setup Row Refresh

`ensureCiv7SetupMapRowVisible` first performs a bounded App UI setup-row read.
If the requested row is visible, it returns without mutation. If the row is
missing and the caller explicitly asks for `reloadIfMissing: "exit-to-shell"`,
it treats that as an explicit reload request, exits the current game to
shell/main-menu, runs `UI.reloadUI()`, then polls setup rows until the requested
file appears or the wait budget expires.

## Studio Behavior

Studio durable rows use read-only row visibility. Studio disposable
`studio-current` rows use the shell reload path because live evidence showed
the deployed row becomes visible after returning to shell/main-menu. Studio then
calls the existing setup/start wrapper; it does not build raw setup commands.

## Failure Boundary

If shell reload still cannot make the row visible, Studio returns a
reload-required error. A full macOS process restart is not part of this slice
unless live evidence later proves shell reload is insufficient.

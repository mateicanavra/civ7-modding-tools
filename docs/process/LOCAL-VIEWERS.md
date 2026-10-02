# Local And Private Viewers

## Civ Map Gallery

- **Phone / tailnet:** [Civ gallery](https://mateis-macbook-pro.taild8da1c.ts.net/civ/gallery.html)
- **On this Mac:** <http://127.0.0.1:5181/gallery.html>
- **Durable files:** `~/Library/Application Support/Civ7Tools/VisualAtlas/huge-1018/`
- **Logs:** `~/Library/Application Support/Civ7Tools/logs/`
- **Current-login process:** launchd job `com.mateicanavra.civ7-gallery`
- **Generation / interpretation:** [native-map-controls visual audit](../projects/native-map-controls/visual-audit.md)
- **Current river classification comparison:** [Four Earthlike cases and sixty full-quality PNGs](https://mateis-macbook-pro.taild8da1c.ts.net/civ/river-density-current/index.html). Twelve existing baseline/sparse/major-only arms hold physical drainage, discharge, heads and exposure. Independent review retains baseline; lower counts remove corridors rather than repair drainage. These ten-player portable planned maps are separate from the twelve-player native milestone. The display compass's +Y convention is recorded explicitly. Source/render/copy inventories and desktop/390px/320px checks are sealed alongside the viewer.
- **Latest native milestone, October 1:** [Ocean coordinate repair: fourteen fresh native views](https://mateis-macbook-pro.taild8da1c.ts.net/civ/ocean-current-repair-1018/index.html), twelve maximum-zoom-out views and two details from the saved Huge1018/1018, twelve-player Exploration run. The installed normal build includes resolved water ownership, final-height cliffs and the latitude-handed ocean transport repair. Appearance is not a vessel-movement or scientific-calibration result.
- **Matching current physical companion:** [Full-map terrain, drainage arrows and discharge](https://mateis-macbook-pro.taild8da1c.ts.net/civ/ocean-current-physical-1018/index.html), with four full-quality PNG exports and exact retained current cohort data. This portable Huge1018 capture uses ten players; it is not a twelve-player native readback or proof of exact screenshot registration. The sealed source, artifact and renderer identities remain alongside the viewer.
- **Previous cliff milestone:** [Seventeen native views and three matched lake controls](https://mateis-macbook-pro.taild8da1c.ts.net/civ/cliff-retention-v24-1018/index.html). The comparison controls are separately sealed experiments, not the production lake-size policy.
- **Interactive same-seed study:** [Huge/1018 comparison](https://mateis-macbook-pro.taild8da1c.ts.net/civ/coherence-huge-1018/index.html)
- **Independent repetitions:** [Huge/42](https://mateis-macbook-pro.taild8da1c.ts.net/civ/coherence-huge-42/index.html), [Standard/1018](https://mateis-macbook-pro.taild8da1c.ts.net/civ/coherence-standard-1018/index.html)
- **Complete basin coordinator:** [Huge/1018 baseline and sparse-river comparison](https://mateis-macbook-pro.taild8da1c.ts.net/civ/coordinator-complete-huge-1018/index.html), with signed hydraulic exchanges and closed-body support; portable evidence, not a new native run.
- **Resolved water ownership:** [Current generated Huge/1018 network](https://mateis-macbook-pro.taild8da1c.ts.net/civ/water-owner-huge-1018/index.html), with prescribed ocean head, finite inland storage and final exposure. Generated evidence only; scientific and native qualification are recorded in the [water-owner ledger](../projects/native-map-controls/external-water-ownership.md).
- **Water and resource-backed starts, October 1:** [Generated full-map drainage viewer](https://mateis-macbook-pro.taild8da1c.ts.net/civ/water-start-earthlike-1018/index.html) and [fourteen fresh native images](https://mateis-macbook-pro.taild8da1c.ts.net/civ/water-start-earthlike-1018/native-gallery.html), twelve wide views and two detail views. The native run uses Huge1018/1018, twelve players, the saved setup and stock cutoff ten. These images precede the separately qualified marine-coast relief correction; they prove neither completed scientific calibration nor vessel movement.

The original survey contains 28 Huge Earthlike/1018 game screenshots and five
analytical maps; the linked milestones retain their own later build identities.
Original PNGs, mobile thumbnails, manifests, data tables and
reproduction scripts are retained together. This is user data, not a temporary
worktree dependency or a 500 MB Git asset. Worktree `.civ7/outputs/` and `/tmp/`
copies are working copies, not the hosting authority.

The `coherence-*` subdirectories hold portable-generated comparisons, not new
Civ screenshots. Each includes `comparison.json`, full admitted configurations,
per-variant data/logs and a standalone `index.html` with physical flow arrows and
PNG exports. Regenerate with the definition-owned `scripts/compare-coherence.ts`;
see [study methodology](../projects/native-map-controls/network-coherence-investigation.md).

This URL uses the existing Mac's **Tailscale Serve**, not public Funnel and not
a separate custom `tsnet` program. The user approved incoming tailnet
connections. Access follows the existing tailnet policy, not a custom
owner-only HTTP rule. Enabling incoming also permits other host listeners
allowed by that policy; Serve itself proxies only this selected gallery.
No Opa service, identity, configuration or access rules are reused or changed.

The phone must be connected to Tailscale. The Mac must be awake and connected.
The origin listens only on `127.0.0.1`; its document root is only the atlas
directory, not the repository or Civ7 user-data directory. No game-control or
debug port is exposed by this Serve route. There is no automatic-login plist:
after logout or reboot, restart the origin below.

## Restart

Use the Mac app's bundled CLI. The Homebrew `tailscale` binary expects a
different daemon and does not manage this Mac app connection.

First inspect the existing process; do not start another copy on its port:

```sh
launchctl list com.mateicanavra.civ7-gallery
```

When it is absent, start the standard-library static server:

```sh
ATLAS="$HOME/Library/Application Support/Civ7Tools/VisualAtlas/huge-1018"
LOGS="$HOME/Library/Application Support/Civ7Tools/logs"
mkdir -p "$LOGS"
launchctl submit -l com.mateicanavra.civ7-gallery \
  -o "$LOGS/gallery.log" -e "$LOGS/gallery-error.log" -- \
  "$(command -v python3)" -m http.server 5181 \
  --bind 127.0.0.1 --directory "$ATLAS"
```

With the Mac Tailscale app connected and incoming connections enabled:

```sh
/Applications/Tailscale.app/Contents/MacOS/Tailscale serve --bg \
  --set-path=/civ http://127.0.0.1:5181
curl --fail --head http://127.0.0.1:5181/gallery.html
curl --fail --head \
  https://mateis-macbook-pro.taild8da1c.ts.net/civ/gallery.html
```

## Stop Or Inspect

Inspect the selected route without changing it:

```sh
/Applications/Tailscale.app/Contents/MacOS/Tailscale serve status
```

Remove only the Civ path and origin; do not reset unrelated Serve routes:

```sh
/Applications/Tailscale.app/Contents/MacOS/Tailscale serve \
  --https=443 --set-path=/civ off
launchctl remove com.mateicanavra.civ7-gallery
```

These stop commands leave the user's Tailscale connection and incoming setting
alone. Updating a gallery should retain its receipts and source identity and
preserve this discoverable entry point rather than hiding a new path in chat.

See [Tailscale Serve](https://tailscale.com/docs/features/tailscale-serve) and
the [Serve command reference](https://tailscale.com/docs/reference/tailscale-cli/serve).

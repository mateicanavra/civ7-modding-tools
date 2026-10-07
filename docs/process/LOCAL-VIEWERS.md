# Local Study Viewers

This guide covers portable Civ7 study galleries. Actual hosting addresses,
storage roots and service state belong in a private instance runbook, not Git.
See [public content boundaries](../DOCS.md#public-content-boundary).

## Find The Evidence

- [Delivery inventory](../projects/native-map-controls/delivery-inventory.md):
  milestone status, dated build identities and relative gallery artifact names.
- [Visual audit](../projects/native-map-controls/visual-audit.md): native camera
  receipts, whole-map views and interpretation limits.
- [Network coherence](../projects/native-map-controls/network-coherence-investigation.md):
  retained physical flow arrows, discharge and same-seed comparisons.
- [Thermal discriminator](../projects/native-map-controls/thermal-boundary-discriminator.md):
  numerical studies and their explicit scientific nonselection or admission.

Gallery names such as `earthlike-marine-ice-atlas-20261002/index.html` identify
artifacts relative to the operator's selected atlas root; they are not public
download links. Keep a private current-host index so these remain discoverable
after a worktree or execution host changes.

## Retain And Publish

Keep original PNGs, mobile thumbnails, manifests, compact data, source identities
and reproduction instructions together outside Git. Temporary output and
worktree copies are not the durable evidence authority. Never silently replace
an earlier gallery's source, build, seed or receipts with a later run.

Native photographs establish appearance. Generated physical-field views show
model intent. Neither proves unit passage, Earth calibration or engine behavior
without the corresponding data or gameplay witness.

Use a standard static server with an explicitly selected document root. Bind
the origin to loopback; publish only that origin through existing access tooling.
For private remote viewing, prefer [Tailscale Serve](https://tailscale.com/docs/features/tailscale-serve)
over a bespoke network service. Public Funnel is a different exposure decision.
Inspect existing routes first and change only the selected viewer route; do not
reset unrelated services or expose game control ports. Select local paths and
addresses in private configuration, not committed launch files.

## Verify A Milestone

Check original and thumbnail dimensions, hashes and nonblank content. Compare
served HTML, manifest and representative image bytes with retained files. Open
the viewer at desktop and phone widths and check all images load without text
overlap or horizontal overflow. Visually inspect the intended panels, not just
the first thumbnail. Record native capture, generated render and publication
checks separately so a working URL cannot be mistaken for fresh game evidence.

The definition-owned `scripts/compare-coherence.ts` regenerates portable network
comparisons; see its owning study for configuration and source requirements.
Native screenshots use the existing CLI camera/capture workflow rather than
reconstructed map artwork. Workspace setup and useful game operations live
in the [portable operating guide](CIV-DEVELOPMENT-HOST.md).

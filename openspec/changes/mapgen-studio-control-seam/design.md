## Design

This began as a **design seam** slice, but after the live-control stack landed the
seam is now bound to the mainline `@civ7/control-orpc` package. The enduring
owner rule is unchanged: Studio UI code consumes a small live-control port; the
transport client and control-oRPC contract imports stay behind that port.

## Why a thin port, not a direct dependency

`@civ7/control-orpc` is no longer an external future stack, but directly importing
the transport client across UI/query/store code would still make the Studio shell
fragile. The studio therefore depends on **one `LiveControlPort` interface** under
`apps/mapgen-studio/src/lib/control/`.

The current implementation is **bound**: RPCLink → `createORPCClient` speaks to
the Studio-hosted `/api/civ7/rpc` middleware. The legacy direct-control-backed
fallback was a pre-bind design option and is no longer the active path for
readiness.

The blast radius of a control-oRPC breaking change is then `src/lib/control/*`
plus the Studio-hosted middleware adapter, not the app shell or feature panels.
This mirrors the `effect-orpc` isolation discipline already mandated for the
studio-server router layer (00-GOAL: "isolate it … blast radius ~30 lines").

## Read vs mutation boundary

The studio's seam is **read-only**: `world.current`, `world.grid.read`,
`world.plot.read`, `readiness.current`, and optionally `attention.*` / `strategy.*`.
Mutation procedures exist in the contract but are gated by the bridge's
controller-proof boundary and are **out of scope** for the studio redesign. The
authoritative read-vs-mutation classifier is the contract's per-procedure
`risk` metadata (`read-only | runtime-support | mutation`), never a studio-local
hardcoded list.

## Envelope as data, not exceptions

The `Civ7IntelligenceBridge` ingress never throws across the seam — failures are
`{ ok: false, error: { code, message, reason } }`. The port surfaces failures as
typed results, preserving the existing live-runtime poll's cross-failure adaptive
backoff and the `allSettled` per-field error posture. This is a **move** of the
read source behind a port; it does not rewrite the poll's staleness/backoff gating
(hard core).

## Provenance and the falsifier

The contract surface is now the mainline `@civ7/control-orpc` package. The
post-restack binding composes Studio's own `/rpc` live-status read with
`liveControlPort.readiness.current()` so the redesigned shell sees the landed
control readiness without reviving direct FireTuner reads or reimplementing
control logic. A future structural divergence in namespaces/keys/shapes still
fires the FRAME §3 falsifier and must be re-baselined at the port, not worked
around in UI consumers.

## Review Lanes

- Control-oRPC contract-surface accuracy (against the mainline package).
- Seam boundary correctness (no FireTuner/direct-control reads in UI; control-oRPC
  imports remain behind `src/lib/control/*` and the server middleware adapter).
- Audit/architecture re-baseline consistency.

## Design

This is a **design seam** slice: read-only on app code, docs-only output. It
captures the *target* control-oRPC contract the studio binds to later, so the
studio's server/data work can proceed off `main` without waiting for the
live-control stack to consolidate and merge.

## Why a thin port, not a direct dependency

`@civ7/control-orpc` is pre-merge, mid-consolidation, and single-lane-owned. If
the studio imported it directly across UI, query, and store code, every fold or
rename in the 570→≤50 consolidation would ripple through the studio. Instead the
studio depends on **one `LiveControlPort` interface** with two implementations:

1. **legacy** — over the existing `@civ7/direct-control`-backed studio-server
   read endpoints (today's behavior, retained until bind);
2. **bound** — over an RPCLink → `createORPCClient` → `createTanstackQueryUtils`
   client speaking the contract (target).

The blast radius of a control-oRPC breaking change is then `src/lib/control/*`
only. This mirrors the `effect-orpc` isolation discipline already mandated for the
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

The contract surface is captured from the live-control stack tip
(`codex/live-control-hotseat-source-route-adoption`, `7ea1cbd5`), not from `main`.
The playbook consolidation may rename branches and lightly reshape schemas. The
bind-time checklist re-pins the tip and diffs the captured namespaces/keys/shapes;
a structural divergence from this capture fires the FRAME §3 falsifier ("the
designed seam is incompatible with what lands on `main`") and must be escalated,
not papered over.

## Review Lanes

- Control-oRPC contract-surface accuracy (against the stack-top package).
- Seam boundary correctness (no FireTuner, no direct control imports in the studio).
- Audit/architecture re-baseline consistency.

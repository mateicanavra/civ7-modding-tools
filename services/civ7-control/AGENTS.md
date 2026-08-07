# Civ7 Control Transition Router

Scope: `services/civ7-control/**`

This tree is frozen migration evidence, not the destination controller service.
Do not add public behavior, modules, exports, provider dependencies, transport,
compatibility facades, or structural law here.

Route retained behavior through the normative
`docs/projects/civ7-capability-realization/{PRODUCT-AUTHORITY.md,
SYSTEM-MODEL.md,SOURCE-RECONCILIATION.md,PUBLIC-SURFACE-DISPOSITION.md,
WORKSTREAM.md}` packet:

- typed native operations move to `services/civ7-controller`, execute inside
  Civ7, and are realized through the dedicated controller mod;
- actor intent, policy, reconciliation, no-repeat, and next-action behavior move
  to `services/civ7-play`;
- Tuner contract/provider lifecycle stays below qualified host app binding;
- raw JavaScript remains only an explicit app-owned diagnostic escape hatch;
- generic window capture remains a diagnostic or qualified app-observation
  capability and is not injected into the controller;
- APIs and commands project public clients without importing private contracts
  or routers.

Existing behavior may be repaired only when needed to preserve a current
consumer until its complete vertical migrates. Each migrated vertical deletes
its host implementation and consumer edge in the same semantic cut. No old/new
switchboard or facade is admitted.

Current tests are behavior evidence. Reconstruct useful assertions at their
qualified owner and delete architecture-only or displaced assertions; do not
mechanically retarget the superseded proof ledger.

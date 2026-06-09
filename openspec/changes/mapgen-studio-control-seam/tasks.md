## 1. Capture Stack-Top Contract Surface

- [x] 1.1 Identify the tip of the live-control `codex/*` stack from the
  consolidation playbook and `gt ls` / `git log` (observed leaf
  `codex/live-control-hotseat-source-route-adoption`, commit `7ea1cbd5`).
- [x] 1.2 Capture the `@civ7/control-orpc` exported surface from `src/index.ts`:
  contract, router, server client, intelligence-bridge ingress, error map,
  metadata.
- [x] 1.3 Capture the contract namespaces and procedure-key corpus
  (`world`, `readiness`, `attention`, `strategy`, `notifications`, `turn`,
  `city`, `unit`, `diplomacy`, `government`, `narrative`, `progression`).
- [x] 1.4 Capture the `Civ7IntelligenceBridge` ingress request/response envelope,
  the `invoke` boundary, the controller-proof mutation gate, and the
  `risk`/`proofBoundary` read-vs-mutation classifier.

## 2. Author The Seam Doc

- [x] 2.1 Write `architecture/12-control-seam.md`: target contract surface,
  envelope, data flow, boundaries, domain organization.
- [x] 2.2 Specify the thin `LiveControlPort` adapter seam (bound RPCLink impl +
  legacy direct-control fallback impl behind one port).
- [x] 2.3 Specify boundary rules (reads-only for the studio, no FireTuner, no
  control-orpc/direct-control imports outside `src/lib/control/*`) and the
  bind-time checklist + falsifier.

## 3. Re-Baseline And Validate

- [x] 3.1 Re-baseline `audit/05-server-contracts.md` header: studio-server surface
  only; FireTuner read rows superseded by the control seam.
- [x] 3.2 Re-baseline `architecture/10-target-architecture.md` §1: live reads bind
  through the control seam (initially designed toward stack-top; rebaselined in
  §4 after the package landed).
- [x] 3.3 Run `bun run openspec -- validate mapgen-studio-control-seam --strict`.

## 4. Post-Landing Bind Rebaseline

- [x] 4.1 Rebaseline this change from "designed-toward stack-top" to the landed
  mainline `@civ7/control-orpc` package.
- [x] 4.2 Move the browser control-oRPC client behind
  `apps/mapgen-studio/src/lib/control/*`.
- [x] 4.3 Compose Studio `/rpc` live-status with
  `liveControlPort.readiness.current()` inside the decomposed `StudioShell`.
- [x] 4.4 Validate the bound seam with targeted Turbo check/build/test and strict
  OpenSpec validation.

# Direct-Control Game Controller Bridge Downstream Realignment Ledger

## Phase

- Project: Civ7 Intelligence Layer
- Phase: direct-control-game-controller-bridge
- Owner: Codex workstream lead
- Census run: 2026-06-03

## Pre/Post Census

- Affected project specs/reviews:
  - `openspec/changes/direct-control-read-surface/`
  - `openspec/changes/direct-control-action-surface/`
  - `openspec/changes/civ7-direct-control-surface/`
- Affected issue/milestone artifacts:
  - `docs/projects/civ7-intelligence-layer/open-threads-workstream-record.md`
  - `docs/projects/civ7-intelligence-layer/assumption-audit-workstream-record.md`
- Affected canonical docs:
  - `docs/system/ADR.md`
- Affected tests/guards/scripts:
  - future controller tests and direct-control mock socket tests; none patched
    in realignment-only pass.
- Affected generated-output assumptions:
  - no generated output patched; future controller mod output must be generated
    from source.
- Affected phase records / Next Packets:
  - this phase record, next packet, and supervisor notice.

## Disposition

| Item | Impact | Disposition | Patch/No-Patch Evidence | Owner | Trigger |
| --- | --- | --- | --- | --- | --- |
| `runtime-bridge-and-probes.md` | Old wording made full controller a future direction and understated App UI/Tuner parity | patched | Runtime evidence and mechanism classifications updated | Intelligence layer | Current realignment |
| `SOLUTION-FRAME.md` | Solution still treated controller as subordinate companion instead of baseline implementation candidate | patched | Current answer, mechanics, first slice, operating rules, outcomes, and open question updated | Intelligence layer | Current realignment |
| `actuation-path-map.md` | Path map demoted full controller to direction/not baseline | patched | Executive answer, classifications, mechanics, and thread resolution updated | Intelligence layer | Current realignment |
| `PROJECT-civ7-intelligence-layer.md` | Project kickoff omitted controller bridge from first implementation slice | patched | Workstream structure and first slice now include controller owner, mod, client, and parity probes | Intelligence layer | Current realignment |
| `docs/system/ADR.md` | ADR wording says fuller in-game controller is a future direction | patched | ADR-007 retitled and decision updated to game-scoped controller baseline candidate | System ADR | Current realignment |
| `direct-control-state-role-model` | Normative spec assigned post-Begin gameplay ownership to Tuner | patched | Spec/design now add controller readiness and controller-first proven gameplay calls | Direct-control OpenSpec | Current realignment |
| `direct-control-read-surface` | Design says post-Begin gameplay reads target Tuner | patched | Spec/design/tasks now supersede Tuner-default reads through controller bridge | Direct-control OpenSpec | Current realignment |
| `direct-control-action-surface` | Design does not name controller as target for future validation/send migration | patched | Spec/design/tasks now move validation/approved helpers to controller after proof | Direct-control OpenSpec | Current realignment |
| `direct-control-capability-catalog` | Catalog omitted controller `capabilities.list` as first-class provenance | patched | Proposal/design/spec add controller capability provenance | Direct-control OpenSpec | Current realignment |
| `studio-run-in-game-robustness` | Readiness stopped at `tuner-ready` for gameplay claim | patched | Design adds future `controller-ready` phase | Studio/OpenSpec | After controller bridge lands |
| Historical lane reports | Earlier reports said Tuner stronger or controller future target | patched | Supersession notes added instead of silent rewrites | Intelligence layer | Current realignment |
| oRPC/Effect substrate docs and skills | Active docs/skills treated oRPC as external-only and the App UI global as the custom product RPC | patched | ADR, runtime bridge, OpenSpec, solution docs, workstream records, and `civ7-orpc-control-architecture` now make the game controller an in-process oRPC/Effect service behind serialized ingress | System/OpenSpec/Skills | Current substrate correction |
| `packages/civ7-direct-control/README.md` | May need to mention controller invocation after implementation, not before | deferred | No public API exists yet | Direct-control package | After controller client exists |

## Required Closure Statement

- Downstream assumptions that changed: App UI game context is now the primary
  controller runtime candidate for gameplay reads, validation, and exact
  approved helper execution. Tuner remains a socket state/canary and historical
  wrapper target, not the deployment target. oRPC/Effect is now the shared
  service substrate for the game controller, external direct-control bridge API,
  and future internal AI intelligence services; the App UI global is serialized
  ingress only.
- Artifacts patched: active docs/specs/skills in this workstream.
- No-patch rationale: package README stays unchanged until an actual controller
  client exists.
- Blocked/deferred items: code/test changes are deferred to the implementation
  tasks in the OpenSpec change.
- Exact next downstream action: implement the controller mod and direct-control
  client from the oRPC/Effect router/runtime substrate, then collect lifecycle,
  parity, and disposable approved-action proof.

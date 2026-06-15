## ADDED Requirements

### Requirement: Studio Runtime Engine Corpus Is Complete

D2 SHALL define an authoritative corpus for every Studio stateful runtime engine and every retained control mutation surface before migration packets move code.

#### Scenario: App-hosted runtime engines are classified

- **WHEN** D2 scans the Studio app runtime sources
- **THEN** every Autoplay, Run in Game start/status, Save/Deploy start/status, current-operation, operation queue, operation store, operation phase/projection artifact, active error bridge, server identity, deploy runner, map config materialization, Civ process control, scripting log, proof builder, operation event publisher, live-game read model, and live-game watcher source is represented in the runtime corpus ledger
- **AND** each row names its current owner, target owner, classification, downstream domino, risk if omitted, proof oracle, and re-entry trigger

#### Scenario: Control-oRPC mutation procedures are classified

- **WHEN** D2 scans production `@civ7/control-orpc` sources
- **THEN** every `civ7ControlOrpcMutationProcedure` declaration is represented in the control-oRPC classification ledger
- **AND** each row is classified as retained package authority unless a named downstream OpenSpec change owns a different reviewed decision
- **AND** retained rows name the direct-control/session ownership boundary they preserve

#### Scenario: Control-oRPC behavior state machines are classified

- **WHEN** D2 scans production `@civ7/control-orpc` sources for live game state machines that do not use `civ7ControlOrpcMutationProcedure`
- **THEN** display explore, display queue current/close, camera focus, and appshot capture procedures are represented in the control-oRPC classification ledger
- **AND** each retained row names the display queue, visibility grant, clean-frame, camera, capture, or direct-control boundary it preserves

#### Scenario: No runtime mutation surface is invisible

- **WHEN** a reviewer compares the D2 ledgers against the D2 frame-required corpus
- **THEN** no manual Studio engine, operation store, queue, server identity owner, deploy runner, process control helper, scripting log proof helper, event publisher, live-game watcher, control-oRPC mutation procedure, or retained control-oRPC behavior state machine remains unclassified
- **AND** any deferred surface names an OpenSpec owner, risk, and re-entry trigger

### Requirement: D2 Does Not Implement Or Bypass Migration

D2 SHALL be a corpus and classification packet only. It MUST NOT introduce runtime fallback lanes, compatibility shims, support-both command paths, or code migration shortcuts.

#### Scenario: Corpus packet stays forward-only

- **WHEN** D2 is accepted
- **THEN** its ledgers route all implementation work to D2.5 through D12
- **AND** it does not authorize app-local stateful engine ownership after the owning migration domino lands
- **AND** it does not move `@civ7/direct-control` raw session/protocol authority into the Studio operation runtime

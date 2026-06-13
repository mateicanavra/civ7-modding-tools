## ADDED Requirements

### Requirement: Mapgen Studio Root-Load Proofs Are Assertion-Preserving

Habitat H4 root-test proof repairs SHALL keep existing mapgen-studio
behavioral assertions intact while making the proof resilient under repo-wide
Nx load.

#### Scenario: Browser visibility proof uses a compact standard recipe fixture
- **WHEN** `standardLayerVisibility` runs in the browser-worker harness
- **THEN** it still executes the standard recipe
- **AND** it still requires `run.finished`, default-visible core balance
  layers, default-visible tile movement vector/arrow layers, and debug-only raw
  world motion layers
- **AND** the fixture scale is compact enough to run inside the explicit
  project/root-load timeout budget

#### Scenario: Effect-scoped tuner session closes gracefully under load
- **WHEN** the shared `Civ7TunerSession` proof runs under saturated root-load
  execution
- **THEN** the test still proves two uses share exactly one connection
- **AND** disposing the `ManagedRuntime` still emits a peer-observed FIN
- **AND** cleanup runs even if a command assertion fails before disposal

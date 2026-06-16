## ADDED Requirements

### Requirement: Control App Surface Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-control-app-surface` as complete until
row-level proof records separate native fixture behavior, parser inventory,
Habitat wrapper behavior, raw acquisition or accepted adapter proof, injected
violations, explicit baseline behavior, apply safety, classify/generator
behavior, and downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter control_app_surface --json` exits 0
- **THEN** Habitat records native fixture proof for `control_app_surface`
- **AND** Habitat SHALL NOT claim raw acquisition, broad direct-control import
  closure, DDIT adapter activation, classify/generator behavior, apply safety,
  or product/runtime proof from that command

#### Scenario: Control surface parser inventory is recorded

- **WHEN** the row records parser inventory for `apps` and `packages`
- **THEN** the record SHALL name scan roots, exclusions, current-predicate path
  classes, counts, row id, live match list status, and non-claims
- **AND** stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live current-predicate candidates SHALL be recorded as blocker or
  disposition inputs rather than clean closure

### Requirement: App And Package Code Avoid Caller-Local Civ7 Sessions

Production app and package TypeScript/TSX files SHALL avoid caller-local
`new Civ7DirectControlSession(...)` construction outside the sanctioned
session owner files.

#### Scenario: App code constructs a direct-control session

- **WHEN** a production file under `apps/**/*.ts` or `apps/**/*.tsx`
  constructs `new Civ7DirectControlSession(...)`
- **THEN** `grit-control-app-surface` SHALL report the constructor

#### Scenario: Package code constructs a direct-control session outside owners

- **WHEN** a production file under `packages/**/*.ts` or `packages/**/*.tsx`
  constructs `new Civ7DirectControlSession(...)`
- **THEN** `grit-control-app-surface` SHALL report the constructor unless the
  file is a sanctioned session owner

#### Scenario: Sanctioned owners and tests use constructors

- **WHEN** the constructor appears in the direct-control session
  implementation, the Studio `Civ7TunerSession` service, tests, source
  strings, identifier references, or wrapper/helper calls
- **THEN** this row SHALL classify those forms as controls or non-claims, not
  current-row violations

### Requirement: Control App Surface Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for `grit-control-app-surface`.

#### Scenario: Shared and row-specific proof classes stay separated

- **WHEN** current shared wrapper selector and explicit baseline proof exist
  through accepted HGPR ids
- **THEN** row records MAY cite those shared ids as inherited current state
- **AND** row records SHALL cite CAS-specific wrapper selector, baseline
  inventory, and injected-probe evidence before treating those proof classes as
  satisfied for this registered row
- **AND** row records SHALL keep raw direct Grit acquisition, broad
  direct-control import policy, DDIT adapter activation, source remediation,
  classify/generator behavior, apply safety, broader control architecture
  closure, and product proof as separate non-claims unless separately proven

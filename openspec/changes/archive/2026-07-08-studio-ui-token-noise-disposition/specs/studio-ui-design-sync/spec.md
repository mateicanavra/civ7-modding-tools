## ADDED Requirements

### Requirement: Authored Token Inventory Is Repo-Verified

The `@swooper/mapgen-studio-ui` package SHALL verify its design-token surface
from the built stylesheet: every CSS custom property in `dist/styles.css` MUST
classify as either an authored token pinned in a committed fixture (name, kind,
scope) or a framework-owned property (`@property`-registered or a Tailwind
internal name), and the verification MUST fail on any property that is
neither.

#### Scenario: A new authored token is added without updating the fixture
- **WHEN** a developer adds a new custom property to the package theme CSS and
  rebuilds
- **THEN** `mapgen-studio-ui:test` fails naming the stray property
- **AND** the failure message directs the developer to add it to the authored
  fixture with a kind, or to recognize it as a framework surface change

#### Scenario: A Tailwind upgrade changes the engine-variable surface
- **WHEN** a Tailwind version bump emits a new internal custom property outside
  the known framework predicate
- **THEN** the guard fails visibly instead of silently absorbing the new
  surface
- **AND** updating the framework predicate or fixture is a reviewed diff

### Requirement: Synced Design Guidance Carries The Token Noise Disposition

The design-sync upload SHALL include a guidelines document that names the
authored token vocabulary and dispositions the known `check_design_system`
framework-noise findings, so design agents working in the DS project do not
re-diagnose them or apply breaking "fixes."

#### Scenario: A design agent encounters the recurring findings
- **WHEN** a design agent runs `check_design_system` in the MapGen Studio DS
  project after the next re-sync
- **THEN** the project's guidelines document identifies the unclassified-token
  and selector-scoped-property findings as Tailwind v4 engine internals
- **AND** it prohibits moving `--tw-*` properties to `:root` and hand-editing
  synced stylesheets

#### Scenario: Guidelines ride the sync without render impact
- **WHEN** the guidelines file is added and the sync driver runs
- **THEN** the delta is documentation-tier (no component render hashes change)
- **AND** no component grade contract is re-keyed by the config addition

### Requirement: Upstream Classifier Feedback Is Durably Routed

The repo SHALL maintain the classifier defect report as a durable artifact
addressed to the design-sync/claude.ai-design maintainers, and SHALL record a
deferral with an explicit re-check trigger instead of treating the findings as
locally fixable.

#### Scenario: A future session revisits the findings
- **WHEN** an agent investigates the recurring findings after this change
- **THEN** the deferrals record points to the feedback packet and the frame
- **AND** the recorded trigger (new Claude Code / design-sync version) tells
  the agent when re-evaluation is warranted rather than re-deriving ownership

## ADDED Requirements

### Requirement: The Recipe Pipeline Is A First-Class Stage View

The Studio SHALL present the recipe dependency graph as a Pipeline stage
view, switchable with the Map view via a floating segmented control at the
stage's top edge, with the map canvas remaining mounted (camera state and
in-flight operations unaffected) and the map-scoped Explore dock hidden
while the Pipeline view is active. This re-expresses the merged
`mapgen-recipe-dag-visualization` chrome inside the redesigned shell; the
projection contract, oRPC transport, and headless layout/domain/label
modules are consumed unchanged.

#### Scenario: Switching to the pipeline view

- **WHEN** the user activates the Pipeline tab of the stage-view switcher
- **THEN** the recipe DAG for the currently selected recipe renders in the
  stage area, the Explore dock is absent, and the Recipe dock, Game bar,
  and World console remain

#### Scenario: Returning to the map view

- **WHEN** the user activates the Map tab after viewing the pipeline
- **THEN** the map canvas reappears with its previous camera state and any
  in-flight generation continues unaffected

### Requirement: Pipeline Data Loads On Activation And Caches Per Recipe

The pipeline view SHALL fetch the recipe DAG over the preserved oRPC
transport on first activation per recipe, cache results keyed by recipe id,
and surface loading and error states in the stage; switching recipes
re-fetches only for uncached recipes.

#### Scenario: Lazy fetch with cache

- **WHEN** the Pipeline view activates for a recipe already fetched this
  session
- **THEN** the cached DAG renders without a new request

#### Scenario: Error surface

- **WHEN** the DAG request fails
- **THEN** the stage presents an error card naming the failure and the map
  view remains reachable

### Requirement: Pipeline Interaction Semantics Match The Merged Feature

The Pipeline stage SHALL preserve the merged feature's interaction
semantics: stage selection separate from step expansion (click-again
unselects; expansion is an accessible detail shelf), selectable
per-artifact connector labels whose selection activates every branch
carrying that artifact and its endpoint stages, focus that dims unrelated
elements and raises active ones, neutral idle connectors, domain-driven
accents/glyphs shared across nodes, lane labels, edge pills, step chips,
and diagnostics, and a diagnostics panel when the projection reports
issues.

#### Scenario: Selection and expansion stay separate

- **WHEN** a stage node's expand control is activated
- **THEN** the step shelf opens (`aria-expanded`, `aria-controls`) without
  toggling the node's selected state semantics, and selecting the same
  stage again unselects it

#### Scenario: Artifact label selection focuses its branches

- **WHEN** a connector label is selected
- **THEN** every connector carrying that artifact and its endpoint stages
  render active with the providing stage's domain accent while unrelated
  labels hide and unrelated stages dim

#### Scenario: Idle graph stays neutral

- **WHEN** no stage or label is selected
- **THEN** connectors and labels render in the neutral chrome ink with no
  domain accent applied

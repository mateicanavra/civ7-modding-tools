## ADDED Requirements

### Requirement: A Completed First Run Shows Visible Matter

When a browser run completes from the empty stage, the canvas SHALL display the
generated map's rendered matter without any further user interaction: the camera
frames the generated layer's bounds, and the default post-run selection resolves
to a layer that visibly renders.

#### Scenario: Fresh state, one click, visible world
- **WHEN** the user clicks Run from the "Awaiting matter" empty state and the run completes
- **THEN** the canvas displays the selected layer's rendered geometry framed within the viewport
- **AND** no additional click (stage change, fit-to-view) is required to see it

#### Scenario: User camera is respected on subsequent runs
- **WHEN** the user has already positioned the camera over generated matter and runs again
- **THEN** the camera is not auto-refitted (the run completes with the user's framing preserved)

### Requirement: First-Run Visibility Diagnosis Is Recorded

The invisible-first-run root cause SHALL be diagnosed against the running app
(camera fit vs. inherently invisible default layer) and recorded in this
change's design.md before the fix lands, so the chosen mechanism (auto-fit,
default-selection adjustment, or both) is evidence-grounded.

#### Scenario: Design records the diagnosis
- **WHEN** the implementation tasks begin
- **THEN** design.md states the observed cause with the evidence (DOM/camera state, layer render output)
- **AND** the implemented mechanism matches that diagnosis

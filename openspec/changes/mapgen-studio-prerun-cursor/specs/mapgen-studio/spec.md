## ADDED Requirements

### Requirement: The Canvas Cursor Advertises Only Real Interactions

The map canvas SHALL disable camera interaction and show the default cursor
until a run has produced a manifest, and SHALL restore the camera controller
with the grab/grabbing cursor once matter exists.

#### Scenario: Pre-run canvas is inert

- **WHEN** the studio renders before any run ("Awaiting matter")
- **THEN** the canvas cursor is `default` and drag/zoom camera interaction
  is disabled

#### Scenario: Post-run canvas is draggable

- **WHEN** a run completes and the manifest exists
- **THEN** the canvas cursor is `grab` (and `grabbing` while dragging) and
  camera pan/zoom behave exactly as before this change

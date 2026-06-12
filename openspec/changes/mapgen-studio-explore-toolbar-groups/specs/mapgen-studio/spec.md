## ADDED Requirements

### Requirement: Explore Toolbar Controls Group By Their Target

The explore panel's bottom toolbar SHALL group controls into labeled clusters
by what they act on — a VIEW cluster for camera/map-display controls (fit,
edges overlay) and a LAYER cluster for selected-data presentation controls
(render mode, space, and the conditional era/variant/overlay rows; named
"Layer" so it cannot be confused with the Data list section above it) — with
a consistent label/control row anatomy inside each cluster.

#### Scenario: View controls cluster under a VIEW label
- **WHEN** the explore toolbar renders
- **THEN** fit-to-view and the edges overlay toggle render together under a visible VIEW eyebrow label

#### Scenario: Data controls cluster under a LAYER label
- **WHEN** the explore toolbar renders for a selected data type
- **THEN** the render-mode and space segmented controls (and era/variant/overlay rows when applicable) render together under a visible LAYER eyebrow label

### Requirement: The Debug Toggle Lives With The Data List It Filters

The debug-layers toggle SHALL render on the DATA section header (it filters
which entries the data list shows), not in the view toolbar, with unchanged
toggle semantics and accessibility contract.

#### Scenario: Debug toggle renders on the DATA header
- **WHEN** the explore panel renders
- **THEN** the debug toggle appears in the DATA section header row and no debug control remains in the bottom toolbar

#### Scenario: Debug filtering behavior is unchanged
- **WHEN** the debug toggle is activated
- **THEN** debug-visibility data types appear in the DATA list exactly as before the relocation

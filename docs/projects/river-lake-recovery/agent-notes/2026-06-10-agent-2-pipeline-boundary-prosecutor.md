# Agent 2 - Pipeline Boundary Prosecutor

Goal: attack owner drift across Morphology, Hydrology, policy, projection, and
Studio.

Inquiry design:

- Primary question: which code/config/docs currently let a non-owner define
  river/lake truth?
- Evidence policy: architecture packet and truth-vs-projection policy outrank
  current file placement.
- Falsifier: any projection/readback surface is needed to define Hydrology
  truth.

Findings:

- Current Hydrology routing is correctly in the Hydrology domain.
- Morphology's flow-routing proxy can remain a terrain-shaping precursor/proxy
  if it is not presented as Hydrology truth.
- Public/raw config still risks exposing internals rather than semantic knobs.
- `map-rivers` is a valid projection owner but must not carry upstream truth or
  invented policy folders.

Risks:

- Stale docs still teach `minLength/maxLength` and legacy alias behavior.
- Studio grouping can make projection artifacts look like truth if layer labels
  do not carry proof class.

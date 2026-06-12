## ADDED Requirements

### Requirement: Visible River Proof Uses Same Run Camera Evidence

Visible river acceptance SHALL require screenshots or equivalent rendered-state
evidence centered on sampled live river tiles from the same exact-authored Civ
run.

#### Scenario: Visible proof is captured
- **WHEN** final live terrain readback contains navigable river terrain
- **THEN** the proof runner samples river tiles or chains
- **AND** centers the Civ camera on those coordinates
- **AND** captures screenshot hashes plus camera and visibility state
- **AND** records an explicit visual verdict

#### Scenario: Screenshot is not bound to live river samples
- **WHEN** a screenshot lacks exact request identity, sampled coordinates,
  camera state, or live readback linkage
- **THEN** it cannot satisfy `civ-rendered` proof

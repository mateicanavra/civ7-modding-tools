## ADDED Requirements

### Requirement: Visible River Proof Uses Same Run Camera Evidence

Visible river acceptance SHALL require screenshots or equivalent rendered-state
evidence centered on sampled live river tiles from the same exact-authored Civ
run.

#### Scenario: Visible proof is captured
- **WHEN** final live terrain readback contains navigable river terrain
- **THEN** the proof runner samples river tiles or chains
- **AND** records branch, commit, worktree, request id, config hash, and
  envelope hash for the run
- **AND** records seed, map size, and map dimensions when those fields are
  present in the final-surface parity proof
- **AND** request id, config hash, envelope hash, seed, map size, and map
  dimensions match the final-surface parity proof
- **AND** centers the Civ camera on those coordinates
- **AND** records a typed `@civ7/direct-control` camera focus proof whose
  target, center plot, and plot cursor match the sampled river tile
- **AND** captures screenshot hashes plus visibility state
- **AND** records a capture manifest whose screenshot file hash, size,
  dimensions, target, and camera-proof hash match the proof packet
- **AND** records an explicit visual verdict

#### Scenario: Camera source label lacks direct-control proof
- **WHEN** a visible-river proof supplies a `direct-control` camera source label
  without a typed direct-control camera focus packet
- **THEN** it cannot satisfy `civ-rendered` proof

#### Scenario: Capture mode label lacks capture manifest
- **WHEN** a visible-river proof supplies a `direct-control` capture mode label
  without a capture manifest bound to the screenshot and camera proof
- **THEN** it cannot satisfy `civ-rendered` proof

#### Scenario: Native screenshot request has no file-backed manifest path
- **WHEN** the direct-control screenshot atom calls `XR.World.takeScreenshot()`
- **AND** the result is `path-unavailable`, `unsupported`, or `failed`
- **THEN** it records proof-support evidence
- **AND** it cannot satisfy `civ-rendered` proof until a capture manifest proves
  a concrete screenshot file path, hash, size, dimensions, target, and camera
  proof hash

#### Scenario: OS appshot fallback is captured
- **WHEN** the direct-control appshot atom captures the visible macOS display
- **THEN** it records output path, hash, byte size, dimensions, target, and
  camera-proof hash
- **AND** it is labeled as `debug-fallback`
- **AND** it cannot satisfy `civ-rendered` proof by itself

#### Scenario: Direct-control visible proof runner cannot obtain a native screenshot path
- **WHEN** the visible proof runner uses `--direct-control-capture`
- **AND** the runner focuses the camera on a sampled live river/native-river
  plot
- **AND** the native screenshot request does not return an existing file path
- **THEN** the runner SHALL write the camera proof and native screenshot request
  result
- **AND** the runner SHALL NOT write a file-backed capture manifest
- **AND** the resulting visible proof remains blocked on screenshot/capture
  closure rather than passing from labels alone

#### Scenario: Capture manifest proves a different screenshot
- **WHEN** a visible-river proof supplies a screenshot path for review
- **AND** the capture manifest path is absent or points to a different file
- **THEN** it cannot satisfy `civ-rendered` proof

#### Scenario: Run identity conflicts with final-surface parity
- **WHEN** a visible-river proof supplies branch/commit/worktree identity but
  its request id, config hash, envelope hash, seed, map size, or dimensions
  differ from the final-surface parity proof
- **THEN** it cannot satisfy `civ-rendered` proof

#### Scenario: Wrong-map or wrong-seed screenshot evidence is supplied
- **WHEN** a screenshot and camera proof are otherwise well formed
- **BUT** the run identity seed or dimensions differ from the final-surface
  parity proof
- **THEN** the visible proof is blocked before `civ-rendered` can pass

#### Scenario: Minor-river success is claimed from terrain-only materialization
- **WHEN** visible-river proof has terrain-only materialization evidence
- **AND** no native-writer metadata parity pass exists
- **THEN** it cannot claim minor-river success

#### Scenario: Screenshot is not bound to live river samples
- **WHEN** a screenshot lacks exact request identity, sampled coordinates,
  camera state, or live readback linkage
- **THEN** it cannot satisfy `civ-rendered` proof

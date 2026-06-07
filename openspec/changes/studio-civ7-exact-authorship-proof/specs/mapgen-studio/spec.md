## ADDED Requirements

### Requirement: Studio Exact Authorship Proof Binds Visible Config To Civ Run

Mapgen Studio SHALL provide proof that a Run in Game result corresponds to the
same visible Studio config and setup selected by the user.

#### Scenario: Exact authorship proof succeeds
- **WHEN** Studio reports exact Run in Game proof
- **THEN** proof includes visible config identity, seed, map size, setup fields,
  config hash, envelope hash, generated source script hash, deployed script
  hash, Civ setup row readback, post-start runtime seed and dimensions, Civ
  game hash when available, predecessor live runtime snapshot identity, and a
  fresh Swooper log request id/config hash/envelope hash/seed/dimensions packet

#### Scenario: A proof link is missing
- **WHEN** any proof link between visible Studio config and live Civ run is
  missing
- **THEN** Studio keeps product proof unresolved
- **AND** downstream product acceptance cannot claim that run as exact

#### Scenario: A proof link mismatches
- **WHEN** setup readback, runtime readback, log proof, or deployed script
  identity differs from the Studio-authored request/source snapshot chain
- **THEN** Studio keeps exact authorship proof unresolved
- **AND** the proof packet names the mismatched link

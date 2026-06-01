## ADDED Requirements

### Requirement: Shipped Ecology Balance Has Map-Identity Minimums

World-balance proof SHALL assert the vegetation-family outcomes that define
each shipped map identity, not only aggregate vegetation coverage or broad
upper budgets.

#### Scenario: Earthlike vegetation distribution regresses
- **WHEN** Swooper Earthlike or the standard Earthlike preset runs across
  representative seeds
- **THEN** forest, rainforest, taiga, savanna woodland, and sagebrush steppe
  remain visible as distinct product outcomes
- **AND** no single vegetation family is allowed to stand in for overall
  ecology balance

#### Scenario: Non-earthlike identities have narrower expected families
- **WHEN** a shipped specialty identity such as archipelago, ring, or desert
  mountains is generated
- **THEN** tests assert the vegetation families and density bands appropriate
  to that identity
- **AND** aggregate vegetation presence alone is insufficient proof

#### Scenario: Ecology tuning preserves hydrology quality
- **WHEN** ecology config or feature-family policy is tuned
- **THEN** existing lake share, lake component, projection mismatch, and final
  lake drift assertions remain active
- **AND** ecology balancing does not weaken hydrology proof to pass

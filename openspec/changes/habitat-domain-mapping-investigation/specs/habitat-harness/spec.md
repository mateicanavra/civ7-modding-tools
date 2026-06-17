## ADDED Requirements

### Requirement: Habitat Domain Mapping Uses Scenario-First Evidence

The Habitat domain mapping investigation SHALL derive domain claims from
scenario flows, authority analysis, language, proof needs, and user or agent
outcomes rather than from current technical directories alone.

#### Scenario: Scenario is admitted to the corpus
- **WHEN** a Habitat scenario is added to the domain mapping corpus
- **THEN** the row records actor, trigger, input, output, current evidence,
  authority, proof need, failure modes, and current implementation path

#### Scenario: Current code suggests a domain boundary
- **WHEN** current code placement suggests a candidate domain boundary
- **THEN** the investigation treats it as evidence and tests it against
  scenarios, language, authority, change pattern, and proof needs

#### Scenario: Candidate boundary hides multiple authorities
- **WHEN** a candidate boundary contains multiple invariants with different
  owners or proof classes
- **THEN** the candidate is marked unresolved or split before it can enter the
  domain design packet

### Requirement: Habitat Domain Mapping Preserves Proof Classes

The Habitat domain mapping investigation SHALL keep reference intent, current
behavior, historical claims, architecture targets, hypotheses, and non-claims
separate.

#### Scenario: Current behavior is claimed
- **WHEN** an artifact claims current Habitat behavior
- **THEN** the claim cites current code, tests, command behavior, generated
  diffs, or structured proof records

#### Scenario: Future authoring capability is discussed
- **WHEN** an artifact discusses future MapGen authoring capability
- **THEN** the claim is labeled as desired product capability, hypothesis, or
  explicit gap until generator and proof evidence exists

### Requirement: Habitat Domain Mapping Remains Preparatory Until Reviewed

The Habitat domain mapping investigation SHALL NOT authorize implementation
slices until the domain artifacts have been assembled, reviewed, and handed off
with explicit accepted follow-up work.

#### Scenario: Refactor idea emerges during investigation
- **WHEN** a refactor, generator, rule, hook, or apply-path idea emerges during
  domain mapping
- **THEN** it is recorded as a downstream candidate and not implemented in the
  investigation harness branch

#### Scenario: Domain packet is complete enough for follow-up
- **WHEN** the domain design packet survives authority review, evidence review,
  and falsifier review
- **THEN** later work MAY open separate OpenSpec implementation slices with
  their own write sets, tasks, proof gates, and Graphite branches

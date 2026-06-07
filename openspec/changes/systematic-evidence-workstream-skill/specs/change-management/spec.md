## ADDED Requirements

### Requirement: Systematic Skills Capture Evidence-Grounded Workstream Process

Repo-local skills that encode long-running systematic Civ7 workstreams SHALL
capture reusable process, evidence gates, review loops, proof boundaries, and
closure rules without storing task-specific status as normative guidance.

#### Scenario: A systematic domain workstream is captured as a skill
- **WHEN** a completed workstream reveals a reusable method for domains such as
  resources, features, biomes, brushing, ecology, terrain, or tile types
- **THEN** the repo-local skill preserves the generic method rather than the
  completed workstream's temporary status
- **AND** it includes corpus extraction, expectation grounding, architecture
  alignment, statistics, runtime proof, review, and closure gates
- **AND** it routes OpenSpec, Graphite, product, architecture, and operational
  proof decisions back to their existing authority owners

#### Scenario: A future agent invokes the skill
- **WHEN** an agent uses the skill for a systematic Civ7 task
- **THEN** the skill directs the agent to frame the objective, isolate repo
  state, diagnose before solution, extract the canonical corpus, predeclare
  physical expectations, map work into reviewable slices, verify local stats,
  prove runtime behavior when required, disposition review findings, and close
  with accurate proof boundaries

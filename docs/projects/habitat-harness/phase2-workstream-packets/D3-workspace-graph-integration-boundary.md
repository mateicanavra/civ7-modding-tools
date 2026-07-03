# D3 Workspace Graph Integration Boundary

## Intent

Make Nx project and target truth a single Habitat boundary that `classify`,
`verify`, root scripts, and inferred targets consume without duplicating graph
knowledge.

## Product Scenario

An agent classifies a file and receives target facts that are true according to
the current Nx graph, including unavailable targets as routing facts rather than
commands to run.

## Domain Owner

Workspace Graph Integration owner.

Forbidden owners:

- Orientation and Routing may present graph facts but not infer target truth.
- Receipt Contract may record target execution but not construct the graph.
- Rule Registry may declare intended graph facets but not read Nx metadata.

## Consumers

`habitat classify`, `habitat verify`, root Nx scripts, inferred Habitat targets,
rule-target aliases, packet receipt commands.

## Contract

Define a graph service contract for:

- project metadata read;
- owning project lookup by repo-relative path;
- available/unavailable target facts;
- inferred Habitat aggregate, owner, and rule targets;
- alias dependency normalization;
- graph error/refusal states.

## Dependency Order

Blocked by: D2.

Unblocks: D4 and D12.

Parallelism: can proceed in parallel with D5/D6 after D2 because write set is
graph/plugin focused.

## Current State-Space Problem

`/tools/habitat/src/plugin.js` builds inferred targets and owner roots,
while `/tools/habitat/src/lib/nx-projects.ts` reads project metadata for
classification. Validation found a false-green risk where an inferred
`habitat:rule:biome-ci` alias depends on `{"projects":["biome"],"target":"ci"}`
even though `biome` is not a project.

The reachable state problem is target-name string parsing and duplicate graph
truth. A target can exist as a display fact, an alias, a dependency, or a command
without a shared type saying which state it is in.

## Solution Design

1. Define `HabitatGraphFact` and `HabitatTargetFact` as discriminated states:
   available target, unavailable target, alias target, broad aggregate target,
   graph-error.
2. Centralize owner-root and target alias construction behind graph functions
   consumed by both plugin and classify.
3. Make alias dependency resolution structured, not colon-split.
4. Preserve unavailable target facts in classify output without encouraging
   execution.
5. Add graph error handling that distinguishes Nx daemon errors, malformed
   graph JSON, and missing target/project states.

## TypeScript State-Space Reduction

Remove target ambiguity by replacing string target facts with typed graph facts.
The compiler should prevent a missing-project alias from being represented as an
executable target.

The rejected alternative is "fix the biome alias special case." That would leave
the string parsing state space open for the next rule.

## Public Surface Impact

`classify` output may become more precise. D0 must decide whether new target
fact fields are additive under `schemaVersion: 1` or require schema versioning.
Nx inferred target names should remain stable unless explicitly versioned.

## Receipt Classes

Required design receipt:

- current plugin target inventory;
- current classify target output inventory;
- failing alias risk documented.

Later implementation receipt:

- `nx show project habitat --json`;
- plugin unit tests for inferred targets;
- classify tests for available/unavailable targets;
- injected missing-project alias test;
- command behavior for representative path classification.

Non-claims:

- D3 graph metadata does not execute targets.
- A valid target fact does not prove target success.

## Review Lanes

- Nx/tooling review.
- Public classify contract review.
- TypeScript graph-state review.
- Operations receipt review.

## Downstream Realignment

Update:

- Nx/Habitat graph contract doc;
- `tools/habitat/docs/CAPABILITIES.md`;
- classify examples;
- validation stop conditions related to false-green aliases.

## Validation Commands / Receipt Template

- `nx show project habitat`: expected exit 0; graph metadata
  receipt for Habitat project targets and package exports.
- `nx run habitat:habitat:rule:biome-ci`: expected exit 0
  only when the alias proves its dependency ran rather than a false green.
- `nx run habitat:boundaries`: expected exit 0 after current
  graph-file ENOENT risks are fixed or explicitly non-goaled.
- Cache stance: target-alias receipt must run with cache disabled or include
  dependency execution evidence.
- Injected bad case: include one intentionally broken target alias and prove it
  cannot pass through `node -e ""`.
- Non-claim: this packet does not prove individual Habitat rule semantics.

## Graphite/OpenSpec Closure

Use a dedicated Graphite layer because plugin target inference affects many
commands. Use OpenSpec if target names or classify JSON change.

## Stop Conditions

Stop if:

- alias dependencies are still parsed from colon-delimited strings;
- classify can display a target as executable when Nx metadata says it is not;
- plugin and classify retain separate owner-root maps;
- graph errors collapse into generic command failure without target facts.

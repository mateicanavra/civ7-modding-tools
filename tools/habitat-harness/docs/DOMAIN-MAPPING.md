# Habitat Toolkit Domain Mapping Prework

This document is the grounding artifact for the next Habitat Toolkit domain
mapping investigation. It is normative for the investigation frame, evidence
policy, and expected outputs. It is not the final domain model, and it does not
authorize implementation or refactoring by itself.

Use this document after the current capability references:

- `tools/habitat-harness/README.md`
- `tools/habitat-harness/docs/CAPABILITIES.md`
- `tools/habitat-harness/docs/IMPLEMENTED-SURFACE.md`
- `tools/habitat-harness/docs/SCENARIOS.md`
- `tools/habitat-harness/docs/GAPS.md`
- `tools/habitat-harness/docs/AUTHORING-NEXT.md`

The historical project frame remains
`docs/projects/habitat-harness/FRAME.md`. The recovery control frame remains
`docs/projects/habitat-harness/dra-takeover-frame.md`.

## Purpose

Habitat now has enough reference documentation to make the next question
answerable: what is the Habitat Toolkit domain, as it should be designed, not
as the current implementation happens to be arranged?

The answer must be produced through scenario-driven domain design. The
investigation should map what Habitat is for, which user and agent workflows it
must support, which concepts and responsibilities recur across those workflows, and
where the current implementation is merely incidental composition.

The investigation must not begin by treating `src/commands`, `src/lib`,
`src/rules`, or `src/generators` as domain boundaries. Those directories are
useful evidence. They are not the domain model.

## What Habitat Toolkit Is

Habitat is currently a repo-local structural toolkit for agents and maintainers
working in this Civ7 modding repository. Its practical job is to make repo
structure queryable, enforceable, routable, and partially repairable through a
single command surface.

The implemented surface provides a structural substrate:

- classify a path, diff, or patch into owning project metadata, in-scope
  Habitat rules, runnable targets, and unavailable target facts;
- run the Habitat rule pack through normalized diagnostics;
- enforce explicit shrink-only baseline contracts;
- participate in the workspace graph through inferred Habitat-owned targets;
- route project-plane boundary checks, formatter hygiene, pattern diagnostics,
  generated-zone checks, command checks, and Habitat-native checks through one
  rule registry;
- delegate local Git hooks through Habitat while keeping CI and explicit graph
  verification authoritative;
- run a small guarded apply transaction for approved structural repairs;
- scaffold supported uniform workspace projects and pattern manifest
  lifecycle artifacts.

That is meaningful product progress. It gives future agents a structural
operating surface: classify first, use supported generation where it exists,
respect owner layers, apply only approved mechanical repairs, and verify
through graph-owned commands.

Habitat is not yet the broader MapGen authoring toolkit described by the next
product gap. It cannot yet generate a MapGen recipe, MapGen domain, domain
operation, recipe stage, recipe step, step contract/default/schema bundle, or
the full wiring and validation loop those structures require.

The current north-star product gap is:

```text
Starting from a clean repo, use Habitat to generate a new MapGen domain with
one operation, wire it into a new or existing recipe stage/step, run the
generated structure through Habitat, graph verification, and recipe compilation, and show the
generated code is correct enough for an agent to continue from it without
hand-inventing topology.
```

That gap should shape the domain mapping work, but the mapping must not jump
straight to generator implementation.

## Origin And Current Posture

Habitat began as a toolkit for executable structural enforcement. The original
frame treated repository structure as an executable, ratchetable contract. It
pulled scattered architecture scripts, tests, lint restrictions, generated-zone
rules, documentation rules, and CI expectations into a repo-local toolkit with
clear owner layers and explicit baselines.

That origin matters. Much of the current implementation exists because the
project had to recover trust in command behavior, selector truth, baseline
semantics, pattern diagnostics, hook side effects, pattern admission, and classify/generator
claims. The implementation therefore contains recovery-era adaptations and
wrappers that solved immediate validation problems.

The latest reference docs settle the current posture:

- Habitat is a strong platform substrate for classification, enforcement,
  routing, verification, hooks, pattern diagnostics, baseline integrity, and limited safe
  transformations.
- Habitat is not yet a product-authoring system for MapGen topology.
- Docs and ledgers are useful reference, but current code, tests, command
  behavior, and generated diffs are stronger evidence for behavior claims.
- Future authoring work should be driven by scenario acceptance loops, not by
  adding more rule machinery for its own sake.

## Why Current Code Is Not The Domain Model

The current codebase is required evidence, but it is not a valid representation
of the ideal Habitat domain.

First, the implementation is organized around technical placement and recovery
sequence. Command classes under `src/commands` are thin oclif adapters. The
large `src/lib/command-engine.ts` file contains rule selection, check report
construction, baseline expansion, staged pattern selection, fix dispatch, verify
receipt construction, graph export, path/diff classification, rule scope,
target discovery, and command summaries. That is a working
composition point, not a coherent bounded context.

Second, distinct responsibilities are currently adjacent or interleaved:

- diagnostic language and report schema in `diagnostics`;
- rule-pack execution and wrapped-tool parsing in `rules`;
- baseline and ratchet contracts in `baseline`;
- workspace graph/project metadata in graph modules and the graph plugin;
- pattern diagnostic acquisition in pattern adapters;
- guarded structural transformation in apply modules;
- workstation hook checks in `hooks`;
- generated/protected file zones in `generated-zones`;
- verification receipt construction and process execution records in
  `verify-receipt` and `habitat-process`;
- project and pattern scaffolding in workspace generators;
- pattern manifest admission in `patterns` and pattern generator
  registration.

These responsibilities have different users, failure modes, validation needs, and reasons
to change. Their current proximity is implementation evidence, not a domain
decision.

Third, some current names describe mechanism rather than domain language.
Examples include "command engine", "adapter apply", "wrapped script", and
"file-layer". These terms may remain useful in implementation, but the domain
mapping must ask what user-facing capability or responsibility they serve. A domain
model that simply preserves mechanism names will reproduce the current muddle.

Fourth, current code answers "how Habitat happens to run today." The domain
mapping must answer "what Habitat is responsible for, what it refuses, who owns
each invariant, and what scenarios validate those responsibilities."

## Investigation Frame

### In Scope

- Current Habitat reference docs and project frames.
- Current Habitat code, tests, rules, baselines, generators, patterns,
  hook behavior, and workspace graph integration.
- Supported scenarios: classify path/diff, run check, run graph verification, run
  diagnostic verify, scaffold supported project, draft and promote Habitat patterns,
  apply approved deep-import repair, run local hooks.
- Unsupported scenarios: generate MapGen recipe/domain/op/stage/step, validate a
  generated MapGen authoring flow, automatically fix every Habitat finding.
- Product distinction between platform-substrate health and
  authoring-workflow capability.
- Vocabulary, responsibility, validation classes, ownership, handoff flows, and change
  patterns.

### Foreground

- Scenarios and flows before files and modules.
- Ubiquitous language used by agents, docs, commands, tests, and code.
- One owner per invariant or decision.
- The difference between query/classify, enforce/check, verify,
  repair/apply, scaffold/generate, admit/promote, and author MapGen topology.
- Evidence quality: docs for intent, code/tests for implemented behavior,
  command output for current runtime truth, generated diffs for authoring
  claims.

### Exterior

- Refactoring Habitat internals.
- Implementing MapGen authoring generators.
- Adding new Habitat patterns or apply patterns.
- Declaring the final domain model.
- Redesigning MapGen runtime/product architecture.
- Treating hooks as authoritative verification.
- Treating historical closure ledgers as stronger than fresh evidence.

### Hard Core

Violating any of these requires reframing the investigation:

1. Current code is evidence, not the domain model.
2. Scenarios are the primary unit of discovery.
3. A domain boundary must explain language, responsibility, change pattern, and
   validation needs better than the current technical layout.
4. Each invariant has one owner. Duplicated ownership must be modeled as debt,
   transitional compatibility, or an explicit handoff.
5. Platform-substrate health and authoring-workflow capability are distinct
   product outcomes.
6. Validation classes stay explicit. Passing docs, tests, hooks, OpenSpec
   validation, and current command behavior establish different facts.

### Falsifiers

The investigation must stop and reframe if:

- scenario tracing shows the current reference docs materially overstate
  implemented behavior;
- proposed domain boundaries cannot explain supported and unsupported scenarios
  better than the current technical directories;
- a proposed boundary hides multiple responsibilities with different validation needs;
- authoring-workflow scenarios require MapGen product decisions that Habitat
  cannot own;
- the work collapses into documenting `src/lib` modules rather than mapping
  user and agent workflows.

### Structural Alternative Rejected

The obvious alternative is to document Habitat by current code areas:
commands, libs, rules, generators, tests, and docs.

Reject that as the domain mapping method. It would preserve the accidental
shape produced by enforcement recovery work. It may be useful as
an implementation inventory, but it cannot answer what Habitat is actually
about or what future agents should depend on.

## Evidence Policy

Use sources in this order when claims disagree:

1. Direct current task instructions.
2. Root `AGENTS.md` and repo workflow docs.
3. Current Habitat reference docs under `tools/habitat-harness/docs`.
4. `docs/projects/habitat-harness/FRAME.md` and
   `docs/projects/habitat-harness/dra-takeover-frame.md`.
5. Current source code, tests, rules, baselines, generated manifests, Habitat
   patterns, and graph configuration.
6. Fresh command behavior and generated diffs for behavior claims.
7. Active OpenSpec records for specific repair workstreams.
8. Older phase records, closure checklists, and chat summaries as historical
   discovery only.

Record every important finding as one of:

- verified current behavior;
- reference intent;
- architecture target;
- historical observation;
- hypothesis;
- out-of-scope note.

For this investigation, current implementation facts are allowed to contradict
reference claims. They are not allowed to define the target domain by default.

## Required Investigation Inputs

Before producing the final domain design artifacts, the team needs these
inputs:

- The current Habitat reference docs listed at the top of this file.
- The original and recovery project frames.
- A scenario inventory from `SCENARIOS.md`, `GAPS.md`, and
  `AUTHORING-NEXT.md`.
- Code flow traces for each supported Habitat scenario.
- Test flow traces that show which behavior is currently validated.
- Rule-pack and baseline inventory.
- Pattern diagnostic and apply inventory.
- Generator inventory and refusal contracts.
- Hook behavior and side-effect inventory.
- Workspace graph integration and classify target truth.
- MapGen topology references needed only for the future authoring scenarios:
  `docs/system/libs/mapgen/`, `mods/mod-swooper-maps/src/domain/`,
  `mods/mod-swooper-maps/src/recipes/standard/`,
  `packages/mapgen-core/src/`, and relevant tests.

## Scenario-Driven Approach

The domain mapping effort should build the model from scenario flows. At
minimum, trace these flows end to end:

1. Classify a path before editing.
2. Classify a diff or patch for handoff.
3. Run the full Habitat rule pack.
4. Run graph-owned repo verification.
5. Run diagnostic Habitat verify.
6. Scaffold a supported uniform workspace project.
7. Draft a new Habitat pattern candidate.
8. Promote a Habitat pattern after pattern manifest acceptance.
9. Apply the approved deep-import repair.
10. Run pre-commit and pre-push hooks.
11. Attempt to generate MapGen recipe/domain/op/stage/step and record the
    unsupported state.
12. Define the missing authoring acceptance loop without implementing it.

For each scenario, capture:

- actor and trigger;
- command or interface;
- input and output;
- primary domain concepts named by the scenario;
- owning responsibility for each decision;
- evidence needed to trust the outcome;
- failure modes and refusals;
- handoff to another domain or tool;
- current implementation path as evidence.

## Expected Domain Artifacts

The next investigation should produce these artifacts before implementation:

- Scenario corpus: supported, unsupported, and desired authoring scenarios with
  evidence links.
- Flow maps: classify, check, verify, graph verification, hook, pattern diagnostics,
  pattern apply, project generation, pattern admission, and future MapGen
  authoring.
- Ubiquitous language glossary: terms grouped by scenario and responsibility, with
  ambiguous or overloaded terms called out.
- Responsibility map: one owner for target truth, rule admission, baseline state,
  diagnostic normalization, graph integration, hook feedback, transformation
  transactions, generated/protected zones, and authoring topology.
- Context map: candidate bounded contexts and relationships, including which
  contexts are substrate, authoring, validation, rule-lifecycle, or adapter concerns.
- Evidence ledger: every domain claim tied to docs, code, tests, command
  behavior, or explicit hypothesis.
- Current-code critique: places where implementation composition conflicts with
  the emerging domain model.
- Acceptance and falsifier tests: checks that would invalidate the proposed
  domain boundaries or show that a boundary is merely a technical layer.

## Initial Domain Hypotheses

These are hypotheses to test, not final boundaries:

- Orientation and routing: classifies paths and diffs into project ownership,
  rule scope, runnable targets, and unavailable target facts.
- Structural enforcement: selects and executes owner-layer rules, normalizes
  diagnostics, and applies baseline state.
- Baseline and ratchet responsibility: owns explicit debt, locked state, shrink-only
  integrity, and rule-introduction expansion.
- Workspace graph integration: projects Habitat checks into graph targets and
  consumes project metadata as target truth.
- Diagnostic pattern catalog: acquires pattern findings and maps them into
  Habitat rules.
- Transformation transaction: applies only approved mechanical rewrites with
  dry-run, path approval, formatter handoff, rollback, and transaction records.
- Hook check: runs hooks as bounded pre-commit/pre-push assistance without
  becoming merge control.
- Scaffolding and admission: generates supported uniform project structure and
  pattern manifest artifacts while refusing unsupported topology.
- Future MapGen authoring: creates recipe/domain/op/stage/step topology and
  validates it through the product acceptance loop. This is currently a gap, not
  an implemented Habitat context.

Each hypothesis must survive scenario tracing and responsibility analysis before it
can become part of the domain model.

## Team Operating Model

Use one accountable DRA owner for synthesis and final decisions. The owner
should run narrow read-only lanes:

- Reference synthesis lane: extracts product outcomes, supported scenarios,
  unsupported states, and source-order conflicts from current docs.
- Code-flow lane: traces implementation paths for each scenario and records
  behavior evidence without treating modules as target boundaries.
- Domain critique lane: applies domain-design pressure, especially language
  changes, responsibility overlaps, duplicated ownership, and technical-layer
  decomposition traps.
- Investigation review lane: checks evidence class, falsifiers, scope control,
  and whether the artifacts are sufficient for a later implementation team.

The lanes provide evidence and objections. The DRA owner decides the frame,
maintains the evidence ledger, and produces the final artifacts.

## Stop Conditions

Pause the domain mapping investigation if:

- the team cannot distinguish product intent from current implementation
  behavior for a major scenario;
- the same concept appears to have multiple active owners and no source can
  resolve the owner;
- MapGen authoring scenarios require decisions that belong to MapGen product
  architecture rather than Habitat;
- the evidence ledger contains broad claims that cannot be tied to current
  docs, code, tests, or command behavior;
- the resulting model cannot generate concrete acceptance tests.

## Success Criteria

This prework is complete when the next team can begin domain mapping with:

- a stable distinction between current substrate capability and future
  authoring capability;
- a clear warning that current code composition is evidence, not the domain;
- explicit source order and evidence classes;
- a scenario list that covers both implemented behavior and product gaps;
- an artifact contract for scenario corpus, flow maps, glossary, responsibility map,
  context map, evidence ledger, critique, and falsifier tests;
- a team structure with one accountable owner and focused review lanes.

The following work should then produce the actual domain design artifacts. It
should not refactor Habitat until those artifacts have been reviewed and have
survived scenario and responsibility stress tests.

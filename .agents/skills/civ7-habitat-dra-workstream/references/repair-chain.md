# Habitat Repair Chain

## Scope

The repair chain fixes the core Habitat system so that commands, ledgers, generators, baselines, hooks, and enforcement surfaces are truthful and executable. It does not expand the architecture-derived Grit pattern catalog. Pattern work may be read only to avoid scope collisions and dependency errors.

Core repair areas include:

- oclif entrypoint and root command trust;
- Grit proof repair and current-tree selector behavior;
- scaffold contract and baseline ownership;
- classify/generator repair and supported structure generation;
- Git hook hardening and side-effect proof;
- boundary taxonomy tightening;
- enforcement-surface cleanup across Habitat, Biome, Nx, Grit, hooks, and OpenSpec;
- pattern generator metadata repair;
- Effect/Grit adapter decision and implementation when it structurally reduces unsafe orchestration.

## Sequencing

Start with command trust unless current evidence proves a harder blocker. A typical dependency order is:

1. root Habitat command and oclif entrypoint trust;
2. substrate decision for Effect/Grit orchestration where packet contracts require safe async/error/resource handling;
3. current-tree Grit proof repair;
4. baseline contract and scaffold repair;
5. classify/generator repair;
6. hook hardening and side-effect proof;
7. boundary taxonomy and enforcement cleanup;
8. metadata/record repair and downstream realignment.

Do not start a downstream proof that relies on an unlanded upstream repair unless the packet explicitly models the dependency and blocks closure.

## Workstream Loop

Each repair packet runs the complete loop:

1. **Analysis**: refresh authority docs, packet records, branch state, existing code, and current failures.
2. **Extraction/corpus**: collect concrete failing commands, fixtures, generated files, ledgers, and owner-boundary examples.
3. **Design**: choose the owning layer, data model, command contract, validation proof, and downstream record updates.
4. **Implementation**: edit only the packet write set or explicitly extend it through OpenSpec.
5. **Review**: run self-review plus supervisor/adversarial review for proof gaps and owner-boundary drift.
6. **Iteration**: repair accepted findings and rerun proofs.
7. **Realignment**: update tasks, phase record, review ledger, downstream ledger, and durable docs touched by the behavior.
8. **Ship**: commit via Graphite, verify stack state, and leave clean.

## Stop Rules

Pause the packet and notify the supervisor when:

- a prerequisite packet is not landed but the proof depends on it;
- the needed change crosses a protected owner path or new architecture boundary;
- a command succeeds only through empty selector behavior, stale generated output, cached task output, mocks, or historical records;
- orchestration needs transaction/resource/error semantics and the packet lacks a substrate decision;
- Graphite stack state would force broad unrelated conflict resolution.

## Closure Evidence

A repair packet closure note should name:

- active packet and branch;
- tasks completed by ID;
- files changed;
- commands run and their proof classes;
- injected violation or failure reproduction where applicable;
- records realigned;
- accepted findings closed;
- residual non-claims;
- Graphite commit and clean status.

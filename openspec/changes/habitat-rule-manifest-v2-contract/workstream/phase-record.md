# Phase Record: Habitat Rule Manifest V2 Contract

## Objective

Remove Habitat's v1 rule-manifest artifact vocabulary and make schema v2 the
only current manifest contract.

## Authority

- Current user decision: Habitat artifact terminology is removed; only
  Civ7/MapGen product artifacts remain.
- Root AGENTS and OpenSpec workstream process.
- Existing `.habitat` authority docs are downstream records to realign.

## Corpus

- 126 live `.habitat/**/rule.json` manifests.
- 126 manifests with `placement.artifactKind: "check"`.
- 126 manifests with `artifacts.baseline`.
- 9 manifests with `placement.category: "artifact"`.

## Interfaces

- Producers: manifests, index, generator output.
- Consumers: registry, baseline facts, Nx inputs, target routing, hooks, tests.

## Status

Opened for implementation on `codex/habitat-artifact-authority-workstream`.

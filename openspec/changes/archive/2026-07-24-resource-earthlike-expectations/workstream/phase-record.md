# Phase Record: Resource Earthlike Expectations

## Objective

Define the source-backed expectation layer that future resource operations must
satisfy for all 55 official base-standard resources, without moving placement
behavior or claiming runtime numeric ids.

## Repo State

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-resource-distribution-workstream`
- Branch: `codex/resource-earthlike-expectations`
- Parent slice: `codex/resource-corpus-contract`
- Running local server pair for this worktree:
  `http://127.0.0.1:5174/`
- Write set: OpenSpec/workstream artifacts first; optional resource
  expectations source and tests only after review.

## Frame

- In scope: resource group partition, per-resource earthlike expectation
  envelopes, evidence policy, blocked-row visibility, and future stats proof
  obligations.
- Foreground: fixing the failure mode where only a minority of resources appear
  by making every official resource become an explicit future operation
  obligation.
- Exterior: no placement behavior movement, no runtime numeric id proof, no
  feature-resource expansion, no generated-output edits.
- Falsifier: if research cannot support bounded per-resource envelopes, the
  slice must record blocked/conditional rows and next proof needs rather than
  inventing precise ranges.

## Agent Wave

- Kant: aquatic, coastal, and navigable-river resources.
- Hooke: cultivated, plantation, and medicinal resources.
- Noether: terrestrial animal, forest, and wild biological resources.
- Godel: geological, mineral, gemstone, and industrial resources.
- Ohm: grouping and evidence-policy critic.

## Current Partition

- Aquatic, coastal, and navigable-river: 6 resources.
- Cultivated, plantation, and medicinal: 18 resources.
- Terrestrial animal, forest, and wild: 11 resources.
- Geological, mineral, gemstone, and industrial: 20 resources.
- Total: 55 resources.

## Verification So Far

- Branch opened with Graphite.
- Studio/API pair started from this worktree on `http://127.0.0.1:5174/`.
- `curl -I http://127.0.0.1:5174/`
  - Passed with `HTTP/1.1 200 OK`.
- Resource-group evidence packs completed and recorded in
  `workstream/evidence-packs.md`.
- `bun run openspec -- validate resource-earthlike-expectations --strict`
  - Passed.
- `bun run openspec:validate`
  - Passed: 21 items.
- `git diff --check`
  - Passed.

## Closure State

- Framed agent review completed and accepted P1/P2 findings were repaired.
- This slice closes as OpenSpec-only. The typed
  `artifact:resources.earthlikeExpectations` source artifact belongs in the
  next implementation slice so it can have dedicated tests and review.

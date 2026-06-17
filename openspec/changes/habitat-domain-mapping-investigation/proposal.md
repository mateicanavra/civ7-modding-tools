# Proposal: Habitat Domain Mapping Investigation

## Summary

Open the Habitat Toolkit domain mapping investigation as a bounded,
scenario-driven workstream. This change adds the OpenSpec control record and
durable project ledgers that future agents will use to produce a Habitat domain
design packet.

This slice is intentionally preparatory. It does not refactor Habitat, implement
generators, define the final domain model, or redesign MapGen. It establishes
the phase structure, evidence rails, and operating model for the investigation.

## Authority

- Current user instruction to open the Habitat domain mapping investigation.
- Root `AGENTS.md` and repo Graphite/OpenSpec workflow guidance.
- `tools/habitat-harness/docs/DOMAIN-MAPPING.md`.
- `tools/habitat-harness/docs/CAPABILITIES.md`.
- `tools/habitat-harness/docs/IMPLEMENTED-SURFACE.md`.
- `tools/habitat-harness/docs/SCENARIOS.md`.
- `tools/habitat-harness/docs/GAPS.md`.
- `tools/habitat-harness/docs/AUTHORING-NEXT.md`.
- `docs/projects/habitat-harness/FRAME.md`.
- `docs/projects/habitat-harness/dra-takeover-frame.md`.
- Current Habitat code, tests, rules, baselines, generated manifests, Grit
  patterns, Nx configuration, and fresh command behavior as evidence.

## What Changes

- Add this OpenSpec change for the Habitat domain mapping investigation.
- Add project-local domain mapping workstream artifacts under
  `docs/projects/habitat-harness/domain-mapping/`.
- Define the investigation phases from grounding through design-packet handoff.
- Define the evidence policy, scenario corpus contract, flow-map contract,
  authority-map contract, evidence ledger, and agent operating model.
- Keep the investigation compaction-safe so a future owner can resume from disk
  rather than chat.

## What Does Not Change

- No Habitat implementation changes.
- No MapGen generator implementation.
- No final Habitat domain model.
- No broad MapGen product or runtime redesign.
- No claim that current Habitat code layout is the target domain model.
- No new Grit rules, apply patterns, hooks, generators, or baseline mutations.

## Requires

- `codex/habitat-domain-mapping-prework` as the parent branch because
  `DOMAIN-MAPPING.md` is the active investigation frame.
- One accountable DRA owner for synthesis and proof claims.
- Read-only evidence lanes for reference synthesis, code-flow tracing, domain
  critique, and investigation review.
- Current-code evidence treated as behavior evidence, not target domain
  authority.

## Enables

- A scenario corpus covering supported, unsupported, and desired Habitat
  authoring scenarios.
- Flow maps for classify, check, verify, fix, hooks, generation, pattern
  promotion, and future MapGen authoring.
- A ubiquitous language glossary, authority map, candidate context map,
  evidence ledger, current-code critique, and falsifier tests.
- Later OpenSpec implementation slices only after the domain design packet has
  survived review.

## Affected Owners

- `docs/projects/habitat-harness/domain-mapping/**`
- `openspec/changes/habitat-domain-mapping-investigation/**`

## Forbidden Owners

- `tools/habitat-harness/src/**`
- `tools/habitat-harness/test/**`
- `.grit/**`
- `tools/habitat-harness/baselines/**`
- MapGen runtime, recipe, domain, operation, stage, or step source.
- Generated outputs and generated-zone files.

## Consumer Impact

Humans and agents get a durable investigation harness for the Habitat domain
mapping effort. No runtime, command, generator, hook, or check behavior changes
in this slice.

## Stop Conditions

- A phase starts from current module boundaries instead of scenarios.
- A claim about current behavior lacks source, test, command, or code evidence.
- A proposed domain boundary hides multiple authorities with different proof
  needs.
- MapGen authoring questions require product decisions outside Habitat's
  authority.
- The workstream starts implementation before the domain artifacts are reviewed.

## Verification Gates

- `bun run openspec -- validate habitat-domain-mapping-investigation --strict`
- `bun run openspec:validate`
- `git diff --check`
- `bun run habitat classify docs/projects/habitat-harness/domain-mapping/workstream-record.md`
- `bun run habitat classify openspec/changes/habitat-domain-mapping-investigation/proposal.md`

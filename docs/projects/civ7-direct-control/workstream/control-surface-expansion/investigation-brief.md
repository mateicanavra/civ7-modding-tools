# Investigation Brief

## Brief Identity

- Brief title: Civ7 Direct-Control Surface Expansion
- Prepared by: Codex
- Prepared at: 2026-05-31
- Frame source / pointer: user `/goal`, `capability-inventory.md`, and current
  direct-control OpenSpec artifacts.
- Intended execution rail: repo codebase deep dive, OpenSpec workstream, live
  runtime probes where available.
- Status: ready for execution

## 1. Readiness

- Inquiry status: complete
- Frame status: committed
- Upstream fallback used, if any: none

## 2. Frame Carried Forward

- WHAT: make `@civ7/direct-control` the durable first-class control surface for
  developers, Studio, mapgen debugging, player-control workflows, and LLM agents.
- WHY: developers should control a running macOS Civ7 instance without Windows,
  Steam relaunches, FireTuner UI, or duplicated socket/protocol behavior.
- In scope: App UI lifecycle/session controls, Tuner gameplay/map reads,
  validator-first mutating wrappers, TypeBox catalog generation, CLI/Studio
  integration, cleanup of obsolete direct-control-adjacent bridge artifacts.
- Foreground: product scenarios, proof-backed wrappers, explicit safety
  contracts, state-role separation, and artifacts that survive compaction.
- Exterior: FireTuner clone, Windows bridge fallback, broad command browser,
  uncontrolled AI player, and retaining legacy bridge paths after direct parity.
- Hard core: App UI and Tuner are complementary state roles; direct socket is
  the canonical control boundary; proof/contracts are implementation work.
- Assumptions committed: direct Civ7 socket can execute the required JS command
  families; Tuner is post-Begin gameplay-ready; App UI remains lifecycle owner.
- Structural alternative considered: supervised FireTuner or hybrid transport.
  It stays rejected unless direct socket is falsified for a required capability.
- Falsifier / reframe trigger: direct socket cannot reliably perform core
  developer scenarios or a required first-class capability at all, while
  FireTuner/Steam is proven required for that same capability.

## 3. Investigation Objective

- Objective: convert inventory findings into OpenSpec changes and implement the
  accepted control surface.
- Downstream decision or action this supports: Graphite-sliced implementation
  and final capability reference for developers/players/LLM agents.
- Investigation type: codebase deep dive plus runtime proof design.
- Non-goals: replaying the entire previous direct-control discovery; building a
  UI/TUI/debugger; inventing unsupported game semantics.
- Required confidence level: verified for package/source contracts; live-proven
  for newly claimed mutating runtime wrappers when the game state allows it.

## 4. Question Architecture

### Primary Question

- What exact read/action/catalog wrappers should become public
  `@civ7/direct-control` contracts now, and how should they be proven?

### Secondary Questions

- Which state role owns each wrapper?
- What inputs and outputs make the wrapper useful without becoming a FireTuner
  clone?
- Which CLI/Studio surfaces should expose the new package capabilities?
- Which legacy references are now false or confusing?

### Exclusion Questions

- Do not ask how to keep a Windows bridge fallback.
- Do not ask how to generate every possible Civ global into a high-level API.
- Do not ask how to let an LLM autonomously play without safety constraints.

### Falsification Questions

- Does a wrapper require a context/global unavailable from direct control?
- Does a mutation bypass `canStart` or lack observable postconditions?
- Does a generated catalog overclaim signatures not supported by runtime or
  official resources?

## 5. Search Geometry

- Selected geometry: parallel lanes by state-role, read surface, action surface,
  catalog/types, integration/cleanup, then convergence into OpenSpec slices.
- Why this geometry: the lanes are independently searchable but converge on one
  package boundary.
- Initial terrain / sources / paths: capability-inventory reports,
  `packages/civ7-direct-control`, `packages/cli/src/commands/game`,
  `apps/mapgen-studio`, `packages/civ7-types`, `.civ7/outputs/resources`.
- Required breadth: all previously `wrap now` and `wrap carefully` candidates.
- Required depth: proof contracts and tests sufficient for implementation.
- Stop rule: every candidate is either implemented, live/source-proven as a
  truthful partial wrapper, or explicitly dispositioned by reframe trigger.

## 6. Evidence Policy

- Evidence standard: source-reviewed plus tests for API contracts; fresh live
  proof for mutating runtime claims when available.
- Source authority order: user goal, AGENTS/process docs, project artifacts,
  OpenSpec, package source/tests, official resources, recorded live proof,
  public corpus, inference.
- Minimum corroboration: source + one test for code contracts; runtime command +
  before/after observation for mutations.
- Conflict rule: direct fresh live proof beats older reports; user hard core
  beats legacy code shape; official resources inform but do not own repo API.
- Claim-strength labels allowed: implemented, source-proven, live-proven,
  inferred, unresolved, rejected.
- Required uncertainty markers: "where available", "not live-proven", "source
  evidence only", "requires game state".
- What does not count as evidence: quiet logs, generated output as source,
  FireTuner presence as runtime dependency proof, stale bridge docs.
- Code-vs-doc rule: docs follow source and proof; do not document unimplemented
  wrapper promises as complete.

## 7. Rail Decision

- Selected rail: OpenSpec workstream with peer agents and owner integration.
- Why this rail: the change affects public package contracts, CLI/Studio
  consumers, safety semantics, and runtime proof.
- Rejected rails: chat-only design, single large unreviewed code patch, external
  research-only.
- Rail-bias risks: over-scoping into a FireTuner clone; under-proving dangerous
  mutations; catalog signature overclaims.
- Constraints passed to the rail: no fallback transport, no automatic mutation
  replay, state-role ownership explicit, tests and proof mandatory.
- Adapter notes: live probes use existing CLI/package commands; generated
  resources are read-only evidence.

## 8. Artifact Contract

- Required artifact: agent reports, OpenSpec change dirs, implementation diffs,
  review ledger, verification notes, closure packet.
- Intended reader/consumer: future repo agents, maintainers, developers using
  direct control, Studio/mapgen workflows, LLM-agent clients.
- Required sections: evidence, decisions, contracts, implementation scope,
  tests, runtime proof, residual limits.
- Required claim support: each implemented wrapper links to source/test proof;
  each live mutating claim links to before/after evidence.
- Must include: categorized final action/read surface.
- Must not include: bridge fallback guidance or optional implementation language
  for required first-class wrappers.
- Durability / maintenance expectation: workstream docs are temporal; stable
  API behavior moves into package README/system docs as implemented.

## 9. Stop and Reframe Conditions

- Stop if: P1/P2 review holes remain unresolved, direct socket falsifies a hard
  requirement, or repo state cannot be kept clean without user input.
- Return to Inquiry Design if: user changes the product goal or safety posture.
- Return to Framing Design if: App UI/Tuner roles prove materially wrong.
- Downgrade confidence if: live Civ is unavailable or only source/mock evidence
  exists for a runtime behavior.
- Ask the user if: a required proof would mutate a non-disposable game state in
  a way that cannot be bounded.

## 10. Handoff Notes

- Open unknowns: exact runtime shapes for selected operation results and end-turn
  blockers; availability of live Civ during proof.
- Known risks: broad operation APIs have high blast radius; TypeBox catalog may
  be useful for availability but not precise signatures.
- Required references: files named in `team-plan.md` and capability-inventory.
- Exact next action: run peer agent lanes and draft OpenSpec change set.

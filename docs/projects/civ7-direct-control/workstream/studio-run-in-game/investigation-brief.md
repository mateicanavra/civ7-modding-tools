# Investigation Brief

## Brief Identity

- Brief title: Studio Run in Game and Live Runtime Sync
- Prepared by: Codex
- Prepared at: 2026-05-31
- Frame source / pointer: user `/goal`, latest acceptance criteria, prior
  direct-control capability inventory and control-surface expansion artifacts.
- Intended execution rail: OpenSpec workstream, codebase deep dive, official
  resource inspection, and live Civ proof.
- Status: ready for execution

## Frame Carried Forward

- WHAT: make Studio able to start a Civ7 single-player game using the current
  Studio-authored Swooper map config/seed, and observe the running game back in
  Studio through direct-control reads.
- WHY: developers should test mapgen changes in Civ from Studio without manual
  setup, Windows, FireTuner, or config drift between authored and runtime views.
- In scope: App UI setup/start wrappers, setup parameter catalog, map row and
  seed verification, materialization policy, live map/player/unit/city/resource
  sync, Studio endpoints/store/rendering, focused tests and docs.
- Foreground: exact-config proof, direct-control ownership, reload semantics,
  observational runtime sync, and developer workflow clarity.
- Exterior: FireTuner bridge fallback, raw Studio JS control, broad game setup
  clone, hidden seed persistence inside Swooper config, and automatic config
  mutation from live runtime observations.
- Hard core: App UI/setup APIs own game creation; Tuner owns post-Begin reads;
  `@civ7/direct-control` is the canonical boundary.
- Structural alternative considered: keep restart-only Studio flow and require
  manual game setup. Rejected because the objective is exact Studio-to-Civ
  launch control.
- Falsifier / reframe trigger: direct control cannot set setup parameters/start
  from shell, or changed/generated map rows cannot be loaded without a full
  process restart/reload boundary that invalidates Run in Game semantics.

## Primary Questions

- Which App UI/setup primitives can prepare and start a single-player game from
  shell or a running session?
- How does Studio materialize the exact current config and seed into a Civ map
  row without corrupting authored config?
- What live Tuner reads are sufficient for useful mapgen debugging and player /
  LLM-agent observation in Studio?
- What proof demonstrates the launched game used the selected map row, map
  size/options, Studio seed, and exact Swooper config?

## Evidence Policy

- Authority order: direct user decisions; AGENTS/process docs; project/OpenSpec
  artifacts; package/app source; official resources; fresh live proof; recorded
  prior proof; inference.
- Required labels: implemented, source-proven, live-proven, inferred,
  unresolved, rejected.
- Setup/start claims require fresh live proof before Studio depends on them.
- Source evidence can shape contracts, but mutating setup wrappers require
  before/after runtime observations.
- Proof must include `GameInfo.Maps` row existence, setup seed applied,
  post-start `GameplayMap.getRandomSeed()` match, map size/dimensions, and
  Swooper log/config hash evidence.
- A quiet log is not proof of absence; generated/deployed output proves only
  generation/copy unless tied to a live run.

## Search Geometry

- Parallel lane 1: App UI setup/start and reload semantics.
- Parallel lane 2: Studio config/materialization/deploy mapping.
- Parallel lane 3: live runtime sync surfaces and Studio UI integration.
- Parallel lane 4: proof/test strategy and adversarial review.
- Convergence: OpenSpec changes, reviewed implementation slices, verification
  ledger, closure packet.

## Artifact Contract

- Agents write durable reports under this directory, not chat-only summaries.
- Each report must include findings, evidence labels, proposed contracts,
  implementation implications, risks, and exact next proof steps.
- Owner consolidates into OpenSpec changes and review ledgers.
- Final closure must include exact Run in Game flow, live sync behavior, proof
  ledger, tests run, residual evidence limits, and Graphite stack status.

## Stop and Reframe Conditions

- Stop if setup/start mutation would affect a non-disposable game state in an
  unbounded way.
- Stop if direct-control setup APIs cannot select the needed map/options/seed.
- Reframe if Civ requires full process restart for every changed map row and no
  viable reload/setup sequence can preserve the intended Studio action.
- Downgrade confidence if live Civ is unavailable; do not ship setup/start UI
  dependencies on mock/source evidence alone.

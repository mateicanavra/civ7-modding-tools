# Civ7 Direct-Control Capability Inventory Brief

## Frame

This investigation extends the direct-control workstream from "can we speak the
protocol?" to "what useful domain capabilities should the repo expose?" App UI
and Tuner are treated as separate runtime API surfaces. The output should help
future package, CLI, Studio, and automation work decide which reads, writes,
commands, and type/catalog generation paths deserve first-class support.

## Selection And Salience

- In scope: runtime introspection of App UI and Tuner globals; read/write method
  inventory; game-control, map-generation, Studio-debugging, resource, and
  AI-player use cases; type/catalog generation strategy.
- Foregrounded: capabilities useful to developers and tooling, especially map
  generation iteration, map reveal/inspection, autoplay/restart/begin, game
  state reads, playable command feasibility, and typed access.
- Exterior: implementing a FireTuner clone, building an AI player, broad UI
  automation, or claiming commands are safe without live proof.

## Primary Questions

1. What globals, properties, and methods are available from App UI and Tuner,
   and how do those surfaces differ after Begin Game?
2. Which available reads/writes are useful enough to wrap in
   `@civ7/direct-control` versus leaving as raw JavaScript execution?
3. Can we generate TypeScript reference/catalog types from runtime
   introspection, official resources, existing `packages/civ7-types`, or a
   hybrid source?
4. What direct-control capabilities would materially help map generation and
   Studio development?
5. Could an LLM or other agent read enough context and issue enough commands to
   play Civ7 through this package, and where are the practical/API limits?

## Evidence Policy

- Runtime observations must name the selected state and whether Civ7 had reached
  Begin Game.
- Source/resource claims must cite repo files, official resource paths, or
  public sources.
- A method name alone is not proof of safe mutation; mark write capabilities as
  `confirmed`, `plausible`, or `unknown`.
- Prefer bounded live probes for high-value commands, but do not mutate game
  state broadly without a clear reason.

## Artifact Contract

Agents write durable reports into this directory:

- `app-ui-surface-report.md`
- `tuner-surface-report.md`
- `type-generation-report.md`
- `automation-playability-report.md`

The owner consolidates into `capability-inventory.md` with a matrix, use-case
recommendations, wrap-vs-raw decisions, and next implementation slices.

## Reframe Conditions

- Runtime introspection cannot produce stable enough metadata for useful types.
- App UI and Tuner expose too much native/opaque behavior to classify safely
  without a different instrumentation approach.
- Play/control commands require input/UI event paths outside the tuner socket.

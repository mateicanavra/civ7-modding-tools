# Civ7 Direct Control Investigation Brief

## Frame

The investigation is a codebase, runtime, and public-source feasibility pass for
making direct Civ7 tuner-socket control a repo-owned boundary. It preserves the
project frame in `../PROJECT-civ7-direct-control.md`: FireTuner is a reference
client, developer outcomes are primary, and Windows/Steam workarounds stay
outside the frame unless the direct path falsifies.

## Primary Questions

1. Does the current repo already talk directly to Civ7, and what protocol and
   lifecycle guarantees are proven by source, tests, and live runtime evidence?
2. What is the smallest durable code boundary that can serve CLI, Studio, and
   future tools without duplicating socket behavior?
3. Which FireTuner DLL or executable evidence adds protocol/API insight, and
   which Steam or launcher behavior is irrelevant once direct Civ7 control is
   used?
4. What can Chrispresso Debug Console and public Civ7 JS/type sources teach us
   about command names, globals, autocomplete, or introspection?
5. Which existing scripts, bridge paths, docs, and tests should be kept,
   replaced, quarantined, archived, or left untouched?

## Falsification Questions

- Can a fresh Civ7 runtime restart invalidate the listener/state assumptions or
  require FireTuner to be running?
- Do useful commands require an authentication or Steam-mediated path absent
  from direct socket commands?
- Does state selection differ enough across App UI, Tuner, and gameplay states
  that a single developer control API cannot expose safe defaults?

## Evidence Policy

- Highest authority for runtime transport: fresh local Civ7 process/socket
  observations and bounded before/after logs from the current machine.
- Highest authority for repo behavior: source, tests, OpenSpec artifacts, and
  Graphite branch state in this repository.
- FireTuner binaries are reference-client evidence only unless dynamic runtime
  testing proves they are required.
- Public web sources must be linked and treated as external evidence, not repo
  authority.
- OpenSpec validation proves artifact shape only; package tests and live runtime
  proof are required for behavior claims.

## Search Geometry

- Breadth-first across repo surfaces to prevent hidden duplicate control paths.
- Depth-first on the socket protocol and state lifecycle once current call sites
  are mapped.
- Public-source widening only for command/global/type/autocomplete insight.
- Hypothesis testing around the core claim: Civ7 is the runtime server, not
  FireTuner.

## Artifact Contract

Agents and owner reports write durable files under this directory. Each report
must include evidence, uncertainty, recommendations, and whether any finding
would force a reframe. Chat-only findings are not sufficient workstream state.

## Stop Or Reframe Conditions

- Direct socket command execution cannot be reproduced from the current repo and
  runtime.
- FireTuner or Steam is proven to be required for the needed command set.
- The smallest viable boundary cannot support both CLI and Studio without
  keeping duplicate transport ownership.

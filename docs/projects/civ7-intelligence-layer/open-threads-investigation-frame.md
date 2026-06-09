# Civ7 Intelligence Open Threads Investigation Frame

Status: active investigation frame.
Built: 2026-06-03.
Branch: `codex/investigate-civ7-intelligence-threads`.
Primary frame source: user request in this thread on 2026-06-03.
Related solution packet: [SOLUTION-FRAME.md](SOLUTION-FRAME.md).
Workstream record: [open-threads-workstream-record.md](open-threads-workstream-record.md).

## Frame Identity

This frame treats each unresolved Civ7 intelligence-layer path as an
actuation path with authority, proof, safety, and product value. The work is
not a cataloging pass. It is an evidence-first investigation whose output must
make it clear how a strategy agent can affect Civ7, which mechanisms are real,
which are speculative, which should be eliminated, and how the viable pieces
fit into the live hotseat/direct-control and native AI profile solution.

## Why This Frame

The previous solution frame established useful layers but left important
claims under-tested. The user needs decision-grade direction, not more
well-ordered possibility lists. This frame therefore foregrounds falsification:
each path must be probed far enough to classify it as production candidate,
probe candidate, static-only lever, observation-only signal, eliminated path,
or deferred reverse-engineering thread with a clear trigger.

A structurally different alternative would be to continue refining the
solution architecture first and leave these details as implementation spikes.
That is rejected for this workstream because the unknowns are not peripheral.
They determine whether the strategy agent can steer native AI live, whether a
companion mod is a real bridge or just a UI helper, and whether saves/logs can
become a reliable strategy corpus.

## Product Outcome

By the end of this workstream, the intelligence-layer packet should answer:

- Exactly how a strategy agent can affect the game today.
- Whether the reliable control plane is direct-control only, generated static
  profiles only, a companion mod bridge, or a hybrid.
- Whether RHQ-style static AI data can be safely turned into generated,
  measured profiles across starts or age transitions.
- Whether any script, handler, triggered behavior tree, runtime database, App
  UI, Automation, Autoplay, hotseat, or operation API path unlocks live or
  semi-live strategic steering.
- What data can realistically become an intelligence database: turn records,
  direct-control action traces, logs, debug database snapshots, save-derived
  state, AI behavior traces, and measured-run outcomes.

## In Scope

- Reverse-engineering `.Civ7Save` structure beyond prior string and chunk
  discovery, enough to classify whether it can support strategy-corpus or
  replay reconstruction.
- Age transition behavior: whether generated AI profiles can be swapped,
  layered, or reloaded safely at start/load/age boundaries.
- `BoostHandlers`, `ScriptConsumer`, `TargetScript`, `AI_BUDGET_SCRIPTING`,
  and related script hooks as possible static or bridge-like levers.
- `TriggeredBehaviorTrees` and generated behavior-tree profiles.
- Runtime `GameInfo` row reads and comparison against debug database copies
  after mod load.
- Local AI logs and whether they can be assembled into a useful native-AI
  behavior trace for measured-run scoring.
- Companion UI scripts and whether they can safely call operation APIs without
  weakening direct-control approvals, postconditions, and auditability.
- Hotseat branch findings, especially hotseat solution packets, Autoplay,
  Automation, and any direct-control unlocks relevant to live AI play.
- Official resources, local Civ7 application data, local mods, logs, debug
  databases, saves, RHQ, and the current direct-control codebase.
- Peer-agent investigations with full `/goal` objectives and written lane
  reports before final synthesis.

## Out Of Scope

- Shipping production code before the investigation closes.
- Destructive changes to the currently running live game unless the DRA first
  establishes that the test is necessary and notifies the running supervisor
  thread that owns the active refactor/game context.
- Unsupported memory editing, binary patching, or blind writes into Civ7 state
  as a product direction.
- Claiming a live native-AI mutation path unless a probe demonstrates row
  visibility, native AI re-read, behavior effect, and rollback or containment.
- Treating public RHQ claims, generated artifacts, or one-off observations as
  product authority without local evidence and source pointers.

## Hard Core

1. The unit of analysis is an actuation path, not a feature idea.
2. Every claim about "can affect the game" must name authority surface,
   timescale, evidence, safety boundary, and failure mode.
3. Live tactical play and native AI profile shaping remain separate until
   evidence proves a bridge between them.
4. Direct-control approval and postcondition discipline must not be weakened by
   companion UI or operation API experiments.
5. Agent lane reports are normative inputs to synthesis and must exist before
   final integration.

## Protective Belt

- The exact number of lanes and agents can change if evidence naturally
  clusters differently.
- Live-game probes can be replaced with static or disposable-session probes if
  the active game risk is too high.
- Reference docs can be split or renamed if information design shows a cleaner
  shape.
- Some findings may remain deferred, but only with evidence, attempted probes,
  and a trigger for future re-entry.

## Reframe Conditions

Reframe if a supported or stable path proves that Civ7 native AI reliably
re-reads AI data or behavior definitions mid-game and changes behavior with
rollback, because the core separation between direct-control live play and
static native profile shaping would no longer be the right boundary.

Reframe also if every static profile, script hook, bridge, save/log corpus, and
hotseat/autoplay path fails to produce a meaningful strategy-control surface,
because the product should then collapse toward direct-control-only tactical
play and measured external playbooks.

Degeneration trigger: if three lane reports independently conclude "possibly
useful but unproven" without a concrete next probe, pause synthesis and repair
the investigation design before adding more reference material.

## Investigation Objective Shape

The investigation is a mixed codebase deep dive, local-resource analysis,
runtime feasibility spike, and decision-support synthesis. It uses verified
local evidence first, official resources second, repo docs and code third,
external references as corroboration, and speculation only as clearly marked
hypothesis.

Primary question:

- Which Civ7 mechanisms can a strategy agent use to affect game behavior, at
  what timescale, with what evidence and safety boundary?

Secondary questions:

- Can saves, logs, debug databases, and direct-control traces become a useful
  strategy corpus?
- Can generated AI profiles be safely swapped or layered at load or age
  boundaries?
- Can script hooks or triggered behavior trees express generated strategic or
  tactical intent?
- Can a companion mod bridge provide live strategic influence without bypassing
  direct-control guardrails?
- Do hotseat, Autoplay, or Automation findings change the solution shape?

Falsification questions:

- What would prove a path is static-only, observation-only, unsafe, or not
  worth pursuing?
- What evidence would prove a bridge path can modify behavior rather than just
  expose UI state?
- What evidence would prove local logs or saves are insufficient for measured
  strategy reconstruction?

## Lanes

### Lane A: Save, Log, And Corpus Trace

Investigate `.Civ7Save`, local logs, debug SQLite files, gameplay state files,
and possible turn-by-turn records. Determine whether these can reconstruct
human or native-AI play as a strategy corpus, and at what semantic fidelity.

### Lane B: Static AI Levers And Generated Profiles

Investigate official resources and RHQ for age transition, behavior trees,
triggered behavior trees, operations, tactics, pseudoyields, strategies,
`BoostHandlers`, `ScriptConsumer`, `TargetScript`, and `AI_BUDGET_SCRIPTING`.
Classify what can be generated, when it loads, and whether it can support a
profile compiler.

### Lane C: Runtime Bridge And Live Mutation

Investigate `GameInfo`, debug database readback, App UI scripts, localStorage,
events, operation APIs, and companion UI scripts. Classify what can be observed,
queued, displayed, triggered, or safely executed live, and where direct-control
must remain the only action authority.

### Lane D: Hotseat, Autoplay, And Direct-Control Stack

Inspect the hotseat branch or most recent hotseat solution packet and direct
control stack context. Determine whether hotseat, Autoplay, Automation, or
recent command/refactor findings change the live-play architecture or unlock
new bridge possibilities.

### Lane E: Synthesis, Domain, And API Shape

After lane reports exist, synthesize the actuation map, domain boundaries,
agent-facing API/tool contracts, eliminated paths, remaining probes, and
solution frame updates.

## Live Game Guard

The active live game is a shared resource. Investigations default to read-only
inspection. A probe may use the CLI against the live game if it only reads
state, captures logs, or performs ordinary safe direct-control operations. A
turn-advance or state-mutating test is allowed only when it is necessary to
answer a load-bearing question and the DRA can state the expected effect,
rollback or containment story, and user/supervisor coordination requirement.

If a destructive or materially state-changing test becomes necessary, notify
the running supervisor agent thread tied to the active refactor/game before
proceeding.

## Required Outputs

- Written lane reports under `docs/projects/civ7-intelligence-layer/agent-reports/`.
- Updates or companion docs that separate evidence/reference material from the
  solution frame.
- A synthesized actuation-path map that classifies each path and names its
  confidence.
- Updates to [SOLUTION-FRAME.md](SOLUTION-FRAME.md) or companion references
  only after evidence supports them.
- A closed workstream record with residual unknowns, eliminated paths, and the
  exact next probes if any remain.

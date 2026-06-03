# Runtime Bridge And Probe Reference

This reference keeps runtime bridge evidence, probe design, and under-investigated
threads close to [SOLUTION-FRAME.md](SOLUTION-FRAME.md) without making the main
solution frame depend on unproven mechanisms.

## Runtime Evidence

Concrete local findings from the investigation:

- `packages/civ7-direct-control` owns developer-process control through the
  tuner socket protocol.
- Direct-control can execute JavaScript in App UI and Tuner states.
- A live read-only proof found Civ7 listening on port `4318`, with states
  `App UI` and `Tuner`.
- App UI exposed `localStorage`, `Automation`, `Database`, `GameInfo`, and
  `engine`.
- Tuner exposed `Database`, `GameInfo`, and `engine`, but not `localStorage` or
  `Automation`.
- Installed UI mods use game/shell `UIScripts`, `engine.on(...)`, and
  `localStorage` settings.
- UI logs showed local UI mod scripts loading from `fs://game/...`.

These findings make an App UI companion bridge plausible. They do not prove
live native-AI policy steering.

## Bridge Mechanism Classification

| Mechanism | Status | Product meaning |
| --- | --- | --- |
| Direct-control sends JS to App UI/Tuner | Proven | Can inject controlled probes and wrapper commands |
| App UI companion mod via `UIScripts` | Proven | Can load a bridge script in game UI context |
| Companion reads `localStorage` intent | Likely | Good durable queue probe; storage collision risk exists |
| Companion observes App UI global variable | Likely | Good transient intent probe |
| Companion reacts to `engine.on(...)` hooks | Proven for native events | Can watch turn/frame/player events |
| Tuner-to-UI custom event bridge | Unproven | Must be probed before event delivery is assumed |
| Mod reads `GameInfo` / `Database` rows | Proven | Useful for observation and loaded-row checks |
| Companion affects native AI policy live | Unproven | Do not depend on it |
| Companion adds annotations/tactical helpers | Proven-likely | Safest bridge value |
| Companion sends player operations | Likely but high care | Needs direct-control-grade validators and postconditions |
| File polling from game script | Unproven | Do not design around it |
| Map script live bridge after game start | Ruled out for general play | Map scripts are generation-time |

## Safe Bridge Product First

The bridge should first serve:

- strategy-intent display;
- plan and objective queues;
- in-game annotations and overlays;
- richer observations that direct-control can read;
- harmless validation probes;
- helper affordances wrapped by approvals and postconditions.

The bridge should not first serve:

- live native AI database mutation;
- hot-reloading behavior trees;
- replacing direct-control action validation;
- raw external JS execution by an LLM.

## Required Probes

| Probe | Purpose | Success |
| --- | --- | --- |
| One-lever profile load | Prove compiler emits valid SQL/XML | Generated rows load and are visible |
| Fixed-seed A/B run | Prove profile changes behavior, not only rows | Metric moves across controlled runs |
| Behavior-tree generation | Prove generated tree graphs are valid | Tree loads, no DB errors, attached operation still runs |
| RHQ recipe isolation | Prove an RHQ pattern can be safely extracted | One mapped recipe loads and has measured effect |
| App UI global bridge | Prove direct-control can hand intent to a companion script | Script observes transient intent and logs harmless effect |
| `localStorage` bridge | Prove durable App UI intent queue | Script reads queue; local storage and UI log confirm |
| Custom event bridge | Test event-based delivery | Script receives injected event, or path is ruled out |
| Live AI reload falsifier | Test only in disposable session | Runtime row change and native AI re-read are both proven |

## Proof And Promotion Flow

Use this flow for every risky claim:

```text
hypothesis -> probe -> source/load/runtime proof -> measured outcome ->
confidence label update -> promote, defer, or reframe
```

A proof can promote an implementation only for the boundary it exercised. A
loaded-row proof can promote "the generated rows load." It cannot promote "the
AI played better." A harmless bridge probe can promote "the bridge received an
intent." It cannot promote "the bridge is safe for action execution."

## Reframe Triggers

Reframe the architecture if any of these become true:

- A measured probe proves native AI rows or behavior-tree state can be changed
  and re-read mid-game through a stable supported path.
- A companion mod cannot receive external intent through App UI globals,
  `localStorage`, or any safe event/polling mechanism.
- Direct-control lacks enough action coverage for credible hotseat live play.
- One-lever static profiles repeatedly load but fail to move behavior under
  fixed-seed A/B runs.
- Save/log reverse-engineering yields an ordered human action diary rich enough
  to become the main strategy corpus.

## Under-Investigated Threads

These are important but not baseline blockers:

- reverse-engineering `.Civ7Save` structure beyond string/chunk discovery;
- whether age transition can safely swap or layer generated profiles;
- whether `BoostHandlers`, `ScriptConsumer`, `TargetScript`, or
  `AI_BUDGET_SCRIPTING` can become a static or live bridge-like hook;
- whether `TriggeredBehaviorTrees` can be useful in generated profiles;
- whether live `GameInfo` row reads can be compared against debug database
  copies after every mod load;
- whether local AI logs can be assembled into a useful native-AI behavior trace
  for measured-run scoring;
- whether companion UI scripts can safely call operation APIs without weakening
  the direct-control approval/postcondition model.

## Local Source Pointers

- `packages/civ7-direct-control/AGENTS.md`
- `packages/civ7-direct-control/src/index.ts`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/LocalStorage.sqlite`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods.sqlite`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Logs/`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Debug/gameplay-copy.sqlite`

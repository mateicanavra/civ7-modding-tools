# Semantic CLI Envelope Contract

This is a planning contract for future normal `game play` output. It is not a
source implementation, accepted schema, AI-ingestion contract, telemetry
contract, debug/internal service contract, runtime proof, or Effect/oRPC
procedure-core contract.

The envelope target exists because the normal CLI player-agent surface must
remain useful to a human or local agent acting through a hotseat-scoped turn
without dumping the direct-control machinery underneath it. The AI-intelligence
layer may use a separate machine-readable contract over direct-control atoms and
proof records, but it must not train on or depend on CLI presentation strings.

## Scope

The semantic CLI envelope is for normal local player-agent output from
`game play` commands. It should summarize player-relevant state and action
guidance while preserving the separation between:

- normal CLI projection;
- debug/internal service projection;
- strategy/intelligence ingestion;
- operation/proof telemetry;
- Effect/oRPC procedure-core contracts.

The envelope is scoped to the current local player or agent-owned hotseat slot
when that evidence is available. Human-turn exclusion must remain visible when
future hotseat runtime proof and ownership registries are introduced.

## Future Envelope Slots

Future implementation should converge on a stable shape with these semantic
slots or direct equivalents:

| Slot | Purpose |
|---|---|
| `version` | Identifies the semantic envelope contract version once a schema owner exists. |
| `scope` | Describes current player, local-player, agent-slot, or observer scope from available direct-control evidence. |
| `state` | Summarizes game/turn/loading/readiness state that is relevant to a player-agent decision. |
| `blockers` | Lists current blockers such as notifications, ready units, ready cities, progression choices, narrative choices, diplomacy prompts, or production needs. |
| `decisions` | Lists meaningful choices the player-agent can evaluate, with labels and safe/unsafe markers when known. |
| `actions` | Lists candidate commands or actions with semantic family, target, args, approval requirement, and read-only/no-send markers. |
| `result` | Summarizes mutation results with sent status, verification/postcondition classification, reason, and no-repeat-after-unverified guidance where applicable. |
| `nextSteps` | Provides safe next commands, reread guidance, or explicit stop conditions for the player-agent surface. |
| `evidence` | Carries source/proof labels at player-agent granularity, without raw proof payloads. |
| `notes` | Provides concise warnings or relationship/proof caveats visible to the player-agent. |

## Normal CLI Exclusions

Normal `game play` output must not include these fields by default:

- raw session, transport, host, port, reconnect, route-selection, or closeout
  traces;
- embedded JavaScript command strings or raw `game exec` payloads;
- raw App UI/Tuner probe objects, runtime reflection output, SQL rows, or
  stack traces;
- full proof JSON, operation audit payloads, telemetry records, correlation IDs,
  or internal postcondition plumbing;
- AI-ingestion records, profile recipes, strategy corpus artifacts, or measured
  run records;
- Effect/oRPC procedure diagnostics, middleware state, or transport adapter
  state;
- relationship labels such as enemy, hostile, opponent, threat, war, ally, or
  suzerain unless official direct-control evidence supports them.

Those details belong to debug/internal service, telemetry, AI-ingestion, or
procedure-core surfaces with their own accepted rows and tests.

## Proof Classes

The semantic CLI envelope must keep these proof classes distinct:

- target-thread evidence;
- peer reports;
- repo docs and OpenSpec records;
- local package or CLI tests;
- official resources;
- logs/database artifacts;
- Tuner/App UI reads;
- live runtime proof;
- in-game observations.

Local CLI tests may prove formatting, semantic projection, fixture behavior, and
normal/debug separation. They do not prove live runtime behavior or hotseat
product safety.

## Acceptance Gaps

This contract reduces the `contractArtifact` gap for the Semantic CLI
Player-Agent View row, but it does not accept the row. Acceptance still needs:

- a named CLI semantic envelope source owner;
- a schema/test owner and concrete schema choice;
- focused tests proving normal play output carries the semantic envelope;
- tests proving raw session, transport, closeout, command, proof JSON,
  correlation, and probe internals are omitted from normal play output;
- tests or fixtures proving AI ingestion does not consume CLI presentation
  strings;
- stop-condition coverage for raw-output leakage, proof-class collapse,
  inferred relationship labels, and dependent implementation before Task 2.9.4
  row acceptance.

## Stop Conditions

Stop and reframe if future CLI semantic work:

- says "support both" while collapsing normal CLI, debug/internal service,
  AI-ingestion, telemetry, and procedure-core output into one raw JSON shape;
- lets AI consumers depend on CLI presentation text;
- dumps transport/proof internals in normal play output by default;
- treats local fake tests as live hotseat or runtime proof;
- trains, acts, or closes a result from vague `verified: true` instead of
  explicit postcondition/outcome evidence;
- infers relationship labels without official evidence.

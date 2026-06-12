# Play-Agent Output Contract Proposal

Date: 2026-06-01

Status: proposal only; no runtime implementation in this artifact.

## Purpose

Direct-control and CLI game calls should return a compact decision payload by
default, with explicit expansion paths for tactical details and debugging. The
consumer is an internal AI play agent making fast tactical decisions. The API is
operation/RPC-shaped, early, controlled, and allowed to evolve, but it should now
settle on one response vocabulary before more gameplay commands appear.

## Evidence Anchors

- App UI and Tuner are separate capability domains; App UI owns lifecycle,
  while post-Begin Tuner owns stronger gameplay/map reads and operation routers:
  `docs/projects/civ7-direct-control/workstream/capability-inventory/capability-inventory.md:7`
- Current direct-control read shapes already include status, map/plot/grid,
  player/unit/city, visibility, and operation validation/result types:
  `packages/civ7-direct-control/src/index.ts:303`
  `packages/civ7-direct-control/src/index.ts:325`
  `packages/civ7-direct-control/src/index.ts:787`
- Current wrappers are bounded, but still return full result payloads:
  `packages/civ7-direct-control/src/index.ts:1464`
  `packages/civ7-direct-control/src/index.ts:1491`
  `packages/civ7-direct-control/src/index.ts:1523`
  `packages/civ7-direct-control/src/index.ts:1555`
- CLI game commands currently emit `{ ok: true, result }` or full pretty JSON:
  `packages/cli/src/commands/game/operation.ts:89`
  `packages/cli/src/commands/game/map.ts:88`
  `packages/cli/src/commands/game/status.ts:40`
- Mutating operations are already validator-first and before/after-shaped:
  `packages/civ7-direct-control/src/index.ts:3888`
  `packages/civ7-direct-control/src/index.ts:3896`
- Turn completion already separates status, blocker, command, and verification:
  `packages/civ7-direct-control/src/index.ts:745`
  `packages/civ7-direct-control/src/index.ts:2021`
  `packages/civ7-direct-control/src/index.ts:3237`
- Existing action-surface research calls out notifications, blockers, unit/city
  operations, destination/movement, and postcondition requirements:
  `docs/projects/civ7-direct-control/workstream/control-surface-expansion/agent-action-surface.md:171`
  `docs/projects/civ7-direct-control/workstream/control-surface-expansion/agent-action-surface.md:199`

## API Position

- Consumer: internal AI play agent, not a human CLI user and not an unknown
  public integration.
- Task: observe current game state, choose one tactical action, execute approved
  operations, and debug bad decisions when needed.
- Relationship: controlled producer/consumer; Hyrum risk still matters because
  agent prompts and tests will learn observable fields.
- Contract formality: schema-first for normalized envelopes; raw engine payloads
  remain intentionally unstable.
- Interaction style: domain operation/RPC, not resource CRUD.
- Maturity: early. Prefer additive evolution and one opt-in experimental channel
  over preserving every current JSON field as default contract.

## Response Tiers

All play-agent commands should accept the same output controls.

CLI flags:

- Default: summary response. No flag required.
- `--fields a,b,c`: focused fields inside the default tier.
- `--expand hud,lens,audit`: include named contract sections.
- `--debug`: include probes, timing, truncation, and command provenance.
- `--raw`: include or emit the current full direct-control result. This is for
  debugging and migration, not tactical prompting.

SDK/RPC option:

```ts
type Civ7PlayAgentResponseOptions = {
  fields?: string[];
  expand?: Array<"hud" | "lens" | "operation" | "audit" | "debug" | "raw">;
  detail?: "summary" | "focused" | "expanded" | "raw";
};
```

Default summary returns:

```ts
type Civ7PlayAgentResponse<TSummary> = {
  ok: boolean;
  contractVersion: "play-agent-v0";
  command: string;
  requestId: string;
  summary: TSummary;
  next?: Civ7SuggestedNextStep[];
  omitted?: Civ7Omission[];
};
```

Focused fields keep the same envelope and narrow `summary`/`lens` by requested
field names. Focused output must never silently add hidden-info fields; hidden
facts require an explicit debug/developer option.

Expansion flags add sections:

- `hud`: turn, local player, readiness, blockers, ready-action counts.
- `lens`: tactical facts scoped to the command, such as nearby threats,
  reachable destinations, or candidate targets.
- `operation`: validator/request outcome for a specific action.
- `audit`: before/after and postcondition evidence for mutations.
- `debug`: probe results, selected state, raw command provenance, limits, timing.
- `raw`: current full direct-control payload under `raw`, or raw-only output
  when `detail: "raw"` is selected.

## Domain Boundary Split

### Operation Result

Owns the direct answer to the command. It says whether the requested operation
was valid, sent, blocked, or failed.

Use for:

- `valid`, `sent`, `verified`
- `outcome: "valid" | "invalid" | "sent" | "blocked" | "failed" | "unknown"`
- normalized reason codes
- operation family/type/target/args

Must not own:

- broad map context
- all unit/city state
- raw engine return objects except in debug/raw

### Decision HUD

Owns the minimum turn-level state an agent needs before deciding. It should be
small enough to prepend to most prompts.

Use for:

- `turn`, `turnDate`, `age`, `localPlayerId`
- `readiness`, `canAct`, `endTurnBlocker`
- ready units/cities/notifications counts and most urgent blocker
- visibility policy and hidden-info warning

Must not own:

- individual plot grids
- operation router internals
- proof of mutation

### Tactical Lens

Owns focused tactical context for one decision. This is the expandable middle
ground between summary and raw JSON.

Use for:

- ready-unit details and reachable destinations
- ready-city production/growth/build choices
- battlefield scan around one unit/city/location
- destination analysis and unit-target candidates
- local-player-visible map facts

Must not own:

- global hidden state by default
- debug probe shape
- before/after audit history

### Debug Envelope

Owns unstable diagnostic evidence.

Use for:

- `Civ7RuntimeProbe<T>` objects
- selected App UI/Tuner state
- raw direct-control command output
- truncation, omitted fields, timing, retry/reconnect data
- current implementation `result` objects

Must not be part of tactical defaults.

### Audit / Postcondition

Owns mutation evidence. Every mutating operation should return audit when
expanded, and summary should still report whether a postcondition passed.

Use for:

- `beforeRef`, `afterRef`, `postcondition`
- changed fields and confidence
- approval metadata
- non-replayability warnings

Must not own:

- legal-action discovery before validation
- tactical recommendations unrelated to the mutation

## Naming And Schema Conventions

- Use camelCase field names.
- Use stable, domain-level names: `decisionHud`, `tacticalLens`, `operation`,
  `audit`, `debug`, `raw`.
- Use kebab-case enum string values where they are contract vocabulary:
  `ready-unit`, `ready-city`, `end-turn-blocked`, `visibility-filtered`.
- Preserve existing Civ7 operation family strings:
  `unit-operation`, `unit-command`, `city-operation`, `city-command`,
  `player-operation`.
- Do not expose a generic top-level `result` in the play-agent contract. Current
  direct-control payloads can appear as `raw.currentResult`.
- Prefer `outcome` over overloaded `status`.
- IDs stay structured. Component IDs remain `{ owner, id, type }`; locations
  remain `{ x, y }`.
- Summary fields should be concrete values or `null` with an omission reason.
  Probe objects belong in `debug.probes`.
- Every bounded collection reports `{ count, omitted }` or an `omitted[]` entry.
- Every response states `hiddenInfoPolicy`.
- Mutating responses state `replaySafe: false` unless a future proof establishes
  idempotency.

Shared support types:

```ts
type Civ7Omission = {
  path: string;
  reason:
    | "not-expanded"
    | "not-requested"
    | "visibility-filtered"
    | "limit"
    | "unavailable"
    | "experimental";
  count?: number;
};

type Civ7SuggestedNextStep = {
  kind: "inspect" | "validate" | "execute" | "choose" | "wait" | "debug";
  command: string;
  reason: string;
  risk: "read" | "low" | "medium" | "high";
};
```

## Representative Command Shapes

### `game status`

Default summary:

```json
{
  "ok": true,
  "contractVersion": "play-agent-v0",
  "command": "game status",
  "requestId": "req-...",
  "summary": {
    "playable": true,
    "readiness": "tuner-ready",
    "turn": 42,
    "turnDate": "1200 BCE",
    "localPlayerId": 0,
    "canAct": true,
    "endTurnBlocker": null,
    "hiddenInfoPolicy": "visibility-filtered"
  },
  "omitted": [
    { "path": "debug", "reason": "not-expanded" },
    { "path": "raw", "reason": "not-expanded" }
  ]
}
```

Expanded HUD:

```json
{
  "decisionHud": {
    "ready": {
      "units": { "count": 2, "omitted": 0 },
      "cities": { "count": 1, "omitted": 0 },
      "notifications": { "count": 1, "urgent": "choose-research" }
    },
    "blockers": [
      { "kind": "notification", "code": "choose-research", "actionRequired": true }
    ]
  }
}
```

### `game tactical ready-actions`

This is the proposed summary-first replacement for separate noisy ready-unit,
ready-city, and notification dumps.

Default summary:

```json
{
  "summary": {
    "turn": 42,
    "urgentKind": "ready-unit",
    "readyCounts": { "units": 2, "cities": 1, "notifications": 1 },
    "recommendedFocus": { "kind": "unit", "unitId": { "owner": 0, "id": 65536, "type": 26 } },
    "hiddenInfoPolicy": "visibility-filtered"
  },
  "next": [
    {
      "kind": "inspect",
      "command": "game tactical battlefield --unit-id '{...}' --expand lens",
      "reason": "unit has movement and visible adjacent threat",
      "risk": "read"
    }
  ]
}
```

Expanded tactical lens:

```json
{
  "tacticalLens": {
    "readyUnits": [
      {
        "unitId": { "owner": 0, "id": 65536, "type": 26 },
        "name": "Scout",
        "location": { "x": 32, "y": 33 },
        "movement": 2,
        "visibleThreats": 0,
        "topLegalActions": ["MOVE_TO", "SKIP_TURN"]
      }
    ],
    "readyCities": [
      {
        "cityId": { "owner": 0, "id": 131072, "type": 32 },
        "name": "Capital",
        "needsChoice": "production",
        "topLegalActions": ["BUILD"]
      }
    ],
    "notifications": [
      {
        "id": "notification:choose-research",
        "kind": "choose-research",
        "actionRequired": true,
        "operationFamily": "player-operation"
      }
    ]
  }
}
```

### `game tactical battlefield`

Default summary for a unit-scoped scan:

```json
{
  "summary": {
    "subject": { "kind": "unit", "unitId": { "owner": 0, "id": 65536, "type": 26 } },
    "location": { "x": 32, "y": 33 },
    "visibleEnemyUnits": 1,
    "visibleFriendlyUnits": 2,
    "cityThreat": "none",
    "terrainSignal": "mixed-open-rough",
    "recommendedPosture": "avoid-combat",
    "hiddenInfoPolicy": "visibility-filtered"
  }
}
```

Expanded lens:

```json
{
  "tacticalLens": {
    "radius": 3,
    "plots": { "count": 37, "omitted": 0 },
    "threats": [
      {
        "kind": "unit",
        "unitId": { "owner": 1, "id": 777, "type": 26 },
        "location": { "x": 34, "y": 33 },
        "distance": 2,
        "confidence": "visible"
      }
    ],
    "opportunities": [
      { "kind": "goody-hut", "location": { "x": 31, "y": 35 }, "distance": 2 }
    ]
  }
}
```

### `game tactical destination`

This should answer "where can this unit usefully go?" without dumping every map
fact.

Default summary:

```json
{
  "summary": {
    "unitId": { "owner": 0, "id": 65536, "type": 26 },
    "candidateCount": 5,
    "best": {
      "location": { "x": 31, "y": 35 },
      "score": 0.82,
      "reason": "reveals two unknown adjacent plots without entering threat"
    },
    "blocked": false,
    "hiddenInfoPolicy": "visibility-filtered"
  }
}
```

Expanded lens:

```json
{
  "tacticalLens": {
    "candidates": [
      {
        "location": { "x": 31, "y": 35 },
        "legal": true,
        "score": 0.82,
        "features": {
          "newVisiblePlots": 2,
          "threatAfterMove": 0,
          "resourceSignal": null,
          "terrainCost": 1
        },
        "validation": {
          "family": "unit-operation",
          "operationType": "MOVE_TO",
          "valid": true
        }
      }
    ],
    "omittedCandidates": 12
  }
}
```

### `game operation`

Validation summary:

```json
{
  "summary": {
    "family": "unit-operation",
    "operationType": "SKIP_TURN",
    "target": { "unitId": { "owner": 0, "id": 65536, "type": 26 } },
    "outcome": "valid",
    "valid": true,
    "risk": "medium",
    "sendable": true
  }
}
```

Send summary with audit expansion:

```json
{
  "summary": {
    "family": "unit-operation",
    "operationType": "SKIP_TURN",
    "outcome": "sent",
    "sent": true,
    "verified": true,
    "replaySafe": false
  },
  "operation": {
    "before": { "valid": true },
    "after": { "valid": false },
    "postcondition": {
      "kind": "unit-activity-changed",
      "passed": true,
      "confidence": "runtime-observed"
    }
  },
  "audit": {
    "approvalReason": "CLI unit-operation request",
    "beforeRef": "snapshot:unit:65536:before",
    "afterRef": "snapshot:unit:65536:after",
    "mutation": "Game.UnitOperations.sendRequest",
    "replaySafe": false
  }
}
```

## Backward Compatibility And Evolution

1. Add the new contract as an opt-in mode first:
   `--contract play-agent-v0` or SDK `response.detail`.
2. Keep existing `{ ok, result }` CLI JSON as `--raw` or
   `--contract direct-control-v1` during migration.
3. Add contract tests that assert summary shape and omission entries for:
   `game status`, `game map`, `game map visibility`, `game operation`, and any new
   tactical command.
4. Add focused-field tests for `--fields` and expansion tests for
   `--expand hud,lens,audit,debug`.
5. Snapshot only normalized play-agent envelopes. Do not snapshot raw engine
   objects except in debug/raw tests with small fixtures.
6. Mark `play-agent-v0` experimental in docs until the ready-action,
   destination, and target wrappers have live proof.
7. Promote to `play-agent-v1` only after one full supervised turn loop proves:
   ready-action selection, unit/city/player validation, one approved mutation,
   blocker/notification reporting, and postcondition reporting.

Breaking-change rules while in `v0`:

- Summary may add fields.
- Summary should not remove or rename fields without updating tests and this
  artifact.
- `debug` and `raw` are explicitly unstable.
- Hidden-info defaults must only become stricter, never looser, without a
  product decision.

## Risks To Play Quality

- Hiding validator failure details can make the agent retry impossible actions.
  Keep reason codes in summary and detailed raw validator output behind
  `operation` or `debug`.
- Hiding omitted counts can make the agent over-trust partial scans. Every
  bounded collection needs `omitted`.
- Summary-only battlefield scans can miss tactical traps if threat radius,
  visibility, or enemy movement is not represented. Include threat confidence
  and hidden-info policy in the summary.
- Destination ranking can encode bad heuristics as authority. Return features
  and not only scores so prompts can reason about tradeoffs.
- Notification summaries can understate required choices. Urgent blockers must
  name the operation family needed to resolve them when known.
- Compact city summaries can hide production/gold/resource constraints. City
  choice summaries need enough economic context to avoid invalid build choices.
- Hiding raw `Civ7RuntimeProbe` errors can mask runtime drift. Debug expansion
  must be available and tests should check that unavailable probes produce
  explicit omissions.
- Defaulting to local-player visibility protects fair play but can reduce map
  planning quality. Developer diagnostics may use `include-hidden`, but the
  summary must label that policy clearly.

## Mandate Checks

- Contract: a new play-agent consumer can build against the envelope, sections,
  flags, and examples here without reading runtime source.
- Consistency: all command families use the same top-level envelope and
  expansion names.
- Consumer fit: the default payload answers "what should I do next?" before
  exposing engine details.
- Evolution: raw/current direct-control JSON remains accessible without making
  it the default contract.
- Boundary: direct-control owns runtime operation contracts; CLI owns flags and
  formatting; tactical lenses are domain summaries, not raw socket or engine
  ownership.

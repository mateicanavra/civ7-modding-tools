# Agent Thread Ledger

Status: `active`.
Updated: `2026-06-01`.

This ledger keeps background Civ7 research threads from becoming invisible work.
It is operational project state, not a reusable skill asset. Promote findings
only after they are folded into a topic, command contract, evidence pack, or
implementation slice.

## Operating Rule

- Do not start a new research thread until active lanes have a report-back
  instruction and a recorded integration target.
- Every thread ends in one of four states: `active`, `integrated`, `superseded`,
  or `archived`.
- A thread is `integrated` only when its useful findings are represented in a
  committed artifact or a deliberate "no action" note below.
- Archive completed side threads after their output is integrated. Keep the
  active play thread and the main watcher thread unarchived.

## Live Control Threads

| Thread | Role | Status | Integration target |
| --- | --- | --- | --- |
| `019e821b-364c-72a3-83ef-9263120ece72` | Active Civ7 play agent. | `active` | Watch only; send concise operational updates when support findings change live decisions. |
| `019e8225-4572-75f0-81b7-93ccc368bfd3` | Main watcher/reference assembly thread. | `active` | Owns this ledger and support-topic integration. |

## Reported Research Lanes

Each lane was created as a regular project-local thread. Every lane was sent a
checkpoint instruction and returned without tracked edits. Their findings are
being folded into topics in this branch.

| Thread | Lane | Status | Expected output |
| --- | --- | --- | --- |
| `019e8584-bab2-7c52-925b-b86c5b176b89` | Combat, ranged, siege, and city-targeting official affordances. | `integrated` | Folded validator-first target plots into `topics/official-runtime-affordance-inventory.md`; future surface is `game play unit targets`. |
| `019e8584-f3cc-7b72-a959-d8ee33ab3481` | Movement, path, destination, queued movement, and risk APIs. | `integrated` | Folded path shape and nested alias notes into `topics/unit-move-preview.md`. |
| `019e8584-f597-7772-96f0-bff2719c4d78` | Notifications, events, SQLite boundary, Effect PubSub, and materialized HUD. | `integrated` | Folded Effect/event boundary and bulk snapshot guidance into `topics/notification-decision-hud.md`. |
| `019e8584-f793-7401-a408-3027a9794f43` | Economy, city, diplomacy, trade, and map overlay affordances. | `integrated` | Folded city/economy/trade/diplomacy table into `topics/official-runtime-affordance-inventory.md`. |
| `019e8585-a669-7a72-b753-be36ec1ba41b` | Source/API review of `game play` topic-command-subcommand structure. | `integrated` | Folded into `topics/command-surface-design.md`. |
| `019e8585-a8d0-7473-8c3b-98d722c064d4` | Play-agent ergonomics review of command grammar and topic shortcuts. | `integrated` | Folded into `topics/command-surface-design.md`. |

## Integrated Side Threads

| Thread | Lane | Integrated evidence | Follow-up |
| --- | --- | --- | --- |
| `019e8563-c133-76e3-a09f-a314b3e52d5d` | Unit movement reliability taxonomy. | Fed `unit-target` movement classifications and unit-operation postcondition work. | Archive after this ledger lands. |
| `019e8563-dfb8-7c53-b0e6-26db9e9301df` | Assyria siege tactical reference packet. | Folded into `topics/assyria-siege-posture.md` and tactical support guidance. | Archive after this ledger lands. |
| `019e857d-8600-7170-9c8b-d9841dbc9ff6` | Official movement API and multi-turn destination investigation. | Committed direct-control artifact `unit-movement-api-investigation.md`; summarized into `topics/unit-destination-queue.md` and `topics/unit-move-preview.md`. | Archive after this ledger lands. |
| `019e857d-8989-7aa1-a09c-2287da587e12` | Summary-first play-agent output contract. | Committed direct-control artifact `play-agent-output-contract.md`; summarized into `topics/play-agent-response-contract.md`. | Archive after this ledger lands. |
| `019e84d0-6116-7483-9c95-21fdf4f7ed77` | RHQ AI Workshop baseline. | Folded into `topics/rhq-ai-mod-baseline.md` and AI-lever framing. | Archive after this ledger lands. |
| `019e84d0-8a43-7053-9f08-8c3ec711cbfa` | Multi-turn strategy and implementation-surface analysis. | Folded into `topics/multi-turn-strategy-and-ai-levers.md`, `topics/strategic-planning-snapshot.md`, and target/formation lens roadmap. | Archive after this ledger lands. |

## Next Integration Sweep

1. Commit the integrated topic and ledger updates.
2. Archive completed integrated side lanes.
3. Notify the active play thread only when a finding changes live-play behavior,
   for example a safer movement preview, targeting lens, bulk notification
   queue, or command grammar shortcut.

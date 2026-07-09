# Domino 062: Repair Studio DevOps Source-Watch Topology

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 62: Repair Studio DevOps Source-Watch Topology

Status: closed on `codex/habitat-studio-devops-topology-source-watch`.

Purpose: repair the Studio devops survivor rule to current daemon source
resolution authority, then retire the separate `devLive.ts` absence packet.

Disposition receipt:

| Rule id | Action | Reason | Receipt |
| --- | --- | --- | --- |
| `enforce_studio_dev_runner_topology` | preserved and repaired | The live `serve-daemon` target requires `bun --conditions bun-source src/server/daemon/daemon.ts`: source resolution stays explicit, while Bun watch is forbidden because runtime writes must not restart the operation owner. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-studio-devops-topology-source-watch-slice.md` |
| `prohibit_retired_studio_devlive_daemon_file` | retired/deleted | The survivor devops topology rule now owns retired `src/server/daemon/devLive.ts` absence directly, so the single-file structure packet no longer owns a separate surface. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-studio-devops-topology-source-watch-slice.md` |

Moves it forward:

- Removes the last direct retirement/garbage-collection row from the canonical
  queue.
- Aligns Studio devops authority with the stable daemon source-resolution
  topology.
- Keeps live Run in Game product verification out of this structural slice.

Closure note:

- The verification claim is structural devops topology, not a live Run in Game
  product test.

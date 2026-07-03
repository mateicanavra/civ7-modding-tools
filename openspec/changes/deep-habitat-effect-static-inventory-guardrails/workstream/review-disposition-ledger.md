# Review Disposition Ledger

## Review Wave

- Reviewer lane: static inventory completeness and owner-layer guardrail
  expectations.
- Reviewed state: packet opened above `agent-DRA-effect-substrate-architecture`.

## Initial Dispositions

| Severity | Finding | Disposition |
|---|---|---|
| P1 | Packet must contain a complete direct-use inventory before source migration can start. | Repaired by `workstream/static-inventory.md`, covering runtime, process, fs/temp, env/config, time, generic errors, broad exports, `ownerTool`, option bags, and vocabulary. |
| P1 | Packet must not claim guardrails are enforced without fixtures and current-tree proof. | Repaired by `workstream/guardrail-owner-map.md`; no new blocking guardrail is enabled in this packet. |
| P2 | Tests and fixtures could inflate the blocker inventory. | Dispositioned by explicit scope: production source and package scripts are blocker scope; tests are `test-helper` unless edited by a later packet. |
| P1 | `.habitat` authored authority data were outside actual inventory scope despite being in the requested guardrail scope. | Repaired by adding `.habitat` authored authority data inventory for 50 rule records, 33 check patterns, 3 apply patterns, and 0 executable-code files. |
| P1 | Process execution inventory matched `process.exitCode` as `process.exit` and missed Effect platform command execution. | Repaired by narrowing runtime-runner matching to `process.exit(` and adding process stream/Effect `Command.make`/`Command.start` inventory. |
| P1 | Public exports inventory only covered broad `export *` and omitted root/package/plugin exports. | Repaired by adding root barrel, package manifest, plugin entrypoint, and D0 row-ledger citations. |
| P2 | Full `bun run habitat:check -- --json` verification does not produce JSON; after stale doc-anchor repair, isolated `command-check` and `target-check` pass but Grit-backed `pattern-check` still times out under a bounded rerun. | Recorded as a verification blocker in `phase-record.md`; packet cannot claim full aggregate Habitat check success until `pattern-check` is diagnosed or rerun successfully. |

## Acceptance Contract

This packet can close when:

- `static-inventory.md` remains aligned with the scan commands;
- `guardrail-owner-map.md` assigns owner/authority paths for every recurring
  violation class;
- tasks record that no new injected fixture is required because no new guardrail
  is enabled;
- validation commands pass on a dedicated Graphite layer.

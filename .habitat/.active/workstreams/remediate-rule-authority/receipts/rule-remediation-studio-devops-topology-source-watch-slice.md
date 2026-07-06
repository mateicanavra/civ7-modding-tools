# Rule Remediation: Studio DevOps Topology Source-Watch Slice

Status: closed

Branch: `codex/habitat-studio-devops-topology-source-watch`

Canonical source:
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json`

## Purpose

Repair the Studio devops topology survivor rule to current source-watch daemon
authority, then retire the separate `devLive.ts` absence rule.

## Selected Rows

| Rule id | Disposition |
| --- | --- |
| `enforce_studio_dev_runner_topology` | Preserved and repaired to the current source-watch `serve-daemon` command. |
| `prohibit_retired_studio_devlive_daemon_file` | Deleted after its absence predicate was absorbed into the survivor topology rule. |

## Decision

The current Studio dev daemon command is not the old plain Bun invocation. The
source-watch handoff and live `project.json` agree on:

```text
bun --conditions bun-source --watch src/server/daemon/daemon.ts
```

The survivor rule now checks that command, the target `cwd`, package-script
absence, Vite watch ignores, required source comments/tokens, and retired
`src/server/daemon/devLive.ts` absence.

## Proof Boundary

This proves structural devops topology and source-watch command shape. It does
not claim runtime hot-reload product proof; that remains a separate runtime
verification class.

## Verification

- `bun habitat check --rule enforce_studio_dev_runner_topology --json` passed.
- `apps/mapgen-studio/src/server/daemon/devLive.ts` is absent.
- Deleted `prohibit_retired_studio_devlive_daemon_file` manifest is absent from
  the live authority tree.
- Canonical JSON and live manifests reconcile at 116.


# Rule Remediation: Studio DevOps Stable Daemon Source Slice

Status: closed

Branch: `codex/habitat-studio-devops-topology-source-watch`

Canonical source:
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json`

## Purpose

Repair the Studio devops topology survivor rule to current stable daemon source
resolution authority, then retire the separate `devLive.ts` absence rule.

## Selected Rows

| Rule id | Disposition |
| --- | --- |
| `enforce_studio_dev_runner_topology` | Preserved and repaired to the current stable `serve-daemon` command: `bun-source` resolution without Bun watch. |
| `prohibit_retired_studio_devlive_daemon_file` | Deleted after its absence predicate was absorbed into the survivor topology rule. |

## Decision

The current Studio dev daemon command is not the old plain Bun invocation and
must not be a watched Bun process. The live `project.json` agrees on:

```text
bun --conditions bun-source src/server/daemon/daemon.ts
```

The survivor rule now checks that command, the target `cwd`, package-script
absence, Vite watch ignores, required source comments/tokens, explicit
`--watch` absence from the daemon source contract, and retired
`src/server/daemon/devLive.ts` absence. This preserves dev source resolution
without allowing generated/runtime writes to restart the process that owns
Run in Game operation state.

## Proof Boundary

This verifies structural devops topology and stable source-resolution command
shape. It does not claim live Run in Game product verification; that remains a
separate runtime verification class.

## Verification

- `bun habitat check --rule enforce_studio_dev_runner_topology --json` passed.
- `apps/mapgen-studio/src/server/daemon/devLive.ts` is absent.
- Deleted `prohibit_retired_studio_devlive_daemon_file` manifest is absent from
  the live authority tree.
- Canonical JSON and live manifests reconcile at 116.

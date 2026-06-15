# Command Proof Log

**Change:** `habitat-grit-proof-repair`
**Status:** contract seeded; implementation must fill rows before accepting
proof labels.

Each command proof row must include:

| Field | Required content |
| --- | --- |
| Proof id | Stable id referenced by matrix/tasks |
| Proof class | native sample / current-tree wrapper / raw acquisition / injected violation / baseline / parity / Nx scheduling / dry-run / applied diff / rollback / stale-record scan |
| Branch and commit | branch plus commit or dirty-state marker at execution time |
| Command | exact argv as executed |
| CWD | working directory |
| Env delta | relevant env additions or proof that none were set |
| Exit code | numeric exit code or signal/interruption class |
| Raw output artifact | path under `/tmp` or workstream artifact, or bounded excerpt |
| Parsed summary | counts, ids, statuses, cache state, or selected rule ids |
| Cache/fresh status | required for Nx and Grit cache-sensitive probes |
| Duration/timing source | measured duration or explicit not recorded |
| Proof result | satisfied / failed / interrupted / unclaimed |
| Non-claim | what the command does not prove |
| Skipped-gate rationale | required when a planned proof is not run |

## Seeded Design-Probe Rows

| Proof id | Proof class | Branch and commit | Command | CWD | Env delta | Exit code | Raw output artifact | Parsed summary | Cache/fresh status | Duration/timing source | Proof result | Non-claim | Skipped-gate rationale |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `DESIGN-NATIVE-SAMPLES-2026-06-14` | native sample | `codex/habitat-dra-takeover-frame` / dirty design packet | `GRIT_TELEMETRY_DISABLED=true grit patterns test --json` | repo root | `GRIT_TELEMETRY_DISABLED=true` | 0 | `/tmp/habitat-grit-patterns-combined.txt` | 23 reports, 45 samples, all success/pass | fresh local command | not recorded | satisfied for design seed | no current-tree, baseline, parity, or apply safety proof | not skipped |
| `DESIGN-HABITAT-GRIT-TOOL-2026-06-14` | current-tree wrapper | `codex/habitat-dra-takeover-frame` / dirty design packet | `bun run habitat:check -- --json --tool grit-check` | repo root | none beyond script env | 0 | `/tmp/habitat-grit-tool-report.json` | schemaVersion 1, `ok:true`, 22 Grit checks plus `baseline-integrity`, all pass | fresh local command | not recorded | satisfied for design seed | no injected violation or apply safety proof | not skipped |
| `DESIGN-WRONG-NAMESPACE-2026-06-14` | current selector contradiction | `codex/habitat-dra-takeover-frame` / dirty design packet | `bun run habitat:check -- --json --rule grit-check` | repo root | none beyond script env | 0 | `/tmp/habitat-grit-rule-grit-check-report.json` | schemaVersion 1, `ok:true`, only `baseline-integrity` | fresh local command | not recorded | failed as proof; supports dependency on command repair | no Grit rule proof | not skipped |
| `DESIGN-RAW-GRIT-UNCLAIMED-2026-06-14` | raw acquisition | `codex/habitat-dra-takeover-frame` / dirty design packet | `grit --json check --level error packages apps/mapgen-studio/src mods/mod-swooper-maps/src/recipes mods/mod-swooper-maps/src/maps mods/mod-swooper-maps/src/domain` | repo root | `GRIT_TELEMETRY_DISABLED=true`, temp `GRIT_CACHE_DIR` | interrupted | `/tmp/habitat-raw-grit-current-tree.json`, `/tmp/habitat-raw-grit-current-tree.stderr` | no output captured | interrupted local command | stopped after useful design-probe bound | unclaimed | no raw direct Grit proof | raw direct proof remains unresolved |
| `DESIGN-FIX-DRY-RUN-2026-06-14` | dry-run | `codex/habitat-dra-takeover-frame` / dirty design packet | `bun run habitat:fix -- --dry-run` | repo root | none beyond script env | 0 | `/tmp/habitat-fix-dry-run.stdout`, `/tmp/habitat-fix-dry-run.stderr` | Grit processed 234 files and found 0 matches; Biome checked 2343 files and applied no fixes | fresh local command | not recorded | satisfied for live-tree hygiene | no injected rewrite safety proof | not skipped |

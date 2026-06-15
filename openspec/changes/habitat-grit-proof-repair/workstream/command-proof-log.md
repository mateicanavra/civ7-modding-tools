# Command Proof Log

**Change:** `habitat-grit-proof-repair`
**Status:** implementation rows recorded for native samples, Habitat wrapper
tool selection, wrong-namespace rejection, per-rule selector projection, and
raw-direct non-claim. Injected, baseline, apply, parity, and downstream proof
rows remain open.

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

## Implementation Proof Rows

| Proof id | Proof class | Branch and commit | Command | CWD | Env delta | Exit code | Raw output artifact | Parsed summary | Cache/fresh status | Duration/timing source | Proof result | Non-claim | Skipped-gate rationale |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `HGPR-NATIVE-SAMPLES-2026-06-15` | native sample | `agent-HR-habitat-grit-proof-repair` / `3ceb93d5c` clean before record edits | `GRIT_TELEMETRY_DISABLED=true bun x --no-install grit patterns test --json` | repo root | `GRIT_TELEMETRY_DISABLED=true` | 0 | `/tmp/habitat-grit-proof-repair-3ceb93d5c/grit-patterns-test-bunx.stderr` (`sha256=5951004a16e34ecd7ec86c444741125a883b658ddf5f6e2c35ff917f2b70d4cb`) | Native Grit emitted human pattern lines plus JSON on stderr; parsed summary artifact `/tmp/habitat-grit-proof-repair-3ceb93d5c/grit-patterns-test-summary.json` records 23 testable patterns, 45 samples, 0 failures. | Native sample command; current-tree Grit cache/fresh status not claimed. | not recorded | satisfied | Does not prove Habitat wrapper scan roots, injected violations, baselines, raw current-tree acquisition, or apply safety. | not skipped |
| `HGPR-HARNESS-GRIT-PATTERNS-2026-06-15` | native sample | `agent-HR-habitat-grit-proof-repair` / `3ceb93d5c` clean before record edits | `bun run --cwd tools/habitat-harness test -- grit-patterns.test.ts` | repo root | none beyond script env | 0 | `/tmp/habitat-grit-proof-repair-3ceb93d5c/harness-grit-patterns-test.stdout` (`sha256=85f21a22480c7643177318ab0ff997f0b6bc4f74f4124edd8a406bfb44cd8324`) | Vitest passed 1 file / 1 test for the harness native Grit sample wrapper. | Test runner proof; not cache-sensitive Grit current-tree proof. | not recorded | satisfied | Does not prove Habitat wrapper current-tree behavior, injected violations, baselines, or apply safety. | not skipped |
| `HGPR-HABITAT-GRIT-TOOL-2026-06-15` | current-tree wrapper | `agent-HR-habitat-grit-proof-repair` / `3ceb93d5c` clean before record edits | `bun run habitat:check -- --json --tool grit-check` | repo root | none beyond script env | 0 | `/tmp/habitat-grit-proof-repair-3ceb93d5c/tool-grit-check.json` (`sha256=644188b9c50c1e94a609ae98bb44ed120970af245b225807f3b766e0aa3f52b9`) | CheckReport schemaVersion 1, `ok:true`, 22 Grit check reports plus `baseline-integrity`, all pass with zero diagnostics. | Habitat wrapper proof through accepted adapter; direct raw Grit cache/fresh status remains unclaimed. | not recorded | satisfied | Does not prove injected violation behavior, raw direct Grit acquisition, baseline shrink/write behavior, apply safety, or product/runtime behavior. | not skipped |
| `HGPR-WRONG-NAMESPACE-2026-06-15` | current-tree wrapper | `agent-HR-habitat-grit-proof-repair` / `3ceb93d5c` clean before record edits | `bun run habitat:check -- --json --rule grit-check` | repo root | none beyond script env | 1 | `/tmp/habitat-grit-proof-repair-3ceb93d5c/rule-grit-check.json` (`sha256=8445b8466a7893a74a7592707e4a9948c679d429e1892bf78263b0ab9994a9aa`) | CheckReport schemaVersion 1, `ok:false`, `rule-selection-integrity` fails with `"grit-check" is a known tool id, not a rule id.` | Selector validation proof; no Grit scan is expected for this invalid selector. | not recorded | satisfied as wrong-namespace rejection | Does not prove any Grit rule behavior; it proves command selector trust for the invalid namespace case only. | not skipped |
| `HGPR-PER-RULE-SELECTORS-2026-06-15` | current-tree wrapper | `agent-HR-habitat-grit-proof-repair` / `3ceb93d5c` clean before record edits | Node batch executing `bun run habitat:check -- --json --rule <rule-id>` for each of the 22 current `ownerTool=grit-check` rule ids | repo root | none beyond script env | 0 | `/tmp/habitat-grit-proof-repair-3ceb93d5c/per-rule-summary.json` (`sha256=15e2af068a2eca300cb3466947abb28cbf4a03b4e3880a9d7a3b846d443572db`); per-rule CheckReport artifacts are `/tmp/habitat-grit-proof-repair-3ceb93d5c/rule-<rule-id>.json` | 22 selector commands ran; each exited 0 with CheckReport schemaVersion 1, `ok:true`, exactly the requested Grit rule as `pass` plus `baseline-integrity:pass`; failures=0. | Habitat wrapper proof through accepted adapter; direct raw Grit cache/fresh status remains unclaimed. | batch measured per command in summary artifact | satisfied | Does not prove injected violation behavior, raw direct Grit acquisition, baseline shrink/write behavior, apply safety, or product/runtime behavior. | not skipped |
| `HGPR-RAW-GRIT-UNCLAIMED-2026-06-15` | raw acquisition | `agent-HR-habitat-grit-proof-repair` / `3ceb93d5c` | not run in this selector/current-tree slice | repo root | not applicable | not applicable | none | Direct raw Grit current-tree acquisition remains unclaimed for every current row; Habitat wrapper proof controls only the current-tree wrapper claim. | not applicable | not applicable | unclaimed | Does not prove raw direct Grit acquisition or raw schema stability. | Deferred intentionally; this slice records wrapper current-tree proof after adapter acceptance and keeps raw acquisition separate. |

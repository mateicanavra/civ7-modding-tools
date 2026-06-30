# Public Contract Risk Register

## Contract Boundary

This packet does not change public behavior. It names the surfaces that later
source packets must preserve, facade, version, or explicitly deprecate before
moving implementation code.

Concrete row ownership lives in `public-surface-ledger.md`. This risk register
is invalid without that ledger.

## Risk Register

| Surface | Current evidence | Risk during refactor | Required gate before closure of source packet |
|---|---|---|---|
| CLI command names and flags | `src/commands/{check,classify,fix,graph,hook,verify}.ts`; `src/bin/habitat.ts`; Oclif manifest build | Moving logic can change exit codes, text, JSON, or flag semantics | Command smoke tests for each command plus focused parity tests for changed command |
| `CheckReport` v1 | `src/lib/check-report.ts`; `src/lib/diagnostics.ts`; `src/lib/check/schema.ts`; root exports | Internal domain rename can leak into JSON fields, especially `ownerTool`, duration, baseline fields | Golden schema validation and compatibility mapping from new internals to v1 |
| Classify output | `src/lib/classify-core/**`; `src/lib/classify.ts`; D0 matrix classify rows | Nx provider split can change project-path/diff/refusal states | H8 classify path/diff matrix and JSON/text rendering parity |
| Verify receipts | `src/lib/verify/**`; `src/commands/verify.ts` | Git/Nx provider split can change receipt shape, timestamps, cache task fields, or base resolution language | Receipt schema tests, fake Git/Nx provider matrix, command JSON parity |
| Hook behavior | `.husky/pre-commit`; `.husky/pre-push`; `src/service/modules/hook/**`; `src/lib/hook-runtime/**`; `src/commands/hook.ts` | Effect resource scoping can change staged/restage behavior or local-only non-claims | staged/unstaged/partial/restage tests, pre-push base proof, hook non-claim receipt |
| Package exports | `tools/habitat-harness/package.json` exports `.` and `./plugin`; `src/index.ts`; `src/plugin.ts` | Moving internals can break consumers currently importing broad root exports | Public-surface facade packet with callsite census and D0 compatibility matrix update |
| Nx plugin and generators | `src/plugin.ts`; `src/plugin/**`; `src/generators/**`; `generators.json`; package `generators` field | Domain extraction can break Nx generator contract, schema output, or plugin target metadata | generator tests, schema generation check, plugin metadata/typecheck |
| Root scripts and Nx targets | `package.json` scripts; root AGENTS tooling defaults; package Nx targets | Provider command materialization can bypass repo-local pinned tools or dependency ordering | root script parity, local package script checks, Nx target proof where packet touches targets |
| Grit checks/apply | `src/substrate/providers/grit/**`; `src/lib/pattern-apply/**`; `validate:grit-patterns` | Providerization can change scan-root admission, dry-run/apply output, or diagnostics parsing | Grit parser/scan-root/apply matrix and native pattern tests |
| `.habitat` authored authority data | `.habitat/rules/**`, `.habitat/baselines/**`, `.habitat/patterns/**`; D14A packet | Scaffolding/resource moves can put managing code or runtime topology under `.habitat` | authored-artifact guard and TypeBox read-edge validation |
| Public docs/examples | `tools/habitat-harness/README.md`, `tools/habitat-harness/docs/**`, `docs/process/GRAPHITE.md`, root AGENTS | New architecture can make docs point at retired commands or stale paths | Adjacent docs update in packet that changes behavior or public contract |

## Compatibility Rule

Later implementation packets must choose one handling for each affected public
surface:

- `preserve`: behavior and shape remain identical.
- `facade`: new internals map back to the old public shape.
- `version`: a new explicit public version is introduced.
- `deprecate`: old public path stays with a named removal trigger.
- `refuse`: unsupported state is rejected with a typed public error.

Silent behavior changes are not allowed in this refactor train.

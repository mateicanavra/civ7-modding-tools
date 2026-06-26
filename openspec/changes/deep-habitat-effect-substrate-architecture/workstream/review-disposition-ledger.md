# Review Disposition Ledger

## Review Wave

- Reviewer lane: current-to-target movement and ownership.
- Reviewer lane: Effect runtime/resource/provider boundaries.
- Reviewer lane: public contract and OpenSpec quality.
- Reviewed state: architecture packet edits staged above
  `agent-DRA-effect-record-authority-repair`.

## Findings

| Severity | Finding | Disposition |
|---|---|---|
| P1 | Packet was not implementation-ready for Effect boundaries; it lacked service contracts, error families, Layers, fake Layers, and named domain consumers. | Repaired in `workstream/domain-provider-ownership.md` with provider catalog, domain catalog, error ownership, runtime edge contract, service contract rules, config/resource rules, and direct-use zones. |
| P1 | Runtime boundary did not explicitly ban library-local `Effect.run*` or define the single run edge. | Repaired in `workstream/domain-provider-ownership.md` and linked from `design.md`; implementation packets must keep `Effect.run*` in host adapters, tests, and `src/runtime/**` only. |
| P1 | Command, workspace-tools, and Git were entangled and needed separate provider contracts. | Repaired in `workstream/domain-provider-ownership.md`; `CommandRunner`, `WorkspaceToolProvider`, and `GitProvider` are separate services with distinct ownership. |
| P1 | Config and resource/scope boundaries were too vague for current fs/env/time/temp/cache IO. | Repaired in `workstream/domain-provider-ownership.md`; `HabitatConfig`, `HabitatFileSystem`, `HabitatClock`, and `ResourceScope` contracts are explicit. |
| P1 | Vendor providers needed exact ownership splits. | Repaired in `workstream/domain-provider-ownership.md`; Grit, Biome, Nx, Husky, Reporter, Git, command, fs, clock, and workspace-tools owners are specified. |
| P1 | Expected failures were strings/throws/refusals without a unified error algebra. | Repaired in `workstream/domain-provider-ownership.md`; `HabitatError` variants and render boundaries are specified. |
| P1 | Public contracts were described by category, not bound to concrete D0 `surface_id` rows. | Repaired in `workstream/public-surface-ledger.md`; source packets must cite exact D0 rows for touched surfaces. |
| P1 | Review lanes had no completion contract. | Repaired in this ledger and `tasks.md`; lane completion means every P1/P2 finding is repaired or explicitly dispositioned before source implementation may start. |
| P2 | Verification was syntax-heavy and not tied to public-surface contracts. | Repaired in `proposal.md`, `tasks.md`, and `phase-record.md`; acceptance now names OpenSpec validation, diff check, matrix ledger presence, and later parity gates. |
| P2 | Branch/Graphite facts were stale/incomplete. | Repaired in `phase-record.md`; the packet is now recorded on `agent-DRA-effect-substrate-architecture` above `agent-DRA-effect-record-authority-repair`. |
| P2 | `host-policy` and `boundary-taxonomy` target homes were not explicit enough. | Repaired in `workstream/source-movement-map.md`; host policy maps to protected-zone/command-contract domains, boundary taxonomy maps to workspace graph integration and guardrail ownership. |
| P2 | `ownerTool` compatibility was not specified enough for new internals vs `CheckReport` v1. | Repaired in `workstream/domain-provider-ownership.md`; internals split domain/provider/capability identity while command-contract facades map back to `ownerTool` for v1 rows. |
| P2 | `src/lib/graph.ts` lacked a named target slot. | Repaired in `workstream/source-movement-map.md`; graph splits across workspace graph integration, Nx provider, and temp-dir resource. |
| P1 | Movement map missed `src/lib/fix.ts`, leaving the `runFix` package export and D9/D10-adjacent command path without a target owner. | Repaired in `workstream/source-movement-map.md`; the fix service-module slice refuses the `runFix` package helper export, moves command orchestration to `src/service/modules/fix/**`, and leaves lower-level transformation transaction, pattern governance, and Grit provider drains to follow-on packets. |
| P1 | D0 public-surface binding omitted touched package-export rows for `runFix`, `readGitState`, and `runGraph`. | Repaired in `workstream/public-surface-ledger.md`; the high-risk package-export list now cites `D0-package-export-symbol-runfix`, `D0-package-export-symbol-readgitstate`, and `D0-package-export-symbol-rungraph`. |

## Acceptance Contract

This packet can close only when:

- all P1/P2 findings above remain dispositioned;
- `tasks.md` records review lane completion;
- strict packet validation and repo-wide OpenSpec validation pass;
- `git diff --check` passes;
- Graphite branch evidence records the dedicated architecture layer.

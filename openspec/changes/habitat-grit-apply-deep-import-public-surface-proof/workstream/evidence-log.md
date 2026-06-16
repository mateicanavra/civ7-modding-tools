# Evidence Log - Deep Import Apply Proof

| ID | Command or source | Result | Claim supported | Non-claim |
| --- | --- | --- | --- | --- |
| DIPS-E1 | `.grit/patterns/habitat/apply/deep_import_to_public_surface.md` | Pattern rewrites deep domain ops imports in recipe/map filenames to public `/ops`. | Pattern exists and is syntactically scoped. | No target-export or applied-diff proof. |
| DIPS-E2 | `command -v grit` | Resolved the repo-local `grit` command through the normal tool PATH. | Direct Grit probes use the normal tool PATH. | No pattern behavior proof. |
| DIPS-E3 | `GRIT_TELEMETRY_DISABLED=true grit patterns test --filter deep_import_to_public_surface --json` | Exit 0; one testable pattern succeeded; expected output drops semicolons from rewritten imports. | Native Grit fixture proof passes. | No live scan, target-export, dry-run no-write, applied-diff, formatting handoff, or rollback proof. |
| DIPS-E4 | `rg "@mapgen/domain/[^\\\"']+/ops/[^\\\"']+" mods/mod-swooper-maps/src/recipes mods/mod-swooper-maps/src/maps -g '*.ts' -g '*.tsx'` | Exit 1 with no output. | No obvious live deep domain ops imports in recipe/map roots. | Regex inventory is not a parser proof. |
| DIPS-E5 | `GRIT_TELEMETRY_DISABLED=true grit apply .grit/patterns/habitat/apply/deep_import_to_public_surface.md mods/mod-swooper-maps/src/recipes mods/mod-swooper-maps/src/maps --dry-run --output compact` | Exit 0; processed 234 files and found 0 matches. | Direct dry-run hygiene over current roots. | No injected no-write or applied-diff proof. |
| DIPS-E6 | `bun run habitat:fix -- --dry-run` | Exit 0; processed 234 files, found 0 matches; Biome checked 2343 files with no fixes. | Habitat fix dry-run currently runs cleanly. | Historical dry-run-only evidence; current target-export and rewrite-safety evidence is recorded separately in `DIPS-E10` through `DIPS-E12`. |
| DIPS-E7 | `git status --short --branch` after dry-run probes | Branch header only at probe time, before this packet directory was created. | Current dry-run probes did not leave tracked source changes. | Not rollback proof for after-write failure, and not a claim about later packet doc additions. |
| DIPS-E8 | `mods/mod-swooper-maps/src/domain/*/ops.ts` and `ops/index.ts` inspection | Public `ops.ts` files generally default-export created domains and do not uniformly re-export all named implementation symbols. | Target-export risk is real and local. | Does not decide which exports should be added. |
| DIPS-E9 | `openspec/changes/habitat-effect-grit-adapter/design.md` | Accepted design defines apply transaction flow and failures including missing export, dirty worktree, dry-run mismatch, rollback failure. | Effect adapter is the natural substrate for live apply proof. | Does not implement this codemod's export fixture set. |
| DIPS-E10 | `HGPR-APPLY-TARGET-EXPORT-UNIT-2026-06-15` in the aggregate command proof log | Focused unit proof passed for isolated-copy safe value rewrite, type-only rewrite preservation, missing public export refusal, and unchanged source on refusal. | Target-export guard, missing-export negative, and type-only preservation unit boundary. | No live worktree apply, post-apply typecheck/test behavior, raw direct Grit acquisition, generated-output freshness, baseline writes, parity closure, or product/runtime proof. |
| DIPS-E11 | `HGPR-APPLY-LIVE-INVENTORY-2026-06-15`, `HGPR-APPLY-POSITIVE-DRY-RUN-2026-06-15`, and `HGPR-APPLY-MISSING-EXPORT-2026-06-15` in the aggregate command proof log | Live clean-tree dry-run found 0 matches; positive injected dry-run found one safe public-export rewrite and left the probe hash unchanged; missing-export dry-run failed closed and left the probe hash unchanged. | Current live inventory, injected no-write success, and missing-export refusal/no-write proof. | No live worktree apply, post-apply typecheck/test gates, raw direct Grit acquisition, generated-output freshness, baseline writes, parity closure, or product/runtime proof. |
| DIPS-E12 | `HGPR-APPLY-LIVE-FIXED-2026-06-15`, `HGPR-APPLY-LIVE-COLD-GATES-2026-06-15`, and `HGPR-APPLY-LIVE-ROLLBACK-2026-06-15` in the aggregate command proof log | Named proof worktree live apply rewrote only the tracked morphology probe import to `@mapgen/domain/morphology/ops`; Biome handoff was limited to the changed file; cold selected `mod-swooper-maps:check` and `test:architecture-ecology-step-imports` gates passed; proof worktrees were restored/removed cleanly. | Controlled applied-diff proof, selected post-apply gates, Biome handoff boundary, and proof-worktree cleanup. | No broad `mod-swooper-maps:test`, generated-output freshness, baseline writes, old-mechanism parity closure, raw direct Grit acquisition, or product/runtime proof. |

## Current Evidence Summary

The current tree proves that the pattern exists, native Grit can execute its
sample, the live tree has no current matches under recipe/map roots, and the
accepted Habitat apply substrate fails closed for missing public exports before
writing. The controlled proof-worktree apply shows the supported named
value/type import rewrite path can be applied, formatted, gated, and cleaned up
inside the stated proof boundary.

## Evidence Still Not Claimed

- unsupported default, namespace, mixed default-plus-named, side-effect, or
  future unproved import forms;
- broad `mod-swooper-maps:test` closure;
- generated-output freshness;
- baseline writes or shrink behavior;
- old-mechanism parity closure;
- raw direct Grit acquisition;
- product/runtime behavior.

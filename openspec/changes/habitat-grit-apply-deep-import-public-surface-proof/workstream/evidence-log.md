# Evidence Log - Deep Import Apply Proof

| ID | Command or source | Result | Claim supported | Non-claim |
| --- | --- | --- | --- | --- |
| DIPS-E1 | `.grit/patterns/habitat/apply/deep_import_to_public_surface.md` | Pattern rewrites deep domain ops imports in recipe/map filenames to public `/ops`. | Pattern exists and is syntactically scoped. | No target-export or applied-diff proof. |
| DIPS-E2 | `PATH="$PWD/node_modules/.bin:$PATH" command -v grit` | Resolved `node_modules/.bin/grit`. | Direct Grit probes need local PATH in this shell. | No pattern behavior proof. |
| DIPS-E3 | `GRIT_TELEMETRY_DISABLED=true PATH="$PWD/node_modules/.bin:$PATH" grit patterns test --filter deep_import_to_public_surface --json` | Exit 0; one testable pattern succeeded; expected output drops semicolons from rewritten imports. | Native Grit fixture proof passes. | No live scan, target-export, dry-run no-write, applied-diff, formatting handoff, or rollback proof. |
| DIPS-E4 | `rg "@mapgen/domain/[^\\\"']+/ops/[^\\\"']+" mods/mod-swooper-maps/src/recipes mods/mod-swooper-maps/src/maps -g '*.ts' -g '*.tsx'` | Exit 1 with no output. | No obvious live deep domain ops imports in recipe/map roots. | Regex inventory is not a parser proof. |
| DIPS-E5 | `GRIT_TELEMETRY_DISABLED=true PATH="$PWD/node_modules/.bin:$PATH" grit apply .grit/patterns/habitat/apply/deep_import_to_public_surface.md mods/mod-swooper-maps/src/recipes mods/mod-swooper-maps/src/maps --dry-run --output compact` | Exit 0; processed 234 files and found 0 matches. | Direct dry-run hygiene over current roots. | No injected no-write or applied-diff proof. |
| DIPS-E6 | `bun run habitat:fix -- --dry-run` | Exit 0; processed 234 files, found 0 matches; Biome checked 2343 files with no fixes. | Habitat fix dry-run currently runs cleanly. | No target-export or rewrite safety proof. |
| DIPS-E7 | `git status --short --branch` after dry-run probes | Branch header only at probe time, before this packet directory was created. | Current dry-run probes did not leave tracked source changes. | Not rollback proof for after-write failure, and not a claim about later packet doc additions. |
| DIPS-E8 | `mods/mod-swooper-maps/src/domain/*/ops.ts` and `ops/index.ts` inspection | Public `ops.ts` files generally default-export created domains and do not uniformly re-export all named implementation symbols. | Target-export risk is real and local. | Does not decide which exports should be added. |
| DIPS-E9 | `openspec/changes/habitat-effect-grit-adapter/design.md` | Accepted design defines apply transaction flow and failures including missing export, dirty worktree, dry-run mismatch, rollback failure. | Effect adapter is the natural substrate for live apply proof. | Does not implement this codemod's export fixture set. |

## Current Evidence Summary

The current tree proves that the pattern exists, native Grit can execute its
single sample, and the live tree has no current matches under recipe/map roots.
It does not prove that a future match can be safely rewritten. The public ops
export surface makes that distinction load-bearing.

## Evidence Still Required For Implementation

- parser-grade candidate inventory over live and injected roots;
- per-symbol target-export preflight;
- missing-export refusal;
- injected dry-run no-write through Habitat fix;
- controlled applied diff through accepted transaction substrate;
- Biome handoff over changed paths;
- selected typecheck/test gates;
- semicolon preservation or Biome-owned formatting classification;
- rollback/finalizer behavior and final clean status;
- downstream ledger realignment.

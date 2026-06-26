# Source-Check Adapter Burn-Down Canary Insights

Status: completed canary evidence

## What Worked

- Stale adapters can be deleted mechanically once the matching rule record is no longer `ownerTool: source-check` and the command-check rule still passes.
- For rules that already have adjacent `.pattern.md` authority, the executable ownership switch is small: change `ownerTool` and `detect` in `rule.json`, then delete the matching central adapter.
- The Grit provider handled a simple import predicate, a multi-branch import/export/schema predicate, and a helper-declaration predicate through normal `habitat check --rule` selection.

## What To Keep

- Keep proving each row both before and after conversion: source-check before, grit-check after, then normal rule selection.
- Keep adapter deletion coupled to the ownership switch. Leaving converted adapters behind would preserve the confusing intermediate surface.
- Keep the execution-surface scanner tied to active source-check records instead of a fixed adapter count.

## What Still Needs Work

- `rule-runtime.policy.mjs` remains because 1 active source-check adapter still imports it.
- The systematic burn-down after this canary converted the other 25 straightforward adapter-backed Grit rows.
- Mixed command-check bundles still need split work before their Grit-shaped assertions can be extracted cleanly.
- The next split wave should start with `require_explicit_mapgen_sdk_opt_in`, then delete the final adapter and runtime if zero importers remain.

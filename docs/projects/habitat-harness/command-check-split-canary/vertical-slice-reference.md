# Vertical Split Slice Reference

Use this reference for the next systematic command-check split wave.

## One-Rule Process

1. Read the rule packet: `rule.json`, `category.md`, `.check.*`, `.pattern.md`, baseline, and adjacent already-Grit rules.
2. Decompose the command script into assertion rows. Do not treat the whole file as one decision.
3. For each assertion, choose one disposition:
   - `grit-check`: structural source, Markdown, import/export, identifier, call, or path-scoped pattern authority.
   - `existing-rule`: duplicate assertion already owned by a narrower rule.
   - `data-driven-topology`: exact file/tree/order/currentness checks that are still Habitat structural authority.
   - `package-local-validator`: runtime behavior, generated output correctness, command output, or package API behavior.
   - `demote-delete`: transitional, duplicate, heuristic-only, or not worth enforcing.
4. Pre-run `bun tools/habitat/bin/dev.ts check --rule <rule-id> --json`.
5. Convert only the assertions with a clear owner. For Grit conversions, update `ownerTool`, `detect`, `patternName`, and `scanRoots`; add `hookCheck` only when the rule should participate in hook scope.
6. Run `bun tools/habitat/bin/dev.ts check --rule <rule-id> --tool grit-check --json` immediately.
7. Delete or shrink `.check.*` only after every script branch has a disposition.
8. Run normal rule selection, update packet docs, update inventory docs, regenerate execution-surface analytics, and record insights.

## Stop Conditions

- The new `grit-check` selector fails for a semantic match reason.
- The command script contains an assertion with no owner and no explicit demotion.
- A docs/apply rule loses advisory behavior without an explicit intentional narrowing note.
- A topology/currentness branch is being hidden inside Grit instead of moved or demoted.

## Proof Commands

```bash
bun tools/habitat/bin/dev.ts check --rule <rule-id> --json
bun tools/habitat/bin/dev.ts check --rule <rule-id> --tool grit-check --json
bun tools/habitat/bin/dev.ts check --tool grit-check --json
bun tools/habitat/bin/dev.ts check --tool command-check --json
bun run --cwd tools/habitat check
git diff --check
```

Use `command-check` aggregate failures as inventory after the split, not as proof that a converted Grit rule failed, unless the failure names the converted rule or a stale deleted script.

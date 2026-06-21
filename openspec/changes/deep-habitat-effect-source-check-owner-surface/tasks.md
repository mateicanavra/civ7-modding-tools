## 1. Surface Cutover

- [x] 1.1 Rename active rule records from `ownerTool: "pattern-check"` to
  `ownerTool: "source-check"`.
- [x] 1.2 Rename the harness Nx target from `grit:check` to `source:check`.
- [x] 1.3 Remove active command selection for `--tool pattern-check`.

## 2. Runtime Names

- [x] 2.1 Rename source-rule facts from pattern facts to source facts.
- [x] 2.2 Rename the source-check service method to `runSourceRules`.
- [x] 2.3 Rename the generated policy artifact to `source-rules.mjs`.
- [x] 2.4 Rename hook trace/output fields to source-check vocabulary.

## 3. Boundary Preservation

- [x] 3.1 Keep native Grit adapter request kinds and Grit fixture surfaces
  Grit-named.
- [x] 3.2 Keep generated GritQL pattern files under `.habitat/patterns`.
- [x] 3.3 Avoid compatibility shims, fallbacks, and dead aliases.

## 4. Verification

- [x] 4.1 `bun tools/habitat-harness/bin/dev.ts check --tool source-check --json`
- [x] 4.2 `bun run --cwd tools/habitat-harness check`
- [x] 4.3 Focused hook/source-rule tests for changed expectations.
- [x] 4.4 `bun run openspec -- validate deep-habitat-effect-source-check-owner-surface --strict`
- [x] 4.5 `git diff --check`

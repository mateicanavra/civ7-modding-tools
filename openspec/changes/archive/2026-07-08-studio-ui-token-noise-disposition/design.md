# Design — studio-ui token noise disposition

## Ownership map (the decision spine)

| Surface | Owner | Can this change touch it? |
|---|---|---|
| `check_design_system` findings, `_adherence.oxlintrc.json` (incl. `x-omelette.tokens`/`tokenKinds`), `_ds_manifest.json` | claude.ai/design app self-check | No — app regenerates them; feedback only |
| design-sync skill + bundled converter (`package-build.mjs`, `lib/*`) | Claude Code binary (staged copies in `.ds-sync/`) | No — staged scripts refresh from the skill; `emit.mjs`/`bundle.mjs` are app contract |
| Compiled `dist/styles.css` (78 `@property` `--tw-*` rules + `@theme` defaults + authored tokens) | Tailwind v4 build of package source | No content changes — fidelity gate |
| `.design-sync/config.json`, `guidelines/**`, `NOTES.md`, package tests, repo docs | this repo | **Yes — the entire write set lives here** |

## Decision 1 — guard shape: exact-name partition, zero prefix heuristics

The test (`test/designTokens.test.ts`, `// @vitest-environment node` per the
sibling `themeTokens.test.ts` pattern) extracts every `--name:` declaration
with its selector stack plus every `@property`-registered name from
`dist/styles.css` (comment-stripped, string-safe, block-final-declaration-safe
brace-tracking scan), then partitions every custom property into exactly one
of three buckets:

- **authored** := exact names in `test/fixtures/authored-tokens.json`, a flat
  name → kind map (`color | alias | radius | font`; adding a new kind requires
  extending `KIND_SCOPES`/`VALUE_SHAPES`, enforced by a named failure).
  Scopes derive from kind (`color` → dark + light, `alias`/`radius` →
  invariant `:root`, `font` → `@layer theme`), so a dark-only color token is
  unrepresentable in the fixture; the scope check is bidirectional (every
  expected scope declared AND no declaration outside the expected scopes).
  Value shapes per kind (HSL triplet with decimals for colors, `hsl(var())`
  for aliases, rem for radius, brand family for fonts).
- **`@property`-registered** := harvested structurally from the stylesheet's
  own `@property` rule preludes — definitionally engine plumbing. A sanity
  assertion requires this set to be non-empty so the structural leg can never
  silently regress to dead code.
- **framework snapshot** := `test/fixtures/framework-tokens.json`, the exact
  names of the non-`@property` Tailwind `@theme` defaults the build emits.
  Checked in both directions (no strays in CSS; no stale snapshot entries).

Anything outside the three buckets fails with guidance. There are deliberately
NO name-prefix heuristics: review probing proved a prefix predicate silently
absorbs authored tokens named inside Tailwind's `@theme` authoring namespaces
(`--text-hero`, `--animate-brand-*`, …) — with exact-name snapshots such a
token surfaces as a stray and is forced into the authored fixture, while a
Tailwind upgrade becomes a visible, reviewed snapshot regeneration.

Two cross-surface pins tie the guard to its siblings: the fixture's color
names must equal `token-contract.json`'s dark-palette names (the value-pinning
sibling test), and every authored token name must appear in the synced
`docs/design-tokens.md` vocabulary table (so the design-agent-facing doc
cannot rot against the fixture).

## Decision 2 — knowledge channels: two, matched to the two audiences

- `docs/design-tokens.md` (shipped as `guidelines/docs/design-tokens.md` via
  `cfg.guidelinesGlob: "docs/*.md"`) → design agents inside the DS project
  (the converter ships `guidelines/**` and the README points agents at it
  "before composing larger layouts"). Content: authored vocabulary table + the
  noise disposition + the two hard prohibitions (no `:root` hoisting, no
  synced-file edits) + a scope note (the repo guard pins `dist/styles.css`; a
  findings shift with no repo diff is app-side).
  **Placement constraint (review-proven):** the source must NOT live under a
  dot-directory. `emitGuidelines` preserves the package-relative subpath, and
  `sync-hashes.mjs`'s `hashDir` skips dot-entries — a `.design-sync/`-nested
  guideline would upload once and then never re-ship on edits (aux-hash blind
  spot), besides risking dot-path exclusion in upload globs and file listings.
  Living surfaces (this doc, NOTES.md) describe finding CLASSES, not counts —
  counts drift with Tailwind versions and are pinned only in point-in-time
  workstream records.
- `.design-sync/NOTES.md` append → sync operators (its Re-sync risks section is
  required reading in the re-sync ritual). Content: findings are expected,
  docs-tier delta, do not chase; pointer to this change.

`conventions.md` deliberately untouched: it is a validated surface with its own
ceremony, and its job is describing what exists, not dispositioning external
linter behavior.

## Decision 3 — upstream routing is part of the change, not a side note

`workstream/upstream-feedback.md` carries the corrected defect report (the zip
packet was right about the root cause, wrong about the fix surface): exclude
`@property`-registered names and Tailwind-internal prefixes from the
authored-token scan; classify HSL-triplet values as colors; fix the
`tokenKinds` heuristic. The `docs/system/DEFERRALS.md` entry pins the re-check
trigger (new Claude Code / design-sync versions) so the frame's falsifier is
monitored instead of forgotten.

## Review lanes

Three lanes gate this change before it ships (executed as a fan-out fold at
the stack tip; evidence and adjudications in `workstream/phase-record.md`):

1. **Owner lane** — the orchestrating agent's design review against the frame
   (ownership map, fidelity gate, no-hand-edit contract).
2. **Correctness/cleanup fan-out** — eight independent finder angles
   (line-scan, removed-behavior, cross-file tracer, reuse, simplification,
   efficiency, altitude, conventions) over the full stack diff, each finding
   verified or refuted with cited evidence.
3. **Adversarial augmentation** — a five-dimension orchestrated sweep
   (prose-fact audit, guard mutation probing, sync-contract semantics,
   OpenSpec cross-consistency, independent partition re-derivation) designed
   to attack the claims the first two lanes take on trust.

## Rejected alternatives

- `/* @kind */` source annotations — parser does not exist (binary-verified).
- Post-processing compiled CSS to strip/annotate internals — cannot reach zero
  findings, risks render drift, and mangles a generated artifact.
- Forking a `.ds-sync` lib via `.design-sync/overrides/` — nothing to fork; no
  lib in the pipeline computes token kinds.
- Hand-editing `_adherence.oxlintrc.json` project-side — regenerated by the
  app; prohibited by the sync contract; empirically ignored by the check.

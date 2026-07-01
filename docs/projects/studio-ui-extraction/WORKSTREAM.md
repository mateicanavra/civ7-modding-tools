# WORKSTREAM — MapGen Studio UI Library Extraction

**Status:** grounding (no code changes yet)
**Owner:** extraction workstream agent (this document is the owner's operating picture)
**Normative anchor:** [FRAME.md](./FRAME.md) — scope, DoD, non-goals, reserved decisions. This doc never overrides the frame; contradictions get escalated to Matei.
**Branch/worktree:** `studio-ui-extraction` (parent `main`), worktree `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-studio-ui-extraction`
**Base:** `main` @ `c4ebaf1e1` (frame PR #1995)

---

## 1. Verified preconditions (2026-07-01)

- Frame §8 precondition **satisfied**: PRs #1991, #1992, #1993, #1994 all `MERGED` to main 2026-07-01 (verified via `gh pr view`). #1995 (frame) also merged. Main tip `c4ebaf1e1` contains the Storybook workbench, the storybook-shape sync flip, the TypeBox validator, and the theming fix.
- Graphite branch `studio-ui-extraction` created off `origin/main`, tracked with `gt parent` = main.
- FRAME.md found **on main** — no off-main copy needed.

## 2. Decision-holder directive (Matei, 2026-07-01, mid-kickoff)

Recorded verbatim in intent; supersedes the frame's narrower "no API redesign" reading of §3 while keeping the fidelity gate:

> Assume a lot of the code was written before we had good best practices. Lean into React best practices and clean up any clear issues with crossing boundaries — especially around dependencies. Treat this as making a clean, proper React components package/app. Do **not** over-index on how things currently are; focus on making it good and better. The only thing we care about is making it componentized and modular so we can build better in the future. Don't let the past influence the future in a negative way for no reason.

Operational consequences:
- **Boundary hygiene and dependency direction are in scope**, not merely tolerated-if-cheap. Components that reach into app guts get their boundaries fixed as part of extraction, not wrapped.
- **API shape may improve** where current shape is an accident of app history (prop bags, leaked domain types, value imports that should be injected). Improvements follow the frame's behavior bar: testable, test designed first where behavior changes.
- **Visual fidelity remains the gate**: the 46-story oracle + re-sync compare machinery still decides "renders identically". Cleanups must not change rendered output (or where they deliberately do, that is a stop-and-justify event, surfaced before shipping).
- The frame's "one owner at the end" invariant is strengthened by this directive: no compatibility shims, no dual paths.

## 3. The design-sync contract (read in full from the bundled skill — main + both shape sub-skills)

The `design-sync` skill is bundled with the DesignSync tool (not any plugin); extracted and archived for this workstream in the session scratchpad (`design-sync-SKILL.md`, `ds-subskill-storybook-source-shape.md`, `ds-subskill-package-source-shape.md`). Load-bearing facts:

1. **The upload format is the contract; the converter is the deterministic path to it.** Layout: `_ds_bundle.js` (+ `@ds-bundle` header), `styles.css` (designs receive ONLY its transitive `@import` closure), `components/<group>/<Name>/{.html,.jsx,.d.ts,.prompt.md}` with `@dsCard` first line, `_preview/`, `_vendor/`, `fonts/`, `_ds_sync.json` anchor. `lib/emit.mjs` and `lib/bundle.mjs` are app-contract surface — never forked.
2. **The storybook shape already presumes a package.** The converter bundles a *compiled dist entry* (`--entry <built-dist-entry>`) into `_ds_bundle.js`; Storybook is "the fidelity oracle, not the runtime". `build-inputs.sh` exists solely to fake that dist from the app's Vite build. A real package dist is the designed-for input — this confirms the frame's premise rather than contradicting it.
3. **Grades follow sources.** Grade contract keys: story files, owned previews (`.design-sync/previews/`), config keys `provider`/`storyImports`/`extraEntries`/`overrides`/`titleMap`, committed lib forks. Moving component/story files re-keys everything → the extraction triggers a full O(46) recapture + regrade. Expected, priced in; the portal-dialog four go through the manual-verification path (frame §3).
4. **Owned previews import stories as `@ds-stories/<repo-relative path>`** — location-independent w.r.t. the preview file, but pinned to the story's repo-relative path: story file moves must be reflected there (or pairing breaks visibly).
5. **Config is strictly validated** — unknown/removed keys fail the run with a named fix. Keys the extraction touches: `pkg`, `entry`/`buildCmd`, `cssEntry`, `componentSrcMap` (every path changes), `storybookConfigDir`/`storybookStatic` (if Storybook moves), `titleMap` (if story titles change — avoid), `docsMap`, `overrides` (carry as-is).
6. **Our upload path is atomic** (projectId `531d158d…` pinned before run start): one pass after everything verifies; deletes come *verbatim* from `.sync-diff.json` `upload.deletePaths` (anchor-diff based, so `explorations/` + `scraps/` — never anchor-recorded — never appear in deletePaths; plan delete-globs additionally must not cover them). `_ds_sync.json` is the absolute final write. Any upload to the live project requires **Matei's go-ahead** (frame §6).
7. **Package shape has no reference render** — absolute-rubric grading + floor cards. Storybook shape keeps the screenshot-verified gate. The frame requires the chosen end-state shape to preserve the verified-screenshot gate → strong prior for **staying `shape: "storybook"`**, with the package's real dist as `--entry` and its real CSS as `cssEntry`. (Final call in the design phase; both sub-skills read.)
8. **Incrementality mechanics**: `_ds_sync.json` envelope `{shape, styleSha, renderHashes, sourceKeys, keyRecipe, scriptsSha, sourceHashes, auxSha, bundleSha12}`; single `styleSha` per bundle. Any improvement claim must be tested against `lib/sync-hashes.mjs` + `resync.mjs` reality (frame §5 warns: do not promise beyond what resync.mjs supports).
9. **Re-sync ritual** (for the final re-verify): refresh staged scripts → re-run `buildCmd` **and** rebuild `.design-sync/sb-reference` together → fetch anchor via `DesignSync(get_file, "_ds_sync.json")` → `resync.mjs --remote` → act on verdict → conventions-header validation pass → atomic upload. `[REFERENCE_STALE?]` = forgot to rebuild the reference.
10. **Conventions header**: `.design-sync/conventions.md` (readmeHeader) is validated (never rewritten) on re-syncs; every named class/token/component must exist in the built artifacts. After extraction, its claims must be re-validated against the package build.

## 4. Curated skill pack

Enumerated via `meta:introspect` over installed plugins (dev ~48, cognition 14, habitat 6, nx 7, hq, meta, docs, design, mapgen, codex + official marketplace). Confirmed: no `design-sync` skill in any plugin — it ships with the DesignSync tool (extracted above). Vercel React skills confirmed inside the **dev** plugin.

**Core — owner reads in full; every sub-agent brief names its subset:**
| Skill | Why core |
|---|---|
| `design-sync` (+ both shape sub-skills) | THE contract this extraction serves — read in full (owner) ✅ |
| `habitat:systematic-workstream` | execution anchor: sealed sources, decision model before mechanics, proof ledger |
| `dev:graphite` | stack mechanics, lane discipline (supplements standing memory) |
| `dev:typescript` + `dev:refactor-typescript` | package/API design + safe extraction moves |
| `dev:vercel-composition-patterns` + `dev:vercel-react-best-practices` | the clean-React bar Matei's directive sets |
| `dev:review-code-quality` | structural review bar for the review fan-outs |
| `nx:link-workspace-packages` + `nx:nx-workspace` | workspace wiring for the new package |
| `dev:vite` | app + Storybook build integration; lib-mode option |

**Entry points — navigated on demand:**
`dev:git-worktrees`, `dev:bun`, `dev:api-design`, `dev:architecture` (OpenSpec-adjacent change discipline), `dev:typebox`, `cognition:solution-design` (design-phase alternatives), `cognition:testing-design` (behavior-bar test design), `habitat:workstream-review-loops`, `codex:codex-cli-runtime` + `codex:rescue` (independent second reviewer), `dev:pr-comments`, `nx:nx-generate`, `dev:turborepo` (n/a — repo is Nx; noted to avoid cargo-culting).

## 5. Open questions ledger (frame §5 → investigation state)

| # | Question | State |
|---|---|---|
| Q1 | Extraction manifest + per-component tiers | grounding fan-out running; ledger phase next |
| Q2 | Package name / location / publishing policy | **reserved to Matei** — options TBD after ledger |
| Q3 | Dependency policy re `@civ7/studio-server` types | evidence gathering (coupling recon) |
| Q4 | Build recipe (tsup vs Vite lib; CSS strategy; fonts) | evidence gathering (conventions + theme readers) |
| Q5 | Storybook topology (package-owned vs app-hosted) | evidence gathering (storybook-oracle reader) |
| Q6 | Sync end-state shape | strong prior: stay `storybook` (contract fact #7); decide in design phase |
| Q7 | Theme distribution (`useResolvedTheme` home; class convention) | evidence gathering (theme reader) |
| Q8 | `.design-sync/` metadata migration (docsMap, overrides, NOTES) | evidence gathering (sync-surface reader) |
| Q9 | v3-style Tailwind imports liveness | evidence gathering (theme reader) |
| Q10 | Buyable incrementality improvement | bounded by contract fact #8; investigate against converter code |

## 6. Sequencing

1. **Grounding** (running): 6 parallel readers → reports in session scratchpad → distilled here.
2. **Classification ledger**: fan-out per-component evidence pass over the 46 (manifest from `componentSrcMap`), tiering + target home + story/preview status; adversarial verification fan-out; ledger reviewed before any structure is designed. Ledger lands as `LEDGER.md` beside this doc.
3. **Design**: alternatives on Q2/Q4/Q5/Q6; OpenSpec change set (`openspec/changes/...`, `bun run openspec:validate`); target file tree to exact names; Matei checkpoint for reserved decisions (Q2 + anything touching the live project).
4. **Execution**: one change set per Graphite branch, stacked; implementation fan-out where independent; review fan-out + Codex second-reviewer on substantial diffs.
5. **Verification**: package build green (no TS7056 tolerance), app rewire renders identically (oracle), full 46 re-verify via resync driver locally; light-render canary decision (frame §2).
6. **Close-out**: DoD walk (frame §2) with evidence; Matei go-ahead → re-sync upload of `531d158d`; runner worktree move-up + relaunch.

## 7. Decisions record

- **D1 (2026-07-01):** Workstream branch/worktree topology: single stack rooted at `studio-ui-extraction` (docs/grounding artifacts first branch; subsequent change sets stack on it).
- **D2 (2026-07-01):** Matei's clean-package directive recorded (§2 above) as the governing interpretation of the frame's behavior bar.
- (open) D3+: design-phase decisions land here with reasons.

## 8. Risks / falsifier watch (frame §9 live tally)

- Tiering prior wrong (components reading stores/clients) → none found yet; coupling recon will settle.
- Package build can't feed the sync contract → **contract fact #2 strongly suggests the opposite**; still verified end-to-end before design freezes.
- Drift beyond portal-dialog class at re-verify → stop-and-diagnose.
- Wrapper/shim accretion during rewire → boundary is wrong; redraw, don't shim (reinforced by D2).
- Sync slower/less verified post-extraction → back up and redesign.
